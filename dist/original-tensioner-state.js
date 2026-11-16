import {ORIGINAL_TENSIONER_DATUMS as D}from'./original-tensioner-source.js';
// Source-stage state, recomputed from the current source step. It is never
// selected from previous actor parameters or a mutable "last played" cache.
// The existing scene instance-offset writer applies it before source motion.
export function originalTensionerScene(scene,state,flow,plans){
 if(state.flow!=='build'||scene.full)return scene;
 if(scene.plan!==plans[flow.steps[state.index]?.officialId])return scene;
 if(flow.manualID!==undefined&&flow.manualID!==2251)return scene;
 const original=flow.manualID===2251,keys=original?[845225,864403,845280]:[990084,990146,990198],index=id=>flow.steps.findIndex(s=>s.officialId===id),gates=keys.map(index);
 if(gates.some(i=>i<0))return scene;
 const prep=index(original?926209:990050);if(prep<0)return scene;
 const native=[[436,[0,D.left.adjustFinalY,0],gates[0]],[399,[0,D.doorFinalY,0],gates[1]],[438,[0,D.right.adjustFinalY,0],gates[2]],[551,D.left.nutAlign,prep],[553,D.right.nutAlign,prep]],added=[];
 for(const[id,offset,gate]of native){
  if(state.index<=gate)continue;
  if(scene.plan.workpiecePoses?.some(p=>p.refs?.includes(id)))continue;
  // A later explicit single-screw operation owns its own adjustment.
  const explicit=flow.steps.slice(gate+1,state.index+1).some(s=>plans[s.officialId]?.actors?.some(a=>a.refs?.includes(id)&&!a.originalTensionerSource));
  if(explicit)continue;
  added.push({cadIndex:id,offset,source:'Original/Plus tensioner source-stage hole alignment and partial engagement'});
 }
 return added.length?{...scene,instanceOffsets:[...(scene.instanceOffsets||[]),...added]}:scene;
}
