import {buildMaintenanceStepURL,operationAnchor,resolveShareOperation,shareOperationPosition} from './step-share.js';
import {createStepSharing} from './step-share-ui.js';
import {AUTHORED_MAINTENANCE_SHARE_IDS} from './maintenance-share-catalog.js';

const languages=new Set(['ja','en','cs','de']),views=new Set(['guide','model','screen']);
const validID=id=>typeof id==='string'&&/^[a-zA-Z0-9_.:-]{1,120}$/.test(id);
const numberID=id=>(typeof id==='number'&&Number.isSafeInteger(id)&&id>0)||(typeof id==='string'&&/^[1-9]\d*$/.test(id))?String(id):null;

export function maintenanceShareIndex(tasks,sources={}){
 const result=new Map();
 for(const task of tasks){
  const official=task.steps.map((s,i)=>numberID(s.officialId??sources[task.id]?.steps?.[i]?.id));
  const count=new Map();for(const id of official)if(id)count.set(id,(count.get(id)||0)+1);
  const catalogCounts=new Map();for(const s of task.steps)if(validID(s.id))catalogCounts.set(s.id,(catalogCounts.get(s.id)||0)+1);
  const rows=task.steps.map((s,i)=>{
   if(official[i]&&count.get(official[i])===1)return{index:i,sid:official[i],kind:'official'};
   if(validID(s.id)&&catalogCounts.get(s.id)===1)return{index:i,sid:s.id,kind:'catalog'};
   const authored=(AUTHORED_MAINTENANCE_SHARE_IDS[task.id]||[]).filter(r=>r.englishTitle===s.title?.[1]);
   return{index:i,sid:authored.length===1?authored[0].id:null,kind:authored.length===1?'authored':'ordinal'};
  });
  const unique=new Map();for(const row of rows)if(row.sid)unique.set(row.sid,(unique.get(row.sid)||0)+1);
  for(const row of rows)if(row.sid&&unique.get(row.sid)>1){row.sid=null;row.kind='ambiguous';}
  const seen=new Map();for(const row of rows)if(row.sid)seen.set(row.sid,row.index);
  result.set(task.id,{task,rows,byID:seen});
 }
 return result;
}

export function readMaintenanceStepLink(href,index){
 const p=new URL(href).searchParams,requested=['task','step','sid','action','op'].some(k=>p.has(k)),entry=index.get(p.get('task'));
 if(['task','step','sid','view','lang','action','op','at','symptom'].some(k=>p.getAll(k).length>1))return{requested,valid:false};
 if(p.has('step')&&(!/^[1-9]\d*$/.test(p.get('step')||'')||!Number.isSafeInteger(Number(p.get('step')))||Number(p.get('step'))>10000))return{requested,valid:false};
 if(!entry)return{requested,valid:false};
 let step=-1;
 if(p.has('sid'))step=entry.byID.get(p.get('sid'))??-1;
 else if(/^[1-9]\d*$/.test(p.get('step')||'')){const n=Number(p.get('step'));if(Number.isSafeInteger(n)&&n<=entry.task.steps.length)step=n-1;}
 if(step<0)return{requested,valid:false};
 if(p.has('sid')&&p.has('step')&&Number(p.get('step'))!==step+1)return{requested,valid:false};
 const hasOperation=p.has('action')||p.has('op');
 return{requested,valid:true,taskId:entry.task.id,index:step,sid:entry.rows[step].sid,view:hasOperation?'model':views.has(p.get('view'))?p.get('view'):'guide',lang:languages.has(p.get('lang'))?p.get('lang'):undefined,symptom:p.get('symptom'),hasOperation,params:p};
}

function pause(viewer){if(!viewer||viewer.disposed)return;viewer.playing=false;viewer.autoplayPending=false;viewer.updateOperationUI?.(true);}
function operation(viewer){
 if(!viewer?.loaded||viewer.disposed||!viewer.sceneActors?.length)return null;
 const n=viewer.sceneActors.length,progress=Math.max(0,Math.min(1,Number(viewer.operationProgress)||0)),scaled=progress*n,index=progress===1?n-1:Math.floor(scaled);
 return operationAnchor(viewer.sceneActors,index,progress===1?1:scaled-index);
}
export function maintenanceStepURL(href,context){
 const raw=buildMaintenanceStepURL(href,context);
 // Assembly has no screen view; maintenance already has a firmware-screen tab.
 // Keep that existing maintenance-only view even with an older generic codec.
 if(context.view!=='screen')return raw;
 const url=new URL(raw);url.searchParams.set('view','screen');return url.href;
}

export function createMaintenanceSharing({tasks,sources={},language,current,href=()=>location.href}){
 const index=maintenanceShareIndex(tasks,sources),route=readMaintenanceStepLink(href(),index);
 let preview=route.requested,pending=route.valid&&route.hasOperation,initialPausePending=route.requested,destroyed=false,operationInvalid=false;
 const buttons=new Set();
 const note=document.createElement('p');note.className='service-share-preview';note.setAttribute('role','status');
 const previewText={ja:'共有リンクで表示中。確認するまでは保存済みの進捗を変更しません。',en:'Viewing a shared link. Saved progress stays unchanged until you confirm a step.',cs:'Zobrazení sdíleného odkazu. Uložený postup se nezmění, dokud nepotvrdíte krok.',de:'Geteilter Link wird angezeigt. Der gespeicherte Fortschritt bleibt bis zur Bestätigung eines Schritts unverändert.'};
 const invalidText={ja:'共有された手順が見つかりません。作業一覧から選んでください。',en:'The shared step was not found. Choose a step from the list.',cs:'Sdílený krok nebyl nalezen. Vyberte krok ze seznamu.',de:'Der geteilte Schritt wurde nicht gefunden. Bitte einen Schritt aus der Liste wählen.'};
 const operationText={ja:'指定の小ステップが見つからないため、手順の最初で停止しています。',en:'The requested action was not found. Paused at the start of the step.',cs:'Požadovaná dílčí operace nebyla nalezena. Postup je pozastaven na začátku kroku.',de:'Die angegebene Einzelaktion wurde nicht gefunden. Der Schritt ist am Anfang angehalten.'};
 const refreshNote=()=>{note.hidden=!preview;note.textContent=(operationInvalid?operationText:route.valid?previewText:invalidText)[language()]||previewText.ja;};refreshNote();
 const matches=c=>route.valid&&c.task.id===route.taskId&&c.index===route.index;
 const context=()=>{
  const c=current(),row=index.get(c.task.id)?.rows[c.index];
  return{...c,sid:row?.sid,taskID:c.task.id,step:c.index+1,lang:language()};
 };
 const stateURL=(c,anchor)=>maintenanceStepURL(href(),{task:c.taskID,step:c.step,sid:c.sid,view:c.view,lang:c.lang,symptom:c.taskID==='clog'?c.symptom:undefined,...anchor});
 const sharing=createStepSharing({language,beforeOpen:()=>pause(current().viewer),summary:()=>{const c=context();return`${c.taskTitle} · ${c.step} / ${c.task.steps.length} · ${c.stepTitle}`;},getLinks:()=>{
  if(destroyed)return[];const c=context();if(!c.sid)return[];const links=[{kind:'step',url:stateURL(c),title:c.stepTitle}],anchor=c.view==='model'?operation(c.viewer):null;
  if(anchor)links.push({kind:'operation',url:stateURL(c,anchor),title:c.viewer.sceneActors[Math.min(c.viewer.sceneActors.length-1,Math.floor(c.viewer.operationProgress*c.viewer.sceneActors.length))]?.label||c.stepTitle});return links;
 }});
 return{
  route,index,
  get preview(){return preview;},
  notice(){return note;},
  button(){const b=sharing.button();buttons.add(b);b.disabled=!context().sid;b.setAttribute('aria-disabled',String(b.disabled));return b;},
  open(){if(!destroyed)sharing.open();},
  refresh(){if(destroyed)return;if(pending&&!matches(current()))pending=false;refreshNote();sharing.refresh();for(const b of buttons){b.disabled=!context().sid;b.setAttribute('aria-disabled',String(b.disabled));}},
  commit(){preview=false;pending=false;initialPausePending=false;refreshNote();},
  updateURL(url){
   const c=context();if(c.sid)url.searchParams.set('sid',c.sid);else url.searchParams.delete('sid');
   if(pending&&matches(c)){for(const k of['action','op','at']){const v=route.params.get(k);if(v!==null)url.searchParams.set(k,v);else url.searchParams.delete(k);}}
   else{const a=c.view==='model'?operation(c.viewer):null;for(const k of['action','op','at'])if(a?.[k]!==undefined)url.searchParams.set(k,String(a[k]));else url.searchParams.delete(k);}
  },
  applyOperation(viewer,taskId,stepIndex){
   if(destroyed||!viewer?.loaded||viewer.disposed)return false;
   if(initialPausePending){pause(viewer);initialPausePending=false;}
   if(!pending)return false;
   if(taskId!==route.taskId||stepIndex!==route.index){pending=false;return false;}
   pending=false;pause(viewer);
   // Presence, including an empty action, never falls back to ordinal op.
   const missing=()=>{viewer.seek(0);pause(viewer);operationInvalid=true;refreshNote();return false;};
   if(route.params.has('action')&&!/^[a-f0-9]{8}\.[1-9]\d{0,3}$/.test(route.params.get('action')||''))return missing();
   const target=resolveShareOperation(route.params,viewer.sceneActors||[]);if(!target)return missing();
   viewer.seek(shareOperationPosition(target.index,target.fraction,viewer.sceneActors.length));pause(viewer);return true;
  },
  destroy(){if(destroyed)return;destroyed=true;pending=false;buttons.clear();note.remove();sharing.destroy();}
 };
}
