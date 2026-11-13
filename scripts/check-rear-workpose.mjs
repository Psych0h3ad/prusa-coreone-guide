import assert from 'node:assert/strict';import fs from 'node:fs';import * as T from 'three';
import {v}from './check-viewer.mjs';import {FLOWS}from '../dist/data.js';
import {REAR_SUPPORT}from '../dist/rear-workpose.js';
const rows=[];
for(let step=37;step<=46;step++){
 v.setState({flow:'build',index:FLOWS.build.steps.findIndex(s=>s.chapter===2&&s.officialStep===step),variant:'screw',comparison:'after',completed:[],explore:false});v.autoplayPending=false;v.seek(1);v.printer.updateMatrixWorld(true);
 assert.equal(v.operationScene.plan.pose,'printer-back');
 assert(new T.Vector3(0,1,0).transformDirection(v.printer.matrixWorld).y<-.999999,'rear faces down toward the supports');
 assert(v.rearSupports.visible);
 const padBounds=new T.Box3().setFromObject(v.rearSupports);
 assert(Math.abs(padBounds.min.y)<1e-6,'supports stay on the desk');
 const probe=new T.Vector3(REAR_SUPPORT.postX,REAR_SUPPORT.contactY,80).multiplyScalar(.001).applyMatrix4(v.printer.matrixWorld);
 assert(Math.abs(probe.y-REAR_SUPPORT.height)<1e-6,'rear post contacts the support top');
 let minimumHardwareY=Infinity,rigidCount=0;
 for(const m of v.meshes)if(m.visible&&m.userData.cadIndex!==undefined&&!m.userData.flexId){const b=new T.Box3().setFromObject(m);minimumHardwareY=Math.min(minimumHardwareY,b.min.y);rigidCount++;}
 assert(rigidCount>100&&Number.isFinite(minimumHardwareY),'desk gap must cover actual stage-present original CAD');
 assert(minimumHardwareY>20,'source hardware stays off the desk');
 if(step===37){
  const inverse=v.printer.matrixWorld.clone().invert();
  for(const block of v.rearSupports.children){let contact=-Infinity;const centre=block.position.clone().multiplyScalar(1000);
   for(const post of v.meshes.filter(m=>[38,42,66].includes(m.userData.cadIndex))){const matrix=inverse.clone().multiply(post.matrixWorld),a=post.geometry.attributes.position,q=new T.Vector3();
    for(let i=0;i<a.count;i++){q.fromBufferAttribute(a,i).applyMatrix4(matrix).multiplyScalar(1000);if(Math.abs(q.x-centre.x)<22&&Math.abs(q.z-centre.z)<37)contact=Math.max(contact,q.y);}
   }
   console.log(JSON.stringify({supportSourceXZMM:[centre.x,centre.z],actualPostContactYMM:contact,blockContactYMM:REAR_SUPPORT.contactY}));
   assert(Number.isFinite(contact)&&Math.abs(contact-REAR_SUPPORT.contactY)<.1,`actual rear-frame vertices contact each foam block: ${contact}`);
  }
 }
 const direction=v.camera.position.clone().sub(v.controls.target);
 // Official3.39 mounts the PCB from inside the frame; its reverse view is
 // intentionally on the other side of the base from the routing steps.
 assert(step===39?direction.z<0:direction.z>0,`step${step}: working camera sees the manual's working face`);
 rows.push({step,rearNormalY:-1,supportBottomYMM:padBounds.min.y,rigidCount,hardwareDeskGapMM:minimumHardwareY,cameraZ:direction.z});
}
for(const step of[36,47,48,49]){
 v.setState({flow:'build',index:FLOWS.build.steps.findIndex(s=>s.chapter===2&&s.officialStep===step),variant:'screw',comparison:'after',completed:[],explore:false});v.autoplayPending=false;
 assert(!v.rearSupports.visible,'support blocks only appear while the printer rests on its back');
}
console.log(JSON.stringify({status:'PASS',steps:rows,scope:'Actual full CAD runtime, source rear-post contact datum, electronics desk gap, continuous step37–46 workpose and corrected camera hemisphere. Does not certify all wire motion or support-material deformation.'}));
