// MIT code; authored routing reference CC-BY-SA-4.0. No OEM bend/force specification.
import * as T from 'three';
import {Arc,path,join,lengthOf} from './cable-assembly/earth/curves.js';
const U=new T.Vector3(0,0,1),D=new T.Vector3(0,0,-1);
function tangentBiarc(a,b,axis){
 const delta=b.clone().sub(a),advance=delta.dot(axis),lateral=delta.clone().addScaledVector(axis,-advance),distance=lateral.length();
 if(!(advance>0))throw Error('FE free return requires positive tangent advance');
 if(distance===0)return[new T.LineCurve3(a,b)];
 const e=lateral.multiplyScalar(1/distance),r=(distance*distance+advance*advance)/(4*distance),angle=2*Math.atan2(distance,advance);
 if(!(r>1.1))throw Error('FE free return arc must contain the complete wire section');
 const c1=a.clone().addScaledVector(e,r),c2=b.clone().addScaledVector(e,-r),u2=e.clone().multiplyScalar(Math.cos(angle)).addScaledVector(axis,-Math.sin(angle)),v2=e.clone().multiplyScalar(Math.sin(angle)).addScaledVector(axis,Math.cos(angle));
 return[new Arc(c1,e.clone().negate(),axis,r,angle),new Arc(c2,u2,v2,r,angle)];
}
class EllipticTurn extends T.Curve{
 constructor(center,side,down,horizontal,vertical){super();Object.assign(this,{center,side,down,horizontal,vertical});this.arcLengthDivisions=8192;this.mm=lengthOf(t=>this.derivative(t),64);}
 getPoint(t,out=new T.Vector3()){return out.copy(this.center).addScaledVector(this.side,this.horizontal*Math.cos(Math.PI*t)).addScaledVector(this.down,this.vertical*Math.sin(Math.PI*t));}
 derivative(t,out=new T.Vector3()){return out.copy(this.side).multiplyScalar(-Math.PI*this.horizontal*Math.sin(Math.PI*t)).addScaledVector(this.down,Math.PI*this.vertical*Math.cos(Math.PI*t));}
 getTangent(t,out=new T.Vector3()){return this.derivative(t,out).normalize();}getLength(){return this.mm;}
}
class SpatialTurn extends T.Curve{
 constructor(origin,side,front,down,horizontal,vertical,angle,shift){super();Object.assign(this,{origin,side,front,down,horizontal,vertical,angle,shift});this.arcLengthDivisions=8192;this.mm=lengthOf(t=>this.derivative(t),64);}
 getPoint(t,out=new T.Vector3()){const w=t*t*t*(10-15*t+6*t*t),a=this.angle*(1-w),h=this.horizontal*(1+Math.cos(Math.PI*t)),s=T.MathUtils.clamp((t-.2)/.7,0,1),g=1-s*s*s*(10-15*s+6*s*s);return out.copy(this.origin).addScaledVector(this.side,h*Math.cos(a)).addScaledVector(this.front,h*Math.sin(a)).addScaledVector(this.down,this.vertical*Math.sin(Math.PI*t)).addScaledVector(this.shift,g);}
 derivative(t,out=new T.Vector3()){const w=t*t*t*(10-15*t+6*t*t),a=this.angle*(1-w),da=-this.angle*30*t*t*(1-t)*(1-t),h=this.horizontal*(1+Math.cos(Math.PI*t)),dh=-Math.PI*this.horizontal*Math.sin(Math.PI*t),s=T.MathUtils.clamp((t-.2)/.7,0,1),dg=t>.2&&t<.9?-30*s*s*(1-s)*(1-s)/.7:0;return out.copy(this.side).multiplyScalar(dh*Math.cos(a)-h*Math.sin(a)*da).addScaledVector(this.front,dh*Math.sin(a)+h*Math.cos(a)*da).addScaledVector(this.down,Math.PI*this.vertical*Math.cos(Math.PI*t)).addScaledVector(this.shift,dg);}
 getTangent(t,out=new T.Vector3()){return this.derivative(t,out).normalize();}getLength(){return this.mm;}
}
export function caseFreeReturn(reference,b,down,side,{lengthMM,direction,bendRadius=3,verticalRadius=bendRadius,spatial=false,shiftMM=[0,0]}){
 const d=down.clone().normalize(),front=new T.Vector3().crossVectors(d,side).normalize(),out=direction?direction.clone().normalize():front.clone().multiplyScalar(3).sub(side).normalize(),G=reference.trunk.getPoint(0),Tg=reference.trunk.getTangent(0),shift=side.clone().multiplyScalar(shiftMM[0]).addScaledVector(front,shiftMM[1]),S=b.clone().addScaledVector(out,2*bendRadius).add(shift),E=S.clone().addScaledVector(d,-2),J=new T.Vector3(-147.6,201,b.z+16),K=new T.Vector3(-147.6,S.y,b.z+8),pole=new T.Vector3(-149,201,J.z+8),P=pole.clone().setZ(Math.max(G.z,pole.z)+8),start=new T.Vector3(G.x,G.y,P.z),w=start.clone().sub(P),r=w.length()/2;
 if(!(r>1.1))throw Error('FE upper return must contain the complete wire section');
 const fixed=[...tangentBiarc(pole,J,D),...tangentBiarc(J,K,D),...tangentBiarc(K,E,D),new T.LineCurve3(E,S),spatial?new SpatialTurn(b,side,front,d,bendRadius,verticalRadius,Math.atan2(out.dot(front),out.dot(side)),shift):verticalRadius===bendRadius?new Arc(b.clone().addScaledVector(out,bendRadius),out,d,bendRadius,Math.PI):new EllipticTurn(b.clone().addScaledVector(out,bendRadius),out,d,bendRadius,verticalRadius)];
 const atHeight=z=>{const A=new T.Vector3(G.x,G.y,z),B=new T.Vector3(P.x,P.y,z);return path([join(G,Tg,A,U,Math.min(4,G.distanceTo(A)/3)),new Arc(A.clone().lerp(B,.5),w.clone().normalize(),U,r,Math.PI),new T.LineCurve3(B,pole),...fixed]);};
 const minimum=atHeight(P.z),gap=(lengthMM-minimum.getLength())/2,lift=gap<=0?0:gap>=2?gap:gap*gap*(4-gap)/4,height=P.z+lift;
 if(!Number.isFinite(lengthMM)||!(lengthMM>0))throw Error('FE source return allocation must be finite and positive');
 return atHeight(height);
}
