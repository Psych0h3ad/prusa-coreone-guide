import assert from 'node:assert/strict';
import * as T from '../dist/vendor/three.module.js';
import {v} from './check-viewer.mjs';
import {FLOWS} from '../dist/data.js';
const show=(n,variant='screw')=>{v.setState({flow:'build',index:FLOWS.build.steps.findIndex(s=>s.chapter===7&&s.officialStep===n),variant,comparison:'after',explore:false,completed:[]});v.autoplayPending=false;};
const mesh=id=>v.director.resolve([id])[0],key=m=>m.userData.cadIndex||m.userData.part;
show(31);assert.deepEqual(v.sceneActors.map(a=>a.nodes.map(key)),[[577],[587],[574],[589]]);
assert(v.groups.door.position.length()===0,'CAD leaves share the source frame, without a second door pivot');
v.seek(.49);assert(mesh(587).visible&&!mesh(574).visible&&!mesh(575).visible);
show(32);assert.deepEqual(v.sceneActors.map(a=>a.nodes.map(key)),[[575],['doorHingePinUpper']]);
v.seek(1);const upper=mesh('doorHingePinUpper');assert(upper.visible&&!mesh('doorHingePinLower').visible);
upper.geometry.computeBoundingBox();const size=upper.geometry.boundingBox.getSize(new T.Vector3()).multiplyScalar(1000);assert(size.distanceTo(new T.Vector3(2,2,40))<.001);assert.equal(upper.userData.geometryStatus,'nominal-reconstruction');
show(33);assert.deepEqual(v.sceneActors.map(a=>a.nodes.map(key)),[[576],['doorHingePinLower'],[575],[576],[575,576]]);
const fixed=[574,577,587,589].map(id=>[id,mesh(id).position.clone(),mesh(id).quaternion.clone()]);
v.seek(1);const opened=mesh(576).position.clone(),q=mesh(576).quaternion.clone();assert(Math.abs(q.angleTo(mesh(576).userData.restQuaternion)-Math.PI/2)<1e-8);
for(const [id,p,q]of fixed){assert(mesh(id).position.equals(p));assert(mesh(id).quaternion.equals(q),'fixed inner leaves and screws never orbit with the door');}
v.seek(.89);const pose=mesh(576).position.clone();v.seek(.12);v.seek(.89);assert(mesh(576).position.equals(pose),'hinge rotation scrubs reversibly');
show(40);assert(mesh(576).position.distanceTo(opened)<1e-10);assert(mesh(576).quaternion.equals(q));assert.equal(v.sceneActors.length,5);assert.deepEqual(v.sceneActors.slice(1).map(a=>a.nodes.map(key)),[[579],[581],[583],[585]]);
v.seek(1);for(const id of [579,581,583,585,587,589])assert.equal(mesh(id).userData.underheadLength,5);
show(40,'glued');assert(!v.sceneActors[0].nodes.includes(mesh(590)),'glued handle is installed after the panel, not prematurely in step 40');
show(31);v.setState({...v.state,explore:true});const fixedFull=[574,577,587,589].map(id=>[id,mesh(id).position.clone(),mesh(id).quaternion.clone()]);v.setDoor(true);for(let k=0;k<120;k++)v.loop(performance.now()+k*16);
for(const [id,p,q]of fixedFull){assert(mesh(id).position.equals(p));assert(mesh(id).quaternion.equals(q));}
assert(Math.abs(v.doorAngle+Math.PI/2)<1e-8);v.setDoor(false);for(let k=0;k<120;k++)v.loop(performance.now()+2000+k*16);assert.equal(v.doorAngle,0);assert(mesh(572).position.equals(mesh(572).userData.sceneRestPosition));
console.log('PASS: official lower/upper hinge order, nominal 2×40 pins, six actual 5 mm screws, fixed inner leaves, true pin-axis opening, reversible seek, open state at door installation, top-first fastening and both handle branches.');
