import {serviceBedHeightScene,measureServiceBedReference} from './service-bed-height.js';
import {installCrossflowTie13} from './r13-tie-service.js';
import {completionScene,registerCompletionWorkpoints} from './maintenance-completion-model.js?v=20261113-123';
import {initialSetupPhysicalScene,normalizeInitialSetupFrame,initialSetupPhaseCaption} from './initial-setup-physical.js?v=20261113-123';
import {installServiceSockCaption} from './service-sock-caption.js?v=20261111-95';
import {installServiceCoverVariant} from './service-cover-variant.js?v=20261112-105';
import {sensorServiceScene} from './sensor-service-model.js?v=20261113-116';
import {ntcServiceScene}from './heatsink-ntc-model.js?v=20261111-94';
import {registerNTCSource}from './heatsink-ntc-cable.js?v=20261111-94';
import {NEXTRUDER_INTERNAL_REFS}from './nextruder-service-parts.js?v=20261111-94';
import {FLOWS,PARTS} from './data.js?v=20261112-113';
import {installServiceFanCables} from './service-fan-cables.js?v=20261111-94';
import {leftCoverMotion,leftCoverScrewMotion,leftCoverView} from './printhead-cover-motion.js?v=20261111-94';
import {loveBoardServiceScene}from './loveboard-service-model.js?v=20261111-94';
import {sampleNativeJ13,createNativeJ13SurfaceWriter} from './native-j13.js?v=20261114-129';
import {installMainService615,prepareMainServiceScene615,loveboardFlexNodes615,setMainServiceEnabled615} from './loveboard-main-service.js';
import {installLoveBoardServiceCables}from './loveboard-service-cables.js?v=20261112-113';
import {xBuddyServiceScene}from './xbuddy-service-model.js?v=20261111-94';
import {installXBuddySensorCables}from './xbuddy-sensor-cables.js?v=20261111-94';
import {XBuddyPreparedTieRoute}from './xbuddy-tie-routing.js?v=20261111-94';
import {nozzleServiceActors,NOZZLE_WITHDRAWAL,installNozzleToolIllustrations,nozzleToolScene}from './nozzle-service-motion.js?v=20261111-94';
import {accessScene,installMaintenanceAccess,DRIVE_ACCESS}from './maintenance-access.js?v=20261113-116';
import {heaterReplacementScene} from './heater-service-model.js';
import {ensureHeaterResources,localizeHeaterResources} from './heater-service-geometry.js';
const HOTEND=['hotend','hotendThermistor0','hotendThermistor1','hotendHeater0','hotendHeater1'],LEADS=HOTEND.slice(1),TOP=[87,'ventBlock'];
const HF='serviceHotendFanLead',PF='servicePrintLead',HOT_FAN=[791,HF],PRINT_FAN=[833,PF];
const printFanMotion={waypoints:[[0,35,35],[0,0,0]],tilt:{axis:[1,0,0],degrees:-30,pivot:[9,19.9,369.6],sync:true}};
const M={loosePrint:'プリントファンを抜く|Unplug the print fan|Odpojit tiskový ventilátor|Drucklüfter abstecken'.split('|'),looseFan:'ホットエンドファンを抜く|Unplug the hotend fan|Odpojit ventilátor hotendu|Hotend-Lüfter abstecken'.split('|'),loose:'つまみネジを緩める|Loosen the thumbscrew|Povolit ruční šroub|Rändelschraube lockern'.split('|'),tight:'つまみネジを締める|Tighten the thumbscrew|Dotáhnout ruční šroub|Rändelschraube festziehen'.split('|'),sockOut:'ソックを外す|Remove the sock|Sejmout návlek|Socke abnehmen'.split('|'),sockIn:'ソックを戻す|Refit the sock|Nasadit návlek|Socke montieren'.split('|')};
const actor=(refs,label,axis,distance,extra={})=>({refs,label,axis,distance,showBefore:true,focusMotion:true,...extra});
function baseMaintenanceSceneSpec(task,index,text,firmwareFrame,bedFrame){
 const heater=heaterReplacementScene(task,index,text,(reference,at)=>maintenanceSceneSpec(reference,at,text,firmwareFrame,bedFrame));if(heater)return heater;
 const initial=initialSetupPhysicalScene(task,index,text,firmwareFrame);if(initial)return initial;
 const complete=completionScene(task,index,text);if(complete)return complete;
 if(task.sensorService)return sensorServiceScene(task,index,text);
 if(task.nozzleTool)return nozzleToolScene(task,index,text);
 if(task.id==='heatsink-ntc')return ntcServiceScene(task,index,text);
 if(task.id==='loveboard')return loveBoardServiceScene(task,index,text);
 if(task.id==='xbuddy')return xBuddyServiceScene(task,index,text);
 const s=task.steps[index],n=index+1,repair=['hotend','nozzle','hotendfan'].includes(task.id);
 const plan={workspace:'printer',pose:'printer-standing',chapter:10,step:n,camera:s.camera||'perspective',focus:s.refs,focusPadding:20,operationPadding:12,transparentRefs:s.transparent||[],actors:[],seed:[],note:''},hidden=[],poses=[];
 const move=(refs,offset)=>poses.push({refs,pivot:[0,0,0],rotation:[0,0,0],offset});
 const flexStates={[HF]:1,[PF]:1};if(['hotendfan','printfan'].includes(task.id))plan.solidRefs=s.refs;
 if(['cover-in','cover-out'].includes(s.action))Object.assign(plan,leftCoverView);
 if((repair||task.id==='printfan')&&!s.refs.some(r=>['lcd','heatbed','psu','top'].includes(r)))plan.headOnly=true;
 const flex=(id,to,label)=>{
  if(to===1)plan.settledFocus=[id===HF?791:834,'loveBoard'];
  plan.actors.push({flex:[id],to,label,axis:[0,0,1],focusMotion:true,focusRefs:id===HF?[791,794,'loveBoard']:[834,857,'loveBoard']});
 };
 const fanActions=()=>{
  if(s.action==='fans-unplug'){flex(PF,0,text(M.loosePrint));flex(HF,0,text(M.looseFan));}
  if(s.action==='printfan-unplug')flex(PF,0,text(s.title));
  if(s.action==='hotfan-plug')flex(HF,1,text(s.title));
  if(s.action==='printfan-plug')flex(PF,1,text(s.title));
  if(s.action==='hotfan-out'){for(const id of [819,821])plan.actors.push(actor([id],'M3×18',[0,-1,0],25,{remove:true,spin:1080}));plan.actors.push(actor(HOT_FAN,text(s.title),[0,-1,0],35,{remove:true,keepRemoved:true}));}
  if(s.action==='hotfan-in'){plan.actors.push(actor(HOT_FAN,text(s.title),[0,-1,0],35));for(const id of [819,821])plan.actors.push(actor([id],'M3×18',[0,-1,0],25,{spin:1080,showBefore:false}));}
  if(s.action==='printfan-out')plan.actors.push(actor([845],'M3×25',[0,.906307787,-.422618262],30,{remove:true,spin:1440}),actor(PRINT_FAN,text(s.title),[0,1,1],35,{...printFanMotion,remove:true,keepRemoved:true}));
  if(s.action==='printfan-in'){plan.actors.push(actor(PRINT_FAN,text(s.title),[0,1,1],35,printFanMotion),actor([845],'M3×25',[0,.906307787,-.422618262],30,{spin:1440,showBefore:false}));flex(PF,1,text(s.title));}
 };
 if(repair){
  const position=action=>task.steps.findIndex(s=>s.action===action)+1;
  const insert=position('hotend-in'),cover=position('cover-in'),top=position('top-in'),plug=position('plug'),unplug=position('unplug'),out=position('hotend-out'),route=position('route-hotend');
  const hotendLeadAmount=n<=unplug?1:n<=out?.35:n<=route?0:n<=plug?.35:1;
  plan.camera=s.refs.includes('lcd')?'front':s.refs.includes('top')?'top-perspective':'hotend-perspective';
  plan.contextOpacity=.08;plan.undersideView=true;
  if(n>5&&n<top)hidden.push(...TOP);
  if(n>7&&n<cover)hidden.push(858,879);
  if(n>9&&n<insert){move(HOTEND,[0,0,-60]);move([795,807],[-2.5,0,0]);}
  if(task.id==='nozzle'&&n===11){move(['serviceNozzle'],[0,0,-NOZZLE_WITHDRAWAL]);hidden.push('serviceSock');}
  const a=plan.actors;
  if(s.action==='top-out')a.push(actor(TOP,text(s.title),[0,0,1],70,{remove:true}));
  if(s.action==='top-in')a.push(actor(TOP,text(s.title),[0,0,1],70));
  if(s.action==='cover-out')a.push(actor([879],'M3×10',[-1,0,0],20,{...leftCoverScrewMotion,remove:true,spin:1080}),actor([858],text(s.title),[-1,0,0],35,{...leftCoverMotion,remove:true}));
  if(s.action==='cover-in')a.push(actor([858],text(s.title),[-1,0,0],35,leftCoverMotion),actor([879],'M3×10',[-1,0,0],20,{...leftCoverScrewMotion,spin:1080,showBefore:false}));
  const hotendFlex=(kind,from,to)=>a.push({flex:[`hotend${kind}0`,`hotend${kind}1`],fromStates:{[`hotend${kind}0`]:from,[`hotend${kind}1`]:from},to,label:kind==='Heater'?'HEATER':'NT',axis:[0,0,1],focusMotion:true,showBefore:true});
  if(['unplug','plug','route-hotend'].includes(s.action)){
   const connect=s.action!=='unplug',order=connect?['Thermistor','Heater']:['Heater','Thermistor'];plan.inspectBoard=s.action!=='route-hotend';plan.transparentRefs=[790,794,816];plan.camera='wiring-perspective';
   const from=s.action==='unplug'?1:s.action==='plug'?.35:0,to=s.action==='plug'?1:.35;
   for(const kind of order)hotendFlex(kind,from,to);
  }
  if(s.action==='hotend-out'){for(const kind of ['Heater','Thermistor'])hotendFlex(kind,.35,0);for(const id of [795,807])a.push(actor([id],text(M.loose),[-1,0,0],2.5,{remove:true,keepRemoved:true,spin:-1800}));a.push(actor(HOTEND,text(s.title),[0,0,-1],60,{remove:true,keepRemoved:true}));}
  if(s.action==='hotend-in'){a.push(actor(HOTEND,text(s.title),[0,0,-1],60));for(const id of [795,807])a.push(actor([id],text(M.tight),[-1,0,0],2.5,{spin:-1800}));}
  if(s.action==='nozzle-out')a.push(actor(['serviceSock'],text(M.sockOut),[0,0,-1],20,{remove:true}),...nozzleServiceActors(true,text));
  if(s.action==='nozzle-in')a.push(...nozzleServiceActors(false,text),actor(['serviceSock'],text(M.sockIn),[0,0,-1],20));
  if(task.id==='hotendfan'){
   flexStates[HF]=n>10&&n<=14?0:1;flexStates[PF]=n>10&&n<=15?0:1;
   if(n===12){move(HOT_FAN,[0,-35,0]);hidden.push(819,821);}
   if(['fans-unplug','hotfan-plug','printfan-plug'].includes(s.action)){plan.inspectBoard=true;plan.camera='service-fan-connect';plan.transparentRefs=[790,794,816];plan.solidRefs=[...s.refs,791,794];}
   if(['hotfan-out','hotfan-in'].includes(s.action))plan.camera='hotend-perspective';
   fanActions();
  }
  plan.workpiecePoses=poses;
  return {plan,hidden,disconnect:n>8&&n<=plug,hotendLeadAmount,flexStates};
 }
 if(task.id==='printfan'){
  plan.camera='service-print-perspective';plan.contextOpacity=.08;plan.undersideView=true;
  if(n>6&&n<14)hidden.push(...TOP);if(n>8&&n<13)hidden.push(858,879);
  flexStates[PF]=n>9&&n<=12?0:1;
  if(n===11){poses.push({refs:PRINT_FAN,pivot:printFanMotion.tilt.pivot,rotation:[-30,0,0],offset:[0,35,35]});hidden.push(845);}
  if(s.action==='top-out')plan.actors.push(actor(TOP,text(s.title),[0,0,1],70,{remove:true}));
  if(s.action==='top-in')plan.actors.push(actor(TOP,text(s.title),[0,0,1],70));
  if(s.action==='cover-out')plan.actors.push(actor([879],'M3×10',[-1,0,0],20,{...leftCoverScrewMotion,remove:true,spin:1080}),actor([858],text(s.title),[-1,0,0],35,{...leftCoverMotion,remove:true}));
  if(s.action==='cover-in')plan.actors.push(actor([858],text(s.title),[-1,0,0],35,leftCoverMotion),actor([879],'M3×10',[-1,0,0],20,{...leftCoverScrewMotion,spin:1080,showBefore:false}));
  if(s.action==='printfan-unplug'){plan.camera='service-fan-connect';plan.inspectBoard=true;plan.transparentRefs=[790,794,816];}
  fanActions();plan.workpiecePoses=poses;
 }
 if(task.id==='clog'||s.inspection){plan.undersideView=true;plan.inspectRefs=s.refs;plan.inspectionLabel=text(s.title);plan.inspectionPadding=3;plan.focusPadding=18;plan.contextOpacity=.045;plan.camera=s.camera||'perspective';if(s.headOnly)plan.headOnly=true;}
 plan.transparentRefs=[...plan.transparentRefs,48,52,87,570];
 return accessScene(task,index,text,{plan,hidden,disconnect:false,flexStates});
}
export function maintenanceSceneSpec(task,index,text,firmwareFrame,bedFrame){
 return serviceBedHeightScene(task,index,text,baseMaintenanceSceneSpec(task,index,text,firmwareFrame,bedFrame),bedFrame);
}
export function installMaintenanceModel(viewer,tasks,text){
 if(tasks.some(t=>t.motorInspection))registerCompletionWorkpoints(viewer);
 let firmwareFrame=null;
 installMaintenanceAccess(viewer);
 const bedFrame=measureServiceBedReference(viewer);
 PARTS.nozzleToolIllustration??={name:'ノズル交換治具（模式図）',en:'Nozzle tool — schematic illustration',desc:'位置関係を示す模式図です。メーカーCADではありません。実物には公式の治具データを使います。',icon:'tool',offset:[0,0,0]};
 installNozzleToolIllustrations(viewer);
 installServiceFanCables(viewer);
 installLoveBoardServiceCables(viewer);
 installMainService615(viewer,{samplePlug:sampleNativeJ13,writeShell:createNativeJ13SurfaceWriter().write});
 registerNTCSource(viewer);
 installXBuddySensorCables(viewer);
 viewer.meshes.filter(m=>m.userData.part==='thermalPads').forEach((m,i)=>m.userData.component=`xbPad${i+1}`);
 const rows=tasks.flatMap(task=>task.steps.map((s,index)=>({task,index,s}))),steps=rows.map(({s},i)=>({chapter:9,officialStep:i+1,officialId:'service-'+i,title:text(s.title),parts:s.refs,checks:[]}));
 FLOWS.service={steps};
 const resolve=refs=>[...new Set([...viewer.director.resolve(refs),...viewer.meshes.filter(m=>refs.includes(m.userData.maintenanceComponent)||refs.includes(m.userData.maintenanceRegion))])];
 viewer.director.compile('build','screw');
 const preparedTies=new Map(['box1','box2','box4','box5'].map(id=>[id,new XBuddyPreparedTieRoute(viewer.fasteners.entities.get(id))]));
 const base=viewer.director.scene.bind(viewer.director);
 viewer.director.scene=state=>{
  for(const [id,route]of preparedTies){const n=state.flow==='service'&&rows[state.index].task.id==='xbuddy'?rows[state.index].index+1:0;viewer.fasteners.entities.get(id).setOpenPreparation(n>=22&&n<=29?route:null);}
  const fanFixing=viewer.meshes.find(m=>m.userData.cadIndex===846);if(fanFixing?.userData.guideGeometry20){const current=state.flow==='service'&&rows[state.index].task.id==='loveboard';fanFixing.geometry=current?fanFixing.userData.guideGeometry20:fanFixing.userData.referenceGeometry;fanFixing.userData.cadName=current?'M3x20 (ISO 4762)':fanFixing.userData.referenceName;}
  if(state.flow!=='service'){setMainServiceEnabled615(viewer,false);return base(state);}
  const {task,index}=rows[state.index];if(task.heaterService)ensureHeaterResources(viewer,text);
  const spec=prepareMainServiceScene615(viewer,maintenanceSceneSpec(task,index,text,firmwareFrame,bedFrame),task),hidden=new Set(resolve(spec.hidden)),isolated=spec.isolated?new Set(resolve(spec.isolated)):null;
  const headParts=['heaterServiceParts','mainPlate','pgAssembly','pgRing','idlerBearing1','idlerBearing2','idlerPin1','idlerPin2','loveBoard','loveMainPlug','hotend','hotendLeads','ventLever','nozzleToolIllustration','ptfeTube','bowdenBend',DRIVE_ACCESS,...NEXTRUDER_INTERNAL_REFS];
  const visible=viewer.meshes.filter(m=>(!isolated||isolated.has(m))&&(!m.userData.serviceTask||m.userData.serviceTask===task.id)&&(!spec.plan.headOnly||m.userData.cadPath?.includes(787)||headParts.includes(m.userData.part)||headParts.includes(m.userData.component)||headParts.includes(m.userData.flexId))&&(!m.userData.flexId||viewer.director.finalFlexStates[m.userData.flexId]||Object.hasOwn(spec.flexStates||{},m.userData.flexId)||[...LEADS,HF,PF].includes(m.userData.flexId)||m.userData.serviceTask===task.id)&&!m.userData.manualExcluded&&(!m.userData.toolOnly||m.userData.serviceTask===task.id)&&m.userData.part!=='alternate'&&!PARTS[m.userData.part]?.old&&!hidden.has(m));
  for(const m of resolve(spec.plan.visibleRefs||[]))if(!visible.includes(m))visible.push(m);
  // Explicit local aliases let nozzle, sock and heater block move separately
  // without changing the existing assembly part key or its source geometry.
  const plan={...spec.plan,workpiecePoses:spec.plan.workpiecePoses?.map(p=>({...p,refs:p.refs}))},actors=plan.actors.filter(a=>!(['fitting','guide'].includes(a.accessRole))||resolve([817]).length).map((a,sourceIndex)=>({...a,sourceIndex,nodes:a.flex?loveboardFlexNodes615(viewer,task,a.flex,resolve):resolve(a.refs),fromStates:a.flex?Object.fromEntries(a.flex.map(k=>[k,a.fromStates?.[k]??(a.to?0:1)])):undefined}));
  for(const a of actors)for(const m of a.nodes)if(!visible.includes(m))visible.push(m);
  // Viewer workpiece pose resolution also needs the component aliases.
  const flexStates={...viewer.director.finalFlexStates,...spec.flexStates};for(const id of LEADS)flexStates[id]=spec.hotendLeadAmount??(spec.disconnect?0:1);
  return {plan,visible,actors,restPoses:{},flexStates};
 };
 const originalResolve=viewer.director.resolve.bind(viewer.director);
 viewer.director.resolve=(refs=[])=>[...new Set([...originalResolve(refs),...viewer.meshes.filter(m=>(refs||[]).includes(m.userData.maintenanceComponent)||refs.includes(m.userData.maintenanceRegion))])];
 const binding={rows,indexOf:(id,step)=>rows.findIndex(r=>r.task.id===id&&r.index===step),localize(){localizeHeaterResources(viewer);if(viewer.state?.flow!=='service'||!viewer.operationScene)return;const row=rows[viewer.state.index],spec=maintenanceSceneSpec(row.task,row.index,text,firmwareFrame,bedFrame);viewer.operationScene.plan.actors.forEach((a,i)=>a.label=spec.plan.actors[i].label);viewer.operationScene.plan.note=spec.plan.note;viewer.operationScene.plan.inspectionLabel=spec.plan.inspectionLabel;}};
 Object.defineProperty(binding,'serviceBedReference',{get:()=>bedFrame});
 Object.defineProperty(binding,'currentFirmwareFrame',{get:()=>firmwareFrame});
 binding.phaseCaption=()=>initialSetupPhaseCaption(firmwareFrame,text);
 binding.setFirmwareFrame=(event,{refresh=true}={})=>{
  if(viewer.disposed||!viewer.loaded)return false;
  const next=normalizeInitialSetupFrame(event,tasks);if(JSON.stringify(next)===JSON.stringify(firmwareFrame))return false;
  firmwareFrame=next&&Object.freeze(next);
  if(refresh&&viewer.state?.flow==='service'){
   const row=rows[viewer.state.index],eventTask=tasks.find(t=>t.id===event?.taskId),eventStep=Number.isInteger(event?.stepIndex)?eventTask?.steps[event.stepIndex]:eventTask?.steps.find(s=>s.officialStep===event?.officialStep);
   if(row?.task.id==='initial-setup'&&event?.taskId===row.task.id&&row.s===eventStep&&[9,11,12].includes(row.s.officialStep)){
    viewer.sceneSignature=undefined;viewer.setState({...viewer.state});
   }
  }
  return true;
 };
 installServiceSockCaption(viewer,binding,text);
 installServiceCoverVariant(viewer,binding,tasks,text);
 installCrossflowTie13(viewer,binding);
 return binding;
}
