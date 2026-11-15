// SPDX-License-Identifier: GPL-3.0-only
import {PARTS}from './data.js?v=20261112-113';
import {cloneServiceMaterial}from './heatsink-service-material.js';
export const SENSOR_REPLACEMENT_REFS=Object.freeze({hallSensor:'sensorReplacementBoard',hallHolder:'sensorReplacementHolder',hallBall:'sensorReplacementBall',hallMagnet:'sensorReplacementMagnet',hallSpring:'sensorReplacementSpring'});
export const OLD_SENSOR_BOARD_LEAD='sensorServiceOldFilamentLead';
const owners=new WeakMap();
export function installInternalSensorGeometry(viewer){
 if(owners.has(viewer))return owners.get(viewer);
 if(!viewer.loaded||viewer.disposed)throw Error('Internal sensor needs a loaded native scene');
 // The native metal keeps its CAD identity even after the heatsink guide adds an alias.
 const sink=viewer.meshes.find(m=>m.userData.cadIndex===794&&!m.userData.illustration&&!m.userData.annotation);
 if(!sink||sink.userData.maintenanceComponent!=='heatsinkServiceOriginal')throw Error('Root159 original native794 seat is required');
 const groups=Object.entries(SENSOR_REPLACEMENT_REFS).map(([oldRef,newRef])=>{
  const sources=viewer.meshes.filter(m=>m.isMesh&&m.userData.part===oldRef&&!m.userData.annotation&&!m.userData.serviceTask);
  if(!sources.length)throw Error('Missing complete sensor source '+oldRef);
  return {oldRef,newRef,sources};
 });
 PARTS.internalSensorParts??={name:'内部フィラメントセンサーの交換部品',en:'Internal filament sensor replacement parts',desc:'既存の基板・機構の模式表示を使用しています。',icon:'sensor',offset:[0,0,0]};
 viewer.group('internalSensorParts');
 const copies=[];
 const add=(source,ref,label)=>{
  const clone=source.clone(false);clone.geometry=source.geometry.clone();clone.material=cloneServiceMaterial(source.material);
  clone.userData={part:'internalSensorParts',component:ref,maintenanceComponent:ref,componentOnly:true,cadPath:[],serviceTask:'internal-filament-sensor-replacement',toolOnly:true,illustration:true,sourceRef:label,geometryRole:source.userData.geometryRole,cadName:label+' replacement',restPosition:(source.userData.restPosition||source.position).clone(),restQuaternion:(source.userData.restQuaternion||source.quaternion).clone()};
  clone.position.copy(clone.userData.restPosition);clone.quaternion.copy(clone.userData.restQuaternion);clone.visible=false;
  (source.parent||viewer.group('internalSensorParts')).add(clone);viewer.meshes.push(clone);viewer.records.push({key:'internalSensorParts',name:clone.userData.cadName,mesh:clone,id:clone.uuid});copies.push(clone);return clone;
 };
 for(const {oldRef,newRef,sources}of groups)for(const source of sources)add(source,newRef,oldRef);
 const lead=viewer.fasteners.entities.get('lbFilamentLead'),load=viewer.fasteners.entities.get('lbLoadcellLead');
 if(!lead||!load)throw Error('Original sensor and loadcell cables required');
 const beforeLead={...lead.mesh.userData.flexState},beforeLoad={...load.mesh.userData.flexState};
 let oldLead;
 try{
  // Match the ordinary bench state: both right-hand connectors disconnected.
  load.update(0,0,1);lead.update(0,0,1);oldLead=add(lead.mesh,OLD_SENSOR_BOARD_LEAD,'original Hall board lead');
  Object.assign(oldLead.userData,{sourceState:0,sourceNeighborState:0});
 }finally{
  load.update(beforeLoad.from,beforeLoad.to,beforeLoad.t);lead.update(beforeLead.from,beforeLead.to,beforeLead.t);
 }
 viewer.director.cache.clear();viewer.sceneSignature=undefined;
 const owner={sink,groups:groups.map(g=>({oldRef:g.oldRef,newRef:g.newRef,meshes:g.sources.length})),copies,oldLead};owners.set(viewer,owner);return owner;
}
