import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from '../dist/vendor/three.module.js';
import {v} from './check-viewer.mjs';
import {FLOWS} from '../dist/data.js';
import {ASSEMBLY_PLAN} from '../dist/assembly-plan-runtime.js';
import {rigidMotion,motionBounds,motionGuide} from '../dist/assembly-director.js';
import {expectedAssemblyEndPose} from './assembly-end-pose.mjs';
const index=(flow,ch,n)=>FLOWS[flow].steps.findIndex(s=>s.chapter===ch-1&&s.officialStep===n);
const show=(flow,ch,n)=>{v.setState({flow,index:index(flow,ch,n),completed:[],comparison:'after',explore:false,variant:'screw'});v.autoplayPending=false;};
const has=id=>v.meshes.some(m=>m.visible&&m.userData.cadPath?.includes(id));
let scenes=0,operations=0;
for(const flow of ['build','upgrade'])for(let i=0;i<FLOWS[flow].steps.length;i++){
 const step=FLOWS[flow].steps[i];if(step.variant==='glued')continue;
 v.setState({flow,index:i,completed:[],comparison:'after',explore:false,variant:'screw'});v.autoplayPending=false;
 const plan=ASSEMBLY_PLAN[flow][step.officialId];
 assert.equal(v.sceneActors.length,plan.actors.length,`missing CAD binding at ${flow} ${plan.chapter}.${plan.step}`);
 const rigid=v.sceneActors.filter(a=>!a.flex);
 // A handling path may carry an already assembled board and its screws as
 // one workpiece. Require the explicit carry marker and a real pose path.
 const assigned=new Set();for(const a of rigid)for(const m of a.nodes){assert(!assigned.has(m)||a.reuse||(a.carry&&a.handling&&a.posePath?.length>=2),`unmarked repeated rigid binding ${flow} ${plan.chapter}.${plan.step}`);assigned.add(m);}
 for(const actor of v.sceneActors){
  assert(actor.nodes.length);assert(actor.path.every(p=>Number.isFinite(p.length())));
  if(actor.flex)continue;
  const delta=actor.path[0].clone().sub(actor.path.at(-1)),trace=motionGuide(actor,actor.box.max);if(actor.inspection){assert(actor.handling&&actor.reuse&&actor.distance===0&&actor.focusMotion&&actor.camera&&actor.anchors?.length,'stationary inspections require an explicit camera and target');}else assert(delta.length()>.0005||actor.spin||trace.some(p=>p.distanceTo(trace[0])>.0005),'an assembly action must translate or visibly rotate');
  if(actor.distance===undefined&&!actor.waypoints&&!actor.contextBox.isEmpty())assert(!actor.box.clone().translate(actor.path[0]).intersectsBox(actor.contextBox),'external staging clears the assembled context bounding box');
 }
 if(v.sceneActors.length){
  assert.equal(v.arrowLayer.children.length,v.sceneActors.length);
  const dashed=[];v.arrowLayer.traverse(o=>{if(o.material?.isLineDashedMaterial)dashed.push(o);});
  assert(dashed.length>=v.sceneActors.length,'each operation needs a dashed path');
  v.seek(1);assert.equal(v.operationProgress,1);
  for(const actor of v.sceneActors)if(!actor.remove&&!actor.flex){
   for(const m of actor.nodes){if(rigid.slice(rigid.indexOf(actor)+1).some(a=>a.nodes.includes(m)))continue;const expected=expectedAssemblyEndPose(v,actor,m);assert(m.position.distanceTo(expected.position)<1e-9,'CAD end position: '+expected.basis);assert(m.quaternion.clone().normalize().angleTo(expected.quaternion.clone().normalize())<1e-7,'CAD end orientation: '+expected.basis);}
  }
  v.seek(.5);const snapshot=v.meshes.map(m=>[m.visible,...m.position.toArray()]);
  v.seek(0);v.seek(.5);assert.deepEqual(v.meshes.map(m=>[m.visible,...m.position.toArray()]),snapshot,'seeking must be deterministic');
  operations+=v.sceneActors.length;
 }
 scenes++;
}
show('build',3,1);assert(has(306),'chapter 3 tools show completed base');
for(const id of [207,53,35,39,313,369,635,370])assert(!has(id),`future CAD part ${id} in chapter 3 tools`);
assert.equal(v.sceneActors.length,0,'tool preparation has no fake animation');
show('build',3,20);assert(!has(306),'bench PSU/back work must not float above the printer base');assert(has(53));assert(has(207));assert(!has(167));
show('build',3,35);v.seek(1);for(const id of [306,53,207,167,35,39])assert(has(id),`rear-to-base step ${id}`);
show('build',5,74);v.seek(1);for(const id of [313,369,371,306,659])assert(has(id));assert(!has(790),'Nextruder is not installed in CoreXY chapter');
show('upgrade',2,3);assert(v.sceneActors[0].nodes.some(m=>m.userData.cadPath?.includes(236)),'spool holder stays on removed panel');
show('upgrade',2,22);assert(v.sceneActors[0].nodes.some(m=>m.userData.part==='spoolNew'),'panel returns with new holder');assert(!has(236));assert(!has(77));
show('upgrade',2,24);assert.equal(v.sceneActors.length,4,'unscrew, remove, fit, refasten');v.seek(0);assert(!v.sceneActors[2].nodes[0].visible,'replacement waits its turn');v.seek(.2);assert(v.sceneActors[0].nodes.every(m=>m.visible),'future screw reuse must not hide current screw removal');v.seek(1);assert(v.sceneActors[3].nodes.every(m=>m.visible&&m.position.distanceTo(m.userData.restPosition)<1e-9),'reused screws return to their CAD seats');
show('build',7,3);v.seek(.4);v.setState({...v.state,completed:[v.state.index]});assert.equal(v.operationProgress,.4,'checking a step does not restart motion');
show('build',7,4);assert.equal(v.operationProgress,0,'next step resets operation position');assert.equal(v.explode,0);
show('build',2,8);assert(v.sceneActors[0].nodes.every(m=>m.userData.cadPath.some(id=>[330,332,334,336].includes(id))),'rear motor uses rear CAD screws');
for(const n of [8,9,10]){show('build',2,n);v.seek(1);assert(new THREE.Vector3(0,0,1).transformDirection(v.printer.matrixWorld).y>.999,'official 2.8–10: rods point up and motors stay below the plate');const screw=v.sceneActors.at(-1);assert.deepEqual(screw.axis,[0,0,1],'motor screws enter from the exposed upper face');}
show('build',2,3);assert(new THREE.Vector3(0,0,-1).transformDirection(v.printer.matrixWorld).y>.999,'official 2.3: folded underside faces up');
show('build',2,7);const flip=v.sceneActors[0];assert(flip.handling&&flip.nodes.some(m=>m.userData.cadPath?.includes(306)));assert.equal(flip.nodes.filter(m=>m.userData.flexId).length,6,'all six installed bands turn with the plate');assert.equal(flip.posePath[0].rotation[0],180);assert(rigidMotion(flip,1).rotation.equals(new THREE.Quaternion()));
v.seek(.2);const turned=flip.nodes.map(m=>[...m.position.toArray(),...m.quaternion.toArray()]);v.seek(1);v.seek(.2);assert.deepEqual(flip.nodes.map(m=>[...m.position.toArray(),...m.quaternion.toArray()]),turned,'workpiece flip can be scrubbed in both directions');
show('build',4,30);assert(v.sceneActors[0].nodes.every(m=>m.userData.cadPath.includes(783)),'rear bed nut uses rear CAD location');
show('build',8,42);v.setState({...v.state,variant:'glued'});assert.deepEqual(v.sceneActors.map(a=>a.gluedPhase),['align','turn','press'],'glued handle follows official alignment, counterclockwise application and pressing');v.seek(1);
for(const [ch,n,order]of [[6,17,0],[6,33,1]]){
 show('build',ch,n);const actor=v.sceneActors[order];assert((actor.posePath||actor.waypoints)?.length>=3,'fitted approach retains its waypoints');
 const bounds=motionBounds(actor),guide=motionGuide(actor,actor.box.getCenter(new THREE.Vector3()));assert.equal(guide.length,actor.posePath?65:actor.path.length);
 for(let i=0;i<=128;i++){const pose=rigidMotion(actor,i/128);assert(Math.abs(pose.rotation.length()-1)<1e-12);const point=actor.box.getCenter(new THREE.Vector3()).sub(pose.pivot).applyQuaternion(pose.rotation).add(pose.pivot).add(pose.offset);assert(bounds.containsPoint(point),'camera bounds include the rotated approach');}
 assert(rigidMotion(actor,1).rotation.equals(new THREE.Quaternion()),'fitted approach ends in exact CAD orientation');
 v.seek(.4);const q=actor.nodes.map(m=>[...m.position.toArray(),...m.quaternion.toArray()]);v.seek(0);v.seek(.4);assert.deepEqual(actor.nodes.map(m=>[...m.position.toArray(),...m.quaternion.toArray()]),q,'fitted path scrubs reversibly');
}
show('build',6,42);v.seek(1);assert.equal(v.lastOperationFocus,v.sceneActors.length-1,'scrubbing follows the selected band instead of leaving the camera on the first one');
show('upgrade',2,1);await v.playStep();const start=v.playing.start;v.loop(start+100);document.hidden=true;v.loop(start+200);v.loop(start+5200);document.hidden=false;v.loop(start+5300);assert(v.operationProgress<.15,'reading elsewhere suspends the animation clock');v.seek(1);
const audit={scenes,operations,animatedSteps:Object.fromEntries(Object.entries(ASSEMBLY_PLAN).map(([f,p])=>[f,Object.values(p).filter(s=>s.actors.length).length])),browserGPUExercised:false};
fs.writeFileSync('research/assembly-check.json',JSON.stringify(audit,null,2));
console.log('PASS: per-step CAD bindings, future-part exclusion, bench handoffs, sequential actors, dashed guides, reversible seeking, exact CAD end poses. '+JSON.stringify(audit));
