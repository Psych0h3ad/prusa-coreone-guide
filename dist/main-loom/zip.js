import * as T from 'three';import {Slice}from './rest.js?v=20261112-113';
// Feed the flexible sleeve progressively after clearing the parting lip.
// The full circular section stays4.2mm; the free incoming length supplies
// the extra bend arc rather than stretching the cloth or shrinking it.
export class MainLoomZip extends T.Curve{
 constructor(rest,normal,progress,{roundingMM=18}={}){
  super();Object.assign(this,{rest,normal:normal.clone(),progress:T.MathUtils.clamp(progress,0,1),roundingMM});
  this.length=rest.jacket.getLength();this.prefixLength=rest.prefix.getLength();this.domain=this.length+12;this.arcLengthDivisions=8192;
  this.start=rest.jacket.getPointAt(1);this.free=rest.jacket.getPointAt(0);this.freeDirection=rest.jacket.getTangentAt(0).negate();
  if(this.progress<=.35){this.constant=T.MathUtils.lerp(12,3,T.MathUtils.smoothstep(this.progress,0,.35));}
  else{this.front=T.MathUtils.lerp(-roundingMM,this.prefixLength+roundingMM,T.MathUtils.smoothstep(this.progress,.35,1));}
 }
 offset(h,derivative=false){
  if(this.constant!==undefined)return derivative?0:this.constant;
  const u=T.MathUtils.clamp(h/this.prefixLength,0,1),warp=this.prefixLength*u*u*(3-2*u),v=(warp-this.front+this.roundingMM)/(2*this.roundingMM);
  if(v<=0)return 0;if(v>=1)return derivative?0:3;
  return derivative?3*6*v*(1-v)/(2*this.roundingMM)*6*u*(1-u):3*v*v*(3-2*v);
 }
 getPoint(t,out=new T.Vector3()){
  const h=T.MathUtils.clamp(t,0,1)*this.domain;
  if(h<=this.length)this.rest.jacket.getPointAt(1-h/this.length,out);else out.copy(this.free).addScaledVector(this.freeDirection,h-this.length);
  return out.addScaledVector(this.normal,this.offset(h));
 }
 getTangent(t,out=new T.Vector3()){
  const h=T.MathUtils.clamp(t,0,1)*this.domain;
  if(h<=this.length)this.rest.jacket.getTangentAt(1-h/this.length,out).negate();else out.copy(this.freeDirection);
  return out.addScaledVector(this.normal,this.offset(h,true)).normalize();
 }
 materialCurve(){return new Slice(this,0,this.length/this.getLength());}
}
