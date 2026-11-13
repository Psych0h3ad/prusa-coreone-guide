import assert from 'node:assert/strict';
import fs from 'node:fs';
import {FIRMWARE_UI} from '../dist/firmware-ui-data.js';
import {FirmwareLCDState} from '../dist/firmware-lcd-state.js';
let poses=0;
const sequences={normal:['initial','Parking_stoppable','WaitingTemp_stoppable','Ramming_stoppable','Unloading_stoppable','Unparking'],hot:['initial','Parking_stoppable','Ramming_stoppable','Unloading_stoppable','Unparking'],retracted:['initial','Parking_stoppable','Unloading_stoppable','Unparking']};
for(const [version,fw] of Object.entries(FIRMWARE_UI.versions)){
 const source=`research/quality/service-20261105-66/v${version}`;
 const menu=fs.readFileSync(`${source}/src__gui__MItem_filament.cpp`,'utf8');
 assert.ok(menu.includes('gcode("M702 W2")'),'Normal menu must not use the optional I confirmation flag');
 const frames=fs.readFileSync(`${source}/${version==='8.0.0'?'src__gui__screen__screen_filament_change.cpp':'src__gui__dialogs__DialogLoadUnload.cpp'}`,'utf8');
 const before=JSON.stringify(fw);
 for(const [profile,expected] of Object.entries(sequences)){
  const state=new FirmwareLCDState(fw,fw.paths.unload);state.unloadProfile=profile;state.goto(2);
  assert.ok(state.operation);assert.deepEqual(state.operation.sequence,expected);
  assert.equal(state.operation.target,profile==='retracted'?0:215);
  for(let i=0;i<expected.length;i++){
   const op=state.operation;assert.equal(op.phase.name,expected[i]);assert.ok(frames.includes(`Phase::${op.phase.name},`));
   assert.equal(state.filamentLoaded,true,'Showing progress must not silently declare the filament removed');
   for(const p of [0,1,25,50,75,99,100]){op.setProgress(p);assert.equal(op.progress,p);assert.ok(Number.isInteger(op.nozzle)&&op.nozzle>=22&&op.nozzle<=215);poses++;}
   if(profile==='normal'&&op.phase.name==='WaitingTemp_stoppable'){op.setProgress(50);assert.equal(op.nozzle,116);assert.deepEqual(op.phase.buttons,['STOP']);}
   assert.ok(!op.phase.name.includes('IsFilamentUnloaded'),'No synthetic Yes/No confirmation on normal unload');
   if(i>0){state.advanceOperation(-1);assert.equal(state.operation.phase.name,expected[i-1]);state.advanceOperation();assert.equal(state.operation.phase.name,expected[i]);}
   state.advanceOperation();
  }
  assert.equal(state.operation,null);assert.equal(state.operationResult,'finished');assert.equal(state.filamentLoaded,false);
  assert.equal(state.values['temperature:Nozzle Temperature'],0);assert.equal(state.values['temperature:Heatbed Temperature'],0);
  assert.equal(state.readings.nozzle,profile==='retracted'?22:215,'Ending the example must not instantly cool the hot nozzle');
  assert.equal(state.activate(state.menu.items.findIndex(r=>r.key==='Unload Filament')),'disabled');
  if(version==='8.0.0')assert.equal(state.value(state.menu.items.find(r=>r.key==='Loaded Filament')),'---');
  state.resetPractice();assert.equal(state.filamentLoaded,true);assert.equal(state.readings.nozzle,22);
 }
 const stopped=new FirmwareLCDState(fw,fw.paths.unload);stopped.goto(2);stopped.advanceOperation();assert.equal(stopped.activate(),'stopped');assert.equal(stopped.operationResult,'stopped');assert.equal(stopped.filamentLoaded,true);assert.equal(stopped.operation,null);
 const high=new FirmwareLCDState(fw,fw.paths.unload);high.values['temperature:Nozzle Temperature']=250;high.goto(2);assert.equal(high.operation.target,250,'Keep a higher existing setpoint');
 high.operation.setProgress(NaN);assert.equal(high.operation.progress,0);high.operation.setProgress(999);assert.equal(high.operation.progress,100);high.operation.setProgress(-5);assert.equal(high.operation.progress,0);
 high.back();assert.equal(high.operationResult,'closed');assert.equal(high.operation,null);
 assert.equal(JSON.stringify(fw),before,'Firmware data must stay immutable');
}
console.log(`PASS unload LCD:2 firmware versions,3 conditions,${poses} phase/progress snapshots; source menu command,manual stepping/reverse,Stop,cooling state and loaded-filament handover.`);
