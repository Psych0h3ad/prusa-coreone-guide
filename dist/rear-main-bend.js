import * as T from 'three';
import {derivativeLength} from './rear-main-curves.js';
import {ArcPath,Cubic,V,writeRing} from './rear-main-curves.js';
class BumpedCubic extends T.Curve{
 constructor(points,amplitude){super();this.p=points.map(V);this.amplitude=amplitude;this.window=.4;this.arc=[0];let prior=this.derivative(0).length();for(let i=1;i<=512;i++){const next=this.derivative(i/512).length();this.arc.push(this.arc.at(-1)+(prior+next)/1024);prior=next;}const total=this.arc.at(-1);this.arc=this.arc.map(s=>s/total);this.length=this.measured();}
 derivative(t){const [a,b,c,d]=this.p,s=1-t,q=T.MathUtils.clamp(t/this.window,0,1),v=192*q*q*(1-q)**2*(1-2*q)/this.window,out=b.clone().sub(a).multiplyScalar(3*s*s).addScaledVector(c.clone().sub(b),6*s*t).addScaledVector(d.clone().sub(c),3*t*t);out.z+=this.amplitude*v;return out;}
 parameter(t){if(t<=0||t>=1)return t;let lo=0,hi=512;while(hi-lo>1){const m=(lo+hi)>>1;if(this.arc[m]<t)lo=m;else hi=m;}return(lo+(t-this.arc[lo])/(this.arc[hi]-this.arc[lo]))/512;}
 getPointAt(t,out=new T.Vector3()){const u=this.parameter(t),s=1-u,[a,b,c,d]=this.p,q=T.MathUtils.clamp(u/this.window,0,1);out.set(0,0,0).addScaledVector(a,s**3).addScaledVector(b,3*s*s*u).addScaledVector(c,3*s*u*u).addScaledVector(d,u**3);out.z+=this.amplitude*64*q**3*(1-q)**3;return out;}
 getTangentAt(t,out=new T.Vector3()){return out.copy(this.derivative(this.parameter(t))).normalize();}
 getLength(){return this.length;}
 measured(parts=16){return [[0,this.window],[this.window,1]].reduce((sum,[a,b])=>sum+derivativeLength(t=>this.derivative(a+t*(b-a)).multiplyScalar(b-a),parts),0);}
}
export function makeMovingMain(reference,basePath,amplitude){
 const changed=new BumpedCubic(reference.segments[4].points,amplitude),points=reference.segments[0].points.map(V),rest=basePath.curves.slice(1).reduce((sum,c,i)=>sum+(i===3?changed.getLength():c.getLength()),0),target=reference.stockMM-rest;
 const controls=f=>{const p=points.map(v=>v.clone());p[1].sub(p[0]).multiplyScalar(f).add(p[0]);return p.map(v=>v.toArray());};
 let lo=.01,hi=4;for(let i=0;i<43;i++){const mid=(lo+hi)/2,c=new Cubic(controls(mid),0);if(c.measured(32)<target)lo=mid;else hi=mid;}
 const factor=(lo+hi)/2,root=new Cubic(controls(factor),target),path=new ArcPath();for(let i=0;i<basePath.curves.length;i++)path.add(i===0?root:i===4?changed:basePath.curves[i]);
 if(Math.abs(root.measured(64)+rest-reference.stockMM)>1e-8)throw Error('Moving main stock mismatch');path.motionReport={amplitudeMM:amplitude,rootHandleFactor:factor,stockMM:path.getLength()};return path;
}
export function writeMovingMain(entity,path,reference){
 for(let i=1;i<256;i++){const t=i/256,centre=path.getPointAt(t),tangent=path.getTangentAt(t),normal=V(reference.normals[i]);normal.addScaledVector(tangent,-normal.dot(tangent)).normalize();writeRing(entity.geometry,i,centre.toArray(),tangent.toArray(),normal.toArray(),4);}
 for(const n of ['position','normal'])entity.geometry.attributes[n].needsUpdate=true;entity.geometry.computeBoundingBox();entity.geometry.computeBoundingSphere();
}
