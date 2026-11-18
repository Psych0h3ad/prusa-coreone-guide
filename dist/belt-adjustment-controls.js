// SPDX-License-Identifier: MIT
// Uses the maintenance guide's existing native select-control layout.
const layout='.service-reference.belt-adjustment-reference{flex-wrap:wrap}.service-reference.belt-adjustment-reference>#service-position{flex:1 1 160px;min-width:0}.service-reference>.belt-adjustment-choice{flex:0 1 300px;min-width:220px}.belt-adjustment-choice>.firmware-action{display:flex;flex-direction:row;align-items:center;gap:8px;min-width:0}.belt-adjustment-choice select{flex:1;min-width:0;min-height:44px;font-size:16px}@media(max-width:760px),(max-width:1000px) and (max-height:600px) and (pointer:coarse){.service-reference>.belt-adjustment-choice{flex:1 0 100%;min-width:0;padding-bottom:8px}}';
export function beltAdjustmentControls(viewer,text,choose){
 let host;
 return{render(direction,visible){
  if(viewer.disposed||!visible){if(host){host.hidden=true;host.parentElement?.classList.remove('belt-adjustment-reference');}return;}
  const reference=document.querySelector('.service-reference');if(!reference)return;if(!document.querySelector('[data-belt-adjustment-layout]')){const style=document.createElement('style');style.dataset.beltAdjustmentLayout='true';style.textContent=layout;document.head.append(style);}reference.classList.add('belt-adjustment-reference');
  if(!host){host=document.createElement('div');host.className='belt-adjustment-choice';}if(host.parentElement!==reference)reference.append(host);
  host.hidden=false;host.textContent='';const label=document.createElement('label');label.className='firmware-action';label.textContent=text(['調整する方向','Adjustment direction','Směr seřízení','Einstellrichtung']);
  const input=document.createElement('select');input.style.fontSize='16px';input.style.minHeight='44px';input.setAttribute('aria-label',label.textContent);
  for(const[id,copy]of[['tighten',['締める（周波数を上げる）','Tighten (raise frequency)','Utáhnout (zvýšit frekvenci)','Anziehen (Frequenz erhöhen)']],['loosen',['緩める（周波数を下げる）','Loosen (lower frequency)','Povolit (snížit frekvenci)','Lösen (Frequenz senken)']]]){const option=document.createElement('option');option.value=id;option.textContent=text(copy);option.selected=id===direction;input.append(option);}
  input.onchange=()=>{if(!viewer.disposed&&viewer.loaded&&viewer.operationScene?.plan.beltAdjustment)choose(input.value);};label.append(input);host.append(label);
 },close(){host?.parentElement?.classList.remove('belt-adjustment-reference');host?.remove();host=undefined;}};
}
