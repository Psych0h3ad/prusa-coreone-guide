import {terminalGuides} from './heatbed-power-terminal-fan.js';
import * as T from 'three';
import {V,Q,ArcCurve,Joined,slice,roundedMaterialBight} from './heatbed-material-curves.js';
const ids=['xbBedMinus','xbBedPlus'];
// Both full-gauge wires follow one physical carrier. Its depth and material
// roll close the two independent neutral lengths, without intersecting the
// actual native66 panel or allowing independent bights to pass each other.
export function coupledStagedPower(family,routing){
 const carrier=family.carrierPath,L=carrier.getLength(),atX=x=>{let lo=520/L,hi=1;for(let i=0;i<42;i++){const t=(lo+hi)/2;if(carrier.getPointAt(t).x>x)lo=t;else hi=t;}return(lo+hi)/2;},ta=atX(64),tb=atX(-38),sources=ids.map(id=>family.wires.get(id)),offsets=sources.map(c=>c.parts[1]);
 const raw=(i,t)=>offsets[i].getPoint(ta+(tb-ta)*t),mid=t=>raw(0,t).add(raw(1,t)).multiplyScalar(.5),prefix=[],guides=[],targets=[];
 for(let i=0;i<2;i++){
  const c=sources[i],a=new ArcCurve(t=>offsets[i].getPoint(ta*t),2048),remaining=new Joined([new ArcCurve(t=>offsets[i].getPoint(tb+(1-tb)*t),2048),...c.parts.slice(2)]),end=4+(remaining.getLength()-4)*routing;
  prefix[i]=new Joined([family.constructionPrefixes?.get(ids[i])??c.parts[0],a]);guides[i]=slice(remaining,0,end);targets[i]=c.getLength()-prefix[i].getLength()-guides[i].getLength();
 }
 const terminal=terminalGuides(guides,routing);for(let i=0;i<2;i++){guides[i]=terminal[i];targets[i]=(family.constructionPrefixes?family.authoredStocks[ids[i]]:sources[i].getLength())-prefix[i].getLength()-guides[i].getLength();}
 const N=1024,base=Array.from({length:N+1},(_,i)=>{const t=i/N,c=mid(t),h=1e-5,d=mid(Math.min(1,t+h)).sub(mid(Math.max(0,t-h))).multiplyScalar(1/(Math.min(1,t+h)-Math.max(0,t-h))),axis=raw(1,t).sub(raw(0,t));return{t,c,d,axis,half:axis.length()/2};});
 function build(depth,roll){
  const common=roundedMaterialBight(new T.LineCurve3(mid(0),mid(1)),depth,V([0,1,0])),points=[[],[]];
  for(const b of base){const wave=Math.sin(Math.PI*b.t)**2,tangent=common.getTangentAt(b.t),normal=b.axis.clone().addScaledVector(tangent,-b.axis.dot(tangent)).normalize().applyAxisAngle(tangent,roll*wave),c=common.getPointAt(b.t),half=b.half+2*Q((depth-mid(0).distanceTo(mid(1)))/30)*wave;
   points[0].push(c.clone().addScaledVector(normal,-half));points[1].push(c.clone().addScaledVector(normal,half));
  }
  const curves=points.map(p=>new ArcCurve(t=>{const f=t*N,k=Math.min(N-1,Math.floor(f));return p[k].clone().lerp(p[k+1],f-k);},N));return{curves,lengths:curves.map(c=>c.getLength()),depth,roll};
 }
 let best;
 for(const initial of [0,-.7,.7,-1.5,1.5]){
  let depth=Math.max(mid(0).distanceTo(mid(1))+.001,(targets[0]+targets[1])/2),roll=initial,current;
  for(let k=0;k<16;k++){
   current=build(depth,roll);const e=current.lengths.map((v,i)=>v-targets[i]);
   if(Math.max(...e.map(Math.abs))<1e-6){best=current;break;}
   const a=build(depth+.02,roll).lengths,b=build(depth,roll+.002).lengths,J=a.map((v,i)=>[(v-current.lengths[i])/.02,(b[i]-current.lengths[i])/.002]),det=J[0][0]*J[1][1]-J[0][1]*J[1][0];if(Math.abs(det)<1e-8)break;
   const da=(e[0]*J[1][1]-e[1]*J[0][1])/det,db=(J[0][0]*e[1]-J[1][0]*e[0])/det;
   depth-=Math.max(-30,Math.min(30,da));roll-=Math.max(-.5,Math.min(.5,db));if(depth<mid(0).distanceTo(mid(1))||depth>600||Math.abs(roll)>3.1)break;
  }
  if(best)break;
 }
 if(!best)throw Error('Coupled staged power material closure unavailable '+JSON.stringify({routing,targets}));
 const wires=new Map(),routingTips={};for(let i=0;i<2;i++){const wire=new Joined([prefix[i],best.curves[i],guides[i]]);wire.bightMM=best.depth;wire.bankRollRadians=best.roll;wires.set(ids[i],wire);routingTips[ids[i]]={point:wire.getPointAt(1),tangent:wire.getTangentAt(1)};}
 return{...family,wires,routingTips,boxRoutingAmount:routing,powerBankReceipt:{carrierLengthMM:best.depth,rollRadians:best.roll,targetsMM:targets,actualMM:best.lengths,source:'single carrier; two exact independent material budgets'}};
}
