// Original native ground-lead reference: code MIT, authored parameters CC BY-SA4.0.
// Millimetres, radius1, retained110mm illustrative stock. No OEM bend/stock claim.
import * as T from 'three';
const V=a=>new T.Vector3(...a),A=V([-148,170,12]),U=V([-0.996266731216656,0,0.08632844415880332]),S=t=>{t=T.MathUtils.clamp(t,0,1);return t*t*t*(10+t*(-15+6*t));};
class SourceHandoff extends T.Curve{
 constructor(){super();this.arcLengthDivisions=512;}
 getPoint(t,out=new T.Vector3()){const a=Math.PI*t;return out.copy(A).addScaledVector(U,1.7*Math.sin(a)).addScaledVector(V([0,1,0]),1.7*(1-Math.cos(a)));}
 getTangent(t,out=new T.Vector3()){const a=Math.PI*t;return out.copy(U).multiplyScalar(Math.cos(a)).addScaledVector(V([0,1,0]),Math.sin(a));}
}
class CircleTurn extends T.Curve{
 constructor(start,Tn,N,radius,angle,endTangent){super();Object.assign(this,{start,Tn,N,radius,angle,endTangent});this.arcLengthDivisions=512;}
 getPoint(t,out=new T.Vector3()){const a=t*this.angle;return out.copy(this.start).addScaledVector(this.Tn,this.radius*Math.sin(a)).addScaledVector(this.N,this.radius*(1-Math.cos(a)));}
 getTangent(t,out=new T.Vector3()){if(t<=0)return out.copy(this.Tn);if(t>=1)return out.copy(this.endTangent);const a=t*this.angle;return out.copy(this.Tn).multiplyScalar(Math.cos(a)).addScaledVector(this.N,Math.sin(a));}
}
class FirstQuarter extends T.Curve{
 constructor(x,y){super();this.x=x;this.y=y;this.arcLengthDivisions=512;}
 getPoint(t,out=new T.Vector3()){const a=Math.PI-t*Math.PI/2;return out.set(this.x+4*Math.cos(a),this.y,19+4*Math.sin(a));}
 getTangent(t,out=new T.Vector3()){if(t<=0)return out.set(0,0,1);if(t>=1)return out.set(1,0,0);const a=Math.PI-t*Math.PI/2;return out.set(Math.sin(a),0,-Math.cos(a));}
}
class Ellipse extends T.Curve{
 constructor(width,begin,x,y){super();this.width=width;this.begin=begin;this.x=x;this.y=y;this.arcLengthDivisions=1024;}
 getPoint(t,out=new T.Vector3()){const a=this.begin+(Math.PI-this.begin)*t;return out.set(this.x+this.width*Math.sin(a),this.y,31-8*Math.cos(a));}
 getTangent(t,out=new T.Vector3()){if(t>=1)return out.set(-1,0,0);const a=this.begin+(Math.PI-this.begin)*t;return out.set(this.width*Math.cos(a),0,8*Math.sin(a)).normalize();}
 curvatureAt(a){const d=V([this.width*Math.cos(a),0,8*Math.sin(a)]),dd=V([-this.width*Math.sin(a),0,8*Math.cos(a)]),t=d.clone().normalize();return dd.addScaledVector(t,-dd.dot(t)).multiplyScalar(1/d.lengthSq());}
}
class EndQuarter extends T.Curve{
 constructor(B,Tn,right){super();Object.assign(this,{B,Tn,right});this.arcLengthDivisions=512;this.centre=B.clone().addScaledVector(right,-3);}
 getPoint(t,out=new T.Vector3()){const a=-Math.PI/2+t*Math.PI/2;return out.copy(this.centre).addScaledVector(this.right,3*Math.cos(a)).addScaledVector(this.Tn,3*Math.sin(a));}
 getTangent(t,out=new T.Vector3()){if(t<=0)return out.copy(this.right);if(t>=1)return out.copy(this.Tn);const a=-Math.PI/2+t*Math.PI/2;return out.copy(this.right).multiplyScalar(-Math.sin(a)).addScaledVector(this.Tn,Math.cos(a));}
}
class Quintic extends T.Curve{
 constructor(A,B,D,E,DD,EE){super();this.arcLengthDivisions=1024;this.P=[A,A.clone().addScaledVector(D,.2),A.clone().addScaledVector(D,.4).addScaledVector(DD,.05),B.clone().addScaledVector(E,-.4).addScaledVector(EE,.05),B.clone().addScaledVector(E,-.2),B];}
 getPoint(t,out=new T.Vector3()){const u=1-t,w=[u**5,5*u**4*t,10*u**3*t*t,10*u*u*t**3,5*u*t**4,t**5];out.set(0,0,0);for(let i=0;i<6;i++)out.addScaledVector(this.P[i],w[i]);return out;}
 getTangent(t,out=new T.Vector3()){const u=1-t,w=[u**4,4*u**3*t,6*u*u*t*t,4*u*t**3,t**4];out.set(0,0,0);for(let i=0;i<5;i++)out.addScaledVector(new T.Vector3().subVectors(this.P[i+1],this.P[i]),5*w[i]);return out.normalize();}
}
class InsetTail extends Quintic{
 constructor(A,B,D,E,DD,EE,insetMM){super(A,B,D,E,DD,EE);this.insetMM=insetMM;}
 getPoint(t,out=new T.Vector3()){super.getPoint(t,out);out.y-=this.insetMM*64*t*t*t*(1-t)*(1-t)*(1-t);return out;}
 getTangent(t,out=new T.Vector3()){const u=1-t,w=[u**4,4*u**3*t,6*u*u*t*t,4*u*t**3,t**4];out.set(0,0,0);for(let i=0;i<5;i++)out.addScaledVector(new T.Vector3().subVectors(this.P[i+1],this.P[i]),5*w[i]);out.y-=this.insetMM*192*t*t*u*u*(1-2*t);return out.normalize();}
}
function atRadius(width,end,back,prefix){
 const first=new FirstQuarter(prefix.centreX,prefix.planeY),theta=4/width,ellipse=new Ellipse(width,theta,prefix.centreX,prefix.planeY),E=ellipse.getPoint(0),join=new Quintic(first.getPoint(1),E,V([4,0,0]),ellipse.getTangent(0).multiplyScalar(4),V([0,0,-4]),ellipse.curvatureAt(theta).multiplyScalar(16));
 const Tn=back.clone().negate(),right=V([1,-S((191.628278-end.y)/(191.628278-167.2)),0]).projectOnPlane(Tn);if(right.lengthSq()===0)right.set(0,1,0).projectOnPlane(Tn);right.normalize();const B=end.clone().addScaledVector(back,1.5),last=new EndQuarter(B,Tn,right),travel=S((191.628278-end.y)/(191.628278-167.2)),inset=48*travel*(1-travel),tail=new InsetTail(ellipse.getPoint(1),last.getPoint(0),V([-10,0,0]),right.clone().multiplyScalar(12),V([0,0,-8*100/(width*width)]),Tn.clone().multiplyScalar(144/3),inset);
 const curve=new T.CurvePath();curve.arcLengthDivisions=2048;for(const c of[prefix,first,join,ellipse,tail,last,new T.LineCurve3(B,end.clone())])curve.add(c);const original=curve.getTangent.bind(curve);curve.getTangent=(t,out=new T.Vector3())=>t<=0?out.copy(U):t>=1?out.copy(Tn):original(t,out);return {curve,length:curve.getLength(),radius:width};
}
export function nativeGroundLeadRoute(end,back,stockMM=110){
 const entry=new SourceHandoff(),F=U.clone().negate(),Y=V([0,1,0]),Z=V([0,0,1]),s1=new CircleTurn(entry.getPoint(1),F,Y,2.3,Math.PI/2,Y),s2=new CircleTurn(s1.getPoint(1),Y,F,2.3,Math.PI/2,F),N=Z.clone().addScaledVector(F,-F.dot(Z)).normalize(),lift=new CircleTurn(s2.getPoint(1),F,N,7,Math.acos(F.dot(Z)),Z),G=lift.getPoint(1),prefix=new T.CurvePath();prefix.arcLengthDivisions=2048;for(const c of[entry,s1,s2,lift,new T.LineCurve3(G,V([G.x,G.y,19]))])prefix.add(c);prefix.centreX=G.x+4;prefix.planeY=G.y;let lo=atRadius(8,end,back,prefix),hi=atRadius(40,end,back,prefix);if(!(lo.length<=stockMM&&hi.length>=stockMM))throw Error('Native ground source endpoints cannot bracket retained stock');let best=lo;
 for(let i=0;i<44;i++){let w=lo.radius+(stockMM-lo.length)*(hi.radius-lo.radius)/(hi.length-lo.length);if(!(w>lo.radius&&w<hi.radius)||i%4===3)w=(lo.radius+hi.radius)/2;if(w===lo.radius||w===hi.radius)break;const q=atRadius(w,end,back,prefix);if(Math.abs(q.length-stockMM)<Math.abs(best.length-stockMM))best=q;if(q.length===stockMM){best=q;break;}if(q.length<stockMM)lo=q;else hi=q;}
 return {curve:best.curve,receipt:{kind:'Source prefix, broad elliptical return and C2 terminal quarter approach',stockMM,measuredRuntimeCurveMM:best.length,stockResidualMM:best.length-stockMM,returnMajorMM:best.radius,returnMinorMM:8,sourceStartTangent:U.toArray(),sourceHandoffRadiusMM:1.7,sourceSCurveRadiusMM:2.3,sourceLiftRadiusMM:7,returnPlaneYMM:prefix.planeY,firstQuarterRadiusMM:4,terminalQuarterRadiusMM:3,inwardSweep:{maximumMM:12,displacementDirection:[0,-1,0],boundaryDerivativeOrder:2,driver:"actual source terminal outlet Y"},terminalApproachDirection:[1,-S((191.628278-end.y)/(191.628278-167.2)),0],approachFrameTransport:{coordinate:"source terminal outlet Y",looseOutletYMM:191.628278,installedOutletYMM:167.2,interpolation:"quintic continuous frame"},endStraightMM:1.5,wireRadiusMM:1,samples:128,sides:8,physicalMeasurement:false,qualification:'Retained authored110mm material stock, not OEM metrology. Runtime sampled curve length; no force/continuous clearance certificate.'}};
}
export function writeNativeGroundLead(g,curve,sourceFrames,inverseFrame){
 const frames=curve.computeFrenetFrames(128,false),Tend=frames.tangents[128],from=frames.normals[128],target=sourceFrames.normals[128],roll=Math.atan2(Tend.dot(from.clone().cross(target)),from.dot(target)),p=g.attributes.position,n=g.attributes.normal,normalFrame=inverseFrame?new T.Matrix3().getNormalMatrix(inverseFrame):null;
 for(let i=0;i<=128;i++){
  const c=curve.getPointAt(i/128),Tn=frames.tangents[i],N=i===0?sourceFrames.normals[0].clone():i===128?sourceFrames.normals[128].clone():frames.normals[i].clone().applyAxisAngle(Tn,roll*S(i/128)),B=i===128?sourceFrames.binormals[128]:new T.Vector3().crossVectors(Tn,N);
  for(let j=0;j<=8;j++){const a=j/8*2*Math.PI,q=N.clone().multiplyScalar(-Math.cos(a)).addScaledVector(B,Math.sin(a)),k=i*9+j;if(inverseFrame){const local=c.clone().multiplyScalar(.001).applyMatrix4(inverseFrame);q.applyMatrix3(normalFrame).normalize();p.setXYZ(k,local.x+q.x*.001,local.y+q.y*.001,local.z+q.z*.001);}else p.setXYZ(k,(c.x+q.x)*.001,(c.y+q.y)*.001,(c.z+q.z)*.001);n.setXYZ(k,q.x,q.y,q.z);}
 }
 p.needsUpdate=n.needsUpdate=true;g.computeBoundingBox();g.computeBoundingSphere();
}
