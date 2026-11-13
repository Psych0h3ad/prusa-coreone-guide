import {ALERT_COPY as C,ALERT_NODES as nodes} from './maintenance-alert-data.js?v=20261113-127';
import {ALERT_PHOTOS as photos,ALERT_SOURCES as sources} from './maintenance-alert-photos.js?v=20261113-127';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function createMaintenanceAlertGuide({dialog,body,title,language,tasks,getOrigin,onTask,returnFocus}){
 let active=false,history=[],origin=null,entry='picker',generation=0,readyStep=null;const photoIndices=new Map();
 const text=a=>a[({ja:0,en:1,cs:2,de:3})[language()]??0],current=()=>history.at(-1),owned=()=>active&&dialog.dataset.mode==='maintenance-alerts',mmuEntry=()=>['862005','867830'].includes(entry),taskIds=node=>mmuEntry()&&node.mmuTasks?node.mmuTasks:node.tasks||[],canResume=node=>node.resume&&!(mmuEntry()&&node.mmuResume===false);
 function retire(){active=false;++generation;readyStep=null;}
 function finish(){const previous=origin;retire();origin=null;if(dialog.open)dialog.close();returnFocus(previous);}
 function render(focus=false){
  if(!owned())return;if(!dialog.open&&!focus)return;
  const g=++generation,id=current(),node=nodes[id];if(!node)return;
  const ready=readyStep!==null,items=ready?[]:photos[node.photos]||[],photoIndex=Math.max(0,Math.min(items.length-1,photoIndices.get(id)||0)),photo=items[photoIndex],related=ready?[]:taskIds(node),article=node.article||((entry in sources)?entry:'837189');
  title.textContent=text(C.title);dialog.setAttribute('aria-labelledby',title.id);
  const originTask=tasks.find(t=>t.id===origin?.taskId),originLabel=originTask?`${text(originTask.title)} · ${text(C.step)} ${origin.index+1}/${originTask.steps.length}`:'';
  body.innerHTML=`<section class="diagnostic-guide" data-maintenance-alert-node="${esc(ready?'ready':id)}" data-alert-entry="${esc(entry)}"><nav class="diagnostic-trail">${history.length>1||ready?`<button type="button" data-alert-back>← ${esc(text(C.back))}</button>`:''}<button type="button" data-alert-reset>${esc(text(C.start))}</button></nav><p class="diagnostic-context">CORE One / CORE One+</p><h2 tabindex="-1">${esc(text(ready?C.ready:node.title))}</h2><p class="diagnostic-body">${esc(text(ready?C.readyBody:node.body))}</p>${originLabel?`<p class="library-note" data-alert-origin>${esc(text(C.origin))}: ${esc(originLabel)}</p>`:''}
   ${id==='picker'?`<p class="library-note">${esc(text(C.noLive))}</p>`:''}
   ${photo?`<figure class="service-photo"><img data-alert-photo src="${esc(photo.src)}" alt="${esc(text(node.title)+' · '+text(C.photo)+' '+(photoIndex+1))}" width="${photo.width}" height="${photo.height}" decoding="async" style="display:block;width:100%;height:auto" aria-busy="true"><p data-alert-photo-status role="status">${esc(text(C.photoLoading))}</p><button type="button" data-alert-photo-retry hidden>${esc(text(C.retry))}</button><figcaption>${esc(text(C.photo))} ${photoIndex+1}/${items.length} · <a href="${esc(sources[photo.source])}" target="_blank" rel="noopener">Prusa Research · ${esc(photo.source)}</a></figcaption></figure>${items.length>1?`<nav class="display-frame-controls"><button type="button" data-alert-photo-previous ${photoIndex===0?'disabled':''}>← ${esc(text(C.previousPhoto))}</button><output>${photoIndex+1}/${items.length}</output><button type="button" data-alert-photo-next ${photoIndex===items.length-1?'disabled':''}>${esc(text(C.nextPhoto))} →</button></nav>`:''}`:''}
   ${related.length?`<section class="diagnostic-procedures"><h3>${esc(text(C.procedures))}</h3>${related.map(id=>{const task=tasks.find(t=>t.id===id);if(!task)throw Error('Missing alert task '+id);return`<button type="button" data-alert-task="${esc(id)}">${esc(text(task.title))} · ${esc(text(C.first))} →</button>`;}).join('')}</section>`:''}
   ${!ready&&node.choices?.length?`<nav class="diagnostic-answers">${node.choices.map(id=>`<button type="button" data-alert-node="${esc(id)}">${esc(text(nodes[id].title))} →</button>`).join('')}</nav>`:''}
   ${!ready&&canResume(node)?`<nav class="diagnostic-answers"><button type="button" data-alert-checked>${esc(text(C.checked))} →</button><button type="button" data-alert-node="stop">${esc(text(C.unresolved))} →</button></nav>`:''}
   ${!ready&&node.resume&&!canResume(node)?`<button type="button" data-alert-node="stop">${esc(text(C.unresolved))} →</button>`:''}
   ${ready?`<div class="diagnostic-procedures"><button type="button" data-alert-test>${esc(text(C.test))} · ${esc(text(C.step))} ${readyStep} →</button><button type="button" data-alert-node="stop">${esc(text(C.unresolved))} →</button></div>`:''}
   <nav class="diagnostic-sources" aria-label="${esc(text(C.source))}">${[article,node.secondary].filter(Boolean).map(id=>`<a href="${esc(sources[id])}" target="_blank" rel="noopener">${esc(text(C.source))} · ${esc(id)} ↗</a>`).join('')}</nav><button type="button" data-alert-return>${esc(text(C.return))}</button></section>`;
  const img=body.querySelector('[data-alert-photo]');if(img){const settle=failed=>{if(!owned()||generation!==g||!body.contains(img))return;img.setAttribute('aria-busy','false');img.dataset.photoState=failed?'failed':'ready';const status=body.querySelector('[data-alert-photo-status]');status.hidden=!failed;status.textContent=failed?text(C.photoFailed):'';body.querySelector('[data-alert-photo-retry]').hidden=!failed;};img.addEventListener('load',()=>settle(false),{once:true});img.addEventListener('error',()=>settle(true),{once:true});if(img.complete)settle(!img.naturalWidth);}
  if(focus){dialog.scrollTop=0;body.scrollTop=0;body.querySelector('h2').focus({preventScroll:true});}
 }
 function open(id='picker'){
  if(!['picker','862005','867830','837189'].includes(id))return false;
  origin=Object.freeze({...getOrigin()});entry=id;history=[id];readyStep=null;active=true;dialog.dataset.mode='maintenance-alerts';render();if(!dialog.open)dialog.showModal();render(true);return true;
 }
 function click(e){if(!owned())return;const b=e.target.closest('button');if(!b)return;
  if(b.hasAttribute('data-alert-return')){finish();return;}
  if(b.hasAttribute('data-alert-reset')){readyStep=null;entry='picker';history=['picker'];render(true);return;}
  if(b.hasAttribute('data-alert-back')){if(readyStep!==null)readyStep=null;else if(history.length>1)history.pop();render(true);return;}
  if(b.dataset.alertNode&&nodes[b.dataset.alertNode]){readyStep=null;if(['862005','867830','837189'].includes(b.dataset.alertNode))entry=b.dataset.alertNode;history.push(b.dataset.alertNode);render(true);return;}
  const node=nodes[current()];
  if(b.hasAttribute('data-alert-checked')&&canResume(node)){readyStep=node.resume;render(true);return;}
  if(b.hasAttribute('data-alert-test')&&readyStep!==null){const step=tasks.find(t=>t.id==='initial-setup')?.steps.findIndex(s=>s.officialStep===readyStep);if(step<0||step===undefined)throw Error('Missing actual setup stage');retire();origin=null;dialog.close();onTask('initial-setup',step);return;}
  if(b.dataset.alertTask&&taskIds(node).includes(b.dataset.alertTask)){const target=b.dataset.alertTask;retire();origin=null;dialog.close();onTask(target,0);return;}
  const items=photos[node.photos]||[],previous=photoIndices.get(current())||0;
  if(b.hasAttribute('data-alert-photo-previous')||b.hasAttribute('data-alert-photo-next')){photoIndices.set(current(),Math.max(0,Math.min(items.length-1,previous+(b.hasAttribute('data-alert-photo-next')?1:-1))));render();return;}
  if(b.hasAttribute('data-alert-photo-retry'))render();
 }
 function close(){if(!owned()||dialog.open)return;const previous=origin;retire();origin=null;returnFocus(previous);}
 body.addEventListener('click',click);dialog.addEventListener('close',close);
 return{open,render(){if(active&&dialog.dataset.mode!=='maintenance-alerts'){retire();origin=null;return;}render();},get current(){return Object.freeze({active,entry,node:current(),depth:history.length,readyStep,origin});},dispose(){const own=owned();retire();origin=null;body.removeEventListener('click',click);dialog.removeEventListener('close',close);if(own&&dialog.open)dialog.close();}};
}
