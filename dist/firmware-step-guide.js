// SPDX-License-Identifier: GPL-3.0-only
// Read-only, step-synchronised displays. Native firmware pixels are retained.
import {initialSetupFrames,initialSetupCases,INITIAL_SETUP_COPY,paintInitialSetupLCD} from './firmware-initial-setup.js?v=20261113-123';
import {FIRMWARE_UI} from './firmware-ui-data.js?v=20261111-94';
import {FirmwareLCDState} from './firmware-lcd-state.js?v=20261111-94';
import {paintFirmwareLCD} from './firmware-lcd.js?v=20261111-94';
import {paintGearboxLCD,gearboxPhases} from './firmware-gearbox.js?v=20261112-103';
import {createFirmwareDisplayViewer} from './firmware-display-viewer.js?v=20261112-103';
import {firmwareActions} from './firmware-navigation.js?v=20261113-117';
import {gearboxInstructionFrames,selftestInstructionFrames,nozzleSettingFrames} from './firmware-service-instructions.js?v=20261113-123';
import {SENSOR_GEARBOX_CLOSE} from './sensor-service-data.js?v=20261111-94';
import {maintenanceNativeFrames,paintMaintenanceLCD,MAINTENANCE_DISPLAY_COPY} from './firmware-maintenance-native.js?v=20261113-124';
const copy={
 title:['プリンターの表示','Printer display','Displej tiskárny','Druckerdisplay'],
 work:['実機で行う作業','Work on the printer','Práce na tiskárně','Arbeit am Drucker'],
 instructions:['手順へ','Instructions','K postupu','Zur Anleitung'],
 previous:['前の画面','Previous screen','Předchozí obrazovka','Vorherige Anzeige'],next:['次の画面','Next screen','Další obrazovka','Nächste Anzeige'],
 options:['表示の設定・操作練習','Display options & practice','Nastavení displeje a procvičení','Anzeigeoptionen und Übung'],
 displaySettings:['表示の設定','Display settings','Nastavení displeje','Anzeigeeinstellungen'],
 gearboxCondition:['実機に表示された確認画面','Confirmation shown on the printer','Potvrzení zobrazené na tiskárně','Am Drucker angezeigte Abfrage'],
 gearboxUnknown:['フィラメントなしを確認する画面','Confirm that filament is absent','Potvrzení nepřítomnosti filamentu','Abfrage, ob Filament entfernt ist'],
 gearboxLoaded:['アンロードの案内','Unload prompt','Výzva k vysunutí filamentu','Aufforderung zum Entladen'],
 gearboxEmpty:['確認画面なし','No confirmation screen','Bez potvrzovací obrazovky','Keine Bestätigungsabfrage'],
 gearboxExample:['図は表示例です。作業と画面操作は実機で行います。確認画面の種類は「表示の設定」で選べます。','This is a display example. Perform the work and screen actions on the printer. Choose its confirmation screen in Display settings.','Toto je ukázka displeje. Práci a ovládání provádějte na skutečné tiskárně. Její potvrzovací obrazovku vyberte v Nastavení displeje.','Dies ist ein Anzeigebeispiel. Arbeiten und Bedienung am echten Drucker durchführen. Die Bestätigungsabfrage unter Anzeigeeinstellungen wählen.'],
 loading:['画面を読み込み中です。','Loading the display.','Načítání displeje.','Anzeige wird geladen.'],
 version:['ファームウェア','Firmware','Firmware','Firmware'],language:['画面の言語','Display language','Jazyk displeje','Displaysprache'],
 practice:['操作を試す','Try the controls','Vyzkoušet ovládání','Bedienung ausprobieren'],
 nozzleQuestion:['ノズル径・種類・シリコンソックの有無を変更しましたか？','Did you change the nozzle diameter, type or silicone sock?','Změnili jste průměr či typ trysky nebo silikonový návlek?','Wurden Düsendurchmesser, Düsentyp oder Silikonsocke geändert?'],
 nozzleChanged:['変更した','Changed','Změněno','Geändert'],nozzleUnchanged:['変更していない','Unchanged','Beze změny','Unverändert'],nozzleUnknown:['まだ分からない','Not sure yet','Zatím nevím','Noch unklar'],
 nozzleReview:['変更内容を選び直す','Review the change','Znovu zvolit změnu','Änderung erneut auswählen'],
 photoLoading:['写真を読み込んでいます…','Loading photo…','Načítání fotografie…','Foto wird geladen…'],photoFailed:['写真を読み込めませんでした。','The photo could not load.','Fotografii se nepodařilo načíst.','Das Foto konnte nicht geladen werden.'],retryPhoto:['再読み込み','Reload','Znovu načíst','Neu laden'],
 fullPhoto:['写真全体を開く','Open full photo','Otevřít celou fotografii','Vollständiges Foto öffnen'],
 enlarge:['画面を拡大','Enlarge display','Zvětšit displej','Display vergrößern'],close:['閉じる','Close','Zavřít','Schließen'],
 zoomIn:['拡大','Zoom in','Zvětšit','Vergrößern'],zoomOut:['縮小','Zoom out','Zmenšit','Verkleinern'],fit:['全体を表示','Show all','Zobrazit vše','Alles anzeigen'],
 pan:['拡大した表示は上下左右にスクロールできます。','Scroll in any direction to read the enlarged display.','Zvětšený obsah lze posouvat všemi směry.','Die vergrößerte Anzeige lässt sich in alle Richtungen verschieben.'],
 printerChoice:['実機では「{button}」を選びます。','On the printer, select “{button}”.','Na tiskárně zvolte „{button}“.','Am Drucker „{button}“ wählen.'],
 photo:['公式写真・画面内の表記は原文','Official photo · original screen language','Oficiální fotografie · původní jazyk displeje','Offizielles Foto · ursprüngliche Displaysprache'],
 source:['この手順の公式ガイド ↗','Official guide for this step ↗','Oficiální návod k tomuto kroku ↗','Offizieller Leitfaden zu diesem Schritt ↗'],
 example:['温度や進行率は表示例です。作業は実機の表示に従ってください。','Temperatures and progress are examples. Follow the actual printer during the task.','Teploty a průběh jsou ukázkové. Při práci se řiďte skutečnou tiskárnou.','Temperaturen und Fortschritt sind Beispiele. Bei der Arbeit dem tatsächlichen Drucker folgen.'],
 absent:['この手順ではプリンターの画面操作はありません。手順または3Dモデルを確認してください。','This step has no printer display operation. Check the instructions or 3D model.','V tomto kroku se displej neovládá. Prohlédněte si postup nebo 3D model.','Dieser Schritt erfordert keine Displaybedienung. Anleitung oder 3D-Modell ansehen.'],
 failed:['画面例を読み込めませんでした。実機の表示と、この手順の説明を確認してください。','The display example could not load. Follow your printer display and the instructions for this step.','Ukázku displeje se nepodařilo načíst. Řiďte se displejem tiskárny a pokyny tohoto kroku.','Das Anzeigebeispiel konnte nicht geladen werden. Die Anzeige am Drucker und die Anleitung dieses Schritts beachten.']
};
Object.assign(copy,Object.fromEntries(Object.entries(MAINTENANCE_DISPLAY_COPY).map(([k,v])=>["maintenance_"+k,v])));
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function firmwareFrames(task,step,version=FIRMWARE_UI.defaultVersion,{nozzleDecision='unknown',gearboxCase='unknown',initialCase='normal',sensorOriginal='on',loadCase='normal'}={}){
 const maintenance=maintenanceNativeFrames(task,step,version,{sensorOriginal,loadCase});if(maintenance)return maintenance;
 if(!['unknown','changed','unchanged'].includes(nozzleDecision))throw Error('Unknown nozzle decision');
 const initial=initialSetupFrames(task,step,version,{initialCase});if(initial)return initial;
 if(step.screenPhotos||step.sensorGearboxPhase){
  const photos=(step.screenPhotos||[]).map(photo=>({kind:'photo',...photo}));
  if(!step.sensorGearboxPhase&&(task.id!=='initial-setup'||step.officialStep!==11))return photos;
  const [open,align,tighten,close]=gearboxInstructionFrames(),work={loosen_screws:open,alignment:align,tighten_screws:tighten,done:close};
  const intro={title:['位置合わせを始める','Start gearbox alignment','Spuštění zarovnání převodovky','Getriebeausrichtung starten'],body:[
   '組み立てたギアボックスは、位置合わせを行います。実機で続行ボタンを選び、画面の指示に従ってください。',
   'Run alignment for the gearbox you assembled. Choose the continue button on the printer and follow its instructions.',
   'U sestavené převodovky proveďte zarovnání. Na tiskárně zvolte tlačítko pro pokračování a postupujte podle jejích pokynů.',
   'Das montierte Getriebe ausrichten. Am Drucker die Taste zum Fortfahren wählen und dessen Anweisungen folgen.']};
  const condition={title:['フィラメントがないことを確認する','Check that filament is absent','Ověření nepřítomnosti filamentu','Prüfen, ob Filament entfernt ist'],body:[
   'Nextruderにフィラメントが残っていないことを確認します。実機がアンロードを案内した場合は、先にその手順を完了させてください。',
   'Check that no filament remains in the Nextruder. If the printer asks for unloading, finish that procedure first.',
   'Ověřte, že v Nextruderu nezůstal filament. Pokud tiskárna vyžádá vysunutí, nejdříve dokončete tento postup.',
   'Prüfen, ob sich kein Filament mehr im Nextruder befindet. Fordert der Drucker zum Entladen auf, dieses zuerst abschließen.']};
  const result=[...gearboxPhases(gearboxCase).map(phase=>({...(work[phase]??(phase==='intro'?intro:condition)),kind:'gearbox',phase,action:'gearbox'})),...photos];
  if(!step.sensorGearboxPhase)return result;
  if(step.sensorGearboxPhase==='intro')return result.filter(frame=>frame.phase==='intro'||frame.phase.startsWith('filament_'));
  const {title,body}=SENSOR_GEARBOX_CLOSE;
  return result.filter(frame=>frame.phase===step.sensorGearboxPhase).map(frame=>frame.phase==='done'?{...frame,title,body}:frame);
 }
 const fw=FIRMWARE_UI.versions[version],frames=[];
 const menus=action=>{const path=fw.paths[action];for(let depth=0;depth<=path.length;depth++)frames.push({kind:'menu',action,depth});};
 const phases=(action,names)=>names.forEach(phase=>frames.push({kind:'operation',action,phase}));
 if(step.firmwarePhases){
  if(step.firmwareMenu){menus('coldpull');frames.pop();}
  phases('coldpull',step.firmwarePhases);
  return frames;
 }
 for(const action of firmwareActions(task,step)){
  if(action==='printhead'){
   const {condition,settings}=nozzleSettingFrames();frames.push({...condition,nozzleChoice:true});
   if(nozzleDecision==='unknown')break;
   if(nozzleDecision==='unchanged'){
    frames.push({kind:'instruction',id:'nozzle-settings-kept',title:['今の設定を保つ','Keep the current settings','Ponechte stávající nastavení','Aktuelle Einstellungen beibehalten'],body:[
     'ノズル径・種類・シリコンソックの装着状態は変更していないため、今の設定を保ちます。実物と設定が一致していることを確認し、次の作業へ進んでください。',
     'The nozzle diameter, type and silicone sock are unchanged. Keep the current settings, check that they match the installed parts, then continue with the next task.',
     'Průměr a typ trysky ani nasazení silikonového návleku se nezměnily. Ponechte stávající nastavení, ověřte shodu s nasazenými díly a pokračujte dalším úkonem.',
     'Düsendurchmesser, Düsentyp und Silikonsocke sind unverändert. Aktuelle Einstellungen beibehalten, mit den eingebauten Teilen vergleichen und mit der nächsten Arbeit fortfahren.']});
    continue;
   }
   menus(action);
   for(const setting of settings)frames.push({kind:'menu',action,depth:fw.paths[action].length,...setting});
   continue;
  }
  if(action==='selftest'){
   const [sheet,remaining,results]=selftestInstructionFrames();frames.push(sheet);menus(action);
   frames.at(-1).selectedKey=fw.menus.tests.items.find(r=>!r.back).key;
   frames.push(remaining,results);continue;
  }
  menus(action);
  if(action==='unload'){frames.pop();phases(action,['initial','Parking_stoppable','WaitingTemp_stoppable','Ramming_stoppable','Unloading_stoppable','Unparking']);}
 }
 return frames.filter((frame,i)=>{
  const previous=frames[i-1];if(frame.body||frame.kind!=='menu'||previous?.kind!=='menu'||frame.action!==previous.action)return true;
  const a=firmwareFrameState(previous,version),b=firmwareFrameState(frame,version);
  return a.menuId!==b.menuId||a.selected!==b.selected;
 });
}
export function firmwareFrameState(frame,version){
 if(!['menu','operation'].includes(frame.kind))throw Error('Only native menu and operation frames have an LCD state');
 const fw=FIRMWARE_UI.versions[version],state=new FirmwareLCDState(fw,fw.paths[frame.action]);
 if(frame.kind==='operation'){
  state.goto(state.path.length);
  state.operation.index=state.operation.sequence.indexOf(frame.phase);
  if(state.operation.index<0)throw Error('Unknown firmware phase '+frame.phase);
  state.operation.setProgress(50);
 }else{
  // Show a selected menu item rather than opening an editable numeric keypad.
  state.goto(Math.min(frame.depth,state.path.length-1));
  if(frame.depth===state.path.length){const row=state.menu.items.findIndex(r=>r.key===state.target);if(row>=0&&state.menu.items[row].menu)state.next();}
  const selected=state.menu.items.findIndex(r=>r.key===(frame.selectedKey||state.target));if(selected>=0)state.selected=selected;
 }
 return state;
}
export function createFirmwareStepGuide(host,{language=()=> 'en',onPractice=()=>{},onChange=()=>{}}={}){
 let task,step,frames=[],index=0,identity='',generation=0,version=FIRMWARE_UI.defaultVersion,displayLanguage=language();
 let displayLanguageInitialized=false,hasStoredDisplayLanguage=false;
 // Decisions belong to this repair visit. A reload asks again, rather than
 // carrying a previous nozzle change into a later repair on the same printer.
 const initialCases=new Map(),nozzleDecisions=new Map(),gearboxCases=new Map(),decision=()=>nozzleDecisions.get(identity)||'unknown',gearboxCase=()=>gearboxCases.get(identity)||'unknown';
 let sensorOriginal='on',loadCase='normal';
 const rebuild=()=>{frames=firmwareFrames(task,step,version,{nozzleDecision:decision(),gearboxCase:gearboxCase(),initialCase:initialCases.get(identity)||'normal',sensorOriginal,loadCase});index=Math.max(0,Math.min(index,frames.length-1));};
 const ix=()=>({ja:0,en:1,cs:2,de:3}[language()]??1),c=k=>copy[k][ix()],label=k=>FIRMWARE_UI.versions[version].labels[k]?.[displayLanguage]||k;
 const enlargement=createFirmwareDisplayViewer(c);
 try{const pref=JSON.parse(localStorage.getItem('prusa-firmware-navigation-v1'))||{};if(FIRMWARE_UI.versions[pref.version])version=pref.version;if(['ja','en','cs','de'].includes(pref.language)){displayLanguage=pref.language;hasStoredDisplayLanguage=true;}}catch{}
 const readonly=value=>Array.isArray(value)?Object.freeze(value.map(readonly)):value&&typeof value==='object'?Object.freeze(Object.fromEntries(Object.entries(value).map(([k,v])=>[k,readonly(v)]))):value;
 const currentFrame=()=>Object.freeze({taskId:task?.id,stepIndex:task?.steps.indexOf(step)??-1,officialStep:step?.officialStep??null,frameIndex:index,frameCount:frames.length,nativeFrameCount:frames.filter(f=>['initial-setup','gearbox','menu','operation'].includes(f.kind)).length,frame:frames[index]?readonly(frames[index]):null,version,language:displayLanguage});
 function render(){
  const settingsOpen=!!host.querySelector('.display-options')?.open;
  const focusedSetting=['data-display-version','data-display-language','data-display-sensor-original','data-display-load-case','data-display-gearbox-case','data-display-initial-case'].find(key=>host.contains(document.activeElement)&&document.activeElement?.hasAttribute(key));
  enlargement.close();
  const draw=++generation,frame=frames[index],photo=frame?.kind==='photo',instruction=frame?.kind==='instruction',gearbox=frame?.kind==='gearbox',maintenance=frame?.kind==='maintenance-native',hasNozzle=frames.some(f=>f.nozzleChoice),showGearboxCondition=gearbox&&(!step.sensorGearboxPhase||step.sensorGearboxPhase==='intro');
  const initial=frame?.kind==='initial-setup',setupCases=task.id==='initial-setup'?initialSetupCases(step):[],ic=key=>INITIAL_SETUP_COPY[key][ix()];
  const nozzleChoice=frame?.nozzleChoice?`<fieldset class="display-nozzle-choice"><legend>${esc(c('nozzleQuestion'))}</legend>${[['changed','nozzleChanged'],['unchanged','nozzleUnchanged'],['unknown','nozzleUnknown']].map(([value,key])=>`<label><input type="radio" name="display-nozzle-change" data-display-nozzle value="${value}" ${decision()===value?'checked':''}><span>${esc(c(key))}</span></label>`).join('')}</fieldset>`:'';
  const maintenanceOptions=maintenance?`<label>${esc(c(step.id==='manual-load'?'maintenance_loadCase':'maintenance_original'))}<select ${step.id==='manual-load'?'data-display-load-case':'data-display-sensor-original'}>${(step.id==='manual-load'?[['normal','maintenance_normal'],['purge','maintenance_purge']]:[['on','maintenance_on'],['off','maintenance_off']]).map(([value,key])=>`<option value="${value}" ${value===(step.id==='manual-load'?loadCase:sensorOriginal)?'selected':''}>${esc(c(key))}</option>`).join('')}</select></label>`:'';
  const crop=frame?.crop,photoImage=photo?`<img src="${esc(frame.url)}" alt="${esc(step.title[ix()])} · ${esc(c('photo'))}" decoding="async" ${crop?`style="width:${crop[4]/crop[2]*100}%;height:${crop[5]/crop[3]*100}%;left:${-crop[0]/crop[2]*100}%;top:${-crop[1]/crop[3]*100}%"`:''}>`:'';
  const phaseBody=frame?.body&&!instruction?`<div class="display-setting-note"><strong>${esc(frame.title[ix()])}</strong><p>${esc(frame.body[ix()])}</p></div>`:'';
  host.innerHTML=`<div class="display-step-heading"><button class="display-back" data-service-view="guide">← ${esc(c('instructions'))}</button><span>${esc(c('title'))} · ${task.steps.indexOf(step)+1} / ${task.steps.length}</span><strong>${esc(step.title[ix()])}</strong></div>${frame?`
   ${task.id==='initial-setup'?`<details class="display-task-instructions" data-display-task-instructions><summary style="min-height:44px;padding:10px 0;box-sizing:border-box;cursor:pointer;touch-action:manipulation">${esc(c('work'))}</summary><p>${esc(step.body[ix()]||'')}</p></details>`:''}
    ${task.id==='initial-setup'?'':phaseBody}
   ${instruction?`<section class="display-instruction" data-display-instruction="${esc(frame.id)}"><span>${esc(c('work'))}</span><h3>${esc(frame.title[ix()])}</h3><p>${esc(frame.body[ix()])}</p>${nozzleChoice}</section>`:`<figure class="display-frame ${photo?'is-photo':''} ${crop?'is-lcd-photo':''}">${photo?`<button type="button" data-display-enlarge class="display-photo-open ${crop?'display-photo-crop':''}" ${crop?`style="aspect-ratio:${crop[2]}/${crop[3]}"`:''} aria-label="${esc(c('fullPhoto'))}" aria-busy="true" data-photo-state="loading" disabled>${photoImage}<span class="display-photo-status" role="status">${esc(c('photoLoading'))}</span></button>`:`<div class="display-lcd-bezel"><canvas width="480" height="320" role="img" class="display-lcd"></canvas><p class="display-native-loading" role="status">${esc(c('loading'))}</p></div>`}
    <figcaption><span>${esc(photo?(frame.caption?.[ix()]||c('photo')):version+' · '+({ja:'日本語',en:'English',cs:'Čeština',de:'Deutsch'}[displayLanguage]))}</span>${photo?'':`<button type="button" data-display-enlarge disabled>${esc(c('enlarge'))}</button>`}</figcaption></figure>`}
   ${task.id==='initial-setup'?phaseBody:''}
   ${gearbox?'<p class="display-printer-choice" data-display-printer-choice hidden></p>':''}
   <nav class="display-frame-controls" aria-label="${esc(c('title'))}"><button data-display-previous ${index===0?'disabled':''}>← <span>${esc(c('previous'))}</span></button><output aria-live="polite">${index+1} / ${frames.length}</output><button data-display-next ${index===frames.length-1?'disabled':''}><span>${esc(c('next'))}</span> →</button>${!photo&&!instruction?`<button type="button" class="display-enlarge-inline" data-display-enlarge disabled>${esc(c('enlarge'))}</button>`:''}</nav>
   ${initial?`<p class="display-example">${esc(ic('note'))}</p><label class="display-initial-condition" style="display:grid;gap:8px">${esc(ic('condition'))}<select data-display-initial-case style="width:100%">${setupCases.map(key=>`<option value="${key}" ${(initialCases.get(identity)||'normal')===key?'selected':''}>${esc(ic(key))}</option>`).join('')}</select></label>`:''}
   ${hasNozzle&&!frame.nozzleChoice?`<button class="display-nozzle-review" data-display-nozzle-review>${esc(c('nozzleReview'))}</button>`:''}
   ${photo||instruction?'':`${initial?'':`<p class="display-example">${esc(c(maintenance?'maintenance_note':showGearboxCondition?'gearboxExample':'example'))}</p>`}<details class="display-options"${settingsOpen?' open':''}><summary>${esc(c(gearbox||initial||maintenance?'displaySettings':'options'))}</summary><div><label>${esc(c('version'))}<select data-display-version>${Object.keys(FIRMWARE_UI.versions).map(v=>`<option ${v===version?'selected':''}>${v}</option>`).join('')}</select></label><label>${esc(c('language'))}<select data-display-language>${Object.entries({ja:'日本語',en:'English',cs:'Čeština',de:'Deutsch'}).map(([k,v])=>`<option value="${k}" ${k===displayLanguage?'selected':''}>${v}</option>`).join('')}</select></label>${maintenanceOptions}${showGearboxCondition?`<label>${esc(c('gearboxCondition'))}<select data-display-gearbox-case>${[['unknown','gearboxUnknown'],['loaded','gearboxLoaded'],['empty','gearboxEmpty']].map(([value,key])=>`<option value="${value}" ${value===gearboxCase()?'selected':''}>${esc(c(key))}</option>`).join('')}</select></label>`:gearbox||initial||maintenance?'':`<button data-display-practice>${esc(c('practice'))}</button>`}</div></details>`}
   `:`<p class="display-empty">${esc(c('absent'))}</p>`}
   <a class="display-source" target="_blank" rel="noopener" href="${esc(step.source||task.source)}">${esc(c('source'))}</a>`;
  const canvas=host.querySelector('canvas');
  if(canvas){canvas.setAttribute('aria-label',step.title[ix()]+(frame.title?' · '+frame.title[ix()]:''));canvas.setAttribute('aria-busy','true');canvas.dataset.frameAction=frame.action;canvas.dataset.framePhase=frame.phase||'';const painting=maintenance?paintMaintenanceLCD(canvas,{version,language:displayLanguage,frame}):initial?paintInitialSetupLCD(canvas,{frame,version,language:displayLanguage}):gearbox?paintGearboxLCD(canvas,{version,language:displayLanguage,phase:frame.phase}):paintFirmwareLCD(canvas,{version,language:displayLanguage,label,state:firmwareFrameState(frame,version)});painting.then(result=>{if(draw===generation){canvas.removeAttribute('aria-busy');host.querySelector('.display-native-loading')?.remove();host.querySelectorAll('[data-display-enlarge]').forEach(button=>button.disabled=false);const note=host.querySelector('[data-display-printer-choice]'),button=result?.buttonLabels?.[0];if(note&&button){note.textContent=c('printerChoice').replace('{button}',button.label);note.hidden=false;}}}).catch(()=>{if(draw===generation){host.querySelector('figure').textContent=c('failed');}});}
   const photoElement=host.querySelector('.display-photo-open img');
   if(photoElement){
    const button=photoElement.closest('button'),status=button.querySelector('.display-photo-status');
    const settle=failed=>{if(draw!==generation||!host.contains(photoElement))return;button.disabled=false;button.setAttribute('aria-busy','false');button.dataset.photoState=failed?'failed':'ready';photoElement.hidden=failed;status.hidden=!failed;if(failed){status.textContent=c('photoFailed')+' '+c('retryPhoto');button.dataset.displayPhotoRetry='';button.setAttribute('aria-label',c('retryPhoto'));}};
    photoElement.addEventListener('load',()=>settle(false),{once:true});photoElement.addEventListener('error',()=>settle(true),{once:true});
    if(photoElement.complete)settle(!photoElement.naturalWidth);
   }
   if(focusedSetting)host.querySelector('['+focusedSetting+']')?.focus({preventScroll:true});
   if(!settingsOpen&&task.id==='initial-setup'&&['initial-setup','gearbox'].includes(frame?.kind)){const screen=host.closest('.service-screen');if(screen)screen.scrollTop=0;}
   onChange(currentFrame());
 }
 function enlarge(){const frame=frames[index];if(!frame||frame.kind==='instruction')return;enlargement.open({canvas:frame.kind==='photo'?null:host.querySelector('canvas'),url:frame.url,title:step.title[ix()],caption:frame.kind==='photo'?(frame.caption?.[ix()]||c('photo')):version+' · '+({ja:'日本語',en:'English',cs:'Čeština',de:'Deutsch'}[displayLanguage]||displayLanguage)});}
 const move=direction=>{const next=Math.max(0,Math.min(frames.length-1,index+direction));if(next===index)return false;index=next;render();return true;};
 host.addEventListener('click',e=>{const b=e.target.closest('button');if(b?.hasAttribute('data-display-photo-retry')){render();return;}if(e.target.closest('canvas.display-lcd')||b?.hasAttribute('data-display-enlarge')){enlarge();return;}if(!b)return;if(b.hasAttribute('data-display-practice')){onPractice();return;}if(b.hasAttribute('data-display-nozzle-review')){index=frames.findIndex(f=>f.nozzleChoice);render();host.querySelector('[data-display-nozzle]:checked')?.focus({preventScroll:true});return;}const direction=b.hasAttribute('data-display-next')?1:b.hasAttribute('data-display-previous')?-1:0;if(direction&&move(direction))host.querySelector(direction>0?'[data-display-next]':'[data-display-previous]')?.focus({preventScroll:true});});
 // Return to the full display after closing its settings on a short screen.
 host.addEventListener('toggle',e=>{
  if(e.target.matches?.('.display-options')&&!e.target.open&&window.matchMedia('(max-height:600px) and (min-width:620px)').matches){
   const viewport=host.closest('.service-screen');if(viewport)viewport.scrollTop=0;
  }
 },true);
 host.addEventListener('change',e=>{
  if(e.target.hasAttribute('data-display-initial-case')){if(!initialSetupCases(step).includes(e.target.value))return;initialCases.set(identity,e.target.value);index=0;rebuild();render();return;}
  if(e.target.hasAttribute('data-display-nozzle')){if(!['unknown','changed','unchanged'].includes(e.target.value))return;nozzleDecisions.set(identity,e.target.value);index=0;rebuild();render();host.querySelector(`[data-display-nozzle][value="${e.target.value}"]`)?.focus({preventScroll:true});return;}
  if(e.target.hasAttribute('data-display-gearbox-case')){if(!['unknown','loaded','empty'].includes(e.target.value))return;let phase=frames[index]?.phase;gearboxCases.set(identity,e.target.value);if(phase?.startsWith('filament_')||step.sensorGearboxPhase==='intro')phase=e.target.value==='empty'?'loosen_screws':e.target.value==='loaded'?'filament_loaded_ask_unload':'filament_unknown_ask_unload';rebuild();index=Math.max(0,frames.findIndex(f=>f.phase===phase));render();return;}
  if(e.target.hasAttribute('data-display-sensor-original')||e.target.hasAttribute('data-display-load-case')){const phase=frames[index]?.phase;if(e.target.hasAttribute('data-display-sensor-original')){if(!['on','off'].includes(e.target.value))return;sensorOriginal=e.target.value;}else{if(!['normal','purge'].includes(e.target.value))return;loadCase=e.target.value;}rebuild();index=Math.max(0,frames.findIndex(f=>f.phase===phase));render();return;}
  if(e.target.hasAttribute('data-display-version')){version=e.target.value;rebuild();}else if(e.target.hasAttribute('data-display-language'))displayLanguage=e.target.value;else return;
  try{localStorage.setItem('prusa-firmware-navigation-v1',JSON.stringify({version,language:displayLanguage}));}catch{}render();
 });
 return {update(nextTask,nextStep){if(!displayLanguageInitialized){if(!hasStoredDisplayLanguage)displayLanguage=language();displayLanguageInitialized=true;}task=nextTask;step=nextStep;const next=task.id+':'+(task.revision||1)+':'+task.steps.indexOf(step)+':'+(step.source||task.source);if(next!==identity){identity=next;index=0;const screen=host.closest('.service-screen');if(screen)screen.scrollTop=0;}rebuild();render();},next(){return move(1);},previous(){return move(-1);},get hasPrevious(){return index>0;},get currentFrame(){return currentFrame();},get hasNext(){return index<frames.length-1;},get available(){return frames.length>0;},dispose(){enlargement.dispose();}};
}

// Keep the existing Load Filament menu path for other service steps.
for(const fw of Object.values(FIRMWARE_UI.versions)){if(!fw.menus.filament.items.some(i=>i.key==='Load Filament')||!fw.labels['Load Filament'])throw Error('Missing source Load Filament menu');fw.paths.load=['Filament','Load Filament'];}
