import * as T from 'three';
import {sensorServiceScene} from './sensor-service-model.js?v=20261113-116';
import {accessScene,ARM,CLAMP,IDLER_PIVOT,CLAMP_PIVOT,AIR_HOLE} from './maintenance-access.js?v=20261113-116';
const alias='motorShaftWorkpoint',plateAlias='motorPlateWorkpoint';
const rot=(refs,pivot,y)=>({refs,pivot,rotation:[0,y,0],offset:[0,0,0]});
export function registerCompletionWorkpoints(viewer){
 const selected=[];
 for(const mesh of viewer.meshes.filter(m=>m.userData.cadIndex===790)){
  if(!mesh.geometry.boundingBox)mesh.geometry.computeBoundingBox();
  const matrix=new T.Matrix4().compose(mesh.userData.sourceRestPosition||mesh.userData.restPosition||mesh.position,mesh.userData.restQuaternion||mesh.quaternion,mesh.scale);
  const box=mesh.geometry.boundingBox.clone().applyMatrix4(matrix),size=box.getSize(new T.Vector3()).multiplyScalar(1000),centre=box.getCenter(new T.Vector3()).multiplyScalar(1000);
  if(Math.abs(size.x-4.9953)<.1&&Math.abs(size.y-19.5)<.1&&Math.abs(size.z-4.9996)<.1&&Math.abs(centre.x-9.0588)<.1&&Math.abs(centre.z-393.0004)<.1)selected.push(mesh);
 }
 if(selected.length!==1)throw Error('Expected exactly one original CAD790 shaft surface, got '+selected.length);
 const mesh=selected[0];if(mesh.userData.maintenanceComponent&&mesh.userData.maintenanceComponent!==alias)throw Error('Shaft workpoint role already owned');
 mesh.userData.maintenanceComponent=alias;
 // The plate's broad part key also resolves a separate air-hole annotation.
 // Bind the existing plate surface itself, without exposing that other task's marker.
 const plates=viewer.meshes.filter(m=>m.userData.part==='mainPlate'&&m.userData.maintenanceComponent!==AIR_HOLE);
 if(plates.length!==1)throw Error('Expected exactly one existing main-plate surface, got '+plates.length);
 if(plates[0].userData.maintenanceComponent&&plates[0].userData.maintenanceComponent!==plateAlias)throw Error('Main-plate workpoint role already owned');
 plates[0].userData.maintenanceComponent=plateAlias;
 return {ref:alias,cadIndex:790,meshes:1,geometry:mesh.geometry,position:mesh.position,quaternion:mesh.quaternion};
}
const basic=(task,index,text)=>{
 const s=task.steps[index],physical=s.refs.filter(r=>r!=='lcd'),refs=physical.length?physical:s.refs,plan={workspace:'printer',pose:'printer-standing',chapter:10,step:index+1,camera:physical.length?'hotend-perspective':'front',headOnly:physical.length>0,focus:refs,inspectRefs:refs,inspectionLabel:text(s.title),inspectionPadding:3,focusPadding:18,contextOpacity:.06,undersideView:true,transparentRefs:[48,52,87,570],actors:[],seed:[],note:''};
 return {plan,hidden:[],disconnect:false,flexStates:{serviceHotendFanLead:1,servicePrintLead:1}};
};
export function completionScene(task,index,text){
 if(task.motorInspection){
  const spec=sensorServiceScene({...task,sensorService:'motor'},index,text);
  const step=task.steps[index];
  if(step.inspection)Object.assign(spec.plan,{inspectRefs:step.refs,inspectionLabel:text(step.title),inspectionPadding:3,contextOpacity:.08});
  if(step.id==='scope')Object.assign(spec.plan,{focus:[816,plateAlias,'pgAssembly','pgRing'],inspectRefs:[816,plateAlias,'pgAssembly','pgRing']});
  if(task.steps[index].id==='motor-shaft'){
   Object.assign(spec.plan,{camera:'front',viewBounds:[2,-79,385,17,-48,401],viewMinDistance:65,undersideView:true,focus:[alias],inspectRefs:[alias],inspectionLabel:text(task.steps[index].title),inspectionPadding:1,contextOpacity:.08});
   // No shaft/rotor rotation: resistance is a tactile check on the actual printer.
  }
  return spec;
 }
 if(task.needleClear)return basic(task,index,text);
 if(!task.manualColdPull)return null;
 const spec=basic(task,index,text),id=task.steps[index].id;
 const inletOpen=['manual-inlet'],idlerOpen=['manual-idler-open'],idlerClose=['manual-idler-close'],inletClose=['manual-inlet-refit'];
 const starts=task.steps.findIndex(s=>s.id==='manual-inlet'),ends=task.steps.findIndex(s=>s.id==='manual-inlet-refit');
 const opens=task.steps.findIndex(s=>s.id==='manual-idler-open'),closes=task.steps.findIndex(s=>s.id==='manual-idler-close');
 if(index<starts||index>ends)return spec;
 const step=task.steps[index];let mode;
 if(inletOpen.includes(id)||idlerOpen.includes(id))mode='open';else if(inletClose.includes(id)||idlerClose.includes(id))mode='close';else mode='held';
 const surrogate={id:'feed-clear',steps:[step,step,step,step,step,step]};
 accessScene(surrogate,mode==='open'?1:mode==='close'?4:2,text,spec);
 const openingInlet=inletOpen.includes(id),closingInlet=inletClose.includes(id),openingIdler=idlerOpen.includes(id),closingIdler=idlerClose.includes(id);
 if(openingInlet||closingInlet)spec.plan.actors=spec.plan.actors.filter(a=>['guide','fitting'].includes(a.accessRole));
 else if(openingIdler||closingIdler)spec.plan.actors=spec.plan.actors.filter(a=>['arm','clamp'].includes(a.accessRole));
 else spec.plan.actors=[];
 for(const actor of spec.plan.actors)if(['guide','fitting'].includes(actor.accessRole))actor.label=text(step.title);
 const holdInlet=index>starts&&index<ends;
 const holdIdler=index>opens&&index<closes;
 Object.assign(spec.plan.access,{inletHeld:holdInlet,armHold:openingIdler||closingIdler?undefined:holdIdler?-10:0,clampHold:openingIdler||closingIdler?undefined:holdIdler?45:0});
 spec.plan.workpiecePoses=[];
 if(!openingIdler&&!closingIdler)spec.plan.workpiecePoses.push(rot(ARM,IDLER_PIVOT,holdIdler?-10:0),rot(CLAMP,CLAMP_PIVOT,holdIdler?45:0));
 if(id==='manual-load')Object.assign(spec.plan,{camera:'top-perspective',headOnly:true,focus:[794,817],inspectRefs:[794],viewBounds:[-20,-78,411,22,-27,471],viewMinDistance:100,contextOpacity:.12});
 if(id==='manual-pull')Object.assign(spec.plan,{camera:'top-perspective',headOnly:true,focus:[794,817],inspectRefs:[794],viewBounds:[-20,-78,411,22,-27,481],viewMinDistance:110,contextOpacity:.12,undersideView:false,inspectionLabel:text(step.title)});
 // Model and caption share the same inlet / idler phase. No sample filament,
 // hand, needle or force animation is added to the native geometry.
 return spec;
}
