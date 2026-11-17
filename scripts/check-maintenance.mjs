import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import * as T from '../dist/vendor/three.module.js';
import {v} from './check-viewer.mjs';
import {SERVICE_TASKS as tasks,SERVICE_REPAIRS as repairs,SERVICE_CATEGORIES as categories,CLOG_SYMPTOMS} from '../dist/maintenance-data.js';
import {MAINTENANCE_SOURCES} from '../dist/maintenance-sources.js';
// check-viewer installs the checked-in Three.js and local asset transports.
const {installMaintenanceModel,prepareXBuddyCompleteAssets}=await import('../dist/maintenance-model.js');
await prepareXBuddyCompleteAssets();
const {prepareChamberThermistor}=await import('../dist/chamber-thermistor-runtime.js');
await prepareChamberThermistor();
const {prepareChamberFan}=await import('../dist/chamber-fan-runtime.js');
await prepareChamberFan();
const {prepareTensionerService}=await import('../dist/tensioner-service-runtime.js');
await prepareTensionerService();
const binding=installMaintenanceModel(v,tasks,a=>a[0]);
// LoveBoard J5/J6 each have three electrical pins; MP is a mounting pad.
for(const id of ['serviceHotendFanLead','servicePrintLead']){
 const cable=v.fasteners.entities.get(id);assert.equal(cable.definition.colors.length,3,'fan leads match the official three-pin connector');
 assert.equal(cable.geometry.groups.length,13,'three insulated wires, full housing and three complete conductor/contact layers');
 assert.equal(cable.mesh.material.length,6,'original wire/housing materials plus copper and terminal metal');
 assert.deepEqual(cable.geometry.groups.map(g=>g.materialIndex),[0,1,2,3,0,4,5,1,4,5,2,4,5]);
 const layered=cable.loadedCurved.layout;
 assert.equal(layered.g,cable.geometry,'the active owner writes the actual displayed complete surface');
 assert.equal(layered.layouts.length,3,'all three circuits have their own complete layers');
 assert.equal(layered.sourceVertexCount,layered.sourceHousingOffset+layered.housingCount,'source wire and housing ranges are retained');
 assert.equal(layered.housingOffset+layered.housingCount,cable.geometry.attributes.position.count,'the complete original housing remains in the final vertex range');
}
const choose=(id,index)=>{v.setState({flow:'service',index:binding.indexOf(id,index),comparison:'after',variant:'screw',explore:false,completed:[]});v.autoplayPending=false;};
const pose=m=>[...m.position.toArray(),...m.quaternion.toArray()];
// Retain every original procedure: the two printed-tool choices add 34 stages,
// rather than replacing any of the original 24 tasks / 214 stages.
const legacyStages={clog:5,nozzle:22,coldpull:5,'feed-clear':6,fragment:4,hotend:19,'hotend-clean':3,debris:1,panels:1,sheet:1,rod:3,rail:2,fans:3,extruder:3,electronics:4,belts:4,'initial-setup':13,hotendfan:23,printfan:16,'sensor-clean':4,loveboard:31,'firmware-update':6,'firmware-reflash':6,'heatsink-ntc':29};
const toolChoices=[{id:'nozzle-tool',sock:true,fixture:'nozzleToolSock',other:'nozzleToolBare'},{id:'nozzle-tool-bare',sock:false,fixture:'nozzleToolBare',other:'nozzleToolSock'}];
assert.equal(new Set(tasks.map(t=>t.id)).size,tasks.length,'unique task IDs prevent one method overwriting another');
for(const [id,count]of Object.entries(legacyStages))assert.equal(tasks.find(t=>t.id===id)?.steps.length,count,`${id}: legacy stage coverage retained`);
assert.equal(Object.keys(legacyStages).length,24);assert.equal(Object.values(legacyStages).reduce((a,b)=>a+b,0),214);
const sensorProcedures={'sensor-service':26,'sensor-gearbox-recovery':19};
for(const [id,count] of Object.entries(sensorProcedures)){
 assert.equal(tasks.find(task=>task.id===id)?.steps.length,count,`${id}: complete advanced service procedure`);
}
const completionStages={'needle-clear':6,'coldpull-manual':12,'motor-check':19};
for(const [id,count] of Object.entries(completionStages))assert.equal(tasks.find(task=>task.id===id)?.steps.length,count,`${id}: complete ordered maintenance method`);
const replacementStages={'hotend-heater':22,'hotend-thermistor':21,'chamber-thermistor':22,'chamber-fan':22,'belt-tensioner-pulley':13,'belt-tensioner-left':28,'belt-tensioner-right':16,'heatsink-replacement':46,'hotend-rebuild':24,'internal-filament-sensor-replacement':47,'xbuddy':34,'side-ir-replacement':15};
for(const [id,count] of Object.entries(replacementStages))assert.equal(tasks.find(task=>task.id===id)?.steps.length,count,`${id}: complete official replacement procedure`);
const zMotorStages={'z-motor-replacement':48,'z-motor-replacement-rear':26,'z-motor-replacement-left':34,'z-motor-replacement-right':34,'z-motor-replacement-front':41};
for(const [id,count]of Object.entries(zMotorStages))assert.equal(tasks.find(task=>task.id===id)?.steps.length,count,`${id}: source-ordered selected motor procedure`);
const addedTasks=[...toolChoices.map(task=>task.id),...Object.keys(sensorProcedures),...Object.keys(completionStages),...Object.keys(replacementStages),...Object.keys(zMotorStages)];
assert.deepEqual(tasks.filter(t=>!Object.hasOwn(legacyStages,t.id)).map(t=>t.id).sort(),addedTasks.sort());

// The two cold-pull methods have different source temperatures and access order.
const manual=tasks.find(t=>t.id==='coldpull-manual');
assert.deepEqual(manual.steps.map(s=>s.id),['manual-scope','manual-inlet','manual-sensor-off','manual-load','manual-idler-open','manual-fill','manual-cool-fill','manual-wait','manual-pull','manual-idler-close','manual-inlet-refit','manual-result']);
for(const body of manual.steps[0].body)assert(body.includes('Nozzle X'),'manual compatibility remains explicit in every language');
for(const [index,temperature]of [[5,270],[6,170],[7,100],[8,100]])for(const body of manual.steps[index].body)assert(new RegExp(`${temperature}\\s*°C`).test(body),'manual temperature retained in every language');
for(const index of [0,3])for(const body of tasks.find(t=>t.id==='needle-clear').steps[index].body)assert(body.includes('HF'),'non-HF/unknown gate remains present at entry and needle insertion');
choose('coldpull-manual',3);v.seek(1);
assert.equal(v.operationScene.plan.access.inletHeld,true,'fitting stays raised while loading');
assert.equal(v.operationScene.plan.access.armHold,0,'idler remains closed during loading');
choose('coldpull-manual',8);v.seek(1);
assert.deepEqual(v.operationScene.plan.focus,[794,817],'manual pull shows the actual upper inlet, not the nozzle below');
assert.deepEqual(v.operationScene.plan.inspectRefs,[794]);
assert.equal(v.operationScene.plan.access.inletHeld,true);
assert.equal(v.operationScene.plan.access.armHold,-10);
assert.equal(v.operationScene.plan.access.clampHold,45);
assert.equal(v.sceneActors.length,0,'manual pull highlights a real workpoint without inventing a hand motion');
choose('motor-check',7);v.seek(1);
const shaft=[...v.inspectionNodes].filter(m=>m.userData.maintenanceComponent==='motorShaftWorkpoint');
assert.equal(shaft.length,1,'motor check binds the one actual original shaft surface');
assert.equal(shaft[0].userData.cadIndex,790);
assert.equal(v.sceneActors.length,0,'tactile shaft assessment does not claim an automatic rotation');

// Source contracts: Printables 1237212 specifies ambient-temperature fitting,
// support before loosening both thumbscrews, and retightening after replacement.
// Nozzle guide 821168 supplies the explicit seating/torque/settings/final checks.
const officialTool='https://www.printables.com/model/1237212-core-one-l-nozzle-replacement-tool',officialNozzle='https://help.prusa3d.com/guide/how-to-replace-the-prusa-nozzle-core-one_821168';
for(const {id,sock}of toolChoices){
 const task=tasks.find(t=>t.id===id),steps=task.steps;
 assert.equal(steps.length,17,'each sock choice has its own complete working sequence');
 assert.equal(task.nozzleTool.sock,sock,'the two menu choices select different actual sock states');
 assert.equal(task.source,'https://help.prusa3d.com/article/changing-or-replacing-the-prusa-nozzle_734706');
 const actionIndex=action=>{const matches=steps.map((s,i)=>({s,i})).filter(({s})=>s.action===action);assert.equal(matches.length,1,`${id}: exactly one ${action} stage`);return matches[0].i;};
 const sequence=['tool-in','tool-release','tool-nozzle-out','tool-nozzle-in','tool-secure','tool-out'],indices=sequence.map(actionIndex);
 assert(indices.every((n,i)=>!i||n>indices[i-1]),'support, loosen, remove, replace, secure, then remove fixture');
 const [fit,release,remove,insert,secure,clear]=indices;
 assert.deepEqual(steps.filter(s=>s.action).map(s=>s.action),sequence,'tool replacement does not detach the whole hotend, leads, covers or sock');
 const unload=steps.findIndex(s=>s.firmwareActions?.includes('unload')),cool=steps.findIndex(s=>s.firmwareActions?.includes('cooldown')),powerOff=steps.findIndex(s=>s.firmwareActions?.includes('moveZ'));
 assert(unload>=0&&cool>=unload&&cool<powerOff&&powerOff<fit,'unload and cooldown precede powered bed positioning and fixture work');
 assert.equal(steps[unload].source,officialNozzle+'#826822');assert.equal(steps[powerOff].source,officialNozzle+'#826876');
 assert.match(steps[powerOff].body[1],/wait.*stop.*switch off.*unplug/i,'the machine stops and is unplugged before work');
 const coldCheck=steps.findIndex(s=>s.related?.includes('hotend-clean'));
 assert(coldCheck>=0&&coldCheck<fit,'residue can be cleared before the tool is fitted');
 assert.match(steps[coldCheck].body[1],/cool.*ambient/i,'returning from hot cleaning requires cooling again');
 for(const [language,re]of [[0,/室温/],[1,/ambient|room temperature/i],[2,/pokojov/i],[3,/Raumtemperatur/i]])assert(steps.slice(0,fit).some(s=>re.test(s.body[language])),`${id}: ambient prerequisite readable in language ${language}`);
 assert(steps.slice(0,fit).some(s=>s.refs.includes('heatbed')&&/cover the bed|protective fabric/i.test(s.body[1])),'bed protection is supplied before fixture work');
 assert.match(steps[remove].body[1],/ambient temperature/i,'no hot-wrench removal instruction');
 assert.match(steps[release].body[1],/both.*thumbscrews.*few turns.*without removing/i,'both source thumbscrews are loosened, not extracted');
 assert.match(steps[secure].body[1],/hand-tighten both/i);assert.match(steps[secure].body[1],/do not use tools/i,'thumbscrew securing must not inherit nozzle torque');
 assert.match(steps[insert].body[1],/1\.5\s*Nm/i);assert(steps[insert].supplementalSources.some(s=>s.url===officialNozzle+'#827672'),'nozzle torque has its own exact official source');
 const seating=steps.findIndex(s=>s.source===officialNozzle+'#827252');assert(seating>insert&&seating<secure,'fully seat the nozzle before securing it');
 const powerOn=steps.findIndex(s=>s.source===officialNozzle+'#827424'),settings=steps.findIndex(s=>s.firmwareActions?.includes('printhead')),heating=steps.map((s,i)=>s.firmwareActions?.includes('heat')?i:-1).filter(i=>i>=0);
 assert(clear<powerOn&&powerOn<settings&&heating.length===1&&heating[0]>settings,'fixture is removed before power, nozzle settings and the only explicit heating check');
 assert.equal(steps[settings].source,officialNozzle+'#827460');assert.equal(steps[heating[0]].source,officialNozzle+'#827530');
 assert.match(steps[clear].body[1],/remove.*tool before heating/i,'fixture removal is also stated in the readable manual');
 assert.match(steps[heating[0]].body[1],/above 200\s*°C/i,'final heating check retains the official temperature condition');
 assert(steps.slice(0,fit).some(s=>s.body.every(body=>body.includes(sock?'CORE One sock':'CORE One no sock'))),'all four languages identify the correct printable tool');
 for(const s of steps){
  assert(s.title.every(t=>!/<\/?[a-z][^>]*>/i.test(t))&&s.body.every(t=>!/<\/?[a-z][^>]*>/i.test(t)),'complete in-app plain-text guidance, rather than an HTML fragment');
  const url=new URL(s.source);assert.equal(url.protocol,'https:');assert(s.source===officialTool||s.source.startsWith(officialNozzle+'#'),'each stage identifies the official tool description or specific supplemental Prusa step');
 }
 assert.equal(steps[fit].source,officialTool);assert(steps[fit].sourcePhotos.length,'manufacturer tool photos remain available in-app');
}
// Guidance precedes electrical connection; the two steps retain their poses.
for(const id of ['hotend','nozzle']){
 const task=tasks.find(t=>t.id===id),route=task.steps.findIndex(s=>s.action==='route-hotend'),step=task.steps.findIndex(s=>s.action==='plug');
 choose(id,route);v.seek(0);for(const kind of ['Thermistor','Heater'])for(const strand of [0,1]){const e=v.fasteners.entities.get(`hotend${kind}${strand}`);assert(e.mesh.visible&&e.mesh.userData.flexState.amount===0,'both loose pairs remain visible before guidance');}
 choose(id,route);v.seek(1);const threaded=['Thermistor','Heater'].flatMap(kind=>[0,1].map(i=>v.fasteners.entities.get(`hotend${kind}${i}`).geometry.attributes.position.array.slice()));
 choose(id,step);v.seek(0);['Thermistor','Heater'].flatMap(kind=>[0,1].map(i=>v.fasteners.entities.get(`hotend${kind}${i}`))).forEach((e,i)=>assert.deepEqual(e.geometry.attributes.position.array,threaded[i],`${id}: guide-to-plug handover`));
 for(const [p,nt,heater]of [[0,.35,.35],[.5,1,.35],[1,1,1],[.5,1,.35],[0,.35,.35]]){
  choose(id,step);v.seek(p);
  for(const [kind,amount]of [['Thermistor',nt],['Heater',heater]])for(const strand of [0,1])assert.equal(v.fasteners.entities.get(`hotend${kind}${strand}`).mesh.userData.flexState.amount,amount,`${id}: sequential reconnect at ${p}`);
 }
}
let stages=0,motions=0;
for(const a of tasks){
 for(const value of [a.title,a.interval,...a.steps.flatMap(s=>[s.title,s.body])])assert(value.length===4&&value.every(s=>s.trim()),`four languages: ${a.id}`);
 assert.equal(new URL(a.source).hostname,'help.prusa3d.com');
 for(const [index,s]of a.steps.entries()){
  choose(a.id,index);stages++;
  for(const ref of s.refs)assert(v.director.resolve([ref]).length,`${a.id}.${index+1}: CAD reference ${ref} exists`);
  if((a.id==='clog'||s.inspection)&&(!v.operationScene.plan.access||v.operationScene.plan.access.held)){v.localize();assert(v.inspectionNodes.size);assert(v.arrowLayer.children.some(m=>m.userData.inspection),'inspection has a persistent dashed outline');assert.equal(v.sceneActors.length,0,'inspection does not fake an installation motion');v.applyMaterials();for(const m of v.inspectionNodes){assert(m.visible&&m.userData.active,'actual target geometry stays visible and highlighted');assert((Array.isArray(m.material)?m.material:[m.material]).every(mat=>mat.opacity>=.3),`inspection target stays opaque: ${a.id}.${index+1} ${m.userData.part}`);}}
  if((a.chamberThermistor&&['cf-intro','cf-tools','ct-parts'].includes(s.action))||(a.id==='chamber-fan'&&['cf-intro','cf-tools','cf-parts'].includes(s.action)))assert.equal(v.sceneActors.length,0,`${a.id}.${index+1}: preparation does not invent a physical motion`);
  else if(a.tensionerService){const staticStages=a.id==='belt-tensioner-left'?[0,1,12]:a.id==='belt-tensioner-right'?[0,1,3,7,9]:[0,1,3,6],deferred=v.operationScene.plan.tensionerService.route==='after-body'&&(a.id==='belt-tensioner-left'?index===10:index===5);assert(v.sceneActors.length||staticStages.includes(index)||deferred,`${a.id}.${index+1}: physical work has complete native/reference bodies`);motions+=v.sceneActors.length;}
  else if(a.heatsinkService||a.hotendRebuild||a.internalSensorService||a.sideIRService)motions+=v.sceneActors.length;
  else if(s.action){assert(v.sceneActors.length,`${a.id}.${index+1}: action has real geometry`);motions+=v.sceneActors.length;}
  if(v.operationScene.plan.access)motions+=v.sceneActors.length;
  for(const actor of v.sceneActors)assert(actor.nodes.length,'no empty actor');
  for(const p of [0,.25,.5,.75,1,.5,0,1]){v.seek(p);for(const m of v.meshes)if(m.visible)assert(pose(m).every(Number.isFinite),'finite geometry during playback and reverse scrub');}
  const final=v.meshes.map(pose);choose('debris',0);choose(a.id,index);v.seek(1);v.meshes.forEach((m,i)=>assert.deepEqual(pose(m),final[i],`${a.id}.${index+1}: random entry restores final pose`));
 }
}
// Removing the whole hotend must leave it held in the same pose in the next step.
for(const id of ['hotend','nozzle']){
 choose(id,8);v.seek(1);const loose=v.director.resolve(['hotend',795,807]).map(m=>({m,p:pose(m)}));
 assert(loose.every(({m})=>m.visible),'supported hotend and loosened thumbscrews do not disappear');
 choose(id,9);v.seek(0);for(const {m,p}of loose)assert.deepEqual(pose(m),p,'withdrawal hands off the held hotend without a jump');
 const insert=id==='hotend'?10:13;choose(id,insert-1);v.seek(1);const start=v.director.resolve(['hotend',795,807]).map(m=>({m,p:pose(m)}));choose(id,insert);v.seek(0);for(const {m,p}of start)assert.deepEqual(pose(m),p,'insertion starts at the held pose');
}
choose('nozzle',9);assert.equal(v.sceneActors.length,3);const [sock,...nozzle]=v.sceneActors;assert(sock.nodes.every(m=>m.userData.maintenanceComponent==='serviceSock'));assert(nozzle.every(a=>a.nodes.every(m=>m.userData.maintenanceComponent==='serviceNozzle')));
// The long nozzle tube clears the block completely, without rotating during
// the free axial phase. Playback, preparation and installation share its pose.
choose('nozzle',9);v.seek(1);const removed=v.director.resolve(['serviceNozzle']).map(m=>({m,p:pose(m)}));
const localBounds=refs=>{v.printer.updateMatrixWorld(true);const inv=v.printer.matrixWorld.clone().invert(),box=new T.Box3();for(const m of v.director.resolve(refs))box.union(m.geometry.boundingBox.clone().applyMatrix4(m.matrixWorld).applyMatrix4(inv));return box;};
assert(localBounds(['serviceNozzle']).max.z<localBounds(['serviceBlock']).min.z-.002,'entire nozzle tube clears the heater block by more than 2 mm');
choose('nozzle',10);v.seek(0);for(const {m,p}of removed)assert.deepEqual(pose(m),p,'withdrawal hands off the fully removed nozzle');
choose('nozzle',11);v.seek(0);for(const {m,p}of removed)assert.deepEqual(pose(m),p,'replacement begins at the fully withdrawn pose');
for(const [index,range]of [[9,[2/3,1]],[11,[0,1/3]]]){
 choose('nozzle',index);v.seek(range[0]);const initial=v.director.resolve(['serviceNozzle']).map(m=>m.quaternion.clone());
 for(let k=1;k<=20;k++){v.seek(range[0]+(range[1]-range[0])*k/20);v.director.resolve(['serviceNozzle']).forEach((m,i)=>assert(initial[i].angleTo(m.quaternion)<1e-6,'nozzle stops rotating after the thread is released'));}
}
// Each thumbscrew rotates about its own shaft, never around the other screw.
choose('hotend',8);const screws=v.sceneActors.filter(a=>!a.flex&&a.nodes.length===1&&[795,807].includes(a.nodes[0].userData.cadIndex));assert.equal(screws.length,2);
const centres=screws.map(a=>a.nodes[0].geometry.boundingBox.getCenter(new T.Vector3()));
v.seek(0);const starts=screws.map((a,i)=>centres[i].clone().applyQuaternion(a.nodes[0].quaternion).add(a.nodes[0].position));
for(let j=0;j<=60;j++){v.seek(.4+j/150);screws.forEach((a,i)=>{const p=centres[i].clone().applyQuaternion(a.nodes[0].quaternion).add(a.nodes[0].position);assert(Math.abs(p.y-starts[i].y)<1e-9&&Math.abs(p.z-starts[i].z)<1e-9,'thumbscrew remains on its shaft during rotation');});}
choose('hotend',4);const lid=v.sceneActors[0];assert(lid.nodes.some(m=>m.userData.part==='grille')&&lid.nodes.some(m=>m.userData.part==='ventBlock'),'lid carries its grille and vent block');v.seek(1);choose('hotend',5);assert(v.director.resolve([87,'ventBlock']).every(m=>!m.visible),'removed lid assembly stays removed');
const componentSets=['serviceSock','serviceNozzle','serviceBlock'].map(k=>new Set(v.director.resolve([k])));assert(componentSets.every(s=>s.size));for(const a of componentSets)for(const b of componentSets)if(a!==b)assert([...a].every(m=>!b.has(m)),'nozzle, sock and heater block have independent source meshes');
for(const p of repairs){assert.equal(new URL(p.url).hostname,'help.prusa3d.com');assert(v.director.resolve(p.refs).length);}
// Replacement sequences preserve both detached parts and connector state.
for(const [id,out,prep,insert,fan,lead,screws]of [['hotendfan',10,11,12,791,'serviceHotendFanLead',[819,821]],['printfan',9,10,11,834,'servicePrintLead',[845]]]){
 choose(id,out);v.seek(1);const held=v.director.resolve([fan,lead]).map(m=>({m,p:pose(m),vertices:m.geometry.attributes.position.array.slice()}));
 assert(held.every(({m})=>m.visible),'removed fan and its attached lead remain visible');
 choose(id,prep);v.seek(0);for(const {m,p,vertices}of held){assert.deepEqual(pose(m),p,`${id}: supported fan handover`);assert.deepEqual(m.geometry.attributes.position.array,vertices,`${id}: disconnected cable handover`);}
 assert(v.director.resolve(screws).every(m=>!m.visible),'removed fasteners stay removed in preparation');
 choose(id,insert);v.seek(0);for(const {m,p,vertices}of held){assert.deepEqual(pose(m),p,`${id}: insertion begins at held pose`);assert.deepEqual(m.geometry.attributes.position.array,vertices,`${id}: insertion retains released lead`);}
 v.applyMaterials();for(const m of v.director.resolve([fan,lead]))assert((Array.isArray(m.material)?m.material:[m.material]).every(mat=>mat.opacity===1),'workpiece remains opaque in cutaway');
}
for(const [task,step,lead,amount]of [['hotendfan',10,'servicePrintLead',0],['hotendfan',10,'serviceHotendFanLead',0],['hotendfan',14,'serviceHotendFanLead',1],['hotendfan',14,'servicePrintLead',0],['hotendfan',15,'servicePrintLead',1],['printfan',9,'servicePrintLead',0],['printfan',12,'servicePrintLead',1]]){
 choose(task,step);v.seek(0);assert.equal(v.fasteners.entities.get(lead).mesh.userData.flexState.amount,amount,`${task}.${step+1}: connector state survives next stage`);
}
for(const id of ['hotendfan','printfan']){const task=tasks.find(t=>t.id===id);assert(task.steps.every((s,i)=>s.number===i+1&&Number.isInteger(s.page)&&s.page>=4),'every replacement stage has its exact PDF page');}
// A cable close-up must retain the fan as well as the terminal, on narrow screens.
for(const [id,step,fan]of [['hotendfan',13,791],['hotendfan',14,834],['printfan',11,834]])for(const [w,h]of [[320,330],[390,420],[844,184]]){
 v.camera.aspect=w/h;v.camera.updateProjectionMatrix();choose(id,step);v.seek(1);v.focusOperation(v.sceneActors.length-1,true);v.camera.updateMatrixWorld(true);v.printer.updateMatrixWorld(true);
 for(const m of v.director.resolve([fan,'loveBoard']).filter(m=>m.visible)){const a=m.geometry.attributes.position;for(let i=0;i<a.count;i+=Math.max(1,Math.floor(a.count/500))){const p=new T.Vector3().fromBufferAttribute(a,i).applyMatrix4(m.matrixWorld).project(v.camera);assert(Math.abs(p.x)<1&&Math.abs(p.y)<1,`${id}: fan and terminal fit ${w}x${h}`);}}
}
assert.deepEqual(CLOG_SYMPTOMS.find(s=>s.id==='loading').indices,[0,1,2,3,4],'loading failure includes the complete path through the nozzle');
for(const a of tasks)for(const s of a.steps)for(const id of s.related||[])assert(tasks.some(t=>t.id===id),'contextual action resolves to a real maintenance task');
for(const [id,source]of Object.entries(MAINTENANCE_SOURCES)){const a=tasks.find(t=>t.id===id);assert.equal(source.steps.length,a.steps.length);source.steps.forEach((s,i)=>{assert.equal(s.number,a.steps[i].officialWebStep??a.steps[i].officialStep??i+2,'source numbering follows the explicit web step while local/PDF introductions retain their own numbering');assert(Number.isInteger(s.id)&&s.id>0);assert(s.images.length,'official step has photo references');for(const image of s.images){if(image.full.startsWith('./assets/')){const file=path.resolve('dist',image.full);assert(file.startsWith(path.resolve('dist/assets')+path.sep),'local photograph stays within distribution assets');assert(fs.statSync(file).isFile(),'local photograph exists');}else{const url=new URL(image.full);assert.equal(url.protocol,'https:');assert.equal(url.hostname,'help.prusa3d.com');}}});}
// The in-printer route must not reuse a whole-hotend withdrawal animation.
for(const {id,sock,fixture,other}of toolChoices){
 const task=tasks.find(t=>t.id===id),at=action=>task.steps.findIndex(s=>s.action===action);
 choose(id,0);v.seek(1);
 const block=v.director.resolve(['serviceBlock']).map(m=>({m,p:pose(m)})),native=v.meshes.filter(m=>m.userData.cadIndex!==undefined).map(m=>({m,p:pose(m)}));
 const fit=at('tool-in'),release=at('tool-release'),remove=at('tool-nozzle-out'),insert=at('tool-nozzle-in'),secure=at('tool-secure'),clear=at('tool-out');
 for(const [index,s]of task.steps.entries()){
  choose(id,index);
  if(index===release||index===secure)assert.deepEqual(v.sceneActors.map(a=>a.nodes[0].userData.cadIndex),[795,807],'only the two native nozzle-retaining thumbscrews operate; heater/thermistor grub screws are untouched');
  for(const p of [0,.25,.5,.75,1,.5,0,1]){
   v.seek(p);
   for(const {m,p}of block)assert.deepEqual(pose(m),p,'heater block and its cartridges remain stationary');
   for(const kind of ['Thermistor','Heater'])for(const strand of [0,1]){const cable=v.fasteners.entities.get(`hotend${kind}${strand}`);assert(cable.mesh.visible);assert.equal(cable.mesh.userData.flexState.amount,1,'heater and thermistor leads stay fully connected');}
   assert(v.director.resolve([other]).every(m=>!m.visible),'the opposite tool variant is never shown');
   assert(v.director.resolve(['serviceSock']).every(m=>m.visible===sock),'the actual sock display matches the selected hardware');
   if(index>fit&&index<clear)assert(v.director.resolve([fixture]).every(m=>m.visible),'the fixture supports the block throughout replacement');
   if(index<fit||index>clear)assert(v.director.resolve([fixture]).every(m=>!m.visible),'fixture is absent before fitting and after removal');
  }
 }
 choose(id,fit);v.seek(1);const fitted=v.director.resolve([fixture]).map(m=>({m,p:pose(m)}));choose(id,release);v.seek(0);for(const {m,p}of fitted)assert.deepEqual(pose(m),p,'fixture fitting hands off without a jump');
 choose(id,release);v.seek(1);const loose=v.director.resolve([795,807]).map(m=>({m,p:pose(m)}));choose(id,remove);v.seek(0);for(const {m,p}of loose)assert.deepEqual(pose(m),p,'both retained thumbscrews stay loose during removal');
 choose(id,remove);v.seek(1);assert(localBounds(['serviceNozzle']).max.z<localBounds(['serviceBlock']).min.z-.002,'the complete tube clears the in-printer block by more than 2 mm');
 const held=v.director.resolve(['serviceNozzle']).map(m=>({m,p:pose(m)}));choose(id,remove+1);v.seek(0);for(const {m,p}of held)assert.deepEqual(pose(m),p,'the fully removed nozzle stays held during preparation');choose(id,insert);v.seek(0);for(const {m,p}of held)assert.deepEqual(pose(m),p,'insertion begins at the fully withdrawn tube pose');
 // The free part of each path is axial: it neither tilts nor continues to spin.
 for(const [index,start,end]of [[remove,.75,1],[insert,0,.25]]){
  choose(id,index);v.seek(start);const axial=v.director.resolve(['serviceNozzle']).map(m=>({m,q:m.quaternion.clone(),centre:m.geometry.boundingBox.getCenter(new T.Vector3()).applyQuaternion(m.quaternion).add(m.position)}));
  for(let j=1;j<=20;j++){v.seek(start+(end-start)*j/20);for(const {m,q,centre}of axial){const c=m.geometry.boundingBox.getCenter(new T.Vector3()).applyQuaternion(m.quaternion).add(m.position);assert(q.angleTo(m.quaternion)<1e-6,'no spinning during free axial travel');assert(Math.abs(c.x-centre.x)<1e-9&&Math.abs(c.y-centre.y)<1e-9,'no lateral bending or sweep during tube withdrawal/insertion');}}
 }
 choose(id,secure-1);v.seek(1);const seating=v.director.resolve([795,807]).map(m=>({m,p:pose(m)}));choose(id,secure);v.seek(0);for(const {m,p}of seating)assert.deepEqual(pose(m),p,'seating keeps screws loose until the securing operation');
 choose(id,task.steps.length-1);v.seek(1);
 const loweredBed=new Set(v.director.resolve(['bedSupport','heatbed','sheet']));
 for(const {m,p}of native)if(!loweredBed.has(m))assert.deepEqual(pose(m),p,'head and unrelated native CAD return to their installed state before final heating');
 assert(Math.abs(localBounds(['sheet']).max.z*1000-(binding.serviceBedReference.nozzleTipZMM-150))<.0001,'the bed stays at the explained lowered working position before final heating');
 assert(v.director.resolve([fixture]).every(m=>m.userData.illustration&&m.userData.officialCad===false),'schematic tool geometry is not mislabeled manufacturer CAD');
}
for(const id of Object.keys(legacyStages)){choose(id,0);assert(v.meshes.filter(m=>m.userData.part==='nozzleToolIllustration').every(m=>!m.visible),'tool illustrations do not leak into any legacy procedure');}
// The three Nextruder procedures share source geometry but keep their own parts.
const nativeSink=v.meshes.find(m=>m.userData.cadIndex===794),replacementSink=v.meshes.find(m=>m.userData.maintenanceComponent==='heatsinkReplacement');
const sensorCopies=v.meshes.filter(m=>m.userData.serviceTask==='internal-filament-sensor-replacement');
assert(nativeSink&&replacementSink&&sensorCopies.length);
choose('internal-filament-sensor-replacement',21);v.seek(.9);
assert.equal(v.idlerSpringHardware.sink,nativeSink);assert(!replacementSink.visible);
assert.equal(v.director.resolve(['sensorReplacementMagnet']).filter(m=>m.visible).length,1,'exactly one replacement magnet in the active new stack');
choose('heatsink-replacement',31);v.seek(1);
assert.equal(v.idlerSpringHardware.sink,replacementSink);assert(replacementSink.visible);assert(sensorCopies.every(m=>!m.visible),'sensor replacement copies stay out of heatsink replacement');
for(const index of[9,13]){choose('hotend-rebuild',index);v.seek(.5);assert.equal(v.idlerSpringHardware.sink,nativeSink);assert(!replacementSink.visible);assert(sensorCopies.every(m=>!m.visible),'sensor replacement copies stay out of hotend rebuild');}
choose('debris',0);v.seek(1);assert.equal(v.idlerSpringHardware.sink,nativeSink);assert(!replacementSink.visible);assert(sensorCopies.every(m=>!m.visible));
// Existing procedures remain; full hotend and internal-sensor work is added.
assert.equal(categories.length,4);assert.equal(tasks.length,43);assert.equal(stages,640);
console.log(`PASS: ${tasks.length} maintenance tasks, ${stages} stages, ${motions} motion operations; four languages, real part references, reverse/random playback, held hotend handovers and independent nozzle/sock/block geometry.`);
