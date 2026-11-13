import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
registerHooks({resolve(s,c,next){return s==='three'?{url:new URL('../dist/vendor/three.module.js',import.meta.url).href,shortCircuit:true}:next(s,c);}});
const {v}=await import('./check-viewer.mjs');
const {FLOWS,PARTS}=await import('../dist/data.js');
const {SENSOR_ASSEMBLY}=await import('../dist/sensor-assembly-data.js');
const T=await import('../dist/vendor/three.module.js');
const state=n=>({flow:'upgrade',index:FLOWS.upgrade.steps.findIndex(s=>s.chapter===1&&s.officialStep===n),completed:[],comparison:'after',explore:false,variant:'screw'});
const show=n=>{v.setState(state(n));v.autoplayPending=false;};
const meshes=key=>v.meshes.filter(m=>m.userData.part===key&&!m.userData.manualExcluded);
const visible=key=>meshes(key).filter(m=>m.visible&&m.parent.visible);
const reused=Object.keys(SENSOR_ASSEMBLY.oldRestPoses);
show(20);v.seek(1);for(const spec of SENSOR_ASSEMBLY.handleScrews){const mesh=v.meshes.find(m=>m.userData.cadPath?.includes(spec.cad));assert.equal(mesh.userData.fastenerLength,10);mesh.updateMatrix();const axis=new T.Vector3(...spec.partToWorld.slice(0,3).map(r=>r[2])),origin=new T.Vector3(...spec.partToWorld.slice(0,3).map(r=>r[3]/1000)),p=mesh.geometry.attributes.position;let end=-Infinity;for(let i=0;i<p.count;i++)end=Math.max(end,new T.Vector3().fromBufferAttribute(p,i).applyMatrix4(new T.Matrix4().compose(mesh.userData.restPosition,mesh.userData.restQuaternion,mesh.scale)).sub(origin).dot(axis));assert(Math.abs(end-.010)<1e-8,'actual upgrade handle screw has a 10mm shank');}
assert.equal(meshes('sensorIR').length,9,'one official board assembly, not separate old/new copies');
for(const key of reused.filter(k=>k!=='sensorIR'))assert.equal(meshes(key).length,1,'one physical reusable part '+key);
show(8);assert.equal(v.sceneActors.length,3);assert.equal(visible('sensorOld').length,1);assert.equal(visible('sensorBody').length,0);
for(const key of reused){const m=meshes(key)[0],expected=SENSOR_ASSEMBLY.oldRestPoses[key];assert(m.userData.sceneRestPosition.distanceTo(new T.Vector3(...expected.slice(0,3).map(r=>r[3]/1000)))<1e-9);}
v.seek(1);assert.equal(visible('sensorIR').length,0);assert.equal(visible('sensorOldCover').length,0);
show(10);assert.equal(v.sceneActors[0].nodes[0].userData.part,'sensorSwitchMagnet');v.seek(1);assert.equal(visible('sensorSwitchMagnet').length,0);
show(11);assert.equal(v.sceneActors.length,4);for(let k=0;k<=320;k++){v.seek(k/320);v.printer.updateMatrixWorld(true);for(const m of v.meshes.filter(m=>m.visible&&m.parent.visible))assert(new T.Box3().setFromObject(m).min.y>-.001,'old sensor and staged lever stay above the workbench');}
assert.equal(visible('sensorBall').length,0);assert.equal(visible('sensorLeverMagnet').length,0);assert.equal(visible('sensorLeverScrew').length,0);assert.equal(visible('sensorOldLever').length,1,'old lever remains staged while its magnet is extracted');
for(const [n,keys]of [[13,['sensorBall','sensorLeverMagnet','sensorLeverScrew']],[15,['sensorSwitchMagnet']],[17,['sensorIR']]]){
 show(n);for(const key of keys){const m=meshes(key)[0];assert(m.userData.sceneRestPosition.equals(m.userData.restPosition),'reused part now uses the new mating datum');}v.seek(1);for(const key of keys)assert(visible(key).length);
}
show(8);v.seek(.2);const snapshot=meshes('sensorLeverMagnet')[0].position.clone();show(17);show(8);v.seek(.2);assert(meshes('sensorLeverMagnet')[0].position.equals(snapshot),'back/forward does not retain a future assembly pose');
v.setState({...state(17),comparison:'before'});for(const key of reused)assert(visible(key).length,'original comparison retains reused '+key);
v.setState({...state(17),explore:true});assert.equal(visible('sensorOld').length,0);assert.equal(visible('sensorOldLever').length,0);for(const key of reused)assert(visible(key).length,'finished printer retains reused '+key);
v.setState({flow:'build',index:FLOWS.build.steps.findIndex(s=>s.chapter===6&&s.officialStep===20),completed:[],comparison:'after',explore:false,variant:'screw'});for(const spec of SENSOR_ASSEMBLY.handleScrews)assert.equal(v.meshes.find(m=>m.userData.cadPath?.includes(spec.cad)).userData.fastenerLength,8,'kit returns to its original M3x8 handle screws');
console.log('PASS old sensor: official R1 housing, one set of reusable parts, removal order, workbench turnover, old/new pose handoff and reversible navigation.');
