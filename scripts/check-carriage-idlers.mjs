import assert from 'node:assert/strict';
import fs from 'node:fs';
import {registerHooks} from 'node:module';
registerHooks({resolve(s,c,next){return s==='three'?{url:new URL('../dist/vendor/three.module.js',import.meta.url).href,shortCircuit:true}:next(s,c);}});
const {v}=await import('./check-viewer.mjs');
const {FLOWS}=await import('../dist/data.js');
const T=await import('../dist/vendor/three.module.js');
const manifest=JSON.parse(fs.readFileSync('dist/assets/corexy/manifest.json'));
const visible=m=>m.visible&&m.parent.visible;
const show=n=>{v.setState({flow:'build',index:FLOWS.build.steps.findIndex(s=>s.chapter===4&&s.officialStep===n),completed:[],comparison:'after',explore:false,variant:'screw'});v.autoplayPending=false;};
const all=manifest.idler.instances.map(p=>p.key);
for(const spec of manifest.idler.solids){
 const nodes=v.meshes.filter(m=>all.includes(m.userData.part)&&m.userData.sourceSolid===spec.solid);assert.equal(nodes.length,4);
 assert(nodes.every(m=>m.geometry===nodes[0].geometry&&m.scale.equals(new T.Vector3(1,1,1))),'four rigid instances share unscaled source surfaces');
 const g=nodes[0].geometry;assert.equal((g.index?.count||g.attributes.position.count)/3,spec.triangles);
 g.computeBoundingBox();const size=g.boundingBox.getSize(new T.Vector3()).multiplyScalar(1000);assert(size.z<9.001&&size.x<17.001&&size.x>7.99,'source dimensions retained');
}
show(7);v.seek(0);assert.equal(v.sceneActors.length,11);assert(v.director.resolve([401,'carriageIdlerL1']).every(visible),'first pulley is staged beside the prepared carriage');assert(v.director.resolve([403,...all.filter(k=>k!=='carriageIdlerL1'),408,410,414,416]).every(m=>!visible(m)),'second carriage and future pulleys/screws are not shown early');
for(const ai of [2,8]){
 v.seek(ai/11);v.printer.updateMatrixWorld(true);const actor=v.sceneActors[ai];assert(actor.handling&&actor.carry&&actor.reuse);assert.equal(actor.nodes.length,5);
 const anchor=actor.nodes.find(m=>m.userData.cadIndex===402||m.userData.cadIndex===404),relative=actor.nodes.map(m=>anchor.matrixWorld.clone().invert().multiply(m.matrixWorld));
 for(let k=0;k<=120;k++){
  v.seek((ai+k/120)/11);v.printer.updateMatrixWorld(true);
  for(const [i,m]of actor.nodes.entries()){assert(visible(m));const transform=anchor.matrixWorld.clone().invert().multiply(m.matrixWorld);assert(transform.elements.every((x,j)=>Math.abs(x-relative[i].elements[j])<1e-8),'installed pulley, bearing and screw remain rigid while turning');assert(new T.Box3().setFromObject(m).min.y>-.02,'raised turn clears the bench');}
 }
}
v.seek(.83);const frame=v.meshes.map(m=>[m.visible,...m.position.toArray(),...m.quaternion.toArray()]);v.seek(0);v.seek(1);v.seek(.83);assert.deepEqual(v.meshes.map(m=>[m.visible,...m.position.toArray(),...m.quaternion.toArray()]),frame,'carriage sequence seeks reversibly');
for(const [width,height]of [[320,360],[390,530],[430,580],[844,180]]){
 v.camera.aspect=width/height;v.camera.updateProjectionMatrix();
 for(let ai=0;ai<11;ai++)for(const t of [0,.5,.999]){
  v.seek((ai+t)/11);v.manualCamera=false;v.focusOperation(ai,true);v.scene.updateMatrixWorld(true);v.camera.updateMatrixWorld(true);
  const actor=v.sceneActors[ai],context=v.director.resolve(actor.focusRefs).filter(visible);assert.equal(context.length,1);
  for(const mesh of [...actor.nodes,...context].filter(visible)){
   const box=new T.Box3().setFromObject(mesh);
   for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z]){const p=new T.Vector3(x,y,z).project(v.camera);assert(Math.abs(p.x)<.98&&Math.abs(p.y)<.98&&p.z<1,'active hardware and its complete carriage fit phone and landscape frames');}
  }
 }
}
for(const [n,keys]of [[8,['carriageIdlerL1','carriageIdlerL2',408,410]],[9,['carriageIdlerR1','carriageIdlerR2',414,416]]]){
 show(n);assert.equal(v.sceneActors[0].nodes.length,9,'prepared carriage transfers with both pulleys and screws');const transferred=new Set(v.sceneActors[0].nodes);assert(v.director.resolve(keys).every(m=>transferred.has(m)));v.seek(1);
 for(const m of v.director.resolve(keys)){assert(visible(m));assert(m.position.distanceTo(m.userData.restPosition)<1e-8);assert(m.quaternion.clone().normalize().angleTo(m.userData.restQuaternion.clone().normalize())<1e-7);}
}
for(const n of [10,12,36,74,83]){show(n);v.seek(1);assert(v.director.resolve([...all,408,410,414,416]).every(visible),'all installed pulley hardware follows downstream assembly');}
show(6);assert(v.director.resolve([...all,408,410,414,416]).every(m=>!visible(m)),'preparation does not install hardware');
console.log('PASS: four official three-solid pulleys; staged parts, eleven operations, raised rigid flips, reversible scrubbing, whole workpiece framing in four viewports, prepared-carriage handoffs and downstream ownership.');
