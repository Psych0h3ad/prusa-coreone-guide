export const COMPACT_QUERY='(max-width: 760px), (max-width: 1000px) and (max-height: 600px) and (pointer: coarse)';

export function navigationState({steps,index,variant,done,checked,view}){
 const applicable=(s)=>!s.variant||s.variant===variant;
 const indices=steps.map((s,i)=>applicable(s)?i:-1).filter(i=>i>=0);
 const position=indices.indexOf(index),step=steps[index];
 const verified=done.includes(index);
 const valid=(step.checks||[]).every((_,i)=>checked.includes(i));
 const previewNext=view==='model'&&!valid&&!verified&&!step.final;
 const readFirst=view==='model'&&!valid&&!verified&&!!step.final;
 return {previous:indices[position-1],next:indices[position+1],position:position+1,total:indices.length,verified,valid,readFirst,previewNext,
  disabled:view==='guide'&&!valid&&!verified,
  label:previewNext?'次の手順へ':readFirst?'手順を確認する':step.final?'ガイドの確認を完了':verified?'次の手順へ':'確認して次へ'};
}
