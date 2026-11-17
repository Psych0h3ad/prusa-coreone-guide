import {mountEditionSelector} from './edition-selector.js?v=20261116-172';
import {readAssemblyStepLink,applyAssemblyStepLink,buildAssemblyStepURL,operationAnchor,resolveShareOperation,shareOperationPosition} from './step-share.js';
import {createStepSharing} from './step-share-ui.js';
import {createModelLoading} from './model-loading.js';
import {encodeOriginalProgress} from './original-progress.js';
import {FLOWS,PARTS} from './data.js?v=20261112-113';
import {icon,renderIcons} from './icons.js?v=20261111-94';
import {createViewerLoader} from './viewer-loader.js?v=20261113-118';
import {ASSEMBLY_PLAN} from './assembly-plan-runtime.js?v=20261113-116';
import {COMPACT_QUERY,navigationState} from './mobile.js?v=20261111-94';
import {initializeLocalization,setLanguage,currentLanguage,translateDOM,languageControl,languageLoadError,t} from './cable-assembly/text.js?v=20261112-113';
import {PROGRESS_KEY,restoreProgress} from './progress.js?v=20261111-94';
import {JAPANESE_SOURCES} from './manual-ja-sources.js?v=20261111-94';
import {createManualReference,stepInstructions} from './manual-reference.js?v=20261112-113';
for(const flow of Object.values(FLOWS))for(const step of flow.steps)step.source=JAPANESE_SOURCES[step.officialId]||step.source;
let initialLanguageError;
await initializeLocalization({flows:FLOWS,parts:PARTS,plan:ASSEMBLY_PLAN},{persist:!new URL(location.href).searchParams.has('step')}).catch(error=>{initialLanguageError=languageLoadError(error.requestedLanguage);});
const currentEdition=FLOWS.build.manualID===2251?'original2251':'plus';
mountEditionSelector({mount:document.querySelector('.header-right'),current:currentEdition,editions:[
 {id:'original2251',label:'CORE One（初代）',href:'./original.html?flow=build&lang=ja',languages:['ja']},
 {id:'plus',label:'CORE One+',href:'./index.html?flow=build',languages:['ja','en','cs','de']}
]});
const $=s=>document.querySelector(s);
// On a short phone held sideways, keep presets available without covering
// the working area. Other layouts retain the existing inline controls.
const cameraPresets=$('#camera-presets'),cameraPresetToggle=$('#compact-view-toggle');
const closeCameraPresets=()=>{if(cameraPresets.hasAttribute('popover'))cameraPresets.hidePopover();};
if(typeof cameraPresets.showPopover==='function'){
 const compactCamera=matchMedia('(min-width:480px) and (max-width:619px) and (max-height:400px) and (pointer:coarse)');
 const updateCameraPresets=()=>{closeCameraPresets();cameraPresets.toggleAttribute('popover',compactCamera.matches);document.body.classList.toggle('compact-camera-views',compactCamera.matches);};
 cameraPresets.addEventListener('toggle',event=>cameraPresetToggle.setAttribute('aria-expanded',String(event.newState==='open')));
 compactCamera.addEventListener('change',updateCameraPresets);updateCameraPresets();
}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const completeViewLabel=(button,expanded)=>{const label=expanded?'工程に戻る':'完成形';button.innerHTML=icon(expanded?'list':'printer')+`<span>${label}</span>`;button.setAttribute('aria-label',expanded?'工程に戻る':'完成形を表示');};
const stepReferences=s=>s.references?.length?`<div class="step-references">${s.references.map(r=>`<a class="step-reference" href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.label)} ${icon('arrow-up-right')}</a>`).join('')}</div>`:'';
const officialReferenceActions=s=>`<div class="official-reference-actions"><button type="button" data-official-reference aria-haspopup="dialog">手順と写真を拡大 ${icon('camera')}</button></div>`;
const key=PROGRESS_KEY;
let storedProgress;try{storedProgress=JSON.parse(localStorage.getItem(key));}catch{}
let state=restoreProgress(storedProgress,FLOWS);
const requestedFlow=new URL(location.href).searchParams.get('flow');if(['build','upgrade'].includes(requestedFlow)&&!new URL(location.href).searchParams.has('step'))state.flow=requestedFlow;
const initialSharedStep=readAssemblyStepLink(location.href,FLOWS,{defaultFlow:state.flow});
state=applyAssemblyStepLink(state,initialSharedStep);
let sharedPreview=initialSharedStep.requested,pendingSharedStep=initialSharedStep.valid?initialSharedStep:null,nextHistoryMode='replace';
const recheckCount=Object.entries(FLOWS).reduce((count,[flow,f])=>{
 const prior=storedProgress?.[flow];
 return count+f.steps.filter((s,i)=>(Array.isArray(prior?.done)&&prior.done.includes(i)&&!state[flow].done.includes(i))||(
  s.verificationRevision&&prior?.checkRevisions?.[s.officialId]!==s.verificationRevision&&Array.isArray(prior?.checks?.[i])&&prior.checks[i].length
 )).length;
},0);
let manualReference;
let viewer,comparison='after',explore=false,selectedMesh,toastTimer;
if(initialSharedStep.valid){comparison=initialSharedStep.comparison;explore=initialSharedStep.explore;}
const compact=matchMedia(COMPACT_QUERY),coarse=matchMedia('(pointer: coarse)');
let mobileView='guide',viewerStarted=false,pendingFocus,pendingOperation,refreshLibrary;
mobileView=initialSharedStep.view||mobileView;
let viewerStatus='idle',viewerAttempt=0;
const loadViewer=createViewerLoader();let moduleLoading,viewerModuleReload=false;
function navState(){const l=state[state.flow];return navigationState({steps:FLOWS[state.flow].steps,index:l.index,variant:state.build.variant,done:l.done,checked:l.checks[l.index]||[],view:mobileView});}
function updateMobile(){
 const n=navState(),s=current();
 $('#workspace').dataset.mobileView=mobileView;
 document.body.classList.toggle('cad-view',compact.matches&&mobileView==='model');
 document.querySelectorAll('[data-mobile-view]').forEach(b=>{if(b.tagName==='BUTTON')b.setAttribute('aria-pressed',String(b.dataset.mobileView===mobileView));});
 $('#mobile-previous').disabled=n.previous===undefined;$('#mobile-next').disabled=n.next===undefined;
 $('#mobile-complete').disabled=n.disabled;$('#mobile-complete').textContent=n.label;
 $('#mobile-position').textContent=`第${s.chapter+1}章 · 手順${s.officialStep} / ${s.chapterSteps}　（全体 ${n.position} / ${n.total}）`;
 $('#mobile-action-hint').textContent=n.previewNext?'3D表示のまま次の手順へ進みます。':n.readFirst?'作業内容と注意事項を確認してください。':n.verified?'この手順は確認済みです。':!n.valid?'説明を読み、手順末尾のチェックを入れてください。':'確認済みにして次の手順へ進みます。';
 $('#mobile-model-context').innerHTML=`<span>${s.chapter+1}.${s.officialStep}　${esc(s.title)}</span><small>手順を確認する</small>`;
 $('#page-title').textContent=state.flow==='build'?(FLOWS.build.manualID===2251?FLOWS.build.title:'CORE One+ 組み立てガイド'):'CORE One → CORE One+ アップグレード';
 translateDOM($('#mobile-workbar'));translateDOM($('.mobile-bottom'));translateDOM($('#page-title'));translateDOM($('#mobile-model-context'));
}
function disableOperationUI(){
 for(const id of ['operation-play','operation-start','operation-end','operation-progress'])$('#'+id).disabled=true;
 $('#operation-play').textContent=t('再生');$('#operation-play').setAttribute('aria-pressed','false');$('#operation-position').textContent=t('写真で確認');$('#operation-title').textContent=t('この画面の説明と写真で確認できます。');
}
function modelFailed(graphics=false){
 moduleLoading?.remove();moduleLoading=undefined;
 viewerStatus='failed';viewer?.dispose();viewer=undefined;selectedMesh=undefined;$('#selected-card').hidden=true;disableOperationUI();
 const error=$('#webgl-error');error.querySelector('h3').textContent=graphics?'3D表示を開始できませんでした':'3Dモデルを読み込めませんでした';
 $('#viewer-error-message').textContent=graphics?'3Dに対応した別のブラウザーで開くか、もう一度お試しください。手順と進捗はそのまま使えます。':'接続を確認して、もう一度お試しください。手順と進捗はそのまま使えます。';
 $('#retry-model').disabled=false;translateDOM(error);error.hidden=false;
}
async function ensureViewer(retry=false){
 if(viewerStarted&&!retry||retry&&viewerStatus!=='failed')return;viewerStarted=true;viewerStatus='loading';const attempt=++viewerAttempt;
 $('#webgl-error').hidden=true;$('#retry-model').disabled=true;disableOperationUI();
 viewerModuleReload=false;$('#retry-model').textContent=t('3Dを再読み込み');
 moduleLoading=createModelLoading($('#canvas-container'),{stage:'code',withCableInputs:true});
 let imported=false;
 try{const {PrinterViewer}=await loadViewer();if(attempt!==viewerAttempt)return;imported=true;moduleLoading?.remove();moduleLoading=undefined;viewer=new PrinterViewer($('#canvas-container'),(key,mesh)=>{if(attempt===viewerAttempt)selectPart(key,mesh);},ok=>{
  if(attempt!==viewerAttempt)return;
  if(!ok){modelFailed();return;}
  viewerStatus='ready';$('#retry-model').disabled=false;sync();if($('#library-search'))refreshLibrary?.();
  if(manualReference?.isOpen()||reviewIsCurrent()){pauseForReference();return;}
  if(pendingFocus){const focus=pendingFocus;pendingFocus=undefined;if(focus.context===operationContext())focusPart(focus.key);}
  if(pendingOperation!==undefined){const operation=pendingOperation;pendingOperation=undefined;if(operation.context===operationContext())playOperation(operation.index);}
 });sync();}
 catch(e){if(attempt!==viewerAttempt)return;console.error(e);viewerModuleReload=!!e.needsReload;modelFailed(imported);if(viewerModuleReload)$('#retry-model').textContent=t('ページを再読み込み');}
}
function operationContext(){return [state.flow,current().officialId,state.build.variant,comparison,explore,mobileView].join(':');}
function playOperation(i){pendingSharedStep=undefined;if(compact.matches)setMobileView('model');else ensureViewer();if(!viewer?.loaded){pendingFocus=undefined;pendingOperation={index:i,context:operationContext()};syncSharedLocation();return;}if(!viewer.playOperation(i)){toast('この操作を3Dで再生できません。手順と写真を表示します。');manualReference.open();}syncSharedLocation();}
function focusPart(k,specific){if(compact.matches)setMobileView('model');else ensureViewer();if(!viewer?.loaded){pendingOperation=undefined;pendingFocus={key:k,context:operationContext()};return;}if(!viewer.focus(k,specific))toast('この部品は現在の3D表示に含まれていません。');}
const cadPhotoChecks={
 doorHandle:{photos:['https://help.prusa3d.com/wp-content/uploads/2026/05/275582676b65dfb24477f5ea222c87d1.jpg','https://help.prusa3d.com/wp-content/uploads/2026/05/70de4945e488adec7cd9c459dad3b266.jpg'],label:'ハンドルの固定プレートを写真で確認',name:'ドアハンドル・固定プレート・M3x8rT',chapter:7,step:39},
 xlcd:{label:'xLCD基板の細部は写真で確認',name:'xLCDの基板・接地端子・背面マウント',chapter:7,step:15,photosByStep:{22:['https://help.prusa3d.com/wp-content/uploads/2025/11/86d0b0f9d3531a158e34b23b1dd1cf30.jpg','https://help.prusa3d.com/wp-content/uploads/2025/11/106dc4dcc7e255efbd053d79bc0df0b1.jpg']}},
 idler:{label:'ベアリングとピンは公式写真で確認',name:'アイドラーのベアリングとピン',step:3},
 gears:{label:'ギアは再現モデル・公式写真と照合',name:'PGアセンブリ・PGリング（再現モデル）',step:9},
 loveboard:{label:'LoveBoardは再現モデル・公式写真と照合',name:'LoveBoard基板（再現モデル）',step:31},
 hotend:{label:'ホットエンドの向き・配線を写真と照合',name:'ホットエンド（ノズル・ヒーターブロック）',step:48}
};
function cadChecks(){const s=current(),p=ASSEMBLY_PLAN[state.flow][s.officialId];return explore||s.overview||s.final?['hotend','gears','loveboard']:p.photoCheck?[p.photoCheck]:[];}
function showCadPhotos(){
 const keys=cadChecks(),s=current();if(!keys.length)return;
 const lcd=keys.includes('xlcd'),door=keys.includes('doorHandle'),intro=door?'3Dのハンドルは公開CADの旧型です。現行のネジ固定式ハンドル、固定プレート、ネジ位置は公式写真で確認してください。ドアを立てて支えてから作業します。':lcd?'3Dは旧型のプリント製背面マウントです。接地端子は公式CADを使用しています。液晶は外形のみで、基板とエンコーダーの細部は含みません。新しい射出成形マウントの形状も公式写真で確認してください。接地線は取り回しの模式表示です。端子の差し込みと、メインケーブルの赤い突起・基板の三角印は、接写写真で確認してください。':'ギアとLoveBoardは公式資料から作成した再現モデルです。歯形・基板外形・端子の高さは概略です。ホットエンドはJulian0815のコミュニティCAD（OCL v1）を使用しています。向きと接続先は公式写真と照合してください。';
 modal(`<span class="eyebrow">${door?'DOOR':lcd?'xLCD':'NEXTRUDER'}</span><h2 class="modal-title">公式写真で部品を確認する</h2><p class="modal-intro">${esc(intro)}</p><div class="cad-photo-grid">${keys.map(key=>{const c=cadPhotoChecks[key],chapter=c.chapter??5,step=state.flow==='build'&&s.chapter===chapter&&ASSEMBLY_PLAN.build[s.officialId].photoCheck===key?s:FLOWS.build.steps.find(s=>s.chapter===chapter&&s.officialStep===c.step);const photos=[step.photo,...(c.photos&&step.officialStep===39?c.photos:[]),...(c.photosByStep?.[step.officialStep]||[])];return `<section><h3>${esc(c.name)}</h3>${photos.map(photo=>`<button type="button" class="reference-photo" data-cad-reference-step="${step.officialId}" data-cad-reference-photo="${esc(photo)}"><img src="${esc(photo)}" alt="公式マニュアル 第${chapter+1}章 手順${step.officialStep} ${esc(step.title)}" referrerpolicy="no-referrer"><span>写真を拡大 ${icon('focus')}</span></button>`).join('')}<a class="manual-link" href="${esc(step.source)}" target="_blank" rel="noopener">公式手順 ${chapter+1}.${step.officialStep} ${icon('arrow-up-right')}</a></section>`;}).join('')}</div><button class="primary-button" data-close-modal>3Dに戻る ${icon('arrow-right')}</button>`);
}
function reviewIsCurrent(){const panel=$('#step-review');return $('#modal').open&&panel?.dataset.reviewFlow===state.flow&&panel.dataset.reviewStep===String(current().officialId);}
function updateStepReview(){
 if(!reviewIsCurrent())return;
 const l=state[state.flow],checked=l.checks[l.index]||[],done=l.done.includes(l.index),valid=checks(current()).every((_,i)=>checked.includes(i));
 document.querySelectorAll('#step-review [data-review-check]').forEach(input=>{input.checked=checked.includes(Number(input.dataset.reviewCheck));});
 const button=$('#review-complete');button.disabled=!valid||done;button.classList.toggle('completed',done);button.textContent=done?'このステップは確認済み':'この手順を確認';translateDOM(button);
}
function showStepReview(){
 const s=current(),f=FLOWS[state.flow],l=state[state.flow],checked=l.checks[l.index]||[];
 pauseForReference();
 modal(`<section id="step-review" data-review-flow="${state.flow}" data-review-step="${s.officialId}"><span class="eyebrow">第${s.chapter+1}章 · 手順 ${s.officialStep} / ${s.chapterSteps}</span><h2 class="modal-title">${esc(s.title)}</h2>${stepInstructions(s)}${stepReferences(s)}${s.tip?`<div class="tip"><div class="tip-title">注意事項</div><p>${esc(s.tip)}</p></div>`:''}${s.chooseVariant?`<label class="variant-choice">ドアハンドルの固定方式<select id="review-variant"><option value="screw" ${state.build.variant==='screw'?'selected':''}>ネジ固定式</option><option value="glued" ${state.build.variant==='glued'?'selected':''}>接着式</option></select></label>`:''}<section class="inline-manual-photos" aria-label="この手順の写真"><div data-step-photos></div></section>${s.supplies?.length?`<details class="supplies" open><summary>この手順で用意する部品 <span>${s.supplies.length}種類</span></summary><ul>${s.supplies.map(text=>`<li>${esc(text)}</li>`).join('')}</ul></details>`:''}<div class="checklist">${checks(s).map((text,i)=>`<label><input type="checkbox" data-review-check="${i}" ${checked.includes(i)?'checked':''}><span>${esc(text)}</span></label>`).join('')}</div><button class="primary-button" id="review-complete" disabled>この手順を確認</button><button class="animation-button" data-close-modal>3Dに戻る ${icon('arrow-right')}</button><a class="manual-link" href="${esc(s.source||f.manual)}" target="_blank" rel="noopener">出典：Prusa Research · 公式ページ ${icon('arrow-up-right')}</a></section>`);
 updateStepReview();manualReference.mountInline($('#step-review'));
}
function setStepCheck(i,checked){
 const l=state[state.flow];if(!Number.isInteger(i)||i<0||i>=checks(current()).length)return false;
 sharedPreview=false;
 let list=l.checks[l.index]||[];list=checked?[...new Set([...list,i])]:list.filter(n=>n!==i);l.checks[l.index]=list;
 const valid=checks(current()).every((_,i)=>list.includes(i)),revoked=!valid&&l.done.includes(l.index);
 if(revoked){l.done=l.done.filter(n=>n!==l.index);render();}
 else{const input=$(`#instructions [data-check="${i}"]`);if(input)input.checked=checked;save();$('#complete-step').disabled=!valid&&!l.done.includes(l.index);updateMobile();}
 updateStepReview();return revoked;
}
function setMobileView(view,scroll=true){
 mobileView=view;updateMobile();
 syncSharedLocation();
 if(view==='model'||!compact.matches)ensureViewer();
 // The viewer enables gestures initially; returning must retain an explicit pause.
 requestAnimationFrame(()=>{viewer?.resize();if(scroll&&compact.matches&&view==='guide')$('#mobile-workbar').scrollIntoView({block:'start',behavior:'instant'});});
}
function chapterPicker(){
 const f=FLOWS[state.flow],l=state[state.flow];
 modal(`<h2 class="modal-title">工程一覧</h2><p class="modal-intro">${esc(f.title)}</p>${languageControl()}<div class="chapter-menu-actions"><button data-flow="build">${FLOWS.build.manualID===2251?FLOWS.build.title:'CORE One+ 組み立て'}</button><button data-flow="upgrade">CORE One → CORE One+</button><button data-first-unfinished>未確認の手順へ</button><button data-open-library>パーツライブラリ</button></div><div class="chapter-menu" id="chapter-menu">${f.chapters.map((title,c)=>{const steps=f.steps.map((s,i)=>({...s,i})).filter(s=>s.chapter===c&&applicable(s.i));return `<details ${current().chapter===c?'open':''}><summary><span>${c+1}. </span><span>${esc(title)}</span><small>${steps.filter(s=>l.done.includes(s.i)).length} / ${steps.length} 手順確認済み</small></summary>${steps.map(s=>`<button data-step="${s.i}" ${s.i===l.index?'aria-current="step"':''}><span class="step-status ${l.done.includes(s.i)?'done':''}">${l.done.includes(s.i)?'✓':s.officialStep}</span><span>${esc(s.title)}</span></button>`).join('')}</details>`;}).join('')}</div>`);
}
function save(){if(sharedPreview){$('#save-status').innerHTML=`<i></i> ${t('共有リンクで表示中')}`;return;}let ok=true;try{localStorage.setItem(key,JSON.stringify(encodeOriginalProgress(state,FLOWS)));}catch{ok=false;}$('#save-status').innerHTML=`<i></i> ${ok?'進捗を保存済み':'このセッションで進捗を保持'}`;}
function toast(s){$('#toast').textContent=t(s);$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),3000);}
const current=()=>FLOWS[state.flow].steps[state[state.flow].index];
const checks=s=>s.checks||['公式の同じ手順を確認した'];
const applicable=i=>!FLOWS[state.flow].steps[i]?.variant||FLOWS[state.flow].steps[i].variant===state.build.variant;
const eligible=()=>FLOWS[state.flow].steps.map((_,i)=>i).filter(applicable);
function sync(){viewer?.setState({flow:state.flow,index:state[state.flow].index,completed:state[state.flow].done,comparison,explore,variant:state.build.variant});applyPendingSharedStep();}
function sharedTargetMatches(target){return target&&target.flow===state.flow&&target.stepID===current().officialId&&(!target.variant||target.variant===state.build.variant)&&target.comparison===comparison&&target.explore===explore;}
function applyPendingSharedStep(){
 if(!pendingSharedStep||!viewer?.loaded)return;const target=pendingSharedStep;pendingSharedStep=null;if(!sharedTargetMatches(target))return;
 viewer.playing=false;viewer.autoplayPending=false;viewer.updateOperationUI?.(true);
 if(!target.action&&!target.op)return;
 const plan=ASSEMBLY_PLAN[state.flow][current().officialId],operation=resolveShareOperation(target,plan.actors),i=operation?viewer.sceneActors.findIndex(a=>a.sourceIndex===operation.index):-1;
 if(i<0){viewer.seek(0);toast('指定の小ステップは変更されています。手順の最初を表示します。');return;}
 viewer.seek(shareOperationPosition(i,operation.fraction,viewer.sceneActors.length));viewer.focusOperation(i);
}
function sharedContext(withOperation=true){
 const s=current(),f=FLOWS[state.flow],context={flow:state.flow,stepID:s.officialId,original:FLOWS.build.manualID===2251,gen2:[2454,2435].includes(f.manualID),variant:state.build.variant,view:mobileView,lang:currentLanguage(),comparison,explore};
 if(withOperation&&!explore){
  const plan=ASSEMBLY_PLAN[state.flow][s.officialId];
  if(sharedTargetMatches(pendingSharedStep)&&(pendingSharedStep.action||pendingSharedStep.op)){Object.assign(context,{action:pendingSharedStep.action,op:pendingSharedStep.op,at:pendingSharedStep.at});}
  else if(viewer?.loaded&&viewer.state?.flow===state.flow&&viewer.state.index===state[state.flow].index&&viewer.sceneActors?.length){const i=viewer.activeOperation||0,a=viewer.sceneActors[i],fraction=Math.max(0,Math.min(1,viewer.operationProgress*viewer.sceneActors.length-i));Object.assign(context,operationAnchor(plan.actors,a.sourceIndex,fraction));}
  else if(pendingOperation?.context===operationContext())Object.assign(context,operationAnchor(plan.actors,pendingOperation.index,0));
 }
 return context;
}
function syncSharedLocation(){
 const context=sharedContext(mobileView==='model'||!compact.matches),canonical=new URL(buildAssemblyStepURL(location.href,context)),route=canonical.pathname.split('/').at(-1),local=new URL(route||'index.html',location.href);local.search=canonical.search;local.hash='';
 if(local.href!==location.href)history[nextHistoryMode==='push'?'pushState':'replaceState'](null,'',local);nextHistoryMode='replace';
}
function shareSummary(){const s=current();return `${FLOWS[state.flow].title} · ${s.chapter+1}.${s.officialStep} ${s.title}`;}
function assemblyShareLinks(){
 const base=sharedContext(false),links=[{kind:'step',url:buildAssemblyStepURL(location.href,base)}],currentContext=sharedContext(true);
 if(currentContext.action){const p=ASSEMBLY_PLAN[state.flow][current().officialId],operation=resolveShareOperation(currentContext,p.actors);links.push({kind:'operation',url:buildAssemblyStepURL(location.href,{...currentContext,view:'model'}),title:operation?`${operation.index+1} / ${p.actors.length}　${p.actors[operation.index].label}`:''});}return links;
}
const stepSharing=createStepSharing({language:currentLanguage,beforeOpen:pauseForReference,getLinks:assemblyShareLinks,summary:shareSummary});
$('.stage-actions').append(stepSharing.button());
function render(){
 if(!applicable(state[state.flow].index)){const next=eligible().find(i=>i>=state[state.flow].index);state[state.flow].index=next??eligible().at(-1);}
 const f=FLOWS[state.flow],l=state[state.flow],s=current(),done=l.done.includes(l.index),active=eligible(),finished=l.done.filter(i=>active.includes(i)),pct=Math.round(finished.length/active.length*100);
 $('#guide-heading').textContent=f.guide;$('#chapter-count').textContent=`${f.chapters.length}章`;$('#progress-percent').textContent=`${pct}%`;$('#progress-fill').style.transform=`scaleX(${pct/100})`;$('#progress-label').textContent=`${finished.length} / ${active.length} 手順確認済み`;
 document.querySelectorAll('[data-flow]').forEach(b=>{const active=b.dataset.flow===state.flow;b.classList.toggle('active',active);b.setAttribute('aria-selected',String(active));});
 $('#chapters').innerHTML=f.chapters.map((title,c)=>{const list=f.steps.map((s,i)=>({...s,i})).filter(s=>s.chapter===c&&applicable(s.i)),active=s.chapter===c,complete=list.every(s=>l.done.includes(s.i));return `<div class="chapter"><button class="chapter-button ${active?'current':''}" data-chapter="${c}" aria-expanded="${active}"><span class="chapter-number">${complete?icon('check'):String(c+1).padStart(2,'0')}</span><span>${title}</span><span class="chapter-arrow">${icon(active?'chevron-down':'chevron-right')}</span></button>${active?`<div class="chapter-steps">${list.map(s=>`<button class="chapter-step ${s.i===l.index?'current':''} ${l.done.includes(s.i)?'done':''}" data-step="${s.i}" ${s.i===l.index?'aria-current="step"':''}><span class="official-step-number">${s.officialStep}</span>${esc(s.title.replace('\n',''))}</button>`).join('')}</div>`:''}</div>`;}).join('');
 const list=checks(s),checked=Array.isArray(l.checks[l.index])?l.checks[l.index]:[],valid=list.every((_,i)=>checked.includes(i));
 const compare=state.flow==='upgrade'?`<div class="comparison" aria-label="アップグレード比較"><button data-compare="before" class="${comparison==='before'?'active':''}" aria-pressed="${comparison==='before'}">CORE One</button><button data-compare="after" class="${comparison==='after'?'active':''}" aria-pressed="${comparison==='after'}">${s.final?'CORE One+':'このステップ'}</button></div>`:'';
 $('#instructions').innerHTML=`<div class="instruction-content"><div class="step-meta"><span class="eyebrow">第${s.chapter+1}章 · 手順 ${s.officialStep} / ${s.chapterSteps}</span><span class="step-time">マニュアル ${f.revision}</span></div>${compare}<h2>${esc(s.title).replace('\n','<br>')}</h2>${stepInstructions(s)}${s.tip?`<div class="tip"><div class="tip-title">${icon('tip')} 注意事項</div><p>${esc(s.tip)}</p></div>`:''}${stepReferences(s)}${s.chooseVariant?`<label class="variant-choice">ドアハンドルの固定方式<select id="handle-variant"><option value="screw" ${state.build.variant==='screw'?'selected':''}>ネジ固定式</option><option value="glued" ${state.build.variant==='glued'?'selected':''}>接着式</option></select></label>`:''}<section class="inline-manual-photos" aria-label="この手順の写真"><div data-step-photos></div></section>${officialReferenceActions(s)}${s.supplies?.length?`<details class="supplies" open><summary>この手順で用意する部品 <span>${s.supplies.length}種類</span></summary><ul>${s.supplies.map(t=>`<li>${esc(t)}</li>`).join('')}</ul></details>`:''}${ASSEMBLY_PLAN[state.flow][s.officialId].actors.length?`<div class="parts-section"><div class="section-label">この手順の動き<span>${ASSEMBLY_PLAN[state.flow][s.officialId].actors.length}操作</span></div>${ASSEMBLY_PLAN[state.flow][s.officialId].actors.map((a,i)=>`<button class="part-line" data-operation="${i}"><span class="part-mini operation-number">${i+1}</span><span class="part-line-name">${esc(a.label)}</span><span>${icon('play')}</span></button>`).join('')}</div>`:''}${s.tools.length?`<div class="tools-section"><div class="section-label">主な工具<span></span></div><div class="tools-row">${s.tools.map(t=>`<span class="tool-chip">${icon('wrench')}${esc(t)}</span>`).join('')}</div>`:''}${list.length?`<div class="checklist">${list.map((c,i)=>`<label><input type="checkbox" data-check="${i}" ${checked.includes(i)?'checked':''}><span>${esc(c)}</span></label>`).join('')}</div>`:''}</div><div class="instruction-bottom"><button class="primary-button ${done?'completed':''}" id="complete-step" ${!valid&&!done?'disabled':''}>${icon(done?'check':s.overview&&!s.final?'arrow-right':s.remove?.length?'minus':'check')}<span>${done?'このステップは確認済み':s.action||(s.final?'ガイドの確認を完了':'この手順を確認')}</span></button>${s.parts.length&&!s.overview?`<button class="animation-button" id="${ASSEMBLY_PLAN[state.flow][s.officialId].actors.length?'play-animation':'focus-reference'}">${icon(ASSEMBLY_PLAN[state.flow][s.officialId].actors.length?'play':'focus')}${ASSEMBLY_PLAN[state.flow][s.officialId].actors.length?'この手順の動きを再生':'この手順を3Dで確認'}</button>`:`<button class="animation-button" id="learn-controls">${icon('mouse')}3Dの操作方法を見る</button>`}<a class="manual-link" href="${s.source||f.manual}" target="_blank" rel="noopener">出典：Prusa Research · 公式ページ ${icon('arrow-up-right')}</a></div>`;
 $('#step-position').textContent=`${active.indexOf(l.index)+1} / ${active.length}`;$('#previous').disabled=l.index===active[0];$('#next').disabled=l.index===active.at(-1);
 const windowStart=Math.max(0,Math.min(active.length-7,active.indexOf(l.index)-3));$('#step-dots').innerHTML=active.slice(windowStart,windowStart+7).map(i=>`<button class="step-dot ${l.done.includes(i)?'done':''} ${i===l.index?'active':''}" data-step="${i}" aria-label="第${f.steps[i].chapter+1}章 手順${f.steps[i].officialStep}" ${i===l.index?'aria-current="step"':''}></button>`).join('');
 $('#stage-mode-label').textContent=explore||s.overview?'完成形':`第${s.chapter+1}章 · 手順${s.officialStep}`;
 $('#stage-hint').textContent=explore?'完成形を表示中':s.overview?'部品を選択すると名前を表示します':ASSEMBLY_PLAN[state.flow][s.officialId].handheld?'LoveBoard一式を手に持って配線する':ASSEMBLY_PLAN[state.flow][s.officialId].workspace==='printer'?'本体への取り付け':'作業台でサブアセンブリを組み立て';
 const photoKeys=cadChecks(),photoCheck=$('#cad-photo-check');photoCheck.hidden=!photoKeys.length;photoCheck.textContent=photoKeys.length===1?cadPhotoChecks[photoKeys[0]].label:'部品の向き・配線を公式写真と照合';
 $('#head-inspect').hidden=!(explore||s.overview||s.final||state.flow==='upgrade'||s.chapter>5||s.chapter===5&&s.officialStep>=23);
 $('#model-name').textContent=FLOWS.build.manualID===2251?FLOWS.build.editionLabel:comparison==='before'?'Prusa CORE One':state.flow==='build'||explore||s.final?'Prusa CORE One+':l.index===0?'Prusa CORE One':'CORE One → CORE One+';$('#selected-card').hidden=true;$('#complete-view')?.classList.toggle('active',explore);$('#complete-view')?.setAttribute('aria-pressed',String(explore));if($('#complete-view'))completeViewLabel($('#complete-view'),explore);sync();save();updateMobile();translateDOM();manualReference?.mountInline();$('#instructions .step-meta')?.append(stepSharing.button());stepSharing.refresh();syncSharedLocation();
}
function go(i,direction=1){const total=FLOWS[state.flow].steps.length;while(i>=0&&i<total&&!applicable(i))i+=direction;if(i<0||i>=total)return;if(i!==state[state.flow].index)nextHistoryMode='push';pendingSharedStep=null;state[state.flow].index=i;explore=false;comparison='after';render();if(compact.matches)setMobileView(mobileView);else requestAnimationFrame(()=>{const r=$('#workspace').getBoundingClientRect();if(r.top<0||r.bottom>innerHeight)$('#workspace').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});});}
function switchFlow(flow){if(flow===state.flow)return;nextHistoryMode='push';pendingSharedStep=null;state.flow=flow;comparison='after';explore=false;viewer?.setView('perspective');render();toast(`${FLOWS[flow].title}に切り替えました`);}
function selectPart(k,mesh){if(!PARTS[k])return;selectedMesh=mesh;const p=PARTS[k],title=(mesh?.userData.cadName||p.en).replace(/\s+v\d+(?:\.\d+)?/g,'').replace(/:\d+$/,'');let dims='';if(mesh){const d=viewer.meshDimensions(mesh);dims=`<small class="part-dimensions">外形 ${d.x.toFixed(1)} × ${d.z.toFixed(1)} × ${d.y.toFixed(1)} mm</small>`;}$('#selected-card').innerHTML=`<div class="selected-top"><h3>${esc(p.name)}</h3><button class="icon-button" data-close-selection aria-label="部品情報を閉じる">${icon('x')}</button></div><p class="cad-part-name">${esc(title)}</p><p>${esc(p.desc)}</p>${dims}<div class="selected-actions"><button data-focus="${k}">${icon('focus')}この部品を拡大</button><button data-find-step="${k}">${icon('list')}関連する手順</button></div>`;$('#selected-card').hidden=false;translateDOM($('#selected-card'));}
function modal(html){$('#modal').classList.remove('manual-dialog');$('#modal-content').innerHTML=html;const dialog=$('#modal'),heading=$('#modal-content h2');if(heading){heading.id=heading.id||'modal-heading';dialog.setAttribute('aria-labelledby',heading.id);}else dialog.removeAttribute('aria-labelledby');translateDOM(dialog);dialog.showModal();document.body.classList.add('dialog-open');}
function help(){modal(`<span class="eyebrow" style="color:var(--orange)">操作方法</span><h2 class="modal-title" style="margin-top:12px">ガイドの使い方</h2><p class="modal-intro">手順を読み、部品と向きを写真で確認してください。取り付け位置は3Dモデルで確認できます。</p><div class="help-grid"><div>${icon('mouse')}<span><strong>モデルを回転する</strong><small>スマホは3Dモデルを1本指で回転できます。マウスはドラッグで回転します。</small></span></div><div>${icon('plus')}<span><strong>移動・拡大する</strong><small>スマホは2本指で移動・ピンチで拡大。マウスは右ドラッグで移動、ホイールで拡大します。</small></span></div><div>${icon('explode')}<span><strong>取り付け動作を確認する</strong><small>3Dの下の「再生」を押してください。スライダーで動作を途中まで戻せます。破線は移動方向、薄い形は取り付け位置です。</small></span></div><div>${icon('tag')}<span><strong>部品名を確認する</strong><small>部品を選択すると名前と関連する手順を表示します。</small></span></div></div><p class="modal-note">公式の手順番号を確認 → 写真と3Dで位置を確認 → チェックして次へ。進捗はこのブラウザーに自動保存されます。キーボードの←／→でも前後のステップへ進めます。</p><button class="primary-button" data-close-modal>閉じる ${icon('arrow-right')}</button>`);}
function about(){modal(`<span class="eyebrow">ASSEMBLY LAB</span><h2 class="modal-title">このガイドについて</h2><p class="modal-intro">CORE One+の組み立てと、CORE Oneからのアップグレードを練習するためのガイドです。</p><p class="modal-note">公式マニュアルの手順番号と順序に対応しています。組み立ては改訂1.02、アップグレードは改訂1.00を参照しています。ドアハンドルの方式に合わせて、該当する分岐を選んでください。</p><p class="modal-note">3DはPrusa Research公式フルCADを基にしています。ホットエンドはコミュニティCAD、基板・ギア・配線など一部の部品は説明用の再現モデルです。出典と形状の制限は「出典・ライセンス」に記載しています。</p><p class="modal-note">3Dで位置と向きを確認し、ネジの種類、締め付け、配線、検査・校正は同じ番号の公式手順で確認してください。実機のセルフテストは、プリンターで実行します。Gen 2は含みません。MK4Sは後続対応です。</p><div class="modal-links"><a href="https://www.printables.com/model/1520471" target="_blank" rel="noopener">公式フルCAD ↗</a><a href="https://www.printables.com/model/1486513" target="_blank" rel="noopener">アップグレード部品 ↗</a><a href="https://www.prusa3d.com/page/media-assets_987/" target="_blank" rel="noopener">ブランド資料 ↗</a><a href="./credits.html?v=20261112-113" target="_blank" rel="noopener">出典・ライセンス ↗</a></div>`);}

function library(){modal(`<span class="eyebrow" style="color:var(--orange)">PARTS LIBRARY</span><h2 class="modal-title" style="margin-top:12px">パーツライブラリ</h2><p class="modal-intro">部品名またはユニット名で検索してください。</p><div class="library-mode"><button class="active" data-library-mode="units">ユニットから探す</button><button data-library-mode="cad">CAD内の全パーツ</button></div><input type="search" class="library-search" id="library-search" placeholder="部品名を検索…" aria-label="部品名を検索"><div class="library-list" id="library-list"></div>`);let mode='units';const populate=()=>{const q=$('#library-search').value.trim().toLowerCase();let entries;if(mode==='cad')entries=(viewer?.records||[]).filter(r=>r.key!=='alternate'&&(FLOWS.build.manualID!==2251||!PARTS[r.key]?.plus||PARTS[r.key]?.reused)).filter(r=>(r.name+' '+(r.sourceName||'')+' '+(PARTS[r.key]?.name||'')).toLowerCase().includes(q)).map(r=>({key:r.key,name:r.name,sub:PARTS[r.key]?.name||r.key,id:r.id}));else entries=Object.entries(PARTS).filter(([,p])=>FLOWS.build.manualID!==2251||!p.plus||p.reused).filter(([,p])=>(p.name+' '+p.en).toLowerCase().includes(q)).map(([key,p])=>({key,name:p.name,sub:p.en}));$('#library-list').innerHTML=mode==='cad'&&!viewer?.loaded?'<p class="modal-intro">CADパーツを読み込み中です。</p>':entries.length?entries.map(e=>`<button class="library-item" data-library-part="${e.key}" ${e.id?`data-mesh="${e.id}"`:''}><span class="part-mini">${icon(PARTS[e.key]?.icon||'box')}</span><div><strong>${esc(e.name)}</strong><small>${esc(e.sub)}</small></div><span>${icon('arrow-up-right')}</span></button>`).join(''):'<p class="modal-intro">一致する部品がありません。別の名前で検索してください。</p>';translateDOM($('#library-list'));};refreshLibrary=populate;$('#library-search').oninput=populate;$('#modal-content').querySelectorAll('[data-library-mode]').forEach(b=>b.onclick=()=>{mode=b.dataset.libraryMode;if(mode==='cad')ensureViewer();$('#modal-content').querySelectorAll('[data-library-mode]').forEach(x=>x.classList.toggle('active',x===b));populate();});populate();}
function complete(){const l=state[state.flow],s=current();if(!checks(s).every((_,i)=>(l.checks[l.index]||[]).includes(i)))return;sharedPreview=false;if(!l.done.includes(l.index))l.done.push(l.index);if(s.overview&&!s.final){go(l.index+1);return;}render();toast(s.final?'最後の手順を確認しました':'この手順を確認済みにしました');if(s.final){const active=eligible(),total=active.length,finished=l.done.filter(i=>active.includes(i)).length,all=finished===total;modal(`<div class="complete-icon">${icon('shield-check')}</div><h2 class="modal-title" style="text-align:center">${all?'すべての手順を確認しました':'未確認の手順があります'}</h2><p class="modal-intro" style="text-align:center">${all?'すべてのステップを確認しました。':`${finished} / ${total} 手順を確認済みです。未確認の工程にも戻って練習できます。`}<br>実機では校正とセルフテストの結果を確認してください。</p><button class="primary-button" data-close-modal>ガイドに戻る ${icon('arrow-right')}</button>`);}}
document.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;
 if(b.hasAttribute('data-official-reference')){manualReference.open();return;}
 if(b.id==='retry-model'){if(viewerModuleReload)location.reload();else ensureViewer(true);return;}
 if(b.dataset.mobileView){setMobileView(b.dataset.mobileView);return;}
 if(b.id==='mobile-chapters'){chapterPicker();return;}
 if(b.id==='mobile-model-context'){showStepReview();return;}
 if(b.id==='review-complete'){if(reviewIsCurrent()&&checks(current()).every((_,i)=>(state[state.flow].checks[state[state.flow].index]||[]).includes(i))){$('#modal').close();complete();}return;}
 if(b.hasAttribute('data-first-unfinished')){const i=eligible().find(i=>!state[state.flow].done.includes(i));$('#modal').close();if(i!==undefined)go(i);return;}
 if(b.hasAttribute('data-open-library')){library();return;}
 if(b.dataset.flow){if(b.closest('#modal'))$('#modal').close();switchFlow(b.dataset.flow);if(compact.matches)setMobileView(mobileView);return;}
 if(b.dataset.chapter!==undefined){go(FLOWS[state.flow].steps.findIndex(s=>s.chapter===Number(b.dataset.chapter)));return;}
 if(b.dataset.step!==undefined){if(b.closest('#chapter-menu'))$('#modal').close();go(Number(b.dataset.step));return;}
 if(b.dataset.operation!==undefined){playOperation(Number(b.dataset.operation));return;}
 if(b.hasAttribute('data-cad-reference-step')){const step=FLOWS.build.steps.find(s=>s.officialId===Number(b.dataset.cadReferenceStep));if(step)manualReference.openReference({step,flow:FLOWS.build,flowId:'build',returnLabel:'3Dに戻る',returnFocus:$('#cad-photo-check')},b.dataset.cadReferencePhoto);return;}
 if(b.id==='cad-photo-check'){showCadPhotos();return;}
 if(b.id==='head-inspect'){focusPart('head');return;}
 if(b.dataset.part){focusPart(b.dataset.part);return;}
 if(b.dataset.view){document.querySelectorAll('[data-view]').forEach(x=>x.classList.toggle('active',x===b));closeCameraPresets();viewer?.setView(b.dataset.view);return;}
 if(b.dataset.compare){comparison=b.dataset.compare;render();return;}
 if(b.hasAttribute('data-close-selection')){$('#selected-card').hidden=true;return;}
 if(b.dataset.focus){if(viewer?.loaded&&!viewer.focus(b.dataset.focus,selectedMesh))toast('この部品は現在の3D表示に含まれていません。');return;}
 if(b.dataset.findStep){const k=b.dataset.findStep;let i=FLOWS[state.flow].steps.findIndex((s,i)=>i>0&&s.parts.includes(k));if(i<0){switchFlow(PARTS[k].old?'upgrade':'build');i=FLOWS[state.flow].steps.findIndex((s,i)=>i>0&&s.parts.includes(k));}if(i>=0)go(i);else toast('この部品はユニットの一部として取り付けます');return;}
 if(b.hasAttribute('data-close-modal')){$('#modal').close();return;}
 if(b.dataset.libraryPart){const k=b.dataset.libraryPart;$('#modal').close();explore=true;comparison=PARTS[k]?.old?'before':'after';render();const mesh=b.dataset.mesh?viewer?.records.find(x=>x.id===b.dataset.mesh)?.mesh:undefined;focusPart(k,mesh);return;}
 if(b.id==='complete-step')complete();if(b.id==='play-animation')playOperation(0);if(b.id==='learn-controls')help();if(b.id==='focus-reference'){if(compact.matches)setMobileView('model');else ensureViewer();viewer?.setView(current().view||'perspective');}
});
$('#instructions').addEventListener('change',e=>{if(e.target.id==='handle-variant'){state.build.variant=e.target.value;go(state[state.flow].index);return;}if(e.target.dataset.check===undefined)return;const i=Number(e.target.dataset.check);if(setStepCheck(i,e.target.checked))$(`#instructions [data-check="${i}"]`)?.focus?.({preventScroll:true});});
$('#modal').addEventListener('change',e=>{if(!reviewIsCurrent())return;if(e.target.id==='review-variant'&&current().chooseVariant){state.build.variant=e.target.value;$('#modal').close();go(state[state.flow].index);return;}if(e.target.dataset.reviewCheck!==undefined)setStepCheck(Number(e.target.dataset.reviewCheck),e.target.checked);});
$('#previous').onclick=()=>go(state[state.flow].index-1,-1);$('#next').onclick=()=>go(state[state.flow].index+1);$('#help').onclick=help;$('#about').onclick=about;$('#library-nav').onclick=library;$('#workspace-nav').onclick=()=>$('#workspace').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
$('#modal-close').onclick=()=>$('#modal').close();$('#modal').addEventListener('click',e=>{if(e.target!==$('#modal'))return;const r=$('#modal').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('#modal').close();});
$('#operation-play').onclick=()=>{viewer?.togglePlayback();syncSharedLocation();};
$('#operation-start').onclick=()=>{viewer?.seek(0);syncSharedLocation();};
$('#operation-end').onclick=()=>{viewer?.seek(1);syncSharedLocation();};
$('#operation-progress').oninput=e=>{viewer?.seek(Number(e.target.value)/1000);syncSharedLocation();};
$('#camera-reset').onclick=()=>{closeCameraPresets();viewer?.resetCamera();document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view==='perspective'));};$('#zoom-in').onclick=()=>viewer?.zoom(.83);$('#zoom-out').onclick=()=>viewer?.zoom(1.2);
function toggle(id,fn){const b=$(id);b.onclick=()=>{const on=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',String(on));b.classList.toggle('active',on);fn(on);};}toggle('#labels-toggle',v=>viewer?.setLabels(v));toggle('#ghost-toggle',v=>viewer?.setGhost(v));toggle('#door-toggle',v=>viewer?.setDoor(v));
function placeOperationPanel(){const expanded=document.fullscreenElement||$('#stage').classList.contains('is-expanded');if(expanded){$('#stage').append($('#operation-panel'));$('#stage').append($('.mobile-bottom'));}else{$('#model-panel').insertBefore($('#operation-panel'),$('.step-navigation'));document.body.append($('.mobile-bottom'));}requestAnimationFrame(()=>viewer?.resize());}
document.addEventListener('fullscreenchange',placeOperationPanel);
$('#screenshot').onclick=()=>{if(viewer?.loaded){viewer.saveImage();toast('3D画像を保存しました');}else toast('3Dモデルを準備中です');};async function closeModelFullscreen(){if(document.fullscreenElement){await document.exitFullscreen();}$('#stage').classList.remove('is-expanded');document.body.classList.remove('model-expanded');placeOperationPanel();requestAnimationFrame(()=>viewer?.resize());}
$('#fullscreen').onclick=async()=>{if(document.fullscreenElement||$('#stage').classList.contains('is-expanded')){await closeModelFullscreen();return;}try{if($('#stage').requestFullscreen){await $('#stage').requestFullscreen();placeOperationPanel();return;}}catch{}$('#stage').classList.add('is-expanded');document.body.classList.add('model-expanded');placeOperationPanel();requestAnimationFrame(()=>viewer?.resize());};
$('#model-fullscreen-close').onclick=()=>closeModelFullscreen();

$('#reset-progress').onclick=()=>{modal(`<h2 class="modal-title">このガイドを最初から</h2><p class="modal-intro">「${esc(FLOWS[state.flow].title)}」の進捗とチェックをリセットします。もう一方のガイドの進捗は残ります。</p><div class="reset-dialog-actions"><button class="subtle-button" data-close-modal>キャンセル</button><button class="primary-button" id="confirm-reset">最初からはじめる</button></div>`);$('#confirm-reset').onclick=()=>{sharedPreview=false;state[state.flow]={...state[state.flow],index:0,done:[],checks:{}};$('#modal').close();explore=false;render();viewer?.setView('perspective');toast('このガイドの進捗をリセットしました');};};
document.addEventListener('keydown',e=>{if($('#modal').open||['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))return;if(e.key==='ArrowRight'){e.preventDefault();go(state[state.flow].index+1);}if(e.key==='ArrowLeft'){e.preventDefault();go(state[state.flow].index-1,-1);}if(e.key==='Escape'){$('#selected-card').hidden=true;if($('#stage').classList.contains('is-expanded'))closeModelFullscreen();}});
const cv=document.createElement('button');cv.id='complete-view';cv.className='complete-view';completeViewLabel(cv,false);cv.setAttribute('aria-pressed','false');$('.stage-actions').prepend(cv);cv.onclick=()=>{explore=!explore;if(!explore)comparison='after';render();};
document.addEventListener('error',e=>{if(e.target.matches?.('.reference-photo img'))e.target.hidden=true;},true);
$('#mobile-previous').onclick=()=>{const n=navState();if(n.previous!==undefined)go(n.previous,-1);};
$('#mobile-next').onclick=()=>{const n=navState();if(n.next!==undefined)go(n.next);};
$('#mobile-complete').onclick=()=>{const n=navState();if(n.previewNext){if(n.next!==undefined)go(n.next);return;}if(n.readFirst){showStepReview();return;}if(n.disabled)return;const before=state[state.flow].index,final=current().final;if(n.verified&&!final){if(n.next!==undefined)go(n.next);return;}complete();if(!final&&state[state.flow].index===before&&n.next!==undefined)go(n.next);};
$('#touch-model-toggle').onclick=()=>{if(!viewer?.loaded){toast('3Dモデルを読み込み中です。');return;}viewer.setInteraction(!viewer.interactionEnabled);};
$('#modal').addEventListener('close',()=>{if($('#modal').open)return;document.body.classList.remove('dialog-open');refreshLibrary=undefined;});
compact.addEventListener('change',()=>{updateMobile();if(!compact.matches)ensureViewer();requestAnimationFrame(()=>viewer?.resize());});
$('.tab-end').innerHTML=languageControl();$('.header-right').insertAdjacentHTML('afterbegin',languageControl());
document.addEventListener('change',async e=>{
 if(!e.target.matches?.('[data-language]'))return;
 const select=e.target,next=select.value;select.disabled=true;
 try{if(await setLanguage(next)){const referenceOpen=manualReference.isOpen();if(!referenceOpen)$('#modal').close();render();viewer?.localize?.();translateDOM();if(referenceOpen)manualReference.reopen();}}
 catch{toast(languageLoadError());}
 finally{document.querySelectorAll('[data-language]').forEach(s=>{s.disabled=false;s.value=currentLanguage();});}
});
renderIcons();render();translateDOM();if(initialLanguageError)toast(initialLanguageError);else if(recheckCount)toast(`${recheckCount}手順をもう一度確認してください。確認項目に未チェックがあります。`);if(!compact.matches||mobileView==='model')ensureViewer();

function pauseForReference(){pendingFocus=undefined;pendingOperation=undefined;if(viewer?.playing)viewer.togglePlayback();if(viewer)viewer.autoplayPending=false;}
manualReference=createManualReference({dialog:$('#modal'),content:$('#modal-content'),modal,context:()=>({step:current(),flow:FLOWS[state.flow],flowId:state.flow,returnLabel:compact.matches&&mobileView!=='model'?'ガイドに戻る':'3Dに戻る'}),pause:pauseForReference,inlineContainer:()=>$('#instructions')});
manualReference.mountInline();

// Keep browser/OS sharing on the current operation without writing history on
// every animation frame. Only changes to the active action replace the URL.
let lastSharedOperation;
const shareOperationObserver=new MutationObserver(()=>{
 const marker=[state.flow,current().officialId,state.build.variant,mobileView,comparison,explore,viewer?.activeOperation,viewer?.sceneActors?.length].join(':');
 if(marker!==lastSharedOperation){lastSharedOperation=marker;syncSharedLocation();}
});
shareOperationObserver.observe($('#operation-position'),{childList:true,subtree:true,characterData:true});
let sharedNavigation=Promise.resolve(),sharedNavigationAttempt=0;
addEventListener('popstate',()=>{
 const href=location.href,attempt=++sharedNavigationAttempt;
 sharedNavigation=sharedNavigation.then(async()=>{
  if(attempt!==sharedNavigationAttempt)return;
  const requested=new URL(href).searchParams.get('lang');
  if(['ja','en','cs','de'].includes(requested)&&requested!==currentLanguage())try{await setLanguage(requested,{persist:!new URL(href).searchParams.has('step')});}catch{toast('言語を読み込めませんでした。もう一度お試しください。');}
  if(attempt!==sharedNavigationAttempt)return;
  const target=readAssemblyStepLink(href,FLOWS,{defaultFlow:state.flow});
  if(!target.valid){if(target.invalid)toast('指定された手順が見つかりませんでした。工程一覧から選択してください。');return;}
  $('#modal').close();document.querySelector('.step-share-dialog[open]')?.close();
  state=applyAssemblyStepLink(state,target);sharedPreview=target.requested;pendingSharedStep=target;comparison=target.comparison;explore=target.explore;mobileView=target.view||mobileView;nextHistoryMode='replace';pendingFocus=undefined;pendingOperation=undefined;render();if(mobileView==='model'||!compact.matches)ensureViewer();
 }).catch(error=>console.error(error));
});
if(initialSharedStep.invalid)toast('指定された手順が見つかりませんでした。工程一覧から選択してください。');
