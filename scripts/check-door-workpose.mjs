import assert from 'node:assert/strict';
import * as T from '../dist/vendor/three.module.js';
import {v} from './check-viewer.mjs';
import {FLOWS} from '../dist/data.js';
const show=(n,variant='screw')=>{v.setState({flow:'build',index:FLOWS.build.steps.findIndex(s=>s.chapter===7&&s.officialStep===n),variant,comparison:'after',explore:false,completed:[]});v.autoplayPending=false;};
const meshes=()=>v.director.resolve([572,590]);
show(38);v.seek(1);v.scene.updateMatrixWorld(true);const prior=meshes().map(m=>m.matrixWorld.clone());
show(39);v.seek(0);v.scene.updateMatrixWorld(true);
meshes().forEach((m,i)=>assert(m.matrixWorld.elements.every((x,k)=>Math.abs(x-prior[i].elements[k])<1e-8),'38→39 begins in the same bench pose'));
let probes=0,minHeight=Infinity;
for(let i=0;i<=128;i++){
 v.seek(i/128);v.scene.updateMatrixWorld(true);
 const panel=meshes()[0],relative=panel.matrixWorld.clone().invert().multiply(meshes()[1].matrixWorld);
 if(i===0)v.testHandleRelative=relative;
 assert(relative.elements.every((x,k)=>Math.abs(x-v.testHandleRelative.elements[k])<1e-8),'handle remains registered to the panel');
 for(const m of meshes()){const box=new T.Box3().setFromObject(m,true);minHeight=Math.min(minHeight,box.min.y);assert(box.min.y>=-.001,'door stays above the desk throughout the lift');probes++;}
}
const uprightSize=new T.Box3().setFromObject(meshes()[0],true).getSize(new T.Vector3());assert(uprightSize.y>360&&uprightSize.x<3.05&&uprightSize.z>460,'finished door is upright with its handle edge horizontal (source CAD thickness 3.012 mm)');
v.seek(.57);const middle=meshes().map(m=>[...m.position.toArray(),...m.quaternion.toArray()]);v.seek(.02);v.seek(.57);assert.deepEqual(meshes().map(m=>[...m.position.toArray(),...m.quaternion.toArray()]),middle);
show(39,'glued');assert.equal(v.sceneActors.length,0,'screw-handle lift does not run on the glued branch');
console.log(`PASS: continuous 38→39 bench handoff, registered handle, upright final door, reversible scrubbing, glued-branch exclusion; ${probes} exact mesh/desk probes, minimum height ${minHeight} mm.`);
