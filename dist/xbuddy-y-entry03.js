// Original code MIT; authored geometry parameters CC BY-SA4.0. See source/xbuddy-replacement.
// Four full insulated-conductor paths. These are reference estimates, not OEM wire specifications.
import * as T from 'three';
import {FreeMaterialBank} from './xbuddy-complete-material.js';
const V=a=>new T.Vector3(...a),S=x=>(x=T.MathUtils.clamp(x,0,1))*x*(3-2*x);
export const Y_ENTRY03=Object.freeze({conductors:4,wireRadiusMM:.52,bundleEnvelopeRadiusMM:1.3,squareHalfMM:.55,pitchMM:1.5,insertionIntoMouthMM:.35,straightEntryMM:1,turnRadiusMM:4,samples:768,sides:10});
const slots=[{x:.55,y:.55,row:2.25},{x:.55,y:-.55,row:.75},{x:-.55,y:-.55,row:-.75},{x:-.55,y:.55,row:-2.25}],prefixes=new WeakMap();
class Samples extends T.Curve{
 constructor(points){super();this.points=points;this.lengths=[0];for(let i=1;i<points.length;i++)this.lengths.push(this.lengths.at(-1)+points[i].distanceTo(points[i-1]));this.stockMM=this.lengths.at(-1);}
 locate(u){const s=T.MathUtils.clamp(u,0,1)*this.stockMM;let lo=0,hi=this.points.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(this.lengths[m]<s)lo=m;else hi=m;}return[lo,hi,(s-this.lengths[lo])/(this.lengths[hi]-this.lengths[lo])];}
 getPoint(u,out=new T.Vector3()){const[a,b,t]=this.locate(u);return out.copy(this.points[a]).lerp(this.points[b],t);}getPointAt(u,out){return this.getPoint(u,out);}
 getTangent(u,out=new T.Vector3()){const[a,b]=this.locate(u);return out.copy(this.points[b]).sub(this.points[a]).normalize();}getTangentAt(u,out){return this.getTangent(u,out);}getLength(){return this.stockMM;}
}
class Join extends T.Curve{
 constructor(parts){super();this.parts=parts;this.lengths=parts.map(p=>p.getLength());this.stockMM=this.lengths.reduce((a,b)=>a+b,0);this.measuredMM=parts.reduce((a,p)=>a+(p.measuredMM??p.getLength()),0);}
 locate(t){let s=T.MathUtils.clamp(t,0,1)*this.stockMM;for(let i=0;i<this.parts.length;i++){if(s<=this.lengths[i]||i===this.parts.length-1)return[this.parts[i],T.MathUtils.clamp(s/this.lengths[i],0,1)];s-=this.lengths[i];}}
 getPoint(t,out=new T.Vector3()){const[p,u]=this.locate(t);return p.getPointAt(u,out);}getPointAt(t,out){return this.getPoint(t,out);}getTangent(t,out=new T.Vector3()){const[p,u]=this.locate(t);return p.getTangentAt(u,out);}getTangentAt(t,out){return this.getTangent(t,out);}getLength(){return this.stockMM;}
}
class BendXZ extends T.Curve{
 constructor(dx,dy){super();this.radius=3-dx;this.dy=dy;this.stockMM=this.radius*Math.PI/2;}
 getPoint(t,out=new T.Vector3()){const a=t*Math.PI/2;return out.set(-135-this.radius*Math.cos(a),181+this.dy,171.5-this.radius*Math.sin(a));}getPointAt(t,out){return this.getPoint(t,out);}
 getTangent(t,out=new T.Vector3()){const a=t*Math.PI/2;return out.set(Math.sin(a),0,-Math.cos(a));}getTangentAt(t,out){return this.getTangent(t,out);}getLength(){return this.stockMM;}
}
class EntryTurn extends T.Curve{
 constructor(end,row){super();this.end=end;this.row=row;this.radius=Y_ENTRY03.turnRadiusMM+row;this.arcLengthDivisions=1024;this.stockMM=super.getLength();}
 getPoint(t,out=new T.Vector3()){const a=t*Math.PI/2;return out.set(this.end.x-Y_ENTRY03.turnRadiusMM+this.radius*Math.sin(a),this.end.y+Y_ENTRY03.straightEntryMM+this.radius*Math.cos(a),this.end.z+2*16*t*t*(1-t)*(1-t));}getPointAt(t,out){return super.getPointAt(t,out);}
 getTangent(t,out=new T.Vector3()){const a=t*Math.PI/2,h=this.radius*Math.PI/2;return out.set(h*Math.cos(a),-h*Math.sin(a),2*32*t*(1-t)*(1-2*t)).normalize();}getTangentAt(t,out){return super.getTangentAt(t,out);}getLength(){return this.stockMM;}
}
class AnalyticBezier extends T.CubicBezierCurve3{derivative(t,out=new T.Vector3()){const u=1-t;return out.copy(this.v1).sub(this.v0).multiplyScalar(3*u*u).addScaledVector(new T.Vector3().subVectors(this.v2,this.v1),6*u*t).addScaledVector(new T.Vector3().subVectors(this.v3,this.v2),3*t*t);}getTangent(t,out=new T.Vector3()){return this.derivative(t,out).normalize();}}
class TailRise extends AnalyticBezier{getPoint(t,out=new T.Vector3()){super.getPoint(t,out);out.z+=1.5*16*t*t*(1-t)*(1-t);return out;}getTangent(t,out=new T.Vector3()){this.derivative(t,out);out.z+=1.5*32*t*(1-t)*(1-2*t);return out.normalize();}}
function fixedConductorPrefixes(fixed){
 if(prefixes.has(fixed))return prefixes.get(fixed);
 // Reallocate existing reference stock from the authored upper detour to the
 // longer outer conductor turn. Source motor endpoint/channel entry stay fixed.
 const route=fixed.clone(),replacements=[[[ -158,177,300],[-156,177,296]],[[-141,177,303],[-141,177,300]]];
 for(const[a,b]of replacements){const matches=route.points.filter(p=>p.equals(V(a)));if(matches.length!==1)throw Error('Expected sourceY upper detour control');matches[0].copy(V(b));}route.arcLengthDivisions=2048;route.updateArcLengths();
 class Reference extends T.Curve{getPoint(t,out){return route.getPointAt(t,out);}getTangent(t,out){return route.getTangentAt(t,out);}}
 const N=2048,frames=new Reference().computeFrenetFrames(N,false),last=frames.normals[N],t=frames.tangents[N],target=V([1,0,0]).addScaledVector(t,-t.x).normalize(),angle=Math.atan2(t.dot(new T.Vector3().crossVectors(last,target)),last.dot(target)),rotation=new T.Matrix4();
 const points=slots.map(()=>[]);
 for(let i=0;i<=N;i++){
  const tangent=frames.tangents[i],normal=frames.normals[i].clone().applyMatrix4(rotation.makeRotationAxis(tangent,angle)).normalize(),binormal=new T.Vector3().crossVectors(normal,tangent).normalize(),p=route.getPointAt(i/N);
  for(let j=0;j<4;j++)points[j].push(p.clone().addScaledVector(normal,slots[j].x).addScaledVector(binormal,slots[j].y));
 }
 const result=points.map(p=>new Samples(p));prefixes.set(fixed,result);return result;
}
function fanoutTail(end,slot){
 const Q=V([-135,181,168.5]),C=V([end.x-Y_ENTRY03.turnRadiusMM,end.y+Y_ENTRY03.straightEntryMM+Y_ENTRY03.turnRadiusMM,end.z]),base=new TailRise(Q,Q.clone().add(V([14,0,0])),C.clone().sub(V([14,0,0])),C),points=[],N=512;
 for(let i=0;i<=N;i++){
  const t=i/N,tangent=base.getTangent(t),a=Math.PI/2*S(t),normal=V([0,Math.sin(a),Math.cos(a)]).addScaledVector(tangent,-V([0,Math.sin(a),Math.cos(a)]).dot(tangent)).normalize(),binormal=new T.Vector3().crossVectors(normal,tangent).normalize(),spread=S((t-.15)/.5),flatten=S((t-.65)/.25),dx=T.MathUtils.lerp(slot.x,slot.row,spread),dy=slot.y*(1-flatten);
  points.push(base.getPoint(t).addScaledVector(normal,dx).addScaledVector(binormal,dy));
 }
 return new Samples(points);
}
function upperLane(start,slot,lane){const points=[];for(let i=0;i<=128;i++){const t=i/128,spread=S(t/.6),flatten=S((t-.6)/.4);points.push(V([-139+slot.x*(1-flatten),177+T.MathUtils.lerp(slot.y,lane,spread),T.MathUtils.lerp(start.z,233,t)]));}points[0].copy(start);return new Samples(points);}
function lowerLane(slot,lane){const points=[];for(let i=0;i<=128;i++){const t=i/128,spread=S(t/.4),flatten=S((t-.6)/.4);points.push(V([-137-S(t)+slot.x*spread,181+T.MathUtils.lerp(lane,slot.y,flatten),220-7*t]));}return new Samples(points);}
export function buildYConductorRoutes03(fixed,port,stock){
 const fixedWires=fixedConductorPrefixes(fixed),end=port.clone().add(V([0,-Y_ENTRY03.insertionIntoMouthMM,0])),curves=[],receipts=[];
 for(let i=0;i<4;i++){
  const p=fixedWires[i],s=slots[i],lane=[3,-1,-3,1][i],upper=upperLane(p.getPointAt(1),s,lane),lower=lowerLane(s,lane),H=V([-138+s.x,181+s.y,213]),R=V([-138+s.x,181+s.y,171.5]),line=new T.LineCurve3(H,R),bend=new BendXZ(s.x,s.y),tail=fanoutTail(end,s),turn=new EntryTurn(end,s.row),tip=end.clone().add(V([s.row,0,0])),entry=new T.LineCurve3(turn.getPointAt(1),tip),remaining=upper.getLength()+lower.getLength()+line.getLength()+bend.getLength()+tail.getLength()+turn.getLength()+entry.getLength(),headStock=stock-p.getLength()-remaining;
  const head=new FreeMaterialBank({start:upper.getPointAt(1),startT:upper.getTangentAt(1),end:lower.getPointAt(0),endT:V([0,0,-1]),stock:headStock,direction:[1,0,0]}),curve=new Join([p,upper,head,lower,line,bend,tail,turn,entry]);
  curves.push(curve);receipts.push({circuit:i,sourceNativeCircuitXMM:-s.row,wireRadiusMM:Y_ENTRY03.wireRadiusMM,totalStockMM:stock,fixedStockMM:p.getLength(),upperLaneStockMM:upper.getLength(),lowerLaneStockMM:lower.getLength(),headLaneMM:lane,headStockMM:headStock,headMeasuredMM:head.measuredMM,headBightMM:head.a,restStockMM:remaining,measuredMM:curve.measuredMM,wireEntryMM:tip.toArray(),turnRadiusMM:turn.radius,wireMouthInsertionMM:Y_ENTRY03.insertionIntoMouthMM});
 }
 class Mean extends T.Curve{
  getPoint(t,out=new T.Vector3()){out.set(0,0,0);for(const c of curves)out.add(c.getPointAt(t));return out.multiplyScalar(.25);}getPointAt(t,out){return this.getPoint(t,out);}getTangent(t,out=new T.Vector3()){out.set(0,0,0);for(const c of curves)out.add(c.getTangentAt(t));return out.normalize();}getTangentAt(t,out){return this.getTangent(t,out);}getLength(){return stock;}
 }
 const mean=new Mean();mean.stockMM=stock;mean.measuredMM=receipts.reduce((a,r)=>a+r.measuredMM,0)/4;
 return{curves,mean,receipt:{kind:'Four independent full insulated conductor paths; reference bundle envelope retained, no bundled tube through terminal holes',referencePerConductorStockMM:stock,aggregateConductorStockMM:4*stock,bundleEnvelopeRadiusMM:1.3,wireRadiusMM:Y_ENTRY03.wireRadiusMM,estimatedWireGauge:true,conductors:receipts,qualification:'Complete current authored plug/header unchanged. Native pitch/source cavity coordinates; wire gauge, turn radii and fanout controls are independently authored teaching estimates, not OEM stock/SKU/metrology. Internal crimp construction is not asserted.'}};
}
