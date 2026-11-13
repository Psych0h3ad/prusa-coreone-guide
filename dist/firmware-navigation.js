// SPDX-License-Identifier: GPL-3.0-only
import {FIRMWARE_UI} from './firmware-ui-data.js?v=20261111-94';
import {FirmwareLCDState} from './firmware-lcd-state.js?v=20261111-94';
import {paintFirmwareLCD} from './firmware-lcd.js?v=20261111-94';
const copy={
 title:['プリンターの画面操作','Printer screen controls','Ovládání displeje tiskárny','Bedienung des Druckerdisplays'],
 firmware:['ファームウェア','Firmware','Firmware','Firmware'],language:['実機の画面言語','Printer screen language','Jazyk displeje tiskárny','Sprache des Druckerdisplays'],
 action:['この手順で行う操作','Action in this step','Úkon v tomto kroku','Aktion in diesem Schritt'],
 note:['標準構成・印刷停止時の画面です。温度や設定値は操作例で、実機には接続していません。','Standard configuration, printer idle. Temperatures and settings are practice values; no printer is connected.','Standardní konfigurace, tiskárna v klidu. Teploty a nastavení jsou cvičné; tiskárna není připojena.','Standardkonfiguration, Drucker im Leerlauf. Temperaturen und Einstellungen sind Übungswerte; kein Drucker ist verbunden.'],
 selected:['次に選ぶ項目','Next item to select','Další položka','Nächster Eintrag'],
 arrived:['目的の項目です。この先の動作は実機の案内と公式手順に従ってください。','This is the required item. Follow the printer and official instructions for the operation that follows.','Toto je požadovaná položka. Při dalším úkonu se řiďte tiskárnou a oficiálním návodem.','Der gesuchte Eintrag ist erreicht. Für die folgenden Schritte die Druckeranzeige und offizielle Anleitung beachten.'],
 source:['公式ファームの出典','Official firmware source','Oficiální zdroj firmwaru','Offizielle Firmware-Quelle'],reset:['ホームからやり直す','Restart from home','Znovu z úvodní obrazovky','Vom Startbildschirm beginnen'],back:['戻る','Back','Zpět','Zurück'],
 up:['左に回す','Turn left','Otočit doleva','Links drehen'],down:['右に回す','Turn right','Otočit doprava','Rechts drehen'],press:['ノブを押す','Press knob','Stisknout ovladač','Knopf drücken'],
 enlarge:['画面を拡大','Enlarge display','Zvětšit displej','Display vergrößern'],shrink:['全体を表示','Fit display','Přizpůsobit displej','Display einpassen'],hint:['項目をタップ、またはノブで選んで押します。','Tap an item, or turn the knob and press it.','Klepněte na položku, nebo ji vyberte a stiskněte ovladač.','Eintrag antippen oder mit dem Knopf auswählen und bestätigen.'],
 value:['入力値（操作例）','Value (practice)','Hodnota (cvičení)','Wert (Übung)'],confirm:['確定','Confirm','Potvrdit','Bestätigen'],
 profile:['表示例の条件','Example conditions','Podmínky ukázky','Bedingungen des Beispiels'],
 normal:['PLA・室温から','PLA, starting at room temperature','PLA, od pokojové teploty','PLA, ab Raumtemperatur'],
 hot:['PLA・加熱済み','PLA, already heated','PLA, již zahřáté','PLA, bereits aufgeheizt'],
 retracted:['自動リトラクト済み・冷間アンロード','Already auto-retracted, cold unload','Již automaticky zatažený, vyjmutí za studena','Bereits automatisch zurückgezogen, kaltes Entladen'],
 flowInfo:['PLAのアンロード画面を確認できます。温度とセンサー値、進行率は表示例です。','Explore the PLA unload screens. Temperatures, sensor readings and progress are example data.','Prohlédněte si obrazovky vyjímání PLA. Teploty, hodnoty senzorů a průběh jsou ukázkové.','Die Anzeigen beim Entladen von PLA ansehen. Temperaturen, Sensorwerte und Fortschritt sind Beispieldaten.'],
 coldpullInfo:['PLAが装填済みで、MMUを使わない場合の画面です。温度・残り時間・進行率は表示例です。','Screens for already-loaded PLA with MMU disabled. Temperatures, remaining time and progress are example data.','Obrazovky pro již zavedené PLA s vypnutým MMU. Teploty, zbývající čas a průběh jsou ukázkové.','Anzeigen für bereits geladenes PLA bei deaktivierter MMU. Temperaturen, Restzeit und Fortschritt sind Beispieldaten.'],
 loaded:['PLA・装填済み、加熱済み','PLA, loaded and heated','PLA, zavedeno a nahřáto','PLA, geladen und aufgeheizt'],
 coldpullRetracted:['PLA・自動リトラクト済み','PLA, already auto-retracted','PLA, již automaticky zataženo','PLA, bereits automatisch zurückgezogen'],
 coldpullFinished:['表示例を終えました。実機では引き抜いたフィラメントの先端を確認し、必要に応じて公式手順を繰り返します。','The example is finished. On the printer, inspect the pulled filament tip and repeat the official procedure if needed.','Ukázka skončila. Na tiskárně zkontrolujte vytaženou špičku filamentu a podle potřeby zopakujte oficiální postup.','Das Beispiel ist beendet. Am Drucker die herausgezogene Filamentspitze prüfen und den offiziellen Ablauf bei Bedarf wiederholen.'],
 progress:['表示例の進み具合','Example progress','Průběh ukázky','Fortschritt des Beispiels'],
 previousFrame:['前の表示','Previous screen','Předchozí zobrazení','Vorherige Anzeige'],nextFrame:['次の表示','Next screen','Další zobrazení','Nächste Anzeige'],finishFrame:['表示例を終了','Finish example','Ukončit ukázku','Beispiel beenden'],
 finished:['表示例を終えました。実機ではフィラメントを取り出し、ノズルが室温まで冷めてから次の作業に進みます。','The example is finished. On the printer, remove the filament and let the nozzle cool to room temperature before continuing maintenance.','Ukázka skončila. Z tiskárny vyjměte filament a před další údržbou nechte trysku vychladnout na pokojovou teplotu.','Das Beispiel ist beendet. Am Drucker das Filament herausnehmen und die Düse vor der weiteren Wartung auf Raumtemperatur abkühlen lassen.'],
 stopped:['停止したときの表示例です。ノズルには余熱が残ります。','Example stopped. The nozzle can remain hot after stopping.','Ukázka zastavena. Tryska může být po zastavení stále horká.','Beispiel gestoppt. Die Düse kann nach dem Stopp weiterhin heiß sein.'],
 closed:['表示例を閉じました。','Display example closed.','Ukázka displeje zavřena.','Anzeigebeispiel geschlossen.'],
 outside:['この練習の対象外です。上の経路から目的の項目に戻れます。','This operation is outside this exercise. Use the path above to return.','Tento úkon není součástí cvičení. Vraťte se cestou uvedenou výše.','Diese Aktion gehört nicht zu dieser Übung. Über den obigen Pfad zurückkehren.'],
 failed:['画面データを読み込めませんでした。再読み込みしてください。','Display data could not load. Please reload the page.','Data displeje se nepodařilo načíst. Obnovte stránku.','Displaydaten konnten nicht geladen werden. Seite bitte neu laden.']
};
const ix=lang=>({ja:0,en:1,cs:2,de:3}[lang]??1),esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const KEY='prusa-firmware-navigation-v1';
export function firmwareActions(task,step){
 // A translated heading is presentation, never the identity of an operation.
 // Return a copy so practice controls cannot alter the authored procedure.
 const actions=[...(step.firmwareActions||[])];
 // Reuse the authored native menu path for the two nozzle-access preparations.
 // Stable task/step identity; translated headings and body text are not selectors.
 if((task.id==='feed-clear'||task.id==='fragment')&&task.steps[0]===step&&!actions.includes('moveZ'))actions.push('moveZ');
 return actions;
}
export function createFirmwareNavigation(host,{language=()=> 'en'}={}){
 let saved={};try{saved=JSON.parse(localStorage.getItem(KEY))||{};}catch{}
 let version=FIRMWARE_UI.versions[saved.version]?saved.version:FIRMWARE_UI.defaultVersion,displayLanguage=['ja','en','cs','de'].includes(saved.language)?saved.language:language();
 let actions=[],action,identity='',state,enlarged=false,message='',generation=0;
 const c=k=>copy[k][ix(language())],fw=()=>FIRMWARE_UI.versions[version],label=k=>fw().labels[k]?.[displayLanguage]||k;
 const save=()=>{try{localStorage.setItem(KEY,JSON.stringify({version,language:displayLanguage}));}catch{}},reset=()=>{state=new FirmwareLCDState(fw(),fw().paths[action]);message='';};
 function render(){
  ++generation;host.hidden=!actions.length;if(!actions.length){host.innerHTML='';return;}
  const previousViewport=host.querySelector('.firmware-lcd-viewport'),panX=previousViewport?.scrollLeft||0;
  const path=state.path,depth=state.depth,atEnd=state.arrived,row=state.menu.items[state.selected],op=state.operation,noChoice=op&&!op.phase.buttons.length,selectedLabel=op?label(op.phase.buttons[op.selected]||op.phase.title||op.phase.text):state.editing?state.editing.focus:(row?.number?row.number+' ':'')+label(row?.key||'');
  host.innerHTML=`<section class="firmware-card" aria-label="${esc(c('title'))}"><h4>${esc(c('title'))}</h4>
   <div class="firmware-options"><label>${esc(c('firmware'))}<select data-fw-version>${Object.keys(FIRMWARE_UI.versions).map(v=>`<option ${version===v?'selected':''}>${v}</option>`).join('')}</select></label><label>${esc(c('language'))}<select data-fw-language>${Object.entries({ja:'日本語',en:'English',cs:'Čeština',de:'Deutsch'}).map(([k,v])=>`<option value="${k}" ${displayLanguage===k?'selected':''}>${v}</option>`).join('')}</select></label></div>
   ${actions.length>1?`<label class="firmware-action">${esc(c('action'))}<select data-fw-action>${actions.map(id=>`<option value="${id}" ${action===id?'selected':''}>${esc(label(fw().paths[id].at(-1)))}</option>`).join('')}</select></label>`:''}
   ${action==='unload'?`<label class="firmware-action">${esc(c('profile'))}<select data-fw-unload-profile>${['normal','hot','retracted'].map(p=>`<option value="${p}" ${state.unloadProfile===p?'selected':''}>${esc(c(p))}</option>`).join('')}</select></label>`:''}
   ${action==='coldpull'?`<label class="firmware-action">${esc(c('profile'))}<select data-fw-coldpull-profile>${['loaded','retracted'].map(p=>`<option value="${p}" ${state.coldpullProfile===p?'selected':''}>${esc(c(p==='retracted'?'coldpullRetracted':p))}</option>`).join('')}</select></label>`:''}
   <ol class="firmware-path">${path.map((key,i)=>`<li><button data-fw-depth="${i}" ${i===depth||atEnd&&i===path.length-1?'aria-current="step"':''}>${i+1}. ${esc(label(key))}</button></li>`).join('')}</ol>
   <div class="firmware-lcd-viewport ${enlarged?'is-enlarged':''}"><canvas class="firmware-lcd" width="480" height="320" tabindex="0" role="application" aria-label="${esc(c('title')+': '+selectedLabel)}"></canvas></div>
   <div class="firmware-lcd-toolbar"><span>${esc(c('hint'))}</span><button data-fw-enlarge aria-pressed="${enlarged}">${esc(c(enlarged?'shrink':'enlarge'))}</button></div>
   <div class="firmware-knob" role="group" aria-label="${esc(c('press'))}"><button data-fw-turn="-1" aria-label="${esc(c('up'))}" ${noChoice?'disabled':''}>↶</button><button data-fw-press ${noChoice?'disabled':''}>${esc(c('press'))}<small>${esc(selectedLabel)}</small></button><button data-fw-turn="1" aria-label="${esc(c('down'))}" ${noChoice?'disabled':''}>↷</button></div>
   ${state.editing?`<form class="firmware-number"><label>${esc(c('value'))}<input data-fw-number type="number" min="${state.editing.config.min}" max="${state.editing.config.max}" step="any" value="${esc(state.editing.text)}" inputmode="decimal"></label><button type="submit">${esc(c('confirm'))}</button></form>`:''}
   ${op?`<section class="firmware-operation" aria-label="${esc(c(op.kind==='coldpull'?'coldpullInfo':'flowInfo'))}"><p>${esc(c(op.kind==='coldpull'?'coldpullInfo':'flowInfo'))}</p>${op.kind!=='coldpull'||op.phase.progress?`<label>${esc(c('progress'))} <output data-fw-progress-label>${op.progress}%</output><input data-fw-progress type="range" min="0" max="100" value="${op.progress}" aria-label="${esc(c('progress'))}"></label>`:''}<div><button data-fw-operation-back ${op.index===0?'disabled':''}>${esc(c('previousFrame'))}</button><span>${op.index+1} / ${op.sequence.length}</span><button data-fw-operation-next>${esc(c(op.last?'finishFrame':'nextFrame'))} →</button></div></section>`:''}
   <div class="firmware-guidance" aria-live="polite">${op?'':atEnd?`<strong class="firmware-screen-destination">${esc(label(path.at(-1)))}</strong><p>${esc(c('arrived'))}</p>`:`<span>${esc(c('selected'))}</span><button data-fw-next>${esc(label(state.target||path[0]))} →</button>`}${state.operationResult?`<p>${esc(c(state.operationResult==='finished'&&action==='coldpull'?'coldpullFinished':state.operationResult))}</p>`:''}${message?`<p>${esc(message)}</p>`:''}</div>
   <div class="firmware-controls"><button data-fw-back ${!state.stack.length&&!state.editing&&!op?'disabled':''}>${esc(c('back'))}</button><button data-fw-reset>${esc(c('reset'))}</button></div><p class="firmware-note">${esc(c('note'))}</p><a class="firmware-source" target="_blank" rel="noopener" href="${esc(fw().source)}">${esc(c('source'))} · ${esc(version)} ↗</a></section>`;
  const canvas=host.querySelector('canvas');
  if(enlarged)host.querySelector('.firmware-lcd-viewport').scrollLeft=panX;
  paintLCD(canvas);
 }
 function paintLCD(canvas){
  const draw=++generation;
  paintFirmwareLCD(canvas,{version,language:displayLanguage,label,state}).then(hits=>{if(draw===generation&&hits)canvas._lcdHits=hits;}).catch(()=>{if(draw===generation){const p=document.createElement('p');p.className='firmware-load-error';p.textContent=c('failed');canvas.after(p);canvas.dataset.lcdReady='error';}});
 }
 const acted=result=>{message=result==='outside'||result==='action'&&!state.arrived?c('outside'):'';},after=(focus,showLCD=false)=>{render();if(showLCD)host.querySelector('canvas')?.scrollIntoView({block:'start',behavior:'instant'});if(focus)host.querySelector(focus)?.focus({preventScroll:true});};
 host.addEventListener('click',e=>{
  const wasOperating=!!state.operation;
  const canvas=e.target.closest('canvas');if(canvas){const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)*480/r.width,y=(e.clientY-r.top)*320/r.height,hit=canvas._lcdHits?.find(h=>x>=h.x&&x<h.x+h.w&&y>=h.y&&y<h.y+h.h);if(hit){if(hit.operation!==undefined)acted(state.respondOperation(hit.operation));else if(hit.key)state.key(hit.key);else acted(state.activate(hit.index));after('canvas',!wasOperating&&!!state.operation);}return;}
  const b=e.target.closest('button');if(!b||b.closest('form')&&b.type==='submit')return;let focus='[data-fw-press]';message='';
  if(b.hasAttribute('data-fw-operation-next')){state.advanceOperation();focus=state.operation?'[data-fw-operation-next]':'[data-fw-reset]';}else if(b.hasAttribute('data-fw-operation-back')){state.advanceOperation(-1);focus='[data-fw-operation-next]';}else if(b.hasAttribute('data-fw-next'))state.next();else if(b.hasAttribute('data-fw-press')){if(state.editing)state.key(state.editing.focus);else acted(state.activate());}else if(b.hasAttribute('data-fw-turn')){state.rotate(Number(b.dataset.fwTurn));focus=`[data-fw-turn="${b.dataset.fwTurn}"]`;}else if(b.hasAttribute('data-fw-back'))state.back();else if(b.hasAttribute('data-fw-reset'))state.resetPractice();else if(b.hasAttribute('data-fw-depth'))state.goto(Number(b.dataset.fwDepth));else if(b.hasAttribute('data-fw-enlarge')){enlarged=!enlarged;focus='[data-fw-enlarge]';}else return;after(focus,!wasOperating&&!!state.operation);
 });
 host.addEventListener('keydown',e=>{if(e.target.tagName!=='CANVAS')return;let handled=true;if(state.editing&&/^[0-9.]$/.test(e.key))state.key(e.key);else if(e.key==='ArrowUp'||e.key==='ArrowLeft')state.rotate(-1);else if(e.key==='ArrowDown'||e.key==='ArrowRight')state.rotate(1);else if(e.key==='Enter'||e.key===' '){if(state.editing)state.key(state.editing.focus);else acted(state.activate());}else if(e.key==='Escape')state.back();else if(state.editing&&e.key==='Backspace')state.key('backspace');else handled=false;if(handled){e.preventDefault();after('canvas');}});
 host.addEventListener('submit',e=>{if(!e.target.matches('.firmware-number'))return;e.preventDefault();state.editing.text=host.querySelector('[data-fw-number]').value;state.editing.special=false;state.editing.initial=false;state.key('ok');after('[data-fw-press]');});
 host.addEventListener('input',e=>{if(e.target.hasAttribute('data-fw-progress')&&state.operation){state.operation.setProgress(e.target.value);host.querySelector('[data-fw-progress-label]').textContent=state.operation.progress+'%';paintLCD(host.querySelector('canvas'));}});
 host.addEventListener('change',e=>{if(e.target.hasAttribute('data-fw-version')){version=e.target.value;reset();save();}else if(e.target.hasAttribute('data-fw-language')){displayLanguage=e.target.value;save();}else if(e.target.hasAttribute('data-fw-action')){action=e.target.value;reset();}else if(e.target.hasAttribute('data-fw-unload-profile')||e.target.hasAttribute('data-fw-coldpull-profile')){const active=!!state.operation;state[e.target.hasAttribute('data-fw-coldpull-profile')?'coldpullProfile':'unloadProfile']=e.target.value;if(active){state.operation=null;state.activate();}}else return;render();});
 function refreshPreferences(){try{const p=JSON.parse(localStorage.getItem(KEY))||{};if(FIRMWARE_UI.versions[p.version]&&p.version!==version){version=p.version;if(action)reset();}if(['ja','en','cs','de'].includes(p.language))displayLanguage=p.language;}catch{}}
 return {update(task,step){refreshPreferences();const next=task.id+':'+task.steps.indexOf(step);actions=firmwareActions(task,step);if(next!==identity){identity=next;action=actions[0];if(action)reset();}render();},refresh(){refreshPreferences();render();},get available(){return actions.length>0;}};
}
