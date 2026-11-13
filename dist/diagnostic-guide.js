import {diagnosticNodes,DIAGNOSTIC_SOURCES,diagnosticTransition}from './maintenance-diagnostics.js?v=20261113-115';
import {JAPANESE_SOURCE_TITLES}from './diagnostic-ja.js?v=20261113-115';
import {ALERT_COPY} from './maintenance-alert-data.js?v=20261113-127';
const l=s=>s.split('|'),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const UI={title:l('症状から確認する|Find checks by symptom|Kontrola podle příznaku|Problem eingrenzen'),back:l('回答を戻す|Previous answer|Předchozí odpověď|Vorherige Antwort'),reset:l('症状を選び直す|Choose another symptom|Vybrat jiný příznak|Anderes Symptom wählen'),inspect:l('確認箇所を3Dで見る|Inspect this area in 3D|Prohlédnout místo ve 3D|Prüfstelle in 3D ansehen'),tasks:l('対応する作業|Related procedures|Související postupy|Passende Verfahren'),source:l('公式の確認手順|Official inspection instructions|Oficiální postup kontroly|Offizielle Prüfanleitung'),path:l('これまでの確認|Your inspection path|Dosavadní kontrola|Bisheriger Prüfweg'),resume:l('確認の続きを開く|Continue inspection|Pokračovat v kontrole|Prüfung fortsetzen')};
UI.observations=l('利用者の報告（公式手順ではありません）|User reports (not official instructions)|Hlášení uživatelů (nejde o oficiální postupy)|Nutzerberichte (keine offiziellen Anleitungen)');
export function createDiagnosticGuide({dialog,body,title,language,tasks,onInspect,onTask,onAlert=()=>{}}){
 let history=['start'];
 const text=a=>typeof a==='string'?a:a[({ja:0,en:1,cs:2,de:3})[language()]??0];
 function render(focus=false){
  if(dialog.dataset.mode!=='diagnostics')return;
  const nodes=diagnosticNodes(language());if(history.some(id=>!nodes[id]))history=['start'];
  const id=history.at(-1),node=nodes[id];title.textContent=text(UI.title);
  // Replacing an answer must not anchor the new question to a removed button.
  // Otherwise a later layout pass can scroll the outer dialog past its header.
  dialog.style.overflowAnchor='none';body.style.overflowAnchor='none';
  body.innerHTML=`<div class="diagnostic-guide" data-diagnostic-node="${id}"><nav class="diagnostic-trail" aria-label="${esc(text(UI.path))}">${history.length>1?`<button data-diagnostic-back>← ${esc(text(UI.back))}</button><button data-diagnostic-reset>${esc(text(UI.reset))}</button>`:''}</nav><p class="diagnostic-context">CORE One / CORE One+</p><h2 tabindex="-1">${esc(text(node.title))}</h2><p class="diagnostic-body">${esc(text(node.body))}</p>${id==='start'?`<button type="button" data-diagnostic-alerts>${esc(text(ALERT_COPY.symptom))} →</button>`:''}${node.inspection?`<button class="diagnostic-inspect" data-diagnostic-inspect>${esc(text(UI.inspect))} ↗</button>`:''}${node.tasks?.length?`<section class="diagnostic-procedures"><h3>${esc(text(UI.tasks))}</h3>${node.tasks.map(id=>`<button data-diagnostic-task="${id}">${esc(text(tasks.find(t=>t.id===id).title))} →</button>`).join('')}</section>`:''}${node.choices?.length?`<div class="diagnostic-answers">${node.choices.map((c,i)=>`<button data-diagnostic-answer="${i}"><span>${esc(text(c.title))}</span><span aria-hidden="true">→</span></button>`).join('')}</div>`:''}${node.sources?.length?`<nav class="diagnostic-sources" aria-label="${esc(text(UI.source))}">${node.sources.map((id,i)=>`<a href="${DIAGNOSTIC_SOURCES[id]}" target="_blank" rel="noopener">${esc(language()==='ja'?(JAPANESE_SOURCE_TITLES[id]||text(UI.source)):text(UI.source)+(node.sources.length>1?` ${i+1}`:''))} ↗</a>`).join('')}</nav>`:''}</div>`;
  if(node.observations?.length){
   const details=document.createElement('details');details.className='diagnostic-sources';details.dataset.diagnosticObservations='';
   const summary=document.createElement('summary');summary.textContent=text(UI.observations);summary.style.cssText='min-height:44px;align-content:center;cursor:pointer';details.append(summary);
   for(const observation of node.observations){
    const paragraph=document.createElement('p');paragraph.className='diagnostic-body';paragraph.textContent=text(observation.body);
    const link=document.createElement('a');link.href=observation.url;link.target='_blank';link.rel='noopener';link.textContent=text(observation.title)+' ↗';
    details.append(paragraph,link);
   }
   body.querySelector('.diagnostic-guide').append(details);
  }
  if(focus){dialog.scrollTop=0;body.scrollTop=0;body.querySelector('h2').focus({preventScroll:true});}
 }
 body.addEventListener('click',e=>{
  if(dialog.dataset.mode!=='diagnostics')return;
  const button=e.target.closest('button');if(!button)return;
  if(button.hasAttribute('data-diagnostic-alerts')){onAlert('picker');return;}
  const nodes=diagnosticNodes(language()),node=nodes[history.at(-1)];if(!node){history=['start'];render(true);return;}
  if(button.hasAttribute('data-diagnostic-answer')){const c=node.choices?.[Number(button.dataset.diagnosticAnswer)];if(c)history=diagnosticTransition(history,c.next,nodes);render(true);}
  else if(button.hasAttribute('data-diagnostic-back')){if(history.length>1)history=history.slice(0,-1);render(true);}
  else if(button.hasAttribute('data-diagnostic-reset')){history=['start'];render(true);}
  else if(button.hasAttribute('data-diagnostic-inspect')&&node.inspection){dialog.close();onInspect(node.inspection);}
  else if(button.dataset.diagnosticTask&&node.tasks?.includes(button.dataset.diagnosticTask)){dialog.close();onTask(button.dataset.diagnosticTask,node.taskSteps?.[button.dataset.diagnosticTask]??0);}
 });
 return {open(){dialog.dataset.mode='diagnostics';render();if(!dialog.open)dialog.showModal();dialog.scrollTop=0;body.scrollTop=0;body.querySelector('h2').focus({preventScroll:true});},render:()=>render(),get current(){return history.at(-1);},get depth(){return history.length;},label:()=>text(history.length>1?UI.resume:UI.title)};
}
