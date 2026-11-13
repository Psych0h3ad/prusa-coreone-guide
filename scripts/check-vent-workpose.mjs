import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import * as T from '../dist/vendor/three.module.js';
registerHooks({resolve(s,c,next){return s==='three'?{url:new URL('../dist/vendor/three.module.js',import.meta.url).href,shortCircuit:true}:next(s,c);}});
const {v}=await import('./check-viewer.mjs');
const {FLOWS}=await import('../dist/data.js');
const {motionGuide}=await import('../dist/assembly-director.js');
const initial={variant:'screw',comparison:'after',explore:false,completed:[]};
const screw=id=>v.meshes.find(m=>m.userData.cadPath?.includes(id));
const state=(flow,n)=>({...initial,flow,index:FLOWS[flow].steps.findIndex(s=>s.chapter===(flow==='build'?7:1)&&s.officialStep===n)});
const bounds=m=>{m.geometry.computeBoundingBox();return m.geometry.boundingBox.clone().applyMatrix4(new T.Matrix4().compose(m.userData.restPosition,m.userData.restQuaternion,m.scale));};
for(const [flow,f]of Object.entries(FLOWS))for(const [index,step]of f.steps.entries()){
 v.setState({...initial,flow,index});v.autoplayPending=false;
 const original=flow==='upgrade'&&!step.final&&(step.overview||step.chapter===0||step.chapter===1&&step.officialStep<28);
 for(const id of [98,100,102]){
  const expected=flow==='build'?12:original||id===98?10:12,m=screw(id);
  assert.equal(m.userData.fastenerLength,expected,`${flow}/${step.officialId}/${id}`);
  assert(Math.abs(bounds(m).min.z-(.4892875248124-expected/1000))<2e-7,'actual threaded tip preserves nominal length and underhead datum');
 }
 for(const id of [94,96]){const b=new T.Box3();for(const m of v.director.resolve([id]))b.union(bounds(m));assert(Math.abs(b.max.z-(.4837875248124-(original?0:.002)))<2e-7,'both nut fragments preserve the correct seating datum');}
}
for(const flow of ['build','upgrade']){
 const s=state(flow,flow==='build'?7:29);v.setState(s);v.autoplayPending=false;
 const actors=v.sceneActors.slice(-2),panel=v.director.resolve([88]);
 assert.equal(actors.length,2);assert(actors.every(a=>a.nodes.length===14),'every attached piece travels, including the two-material nuts');
 assert(actors.every(a=>a.nodes.every(m=>!panel.includes(m))),'the slotted outer sheet remains fixed');
 const begin=(v.sceneActors.length-2)/v.sceneActors.length,open=(v.sceneActors.length-1)/v.sceneActors.length;
 v.seek(begin);
 const fixed=panel.map(m=>m.position.clone());
 for(const m of actors[0].nodes)assert(m.position.distanceTo(m.userData.restPosition)<1e-9,'closed before test');
 v.seek(open);
 for(const m of actors[0].nodes)assert(m.position.distanceTo(m.userData.restPosition.clone().add(new T.Vector3(-.0085,0,0)))<1e-9,'all hardware follows the open grille');
 for(const [i,m]of panel.entries())assert(m.position.equals(fixed[i]));
 const guide=motionGuide(actors[0],actors[0].box.getCenter(new T.Vector3()));assert(Math.abs(guide[0].distanceTo(guide.at(-1))-.0085)<1e-12);
 const snapshot=v.meshes.map(m=>[m.visible,...m.position.toArray(),...m.quaternion.toArray()]);
 v.seek(1);v.seek(open);assert.deepEqual(v.meshes.map(m=>[m.visible,...m.position.toArray(),...m.quaternion.toArray()]),snapshot,'opening scrubs deterministically');
 v.seek(1);for(const m of actors[1].nodes)assert(m.position.distanceTo(m.userData.restPosition)<1e-9,'closes before the next step');
 v.setState({...s,comparison:'before'});assert.deepEqual([98,100,102].map(id=>screw(id).userData.fastenerLength),[10,10,10]);
 v.setState(s);v.seek(1);for(const id of [94,96])assert(Math.abs(bounds(screw(id)).max.z-.4817875248124)<2e-7,'nut seat remains stable after switching comparison');
}
for(const [flow,n]of [['build',6],['upgrade',25],['upgrade',28],['upgrade',29]]){
 v.setState(state(flow,n));v.autoplayPending=false;
 if(flow==='upgrade'&&n===28){assert.equal(v.sceneActors.length,1);assert(!v.operationScene.visible.some(m=>m.userData.cadPath?.includes(90)),'vent cover is aligned from inside in the following step');const travel=v.sceneActors[0].path[0].clone().sub(v.sceneActors[0].path.at(-1)).transformDirection(v.printer.matrixWorld);assert(travel.y>.999,'outside screws approach from above the workpiece');}
 if(n===6||n===29)assert(v.sceneActors[0].handling,'turn over before working on the inner face');
 for(let i=0;i<=80;i++){
  v.seek(i/80);v.printer.updateMatrixWorld(true);
  for(const m of v.meshes.filter(m=>m.visible&&m.parent.visible)){const box=new T.Box3().setFromObject(m);assert(box.min.y>-.002,`${flow}/${n}/${i}: operation must stay above the bench (${box.min.y})`);}
 }
}
console.log('PASS actual shipped vent geometry: 425 step configurations, nominal screw tips, reversible old/new lengths and nut seats, paired 8.5 mm opening/closing with all attached hardware, fixed slotted sheet, exact guidance and deterministic scrubbing. No renderer or continuous mechanical certification.');
