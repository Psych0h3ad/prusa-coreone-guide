// SPDX-License-Identifier: MIT
// Guide metadata only. Rendering and physical ownership remain lazy.
import {withPhysicalFE348} from './fe-harness-plan.js';
const FE_STEPS=[[986567,47],[986601,48],[986647,49]];
const REVISION=':fe-harness-6-v1';
export function isPhysicalFEPlus(flows){
 const f=flows?.build;
 if(!f||f.manual!=='https://help.prusa3d.com/manual/prusa-core-one-kit-assembly_2321'||(f.manualID!==undefined&&f.manualID!==2321))return false;
 return FE_STEPS.every(([id,n])=>{const matches=f.steps.filter(s=>s.officialId===id);return matches.length===1&&matches[0].chapter===2&&matches[0].officialStep===n;});
}
export function withPhysicalFEGuidePlans(bank,flows){
 if(!isPhysicalFEPlus(flows))return bank;
 const p=bank?.build?.[986601];
 if(p?.sharedPhysicalFE348){
  if(p.actors.length!==6||p.actors[3].feHarnessEvent!=='case-feed'||p.actors[3].refs?.[0]!=='feTerminal5'||p.actors[4].refs?.[0]!=='splitterZRPlug'||p.actors[5].refs?.[0]!=='splitterZRPlug')throw Error('Different physical FE guide programme');
  return bank;
 }
 if(!p||!bank.build[986567])throw Error('Missing Plus FE guide programme');
 return withPhysicalFE348(bank);
}
export function installPhysicalFEGuide(bank,flows){
 if(!isPhysicalFEPlus(flows))return false;
 const next=withPhysicalFEGuidePlans(bank,flows);
 // Keep the bank/map identities held by existing guide and Viewer modules.
 for(const id of [986567,986601])bank.build[id]=next.build[id];
 // Recheck only the preparation, changed connection, and coupled next step.
 for(const [id]of FE_STEPS){const step=flows.build.steps.find(s=>s.officialId===id);if(!step.verificationRevision.endsWith(REVISION))step.verificationRevision+=REVISION;}
 return true;
}
