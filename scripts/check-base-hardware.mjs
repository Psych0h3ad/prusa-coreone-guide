import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from '../dist/vendor/three.module.js';
import {v} from './check-viewer.mjs';
import {FLOWS} from '../dist/data.js';
import {BASE_PIN_DATUM} from '../dist/base-hardware.js';
const show=n=>{v.setState({flow:'build',index:FLOWS.build.steps.findIndex(s=>s.chapter===1&&s.officialStep===n),variant:'screw',comparison:'after',explore:false,completed:[]});v.autoplayPending=false;};
const pins=['baseSpacerPinFront','baseSpacerPinRear'];
show(14);assert(pins.every(id=>v.director.resolve([id]).every(m=>!m.visible)),'pins must not appear before official2.15');
show(15);assert.equal(v.sceneActors.length,2);assert(v.sceneActors.every(a=>a.axis[2]===-1),'pins enter from the outer face');
const buffers=pins.map(id=>v.director.resolve([id])[0].geometry.attributes.position.array);
let radialProbes=0;
for(let i=0;i<=128;i++){
 v.seek(i/128);v.scene.updateMatrixWorld(true);
 for(const [j,id]of pins.entries())for(const m of v.director.resolve([id])){
  assert.equal(m.geometry.attributes.position.array,buffers[j],'scrubbing reuses the pin buffers');
  const a=m.geometry.attributes.position;
  for(let k=0;k<a.count;k++){
   const z=(a.getZ(k)+m.position.z)*1000;
   if(z>BASE_PIN_DATUM.bottom+1e-4&&z<BASE_PIN_DATUM.top-1e-4){assert(Math.hypot(a.getX(k),a.getY(k))*1000<BASE_PIN_DATUM.holeRadius-.1,'latch fits through the measured CAD bore');radialProbes++;}
  }
 }
}
v.seek(.47);const snapshot=pins.map(id=>Array.from(v.director.resolve([id])[0].geometry.attributes.position.array));v.seek(1);v.seek(.47);assert.deepEqual(pins.map(id=>Array.from(v.director.resolve([id])[0].geometry.attributes.position.array)),snapshot,'latch deflection is reversible');
for(let n=11;n<=17;n++){show(n);assert(new T.Vector3(0,0,-1).transformDirection(v.printer.matrixWorld).y>.999,'the bottom-frame working face points upward');}
show(18);assert.equal(v.sceneActors.length,2);assert(v.sceneActors[0].nodes.filter(m=>pins.includes(m.userData.part)).length===2,'installed pins travel with the frame');assert(v.sceneActors[1].scope==='base','turn the frame before lowering the panel');
let floorProbes=0,minY=Infinity;
for(let i=0;i<=128;i++){
 v.seek(i/128);v.scene.updateMatrixWorld(true);
 for(const m of v.meshes.filter(m=>m.visible&&m.parent.visible)){
  const b=new T.Box3().setFromObject(m,true);minY=Math.min(minY,b.min.y);assert(b.min.y>-.1,`turnover crosses the bench: ${m.userData.cadIndex||m.userData.part} ${b.min.y}`);floorProbes++;
 }
}
const expected={12:[125],13:[119],14:[121,123],19:[289,291],20:[293,296,297,300,285,288]},visibility=[];
for(const [n,ids]of Object.entries(expected)){
 show(+n);v.seek(1);v.scene.updateMatrixWorld(true);
 const screws=v.sceneActors.filter(a=>a.nodes.some(m=>ids.includes(m.userData.cadIndex)));
 assert.deepEqual(screws.map(a=>a.nodes[0].userData.cadIndex),ids,'official side and corner order');
 for(const actor of screws){
  const i=v.sceneActors.indexOf(actor);v.focusOperation(i,true);v.scene.updateMatrixWorld(true);v.camera.updateMatrixWorld(true);
  const axis=new T.Vector3(...actor.axis).transformDirection(v.printer.matrixWorld),vertices=[];
  for(const m of actor.nodes){const a=m.geometry.attributes.position;for(let k=0;k<a.count;k++)vertices.push(new T.Vector3().fromBufferAttribute(a,k).applyMatrix4(m.matrixWorld));}
  const tip=Math.max(...vertices.map(p=>p.dot(axis))),head=vertices.filter(p=>p.dot(axis)>tip-.08),center=head.reduce((p,q)=>p.add(q),new T.Vector3()).divideScalar(head.length);
  const d=center.clone().sub(v.camera.position),ray=new T.Raycaster(v.camera.position,d.clone().normalize(),0,d.length()-.2);
  const occluders=v.meshes.filter(m=>m.visible&&m.parent.visible&&!actor.nodes.includes(m)&&!m.userData.flexId),hits=ray.intersectObjects(occluders,false);
  assert(!hits.length,`screw head ${actor.nodes[0].userData.cadIndex} hidden by ${hits[0]?.object.userData.cadIndex}`);visibility.push({step:+n,screw:actor.nodes[0].userData.cadIndex,headRayClear:true});
 }
}
const report={radialProbes,floorProbes,minY,visibility,scope:'Finite rendered pin bore samples, workbench bounds and screw-head center rays. Pin shape and latch deflection are illustrative; no mechanical snap-force or thread-fit certification.'};
fs.mkdirSync('research/quality/base-20261104-32',{recursive:true});fs.writeFileSync('research/quality/base-20261104-32/runtime-check.json',JSON.stringify(report,null,2));console.log('PASS: official corner/side order, pin staging and bore clearance, reversible deflection, frame turnover, bench clearance and unobstructed screw-head centers. '+JSON.stringify({radialProbes,floorProbes,minY,headRays:visibility.length}));
