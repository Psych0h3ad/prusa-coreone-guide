import {BEDSTOP_PIVOT as pivot,BEDSTOP_REAR_SEAT as rear} from './bedstop-data.js?v=20261111-94';

const common={axis:[-1,0,0],distance:15,focusMotion:true,focusRefs:[385],
 camera:'top-perspective',focusPadding:6,focusMinDistance:75,
 guideRadius:2,guideTube:.25,guideArrowLength:4,calloutAvoidBounds:[-42,120,294,18,170,336]};

export function bedstopPlan(plan){
 if(plan.chapter!==5)return plan;
 if(plan.step===39)return {...plan,pose:'bed-stop-bench',camera:'top-perspective',
  focus:[385],focusPadding:8,operationPadding:6,viewMinDistance:85,
  note:'同じ面からM3nSを2個入れ、ストッパーを裏返して反対側から残り1個を入れます。',
  actors:[
   {...common,refs:[557],label:'M3nS 1/3：片側の差し込み口に入れる',officialLine:990858},
   {...common,refs:['bedStopNutCenter'],label:'M3nS 2/3：同じ面のもう一方に入れる',officialLine:990858},
   {refs:[385,557,'bedStopNutCenter'],label:'ストッパーを裏返す',
    handling:true,reuse:true,carry:true,showBefore:true,axis:[-1,0,0],distance:0,focusMotion:true,focusRefs:[385],
    camera:'top-perspective',calloutAvoidBounds:[-56,120,294,20,171,336],motionPivot:pivot,posePath:[
     {offset:[0,0,0],rotation:[0,0,0]},
     {offset:[-25,0,0],rotation:[0,0,0]},
     {offset:[-25,0,0],rotation:[0,0,90]},
     {offset:[-25,0,0],rotation:[0,0,180]},
     {offset:[0,0,0],rotation:[0,0,180]}
    ]},
   {...common,refs:[555],label:'M3nS 3/3：反対側の差し込み口に入れる',officialLine:990866,
    motionPivot:pivot,posePath:[
     {offset:[-15,0,0],rotation:[0,0,180]},
     {offset:[0,0,0],rotation:[0,0,180]}
    ]}
  ]};
 if(plan.step===40){
  const fixing=(cad,label,engagement)=>({refs:[cad],label,officialLine:990904,
   axis:[0,0,1],poseTiming:[1,2],focusMotion:true,focusRefs:[385],camera:'top-perspective',
   focusPadding:5,focusMinDistance:80,calloutAvoidBounds:[-28,148,324,17,170,358],guideRadius:2,guideTube:.25,guideArrowLength:4,
   motionPivot:cad===548?[-20.39865,163.3,336]:cad===546?[9.60135,163.3,336]:[-5.39865,153.3,336],
   posePath:[{offset:[0,0,18],rotation:[0,0,engagement*720]},
    {offset:[0,0,engagement],rotation:[0,0,engagement*720]},
    {offset:[0,0,0],rotation:[0,0,0]}]});
  return {...plan,pose:'top-outside',camera:'top-perspective',focus:[385],
   focusPadding:10,operationPadding:7,
   note:'三角突起の下へ差し込み、M3x8rTの3本で固定します。上側のねじは樹脂にねじ山を作るため、少し抵抗があります。',
   actors:[
    {scope:'bed-stop',label:'三角突起の下へ差し込み、3つの穴を合わせる',officialLine:990888,
     axis:[0,-1,0],focusMotion:true,focusRefs:[385],camera:'top-perspective',
     focusPadding:8,focusMinDistance:100,calloutAvoidBounds:[-28,120,294,17,172,340],transparentRefs:[373],motionPivot:pivot,
     posePath:[{offset:[0,-75,0],rotation:[0,0,180]},
      {offset:[0,-75,0],rotation:[0,0,0]},
      {offset:[0,0,0],rotation:[0,0,0]}]},
    fixing(548,'M3x8rT 1/3：左側を固定する',3.8),
    fixing(546,'M3x8rT 2/3：右側を固定する',3.8),
    {...fixing(544,'M3x8rT 3/3：上側のねじを締める',6),officialLine:990928}
   ]};
 }

 if(plan.step===79)return {...plan,camera:'rear-wiring-perspective',focus:[385],
  focusPadding:10,operationPadding:6,
  note:'背面の楕円穴とストッパーの穴を合わせ、M3x8rTで固定します。ずれているときはCoreXY後端を数mmだけ持ち上げて合わせてください。',
  actors:[
   {refs:[385,'bedStopNutCenter'],inspection:true,handling:true,reuse:true,label:'楕円穴とストッパーの穴の位置を確認する',officialLine:992772,
    axis:[0,1,0],distance:0,anchors:[rear],camera:'rear-wiring-perspective',
    focusMotion:true,focusBounds:[-65,140,280,55,215,395],calloutAvoidBounds:[-25,145,288,15,172,330],focusPadding:8,focusMinDistance:210,
    transparentRefs:[66,81],guideRadius:2.5,guideTube:.25},
   {refs:['bedStopRearScrew'],label:'M3x8rT：背面からストッパーを固定する',officialLine:992788,
    axis:[0,1,0],poseTiming:[1,2],motionPivot:rear,camera:'rear-wiring-perspective',
    focusMotion:true,focusBounds:[-65,140,280,55,215,395],calloutAvoidBounds:[-25,145,288,15,172,330],focusPadding:8,focusMinDistance:210,
    transparentRefs:[81],guideRadius:2,guideTube:.25,guideArrowLength:4,
    posePath:[{offset:[0,10,0],rotation:[0,2736,0]},
     {offset:[0,3.8,0],rotation:[0,2736,0]},
     {offset:[0,0,0],rotation:[0,0,0]}]}
  ]};
 return plan;
}
