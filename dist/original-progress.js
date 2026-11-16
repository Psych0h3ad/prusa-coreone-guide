// Root UI indices are presentation. Original persistence is bound to primary
// source IDs, including cursor/checks/completion, under its separate key.
export function encodeOriginalProgress(state,flows){
 if(flows.build.manualID!==2251)return state;
 const steps=flows.build.steps,b=state.build,id=i=>steps[i]?.officialId;
 return {...state,sourceProgress:{edition:'original2251',manualID:2251,cursor:id(b.index),done:b.done.map(id),checks:Object.fromEntries(Object.entries(b.checks).map(([i,v])=>[id(Number(i)),v]))}};
}
export function decodeOriginalProgress(saved,flows){
 if(flows.build.manualID!==2251||!saved?.sourceProgress)return saved;
 const p=saved.sourceProgress;if(p.edition!=='original2251'||p.manualID!==2251)return undefined;
 const steps=flows.build.steps,index=id=>steps.findIndex(s=>s.officialId===Number(id)),cursor=index(p.cursor);
 return {...saved,flow:'build',build:{...saved.build,index:cursor<0?0:cursor,done:(p.done||[]).map(index).filter(i=>i>=0),checks:Object.fromEntries(Object.entries(p.checks||{}).map(([id,v])=>[index(id),v]).filter(([i])=>i>=0))}};
}
