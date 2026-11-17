import * as T from 'three';
import {wholeOutletFrame49} from './whole-outlet-offset46.js';
// One source chart: clear the whole intrinsic support, uncoil while yawing,
// then refold and dock to the same physical park registration.
export function handoverOutlet50(i){
 const h=i.fraction;if(h===0)return{end:i.fromEnd.clone(),rotation:i.fromRotation.clone(),align:0,clock:{h,phase:'actual withdrawn registration'}};if(h===1)return{end:i.toEnd.clone(),rotation:i.toRotation.clone(),align:i.finalAlign,clock:{h,phase:'unchanged park registration'}};
 const S=T.MathUtils.smoothstep,lift=S(h,0,.2),yaw=S(h,.25,.6),dock=S(h,.8,1),uncoil=S(h,.15,.35)*(1-S(h,.6,.8)),align=h*i.finalAlign+(1-i.finalAlign)*uncoil,workingRoll=Math.PI/2*S(h,.6,.8)*(1-dock),rotation=i.fromRotation.clone().slerp(i.toRotation,yaw).multiply(new T.Quaternion().setFromAxisAngle(i.localT,workingRoll)),intrinsic=(q,a)=>wholeOutletFrame49(i.localT.clone().applyQuaternion(q),i.localWidth.clone().applyQuaternion(q),a),start=i.fromEnd.clone().sub(intrinsic(i.fromRotation,0).capFromInletMM),goal=i.toEnd.clone().sub(intrinsic(i.toRotation,i.finalAlign).capFromInletMM),frame=intrinsic(rotation,align),W=frame.inletT,c=T.MathUtils.clamp(i.gateT.dot(W),-1,1),side=W.clone().addScaledVector(i.gateT,-c),sin=side.length(),R=24,L=22;
 const support=i.aperture.clone().addScaledVector(i.gateT,L);if(sin===0){if(c<0)throw Error('Handover tangent chart exactly antipodal');}else support.addScaledVector(i.gateT,R*sin).addScaledVector(side,R*(c>=0?sin/(1+c):(1-c)/sin));
 support.lerp(start,1-lift).lerp(goal,dock);return{end:support.clone().add(frame.capFromInletMM),rotation,align,clock:{h,lift,yaw,dock,uncoil,workingRoll,align,R,L,supportMM:support.toArray(),inletT:W.toArray(),phase:'support follows actual tangent circle before yaw and park docking'}};
}
