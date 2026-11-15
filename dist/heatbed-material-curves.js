import * as T from 'three';
export const V=p=>new T.Vector3(...p),Q=t=>(t=Math.max(0,Math.min(1,t)))*t*t*(10+t*(-15+6*t));
// The table integrates the actual geometric centreline. Stock is not a
// replacement label for a curve of a different length.
export class ArcCurve extends T.Curve{
 constructor(point,count=2048){super();this.point=point;this.arcLengthDivisions=count;this.points=Array.from({length:count+1},(_,i)=>point(i/count));this.lengths=[0];for(let i=1;i<=count;i++)this.lengths.push(this.lengths[i-1]+this.points[i].distanceTo(this.points[i-1]));this.stock=this.lengths.at(-1);}
 getLength(){return this.stock;}
 parameter(t){const d=Math.max(0,Math.min(1,t))*this.stock,L=this.lengths;let a=0,b=L.length-1;while(b-a>1){const m=(a+b)>>1;if(L[m]<d)a=m;else b=m;}return(a+(d-L[a])/(L[b]-L[a]||1))/(L.length-1);}
 getPoint(t,out=new T.Vector3()){return out.copy(this.point(t));}
 getPointAt(t,out){return this.getPoint(this.parameter(t),out);}
 getTangent(t,out=new T.Vector3()){const h=1e-5;return out.copy(this.point(Math.min(1,t+h))).sub(this.point(Math.max(0,t-h))).normalize();}
 getTangentAt(t,out){return this.getTangent(this.parameter(t),out);}
}
export class Joined extends T.Curve{
 constructor(parts){super();this.parts=parts;this.lengths=parts.map(c=>c.getLength());this.stock=this.lengths.reduce((a,b)=>a+b,0);}
 getLength(){return this.stock;}
 select(t){let d=Math.max(0,Math.min(1,t))*this.stock;for(let i=0;i<this.parts.length;i++){if(d<=this.lengths[i]||i===this.parts.length-1)return[this.parts[i],Math.max(0,Math.min(1,d/this.lengths[i]))];d-=this.lengths[i];}}
 getPointAt(t,out){const[c,u]=this.select(t);return c.getPointAt(u,out);}
 getTangentAt(t,out){const[c,u]=this.select(t);return c.getTangentAt(u,out);}
 getPoint(t,out){return this.getPointAt(t,out);}
 getTangent(t,out){return this.getTangentAt(t,out);}
}
export function slice(c,startMM,endMM){const L=c.getLength();return new ArcCurve(t=>c.getPointAt((startMM+(endMM-startMM)*t)/L),Math.max(64,Math.ceil((endMM-startMM)*4)));}
export function cubic(a,ta,b,tb,ha,hb){const c=new T.CubicBezierCurve3(a,a.clone().addScaledVector(ta,ha),b.clone().addScaledVector(tb,-hb),b);c.arcLengthDivisions=2048;return c;}
export function matchBight(base,target,direction){
 const build=a=>new ArcCurve(t=>base.getPointAt(t).addScaledVector(typeof direction==='function'?direction(t):direction,a*Math.sin(Math.PI*t)**2),1024);
 let lo=0,hi=16,c=build(lo);if(c.getLength()>target+.025)throw Error('Material budget shorter than routing span: '+JSON.stringify({target,min:c.getLength()}));
 while(build(hi).getLength()<target&&hi<1024)hi*=2;if(hi>=1024)throw Error('Free bight unavailable');
 for(let i=0;i<27;i++){const m=(lo+hi)/2;if(build(m).getLength()<target)lo=m;else hi=m;}
 c=build((lo+hi)/2);c.bightMM=(lo+hi)/2;return c;
}
export function nearestStation(c,p,lo=0,hi=c.getLength()){let best=lo,d=Infinity;for(let i=0;i<=1024;i++){const s=lo+(hi-lo)*i/1024,x=c.getPointAt(s/c.getLength()).distanceToSquared(p);if(x<d){best=s;d=x;}}let a=Math.max(lo,best-(hi-lo)/1024),b=Math.min(hi,best+(hi-lo)/1024);for(let k=0;k<24;k++){const u=(2*a+b)/3,v=(a+2*b)/3;if(c.getPointAt(u/c.getLength()).distanceToSquared(p)<c.getPointAt(v/c.getLength()).distanceToSquared(p))b=v;else a=u;}return(a+b)/2;}

// Exact material-length bight with tangent-continuous circular bends.
// For a short span the three arcs flatten continuously toward a straight.
// Extra stock extends two parallel legs; bend radii never tighten below d/4.
export function roundedMaterialBight(base,target,up){
 const start=base.getPointAt(0),end=base.getPointAt(1),d=start.distanceTo(end),forward=end.clone().sub(start).normalize(),normal=up.clone().addScaledVector(forward,-up.dot(forward)).normalize();
 if(target<d-1e-8)throw Error('Rounded bight material budget shorter than endpoint span');
 let angle,radius,leg;if(target<=d*Math.PI/2){let lo=0,hi=Math.PI/2;for(let i=0;i<48;i++){const m=(lo+hi)/2,length=m<1e-10?d:d*m/Math.sin(m);if(length<target)lo=m;else hi=m;}angle=(lo+hi)/2;radius=d/(4*Math.sin(angle));leg=0;}else{angle=Math.PI/2;radius=d/4;leg=(target-2*Math.PI*radius)/2;}
 const A=radius*angle,B=leg,C=2*A,sn=Math.sin(angle),co=Math.cos(angle);
 function point(t){let s=Math.max(0,Math.min(1,t))*target,f=0,y=0;
  if(s<=A){const a=s/radius;return[start.clone().addScaledVector(forward,radius*Math.sin(a)).addScaledVector(normal,radius*(1-Math.cos(a))),a];}s-=A;f=radius*sn;y=radius*(1-co);
  if(s<=B)return[start.clone().addScaledVector(forward,f+s*co).addScaledVector(normal,y+s*sn),angle];s-=B;f+=B*co;y+=B*sn;
  if(s<=C){const a=angle-s/radius;return[start.clone().addScaledVector(forward,f+radius*(sn-Math.sin(a))).addScaledVector(normal,y+radius*(Math.cos(a)-co)),a];}s-=C;f+=2*radius*sn;
  if(s<=B)return[start.clone().addScaledVector(forward,f+s*co).addScaledVector(normal,y-s*sn),-angle];s-=B;f+=B*co;y-=B*sn;
  const a=-angle+s/radius;return[start.clone().addScaledVector(forward,f+radius*(Math.sin(a)+sn)).addScaledVector(normal,y+radius*(co-Math.cos(a))),a];
 }
 class RoundedBight extends T.Curve{getLength(){return target;}getPointAt(t,out=new T.Vector3()){return out.copy(point(t)[0]);}getPoint(t,out){return this.getPointAt(t,out);}getTangentAt(t,out=new T.Vector3()){const a=point(t)[1];return out.copy(forward).multiplyScalar(Math.cos(a)).addScaledVector(normal,Math.sin(a));}getTangent(t,out){return this.getTangentAt(t,out);}}
 const curve=new RoundedBight();curve.bightMM=2*radius*(1-co)+leg*sn;curve.materialSpansMM=[A,B,C,B,A];curve.minimumBendRadiusMM=radius;return curve;
}
