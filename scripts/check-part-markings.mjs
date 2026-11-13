import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from 'three';
import {v} from './check-viewer.mjs';
import {FLOWS} from '../dist/data.js';
import {syncPartMarkings} from '../dist/part-markings.js';

const [{parent,ink}]=v.partMarkings;
assert.equal(parent.userData.cadIndex,816);
assert.equal(ink.length,11);
assert(ink.every(m=>m.parent===parent&&!v.meshes.includes(m)));
const originalPosition=parent.geometry.attributes.position.array.slice();
const localMatrices=ink.map(m=>m.matrix.toArray());
const visible=m=>{for(let p=m;p;p=p.parent)if(!p.visible)return false;return true;};
let cases=0,maximumFollowErrorMM=0,hiddenCases=0;
for(const [chapter,step]of [[0,1],[5,13],[5,14],[5,15],[5,30],[5,58],[6,23]]){
 const index=FLOWS.build.steps.findIndex(s=>s.chapter===chapter&&s.officialStep===step);
 assert(index>=0);v.setState({flow:'build',index,completed:[],comparison:'after',explore:false});
 v.autoplayPending=false;v.playing=false;
 for(const t of [0,.25,.5,.75,1]){
  v.setProgress(t);v.scene.updateMatrixWorld(true);
  for(const [i,m]of ink.entries()){
   assert.deepEqual(m.matrix.toArray(),localMatrices[i],'marking remains fixed in cover frame');
   const p=new T.Vector3().fromBufferAttribute(m.geometry.attributes.position,0);
   const expected=p.clone().applyMatrix4(parent.matrixWorld),actual=p.clone().applyMatrix4(m.matrixWorld);
   maximumFollowErrorMM=Math.max(maximumFollowErrorMM,expected.distanceTo(actual));
   assert(!visible(m)||visible(parent),'no free-floating ink when cover is hidden');
  }
  if(!visible(parent))hiddenCases++;
  cases++;
 }
}
assert.deepEqual(parent.geometry.attributes.position.array,originalPosition,'native CAD surface is unchanged');
const materials=Array.isArray(parent.material)?parent.material:[parent.material];
const original=materials.map(m=>m.opacity);
for(const m of materials)m.opacity=.08;
syncPartMarkings(v.partMarkings);assert(ink.every(m=>!m.visible),'cutaway must not retain opaque lettering');
materials.forEach((m,i)=>m.opacity=original[i]);syncPartMarkings(v.partMarkings);
assert(ink.every(m=>m.visible),'lettering returns with the solid cover');
assert(ink.every(m=>m.material.depthTest&&m.material.side===T.FrontSide),'back faces and occluders hide surface ink');
assert(maximumFollowErrorMM<1e-8);
const report={status:'PASS',cases,hiddenCases,paths:ink.length,triangles:ink.reduce((s,m)=>s+m.geometry.index.count/3,0),maximumFollowErrorMM,nativeSurfaceUnchanged:true,cutaway:true,backFaceCulling:true};
if(process.env.MARKING_REPORT)fs.writeFileSync(process.env.MARKING_REPORT,JSON.stringify(report,null,2)+'\n');
console.log('PASS: product lettering follows native cover poses, hides with cover/cutaways, preserves CAD surface.',JSON.stringify(report));
