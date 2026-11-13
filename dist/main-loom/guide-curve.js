import * as T from 'three';
import{MainLoomZip}from './zip.js?v=20261112-113';
export class GuideCurve extends MainLoomZip{
 constructor(rest,normal,progress,data){super(rest,normal,progress);this.offsetData=data;}
 correction(h,derivative=false,out=new T.Vector3()){
  const d=this.offsetData;if(!d||h<=0||h>=d.knots.at(-1))return out.set(0,0,0);
  let i=d.knots.findIndex(k=>k>h)-1;i=Math.max(0,Math.min(i,d.knots.length-2));
  const u=h-d.knots[i],[a,b,c,e]=d.coefficients[i];
  return out.set(...e.map((v,j)=>derivative?(3*a[j]*u+2*b[j])*u+c[j]:((a[j]*u+b[j])*u+c[j])*u+v));
 }
 getPoint(t,out=new T.Vector3()){super.getPoint(t,out);return out.add(this.correction(T.MathUtils.clamp(t,0,1)*this.domain));}
 getTangent(t,out=new T.Vector3()){
  const h=T.MathUtils.clamp(t,0,1)*this.domain;
  if(h<=this.length)this.rest.jacket.getTangentAt(1-h/this.length,out).negate();else out.copy(this.freeDirection);
  return out.addScaledVector(this.normal,this.offset(h,true)).add(this.correction(h,true)).normalize();
 }
}
