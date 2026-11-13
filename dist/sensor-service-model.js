// SPDX-License-Identifier: GPL-3.0-only
// Existing native geometry only. Holding offsets/angles are explanatory poses,
// never manufacturer dimensions or extra release/adjustment prescriptions.
import {accessScene} from './maintenance-access.js?v=20261113-116';
import {leftCoverMotion} from './printhead-cover-motion.js?v=20261111-94';
export const HALL=['hallHolder','hallBall','hallMagnet','hallSpring'];
export const STACK=HALL.slice(1);
export const PG=[816,'mainPlate','pgRing','pgAssembly',804,813,814];
const BOLTS=[813,804,814],P=[5.8314,-58.3952524,409.40319];
const pos=(offset=[0,0,0],rotation=[0,0,0],pivot=[0,0,0])=>({offset,rotation,pivot});
const REST=pos(),PARK=pos([-60,-50,0]),HELD=pos([75,-55,0]);
const VERTICAL=pos([40,-55,0],[0,90,0],P),HUP=pos([75,-55,0],[0,90,0],P);
const TOOL=pos([55,-25,0]);
const COVER=pos(leftCoverMotion.posePath[0].offset,leftCoverMotion.posePath[0].rotation,leftCoverMotion.motionPivot);
function timeline(task){
 const state=new Map(),rows=[];
 const set=(refs,p)=>refs.forEach(r=>state.set(r,p));
 set(['pgAdapter'],TOOL);
 if(task.sensorService==='recovery'){
  set([858],COVER);set([879],pos([-20,0,0]));set([816,804,813,814,'mainPlate'],PARK);
  set(['pgAssembly'],pos([-25,-55,0]));set(['pgRing'],pos([25,-55,0]));
 }
 for(const step of task.steps){
  const before=new Map(state),ops=[];
  const move=(refs,to,via=[],label=step.title)=>{
   const from=state.get(refs[0])||REST;
   if(refs.some(r=>JSON.stringify(state.get(r)||REST)!==JSON.stringify(from)))throw Error('Non-rigid grouped start: '+step.id);
   if(JSON.stringify(from.pivot)!==JSON.stringify(to.pivot)&&from.rotation.some(Boolean)&&to.rotation.some(Boolean))throw Error('Incompatible pivot');
   const pivot=to.rotation.some(Boolean)?to.pivot:from.rotation.some(Boolean)?from.pivot:[0,0,0];
   ops.push({refs,label,motionPivot:pivot,posePath:[from,...via,to].map(p=>({offset:p.offset,rotation:p.rotation})),axis:[0,-1,0],distance:0,showBefore:true,focusMotion:true,focusRefs:refs});
   set(refs,to);
  };
  switch(step.id){
   case 'cover-out':move([879],pos([-20,0,0]));move([858],COVER,[...leftCoverMotion.posePath].reverse().slice(1,-1).map(p=>pos(p.offset,p.rotation,leftCoverMotion.motionPivot)));break;
   case 'case-screws-out':for(const id of BOLTS)move([id],pos([0,-4,0]));break;
   case 'block-out':
    // The loosened screws remain in the case; their local withdrawal is
    // composed with the intact block displacement, never silently reset.
    for(const r of PG)set([r],REST);
    move(PG,PARK,[pos([0,-50,0])]);break;
   case 'holder-out':move(HALL,HELD,[pos([0,-20,0]),pos([0,-55,0])]);break;
   case 'stack-out':move(STACK,pos([30,-55,0]));break;
   case 'clean':for(const [i,r]of STACK.entries())move([r],pos([22+8*i,-55,0]));break;
   case 'stack-build':for(const r of STACK)move([r],VERTICAL);break;
   case 'holder-up':move(['hallHolder'],HUP);break;
   case 'stack-in':move(STACK,HUP,[pos([40,-55,24],[0,90,0],P),pos([75,-55,24],[0,90,0],P)]);break;
   case 'holder-in':move(HALL,REST,[HELD,pos([0,-55,0]),pos([0,-20,0])]);break;
   case 'block-in':move(PG,REST,[pos([0,-50,0])]);break;
   case 'case-screws-in':
    // The seated visual pose does not assert a final tightening torque.
    for(const r of BOLTS){set([r],pos([0,-4,0]));move([r],REST);}break;
   case 'cover-in':move([858],REST,leftCoverMotion.posePath.slice(1,-1).map(p=>pos(p.offset,p.rotation,leftCoverMotion.motionPivot)));move([879],REST);break;
   case 'mainplate-in':move(['mainPlate'],REST,[pos([0,-50,0])]);break;
   case 'adapter-in':move(['pgAdapter'],pos([-25,-55,0]),[pos([-25,-85,0])]);break;
   case 'ring-in':move(['pgRing'],pos([-25,-55,0]),[pos([25,-90,0]),pos([-25,-90,0])]);break;
   case 'gears-in':move(['pgAssembly','pgRing','pgAdapter'],REST,[pos([0,-55,0]),pos([0,-20,0])]);break;
   case 'adapter-out':case 'adapter-final-out':move(['pgAdapter'],TOOL,[pos([0,-25,0])]);break;
   case 'adapter-check':move(['pgAdapter'],REST,[pos([0,-25,0])]);break;
   case 'recovery-case-in':move([816,804,813,814],REST,[pos([0,-50,0])]);break;
   case 'align-open':for(const id of BOLTS)move([id],pos([0,-1.2,0]));break;
   case 'align-tighten':for(const id of BOLTS)move([id],REST);break;
  }
  rows.push({before,after:new Map(state),ops});
 }
 return rows;
}
export function sensorServiceScene(task,index,text){
 const step=task.steps[index],row=timeline(task)[index];
 const active=new Set(row.ops.flatMap(o=>o.refs));
 const plan={workspace:'printer',pose:'printer-standing',chapter:10,step:index+1,camera:step.refs.includes('lcd')?'front':'hotend-perspective',headOnly:!step.refs.some(r=>['lcd','psu'].includes(r)),focus:step.refs,focusPadding:16,operationPadding:10,contextOpacity:.09,transparentRefs:[],solidRefs:[...HALL,...PG,794,859,858,'pgAdapter'],visibleRefs:['pgAdapter'],actors:row.ops.map(o=>({...o,label:text(o.label)})),workpiecePoses:[],seed:[],note:text(['小部品と保持位置は既存の模式表示を含みます。移動経路・角度は説明用で、実機の寸法・調整量ではありません。','Small parts include existing schematic representations. Holding paths and angles explain the work; they are not machine dimensions or adjustment settings.','Malé díly zahrnují stávající schematické znázornění. Dráhy a úhly držení vysvětlují práci, nejsou rozměry ani hodnotami seřízení.','Kleinteile enthalten vorhandene schematische Darstellungen. Haltewege und Winkel erläutern die Arbeit; sie sind keine Maschinenmaße oder Einstellwerte.'])};
 const ids=task.steps.map(s=>s.id),open=ids.indexOf('idler-open'),close=ids.indexOf('idler-close');
 if(step.id!=='scope'&&(task.sensorService!=='recovery'||index>ids.indexOf('adapter-final-out')))delete plan.visibleRefs;
 let mode;
 if(step.id==='idler-open'||step.id==='align-open')mode=0;
 else if(step.id==='idler-close'||step.id==='align-close')mode=2;
 else if((task.sensorService==='recovery'&&index<close)||(index>open&&index<close)||(index>ids.indexOf('align-open')&&index<ids.indexOf('align-close')))mode=1;
 const spec={plan,hidden:[],disconnect:false,hotendLeadAmount:1,flexStates:{serviceHotendFanLead:1,servicePrintLead:1,lbMotorLead:1,lbLoadcellLead:1,lbFilamentLead:1,lbNtcLead:1,lbMainLead:1}};
 if(mode!==undefined){
  const acts=plan.actors;
  accessScene({id:'extruder',steps:[step,step,step]},mode,text,spec);
  if(mode!==1)plan.actors=[...acts,...plan.actors];
  // Existing service-drive inspection marker is not the sensor mechanism.
  plan.inspectRefs=[];plan.focus=step.refs;plan.inspectionLabel='';plan.camera=step.refs.includes('lcd')?'front':'hotend-perspective';
  plan.solidRefs=[...new Set([...plan.solidRefs,...HALL,...PG,858,'pgAdapter'])];
  plan.transparentRefs=[];delete plan.viewBounds;delete plan.viewMinDistance;
 }
 if(step.id==='washer'){
  // The parked case is to the left. Look directly into the exposed shaft.
  Object.assign(plan,{camera:'front',viewBounds:[-19,-72,381,24,-32,424],viewMinDistance:87});
 }
 if(step.id==='holder-out'){
  // Fit the exposed slot and full withdrawal together, including during seeks.
  const bounds=[-29,-121,389,93,-45,431];
  Object.assign(plan,{camera:'front',viewBounds:bounds,viewMinDistance:120});
  Object.assign(plan.actors[0],{camera:'front',focusBounds:bounds,focusPadding:0,
   focusMinDistance:120,guideRadius:2.7,guideTube:.5,guideArrowLength:12,
   guideAtAnchor:true,anchors:[P],guideOrigin:true,keepGuide:true,guideGhost:false,
   calloutAvoidBounds:[-12,-121,401,93,-52,420]});
 }
 if(step.id==='adapter-final-out'){
  // Keep the gear face and ring-to-main-plate seam in frame as the tool clears.
  Object.assign(plan,{camera:'right-perspective',viewBounds:[-24,-81,377,32,-32,438],viewMinDistance:100});
  plan.actors[0].focusMotion=false;
 }
 for(const [ref,p]of row.before)if(!active.has(ref))plan.workpiecePoses.push({refs:[ref],...p});
 // Only local bolt loosening is added to the block actor's original frame.
 const looseFrom=ids.indexOf('case-screws-out'),looseUntil=ids.indexOf('case-screws-in');
 if(looseFrom>=0&&index>looseFrom&&index<looseUntil)for(const r of BOLTS)plan.workpiecePoses.push({refs:[r],...pos([0,-4,0])});
 // A hardware-only context pose is used for this step's explanatory bolts.
 if(step.id==='case-screws-in')plan.workpiecePoses=plan.workpiecePoses.filter(p=>!BOLTS.includes(p.refs[0]));
 // The reused access helper can exclude its own drive-area annotation;
 // this procedure adds no visibility exclusions, including physical parts.
 spec.hidden=[];
 return spec;
}
