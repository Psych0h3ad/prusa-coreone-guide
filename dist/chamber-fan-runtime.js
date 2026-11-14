import {leaveChamberThermistor} from './chamber-thermistor-runtime.js';
let loaded,pending;const waiting=new WeakMap();
export const chamberFanPrepared=()=>!!loaded;
export function prepareChamberFan(){if(loaded)return Promise.resolve(loaded);if(!pending)pending=import('./chamber-fan-model.js').then(async m=>{await m.prepareChamberFanAssets();return loaded=m;}).catch(error=>{pending=undefined;throw error;});return pending;}
export function waitForChamberFan(viewer,{isCurrent,ready,failed,indicator}){if(loaded)return true;if(waiting.has(viewer))return false;const token={},feedback=indicator();waiting.set(viewer,token);prepareChamberFan().then(()=>{if(waiting.get(viewer)===token&&isCurrent())ready();}).catch(error=>{if(waiting.get(viewer)===token&&isCurrent())failed(error);}).finally(()=>{if(waiting.get(viewer)===token)waiting.delete(viewer);feedback.finish();});return false;}
export function prepareChamberFanScene(viewer,spec,task){
 if(task.id==='chamber-fan'){
  if(!loaded)throw Error('Fan material assets are not prepared');const o=loaded.ensureChamberFanProviders(viewer);o.handlingEnabled=false;o.claimTask(task.id);for(const[id,state]of o.restStates)if(!Object.hasOwn(spec.flexStates,id))spec.flexStates[id]=state;if(!o.enable(true))throw Error(o.refusal||'Chamber owner retired');
 }
 const o=viewer.chamberServiceOwner;
 if((task.id==='chamber-fan'||task.chamberThermistor)&&o?.fanExtension){spec.plan.solidRefs=[...new Set([...spec.plan.solidRefs,'cfFanSockets'])];for(const[id,state]of o.restStates)if(!Object.hasOwn(spec.flexStates,id))spec.flexStates[id]=state;}
 return spec;
}
export const leaveChamberFan=leaveChamberThermistor;
