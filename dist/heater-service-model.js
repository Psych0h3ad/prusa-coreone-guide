// Visual thread motion uses M3 coarse 0.5 mm pitch and stops turning after clearing the modeled block. Not an operating turn-count instruction.
import {HEATER_REFS as R,HEATER_SCREW_DATUMS as D} from './heater-service-geometry.js';
const LEADS=['hotendThermistor0','hotendThermistor1','hotendHeater0','hotendHeater1'];
const pose=(refs,offset)=>({refs,pivot:[0,0,0],rotation:[0,0,0],offset});
const actor=(refs,label,from,to,extra={})=>({refs,label,axis:[0,0,1],distance:0,showBefore:true,focusMotion:true,motionPivot:[0,0,0],posePath:[{offset:from,rotation:[0,0,0]},{offset:to,rotation:[0,0,0]}],...extra});
export function heaterReplacementScene(task,index,text,base){
 if(!task.heaterService)return null;
 const s=task.steps[index],at=s.componentAccessIndex??9,ref=task.accessReference,padded={...ref,steps:ref.steps.map((q,i)=>i===at?{...q,title:s.title,body:s.body,refs:s.refs,action:s.componentAccessIndex===undefined?undefined:q.action}:q)},spec=base(padded,at),plan=spec.plan;
 const bodies=['serviceNozzle','serviceSock',R.block,R.heater,R.thermistor,...R.screws],map=refs=>(refs||[]).flatMap(r=>r==='hotend'?bodies:r==='serviceBlock'?[R.block]:r==='hotend-heater-heaterCartridge'?[R.heater]:[r]);
 for(const k of['focus','inspectRefs','solidRefs','transparentRefs','visibleRefs'])if(plan[k])plan[k]=map(plan[k]);for(const a of plan.actors){if(a.refs)a.refs=map(a.refs);if(a.focusRefs)a.focusRefs=map(a.focusRefs);}for(const p of plan.workpiecePoses||[])p.refs=map(p.refs);
 spec.hidden.push(R.original);plan.visibleRefs=[...(plan.visibleRefs||[]),R.heater,R.thermistor,...R.screws];
 const mode=s.componentMode;
 if(!mode)return spec;
 plan.operationPadding=2;plan.actors=[];plan.camera='base-right-perspective';plan.headOnly=true;plan.contextOpacity=.08;plan.focus=[R.block,R.heater,...R.screws];plan.solidRefs=bodies;plan.viewBounds=[-28,-86,240,12,-42,290];plan.viewMinDistance=80;plan.settledFocus=[R.block,R.heater,...R.screws];
 const a=plan.actors,wireRefs=LEADS.slice(2),travel=20,cartridgeView={calloutAvoidBounds:[-25,-80,244,8,-46,285],anchors:[[-7.71056565,-67.6519166,257.2]],guideAtAnchor:true,guideRadius:3.3,guideTube:.25,focusBounds:[-24,-82,244,8,-46,287],focusMinDistance:80,focusRefs:[R.block],transparentRefs:[R.block]};
 if(mode==='sock-out')a.push(actor(['serviceSock'],text(s.title),[0,0,-20],[0,0,0],{remove:true,keepRemoved:true}));else spec.hidden.push('serviceSock');
 const screw=(i,from,to,label)=>{const head=[D.bore[0]+D.out[0]*(D.innerT+D.length),D.bore[1]+D.out[1]*(D.innerT+D.length),D.z[i]-60];return{...actor([R.screws[i]],text(label),D.out.map(x=>x*from),D.out.map(x=>x*to)),axis:D.out,motionPivot:head,posePath:[from,...((from<4.1&&to>4.1||from>4.1&&to<4.1)?[4.1]:[]),to].map(n=>({offset:D.out.map(x=>x*n),rotation:D.out.map(x=>-x*720*Math.min(n,4.1))})),camera:'base-right-perspective',focusBounds:[-28,-80,247,4,-46,273],focusMinDistance:70,anchors:[head],guideAtAnchor:true,guideRadius:1.8,guideTube:.15};};
 const loosen=i=>['ヒーター固定ねじ'+(i+1)+'をT6で緩める','Loosen heater screw '+(i+1)+' with T6','Povolit šroub topení '+(i+1)+' klíčem T6','Heizungsschraube '+(i+1)+' mit T6 lösen'];
 const remove=i=>['元の止めねじ'+(i+1)+'を外す','Remove old grub screw '+(i+1),'Vyjmout starý stavěcí šroub '+(i+1),'Alten Gewindestift '+(i+1)+' herausnehmen'];
 if(mode==='heater-out'){
  for(let i=0;i<2;i++)a.push(screw(i,0,2,loosen(i)));
  a.push(actor([R.heater,...wireRefs],text(s.title),[0,0,travel],[0,0,0],{remove:true,keepRemoved:true,...cartridgeView}));
  for(let i=0;i<2;i++)a.push({...screw(i,2,10,remove(i)),carry:true});
 }
 if(mode==='heater-prep'){
  plan.workpiecePoses.push(pose([R.heater,...wireRefs],[0,0,travel]),pose(R.screws,D.out.map(x=>x*10)));plan.inspectRefs=[R.heater,...R.screws];plan.inspectionLabel=text(s.title);
 }
 if(mode==='heater-in'){
  for(let i=0;i<2;i++)a.push(screw(i,10,2,['新しい止めねじ'+(i+1)+'を少しねじ込む','Start new grub screw '+(i+1)+' loosely','Lehce zašroubovat nový šroub '+(i+1),'Neuen Gewindestift '+(i+1)+' lose eindrehen']));
  a.push(actor([R.heater,...wireRefs],text(['ヒーターを差し込み、底面を合わせる','Insert heater and align the bottom surfaces','Zasunout topení a zarovnat spodní plochy','Heizpatrone einsetzen und Unterseiten ausrichten']),[0,0,travel],[0,0,0],cartridgeView));
  for(let i=0;i<2;i++)a.push({...screw(i,2,0,['位置を支え、ねじ'+(i+1)+'をやさしく締める','Hold position and gently tighten screw '+(i+1),'Držet polohu a jemně dotáhnout šroub '+(i+1),'Position halten und Schraube '+(i+1)+' vorsichtig anziehen']),carry:true});
  spec.hidden=spec.hidden.filter(r=>r!=='serviceSock');a.push(actor(['serviceSock'],text(['ソックを戻す（使用時）','Refit the sock if used','Vrátit používaný návlek','Socke falls verwendet montieren']),[0,0,-20],[0,0,0]));
 }
 return spec;
}
