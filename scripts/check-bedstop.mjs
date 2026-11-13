import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from '../dist/vendor/three.module.js';
import {v} from './check-viewer.mjs';
import {runtimeModule} from './runtime-module.mjs';
const {FLOWS}=await runtimeModule('data');
const {ASSEMBLY_PLAN}=await runtimeModule('assembly-plan');
const {rigidMotion}=await runtimeModule('assembly-director');
const id=m=>m.userData.component??m.userData.cadIndex;
const show=n=>{const index=FLOWS.build.steps.findIndex(s=>s.chapter===4&&s.officialStep===n);v.setState({flow:'build',index,comparison:'after',variant:'screw',explore:false,completed:[]});v.autoplayPending=false;};
const native=[385,555,557,544,546,548];
for(const n of native)assert.equal(v.meshes.filter(m=>m.userData.cadIndex===n).length,1,'one native instance '+n);
const supplemental=v.meshes.filter(m=>/^bedStop/.test(m.userData.component||''));
assert.deepEqual(supplemental.map(id).sort(),['bedStopNutCenter','bedStopRearScrew']);
assert.equal(supplemental.find(m=>id(m)==='bedStopNutCenter').userData.nativeGeometrySource,555);
assert.equal(supplemental.find(m=>id(m)==='bedStopRearScrew').userData.nativeGeometrySource,544);
show(38);assert(!v.meshes.find(m=>id(m)==='bedStopRearScrew').visible,'rear fixing waits until mounting');
show(39);assert.equal(v.sceneActors.length,4);
assert.deepEqual(v.sceneActors.map(a=>a.nodes.map(id)),[[557],['bedStopNutCenter'],[385,557,'bedStopNutCenter'],[555]]);
let states=0;
for(let k=0;k<4;k++)for(let j=0;j<=32;j++){
 v.seek((k+j/32)/4);v.scene.updateMatrixWorld(true);
 for(const m of v.meshes.filter(m=>m.visible&&[385,555,557,'bedStopNutCenter'].includes(id(m)))){
  assert(m.matrixWorld.elements.every(Number.isFinite));
  assert(new THREE.Box3().setFromObject(m).min.y>-.00001,'bench work does not sink through the work surface');
 }
 states++;
}
show(40);assert.equal(v.sceneActors.length,4);assert(Math.abs(v.printer.rotation.x+Math.PI/2)<1e-12,'motor mounts face up');
assert(v.sceneActors[0].nodes.some(m=>id(m)==='bedStopNutCenter'),'inserted nuts transfer with printed body');
const fasteners=v.sceneActors.slice(1);
show(79);assert.equal(v.sceneActors.length,2);assert(v.sceneActors[0].inspection,'oval-hole alignment precedes fixing');
fasteners.push(v.sceneActors[1]);
let pitchIntervals=0;
for(const a of fasteners){
 assert.equal(a.posePath.length,3);const axis=new THREE.Vector3(...a.axis).normalize();
 for(let j=1;j<=128;j++){
  const before=rigidMotion(a,(j-1)/128),after=rigidMotion(a,j/128);
  const angle=before.rotation.angleTo(after.rotation);
  if(angle<1e-6||Math.abs(before.offset.dot(axis))*1000>=a.posePath[1].offset.reduce((sum,x)=>sum+x*x,0)**.5-1e-7)continue;
  const advance=Math.abs(after.offset.clone().sub(before.offset).dot(axis))*1000;
  assert(Math.abs(advance/angle*2*Math.PI-.5)<1e-7,'M3 advance follows 0.5 mm pitch');pitchIntervals++;
 }
}
const counts=Object.fromEntries(Object.entries(ASSEMBLY_PLAN).map(([flow,plans])=>[flow,Object.values(plans).filter(p=>p.actors.length).length]));
assert.deepEqual(counts,{build:158,upgrade:23});
assert(fs.readFileSync('dist/credits.html','utf8').includes('181手順'));
console.log(JSON.stringify({status:'PASS',nativeHardwareReused:native.length,supplementalClones:supplemental.length,benchStates:states,pitchIntervals,animatedSteps:counts,scope:'Actual runtime geometry and motion, finite sampling; GPU and whole-machine collision certification excluded.'}));
