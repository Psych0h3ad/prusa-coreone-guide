import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from 'three';
import {v} from './check-viewer.mjs';
import {FLOWS} from '../dist/data.js';
import {syncPartMarkings} from '../dist/part-markings.js';

const marking=v.partMarkings.find(r=>r.glassPrint),{parent,ink}=marking;
assert.equal(parent.userData.cadIndex,572);
assert.equal(ink.length,12);
const original=parent.geometry.attributes.position.array.slice();
const native=parent.matrix.clone(),local=ink.map(m=>m.matrix.clone());
const plus=ink.filter(m=>m.userData.plusOnly);
assert.equal(plus.length,1);
let poses=0,maximumFollowErrorMM=0,hiddenCases=0;
for(const [flow,index]of [['build',0],['upgrade',36],['upgrade',37],['upgrade',38]]){
 v.setState({flow,index,completed:[],comparison:'after',explore:false});
 v.playing=false;v.autoplayPending=false;
 for(const angle of [0,-Math.PI/4,-Math.PI/2]){
  v.applyDoorPose(angle);v.scene.updateMatrixWorld(true);v.applyMaterials();
  for(const [i,m]of ink.entries()){
   assert(m.parent===parent&&!v.meshes.includes(m));
   assert.deepEqual(m.matrix.toArray(),local[i].toArray());
   const p=new T.Vector3().fromBufferAttribute(m.geometry.attributes.position,0);
   maximumFollowErrorMM=Math.max(maximumFollowErrorMM,p.clone().applyMatrix4(parent.matrixWorld).distanceTo(p.clone().applyMatrix4(m.matrixWorld)));
   assert(m.material.side===T.FrontSide&&m.material.depthTest);
   assert(m.material.opacity===1,'ink is opaque on clear glass');
  }
  assert.equal(plus[0].visible,flow==='build'||index>=37);
  assert(ink.filter(m=>!m.userData.plusOnly).every(m=>m.visible),'normal glass opacity keeps printing');
  poses++;
 }
 v.setGhost(true);assert(ink.every(m=>!m.visible),'exterior cutaway hides print');hiddenCases++;
 v.setGhost(false);assert(ink.some(m=>m.visible));
 v.state.comparison='before';syncPartMarkings(v.partMarkings,v.state);
 assert(!plus[0].visible,'original CORE One has no plus');
 v.state.comparison='after';
}
assert.deepEqual(parent.geometry.attributes.position.array,original);
assert(maximumFollowErrorMM<1e-8);
for(const m of ink){
 const positions=m.geometry.attributes.position;
 for(let i=0;i<positions.count;i++){
  const p=new T.Vector3().fromBufferAttribute(positions,i).applyMatrix4(native).multiplyScalar(1000);
  assert(Math.abs(p.y+210.012)<.00005,'ink lies on outside glass plane');
  assert(p.x>-153&&p.x<-131&&p.z>55&&p.z<443,'printing stays inside official photograph region');
 }
}
const report={status:'PASS',poses,hiddenCases,paths:ink.length,maximumFollowErrorMM,glassPrint:true,backFaceCulling:true,nativeSurfaceUnchanged:true,plusBeforeUpgrade:false,plusAfterSticker:true,scope:'CAD-attached ink and nominal photograph placement only; not measured artwork dimensions or mechanical approval'};
if(process.env.DOOR_MARKING_REPORT)fs.writeFileSync(process.env.DOOR_MARKING_REPORT,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
