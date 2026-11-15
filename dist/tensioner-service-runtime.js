import * as T from 'three';
import {TENSIONER_GEOMETRY} from './tensioner-service-scene.js';
export const owners=new WeakMap();const V=p=>new T.Vector3(...p);
let preparedNative,pendingNative;const waiting=new WeakMap();
export const tensionerServicePrepared=()=>!!preparedNative;
export function prepareTensionerService(){
 if(preparedNative)return Promise.resolve(preparedNative);
 if(!pendingNative)pendingNative=import('./tensioner-service-native.js').then(async m=>{await m.prepareTensionerAssets();return preparedNative=m;}).catch(error=>{pendingNative=undefined;throw error;});return pendingNative;
}
export function waitForTensionerService(viewer,{isCurrent,ready,failed,indicator}){
 if(preparedNative)return true;if(waiting.has(viewer))return false;
 const token={},feedback=indicator();waiting.set(viewer,token);
 prepareTensionerService().then(()=>{if(waiting.get(viewer)===token&&!viewer.disposed&&isCurrent())ready();}).catch(error=>{if(waiting.get(viewer)===token&&!viewer.disposed&&isCurrent())failed(error);}).finally(()=>{if(waiting.get(viewer)===token)waiting.delete(viewer);feedback.finish();});return false;
}
export function prepareTensionerServiceScene(viewer,spec,task){
 if(!task.tensionerService)return spec;if(!preparedNative)throw Error('Tensioner model assets are not prepared');preparedNative.installTensionerService(viewer);return preparedNative.prepareTensionerServiceScene(viewer,spec,task);
}

export function checked(owner){if(!owner.active||owner.viewer.disposed)return false;for(const m of owner.nodes)if(m.geometry!==owner.geometry.get(m))throw Error('Foreign tensioner surface replacement');return true;}
export function followTensionerService(viewer){
 const p=viewer.operationScene?.plan.tensionerService;if(!p)return;const owner=owners.get(viewer);if(!owner||!checked(owner))return;
 const d=TENSIONER_GEOMETRY[p.side],idler=owner.nodes.find(m=>m.userData.component==='tsIdler-'+p.side),apart=p.task.endsWith('left')?p.index===10:p.index===5;let anchor=p.loop,opening=p.opening,opened=false;
 for(const [i,a]of viewer.sceneActors.entries())if(a.beltOpening&&viewer.operationProgress*viewer.sceneActors.length>=i){const t=T.MathUtils.clamp(viewer.operationProgress*viewer.sceneActors.length-i,0,1);opening=T.MathUtils.lerp(a.beltOpening.from,a.beltOpening.to,t*t*(3-2*t));anchor=a.beltLoop;opened=true;}
 const loop=p.coupled&&!apart&&!opened?V(d.centre).add(idler.position.clone().sub(idler.userData.restPosition).multiplyScalar(1000)):V(d.centre).add(V(anchor));owner.belts[p.side].write(loop,opening);const other=p.side==='left'?'right':'left';owner.belts[other].write(V(TENSIONER_GEOMETRY[other].centre),0);

 if(p.left){const sensor=owner.switchNodes[0],terminal=owner.lead.points[0],delta=terminal.clone().multiplyScalar(.001).applyQuaternion(sensor.quaternion).add(sensor.position).multiplyScalar(1000).sub(terminal);owner.lead.write(delta,sensor.quaternion);}
}
export function tensionerServiceEvidence(viewer){const o=owners.get(viewer);return o&&{active:o.active,nodes:o.nodes.length,rivets:o.rivets.length,belts:Object.fromEntries(Object.entries(o.belts).map(([s,b])=>[s,{stock:b.stock,measured:b.measuredStock,sampled:b.sampledStock,loop:b.loop,sag:b.amplitude,opening:b.opening}])),lead:{stock:o.lead.stock,measured:o.lead.measuredStock,fixed:o.lead.fixed},registration:o.registration};}
export function closeTensionerService(viewer){const o=owners.get(viewer);if(!o)return false;o.active=false;for(const r of [...o.rivets,...o.ties])if(viewer.fasteners?.entities.get(r.id)===r)viewer.fasteners.entities.delete(r.id);owners.delete(viewer);return true;}
