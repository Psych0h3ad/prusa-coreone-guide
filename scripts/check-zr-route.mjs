import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from '../dist/vendor/three.module.js';
import {v} from './check-viewer.mjs';
import {FLOWS} from '../dist/data.js';
import {SERVICE_TASKS} from '../dist/maintenance-data.js';
import {XBUDDY_TASK} from '../dist/xbuddy-service-data.js';
import {installMaintenanceModel} from '../dist/maintenance-model.js';
import {SPLITTER_ZR} from '../dist/stepper-splitter.js';

const binding=installMaintenanceModel(v,[...SERVICE_TASKS,XBUDDY_TASK],a=>a[0]);
const build=(n,p)=>{v.setState({flow:'build',index:FLOWS.build.steps.findIndex(s=>s.chapter===2&&s.officialStep===n),comparison:'after',variant:'screw',explore:false,completed:[]});v.autoplayPending=false;v.seek(p);};
const service=(n,p)=>{v.setState({flow:'service',index:binding.indexOf('xbuddy',n-1),comparison:'after',variant:'screw',explore:false,completed:[]});v.autoplayPending=false;v.seek(p);};
const end=()=>new T.Vector3(...SPLITTER_ZR.end).multiplyScalar(.001).applyQuaternion(v.splitterHardware.zrPlug.quaternion).add(v.splitterHardware.zrPlug.position).multiplyScalar(1000);
const snapshot=()=>v.splitterHardware.wireGroups.map(m=>Array.from(m.geometry.attributes.position.array));
const centres=()=>Array.from({length:129},(_,j)=>{
 const p=new T.Vector3();for(const m of v.splitterHardware.wireGroups)for(let k=0;k<6;k++)p.add(new T.Vector3().fromBufferAttribute(m.geometry.attributes.position,j*7+k));
 return p.multiplyScalar(1000/24);
});
build(48,1);const installed=snapshot();
for(const n of [9,10]){service(n,0);assert.deepEqual(snapshot(),installed,'the same seated harness keeps its shape across assembly and service modes');}
service(10,1);const parked=snapshot();
for(const n of [11,15,18,25,26]){service(n,0);assert.deepEqual(snapshot(),parked,'the loose harness stays parked while other parts are handled');}
service(26,1);assert.deepEqual(snapshot(),installed,'restoration recovers the assembled cable shape');

const continuity=[];
for(const [step,actor,heights] of [[41,0,[6,8]],[48,3,[40,60,80]]]){
 build(step,0);const count=v.sceneActors.length;
 for(const height of heights){
  let lo=0,hi=1,found=false;
  for(let k=1;k<=128;k++){v.seek((actor+k/128)/count);if(end().z>=height-1e-8){lo=(k-1)/128;hi=k/128;found=true;break;}}
  assert(found,`route reaches height ${height}`);
  for(let k=0;k<36;k++){const mid=(lo+hi)/2;v.seek((actor+mid)/count);if(end().z>=height)hi=mid;else lo=mid;}
  const p=(actor+(lo+hi)/2)/count,epsilon=1e-7;
  v.seek(Math.max(actor/count,p-epsilon));const before=centres();
  v.seek(Math.min((actor+1)/count,p+epsilon));const after=centres();
  const jump=Math.max(...before.map((a,i)=>a.distanceTo(after[i])));
  assert(jump<.04,`no centreline pop at ${step}/${height}: ${jump} mm`);
  continuity.push({step,height,progress:p,centrelineDifference_mm:jump});
 }
}
build(48,.7);const reverse=snapshot();v.seek(.99);v.seek(.62);v.seek(.7);assert.deepEqual(snapshot(),reverse,'arbitrary reverse seeks reproduce every strand vertex');
const report={sharedSeatedPose:true,parkedHandovers:true,reverseSeeking:true,continuity,limits:'Centreline continuity and handovers only; sampled triangle collision audits are separate.'};
const reportDir=process.env.PRUSA_QA_DIR||'research/quality/latest';
fs.mkdirSync(reportDir,{recursive:true});
fs.writeFileSync(reportDir+'/zr-route-check.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
