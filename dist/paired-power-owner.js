import{installPowerFamily,powerFamilyActors,powerFamilyInitialStates}from'./xbuddy-power-family.js';
import{FAMILY_ROLES,terminalOffset,terminalFrame}from'./xbuddy-power-family-route.js';
import{servicePePlan,insertBedPowerActors}from'./xbuddy-power-pe-plan.js';
import{registerCrossflowDependent13}from'./r13-tie-service.js';
const R='xbHeatInPlus',B='xbHeatInMinus',S=t=>(t=Math.max(0,Math.min(1,t)))*t*(3-2*t),amount=q=>q.from+(q.to-q.from)*S(q.t);
const knownPowerCapabilities=new WeakMap();
export function retirePairedPowerOwner(viewer){knownPowerCapabilities.get(viewer)?.retire();}
export function preparePairedPowerFlex(viewer,updates){knownPowerCapabilities.get(viewer)?.prepareFlex(updates);}
// Canonical maintenance-spec adapter. No Director/state/progress method replacement and no tie factory/setter.
export function installPairedPowerOwner(viewer){
 if(viewer.pairedPowerBank)throw Error('Foreign paired power owner');let active=true,lease=null,phase=null,initial={},pending=null,releaseDependency;
 function depend(){if(releaseDependency)return;if(!viewer.crossflowTie13?.active)throw Error('xBuddy power requires the current known R13 generation');releaseDependency=registerCrossflowDependent13(viewer,retire);}
 const current=()=>active&&!viewer.disposed&&Object.getOwnPropertyDescriptor(viewer,'pairedPowerBank')?.value===api;
 function retire(){if(!active)return;active=false;pending=null;const old=lease;lease=null;if(Object.getOwnPropertyDescriptor(viewer,'pairedPowerBank')?.value===api)delete viewer.pairedPowerBank;const transaction=releaseDependency?.('begin');releaseDependency=undefined;try{transaction?.retireLater();}finally{try{old?.retire();}finally{transaction?.finish();}}}
 function pairProvider(id,a,from,to,t){
  const own=id===R?'red':id===B?'black':null;
  let pair=pending?{...pending}:{red:initial[R]??1,black:initial[B]??1};
  if(!pending&&from!==to){if(id===R)pair.black=1;if(id===B)pair.red=0;}
  if(own)pair[own]=a;return pair;
 }
 const api={retire,get active(){return current()&&!!lease?.active;},get lease(){return lease;},get pair(){return pending&&{...pending};},
  prepare(task){if(!current()){if(task?.id==='xbuddy')throw Error('The known xBuddy power/R13 generation has retired');return;}if(task?.id!=='xbuddy'){releaseDependency?.();releaseDependency=undefined;const old=lease;lease=null;phase=null;pending=null;old?.retire();return;}depend();if(!lease?.active)lease=installPowerFamily(viewer,{preserveSourceBedSleeve:true,pairProvider,onSourceDispose:retire,isCurrent:()=>current()&&!!lease?.active});},
  prepareFlex(updates){if(!current()||!lease?.active)return;const pair={red:initial[R]??1,black:initial[B]??1};for(const[id,key]of[[R,'red'],[B,'black']])if(updates.has(id))pair[key]=amount(updates.get(id));pending=Object.freeze(pair);},
  decorate(spec,task,index,text){
   if(!current()||task.id!=='xbuddy'||!lease?.active)return spec;const id=task.steps[index].officialId,next=powerFamilyInitialStates(id);if(!next)throw Error('Actual official power source step required');if(phase!==id){phase=id;pending=null;}initial=next;
   let actors=powerFamilyActors(id,text),plan={...spec.plan,workpiecePoses:[...(spec.plan.workpiecePoses||[])]};if(id===910527)actors=insertBedPowerActors(plan.actors,actors);if(actors.length)plan={...plan,actors,camera:'xbuddy-board-perspective',contextOpacity:1,solidRefs:[],focus:[...lease.screws.values()].map(m=>m.userData.component),focusPadding:5,viewBounds:[910527,911167].includes(id)?[-112,160,50,-52,215,104]:[-137,160,0,-65,225,82],viewMinDistance:80};
   plan={...servicePePlan(plan),pairedPowerBank:true};if(!lease.sharedBed)plan.workpiecePoses.push({refs:[777,699,779,701],pivot:[0,0,0],rotation:[0,0,0],offset:[0,0,.6]});
   const animated=new Set((plan.actors||[]).flatMap(a=>a.flex||[])),pair={red:initial[R],black:initial[B]};for(const[id]of lease.entities)if(!animated.has(id)&&!lease.borrowedBedIds.has(id)){const f=terminalFrame(id,initial[id],pair);plan.workpiecePoses.push({refs:[id+'Lug'],pivot:f.pivot.toArray(),rotation:[f.angle,0,0],offset:f.offset.toArray()});}
   const activeScrews=new Set((plan.actors||[]).flatMap(a=>a.refs||[]));for(const[terminal,m]of lease.screws){const role=Object.keys(FAMILY_ROLES).find(k=>FAMILY_ROLES[k].terminal===terminal);if(initial[role]===0&&!activeScrews.has(m.userData.component))plan.workpiecePoses.push({refs:[m.userData.component],pivot:[0,0,0],rotation:[0,0,0],offset:[0,40,0]});}
   return{...spec,plan,flexStates:{...spec.flexStates,...initial}};
  }
 };viewer.pairedPowerBank=api;knownPowerCapabilities.set(viewer,{retire,prepareFlex:api.prepareFlex.bind(api)});return api;
}
