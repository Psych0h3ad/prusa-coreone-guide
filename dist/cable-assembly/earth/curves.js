import * as T from 'three';
export const V=p=>new T.Vector3(...p);
const nodes=[-.906179845938664,-.538469310105683,0,.538469310105683,.906179845938664],weights=[.236926885056189,.478628670499366,.568888888888889,.478628670499366,.236926885056189];
export function lengthOf(derivative,parts=32){let length=0;for(let i=0;i<parts;i++)for(let k=0;k<5;k++)length+=weights[k]/(2*parts)*derivative((i+(nodes[k]+1)/2)/parts).length();return length;}
export function cubic(a,b,c,d){const p=new T.CubicBezierCurve3(a,b,c,d);p.arcLengthDivisions=8192;p.derivative=(t,out=new T.Vector3())=>out.subVectors(b,a).multiplyScalar(3*(1-t)**2).addScaledVector(c.clone().sub(b),6*(1-t)*t).addScaledVector(d.clone().sub(c),3*t*t);p.getTangent=(t,out)=>p.derivative(t,out).normalize();const mm=lengthOf(p.derivative);p.getLength=()=>mm;return p;}
export class Arc extends T.Curve{
 constructor(centre,u,v,radius,angle){super();Object.assign(this,{centre,u,v,radius,angle});}
 getPoint(t,out=new T.Vector3()){const a=t*this.angle;return out.copy(this.centre).addScaledVector(this.u,this.radius*Math.cos(a)).addScaledVector(this.v,this.radius*Math.sin(a));}
 getTangent(t,out=new T.Vector3()){const a=t*this.angle;return out.copy(this.u).multiplyScalar(-Math.sin(a)).addScaledVector(this.v,Math.cos(a));}
 getPointAt(t,out){return this.getPoint(t,out);}getTangentAt(t,out){return this.getTangent(t,out);}getLength(){return this.radius*this.angle;}
}
export function path(children){const p=new T.CurvePath();for(const c of children)if(c.getLength()>1e-9)p.add(c);p.getPointAt=(t,out)=>p.getPoint(t,out);p.getTangent=(t,out=new T.Vector3())=>{const lengths=p.getCurveLengths(),s=t*lengths.at(-1);let i=lengths.findIndex(l=>s<=l);if(i<0)i=lengths.length-1;const start=i?lengths[i-1]:0;return p.curves[i].getTangentAt(T.MathUtils.clamp((s-start)/(lengths[i]-start),0,1),out).normalize();};p.getTangentAt=(t,out)=>p.getTangent(t,out);return p;}
export function restore(s){
 if(s.curves)return path(s.curves.map(restore));
 if(s.type==='LineCurve3')return new T.LineCurve3(V(s.v1),V(s.v2));
 if(s.type==='CubicBezierCurve3')return cubic(...['v0','v1','v2','v3'].map(k=>V(s[k])));
 if(s.type==='QuadraticBezierCurve3'){const p=new T.QuadraticBezierCurve3(V(s.v0),V(s.v1),V(s.v2));p.arcLengthDivisions=8192;const derivative=t=>p.v1.clone().sub(p.v0).multiplyScalar(2*(1-t)).addScaledVector(p.v2.clone().sub(p.v1),2*t);const mm=lengthOf(derivative);p.getLength=()=>mm;return p;}
 if(s.centre)return new Arc(V(s.centre),V(s.u),V(s.v),s.radius,s.angle);
 if(s.points){const points=s.points.map(V),p=new T.Curve();p.arcLengthDivisions=8192;p.getPoint=(t,out=new T.Vector3())=>{const q=points.map(p=>p.clone());for(let n=q.length-1;n>0;n--)for(let i=0;i<n;i++)q[i].lerp(q[i+1],t);return out.copy(q[0]);};p.derivative=t=>{const q=points.slice(1).map((p,i)=>p.clone().sub(points[i]).multiplyScalar(points.length-1));for(let n=q.length-1;n>0;n--)for(let i=0;i<n;i++)q[i].lerp(q[i+1],t);return q[0];};p.getTangent=(t,out=new T.Vector3())=>out.copy(p.derivative(t)).normalize();const mm=lengthOf(p.derivative);p.getLength=()=>mm;return p;}
 throw Error('Unknown retained FE45 primitive');
}
export class Section extends T.Curve{constructor(source,a,b){super();Object.assign(this,{source,a,b});}getPoint(t,out){return this.source.getPointAt(T.MathUtils.lerp(this.a,this.b,t),out);}getPointAt(t,out){return this.getPoint(t,out);}getTangent(t,out){return this.source.getTangentAt(T.MathUtils.lerp(this.a,this.b,t),out);}getTangentAt(t,out){return this.getTangent(t,out);}getLength(){return(this.b-this.a)*this.source.getLength();}}
export function join(a,ta,b,tb,handle){const h=handle??Math.max(3,Math.min(15,a.distanceTo(b)/3));return cubic(a.clone(),a.clone().addScaledVector(ta,h),b.clone().addScaledVector(tb,-h),b.clone());}
export class Helix extends T.Curve{
 constructor(theta,origin,axis){super();this.theta=theta;this.origin=origin;this.W=axis.clone();this.U=V([1,0,0]).addScaledVector(axis,-axis.x).normalize();this.N=new T.Vector3().crossVectors(this.W,this.U).normalize();this.pitch=10*theta/(Math.PI*2);this.arcLengthDivisions=8192;this.mm=lengthOf(t=>this.derivative(t));}
 getPoint(t,out=new T.Vector3()){const a=t*this.theta;return out.copy(this.origin).addScaledVector(this.U,48*(1-Math.cos(a))).addScaledVector(this.W,50*Math.sin(a)).addScaledVector(this.N,this.pitch*t*t*(3-2*t));}
 derivative(t,out=new T.Vector3()){const a=t*this.theta;return out.copy(this.U).multiplyScalar(48*this.theta*Math.sin(a)).addScaledVector(this.W,50*this.theta*Math.cos(a)).addScaledVector(this.N,this.pitch*6*t*(1-t));}
 getTangent(t,out=new T.Vector3()){return this.theta<1e-10?out.copy(this.W):this.derivative(t,out).normalize();}
 getLength(){return this.mm;}
}
