import * as THREE from 'three';
import {withGluedInstalledPose} from './glued-handle-plan.js';
import {gluedHandlePose} from './glued-handle-motion.js';
import {FLOWS,PARTS} from './data.js?v=20261112-113';
import {ASSEMBLY_PLAN} from './assembly-plan-runtime.js?v=20261113-116';
import {SENSOR_ASSEMBLY} from './sensor-assembly-data.js?v=20261111-94';

const assemblyVariantMatches=(m,flow,variant,original=false)=>m.userData.legacyDoorHandle?original||flow!=='build'||variant!=='screw':!m.userData.assemblyVariant||!original&&flow==='build'&&m.userData.assemblyVariant===variant;

// The director operates on CAD leaves, independently of the library's unit groups.
// A bench owns its workpiece until the manual explicitly transfers it to the printer.
export class AssemblyDirector {
 constructor(meshes){this.meshes=meshes;this.cache=new Map();}
 resolve(refs=[]){return this.meshes.filter(m=>!m.userData.manualExcluded&&refs.some(r=>typeof r==='number'?m.userData.cadPath?.includes(r):m.userData.part===r&&!m.userData.componentOnly||m.userData.flexId===r||m.userData.component===r));}
 compile(flow,variant='screw'){
  const key=flow+variant;if(this.cache.has(key))return this.cache.get(key);
  const ownedMeshes=this.meshes.filter(m=>assemblyVariantMatches(m,flow,variant));
  const owner=new Map(),restPoses=flow==='upgrade'||FLOWS[flow]?.manualID===2251?{...SENSOR_ASSEMBLY.oldRestPoses}:{};
  if(flow==='upgrade')this.compile('build',variant);
  let flexStates=flow==='upgrade'?{...this.finalFlexStates}:{};
  if(flow==='upgrade')for(const m of ownedMeshes)if(!m.userData.manualExcluded&&!m.userData.toolOnly&&(!PARTS[m.userData.part]?.plus||PARTS[m.userData.part]?.reused)&&m.userData.part!=='alternate')owner.set(m,'printer');
  const scenes=FLOWS[flow].steps.map(step=>{
   const plan=ASSEMBLY_PLAN[flow][step.officialId];
   if(step.variant&&step.variant!==variant)return {plan,visible:[],actors:[]};
   for(const key of plan.releaseRest||[])delete restPoses[key];
   for(const m of this.resolve(plan.seed))owner.set(m,plan.workspace);
   for(const m of ownedMeshes)if(plan.contextFrom?.includes(owner.get(m)))owner.set(m,plan.workspace);
   const states={...flexStates};
   const actors=plan.actors.map((spec,sourceIndex)=>{
    const nodes=(spec.flex?[...new Set([...this.meshes.filter(m=>spec.flex.includes(m.userData.flexId)),...this.resolve(spec.followRefs||[])])]:spec.scope?this.meshes.filter(m=>owner.get(m)===spec.scope):this.resolve(spec.refs)).filter(m=>assemblyVariantMatches(m,flow,variant)&&(!m.userData.workspaceOnly||m.userData.workspaceOnly===plan.workspace));
    const fromStates=spec.flex?Object.fromEntries(spec.flex.map(id=>[id,flexStates[id]||0])):undefined;
    if(spec.flex)for(const id of spec.flex)flexStates[id]=spec.to;
    for(const m of nodes)owner.set(m,spec.destination||(spec.remove?'removed':plan.workspace));
    return {...spec,nodes,fromStates,sourceIndex};
   }).filter(a=>a.nodes.length);
   const visible=ownedMeshes.filter(m=>(!m.userData.workspaceOnly||m.userData.workspaceOnly===plan.workspace)&&(owner.get(m)===plan.workspace||plan.contextOwners?.includes(owner.get(m))||actors.some(a=>a.nodes.includes(m))));
   return {plan,visible,actors,restPoses:{...restPoses},flexStates:states,finalFlexStates:{...flexStates}};
  });
  if(flow==='build')this.finalFlexStates={...flexStates};
  this.cache.set(key,scenes);return scenes;
 }
 scene(state){
  const step=FLOWS[state.flow].steps[state.index],scene=this.compile(state.flow,state.variant)[state.index],gluedIndex=FLOWS.build.steps.findIndex(s=>(s.programOfficialId??s.officialId)===999288);
  const full=state.explore||scene.plan.overview;
  if(full||state.comparison==='before'){
   const original=FLOWS[state.flow]?.manualID===2251||state.comparison==='before'||state.flow==='upgrade'&&!state.explore&&!step.final;
   this.compile('build',state.variant);
   const plan={...scene.plan,workspace:'printer',pose:undefined,workpiecePoses:undefined,contextOwners:undefined,focus:[],camera:'perspective',contextOpacity:undefined,transparentRefs:undefined,inspectBoard:false,undersideView:false,note:original?'CORE Oneの完成形':'CORE One+の完成形'};
   return withGluedInstalledPose({plan,actors:[],restPoses:original?SENSOR_ASSEMBLY.oldRestPoses:{},flexStates:this.finalFlexStates,visible:this.meshes.filter(m=>assemblyVariantMatches(m,state.flow,state.variant||'screw',original)&&!m.userData.manualExcluded&&!m.userData.toolOnly&&m.userData.part!=='alternate'&&(original?!PARTS[m.userData.part]?.plus||PARTS[m.userData.part]?.reused:!PARTS[m.userData.part]?.old)),full:true},state,gluedIndex);
  }
  return withGluedInstalledPose(scene,state,gluedIndex);
 }
}

export function smooth(t){t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);}
export function operationAt(progress,count){const p=Math.max(0,Math.min(1,progress))*count;return {index:Math.min(count-1,Math.floor(p)),t:p>=count?1:p-Math.floor(p)};}
export function poseOnPath(points,t){
 const lengths=points.slice(1).map((p,i)=>p.distanceTo(points[i])),total=lengths.reduce((a,b)=>a+b,0);
 let d=smooth(t)*total;for(let i=0;i<lengths.length;i++){if(d<=lengths[i]||i===lengths.length-1)return points[i].clone().lerp(points[i+1],lengths[i]?d/lengths[i]:1);d-=lengths[i];}return points.at(-1).clone();
}
export function rigidMotion(actor,t){
 const u=actor.remove?1-t:t,tilt=actor.tilt;
 if(actor.rigidPose)return actor.rigidPose(u);
 if(actor.gluedPhase)return gluedHandlePose(actor.gluedPhase,u);
 if(actor.posePath&&(u<=0||u>=1)){
  const pose=u<=0?actor.posePath[0]:actor.posePath.at(-1),axis=vec(pose.rotation),angle=axis.length(),rotation=new THREE.Quaternion();
  if(angle)rotation.setFromAxisAngle(axis.multiplyScalar(1/angle),THREE.MathUtils.degToRad(angle));
  return {offset:vec(pose.offset).multiplyScalar(.001),rotation,pivot:vec(actor.motionPivot).multiplyScalar(.001)};
 }
 if(actor.posePath){const poses=actor.posePath,weights=actor.poseTiming??poses.slice(1).map((p,i)=>vec(p.offset).distanceTo(vec(poses[i].offset))+.7*vec(p.rotation).distanceTo(vec(poses[i].rotation))),total=weights.reduce((a,b)=>a+b,0);let d=smooth(u)*total,k=0;while(k<weights.length-1&&d>weights[k])d-=weights[k++];const a=poses[k],b=poses[k+1],f=weights[k]?d/weights[k]:1,rv=vec(a.rotation).lerp(vec(b.rotation),f),angle=rv.length(),rotation=new THREE.Quaternion();if(angle)rotation.setFromAxisAngle(rv.multiplyScalar(1/angle),THREE.MathUtils.degToRad(angle));return {offset:vec(a.offset).lerp(vec(b.offset),f).multiplyScalar(.001),rotation,pivot:vec(actor.motionPivot).multiplyScalar(.001)};}
 const offset=poseOnPath(actor.path,tilt&&!tilt.sync?Math.min(1,u/.6):u);
 const rotation=new THREE.Quaternion(),pivot=new THREE.Vector3();
 if(tilt){pivot.fromArray(tilt.pivot).multiplyScalar(.001);rotation.setFromAxisAngle(new THREE.Vector3(...tilt.axis).normalize(),THREE.MathUtils.degToRad(tilt.degrees)*(1-smooth(tilt.sync?u:Math.max(0,(u-.6)/.4))));}
 else if(actor.spin||actor.wiggle){pivot.copy(actor.box.getCenter(new THREE.Vector3()));const angle=actor.spin?THREE.MathUtils.degToRad(actor.spin)*smooth(u):THREE.MathUtils.degToRad(actor.wiggle)*Math.sin(u*Math.PI*4)*(1-u);if(u>0&&u<1)rotation.setFromAxisAngle(new THREE.Vector3(...actor.axis).normalize(),angle);}
 else if(actor.turn&&!actor.remove){pivot.copy(actor.box.getCenter(new THREE.Vector3()));rotation.setFromAxisAngle(new THREE.Vector3(...actor.axis).normalize(),THREE.MathUtils.degToRad(actor.turn)*(1-smooth(Math.max(0,(u-.65)/.35))));}
 return {offset,rotation,pivot};
}
export function motionGuide(actor,point){
 const forward={...actor,remove:false};
 return actor.gluedPhase||actor.rigidPose||actor.posePath||actor.tilt||actor.turn||actor.spin||actor.wiggle?Array.from({length:65},(_,i)=>{const q=rigidMotion(forward,i/64);return point.clone().sub(q.pivot).applyQuaternion(q.rotation).add(q.pivot).add(q.offset);}):actor.path.map(p=>point.clone().add(p));
}
export function motionBounds(actor){
 const box=new THREE.Box3();
 for(const x of [actor.box.min.x,actor.box.max.x])for(const y of [actor.box.min.y,actor.box.max.y])for(const z of [actor.box.min.z,actor.box.max.z])for(const p of motionGuide(actor,new THREE.Vector3(x,y,z)))box.expandByPoint(p);
 return actor.gluedPhase||actor.rigidPose||actor.posePath||actor.tilt||actor.turn||actor.spin||actor.wiggle?box.expandByScalar(.003):box;
}
const vec=p=>new THREE.Vector3(...p);
// Collision broad phase is deliberately conservative. Staging clears the whole
// workpiece bounding box. Final insertion follows the declared mounting axis.
// This is a visual path planner, not a mechanical clearance certification.
export function approachPath(actorBox,contextBox,axis,distance,seat=[0,0,0]){
 const direction=new THREE.Vector3(...axis).normalize();
 const end=new THREE.Vector3(...seat).multiplyScalar(.001);
 if(distance!==undefined)return [direction.clone().multiplyScalar(distance/1000).add(end),end];
 let clear=.055;
 if(!contextBox.isEmpty()){
  // Separate along one axis even for a diagonal declared direction.
  const intervals=['x','y','z'].filter(k=>Math.abs(direction[k])>.01).map(k=>direction[k]>0?(contextBox.max[k]-actorBox.min[k]+.035)/direction[k]:(contextBox.min[k]-actorBox.max[k]-.035)/direction[k]);
  clear=Math.max(clear,Math.min(...intervals));
 }
 const size=actorBox.getSize(new THREE.Vector3());clear=Math.max(clear,Math.min(.12,size.length()*.25));
 return [direction.clone().multiplyScalar(clear).add(end),direction.clone().multiplyScalar(Math.min(.025,clear*.22)).add(end),end];
}
