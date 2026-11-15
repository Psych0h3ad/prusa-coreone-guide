import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {SERVICE_TASKS} from '../dist/maintenance-data.js';
import {XBUDDY_COMPLETE_SOURCE} from '../dist/xbuddy-complete-source.js';
import {MAINTENANCE_SOURCES} from '../dist/maintenance-sources.js';
import {resolveMaintenanceReference} from '../dist/maintenance-reference.js';
import {firmwareFrames,firmwareFrameState} from '../dist/firmware-step-guide.js';
import {FIRMWARE_UI} from '../dist/firmware-ui-data.js';

const task=SERVICE_TASKS.find(t=>t.id==='xbuddy');
assert(task&&task.steps.length===34);
assert.equal(XBUDDY_COMPLETE_SOURCE.steps.length,34);
const photos=new Set();let uses=0;
for(const [index,step] of task.steps.entries()){
 const source=XBUDDY_COMPLETE_SOURCE.steps[index];
 assert.equal(step.officialId,source.id);
 assert.equal(step.officialStep,index+1);
 assert.equal(step.officialWebStep,index+2);
 assert.equal(step.source,task.source+'#'+source.id);
 for(const field of ['title','body']){
  assert.equal(step[field].length,4);
  assert(step[field].every(value=>typeof value==='string'&&value.trim()));
  assert(step[field].every(value=>!/(?:3D candidate|この3D候補|Your text goes here)/i.test(value)));
 }
 const reference=resolveMaintenanceReference(task,index,'ja',MAINTENANCE_SOURCES);
 assert.equal(reference.official.id,source.id);
 assert(reference.images.length>0);
 for(const language of ['ja','en','cs','de']){
  const localized=resolveMaintenanceReference(task,index,language,MAINTENANCE_SOURCES);
  assert.equal(new URL(localized.url).hash,'#'+source.id);
  assert.deepEqual(localized.images,reference.images,'localized source links retain the matching photograph set');
 }
 for(const photo of reference.images){
  const filename=path.resolve('dist',photo.url.split('?')[0]);
  assert(filename.startsWith(path.resolve('dist')+path.sep));
  const data=fs.readFileSync(filename);assert(data.length>1000&&data[0]===255&&data[1]===216,'actual attributed JPEG is available locally');
  assert.equal(photo.credit.length,4);photos.add(filename);uses++;
 }
}
assert.equal(photos.size,66);assert.equal(uses,70);
assert(task.steps[25].body[0].includes('ZRポート')&&task.steps[25].body[0].includes('ZL'));
assert(task.steps[31].body[0].includes('2本のM3×10')&&task.steps[31].body[0].includes('6本のM3×4bT'));
assert.equal(task.steps[31].supplementalSources.length,2);
let cases=0;
for(const version of ['6.5.7','8.0.0'])for(const index of [3,4,33]){
 const frames=firmwareFrames(task,task.steps[index],version);assert(frames.length>0);
 const menus=frames.filter(frame=>frame.kind==='menu');
 for(const frame of menus){
  const state=firmwareFrameState(frame,version),key=frame.selectedKey||state.target;
  assert.equal(state.menu.items[state.selected].key,key);
  for(const language of ['ja','en','cs','de'])assert(FIRMWARE_UI.versions[version].labels[key][language]);
 }
 if(index===3)assert(frames.some(frame=>frame.action==='unload')&&frames.some(frame=>frame.action==='cooldown'));
 if(index===4)assert(menus.some(frame=>frame.action==='moveZ'));
 if(index===33){assert(menus.some(frame=>frame.selectedKey===(version==='8.0.0'?'Door Sensor':'Fan Test')));assert(frames.some(frame=>frame.id==='selftest-all')&&frames.some(frame=>frame.id==='selftest-results'));}
 cases++;
}
console.log(`PASS_XBUDDY_COMPLETE: 34 official steps, ${photos.size} local photographs/${uses} uses, four languages and ${cases} version-specific native display sequences.`);
