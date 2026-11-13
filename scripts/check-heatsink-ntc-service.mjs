import assert from 'node:assert/strict';
import * as T from 'three';
import {v}from './check-viewer.mjs';
import {SERVICE_TASKS}from '../dist/maintenance-data.js?v=20261109-84';
import {NEXTRUDER_BODY_REFS}from '../dist/nextruder-service-parts.js?v=20261109-84';
import {installMaintenanceModel}from '../dist/maintenance-model.js';
import {NTC_BENCH}from '../dist/heatsink-ntc-model.js';
const task=SERVICE_TASKS.find(t=>t.id==='heatsink-ntc');assert(task);
assert.deepEqual(task.steps.map(s=>s.officialId),[931471,931506,931548,931610,931656,931702,931728,931764,931802,931856,931892,931920,931938,931976,932602,932012,932048,932102,932136,932164,932199,932227,932281,932315,932333,932363,932425,932469,932575]);
assert.deepEqual(task.steps.map(s=>s.officialStep),Array.from({length:29},(_,i)=>i+2));
assert.equal(task.steps.reduce((n,s)=>n+s.sourcePhotos.length,0),58);
assert.equal(task.steps.flatMap(s=>s.sourcePhotos).filter(p=>p.full.includes('_painted')).length,56);
assert(task.steps[14].body.every(s=>s.includes('90')),'correct replacement lead length in all four languages');
assert(task.steps[28].body[0].includes('必ずギアボックス調整'),'required recovery calibration');
for(const s of task.steps){assert.equal(new URL(s.source).hash,'#'+s.officialId);for(const p of s.sourcePhotos)assert.equal(new URL(p.full).hostname,'help.prusa3d.com');}
const binding=installMaintenanceModel(v,SERVICE_TASKS,a=>a[0]);
const select=(n,progress=0)=>{v.setState({flow:'service',index:binding.indexOf(task.id,n-1),comparison:'after',variant:'screw',explore:false,completed:[]});v.autoplayPending=false;v.seek(progress);v.scene.updateMatrixWorld(true);};
const body=v.director.resolve(NEXTRUDER_BODY_REFS),ntc=v.fasteners.entities.get('lbNtcLead');
assert(body.length&&ntc);
const sensor=v.director.resolve([806])[0];
const original=new T.Matrix4().compose(sensor.userData.restPosition,sensor.userData.restQuaternion,sensor.scale).invert();
const localAnchors=ntc.definition.sourceAnchors.map(p=>new T.Vector3(...p).multiplyScalar(.001).applyMatrix4(original));
const relative=mesh=>v.printer.matrixWorld.clone().invert().multiply(mesh.matrixWorld);
const capture=()=>body.map(m=>({id:m.uuid,matrix:relative(m).toArray()}));
const difference=(a,b)=>Math.max(...a.flatMap((r,i)=>r.matrix.map((x,k)=>Math.abs(x-b[i].matrix[k]))));
let maximumSourceFrameErrorMM=0,states=0;
for(let n=1;n<=29;n++){
 for(const progress of [0,.25,.5,.75,1,.5,0]){
  select(n,progress);states++;
  for(const m of v.meshes)if(m.visible)assert([...m.position.toArray(),...m.quaternion.toArray()].every(Number.isFinite));
  if(n>=13&&n<=17){
   assert(ntc.mesh.visible,`NTC cable stays visible during its own service stage${n}`);
   const position=ntc.geometry.attributes.position;
   for(let wire=0;wire<2;wire++){
    const actual=new T.Vector3();for(let side=0;side<6;side++)actual.add(new T.Vector3().fromBufferAttribute(position,wire*81*7+side));actual.multiplyScalar(1/6).applyMatrix4(ntc.mesh.matrixWorld);
    const expected=localAnchors[wire].clone().applyMatrix4(sensor.matrixWorld);
    maximumSourceFrameErrorMM=Math.max(maximumSourceFrameErrorMM,actual.distanceTo(expected));
   }
  }
 }
}
// matrixWorld includes the printer's1000scale, so these differences are in mm.
assert(maximumSourceFrameErrorMM<.001,'NTC lead follows the actual sensor through turnover and extraction');
const joins=[];
for(const [from,to]of [[13,14],[14,15],[15,16],[16,17]]){
 select(from,1);const before=capture(),vertices=ntc.geometry.attributes.position.array.slice();
 select(to,0);const delta=difference(before,capture());
 assert(delta<1e-8,`${from}→${to}: rigid workpiece handover`);
 assert.deepEqual(ntc.geometry.attributes.position.array,vertices,`${from}→${to}: cable shape handover`);
 joins.push({from,to,maximumMatrixDifference:delta});
}
const centroid=id=>{
 const meshes=v.director.resolve([id]),sum=new T.Vector3();let count=0;
 for(const m of meshes){const a=m.geometry.attributes.position;for(let i=0;i<a.count;i++){sum.add(new T.Vector3().fromBufferAttribute(a,i).applyMatrix4(m.matrixWorld).applyMatrix4(v.printer.matrixWorld.clone().invert()));count++;}}
 return sum.multiplyScalar(1000/count);
};
select(14,1/3);const screwStart=centroid(811);select(14,2/3);const screwEnd=centroid(811);
assert(screwEnd.clone().sub(screwStart).distanceTo(new T.Vector3(0,NTC_BENCH.screwTravel,0))<.001,'grub screw leaves along the rotated original shaft');
const sensorStart=centroid(806);select(14,1);const sensorEnd=centroid(806);
assert(sensorEnd.clone().sub(sensorStart).distanceTo(new T.Vector3(0,0,NTC_BENCH.sensorTravel))<.001,'sensor leaves along the rotated original bore');
select(15,0);assert.equal(v.sceneActors.length,0);assert(v.inspectionNodes.size,'replacement-parts inspection is not a fake install motion');
for(const n of [14,16]){select(n,0);assert.equal(v.sceneActors.length,3);assert(v.sceneActors.every(a=>a.nodes.length));}
const report={status:'NTC_BENCH_COMPONENT_REVIEW',states,taskStages:29,officialStepRange:[2,30],
 maximumSourceFrameErrorMM,joins,screwDisplacementMM:screwEnd.sub(screwStart).toArray(),sensorDisplacementMM:sensorEnd.sub(sensorStart).toArray(),
 screwPitchMM:NTC_BENCH.screwTravel/(NTC_BENCH.screwSpin/360),
 scope:'Actual CAD viewer:203states, four handovers, persistent sensor lead, source-frame following and original-axis travel. This test does not certify continuous collisions, torque, T6recess fidelity or physical-phone behavior.'};
console.log(JSON.stringify(report));
