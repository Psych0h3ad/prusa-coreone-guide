import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from '../dist/vendor/three.module.js';
import {v} from './check-viewer.mjs';
import {FLOWS} from '../dist/data.js';
const show=n=>{v.setState({flow:'build',index:FLOWS.build.steps.findIndex(s=>s.chapter===7&&s.officialStep===n),variant:'screw',comparison:'after',explore:false,completed:[]});v.autoplayPending=false;};
const mesh=id=>v.director.resolve([id])[0],has=id=>mesh(id)?.visible;
const spec=JSON.parse(fs.readFileSync('dist/assets/door/manifest.json'));
show(27);for(const id of [82,275])assert(has(id));for(const id of [233,235,221,223,'doorMagnetLower','doorMagnetUpper',302,303,304])assert(!has(id));
for(const id of [82,275])assert.equal(mesh(id).material.userData.finish,'polymer');
show(28);assert.equal(v.sceneActors.length,4);assert.deepEqual(v.sceneActors.map(a=>a.nodes.map(m=>m.userData.cadIndex||m.userData.part)),[[235],[233],['doorMagnetLower'],['doorMagnetUpper']]);
assert.equal(v.printer.rotation.x,0,'lay the holders flat with the thread hole facing upward');
const a=mesh(82),b=mesh(275);assert(Math.abs((a.userData.sceneRestPosition.x-a.userData.restPosition.x)*1000-38)<1e-8);assert(Math.abs((a.userData.sceneRestPosition.z-a.userData.restPosition.z)*1000+330)<1e-8);
assert.deepEqual(mesh(235).userData.assemblyOffset,[0,.2,0]);
let probes=0;
for(let i=0;i<=128;i++){
 v.seek(i/128);v.scene.updateMatrixWorld(true);
 for(const m of v.meshes.filter(m=>m.visible&&m.parent.visible)){assert(new T.Box3().setFromObject(m,true).min.y>=-.01,'bench work never crosses the work surface');probes++;}
}
v.seek(.24);assert(has(235)&&!has(233)&&!has('doorMagnetLower'));
v.seek(.49);assert(has(233)&&!has('doorMagnetLower'));
v.seek(.74);assert(has('doorMagnetLower')&&!has('doorMagnetUpper'));
v.seek(1);for(const id of [82,275,233,235,'doorMagnetLower','doorMagnetUpper'])assert(has(id));
show(29);assert.equal(v.sceneActors.length,4);assert.deepEqual(v.sceneActors.map(a=>a.nodes.map(m=>m.userData.cadIndex||m.userData.part).sort()),[[235,275,'doorMagnetLower'].sort(),[223],[82,233,'doorMagnetUpper'].sort(),[221]]);
assert.equal(v.sceneActors[0].distance,3.5,'lower alignment stays clear of the bed mount');
assert(v.sceneActors.every(a=>!a.nodes.some(m=>m.userData.cadPath?.includes(301))),'existing bezel magnet ownership is unchanged');
assert(v.sceneActors[0].camera==='holder-inside-perspective'&&v.sceneActors[2].camera==='holder-inside-perspective','show body alignment from inside');
v.seek(.125);v.focusOperation(0,true);v.scene.updateMatrixWorld(true);v.camera.updateMatrixWorld(true);
const body=mesh(275),vertices=body.geometry.attributes.position,ray=new T.Raycaster();let visibleSamples=0,totalSamples=0;
for(let i=0;i<vertices.count;i+=Math.ceil(vertices.count/100)){
 const point=new T.Vector3().fromBufferAttribute(vertices,i).applyMatrix4(body.matrixWorld);ray.set(v.camera.position,point.sub(v.camera.position).normalize());
 const first=ray.intersectObjects(v.meshes.filter(m=>m.visible&&m.parent.visible&&!m.userData.glass),false)[0];if(first?.object===body)visibleSamples++;totalSamples++;
}assert(visibleSamples/totalSamples>.8,'the guided lower-holder view clears the Z rod and bed mount without hiding them');
v.seek(.49);assert(has(223)&&!has(82)&&!has(221),'complete lower holder before introducing the upper holder');
v.seek(1);v.scene.updateMatrixWorld(true);for(const id of [82,275,233,235,221,223,'doorMagnetLower','doorMagnetUpper'])assert(has(id));
const inv=v.printer.matrixWorld.clone().invert();
for(const item of spec.screws.instances){
 const m=mesh(item.cadIndex);assert.equal(m.userData.underheadLength,5);const M=inv.clone().multiply(m.matrixWorld),g=m.geometry.clone().applyMatrix4(M).scale(1000,1000,1000),placement=new T.Matrix4().set(...item.placement.flat());g.applyMatrix4(placement.invert());g.computeBoundingBox();assert(Math.abs(g.boundingBox.max.x-5)<.0001);assert(Math.abs(g.boundingBox.min.x+1.65)<.0001);g.dispose();
}
v.seek(.17);v.scene.updateMatrixWorld(true);const poses=new Map(v.meshes.filter(m=>m.visible).map(m=>[m,m.matrix.clone()]));v.seek(.83);v.seek(.17);v.scene.updateMatrixWorld(true);for(const [m,M]of poses)assert(m.matrix.elements.every((x,i)=>Math.abs(x-M.elements[i])<1e-8),'seeking backward restores exact mesh poses');
console.log(`PASS: door-holder hardware identity, four-stage bench assembly, two separate installations, actual 5 mm screws, source nuts, matching polymer finish, future-part exclusion, reversible seeking and ${probes} bench mesh/pose probes. No GPU or swept-clearance certification.`);
