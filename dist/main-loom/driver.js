import * as T from 'three';
import {mainLoomRest}from './rest.js?v=20261112-113';
const smooth=(x,a=0,b=1)=>T.MathUtils.smoothstep(x,a,b);
function softMinimum(a,b,w){const d=a-b;return d<=-w?a:d>=w?b:b+d/2-d*d/(4*w)-w/4;}
export class MainLoomFollow{
 constructor({segments=384,roundingMM=10,raisedOffsetMM=12}={}){
  Object.assign(this,{segments,roundingMM,raisedOffsetMM});const rest=mainLoomRest();this.rest=rest;
  this.bareLength=rest.splice.getLength();this.length=this.bareLength+rest.jacket.getLength();
  const at=s=>s<=this.bareLength?rest.route.getPointAt(1-s/rest.route.getLength()):rest.jacket.getPointAt(1-(s-this.bareLength)/rest.jacket.getLength());
  this.referenceStations=[...new Set([...Array.from({length:segments+1},(_,i)=>this.length*i/segments),this.bareLength,rest.route.getLength()])].sort((a,b)=>a-b);this.final=this.referenceStations.map(at);this.segments=this.final.length-1;
  this.lengths=this.final.slice(1).map((p,i)=>p.distanceTo(this.final[i]));
  this.material=[0];for(const length of this.lengths)this.material.push(this.material.at(-1)+length);
  this.materialLength=this.material.at(-1);this.cutIndex=this.referenceStations.indexOf(this.bareLength);this.cutMaterial=this.material[this.cutIndex];this.wireRootIndex=this.referenceStations.indexOf(rest.route.getLength());this.wireRootMaterial=this.material[this.wireRootIndex];
  this.centres=this.lengths.map((_,i)=>(this.material[i]+this.material[i+1])/2);
  this.directions=this.final.slice(1).map((p,i)=>p.clone().sub(this.final[i]).normalize());
  const tangent=rest.prefix.getTangent(1);this.axis=new T.Vector3(-tangent.x,-tangent.y,0).normalize();this.openNormal=new T.Vector3(-this.axis.y,this.axis.x,0);
  this.bottomWeights=this.centres.map(s=>smooth(s,35.5,39.5)*(1-smooth(s,50.5,54.5)));
  this.backWeights=this.centres.map(s=>smooth(s,68,75)*(1-smooth(s,116,123)));
 }
 raisedDirections(offset){
  if(offset===0)return this.directions.map(d=>d.clone());
  let a=.2*offset/12,b=.35*offset/12;
  for(let iteration=0;iteration<12;iteration++){
   let yn=0,z=0,j00=0,j01=0,j10=0,j11=0;
   this.directions.forEach((d,i)=>{
    const c0=this.bottomWeights[i],c1=-this.backWeights[i],theta=a*c0+b*c1,s=Math.sin(theta),c=Math.cos(theta),dn=d.dot(this.openNormal),dz=d.z,l=this.lengths[i];
    yn+=((c-1)*dn-s*dz)*l;z+=(s*dn+(c-1)*dz)*l;
    const dy=-s*dn-c*dz,ddz=c*dn-s*dz;j00+=dy*c0*l;j01+=dy*c1*l;j10+=ddz*c0*l;j11+=ddz*c1*l;
   });
   const e0=yn-offset,e1=z;if(Math.max(Math.abs(e0),Math.abs(e1))<1e-10)break;
   const det=j00*j11-j01*j10;if(Math.abs(det)<1e-8)throw Error('Degenerate cloth-offset frame');
   a-=(e0*j11-e1*j01)/det;b-=(e1*j00-e0*j10)/det;
  }
  if(Math.max(Math.abs(a),Math.abs(b))>Math.PI/3)throw Error('Excessive offset bend');
  return this.directions.map((d,i)=>d.clone().applyAxisAngle(this.axis,a*this.bottomWeights[i]-b*this.backWeights[i]));
 }
 tangentAt(s,directions){
  if(s<=this.centres[0])return directions[0].clone();if(s>=this.centres.at(-1))return directions.at(-1).clone();
  let lo=0,hi=this.centres.length-1;while(hi-lo>1){const mid=(lo+hi)>>1;if(this.centres[mid]<s)lo=mid;else hi=mid;}
  const f=(s-this.centres[lo])/(this.centres[hi]-this.centres[lo]),q=new T.Quaternion().setFromUnitVectors(directions[lo],directions[hi]);
  return directions[lo].clone().applyQuaternion(new T.Quaternion().slerp(q,f)).normalize();
 }
 pose(amount){
  amount=T.MathUtils.clamp(amount,0,4);const offset=amount<=3?this.raisedOffsetMM:this.raisedOffsetMM*(1-smooth(amount-3));
  const directions=this.raisedDirections(offset),front=amount<=1?-this.roundingMM:amount<2?T.MathUtils.lerp(-this.roundingMM,this.materialLength+this.roundingMM,smooth(amount-1)):this.materialLength+this.roundingMM;
  const nodes=[this.final[0].clone()];
  for(let i=0;i<this.segments;i++){
   const s=softMinimum(this.centres[i],front,this.roundingMM),d=this.tangentAt(Math.max(0,s),directions);
   nodes.push(nodes.at(-1).clone().addScaledVector(d,this.lengths[i]));
  }
  return{amount,nodes,front,offset,twist:amount<1?-Math.PI*(1-smooth(amount)):0,
   unitRotationXDeg:amount<2?-90:amount<3?-90+180*smooth(amount-2):90};
 }
}
