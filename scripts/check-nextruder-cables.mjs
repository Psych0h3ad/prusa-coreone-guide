import assert from 'node:assert/strict';
import * as T from '../dist/vendor/three.module.js';
import {v}from './check-viewer.mjs';
import {FLOWS}from '../dist/data.js';
import {socketCentre}from '../dist/loveboard-layout.js';
const ids=['lbMotorLead','lbLoadcellLead','lbFilamentLead'],parentIds=[790,794,794],leads=ids.map(id=>v.fasteners.entities.get(id));
assert(leads.every(Boolean),'the assembly viewer installs all three factory-attached leads');
const show=(n,p=1)=>{v.setState({flow:'build',index:FLOWS.build.steps.findIndex(s=>s.chapter===5&&s.officialStep===n),comparison:'after',explore:false,variant:'screw',completed:[]});v.autoplayPending=false;v.seek(p);v.printer.updateMatrixWorld(true);};
show(6);const parents=parentIds.map(id=>v.meshes.find(m=>m.userData.cadIndex===id)),relative=leads.map((e,i)=>parents[i].matrixWorld.clone().invert().multiply(e.mesh.matrixWorld));
let cases=0,visibleStates=0,maxRelativeError=0;
for(const flow of ['build','upgrade'])for(let index=0;index<FLOWS[flow].steps.length;index++){
 v.setState({flow,index,comparison:'after',explore:false,variant:'screw',completed:[]});v.autoplayPending=false;
 for(const t of[0,.4,1]){
  v.seek(t);v.printer.updateMatrixWorld(true);cases++;
  for(const [i,e]of leads.entries()){
   if(!e.mesh.visible)continue;visibleStates++;assert(parents[i].visible,`${flow}:${index}:a cable cannot appear without its source part`);
   const m=parents[i].matrixWorld.clone().invert().multiply(e.mesh.matrixWorld);
   for(let k=0;k<16;k++)maxRelativeError=Math.max(maxRelativeError,Math.abs(m.elements[k]-relative[i].elements[k]));
  }
 }
}
assert(maxRelativeError<1e-8,'wires travel with their source motor/heatsink through all bench and printer motions');
show(51);for(const e of leads)assert.equal(e.mesh.userData.flexState.amount,0,'all three leads remain unplugged before6.52');
show(52,0);assert.equal(v.sceneActors.length,3);assert.deepEqual(v.sceneActors.map(a=>a.flex[0]),ids,'official E, loadcell, filament-sensor order');
for(let operation=0;operation<3;operation++)for(const t of[0,.5,1]){
 show(52,(operation+t)/3);
 for(let j=0;j<3;j++){
  assert(leads[j].mesh.visible,'future leads stay attached and visible');
  assert.equal(leads[j].mesh.userData.flexState.amount,j<operation?1:j>operation?0:t*t*(3-2*t));
 }
}
show(53);for(const e of leads)assert.equal(e.mesh.userData.flexState.amount,1,'connection persists after6.52');
for(const e of leads){
 const forward=e.guide(1,0),reverse=e.guide(0,1),end=forward.at(-1),target=new T.Vector3(...socketCentre(e.definition.socket)).addScaledVector(e.out,e.socket.out[0]?1.5:3.5).multiplyScalar(.001);
 assert(end.distanceTo(target)<1e-10);assert.equal(forward.targetIndex,forward.length-1);
 assert(end.clone().sub(forward.at(-2)).normalize().dot(e.out)<-.999,'the insertion arrow follows the socket axis');
 assert(forward[0].distanceTo(reverse.at(-1))<1e-10&&end.distanceTo(reverse[0])<1e-10,'guide reverses with the actual unplugging path');
}
for(const[w,h]of[[320,380],[390,420],[844,280]]){
 v.camera.aspect=w/h;v.camera.updateProjectionMatrix();
 for(let operation=0;operation<3;operation++){
  show(52,(operation+.5)/3);v.manualCamera=false;v.focusOperation(operation,true);v.camera.updateMatrixWorld(true);
  const box=new T.Box3().setFromObject(leads[operation].mesh);
  for(const x of[box.min.x,box.max.x])for(const y of[box.min.y,box.max.y])for(const z of[box.min.z,box.max.z]){const q=new T.Vector3(x,y,z).project(v.camera);assert(Math.abs(q.x)<.96&&Math.abs(q.y)<.96,'each full cable and moving plug fits the phone camera');}
 }
}
console.log(JSON.stringify({status:'PASS',cases,visibleStates,maxRelativeError,officialStep:'6.52',operations:ids,limits:'Rigid attachment, official connection order, guide mating axes and camera bounds; separate mesh audit covers local intersections.'}));
