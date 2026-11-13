// SPDX-License-Identifier: GPL-3.0-only
// Source-derived screen sequence for loaded PLA with MMU disabled.
// Temperatures, time remaining and progress are explicitly example FSM data.
export class FirmwareColdPullState {
 constructor(definition,profile='loaded'){
  this.definition=definition;this.profile=profile;this.index=0;this.progress=0;this.selected=0;
  this.sequence=['introduction','prepare_filament',...(profile==='retracted'?['deretract']:[]),'cool_down','heat_up','automatic_pull','manual_pull','pull_done'];
 }
 get kind(){return 'coldpull';}
 get phase(){return this.definition.phases[this.sequence[this.index]];}
 get last(){return this.index===this.sequence.length-1;}
 get target(){const t=this.definition.temperatures;return ({deretract:215,cool_down:t.cold,heat_up:t.pull,automatic_pull:t.end,manual_pull:t.end,pull_done:t.end})[this.phase.name]||0;}
 get nozzle(){const t=this.definition.temperatures,p=this.progress/100;return ({introduction:this.profile==='retracted'?22:215,prepare_filament:this.profile==='retracted'?22:215,deretract:Math.round(22+193*p),cool_down:Math.round(215-(215-t.cold)*p),heat_up:Math.round(t.cold+(t.pull-t.cold)*p),automatic_pull:t.end,manual_pull:t.end,pull_done:t.end})[this.phase.name];}
 get sensorIn(){return !['manual_pull','pull_done'].includes(this.phase.name);}
 get percent(){return this.phase.name==='cool_down'?Math.min(100,Math.floor(100*this.target/this.nozzle)):Math.min(100,Math.floor(100*this.nozzle/(this.target||1)));}
 get timeLeft(){return Math.round(900*(1-this.progress/100));}
 get progressText(){if(this.phase.name==='cool_down'&&this.timeLeft<=300)return Math.floor(this.timeLeft/60)+':'+String(this.timeLeft%60).padStart(2,'0');return this.percent+'%';}
 get info(){return this.phase.name==='cool_down'&&this.timeLeft<=300?this.phase.timeoutText:this.phase.text;}
 setProgress(value){const n=Number(value);if(Number.isFinite(n))this.progress=Math.max(0,Math.min(100,Math.round(n)));}
 advance(delta=1){this.index=Math.max(0,Math.min(this.sequence.length-1,this.index+delta));this.progress=0;this.selected=0;}
 rotate(delta){this.selected=Math.max(0,Math.min(this.phase.buttons.length-1,this.selected+delta));}
 respond(index){
  const key=this.phase.buttons[index];if(!key)return 'disabled';
  if(['STOP','ABORT'].includes(key))return 'stopped';
  if(key==='FINISH')return 'finished';
  // Load/unload launch separate firmware dialogs. This exercise covers the
  // official already-loaded PLA branch; never substitute the normal M702 flow.
  if(['LOAD','UNLOAD'].includes(key))return 'outside';
  if(key==='CONTINUE'){this.advance();return 'phase';}
  return 'disabled';
 }
}
