import {socketCentre}from './loveboard-layout.js?v=20261111-94';

// Official CORE One+ guide 6, step 51:
// https://help.prusa3d.com/guide/6-nextruder-assembly_982284
const PF='servicePrintLead';
const connection=(id,socket,label,officialLine)=>({flex:[id],to:1,label,officialLine,axis:[0,0,1],showBefore:true,focusMotion:true,focusRefs:['loveBoard'],anchors:[socketCentre(socket)],camera:'service-fan-connect'});
const view={camera:'service-fan-connect',focus:['loveBoard',PF],focusPadding:10,operationPadding:10,operationFocus:undefined,contextOpacity:.055,transparentRefs:[858,860,861],inspectBoard:false,photoCheck:null,note:'',solidRefs:[790,794,806,791,834,859,'loveBoard',PF]};
export function nextruderWiringPlan(plan){
 if(plan.chapter!==6)return plan;
 if(plan.step===31)return {...plan,actors:plan.actors.map(a=>a.refs?.includes('loveMainPlug')?{...a,refs:[...a.refs,'benchMainSleeve']}:a)};
 if(plan.step===32)return {...plan,camera:'main-duct-perspective',viewBounds:[-14,-43,422,30,-16,456],viewMinDistance:85,note:'ケーブルを溝へ収め、布スリーブの端をマウントの端に揃えます。'};
 if(plan.step===20)return {...plan,operationFocus:['heatsinkNtc',811]};
 if(plan.step===51)return {...plan,...view,actors:[
  {flex:[PF],to:.85,label:'プリントファンのケーブルをカバーの溝に通す',officialLine:995308,axis:[-1,0,0],showBefore:true,focusMotion:true,focusBounds:[-67,-57,369,-17,12,410],camera:'service-fan-connect',focusPadding:2,focusMinDistance:85,guideRadius:2,guideArrowLength:5},
  connection(PF,'J5','配線スペースに輪を作り、左側の中央の端子に差し込む',995300)
 ]};
 return plan;
}
