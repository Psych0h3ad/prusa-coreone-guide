import {loveBoardServiceScene}from './loveboard-service-model.js?v=20261111-94';
import {NEXTRUDER_BODY_REFS}from './nextruder-service-parts.js?v=20261111-94';
const BODY=[...NEXTRUDER_BODY_REFS],SENSOR=[806,'lbNtcLead'];
export const NTC_BENCH={pivot:[9.0565537,-53.3952524,370],offset:[0,-85,0],rotation:[90,0,0],sensorTravel:8,screwTravel:4.5,screwSpin:3240};
const labels={
 turn:['Nextruderを裏返す','Turn the Nextruder','Otočte Nextruder','Nextruder umdrehen'],
 back:['取り付ける向きに戻す','Return to the mounting orientation','Vraťte do montážní polohy','In die Einbaulage zurückdrehen'],
 screwOut:['M3x4Tを外す','Remove M3x4T','Vyjměte M3x4T','M3x4T herausdrehen'],
 screwIn:['M3x4Tを慎重に締める','Tighten M3x4T gently','M3x4T jemně dotáhněte','M3x4T vorsichtig anziehen'],
 sensorOut:['NTCを引き抜く','Withdraw the NTC','Vytáhněte NTC','NTC herausziehen'],
 sensorIn:['モーター側からNTCを差し込む','Insert the NTC from the motor side','Zasuňte NTC ze strany motoru','NTC von der Motorseite einsetzen']
};
const closeup={focusBounds:[-11,-117,350,14,-84,386],focusPadding:3,focusMinDistance:55,camera:'back-perspective',guideRadius:1.5,guideTube:.25,guideArrowLength:4};
export function ntcServiceScene(task,index,text){
 const n=index+1,s=task.steps[index],shared=n<=13?n:n>=17?n+2:14;
 const padded={...task,steps:Array.from({length:31},()=>s)};
 const spec=loveBoardServiceScene(padded,shared-1,text);spec.plan.step=n;
 if(n<14||n>16)return spec;
 const plan=spec.plan,bodyRefs=new Set(BODY);spec.isolated=BODY;
 spec.hidden=spec.hidden.filter(ref=>!bodyRefs.has(ref));
 plan.actors=[];plan.camera='back-perspective';plan.focus=s.refs;
 plan.solidRefs=[...BODY];plan.transparentRefs=[];
 plan.workpiecePoses.push({refs:BODY,pivot:NTC_BENCH.pivot,rotation:NTC_BENCH.rotation,offset:NTC_BENCH.offset});
 const pivot=NTC_BENCH.pivot.map((v,i)=>v+NTC_BENCH.offset[i]);
 const flip=(from,to,label,reuse=false)=>({refs:BODY,label:text(label),axis:[1,0,0],showBefore:true,focusMotion:true,handling:true,reuse,
  motionPivot:pivot,posePath:[{offset:[0,0,0],rotation:[from,0,0]},{offset:[0,0,0],rotation:[to,0,0]}],camera:'back-perspective',focusMinDistance:100});
 const sensor=(remove)=>({refs:SENSOR,label:text(labels[remove?'sensorOut':'sensorIn']),axis:[0,0,1],distance:NTC_BENCH.sensorTravel,
  remove,keepRemoved:remove,showBefore:true,focusMotion:true,...closeup});
 const screw=(remove)=>({refs:[811],label:text(labels[remove?'screwOut':'screwIn']),axis:[0,1,0],distance:NTC_BENCH.screwTravel,
  spin:NTC_BENCH.screwSpin,remove,keepRemoved:remove,showBefore:true,focusMotion:true,...closeup});
 if(n===14)plan.actors.push(flip(-90,0,labels.turn),screw(true),sensor(true));
 if(n===15){
  plan.workpiecePoses.push({refs:SENSOR,pivot:[0,0,0],rotation:[0,0,0],offset:[0,0,NTC_BENCH.sensorTravel]},
   {refs:[811],pivot:[0,0,0],rotation:[0,0,0],offset:[0,NTC_BENCH.screwTravel,0]});
  plan.inspectRefs=s.refs;plan.inspectionLabel=text(s.title);plan.inspectionPadding=3;
 }
 if(n===16)plan.actors.push(sensor(false),screw(false),flip(0,-90,labels.back,true));
 return spec;
}
