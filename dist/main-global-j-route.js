import * as T from 'three';
import {globalLocalBank as bank} from './global-local-bank.js';
import {rawGlobal615,frames615,benchShift615} from './carrier-field.js';
import {canonical} from './loveboard-main-canonical.js';
import {closeMaterial615} from './main-material.js';
import {closeLinks615} from './main-link-material.js';
const data=bank.dataFloat64,base4=canonical.strands.map(a=>a.map(p=>new T.Vector3(...p))),read=(k,w,i)=>new T.Vector3().fromArray(data,k*bank.width+(w*55+i-24)*3);
function interval(amount){let lo=0,hi=bank.amounts.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(bank.amounts[m]<=amount)lo=m;else hi=m;}return{lo,hi,blend:(amount-bank.amounts[lo])/(bank.amounts[hi]-bank.amounts[lo])};}
export function globalJacketTranslation615(amount,source,packet){
 const calibration=new T.Vector3(1.55,1.05,0).multiplyScalar(1-T.MathUtils.smoothstep(amount,3,4));
 if(source&&packet)return calibration.add(benchShift615(source,packet.state.strands.map(s=>s.points),bank.stockMM,calibration));
 // Public guide samples use the same continuous bank parameter, not a nearest
 // sourcepose. Mesh updates always use the analytic current-source branch above.
 const s=interval(amount);return new T.Vector3(...bank.translations[s.lo]).lerp(new T.Vector3(...bank.translations[s.hi]),s.blend);
}
export function sampleGlobalJ615(source,amount,packet){
 if(!Number.isFinite(amount)||amount<0||amount>4||source.length!==22||source.some(a=>a.length!==81))throw Error('615 materialframe global source mismatch');
 if(amount===4)return packet.state.strands.map(s=>({...s,points:s.points.map(p=>p.clone())}));
 const s=interval(amount),nativePoints=packet.state.strands.map(s=>s.points),referenceEdges=nativePoints.map(a=>a.slice(1).map((p,i)=>p.distanceTo(a[i]))),raw=rawGlobal615(source,amount,packet.state.strands.map(s=>s.points),base4,bank.stockMM),frames=frames615(raw);
 return raw.map((a,w)=>{
  const points=a.map((p,i)=>i<=23||i>=79?p.clone():p.clone().add(frames[i].world(read(s.lo,w,i).lerp(read(s.hi,w,i),s.blend)))),prefix=points.slice(1,24).reduce((sum,p,i)=>sum+p.distanceTo(points[i]),0),reference=referenceEdges[w],free=reference.slice(23,79).reduce((sum,l)=>sum+l,0),factor=(bank.stockMM[w]-prefix-reference[79])/free,lengths=reference.map((l,i)=>i>=23&&i<79?l*factor:l),chain=closeLinks615(points,lengths),c=closeMaterial615(points,bank.stockMM[w],{first:24,last:78,limit:.005});
  return{points,referenceMM:bank.stockMM[w],lengthMM:c.lengthMM,materialCorrectionMM:c.amplitudeMM,chainClosure:chain};
 });
}
