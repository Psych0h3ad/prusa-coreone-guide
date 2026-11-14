import {heaterReplacementScene} from './heater-service-model.js';
import {HEATER_REFS as R} from './heater-service-geometry.js';
import {THERMISTOR_SCREW_REF as SCREW,THERMISTOR_SCREW_DATUM as D} from './thermistor-service-geometry.js';
const wires=['hotendThermistor0','hotendThermistor1'],offset=n=>D.out.map(x=>x*n);
const pose=(refs,at)=>({refs,pivot:[0,0,0],rotation:[0,0,0],offset:at});
const actor=(refs,label,from,to,extra={})=>({refs,label,axis:[0,0,1],distance:0,showBefore:true,focusMotion:true,motionPivot:[0,0,0],posePath:[{offset:from,rotation:[0,0,0]},{offset:to,rotation:[0,0,0]}],...extra});
export function thermistorReplacementScene(task,index,text,base){
 if(!task.thermistorService)return null;
 const s=task.steps[index],mode=s.componentMode;
 // Reuse the accepted common source-batch aliases and hotend access procedure,
 // without duplicating its native meshes, wire producers or renderer.
 const shim={...task,heaterService:true,steps:task.steps.map((q,i)=>i===index?{...q,componentMode:mode==='sock-out'?'sock-out':undefined}:q)};
 const spec=heaterReplacementScene(shim,index,text,base),plan=spec.plan;plan.visibleRefs=[...(plan.visibleRefs||[]),SCREW];
 // The retained screw belongs to the same whole-hotend workpiece. Individual
 // sensor withdrawal below remains separate from this shared rigid frame.
 const whole=refs=>refs?.includes(R.block)&&refs.includes(R.thermistor);
 for(const p of plan.workpiecePoses||[])if(whole(p.refs))p.refs=[...p.refs,SCREW];
 for(const a of plan.actors)if(whole(a.refs))a.refs=[...a.refs,SCREW];
 if(!mode||mode==='sock-out')return spec;
 const bodies=['serviceNozzle','serviceSock',R.block,R.heater,R.thermistor,...R.screws,SCREW];
 plan.operationPadding=2;plan.actors=[];plan.camera='base-right-perspective';plan.headOnly=true;plan.contextOpacity=.08;plan.focus=[R.block,R.thermistor,SCREW];plan.solidRefs=bodies;plan.viewBounds=[-27,-82,240,12,-42,290];plan.viewMinDistance=80;plan.settledFocus=[R.block,R.thermistor,SCREW];spec.hidden.push('serviceSock');
 const head=D.bore.map((x,k)=>x+D.out[k]*(D.referenceInnerTMM+D.referenceLengthMM));head[2]-=60;
 const screw=(from,to,label)=>({...actor([SCREW],text(label),offset(from),offset(to)),axis:D.out,motionPivot:head,posePath:[from,to].map(n=>({offset:offset(n),rotation:D.out.map(x=>-x*720*n)})),anchors:[head],guideAtAnchor:true,guideRadius:1.7,guideTube:.15,focusBounds:[-22,-75,248,6,-46,272],focusMinDistance:70});
 const sensorView={calloutAvoidBounds:[-23,-76,244,8,-45,285],anchors:[[D.bore[0],D.bore[1],260]],guideAtAnchor:true,guideRadius:1.9,guideTube:.2,focusBounds:[-22,-76,244,7,-45,285],focusMinDistance:78,focusRefs:[R.block],transparentRefs:[R.block]};
 const loosen=['T6で固定ねじを緩める（抜き切らない）','Loosen the T6 retaining screw — leave it in the block','Povolit šroub T6, ponechat jej v bloku','T6-Halteschraube lösen — im Block belassen'];
 const insert=['中央穴の奥まで差し込む','Insert fully into the middle hole','Zasunout až na doraz do prostředního otvoru','Ganz in die mittlere Bohrung einsetzen'];
 if(mode==='thermistor-out'){
  plan.actors.push(screw(0,D.loosenTravelMM,loosen));
  plan.actors.push(actor([R.thermistor,...wires],text(['サーミスターと自由配線を引き抜く','Withdraw the thermistor with its free leads','Vytáhnout termistor s uvolněnými vodiči','Thermistor mit freien Leitungen herausziehen']),[0,0,20],[0,0,0],{remove:true,keepRemoved:true,...sensorView}));
 }
 if(mode==='thermistor-prep'){
  plan.workpiecePoses.push(pose([R.thermistor,...wires],[0,0,20]),pose([SCREW],offset(D.loosenTravelMM)));plan.inspectRefs=[R.thermistor];plan.inspectionLabel=text(s.title);
 }
 if(mode==='thermistor-in'){
  plan.actors.push(actor([R.thermistor,...wires],text(insert),[0,0,20],[0,0,0],sensorView));
  plan.actors.push(screw(D.loosenTravelMM,0,['T6の長い側でやさしく固定する','Gently secure with the long side of T6','Jemně dotáhnout delší stranou T6','Mit der langen T6-Seite vorsichtig befestigen']));
  spec.hidden=spec.hidden.filter(r=>r!=='serviceSock');plan.actors.push(actor(['serviceSock'],text(['使用していたソックを戻す','Refit the sock if previously used','Vrátit dříve používaný návlek','Zuvor verwendete Socke wieder anbringen']),[0,0,-20],[0,0,0]));
 }
 return spec;
}
