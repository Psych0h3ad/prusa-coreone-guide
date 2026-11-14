import * as T from 'three';
const R=2,Y=new T.Vector3(0,1,0),Q=new T.Vector3(7,0,-3.7),width=Q.length();Q.normalize();
const axis=Q.clone().negate().cross(Y).normalize();
const point=(s,t)=>s.kind==='line'?s.a.clone().lerp(s.b,t):s.a.clone().sub(s.c).applyAxisAngle(s.axis,s.angle*t).add(s.c);
const tangent=(s,t)=>s.kind==='line'?s.b.clone().sub(s.a).normalize():s.axis.clone().cross(point(s,t).sub(s.c)).normalize();
// A real two-quarter-circle return, R2 with a straight between the bends.
// Its2mm rearward excursion fits the measured grid-to-fan gap. The rigid
// probe follows this curve during unthreading; the retained cable is its
// remaining suffix, so a shrinking polyline loop cannot crush the section.
export function probeTurn(y,from=0){
 const A=new T.Vector3(13,y,376),C1=A.clone().addScaledVector(Q,R),B=C1.clone().addScaledVector(Y,R),C2=A.clone().addScaledVector(Q,width-R),D=C2.clone().addScaledVector(Y,R),E=A.clone().addScaledVector(Q,width),all=[{kind:'arc',a:A,b:B,c:C1,axis,angle:Math.PI/2,length:Math.PI*R/2},{kind:'line',a:B,b:D,length:width-2*R},{kind:'arc',a:D,b:E,c:C2,axis,angle:Math.PI/2,length:Math.PI*R/2}],length=all.reduce((n,s)=>n+s.length,0);
 from=T.MathUtils.clamp(from,0,length);let left=from,segments=[];
 for(const s of all){if(left>=s.length){left-=s.length;continue;}const f=left/s.length;segments.push({...s,a:point(s,f),angle:s.kind==='arc'?s.angle*(1-f):undefined,length:s.length-left});left=0;}
 const at=s=>{s=T.MathUtils.clamp(s,0,length);for(const q of all){if(s<=q.length)return point(q,s/q.length);s-=q.length;}return E.clone();},direction=s=>{s=T.MathUtils.clamp(s,0,length);for(const q of all){if(s<=q.length)return tangent(q,s/q.length);s-=q.length;}return Y.clone().negate();};
 return{segments,length,at,direction,end:E};
}
