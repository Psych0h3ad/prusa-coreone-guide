// SPDX-License-Identifier: GPL-3.0-only
// Read-only CORE One examples adapted from Buddy v8.0.0 / v6.5.7.
// Original sources, notices and rebuild recipe accompany maintenance-native/.
import {MAINTENANCE_LCD as data} from './firmware-manual-load-data.js?v=20261113-124';
import {FIRMWARE_UI} from './firmware-ui-data.js?v=20261111-94';
import {FirmwareLCDState} from './firmware-lcd-state.js?v=20261111-94';
import {loadFirmwareLCDAssets,tintedFirmwareAsset,paintFirmwareLCD} from './firmware-lcd.js?v=20261111-94';
import {lcdButtonRects,lcdLines} from './firmware-lcd-layout.js?v=20261111-94';

export const MAINTENANCE_DISPLAY_COPY={
 original:['作業前のフィラメント検知（表示例）','Filament sensing before the task (example)','Detekce filamentu před úkonem (příklad)','Filamenterkennung vor der Arbeit (Beispiel)'],
 on:['ONだった','Was ON','Byla zapnutá','War EIN'],off:['OFFだった','Was OFF','Byla vypnutá','War AUS'],
 loadCase:['実機の色確認（表示例）','Printer colour check (example)','Kontrola barvy na tiskárně (příklad)','Farbprüfung am Drucker (Beispiel)'],
 normal:['正しく吐出した場合','If extrusion is correct','Pokud je extruze správná','Wenn die Extrusion stimmt'],
 purge:['追加パージが必要な場合','If more purging is needed','Pokud je třeba další proplach','Wenn mehr Spülen nötig ist'],
 note:['実機で操作してください。画面は条件付きの表示例です。温度・進行率は実測値ではありません。ロード済みの確認や色指定など、追加の案内が出た場合は実機に従ってください。','Operate the printer itself. These are conditional display examples, not measured temperatures or progress. Follow any additional printer prompts, such as an already-loaded warning or colour selection.','Ovládejte skutečnou tiskárnu. Jde o podmíněné příklady displeje, nikoli naměřené teploty či průběh. Další výzvy, například již zavedený filament nebo volbu barvy, řešte podle tiskárny.','Am echten Drucker bedienen. Dies sind bedingte Anzeigebeispiele, keine gemessenen Temperaturen oder Fortschritte. Zusätzliche Abfragen, etwa bereits geladenes Filament oder Farbauswahl, am Drucker befolgen.'],
 before:['元の設定を確認する','Check the original setting','Ověřit původní nastavení','Ursprüngliche Einstellung prüfen'],
 disable:['フィラメント検知をOFFにする','Turn filament sensing OFF','Vypnout detekci filamentu','Filamenterkennung ausschalten'],
 restore:['元の設定に戻す','Restore the original setting','Obnovit původní nastavení','Ursprüngliche Einstellung wiederherstellen'],
 disabledAlready:['元からOFFなら、そのまま保つ','If already OFF, keep it OFF','Pokud byla vypnutá, ponechat vypnutou','Wenn bereits AUS, ausgeschaltet lassen'],
 selectPLA:['PLAを選ぶ（標準プリセットの例）','Select PLA (standard preset example)','Vybrat PLA (příklad standardního profilu)','PLA wählen (Beispiel des Standardprofils)']
};
export function maintenanceNativeFrames(task,step,version,{sensorOriginal='on',loadCase='normal'}={}){
 if(task.id!=='coldpull-manual'||!['manual-sensor-off','manual-load','manual-result'].includes(step.id))return null;
 if(!['on','off'].includes(sensorOriginal)||!['normal','purge'].includes(loadCase))throw Error('Unknown maintenance display example');
 const f=(phase,extra={})=>({kind:'maintenance-native',action:'manual-load',phase,id:step.id+':'+phase,...extra}),menu=(id,selected,phase,extra={})=>f(phase,{layout:'menu',menu:id,selected,...extra});
 if(step.id!=='manual-load'){
  const restore=step.id==='manual-result',target=restore?sensorOriginal:'off';
  return[menu('home','Settings','home-settings'),menu('settings','Filament Sensors','settings-sensors'),menu('sensors','Filament Sensing','sensing-before',{sensorOn:restore?false:sensorOriginal==='on',title:MAINTENANCE_DISPLAY_COPY.before}),...(!restore&&sensorOriginal==='off'?[]:[menu('sensors','Filament Sensing',restore?'sensing-restored':'sensing-off',{sensorOn:target==='on',title:MAINTENANCE_DISPLAY_COPY[restore?(sensorOriginal==='on'?'restore':'disabledAlready'):'disable']})])];
 }
 const spec=data.versions[version];if(!spec)throw Error('Unsupported maintenance LCD version');
 const frames=[menu('home','Filament','home-filament'),menu('filament','Load Filament','filament-load'),menu('preheat','PLA','select-PLA',{title:MAINTENANCE_DISPLAY_COPY.selectPLA}),...spec.phases.map(p=>f(p.phase,{layout:'load',...p}))];
 if(loadCase==='purge'){const p=spec.phases.find(p=>p.phase==='Purging_stoppable'),q=spec.phases.at(-1);frames.push(f(p.phase,{layout:'load',...p,id:'manual-load:purge-again'}),f(q.phase,{layout:'load',...q,id:'manual-load:colour-again'}));}
 return frames;
}
const extraLoads=new Map();
async function extras(version){if(!extraLoads.has(version)){const p=(async()=>{const r=await fetch(new URL('./assets/firmware-ui/maintenance-native/glyphs.json?v=20261113-124',import.meta.url));if(!r.ok)throw Error('Maintenance glyphs: '+r.status);const meta=(await r.json())[version],images={};await Promise.all(Object.values(meta.fonts).map(async f=>{const i=new Image();i.src=new URL('./assets/firmware-ui/maintenance-native/'+version+'/'+f.file+'?v=20261113-124',import.meta.url);await i.decode();images[f.file]=i;}));return{meta,images,tints:new Map()};})();extraLoads.set(version,p);p.catch(()=>extraLoads.delete(version));}return extraLoads.get(version);}

export async function paintMaintenanceLCD(canvas,{frame,version='8.0.0',language='ja'}={}){
 if(frame?.kind!=='maintenance-native')throw Error('Expected maintenance-native frame');
 const d=data.versions[version],fw=FIRMWARE_UI.versions[version],label=k=>d.labels[k]?.[language]??fw.labels[k]?.[language]??k;
 if(['home','settings','filament'].includes(frame.menu)){
  const key=frame.menu==='settings'?'Settings':frame.menu==='filament'?'Filament':frame.selected;
  const state=new FirmwareLCDState(fw,[key]);state.menuId=frame.menu;state.selected=state.menu.items.findIndex(r=>r.key===frame.selected);state.scroll=0;
  const result=await paintFirmwareLCD(canvas,{version,language,label,state});if(canvas.isConnected){canvas.dataset.lcdFrameId=frame.id;canvas.dataset.lcdOperation=frame.phase;canvas.dataset.lcdMaintenance='true';}return{hits:result,diagnostics:[],telemetryPainted:true,phase:frame.phase};
 }
 const[a,e]=await Promise.all([loadFirmwareLCDAssets(version),extras(version)]);if(!canvas.isConnected)return;
 const g=canvas.getContext('2d',{alpha:false}),diagnostics=[],glyphs=[];g.imageSmoothingEnabled=false;g.fillStyle='#000';g.fillRect(0,0,480,320);
 function text(s,x,y,kind='normal',color='#fff'){for(const[i,c]of Array.from(String(s)).entries()){const z=a.meta.fonts[kind].characters.includes(c)?a:e,f=z.meta.fonts[kind],k=f.characters.indexOf(c);if(k<0)throw Error('Missing native maintenance glyph '+c);g.drawImage(tintedFirmwareAsset(z,f.file,color),k%16*f.width,Math.floor(k/16)*f.height,f.width,f.height,x+i*f.width,y,f.width,f.height);glyphs.push({char:c,font:kind,extra:z===e});}}
 function block(s,r,kind='normal',center=false,color='#fff'){const f=a.meta.fonts[kind],lines=lcdLines(label(s),Math.floor(r.w/f.width));diagnostics.push({text:label(s),rect:r,font:kind,lines,overflow:lines.length*f.height>r.h});g.save();g.beginPath();g.rect(r.x,r.y,r.w,r.h);g.clip();lines.forEach((s,i)=>text(s,r.x+(center?Math.floor((r.w-Array.from(s).length*f.width)/2):0),r.y+i*f.height,kind,color));g.restore();}
 function icon(k,x,y,invert=false){const file=a.meta.icons[k];if(!file)throw Error('Missing native icon '+k);g.drawImage(invert?tintedFirmwareAsset(a,file,'',true):a.images[file],x,y);}
 const rect=(r,color,radius=0)=>{g.fillStyle=color;g.beginPath();g.roundRect(r.x,r.y,r.w,r.h,radius);g.fill();};
 if(frame.layout==='menu'){
  const sensor=frame.menu==='sensors',rows=sensor?[{key:'Return',back:true},{key:'Filament Sensing',toggle:true,on:frame.sensorOn},{key:'Side Filament Sensor',toggle:true,on:true,disabled:!frame.sensorOn},{key:'Toolhead Filament Sensor',toggle:true,on:true,disabled:!frame.sensorOn},{key:'Restore Defaults'}]:[{key:'Return',back:true},...Object.entries(d.presets).map(([key,v])=>({key,info:v[0]+'/'+String(v[1]).padEnd(3,' ')})),{key:'Show All'}];
  text(label(sensor?'FILAMENT SENSORS':d.preheatTitle),14,13,'special');
  const count=sensor?6:7;rows.slice(0,count).forEach((r,i)=>{const y=32+i*40,selected=r.key===frame.selected,col=selected?'#000':r.disabled?'#808080':'#fff';if(selected)rect({x:5,y,w:462,h:39},'#fff',5);if(r.back)icon('folder_up_16x16',14,y+11,selected);block(r.key,{x:41,y:y+10,w:r.toggle?366:r.info?313:411,h:19},'normal',false,col);if(r.toggle)icon(r.on?'switch_on_36x18':'switch_off_36x18',415,y+10,selected);if(r.info)text(r.info,451-r.info.length*11,y+10,'normal',col);if(i<count-1)rect({x:46,y:y+39,w:384,h:1},'#5b5b5b');});if(rows.length>count){rect({x:474,y:32,w:4,h:288},'#242424',2);rect({x:474,y:32,w:4,h:Math.floor(288*count/rows.length)},'#aaa',2);}
  // The footer is reserved without invented live readings. Individual sensor
  // enable bits are the default example, greyed while the global switch is OFF.
 }else{
  const layout=fw.operations.unload.layout;
  if(version==='6.5.7')text(label(d.title),14,13,'special');
  block(d.title,layout.title,'big',true);rect(layout.bar,'#5b5b5b',layout.bar.radius);rect({...layout.bar,w:Math.floor(layout.bar.w*frame.progress/100)},'#f8651b',layout.bar.radius);
  const nr=layout.number,fh=a.meta.fonts.big.height;block(frame.progress+'%',{...nr,y:nr.y+Math.floor((nr.h-fh)/2)},'big',true);
  // FrameProgress::get_label_rect reaches the radio-button top; the legacy
  // unload adapter's shorter label box would clip v8's three-line German text.
  block(frame.text,{...layout.label,h:layout.buttons.y-layout.label.y},'special',true);
  const buttons=lcdButtonRects(frame.buttons,label,layout.buttons);buttons.forEach((b,i)=>{rect(b,i===0?'#f8651b':'#808080',8);block(b.key,{...b,y:b.y+Math.floor((b.h-a.meta.fonts.big.height)/2)},'big',true,i===0?'#000':'#fff');});
  // Native Load mode displays the selected material above the radio buttons.
  text('PLA',Math.floor((480-33)/2),233); 
 }
 canvas.dataset.lcdReady='true';canvas.dataset.lcdVersion=version;canvas.dataset.lcdMenu=frame.menu||'load';canvas.dataset.lcdOperation=frame.phase;canvas.dataset.lcdFrameId=frame.id;canvas.dataset.lcdMaintenance='true';
 canvas.dataset.lcdNativeOverflow=String(diagnostics.some(x=>x.overflow));canvas.dataset.lcdGlyphCount=String(glyphs.length);
 return{phase:frame.phase,id:frame.id,diagnostics,glyphs,telemetryPainted:false,exampleProgress:frame.progress??null,sourceVersion:version};
}
