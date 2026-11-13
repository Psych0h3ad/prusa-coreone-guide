// SPDX-License-Identifier: GPL-3.0-only
// Browser display adaptation of the accompanying Prusa-Firmware-Buddy sources.
// Icons/design retain CC BY-NC-SA4.0; bitmap glyphs retain OFL/IPA terms.
import{INITIAL_SETUP_LCD as data}from'./firmware-initial-setup-data.js?v=20261113-123';
import{loadFirmwareLCDAssets,tintedFirmwareAsset}from'./firmware-lcd.js?v=20261111-94';
import{lcdButtonRects,lcdLines}from'./firmware-lcd-layout.js?v=20261111-94';
export const INITIAL_SETUP_COPY={
 condition:['実機に合う表示例','Display example matching the printer','Ukázka podle displeje tiskárny','Zur Druckeranzeige passendes Beispiel'],
 note:['実機の案内に合う例を選びます。温度・位置・完了は実機で確認してください。','Choose the example matching the printer’s prompt. Check temperatures, positions and completion on the printer.','Zvolte ukázku podle pokynu tiskárny. Teploty, polohu a dokončení ověřte na tiskárně.','Das passende Beispiel zur Aufforderung wählen. Temperatur, Position und Abschluss am Drucker prüfen.'],
 normal:['通常の進行例','Normal sequence','Běžný průběh','Normaler Ablauf'],
 tighten:['半回転締める案内','Prompt to tighten half a turn','Pokyn k dotažení o půl otáčky','Aufforderung: halbe Umdrehung festziehen'],
 loosen:['半回転緩める案内','Prompt to loosen half a turn','Pokyn k povolení o půl otáčky','Aufforderung: halbe Umdrehung lösen'],
 gap:['指の隙間を調整する案内','Prompt to adjust the finger gap','Pokyn k úpravě mezery pro prsty','Aufforderung: Fingerspalt einstellen'],
 repeat:['調整をやり直す案内','Prompt to repeat the adjustment','Pokyn k opakování nastavení','Aufforderung: Einstellung wiederholen'],
 safety:['安全機能の確認画面','Safety-feature confirmation','Potvrzení bezpečnostních funkcí','Bestätigung der Sicherheitsfunktionen'],
 cooldown:['冷却を待つ画面が出た場合','If a cooldown screen appears','Pokud se zobrazí chlazení','Wenn die Abkühlanzeige erscheint'],
 retry:['タップの再試行画面','Tap retry screen','Obrazovka opakování klepnutí','Anzeige zum erneuten Antippen'],
 noisy:['不安定な測定の案内','Noisy-reading prompt','Pokyn při rušení měření','Aufforderung bei unruhigem Messwert'],
 failed:['失敗画面が出た場合','If a failure screen appears','Pokud se zobrazí chyba','Wenn eine Fehleranzeige erscheint'],
 sensor:['センサー不良の案内','Sensor-problem prompt','Pokyn při problému se senzorem','Aufforderung bei Sensorproblem']
};
const stages={9:'door',10:'loadcell',12:'fsensors'};
export function initialSetupCases(step){const action=stages[step?.officialStep];return action==='door'?['normal','tighten','loosen','gap','repeat','safety']:action==='loadcell'?['normal','cooldown','retry','noisy','failed']:action==='fsensors'?['normal','sensor','failed']:[];}
export function initialSetupFrames(task,step,version,{initialCase='normal'}={}){
 const action=task?.id==='initial-setup'&&stages[step?.officialStep];if(!action)return null;
 const display=data.versions[version]?.displays[action];if(!display)throw Error('Unknown initial setup firmware version');
 if(!initialSetupCases(step).includes(initialCase))initialCase='normal';
 const row=(phase,variant=null)=>{const f=display.phases.find(x=>x.phase===phase&&(x.variant||null)===variant);if(!f)throw Error('Unknown native initial phase '+phase);return{...f,id:'initial-setup-'+action+'-'+phase+(variant?'-'+variant:''),kind:'initial-setup',action,nativeTitle:display.title,nativeName:display.name||null,exampleCase:initialCase,...(action==='loadcell'?{phaseData:loadcellExampleBuffer(f)}:{})};};
 let frames;
 if(action==='door'){
  const phases=['skip_ask','confirm_closed',...(initialCase==='tighten'||initialCase==='repeat'?['tighten_screw_half',...(initialCase==='repeat'?['repeat','tighten_screw_half']:[])]:[]),'confirm_open',...(initialCase==='loosen'?['loosen_screw_half']:[]),'finger_test',...(initialCase==='gap'?['loosen_screw_quarter']:[]),'done',...(initialCase==='safety'?['ask_enable_safety_features']:[])];frames=phases.map(x=>row(x));
 }else if(action==='loadcell'){
  const prefix=[row('Loadcell_move_away'),...(initialCase==='cooldown'?[row('Loadcell_cooldown')]:[])];
  frames=initialCase==='failed'?[...prefix,row('Loadcell_fail')]:[...prefix,row('Loadcell_user_tap_ask_abort'),row('Loadcell_user_tap_countdown'),...(initialCase==='retry'||initialCase==='noisy'?[row('Loadcell_user_tap_ask_abort',initialCase==='retry'?'wrong-tap':'noisy'),row('Loadcell_user_tap_countdown')]:[]),row('Loadcell_user_tap_check'),row('Loadcell_user_tap_ok')];
 }else{
  const prefix=[row('prepare'),row('offer_unload'),row('ask_filament')];
  frames=initialCase==='failed'?[...prefix,row('calibrating'),row('failed')]:[...prefix,row('calibrating'),row('insert_filament_not_ready'),...(initialCase==='sensor'?[row('not_ready_confirm_continue')]:[]),row('insert_filament_ready'),row('calibrating'),row('success')];
 }
 return[...frames,...(step.screenPhotos||[]).map(photo=>({kind:'photo',...photo}))];
}
// SelftestLoadcell_t: progress:7/ignore:1, countdown:5/noisy:1/wrong:1/failed:1,
// signed little-endian temperature. INT16_MIN is the upstream default, not a
// made-up measured temperature. Native invalid-temperature text is "- °C".
export function loadcellExampleBuffer(frame){const progress=frame.progress??0,countdown=frame.countdown??31;return[progress, countdown|(frame.variant==='noisy'?32:0)|(frame.variant==='wrong-tap'?64:0)|(frame.failed?128:0),0,128];}
export function decodeLoadcellBuffer(b){if(!Array.isArray(b)||b.length!==4)throw Error('Expected native4-byte loadcell buffer');const raw=b[2]|b[3]<<8;return{progress:b[0]&127,ignoreNoisy:!!(b[0]&128),countdown:b[1]&31,noisy:!!(b[1]&32),wrongTap:!!(b[1]&64),failed:!!(b[1]&128),temperature:raw>=32768?raw-65536:raw};}
const extraLoads=new Map(),images=new Map();
async function extras(version){if(!extraLoads.has(version)){const p=(async()=>{const r=await fetch(new URL('./assets/firmware-ui/initial-setup/glyphs.json',import.meta.url));if(!r.ok)throw Error('Initial glyphs unavailable');const meta=(await r.json())[version],images={};await Promise.all(Object.values(meta.fonts).map(async f=>{const i=new Image();i.src=new URL('./assets/firmware-ui/initial-setup/'+version+'/'+f.file,import.meta.url);await i.decode();images[f.file]=i;}));return{meta,images,tints:new Map()};})();extraLoads.set(version,p);p.catch(()=>extraLoads.delete(version));}return extraLoads.get(version);}
async function picture(version,name){if(!name)return null;const k=version+'/'+name;if(!images.has(k)){const p=(async()=>{const i=new Image();i.src=new URL('./assets/firmware-ui/initial-setup/'+k,import.meta.url);await i.decode();return i;})();images.set(k,p);p.catch(()=>images.delete(k));}return images.get(k);}
export async function paintInitialSetupLCD(canvas,{frame,version='8.0.0',language='ja'}={}){
 if(frame?.kind!=='initial-setup')throw Error('Expected native initial setup frame');
 const[a,e,img,headerIcon]=await Promise.all([loadFirmwareLCDAssets(version),extras(version),picture(version,frame.image),picture(version,'selftest_16x16.png')]);if(!canvas.isConnected)return;
 const label=k=>data.versions[version].labels[k]?.[language]??k,g=canvas.getContext('2d',{alpha:false}),diagnostics=[];
 g.imageSmoothingEnabled=false;g.fillStyle='#000';g.fillRect(0,0,480,320);
 function text(s,x,y,font='normal',color='#fff'){let i=0;for(const c of Array.from(s)){const source=a.meta.fonts[font].characters.includes(c)?a:e,f=source.meta.fonts[font],k=f.characters.indexOf(c);if(k<0)throw Error('Missing native calibration glyph '+c);g.drawImage(tintedFirmwareAsset(source,f.file,color),k%16*f.width,Math.floor(k/16)*f.height,f.width,f.height,x+i*f.width,y,f.width,f.height);i++;}}
 function block(s,r,font='normal',align='left',vertical='top',color='#fff'){
  const f=a.meta.fonts[font],lines=lcdLines(label(s),Math.floor(r.w/f.width)),height=lines.length*f.height;diagnostics.push({text:label(s),...r,font,lines,overflow:height>r.h});g.save();g.beginPath();g.rect(r.x,r.y,r.w,r.h);g.clip();const top=r.y+(vertical==='center'?Math.floor((r.h-height)/2):vertical==='bottom'?r.h-height:0);lines.forEach((l,i)=>text(l,r.x+(align==='center'?Math.floor((r.w-Array.from(l).length*f.width)/2):0),top+i*f.height,font,color));g.restore();
 }
 function qr(suffix,r){const q=data.qrs[suffix],border=2,ppm=Math.max(1,Math.floor(Math.min(r.w,r.h)/(q.size+2*border))),size=ppm*(q.size+4),x=r.x+Math.floor((r.w-size)/2),y=r.y;g.fillStyle='#fff';g.fillRect(x,y,size,size);g.fillStyle='#000';q.matrix.forEach((row,j)=>row.forEach((v,i)=>{if(v)g.fillRect(x+(i+border)*ppm,y+(j+border)*ppm,ppm,ppm);}));}
 g.drawImage(headerIcon,14,12);text(label(frame.nativeTitle),34,13,'special');
 const load=frame.action==='loadcell',footer=load||frame.action==='fsensors',buttonY=footer?255:278,buttonRect={x:6,y:buttonY,w:468,h:32};
 if(load){
  const dt=decodeLoadcellBuffer(frame.phaseData);block('Loadcell Test',{x:24,y:40,w:432,h:22});g.fillStyle='#5b5b5b';g.fillRect(24,64,432,3);g.fillStyle='#f8651b';g.fillRect(24,64,Math.floor(432*dt.progress/100),3);
  if(frame.layout==='loadcell-result')block(frame.text,{x:24,y:67,w:432,h:188},'normal','center','center');
  else{block(frame.text,{x:24,y:75,w:frame.layout==='loadcell-qr'?297:432,h:66});if(img)g.drawImage(img,316,147);if(frame.large){const large=frame.phase==='Loadcell_cooldown'?(dt.temperature<0||dt.temperature>999?'- °C':dt.temperature+' °C'):frame.phase==='Loadcell_user_tap_countdown'?Math.min(5,dt.countdown)+' s':frame.large;block(large,{x:0,y:171,w:316,h:22},'big','center','center');}if(frame.link){qr(frame.link,{x:326,y:67,w:130,h:130});block('More details at',{x:24,y:197,w:432,h:22},'special');block('prusa.io/'+frame.link,{x:24,y:219,w:432,h:22},'special');}}
 }else if(frame.layout==='wait'){
  block('Please wait',{x:0,y:62,w:480,h:30},'big','center','center');block(frame.text,{x:6,y:99,w:468,h:60},'special','center','center');
 }else if(frame.layout==='spool'){
  g.drawImage(img,24,106);block(frame.text,{x:148,y:67,w:308,h:188},'normal','left','center');
 }else if(frame.layout==='filament'){
  block(frame.text,{x:24,y:67,w:258,h:188},'normal','left','center');g.drawImage(img,306,96);
 }else if(frame.layout==='finger'){
  block(frame.text,{x:24,y:64,w:262,h:192});g.drawImage(img,286,64);
 }else if(frame.layout==='qr'){
  // FrameQRPrompt's large-display two-column layout, with the versioned
  // frame inset. QR matrix follows draw_qr LOW/AUTO/boost and two-cell border.
  const inset=version==='8.0.0'?14:24,top=version==='8.0.0'?44:40,left=480-2*inset-130-16;
  block(frame.text,{x:inset,y:top,w:left,h:190});qr(frame.link,{x:inset+left+16,y:top,w:130,h:130});block('Scan me!',{x:inset+left+16,y:top+130,w:130,h:38},'normal','center');block('More details at',{x:inset,y:234,w:432,h:22},'special');block('prusa.io/'+frame.link,{x:inset,y:256,w:432,h:22},'special');
 }else if(frame.layout==='prompt'){
  block(frame.promptTitle,{x:16,y:32,w:448,h:32},'big','left','bottom','#f8651b');g.fillStyle='#454545';g.fillRect(16,68,448,2);block(frame.text,{x:16,y:86,w:448,h:footer?169:192});
 }else block(frame.text,{x:16,y:48,w:448,h:buttonY-48},'normal','left','center');
 const buttons=lcdButtonRects(frame.buttons,label,buttonRect);for(const[i,b]of buttons.entries()){g.fillStyle=i===0?'#f8651b':'#808080';g.beginPath();g.roundRect(b.x,b.y,b.w,b.h,8);g.fill();block(b.key,b,'big','center','center',i===0?'#000':'#fff');}
 // No invented live temperatures, sensor readings or printer positions.
 // The controller's footer region stays reserved; this is a phase guide.
 canvas.dataset.lcdReady='true';canvas.dataset.lcdVersion=version;canvas.dataset.lcdMenu='initial-setup';canvas.dataset.lcdOperation=frame.phase;canvas.dataset.lcdFrameId=frame.id;
 return{version,language,phase:frame.phase,id:frame.id,diagnostics,buttons,buttonLabels:buttons.map(b=>({key:b.key,label:label(b.key)})),nativePhaseData:frame.phaseData||null,telemetryPainted:false};
}
