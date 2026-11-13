import * as T from 'three';
export function pathPoint(path,d,out=new T.Vector3()){const lengths=path.getCurveLengths();let i=0;while(i<lengths.length-1&&d>lengths[i])i++;const start=i?lengths[i-1]:0,u=T.MathUtils.clamp((d-start)/(lengths[i]-start),0,1);return path.curves[i].getPointAt(u,out);}
export function pathTangent(path,d,out=new T.Vector3()){const lengths=path.getCurveLengths();let i=0;while(i<lengths.length-1&&d>lengths[i])i++;const start=i?lengths[i-1]:0,u=T.MathUtils.clamp((d-start)/(lengths[i]-start),0,1);return path.curves[i].getTangentAt(u,out).normalize();}
const nodes=[-.9739065285171717,-.8650633666889845,-.6794095682990244,-.4333953941292472,-.1488743389816312,.1488743389816312,.4333953941292472,.6794095682990244,.8650633666889845,.9739065285171717];
const weights=[.0666713443086881,.1494513491505806,.219086362515982,.2692667193099963,.2955242247147529,.2955242247147529,.2692667193099963,.219086362515982,.1494513491505806,.0666713443086881];
export const derivativeLength=(derivative,parts=8)=>{let n=0;for(let part=0;part<parts;part++)for(let k=0;k<nodes.length;k++){const t=(part+(nodes[k]+1)/2)/parts;n+=weights[k]/(2*parts)*derivative(t).length();}return n;};

export const V=p=>new T.Vector3(...p);
export class ArcPath extends T.CurvePath {
 getPointAt(t,out){return pathPoint(this,t*this.getLength(),out);}
 getTangentAt(t,out){return pathTangent(this,t*this.getLength(),out);}
}
export class Cubic extends T.Curve {
 constructor(points,length,divisions=512){
  super();this.p=points.map(V);this.length=length;this.divisions=divisions;this.arc=[0];let prior=this.derivative(0).length();
  for(let i=1;i<=divisions;i++){const next=this.derivative(i/divisions).length();this.arc.push(this.arc.at(-1)+(prior+next)/(2*divisions));prior=next;}
  const total=this.arc.at(-1);this.arc=this.arc.map(x=>x/total);
 }
 derivative(t){const s=1-t,[a,b,c,d]=this.p;return b.clone().sub(a).multiplyScalar(3*s*s).addScaledVector(c.clone().sub(b),6*s*t).addScaledVector(d.clone().sub(c),3*t*t);}
 parameter(t){if(t<=0||t>=1)return t;let lo=0,hi=this.divisions;while(hi-lo>1){const mid=(lo+hi)>>1;if(this.arc[mid]<t)lo=mid;else hi=mid;}return (lo+(t-this.arc[lo])/(this.arc[hi]-this.arc[lo]))/this.divisions;}
 getPoint(t,out=new T.Vector3()){const u=this.parameter(t),s=1-u,[a,b,c,d]=this.p;return out.set(0,0,0).addScaledVector(a,s**3).addScaledVector(b,3*s*s*u).addScaledVector(c,3*s*u*u).addScaledVector(d,u**3);}
 getTangent(t,out=new T.Vector3()){return out.copy(this.derivative(this.parameter(t))).normalize();}
 getPointAt(t,out){return this.getPoint(t,out);}
 getTangentAt(t,out){return this.getTangent(t,out);}
 getLength(){return this.length;}
 measured(parts=64){return derivativeLength(t=>this.derivative(t),parts);}
}
class DoubleQuarter extends T.Curve {
 constructor(p){super();this.a=V(p.start);this.d=V(p.end);this.h=this.d.clone().sub(this.a);this.h.z=0;this.distance=this.h.length();this.h.normalize();this.r=p.radiusMM;this.arc=this.r*Math.PI/2;this.line=this.distance-2*this.r;this.length=2*this.arc+this.line;}
 frame(t){const s=t*this.length,a=this.a,d=this.d,h=this.h,r=this.r;
  if(s<=this.arc){const q=s/r;return [a.clone().addScaledVector(h,r*(1-Math.cos(q))).add(V([0,0,-r*Math.sin(q)])),h.clone().multiplyScalar(Math.sin(q)).add(V([0,0,-Math.cos(q)]))];}
  if(s<=this.arc+this.line)return [a.clone().addScaledVector(h,r+s-this.arc).add(V([0,0,-r])),h.clone()];
  const q=(this.length-s)/r;return [d.clone().addScaledVector(h,-r*(1-Math.cos(q))).add(V([0,0,r*Math.sin(q)])),h.clone().multiplyScalar(Math.sin(q)).add(V([0,0,-Math.cos(q)]))];
 }
 getPoint(t,out=new T.Vector3()){return out.copy(this.frame(t)[0]);}
 getTangent(t,out=new T.Vector3()){return out.copy(this.frame(t)[1]).normalize();}
 getPointAt(t,out){return this.getPoint(t,out);}
 getTangentAt(t,out){return this.getTangent(t,out);}
 getLength(){return this.length;}
}
export function mainPath(p){const path=new ArcPath(),checks=[];for(const s of p.segments){const c=s.type==='cubic'?new Cubic(s.points,s.lengthMM):new DoubleQuarter(s);path.add(c);checks.push(c.measured?{stored:s.lengthMM,independent64:c.measured(),independent128:c.measured(128)}:{stored:s.lengthMM,analytic:c.getLength()});}return {path,checks};}
export class Spline extends T.Curve {
 constructor(p){
  super();this.q=p.q;this.points=p.points;this.slopes=p.slopes;this.length=p.stockMM;this.samples=Array.from({length:4097},(_,i)=>this.q.at(-1)*i/4096);this.samples=[...new Set([...this.samples,...this.q])].sort((a,b)=>a-b);this.arc=[0];
  let prior=this.evaluate(this.samples[0],true).length();for(let i=1;i<this.samples.length;i++){const next=this.evaluate(this.samples[i],true).length();this.arc.push(this.arc.at(-1)+(prior+next)/2*(this.samples[i]-this.samples[i-1]));prior=next;}const total=this.arc.at(-1);this.arc=this.arc.map(x=>x/total);
 }
 evaluate(s,derivative=false){let i=this.q.findIndex((v,k)=>k&&v>=s)-1;if(i<0)i=this.q.length-2;const h=this.q[i+1]-this.q[i],u=(s-this.q[i])/h,[a,b,c,d]=[this.points[i],this.points[i+1],this.slopes[i],this.slopes[i+1]],f=derivative?[6*u*u-6*u,3*u*u-4*u+1,-6*u*u+6*u,3*u*u-2*u]:[2*u**3-3*u*u+1,u**3-2*u*u+u,-2*u**3+3*u*u,u**3-u*u];return new T.Vector3(...[0,1,2].map(k=>derivative?(f[0]*a[k]+f[2]*b[k])/h+f[1]*c[k]+f[3]*d[k]:f[0]*a[k]+f[1]*h*c[k]+f[2]*b[k]+f[3]*h*d[k]));}
 parameter(t){if(t<=0)return 0;if(t>=1)return this.q.at(-1);let lo=0,hi=this.arc.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(this.arc[m]<t)lo=m;else hi=m;}return T.MathUtils.lerp(this.samples[lo],this.samples[hi],(t-this.arc[lo])/(this.arc[hi]-this.arc[lo]));}
 getPoint(t,out=new T.Vector3()){return out.copy(this.evaluate(this.parameter(t)));}
 getTangent(t,out=new T.Vector3()){return out.copy(this.evaluate(this.parameter(t),true)).normalize();}
 getPointAt(t,out){return this.getPoint(t,out);}
 getTangentAt(t,out){return this.getTangent(t,out);}
 getLength(){return this.length;}
 measured(parts=64){let length=0;for(let i=1;i<this.q.length;i++){const a=this.q[i-1],h=this.q[i]-a;length+=derivativeLength(t=>this.evaluate(a+t*h,true).multiplyScalar(h),parts);}return length;}
}
export class Metres extends T.Curve {
 constructor(mm){super();this.mm=mm;}
 getPoint(t,out=new T.Vector3()){return this.mm.getPointAt(t,out).multiplyScalar(.001);}
 getTangent(t,out){return this.mm.getTangentAt(t,out);}
 getPointAt(t,out){return this.getPoint(t,out);}
 getTangentAt(t,out){return this.getTangent(t,out);}
 getLength(){return this.mm.getLength()*.001;}
}
export function writeRing(g,i,centre,tangent,normal,radius){
 const c=V(centre),t=V(tangent),n=V(normal),b=t.clone().cross(n);
 for(let j=0;j<=8;j++){const a=j/8*Math.PI*2,nn=n.clone().multiplyScalar(-Math.cos(a)).addScaledVector(b,Math.sin(a)),p=c.clone().addScaledVector(nn,radius).multiplyScalar(.001);g.attributes.position.setXYZ(i*9+j,p.x,p.y,p.z);g.attributes.normal.setXYZ(i*9+j,nn.x,nn.y,nn.z);}
}
export class ArcLineArc extends T.Curve {
 constructor(p){super();Object.assign(this,{s:V(p.start),ts:V(p.startTangent),e:V(p.end),te:V(p.endTangent),d:V(p.direction),n0:V(p.normal0),n1:V(p.normal1),r:p.radiusMM,line:p.straightMM,a:p.angles[0],b:p.angles[1],length:p.lengthMM});this.first=this.r*this.a;this.end0=this.s.clone().addScaledVector(this.ts,this.r*Math.sin(this.a)).addScaledVector(this.n0,this.r*(1-Math.cos(this.a)));this.start1=this.end0.clone().addScaledVector(this.d,this.line);}
 frame(t){const s=t*this.length;if(s<=this.first){const a=s/this.r;return [this.s.clone().addScaledVector(this.ts,this.r*Math.sin(a)).addScaledVector(this.n0,this.r*(1-Math.cos(a))),this.ts.clone().multiplyScalar(Math.cos(a)).addScaledVector(this.n0,Math.sin(a))];}if(s<=this.first+this.line)return [this.end0.clone().addScaledVector(this.d,s-this.first),this.d.clone()];const a=(s-this.first-this.line)/this.r;return [this.start1.clone().addScaledVector(this.d,this.r*Math.sin(a)).addScaledVector(this.n1,this.r*(1-Math.cos(a))),this.d.clone().multiplyScalar(Math.cos(a)).addScaledVector(this.n1,Math.sin(a))];}
 getPoint(t,out=new T.Vector3()){return out.copy(this.frame(t)[0]);}
 getTangent(t,out=new T.Vector3()){return out.copy(this.frame(t)[1]).normalize();}
 getPointAt(t,out){return this.getPoint(t,out);}
 getTangentAt(t,out){return this.getTangent(t,out);}
 getLength(){return this.length;}
 measured(){return this.r*(this.a+this.b)+this.line;}
}
