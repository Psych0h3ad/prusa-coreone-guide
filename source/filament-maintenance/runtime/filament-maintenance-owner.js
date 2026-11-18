import {filamentIdlerLinkage} from './filament-idler-linkage.js';
import {prepareFilamentInletReference} from './filament-inlet-reference.js';
import {releaseFilamentInlet} from './filament-inlet-transport.js';
import {followSidePtfeCompletion} from './side-ptfe-coupling.js';
import {filamentMechanism} from './filament-maintenance-mechanism.js';
import * as T from 'three';
import {registerCrossflowDependent13} from './r13-tie-service.js';
import {FILAMENT_TASKS} from './filament-maintenance-data.js';
import {FILAMENT_DATUM as d,filamentReferencePoint} from './filament-maintenance-stock.js';
const smooth=t=>t*t*(3-2*t),rings=256,sides=16;
class WorkingMaterial {
 constructor(id,stock){
  this.id=id;this.stock=stock;this.radius=d.diameter/2;this.samples=rings;this.last=null;
  const count=(rings+1)*sides+2,g=this.geometry=new T.BufferGeometry(),P=new Float32Array(count*3),N=new Float32Array(count*3),I=[];
  for(let i=0;i<rings;i++)for(let j=0;j<sides;j++){const a=i*sides+j,b=i*sides+(j+1)%sides,c=a+sides,e=b+sides;I.push(a,b,c,b,e,c);}
  const low=(rings+1)*sides,high=low+1;
  for(let j=0;j<sides;j++){I.push(low,(j+1)%sides,j);I.push(high,rings*sides+j,rings*sides+(j+1)%sides);}
  g.setAttribute('position',new T.BufferAttribute(P,3));g.setAttribute('normal',new T.BufferAttribute(N,3));g.setIndex(I);
  const mat=new T.MeshStandardMaterial({color:0x16b8ed,roughness:.58,metalness:0});
  this.mesh=new T.Mesh(g,mat);this.mesh.userData={part:'filamentMaintenanceParts',maintenanceComponent:id,flexId:id,componentOnly:true,cadPath:[],supplement:true,authoredReference:true,sourceDiameterMM:d.diameter,stockMM:stock,cadName:id,originalColor:mat.color.clone(),originalOpacity:1,restPosition:new T.Vector3(),restQuaternion:new T.Quaternion()};
  this.update(435,435,1);
 }
 update(from,to,t){
  if(!this.enabled&&this.last!==null)return;
  // Fasteners.restore passes zero to unrelated inactive entities.
  if(from===0&&to===0)return;
  const tip=from+(to-from)*smooth(t);if(this.last===tip)return;
  const P=this.geometry.attributes.position,N=this.geometry.attributes.normal;
  for(let i=0;i<=rings;i++){
   const {point:c,tangent:w,normalU:u=[1,0,0]}=filamentReferencePoint(tip,this.stock*i/rings),b=new T.Vector3(...w).cross(new T.Vector3(...u)).toArray();
   for(let j=0;j<sides;j++){const a=j*Math.PI*2/sides,n=u.map((v,k)=>v*Math.cos(a)+b[k]*Math.sin(a)),k=i*sides+j;P.setXYZ(k,...c.map((v,k)=>(v+this.radius*n[k])*.001));N.setXYZ(k,...n);}
  }
  for(const [i,s,sign]of [[(rings+1)*sides,0,-1],[(rings+1)*sides+1,this.stock,1]]){const {point:c,tangent:w}=filamentReferencePoint(tip,s);P.setXYZ(i,...c.map(v=>v*.001));N.setXYZ(i,...w.map(v=>v*sign));}
  P.needsUpdate=true;N.needsUpdate=true;this.geometry.computeBoundingBox();this.geometry.computeBoundingSphere();this.last=tip;
  this.mesh.userData.flexState={from,to,t,clock:tip,tipMM:Math.min(tip,435),carryRightMM:Math.max(0,tip-435)*.25,nominalStockMM:this.stock,diameterMM:d.diameter,wholeCapped:true};
 }
 guide(to,from=435){return[from,to].map(z=>new T.Vector3(...filamentReferencePoint(z,0).point).multiplyScalar(.001));}
}
export function installFilamentMaintenance(viewer){
 if(viewer.filamentMaintenance?.active)return viewer.filamentMaintenance;
 prepareFilamentInletReference(viewer);
 const entities=[new WorkingMaterial('workingPLA',400),new WorkingMaterial('workingFragment',40)];let active=true,release,selected=false;
 for(const e of entities){viewer.fasteners.entities.set(e.id,e);viewer.meshes.push(e.mesh);viewer.group('filamentMaintenanceParts').add(e.mesh);}
 const mechanism=filamentMechanism(viewer,entities),linkage=filamentIdlerLinkage(viewer,entities);
 const api={follow:()=>{if(selected)viewer.fasteners.entities.get('ptfeTube').filamentInletReference.follow();mechanism.follow();linkage.follow();},linkage,decorate:(spec,task,index,text)=>linkage.decorate(spec,task,index,text),loadedArmAngle(){const e=entities[0];return linkage.loadedAngle(e.last,e.stock);},get active(){return active;},entities,prepare(task){selected=FILAMENT_TASKS.includes(task?.id);mechanism.restore();linkage.prepare(task);for(const e of entities){e.enabled=true;e.update(435,435,1);e.enabled=FILAMENT_TASKS.includes(task?.id);e.mesh.userData.serviceTask='filament-reference-explicit';}},resolve(refs=[]){return active?entities.filter(e=>refs.includes(e.id)).map(e=>e.mesh):[];},retire(){if(!active)return;active=false;mechanism.restore();linkage.restore();const tube=viewer.fasteners.entities.get('ptfeTube');if(tube?.filamentInletTransport){releaseFilamentInlet(tube);followSidePtfeCompletion(viewer);delete tube.filamentInletTransport;delete tube.filamentInletReference;}release?.();for(const e of entities){e.enabled=false;viewer.fasteners.entities.delete(e.id);/* Central Viewer owns geometry/material disposal. */}if(viewer.filamentMaintenance===api)delete viewer.filamentMaintenance;}};
 viewer.filamentMaintenance=api;release=registerCrossflowDependent13(viewer,()=>api.retire());return api;
}

