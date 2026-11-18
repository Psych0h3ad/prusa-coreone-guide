// MIT code; authored clearance route CC-BY-SA-4.0. No OEM bend/force claim.
import * as T from 'three';
import {lengthOf,path} from './cable-assembly/earth/curves.js';
import {axialStep} from './cable-assembly/boundary/loose-rear-wire.js';
const X=-148.1,Y=198.5,Z=new T.Vector3(0,0,1),viaX=-118,holeX=-131.0993938751,holeY=177.5997221025;
const ramp=(z,a,b)=>{const u=T.MathUtils.clamp((z-a)/(b-a),0,1);return{w:u*u*(3-2*u),d:z>a&&z<b?6*u*(1-u)/(b-a):0};};
class UniformCurve extends T.Curve{
 constructor(raw){super();this.raw=raw;this.mm=raw.getLength();}
 getPoint(t,out=new T.Vector3()){return this.raw.getPointAt(t,out);}getPointAt(t,out){return this.getPoint(t,out);}
 getTangent(t,out=new T.Vector3()){return this.raw.getTangentAt(t,out);}getTangentAt(t,out){return this.getTangent(t,out);}getLength(){return this.mm;}
}
class FrontColumn extends T.Curve{
 constructor(base,amount,corridor=amount){super();this.base=base;this.amount=amount;this.corridor=corridor;this.arcLengthDivisions=8192;this.mm=lengthOf(t=>this.derivative(t),128);}
 weight(z){const a=ramp(z,60,74),b=ramp(z,237,241);return{w:this.corridor*a.w*(1-b.w),d:this.corridor*(a.d*(1-b.w)-a.w*b.d)};}
 target(z){const a=ramp(z,150,195),b=ramp(z,205,220),c=ramp(z,220,237);return{x:X+(viaX-X)*a.w+(holeX-viaX)*c.w,y:Y+(holeY-Y)*b.w,dx:(viaX-X)*a.d+(holeX-viaX)*c.d,dy:(holeY-Y)*b.d};}
 getPoint(t,out=new T.Vector3()){out.copy(this.base.getPoint(t));out.z+=20*this.amount*(1-ramp(out.z,180,235).w);const{w}=this.weight(out.z),p=this.target(out.z);out.x+=(p.x-out.x)*w;out.y+=(p.y-out.y)*w;return out;}
 derivative(t,out=new T.Vector3()){const p=this.base.getPoint(t),lift=ramp(p.z,180,235),z=p.z+20*this.amount*(1-lift.w),{w,d}=this.weight(z),target=this.target(z);out.copy(this.base.getTangent(t)).multiplyScalar(this.base.getLength());out.z*=1-20*this.amount*lift.d;out.x=out.x*(1-w)+((target.x-p.x)*d+target.dx*w)*out.z;out.y=out.y*(1-w)+((target.y-p.y)*d+target.dy*w)*out.z;return out;}
 getTangent(t,out=new T.Vector3()){return this.derivative(t,out).normalize();}getLength(){return this.mm;}
}
class TailBlend extends T.Curve{
 constructor(a,b,amount){super();Object.assign(this,{a,b,amount});this.arcLengthDivisions=8192;this.mm=lengthOf(t=>this.derivative(t),128);}
 getPoint(t,out=new T.Vector3()){return out.copy(this.a.getPointAt(t)).lerp(this.b.getPointAt(t),this.amount);}
 derivative(t,out=new T.Vector3()){return out.copy(this.a.getTangentAt(t)).multiplyScalar(this.a.getLength()*(1-this.amount)).addScaledVector(this.b.getTangentAt(t),this.b.getLength()*this.amount);}
 getTangent(t,out=new T.Vector3()){return this.derivative(t,out).normalize();}getLength(){return this.mm;}
}
export function withFEClearColumn(reference,amount=1,corridor=amount){return{...reference,coilBase:new UniformCurve(new FrontColumn(reference.coilBase,amount,corridor)),trunk:new UniformCurve(new FrontColumn(reference.trunk,amount,corridor))};}
export function heldFEGroundHead(reference,original){
 const amount=reference.feClearanceAmount||0;if(amount===0)return original;
 const prefix=original.curves.slice(0,4),R=prefix.at(-1).getPoint(1),S=original.getPoint(1),Q=new T.Vector3(R.x,183,22),A=new T.Vector3(X,183,30),B=new T.Vector3(X,Y,48),end=new T.Vector3(X,Y,S.z+20),tail=path([axialStep(R,Q,Z),axialStep(Q,A,Z),axialStep(A,B,Z),new T.LineCurve3(B,end)]);
 return path([...prefix,amount===1?tail:new UniformCurve(new TailBlend(path(original.curves.slice(4)),tail,amount))]);
}
export function sourceFEStorageHold(viewer){
 if(viewer.state?.flow!=='build'||viewer.state.explore||viewer.state.comparison==='before'||viewer.operationScene?.full||!viewer.operationScene?.plan.sharedPhysicalFE348)return 0;
 const actors=viewer.operationScene.plan.actors,n=actors.length,feed=actors.findIndex(a=>a.feHarnessEvent==='case-feed');if(n!==6||feed!==3)throw Error('Different FE3.48 source order');
 const clock=Math.max(0,Math.min(1,viewer.operationProgress))*n,index=Math.min(n-1,Math.floor(clock)),t=clock-index;
 const raised=index<feed?0:index>feed?1:T.MathUtils.smoothstep(t,0,.15),returned=index<5?0:T.MathUtils.smoothstep(t,.5,1);return raised*(1-returned);
}


export function blendSourceCurves(a,b,amount){return new UniformCurve(new TailBlend(a,b,amount));}
