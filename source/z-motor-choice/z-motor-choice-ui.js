// SPDX-License-Identifier: MIT
import {Z_MOTOR_CHOICES,Z_MOTOR_CHOICE_COPY,isZMotorChoice} from './z-motor-choice.js';
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function createZMotorChoiceUI(container,{language,onChoose}){
 const text=values=>values[({ja:0,en:1,cs:2,de:3})[language()]??0];
 let current=null;
 container.addEventListener('change',event=>{
  const select=event.target;
  if(!select.matches?.('[data-z-motor-choice]')||!isZMotorChoice(current)||!Z_MOTOR_CHOICES.some(c=>c.id===select.value))return;
  onChoose(select.value);
  container.querySelector('[data-z-motor-choice]')?.focus({preventScroll:true});
 });
 return {render(task){
  current=isZMotorChoice(task)?task:null;container.hidden=!current;
  if(!current){container.replaceChildren();return;}
  container.innerHTML=`<label for="z-motor-position">${escape(text(Z_MOTOR_CHOICE_COPY.title))}</label><select id="z-motor-position" data-z-motor-choice aria-describedby="z-motor-position-note">${Z_MOTOR_CHOICES.map(c=>`<option value="${c.id}"${c.id===current.id?' selected':''}>${escape(text(c.label))}</option>`).join('')}</select><p id="z-motor-position-note">${escape(text(Z_MOTOR_CHOICE_COPY.note))}</p>`;
 }};
}
