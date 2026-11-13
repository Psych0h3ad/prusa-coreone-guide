import * as T from 'three';
import {separateMainStrands} from './loveboard-strand-separation.js';

// Same 22 conductors as MainLoomPhysical, not another cable. The 81 material
// stations and each strand's reference polygonal length come from that model.
// OEM cable length and electrical pin numbering are not inferred here.
const N=80,S=6,PER=81*7,FIRST=23,V=p=>new T.Vector3(...p);
const smooth=x=>{x=T.MathUtils.clamp(x,0,1);return x*x*x*(10+x*(-15+6*x));};
const length=a=>a.slice(1).reduce((s,p,i)=>s+p.distanceTo(a[i]),0);
const mean=a=>a.reduce((s,p)=>s.add(p),new T.Vector3()).multiplyScalar(1/a.length);
function neutral(base,end,endIntoWire,release,wireIndex,rowSpreadMM){
 const first=FIRST,last=N,start=base[first],count=last-first,L=length(base.slice(first)),comp=55,anchor=base[comp];
 const d0=base[comp+1].clone().sub(base[comp]).normalize(),d1=endIntoWire.clone().negate().normalize(),span=Math.min(25,anchor.distanceTo(end)*.5);
 const A=anchor.clone().addScaledVector(d0,span),B=end.clone().addScaledVector(d1,-span),delta=end.clone().sub(base[last]);
 const desired=[],short=[];
 for(let j=0;j<=count;j++){
  const i=first+j,u=T.MathUtils.clamp((i-comp)/(last-comp),0,1),w=smooth(u),q=1-u,feed=T.MathUtils.clamp((i-FIRST)/(45-FIRST),0,1);
  const desiredPoint=base[i].clone().addScaledVector(delta,w).add(new T.Vector3((wireIndex<11?-1:1)*rowSpreadMM*Math.sin(Math.PI*u)**2,release*Math.sin(Math.PI*feed)**2,0));desired.push(desiredPoint);
  if(i<=comp)short.push(desiredPoint.clone());else{const h=anchor.clone().multiplyScalar(q*q*q).addScaledVector(A,3*q*q*u).addScaledVector(B,3*q*u*u).addScaledVector(end,u*u*u);h.z=desiredPoint.z;short.push(h);}
 }
 // Two literal end stations hold the actual terminal exit direction. This is
 // a material redistribution, not an end-cap translation or added neck.
 desired[0].copy(start);short[0].copy(start);
 for(const a of [desired,short]){a[count].copy(end);a[count-1].copy(end).addScaledVector(endIntoWire,base[last].distanceTo(base[last-1]));}
 const at=k=>short.map((p,i)=>p.clone().lerp(desired[i],k));
 if(length(short)>L+1e-7)throw Error('615 endpoint cannot retain strand material');
 let lo=0,hi=1;while(length(at(hi))<L&&hi<16)hi*=2;
 if(length(at(hi))<L)throw Error('615 material solve is unbracketed');
 for(let i=0;i<44;i++){const mid=(lo+hi)/2;if(length(at(mid))<L)lo=mid;else hi=mid;}
 const points=base.slice(0,first).map(p=>p.clone()).concat(at((lo+hi)/2));
 return {points,referenceMM:length(base),lengthMM:length(points),compensation:(lo+hi)/2};
}
export function createMainServiceRoute(canonical,{samplePlug,rowSpreadMM=.8}={}){
 if(!canonical.packedStrands?.length)throw Error('615 needs seated assembly packed strands');
 const base=canonical.packedStrands.map(a=>a.map(p=>p.clone())),geometry=canonical.geometry.clone(),baseline=geometry.attributes.position.array.slice(),baselineNormal=geometry.attributes.normal.array.slice(),oldMean=mean(base.map(a=>a[N])),stock=base.map(length);
 const cache=new Map();
 const sample=({from=1,to=1,t=1}={})=>{
  const u=smooth(t),packet=samplePlug?.({from,to,t}),amount=packet?.amount??T.MathUtils.lerp(from,to,u);
  // The legacy fallback is explicitly illustrative; native616 supplies the
  // real candidate frame and row-specific exits without rewriting this route.
  const delta=amount>=.5?new T.Vector3():new T.Vector3(-14,-8,0).multiplyScalar(smooth(1-amount*2));
  const targets=packet?.entries??base.map((a,i)=>({wireIndex:i,pointCADMM:a[N].clone().add(delta).toArray(),tangentIntoWireCAD:[0,-1,0]}));
  if(targets.length!==22||new Set(targets.map(p=>p.wireIndex)).size!==22)throw Error('615 requires all 22 unique entry targets');
  const release=8*(1-smooth(Math.max(0,(amount-.5)*2))),key=JSON.stringify([amount,targets]),old=cache.get(key);let strands,separation;
  if(old){strands=old.strands.map(s=>({...s,points:s.points.map(p=>p.clone())}));separation={...old.separation};}else{
   strands=base.map((a,i)=>{const e=targets.find(p=>p.wireIndex===i);return neutral(a,V(e.pointCADMM),V(e.tangentIntoWireCAD),release,i,rowSpreadMM);});separation=separateMainStrands(strands);
   if(cache.size>=32)cache.delete(cache.keys().next().value);cache.set(key,{strands:strands.map(s=>({...s,points:s.points.map(p=>p.clone())})),separation:{...separation}});
  }
  const centreNodes=Array.from({length:81},(_,i)=>mean(strands.map(s=>s.points[i]))),centreStations=[0];for(let i=1;i<=80;i++)centreStations.push(centreStations.at(-1)+centreNodes[i].distanceTo(centreNodes[i-1]));
  return {from,to,t,amount,packet,targets,strands,separation,centreNodes,centreStations,renderedCentrelineMM:centreStations[80],centreEnd:mean(targets.map(e=>V(e.pointCADMM))),oldMean,referenceCentreMM:171.54146529311816,referenceStrandsMM:stock.slice(),preservedRings:[0,FIRST]};
 };
 const write=(state,target=geometry)=>{
  const position=target.attributes.position,normal=target.attributes.normal,p=new T.Vector3(),r=new T.Vector3(),up=new T.Vector3();
  // The caller owns the plug range. Leave every shell/native face untouched.
  position.array.set(baseline.subarray(0,22*PER*3));normal.array.set(baselineNormal.subarray(0,22*PER*3));
  for(let w=0;w<22;w++){
   const a=state.strands[w].points;let row=new T.Vector3().fromArray(baselineNormal,(w*PER+FIRST*7)*3);
   let prev=a[FIRST].clone().sub(a[FIRST-1]).normalize();
   for(let i=FIRST+1;i<=N;i++){
    const tangent=i===N?V(state.targets.find(e=>e.wireIndex===w).tangentIntoWireCAD).negate():a[Math.min(N,i+1)].clone().sub(a[i-1]).normalize();
    row.applyQuaternion(new T.Quaternion().setFromUnitVectors(prev,tangent));row.addScaledVector(tangent,-row.dot(tangent)).normalize();up.crossVectors(tangent,row);prev=tangent;
    for(let j=0;j<=S;j++){const k=w*PER+i*7+j,angle=j/S*Math.PI*2;r.copy(row).multiplyScalar(Math.cos(angle)).addScaledVector(up,Math.sin(angle));p.copy(a[i]).addScaledVector(r,.26).multiplyScalar(.001);position.setXYZ(k,p.x,p.y,p.z);normal.setXYZ(k,r.x,r.y,r.z);}
   }
  }
  position.needsUpdate=normal.needsUpdate=true;target.computeBoundingBox();target.computeBoundingSphere();return target;
 };
 const guidePoint=({from=1,to=1,t=1},channel)=>{const packet=samplePlug?.({from,to,t}),amount=packet?.amount??T.MathUtils.lerp(from,to,smooth(t));if(channel){const i=34,feed=(i-FIRST)/(45-FIRST),release=8*(1-smooth(Math.max(0,(amount-.5)*2)));return mean(base.map(a=>a[i])).add(new T.Vector3(0,release*Math.sin(Math.PI*feed)**2,0));}return packet?mean(packet.entries.map(e=>V(e.pointCADMM))):oldMean.clone().add(amount>=.5?new T.Vector3():new T.Vector3(-14,-8,0).multiplyScalar(smooth(1-amount*2)));};
 return {geometry,base,stock,sample,write,guidePoint,dispose(){cache.clear();geometry.dispose();}};
}
