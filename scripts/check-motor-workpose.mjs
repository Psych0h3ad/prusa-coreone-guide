import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import * as T from '../dist/vendor/three.module.js';
import {runtimeModule} from './runtime-module.mjs';

// Use the shipped CAD scene, including both native grub screws and the tools.
// This check creates no renderer or WebGL context. --cad remains accepted.
registerHooks({resolve(s,c,next){return s==='three'?{url:new URL('../dist/vendor/three.module.js',import.meta.url).href,shortCircuit:true}:next(s,c);}});
globalThis.document={getElementById:()=>null};
globalThis.matchMedia=()=>({matches:false});
const {FLOWS}=await runtimeModule('data');
const {AssemblyDirector,motionGuide}=await runtimeModule('assembly-director');
const {PrinterViewer}=await import('../dist/viewer.js');
const v=(await import('./check-viewer.mjs')).v;
const state=n=>({flow:'build',index:FLOWS.build.steps.findIndex(s=>s.chapter===4&&s.officialStep===n),variant:'screw',comparison:'after',explore:false,completed:[]});
const show=s=>{v.setState(s);v.autoplayPending=false;};
const world=mesh=>{v.printer.updateMatrixWorld(true);return mesh.getWorldPosition(new T.Vector3());};
const snapshot=()=>v.meshes.map(m=>[m.visible,...m.position.toArray(),...m.quaternion.toArray()]);
for(const [step,motorId,pulleyId,installation]of [[42,387,392,53],[43,567,388,47]]){
 show(state(step));assert.equal(v.sceneActors.length,8,'slide,tool,height,first screw,turn,second screw,return,tool removal');
 const actor=v.sceneActors[0],motor=v.meshes.find(m=>m.userData.cadPath.includes(motorId)),pulley=actor.nodes[0];
 assert(pulley.userData.cadPath.includes(pulleyId),'the pulley stays with its corresponding motor');
 assert(motor.visible&&pulley.visible);assert.equal(v.meshes.filter(m=>m.visible).length,v.director.resolve([motorId,pulleyId]).length);
 assert(new T.Vector3(0,0,-1).transformDirection(v.printer.matrixWorld).y>.999,'the source shaft direction faces up');
 v.seek(1);const seated=world(pulley),fixedMotor=world(motor);
 v.seek(0);const staged=world(pulley);
 assert(Math.abs(staged.y-seated.y-25)<1e-8,'the pulley starts 25mm above its seat');
 assert(Math.hypot(staged.x-seated.x,staged.z-seated.z)<1e-8);
 let previous=staged.y;
 for(let i=0;i<=20;i++){v.seek(i/20);const p=world(pulley);assert(p.y<=previous+1e-8);previous=p.y;assert(world(motor).distanceTo(fixedMotor)<1e-8);}
 assert(Math.abs(new T.Box3().setFromObject(motor).min.y)<1e-8,'the motor back rests on the workbench');
 const guide=motionGuide(actor,actor.box.getCenter(new T.Vector3())).map(p=>p.applyMatrix4(v.printer.matrixWorld));
 v.seek(1/8);const toolSetting=world(pulley);
 assert(Math.abs(toolSetting.y-seated.y-1)<1e-8,'first action leaves the final1mm for setting the pulley against its tool');
 assert(Math.abs(guide[0].y-guide.at(-1).y-(staged.y-toolSetting.y))<1e-8,'the guide follows the actual first action, before the final tool-setting movement');
 v.seek(.37);const scrubbed=snapshot();v.seek(1);v.seek(0);v.seek(.37);assert.deepEqual(snapshot(),scrubbed);
 for(const complete of [{explore:true},{comparison:'before'}]){
  show({...state(step),...complete});
  assert(new T.Vector3(0,0,1).transformDirection(v.printer.matrixWorld).y>.999,'the completed printer remains upright');
  assert.equal(v.sceneActors.length,0);
  show(state(step));v.seek(1);assert(world(pulley).distanceTo(seated)<1e-8,'returning restores the bench pose');
 }
 show(state(installation));
 assert(v.sceneActors[0].nodes.includes(motor)&&v.sceneActors[0].nodes.includes(pulley),'installation transfers the motor and seated pulley together');
 v.seek(1);
 for(const mesh of [motor,pulley]){assert(mesh.position.equals(mesh.userData.restPosition));assert(mesh.quaternion.equals(mesh.userData.restQuaternion));}
}
v.clearGuides();for(const mesh of v.meshes){mesh.geometry.dispose();for(const material of Array.isArray(mesh.material)?mesh.material:[mesh.material])material.dispose();}
console.log('PASS: shipped X/Y motors face shaft-up on the bench; eight setup actions per motor,25mm staged pulleys with matching guides,reversible seeking,upright complete views and paired installation. No GPU output is exercised.');
