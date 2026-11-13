import{Spline,Metres}from'./blue-curve.js';
import{captureTube,writeTube,restoreTube}from'./blue-tube.js';
const mix=(a,b,t)=>a+(b-a)*t;
// Only native end ports and their original directions are hard boundaries.
// Intermediate spline controls are authored routes, not immutable hardware.
export function createBlueRestRoute(entity,source,{x4=-125,y4=185,q3MinY=184,liftMM=8,p6X=-130,incoming}={}){
 const base=captureTube(entity,1000,incoming),target=source.stockMM,cache=new Map();
 function controls(weight,bow){
  const targetY=y4+liftMM*6.75*weight*(1-weight),rest=source.points.map(p=>p.slice());rest[4][0]=x4;rest[4][1]=targetY;
  const s=(rest[3][2]-rest[2][2])/(rest[4][2]-rest[2][2]);rest[3][0]=mix(rest[2][0],x4,s);rest[3][1]=Math.max(q3MinY,mix(rest[2][1],targetY,s));
  const u=Math.max(0,Math.min(1,(weight-.8)/.2)),settle=u*u*u*(10+u*(-15+6*u));
  rest[5][0]=bow;rest[5][1]=targetY+2;rest[6][0]=mix(mix(bow,source.points[7][0],.65),p6X,settle);rest[6][1]=mix(targetY+2,source.points[7][1],.5);
  const slopes=source.slopes.map(v=>v.slice());for(let i=2;i<=6;i++)slopes[i]=rest[i+1].map((v,k)=>(v-rest[i-1][k])/(source.q[i+1]-source.q[i-1]));
  return{...source,points:source.points.map((p,i)=>p.map((v,k)=>mix(v,rest[i][k],weight))),slopes:source.slopes.map((p,i)=>p.map((v,k)=>mix(v,slopes[i][k],weight)))};
 }
 const length=(w,x)=>{const p=controls(w,x),c=Object.assign(Object.create(Spline.prototype),{points:p.points,q:p.q,slopes:p.slopes,length:target});return c.measured(8);};
 return{base,spec:{x4,y4},at(weight){if(!weight)return null;if(cache.has(weight))return cache.get(weight);
  let a=-180,b=-80;for(let k=0;k<55;k++){const l=(2*a+b)/3,r=(a+2*b)/3;if(length(weight,l)<length(weight,r))b=r;else a=l;}const minimum=(a+b)/2,minLength=length(weight,minimum);if(minLength>target+1e-8)throw Error('Port-constrained rest route exceeds stock '+minLength);
  let lo=minimum,hi=-70;if(length(weight,hi)<target)throw Error('Rest route bow bracket below stock');for(let k=0;k<45;k++){const m=(lo+hi)/2;if(length(weight,m)<target)lo=m;else hi=m;}const bow=(lo+hi)/2,mm=new Spline(controls(weight,bow)),r={curve:new Metres(mm),report:{weight,x4,y4,bowXMM:bow,minimumRouteMM:minLength,targetMM:target,measured64MM:mm.measured(64),startPortMM:mm.getPointAt(0).toArray(),endPortMM:mm.getPointAt(1).toArray(),startDirection:mm.getTangentAt(0).toArray(),endDirection:mm.getTangentAt(1).toArray(),retainsOldRest:false}};cache.set(weight,r);while(cache.size>32)cache.delete(cache.keys().next().value);return r;
 },apply(weight=1){if(!weight){restoreTube(base);return{weight:0,comparisonSource:true};}const r=this.at(weight);writeTube(base,r.curve);return r.report;},restoreComparison(){restoreTube(base);}};
}
