import * as T from 'three';
import {BedMaterialCurve} from './xbuddy-bed-material-route.js';
const V=p=>new T.Vector3(...p),Q=x=>{x=T.MathUtils.clamp(x,0,1);return x*x*x*(10+x*(-15+6*x));};
export const FAMILY_ROLES={
 xbBedMinus:{terminal:38,color:'#242526',mount:[-76.43245676132837,174.55172,65.10376870490178],fixed:[-120,112,205.2],radius:1.65,stock:725.6603506969356},
 xbBedPlus:{terminal:39,color:'#c82e26',mount:[-86.92020122337449,174.55172,65.10376870490178],fixed:[-109.83699466835,112,205.2],radius:1.65,stock:733.101663633195},
 xbHeatInPlus:{terminal:40,color:'#c82e26',mount:[-88.49060876596793,174.55172,34.68351700364023],fixed:[129.48276357850568,176.4629,16.387865752740254],radius:1.65,lower:true,psuSlot:3,lane:[177.3,35],peelY:183.5,exitY:185.3,finalStraight:4},
 xbHeatInMinus:{terminal:41,color:'#242526',mount:[-98.52242857912992,174.55172,34.68351700364025],fixed:[112.97274746571445,176.4629,16.38789307413009],radius:1.65,lower:true,psuSlot:1,lane:[170.3,35],peelY:178.3,exitY:178.3,earlyBight:true,finalStraight:4},
 xbPowerPlus:{terminal:42,color:'#c82e26',mount:[-111.60729899355135,174.55172,34.68351700364025],fixed:[121.2277542914892,176.4629,16.387869714269016],radius:1.65,lower:true,psuSlot:2,lane:[173.8,35],peelY:181.8,exitY:181.8,zBight:0,finalStraight:4},
 xbPowerMinus:{terminal:43,color:'#242526',mount:[-121.46478848350765,174.55172,34.68351700364025],fixed:[104.71775777932889,176.4629,16.387901692132374],radius:1.65,lower:true,psuSlot:0,lane:[166.8,35],peelY:174.8,exitY:174.8,zBight:0,finalStraight:4},
 xbExtensionRed:{terminal:42,color:'#c82e26',mount:[-111.60729899355135,175.15172,34.68351700364025],fixed:[-127.25822311842543,177.5,183.9751347303666],radius:.85,lower:true,stack:.6,extension:true,angle:Math.PI-30*Math.PI/180,finalStraight:12,earlyBight:6,zBight:4},
};
const constructedStocks={xbHeatInPlus:275.8098744758737,xbHeatInMinus:265.9390376365653,xbPowerPlus:283.6195652360452,xbPowerMinus:275.4648837528789,xbExtensionRed:222.0218717000854};
for(const[id,stock]of Object.entries(constructedStocks))FAMILY_ROLES[id].stock=stock;
// Formed fork neck: native screw/washer datum stays fixed; only the new reference crimp exits2.5629mm below its flat tongue.
for(const r of Object.values(FAMILY_ROLES))if(r.psuSlot!==undefined)r.fixed[1]=173.9;
class Joined extends T.Curve{
 constructor(parts){super();this.parts=parts;this.lengths=parts.map(p=>p.getLength());this.stock=this.lengths.reduce((a,b)=>a+b,0);this.arcLengthDivisions=8192;}
 locate(t){let s=T.MathUtils.clamp(t,0,1)*this.stock;for(let i=0;i<this.parts.length;i++){if(s<=this.lengths[i]||i===this.parts.length-1)return[i,T.MathUtils.clamp(s/this.lengths[i],0,1)];s-=this.lengths[i];}}
 getPoint(t,target=new T.Vector3()){const[i,u]=this.locate(t);return this.parts[i].getPointAt(u,target);}
 getTangent(t,target=new T.Vector3()){const[i,u]=this.locate(t);return this.parts[i].getTangentAt(u,target);}
 getPointAt(t,target){return this.getPoint(t,target);} getTangentAt(t,target){return this.getTangent(t,target);}getLength(){return this.stock;}
}
const original=new BedMaterialCurve(1),base=new Joined(original.parts.slice(0,2)),L=base.getLength(),N=4096;
const normals=[],tangents=[];let previous=base.getTangentAt(0),n=V([1,0,0]).addScaledVector(previous,-previous.x).normalize();
for(let i=0;i<=N;i++){const t=base.getTangentAt(i/N);if(i)n.applyQuaternion(new T.Quaternion().setFromUnitVectors(previous,t));n.addScaledVector(t,-n.dot(t)).normalize();normals.push(n.clone());tangents.push(t);previous=t;}
const endT=tangents[N],desired=V([-1,0,0]).addScaledVector(endT,endT.x).normalize(),endN=normals[N],roll=Math.atan2(new T.Vector3().crossVectors(endN,desired).dot(endT),endN.dot(desired));
class PackedFixed extends T.Curve{
 constructor(id){super();this.id=id;this.arcLengthDivisions=8192;this.updateArcLengths();this.stock=super.getLength();}
 getPoint(t,target=new T.Vector3()){
  const u=T.MathUtils.clamp(t,0,1),s=u*L,x=u*N,i=Math.min(N-1,Math.floor(x)),normal=normals[i].clone().lerp(normals[i+1],x-i).normalize(),tangent=base.getTangentAt(u);
  const planar=new T.Vector3().crossVectors(tangent,V([0,0,1])).normalize();
  normal.lerp(planar,1-Q((s-65)/45)).addScaledVector(tangent,-normal.dot(tangent)).normalize().applyAxisAngle(tangent,roll*Q((s-190)/365));
  const side=this.id==='xbBedMinus'?-1:1,packed=side*1.75*Q((s-4)/16),start=this.id==='xbBedMinus'?0:10.16300533165*(1-Q((s-4)/16)),centre=-1.0*Q((s-8)/6)*(1-Q((s-22)/12));
  return base.getPointAt(u,target).addScaledVector(normal,packed+centre).addScaledVector(V([1,0,0]),start).addScaledVector(V([0,1,0]),1.2*Q((s-25)/12)*(1-Q((s-65)/20)));
 }
}
class ConstantArc extends T.Curve{
 constructor(start,u,n,r,angle){super();this.start=start;this.u=u;this.n=n;this.r=r;this.angle=angle;this.arcLengthDivisions=1024;}
 getPoint(t,target=new T.Vector3()){const a=t*this.angle;return target.copy(this.start).addScaledVector(this.n,this.r*(1-Math.cos(a))).addScaledVector(this.u,this.r*Math.sin(a));}
 getTangent(t,target=new T.Vector3()){const a=t*this.angle;return target.copy(this.u).multiplyScalar(Math.cos(a)).addScaledVector(this.n,Math.sin(a));}
 getPointAt(t,target){return this.getPoint(t,target);}getTangentAt(t,target){return this.getTangent(t,target);}getLength(){return this.r*this.angle;}
}
function roundPolyline(points,r){let previous=points[0],parts=[];for(let i=1;i<points.length-1;i++){const p=points[i],u=p.clone().sub(points[i-1]).normalize(),v=points[i+1].clone().sub(p).normalize(),angle=u.angleTo(v),trim=r*Math.tan(angle/2);if(trim>=p.distanceTo(points[i-1])*.49||trim>=p.distanceTo(points[i+1])*.49)throw Error('Round bank insufficient support');const start=p.clone().addScaledVector(u,-trim),n=v.clone().addScaledVector(u,-Math.cos(angle)).divideScalar(Math.sin(angle)),arc=new ConstantArc(start,u,n,r,angle);if(previous.distanceTo(start)>1e-10)parts.push(new T.LineCurve3(previous,start));parts.push(arc);previous=arc.getPoint(1);}parts.push(new T.LineCurve3(previous,points.at(-1)));return new Joined(parts);}

const fixed=new Map(['xbBedMinus','xbBedPlus'].map(id=>[id,new PackedFixed(id)]));
for(const[id,r]of Object.entries(FAMILY_ROLES))if(r.lower){let points;if(r.extension)points=[r.fixed,[r.fixed[0],183,r.fixed[2]],[-130,183,178],[-132,183,163],[-133,183,132],[-133,195,110],[-133,195,85],[-128,192,60],[-124,189,32]];
 else{const [x,y,z]=r.fixed,underY=r.psuSlot%2?164.3:160.8,underZ=r.psuSlot>=2?9.25:5.75;points=[r.fixed,[x,y,z-3],[x,underY,underZ],[78,underY,underZ],[43,underY,underZ],[10,underY,underZ],[-60,underY,underZ],[-70,underY,underZ]];}
 if(r.psuSlot!==undefined){const p0=V(r.fixed),p1=p0.clone().add(V([0,0,-3.5])),underY=r.psuSlot%2?160.8:164.3,underZ=r.psuSlot>=2?5.75:9.25,end=V([p0.x-12,underY,underZ]),bend=new T.CubicBezierCurve3(p1,p1.clone().add(V([0,0,-4])),end.clone().add(V([8,0,0])),end);bend.arcLengthDivisions=4096;fixed.set(id,r.psuSlot!==undefined?roundPolyline([p0,V([p0.x,p0.y,underZ]),end,V([-70,underY,underZ])],3):new Joined([new T.LineCurve3(p0,p1),bend,new T.LineCurve3(end,V([-70,underY,underZ]))]));}
 else{const c=new T.CatmullRomCurve3(points.map(V),false,'centripetal');c.arcLengthDivisions=8192;fixed.set(id,c);}
}
const basis=Float64Array.from({length:4097},(_,i)=>Math.sin(Math.PI*i/4096)**2);
const earlyWeight=t=>45.5625*t*t*(1-t)**4,earlyBasis=Float64Array.from({length:4097},(_,i)=>earlyWeight(i/4096));
const early6Norm=1/(.25**2*.75**6),early6Weight=t=>early6Norm*t*t*(1-t)**6,early6Basis=Float64Array.from({length:4097},(_,i)=>early6Weight(i/4096));
// Same material bight and analytic chord derivative as parent319; no pose interpolation.
class FreeBight extends T.Curve{
 constructor(p0,d0,end,lower=false,exit=V([0,0,-1]),early=false,zBight=0){super();this.p0=p0;this.p1=p0.clone().addScaledVector(d0,lower?12:22);this.p2=end.clone().addScaledVector(lower?exit:V([0,0,1]),lower?4:25);this.end=end;this.a=24;this.arcLengthDivisions=4096;this.early=early;this.zBight=zBight;this.basis=early===6?early6Basis:early?earlyBasis:basis;}
 getPoint(t,target=new T.Vector3()){const u=1-t,w=this.early===6?early6Weight(t):this.early?earlyWeight(t):Math.sin(Math.PI*t)**2;return target.copy(this.p0).multiplyScalar(u*u*u).addScaledVector(this.p1,3*u*u*t).addScaledVector(this.p2,3*u*t*t).addScaledVector(this.end,t*t*t).addScaledVector(V([0,1,0]),this.a*w).addScaledVector(V([0,0,1]),this.zBight*16*t*t*u*u);}
 getTangent(t,target=new T.Vector3()){const u=1-t,dw=this.early===6?early6Norm*(2*t*u**6-6*t*t*u**5):this.early?45.5625*(2*t*u**4-4*t*t*u**3):Math.PI*Math.sin(2*Math.PI*t);return target.copy(this.p1).sub(this.p0).multiplyScalar(3*u*u).addScaledVector(this.p2.clone().sub(this.p1),6*u*t).addScaledVector(this.end.clone().sub(this.p2),3*t*t).addScaledVector(V([0,1,0]),this.a*dw).addScaledVector(V([0,0,1]),this.zBight*32*t*u*(1-2*t)).normalize();}
}

// Degree7 free bank: both endpoint derivatives and zero second derivatives are authored in the curve, not corrected on rendered vertices.
const smoothControls={"xbHeatInPlus": [-59.577863217525184, -98.6329944151778, 4.600000045192387, 4.600000720270583, 8.150872984383087, 6.494028583780567, 0.6308652112158819], "xbHeatInMinus": [-45.794349648172165, -78.55750388442954, 14.977452301460344, 4.600034276987041, 10.66698255726849, 2.5760365954450997, 0.6031384585732805], "xbPowerPlus": [-57.71683469728358, -100.918584730132, 9.096230860129474, 6.0111540208013245, 5.023400561581544, 3.972503818052817, 0.8488118225587402], "xbPowerMinus": [-102.56651578651102, -144.96807649025163, 4.927099362020784, 23.565255423031807, 6.081726909146005, 4.6991168176295695, 0.0]};
const bankFields={"xbHeatInPlus": {"rest": [-59.577863217525184, -98.6329944151778, 4.600000045192387, 4.600000720270583, 8.150872984383087, 6.494028583780567, 0.6308652112158819], "mid": [-40.13118332785721, -107.74320988039291, 4.600000028959104, 6.461196718154927, 17.999966252885535, 3.3321101025516477, -0.6614137126777327], "free": [-59.577863217525184, -98.6329944151778, 4.600000045192387, 4.600000720270583, 8.150872984383087, 6.494028583780567, 0.6308652112158819]}, "xbHeatInMinus": {"rest": [-45.794349648172165, -78.55750388442954, 14.977452301460344, 4.600034276987041, 10.66698255726849, 2.5760365954450997, 0.6031384585732805], "mid": [-45.794349648172165, -78.55750388442954, 14.977452301460344, 4.600034276987041, 10.66698255726849, 2.5760365954450997, 0.6031384585732805], "free": [-45.794349648172165, -78.55750388442954, 14.977452301460344, 4.600034276987041, 10.66698255726849, 2.5760365954450997, 0.6031384585732805]}, "xbPowerPlus": {"rest": [-57.71683469728358, -100.918584730132, 9.096230860129474, 6.0111540208013245, 5.023400561581544, 3.972503818052817, 0.8488118225587402], "mid": [-57.71683469728358, -100.918584730132, 9.096230860129474, 6.0111540208013245, 5.023400561581544, 3.972503818052817, 0.8488118225587402], "free": [-57.71683469728358, -100.918584730132, 9.096230860129474, 6.0111540208013245, 5.023400561581544, 3.972503818052817, 0.8488118225587402]}, "xbPowerMinus": {"rest": [-92.95592027614792, -73.06908565905465, -95.88460168801384, -88.60955116996331, 54.99996303687631, 6.423040925799449, 4.735650029340899, 25.185884681461737, 3.7149457489663384, 5.235463625868175], "mid": [-92.95592027614792, -73.06908565905465, -95.88460168801384, -88.60955116996331, 54.99996303687631, 6.423040925799449, 4.735650029340899, 25.185884681461737, 3.7149457489663384, 5.235463625868175], "free": [-92.95592027614792, -73.06908565905465, -95.88460168801384, -88.60955116996331, 54.99996303687631, 6.423040925799449, 4.735650029340899, 25.185884681461737, 3.7149457489663384, 5.235463625868175]}};
const phaseBlackLift=[-77.33503192454192, -77.10941674330417, 18.418206731037827, 15.859520905908607, 15.483336903483478, 3.61581780799952, 0.27424409295569774],phaseBlackPark=[-105.44432462338266, -97.9188475233802, 41.87942947311633, 13.972717500851001, 17.129981399459005, 2.000027003290512, -0.8777429190843072],phaseRedLift=[-39.12685632840339, -118.69408811771446, 4.672655012414912, 13.978322521195839, 11.938128943081686, 7.281559797824995, 0.24831136892354697],phaseRedPark=[-85.96796996743922, -68.66249244517287, 9.934376544214555, 2.1158794298282046, 10.283772936471179, 2.3283262761862287, 0.8814691998691773];
function bankControl(id,a){const f=bankFields[id];if((id==='xbHeatInPlus'||id==='xbHeatInMinus')&&a<1){const q=1-a,L=Q(q/.35),P=Q((q-.35)/.65),r=f.rest.slice();r[3]=18.18351700364024-2*r[5]-r[3];const lift=id==='xbHeatInPlus'?phaseRedLift:phaseBlackLift,park=id==='xbHeatInPlus'?phaseRedPark:phaseBlackPark,v=r.map((n,i)=>n+(lift[i]-n)*L+(park[i]-lift[i])*P),offset=terminalOffset(id,a);v[3]=18.18351700364024+offset.z-2*v[5]-v[3];return v;}if(id==='xbHeatInPlus'||id==='xbHeatInMinus')return f.rest;const weights=[(1-a)*(1-2*a),4*a*(1-a),a*(2*a-1)];return f.rest.map((_,i)=>f.free[i]*weights[0]+f.mid[i]*weights[1]+f.rest[i]*weights[2]);}
const choose=(n,k)=>{let a=1;for(let i=1;i<=k;i++)a=a*(n-i+1)/i;return a;};
function bernstein(n,t){return Array.from({length:n+1},(_,k)=>choose(n,k)*t**k*(1-t)**(n-k));}
const smoothBasis=Float64Array.from({length:4097},(_,i)=>{const b=bernstein(7,i/4096);return b[3]+b[4];});
class SmoothFreeBank extends T.Curve{
 constructor(id,p0,end,offset,amount){super();this.arcLengthDivisions=4096;this.a=45;this.end=end;this.variables=bankControl(id,amount);const v=this.variables;this.degree=v.length===10?9:7;
 if(this.degree===9){const h0=v[8],h1=v[9],mid=Array.from({length:4},(_,i)=>V([v[i],p0.y+(end.y-p0.y)*(i+1)/5,v[4+i]]));this.controls=[p0,p0.clone().add(V([-h0,0,0])),p0.clone().add(V([-2*h0,0,0])),...mid,end.clone().add(V([0,0,-2*h1])),end.clone().add(V([0,0,-h1])),end];this.weights=[0,0,0,1,1,1,1,0,0,0];}
 else{const[x3,x4,z3,z4,h0,h1,skew]=v;this.controls=[p0,p0.clone().add(V([-h0,0,0])),p0.clone().add(V([-2*h0,0,0])),V([x3,p0.y,z3]),V([x4,end.y,z4]),end.clone().add(V([0,0,-2*h1])),end.clone().add(V([0,0,-h1])),end];this.weights=[0,0,0,1+skew,1-skew,0,0,0];}
 this.basis=Float64Array.from({length:4097},(_,i)=>bernstein(this.degree,i/4096).reduce((a,b,k)=>a+b*this.weights[k],0));this.base=new Float64Array(4097*3);const p=new T.Vector3();for(let i=0;i<=4096;i++){this.basePoint(i/4096,p);this.base.set(p.toArray(),i*3);}
 }
 basePoint(t,target){target.set(0,0,0);const b=bernstein(this.degree,t);for(let k=0;k<=this.degree;k++)target.addScaledVector(this.controls[k],b[k]);return target;}
 getPoint(t,target=new T.Vector3()){const b=bernstein(this.degree,t);this.basePoint(t,target);target.y+=this.a*b.reduce((s,x,k)=>s+x*this.weights[k],0);return target;}
 getTangent(t,target=new T.Vector3()){const n=this.degree,b=bernstein(n-1,t);target.set(0,0,0);for(let k=0;k<n;k++){target.addScaledVector(this.controls[k+1].clone().sub(this.controls[k]),n*b[k]);target.y+=this.a*n*b[k]*(this.weights[k+1]-this.weights[k]);}return target.normalize();}
}

function measure(t,a){if(t instanceof SmoothFreeBank){t.a=a;let length=0,derivative=0;const p=t.base,b=t.basis;for(let i=1;i<=4096;i++){const k=i*3,j=k-3,dx=p[k]-p[j],dy=p[k+1]-p[j+1]+a*(b[i]-b[i-1]),dz=p[k+2]-p[j+2],d=Math.hypot(dx,dy,dz);length+=d;if(d)derivative+=dy*(b[i]-b[i-1])/d;}return{length,derivative};}t.a=a;const prev=t.getPoint(0),p=new T.Vector3();let length=0,derivative=0;for(let i=1;i<=4096;i++){t.getPoint(i/4096,p);const dx=p.x-prev.x,dy=p.y-prev.y,dz=p.z-prev.z,d=Math.hypot(dx,dy,dz);length+=d;if(d)derivative+=dy*(t.basis[i]-t.basis[i-1])/d;prev.copy(p);}return{length,derivative};}
export function terminalOffset(id,amount){const q=1-amount;if(id==='xbHeatInPlus'||id==='xbHeatInMinus'){const L=Q(q/.35),P=Q((q-.35)/.65);return V([id==='xbHeatInPlus'?18*L:0*Q(q/.3)*(1-P),.6*Q(q/.15)+17.4*P,(id==='xbHeatInPlus'?12:18)*L]);}if(id==='xbPowerPlus')return V([-8*Q(q/.35)+8*Q((q-.35)/.65),18*Q((q-.35)/.65),8*Q(q/.35)+12*Q((q-.35)/.65)]);return V([0,18*q,0]);}
function exitDirection(r){const a=r.angle??Math.PI;return V([Math.sin(a),0,Math.cos(a)]);}
function makeTail(id,amount){const f=fixed.get(id),r=FAMILY_ROLES[id],exit=exitDirection(r),end=V(r.mount).add(V([0,2.8,0])).add(terminalOffset(id,amount));if(r.lower)end.addScaledVector(exit,12.5+(r.finalStraight??4));else end.z+=24.5;return smoothControls[id]?new SmoothFreeBank(id,f.getPointAt(1),end,terminalOffset(id,amount),amount):new FreeBight(f.getPointAt(1),f.getTangentAt(1),end,r.lower,exit,r.earlyBight,r.zBight||0);}
const seeds=new Map();
for(const[id,r]of Object.entries(FAMILY_ROLES)){
 const f=fixed.get(id),rest=makeTail(id,1),straight=r.lower?(r.finalStraight??4):12;if(r.stock===undefined)r.stock=f.getLength()+measure(rest,24).length+straight;
 const target=r.stock-f.getLength()-straight,a=[];for(let i=0;i<9;i++){const t=makeTail(id,i/8);let b=24;for(let j=0;j<10;j++){const m=measure(t,b),e=m.length-target;if(Math.abs(e)<2e-8)break;if(m.derivative<=1e-8)throw Error('Invalid initial bight');b-=e/m.derivative;}a.push(b);}seeds.set(id,a);
}
function seed(id,amount){const x=amount*8,start=Math.max(0,Math.min(5,Math.floor(x)-1));let result=0;for(let j=start;j<start+4;j++){let w=1;for(let k=start;k<start+4;k++)if(k!==j)w*=(x-k)/(j-k);result+=w*seeds.get(id)[j];}return result;}
export class PowerMaterialCurve extends Joined{
 constructor(id,amount){if(!FAMILY_ROLES[id]||!Number.isFinite(amount)||amount<0||amount>1)throw Error('Unsupported power material pose');const r=FAMILY_ROLES[id],f=fixed.get(id),tail=makeTail(id,amount),straightLength=r.lower?(r.finalStraight??4):12,target=r.stock-f.getLength()-straightLength;let a=seed(id,amount),closed=false;
  for(let k=0;k<5;k++){const m=measure(tail,a),error=m.length-target;if(Math.abs(error)<=2e-8){closed=true;break;}if(m.derivative<=1e-8)throw Error('Power stock derivative invalid');a-=error/m.derivative;if(!Number.isFinite(a)||a<0||a>100)throw Error('Power stock unavailable');}
  if(!closed)throw Error('Power material closure failed');tail.updateArcLengths();const straight=new T.LineCurve3(tail.end,r.lower?tail.end.clone().addScaledVector(exitDirection(r),-straightLength):tail.end.clone().add(V([0,0,-12])));super(straightLength>0?[f,tail,straight]:[f,tail]);this.id=id;this.amount=amount;this.tailBightMM=tail.a;this.materialStockMM=r.stock;if(Math.abs(this.stock-r.stock)>2e-8)throw Error('Power material cache mismatch');
 }
}
export const PACKING_REFERENCE={diameterMM:3.3,centreSpacingMM:3.5,sleeveRadiusMM:4,rollRadians:roll,commonBaseStockMM:L,qualified:'Two photo-estimated conductors in existing reference sleeve. Fixed-end/crimp/native electrical datums unchanged. Both constructed cable stocks explicit; not an OEM cut-length measurement.'};
