// Complete per-conductor material-coordinate curve; original reference code MIT.
import * as T from 'three';
import {FreeMaterialBank} from './xbuddy-complete-material.js';
class C2MaterialBank extends FreeMaterialBank{
 getPoint(t,out=new T.Vector3()){const u=1-t,t2=t*t,t3=t2*t,t4=t3*t,t5=t4*t;return out.copy(this.A).multiplyScalar(1-10*t3+15*t4-6*t5).addScaledVector(this.B,10*t3-15*t4+6*t5).addScaledVector(this.U,this.h*(t-6*t3+8*t4-3*t5)).addScaledVector(this.W,this.h*(-4*t3+7*t4-3*t5)).addScaledVector(this.D,this.a*64*t3*u*u*u);}
 getTangent(t,out=new T.Vector3()){const u=1-t,t2=t*t,t3=t2*t,t4=t3*t;return out.copy(this.B).sub(this.A).multiplyScalar(30*t2*u*u).addScaledVector(this.U,this.h*(1-18*t2+32*t3-15*t4)).addScaledVector(this.W,this.h*(-12*t2+28*t3-15*t4)).addScaledVector(this.D,this.a*192*t2*u*u*(1-2*t)).normalize();}
}
// Interpolate the source factory's complete ring-centre path with a C1
// material source. A chord tangent jumps at ring knots and folds a finite-OD
// sweep when a free bank begins near one of those knots. No wire is removed.
export class MaterialPolyline extends T.CatmullRomCurve3{
 constructor(points){super(points.map(p=>p.clone()),false,'centripetal');this.arcLengthDivisions=1024;this.stockMM=super.getLength();}
 getLength(){return this.stockMM??super.getLength();}
}
export class CurvedTermination extends T.Curve{
 constructor(source,stock,nativeFrame,slot,prefixMM=.55*stock,handleFraction=.15,bankTurnRadians=0,bankDirectionNative=null){super();this.stockMM=stock;this.source=source;this.prefixMM=prefixMM;this.entryMM=3.75;this.entryStart=new T.Vector3(slot,-1,1.25).applyMatrix4(nativeFrame);this.end=new T.Vector3(slot,2.75,1.25).applyMatrix4(nativeFrame);this.axis=new T.Vector3(0,1,0).transformDirection(nativeFrame);this.bankStockMM=stock-this.prefixMM-this.entryMM;
  const anchor=source.getPointAt(this.prefixMM/source.getLength()),startT=source.getTangentAt(this.prefixMM/source.getLength()),mid=source.getPointAt(Math.min(1,(this.prefixMM+this.bankStockMM*.5)/source.getLength())),chord=this.entryStart.clone().sub(anchor),D=mid.sub(anchor.clone().add(this.entryStart).multiplyScalar(.5));D.addScaledVector(chord,-D.dot(chord)/chord.lengthSq());if(D.lengthSq()<1e-16)D.set(1,0,0).transformDirection(nativeFrame);D.normalize();
  const bankAxis=chord.clone().normalize();if(bankDirectionNative){D.fromArray(bankDirectionNative).transformDirection(nativeFrame).projectOnPlane(bankAxis);if(D.lengthSq()===0)throw Error('Singular authored bank reference frame');D.normalize();}D.applyAxisAngle(bankAxis,bankTurnRadians);this.bank=new C2MaterialBank({start:anchor,startT,end:this.entryStart,endT:this.axis,stock:this.bankStockMM,direction:D.toArray(),handleMM:Math.min(18,this.bankStockMM*handleFraction)});this.measuredMM=this.prefixMM+this.bank.measuredMM+this.entryMM;
 }
 getPointAt(u,out=new T.Vector3()){const s=T.MathUtils.clamp(u,0,1)*this.stockMM;if(s<=this.prefixMM)return this.source.getPointAt(s/this.source.getLength(),out);if(s<this.stockMM-this.entryMM)return this.bank.getPointAt((s-this.prefixMM)/this.bankStockMM,out);return out.copy(this.entryStart).addScaledVector(this.axis,s-(this.stockMM-this.entryMM));}getPoint(u,out){return this.getPointAt(u,out);}
 getTangentAt(u,out=new T.Vector3()){const s=T.MathUtils.clamp(u,0,1)*this.stockMM;if(s<=this.prefixMM)return this.source.getTangentAt(s/this.source.getLength(),out);if(s<this.stockMM-this.entryMM)return this.bank.getTangentAt((s-this.prefixMM)/this.bankStockMM,out);return out.copy(this.axis);}getTangent(u,out){return this.getTangentAt(u,out);}getLength(){return this.stockMM;}
}
export function materialPrefix(curve,length){return{getLength:()=>length,getPointAt:(u,out)=>curve.getPointAt(u*length/curve.getLength(),out),getTangentAt:(u,out)=>curve.getTangentAt(u*length/curve.getLength(),out)};}
