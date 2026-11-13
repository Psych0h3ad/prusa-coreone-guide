import assert from 'node:assert/strict';
import * as T from 'three';
import {v}from './check-viewer.mjs';
import {FLOWS}from '../dist/data.js';
import {molexWireEntry}from '../dist/molex-frames.js';
import {SERVICE_FAN_ROUTES}from '../dist/service-fan-routing.js';

const pairs=[['servicePrintLead',834]];
const entities=pairs.map(([id])=>v.fasteners.entities.get(id));
const parents=pairs.map(([,cad])=>v.meshes.find(m=>m.userData.cadIndex===cad));
const show=(n,p=1)=>{v.setState({flow:'build',index:FLOWS.build.steps.findIndex(s=>s.chapter===5&&s.officialStep===n),comparison:'after',explore:false,variant:'screw',completed:[]});v.autoplayPending=false;v.seek(p);v.printer.updateMatrixWorld(true);};
for(const[id]of pairs)assert.equal(v.meshes.filter(m=>m.userData.flexId===id).length,1,'one factory cable per source, shared with maintenance');
show(54);const relative=entities.map((e,i)=>parents[i].matrixWorld.clone().invert().multiply(e.mesh.matrixWorld));
const root=entities[0].curve.getPointAt(0).applyMatrix4(entities[0].mesh.matrixWorld),triangle=new T.Triangle(),nearest=new T.Vector3();let sourceGapMM=Infinity;
for(const m of v.meshes.filter(m=>m.userData.cadIndex===834)){
 const a=m.geometry.attributes.position,ix=m.geometry.index;
 for(let i=0;i<(ix?.count??a.count);i+=3){for(const[k,p]of[triangle.a,triangle.b,triangle.c].entries())p.fromBufferAttribute(a,ix?ix.getX(i+k):i+k).applyMatrix4(m.matrixWorld);triangle.closestPointToPoint(root,nearest);sourceGapMM=Math.min(sourceGapMM,nearest.distanceTo(root));}
}
assert(sourceGapMM<.01,'the illustrative lead starts at the native fan housing, without a floating gap');
let poses=0,visible=0,maxCarryError=0;
for(const flow of ['build','upgrade'])for(let index=0;index<FLOWS[flow].steps.length;index++){
 v.setState({flow,index,comparison:'after',explore:false,variant:'screw',completed:[]});v.autoplayPending=false;
 for(const progress of [0,.4,1]){
  v.seek(progress);v.printer.updateMatrixWorld(true);poses++;
  entities.forEach((e,i)=>{if(!e.mesh.visible)return;visible++;assert(parents[i].visible,`${flow}:${index}: cable appears with its source`);const matrix=parents[i].matrixWorld.clone().invert().multiply(e.mesh.matrixWorld);matrix.elements.forEach((x,j)=>maxCarryError=Math.max(maxCarryError,Math.abs(x-relative[i].elements[j])));});
 }
}
assert(maxCarryError<1e-8,'cables follow sensor/fan bench handling and printer transfers');
show(48);entities.forEach(e=>assert.equal(e.mesh.userData.flexState.amount,0,'factory leads remain unplugged before6.49'));
show(51,0);assert.deepEqual(v.sceneActors.map(a=>a.officialLine),[995308,995300],'route through the cover, then loop/connect');
assert.equal(v.sceneActors[1].fromStates.servicePrintLead,.85,'connection continues from the routed pose');
show(51,.5);assert.equal(entities[0].mesh.userData.flexState.amount,.85);
show(51);entities.forEach(e=>assert.equal(e.mesh.userData.flexState.amount,1));
for(const id of ['lbMotorLead','lbLoadcellLead','lbFilamentLead'])assert.equal(v.fasteners.entities.get(id).mesh.userData.flexState.amount,0,'6.52 connections remain pending');

let maxFanLengthErrorMM=0,maxRootDriftMM=0;
for(const e of entities){
 const root=e.curve.getPointAt(0).clone(),socket=e.definition.socketId;
 for(let k=0;k<=128;k++){
  e.update(0,1,k/128);maxFanLengthErrorMM=Math.max(maxFanLengthErrorMM,Math.abs(e.curve.getLength()*1000-SERVICE_FAN_ROUTES[e.id].length));maxRootDriftMM=Math.max(maxRootDriftMM,e.curve.getPointAt(0).distanceTo(root)*1000);
 }
 assert(e.curve.getPointAt(1).distanceTo(molexWireEntry(socket).multiplyScalar(.001))<1e-9,'native connector wire-entry datum');
 const guide=e.guide(1,.85);assert.equal(guide.targetIndex,guide.length-1);assert(guide.at(-1).clone().sub(guide.at(-2)).normalize().dot(new T.Vector3(0,1,0))>.999,'guide approaches along the socket axis');
 const routed=e.guide(.85,0);assert(routed[0].distanceTo(routed.at(-1))>.01,'channel guide follows a moving middle span');
}
assert(maxFanLengthErrorMM<.025,'route interpolation retains cable length');assert(maxRootDriftMM<.0001,'factory cable outlet stays fixed');
for(const[width,height]of[[320,380],[390,420],[844,280]]){
 v.camera.aspect=width/height;v.camera.updateProjectionMatrix();
 for(const[n,operation]of[[51,0],[51,1]]){
  show(n,(operation+.5)/(n===49?1:2));v.manualCamera=false;v.focusOperation(operation,true);v.camera.updateMatrixWorld(true);
  const actor=v.sceneActors[operation],entity=v.fasteners.entities.get(actor.flex[0]);
  if(n===51&&operation===0){
   const box=new T.Box3().setFromObject(entity.mesh);for(const x of[box.min.x,box.max.x])for(const y of[box.min.y,box.max.y])for(const z of[box.min.z,box.max.z]){const q=new T.Vector3(x,y,z).project(v.camera);assert(Math.abs(q.x)<.96&&Math.abs(q.y)<.96,'routed cable fits a phone close-up');}
  }else{
   const tip=entity.curve.getPointAt(1).multiplyScalar(entity.id.startsWith('lb')?.001:1).applyMatrix4(entity.mesh.matrixWorld).project(v.camera);assert(Math.abs(tip.x)<.9&&Math.abs(tip.y)<.9,'active plug fits phone close-up');
  }
 }
}
console.log(JSON.stringify({status:'PASS',poses,visible,maxCarryError,maxFanLengthErrorMM,maxRootDriftMM,sourceGapMM,officialSteps:['6.51'],scope:'Factory/source ownership, native fan housing attachment, official operation order, route-to-connection handover, constant illustrative cable length/root, mating-axis guide and phone framing. Mesh contacts and browser raster are separate checks.'}));
