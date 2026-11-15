import {COVER_TEXT,RECONSTRUCTION_CREDIT,leftCoverAction,coverInstruction} from './service-cover-contract.js?v=20261111-95';
export {COVER_TEXT,COVER_MESSAGES,RECONSTRUCTION_CREDIT} from './service-cover-contract.js?v=20261111-95';
export const STORAGE_KEY='prusa-assembly-lab-left-cover-v1';
const MODES=['standard','early'],listeners=new Set();
let variant='standard',torx,acceptedEarly,activeViewer;
let assetState={status:'unprepared',code:'ASSETS_UNPREPARED',asset:null};
try{const saved=globalThis.localStorage?.getItem(STORAGE_KEY);if(MODES.includes(saved))variant=saved;}catch{}
let requestedVariant=variant,variantRequest=0;
export const currentCoverVariant=()=>variant;
export const requestedCoverVariant=()=>requestedVariant;
export const earlyCoverAvailability=()=>({...assetState,available:!!acceptedEarly,reason:acceptedEarly?'':assetState.status==='failed'?`Early cover display asset could not load or validate: ${assetState.asset||'asset set'}`:assetState.status==='loading'?'Early cover display assets are loading.':'Early cover display assets have not been prepared.'});
export const assetError=()=>Object.assign(Error(earlyCoverAvailability().reason),{code:assetState.code,asset:assetState.asset});
function hasLiveCoverViewer(){return !!(activeViewer?.loaded&&!activeViewer.disposed&&activeViewer.director);}
export function setCoverVariant(next,{persist=true}={}){if(!MODES.includes(next))throw Error('Unknown cover variant');if(next==='early'&&!acceptedEarly&&hasLiveCoverViewer())throw assetError();variant=next;requestedVariant=next;++variantRequest;if(persist)try{globalThis.localStorage?.setItem(STORAGE_KEY,next);}catch{}for(const f of listeners)f(next);}
export const EARLY_SOURCE={status:'DISPLAY_SUPPLEMENT',url:'https://www.printables.com/model/1520471',manual:'https://help.prusa3d.com/guide/how-to-replace-the-prusa-nozzle-core-one_821168#827020',license:'Open Community License v1',cover:'Original A5 Body1, no hole changes',clip:'Supplementary lower interface reconstruction; not original early-version CAD',credit:RECONSTRUCTION_CREDIT,bearingsMM:[[-22.44444631,-19.8952523953,412.0004213562],[-24.694446316,-40.8952523946,361.5004213562]],screwAsset:'./assets/hardware/M3x10rT.stl',manualScrew:'M3x10bT'};

// UI preferences and the optional model share one state instance.
export const coverModelState={
 get variant(){return variant;},set variant(value){variant=value;},
 get torx(){return torx;},set torx(value){torx=value;},
 get acceptedEarly(){return acceptedEarly;},set acceptedEarly(value){acceptedEarly=value;},
 get activeViewer(){return activeViewer;},set activeViewer(value){activeViewer=value;},
 get assetState(){return assetState;},set assetState(value){assetState=value;},
 get listeners(){return listeners;},
};
export function mountServiceCoverUI(tasks,text,{translate=key=>key}={}){
 const workspace=document.querySelector('.service-workspace');if(!workspace||document.getElementById('early-cover-choice'))return;
 const box=document.createElement('div');box.id='early-cover-choice';box.innerHTML='<label for="early-cover-select"></label><select id="early-cover-select"><option value="standard"></option><option value="early"></option></select>';workspace.querySelector('.task-picker').after(box);
 const style=document.createElement('style');style.textContent='#early-cover-choice{display:flex;align-items:center;gap:10px;flex:none;padding:4px 14px;border-bottom:1px solid #e3e5de}#early-cover-choice[hidden]{display:none}#early-cover-choice label{font-size:12px;flex:none}#early-cover-choice select{min-width:0;flex:1;font-size:16px;min-height:44px}.early-cover-source-note{font-size:12px}';document.head.append(style);
 let queued=false,selecting=false,selectionError=false;
 const set=(e,s)=>{if(e&&e.textContent!==s)e.textContent=s;};
 const render=()=>{queued=false;const task=tasks.find(t=>t.id===document.getElementById('service-task')?.value),index=Number(new URL(location.href).searchParams.get('step')||1)-1,step=task?.steps[index],show=!!leftCoverAction(step)||(workspace.dataset.serviceView==='model'&&!!activeViewer?.serviceCoverVariant?.context());if(box.hidden===show)box.hidden=!show;
  set(box.querySelector('label'),text(COVER_TEXT.label));for(const key of MODES)set(box.querySelector(`option[value="${key}"]`),text(COVER_TEXT[key]));box.querySelector('option[value="early"]').disabled=false;box.querySelector('select').disabled=selecting;box.querySelector('select').value=variant;
  if(leftCoverAction(step))set(document.getElementById('service-step-body'),text(coverInstruction(step,variant)));
  const dialog=document.getElementById('service-dialog');if(dialog?.open&&dialog.dataset.mode==='step-reference'&&step){if(leftCoverAction(step))set(dialog.querySelector('.service-reference-reading > p:last-of-type'),text(coverInstruction(step,variant)));const sources=dialog.querySelector('.service-reference-sources');if(sources&&variant==='early'){let note=sources.querySelector('.early-cover-source-note');if(!note){note=document.createElement('div');note.className='early-cover-source-note';const description=document.createElement('p'),credit=document.createElement('a');credit.href=new URL('./assets/service-cover/attribution.json',import.meta.url).href;credit.textContent='Prusa Research · Open Community License v1';note.append(description,credit);sources.append(note);}set(note.querySelector('p'),text(RECONSTRUCTION_CREDIT));}else sources?.querySelector('.early-cover-source-note')?.remove();}
 };
 const queue=()=>{if(!queued){queued=true;queueMicrotask(render);}};
 const showError=()=>{const panel=document.getElementById('service-model-error');if(panel)panel.hidden=false;};
 box.querySelector('select').addEventListener('change',async e=>{
  const next=e.target.value,owner=activeViewer;
  if(next!=='early'||acceptedEarly||!hasLiveCoverViewer()){try{setCoverVariant(next);if(selectionError){document.getElementById('service-model-error').hidden=true;selectionError=false;}}catch{showError();}render();return;}
  const ticket=++variantRequest;requestedVariant=next;selecting=true;const preparation=startServiceModelPreparation(owner.container,translate);render();
  try{const {prepareServiceCoverAssets}=await import('./service-cover-variant.js?v=20261112-105');await prepareServiceCoverAssets();if(ticket!==variantRequest||owner!==activeViewer||!hasLiveCoverViewer())return;owner.serviceCoverVariant.ensureGeometry();setCoverVariant(next);if(selectionError){document.getElementById('service-model-error').hidden=true;selectionError=false;}}
  catch{if(ticket===variantRequest&&owner===activeViewer&&hasLiveCoverViewer()){selectionError=true;showError();}}
  finally{selecting=false;preparation.finish();render();}
 });listeners.add(queue);
 new MutationObserver(queue).observe(workspace,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['hidden','data-service-view']});
 new MutationObserver(queue).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
 const dialog=document.getElementById('service-dialog');if(dialog)new MutationObserver(queue).observe(dialog,{childList:true,subtree:true,attributes:true,attributeFilter:['open']});render();
}

const activePreparations=new WeakMap();
// Continue the existing preparation treatment until the renderer loader takes over.
export function startServiceModelPreparation(container,translate){
 if(!document.getElementById('service-model-preparation-style')){const style=document.createElement('style');style.id='service-model-preparation-style';style.textContent='#canvas-container .model-loading{z-index:8;flex-direction:column;gap:12px}#canvas-container .model-loading strong{font-size:12px;font-weight:500}#canvas-container .model-loading small{font-size:10px;color:#949b89}#canvas-container .loading-cube{width:29px;height:29px;border:2px solid #fd500030;border-top-color:#fd5000;border-radius:50%;animation:service-model-loading 1s linear infinite;margin-bottom:6px}@keyframes service-model-loading{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){#canvas-container .loading-cube{animation:none}}';document.head.append(style);}
 let preparation=activePreparations.get(container);if(!preparation){preparation={previousBusy:container.getAttribute('aria-busy'),count:0};activePreparations.set(container,preparation);}preparation.count++;container.setAttribute('aria-busy','true');
 const loading=document.createElement('div');loading.className='model-loading';loading.setAttribute('role','status');loading.setAttribute('aria-live','polite');
 loading.innerHTML='<span class="loading-cube" aria-hidden="true"></span><strong></strong><small></small>';
 const update=()=>{for(const [tag,key]of [['strong','プリンターを準備しています'],['small','公式アセンブリを読み込み中…']]){const e=loading.querySelector(tag),value=translate(key);if(e.textContent!==value)e.textContent=value;}};
 update();if(!acceptedEarly||!torx)container.append(loading);
 const observer=new MutationObserver(update);observer.observe(document.documentElement,{attributes:true,attributeFilter:['lang']});let finished=false;
 const handoff=()=>{observer.disconnect();loading.remove();const next=container.querySelector('.model-loading');if(next){next.setAttribute('role','status');next.setAttribute('aria-live','polite');}};
 const finish=()=>{if(finished)return;finished=true;observer.disconnect();loading.remove();if(--preparation.count===0){activePreparations.delete(container);if(preparation.previousBusy===null)container.removeAttribute('aria-busy');else container.setAttribute('aria-busy',preparation.previousBusy);}};
 return {handoff,finish};
}
