import {mainPlugWorkingActor} from './loveboard-main-view.js?v=20261111-94';
import * as T from 'three';
import {MAIN_LOOM_BODY,MAIN_LOOM_PIVOT} from './main-loom-assembly.js?v=20261112-113';
const lead=['loveMainPlug','benchMainSleeve'],cover=[860,'leftCoverNut',875,877],all=[...MAIN_LOOM_BODY,...lead,...cover,862,868,864,866];
const flex=['assemblyMainLead','assemblyMainSleeve'];
const vec=p=>new T.Vector3(...p),pivot=vec(MAIN_LOOM_PIVOT),axis=new T.Vector3(1,0,0);
const posed=(refs,angle)=>({refs,rotation:[angle,0,0],pivot:MAIN_LOOM_PIVOT});
function rotateActor(actor,angle){
 const q=new T.Quaternion().setFromAxisAngle(axis,T.MathUtils.degToRad(angle)),v=p=>vec(p).applyQuaternion(q).toArray(),point=p=>vec(p).sub(pivot).applyQuaternion(q).add(pivot).toArray();
 return {...actor,axis:v(actor.axis),...(actor.motionPivot?{motionPivot:point(actor.motionPivot)}:{}),...(actor.posePath?{posePath:actor.posePath.map(s=>({...s,offset:v(s.offset),rotation:v(s.rotation)}))}:{}),...(actor.anchors?{anchors:actor.anchors.map(point)}:{}),focusMotion:true,camera:'main-loom-bench',focusPadding:8};
}
export function mainLoomPlan(plan){
 if(plan.chapter!==6)return plan;
 if(plan.step===31)return {...plan,seed:[...plan.seed,'loveMainPlug'],photoCheck:null,workpiecePoses:[posed(MAIN_LOOM_BODY,90),posed(lead,-90)],camera:'main-loom-bench',focus:MAIN_LOOM_BODY,focusPadding:12,actors:[
  ...plan.actors.slice(0,2).map(a=>rotateActor(a,90)),
  {refs:MAIN_LOOM_BODY,label:'マウントを裏返し、メイン端子を上に向ける',officialLine:994361,axis:[1,0,0],handling:true,carry:true,showBefore:true,focusMotion:true,motionPivot:MAIN_LOOM_PIVOT,posePath:[{offset:[0,0,0],rotation:[0,0,0]},{offset:[0,0,35],rotation:[-90,0,0]},{offset:[0,0,0],rotation:[-180,0,0]}],camera:'main-loom-bench'},
  mainPlugWorkingActor({...rotateActor(plan.actors.at(-1),-90),refs:lead},MAIN_LOOM_PIVOT)
 ]};
 if(plan.step===32)return {...plan,mainLoomFlip:true,handheld:true,benchLift:170,photoCheck:null,workpiecePoses:[posed([...MAIN_LOOM_BODY,...lead],-90)],camera:'main-loom-cut-working',viewBounds:undefined,viewMinDistance:undefined,focus:[...MAIN_LOOM_BODY,...lead],settledFocus:[...MAIN_LOOM_BODY,...lead],focusPadding:10,operationPadding:8,note:'スリーブを溝に収め、端をマウントの縁に揃えます。裸線を挟み込まないでください。',actors:[
  {flex,to:1,label:'メインケーブルを半回転させる',officialLine:994383},
  {flex,to:2,label:'ケーブルを基板の反対側へ折り返す',officialLine:994391},
  {flex,to:3,label:'LoveBoardとマウントを一緒に裏返す',officialLine:994399},
  {flex,to:4,label:'ケーブルを溝へ収め、スリーブ端を揃える',officialLine:994407,operationFocus:[...MAIN_LOOM_BODY,...lead]}
 ].map(a=>({...a,axis:[0,0,1],showBefore:true,focusMotion:true,focusRefs:[...MAIN_LOOM_BODY,...lead],camera:'main-loom-cut-working',focusPadding:8,focusMinDistance:100,guideRadius:2.5,guideArrowLength:5}))};
 if(plan.step===33)return {...plan,photoCheck:null,workpiecePoses:[posed(all,90)],camera:'main-loom-bench',focus:[...MAIN_LOOM_BODY,860],focusPadding:12,actors:plan.actors.map(a=>rotateActor(a,90))};

 return plan;
}
