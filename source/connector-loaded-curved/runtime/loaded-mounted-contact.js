// Original rigid-frame/contact-plane constraint. MIT code / CC BY-SA4.0 parameters.
// The full existing header/housing remains unchanged. No force/strain model.
import * as T from 'three';
import {mapLeaf} from './loaded-contact-state.js';
const turn=(a,b,p)=>(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]);
function clip(poly,axis,value,sign){const out=[];for(let i=0;i<poly.length;i++){const p=poly[i],q=poly[(i+1)%poly.length],a=(p[axis]-value)*sign,b=(q[axis]-value)*sign;if(a>=0)out.push(p);if(a*b<0){const t=a/(a-b);out.push([p[0]+t*(q[0]-p[0]),p[1]+t*(q[1]-p[1])]);}}return out;}
export function createMountedContactConstraint(parameters){
 const Q=structuredClone(parameters.unloadedHeaderContour),C=Q.lowerNoseCenter,R=Q.lowerNoseRadius,width=parameters.headerContactWidthMM;
 if(!(width>0))throw Error('Required independent header contact width');
 const tangent=p=>{const a=Math.atan2(p[1]-C[1],p[0]-C[0]),off=Math.acos(R/Math.hypot(p[0]-C[0],p[1]-C[1]));return[-1,1].map(s=>[C[0]+R*Math.cos(a+s*off),C[1]+R*Math.sin(a+s*off)]).sort((a,b)=>b[1]-a[1])[0];},t0=tangent(Q.lowerStart),t1=tangent(Q.lowerShoulder),stations=[Q.lowerStart,t0,t1,Q.lowerShoulder,...Q.lowerBackStations];
 function top(y){for(let i=0;i<stations.length-1;i++){const a=stations[i],b=stations[i+1];if(a[0]<=y&&y<=b[0])return i===1?C[1]+Math.sqrt(Math.max(0,R*R-(y-C[0])**2)):a[1]+(b[1]-a[1])*(y-a[0])/(b[0]-a[0]);}throw Error('Outside source contact contour');}
 function gap(relative,slot,pins,angle){
  const mapped=(x,s)=>{const p=mapLeaf(x+slot,s,-.075,angle).p;p[1]+=.05;return new T.Vector3(...p).applyMatrix4(relative);},p=mapped(0,.30),normal=new T.Vector3(0,-Math.sin(angle),Math.cos(angle)).transformDirection(relative),rectangle=[mapped(-.405,.30),mapped(.405,.30),mapped(.405,3.60),mapped(-.405,3.60)],polygon=rectangle.map(p=>[p.x,p.y]);
  if(normal.z<=0)return{gapMM:null,contactYMM:null,sourceHeaderCircuit:null,unsupportedOrientation:true};
  const a=-normal.x/normal.z,b=-normal.y/normal.z,c=p.z-a*p.x-b*p.y;let result={gapMM:null,contactYMM:null,sourceHeaderCircuit:null};
  for(let circuit=0;circuit<pins;circuit++){
   const x=(circuit-(pins-1)/2)*1.5;let poly=clip(polygon,0,x-width/2,1);poly=clip(poly,0,x+width/2,-1);poly=clip(poly,1,stations[0][0],1);poly=clip(poly,1,stations.at(-1)[0],-1);if(poly.length<3)continue;
   const ys=[...new Set([...poly.map(p=>p[1]),...stations.map(p=>p[0]).filter(y=>Math.min(...poly.map(p=>p[1]))<=y&&y<=Math.max(...poly.map(p=>p[1])))])].sort((a,b)=>a-b);
   for(let i=0;i<ys.length-1;i++){
    const low=ys[i],high=ys[i+1];if(!(low<high))continue;const mid=(low+high)/2,edges=[];
    for(let j=0;j<poly.length;j++){const p=poly[j],q=poly[(j+1)%poly.length];if(Math.min(p[1],q[1])<mid&&mid<Math.max(p[1],q[1])){const m=(q[0]-p[0])/(q[1]-p[1]),k=p[0]-m*p[1];edges.push({m,k,x:m*mid+k});}}
    if(edges.length<2)continue;edges.sort((u,v)=>u.x-v.x);const e=a>=0?edges[0]:edges.at(-1),m=a*e.m+b,k=a*e.k+c,tests=[low,high],critical=C[0]-m*R/Math.sqrt(1+m*m);if(Math.max(low,t0[0])<=critical&&critical<=Math.min(high,t1[0]))tests.push(critical);
    for(const y of tests){const g=m*y+k-top(y);if(result.gapMM===null||g<result.gapMM)result={gapMM:g,contactYMM:y,contactXMM:e.m*y+e.k,sourceHeaderCircuit:circuit};}
   }
  }
  return result;
 }
 return(relative,slots,pins,{supportBoundsOverlap=true}={})=>{
  const rows=slots.map(slot=>{
   if(!supportBoundsOverlap)return{slot,angleRadians:0,gapMM:null,contactYMM:null,sourceHeaderCircuit:null,supportBoundsOverlap:false};
   const zero=gap(relative,slot,pins,0);if(zero.unsupportedOrientation){return{slot,angleRadians:0,...zero,supportBoundsOverlap:true,modelSupported:false};}
   if(zero.gapMM===null||zero.gapMM>=0)return{slot,angleRadians:0,...zero,supportBoundsOverlap:true,modelSupported:true};
   let lo=0,hi=parameters.maximumLeafAngleRadians;const end=gap(relative,slot,pins,hi);if(end.gapMM!==null&&end.gapMM<0)throw Error('Full-stock contact cannot clear actual mounted reference frame');
   for(let i=0;i<60;i++){const mid=(lo+hi)/2,g=gap(relative,slot,pins,mid);if(g.gapMM!==null&&g.gapMM<0)lo=mid;else hi=mid;}
   return{slot,angleRadians:hi,...gap(relative,slot,pins,hi),supportBoundsOverlap:true,modelSupported:true};
  });
  return{angleRadians:Math.max(...rows.map(r=>r.angleRadians)),rows,supportBoundsOverlap,scope:'Independent finite reference: actual rigid mounted frame, individual full-stock leaf straight spans and declared full-width header contact contours. No force, strain, finished-crimp or continuous full-solid fit certificate.'};
 };
}
