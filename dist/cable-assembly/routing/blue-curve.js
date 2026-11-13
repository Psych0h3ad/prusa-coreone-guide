import * as T from 'three';
const nodes=[-.9739065285171717,-.8650633666889845,-.6794095682990244,-.4333953941292472,-.1488743389816312,.1488743389816312,.4333953941292472,.6794095682990244,.8650633666889845,.9739065285171717];
const weights=[.0666713443086881,.1494513491505806,.219086362515982,.2692667193099963,.2955242247147529,.2955242247147529,.2692667193099963,.219086362515982,.1494513491505806,.0666713443086881];
export const derivativeLength=(derivative,parts=8)=>{let n=0;for(let part=0;part<parts;part++)for(let k=0;k<nodes.length;k++){const t=(part+(nodes[k]+1)/2)/parts;n+=weights[k]/(2*parts)*derivative(t).length();}return n;};

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
