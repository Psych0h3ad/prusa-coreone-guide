import {sourceExitNeck48} from './source-exit48.js';
import * as T from 'three';
const sinc=a=>a===0?1:Math.sin(a)/a,cosc=a=>a===0?0:2*Math.sin(a/2)**2/a;
// Intrinsic outlet geometry shared by the actual hand/cap source and the
// whole material producer. A real U remains while the cap points upward;
// stock pays out as that same cap aligns to the aperture, not during parking.
export function wholeOutletFrame49(tangent,width,align){
 const W=tangent.clone().normalize(),A=W.clone().multiplyScalar(-Math.sqrt(85)-sourceExitNeck48(8,align)),N=W.clone().cross(width).normalize(),bankAngle=2*Math.PI/3*(1-align),bankLength=14*(1-align)+.5*align,
 B=A.clone().addScaledVector(W,-bankLength*sinc(bankAngle)).addScaledVector(N,bankLength*cosc(bankAngle)),bankT=W.clone().multiplyScalar(Math.cos(bankAngle)).addScaledVector(N,-Math.sin(bankAngle)),axis=width.clone().negate().normalize(),angle=(1-align)*Math.PI/6,L=7*Math.PI/3,
 U=bankT.clone().applyAxisAngle(axis,-angle),normal=axis.clone().cross(U).normalize(),G=B.addScaledVector(U,-L*sinc(angle)).addScaledVector(normal,-L*cosc(angle));return {capFromInletMM:G.negate(),inletT:U};
}

export function wholeOutletOffset46(tangent,width,align){return wholeOutletFrame49(tangent,width,align).capFromInletMM;}
