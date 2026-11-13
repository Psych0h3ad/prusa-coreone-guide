import * as T from 'three';
import {createMainServiceRoute} from './loveboard-main-route.js';
import {canonical} from './loveboard-main-canonical.js';
const owners=new WeakMap();
export function setMainServiceEnabled615(viewer,on){const owner=owners.get(viewer);return owner&&viewer.mainService615===owner?owner.enable(on):false;}
export function retireMainService615(viewer){owners.get(viewer)?.retire();}

export function mainServiceCanonical615(){
 const geometry=new T.BufferGeometry();for(const [name,source]of [['position',canonical.prefixPositionU32],['normal',canonical.prefixNormalU32]]){const raw=new Uint32Array(22*81*7*3);for(let w=0;w<22;w++)raw.set(source.slice(w*24*7*3,(w+1)*24*7*3),w*81*7*3);geometry.setAttribute(name,new T.BufferAttribute(new Float32Array(raw.buffer),3));}
 return {geometry,packedStrands:canonical.strands.map(a=>a.map(p=>new T.Vector3(...p)))};
}

export function loveboardFlexNodes615(viewer,task,ids,resolve){
 // The assembly constructor inherited component=lbMainLead. That alias is
 // not a second real service cable and must not enter an actor's node list.
 return task.id==='loveboard'?ids.flatMap(id=>{const e=viewer.fasteners.entities.get(id);return e?[e.mesh]:resolve([id]);}):resolve(ids);
}
export function prepareMainServiceScene615(viewer,spec,task){
 const owner=owners.get(viewer);if(!owner||viewer.mainService615!==owner)return spec;
 owner.enable(task.id==='loveboard');
 if(task.id!=='loveboard'||!owner.owns())return spec;
 const plan={...spec.plan,mainService615:true,visibleRefs:[...(spec.plan.visibleRefs||[]),'mainSleeve','lbMainSleeveService'],solidRefs:[...(spec.plan.solidRefs||[]),'lbMainSleeveService']};
 return {...spec,plan,hidden:[...spec.hidden,'assemblyMainLead','assemblyMainSleeve']};
}
export function installMainService615(viewer,{samplePlug,writeShell}={}){
 const previous=owners.get(viewer);if(previous?.active&&viewer.mainService615===previous)return previous;
 if(viewer.mainService615)throw Error('615 main branch already belongs to another owner');
 const entity=viewer.fasteners.entities.get('lbMainLead');if(!entity)throw Error('615 lbMainLead absent');
 const mesh=entity.mesh,original={update:entity.update,guide:entity.guide,curve:entity.curve,geometry:mesh.geometry,metadata:mesh.userData.mainService615},reference=mainServiceCanonical615(),route=createMainServiceRoute(reference,{samplePlug}),geometry=original.geometry.clone();
 // Full upstream sleeve remains the source mesh. This adds only its missing
 // existing terminal prefix; the bench sleeve's upstream 70mm is not doubled.
 const sleeveGeometry=new T.BufferGeometry();for(const name of ['position','normal'])sleeveGeometry.setAttribute(name,new T.BufferAttribute(new Float32Array(canonical.sleeve[name]),3));sleeveGeometry.setIndex(canonical.sleeve.index);const sleeve=new T.Mesh(sleeveGeometry,new T.MeshStandardMaterial({color:canonical.jacketColor,roughness:.72,metalness:.05}));sleeve.scale.setScalar(.001);
 sleeve.userData={part:'hotendLeads',flexId:'lbMainSleeveService',serviceTask:'loveboard',toolOnly:true,componentOnly:true,sourceMaterial:'MainLoomPhysical existing terminal jacket prefix',referenceLengthMM:canonical.prefixReferenceMM,illustration:true,supplement:true,preserveColours:true};
 sleeve.userData.restPosition=sleeve.position.clone();sleeve.userData.restQuaternion=sleeve.quaternion.clone();viewer.group('hotendLeads').add(sleeve);viewer.meshes.push(sleeve);const record={key:'hotendLeads',name:'main sleeve terminal prefix',mesh:sleeve,id:sleeve.uuid};viewer.records.push(record);
 let active=true,enabled=false,state,last={from:1,to:1,t:1},expectedCurve=original.curve;const attributes={position:geometry.attributes.position,normal:geometry.attributes.normal,index:geometry.index};
 const owns=()=>active&&viewer.loaded&&!viewer.disposed&&viewer.fasteners?.entities.get('lbMainLead')===entity&&entity.mesh===mesh&&viewer.mainService615===api&&mesh.userData.mainService615===api&&entity.update===update&&entity.guide===guide&&entity.curve===expectedCurve&&mesh.geometry===(enabled?geometry:original.geometry)&&entity.geometry===mesh.geometry&&(!enabled||geometry.attributes.position===attributes.position&&geometry.attributes.normal===attributes.normal&&geometry.index===attributes.index);
 function enable(on){if(!owns())return false;if(enabled===on)return true;enabled=on;entity.geometry=mesh.geometry=enabled?geometry:original.geometry;if(!enabled)expectedCurve=entity.curve=original.curve;return true;}
 const curve={getLength:()=>state?.renderedCentrelineMM??0,getPointAt(u,out=new T.Vector3()){const x=T.MathUtils.clamp(u,0,1)*state.renderedCentrelineMM,m=state.centreStations;let i=0;while(i<79&&m[i+1]<x)i++;return out.copy(state.centreNodes[i]).lerp(state.centreNodes[i+1],(x-m[i])/Math.max(1e-12,m[i+1]-m[i]));},getTangentAt(u,out=new T.Vector3()){return this.getPointAt(Math.min(1,u+.001),out).sub(this.getPointAt(Math.max(0,u-.001))).normalize();}};
 const apply=(from,to,t)=>{state=route.sample({from,to,t});route.write(state,geometry);if(writeShell)writeShell(geometry.attributes.position,geometry.attributes.normal,{offset:22*81*7,packet:state.packet});else{
  // Old127 illustrative shell, retained only for the old-interface control.
  const p=geometry.attributes.position,b=original.geometry.attributes.position,delta=state.centreEnd.clone().sub(state.oldMean).multiplyScalar(.001);for(let i=22*81*7;i<p.count;i++)p.setXYZ(i,b.getX(i)+delta.x,b.getY(i)+delta.y,b.getZ(i)+delta.z);
 }geometry.attributes.position.needsUpdate=true;geometry.computeBoundingBox();geometry.computeBoundingSphere();expectedCurve=entity.curve=curve;mesh.userData.flexState={from,to,t,amount:state.amount,length:state.renderedCentrelineMM,referenceCentreMM:state.referenceCentreMM,strandLengthsMM:state.strands.map(s=>s.lengthMM),connectorPhase:state.packet?.phase,latch:state.packet?.press??0,representation:'single physical assembly main branch'};};
 function update(from,to,t){if(!owns())return;last={from,to,t};if(enabled)apply(from,to,t);else original.update.call(entity,from,to,t);}
 function guide(to=1,from=0){if(!owns())return [];if(!viewer.operationScene?.plan.mainService615)return original.guide.call(entity,to,from);const a=Array.from({length:17},(_,i)=>route.guidePoint({from,to,t:i/16},Math.min(from,to)>=.5).multiplyScalar(.001));a.targetIndex=16;return a;}
 const detach=()=>{original.geometry.removeEventListener('dispose',onSourceDispose);geometry.removeEventListener('dispose',onDispose);sleeveGeometry.removeEventListener('dispose',onDispose);};
 function retire(notification){if(!active)return;const handBack=owns()&&!notification;active=false;if(owners.get(viewer)===api)owners.delete(viewer);detach();if(entity.update===update)entity.update=original.update;if(entity.guide===guide)entity.guide=original.guide;if(entity.curve===curve)entity.curve=original.curve;if(entity.geometry===geometry)entity.geometry=original.geometry;if(mesh.geometry===geometry)mesh.geometry=original.geometry;if(mesh.userData.mainService615===api)delete mesh.userData.mainService615;if(viewer.mainService615===api)delete viewer.mainService615;if(handBack&&entity.update===original.update&&entity.guide===original.guide&&entity.curve===original.curve&&entity.geometry===original.geometry&&mesh.geometry===original.geometry){entity.lastKey=undefined;original.update.call(entity,last.from,last.to,last.t);}sleeve.removeFromParent();for(const a of [viewer.meshes,viewer.records]){const i=a.indexOf(a===viewer.meshes?sleeve:record);if(i>=0)a.splice(i,1);}if(!viewer.disposed&&notification!==geometry)geometry.dispose();if(!viewer.disposed&&notification!==sleeveGeometry)sleeveGeometry.dispose();if(!viewer.disposed)sleeve.material.dispose();route.dispose();reference.geometry.dispose();}
 function onSourceDispose(){retire(original.geometry);}function onDispose(e){retire(e.target);}
 const api={get active(){return active;},get state(){return state;},get last(){return {...last};},enable,retire,owns,sourceGeometry:original.geometry,geometry,sleeve,route,qualification:samplePlug?'616 functional source-mouth references; photo-derived PCB registration, not OEM crimp axes/metrology':'old127 illustrative entry control only'};
 owners.set(viewer,api);viewer.mainService615=api;mesh.userData.mainService615=api;entity.update=update;entity.guide=guide;original.geometry.addEventListener('dispose',onSourceDispose);geometry.addEventListener('dispose',onDispose);sleeveGeometry.addEventListener('dispose',onDispose);return api;
}
