// SPDX-License-Identifier: MIT
import*as T from'three';
const V=p=>p?.isVector3?p.clone():new T.Vector3(...p);
export class PointSourceCurve extends T.Curve{
 constructor(points){super();this.points=points.map(V);this.lengths=[0];for(let i=1;i<this.points.length;i++)this.lengths.push(this.lengths.at(-1)+this.points[i].distanceTo(this.points[i-1]));this.arcLengthDivisions=1024;}
 getPoint(t,out=new T.Vector3()){const s=T.MathUtils.clamp(t,0,1)*this.lengths.at(-1);let lo=0,hi=this.points.length-1;while(hi-lo>1){const k=(lo+hi)>>1;if(this.lengths[k]<s)lo=k;else hi=k;}return out.copy(this.points[lo]).lerp(this.points[hi],(s-this.lengths[lo])/(this.lengths[hi]-this.lengths[lo]||1));}
 getPointAt(t,out=new T.Vector3()){return this.getPoint(t,out);}
 getTangentAt(t,out=new T.Vector3()){return this.getPoint(Math.min(1,t+1e-5),out).sub(this.getPoint(Math.max(0,t-1e-5))).normalize();}
 getLength(){return this.lengths.at(-1);}
}
