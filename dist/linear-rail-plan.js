// SPDX-License-Identifier: MIT
import {LINEAR_RAIL as D} from './linear-rail-data.js';
import {LINEAR_RAIL_SOURCES as S} from './linear-rail-source.js';
const z=[0,0,0],pins=[D.left.key,D.right.key],packet=[D.beam,D.rail,...pins],all=[...D.third,...D.fifth,...D.first];
const pose=(refs,offset)=>({refs,offset,rotation:z,pivot:z,linearRailPose:true});
const pinPos=(d,first)=>[first?d.firstX-d.fourthX:0,0,0];
function op(edition,stage,refs,label,lines,extra={}){
 const source=S[edition][stage];return{refs,label,axis:[0,-1,0],distance:0,exactWaypoints:true,guideGhost:false,focusMotion:true,focusPadding:8,focusMinDistance:85,camera:'back-perspective',threadPivot:refs.length===1?D.fastenerPivots[refs[0]]:undefined,linearRailSource:{[edition]:{guideID:source.guideID,stepID:source.stepID,lineIDs:lines.map(i=>source.lineIDs[i]),photoIDs:source.photoIDs}},...extra};
}
function screwOps(edition,stage,id,hole,lines){return[
 op(edition,stage,[id],`${hole}の穴へM3×6を1本入れる`,lines,{waypoints:[[0,-12,0],[0,-2.5,0]],focusRefs:[id]}),
 op(edition,stage,[id],'M3×6を軽く締め、仮止めにする',lines,{waypoints:[[0,-2.5,0],z],spin:-1800,reuse:true,focusRefs:[id]})
];}
export function linearRailPlan(plan,edition,id,chapterStep){
 const sources=S[edition],stage=Object.keys(sources).find(k=>sources[k].stepID===id),n=chapterStep;
 if(!stage&&!(n>=33&&n<=76&&plan.chapter===5))return plan;
 const loose=n>=33&&n<=76?all.map(sid=>pose([sid],[0,-D.looseMM,0])):[];
 let p={...plan,workpiecePoses:[...(plan.workpiecePoses||[]),...loose],linearRailAssembly:true};
 if(stage==='prepare')return{...p,seed:[...new Set([...(p.seed||[]),D.rail,...pins])],workpiecePoses:[...p.workpiecePoses,pose([D.carriage],[40,0,0]),...([D.left,D.right].map(d=>pose([d.key],pinPos(d,true))))],focus:packet,note:'脱落防止ピンは外さず、レールの保存用グリスを布で拭き取ってください。'};
 if(stage==='place'){
  const middle=op(edition,stage,[D.carriage],'キャリッジをレールの中央へ動かす',[edition==='original2251'?4:3],{axis:[1,0,0],waypoints:[z,[-40,0,0]],reuse:true,handling:true,showBefore:true});
  const screws=D.third.flatMap(sid=>screwOps(edition,stage,sid,'両端から3番目',[edition==='original2251'?3:4]));
  return{...p,seed:[D.beam],pose:'back-inner',focus:packet,focusPadding:12,settledFocus:packet,workpiecePoses:[...p.workpiecePoses,pose([D.carriage],[40,0,0]),...([D.left,D.right].map(d=>pose([d.key],pinPos(d,true))))],actors:[op(edition,stage,[D.rail,...pins],'穴を合わせ、レールをビームに載せる',[2],{waypoints:[[0,-25,0],z],focusRefs:packet}),...(edition==='original2251'?[...screws,middle]:[middle,...screws])],note:'両端から3番目の穴へM3×6を入れ、軽く仮止めします。本締めは後の位置調整で行います。'};
 }
 if(stage==='retain')return{...p,pose:'back-inner',focus:packet,focusPadding:12,actors:[
  ...[D.left,D.right].map(d=>op(edition,stage,[d.key],'脱落防止ピンをつまみ、端から4番目の穴へ移す',[1,2],{reuse:true,handling:true,showBefore:true,waypoints:[pinPos(d,true),[d.firstX-d.fourthX,-10,0],[0,-10,0],z],focusRefs:[d.key]})),
  ...D.fifth.flatMap(sid=>screwOps(edition,stage,sid,'両端から5番目',[3])),...D.first.flatMap(sid=>screwOps(edition,stage,sid,'両端の1番目',[4]))
 ],note:'この手順ではキャリッジを動かさないでください。ピンを4番目の穴に残し、M3×6は軽く仮止めします。'};
 if(stage==='installPrep')return{...p,focus:packet,note:'脱落防止ピンは外さず、仮止めしたM3×6も緩めたままにしてください。固定にはM3×8rTを使います。'};
 if(stage==='install')return{...p,actors:[{...p.actors.find(a=>a.scope==='rail'),focusMotion:true,exactWaypoints:true},...D.mounting.map((sid,i)=>op(edition,stage,[sid],`後ろ側からM3×8rTを1本ずつ締める ${i+1} / 6`,[3],{axis:[0,1,0],waypoints:[[0,12,0],[0,8,0],z],spin:-5760,threadPitchMM:.5,threadStartMM:8,focusRefs:[sid,D.beam],camera:'back-perspective'}))],focus:[D.beam,D.rail],note:'レール一式を前側から合わせます。左右それぞれ3本のM3×8rTで後ろ側から固定してください。脱落防止ピンは次の手順まで残します。'};
 if(stage==='remove')return{...p,camera:'perspective',focus:packet,actors:[D.left,D.right].map(d=>op(edition,stage,[d.key],'脱落防止ピンをつまんで1個ずつ外す',[0,1],{waypoints:[[0,-14,0],z],remove:true,destination:'removed',handling:true,showBefore:true,camera:'perspective',focusRefs:[d.key]})),note:'ラジオペンチで軽くつまみ、ピンを1個ずつ抜いてください。外したピンは以後使いません。'};
 if(stage==='align')return{...p,pose:'printer-standing',camera:'perspective',settledFocus:[D.rail],focus:[D.rail],focusPadding:12,actors:[op(edition,stage,[D.carriage],'キャリッジが中央にあることを確認する',[0],{inspection:true,handling:true,showBefore:true,focusRefs:[D.rail]}),...D.tightening.map((sid,i)=>op(edition,stage,[sid],`公式写真の順番 ${i+1}：M3×6を本締めする`,[1,2],{reuse:true,showBefore:true,waypoints:[z,[0,D.looseMM,0]],spin:-360,camera:'perspective',focusRefs:[sid]}))],note:'レールを下へ押さえながら、公式写真の1〜6の順にM3×6を本締めしてください。'};
 return p;
}
export function withLinearRailAssembly(bank){return{...bank,build:Object.fromEntries(Object.entries(bank.build).map(([id,p])=>[id,p.chapter===5?linearRailPlan(p,'plus',+id,p.step):p]))};}
