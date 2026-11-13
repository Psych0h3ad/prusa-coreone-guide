import * as T from './vendor/three.module.js';

const project=(n,t)=>n.clone().addScaledVector(t,-n.dot(t)).normalize();
export class ServiceFanCurve extends T.Curve{
 constructor(points){super();this.points=points;const n=points.length-1;this.knots=Array.from({length:n+5},(_,i)=>i<=3?0:i>=n+1?1:(i-3)/(n-2));}
 getPoint(t,target=new T.Vector3()){
  const n=this.points.length-1,u=T.MathUtils.clamp(t,0,1);let span=n;if(u<1){span=3;while(span<n&&u>=this.knots[span+1])span++;}
  const work=Array.from({length:4},(_,j)=>this.points[span-3+j].clone());
  for(let r=1;r<=3;r++)for(let j=3;j>=r;j--){const i=span-3+j,a=(u-this.knots[i])/(this.knots[i+4-r]-this.knots[i]);work[j].lerpVectors(work[j-1],work[j],a);}
  return target.copy(work[3]);
 }
 getTangent(t,target=new T.Vector3()){
  if(t===0)return target.subVectors(this.points[1],this.points[0]).normalize();
  if(t===1)return target.subVectors(this.points.at(-1),this.points.at(-2)).normalize();
  return super.getTangent(t,target);
 }
}
export function fanCableFrames(curve,id,samples=96,referenceRoll,referenceAngles,solve=true,sourceAcross){
 const centres=Array.from({length:samples+1},(_,i)=>curve.getPointAt(i/samples)),tangents=centres.map((_,i)=>curve.getTangentAt(i/samples).normalize()),rows=[];
 // A supplied source frame anchors all stages to the same cable exit. The
 // legacy interior anchor remains the default for existing stored routes.
 const nearest=p=>centres.reduce((best,v,i)=>v.distanceToSquared(p)<centres[best].distanceToSquared(p)?i:best,0),anchor=sourceAcross?0:nearest(curve.points[3]),axis=sourceAcross?new T.Vector3(...sourceAcross):new T.Vector3(1,0,0);
 rows[anchor]=project(axis,tangents[anchor]);if(rows[anchor].lengthSq()<.5)rows[anchor]=project(new T.Vector3(0,1,0),tangents[anchor]);
 for(const direction of [1,-1])for(let i=anchor+direction;i>=0&&i<=samples;i+=direction){const prev=i-direction,q=new T.Quaternion().setFromUnitVectors(tangents[prev],tangents[i]);rows[i]=project(rows[prev].clone().applyQuaternion(q),tangents[i]);}
 const plug=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),tangents[samples]),target=project(new T.Vector3(0,0,1).applyQuaternion(plug),tangents[samples]);
 let roll=Math.atan2(rows[samples].clone().cross(target).dot(tangents[samples]),rows[samples].dot(target));
 if(Number.isFinite(referenceRoll)){while(roll-referenceRoll>Math.PI)roll-=2*Math.PI;while(roll-referenceRoll<-Math.PI)roll+=2*Math.PI;}
 const start=Math.max(anchor,nearest(curve.points[id==='servicePrintLead'?5:4]));
 let angles=referenceAngles&&!solve?referenceAngles.slice():Array.from({length:samples+1},(_,i)=>{const u=T.MathUtils.clamp((i-start)/Math.max(1,samples-start),0,1);return roll*u*u*(3-2*u);});
 if(solve){
  const radius=curve.getLength()>1?.68:.00068,targets=[],weights=[];
  for(let i=0;i<=samples;i++){
   const lo=Math.max(0,i-1),hi=Math.min(samples,i+1),span=centres[lo].distanceTo(centres[hi]),curvature=tangents[hi].clone().sub(tangents[lo]).divideScalar(Math.max(span,1e-12)),bend=curvature.length()*radius,binormal=tangents[i].clone().cross(curvature).normalize(),cross=tangents[i].clone().cross(rows[i]);
   let target=Math.atan2(binormal.dot(cross),binormal.dot(rows[i])),reference=referenceAngles?.[i]??angles[i];
   while(target-reference>Math.PI/2)target-=Math.PI;while(target-reference<-Math.PI/2)target+=Math.PI;
   targets[i]=target;weights[i]=500*Math.max(0,bend-.2)**2;
   if(i<=anchor+2){targets[i]=0;weights[i]=1e6;}if(i===samples){targets[i]=roll;weights[i]=1e8;}
  }
  const diagonal=[],rhs=[];
  for(let i=0;i<=samples;i++){const w=weights[i],factor=i?1/diagonal[i-1]:0;diagonal[i]=w+(i&&i<samples?2:1)-factor;rhs[i]=w*targets[i]+(i?rhs[i-1]*factor:0);}
  angles[samples]=rhs[samples]/diagonal[samples];for(let i=samples-1;i>=0;i--)angles[i]=(rhs[i]+angles[i+1])/diagonal[i];
 }
 for(let i=0;i<=samples;i++)rows[i].applyAxisAngle(tangents[i],angles[i]);
 return {centres,tangents,rows,plug,roll,angles};
}
