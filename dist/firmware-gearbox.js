// SPDX-License-Identifier: GPL-3.0-only
// Buddy v6.5.7/v8.0.0 screen_gearbox_alignment and FramePrompt/FrameText layouts.
// Native images retain the terms in assets/firmware-ui/README.txt.
import {loadFirmwareLCDAssets,tintedFirmwareAsset} from './firmware-lcd.js?v=20261111-94';
import {lcdButtonRects,lcdLines} from './firmware-lcd-layout.js?v=20261111-94';

export const GEARBOX_TEXT={
 intro:'The gearbox alignment is only necessary for user-assembled or serviced gearboxes. In all other cases, you can skip this step.',
 filament_loaded_ask_unload:'We need to start without the filament in the extruder. Please unload it.',
 filament_unknown_ask_unload:'Before you proceed, make sure filament is unloaded from the Nextruder.',
 loosen_screws:'Rotate each screw counter-clockwise by 1.5 turns. The screw heads should be flush with the cover. Unlock and open the idler.',
 alignment:'Gearbox alignment in progress, please wait (approx. 20 seconds)',
 tighten_screws:'Tighten the M3 screws firmly in the correct order, they should be slightly below the surface. Do not over-tighten.',
 done:'Close the idler door and secure it with the swivel. The calibration is done!'
};
export const GEARBOX_BUTTONS={
 intro:['CONTINUE','SKIP'],filament_loaded_ask_unload:['UNLOAD','ABORT'],filament_unknown_ask_unload:['CONTINUE','UNLOAD','ABORT'],
 loosen_screws:['CONTINUE','SKIP'],alignment:[],tighten_screws:['CONTINUE'],done:['CONTINUE']
};
export const GEARBOX_PICTURES={loosen_screws:'loose',alignment:'gears',tighten_screws:'tight',done:'close'};
export function gearboxPhases(condition='unknown'){
 if(!['unknown','loaded','empty'].includes(condition))throw Error('Unknown gearbox confirmation screen');
 return ['intro',...(condition==='empty'?[]:[condition==='loaded'?'filament_loaded_ask_unload':'filament_unknown_ask_unload']),
  'loosen_screws','alignment','tighten_screws','done'];
}
let labelsRequest;
const images=new Map();
async function sourceLabels(){
 if(!labelsRequest){labelsRequest=(async()=>{const response=await fetch(new URL('./assets/firmware-ui/gearbox.json?v=20261111-94',import.meta.url));if(!response.ok)throw Error('Gearbox strings unavailable');return response.json();})();labelsRequest.catch(()=>{labelsRequest=undefined;});}
 return labelsRequest;
}
async function nativeImage(version,name){
 const key=version+name;
 if(!images.has(key)){const request=(async()=>{const img=new Image();img.src=new URL(`./assets/firmware-ui/${version}/transmission_${name}_187x175.png?v=20261111-94`,import.meta.url);await img.decode();return img;})();images.set(key,request);request.catch(()=>{if(images.get(key)===request)images.delete(key);});}
 return images.get(key);
}
export function gearboxTextBlocks(phase,version,label){
 if(!GEARBOX_TEXT[phase]||!['6.5.7','8.0.0'].includes(version))throw Error('Unknown gearbox display');
 return version==='8.0.0'&&phase==='intro'?[
  {text:label('Gearbox alignment'),x:16,y:32,w:448,h:32,font:'big',vertical:'bottom',color:'#f8651b'},
  {text:label(GEARBOX_TEXT[phase]),x:16,y:86,w:448,h:192,font:'normal'}
 ]:[{text:label(GEARBOX_TEXT[phase]),x:24,y:75,w:GEARBOX_PICTURES[phase]?245:432,h:192,font:'normal'}];
}
export async function paintGearboxLCD(canvas,{phase,version='8.0.0',language='ja'}={}){
 const [a,data,picture]=await Promise.all([loadFirmwareLCDAssets(version),sourceLabels(),GEARBOX_PICTURES[phase]?nativeImage(version,GEARBOX_PICTURES[phase]):null]);
 if(!canvas.isConnected)return;
 const labels=data[version]?.labels;if(!labels)throw Error('Unknown gearbox release');
 const label=key=>labels[key]?.[language]??key,g=canvas.getContext('2d',{alpha:false}),diagnostics=[];
 g.imageSmoothingEnabled=false;g.fillStyle='#000';g.fillRect(0,0,480,320);
 function text(value,x,y,font='normal',color='#fff'){
  const f=a.meta.fonts[font],atlas=tintedFirmwareAsset(a,f.file,color);
  for(const [i,char]of Array.from(value).entries()){
   const k=f.characters.indexOf(char);if(k<0)throw Error('Missing native gearbox glyph: '+char);
   g.drawImage(atlas,k%16*f.width,Math.floor(k/16)*f.height,f.width,f.height,x+i*f.width,y,f.width,f.height);
  }
 }
 function block(b){
  const f=a.meta.fonts[b.font],lines=lcdLines(b.text,Math.floor(b.w/f.width)),height=lines.length*f.height;
  diagnostics.push({...b,lines,overflow:height>b.h});
  g.save();g.beginPath();g.rect(b.x,b.y,b.w,b.h);g.clip();
  const top=b.vertical==='bottom'?b.y+b.h-height:b.vertical==='center'?b.y+Math.floor((b.h-height)/2):b.y;
  lines.forEach((line,i)=>text(line,b.align==='center'?b.x+Math.floor((b.w-Array.from(line).length*f.width)/2):b.x,top+i*f.height,b.font,b.color));g.restore();
 }
 text(label('GEARBOX ALIGNMENT'),14,13,'special');
 if(version==='8.0.0'&&phase==='intro'){g.fillStyle='#454545';g.fillRect(16,68,448,2);}
 gearboxTextBlocks(phase,version,label).forEach(block);
 if(picture)g.drawImage(picture,269,75);
 const buttons=lcdButtonRects(GEARBOX_BUTTONS[phase],label,{x:6,y:278,w:468,h:32});
 for(const [i,b]of buttons.entries()){
  g.fillStyle=i===0?'#f8651b':'#808080';g.beginPath();g.roundRect(b.x,b.y,b.w,b.h,8);g.fill();
  block({...b,text:label(b.key),font:'big',align:'center',vertical:'center',color:i===0?'#000':'#fff'});
 }
 canvas.dataset.lcdReady='true';canvas.dataset.lcdVersion=version;canvas.dataset.lcdOperation=phase;canvas.dataset.lcdMenu='gearbox';
 return {phase,version,language,diagnostics,buttons,buttonLabels:buttons.map(b=>({key:b.key,label:label(b.key)})),picture:GEARBOX_PICTURES[phase]??null};
}
