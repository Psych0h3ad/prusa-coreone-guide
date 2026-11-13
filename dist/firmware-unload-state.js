// SPDX-License-Identifier: GPL-3.0-only
// M702 W2 display exercise, derived from the retained Buddy pause/M70X sources.
// Progress and sensor readings are example FSM data, never device telemetry.
export class FirmwareUnloadState {
 constructor(definition,profile='normal',target=0){
  this.definition=definition;this.profile=profile;this.index=0;this.progress=0;this.selected=0;
  this.target=profile==='retracted'?target:Math.max(215,target);
  this.sequence=['initial','Parking_stoppable',...(profile==='normal'?['WaitingTemp_stoppable']:[]),...(profile!=='retracted'?['Ramming_stoppable']:[]),'Unloading_stoppable','Unparking'];
 }
 get phase(){return this.definition.phases[this.sequence[this.index]];}
 get last(){return this.index===this.sequence.length-1;}
 get nozzle(){
  if(this.profile==='retracted')return 22;
  if(this.phase.name==='WaitingTemp_stoppable')return Math.round(22+(this.target-5-22)*this.progress/100);
  return this.profile==='hot'||this.index>this.sequence.indexOf('WaitingTemp_stoppable')&&this.index>1?this.target:22;
 }
 get sensorIn(){return this.phase.name!=='Unparking';}
 setProgress(value){const n=Number(value);if(Number.isFinite(n))this.progress=Math.max(0,Math.min(100,Math.round(n)));}
 advance(delta=1){this.index=Math.max(0,Math.min(this.sequence.length-1,this.index+delta));this.progress=0;this.selected=0;}
 rotate(delta){this.selected=Math.max(0,Math.min(this.phase.buttons.length-1,this.selected+delta));}
}
