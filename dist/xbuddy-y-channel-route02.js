// SPDX-License-Identifier: MIT
// Authored teaching route through the actual current strap/channel geometry.
// Coordinates are model datums/qualified route estimates, not OEM metrology.
import * as T from 'three';
import {FreeMaterialBank} from './xbuddy-complete-material.js';
const V=a=>new T.Vector3(...a);
class Corner extends T.Curve{
 constructor(){super();this.stockMM=3*Math.PI/2;}
 getPoint(t,out=new T.Vector3()){const a=t*Math.PI/2;return out.set(-135-3*Math.cos(a),181,171.5-3*Math.sin(a));}
 getTangent(t,out=new T.Vector3()){const a=t*Math.PI/2;return out.set(Math.sin(a),0,-Math.cos(a));}
 getPointAt(t,out){return this.getPoint(t,out);}getTangentAt(t,out){return this.getTangent(t,out);}getLength(){return this.stockMM;}
}
class EntryBezier extends T.CubicBezierCurve3{
 getTangent(t,out=new T.Vector3()){const u=1-t;return out.copy(this.v1).sub(this.v0).multiplyScalar(3*u*u).addScaledVector(new T.Vector3().subVectors(this.v2,this.v1),6*u*t).addScaledVector(new T.Vector3().subVectors(this.v3,this.v2),3*t*t).normalize();}
}
class Joined extends T.Curve{
 constructor(parts){super();this.parts=parts;this.lengths=parts.map(p=>p.getLength());this.stockMM=this.lengths.reduce((a,b)=>a+b,0);}
 locate(t){let s=Math.max(0,Math.min(1,t))*this.stockMM;for(let i=0;i<this.parts.length;i++){if(s<=this.lengths[i]||i===this.parts.length-1)return[this.parts[i],Math.max(0,Math.min(1,s/this.lengths[i]))];s-=this.lengths[i];}}
 getPoint(t,out=new T.Vector3()){const[p,u]=this.locate(t);return p.getPointAt(u,out);}getTangent(t,out=new T.Vector3()){const[p,u]=this.locate(t);return p.getTangentAt(u,out);}
 getPointAt(t,out){return this.getPoint(t,out);}getTangentAt(t,out){return this.getTangent(t,out);}getLength(){return this.stockMM;}
}
export function yChannelRoute02(start,startT,end,stock=140){
 const H=V([-138,181,213]),R=V([-138,181,171.5]),Q=V([-135,181,168.5]),F=end.clone().add(V([0,1.5,0])),line=new T.LineCurve3(H,R),corner=new Corner(),tail=new EntryBezier(Q,Q.clone().add(V([12,0,0])),F.clone().add(V([0,6,0])),F),entry=new T.LineCurve3(F,end.clone());tail.arcLengthDivisions=2048;tail.updateArcLengths();
 const remaining=line.getLength()+corner.getLength()+tail.getLength()+entry.getLength(),headStock=stock-remaining;
 const head=new FreeMaterialBank({start,startT,end:H,endT:V([0,0,-1]),stock:headStock,direction:[-1,0,0]});
 const curve=new Joined([head,line,corner,tail,entry]);curve.measuredMM=head.measuredMM+remaining;curve.ledger={stockMM:stock,headStockMM:headStock,headMeasuredMM:head.measuredMM,headBightMM:head.a,channel:[[...H.toArray()],[...R.toArray()]],cornerRadiusMM:3,tailControls:[Q.toArray(),Q.clone().add(V([12,0,0])).toArray(),F.clone().add(V([0,6,0])).toArray(),F.toArray()],straightEntryMM:1.5,entry:[F.toArray(),end.toArray()],qualification:'Strap holes and connector access in the current model; path controls,1.5mm straight entry and7mm axial/6mm early lift are authored illustrative motion, not manufacturer limits.'};return curve;
}

// The complete current reference plug front has cleared the header rear by
//0.50mm when lift starts(q=.35). This is current authored geometry, not OEM fit.
export function yChannelExit02(seated,amount){const q=1-amount,S=x=>(x=T.MathUtils.clamp(x,0,1))*x*(3-2*x);return seated.clone().add(V([0,7*S(q/.5),6*S((q-.5)/.5)]));}
