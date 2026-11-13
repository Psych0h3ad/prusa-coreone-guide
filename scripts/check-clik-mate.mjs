import assert from 'node:assert/strict';
import * as T from '../dist/vendor/three.module.js';
import {createClikMatePlug,clikMateMotion}from '../dist/clik-mate-plug.js';
import {v}from './check-viewer.mjs';
import {SERVICE_TASKS}from '../dist/maintenance-data.js';
import {installMaintenanceModel}from '../dist/maintenance-model.js';
for(const pins of [2,3,4]){
 const c=createClikMatePlug(pins),g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(c.positions,3));g.computeBoundingBox();const size=g.boundingBox.getSize(new T.Vector3());
 assert(Math.abs(size.x-(pins*1.5+4.3))<5e-6);assert(Math.abs(size.y-6.1)<5e-6);assert(Math.abs(size.z-8.6)<5e-6);assert.equal(c.locks,1);
 assert(c.positions.length===c.pressedPositions.length&&c.positions.every(Number.isFinite));
 assert(c.positions.some((n,i)=>Math.abs(n-c.pressedPositions[i])>.1),'release bar changes shape');
}
const binding=installMaintenanceModel(v,SERVICE_TASKS,a=>a[0]),ids=['lbMotorLead','lbNtcLead','lbLoadcellLead','lbFilamentLead','servicePrintLead','serviceHotendFanLead','hotendThermistor0','hotendThermistor1'];
let snapshots=0,maxReverseError=0;
for(const id of ids){
 const e=v.fasteners.entities.get(id),points=e.geometry.attributes.position.array;
 e.update(1,0,0);const start=points.slice(),tail=e.curve.getPointAt(1).clone();
 e.update(1,0,.09);assert.equal(e.mesh.userData.flexState.amount,1,id+' housing stays seated while releasing');assert(Math.abs(e.mesh.userData.flexState.latch-.5)<1e-12);assert(e.curve.getPointAt(1).distanceTo(tail)<1e-12);
 if(!id.endsWith('1'))assert(points.some((x,i)=>Math.abs(x-start[i])>1e-5),id+' visible spring tongue moves before withdrawal');
 e.update(1,0,.18);assert.equal(e.mesh.userData.flexState.amount,1);assert.equal(e.mesh.userData.flexState.latch,1);
 for(const t of [0,.09,.18,.22,.35,.5,.75,1]){
  e.update(1,0,t);const pose=points.slice(),state={...e.mesh.userData.flexState};e.update(0,1,1-t);
  for(let k=0;k<pose.length;k++)maxReverseError=Math.max(maxReverseError,Math.abs(pose[k]-points[k]));assert(Math.abs(state.amount-e.mesh.userData.flexState.amount)<1e-12);snapshots++;
 }
 e.update(0,1,1);assert.equal(e.mesh.userData.flexState.amount,1);assert.equal(e.mesh.userData.flexState.latch,0,'seated plug locks again');
 e.update(0,0,1);assert.equal(e.mesh.userData.flexState.latch,0,'free connector bar is relaxed');
 const loose=points.slice();e.update(0,1,0);
 assert.deepEqual(points,loose,id+' insertion starts from the unpressed disconnected shape');
 e.update(1,1,1);const seated=points.slice();e.update(0,1,1);
 assert.deepEqual(points,seated,id+' insertion ends at the normal connected shape');
}
assert(maxReverseError<1e-8,'reverse scrubbing follows the same physical path');
const motor=v.fasteners.entities.get('lbMotorLead'),savedPoses=motor.poses,seated=savedPoses.at(-1).points.map(p=>p.clone()),packed=seated.map(p=>p.clone());packed[1].y-=2;
motor.poses=[{at:1,points:seated},{at:2,points:packed}];motor.lastKey=null;motor.update(1,1,1);
const shellOffset=motor.geometry.attributes.position.array.length-motor.shellPosition.length,lockedShell=motor.geometry.attributes.position.array.slice(shellOffset);
for(const[from,to]of[[1,2],[2,1]])for(let i=0;i<=32;i++){
 motor.update(from,to,i/32);assert.equal(motor.mesh.userData.flexState.latch,0,'packing a connected bundle does not release its latch');assert.equal(motor.mesh.userData.flexState.connectorPhase,'idle');
 assert.deepEqual(motor.geometry.attributes.position.array.slice(shellOffset),lockedShell,'routing the cable keeps the seated plug fixed');
}
motor.poses=savedPoses;motor.lastKey=null;
assert.equal(clikMateMotion(.35,0,.5).amount,.175,'routing a disconnected cable does not add a release action');
console.log(JSON.stringify({status:'PASS',singleRowPins:[2,3,4],ports:7,animatedLeads:ids.length,snapshots,maxReverseError,scope:'Authored reference housings, one central lock, explanatory latch deformation before withdrawal, stationary housing, relatching and seek reversal. Not a force or certified collision model.'}));
