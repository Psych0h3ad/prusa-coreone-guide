import * as T from 'three';
import {SERVICE_FAN_DEFINITIONS as definitions} from './service-fan-data.js?v=20261111-94';
import {SERVICE_FAN_ROUTES} from './service-fan-routing.js?v=20261111-94';
import {fanCableFrames,ServiceFanCurve} from './service-fan-frame.js?v=20261111-94';
import {createClikMatePlug,clikMateMotion,clikMatePress}from './clik-mate-plug.js?v=20261111-94';
const samples=96,sides=6,wireRadius=.32;
const material=color=>{const m=new T.MeshStandardMaterial({color,roughness:.8,metalness:0});m.userData.originalColor=m.color.clone();m.userData.originalOpacity=1;return m;};
export class ServiceFanCable{
 constructor(def){
  this.id=def.id;this.definition=def;this.routeStages=SERVICE_FAN_ROUTES[def.id].stages.map(s=>({at:s.at,roll:s.roll,angles:s.angles,points:s.points.map(p=>new T.Vector3(...p).multiplyScalar(.001))}));
  this.seated=this.routeStages.at(-1).points;this.loose=this.routeStages[0].points;
  this.curve=new ServiceFanCurve(this.loose.map(p=>p.clone()));this.curve.arcLengthDivisions=768;
  this.clikMate=createClikMatePlug(3);const c=this.clikMate,p=new T.Vector3(),m=new T.Matrix4().set(0,-1,0,0,0,0,1,0,-1,0,0,0,0,0,0,1);
  for(const name of ['positions','pressedPositions','normals','pressedNormals'])for(let i=0;i<c[name].length;i+=3){p.fromArray(c[name],i).applyMatrix4(m);if(name.includes('Positions')||name==='positions')p.multiplyScalar(.001);p.toArray(c[name],i);}
  const plug=new T.BufferGeometry();plug.setAttribute('position',new T.BufferAttribute(c.positions,3));plug.setAttribute('normal',new T.BufferAttribute(c.normals,3));
  const g=new T.BufferGeometry(),indices=[],count=(samples+1)*(sides+1),wireCount=def.colors.length;
  g.setAttribute('position',new T.BufferAttribute(new Float32Array((count*wireCount+plug.attributes.position.count)*3),3).setUsage(T.DynamicDrawUsage));
  g.setAttribute('normal',new T.BufferAttribute(new Float32Array((count*wireCount+plug.attributes.position.count)*3),3).setUsage(T.DynamicDrawUsage));
  // Keep the native plug winding; these ring faces need outward winding.
  for(let w=0;w<wireCount;w++){const first=indices.length;for(let i=0;i<samples;i++)for(let j=0;j<sides;j++){const a=w*count+i*(sides+1)+j,b=a+sides+1;indices.push(a,a+1,b,b,a+1,b+1);}g.addGroup(first,indices.length-first,w);}
  const first=indices.length;for(let i=0;i<plug.attributes.position.count;i++)indices.push(count*wireCount+i);g.addGroup(first,indices.length-first,wireCount);g.setIndex(indices);
  this.plugPosition=plug.attributes.position.array.slice();this.plugNormal=plug.attributes.normal.array.slice();plug.dispose();this.geometry=g;
  this.mesh=new T.Mesh(g,[...def.colors.map(material),material('#eee6d5')]);this.mesh.castShadow=false;this.mesh.userData={part:'hotendLeads',cadName:def.name,flexId:def.id,supplement:true,serviceOnly:true};
  this.update(1,1,1);
 }
 update(from,to,t){
  const key=`${from}:${to}:${t}`;if(this.lastKey===key)return;this.lastKey=key;
  const motion=clikMateMotion(from,to,t),amount=motion.amount;
  let lo=0,hi=this.routeStages.length-1;while(hi-lo>1){const mid=(lo+hi)>>1;if(this.routeStages[mid].at<=amount)lo=mid;else hi=mid;}const a=this.routeStages[lo],b=this.routeStages[hi],blend=T.MathUtils.clamp((amount-a.at)/(b.at-a.at),0,1);
  this.curve.points.forEach((p,i)=>p.lerpVectors(a.points[i],b.points[i],blend));this.curve.updateArcLengths();
  const angles=a.angles.map((v,i)=>T.MathUtils.lerp(v,b.angles[i],blend)),frames=fanCableFrames(this.curve,this.id,samples,T.MathUtils.lerp(a.roll,b.roll,blend),angles,false,this.sourceAcross),pos=this.geometry.attributes.position,norm=this.geometry.attributes.normal,n=new T.Vector3(),count=(samples+1)*(sides+1),wireCount=this.definition.colors.length,q=frames.plug;
  for(let w=0;w<wireCount;w++){
   const centres=frames.centres.map((c,i)=>c.clone().addScaledVector(frames.rows[i],(w-(wireCount-1)/2)*T.MathUtils.lerp(.00068,.0015,T.MathUtils.smoothstep(i/samples,.88,1))));
   for(let i=0;i<=samples;i++){
    const centre=centres[i],tangent=centres[Math.min(samples,i+1)].clone().sub(centres[Math.max(0,i-1)]).normalize(),normal=frames.rows[i].clone().addScaledVector(tangent,-frames.rows[i].dot(tangent)).normalize(),binormal=tangent.clone().cross(normal).normalize();
    for(let j=0;j<=sides;j++){const angle=j/sides*Math.PI*2,k=w*count+i*(sides+1)+j;n.copy(normal).multiplyScalar(Math.cos(angle)).addScaledVector(binormal,Math.sin(angle));pos.setXYZ(k,centre.x+n.x*wireRadius*.001,centre.y+n.y*wireRadius*.001,centre.z+n.z*wireRadius*.001);norm.setXYZ(k,n.x,n.y,n.z);}
   }
  }
  // The free plug approaches from different directions. A signed Y delta
  // can be negative even when it is far away, falsely pressing its latch.
  const end=this.curve.getPointAt(1),p=new T.Vector3(),pressed=new T.Vector3(),latch=clikMatePress(motion,this.seated.at(-1).distanceTo(end)*1000);
  for(let i=0;i<this.plugPosition.length/3;i++){const k=i*3;p.fromArray(this.plugPosition,k).lerp(pressed.fromArray(this.clikMate.pressedPositions,k),latch).applyQuaternion(q).add(end);pos.setXYZ(count*wireCount+i,p.x,p.y,p.z);p.fromArray(this.plugNormal,k).lerp(pressed.fromArray(this.clikMate.pressedNormals,k),latch).normalize().applyQuaternion(q);norm.setXYZ(count*wireCount+i,p.x,p.y,p.z);}
  pos.needsUpdate=true;norm.needsUpdate=true;this.geometry.computeBoundingBox();this.geometry.computeBoundingSphere();this.mesh.userData.flexState={from,to,t,amount,latch,connectorPhase:motion.phase};
 }
 guide(to=1,from=0){
  const at=amount=>{let hi=this.routeStages.findIndex(s=>s.at>=amount);if(hi<1)hi=1;const a=this.routeStages[hi-1],b=this.routeStages[hi],t=T.MathUtils.clamp((amount-a.at)/(b.at-a.at),0,1);return a.points.map((p,i)=>p.clone().lerp(b.points[i],t));};
  // Routing guides follow the moving middle span; connector guides follow
  // the plug itself, with the final approach along the receptacle axis.
  const routing=Math.max(from,to)<1;
  const points=Array.from({length:17},(_,i)=>{const p=at(T.MathUtils.lerp(from,to,i/16));return routing?new ServiceFanCurve(p).getPointAt(.45):p.at(-1);});
  points.targetIndex=points.length-1;return points;
 }
}
export function installAssemblyFanCables(viewer){
 for(const d of definitions.filter(d=>d.id==='servicePrintLead')){
  if(viewer.fasteners.entities.has(d.id))continue;
  const e=new ServiceFanCable(d),m=e.mesh,hot=d.id==='serviceHotendFanLead';delete m.userData.serviceOnly;
  Object.assign(m.userData,{part:'nextruderCables',component:d.id,cadPath:hot?[787,788,789,791]:[787,833],cadName:hot?'ホットエンドファンのケーブル':'プリントファンのケーブル'});
  viewer.fasteners.entities.set(d.id,e);viewer.fasteners.meshes.push(m);
 }
}
export function installServiceFanCables(viewer){
 for(const d of definitions){if(viewer.fasteners.entities.has(d.id))continue;const e=new ServiceFanCable(d),m=e.mesh;viewer.fasteners.entities.set(d.id,e);viewer.fasteners.meshes.push(m);viewer.group(m.userData.part).add(m);viewer.meshes.push(m);viewer.records.push({key:m.userData.part,name:d.name,mesh:m,id:m.uuid});m.userData.restPosition=m.position.clone();m.userData.restQuaternion=m.quaternion.clone();}
}
