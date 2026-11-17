// SPDX-License-Identifier: MIT
// Reuse the same physical paths as the official first-run preparation.
import{withInitialSetupPreparation}from'./initial-setup-preparation-plan.js';
const cache=new WeakMap(),task={id:'initial-setup',steps:[{officialStep:3}]};
export function withSpoolHolderAssembly(source){
 if(cache.has(source))return cache.get(source);
 const build=source.build?.[999427],upgrade=source.upgrade?.[1022776];
 if(!build&&!upgrade)return source;
 if((!build||build.spoolHolderAssembly)&&(!upgrade||upgrade.spoolHolderAssembly))return source;
 // The panel mounting programme pre-rotates its whole populated workpiece.
 // Keep the installed ring in that same rigid frame before its carry actor.
 const carry=p=>{let changed=false;const poses=p.workpiecePoses?.map(q=>{if(!q.refs?.includes('spoolNew')||q.refs.includes('initialSetupOring'))return q;changed=true;return{...q,refs:[...q.refs,'initialSetupOring']};});return changed?{...p,workpiecePoses:poses}:p;};
 const first=p=>withInitialSetupPreparation(task,0,words=>words[0],{plan:p}).plan;
 const result={...source,build:Object.fromEntries(Object.entries(source.build||{}).map(([id,p])=>[id,carry(p)])),upgrade:Object.fromEntries(Object.entries(source.upgrade||{}).map(([id,p])=>[id,carry(p)]))};
 if(build)result.build[999427]={...first(build),spoolHolderAssembly:{guideID:982308,stepID:999427,lineIDs:[999445,1014534,1014535]}};
 if(upgrade){
  const prepared=first(upgrade),actors=prepared.actors.slice(2).map((actor,index)=>({...actor,
   officialStepID:1022776,officialLineIDs:[index===0?1022777:1022778],cameraDirectionCAD:[1.2,-.8,.7]}));
  result.upgrade[1022776]={...upgrade,actors,
   focus:['sideRight','puck','spoolNew','initialSetupOring'],solidRefs:['sideRight','puck','spoolNew','initialSetupOring'],
   workpiecePoses:prepared.workpiecePoses,focusPadding:12,viewBounds:[203,-35,90,348,108,160],viewMinDistance:230,
   spoolHolderAssembly:{guideID:1014628,stepID:1022776,lineIDs:[1022777,1022778]}};
 }
 cache.set(source,result);return result;
}
