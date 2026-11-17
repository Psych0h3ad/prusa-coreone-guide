import {handoverOutlet50} from './handover-outlet50.js';
import {planOutsideOutlet49} from './operator-outlet49.js';
import {wholeOutletOffset46} from './whole-outlet-offset46.js';
import * as T from 'three';
const V=p=>new T.Vector3(...p),S=T.MathUtils.smoothstep,REF=[94,39.6,-9],EARTH_REF=[-22.445079348886,13.010764773834,0];
export const LCD_APERTURE_REST=[28.817005,-203.699997,-21.022002];
const localT=V([-2,0,9]).normalize(),localA=V([0,1,0]),localN=localT.clone().cross(localA).normalize(),localBasis=new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(localA,localN,localT));
const gateT=V([0,-1,0]),gateA=V([-1,0,0]).applyAxisAngle(gateT,Math.PI/9),gateN=gateT.clone().cross(gateA),gateQ=new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(gateA,gateN,gateT)).multiply(localBasis.clone().invert());
const lerp=(a,b,t)=>t===0?a.clone():t===1?b.clone():a.clone().lerp(b,t),qlerp=(a,b,t)=>a.clone().slerp(b,t),ease=(v,a,b)=>S(v,a,b);

// One source operation chart, evaluated from current controller values. No
// prior-frame pose, collision mask or cached/held mesh enters this calculation.
export function mainSourcePose(matrix,amount,release,freeFrame,context){
 const reference=V(REF).applyMatrix4(matrix),matingQ=new T.Quaternion().setFromRotationMatrix(matrix),held=context.heldMain,
  heldRef=V(REF).applyMatrix4(held),back=V([0,0,-1]).transformDirection(held),clear=heldRef.clone().addScaledVector(back,8),heldQ=new T.Quaternion().setFromRotationMatrix(held),
  freeQ=new T.Quaternion().setFromRotationMatrix(freeFrame).multiply(new T.Quaternion().setFromAxisAngle(localT,Math.PI/2)),
  park= T.MathUtils.clamp(context.lcdStage-2,0,1),handover=(1-S(amount,0,1))*S(park,.35,.8),feed=freeFeedPose(release,freeQ,context);
 const pulled=lerp(clear,reference,S(amount,0,1)),aligned=qlerp(heldQ,matingQ,S(amount,0,1));
 const handling=handoverOutlet50({fraction:handover,fromEnd:pulled,fromRotation:aligned,toEnd:feed.end,toRotation:feed.rotation,localT,localWidth:localA,finalAlign:feed.straightTurn,aperture:feed.aperture,gateT});const reached=handling.end;
 return {end:reached,rotation:handling.rotation,freeMaterial:handover,straightTurn:handling.align,materialUnfold:handover*feed.straightTurn,
  mode:handover===1?feed.mode:'outside',aperture:feed.aperture,gateT:gateT.clone(),stage:handover===1?feed.stage:amount===1?'mated':'axial-withdrawal/lcd-clearance',operatorClock49:feed.clock49??null,handoverClock50:handling.clock,source:{mainLine:1038264,parkLine:1038266,passLines:[1039873,1040589]},axialWithdrawalMM:8*(1-S(amount,0,1))};
}

// Exact local straight bank + constant-material turn used by the whole loom.
// Moving this support and solving its rigid cap offset couples the hand pose
// to the actual material, rather than linearly sweeping a cap through a sheet.
function freeTailOffset(rotation,align){return wholeOutletOffset46(localT.clone().applyQuaternion(rotation),localA.clone().applyQuaternion(rotation),align);}

function freeFeedPose(p,freeQ,c){
 const aperture=(p<.7?c.openingCurrent:c.openingFeed).clone(),entry=aperture.clone().addScaledVector(gateT,Math.sqrt(85)+.5+7*Math.PI/3+12),exit=aperture.clone().addScaledVector(gateT,-6),
  outside=V(c.outsideMain),inside=V(c.insideMain),clearInside=V([c.insideMain[0],-140,-5]),drop=S(c.frameStage,.15,.4),parked=lerp(clearInside,inside,drop);
 if(p<=.3)return planOutsideOutlet49({progress:p,outsideMM:outside,openingMM:aperture,freeRotation:freeQ,gateRotation:gateQ,localT,localWidth:localA,gateT});
 if(p<=.7){const u=S(p,.3,.7);return {end:lerp(entry,exit,u),rotation:gateQ.clone(),straightTurn:1,mode:'axial',aperture,stage:'axial aperture passage'};}
 const u=S(p,.7,1);return {end:lerp(exit,parked,u),rotation:qlerp(gateQ,freeQ,u),straightTurn:1,mode:'inside',aperture:c.openingFeed.clone(),stage:drop?'interior handover after frame clearance':'interior clearance above frame'};
}

export function earthSourcePose(reference,amount,feed,context){
 const heldRef=V(EARTH_REF).applyMatrix4(context.heldEarth),axis=V([-1,0,0]).transformDirection(context.heldEarth),clear=heldRef.clone().addScaledVector(axis,6),
  park=T.MathUtils.clamp(context.lcdStage-2,0,1),mainHandover=(1-S(amount,0,1))*S(park,.35,.8),handover=S(mainHandover,0,.18),aperture=(feed<.7?context.openingCurrent:context.openingFeed).clone().add(V([7,0,0])),
  entry=aperture.clone().add(V([0,-14,0])),exit=aperture.clone().add(V([0,14,0])),outside=V([33,-265,-34]),inside=V([90,-100,-40]),clearInside=V([70,-140,-20]),drop=S(context.frameStage,.15,.4);
 let free;
 if(feed<=.3)free=lerp(outside,entry,S(feed,0,.3));
 else if(feed<=.7)free=lerp(entry,exit,S(feed,.3,.7));
 else free=lerp(exit,lerp(clearInside,inside,drop),S(feed,.7,1));
 // Carry the complete unplugged Faston/loom into a separate front working
 // location before main-cap yaw, then return to the same park after docking.
 free.add(V([52,-17,4]).multiplyScalar(1-S(mainHandover,.9,1)));
 const reached=lerp(lerp(clear,reference,S(amount,0,1)),free,handover);if(handover!==0&&handover!==1)reached.x+=24*Math.sin(Math.PI*handover)**2;return reached;
}

export function lcdParkOffset(t){
 // Move the unplugged whole assembly outward before taking it left to its
 // existing parking registration. This follows official1038266 and avoids
 // sweeping the retained case across the cap still held near the printer.
 const u=1-t,p=[V([5,-14,-2]),V([5,-90,-2]),V([-250,-75,-20]),V([-360,-75,-20])];
 return p[0].multiplyScalar(u*u*u).addScaledVector(p[1],3*u*u*t).addScaledVector(p[2],3*u*t*t).addScaledVector(p[3],t*t*t).toArray();
}
