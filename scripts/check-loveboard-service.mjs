import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from '../dist/vendor/three.module.js';
import {v}from './check-viewer.mjs';
import {SERVICE_TASKS}from '../dist/maintenance-data.js';
import {LOVEBOARD_SOURCE,LOVEBOARD_PDF_PAGES}from '../dist/loveboard-service-source.js';
import {LOVEBOARD_ROUTES}from '../dist/loveboard-service-routing.js';
import {socketCentre}from '../dist/loveboard-layout.js';
import {molexWireEntry}from '../dist/molex-frames.js';
import {installMaintenanceModel}from '../dist/maintenance-model.js';
const plugBounds=e=>{const b=new T.Box3(),p=new T.Vector3(),a=e.geometry.attributes.position;for(let i=a.count-e.shellPosition.length/3;i<a.count;i++)b.expandByPoint(p.fromBufferAttribute(a,i).applyMatrix4(e.mesh.matrixWorld));return b;};
const task=SERVICE_TASKS.find(t=>t.id==='loveboard'),guide=JSON.parse(fs.readFileSync('research/quality/service-20261105-47/guide-958922.json'));
assert.equal(task.steps.length,31);assert.deepEqual(LOVEBOARD_SOURCE.steps.map(s=>s.id),guide.steps.map(s=>s.id));assert.deepEqual(LOVEBOARD_PDF_PAGES,JSON.parse(fs.readFileSync('research/quality/service-20261105-48/pdf-pages.json')));
for(let i=0;i<31;i++){assert.equal(task.steps[i].number,i+1);assert.equal(task.steps[i].page,LOVEBOARD_PDF_PAGES[i]);assert.equal(LOVEBOARD_SOURCE.steps[i].number,i+2);assert(LOVEBOARD_SOURCE.steps[i].images.length);}
assert(LOVEBOARD_SOURCE.translations.cs&&LOVEBOARD_SOURCE.translations.de);assert(!LOVEBOARD_SOURCE.translations.ja,'unfinished official Japanese translation has an explicit English fallback');
let lang=0;const binding=installMaintenanceModel(v,SERVICE_TASKS,a=>a[lang]);
const choose=(n,p=0)=>{v.setState({flow:'service',index:binding.indexOf('loveboard',n-1),comparison:'after',variant:'screw',explore:false,completed:[]});v.autoplayPending=false;v.seek(p);};
const snapshot=refs=>v.director.resolve(refs).map(m=>({m,p:[...m.position.toArray(),...m.quaternion.toArray()],vertices:m.userData.flexId?m.geometry.attributes.position.array.slice():null}));
const same=(rows,reason)=>rows.forEach(({m,p,vertices})=>{assert.deepEqual([...m.position.toArray(),...m.quaternion.toArray()],p,reason);if(vertices)assert.deepEqual(m.geometry.attributes.position.array,vertices,reason);});
const bounds=refs=>{v.printer.updateMatrixWorld(true);const box=new T.Box3(),p=new T.Vector3(),inverse=v.printer.matrixWorld.clone().invert();for(const m of v.director.resolve(refs)){const matrix=inverse.clone().multiply(m.matrixWorld),position=m.geometry.attributes.position;for(let i=0;i<position.count;i++)box.expandByPoint(p.fromBufferAttribute(position,i).applyMatrix4(matrix).multiplyScalar(1000));}return box;};
const nozzleGap=()=>bounds(['serviceNozzle']).min.z-bounds(['sheet']).max.z;
choose(3,1);const raisedBed=snapshot(['bedSupport','heatbed','sheet']);assert(raisedBed.length>3);
assert(Math.abs(nozzleGap()-.5)<1e-6,'procedure begins0.5mm below the nozzle, rather than100mm above an arbitrary source bed pose');
choose(4,0);same(raisedBed,'bed lowering starts at the previous position');assert.equal(v.sceneActors.length,1);
choose(4,1);const loweredBed=snapshot(['bedSupport','heatbed','sheet']);
assert(Math.abs(nozzleGap()-100.5)<1e-6,'service bed position has at least100mm clearance and stays within the build travel');
for(let i=0;i<=64;i++){choose(4,i/64);const gap=nozzleGap();assert(gap>=.5-1e-6&&gap<=100.5+1e-6,'bed lowering stays within the nozzle-referenced range');}
for(let i=0;i<raisedBed.length;i++){const a=raisedBed[i],b=loweredBed[i];assert.equal(a.m,b.m);assert(Math.abs(b.p[2]-a.p[2]+.1)<1e-10,'carrier, heater and sheet lower100mm together');for(const k of[0,1,3,4,5,6])assert.equal(b.p[k],a.p[k]);}
for(const n of[5,14,17,28,30,31,7,5]){choose(n,.37);same(loweredBed,'bed remains lowered across preparation, repair and reverse navigation');}
const rearRefs=[860,875,877,'leftCoverNut'],fixedRefs=[859,886,840,'mountUpperNut','mountLowerNut'];
choose(14,4/6);const fixedRearContext=snapshot(fixedRefs),rearHome=snapshot(rearRefs),mainLead=snapshot(['lbMainLead']);
choose(14,(4+.37)/6);same(fixedRearContext,'rear removal does not move the mount or fixed shroud');same(mainLead,'rear removal does not move or shorten the routed main cable');const rearDuring=snapshot(rearRefs);
choose(18,(1+.63)/6);same(fixedRearContext,'rear refitting does not move fixed parts');same(mainLead,'refitting preserves the routed main cable');
for(const{m,p}of rearDuring)for(const[k,value]of[...m.position.toArray(),...m.quaternion.toArray()].entries())assert(Math.abs(value-p[k])<1e-12,'rear installation retraces removal');
choose(14,(4+.37)/6);same(rearDuring,'rear scrub is independent of navigation history');choose(14,4/6);same(rearHome,'rear cover returns to its original mating pose');
choose(9,1);const hot=snapshot(['hotend',795,807]);assert(hot.every(({m})=>m.visible));choose(10,0);same(hot,'the held hotend and loosened screws stay in place');
choose(23,1);const readyHotend=snapshot(['hotend',795,807]);choose(24,0);same(readyHotend,'refitting starts from the held hotend and two-turn-loose screw positions');
choose(24,1);const fittedHotend=snapshot(['hotend',795,807]);choose(25,0);same(fittedHotend,'the seated hotend and tightened screws do not jump at the inspection step');
for(const [n,ids]of [[21,['lbLoadcellLead','lbFilamentLead']],[22,['lbMotorLead','lbNtcLead','serviceHotendFanLead']]]){choose(n,0);for(const id of ids)assert(v.fasteners.entities.get(id).mesh.visible,'disconnected '+id+' stays visible before its own connector operation');}
choose(15,1);const pcb=snapshot(['loveBoard']);choose(16,0);same(pcb,'removed PCB is held for replacement preparation');choose(17,0);same(pcb,'replacement starts at the prepared position');
for(const[n,p,amount]of[[14,0,1],[14,1,.5],[15,0,.5],[15,1,0],[16,0,0],[17,0,0],[17,1,.5],[18,0,.5],[18,1,1]]){choose(n,p);assert.equal(v.fasteners.entities.get('lbMainLead').mesh.userData.flexState.amount,amount,'main connector separates unplugging from cable-channel routing');}
choose(14,0);assert(v.director.resolve([790,794,'mainPlate','pgAssembly','pgRing']).every(m=>!m.visible),'the removed Nextruder does not reappear behind the PCB');assert(v.director.resolve([829,859,'loveBoard']).some(m=>m.visible),'carriage and board mount remain');
choose(21,0);assert(v.director.resolve(['ventLever',861]).every(m=>!m.visible),'cover stays off while the right connectors are fitted');assert(v.sceneActors.every(a=>!a.nodes.some(m=>m.userData.cadIndex===861)),'original right cover is not overlaid on the One+ lever cover');
const fastener=v.meshes.find(m=>m.userData.cadIndex===846),short=fastener.geometry;
assert.equal(short,fastener.userData.guideGeometry20);v.setState({flow:'service',index:binding.indexOf('printfan',9),comparison:'after',variant:'screw',explore:false,completed:[]});assert.equal(fastener.geometry,fastener.userData.referenceGeometry,'separate print-fan guide retains its M3x25');
choose(14,0);const spec=JSON.parse(fs.readFileSync('dist/assets/nextruder/print-fan-fixing.json')),placement=new T.Matrix4().set(...spec.placement.flat());for(const i of[12,13,14])placement.elements[i]*=.001;const inverse=placement.invert().multiply(fastener.matrix),b=new T.Box3(),vertex=new T.Vector3();for(let i=0;i<short.attributes.position.count;i++)b.expandByPoint(vertex.fromBufferAttribute(short.attributes.position,i).applyMatrix4(inverse));assert(Math.abs(b.min.z+.003)<1e-7&&Math.abs(b.max.z-.02)<1e-7,'replacement is a20mm shank with the original3mm head');
let maximumLengthError=0;
for(const[id,route]of Object.entries(LOVEBOARD_ROUTES)){
 const e=v.fasteners.entities.get(id),position=e.geometry.attributes.position.array,normal=e.geometry.attributes.normal.array;
 for(let i=0;i<=1024;i++){e.update(i/1024,i/1024,1);maximumLengthError=Math.max(maximumLengthError,Math.abs(e.curve.getLength()-(route.length+(e.fixedEntryLength||0))));assert(position.every(Number.isFinite)&&normal.every(Number.isFinite));}
 assert(maximumLengthError<.025,'precomputed and interpolated poses conserve centreline length within0.025mm');
 e.update(.37,.37,1);const a=position.slice();e.update(.91,.91,1);e.update(.37,.37,1);assert.deepEqual(position,a,'deformation does not depend on scrub history');assert.equal(e.geometry.attributes.position.array,position,'position buffer is reused');
 e.update(1,1,1);const target=(e.socket.manufacturerPart?molexWireEntry(e.definition.socket):new T.Vector3(...socketCentre(e.definition.socket)).addScaledVector(e.out,e.socket.out[0]?1.5:3.5));assert(e.curve.getPointAt(1).distanceTo(target)<1e-8,'plug tail returns to the shared mating datum');
 if(id==='lbMainLead'){e.update(.5,.5,1);assert(e.curve.getPointAt(1).distanceTo(target)<1e-8,'cable can be released from its channel without unplugging');}
}
choose(21,.1);const held=snapshot(['loveBoard','lbLoadcellLead','lbFilamentLead']),scene=v.operationScene,progress=v.operationProgress,position=v.camera.position.clone(),cameraTarget=v.controls.target.clone();
for(lang of[1,2,3,0]){binding.localize();v.localize();assert.equal(v.operationScene,scene);assert.equal(v.operationProgress,progress);assert(v.camera.position.equals(position)&&v.controls.target.equals(cameraTarget),'translation retains the camera');same(held,'translation retains all current part/cable poses');assert.equal(v.sceneActors[0].label,['ロードセル','Loadcell','Loadcell','Wägezelle'][lang]);}
for(const[w,h]of[[390,420],[320,380],[844,280]]){v.camera.aspect=w/h;v.camera.updateProjectionMatrix();choose(21,.1);v.manualCamera=false;v.focusOperation(0,true);v.printer.updateMatrixWorld(true);v.camera.updateMatrixWorld(true);const m=v.fasteners.entities.get('lbLoadcellLead').mesh,b=plugBounds(v.fasteners.entities.get('lbLoadcellLead'));for(const x of[b.min.x,b.max.x])for(const y of[b.min.y,b.max.y])for(const z of[b.min.z,b.max.z]){const p=new T.Vector3(x,y,z).project(v.camera);assert(Math.abs(p.x)<.96&&Math.abs(p.y)<.96,'active right connector fits the mobile close-up');}}
console.log('PASS: official31-step anchors/PDF pages, held PCB/hotend handovers, three main-lead states, correct One+ cover, guide-specific20/25mm fasteners, five fixed-length leads, reverse scrub and four-language pose preservation; max interpolated centreline error',maximumLengthError.toFixed(6),'mm.');
