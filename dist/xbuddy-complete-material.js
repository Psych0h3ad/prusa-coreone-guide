import * as T from 'three';
import {captureGeometryStorage,geometryStorageCurrent} from './xbuddy-lease-guards.js';
export const V=p=>new T.Vector3(...p),S=x=>(x=T.MathUtils.clamp(x,0,1))*x*(3-2*x);
// One smooth free material bank. Endpoint derivative directions are analytic;
// a scalar broad bight absorbs motion without moving the attached source end.
export class FreeMaterialBank extends T.Curve{
 constructor({start,startT,end,endT,stock,direction=[0,1,0],directionTail=null,tailBlend=[.45,.85],bow=0}){
  super();this.arcLengthDivisions=512;this.A=start.clone();this.B=end.clone();this.U=startT.clone().normalize();this.W=endT.clone().normalize();this.L=stock;this.D=V(direction).normalize();this.h=Math.min(stock*.23,45);this.a=bow;
  this.tailDelta=directionTail?V(directionTail).normalize().sub(this.D):null;this.tailBlend=tailBlend;
  const len=a=>{this.a=a;this.updateArcLengths();return super.getLength();};
  let lo=0,hi=Math.max(4,bow),low=len(lo),high=len(hi);
  if(low>stock+1e-5)throw Error('Free bank has insufficient material '+JSON.stringify({stock,minimum:low,start:start.toArray(),end:end.toArray()}));
  while(high<stock&&hi<2000)high=len(hi*=1.7);
  if(high<stock)throw Error('Unbracketed free-bank stock');
  for(let i=0;i<27;i++){const mid=(lo+hi)/2;if(len(mid)<stock)lo=mid;else hi=mid;}
  this.a=(lo+hi)/2;this.updateArcLengths();this.measuredMM=super.getLength();this.stockMM=stock;
 }
 getPoint(t,out=new T.Vector3()){
  const u=1-t;out.copy(this.A).multiplyScalar(u*u*(1+2*t)).addScaledVector(this.B,t*t*(3-2*t)).addScaledVector(this.U,this.h*u*u*t).addScaledVector(this.W,-this.h*u*t*t).addScaledVector(this.D,this.a*16*t*t*u*u);
  if(this.tailDelta)out.addScaledVector(this.tailDelta,this.a*16*t*t*u*u*S((t-this.tailBlend[0])/(this.tailBlend[1]-this.tailBlend[0])));return out;
 }
 getTangent(t,out=new T.Vector3()){
  out.copy(this.B).sub(this.A).multiplyScalar(6*t*(1-t)).addScaledVector(this.U,this.h*(1-4*t+3*t*t)).addScaledVector(this.W,-this.h*(2*t-3*t*t)).addScaledVector(this.D,this.a*32*t*(1-t)*(1-2*t));
  if(this.tailDelta){const s=T.MathUtils.clamp((t-this.tailBlend[0])/(this.tailBlend[1]-this.tailBlend[0]),0,1),w=S(s),dw=6*s*(1-s)/(this.tailBlend[1]-this.tailBlend[0]);out.addScaledVector(this.tailDelta,this.a*(32*t*(1-t)*(1-2*t)*w+16*t*t*(1-t)*(1-t)*dw));}return out.normalize();
 }
 getLength(){return this.L;}
}
export class MaterialJoin extends T.Curve{
 constructor(prefix,prefixMM,bank){super();this.prefix=prefix;this.prefixMM=prefixMM;this.bank=bank;this.stockMM=prefixMM+bank.stockMM;}
 getPoint(t,out=new T.Vector3()){const s=T.MathUtils.clamp(t,0,1)*this.stockMM;return s<=this.prefixMM?this.prefix.getPointAt(T.MathUtils.clamp(s/this.prefixMM,0,1),out):this.bank.getPointAt(T.MathUtils.clamp((s-this.prefixMM)/this.bank.stockMM,0,1),out);}
 getTangent(t,out=new T.Vector3()){const s=T.MathUtils.clamp(t,0,1)*this.stockMM;return s<=this.prefixMM?this.prefix.getTangentAt(T.MathUtils.clamp(s/this.prefixMM,0,1),out):this.bank.getTangentAt(T.MathUtils.clamp((s-this.prefixMM)/this.bank.stockMM,0,1),out);}
 getPointAt(t,out){return this.getPoint(t,out);}getTangentAt(t,out){return this.getTangent(t,out);}getLength(){return this.stockMM;}
}
export function closedRound(curve,radius,samples=192,sides=12){
 class Metres extends T.Curve{getPoint(t,out=new T.Vector3()){return curve.getPointAt(t,out).multiplyScalar(.001);}getTangent(t,out=new T.Vector3()){return curve.getTangentAt(t,out);}}
 const tube=new T.TubeGeometry(new Metres(),samples,radius*.001,sides,false),p=Array.from(tube.attributes.position.array),n=Array.from(tube.attributes.normal.array),uv=Array.from(tube.attributes.uv.array),ix=Array.from(tube.index.array);
 for(const end of[0,1]){const c=curve.getPointAt(end).multiplyScalar(.001),normal=curve.getTangentAt(end).multiplyScalar(end?1:-1),k=p.length/3;p.push(...c.toArray());n.push(...normal.toArray());uv.push(end,.5);for(let j=0;j<sides;j++){const a=end*samples*(sides+1)+j;ix.push(...(end?[k,a,a+1]:[k,a+1,a]));}}
 tube.setAttribute('position',new T.Float32BufferAttribute(p,3));tube.setAttribute('normal',new T.Float32BufferAttribute(n,3));tube.setAttribute('uv',new T.Float32BufferAttribute(uv,2));tube.setIndex(ix);tube.computeBoundingBox();tube.computeBoundingSphere();return tube;
}
export function rewriteGeometry(target,next,trusted){
 if(!trusted||trusted.g!==target||!geometryStorageCurrent(trusted))throw Error('Cannot rewrite an adopted geometry descriptor');
 const fresh=captureGeometryStorage(next);
 if(trusted.p?.count===fresh.p?.count&&trusted.ix?.count===fresh.ix?.count){
  for(const k of['p','n']){const to=trusted[k],from=fresh[k],set=to.arrayMethods.find(([key])=>key==='set')[1].descriptor.value,mark=to.methods.find(([key])=>key==='needsUpdate')[1].descriptor.set;set.call(to.array,from.array);mark.call(to.a,true);}
  for(const key of['computeBoundingBox','computeBoundingSphere'])trusted.methods.find(([k])=>k===key)[1].descriptor.value.call(target);
  fresh.methods.find(([k])=>k==='dispose')[1].descriptor.value.call(next);return target;
 }return next;
}
