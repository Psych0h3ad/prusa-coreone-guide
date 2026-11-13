import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
registerHooks({resolve(s,c,next){return s==='three'?{url:new URL('../dist/vendor/three.module.js',import.meta.url).href,shortCircuit:true}:next(s,c);}});
const {v}=await import('./check-viewer.mjs');
const {FLOWS}=await import('../dist/data.js');
const T=await import('../dist/vendor/three.module.js');
const show=n=>{v.setState({flow:'build',index:FLOWS.build.steps.findIndex(s=>s.chapter===4&&s.officialStep===n),completed:[],comparison:'after',explore:false,variant:'screw'});v.autoplayPending=false;};
const visible=m=>m.visible&&m.parent.visible;
for(const m of v.director.resolve([401,403])){const material=m.material;assert.equal(material.userData.finish,'polymer','XY printed carriages use their real black polymer finish');assert(material.metalness<.1);}
for(const mesh of v.director.resolve(['leftBearingScrews'])){const source=v.meshes.find(m=>m.userData.cadPath?.includes(mesh.userData.sourceCAD));assert.deepEqual(mesh.geometry.attributes.position.array,source.geometry.attributes.position.array,'copied screws retain their source geometry without stretching');assert(mesh.scale.distanceTo(source.scale)<1e-12,'screw placement is a rigid rotation and translation');}
for(const [n,sheet,opposite,carriage,bolts,bearing]of [[8,'leftLinearHolder',379,401,[430,432,434],'leftBearingHolder'],[9,379,'leftLinearHolder',403,[424,426,428],378]]){
 show(n);v.seek(0);
 assert(v.director.resolve([sheet]).every(visible),'prepared sheet stays visible before its later handling operation');
 assert(v.director.resolve([opposite]).every(m=>!visible(m)),'opposite-side holder is absent from the bench');
 assert(v.director.resolve([...bolts,bearing]).every(m=>!visible(m)),'later hardware is hidden until installed');
 assert.equal(v.sceneActors[1].nodes.length,3);assert.equal(v.sceneActors[4].nodes.length,4);
 assert(v.sceneActors[2].handling&&v.sceneActors[2].carry&&v.sceneActors[2].reuse);
 v.seek(.4);v.printer.updateMatrixWorld(true);const fixed=v.sceneActors[2].nodes;
 const anchor=fixed[0],relative=fixed.map(m=>anchor.matrixWorld.clone().invert().multiply(m.matrixWorld));
 for(let k=0;k<101;k++){
  v.seek((2+k/100)/5);v.printer.updateMatrixWorld(true);
  fixed.forEach((m,i)=>{assert(visible(m),'installed parts turn together');const q=anchor.matrixWorld.clone().invert().multiply(m.matrixWorld);assert(q.elements.every((x,j)=>Math.abs(x-relative[i].elements[j])<1e-8),'flip preserves all mating transforms');assert(new T.Box3().setFromObject(m).min.y>-.02,'lift clears the bench throughout the flip');});
 }
 v.seek(1);
 for(const actor of v.sceneActors)for(const m of actor.nodes){assert(m.position.distanceTo(m.userData.restPosition)<1e-8,'completed holder returns to original CAD position');assert(m.quaternion.clone().normalize().angleTo(m.userData.restQuaternion.clone().normalize())<1e-7,'completed holder returns to original CAD orientation');}
 for(const ai of [0,1,3,4]){v.seek((ai+.8)/5);v.manualCamera=false;v.focusOperation(ai,true);const expected=ai===3?v.sceneActors[3].axis[0]:v.sceneActors[0].axis[0];assert(Math.sign(v.camera.position.x-v.controls.target.x)===Math.sign(expected),'guided camera shows the active installation side');}
 v.seek(.43);const before=fixed.map(m=>[m.visible,...m.position.toArray(),...m.quaternion.toArray()]);v.seek(1);v.seek(.43);assert.deepEqual(fixed.map(m=>[m.visible,...m.position.toArray(),...m.quaternion.toArray()]),before,'turnover scrubs reversibly');
}
for(const n of [10,12,36,74]){show(n);v.seek(1);for(const key of ['leftLinearHolder','leftBearingHolder','leftBearingScrews'])assert(v.director.resolve([key]).every(visible),'left subassembly transfers with installed hardware');}
show(1);assert(v.director.resolve(['leftLinearHolder','leftBearingHolder','leftBearingScrews']).every(m=>!visible(m)),'new hardware does not appear before preparation');
console.log('PASS: actual CAD left/right ownership, three carriage/four bearing screws, hidden future hardware, rigid raised turnover, bench clearance, source end poses, per-operation camera sides, reversible seeking and downstream assembly transfers.');
