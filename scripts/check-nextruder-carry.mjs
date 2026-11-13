import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from 'three';
import {v}from './check-viewer.mjs';
import {SERVICE_TASKS}from '../dist/maintenance-data.js';
import {installMaintenanceModel}from '../dist/maintenance-model.js';

const binding=installMaintenanceModel(v,SERVICE_TASKS,a=>a[0]);
const task=SERVICE_TASKS.find(t=>t.id==='loveboard');
const choose=action=>{
 const index=task.steps.findIndex(s=>s.action===action);assert(index>=0);
 v.setState({flow:'service',index:binding.indexOf(task.id,index),comparison:'after',variant:'screw',explore:false,completed:[]});
 v.autoplayPending=false;v.playing=false;
};
// Independent list of items fitted inside the body: all must follow the
// heatsink, remain assembled, and leave the carriage with it.
const refs=['hallSensor','hallHolder','hallBall','hallMagnet','hallSpring',
 'idlerSwivelSpacer','idlerSpring1','idlerSpring2',
 'mainPlate','pgAssembly','pgRing','idlerBearing1','idlerBearing2','idlerPin1','idlerPin2'];
const sink=v.meshes.find(m=>m.userData.cadIndex===794);assert(sink);
const carried=refs.flatMap(ref=>{
 const meshes=v.director.resolve([ref]);assert(meshes.length,'missing physical part: '+ref);
 return meshes;
});
const points=m=>{
 v.printer.updateMatrixWorld(true);
 const transform=sink.matrixWorld.clone().invert().multiply(m.matrixWorld);
 const p=m.geometry.attributes.position;
 return [0,Math.floor(p.count/2),p.count-1].map(i=>new T.Vector3().fromBufferAttribute(p,i).applyMatrix4(transform));
};
let poses=0,maximumRelativeErrorMM=0;
for(const action of ['lb-nextruder-out','lb-nextruder-in']){
 choose(action);v.seek(0);
 const baseline=carried.map(points);
 for(let j=0;j<=40;j++){
  v.seek(j/40);v.applyMaterials();
  for(const [i,m]of carried.entries()){
   assert(m.visible,action+': fitted part remains present');
   const actual=points(m);
   for(let k=0;k<3;k++)maximumRelativeErrorMM=Math.max(maximumRelativeErrorMM,actual[k].distanceTo(baseline[i][k])*1000);
   // The preceding NTC-hook close-up deliberately cuts the heatsink away.
   // Once the complete body is handled, its fitted parts must be opaque.
   if(v.sceneActors[v.activeOperation]?.nodes.includes(sink)||j===40)for(const mat of Array.isArray(m.material)?m.material:[m.material])assert(mat.opacity>=(mat.userData.originalOpacity??1)*.95,'carried internals stay opaque: '+JSON.stringify({action,j,part:m.userData.part,component:m.userData.component,opacity:mat.opacity,base:mat.userData.originalOpacity}));
  }
  poses++;
 }
 assert(sink.position.distanceTo(sink.userData.sceneRestPosition)>.08||action==='lb-nextruder-in','outward movement exceeds 80 mm');
 const end=carried.map(m=>({p:m.position.toArray(),q:m.quaternion.toArray(),visible:m.visible}));
 choose('lb-cover-out');choose(action);v.seek(1);
 assert.deepEqual(carried.map(m=>({p:m.position.toArray(),q:m.quaternion.toArray(),visible:m.visible})),end,'random entry restores carried parts');
 v.seek(0);v.seek(1);
 assert.deepEqual(carried.map(m=>({p:m.position.toArray(),q:m.quaternion.toArray(),visible:m.visible})),end,'reverse scrubbing restores carried parts');
}
assert(maximumRelativeErrorMM<1e-5,'internals must remain rigid relative to the heatsink');
for(const action of ['lb-rear-out','lb-board-out','lb-board-in','lb-rear-in']){
 choose(action);v.seek(0);assert(carried.every(m=>!m.visible),'removed internals cannot be left floating at the carriage: '+action);
}
choose('lb-cover-out');v.seek(0);
assert(carried.every(m=>m.visible),'head-only view includes supplemental parts before removal');
const report={status:'PASS',poses,partReferences:refs.length,meshes:carried.length,maximumRelativeErrorMM,randomEntry:true,reverseScrub:true,hiddenWithRemovedBody:true,scope:'Fitted body membership and rigid follow only; not a collision, cable-path or complete47-step acceptance.'};
if(process.env.NEXTRUDER_CARRY_REPORT)fs.writeFileSync(process.env.NEXTRUDER_CARRY_REPORT,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
