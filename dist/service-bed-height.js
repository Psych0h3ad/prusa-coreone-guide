import * as T from 'three';
export const SERVICE_BED_REFS=Object.freeze(['bedSupport','heatbed','sheet']);
export const SERVICE_BED_REFERENCE=Object.freeze({nozzleTipZMM:305.5994212627411,sheetSurfaceZMM:78.43609840000585,startControlZMM:.5,targetControlZMM:150});
const enabled=new Set(['hotend','nozzle','nozzle-tool','nozzle-tool-bare','side-ir-replacement']);
const labels=[
 'ベッドを100mm以上まで下げ、停止を待つ',
 'Lower the bed to at least 100 mm and wait for it to stop',
 'Spustit podložku alespoň na 100 mm a vyčkat na zastavení',
 'Heizbett auf mindestens 100 mm absenken und Stillstand abwarten'
];
// Positive control Z increases nozzle-to-sheet clearance. The reference is
// printer-local CAD, not a world-coordinate value or a report from a machine.
export function bedOffsetForControlZ(frame,z){
 if(![frame.nozzleTipZMM,frame.sheetSurfaceZMM,z].every(Number.isFinite)||z<0)throw Error('Finite native bed datum and nonnegative control Z required');
 return frame.nozzleTipZMM-frame.sheetSurfaceZMM-z;
}
export function measureServiceBedReference(viewer){
 viewer.printer.updateMatrixWorld(true);const inverse=viewer.printer.matrixWorld.clone().invert();
 const bounds=meshes=>{const out=new T.Box3().makeEmpty();for(const m of meshes){m.geometry.computeBoundingBox();const rest=new T.Matrix4().compose(m.userData.restPosition??m.position,m.userData.restQuaternion??m.quaternion,m.scale),parent=inverse.clone().multiply(m.parent.matrixWorld);out.union(m.geometry.boundingBox.clone().applyMatrix4(parent.multiply(rest)));}return out;};
 const tips=viewer.meshes.filter(m=>m.userData.maintenanceComponent==='serviceNozzle'),sheet=viewer.director.resolve(['sheet']);
 if(!tips.length||!sheet.length)throw Error('Actual source nozzle and sheet are required for the service bed datum');
 const nozzle=bounds(tips),surface=bounds(sheet),frame={nozzleTipZMM:nozzle.min.z*1000,sheetSurfaceZMM:surface.max.z*1000,startControlZMM:.5,targetControlZMM:150};
 if(!Number.isFinite(bedOffsetForControlZ(frame,100)))throw Error('Invalid service bed reference');return Object.freeze(frame);
}
// Scene-level ABI: explicit frame, start/target control values and existing
// actor/workpiece pose consumers. Future procedures can opt in independently.
export function withBedHeightStage(spec,{frame=SERVICE_BED_REFERENCE,stage,label}){
 if(!['before','move','after'].includes(stage))throw Error('Unknown service bed stage');
 if(spec.plan.serviceBedHeight)return spec;
 const start=bedOffsetForControlZ(frame,frame.startControlZMM),end=bedOffsetForControlZ(frame,frame.targetControlZMM),plan={...spec.plan,actors:[...spec.plan.actors],workpiecePoses:[...(spec.plan.workpiecePoses||[])],serviceBedHeight:{...frame,stage,startOffsetMM:start,endOffsetMM:end}};
 if(stage==='move'){
  plan.actors.push({refs:[...SERVICE_BED_REFS],label,axis:[0,0,-1],distance:Math.abs(end-start),showBefore:true,focusMotion:true,camera:'front',focusRefs:[...SERVICE_BED_REFS],motionPivot:[0,0,0],posePath:[{offset:[0,0,start],rotation:[0,0,0]},{offset:[0,0,end],rotation:[0,0,0]}],serviceBedHeight:true});
  plan.headOnly=false;plan.solidRefs=[...new Set([...(plan.solidRefs||[]),...SERVICE_BED_REFS])];plan.camera='front';
 }else plan.workpiecePoses.push({refs:[...SERVICE_BED_REFS],pivot:[0,0,0],rotation:[0,0,0],offset:[0,0,stage==='before'?start:end],serviceBedHeight:true});
 return {...spec,plan};
}
export function serviceBedHeightScene(task,index,text,spec,frame=SERVICE_BED_REFERENCE){
 if(!enabled.has(task.id))return spec;
 const move=task.steps.findIndex(s=>s.firmwareActions?.includes('moveZ'));if(move<0)return spec;
 return withBedHeightStage(spec,{frame,label:text(labels),stage:index<move?'before':index===move?'move':'after'});
}
