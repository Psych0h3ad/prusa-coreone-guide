// SPDX-License-Identifier: GPL-3.0-only
// Browser display exercise. Values are examples; no device commands are sent.
import {FirmwareUnloadState} from './firmware-unload-state.js?v=20261111-94';
import {FirmwareColdPullState} from './firmware-coldpull-state.js?v=20261111-94';
export class FirmwareLCDState {
 constructor(firmware,path){this.firmware=firmware;this.path=path;this.resetPractice();}
 get menu(){const menu=this.firmware.menus[this.menuId];return this.menuId==='filament'&&!this.filamentLoaded?{...menu,items:menu.items.map(r=>['Unload Filament','Change Filament'].includes(r.key)?{...r,disabled:true}:r)}:menu;}
 get prefix(){return this.trail.every((k,i)=>this.path[i]===k);}
 get depth(){return this.prefix?Math.min(this.path.length,this.trail.length+(this.leaf===this.path[this.trail.length]?1:0)):0;}
 get arrived(){return this.prefix&&this.depth===this.path.length;}
 get target(){return this.prefix?this.path[this.trail.length]:null;}
 get valueKey(){return this.menuId+':'+this.menu.items[this.selected]?.key;}
 value(row){if(row.key==='Loaded Filament'&&!this.filamentLoaded)return '---';return this.values[this.menuId+':'+row.key]??row.value;}
 reset(){this.menuId='home';this.trail=[];this.stack=[];this.selected=3;this.scroll=0;this.leaf=null;this.editing=null;this.operation=null;this.operationResult=null;}
 resetPractice(){this.values={};this.readings={nozzle:22,bed:22};this.filamentLoaded=true;this.unloadProfile='normal';this.coldpullProfile='loaded';this.reset();}
 rotate(delta){if(this.operation){this.operation.rotate(delta);return;}if(this.editing){const e=this.editing,keys=['7','8','9','4','5','6','1','2','3',...(e.config.min<0?['minus']:[]),'0',...(String(e.config.step).includes('.')?['.']:[]),'ok','clear','backspace','cancel'];e.focus=keys[Math.max(0,Math.min(keys.length-1,keys.indexOf(e.focus)+delta))];return;}this.selected=Math.max(0,Math.min(this.menu.items.length-1,this.selected+delta));this.leaf=null;}
 back(){if(this.operation){this.finishOperation('closed');return;}if(this.editing){this.editing=null;return;}const previous=this.stack.pop();if(previous){Object.assign(this,previous);this.trail.pop();}else this.reset();this.leaf=null;}
 activate(index=this.selected){
  if(this.operation)return this.respondOperation(this.operation.selected);
  this.selected=index;const row=this.menu.items[index];if(!row||row.disabled)return 'disabled';
  if(row.back){this.back();return 'back';}
  if(row.menu&&this.firmware.menus[row.menu]){this.stack.push({menuId:this.menuId,selected:this.selected,scroll:this.scroll});this.trail.push(row.key);this.menuId=row.menu;this.selected=0;this.scroll=0;this.leaf=null;return 'menu';}
  if(row.menu)return 'outside';
  if(row.numeric){this.editing={key:this.valueKey,prompt:row.key,config:row.numeric,unit:row.unit,text:String(this.value(row)),initial:true,special:row.numeric.special!==undefined&&this.value(row)===row.numeric.special,focus:'0'};this.leaf=row.key;return 'numeric';}
  // Only nozzle configuration switches are practised. Other settings can
  // require additional confirmation dialogs; do not invent their results.
  if(row.toggle&&this.menuId==='printhead'){this.values[this.valueKey]=!this.value(row);return 'toggle';}
  this.leaf=row.key;
  if(row.key==='Unload Filament'&&this.firmware.operations?.unload){this.operation=new FirmwareUnloadState(this.firmware.operations.unload,this.unloadProfile,this.values['temperature:Nozzle Temperature']||0);this.operationResult=null;return 'operation';}
  if(row.key==='Cold Pull'&&this.firmware.operations?.coldpull){this.operation=new FirmwareColdPullState(this.firmware.operations.coldpull,this.coldpullProfile);this.operationResult=null;return 'operation';}
  if(row.key==='Cooldown'){this.values['temperature:Nozzle Temperature']=0;this.values['temperature:Heatbed Temperature']=0;}
  return 'action';
 }
 finishOperation(result){const op=this.operation;if(!op)return;this.readings.nozzle=op.nozzle;this.values['temperature:Nozzle Temperature']=0;this.values['temperature:Heatbed Temperature']=0;if(result==='finished'||op.kind==='coldpull'&&!op.sensorIn)this.filamentLoaded=false;this.operation=null;this.operationResult=result;}
 advanceOperation(delta=1){if(!this.operation)return;if(delta>0&&this.operation.last){this.finishOperation('finished');return;}this.operation.advance(delta);}
 respondOperation(index){if(this.operation?.kind==='coldpull'){const result=this.operation.respond(index);if(['stopped','finished'].includes(result))this.finishOperation(result);return result;}if(this.operation?.phase.buttons[index]==='STOP'){this.finishOperation('stopped');return 'stopped';}return 'disabled';}
 next(){if(this.arrived)return;const index=this.menu.items.findIndex(r=>r.key===this.target);if(index>=0)this.activate(index);else this.reset();}
 goto(depth){this.reset();for(let i=0;i<depth;i++)this.next();}
 key(key){const e=this.editing;if(!e)return;
  if(key==='cancel'){this.editing=null;return;}
  if(key==='ok'){const n=e.special?e.config.special:Number(e.text),precision=String(e.config.step).includes('.')||Number.isInteger(n);if((e.special||e.text!=='')&&Number.isFinite(n)&&precision&&n>=e.config.min&&n<=e.config.max){this.values[e.key]=n;this.editing=null;}return;}
  e.focus=key;
  if(key==='clear'){e.text='';e.initial=false;e.special=e.config.special!==undefined;return;}
  if(key==='backspace'){e.text=e.text.slice(0,-1);e.initial=false;e.special=!e.text&&e.config.special!==undefined;return;}
  if(key==='minus'){if(e.config.min<0)e.text=e.text.startsWith('-')?e.text.slice(1):'-'+e.text;return;}
  if(key==='.'&&(!String(e.config.step).includes('.')||e.text.includes('.')))return;
  if(/^[0-9.]$/.test(key)&&e.text.length<8){e.text=(e.initial||e.special?'':e.text)+key;e.initial=false;e.special=false;}
 }
}
