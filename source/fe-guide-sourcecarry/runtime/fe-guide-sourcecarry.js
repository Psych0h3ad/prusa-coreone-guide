// SPDX-License-Identifier: MIT
import {withPhysicalFEGuidePlans,isPhysicalFEPlus} from './fe-guide-plan.js';
import {sourceCarryPlan} from './fe-source-carry-plan.js';
import {createFESourcePositions,resolveFESourceState} from './fe-source-state.js';
import {fePlanSignature} from './fe-guide-plan-signature.js';
import {FE_SOURCE_CONTRACT203 as contract} from './fe-guide-source-contract203.js';
const carryIDs=[986513,992670,998504];
export function hasFE203Source(flows){
 if(!isPhysicalFEPlus(flows)||flows.build.manual!==contract.buildManual)return false;
 if(!contract.steps.every(row=>{const matches=flows.build.steps.filter(s=>s.officialId===row.id);return matches.length===1&&matches[0].chapter===row.chapter&&matches[0].officialStep===row.officialStep&&(matches[0].programOfficialId===undefined||matches[0].programOfficialId===row.id);}))return false;
 const indices=[986347,986513,986567,986601,986647,992670,998504].map(id=>flows.build.steps.findIndex(s=>s.officialId===id));
 return indices.every((index,i)=>!i||index>indices[i-1]);
}
function checked(plan,row,finalOnly=false){
 const signature=fePlanSignature(plan);
 if(signature!==row.finalSignature&&(finalOnly||signature!==row.baseSignature))throw Error('Different FE source metadata: '+row.id);
 return plan;
}
export function composeFE203GuideMetadata(bank,flows){
 if(!hasFE203Source(flows))return bank;
 for(const row of contract.targets)checked(bank.build?.[row.id],row);
 const six=withPhysicalFEGuidePlans(bank,flows),build={...six.build};let changed=six!==bank;
 for(const id of carryIDs){const old=build[id];build[id]=sourceCarryPlan(old,flows.build.steps.find(s=>s.officialId===id),'build');changed||=build[id]!==old;}
 for(const row of contract.targets)checked(build[row.id],row,true);
 return changed?{...six,build}:bank;
}
export function fe203GuidePolicy(flows,state,scene,step){
 const refuse=reason=>({supported:false,mayAugment:false,phase:reason,metadataOnly:true});
 if(!hasFE203Source(flows))return refuse('separate-source-edition');
 if(state?.edition!==undefined&&!['plus','core-one-plus','coreone-plus'].includes(state.edition))return refuse('separate-state-edition');
 if(!state)return refuse('unbound');
 if(state.comparison!==undefined&&!['before','after'].includes(state.comparison))return refuse('unknown-reference-mode');
 if(state.flow==='upgrade'){
  if(flows.upgrade?.manual!==contract.upgradeManual||(flows.upgrade.manualID!==undefined&&flows.upgrade.manualID!==2338))return refuse('separate-upgrade-source');
  return {...resolveFESourceState(state,scene,step,{}),mayAugment:false,metadataOnly:true,policy:'retained-reference-only'};
 }
 if(state.flow!=='build')return refuse('explicit-service-lease-required');
 const actual=flows.build.steps[state.index];
 if(!actual||actual.officialId!==step?.officialId)return refuse('source-clock-mismatch');
 const positions=createFESourcePositions(flows.build.steps),phase=resolveFESourceState(state,scene,actual,positions),row=contract.steps.find(r=>r.id===actual.officialId);
 return {...phase,mayAugment:!phase.completed&&carryIDs.includes(actual.officialId),metadataOnly:true,sourceID:actual.officialId,officialAnchor:row?.officialAnchor,policy:phase.completed?'completed-reference-only':'source-guide-only'};
}
export function selectFE203SourcePlan(plan,step,flow,flows,state,scene={}){
 if(flow!==state?.flow)return plan;
 const policy=fe203GuidePolicy(flows,state,scene,step);
 if(!policy.supported||!policy.mayAugment)return plan;
 const row=contract.targets.find(r=>r.id===step.officialId);checked(plan,row);
 return checked(sourceCarryPlan(plan,step,'build'),row,true);
}
