import {operationAt}from'./assembly-director.js?v=20261113-116';
const owners=new WeakMap(),nativeRetiring=new WeakSet();
// Native finalizer: used before Viewer collects its actual resource Sets.
// Explicit alive-viewer retirement uses api.retire() and permits a later owner.
export function retireCrossflowTie13(viewer){nativeRetiring.add(viewer);owners.get(viewer)?.retire();}
export function installCrossflowTie13(viewer,binding){
 if(viewer.disposed||nativeRetiring.has(viewer))throw Error('Cannot install tie owner on a disposing viewer');
 if(owners.has(viewer)||viewer.crossflowTie13)throw Error('Crossflow tie owner must retire first');
 const fasteners=viewer.fasteners,e=fasteners?.entities.get('box5');
 if(!e?.crossflow13)throw Error('Real crossflow box5 factory required');
 const prior={setState:viewer.setState,setProgress:viewer.setProgress,dispose:viewer.dispose},g=e.geometry,index=g.index,p=g.attributes.position,n=g.attributes.normal,setContext=e.setServiceContext,renderService=e.renderService;
 let active=true,depth=0,context=null,sourceDisposed=false;
 const isCurrent=()=>active&&!viewer.disposed&&!nativeRetiring.has(viewer)&&owners.get(viewer)===api&&viewer.crossflowTie13===api;
 const ownsSource=()=>!sourceDisposed&&viewer.fasteners===fasteners&&fasteners.entities.get('box5')===e&&e.geometry===g&&e.mesh.geometry===g&&g.index===index&&g.attributes.position===p&&g.attributes.normal===n&&e.setServiceContext===setContext&&e.renderService===renderService;
 function preflight(){if(!ownsSource())throw Error('Foreign tie owner must retire first');}
 function before(state){const row=state?.flow==='service'?binding.rows[state.index]:null;if(row?.task.id!=='xbuddy'){context=null;e.setServiceContext(null);return;}const steps=row.task.steps,cut=steps.findIndex(x=>x.officialId===910483),prep=steps.findIndex(x=>x.officialId===910887),close=steps.findIndex(x=>x.officialId===911253);if(cut<0||prep<0||close<0)throw Error('Exact source xBuddy tie anchors required');context={officialId:row.s.officialId,sourceIndex:row.index,oldRemoved:row.index>cut,newPresent:row.index>=prep,newPrepared:row.index>prep,newClosed:row.index>close,cutIndex:cut,prepIndex:prep,closeIndex:close};e.setServiceContext(context);}
 function after(){if(!context||!isCurrent())return;if(!ownsSource()){api.retire();return;}const observedContext=context;const current=operationAt(viewer.operationProgress,viewer.sceneActors.length),amount=op=>{const i=viewer.sceneActors.findIndex(a=>a.tie13Operation===op);return i<0?null:i<current.index?1:i>current.index?0:current.t;},s={oldPresent:true,oldWastePresent:true,cutAmount:context.oldRemoved?1:0,removeAmount:context.oldRemoved?1:0,newPresent:context.newPresent,newAmount:context.newPrepared?1:0,closeAmount:context.newClosed?1:0,trimAmount:context.newClosed?1:0};
  if(context.sourceIndex===context.cutIndex){s.cutAmount=amount('cut-old')??0;s.removeAmount=amount('remove-old')??0;}
  if(context.sourceIndex===context.prepIndex){const i=viewer.sceneActors.findIndex(a=>a.flex?.includes('box5'));if(i<0)throw Error('Actual box5 preparation actor missing');s.newAmount=i<current.index?1:i>current.index?0:current.t;}
  if(context.sourceIndex===context.closeIndex){s.newAmount=1;s.closeAmount=amount('close-new')??0;s.trimAmount=amount('trim-new')??0;}
  renderService.call(e,s,{officialId:context.officialId,operation:viewer.sceneActors[current.index]?.tie13Operation,localProgress:current.t});if(!isCurrent()||context!==observedContext||!ownsSource())return;api.receipt={context:{...context},state:s,sourceProgress:viewer.operationProgress,identity:true,stock:e.geometry.userData};viewer.dirty=true;
 }
 function run(name,self,args){
  if(self!==viewer||!isCurrent()||viewer[name]!==hooks[name])return;
  preflight();if(name==='setState')before(args[0]);
  if(!isCurrent()||viewer[name]!==hooks[name])return;
  preflight();depth++;let result,ok=false;
  try{result=prior[name].apply(self,args);ok=true;}finally{depth--;}
  if(ok&&!depth&&isCurrent()&&viewer[name]===hooks[name])after();return result;
 }
 function retire(){
  if(!active)return;
  const reset=!viewer.disposed&&owners.get(viewer)===api&&viewer.crossflowTie13===api&&ownsSource();
  // Invalidate and publish all owned pointer restoration before notifications.
  active=false;api.active=false;context=null;
  g.removeEventListener('dispose',onSourceDispose);
  if(owners.get(viewer)===api)owners.delete(viewer);
  for(const[k,f]of Object.entries(hooks))if(viewer[k]===f)viewer[k]=prior[k];
  if(viewer.crossflowTie13===api)delete viewer.crossflowTie13;
  if(reset)setContext.call(e,null);
 }
 function onSourceDispose(){sourceDisposed=true;retire();}
 const state=function(...args){return run('setState',this,args);},progress=function(...args){return run('setProgress',this,args);},dispose=function(...args){
  if(this!==viewer||!isCurrent()||viewer.dispose!==dispose)return;
  retireCrossflowTie13(viewer);return prior.dispose.apply(this,args);
 },hooks={setState:state,setProgress:progress,dispose},api={active:true,receipt:null,retire};
 owners.set(viewer,api);viewer.setState=state;viewer.setProgress=progress;viewer.dispose=dispose;viewer.crossflowTie13=api;g.addEventListener('dispose',onSourceDispose);
 try{if(viewer.state){before(viewer.state);after();}}catch(error){retire();throw error;}
 return api;
}
