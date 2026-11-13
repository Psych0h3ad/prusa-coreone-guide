import assert from 'node:assert/strict';
import fs from 'node:fs';
import {FIRMWARE_UI} from '../dist/firmware-ui-data.js';
import {FirmwareLCDState} from '../dist/firmware-lcd-state.js';
import {FirmwareColdPullState} from '../dist/firmware-coldpull-state.js';
import {lcdButtonRects,lcdLines} from '../dist/firmware-lcd-layout.js';
import {SERVICE_TASKS} from '../dist/maintenance-data.js';
let snapshots=0;
const atlas=JSON.parse(fs.readFileSync('dist/assets/firmware-ui/atlas.json','utf8'));
for(const [version,fw] of Object.entries(FIRMWARE_UI.versions)){
 const d=fw.operations.coldpull,dir=`research/quality/service-20261105-67/firmware/v${version}`,source=fs.readFileSync(`${dir}/src__common__marlin_server_types__client_response.hpp`,'utf8');
 assert.deepEqual(d.temperatures,{cold:36,pull:90,end:95});
 assert.equal(d.qr.url,'https://prusa.io/31702');assert.equal(d.qr.size,25);
 for(const name of ['hand_qr_59x72','heatbreak_light_16x16','filament_sensor_17x16','side_filament_sensor_17x16'])assert(atlas[version].icons[name],`preserve ${name} in ${version} atlas`);
 for(const [name,p]of Object.entries(d.phases)){
  const raw=source.split('\n').find(line=>new RegExp(`// ${name}[, ]*$`).test(line));
  assert(raw,'upstream responses '+name);assert.deepEqual(p.buttons,[...raw.matchAll(/Response::(\w+)/g)].map(m=>m[1].toUpperCase()),'button order '+name);
 }
 for(const lang of ['ja','en','cs','de']){
  const label=k=>fw.labels[k]?.[lang]||k;
  for(const p of Object.values(d.phases)){
   for(const key of [p.title,p.text,p.timeoutText,...p.buttons].filter(Boolean))assert(fw.labels[key]?.[lang],`official translation ${lang} ${key}`);
   const rects=lcdButtonRects(p.buttons,label,d.layout.buttons);assert.equal(rects.length,p.buttons.length);
   if(rects.length){assert.equal(rects[0].x,6);assert.equal(rects.at(-1).x+rects.at(-1).w,474);for(const r of rects)assert(r.w>0&&r.x>=6&&r.x+r.w<=474,`no button overlap/off-screen ${version} ${lang} ${p.name}`);}
   for(let i=1;i<rects.length;i++)assert.equal(rects[i].x-(rects[i-1].x+rects[i-1].w),6);
  }
  assert(lcdLines(label(d.phases.introduction.text),20).length<=9,'QR introduction fits native text area');
  for(const p of Object.values(d.phases).filter(p=>!p.qr))assert(lcdLines(label(p.text),50).length<=4,'info fits native small-font frame');
 }
 for(const profile of ['loaded','retracted']){
  const op=new FirmwareColdPullState(d,profile),history=[];
  for(let i=0;i<op.sequence.length;i++){
   history.push(op.phase.name);assert.equal(op.index,i);
   for(const n of [0,25,50,75,100,50,0]){op.setProgress(n);assert.equal(op.progress,n);assert(Number.isFinite(op.nozzle));assert(Number.isFinite(op.target));if(op.phase.progress)assert(op.percent>=0&&op.percent<=100);snapshots++;}
   if(!op.last)op.advance();
  }
  for(let i=history.length-1;i>=0;i--){assert.equal(op.phase.name,history[i]);op.advance(-1);}
  op.index=op.sequence.indexOf('cool_down');op.setProgress(0);assert.equal(op.nozzle,215);assert.equal(op.percent,16);assert.equal(op.progressText,'16%');op.setProgress(100);assert.equal(op.nozzle,36);assert.equal(op.progressText,'0:00');assert.equal(op.info,d.phases.cool_down.timeoutText);
  op.setProgress(50);assert.equal(op.info,d.phases.cool_down.text);assert(op.progressText.endsWith('%'));
 }
 const state=new FirmwareLCDState(fw,fw.paths.coldpull);state.goto(2);assert.equal(state.operation.kind,'coldpull');assert.equal(state.respondOperation(0),'phase');assert.equal(state.operation.phase.name,'prepare_filament');
 assert.equal(state.respondOperation(0),'outside');assert.equal(state.operation.phase.name,'prepare_filament','separate M702 I branch is never substituted');assert.equal(state.respondOperation(2),'phase');assert.equal(state.operation.phase.name,'cool_down');
 state.operation.setProgress(10);const residual=state.operation.nozzle;assert.equal(state.respondOperation(0),'stopped');assert.equal(state.operation,null);assert.equal(state.readings.nozzle,residual);assert.equal(state.values['temperature:Nozzle Temperature'],0);assert(state.filamentLoaded,'aborting before pull keeps PLA loaded');
 state.goto(2);while(!state.operation.last)state.advanceOperation();assert.equal(state.respondOperation(0),'finished');assert.equal(state.operation,null);assert.equal(state.readings.nozzle,95);assert.equal(state.filamentLoaded,false);assert.equal(state.values['temperature:Nozzle Temperature'],0);
}
assert(SERVICE_TASKS.find(t=>t.id==='coldpull').steps[2].body.every(s=>!s.includes('80 °C')),'manual text does not override selected firmware temperatures');
console.log(`PASS cold-pull LCD:2 firmware versions,4 official languages,${snapshots} phase/progress snapshots; QR, translated response order/layout, cooling countdown, abort residual heat, complete and reverse paths.`);
