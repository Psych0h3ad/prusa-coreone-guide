import assert from 'node:assert/strict';import fs from 'node:fs';
import * as T from '../dist/vendor/three.module.js';
import {v}from './check-viewer.mjs';
import{SERVICE_TASKS}from '../dist/maintenance-data.js';import{installMaintenanceModel,maintenanceSceneSpec}from '../dist/maintenance-model.js';
import{XBUDDY_TASK}from '../dist/xbuddy-service-data.js';import{XBUDDY_SOURCE}from '../dist/xbuddy-service-source.js';import{XBUDDY_HARDWARE as H}from '../dist/xbuddy-service-model.js';
const official=JSON.parse(fs.readFileSync('research/quality/service-20261105-52/guide-908859.json','utf8'));
assert.equal(XBUDDY_TASK.steps.length,34);assert.deepEqual(XBUDDY_SOURCE.steps.map(s=>s.id),official.steps.map(s=>s.id));
for(const s of XBUDDY_TASK.steps){for(const k of['title','body']){assert.equal(s[k].length,4);assert(s[k].every(x=>x.length>3));}assert(!s.body.some(x=>x.includes('Your text goes here')));}
assert.equal(XBUDDY_TASK.steps[31].supplementalSources.length,2,'NFC restoration is cross-referenced to official assembly');
const pdfMap=JSON.parse(fs.readFileSync('research/quality/service-20261105-54/official-xbuddy-pdf-map.json','utf8'));
assert.equal(XBUDDY_TASK.pdf,pdfMap.url);
for(const[s,i]of XBUDDY_TASK.steps.map((s,i)=>[s,i])){const o=XBUDDY_SOURCE.steps[i];assert.equal(o.number,i+2,'live Web guide includes Begin assembly as step1');assert.equal(o.pdfNumber,s.number);assert.equal(s.page,pdfMap.pages[s.number].page);assert.equal(o.title.replace(/\s+/g,' ').trim().toLowerCase(),pdfMap.pages[s.number].title.replace(/\s+/g,' ').trim().toLowerCase(),'PDF page is anchored to the matching official task title');}
assert(!SERVICE_TASKS.some(t=>t.id==='xbuddy'),'unfinished service workflow is not offered in the public task picker');
let language=0;const binding=installMaintenanceModel(v,[...SERVICE_TASKS,XBUDDY_TASK],a=>a[language]);
const choose=(n,p=0)=>{v.setState({flow:'service',index:binding.indexOf('xbuddy',n-1),comparison:'after',explore:false,variant:'screw',completed:[]});v.autoplayPending=false;v.seek(p);};
const snapshot=refs=>v.director.resolve(refs).map(m=>({m,p:[...m.position.toArray(),...m.quaternion.toArray()]}));
const same=(rows,reason)=>{for(const{m,p}of rows)assert.deepEqual([...m.position.toArray(),...m.quaternion.toArray()],p,reason);};
const bounds=refs=>{v.printer.updateMatrixWorld(true);const b=new T.Box3(),p=new T.Vector3(),inverse=v.printer.matrixWorld.clone().invert();for(const m of v.director.resolve(refs)){const M=inverse.clone().multiply(m.matrixWorld),a=m.geometry.attributes.position;for(let i=0;i<a.count;i++)b.expandByPoint(p.fromBufferAttribute(a,i).applyMatrix4(M).multiplyScalar(1000));}return b;};
choose(10,0);const zrSource=snapshot(['splitterZRPlug']);choose(10,1);const zrParked=snapshot(['splitterZRPlug']);
for(const n of[11,12,15,18,25,26]){choose(n,0);same(zrParked,'unplugged ZR stays parked until reconnection');}
choose(26,1);same(zrSource,'ZR returns to its original mating datum');
choose(11,0);const peSource=snapshot(['feGroundRing','feGroundWasher','feGroundScrew']);choose(11,1);const peParked=snapshot(['feGroundRing']);
for(const n of[12,15,18,24,25]){choose(n,0);same(peParked,'PE lug stays parked until its fitting step');}
choose(25,1);same(peSource,'PE ring, washer and screw return to their original datums');
let zrLengthResidual=0,peLengthResidual=0;
for(const n of[10,11,25,26])for(let k=0;k<=64;k++){choose(n,k/64);zrLengthResidual=Math.max(zrLengthResidual,Math.abs(v.splitterHardware.j6Length-730));peLengthResidual=Math.max(peLengthResidual,Math.abs(v.feHardware.leadLength-110));}
assert(zrLengthResidual<.01&&peLengthResidual<.001,'parked plugs pay out existing illustrative slack instead of stretching wires');
choose(5,1);assert(Math.abs(bounds(['serviceNozzle']).min.z-bounds(['sheet']).max.z-100.5)<1e-6);
const bed=snapshot(['bedSupport','heatbed','sheet']);for(const n of[6,15,18,31,34]){choose(n,0);same(bed,'bed remains lowered throughout repair');}
choose(6,1);const rear=snapshot([H.rear]);choose(7,0);same(rear,'rear cover removal starts in its released pose');
choose(15,0);const extension=snapshot(['xBuddyExtension',171,173,175,177]),source=snapshot(['xBuddy','thermalPads']);
assert.equal(v.sceneActors.length,6);assert(v.sceneActors.slice(0,5).every(a=>a.nodes.length===1));
assert(v.sceneActors[5].nodes.every(m=>['xBuddy','thermalPads','xbNfcSocket'].includes(m.userData.part)),'only the main board, its NFC socket and pads leave the enclosure');
for(const p of[.1,.4,.7,.99]){choose(15,p);same(extension,'extension board and all four fixings stay in place');}
choose(15,1);const bench=snapshot(['xBuddy','thermalPads']);choose(16,0);same(bench,'replacement preparation retains the board bench pose');
assert(v.meshes.filter(m=>m.visible).every(m=>['xBuddy','xbNfcSocket'].includes(m.userData.part)),'replacement preparation isolates the new mainboard and its NFC socket');
choose(17,0);assert.equal(v.sceneActors.length,3);assert(v.sceneActors.every(a=>a.nodes.length===1));assert(v.sceneActors[0].nodes[0].visible);assert(v.sceneActors.slice(1).every(a=>!a.nodes[0].visible),'later pads wait for their turn');
choose(17,1);same(bench,'pads finish at the shared board datum');choose(18,0);same(bench,'installation starts where pad preparation finished');
for(const n of[16,17]){choose(n,1);v.printer.updateMatrixWorld(true);const board=v.director.resolve(['xBuddy'])[0],back=new T.Vector3(0,-1,0).transformDirection(board.matrixWorld);assert(back.y>.999,'pad preparation places the board backside up for an unobstructed view');}
choose(18,1);same(source,'reinstalled board and pads recover the source mounting datum');assert(v.director.resolve([189]).every(m=>!m.visible),'lower-right original PE screw stays excluded');
choose(15,(5+.37)/6);const midway=snapshot(['xBuddy','thermalPads']);choose(18,(1-.37)/6);for(const{m,p}of midway)for(const[k,x]of[...m.position.toArray(),...m.quaternion.toArray()].entries())assert(Math.abs(p[k]-x)<1e-12,'board installation retraces the removal path');
choose(15,.94);const translated=snapshot(['xBuddy','thermalPads']),progress=v.operationProgress,camera=v.camera.position.clone();for(language of[1,2,3,0]){binding.localize();v.localize();same(translated,'language retains the board pose');assert.equal(v.operationProgress,progress);assert(v.camera.position.equals(camera));}
const pending=XBUDDY_TASK.steps.flatMap((s,i)=>maintenanceSceneSpec(XBUDDY_TASK,i,a=>a[0]).pendingOperations.map(action=>({step:i+1,action})));
assert(pending.length>0,'the development audit must continue to flag unimplemented wiring and accessories');
const reportDir=process.env.PRUSA_QA_DIR||'research/quality/latest';fs.mkdirSync(reportDir,{recursive:true});fs.writeFileSync(reportDir+'/workflow-check.json',JSON.stringify({steps:34,languages:4,pdfPages:34,zrLengthResidual_mm:zrLengthResidual,peLengthResidual_mm:peLengthResidual,pending,physicalClearance:'INCOMPLETE. Mainboard/case paths sampled; other wiring, Wi-Fi and source cover/nut contacts remain unresolved. ZR/PE parking has length and handover checks, not full routing clearance.'},null,2));
console.log('PASS:34 official source anchors and four-language notes; mainboard/pad handovers, five board screws, fixed extension board, bed datum, reverse path and language retention. DEVELOPMENT ONLY:',pending.length,'unimplemented operations remain; not a completed maintenance or clearance claim.');
