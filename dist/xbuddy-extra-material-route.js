import * as T from 'three';
const V=p=>new T.Vector3(...p),N=4096,INWARD_BANK_MM=20;
class Joined extends T.Curve{
 constructor(parts){super();this.parts=parts;this.lengths=parts.map(p=>p.getLength());this.stock=this.lengths.reduce((s,l)=>s+l,0);}
 locate(t){let s=T.MathUtils.clamp(t,0,1)*this.stock;for(let i=0;i<this.parts.length;i++){if(s<=this.lengths[i]||i===this.parts.length-1)return[i,T.MathUtils.clamp(s/this.lengths[i],0,1)];s-=this.lengths[i];}}
 getPoint(t,o=new T.Vector3()){const[i,u]=this.locate(t);return this.parts[i].getPointAt(u,o);}getTangent(t,o=new T.Vector3()){const[i,u]=this.locate(t);return this.parts[i].getTangentAt(u,o);}getPointAt(t,o){return this.getPoint(t,o);}getTangentAt(t,o){return this.getTangent(t,o);}getLength(){return this.stock;}
}
class Arc extends T.Curve{
 constructor(p,t,n,r,a){super();Object.assign(this,{p,t,n,r,a});}
 getPoint(u,o=new T.Vector3()){const a=u*this.a;return o.copy(this.p).addScaledVector(this.t,this.r*Math.sin(a)).addScaledVector(this.n,this.r*(1-Math.cos(a)));}getTangent(u,o=new T.Vector3()){const a=u*this.a;return o.copy(this.t).multiplyScalar(Math.cos(a)).addScaledVector(this.n,Math.sin(a));}getPointAt(t,o){return this.getPoint(t,o);}getTangentAt(t,o){return this.getTangent(t,o);}getLength(){return this.r*this.a;}
}
class ReverseArc extends T.Curve{constructor(arc){super();this.arc=arc;}getPoint(t,o=new T.Vector3()){return this.arc.getPointAt(1-t,o);}getTangent(t,o=new T.Vector3()){return this.arc.getTangentAt(1-t,o).negate();}getPointAt(t,o){return this.getPoint(t,o);}getTangentAt(t,o){return this.getTangent(t,o);}getLength(){return this.arc.getLength();}}
function tangentArc(p,t,q){const v=q.clone().sub(p),along=v.dot(t),n=v.clone().addScaledVector(t,-along),L=n.length();if(L<1e-10)throw Error('Extra tail degenerate arc');n.divideScalar(L);return new Arc(p,t,n,v.lengthSq()/(2*L),2*Math.atan2(L,along));}
function tailFrom(p,end,endT){const t=V([0,0,1]),v=end.clone().sub(p),A=1-t.dot(endT),b=v.dot(t)+v.dot(endT),radical=Math.sqrt(b*b+2*A*v.lengthSq()),d=b>=0?v.lengthSq()/(radical+b):(-b+radical)/(2*A),join=p.clone().add(end).addScaledVector(t,d).addScaledVector(endT,-d).multiplyScalar(.5),a=tangentArc(p,t,join),bArc=tangentArc(end,endT.clone().negate(),join),out=new Joined([a,new ReverseArc(bArc)]);out.radii=[a.r,bArc.r];return out;}
function rearFor(y){if(y<=181)return y;if(y>=185)return 183;const t=(y-181)/4;return 181+4*(t-t**3+.5*t**4);}
const metricCache=new Map();
function prefixData(fixed){const key=fixed.join(':');if(metricCache.has(key))return metricCache.get(key);const x=new Float64Array(N+1),y=x.slice(),z=x.slice(),w=x.slice();for(let i=0;i<=N;i++){const t=i/N,u=1-t;x[i]=fixed[0]*(u**3+3*u*u*t)-124*(3*u*t*t+t**3)-INWARD_BANK_MM*16*t*t*u*u;y[i]=fixed[1]*u**3+(fixed[1]+10)*3*u*u*t;z[i]=fixed[2]*(u**3+3*u*u*t)+56*3*u*t*t+32*t**3;w[i]=3*u*t*t+t**3;}const metric=f=>{let length=0,derivative=0;for(let i=1;i<=N;i++){const dx=x[i]-x[i-1],dy=y[i]-y[i-1]+f*(w[i]-w[i-1]),dz=z[i]-z[i-1],d=Math.hypot(dx,dy,dz);length+=d;derivative+=dy*(w[i]-w[i-1])/d;}return{length,derivative};};const out={metric};metricCache.set(key,out);return out;}
export class ExtensionUCurve extends Joined{
 constructor({fixed,port,stock,amount,lift=0}){
  const endT=V([-.5,0,Math.sqrt(3)/2]),guide=4,end=port.clone().addScaledVector(endT,-guide),returnX=-107,low=11+3.5*lift/14,rearY=rearFor(port.y);
  const build=front=>{const start=V([-124,front,32]),prefix=new T.CubicBezierCurve3(V(fixed),V(fixed).add(V([0,10,0])),V([-124,front,56]),start);prefix.arcLengthDivisions=N;const cubicPoint=prefix.getPoint.bind(prefix);prefix.getPoint=(t,o=new T.Vector3())=>{cubicPoint(t,o);o.x-=INWARD_BANK_MM*16*t*t*(1-t)*(1-t);return o;};prefix.getTangent=(t,o=new T.Vector3())=>{const u=1-t;o.copy(prefix.v1).sub(prefix.v0).multiplyScalar(3*u*u).addScaledVector(prefix.v2.clone().sub(prefix.v1),6*u*t).addScaledVector(prefix.v3.clone().sub(prefix.v2),3*t*t);o.x-=INWARD_BANK_MM*32*t*u*(1-2*t);return o.normalize();};
   const p=V([-124,front,low+8]),a=new Arc(p,V([0,0,-1]),V([1,0,0]),8,Math.PI/2),east=V([returnX-8,front,low]),b=new Arc(east,V([1,0,0]),V([0,-1,0]),8,Math.PI/2),rear=V([returnX,rearY+4,low]),c=new Arc(rear,V([0,-1,0]),V([0,0,1]),4,Math.PI/2),tail=tailFrom(c.getPointAt(1),end,endT);
   if(start.z<p.z||east.x<a.getPointAt(1).x||b.getPointAt(1).y<rear.y)throw Error('Extra U bank has reversed straight; no stock/face waiver');
   if(tail.getPointAt(1).distanceTo(end)>1e-8||tail.getTangentAt(1).angleTo(endT)>1e-6)throw Error('Extra U return end-frame mismatch');
   const bank=new Joined([new T.LineCurve3(start,p),a,new T.LineCurve3(a.getPointAt(1),east),b,new T.LineCurve3(b.getPointAt(1),rear),c,tail]);bank.radii=[8,8,4,...tail.radii];return{prefix,bank,straight:new T.LineCurve3(end,port)};};
  const data=prefixData(fixed),minimum=Math.max(190.2,rearY+12),base=build(minimum),constant=base.bank.getLength()-minimum,measure=f=>{const p=data.metric(f);return{length:p.length+constant+f+guide,derivative:p.derivative+1};};
  let lo=minimum,hi=260,m=measure(lo);if(m.length>stock+2e-8)throw Error('Extra U stock unavailable '+JSON.stringify({stock,minimum:m.length,front:lo,port:port.toArray()}));
  let front=lo+(stock-m.length)/m.derivative,closed=false;for(let i=0;i<12;i++){m=measure(front);const error=m.length-stock;if(Math.abs(error)<2e-8){closed=true;break;}if(error>0)hi=front;else lo=front;const n=front-error/m.derivative;front=Number.isFinite(n)&&n>lo&&n<hi?n:(lo+hi)/2;}if(!closed)throw Error('Extra U material closure failed');
  const f=build(front);super([f.prefix,f.bank,f.straight]);if(Math.abs(this.stock-stock)>2e-8)throw Error('Extra U measured material mismatch');this.id='xbExtensionRed';this.amount=amount;this.branch=f.bank;this.guideStraightMM=guide;this.materialStockMM=stock;this.tailBightMM=front;this.frontPlaneMM=front;this.minimumRadiusMM=Math.min(...f.bank.radii);
 }
}
