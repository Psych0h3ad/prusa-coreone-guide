import {Z_MOTOR_SEQUENCE_SOURCE as S,Z_MOTOR_GROUPS as G} from './z-motor-sequence-source.js';
const zero=[0,0,0],packet=g=>[g.motor,g.mount,g.pad,...g.screws];
function source(stage,key){return Object.fromEntries(Object.entries(S).map(([edition,s])=>[edition,{manualID:s.manualID,guideID:s.guideID,stepID:s.steps[stage].stepID,lineIDs:s.steps[stage].lines[key].slice()}]));}
function actor(stage,key,refs,label,extra={}){return{refs,label,axis:[0,0,1],focusMotion:true,guideGhost:false,zMotorSequenceSource:source(stage,key),...extra};}
const body=(g,extra={})=>{const[x,y]=g.centreMM;return{focusBounds:[x-31,y-31,-47,x+31,y+31,35],focusPadding:6,focusMinDistance:130,...extra};};
function preparation(){
 const out=G.map((g,i)=>actor(0,'check',[g.motor],`${i+1}台目：ねじ軸を回して固着がないか確かめる`,body(g,{distance:0,inspection:true,handling:true,showBefore:true,zMotorRodCheck:g.motor})));
 for(const[g,i]of G.map((g,i)=>[g,i])){
  out.push(actor(0,'pad',[g.pad],`${i+1}台目：ワッシャーを確認してねじ軸に通す`,body(g,{waypoints:[[0,0,335],zero]})));
  out.push(actor(0,'mount',[g.mount],`${i+1}台目：突起を上に向けたマウントをねじ軸に通す`,body(g,{waypoints:[[0,0,335],zero]})));
  out.push(actor(0,'align',[g.motor,g.mount],`${i+1}台目：マウントとモーターの4か所の穴を合わせる`,body(g,{distance:0,reuse:true,inspection:true,handling:true})));
  g.screws.forEach((id,n)=>out.push(actor(0,'screw',[id],`${i+1}台目：M3×8の${n+1}本目を締める`,body(g,{distance:18,spin:1440}))));
 }
 return out;
}
function baseScrews(stage,side,ids,g){return ids.map((id,n)=>actor(stage,'screw',[id],`${side}モーターを底板に留めるM3×8：${n+1}本目`,body(g,{focusRefs:[id],distance:18,spin:1440,camera:'top-perspective'})));}
function rodMount(stage,id,side,centre){
 const focus={focusRefs:[id],focusPadding:8,focusMinDistance:110,camera:'top-perspective',motionPivot:centre},unlocked=[0,0,-90];
 return[
  actor(stage,'insert',[id],`${side}のロッドマウントを穴に差し込む`,{...focus,waypoints:[[0,0,30],[0,0,.1]],posePath:[{offset:[0,0,30],rotation:unlocked},{offset:[0,0,.1],rotation:unlocked}]}),
  actor(stage,'lock',[id],`13–16スパナで${side}のロッドマウントを90°回してロックする`,{...focus,reuse:true,waypoints:[[0,0,.1],zero],poseTiming:[1,.15],posePath:[{offset:[0,0,.1],rotation:unlocked},{offset:[0,0,.1],rotation:zero},{offset:zero,rotation:zero}]})
 ];
}
export function withZMotorSequence(input){
 const build={...input.build};for(const s of S.plus.steps)if(!build[s.stepID])throw Error('Missing current Z-motor source '+s.stepID);
 build[983329]={...build[983329],actors:preparation(),pose:'top-outside',operationPadding:6};
 const prior=build[983383],flip=prior.actors[0];if(flip.scope||!flip.refs?.includes(306))throw Error('Expected existing complete bottom-panel flip');
 const insert=(g,key,label)=>actor(1,key,packet(g),label,{axis:[0,0,-1],waypoints:[[0,0,-335],zero],camera:'base-rear-perspective',focusRefs:[g.motor],focusPadding:8});
 build[983383]={...prior,actors:[{...flip,zMotorSequenceSource:source(1,'flip')},
  insert(G[2],'rear','ZRの長いケーブルを確認し、後部モーターのねじ軸を底板へ通す'),
  actor(1,'rearCable',[367],'後部モーターのケーブルが外側を向くことを確認する',body(G[2],{reuse:true,distance:0,inspection:true,handling:true,camera:'base-rear-perspective'})),
  insert(G[1],'front','右前のモーターのねじ軸を底板へ通す'),insert(G[0],'front','左前のモーターのねじ軸を底板へ通す'),
  actor(1,'frontCable',[311,366],'前の2台のケーブルが後部モーター側を向くことを確認する',{reuse:true,distance:0,inspection:true,handling:true,camera:'base-rear-perspective'}),
  actor(1,'sides',[311,366,367,306],'前側に2台、後ろ側に1台あることを確認する',{reuse:true,distance:0,inspection:true,handling:true})],operationPadding:8};
 build[983461]={...build[983461],actors:baseScrews(2,'後部',[330,332,334,336],G[2]),operationPadding:6};
 build[983505]={...build[983505],actors:[actor(3,'inspect',[368],'ロッドマウントの穴の内側と、スムースロッドの通りを確認する',{inspection:true,handling:true,showBefore:true,reuse:true,distance:0,originalOmit:true,focusRefs:[368],focusPadding:8,focusMinDistance:110}),...rodMount(3,368,'右',[184.499994,-177.399995,0]),...baseScrews(3,'右前',[322,324,326,328],G[1])],operationPadding:6};
 build[983551]={...build[983551],actors:[actor(4,'cable',[311],'左前モーターのケーブルが後ろ側を向くことを確認する',body(G[0],{inspection:true,handling:true,reuse:true,distance:0})),...rodMount(4,312,'左',[-184.499994,-177.399995,0]),...baseScrews(4,'左前',[314,316,318,320],G[0])],operationPadding:6};
 return{...input,build};
}
