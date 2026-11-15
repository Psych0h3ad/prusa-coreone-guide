import {thermistorReplacementScene} from './thermistor-service-model.js';
import {HEATER_REFS as R,HEATER_SCREW_DATUMS as H} from './heater-service-geometry.js';
import {THERMISTOR_SCREW_REF as NTC_SCREW,THERMISTOR_SCREW_DATUM as N} from './thermistor-service-geometry.js';
import {nozzleServiceActors} from './nozzle-service-motion.js';
let sock=true;
export const rebuildUsesSock=()=>sock;
export function setRebuildSock(value){sock=!!value;}
const heaterWires=['hotendHeater0','hotendHeater1'],thermistorWires=['hotendThermistor0','hotendThermistor1'];
const screws=[...R.screws,NTC_SCREW],all=['serviceNozzle','serviceSock',R.block,R.heater,R.thermistor,...screws,...heaterWires,...thermistorWires];
// Chosen working pose, not an OEM dimension: lower the detached assembly,
// bring it forward, then lift to the working height. Keep every free lead.
const WORK=[0,-80,0],HANDLING=[[0,0,0],[0,0,-50],[0,-80,-50],WORK];
const labels={
 sockOut:['ソックを外す（使用時）','Remove the fitted sock','Sejmout používaný návlek','Verwendete Socke abziehen'],
 loosenNozzle:['13–16でブロックを支え、7 mmでノズルを緩める','Hold the block with 13–16 and loosen the nozzle with 7 mm','Držet blok klíčem 13–16 a povolit trysku klíčem 7 mm','Block mit 13–16 halten und Düse mit 7 mm lösen'],
 withdrawNozzle:['緩んだノズルを回し、チューブごと抜く','Unscrew the loose nozzle and withdraw its tube','Povolenou trysku vyšroubovat a vytáhnout i s trubičkou','Gelöste Düse herausschrauben und mit Rohr herausziehen'],
 heaterOut:['ヒーターと自由配線をそっと抜く','Withdraw the heater with its free leads gently','Jemně vytáhnout topení s volnými vodiči','Heizpatrone mit freien Leitungen vorsichtig herausziehen'],
 thermistorOut:['中央穴のノズル側サーミスターと自由配線を抜く','Withdraw the middle-bore hotend thermistor and free leads','Vytáhnout termistor hotendu z prostředního otvoru s volnými vodiči','Hotend-Thermistor mit freien Leitungen aus der mittleren Bohrung ziehen'],
 heaterIn:['ヒーターを入れ、下端をブロック底面にそろえる','Insert the heater flush with the block bottom','Zasunout topení v rovině se spodkem bloku','Heizpatrone bündig zur Blockunterseite einsetzen'],
 thermistorIn:['ノズル側サーミスターを中央穴へ入れる','Insert the hotend thermistor into its middle bore','Zasunout termistor hotendu do prostředního otvoru','Hotend-Thermistor in die mittlere Bohrung einsetzen'],
 nozzleIn:['ノズルチューブをまっすぐ差し込む','Insert the nozzle tube straight','Rovně zasunout trubičku trysky','Düsenrohr gerade einsetzen'],
 tightenNozzle:['13–16で支え、接触までねじ込む・指定1.5 Nm','Hold with 13–16; seat the nozzle and tighten to 1.5 Nm','Přidržet 13–16; usadit trysku a dotáhnout na 1,5 Nm','Mit 13–16 halten; Düse anlegen und mit 1,5 Nm anziehen'],
 sockIn:['使用するソックを戻す','Refit the sock if used','Vrátit používaný návlek','Verwendete Socke aufziehen']
};
const indexed=(kind,i)=>kind==='loosen'?['T6で止めねじ'+i+'を緩める','Loosen grub screw '+i+' with T6','Povolit stavěcí šroub '+i+' klíčem T6','Madenschraube '+i+' mit T6 lösen']:kind==='out'?['止めねじ'+i+'を抜き取る','Remove grub screw '+i,'Vyjmout stavěcí šroub '+i,'Madenschraube '+i+' herausnehmen']:kind==='start'?['止めねじ'+i+'を少し入れる','Start grub screw '+i+' loosely','Lehce zašroubovat stavěcí šroub '+i,'Madenschraube '+i+' lose ansetzen']:['位置を支え、止めねじ'+i+'をやさしく締める','Hold position and gently tighten grub screw '+i,'Držet polohu a jemně dotáhnout šroub '+i,'Position halten und Madenschraube '+i+' vorsichtig anziehen'];
const pose=(refs,offset)=>({refs,pivot:[0,0,0],rotation:[0,0,0],offset});
const move=(refs,label,from,to,extra={})=>({refs,label,axis:[0,0,1],distance:0,showBefore:true,focusMotion:true,motionPivot:[0,0,0],posePath:[{offset:from,rotation:[0,0,0]},{offset:to,rotation:[0,0,0]}],...extra});
export function hotendRebuildScene(task,index,text,base){
 if(!task.hotendRebuild)return null;
 const s=task.steps[index],shim={...task,thermistorService:true,steps:task.steps.map((q,i)=>i===index?{...q,componentMode:undefined}:q)},spec=thermistorReplacementScene(shim,index,text,base),plan=spec.plan;
 if(!sock){spec.hidden.push('serviceSock');for(const a of plan.actors)if(a.refs)a.refs=a.refs.filter(r=>r!=='serviceSock');if(plan.visibleRefs)plan.visibleRefs=plan.visibleRefs.filter(r=>r!=='serviceSock');}
 const mode=s.rebuildMode;if(!mode)return spec;
 Object.assign(plan,{actors:[],camera:'base-right-perspective',headOnly:true,contextOpacity:.08,focus:[R.block,R.heater,R.thermistor,...screws],solidRefs:all.filter(r=>sock||r!=='serviceSock'),viewBounds:[-30,-170,145,20,-100,295],viewMinDistance:100,operationPadding:4,settledFocus:[R.block,R.heater,R.thermistor,...screws],hotendRebuild:{mode,sock,blockHeld:true,workpieceOffsetMM:[0,-80,-60],handlingPathMM:HANDLING,handlingIsAuthoredNotOEMDimension:true}});
 if(mode!=='nozzle-out')plan.workpiecePoses.push(pose(all.filter(r=>sock||r!=='serviceSock'),WORK));
 const a=plan.actors,park=(refs,offset)=>plan.workpiecePoses.push(pose(refs,offset));
 const screw=(i,from,to,kind,carry=false)=>{
  const d=i<2?{bore:[...H.bore,H.z[i]],out:H.out,inner:H.innerT,length:H.length}:{bore:N.bore,out:N.out,inner:N.referenceInnerTMM,length:N.referenceLengthMM};
  const head=d.bore.map((n,k)=>n+d.out[k]*(d.inner+d.length)+WORK[k]);head[2]-=60;
  const rotation=n=>d.out.map(v=>-v*720*Math.min(n,4.1));
  return{...move([screws[i]],text(indexed(kind,i+1)),d.out.map(v=>v*from),d.out.map(v=>v*to)),axis:d.out,motionPivot:head,posePath:[from,...((from<4.1&&to>4.1||from>4.1&&to<4.1)?[4.1]:[]),to].map(n=>({offset:d.out.map(v=>v*n),rotation:rotation(n)})),carry,anchors:[head],guideAtAnchor:true,guideRadius:1.8,guideTube:.15,focusMinDistance:75,focusRefs:[R.block]};
 };
 const cartridge=(refs,key,from,to)=>move(refs,text(labels[key]),[0,0,from],[0,0,to],{anchors:[[-6.4,-142.3,258]],guideAtAnchor:true,guideRadius:2.5,guideTube:.2,focusRefs:[R.block],transparentRefs:[R.block],focusBounds:[-29,-166,240,14,-120,290],focusMinDistance:85});
 if(mode==='nozzle-out'){
  const handling=move(all.filter(r=>sock||r!=='serviceSock'),text(['取り外した一式と自由配線を作業位置へ運ぶ','Carry the detached assembly and free leads to the working position','Přenést vyjmutou sestavu i volné vodiče do pracovní polohy','Ausgebaute Baugruppe mit freien Leitungen in Arbeitsposition bringen']),[0,0,0],WORK);handling.posePath=HANDLING.map(offset=>({offset,rotation:[0,0,0]}));a.push(handling);
  if(sock){const part=move(['serviceSock'],text(labels.sockOut),[0,0,0],[30,0,-20]);part.posePath=[[0,0,0],[0,0,-20],[30,0,-20]].map(offset=>({offset,rotation:[0,0,0]}));a.push(part);}
  const ns=nozzleServiceActors(true,text);ns[0].label=text(labels.loosenNozzle);ns[1].label=text(labels.withdrawNozzle);a.push(...ns);
  for(const actor of a.slice(1)){if(actor.posePath)actor.posePath=actor.posePath.map(p=>({...p,offset:p.offset.map((n,k)=>n+WORK[k])}));if(actor.waypoints)actor.waypoints=actor.waypoints.map(p=>p.map((n,k)=>n+WORK[k]));}
 }
 if(['parts-out','parts-ready','parts-in'].includes(mode)){park(['serviceNozzle'],[0,0,-75]);if(sock)park(['serviceSock'],[30,0,-20]);}
 if(mode==='parts-out'){
  for(let i=0;i<3;i++)a.push(screw(i,0,2,'loosen'));
  a.push(cartridge([R.heater,...heaterWires],'heaterOut',0,20),cartridge([R.thermistor,...thermistorWires],'thermistorOut',0,20));
  for(let i=0;i<3;i++)a.push(screw(i,2,10,'out',true));
 }
 if(mode==='parts-ready'){
  park([R.heater,...heaterWires,R.thermistor,...thermistorWires],[0,0,20]);
  for(let i=0;i<3;i++){const held=screw(i,2,10,'out'),end=held.posePath.at(-1);plan.workpiecePoses.push({refs:[screws[i]],pivot:held.motionPivot,offset:end.offset,rotation:end.rotation});}
  plan.inspectRefs=[R.block,R.heater,R.thermistor,...screws,'serviceNozzle'];plan.inspectionLabel=text(s.title);
 }
 if(mode==='parts-in'){
  for(let i=0;i<3;i++)a.push(screw(i,10,2,'start'));
  a.push(cartridge([R.heater,...heaterWires],'heaterIn',20,0),cartridge([R.thermistor,...thermistorWires],'thermistorIn',20,0));
  for(let i=0;i<3;i++)a.push(screw(i,2,0,'tighten',true));
 }
 if(mode==='nozzle-in'){
  const ns=nozzleServiceActors(false,text);ns[0].label=text(labels.nozzleIn);ns[1].label=text(labels.tightenNozzle);a.push(...ns);
  for(const actor of ns)if(actor.motionPivot)actor.motionPivot=actor.motionPivot.map((n,k)=>n+WORK[k]);
  if(sock){const part=move(['serviceSock'],text(labels.sockIn),[30,0,-20],[0,0,0]);part.posePath=[[30,0,-20],[0,0,-20],[0,0,0]].map(offset=>({offset,rotation:[0,0,0]}));a.push(part);}
  const handling=move(all.filter(r=>sock||r!=='serviceSock'),text(['組み直した一式を取付け位置へ戻す','Return the rebuilt assembly to its installation position','Vrátit sestavený hotend do montážní polohy','Zusammengebautes Hotend zur Einbauposition zurückführen']),[0,0,0],WORK.map(n=>-n),{carry:true});handling.posePath=HANDLING.slice().reverse().map(p=>({offset:p.map((n,k)=>n-WORK[k]),rotation:[0,0,0]}));a.push(handling);
 }
 return spec;
}
export const HOTEND_REBUILD_LABELS=labels;
