import * as T from 'three';
import {wholeOutletFrame49} from './whole-outlet-offset46.js';
/** @typedef {import('./service-connection49.js').OutsideSourceInput49} OutsideSourceInput49 */
/** @param {OutsideSourceInput49} input */
export function planOutsideOutlet49(input){
 const {progress,outsideMM,openingMM,freeRotation,gateRotation,localT,localWidth,gateT}=input,u=T.MathUtils.smoothstep(progress,0,.3),lift=T.MathUtils.smoothstep(u,0,.4),align=T.MathUtils.smoothstep(u,.4,1),workingRoll=Math.PI/2*lift*(1-align),rotation=freeRotation.clone().slerp(gateRotation,align).multiply(new T.Quaternion().setFromAxisAngle(localT,workingRoll)),frame=wholeOutletFrame49(localT.clone().applyQuaternion(rotation),localWidth.clone().applyQuaternion(rotation),align),initial=wholeOutletFrame49(localT.clone().applyQuaternion(freeRotation),localWidth.clone().applyQuaternion(freeRotation),0),start=outsideMM.clone().sub(initial.capFromInletMM),W=frame.inletT,c=T.MathUtils.clamp(gateT.dot(W),-1,1),side=W.clone().addScaledVector(gateT,-c),sin=side.length(),clearanceReserveMM=6,leadMM=12+clearanceReserveMM*(1-align),radiusMM=24;
 let support=openingMM.clone().addScaledVector(gateT,leadMM);
 if(sin===0){if(c<0)throw Error('Outside source tangent is exactly antipodal; no physical arc plane');}
 else{const cosc=c>=0?sin/(1+c):(1-c)/sin;support.addScaledVector(gateT,radiusMM*sin).addScaledVector(side,radiusMM*cosc);}
 const G=lift===0?start:lift===1?support:start.clone().lerp(support,lift),end=G.clone().add(frame.capFromInletMM);
 return {end,rotation,straightTurn:align,mode:'outside',aperture:openingMM,stage:'move whole cap outside the frame, then align along a material-derived support arc',clock49:{progress,u,lift,align,workingRoll,leadMM,radiusMM,clearanceReserveMM,inletMM:G.toArray(),inletT:W.toArray()}};
}
