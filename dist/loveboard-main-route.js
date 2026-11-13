import * as T from 'three';
import {createMainServiceRoute as createReferenceRoute} from './loveboard-main-reference.js';
import {canonical as sourceCanonical} from './loveboard-main-canonical.js';
import {upperBank as bank} from './j-family-bank.js';
import {closeMaterial615} from './main-material.js';
const data=bank.dataFloat64,mean=a=>a.reduce((s,p)=>s.add(p),new T.Vector3()).multiplyScalar(1/a.length),read=(k,w,i,out=new T.Vector3())=>out.fromArray(data,k*bank.width+(w*(bank.last-bank.first+1)+i-bank.first)*3);
export function createMainServiceRoute(canonical,options={}){
 if(canonical.packedStrands?.length!==22||canonical.packedStrands.some((a,w)=>a.length!==81||a.some((p,i)=>p.x!==sourceCanonical.strands[w][i][0]||p.y!==sourceCanonical.strands[w][i][1]||p.z!==sourceCanonical.strands[w][i][2])))throw Error('615 J-family/canonical source mismatch');
 if(!options.samplePlug)throw Error('615 J-family requires the native packet sampler');
 const reference=createReferenceRoute(canonical,options),base=reference.base,stocks=base.map(a=>a.slice(1).reduce((s,p,i)=>s+p.distanceTo(a[i]),0)),lastEdges=base.map(a=>a[80].distanceTo(a[79]));
 function coordinates({from=1,to=1,t=1}={}){
  const packet=options.samplePlug({from,to,t}),amount=packet.amount;
  if(packet.generation!=='native-j13-616-v1'||amount<0||amount>1||packet.entries.length!==22)throw Error('615 J-family/native packet mismatch');
  let lo=0,hi=bank.amounts.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(bank.amounts[m]<=amount)lo=m;else hi=m;}
  const blend=(amount-bank.amounts[lo])/(bank.amounts[hi]-bank.amounts[lo]);return{from,to,t,packet,amount,lo,hi,blend};
 }
 function sample(args={}){
  const s=coordinates(args),corrections=[];
  const strands=base.map((a,w)=>{
   const entry=s.packet.entries.find(e=>e.wireIndex===w);if(!entry)throw Error('615 J-family missing conductor');
   const points=a.map((p,i)=>i>=bank.first&&i<=bank.last?read(s.lo,w,i).lerp(read(s.hi,w,i),s.blend):p.clone());
   points[80].fromArray(entry.pointCADMM);points[79].copy(points[80]).addScaledVector(new T.Vector3(...entry.tangentIntoWireCAD),lastEdges[w]);
   const correction=closeMaterial615(points,stocks[w],{first:24,last:78,limit:.005});corrections.push(correction);
   return{points,referenceMM:stocks[w],lengthMM:correction.lengthMM,materialCorrectionMM:correction.amplitudeMM};
  });
  const centreNodes=Array.from({length:81},(_,i)=>mean(strands.map(w=>w.points[i]))),centreStations=[0];for(let i=1;i<=80;i++)centreStations.push(centreStations.at(-1)+centreNodes[i].distanceTo(centreNodes[i-1]));
  return{...s,targets:s.packet.entries,strands,centreNodes,centreStations,renderedCentrelineMM:centreStations[80],centreEnd:mean(s.packet.entries.map(e=>new T.Vector3(...e.pointCADMM))),oldMean:mean(base.map(a=>a[80])),referenceCentreMM:171.54146529311816,referenceStrandsMM:stocks.slice(),preservedRings:[0,23],separation:{mode:'single J-derived fixed-material bank; no per-frame PBD',bankInterval:s.lo,blend:s.blend,maxCorrectionMM:Math.max(...corrections.map(c=>Math.abs(c.amplitudeMM))),maxUncorrectedMaterialDeltaMM:Math.max(...corrections.map(c=>Math.abs(c.initialDeltaMM)))}};
 }
 function guidePoint(args,channel){const s=sample(args);return channel?s.centreNodes[34].clone():s.centreEnd.clone();}
 return{...reference,sample,guidePoint};
}
