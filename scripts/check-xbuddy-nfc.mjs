import assert from 'node:assert/strict';import fs from 'node:fs';import * as T from '../dist/vendor/three.module.js';
import{v}from './check-viewer.mjs';import{SERVICE_TASKS}from '../dist/maintenance-data.js';import{installMaintenanceModel}from '../dist/maintenance-model.js';import{XBUDDY_TASK}from '../dist/xbuddy-service-data.js';import{NFC_ILLUSTRATIVE_LENGTH}from '../dist/xbuddy-nfc.js';
let language=0;const binding=installMaintenanceModel(v,[...SERVICE_TASKS,XBUDDY_TASK],a=>a[language]);
const choose=(n,p=0)=>{v.setState({flow:'service',index:binding.indexOf('xbuddy',n-1),comparison:'after',explore:false,variant:'screw',completed:[]});v.autoplayPending=false;v.seek(p);};
const pose=m=>[...m.position.toArray(),...m.quaternion.toArray()];const h=v.nfcHardware,buffer=h.wire.geometry.attributes.position.array;
choose(9,0);assert.equal(v.sceneActors.length,4);assert.equal(v.sceneActors[2].nodes[0],h.plug,'official tiny connector is lifted before cover removal');assert(v.sceneActors[3].nodes.includes(h.coil));const startCoil=pose(h.coil),startPlug=pose(h.plug);
const board=v.director.resolve(['xbNfcSocket']);assert(board.length===2);const coilBox=new T.Box3().setFromBufferAttribute(h.coil.geometry.attributes.position);const front=v.director.resolve(['xbNfcPhoto'])[0],combined=coilBox.union(new T.Box3().setFromBufferAttribute(front.geometry.attributes.position));const size=combined.getSize(new T.Vector3()).multiplyScalar(1000);for(const[a,b]of size.toArray().map((a,i)=>[a,[58,1.6,35][i]]))assert(Math.abs(a-b)<1e-4,'original official antenna outline dimensions retained');
let maxLengthError=0,attachmentError=0,minDistantDistance=Infinity;
for(const n of[9,32])for(let k=0;k<=256;k++){
 choose(n,k/256);if(!h.wire.visible)continue;
 maxLengthError=Math.max(maxLengthError,Math.abs(h.centrelineLength-NFC_ILLUSTRATIVE_LENGTH));
 for(const [u,point,m]of[[0,h.start,h.plug],[1,h.end,h.coil]]){const expected=new T.Vector3(...point).multiplyScalar(.001).applyQuaternion(m.quaternion).add(m.position).multiplyScalar(1000);attachmentError=Math.max(attachmentError,expected.distanceTo(h.route.getPointAt(u)));}
 const samples=Array.from({length:97},(_,i)=>h.route.getPointAt(i/96));for(let i=0;i<samples.length;i++)for(let j=i+5;j<samples.length;j++)minDistantDistance=Math.min(minDistantDistance,samples[i].distanceTo(samples[j]));
 assert.equal(h.wire.geometry.attributes.position.array,buffer,'coax reuses its vertex buffer');
}
assert(maxLengthError<.003,'illustrative coax pays out its loop rather than stretching');assert(attachmentError<1e-7);assert(minDistantDistance>1.1,'distant portions of the sampled coax do not fold through each other');
choose(9,1);assert(!h.coil.visible&&!h.plug.visible&&!h.wire.visible,'the disconnected antenna assembly is removed together');
for(const n of[10,15,18,25,31]){choose(n);assert(!h.coil.visible&&!h.plug.visible&&!h.wire.visible);}
choose(32,.1);assert(v.director.resolve([206]).every(m=>!m.visible),'the later box cover must not obscure the tiny NFC connection');
choose(32,5.5/12);assert(v.director.resolve([206]).some(m=>m.visible),'the box cover appears during its own fitting operation');
choose(32,1);assert.deepEqual(pose(h.coil),startCoil);assert.deepEqual(pose(h.plug),startPlug);assert(h.wire.visible);const endRoute=h.wire.geometry.attributes.position.array.slice();
for(const p of[.15,.8,.3,.94,0,1])choose(32,p);assert.deepEqual(h.wire.geometry.attributes.position.array,endRoute,'random/reverse seeks restore the same final coax');
choose(32,.2);const progress=v.operationProgress,camera=v.camera.position.clone(),held=pose(h.coil);for(language of[1,2,3,0]){binding.localize();v.localize();assert.deepEqual(pose(h.coil),held);assert.equal(v.operationProgress,progress);assert(v.camera.position.equals(camera));}
v.setState({flow:'build',index:0,comparison:'after',explore:false,variant:'screw',completed:[]});assert(h.meshes.every(m=>!m.visible),'unpublished service additions do not leak into the assembly preview');
const report={stages:[9,32],samples:514,maxLengthError_mm:maxLengthError,attachmentError_mm:attachmentError,minSampledDistantCentrelineDistance_mm:minDistantDistance,illustrativeLength_mm:NFC_ILLUSTRATIVE_LENGTH,bufferReuse:true,reverseSeek:true,languagePoseRetention:true,limits:'CAD antenna outline/thickness retained. Connector and coax details are illustrative; sampled tests do not certify manufactured fit or continuous clearance.'};
const reportDir=process.env.PRUSA_QA_DIR||'research/quality/latest';fs.mkdirSync(reportDir,{recursive:true});fs.writeFileSync(reportDir+'/nfc-check.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
