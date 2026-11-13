import * as T from 'three';
import {V,path,restore,cubic,join,Section,lengthOf} from './curves.js';
const Z=()=>V([0,0,1]),smooth=t=>T.MathUtils.smoothstep(t,0,1);
function sourceSection(data,a,b){const parts=data.upperSource.curves,lengths=[];let sum=0;for(const p of parts){sum+=p.lengthMM;lengths.push(sum);}const out=[];for(let i=0;i<parts.length;i++){const start=i?lengths[i-1]:0,end=lengths[i],lo=Math.max(a*sum,start),hi=Math.min(b*sum,end);if(hi<=lo)continue;const c=restore(parts[i]);if(lo>start+1e-10||hi<end-1e-10){if(!c.isLineCurve3)throw Error('Retained FE45 section boundary must be straight');out.push(new T.LineCurve3(c.getPoint((lo-start)/(end-start)),c.getPoint((hi-start)/(end-start))));}else out.push(c);}return out;}
class MaterialCurve extends T.Curve{
 constructor(p,data){super();this.path=p;this.data=data;this.target=data.targetMM;}
 station(t){const d=this.data.materialStationsMM,n=d.length-1,k=Math.min(n-1,Math.floor(t*n)),u=t*n-k,h=d[k+1]-d[k],before=k?d[k]-d[k-1]:h,after=k<n-1?d[k+2]-d[k+1]:h,m0=2*before*h/(before+h),m1=2*after*h/(after+h);return(2*u**3-3*u*u+1)*d[k]+(u**3-2*u*u+u)*m0+(-2*u**3+3*u*u)*d[k+1]+(u**3-u*u)*m1;}
 getPoint(t,out){return this.path.getPointAt(T.MathUtils.clamp(this.station(t)/this.target,0,1),out);}getPointAt(t,out){return this.getPoint(t,out);}
 getTangent(t,out){return this.path.getTangentAt(T.MathUtils.clamp(this.station(t)/this.target,0,1),out);}getTangentAt(t,out){return this.getTangent(t,out);}getLength(){return this.target;}
}
class FreeTail extends T.Curve{
 constructor(spline,reference,b,tangent,w){super();Object.assign(this,{spline,reference,w});this.delta=b.clone().sub(reference.getPoint(1));this.dv=tangent.clone().sub(reference.getTangent(1)).multiplyScalar(reference.getLength());this.arcLengthDivisions=8192;this.mm=lengthOf(t=>this.derivative(t),64);}
 getPoint(t,out=new T.Vector3()){const ref=this.reference.getPoint(t).addScaledVector(this.delta,3*t*t-2*t**3).addScaledVector(this.dv,t**3-t*t);return out.copy(this.spline.getPoint(t)).lerp(ref,this.w);}
 derivative(t,out=new T.Vector3()){const ref=this.reference.getTangent(t).multiplyScalar(this.reference.getLength()).addScaledVector(this.delta,6*t-6*t*t).addScaledVector(this.dv,3*t*t-2*t);return out.copy(this.spline.getTangent(t)).multiplyScalar(this.spline.getLength()).lerp(ref,this.w);}
 getTangent(t,out){return this.derivative(t,out).normalize();}getLength(){return this.mm;}
}
class BlendCurve extends T.Curve{constructor(a,b,w){super();Object.assign(this,{a,b,w});this.arcLengthDivisions=8192;this.mm=lengthOf(t=>this.derivative(t),64);}getPoint(t,out=new T.Vector3()){return out.copy(this.a.getPointAt(t)).lerp(this.b.getPointAt(t),this.w);}derivative(t,out=new T.Vector3()){return out.copy(this.a.getTangentAt(t)).multiplyScalar(this.a.getLength()).lerp(this.b.getTangentAt(t).multiplyScalar(this.b.getLength()),this.w);}getTangent(t,out){return this.derivative(t,out).normalize();}getLength(){return this.mm;}}
export function prepareFe45Reference(data){
 const prefix=data.prefix.curves.map(restore),tail=path([...prefix.slice(13),...sourceSection(data,434/512,477/512),restore(data.quartic),...sourceSection(data,501/512,1)]),full=path([...prefix,...sourceSection(data,434/512,477/512),restore(data.quartic),...sourceSection(data,501/512,1)]),material=new MaterialCurve(full,data);
 const frame=material.computeFrenetFrames(512,false),gamma=[];
 for(let i=0;i<=512;i++){const normal=V(data.positions.slice(i*27,i*27+3)).multiplyScalar(1000).sub(V(data.points[i])).normalize().negate(),n=frame.normals[i],t=frame.tangents[i];gamma[i]=Math.atan2(t.dot(n.clone().cross(normal)),n.dot(normal));}
 const column=path(prefix.slice(0,13)),heightParameter=z=>{let a=0,b=1;for(let i=0;i<40;i++){const t=(a+b)/2;if(column.getPoint(t).z<z)a=t;else b=t;}return(a+b)/2;},ca=heightParameter(75),cb=heightParameter(95);
 const result={data,prefix,tail,full,material,gamma,column,head:new Section(column,0,ca),coilBase:new Section(column,ca,cb),trunk:new Section(column,cb,1)};result.restFrame=correctFrames(material,gamma);result.restPoints=Array.from({length:513},(_,i)=>material.getPoint(i/512));return result;
}
function correctFrames(curve,gamma){const f=curve.computeFrenetFrames(512,false);for(let i=0;i<=512;i++){f.normals[i].applyAxisAngle(f.tangents[i],gamma[i]);f.binormals[i].crossVectors(f.tangents[i],f.normals[i]).normalize();}return f;}
function freeApproach(reference,b,d,value5,S,startT){
 const Tin=d.clone().negate(),distance=S.distanceTo(b),chord=b.clone().sub(S),reversal=smooth((.6-Tin.dot(chord.clone().normalize()))/1.2),h=T.MathUtils.lerp(Math.max(3,Math.min(15,distance/3)),15,reversal),w=smooth((b.z-S.z+60)/35),side=35+35*smooth((b.z-50)/80),bow=V([40*reversal*(1-smooth((value5-1.9)/.2)),reversal*(12+13*smooth((value5-1.9)/.2)),0]);
 const generic2=S.clone().lerp(b,.3).addScaledVector(startT,.6*h).addScaledVector(Tin,-.3*h).add(bow),generic3=S.clone().lerp(b,.7).addScaledVector(startT,.3*h).addScaledVector(Tin,-.6*h).add(bow);
 const p2=S.clone().add(V([side,20,4])).lerp(generic2,w),p3=b.clone().add(V([side,20,-20])).lerp(generic3,w),handle=T.MathUtils.lerp(15,.6*h,w),startHandle=T.MathUtils.lerp(8,.6*h,w);
 const points=[S,S.clone().addScaledVector(startT,startHandle),p2,p3,b.clone().addScaledVector(Tin,-handle),b.clone()];
 let spline=path([restore({points:points.map(p=>p.toArray())})]);const engage=smooth((-125-b.x)/20)*smooth((value5-2.4)/.2);if(engage>0){const C=V([Math.max(-145,b.x+20),180.6997221025,300.1459736382]),left=V([-1,0,0]),guided=path([join(S,startT,C,left,15),join(C,left,b,Tin,Math.min(8,C.distanceTo(b)/3))]);spline=engage>=1?guided:path([new BlendCurve(spline,guided,engage)]);}return spline;
}
function tail(reference,b,d,value5,S=reference.tail.getPoint(0),startT=Z()){
 const bands=[[65.35,69.95],[100.35,104.95],[170.35,174.95],[205.35,209.95]],throughBand=Math.max(...bands.map(([lo,hi])=>smooth((b.z-lo+6)/6)*(1-smooth((b.z-hi-.5)/5)))),lead=b.clone().addScaledVector(d,6*throughBand*(1-smooth((value5-1.8)/.2))),spline=path([freeApproach(reference,lead,d,value5,S,startT),new T.LineCurve3(lead,b)]);return new FreeTail(spline,reference.tail,b,d.clone().negate(),smooth((value5-2.8)/.2));
}
function resultFor(reference,curve,report){
 return{curve,lengthMM:curve.path.getLength(),minimumRouteMM:report.minimumRouteMM,storageKind:report.storageKind,amount:report.storageAngle,report,writeTube(entity){
  const g=entity.mesh.geometry,p=g.attributes.position,n=g.attributes.normal;
  if(curve===reference.material){p.array.set(reference.data.positions);n.array.set(reference.data.normals);}
  else{
   const phase=smooth((report.value5-2.7)/.3),f=correctFrames(curve,reference.gamma.map(g=>g*phase));
   for(let i=0;i<=512;i++){const c=curve.getPoint(i/512),rest=reference.restPoints[i],old=reference.restFrame,rotate=v=>f.normals[i].clone().multiplyScalar(v.dot(old.normals[i])).addScaledVector(f.binormals[i],v.dot(old.binormals[i])).addScaledVector(f.tangents[i],v.dot(old.tangents[i]));
    for(let j=0;j<=8;j++){const at=i*9+j,k=at*3,raw=V(reference.data.positions.slice(k,k+3)).multiplyScalar(1000),offset=raw.clone().sub(rest),rotated=rotate(offset),normal=rotate(V(reference.data.normals.slice(k,k+3)));p.setXYZ(at,(c.x+rotated.x)*.001,(c.y+rotated.y)*.001,(c.z+rotated.z)*.001);n.setXYZ(at,normal.x,normal.y,normal.z);}
   }
  }
  p.needsUpdate=true;n.needsUpdate=true;g.computeBoundingBox();g.computeBoundingSphere();entity.curve=curve;
 }};
}

class MaterialBight extends T.Curve{
 constructor(base,amplitude){super();Object.assign(this,{base,amplitude});this.arcLengthDivisions=8192;this.sine=6+6*smooth((amplitude-.65)/.3);this.bias=6+14*smooth((amplitude-.65)/.3);this.mm=lengthOf(t=>this.derivative(t),64);}
 getPoint(t,out=new T.Vector3()){const phi=2*Math.PI*t*t*(3-2*t);return out.copy(this.base.getPoint(t)).add(V([42*(1-Math.cos(phi)),-(1-Math.cos(phi))*(this.sine+1+this.sine*Math.sin(phi))+this.bias*this.amplitude*smooth((this.amplitude-.25)/.35)*(1-Math.cos(phi))**2,0]).multiplyScalar(this.amplitude));}
 derivative(t,out=new T.Vector3()){const phi=2*Math.PI*t*t*(3-2*t),dphi=12*Math.PI*t*(1-t);return out.copy(this.base.getTangent(t)).multiplyScalar(this.base.getLength()).add(V([42*Math.sin(phi)*dphi,(-(Math.sin(phi)*(this.sine+1+this.sine*Math.sin(phi))+(1-Math.cos(phi))*this.sine*Math.cos(phi))+2*this.bias*this.amplitude*smooth((this.amplitude-.25)/.35)*(1-Math.cos(phi))*Math.sin(phi))*dphi,0]).multiplyScalar(this.amplitude));}
 getTangent(t,out){return this.derivative(t,out).normalize();}getLength(){return this.mm;}
}
function endRoute(reference,b,d,value5){
 const trunk=reference.trunk,height=Math.max(95,Math.min(247,b.z-20));let lo=0,hi=1;for(let i=0;i<38;i++){const t=(lo+hi)/2;if(trunk.getPoint(t).z<height)lo=t;else hi=t;}const cut=(lo+hi)/2,G=trunk.getPoint(cut),Tg=trunk.getTangent(cut);
 return path([new Section(trunk,0,cut),tail(reference,b,d,value5,G,Tg)]);
}
export function solveFe45Wire({ports,tangents,value5,target,reference}){
 if(value5<1)return null;const a=ports[0],b=ports[1],d=tangents[1];if(a.distanceTo(V(reference.data.points[0]))>1e-7)throw Error('FE4 fixed port changed');
 let amplitude=0,curve,minimum=target;
 if(value5>=3-1e-12&&b.distanceTo(V(reference.data.points[512]))<1e-7)curve=reference.material;
 else{
  const free=endRoute(reference,b,d,value5),candidate=k=>path([reference.head,new MaterialBight(reference.coilBase,k),free]);minimum=candidate(0).getLength();
  if(minimum>target+1e-6)throw Error('FE45 minimum retained-column route exceeds stock '+minimum);
  let lo=0,hi=1.4;if(candidate(hi).getLength()<target)throw Error('FE45 case bight capacity below stock '+candidate(hi).getLength());
  for(let i=0;i<34;i++){const mid=(lo+hi)/2;if(candidate(mid).getLength()<target)lo=mid;else hi=mid;}amplitude=(lo+hi)/2;curve=new MaterialCurve(candidate(amplitude),reference.data);
 }
 const mm=curve.path.getLength(),report={phase:value5<=2?'official3.48 FE5 case routing':'official5.77 FE5 CoreXY routing',value5,targetMM:target,lengthMM:mm,errorMM:mm-target,storageKind:'C1 spatial bight between retained guide heights75..95',storageAngle:amplitude,minimumRouteMM:minimum,ports:ports.map(p=>p.toArray()),tangents:tangents.map(p=>p.toArray()),unmet:'Value0..1 boundary is uncorrected. Local harness includes necessary stage1 BODY case-entry proposal. Early displayed LCD-wire staging contacts are recorded separately.'};return resultFor(reference,curve,report);
}
