import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
registerHooks({resolve(s,c,next){return s==='three'?{url:new URL('../dist/vendor/three.module.js',import.meta.url).href,shortCircuit:true}:next(s,c);}});
const {v}=await import('./check-viewer.mjs');
const {FLOWS}=await import('../dist/data.js');
const T=await import('../dist/vendor/three.module.js');
const state=(flow,n,extra={})=>({flow,index:FLOWS[flow].steps.findIndex(s=>s.chapter===(flow==='build'?6:1)&&s.officialStep===n),completed:[],comparison:'after',explore:false,variant:'screw',...extra});
const show=(flow,n,extra={})=>{v.setState(state(flow,n,extra));v.autoplayPending=false;};
const sensor=()=>v.meshes.filter(m=>m.userData.part==='sensorBody')[0];
const panel=()=>v.meshes.find(m=>m.userData.cadIndex===52);
for(const flow of ['build','upgrade']){
 const attach=flow==='build'?39:21,close=flow==='build'?40:22;
 show(flow,attach);assert(v.meshes.filter(m=>m.visible&&m.parent.visible).length>300,'panel fitting retains printer context');v.seek(1);
 const assembled=new T.Matrix4().compose(sensor().position,sensor().quaternion,sensor().scale),held=new T.Matrix4().compose(panel().position,panel().quaternion,panel().scale);
 show(flow,close);v.seek(0);assert(sensor().visible&&panel().visible,'attached panel and sensor stay visible during front-screw work');
 const first=new T.Matrix4().compose(sensor().position,sensor().quaternion,sensor().scale),firstPanel=new T.Matrix4().compose(panel().position,panel().quaternion,panel().scale);
 assert(first.elements.every((x,i)=>Math.abs(x-assembled.elements[i])<1e-10),'sensor pose continues across steps');
 assert(firstPanel.elements.every((x,i)=>Math.abs(x-held.elements[i])<1e-10),'panel pose continues across steps');
 for(let k=0;k<=100;k++){
  v.seek(k/100);v.printer.updateMatrixWorld(true);const relative=panel().matrixWorld.clone().invert().multiply(sensor().matrixWorld);
  assert(relative.elements.every((x,i)=>Math.abs(x-(held.clone().invert().multiply(assembled)).elements[i])<1e-8),'panel carries its attached sensor rigidly');
 }
 for(const m of v.sceneActors.at(-1).nodes){assert(m.position.distanceTo(m.userData.restPosition)<1e-9,'closed panel returns to the source CAD position');assert(m.quaternion.clone().normalize().angleTo(m.userData.restQuaternion.clone().normalize())<1e-7,'closed panel returns to source orientation');}
 v.seek(.37);const a=v.sceneActors.at(-1).nodes.map(m=>[...m.position.toArray(),...m.quaternion.toArray(),m.visible]);v.seek(1);v.seek(.37);assert.deepEqual(v.sceneActors.at(-1).nodes.map(m=>[...m.position.toArray(),...m.quaternion.toArray(),m.visible]),a,'reverse seek restores held panel');
 show(flow,attach,{explore:true});for(const m of [panel(),sensor()])assert(m.position.distanceTo(m.userData.restPosition)<1e-9,'completed overview excludes held-workpiece poses');
 show(flow,attach);v.seek(1);assert(sensor().position.distanceTo(sensor().userData.restPosition)>.001,'return from overview restores the working pose');
}
console.log('PASS: actual CAD panel ownership, source-order screws, cross-step held poses, rigid sensor transfer, reverse seeking and completed-view reset.');
