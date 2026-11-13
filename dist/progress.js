// Verification revisions depend on the source checklist, not the selected language.
// An updated checklist invalidates only that step's checks and completed status.
export const PROGRESS_KEY='prusa-assembly-lab-manual-v2';
export function restoreProgress(saved,flows){
 const state={flow:typeof saved?.flow==='string'&&Object.hasOwn(flows,saved.flow)?saved.flow:'build'};
 for(const [flow,f]of Object.entries(flows)){
  const prior=saved?.[flow],local={index:0,done:[],checks:{},checkRevisions:{}};
  if(flow==='build')local.variant=['screw','glued'].includes(prior?.variant)?prior.variant:'screw';
  if(Number.isInteger(prior?.index)&&prior.index>=0&&prior.index<f.steps.length)local.index=prior.index;
  if(Array.isArray(prior?.done))local.done=[...new Set(prior.done.filter(i=>Number.isInteger(i)&&i>=0&&i<f.steps.length))];
  if(prior?.checks&&typeof prior.checks==='object'&&!Array.isArray(prior.checks)){
   for(const [key,values]of Object.entries(prior.checks)){
    const index=Number(key),step=f.steps[index];
    if(!Number.isInteger(index)||String(index)!==key||!step||!Array.isArray(values))continue;
    local.checks[index]=[...new Set(values.filter(i=>Number.isInteger(i)&&i>=0&&i<(step.checks?.length||1)))];
   }
  }
  for(const [index,step]of f.steps.entries())if(step.verificationRevision){
   const id=String(step.officialId);
   if(prior?.checkRevisions?.[id]!==step.verificationRevision){
    local.done=local.done.filter(i=>i!==index);delete local.checks[index];
   }
   local.checkRevisions[id]=step.verificationRevision;
  }
  local.done=local.done.filter(index=>(f.steps[index].checks||['']).every((_,i)=>local.checks[index]?.includes(i)));
  state[flow]=local;
 }
 return state;
}
