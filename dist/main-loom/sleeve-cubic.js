import * as T from 'three';
export class SleeveCubic extends T.Curve{
 constructor(data){super();this.data=data;this.arcLengthDivisions=4096;}
 interval(t){t=T.MathUtils.clamp(t,0,1);let k=this.data.knots.findIndex(v=>v>t)-1;if(k<0)k=this.data.knots.length-2;return[k,t-this.data.knots[k]];}
 getPoint(t,out=new T.Vector3()){const[k,u]=this.interval(t),[a,b,c,d]=this.data.coefficients[k];return out.set(...d.map((v,j)=>((a[j]*u+b[j])*u+c[j])*u+v));}
 getTangent(t,out=new T.Vector3()){const[k,u]=this.interval(t),[a,b,c]=this.data.coefficients[k];return out.set(...c.map((v,j)=>(3*a[j]*u+2*b[j])*u+v)).normalize();}
}
