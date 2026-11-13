// SPDX-License-Identifier: GPL-3.0-only
// Geometry adapted from Buddy v8.0.0 / v6.5.7 GuiDefaults, screen_home,
// IWindowMenuItem and DialogNumericInput. Icons/design: CC BY-NC-SA 4.0;
// bitmap glyphs: OFL-1.1 / IPA. See assets/firmware-ui/README.txt.
import {lcdButtonRects,lcdLines} from './firmware-lcd-layout.js?v=20261111-94';
const assetRevision='20261109-87';
const loads=new Map();
async function assets(version){
 if(!loads.has(version))loads.set(version,(async()=>{
  const base=new URL(`./assets/firmware-ui/${version}/`,import.meta.url),r=await fetch(new URL('../atlas.json?v='+assetRevision,base));if(!r.ok)throw Error('LCD atlas: '+r.status);
  const meta=(await r.json())[version],images={};
  await Promise.all([...new Set([...Object.values(meta.icons),...Object.values(meta.fonts).map(f=>f.file)])].map(async file=>{const img=new Image();img.src=new URL(file+'?v='+assetRevision,base);await img.decode();images[file]=img;}));
  return {meta,images,tints:new Map(),swapBW:version!=='6.5.7'};
 })());
 return loads.get(version);
}
function tinted(a,file,color,invert=false){
 const key=file+':'+color+':'+invert;if(a.tints.has(key))return a.tints.get(key);
 const original=a.images[file],c=document.createElement('canvas');c.width=original.width;c.height=original.height;const g=c.getContext('2d');g.drawImage(original,0,0);
 if(invert){const pixels=g.getImageData(0,0,c.width,c.height),p=pixels.data;for(let i=0;i<p.length;i+=4){const l=Math.floor((p[i]+p[i+1]+p[i+2])/3),low=Math.max(0,l-64),high=Math.min(255,l+64);if(!a.swapBW||[p[i],p[i+1],p[i+2]].every(v=>v>=low&&v<=high))for(let n=0;n<3;n++)p[i+n]=255-p[i+n];}g.putImageData(pixels,0,0);}
 else{g.globalCompositeOperation='source-in';g.fillStyle=color;g.fillRect(0,0,c.width,c.height);}
 a.tints.set(key,c);return c;
}
export {assets as loadFirmwareLCDAssets,tinted as tintedFirmwareAsset};
export async function paintFirmwareLCD(canvas,{version,language,label,state}){
 const a=await assets(version);if(!canvas.isConnected)return;
 const g=canvas.getContext('2d',{alpha:false});g.imageSmoothingEnabled=false;g.fillStyle='#000';g.fillRect(0,0,480,320);
 const hits=[],menu=state.menu;
 function text(str,x,y,kind='normal',color='#fff',clip=480-x){
  const f=a.meta.fonts[kind],img=tinted(a,f.file,color),chars=Array.from(String(str));
  g.save();g.beginPath();g.rect(x,y,Math.max(0,clip),f.height);g.clip();
  for(const [i,ch]of chars.entries()){let index=f.characters.indexOf(ch);if(index<0)index=f.characters.indexOf('?');g.drawImage(img,index%16*f.width,Math.floor(index/16)*f.height,f.width,f.height,x+i*f.width,y,f.width,f.height);}g.restore();
 }
 function icon(name,x,y,invert=false){const file=a.meta.icons[name];if(file)g.drawImage(invert?tinted(a,file,'',true):a.images[file],x,y);}
 function rect(x,y,w,h,color,r=0){g.fillStyle=color;g.beginPath();g.roundRect(x,y,w,h,r);g.fill();}
 const title=menu.title==='home'?`PRUSA COREONE ${version}`:label(menu.title),op=state.operation;
 if(!op||version==='6.5.7'||op.kind==='coldpull'){
  if(op?.kind!=='coldpull'){if(menu.icon)icon(menu.icon,14,12);else if(state.menuId==='home')icon('home_shape_16x16',14,12);}
  text(op?.kind==='coldpull'?label(op.definition.title):title,op?.kind==='coldpull'?14:menu.icon||state.menuId==='home'?34:14,13,'special','#fff',430);
 }
 if(op?.kind==='coldpull'){
  const layout=op.definition.layout;
  const block=(value,r,align='center',color='#fff')=>{const f=a.meta.fonts[r.font],lines=r.single?[value]:lcdLines(value,Math.floor(r.w/f.width)),shown=lines.slice(0,Math.floor(r.h/f.height)),y=r.y+Math.max(0,Math.floor((r.h-shown.length*f.height)/2));g.save();g.beginPath();g.rect(r.x,r.y,r.w,r.h);g.clip();shown.forEach((s,i)=>text(s,align==='left'?r.x:Math.round(r.x+(r.w-Array.from(s).length*f.width)/2),y+i*f.height,r.font,color,Math.max(r.w,Array.from(s).length*f.width)));g.restore();};
  if(op.phase.qr){
   block(label(op.phase.text),layout.intro,'left');block('prusa.io/31702',layout.link,'left');icon('hand_qr_59x72',layout.phone.x+3,layout.phone.y+5);
   const q=op.definition.qr,r=layout.qr,border=2,ppm=Math.max(1,Math.floor(Math.min(r.w,r.h)/(q.size+2*border))),size=(q.size+2*border)*ppm,x=r.x+Math.floor((r.w-size)/2),y=r.y+Math.floor((r.h-size)/2);rect(x,y,size,size,'#fff');q.matrix.forEach((row,j)=>row.forEach((on,i)=>{if(on)rect(x+(i+border)*ppm,y+(j+border)*ppm,ppm,ppm,'#000');}));
  }else{
   block(label(op.phase.title),{...layout.title,single:true});
   if(op.phase.progress){const b=layout.bar;rect(b.x,b.y,b.w,b.h,'#5b5b5b',b.radius);g.save();g.beginPath();g.roundRect(b.x,b.y,b.w,b.h,b.radius);g.clip();rect(b.x,b.y,Math.floor(b.w*op.percent/100),b.h,'#f8651b');g.restore();block(op.progressText,layout.number);}
   block(label(op.info),layout.label);
  }
  lcdButtonRects(op.phase.buttons,label,layout.buttons).forEach((r,i)=>{const selected=op.selected===i,value=label(r.key),kind=['big','normal','special'].find(k=>Array.from(value).length*a.meta.fonts[k].width<=r.w-16)||'special';rect(r.x,r.y,r.w,r.h,selected?'#f8651b':'#808080',8);block(value,{...r,font:kind,single:true},'center',selected?'#000':'#fff');hits.push({...r,operation:i});});
 }else if(op){
  const layout=op.definition.layout,center=(s,box,kind=box.font,color='#fff')=>{const f=a.meta.fonts[kind];text(s,Math.round(box.x+(box.w-Array.from(s).length*f.width)/2),Math.round(box.y+(box.h-f.height)/2),kind,color,box.w);};
  center(label(op.definition.title),layout.title);
  const b=layout.bar;rect(b.x,b.y,b.w,b.h,'#5b5b5b',b.radius);g.save();g.beginPath();g.roundRect(b.x,b.y,b.w,b.h,b.radius);g.clip();rect(b.x,b.y,Math.round(b.w*op.progress/100),b.h,'#f8651b');g.restore();
  center(op.progress+'%',layout.number);
  const box=layout.label,max=Math.floor(box.w/a.meta.fonts[box.font].width);let remaining=label(op.phase.text),lines=[];
  while(remaining){let n=Array.from(remaining).length;if(n>max){n=remaining.lastIndexOf(' ',max);if(n<1)n=max;}lines.push(remaining.slice(0,n));remaining=remaining.slice(n).trimStart();}
  lines.slice(0,Math.floor(box.h/a.meta.fonts[box.font].height)).forEach((s,i)=>text(s,Math.round(box.x+(box.w-Array.from(s).length*a.meta.fonts[box.font].width)/2),box.y+i*a.meta.fonts[box.font].height,box.font,'#fff',box.w));
  op.phase.buttons.forEach((key,i)=>{const r=layout.buttons,w=(r.w-(op.phase.buttons.length-1)*6)/op.phase.buttons.length,x=r.x+i*(w+6),selected=op.selected===i;rect(x,r.y,w,r.h,selected?'#f8651b':'#808080',8);center(label(key),{x,y:r.y,w,h:r.h,font:'big'},'big',selected?'#000':'#fff');hits.push({x,y:r.y,w,h:r.h,operation:i});});
 }else if(state.editing){
  const e=state.editing;
  const keys=['7','8','9','4','5','6','1','2','3','minus','0','.'];
  keys.forEach((key,i)=>{const x=268+i%3*68,y=40+Math.floor(i/3)*68,disabled=key==='minus'&&e.config.min>=0||key==='.'&&!String(e.config.step).includes('.'),focused=e.focus===key;rect(x,y,62,62,disabled?'#000':focused?'#fff':'#222',8);if(key==='minus'){if(disabled)g.drawImage(tinted(a,a.meta.icons.plusminus_60x60,'#222'),x+1,y+1);else icon('plusminus_60x60',x+1,y+1,focused);}else text(key,x+16,y+4,'large',disabled?'#222':focused?'#222':'#fff');if(!disabled)hits.push({x,y,w:62,h:62,key});});
  const prompt=label(e.prompt),lines=[],max=15;let line='';for(const word of prompt.split(' ')){if((line+' '+word).trim().length>max&&line){lines.push(line);line=word;}else line=(line+' '+word).trim();}lines.push(line);
  lines.slice(-3).forEach((s,i,all)=>text(s,Math.max(16,216-s.length*13),119-(all.length-i)*22,'big','#fff',210));
  const shown=e.special?label('Off'):e.text||'0',unit=e.unit||'',resultRight=unit?216-unit.length*13-8:228;
  text(shown,Math.max(16,resultRight-shown.length*(e.special?13:30)),e.special?136:122,e.special?'big':'large',e.initial?'#808080':'#f8651b',220);if(!e.special)text(unit,resultRight+8,147,'big','#aaa');
  const valid=e.special||e.text!==''&&Number(e.text)>=e.config.min&&Number(e.text)<=e.config.max;
  text(`${e.config.min} - ${e.config.max}`,Math.max(16,resultRight-String(`${e.config.min} - ${e.config.max}`).length*11),175,'normal',valid?'#808080':'#f8651b');
  [['ok',8,'ok_60x60'],['clear',96,'clear_60x60'],['backspace',164,'backspace_60x60']].forEach(([key,x,img])=>{const disabled=key==='ok'?!valid:e.special,focused=e.focus===key;rect(x,244,62,62,disabled?'#000':focused?'#fff':'#222',8);if(disabled)g.drawImage(tinted(a,a.meta.icons[img],'#222'),x+1,245);else icon(img,x+1,245,focused);if(!disabled)hits.push({x,y:244,w:62,h:62,key});});
  if(e.focus==='cancel')rect(8,44,32,32,'#fff',5);icon('folder_up_16x16',16,52,e.focus==='cancel');hits.push({x:8,y:44,w:32,h:32,key:'cancel'});
 }else if(state.menuId==='home'){
  menu.items.forEach((row,i)=>{const col=i%3,line=Math.floor(i/3),x=80+col*120,y=53+line*117;
   icon(row.icon+'_80x80'+(row.disabled?'_disabled':state.selected===i?'_focused':''),x,y);
   const name=label(row.disabled?'No USB':row.key);text(name,x+40-name.length*4.5,y+88,'special',row.disabled?'#888':state.selected===i?'#f8651b':'#fff',108);
   hits.push({x:x-9,y,w:99,h:108,index:i});
  });
 }else{
  const count=Math.floor(((menu.footer?297:320)-32)/40);
  state.scroll=Math.max(0,Math.min(state.scroll,state.selected));if(state.selected>=state.scroll+count)state.scroll=state.selected-count+1;
  menu.items.slice(state.scroll,state.scroll+count).forEach((row,slot)=>{
   const i=state.scroll+slot,y=32+slot*40,selected=state.selected===i,col=selected?'#000':row.disabled?'#808080':'#fff';
   if(selected)rect(5,y,462,39,row.disabled?'#808080':'#fff',5);
   const val=state.value(row),special=row.numeric?.special!==undefined&&val===row.numeric.special;let valueString=row.toggle?'':special?label('Off'):val===undefined?'':typeof val==='string'?label(val):row.key==='Nozzle Diameter'?Number(val).toFixed(2):String(val);
   const ext=row.toggle?36:row.menu?10:valueString?valueString.length*11+(!special&&row.unit?row.unit.length*9+6:0):row.status?40:0;
   if(row.icon)icon(row.icon,14,y+11,selected);
   const name=(row.number?row.number+' ':'')+label(row.key);
   text(name,41,y+10,'normal',col,Math.max(0,411-ext));
   if(row.toggle)icon(val?'switch_on_36x18':'switch_off_36x18',415,y+10,selected);
   else if(row.menu)icon('arrow_right_10x16',441,y+12,selected);
   else if(valueString){const unit=special?'':row.unit||'',right=451-(unit?unit.length*9+6:0);text(valueString,right-valueString.length*11,y+10,'normal',col);if(unit)text(unit,right+6,y+12,'special',col);}
   else if(row.status)icon('na_color_16x16',430,y+11,selected);
   if(slot<count-1)rect(46,y+39,384,1,'#5b5b5b');
   hits.push({x:5,y,w:462,h:39,index:i});
  });
  if(menu.items.length>count){const h=((menu.footer?297:320)-32),thumb=Math.max(16,Math.floor(h*count/menu.items.length)),y=32+Math.floor((h-thumb)*state.scroll/(menu.items.length-count));rect(474,32,4,h,'#242424',2);rect(474,y,4,thumb,'#aaa',2);}
 }
 if((menu.footer||op)&&!state.editing){
  const nozzle=state.values['temperature:Nozzle Temperature']||0,bed=state.values['temperature:Heatbed Temperature']||0;
  const fields=op?.kind==='coldpull'?[['nozzle_16x16',`${op.nozzle}${op.target?'/'+op.target:''}°C`],['heatbed_16x16','22°C'],['heatbreak_light_16x16','22°C']]:op?[['nozzle_16x16',`${op.nozzle}${op.target?'/'+op.target:''}°C`],['heatbed_16x16','22°C'],['filament_sensor_17x16',label(op.sensorIn?'ON ':'OFF ')],['side_filament_sensor_17x16',label('ON ')]]:[['nozzle_16x16',`${state.readings.nozzle}${nozzle?'/'+nozzle:''}°C`],['heatbed_16x16',`${state.readings.bed}${bed?'/'+bed:''}°C`],['spool_16x16',state.filamentLoaded?'PLA':'---'],['enclosure_16x16','22°C']],widths=fields.map(([,v])=>19+v.length*9),gap=(472-widths.reduce((a,b)=>a+b,0))/(fields.length-1);let x=4;
  for(let i=0;i<fields.length;i++){icon(fields[i][0],Math.round(x),301);text(fields[i][1],Math.round(x+19),301,'special');x+=widths[i]+gap;}
 }
 canvas.dataset.lcdReady='true';canvas.dataset.lcdMenu=state.menuId;canvas.dataset.lcdVersion=version;
 canvas.dataset.lcdOperation=op?.phase.name||'';
 return hits;
}
