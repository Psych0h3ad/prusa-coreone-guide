import * as T from 'three';
const Z=new T.Vector3(0,0,-1),storageDirection=new T.Vector3(-1,0,-.3),lane=new T.Vector2(119.05060612489574,177.8997221025075);
const nodes=[-.906179845938664,-.538469310105683,0,.538469310105683,.906179845938664],weights=[.236926885056189,.478628670499366,.568888888888889,.478628670499366,.236926885056189];
const binomial={2:[1,2,1],3:[1,3,3,1],4:[1,4,6,4,1],5:[1,5,10,10,5,1],6:[1,6,15,20,15,6,1],7:[1,7,21,35,35,21,7,1]};
for(let n=8;n<=11;n++){binomial[n]=[1];for(let i=1;i<=n;i++)binomial[n][i]=binomial[n][i-1]*(n-i+1)/i;}
class Bezier extends T.Curve{
 constructor(points){super();this.points=points;this.degree=points.length-1;this.arcLengthDivisions=1024;this.derivatives=points.slice(1).map((p,i)=>p.clone().sub(points[i]).multiplyScalar(this.degree));}
 value(points,n,t,out){
  out.set(0,0,0);
  // Stable Bernstein recurrence starts at the nearer endpoint. One power,
  // then a recurrence, instead of two powers for every basis coefficient.
  if(t<=.5){let w=(1-t)**n;const ratio=t/(1-t);for(let i=0;i<=n;i++){out.addScaledVector(points[i],w);w*=ratio*(n-i)/(i+1);}}
  else{let w=t**n;const ratio=(1-t)/t;for(let i=n;i>=0;i--){out.addScaledVector(points[i],w);w*=ratio*i/(n-i+1);}}
  return out;
 }
 getPoint(t,out=new T.Vector3()){return this.value(this.points,this.degree,t,out);}
 derivative(t,out=new T.Vector3()){return this.value(this.derivatives,this.degree-1,t,out);}
 getTangent(t,out=new T.Vector3()){return this.derivative(t,out).normalize();}
 getLength(){
  if(this.exactLength!==undefined)return this.exactLength;
  const d=new T.Vector3();let length=0;
  for(let part=0;part<24;part++)for(let k=0;k<5;k++)length+=weights[k]/48*this.derivative((part+(nodes[k]+1)/2)/24,d).length();
  return this.exactLength=length;
 }
}
function prepare(a,b,from,to){
 const path=new T.CurvePath();path.arcLengthDivisions=1024;
 let start=a.clone(),direction=from.clone(),prefixLength=0,guide;
 if(a.z>-4){
  // Material under the slab is free until its actual endpoint reaches it.
  // Slide the wire inside the unchanged convex oval while it is fed; do
  // not teleport an already-threaded guide into the early under-plate span.
  const q=T.MathUtils.smoothstep((a.z-4)/12,0,1);
  guide=new T.Vector3(T.MathUtils.lerp(a.x,lane.x,q),T.MathUtils.lerp(a.y+(-4-a.z)*from.y/Math.min(-.2,from.z),lane.y,T.MathUtils.smoothstep(a.z/4,0,1)),-4);
  const control=a.distanceTo(guide)/3;
  const prefix=new Bezier([a.clone(),a.clone().addScaledVector(from,control),guide.clone().addScaledVector(Z,-control),guide.clone()]);
  path.add(prefix);prefixLength=prefix.getLength();start=guide;direction=Z.clone();
 }
 return {path,start,direction,prefixLength,guide};
}
function storage(start,end,from,to,bow){
 // The first/last three controls are collinear: both terminal tangents and
 // zero terminal curvature are retained. Store slack laterally in the rear
 // cavity rather than pulling the wire down through its native floor/feet.
 const arm=5;
 return new Bezier([start.clone(),start.clone().addScaledVector(from,arm),start.clone().addScaledVector(from,2*arm),start.clone().addScaledVector(from,3*arm).addScaledVector(storageDirection,bow),end.clone().addScaledVector(to,3*arm).addScaledVector(storageDirection,bow),end.clone().addScaledVector(to,2*arm),end.clone().addScaledVector(to,arm),end.clone()]);
}
export function fe23MinimumLength(a,b,from,to){const p=prepare(a,b,from,to);return p.prefixLength+storage(p.start,b,p.direction,to,.05).getLength();}
export function solveFe23(a,b,from,to,target){
 const p=prepare(a,b,from,to),length=arm=>p.prefixLength+storage(p.start,b,p.direction,to,arm).getLength();
 const minimum=length(.05);if(minimum>target+.0001)throw Error(`FE23 retained material cannot fit tangent route: ${minimum}>${target}`);
 let low=.05,high=32;while(length(high)<target){high*=2;if(high>4096)throw Error('FE23 tangent material solve did not bracket');}
 for(let i=0;i<32;i++){const mid=(low+high)/2;if(length(mid)<target)low=mid;else high=mid;}
 const arm=(low+high)/2,tail=storage(p.start,b,p.direction,to,arm);p.path.add(tail);
 const lengthMM=p.prefixLength+tail.getLength();
 return {curve:p.path,lengthMM,minimumRouteMM:minimum,amount:arm,armMM:5,bowMM:arm,radius:null,guideMM:p.guide?.toArray(),storageKind:'tangent-degree7',prefixLengthMM:p.prefixLength};
}

export {Bezier};
