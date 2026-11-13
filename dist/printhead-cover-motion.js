// The lower hook engages before the upper fixing is closed.
export const leftCoverMotion={camera:'left-cover-perspective',focusRefs:[857],motionPivot:[-27,-40.8952524,364],posePath:[
 {offset:[-35,0,10],rotation:[0,-25,0]},
 {offset:[-5,0,3],rotation:[0,-20,0]},
 {offset:[0,0,0],rotation:[0,-15,0]},
 {offset:[0,0,0],rotation:[0,0,0]}
]};
export const leftCoverScrewMotion={focusRefs:[858,857],camera:'left-cover-perspective'};
export const leftCoverView={solidRefs:[858,879,857,860,'leftCoverNut'],settledFocus:[858,857]};
export const loveBoardMotion={motionPivot:[-7.944446,-24.5952524,378.200421],posePath:[
 {offset:[0,35,0],rotation:[0,0,0]},
 {offset:[0,5,3],rotation:[-10,0,0]},
 {offset:[0,2,1],rotation:[-10,0,0]},
 {offset:[0,0,0],rotation:[0,0,0]}
]};
export function printheadCoverPlan(plan){
 if(plan.chapter!==6)return plan;
 if(plan.step===26)return {...plan,camera:'service-fan-connect',focus:[857],focusPadding:12,operationPadding:8,settledFocus:[857,882,884],actors:plan.actors.map(a=>({...a,focusMotion:true,focusRefs:[857],focusPadding:8,focusMinDistance:60,camera:'service-fan-connect'}))};
 if(plan.step===54)return {...plan,camera:'wiring-perspective',focus:['loveBoard','lbMotorLead','lbLoadcellLead','lbFilamentLead'],focusPadding:8,contextOpacity:.055,transparentRefs:[858,860,861],inspectBoard:false,solidRefs:[790,794,859,'mainSleeve','ptfeTube','bowdenBend','lbMotorLead','lbLoadcellLead','lbFilamentLead','lbNtcLead','lbMainLead','servicePrintLead','serviceHotendFanLead','hotendThermistor0','hotendThermistor1','hotendHeater0','hotendHeater1']};
 if(plan.step===29)return {...plan,operationPadding:8,actors:[
  {refs:['mountUpperNut'],label:'M3nS',axis:[-.984807753012208,0,.17364817766693033],distance:15,focusMotion:true,focusRefs:[859],camera:'service-fan-connect'},
  {refs:['mountLowerNut'],label:'M3nS',axis:[.17364817766693033,0,.984807753012208],distance:15,focusMotion:true,focusRefs:[859],camera:'top-perspective'}
 ]};
 if(plan.step===30)return {...plan,operationPadding:8,actors:[
  {refs:[875,877],label:'M3nS ×2',axis:[0,1,0],distance:15,focusMotion:true,focusRefs:[860],camera:'back-perspective'},
  {refs:['leftCoverNut'],label:'M3nS',axis:[0,-1,0],distance:15,focusMotion:true,focusRefs:[860],camera:'perspective'}
 ]};
 if(plan.step===31)return {...plan,actors:plan.actors.map((a,i)=>i===0?{...a,...loveBoardMotion}:a)};
 if(plan.step===41)return {...plan,operationPadding:12,actors:[
  {flex:['ptfeTube','bowdenBend'],to:1,label:'曲げガイドに通し、先端を1 cm以上出す',officialLine:994841,focusBounds:[-55,-78,465,15,-20,555],camera:'perspective',guideRadius:3,guideArrowLength:6},
  {flex:['ptfeTube','bowdenBend'],to:2,label:'M5-4継手に奥まで差し込む',officialLine:994849,focusBounds:[-20,-75,415,15,-40,510],camera:'perspective',guideRadius:3,guideArrowLength:6},
  {flex:['ptfeTube','bowdenBend'],to:3,label:'曲げガイドを下げて継手にかぶせる',officialLine:994857,focusBounds:[-50,-78,415,20,-15,555],camera:'perspective',guideRadius:5,guideArrowLength:8}
 ]};
 if(plan.step===42){
  const bands=plan.actors.filter(a=>!a.flex?.includes('ptfeTube'));
  return {...plan,actors:[
   {flex:['ptfeTube'],to:4,label:'PTFEチューブをメインケーブルの上に沿わせる',officialLine:994887,focusBounds:[-150,-65,420,90,175,575],camera:'back-perspective',guideRadius:4},
   ...bands.slice(0,4),
   {flex:['ptfeTube'],to:5,label:'先端をガイドとCoreXYプレートに通す',officialLine:994903,focusBounds:[178,75,315,215,115,405],camera:'right-perspective',focusPadding:8,focusMinDistance:95,guideRadius:3,guideArrowLength:5},
   ...bands.slice(4)
  ]};
 }
 if(plan.step===55)return {...plan,...leftCoverView,actors:[{...plan.actors[0],...leftCoverMotion},{refs:[879],label:'M3x10',axis:[-1,0,0],distance:20,spin:1080,showBefore:false,...leftCoverScrewMotion},...plan.actors.slice(1)]};
 return plan;
}
