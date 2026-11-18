// MIT code; authored routing geometry CC-BY-SA-4.0. Not an OEM bend/force specification.
import * as T from 'three';
import {Arc,Section,path} from './cable-assembly/earth/curves.js';
const Z=new T.Vector3(0,0,1),smooth=t=>T.MathUtils.smootherstep(t,0,1);
export function box1GuideMix(b){return smooth((b.z-196)/10)*(1-smooth((b.z-248)/15));}
// Two tangent circular arcs connect vertical end tangents without shrinking the tube.
// R=(D²+L²)/(4D) >= L/2 for a positive vertical rise.
function verticalBiarc(a,b){const dz=b.z-a.z,lateral=b.clone().sub(a);lateral.z=0;const d=lateral.length();if(d===0)return[new T.LineCurve3(a,b)];if(dz<=0)throw Error('FE band guide requires the real upward source branch');const e=lateral.multiplyScalar(1/d),r=(d*d+dz*dz)/(4*d),theta=2*Math.atan2(d,dz),c1=a.clone().addScaledVector(e,r),c2=b.clone().addScaledVector(e,-r),u2=e.clone().multiplyScalar(Math.cos(theta)).addScaledVector(Z,-Math.sin(theta)),v2=e.clone().multiplyScalar(Math.sin(theta)).addScaledVector(Z,Math.cos(theta));return[new Arc(c1,e.clone().negate(),Z,r,theta),new Arc(c2,u2,v2,r,theta)];}
export function box1GuidedCaseRoute(reference,b,outward){
 const incoming=outward.clone().negate().normalize(),theta=Math.acos(T.MathUtils.clamp(incoming.z,-1,1)),side=incoming.clone().addScaledVector(Z,-incoming.z),finish=[],C=b.clone();
 if(theta>0){side.normalize();const R=4;C.addScaledVector(side,-R*(1-Math.cos(theta))).addScaledVector(Z,-R*Math.sin(theta));finish.push(new Arc(C.clone().addScaledVector(side,R),side.clone().negate(),Z,R,theta));}
 const trunk=reference.trunk,height=Math.max(95,Math.min(194,C.z-20));let lo=0,hi=1;for(let i=0;i<40;i++){const t=(lo+hi)/2;if(trunk.getPoint(t).z<height)lo=t;else hi=t;}const cut=(lo+hi)/2,S=trunk.getPoint(cut),mix=smooth((C.z-222)/18),A=S.clone(),B=S.clone();A.z=Math.min(C.z-18.5,215);B.x=T.MathUtils.lerp(S.x,-131.0993938751,mix);B.y=T.MathUtils.lerp(S.y,177.5997221025,mix);B.z=C.z-3;
 const lateral=C.clone().sub(B);lateral.z=0;const d=lateral.length(),connection=[];
 if(d<3)connection.push(...verticalBiarc(B,C));else{const e=lateral.multiplyScalar(1/d),r=1.5,c1=B.clone().addScaledVector(e,r),c2=C.clone().addScaledVector(e,-r),Q1=c1.clone().addScaledVector(Z,r),Q2=c2.clone().addScaledVector(Z,-r);connection.push(new Arc(c1,e.clone().negate(),Z,r,Math.PI/2),new T.LineCurve3(Q1,Q2),new Arc(c2,Z.clone().negate(),e,r,Math.PI/2));}
 return path([new Section(trunk,0,cut),new T.LineCurve3(S,A),...verticalBiarc(A,B),...connection,...finish]);
}
