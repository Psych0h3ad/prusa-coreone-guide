import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import * as T from '../dist/vendor/three.module.js';
registerHooks({resolve(s,c,next){return s==='three'?{url:new URL('../dist/vendor/three.module.js',import.meta.url).href,shortCircuit:true}:next(s,c);}});
const {v}=await import('./check-viewer.mjs');
const {FLOWS}=await import('../dist/data.js');
const state=(flow,n)=>({flow,index:FLOWS[flow].steps.findIndex(s=>s.chapter===(flow==='build'?6:1)&&s.officialStep===n),completed:[],comparison:'after',explore:false,variant:'screw'});
const show=(flow,n)=>{v.setState(state(flow,n));v.autoplayPending=false;};
const visible=key=>v.meshes.some(m=>m.userData.part===key&&m.visible&&m.parent.visible);
const keys=['sensorBody','sensorLever','sensorSwitch','sensorCover','sensorBall','sensorLeverMagnet','sensorSwitchMagnet','sensorIR','sensorLeverWasher','sensorLeverScrew','sensorCoverScrewLeft','sensorCoverScrewRight','sensorMountNutLeft','sensorMountNutRight'];
const floorCheck=()=>{v.printer.updateMatrixWorld(true);for(const m of v.meshes.filter(m=>m.visible&&m.parent.visible))assert(new T.Box3().setFromObject(m).min.y>-.001,'the workpiece and loose parts remain above the workbench');};
for(const flow of ['build','upgrade']){
 show(flow,12);assert(visible('sensorBody'));for(const key of keys.slice(1))assert(!visible(key),`preparation must not show future ${key}`);
 show(flow,13);assert.equal(v.sceneActors.length,6);assert(v.sceneActors[2].nodes.every(m=>m.userData.part==='sensorBall'));
 const ball=v.sceneActors[2];assert.equal(ball.path.length,4,'ball follows the open-cavity corridor before the lever enters');
 const lengths=ball.path.slice(1).map((p,i)=>p.distanceTo(ball.path[i]));assert(Math.abs(lengths[0]-.025)<1e-9);assert(lengths[1]>.004&&lengths[1]<.005);assert(lengths[2]>.002&&lengths[2]<.003);
 assert.deepEqual(v.sceneActors[3].nodes.map(m=>m.userData.part).sort(),['sensorLever','sensorLeverMagnet']);
 for(let k=0;k<=160;k++){v.seek(k/160);floorCheck();}
 v.seek(1);assert(visible('sensorBall'));assert(visible('sensorLeverMagnet'));assert(!visible('sensorSwitchMagnet'));
 assert(v.lastFocusSettled,'after insertion the camera focuses the assembled parts, not the empty staging area');
 v.focusOperation(v.activeOperation,true);const finishedDistance=v.camera.position.distanceTo(v.controls.target);
 v.seek(.55);assert(!v.lastFocusSettled,'scrubbing backward restores travel framing');v.focusOperation(v.activeOperation,true);assert(v.camera.position.distanceTo(v.controls.target)>finishedDistance*1.2);
 v.holdCamera();const manual=v.camera.position.clone();v.seek(1);assert(v.camera.position.equals(manual),'finishing does not override a manually chosen camera');v.manualCamera=false;
 show(flow,15);assert.equal(v.sceneActors.length,3);assert(v.sceneActors[2].nodes.some(m=>m.userData.part==='sensorSwitchMagnet'));
 for(let k=0;k<=160;k++){v.seek(k/160);floorCheck();}
 v.seek(1);for(const key of ['sensorBody','sensorLever','sensorSwitch','sensorBall','sensorLeverMagnet','sensorSwitchMagnet','sensorLeverWasher','sensorLeverScrew'])assert(visible(key),key);
 show(flow,flow==='build'?18:17);assert.equal(v.sceneActors.length,1);assert.equal(v.sceneActors[0].nodes.length,9,'all official IR CAD solids move together');for(let k=0;k<=80;k++){v.seek(k/80);floorCheck();}
 show(flow,flow==='build'?19:18);assert.equal(v.sceneActors.length,5);assert(v.sceneActors[0].path[0].distanceTo(v.sceneActors[0].path[1])>.0149,'nuts use their sloping slot axis');for(let k=0;k<=160;k++){v.seek(k/160);floorCheck();}v.seek(1);for(const key of keys)assert(visible(key),`${flow} cover retains ${key}`);
 for(const mesh of v.meshes.filter(m=>m.userData.part.startsWith('sensorCoverScrew'))){const length=flow==='build'?10:8;assert.equal(mesh.userData.fastenerLength,length);mesh.geometry.computeBoundingBox();assert(Math.abs(mesh.geometry.boundingBox.max.z-length/1000)<1e-8,'selected geometry has the actual nominal shank length');}
 assert.equal(v.meshes.find(m=>m.userData.part==='sensorSwitch').material.userData.originalColor.getHexString(),'fd5000');
 const board=v.meshes.filter(m=>m.userData.part==='sensorIR');assert.equal(board.filter(m=>m.material.vertexColors).length,8,'source terminal/component finishes are retained');assert(board.some(m=>m.material.userData.originalColor.getHexString()==='b42529'),'PCB uses the official-photo red finish');
 assert(!v.meshes.some(m=>m.visible&&m.userData.cadPath?.some(id=>[228,230].includes(id))),'original nuts must not penetrate the new body');
 show(flow,flow==='build'?21:22);v.seek(1);for(const key of keys)assert(visible(key),`${flow} transfer retains ${key}`);
 v.setState({...v.state,comparison:'before'});for(const key of keys)assert.equal(visible(key),['sensorIR','sensorBall','sensorLeverMagnet','sensorSwitchMagnet','sensorLeverScrew'].includes(key),'original comparison shows reused internals in the original housing');
}
console.log('PASS actual sensor geometry: source order, ball corridor, both magnet attachments, staged turn-over, workbench clearance, camera completion/manual control, complete-unit transfers and old/new comparison. Sampled poses, no GPU or force simulation.');
