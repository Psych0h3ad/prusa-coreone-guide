import * as T from 'three';
import {probeTurn} from './chamber-temp-turn.js';
const v=p=>new T.Vector3(...p),smooth=x=>{x=T.MathUtils.clamp(x,0,1);return x*x*(3-2*x);},Y=new T.Vector3(0,1,0),Z=new T.Vector3(0,0,1),initial=new T.Vector3(.2,0,-Math.sqrt(.96));
// Grid-local reference choreography. The entire rigid15.3mm probe stays on
// its first straight segment; flexible cable passes through the two measured
// native honeycomb openings. No connector/stock is appended or discarded.
export function probeHandling(value){
 const u=T.MathUtils.clamp(value,0,1);let root,axis,neck,guides,turn;
 if(u<=.2){
  const t=smooth(u/.2),q=new T.Quaternion().setFromUnitVectors(initial,Y),rotation=new T.Quaternion().slerp(q,t);axis=initial.clone().applyQuaternion(rotation);neck=v([13,176,376]);root=neck.clone().addScaledVector(axis,-21.3);turn=probeTurn(181.3);guides=[];
 }else if(u<=.45){
  const t=smooth((u-.2)/.25);axis=Y.clone();root=v([13,T.MathUtils.lerp(154.7,184.5,t),376]);neck=root.clone().addScaledVector(axis,21.3);turn=probeTurn(Math.max(181.3,neck.y+5.3));guides=[];
 }else if(u<=.65){
  const t=smooth((u-.45)/.2),full=probeTurn(211.1),s=full.length*t;turn=probeTurn(211.1,s);axis=full.direction(s);root=full.at(s).addScaledVector(axis,-26.6);neck=root.clone().addScaledVector(axis,21.3);guides=[];
 }else if(u<=.75){
  const t=smooth((u-.65)/.1);axis=Y.clone().negate();root=v([20,T.MathUtils.lerp(237.7,217.3,t),372.3]);neck=root.clone().addScaledVector(axis,21.3);guides=[v([20,190,372.3]),v([20,182.5,372.3]),v([20,176,372.3])];
 }else{
  const t=smooth((Math.min(u,.9)-.75)/.15);axis=Y.clone().negate();root=v([20,T.MathUtils.lerp(217.3,151,t),372.3]);neck=root.clone().addScaledVector(axis,21.3);const front=smooth((176-neck.y)/8);
  // Once the flexible neck is in front of the grid, open a broad lateral
  // return instead of a short reversal on the same line. Before that instant
  // the two measured through-hole guides remain on their original axes.
  guides=[v([20,neck.y-6,372.3]),v([20,Math.min(182.5,neck.y-8),372.3]).lerp(v([-.5,neck.y-24,353.7]),front),v([20,Math.min(176,neck.y-12),372.3]).lerp(v([-.5,176,353.7]),front)];
 }
 const shift=v([-65,-20,30]).multiplyScalar(smooth((u-.9)/.1));
 return{u,root,axis,neck,guides,shift,turn};
}
