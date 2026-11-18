// MIT. Pure source-state policy; no renderer or geometry dependency.
// The registered manual and real source IDs decide ownership; a primitive alias is not edition proof.
export function isPhysicalFEPlus(flows){
 const build=flows?.build;if(build?.manual!=='https://help.prusa3d.com/manual/prusa-core-one-kit-assembly_2321'||build.manualID!==undefined&&build.manualID!==2321||build.edition!==undefined&&build.edition!=='plus')return false;
 const steps=build.steps;if(!Array.isArray(steps)||steps[0]?.officialId!==982324)return false;
 return [986347,986513,986567,986601,986647,992670,998504].every(id=>steps.filter(step=>step.officialId===id&&!step.originalSource).length===1);
}
export function createFESourcePositions(steps){const ids={intro:986347,prepare:986513,parts:986567,screw:986601,route:986647,corexy:992670,lcd:998504},out={};for(const[key,id]of Object.entries(ids)){const indices=steps.flatMap((s,i)=>(s.programOfficialId??s.officialId)===id?[i]:[]);if(indices.length!==1)throw Error('Unique Plus FE source ID required: '+id);out[key]=indices[0];}return Object.freeze(out);}
export function resolveFESourceState(state,scene,step,position){
 if(!state)return{phase:'unbound',supported:false};
 if(['original2251','gen2','coreone-gen2'].includes(state.edition))return{phase:'separate-edition-owner-required',supported:false};
 if(state.flow==='upgrade')return{phase:state.comparison==='before'?'upgrade-before-retained':state.explore||scene?.full?'upgrade-complete-reference':step?.final?'upgrade-after-retained':'upgrade-during-retained',supported:true,completed:true,qualification:'The Plus-page upgrade does not operate on this FE graph. Same authored stock and current native mating frames are retained; this is not Original/Gen2 build-source equivalence.'};
 if(state.flow!=='build')return{phase:'explicit-service-lease-required',supported:false};
 if(state.explore||scene?.full||state.comparison==='before')return{phase:state.comparison==='before'?'build-before-complete-reference':'build-complete-reference',supported:true,completed:true,qualification:'Completed common-frame reference, independent of last guide clock; separate edition source support is not implied.'};
 if(state.index<position.prepare)return{phase:state.index<position.intro?'unintroduced-boundary':'pre346-boundary',supported:true,completed:false,qualification:'Deterministic pre3.46 stock boundary. Source3.42–3.45 individual connection/threading actions are not yet implemented by this component.'};
 if(state.index===position.prepare)return{phase:'prepare',supported:true};
 if(state.index<=position.route)return{phase:'existing347-349',supported:true};
 return{phase:state.index<position.corexy?'after349':state.index===position.corexy?'corexy':state.index<position.lcd?'after577':state.index===position.lcd?'lcd':'after822',supported:true};
}
