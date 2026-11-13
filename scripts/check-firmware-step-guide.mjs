import assert from 'node:assert/strict';
import {SERVICE_TASKS as tasks} from '../dist/maintenance-data.js';
import {FIRMWARE_UI} from '../dist/firmware-ui-data.js';
import {firmwareFrames,firmwareFrameState} from '../dist/firmware-step-guide.js';
import {firmwareActions} from '../dist/firmware-navigation.js';
const coldpull=tasks.find(t=>t.id==='coldpull'),setup=tasks.find(t=>t.id==='initial-setup');
assert.equal(setup.steps.length,13);
assert.equal(new Set(setup.steps.map(s=>s.source)).size,13,'each setup step links its own official anchor');
for(const s of setup.steps){
 assert.equal(new URL(s.source).hostname,'help.prusa3d.com');
 assert(s.screenPhotos.length&&s.body.every(text=>text.length>0&&!/<\/?\w+>/.test(text)),'official translated instructions remain readable plain text');
 for(const p of s.screenPhotos){assert(p.url.startsWith('https://help.prusa3d.com/wp-content/uploads/'));if(p.crop){const[x,y,w,h,sw,sh]=p.crop;assert(x>=0&&y>=0&&x+w<=sw&&y+h<=sh,'LCD viewport stays inside the unchanged source photo');}}
}
let total=0;
const expected=[[],['introduction','prepare_filament'],['cool_down','heat_up','automatic_pull'],['manual_pull'],['pull_done']];
for(const version of Object.keys(FIRMWARE_UI.versions)){
 for(const [i,step]of coldpull.steps.entries())assert.deepEqual(firmwareFrames(coldpull,step,version).filter(f=>f.kind==='operation').map(f=>f.phase),expected[i],'cold-pull physical instructions select only the relevant source phases');
 const before=JSON.stringify(FIRMWARE_UI.versions[version]);
 for(const task of tasks)for(const step of task.steps){
  const frames=firmwareFrames(task,step,version);total+=frames.length;
  const localized=structuredClone(step);localized.title=['別の日本語見出し'];localized.body=['日本語本文のみ'];
  const localizedTask={...task,steps:task.steps.map(s=>s===step?localized:s)};
  assert.deepEqual(firmwareActions(localizedTask,localized),firmwareActions(task,step),'a Japanese-only step keeps its firmware operation');
  assert.deepEqual(firmwareFrames(localizedTask,localized,version),frames,'translated titles and prose never change the selected source displays');
  const actions=firmwareActions(task,step);actions.push('changed-by-caller');
  assert(!firmwareActions(task,step).includes('changed-by-caller'),'returned action lists do not mutate the authored steps');
  for(const f of frames)if(['menu','operation'].includes(f.kind)){
   const a=firmwareFrameState(f,version),b=firmwareFrameState(f,version);
   assert.equal(a.menuId,b.menuId,'random entry recreates the same source screen');
   assert.equal(a.selected,b.selected);
   if(f.kind==='operation'){assert.equal(a.operation.phase.name,f.phase);assert.equal(a.operation.progress,50);assert(['loaded','normal'].includes(a.operation.profile),'read-only guide uses the stated loaded-PLA or normal-unload branch');}
   else assert(a.menu.items[a.selected],'selected source item exists');
  }
 }
 assert.equal(JSON.stringify(FIRMWARE_UI.versions[version]),before,'slide generation never changes official source definitions');
 const nozzle=tasks.find(t=>t.id==='nozzle');
 const settingsStep=nozzle.steps.find(s=>s.firmwareActions?.includes('printhead'));
 const pending=firmwareFrames(nozzle,settingsStep,version);
 assert.deepEqual(pending.map(f=>f.id),['nozzle-settings-condition'],'unknown nozzle state must not prescribe a settings path');
 assert(pending[0].nozzleChoice);
 const kept=firmwareFrames(nozzle,settingsStep,version,{nozzleDecision:'unchanged'});
 assert.deepEqual(kept.map(f=>f.id),['nozzle-settings-condition','nozzle-settings-kept'],'unchanged hardware skips configuration examples');
 assert(!kept.some(f=>f.kind==='menu'));
 assert(kept.at(-1).title.length===4&&kept.at(-1).body.length===4);
 assert.throws(()=>firmwareFrames(nozzle,settingsStep,version,{nozzleDecision:'invalid'}));
 const settings=firmwareFrames(nozzle,settingsStep,version,{nozzleDecision:'changed'});
 assert.equal(settings[0].id,'nozzle-settings-condition','no configuration change is prescribed without first checking the installed nozzle');
 const checks=settings.filter(f=>f.body&&f.kind==='menu');
 assert.deepEqual(checks.map(f=>f.selectedKey),['Nozzle Diameter','Nozzle Hardened','Nozzle High-flow','Nextruder Silicone Sock']);
 for(const check of checks){
  const state=firmwareFrameState(check,version);
  assert.equal(state.menuId,'printhead');assert.equal(state.menu.items[state.selected].key,check.selectedKey);
  assert(!state.editing,'a read-only guide must not commit an example value');
  assert(check.title.length===4&&check.body.length===4&&check.body.every(s=>s.length>30),'the installed-part check remains available in all retained languages');
 }
 const gearbox=firmwareFrames(setup,setup.steps.find(s=>s.officialStep===11),version);
 assert.deepEqual(gearbox.filter(f=>f.kind==='photo'),setup.steps.find(s=>s.officialStep===11).screenPhotos.map(p=>({kind:'photo',...p})),'official gearbox photos and crops remain available');
 const native=gearbox.filter(f=>f.kind==='gearbox');
 assert.deepEqual(native.map(f=>f.phase),['intro','filament_unknown_ask_unload','loosen_screws','alignment','tighten_screws','done'],'one conditional filament branch precedes the native screw/alignment/closure sequence');
 const work=native.filter(f=>f.id);
 assert.deepEqual(work.map(f=>f.id),['gearbox-open','gearbox-align','gearbox-tighten','gearbox-close'],'manual advance keeps tightening after automatic alignment');
 for(const f of native){assert(f.title.length===4&&f.body.length===4&&f.body.every(s=>s.length>40));assert.throws(()=>firmwareFrameState(f,version),'the gearbox renderer keeps native phase data separate from authored explanatory prose');}
 for(const task of tasks.filter(t=>['loveboard','hotendfan'].includes(t.id))){
  const step=task.steps.at(-1),frames=firmwareFrames(task,step,version),selected=frames.find(f=>f.selectedKey);
  assert(selected,'selftest selects a real numbered test');
  const state=firmwareFrameState(selected,version);assert.equal(state.menu.items[state.selected].key,version==='8.0.0'?'Door Sensor':'Fan Test','start at the first test of the selected release');
  assert.equal(frames[0].id,'selftest-sheet');assert.equal(frames.at(-2).id,'selftest-all');assert.equal(frames.at(-1).id,'selftest-results');
  assert(!frames.some(f=>f.id?.startsWith('gearbox-')),'electrical replacements do not inherit the sensor dismantling completion gate');
 }
 assert.equal(firmwareFrames(nozzle,nozzle.steps.find(s=>s.title[1]==='Restore power'),version).length,0,'no previous task LCD is reused for a step without a screen action');
 // The tool must be removed before the first explicit heat display. Settings
 // still depend on the installed nozzle; changing methods alone changes nothing.
 for(const id of ['nozzle-tool','nozzle-tool-bare']){
  const tool=tasks.find(t=>t.id===id),fit=tool.steps.findIndex(s=>s.action==='tool-in'),clear=tool.steps.findIndex(s=>s.action==='tool-out');
  const unload=tool.steps.find(s=>s.firmwareActions?.includes('unload'));
  assert.deepEqual(firmwareActions(tool,unload),['unload','cooldown'],'ordinary unloading is followed by cooling before cold fixture work');
  for(const step of tool.steps.slice(fit,clear+1))assert.equal(firmwareFrames(tool,step,version).length,0,'physical fixture work never shows a heating or unrelated menu action');
  const check=tool.steps.find(s=>s.firmwareActions?.includes('printhead'));
  assert(tool.steps.indexOf(check)>clear);
  assert.deepEqual(firmwareFrames(tool,check,version),firmwareFrames(nozzle,settingsStep,version),'same source-backed nozzle decision applies to both replacement methods');
  assert.deepEqual(firmwareFrames(tool,check,version,{nozzleDecision:'unchanged'}).map(f=>f.id),['nozzle-settings-condition','nozzle-settings-kept'],'unchanged nozzle hardware does not acquire mandatory settings changes');
  const heat=tool.steps.find(s=>s.firmwareActions?.includes('heat'));assert(tool.steps.indexOf(heat)>clear);
  const heatingFrames=firmwareFrames(tool,heat,version);assert(heatingFrames.length>0);assert(heatingFrames.every(f=>f.action==='heat'),'the final fixture-free verification selects only the heating route');
 }
}
console.log(`PASS step display: ${tasks.length} tasks, ${total} versioned frames; phase-to-maintenance mapping, 13 initial-setup source anchors, photo bounds, independent deterministic source states.`);
