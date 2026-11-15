import * as T from 'three';
import {V,Q,ArcCurve,Joined,slice,cubic} from './heatbed-material-curves.js';
// Free ends have full native eyelets, rather than packet-sized bare tips.
// Keep both unchanged source ports and give the retained metal a real fan
// plus an 8mm straight crimp stem. The two neutral budgets close upstream.
export function terminalGuides(raw,routing){
 const lead=raw.map(c=>slice(c,0,4)),p=lead.map(c=>c.getPointAt(1)),t=lead.map(c=>c.getTangentAt(1)),a=p[0].clone().add(p[1]).multiplyScalar(.5),ta=t[0].clone().add(t[1]).normalize(),tip=V([-38,192,258]),stem=tip.clone().add(V([0,0,8])),link=cubic(a,ta,stem,V([0,0,-1]),15,15),common=new Joined([link,new T.LineCurve3(stem,tip)]),L=common.getLength(),N=512,frames=[];
 let prior=common.getTangentAt(0),normal=p[1].clone().sub(p[0]).normalize();normal.addScaledVector(prior,-normal.dot(prior)).normalize();
 for(let i=0;i<=N;i++){const tangent=common.getTangentAt(i/N);if(i)normal.applyQuaternion(new T.Quaternion().setFromUnitVectors(prior,tangent));normal.addScaledVector(tangent,-normal.dot(tangent)).normalize();frames.push(normal.clone());prior=tangent;}
 const desired=V([-1,0,0]),roll=Math.atan2(frames[N].clone().cross(desired).dot(prior),frames[N].dot(desired)),half=p[0].distanceTo(p[1])/2;
 return raw.map((old,i)=>{const fan=new ArcCurve(u=>{const f=u*N,k=Math.min(N-1,Math.floor(f)),T=common.getTangentAt(u),n=frames[k].clone().lerp(frames[k+1],f-k).normalize().applyAxisAngle(T,roll*Q(u)),d=half+(5-half)*Q(u*L/link.getLength());return common.getPointAt(u).addScaledVector(n,(i?1:-1)*d);},2048),parked=new Joined([lead[i],fan]);return routing===0?parked:new ArcCurve(u=>parked.getPointAt(u).lerp(old.getPointAt(u),Q(routing)),2048);});
}
