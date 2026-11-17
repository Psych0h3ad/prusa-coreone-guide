import * as T from 'three';
const zero=()=>new T.Vector3();
// A true circular arc through Q with prescribed initial tangent at P.
// Exact collinearity is the straight-line limit of the same construction.
class TangentArc44 extends T.Curve{
 constructor(P,U,Q){super();this.P=P.clone();this.U=U.clone().normalize();const D=Q.clone().sub(P),x=D.dot(this.U),normal=D.clone().addScaledVector(this.U,-x),y=normal.length();
  if(D.lengthSq()===0)throw Error('Zero-length physical biarc member');
  this.angle=2*Math.atan2(y,x);this.radius=y===0?Infinity:D.lengthSq()/(2*y);this.L=y===0?D.length():this.radius*this.angle;this.N=y===0?zero():normal.divideScalar(y);this.straight=y===0;
  if(this.straight&&x<=0)throw Error('Backward collinear physical biarc has no regular straight member');
 }
 getPoint(t,out=zero()){if(this.straight)return out.copy(this.P).addScaledVector(this.U,this.L*t);const a=this.angle*t,sinc=a===0?1:Math.sin(a)/a,cosc=a===0?0:2*Math.sin(a/2)**2/a;return out.copy(this.P).addScaledVector(this.U,this.L*t*sinc).addScaledVector(this.N,this.L*t*cosc);}
 getTangent(t,out=zero()){return out.copy(this.U).multiplyScalar(Math.cos(this.angle*t)).addScaledVector(this.N,Math.sin(this.angle*t));}
 getPointAt(t,out){return this.getPoint(t,out);}getTangentAt(t,out){return this.getTangent(t,out);}getLength(){return this.L;}
}
export class Biarc44 extends T.Curve{
 constructor(P,U,G,W,ratio=1){super();const D=G.clone().sub(P),a=2*ratio*(1-T.MathUtils.clamp(U.dot(W),-1,1)),b=D.dot(U.clone().multiplyScalar(ratio).add(W)),denominator=b+Math.sqrt(b*b+a*D.lengthSq());
  if(!(ratio>0&&denominator>0))throw Error('Physical biarc tangent chart is not regular');
  const d=D.lengthSq()/denominator,M=P.clone().addScaledVector(G,ratio).addScaledVector(U,ratio*d).addScaledVector(W,-ratio*d).divideScalar(1+ratio);
  this.first=new TangentArc44(P,U,M);this.reverse=new TangentArc44(G,W.clone().negate(),M);this.L=this.first.L+this.reverse.L;this.minimumRadiusMM=Math.min(this.first.radius,this.reverse.radius);this.joinTangentDot=this.first.getTangent(1).dot(this.reverse.getTangent(1).negate());this.ratio=ratio;
  if(this.joinTangentDot<1-1e-10)throw Error('Biarc tangent join algebra failed '+this.joinTangentDot);
 }
 getPoint(t,out=zero()){const s=t*this.L;return s<=this.first.L?this.first.getPoint(s/this.first.L,out):this.reverse.getPoint(1-(s-this.first.L)/this.reverse.L,out);}
 getTangent(t,out=zero()){const s=t*this.L;return s<=this.first.L?this.first.getTangent(s/this.first.L,out):this.reverse.getTangent(1-(s-this.first.L)/this.reverse.L,out).negate();}
 getPointAt(t,out){return this.getPoint(t,out);}getTangentAt(t,out){return this.getTangent(t,out);}getLength(){return this.L;}
}
