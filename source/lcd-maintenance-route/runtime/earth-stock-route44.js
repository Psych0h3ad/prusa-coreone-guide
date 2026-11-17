import * as T from 'three';
import {prefix43} from './earth-prefix-stock44.js';
import {tail43} from './earth-tail-stock44.js';
const S=T.MathUtils.smoothstep;
export class EarthStockRoute44{
 constructor(native,sourcePrefix){
  this.native=native;this.stock=sourcePrefix.getLength();let lo=0,hi=40;
  if(prefix43(lo).getLength()>this.stock||prefix43(hi).getLength()<this.stock)throw Error('Source FE prefix stock is not bracketed');
  for(let i=0;i<48;i++){const m=(lo+hi)/2;if(prefix43(m).getLength()<this.stock)lo=m;else hi=m;}
  this.amplitude=(lo+hi)/2;this.prefix=prefix43(this.amplitude);this.applied=false;
 }
 follow(end,sourcePath,release=0,context=null){
  const e=this.native,N=e.samples,boundary=sourcePath.computeFrenetFrames(N,false),built=tail43(end,release,context),curve=new T.CurvePath();curve.add(this.prefix);curve.add(built.curve);const total=curve.getLength(),grid=4096,Tan=[],Axis=[],q=new T.Quaternion();let a=boundary.normals[0].clone();
  for(let i=0;i<=grid;i++){const t=curve.getTangent(i/grid).normalize();if(i)a.applyQuaternion(q.setFromUnitVectors(Tan[i-1],t));a.addScaledVector(t,-a.dot(t)).normalize();Tan.push(t);Axis.push(a.clone());}
  const target=boundary.normals[N].clone(),roll=Math.atan2(Tan[grid].dot(Axis[grid].clone().cross(target)),Axis[grid].dot(target));for(let i=0;i<=grid;i++)Axis[i].applyAxisAngle(Tan[i],roll*S(total*i/grid,total-80,total-10));
  const p=e.geometry.attributes.position,n=e.geometry.attributes.normal;
  for(let i=0;i<=N;i++){const z=i/N*grid,k=Math.min(grid-1,Math.floor(z)),t=curve.getTangent(i/N).normalize(),normal=Axis[k].clone().lerp(Axis[k+1],z-k);normal.addScaledVector(t,-normal.dot(t)).normalize();const binormal=t.clone().cross(normal).normalize(),c=curve.getPoint(i/N).multiplyScalar(.001);
   for(let j=0;j<=8;j++){const phi=j/8*Math.PI*2,out=normal.clone().multiplyScalar(-Math.cos(phi)).addScaledVector(binormal,Math.sin(phi)),at=i*9+j;n.setXYZ(at,out.x,out.y,out.z);p.setXYZ(at,c.x+out.x*e.radius*.001,c.y+out.y*e.radius*.001,c.z+out.z*e.radius*.001);}
  }
  p.needsUpdate=n.needsUpdate=true;e.geometry.computeBoundingBox();e.geometry.computeBoundingSphere();e.route=curve;e.prefix=this.prefix;e.tail=built.curve;e.tailAmplitude=built.amplitude;e.mesh.userData.routingLengthError=built.integratedMM-360;this.applied=true;
  e.mesh.userData.wholeEarthMaterial={prefixStockMM:this.stock,tailStockMM:360,radiusMM:e.radius,fullOriginalIndex:true};this.receipt={originalPrefixStockMM:this.stock,newPrefixMM:this.prefix.getLength(),tailMM:built.curve.getLength(),tailIntegratedMM:built.integratedMM,tailStockMM:360,totalMM:total,amplitudeMM:this.amplitude,tailAmplitudeMM:built.amplitude,endCircleRollCorrection:roll,rootAndThreeClipAnchorsRetained:true,fullOriginalFaces:e.geometry.index.count/3,endMM:end.toArray()};
 }

}
