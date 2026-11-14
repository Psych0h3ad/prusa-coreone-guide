import * as T from 'three';
// The source nozzle's helical crest has a 1 mm lead. Keep that relation during
// unscrewing, then stop rotating once the threaded length clears the block.
// Distances describe this model's motion, not a torque or turn-count instruction.
export const NOZZLE_AXIS=[-2.943578,-58.395252,0];
export const NOZZLE_RELEASE=12;
export const NOZZLE_WITHDRAWAL=75;
const threadPath=[
 {offset:[0,0,-NOZZLE_RELEASE],rotation:[0,0,-360*NOZZLE_RELEASE]},
 {offset:[0,0,0],rotation:[0,0,0]}
];
const axialPath=[[0,0,-NOZZLE_WITHDRAWAL],[0,0,-NOZZLE_RELEASE]];
const labels={
 loosen:['ノズルをねじから外す','Unscrew the nozzle','Vyšroubovat trysku','Düse herausschrauben'],
 withdraw:['チューブが抜けるまで引き下げる','Withdraw the complete nozzle tube','Vytáhnout celou trubičku trysky','Düsenrohr vollständig herausziehen'],
 insert:['チューブをまっすぐ差し込む','Insert the nozzle tube straight','Rovně zasunout trubičku trysky','Düsenrohr gerade einschieben'],
 tighten:['ブロックを支えてノズルを締める','Support the block and tighten the nozzle','Podepřít blok a dotáhnout trysku','Block halten und Düse festziehen']
};
export function nozzleServiceActors(remove,text){
 const common={refs:['serviceNozzle'],axis:[0,0,-1],distance:NOZZLE_WITHDRAWAL,showBefore:true,focusMotion:true,remove,keepRemoved:true};
 const thread={...common,label:text(labels[remove?'loosen':'tighten']),motionPivot:NOZZLE_AXIS,posePath:threadPath};
 const axial={...common,label:text(labels[remove?'withdraw':'insert']),waypoints:axialPath};
 const actors=remove?[thread,axial]:[axial,thread];
 actors[1].carry=true;
 return actors;
}

// Schematic support only: not manufacturer CAD or printable tool geometry.
// The real sock / no-sock tools are linked from the authored procedure.
export function installNozzleToolIllustrations(viewer){
 if(viewer.meshes.some(m=>m.userData.maintenanceComponent==='nozzleToolSock'))return;
 for(const sock of [true,false]){
  const component=sock?'nozzleToolSock':'nozzleToolBare',task=sock?'nozzle-tool':'nozzle-tool-bare',clearance=sock?1.5:0;
  const boxes=[[-16-clearance,-75-clearance,307.5,6,26+2*clearance,3],[0,-75-clearance,307.5,6+clearance,26+2*clearance,3],[-16-clearance,-77-clearance,310.5,22+2*clearance,3,14],[-19-clearance,-77-clearance,310.5,3,29+2*clearance,14],[6+clearance,-77-clearance,310.5,3,29+2*clearance,14]];
  for(const [x,y,z,w,d,h]of boxes){
   const geometry=new T.BoxGeometry(w/1000,d/1000,h/1000);geometry.translate((x+w/2)/1000,(y+d/2)/1000,(z+h/2)/1000);geometry.computeBoundingBox();
   const mesh=new T.Mesh(geometry,new T.MeshStandardMaterial({color:'#bcaa88',roughness:.85}));
   mesh.userData={part:'nozzleToolIllustration',cadName:'ノズル交換治具（模式図）',maintenanceComponent:component,serviceTask:task,toolOnly:true,illustration:true,officialCad:false,restPosition:mesh.position.clone(),restQuaternion:mesh.quaternion.clone()};
   viewer.group('nozzleToolIllustration').add(mesh);viewer.meshes.push(mesh);viewer.records.push({key:'nozzleToolIllustration',name:mesh.userData.cadName,mesh,id:mesh.uuid});
  }
 }
 viewer.director.cache.clear();
}

export function nozzleToolScene(task,index,text){
 const step=task.steps[index],tool=task.nozzleTool.sock?'nozzleToolSock':'nozzleToolBare',other=task.nozzleTool.sock?'nozzleToolBare':'nozzleToolSock',hidden=[other],poses=[];
 const plan={workspace:'printer',pose:'printer-standing',chapter:10,step:index+1,camera:step.refs.includes('lcd')?'front':step.refs.includes('heatbed')?'perspective':'hotend-perspective',focus:step.refs,focusPadding:20,operationPadding:12,transparentRefs:[],actors:[],seed:[],note:'',contextOpacity:.08,undersideView:true,headOnly:!step.refs.some(r=>['lcd','heatbed','psu'].includes(r)),solidRefs:[tool,'serviceBlock',795,807,...(index===0?['head']:[])]};
 const actor=(refs,label,axis,distance,extra={})=>({refs,label,axis,distance,showBefore:true,focusMotion:true,...extra});
 if(!task.nozzleTool.sock)hidden.push('serviceSock');
 if(index<6||index>13)hidden.push(tool);
 if(index===9)poses.push({refs:['serviceNozzle'],pivot:[0,0,0],rotation:[0,0,0],offset:[0,0,-NOZZLE_WITHDRAWAL]});
 if(index>=8&&index<12)poses.push({refs:[795,807],pivot:[0,0,0],rotation:[0,0,0],offset:[-2.5,0,0]});
 if(step.action==='tool-in')plan.actors.push(actor([tool],text(step.title),[0,0,-1],40));
 if(step.action==='tool-out')plan.actors.push(actor([tool],text(step.title),[0,0,-1],40,{remove:true}));
 if(step.action==='tool-release'||step.action==='tool-secure')for(const id of [795,807])plan.actors.push(actor([id],text(step.title),[-1,0,0],2.5,{remove:step.action==='tool-release',keepRemoved:true,spin:-1800}));
 if(step.action==='tool-nozzle-out')plan.actors.push(...nozzleServiceActors(true,text));
 if(step.action==='tool-nozzle-in')plan.actors.push(...nozzleServiceActors(false,text));
 if(!step.action){plan.inspectRefs=step.refs;plan.inspectionLabel=text(step.title);plan.inspectionPadding=3;}
 plan.workpiecePoses=poses;
 return {plan,hidden,disconnect:false,hotendLeadAmount:1};
}
