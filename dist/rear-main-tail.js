import * as T from 'three';
import {derivativeLength} from './rear-main-curves.js';
import {V,writeRing} from './rear-main-curves.js';
const info=(a,b)=>{const angle=Math.acos(T.MathUtils.clamp(a.dot(b),-1,1)),normal=b.clone().addScaledVector(a,-Math.cos(angle)).divideScalar(Math.sin(angle));return{angle,normal,offset:a.clone().multiplyScalar(Math.sin(angle)).addScaledVector(normal,1-Math.cos(angle))};};
class BumpedTail extends T.Curve{
 constructor(spec,radius,amplitude){
  super();Object.assign(this,{s:V(spec.start),e:V(spec.end),t:V(spec.startTangent),u:V(spec.endTangent),radius,amplitude,start:.8});
  let d=this.e.clone().sub(this.s).normalize();for(let i=0;i<30;i++){const a=info(this.t,d),b=info(d,this.u),next=this.e.clone().sub(this.s).addScaledVector(a.offset,-radius).addScaledVector(b.offset,-radius).normalize();if(next.distanceTo(d)<1e-15)break;d=next;}
  this.d=d;this.a=info(this.t,d);this.b=info(d,this.u);this.line=this.e.clone().sub(this.s).addScaledVector(this.a.offset,-radius).addScaledVector(this.b.offset,-radius).length();this.baseLength=radius*(this.a.angle+this.b.angle)+this.line;this.end0=this.s.clone().addScaledVector(this.a.offset,radius);this.start1=this.end0.clone().addScaledVector(d,this.line);
  this.breaks=[...new Set([0,1,this.start,radius*this.a.angle/this.baseLength,(radius*this.a.angle+this.line)/this.baseLength])].sort((a,b)=>a-b);
 }
 raw(u){const r=this.radius,s=u*this.baseLength,first=r*this.a.angle;let p,t;
  if(s<=first){const a=s/r;p=this.s.clone().addScaledVector(this.t,r*Math.sin(a)).addScaledVector(this.a.normal,r*(1-Math.cos(a)));t=this.t.clone().multiplyScalar(Math.cos(a)).addScaledVector(this.a.normal,Math.sin(a));}
  else if(s<=first+this.line){p=this.end0.clone().addScaledVector(this.d,s-first);t=this.d.clone();}
  else{const a=(s-first-this.line)/r;p=this.start1.clone().addScaledVector(this.d,r*Math.sin(a)).addScaledVector(this.b.normal,r*(1-Math.cos(a)));t=this.d.clone().multiplyScalar(Math.cos(a)).addScaledVector(this.b.normal,Math.sin(a));}
  const q=T.MathUtils.clamp((u-this.start)/(1-this.start),0,1),bump=64*q**3*(1-q)**3,derivative=192*q*q*(1-q)**2*(1-2*q)/(1-this.start);p.z+=this.amplitude*bump;t.multiplyScalar(this.baseLength);t.z+=this.amplitude*derivative;return{p,t};
 }
 measured(parts=8){return this.breaks.slice(1).reduce((sum,b,i)=>{const a=this.breaks[i],h=b-a;return sum+derivativeLength(u=>this.raw(a+u*h).t.multiplyScalar(h),parts);},0);}
 prepare(){this.table=[0];let prior=this.raw(0).t.length();for(let i=1;i<=4096;i++){const next=this.raw(i/4096).t.length();this.table.push(this.table.at(-1)+(prior+next)/8192);prior=next;}const L=this.table.at(-1);this.table=this.table.map(v=>v/L);return this;}
 parameter(u){if(u<=0||u>=1)return u;let lo=0,hi=4096;while(hi-lo>1){const m=(lo+hi)>>1;if(this.table[m]<u)lo=m;else hi=m;}return(lo+(u-this.table[lo])/(this.table[hi]-this.table[lo]))/4096;}
 getPointAt(u,out=new T.Vector3()){return out.copy(this.raw(this.parameter(u)).p);}
 getTangentAt(u,out=new T.Vector3()){return out.copy(this.raw(this.parameter(u)).t).normalize();}
 getLength(){return this.target;}
}
export function makeMovingTail(spec,amplitude){
 let lo=4.21,hi=spec.radiusMM+.001;for(let i=0;i<43;i++){const mid=(lo+hi)/2,c=new BumpedTail(spec,mid,amplitude);if(c.measured()<spec.lengthMM)lo=mid;else hi=mid;}
 const curve=new BumpedTail(spec,(lo+hi)/2,amplitude);curve.target=spec.lengthMM;const measured=curve.measured(32);if(Math.abs(measured-spec.lengthMM)>1e-8)throw Error('Moving sleeve stock mismatch '+measured);curve.prepare();return curve;
}
export function writeMovingTail(entity,curve,sp,source){
 const b=sp.cutArc[1],ids=Array.from({length:255-Math.floor(b*256)},(_,j)=>Math.floor(b*256)+1+j),us=[0,...ids.map(i=>(i/256-b)/(1-b)),1],Tg=us.map(u=>curve.getTangentAt(u)),N=[],k=Math.floor(b*256),fraction=b*256-k;
 N[0]=V(source.normals[k]).lerp(V(source.normals[k+1]),fraction);N[0].addScaledVector(Tg[0],-N[0].dot(Tg[0])).normalize();
 for(let i=1;i<Tg.length;i++){const axis=Tg[i-1].clone().cross(Tg[i]),s=axis.length();N[i]=N[i-1].clone();if(s>1e-12)N[i].applyAxisAngle(axis.divideScalar(s),Math.atan2(s,Tg[i-1].dot(Tg[i])));N[i].addScaledVector(Tg[i],-N[i].dot(Tg[i])).normalize();}
 const end=V(source.normals.at(-1)),last=Tg.length-1,twist=Math.atan2(Tg[last].dot(N[last].clone().cross(end)),N[last].dot(end));
 for(let j=0;j<ids.length;j++){const i=j+1,u=us[i],normal=N[i].clone().applyAxisAngle(Tg[i],twist*u*u*(3-2*u));writeRing(entity.geometry,ids[j],curve.getPointAt(u).toArray(),Tg[i].toArray(),normal.toArray(),4.2);}
 for(const n of ['position','normal'])entity.geometry.attributes[n].needsUpdate=true;entity.geometry.computeBoundingBox();entity.geometry.computeBoundingSphere();
}
