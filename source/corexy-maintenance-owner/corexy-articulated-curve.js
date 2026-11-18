// SPDX-License-Identifier: MIT
import*as T from'three';
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
class CoupledHead extends T.Curve{
 constructor(source,a,b,sleeve,correspondence){super();Object.assign(this,{source,a,b,sleeve,correspondence});this.arcLengthDivisions=512;}
 getPoint(t){const f=this.a+(this.b-this.a)*t,p=this.source.getPointAt(f),v=f*(this.correspondence.length-1),i=Math.min(this.correspondence.length-2,Math.floor(v)),s=T.MathUtils.lerp(this.correspondence[i],this.correspondence[i+1],v-i),old=this.sleeve.source.getPointAt(s),now=this.sleeve.materialPoint(s),q=basis(this.sleeve.materialTangent(s)).multiply(basis(this.sleeve.source.getPointAt(Math.min(1,s+.002)).sub(this.sleeve.source.getPointAt(Math.max(0,s-.002))).normalize()).invert()),follow=p.clone().sub(old).applyQuaternion(q).add(now),rigid=p.clone().add(this.sleeve.delta),weight=E(Math.max(0,Math.min(1,(f*this.source.getLength()-140)/65)));return rigid.lerp(follow,weight);}
}
export class CoupledPtfe extends T.Curve{
 constructor(source,sleeve){super();Object.assign(this,{source,sleeve,stockMM:710});this.arcLengthDivisions=1024;const L=source.getLength();this.correspondence=Array.from({length:1025},(_,i)=>T.MathUtils.clamp((185.5+355.08-i/1024*L)/sleeve.sourceLength,0,1));this.armStart=355.08/L;this.armEnd=460/L;}
 update(){const S=this.source,L=S.getLength(),A=this.sleeve.arm,H=translateTransform(this.sleeve.delta),F=neutralTransform();this.neutral=this.sleeve.neutral;
  const shared=new CoupledHead(S,205/L,this.armStart,this.sleeve,this.correspondence),point=S.getPointAt(205/L),moved=shared.getPoint(0),oldT=S.getTangentAt(205/L),newT=shared.getTangent(0),fork={pivot:point,q:new T.Quaternion().setFromUnitVectors(oldT,newT),offset:moved.clone().sub(point)};
  this.sections=[new RigidSection(S,0,8/L,H),new Bridge(S,8/L,205/L,H,fork),shared,new RigidSection(S,this.armStart,this.armEnd,A),new Bridge(S,this.armEnd,1-8/L,A,F),new RigidSection(S,1-8/L,1,F)];
  if(this.neutral){this.total=L;return;}const bridges=[this.sections[1],this.sections[4]],measure=()=>{for(const s of this.sections){s.needsUpdate=true;s.updateArcLengths();}return this.sections.reduce((n,s)=>n+s.getLength(),0);};const initial=measure();let lo=0,hi=1;
  if(initial>710){for(const b of bridges)b.blend=1;if(measure()>710)throw Error('Complete PTFE stock cannot reach articulated bundle '+JSON.stringify({delta:this.sleeve.delta.toArray(),min:measure()}));for(let i=0;i<35;i++){const t=(lo+hi)/2;for(const b of bridges)b.blend=t;if(measure()>710)lo=t;else hi=t;}for(const b of bridges)b.blend=(lo+hi)/2;}
  else{hi=180;const b=bridges[1];b.bow=1;const plus=measure();b.bow=-1;const minus=measure();b.bow=0;if(plus<minus)b.bank.negate();for(let i=0;i<35;i++){b.bow=(lo+hi)/2;if(measure()<710)lo=b.bow;else hi=b.bow;}b.bow=(lo+hi)/2;}this.total=measure();this.lengths=this.sections.map(s=>s.getLength());
 }
 getLength(){return this.total;}
 getPointAt(t){if(this.neutral)return this.source.getPointAt(t);let d=Math.max(0,Math.min(1,t))*this.total;for(let i=0;i<this.sections.length;i++){if(d<=this.lengths[i]||i===this.sections.length-1)return this.sections[i].getPointAt(T.MathUtils.clamp(d/this.lengths[i],0,1));d-=this.lengths[i];}}
 getPoint(t){return this.getPointAt(t);}
 materialPoint(t){if(this.neutral)return this.source.getPointAt(t);const s=this.sections.find(s=>t>=s.a&&t<=s.b)||this.sections.at(-1);return s.getPoint((t-s.a)/(s.b-s.a));}
 materialTransform(t){if(this.neutral)return neutralTransform();const s=this.sections.find(s=>t>=s.a&&t<=s.b);return s instanceof RigidSection?s.tr:null;}
 materialTangent(t){const e=.002;return this.materialPoint(Math.min(1,t+e)).sub(this.materialPoint(Math.max(0,t-e))).normalize();}
 getTangentAt(t){const e=1e-5;return this.getPointAt(Math.min(1,t+e)).sub(this.getPointAt(Math.max(0,t-e))).normalize();}
}
