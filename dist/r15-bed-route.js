import * as T from 'three';
import {CLAMP_SECTIONS} from './r15-clamp-sections.js';
const V=a=>new T.Vector3(...a),Q=t=>(t=T.MathUtils.clamp(t,0,1))*t*t*(10+t*(-15+6*t));
export const BED_DATUM={referenceCrimpZMM:205.2,referenceWasherZMM:204.99941576663,
 sleeveStockMM:520,sleeveRadiusMM:4,sleeveBackProjectionMM:8,
 grommetMM:[103.00061307,157.5,270.54599205],
 roles:{xbBedMinus:{fixedXY:[-120,112],port:[-76.43245676132837,177.35172,77.60376870490178],side:-1,color:'#242526'},
 xbBedPlus:{fixedXY:[-109.83699466835,112],port:[-86.92020122337449,177.35172,77.60376870490178],side:1,color:'#c82e26'}},
 wireRadiusMM:1.65,notes:'520x8 textile sleeve and <=10mm rear projection are official988128/988592. Individual neutral lengths are authored from a reference rest, not OEM cable cut lengths. Electrical datums are the shared644 calibrated references.'};
const spline=points=>{const c=new T.CatmullRomCurve3(points.map(p=>p.isVector3?p:V(p)),false,'centripetal');c.arcLengthDivisions=4096;return c;};
class Joined extends T.Curve{
 constructor(parts){super();this.parts=parts;this.lengths=parts.map(p=>p.getLength());this.stock=this.lengths.reduce((a,b)=>a+b,0);}
 locate(t){let s=T.MathUtils.clamp(t,0,1)*this.stock;for(let i=0;i<this.parts.length;i++){if(s<=this.lengths[i]||i===this.parts.length-1)return[i,T.MathUtils.clamp(s/this.lengths[i],0,1)];s-=this.lengths[i];}}
 getPoint(t,out=new T.Vector3()){const[i,u]=this.locate(t);return this.parts[i].getPointAt(u,out);}
 getTangent(t,out=new T.Vector3()){const[i,u]=this.locate(t);return this.parts[i].getTangentAt(u,out);}
 getPointAt(t,out){return this.getPoint(t,out);}getTangentAt(t,out){return this.getTangent(t,out);}getLength(){return this.stock;}
}
class GrommetArc extends T.Curve{
 getPoint(t,out=new T.Vector3()){const a=-Math.PI/2+t*Math.PI/2;return out.set(91.00061307+12*Math.cos(a),157+12*Math.sin(a),270.54599205);}
 getTangent(t,out=new T.Vector3()){const a=-Math.PI/2+t*Math.PI/2;return out.set(-Math.sin(a),Math.cos(a),0);}
 getPointAt(t,out){return this.getPoint(t,out);}getTangentAt(t,out){return this.getTangent(t,out);}getLength(){return 6*Math.PI;}
}
function sleeveForBed(z){
 const dz=z-205.2,clampPoints=CLAMP_SECTIONS.map(p=>[p.x,p.centreYZ[0],p.centreYZ[1]+dz]),last=clampPoints.at(-1),start=V(clampPoints[0]),mouth=V([-94,last[1],last[2]]);
 const entry=spline([...clampPoints,mouth]);
 const tangent=entry.getTangentAt(1),down=V([0,0,-1]),angle=tangent.angleTo(down),bendNormal=down.clone().addScaledVector(tangent,-Math.cos(angle)).normalize();
 class ExitBend extends T.Curve{getPoint(t,out=new T.Vector3()){const a=t*angle;return out.copy(mouth).addScaledVector(tangent,10*Math.sin(a)).addScaledVector(bendNormal,10*(1-Math.cos(a)));}getTangent(t,out=new T.Vector3()){const a=t*angle;return out.copy(tangent).multiplyScalar(Math.cos(a)).addScaledVector(bendNormal,Math.sin(a));}getPointAt(t,out){return this.getPoint(t,out);}getTangentAt(t,out){return this.getTangent(t,out);}getLength(){return 10*angle;}}
 const bend=new ExitBend(),E=bend.getPoint(1),spread=Q((z-78.53667713726469)/126.66332286273531),left=-108-24*spread;
 class LowerArc extends T.Curve{constructor(start){super();this.start=start;}getPoint(t,out=new T.Vector3()){const a=t*Math.PI/2;return out.copy(this.start).add(V([12*(1-Math.cos(a)),0,-12*Math.sin(a)]));}getTangent(t,out=new T.Vector3()){const a=t*Math.PI/2;return out.set(Math.sin(a),0,-Math.cos(a));}getPointAt(t,out){return this.getPoint(t,out);}getTangentAt(t,out){return this.getTangent(t,out);}getLength(){return 6*Math.PI;}}
 const build=low=>{const L=V([left,148,low+12]),h=Math.max(.1,Math.min(22,(E.z-L.z)*.45)),desc=new T.CubicBezierCurve3(E,E.clone().add(V([0,0,-h])),L.clone().add(V([0,0,h])),L),arc=new LowerArc(L),bottom=arc.getPoint(1),R=V([25,148,low]),A=V([91.00061307,145,270.54599205]),up=new T.CubicBezierCurve3(R,R.clone().add(V([40,0,0])),A.clone().add(V([-30,0,0])),A);desc.arcLengthDivisions=2048;up.arcLengthDivisions=2048;return new Joined([desc,arc,new T.LineCurve3(bottom,R),up]);};
 const arc=new GrommetArc(),exit=new T.LineCurve3(V([103.00061307,157,270.54599205]),V([103.00061307,165.5,270.54599205])),target=520-entry.getLength()-bend.getLength()-arc.getLength()-exit.getLength();let lo=-30,hi=Math.min(E.z-13,220),bank;
 const llo=build(lo).getLength(),lhi=build(hi).getLength();if(!(llo>=target&&lhi<=target))throw Error('520 sleeve round-bank unavailable '+JSON.stringify({z,target,llo,lhi}));
 for(let i=0;i<34;i++){const m=(lo+hi)/2;if(build(m).getLength()>target)lo=m;else hi=m;}const low=(lo+hi)/2;bank=build(low);
 const c=new Joined([entry,bend,bank,arc,exit]);c.lowBankZMM=low;c.coverExitMM=mouth.toArray();c.clampCrimpZMM=z;c.clampExitMaterialMM=entry.getLength();return c;
}
const referenceExternal=spline([[103.00061307,165.5,270.54599205],[103.00061307,172,270.54599205],[85,177,277],[40,177,279],[-25,177,279],[-55,177.5997,277],[-68.2994,177.5997,266],[-68.2994,177.5997,252],[-68.2994,177.5997,235],[-68,183,205],[-68,187,180],[-68,187,165]]);
class RearExitArc extends T.Curve{
 getPoint(t,out=new T.Vector3()){const a=t*Math.PI/2;return out.set(91.00061307+12*Math.cos(a),165.5+12*Math.sin(a),270.54599205);}
 getTangent(t,out=new T.Vector3()){const a=t*Math.PI/2;return out.set(-Math.sin(a),Math.cos(a),0);}
 getPointAt(t,out){return this.getPoint(t,out);}getTangentAt(t,out){return this.getTangent(t,out);}getLength(){return 6*Math.PI;}
}
const cubic=points=>{const c=new T.CubicBezierCurve3(...points.map(V));c.arcLengthDivisions=4096;return c;};
const external=new Joined([new RearExitArc(),
 cubic([[91.00061307,177.5,270.54599205],[78,177.5,270.54599205],[78,164,268],[64,164,268]]),
 new T.LineCurve3(V([64,164,268]),V([-38,164,268])),
 cubic([[-38,164,268],[-62,164,268],[-68.2994,184,270],[-68.2994,184,252]]),
 new T.LineCurve3(V([-68.2994,184,252]),V([-68.2994,184,235])),
 cubic([[-68.2994,184,235],[-68.2994,184,221],[-68,187,219],[-68,187,205]]),
 new T.LineCurve3(V([-68,187,205]),V([-68,187,165]))]);
function coupledFixed(sleeve,externalCurve=external){
 const common=new Joined([sleeve,externalCurve]),N=2048,frames=[],tangents=[];let prior=common.getTangentAt(0),normal=V([0,-1,0]);
 for(let i=0;i<=N;i++){const tangent=common.getTangentAt(i/N);if(i)normal.applyQuaternion(new T.Quaternion().setFromUnitVectors(prior,tangent));normal.addScaledVector(tangent,-normal.dot(tangent)).normalize();frames.push(normal.clone());tangents.push(tangent);prior=tangent;}
 const desired=V([-1,0,0]),roll=Math.atan2(frames[N].clone().cross(desired).dot(tangents[N]),frames[N].dot(desired));
 class Offset extends T.Curve{
  constructor(side){super();this.side=side;this.arcLengthDivisions=4096;}
  getPoint(t,out=new T.Vector3()){const x=T.MathUtils.clamp(t,0,1)*N,i=Math.min(N-1,Math.floor(x)),tangent=common.getTangentAt(t),n=frames[i].clone().lerp(frames[i+1],x-i).normalize();n.applyAxisAngle(tangent,roll*Q((common.stock*t-60)/(common.stock-80)));return common.getPointAt(t,out).addScaledVector(n,this.side*1.75);}
 }
 return {common,offset:side=>new Offset(side)};
}
class Tail extends T.Curve{
 constructor(start,end){super();this.start=start;this.p1=start.clone().add(V([0,0,-22]));this.p2=end.clone().add(V([0,0,25]));this.end=end;this.a=25;this.arcLengthDivisions=2048;}
 getPoint(t,out=new T.Vector3()){const u=1-t;return out.copy(this.start).multiplyScalar(u*u*u).addScaledVector(this.p1,3*u*u*t).addScaledVector(this.p2,3*u*t*t).addScaledVector(this.end,t*t*t).addScaledVector(V([-1,0,0]),this.a*Math.sin(Math.PI*t)**2).addScaledVector(V([0,1,0]),(this.bankY??0)*Math.sin(Math.PI*t)**2);}
 getTangent(t,out=new T.Vector3()){const u=1-t;return out.copy(this.p1).sub(this.start).multiplyScalar(3*u*u).addScaledVector(this.p2.clone().sub(this.p1),6*u*t).addScaledVector(this.end.clone().sub(this.p2),3*t*t).addScaledVector(V([-1,0,0]),this.a*Math.PI*Math.sin(2*Math.PI*t)).addScaledVector(V([0,1,0]),(this.bankY??0)*Math.PI*Math.sin(2*Math.PI*t)).normalize();}
}
function prefixPair(z,coupled){
 const dz=z-205.2,start=V([-114.918497334175,112,z]),lead=new T.LineCurve3(start,start.clone().add(V([0,4,0]))),end=coupled.common.getPointAt(0),endT=coupled.common.getTangentAt(0),points=[lead.getPoint(1),V([-114.532696251107,119.921554268057,204.813160522185]).add(V([0,0,dz])),V([-115.329210090837,127.050744192318,202.887263376]).add(V([0,0,dz])),V([-114.191896624146,134.830328888938,202.378280102973]).add(V([0,0,dz])),end],tangents=points.map((p,i)=>i===0?V([0,1,0]):i===points.length-1?endT:points[i+1].clone().sub(points[i-1]).normalize()),parts=[lead];
 for(let i=0;i<points.length-1;i++){const h=points[i].distanceTo(points[i+1])/3;parts.push(new T.CubicBezierCurve3(points[i],points[i].clone().addScaledVector(tangents[i],h),points[i+1].clone().addScaledVector(tangents[i+1],-h),points[i+1]));}
 const centre=new Joined(parts),N=512,frames=[];let previous=centre.getTangentAt(0),normal=V([1,0,0]);for(let i=0;i<=N;i++){const tangent=centre.getTangentAt(i/N);if(i)normal.applyQuaternion(new T.Quaternion().setFromUnitVectors(previous,tangent));normal.addScaledVector(tangent,-normal.dot(tangent)).normalize();frames.push(normal.clone());previous=tangent;}
 const desired=coupled.offset(1).getPoint(0).sub(end).normalize(),roll=Math.atan2(frames[N].clone().cross(desired).dot(endT),frames[N].dot(desired));
 class Fan extends T.Curve{constructor(side){super();this.side=side;this.arcLengthDivisions=2048;}getPoint(t,out=new T.Vector3()){const x=t*N,i=Math.min(N-1,Math.floor(x)),T=centre.getTangentAt(t),s=t*centre.getLength(),n=frames[i].clone().lerp(frames[i+1],x-i).normalize().applyAxisAngle(T,roll*Q((s-4)/(centre.getLength()-4))),half=5.081502665825+(1.75-5.081502665825)*Q((s-4)/20);return centre.getPointAt(t,out).addScaledVector(n,this.side*half);}}
 return side=>new Fan(side);
}
function prepareFixed(z,coupled){return Object.fromEntries(Object.entries(BED_DATUM.roles).map(([id,r])=>[id,{prefix:coupled.prefix(r.side),offset:coupled.offset(r.side)}]));}
function tailPair(coupled,amounts,A=25,B=2,bankY=6){
 const start=coupled.common.getPointAt(1),em=V(BED_DATUM.roles.xbBedMinus.port).add(V([0,18*(1-amounts.xbBedMinus),12])),ep=V(BED_DATUM.roles.xbBedPlus.port).add(V([0,18*(1-amounts.xbBedPlus),12])),end=em.clone().add(ep).multiplyScalar(.5),centre=new Tail(start,end);centre.a=A;centre.bankY=bankY;
 const N=256,frames=[];let prev=centre.getTangent(0),normal=V([-1,0,0]);for(let i=0;i<=N;i++){const tangent=centre.getTangent(i/N);if(i)normal.applyQuaternion(new T.Quaternion().setFromUnitVectors(prev,tangent));normal.addScaledVector(tangent,-normal.dot(tangent)).normalize();frames.push(normal.clone());prev=tangent;}
 const desired=ep.clone().sub(em).normalize(),roll=Math.atan2(frames[N].clone().cross(desired).dot(prev),frames[N].dot(desired)),lastHalf=em.distanceTo(ep)/2;
 class StrandTail extends T.Curve{constructor(side){super();this.side=side;this.arcLengthDivisions=2048;}getPoint(t,out=new T.Vector3()){const x=t*N,i=Math.min(N-1,Math.floor(x)),tan=centre.getTangent(t),n=frames[i].clone().lerp(frames[i+1],x-i).normalize().applyAxisAngle(tan,roll*Q(t)),half=1.75+(lastHalf-1.75)*Q(t)+B*45.5625*t*t*(1-t)**4;return centre.getPoint(t,out).addScaledVector(n,this.side*half);}}
 return{xbBedMinus:new StrandTail(-1),xbBedPlus:new StrandTail(1),end:{xbBedMinus:em,xbBedPlus:ep},A,B};
}
const restSleeve=sleeveForBed(205.2),restCoupled=coupledFixed(restSleeve,referenceExternal);restCoupled.prefix=prefixPair(205.2,restCoupled);const restFixed=prepareFixed(205.2,restCoupled),restTails=tailPair(restCoupled,{xbBedMinus:1,xbBedPlus:1},25,2,0);
export const AUTHORED_WIRE_STOCKS=Object.fromEntries(Object.keys(BED_DATUM.roles).map(id=>[id,restFixed[id].prefix.getLength()+restFixed[id].offset.getLength()+restTails[id].getLength()+12]));
export function createBedRouteFamily({crimpZMM=205.2,bedPortAmount=1,bedPortAmounts={}}={}){
 if(!Number.isFinite(crimpZMM)||!Number.isFinite(bedPortAmount)||bedPortAmount<0||bedPortAmount>1)throw Error('Invalid actual bed source state');
 const sleeve=sleeveForBed(crimpZMM),coupled=coupledFixed(sleeve),wires=new Map();coupled.prefix=prefixPair(crimpZMM,coupled);const fixed=prepareFixed(crimpZMM,coupled),amounts=Object.fromEntries(Object.keys(BED_DATUM.roles).map(id=>[id,bedPortAmounts[id]??bedPortAmount]));for(const a of Object.values(amounts))if(!Number.isFinite(a)||a<0||a>1)throw Error('Invalid individual bed electrical amount');
 const ids=['xbBedMinus','xbBedPlus'],target=ids.map(id=>AUTHORED_WIRE_STOCKS[id]-fixed[id].prefix.getLength()-fixed[id].offset.getLength()-12),measure=(a,b)=>{const pair=tailPair(coupled,amounts,a,b);return{pair,L:ids.map(id=>pair[id].getLength())};};let a=25,b=2,closed=false,current;
 for(let k=0;k<10;k++){current=measure(a,b);const e=current.L.map((v,i)=>v-target[i]);if(Math.max(...e.map(Math.abs))<.00001){closed=true;break;}const da=measure(a+.02,b).L,db=measure(a,b+.02).L,J=da.map((v,i)=>[(v-current.L[i])/.02,(db[i]-current.L[i])/.02]),det=J[0][0]*J[1][1]-J[0][1]*J[1][0];if(Math.abs(det)<1e-7)throw Error('Coupled tail material Jacobian singular');const dA=(e[0]*J[1][1]-e[1]*J[0][1])/det,dB=(J[0][0]*e[1]-J[1][0]*e[0])/det;a-=dA;b-=dB;if(!Number.isFinite(a)||!Number.isFinite(b)||a<0||a>65||b<-20||b>20)throw Error('Coupled tail material unavailable '+JSON.stringify({crimpZMM,amounts,a,b}));}
 if(!closed)throw Error('Coupled tail material closure did not converge '+JSON.stringify({crimpZMM,amounts,a,b,lengths:current.L,target}));
 for(const id of ids){const p=fixed[id],end=current.pair.end[id],last=new T.LineCurve3(end,end.clone().add(V([0,0,-12]))),wire=new Joined([p.prefix,p.offset,current.pair[id],last]);wire.tailBightMM=a;wire.tailFanMM=b;wires.set(id,wire);}
 return{crimpZMM,bedPortAmount,sleeve,wires,authoredStocks:AUTHORED_WIRE_STOCKS};
}
