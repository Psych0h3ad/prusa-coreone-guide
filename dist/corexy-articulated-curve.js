// SPDX-License-Identifier: MIT
import*as T from'three';
import{SIDE_PTFE_ROUTE}from'./side-ptfe-route-data.js';
const Z=new T.Vector3(),E=u=>u*u*(3-2*u);
export const ARM_PIVOT_MM=[151.0006057,164.2997268,462];
export function armTransform(delta,headReference=new T.Vector3(7,-29.6,444.3)){
 const pivot=new T.Vector3(...ARM_PIVOT_MM),a=Math.atan2(headReference.y-pivot.y,headReference.x-pivot.x),b=Math.atan2(headReference.y+delta.y-pivot.y,headReference.x+delta.x-pivot.x),angle=Math.atan2(Math.sin(b-a),Math.cos(b-a));
 return{pivot,q:new T.Quaternion().setFromAxisAngle(new T.Vector3(0,0,1),angle),offset:new T.Vector3(),angle};
}
export const neutralTransform=()=>({pivot:new T.Vector3(),q:new T.Quaternion(),offset:new T.Vector3()});
export const translateTransform=d=>({pivot:new T.Vector3(),q:new T.Quaternion(),offset:d.clone()});
export function transformed(p,tr){return p.clone().sub(tr.pivot).applyQuaternion(tr.q).add(tr.pivot).add(tr.offset);}
class RigidSection extends T.Curve{
 constructor(source,a,b,tr){super();Object.assign(this,{source,a,b,tr});this.arcLengthDivisions=256;}
 getPoint(t){return transformed(this.source.getPointAt(T.MathUtils.clamp(this.a+(this.b-this.a)*t,0,1)),this.tr);}
 getTangentAt(t){return this.source.getTangentAt(this.a+(this.b-this.a)*t).applyQuaternion(this.tr.q);}
}
class Bridge extends T.Curve{
 constructor(source,a,b,A,B){super();Object.assign(this,{source,a,b,A,B,blend:0,bow:0});this.arcLengthDivisions=384;
  const p=transformed(source.getPointAt(a),A),q=transformed(source.getPointAt(b),B),u=source.getTangentAt(a).applyQuaternion(A.q),v=source.getTangentAt(b).applyQuaternion(B.q),h=Math.min(48,Math.max(3,p.distanceTo(q)*.16));this.short=new T.CubicBezierCurve3(p,p.clone().addScaledVector(u,h),q.clone().addScaledVector(v,-h),q);this.bank=new T.Vector3(-1,0,.08).normalize();
 }
 getPoint(t){const p=this.source.getPointAt(T.MathUtils.clamp(this.a+(this.b-this.a)*t,0,1)),a=transformed(p,this.A),b=transformed(p,this.B);return a.lerp(b,E(t)).lerp(this.short.getPoint(t),this.blend).addScaledVector(this.bank,this.bow*Math.sin(Math.PI*t)**2);}
}
export class ArticulatedSleeve extends T.Curve{
 constructor(source,stockMM){super();Object.assign(this,{source,stockMM});this.arcLengthDivisions=1024;this.sourceLength=source.getLength();this.update(new T.Vector3());}
 update(delta){this.delta=delta.clone();this.arm=armTransform(delta);this.neutral=delta.lengthSq()===0;const F=neutralTransform(),A=this.arm,H=translateTransform(delta),S=this.source,L=this.sourceLength;
  this.sections=[new RigidSection(S,0,8/L,F),new Bridge(S,8/L,25/L,F,A),new RigidSection(S,25/L,185.5/L,A),new Bridge(S,185.5/L,1-8/L,A,H),new RigidSection(S,1-8/L,1,H)];
  // Keep the complete inlet span on the front side of the swinging 13mm arm.
  this.sections[1].bank.set(0,-1,0);this.sections[1].bow=13*Math.abs(Math.sin(A.angle));
  if(this.neutral){this.total=this.sourceLength;return;}const bridges=this.sections.filter(x=>x instanceof Bridge),measure=()=>{for(const s of this.sections){s.needsUpdate=true;s.updateArcLengths();}return this.sections.reduce((n,s)=>n+s.getLength(),0);};
  const start=measure();let lo=0,hi=1;if(start>this.stockMM){for(const b of bridges)b.blend=1;const min=measure();if(min>this.stockMM)throw Error('Articulated complete sleeve cannot reach '+JSON.stringify({delta:delta.toArray(),min,stock:this.stockMM}));for(let i=0;i<35;i++){const t=(lo+hi)/2;for(const b of bridges)b.blend=t;if(measure()>this.stockMM)lo=t;else hi=t;}for(const b of bridges)b.blend=(lo+hi)/2;}
  else{hi=180;const b=bridges.at(-1);b.bow=1;const plus=measure();b.bow=-1;const minus=measure();b.bow=0;if(plus<minus)b.bank.negate();for(let i=0;i<35;i++){b.bow=(lo+hi)/2;if(measure()<this.stockMM)lo=b.bow;else hi=b.bow;}b.bow=(lo+hi)/2;}this.total=measure();this.lengths=this.sections.map(s=>s.getLength());
 }
 getLength(){return this.total;}
 getPointAt(t){if(this.neutral)return this.source.getPointAt(t);let d=Math.max(0,Math.min(1,t))*this.total;for(let i=0;i<this.sections.length;i++){if(d<=this.lengths[i]||i===this.sections.length-1)return this.sections[i].getPointAt(T.MathUtils.clamp(d/this.lengths[i],0,1));d-=this.lengths[i];}}
 getPoint(t){return this.getPointAt(t);}
 materialPoint(t){if(this.neutral)return this.source.getPointAt(t);const s=this.sections.find(s=>t>=s.a&&t<=s.b)||this.sections.at(-1);return s.getPoint((t-s.a)/(s.b-s.a));}
 materialTransform(t){if(this.neutral)return neutralTransform();const s=this.sections.find(s=>t>=s.a&&t<=s.b);return s instanceof RigidSection?s.tr:null;}
 materialTangent(t){const e=.002;return this.materialPoint(Math.min(1,t+e)).sub(this.materialPoint(Math.max(0,t-e))).normalize();}
 getTangentAt(t){const e=1e-5;return this.getPointAt(Math.min(1,t+e)).sub(this.getPointAt(Math.max(0,t-e))).normalize();}
}
function basis(t){const up=new T.Vector3(0,0,1).addScaledVector(t,-t.z).normalize(),side=new T.Vector3().crossVectors(up,t).normalize();return new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(side,up,t));}
// The complete Bowden bend prefix and installed side-guide neck remain in
// their actual source frames. Only the two unsupported bights take up stock.
class PtfeGuideBridge extends T.Curve{
 constructor(a,b,u,v){super();Object.assign(this,{p0:a,p1:b,u,v,blend:0,bow:0});this.arcLengthDivisions=512;this.bank=new T.Vector3(0,-1,0);this.handle=Math.min(30,a.distanceTo(b)*.16);}
 getPoint(t){if(this.curveBlend!==this.blend){const h=T.MathUtils.lerp(this.handle,this.minimumHandle??3,this.blend);this.curve=new T.CubicBezierCurve3(this.p0,this.p0.clone().addScaledVector(this.u,h),this.p1.clone().addScaledVector(this.v,-h),this.p1);this.curveBlend=this.blend;}return this.curve.getPoint(t).addScaledVector(this.bank,this.bow*Math.sin(Math.PI*t)**2);}
}
// Retain the source's planar peel away from the last arm strap.
class PtfeUpperBridge extends T.Curve{
 constructor(a,arm,end,tangent){super();Object.assign(this,{a,arm,end,tangent,blend:0,bow:0});this.arcLengthDivisions=512;this.bank=new T.Vector3(0,-1,0).applyQuaternion(arm.q);const c=SIDE_PTFE_ROUTE.tailControlsCADMM[0],base=new T.Vector3(...c[0]);this.p1=transformed(base.clone().add(new T.Vector3(...c[1]).sub(base).multiplyScalar(.33)),arm);this.p2=transformed(new T.Vector3(...c[2]).add(new T.Vector3(0,-6.2,0)),arm);}
 getPoint(t){const h=T.MathUtils.lerp(25,15,this.blend),p3=this.end.clone().addScaledVector(this.tangent,-h),v=1-t;return this.a.clone().multiplyScalar(v**4).addScaledVector(this.p1,4*t*v**3).addScaledVector(this.p2,6*t*t*v*v).addScaledVector(p3,4*t**3*v).addScaledVector(this.end,t**4).addScaledVector(this.bank,this.bow*Math.sin(Math.PI*t)**2);}
}
class SupportedPtfeBundle extends T.Curve{
 constructor(owner,a,b,turn=false){super();Object.assign(this,{owner,a,b,turn});this.arcLengthDivisions=512;}
 getPoint(t){const o=this.owner,f=this.a+(this.b-this.a)*t,p=o.source.getPointAt(f);if(o.sleeve.neutral)return p;const x=(f-o.bundleStart)/(o.armStart-o.bundleStart)*(o.correspondence.length-1),i=Math.min(o.correspondence.length-2,Math.floor(x)),s=T.MathUtils.lerp(o.correspondence[i],o.correspondence[i+1],x-i),old=o.sleeve.source.getPointAt(s),now=o.sleeve.materialPoint(s),ta=o.sleeve.source.getPointAt(Math.min(1,s+.002)).sub(o.sleeve.source.getPointAt(Math.max(0,s-.002))).normalize(),tb=o.sleeve.materialTangent(s),q=basis(tb).multiply(basis(ta).invert()),follow=p.clone().sub(old).applyQuaternion(q).add(now),arm=transformed(p,o.sleeve.arm),weight=E(Math.max(0,Math.min(1,(f-(o.armStart-20/o.source.getLength()))/(20/o.source.getLength()))));if(this.turn&&o.supportTurn.angle){const c=o.sleeve.materialPoint(o.supportTurn.fraction),axis=o.sleeve.materialTangent(o.supportTurn.fraction),q=new T.Quaternion().setFromAxisAngle(axis,o.supportTurn.angle);follow.sub(c).applyQuaternion(q).add(c);}return follow.lerp(arm,weight);}
}
export class CoupledPtfe extends T.Curve{
 constructor(source,sleeve,{frontTravelMM,rightTravelMM,centreTravelMM,lastArmBand}={}){
  super();if(!Number.isFinite(frontTravelMM)||frontTravelMM===0)throw Error('Actual gantry travel datum required');Object.assign(this,{source,sleeve,stockMM:710,frontTravelMM,rightTravelMM,centreTravelMM});this.arcLengthDivisions=1024;const L=source.getLength(),points=source.points;
  if(!points||points.length!==1025)throw Error('Complete original1025-ring PTFE source required');
  this.headEnd=source.lengths[92]/L;if(!lastArmBand?.p||!Number.isFinite(lastArmBand.width))throw Error('Actual final arm strap required');let exitRing=660;const exitX=lastArmBand.p[0]+lastArmBand.width/2;while(exitRing<1024&&points[exitRing].x<=exitX)exitRing++;this.armEnd=source.lengths[exitRing]/L;
  const armSource=sleeve.source.getPointAt(sleeve.sections[2].b);let at=92,near=Infinity;
  for(let i=92;i<=660;i++){const d=points[i].distanceToSquared(armSource);if(d<near){at=i;near=d;}}
  this.armStart=source.lengths[at]/L;const support=SIDE_PTFE_ROUTE.freeWraps.map(w=>{const c=new T.Vector3(...w.newCentreCADMM);let at=92,best=Infinity;for(let i=92;i<=660;i++){const d=points[i].distanceToSquared(c);if(d<best){at=i;best=d;}}return source.lengths[at];}).sort((a,b)=>a-b);this.firstSupportMM=support[0];this.secondSupportMM=support[1];this.bundleStart=(support[0]-5)/L;this.middleStart=(support[0]+5)/L;this.middleEnd=(support[1]-10)/L;
  const guide=new T.Vector3(194,68,340);at=660;near=Infinity;
  for(let i=660;i<points.length;i++){const d=points[i].distanceToSquared(guide);if(d<near){at=i;near=d;}}
  this.sideStart=source.lengths[at]/L;this.sideGuide=source.getPointAt(this.sideStart);this.sideTangent=source.getTangentAt(this.sideStart);this.approach=this.sideGuide.clone().addScaledVector(this.sideTangent,-25);
  const samples=Array.from({length:4097},(_,i)=>sleeve.source.getPointAt(i/4096));this.correspondence=[];
  for(let k=0;k<=512;k++){const p=source.getPointAt(T.MathUtils.lerp(this.bundleStart,this.armStart,k/512));let best=Infinity,index=0;for(let i=0;i<samples.length;i++){const d=samples[i].distanceToSquared(p);if(d<best){best=d;index=i;}}let lo=Math.max(0,(index-1)/4096),hi=Math.min(1,(index+1)/4096);for(let j=0;j<24;j++){const a=(2*lo+hi)/3,b=(lo+2*hi)/3;if(sleeve.source.getPointAt(a).distanceToSquared(p)<sleeve.source.getPointAt(b).distanceToSquared(p))hi=b;else lo=a;}this.correspondence.push((lo+hi)/2);}const x=(this.firstSupportMM/L-this.bundleStart)/(this.armStart-this.bundleStart)*512,i=Math.min(511,Math.floor(x));this.firstSupportFraction=T.MathUtils.lerp(this.correspondence[i],this.correspondence[i+1],x-i);
 }
 update(){
  const S=this.source,L=S.getLength(),A=this.sleeve.arm,H=translateTransform(this.sleeve.delta),F=neutralTransform();this.neutral=false;const f=this.firstSupportFraction,pivot=this.sleeve.materialPoint(f),axis=this.sleeve.materialTangent(f),originalT=this.sleeve.source.getPointAt(Math.min(1,f+.002)).sub(this.sleeve.source.getPointAt(Math.max(0,f-.002))).normalize(),frame=basis(axis).multiply(basis(originalT).invert()),offset=S.getPointAt(this.firstSupportMM/L).sub(this.sleeve.source.getPointAt(f)).applyQuaternion(frame),towardHead=transformed(S.getPointAt(this.headEnd),H).sub(pivot);offset.addScaledVector(axis,-offset.dot(axis));towardHead.addScaledVector(axis,-towardHead.dot(axis));let angle=Math.atan2(axis.dot(new T.Vector3().crossVectors(offset,towardHead)),offset.dot(towardHead));if(angle>Math.PI/2)angle-=Math.PI*2;const second=new SupportedPtfeBundle(this,this.middleEnd,this.armStart).getPoint((this.secondSupportMM/L-this.middleEnd)/(this.armStart-this.middleEnd)).sub(pivot),headVector=transformed(S.getPointAt(this.headEnd),H).sub(pivot),fullOffset=S.getPointAt(this.firstSupportMM/L).sub(this.sleeve.source.getPointAt(f)).applyQuaternion(frame),cost=a=>{const p=fullOffset.clone().applyQuaternion(new T.Quaternion().setFromAxisAngle(axis,a));return p.distanceTo(headVector)+p.distanceTo(second);};let best=Infinity;for(let k=0;k<32;k++){const a=-1.5*Math.PI+k*Math.PI/16,c=cost(a);if(c<best){best=c;angle=a;}}let lo=angle-Math.PI/16,hi=angle+Math.PI/16;for(let k=0;k<24;k++){const a=(2*lo+hi)/3,b=(lo+2*hi)/3;if(cost(a)<cost(b))hi=b;else lo=a;}angle=(lo+hi)/2;while(angle>Math.PI/2)angle-=Math.PI*2;while(angle< -1.5*Math.PI)angle+=Math.PI*2;this.supportTurn={fraction:f,angle:angle*T.MathUtils.smoothstep(Math.abs(this.sleeve.delta.y/this.frontTravelMM),0,1)*(1-T.MathUtils.smoothstep((this.sleeve.delta.x-this.centreTravelMM)/(this.rightTravelMM-this.centreTravelMM),0,1))};
  const shared=new SupportedPtfeBundle(this,this.bundleStart,this.middleStart,true),sharedArm=new SupportedPtfeBundle(this,this.middleEnd,this.armStart),point=S.getPointAt(this.bundleStart),moved=shared.getPoint(0),oldT=S.getTangentAt(this.bundleStart),newT=shared.getTangent(0),fork={pivot:point,q:new T.Quaternion().setFromUnitVectors(oldT,newT),offset:moved.clone().sub(point)},armPoint=transformed(S.getPointAt(this.armEnd),A),armTangent=S.getTangentAt(this.armEnd).applyQuaternion(A.q),upper=new PtfeUpperBridge(armPoint,A,this.approach,this.sideTangent);
  const head=new PtfeGuideBridge(transformed(S.getPointAt(this.headEnd),H),moved,S.getTangentAt(this.headEnd).applyQuaternion(H.q),newT);head.a=this.headEnd;head.b=this.bundleStart;head.bank.set(0,0,1);head.minimumHandle=15;const middle=new PtfeGuideBridge(shared.getPoint(1),sharedArm.getPoint(0),shared.getTangent(1),sharedArm.getTangent(0));middle.a=this.middleStart;middle.b=this.middleEnd;middle.minimumHandle=15;middle.bank.set(0,0,1);middle.bow=.5;head.bow=6.2*T.MathUtils.smoothstep((this.sleeve.delta.x-this.centreTravelMM)/(this.rightTravelMM-this.centreTravelMM),0,1);
  const approach=new T.LineCurve3(this.approach,this.sideGuide);approach.a=this.armEnd;approach.b=this.sideStart;
  // Material coordinates span the upper bight and its straight guide approach.
  const upperRoute=new T.CurvePath();upperRoute.add(upper);upperRoute.add(approach);upperRoute.a=this.armEnd;upperRoute.b=this.sideStart;
  const fixed=(a,b,tr)=>{const s=new RigidSection(S,a,b,tr);s.getLength=()=>L*(b-a);return s;};this.sections=[fixed(0,this.headEnd,H),head,shared,middle,sharedArm,fixed(this.armStart,this.armEnd,A),upperRoute,fixed(this.sideStart,1,F)];
  const bridges=[head,middle,upper],measure=()=>{for(const s of this.sections){s.needsUpdate=true;s.updateArcLengths();if(s===upperRoute){upper.needsUpdate=true;upper.updateArcLengths();s.cacheLengths=null;}}return this.sections.reduce((n,s)=>n+s.getLength(),0);};
  let total=measure();this.blend=0;this.stockBow=0;
  if(total>710){head.blend=middle.blend=upper.blend=1;const minimum=measure();if(minimum>710)throw Error('Whole supported PTFE cannot reach fixed ports '+JSON.stringify({pose:this.sleeve.delta.toArray(),minimum,sectionLengths:this.sections.map(s=>s.getLength()),stock:710}));let lo=0,hi=1;for(let i=0;i<36;i++){const t=(lo+hi)/2;head.blend=middle.blend=upper.blend=t;if(measure()>710)lo=t;else hi=t;}head.blend=middle.blend=upper.blend=(lo+hi)/2;this.blend=upper.blend;}
  else{let lo=0,hi=120;for(let i=0;i<36;i++){upper.bow=(lo+hi)/2;if(measure()<710)lo=upper.bow;else hi=upper.bow;}upper.bow=(lo+hi)/2;this.stockBow=upper.bow;}
  this.total=measure();this.lengths=this.sections.map(s=>s.getLength());this.upperRoute=upperRoute;
 }
 getLength(){return this.total;}
 getPointAt(t){let d=T.MathUtils.clamp(t,0,1)*this.total;for(let i=0;i<this.sections.length;i++){if(d<=this.lengths[i]||i===this.sections.length-1)return this.sections[i].getPointAt(T.MathUtils.clamp(d/this.lengths[i],0,1));d-=this.lengths[i];}}
 getPoint(t){return this.getPointAt(t);}
 materialPoint(t){const s=this.sections.find(s=>t>=s.a&&t<=s.b)||this.sections.at(-1),u=T.MathUtils.clamp((t-s.a)/(s.b-s.a),0,1);return s===this.upperRoute?s.getPoint(u):s.getPoint(u);}
 materialTransform(t){const s=this.sections.find(s=>t>=s.a&&t<=s.b);return s instanceof RigidSection?s.tr:null;}
 materialTangent(t){const e=.002;return this.materialPoint(Math.min(1,t+e)).sub(this.materialPoint(Math.max(0,t-e))).normalize();}
 getTangentAt(t){const e=1e-5;return this.getPointAt(Math.min(1,t+e)).sub(this.getPointAt(Math.max(0,t-e))).normalize();}
}
