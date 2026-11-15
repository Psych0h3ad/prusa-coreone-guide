// SPDX-License-Identifier: GPL-3.0-only
// Source 922437 step929892 pictures a replacement heatsink with its own loadcell lead.
import {heatsinkReplacementScene as baseScene,installHeatsinkReplacementGeometry as installBase,HEATSINK_REPLACEMENT_REFS as R} from './heatsink-service-model.js';
import {cloneServiceMaterial} from './heatsink-service-material.js';
const OLD_LEAD='heatsinkServiceOldLoadcellLead';
const installations=new WeakMap();
export function installHeatsinkReplacementGeometry(viewer){
 if(installations.has(viewer))return installations.get(viewer);
 const native=installBase(viewer),entity=viewer.fasteners.entities.get('lbLoadcellLead');
 if(!entity)throw Error('Replacement heatsink requires the existing physical loadcell lead');
 const saved={...entity.mesh.userData.flexState};
 entity.update(0,0,1);
 const old=entity.mesh.clone(false);old.geometry=entity.mesh.geometry.clone();old.material=cloneServiceMaterial(entity.mesh.material);
 entity.update(saved.from,saved.to,saved.t);
 old.userData={part:'nextruderCables',component:OLD_LEAD,maintenanceComponent:OLD_LEAD,serviceTask:'heatsink-replacement',toolOnly:true,componentOnly:true,cadPath:[],illustration:true,sourceRef:'lbLoadcellLead',sourceState:0,cadName:'Original heatsink loadcell lead'};
 old.position.copy(entity.mesh.userData.restPosition||entity.mesh.position);old.quaternion.copy(entity.mesh.userData.restQuaternion||entity.mesh.quaternion);
 Object.assign(old.userData,{restPosition:old.position.clone(),sourceRestPosition:old.position.clone(),restQuaternion:old.quaternion.clone()});old.visible=false;
 viewer.group('nextruderCables').add(old);viewer.meshes.push(old);viewer.records.push({key:'nextruderCables',name:old.userData.cadName,mesh:old,id:old.uuid});
 // Service-only identities must never be captured by native assembly refs.
 for(const mesh of native.meshes){mesh.userData.cadPath=[];mesh.userData.componentOnly=true;mesh.userData.workspaceOnly='heatsink-replacement';}
 viewer.director.cache.clear();viewer.sceneSignature=undefined;
 const result={...native,oldLoadcellLead:old};installations.set(viewer,result);return result;
}
export function heatsinkReplacementScene(task,index,text){
 const spec=baseScene(task,index,text);if(!spec)return null;
 const step=task.steps[index],n=index+1,plan=spec.plan;
 if(n>=20)plan.visibleRefs=[...new Set([...(plan.visibleRefs||[]),R.replacement])];
 if(n<20||n>32)spec.hidden.push(OLD_LEAD);
 else{
  spec.isolated.push(OLD_LEAD);plan.solidRefs.push(OLD_LEAD);plan.visibleRefs=[...new Set([...(plan.visibleRefs||[]),OLD_LEAD])];
  for(const pose of plan.workpiecePoses)if(pose.refs.includes(R.original))pose.refs=[...pose.refs,OLD_LEAD];
  for(const actor of plan.actors)if(actor.refs?.includes(R.original))actor.refs=[...actor.refs,OLD_LEAD];
  if(step.officialId===929892){
   // Original cable leaves with the stripped original heatsink; the pictured
   // replacement arrives with its own cable. There is no cable-transfer step.
   for(const pose of plan.workpiecePoses)pose.refs=pose.refs.filter(ref=>ref!=='lbLoadcellLead');
   const incoming=plan.actors.find(a=>a.refs?.includes(R.replacement));if(!incoming)throw Error('Missing replacement heatsink arrival');
   incoming.refs=[...incoming.refs,'lbLoadcellLead'];
  }
 }
 return spec;
}
