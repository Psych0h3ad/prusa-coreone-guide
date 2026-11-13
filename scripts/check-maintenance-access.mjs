import assert from 'node:assert/strict';
import * as T from '../dist/vendor/three.module.js';
import {v as baseViewer}from './check-viewer.mjs';
import {SERVICE_TASKS as tasks}from '../dist/maintenance-data.js';
import {installMaintenanceModel,maintenanceSceneSpec}from '../dist/maintenance-model.js';
import {ARM,CLAMP,AIR_HOLE,DRIVE_ACCESS,IDLER_PIVOT,CLAMP_PIVOT,FIXED_TENSION,tubeRelease}from '../dist/maintenance-access.js';
const v=baseViewer,original=v.meshes.slice(),native=original.filter(m=>m.userData.cadIndex||['mainPlate','idlerBearing1','idlerBearing2','idlerPin1','idlerPin2'].includes(m.userData.part));
let language=0;const text=a=>Array.isArray(a)?a[language]:a,binding=installMaintenanceModel(v,tasks,text),report={cases:[],languages:['ja','en','cs','de'],nativeMeshes:native.length};
v.setState({flow:'service',index:binding.indexOf('rail',1),comparison:'after',variant:'screw',explore:false,completed:[]});v.playing=false;v.autoplayPending=false;
// Baseline after the normal stock service installers (including their existing
// NTC service placement), before any of these new access steps are selected.
const snapshots=new Map(native.map(m=>[m,{geometry:m.geometry,material:m.material,position:m.geometry.attributes.position.array,normal:m.geometry.attributes.normal?.array,restPosition:m.userData.restPosition.toArray(),restQuaternion:m.userData.restQuaternion.toArray()}]));
const choose=(id,index,p=0)=>{v.setState({flow:'service',index:binding.indexOf(id,index),comparison:'after',variant:'screw',explore:false,completed:[]});v.playing=false;v.autoplayPending=false;v.setProgress(p);};
const point=(m,p)=>new T.Vector3(...p).multiplyScalar(.001).applyMatrix4(new T.Matrix4().compose(m.position,m.quaternion,m.scale));
const pose=m=>[...m.position.toArray(),...m.quaternion.toArray()];
const poses=refs=>v.director.resolve(refs).map(m=>pose(m));
const near=(a,b,eps=1e-8)=>{const af=a.flat(Infinity),bf=b.flat(Infinity),diff=af.map((x,i)=>Math.abs(x-bf[i])),max=Math.max(...diff);assert(af.length===bf.length&&max<eps,JSON.stringify({max,index:diff.indexOf(max),a:af[diff.indexOf(max)],b:bf[diff.indexOf(max)],length:[af.length,bf.length]}));};
assert.equal(tasks.length,26);assert.equal(tasks.reduce((n,t)=>n+t.steps.length,0),248);
for(const task of tasks)for(const [index,s]of task.steps.entries()){for(const ref of s.refs)assert(v.director.resolve([ref]).length,task.id+':'+index+' resolves target '+ref);for(let l=0;l<4;l++){assert(s.title[l]&&s.body[l]);}}
const marker=v.director.resolve([AIR_HOLE])[0];assert(marker.isLineLoop&&marker.userData.annotation,'hole is an annotation of native edges, not fabricated solid geometry');
near(marker.userData.holeCentre,[.00905642,-.06479525,.41400042],.00003);
assert(Math.hypot(marker.userData.holeCentre[0]+.00294358,marker.userData.holeCentre[1]+.05839525)>.01,'air hole is separate from the M5 inlet');
const armNode=v.director.resolve([796])[0],clampNode=v.director.resolve([798])[0];
const restInverse=m=>new T.Matrix4().compose(m.userData.restPosition,m.userData.restQuaternion,m.scale).invert();
const armPin=new T.Vector3(...IDLER_PIVOT).multiplyScalar(.001).applyMatrix4(restInverse(armNode));
const clampPin=new T.Vector3(...CLAMP_PIVOT).multiplyScalar(.001).applyMatrix4(restInverse(clampNode));
const inPrinter=m=>new T.Matrix4().compose(m.position,m.quaternion,m.scale);
const pg=v.director.resolve(['pgRing','mainPlate',816]),pgRest=new Map(pg.map(m=>[m,pose(m)]));
const tube=v.fasteners.entities.get('ptfeTube'),tubeBuffer=tube.geometry.attributes.position.array,normalBuffer=tube.geometry.attributes.normal.array,top=v.director.resolve([817,'bowdenBend']),topRest=poses([817,'bowdenBend']);
const impossibleTube={stride:tube.stride,sample:(...args)=>tube.sample(...args),surface:{update(){assert.fail('infeasible PTFE geometry must never be installed');}}};assert.throws(()=>tubeRelease(impossibleTube,0,65),/insufficient slack/,'genuinely infeasible retained route must throw');
const tensionRest=poses([...FIXED_TENSION,800]);
const sealedCase=()=>{for(const m of v.director.resolve([816])){assert(m.visible,'gearbox case stays fitted');for(const mat of [m.material].flat()){assert.equal(mat.opacity,1,'side cleaning must not suggest access through a transparent gearbox case');assert.equal(mat.transparent,false);}}};
let expectedOpen;
for(language=0;language<4;language++){
 for(let s=0;s<3;s++){choose('sensor-clean',s,1);assert.deepEqual(v.operationScene.plan.inspectRefs,[AIR_HOLE]);assert(!v.inspectionNodes.has(v.director.resolve([817])[0]));assert(marker.visible);assert(v.operationScene.plan.inspectionLabel&&!/[\u3040-\u30ff]/.test(language?v.operationScene.plan.inspectionLabel:''));assert.equal(v.operationScene.plan.camera,'top-perspective');}
 choose('extruder',0,0);const closed=poses([...ARM,...CLAMP]);choose('extruder',0,1);const open=poses([...ARM,...CLAMP]);assert.notDeepEqual(open,closed);if(expectedOpen)near(open,expectedOpen);expectedOpen=open;
 // A real bearing/pin and both native lever halves move about the lower CAD
 // shaft. The swivel turns about the fixed nut's CAD802 hinge; the spring
 // tension screws do not turn or travel with either moving link.
 for(const p of [0,.1,.35,.5,.8,1,.7,.2,0,1]){choose('extruder',0,p);near(armPin.clone().applyMatrix4(inPrinter(armNode)).toArray(),IDLER_PIVOT.map(x=>x*.001));near(clampPin.clone().applyMatrix4(inPrinter(clampNode)).toArray(),CLAMP_PIVOT.map(x=>x*.001),1e-7);near(poses([...FIXED_TENSION,800]),tensionRest);}
 // Both actual idler rollers release the standard1.75mm filament cylinder.
 const fittingAxis=-.002943578,filamentRadius=.000875;for(const ref of ['idlerBearing1','idlerBearing2']){const box=new T.Box3();for(const m of v.director.resolve([ref]))box.union(m.geometry.boundingBox.clone().applyMatrix4(inPrinter(m)));assert(box.max.x<fittingAxis-filamentRadius,'open roller leaves the filament cylinder clear');}
 choose('extruder',1,1);near(poses([...ARM,...CLAMP]),open);sealedCase();assert.deepEqual(v.operationScene.plan.inspectRefs,[DRIVE_ACCESS]);assert([...v.inspectionNodes].every(m=>m.userData.annotation&&m.userData.maintenanceComponent===DRIVE_ACCESS),'cleaning highlight identifies the side work area, not the whole planetary gearbox');choose('extruder',2,0);near(poses([...ARM,...CLAMP]),open);sealedCase();choose('extruder',2,1);near(poses([...ARM,...CLAMP]),closed);
 choose('feed-clear',1,0);near(poses([...ARM,...CLAMP]),closed);near(poses([817,'bowdenBend']),topRest);
 choose('feed-clear',1,.75);const bounds=m=>m.geometry.boundingBox.clone().applyMatrix4(inPrinter(m)),metalTop=Math.min(...v.director.resolve([817]).map(m=>bounds(m).max.z)),guideBottom=bounds(v.director.resolve(['bowdenBend'])[0]).min.z;assert(guideBottom>metalTop,'native guide clears the metal fitting before unscrewing begins');
 const samples=[0,.2,.4,.6,.8,1,.75,.25,0,1];for(const progress of samples){choose('feed-clear',1,progress);const state=tube.maintenanceRelease,points=state.points;let length=0;for(let i=3;i<points.length;i+=3)length+=Math.hypot(points[i]-points[i-3],points[i+1]-points[i-2],points[i+2]-points[i-1]);assert(Math.abs(length-state.length)<.003,'PTFE sampled length is retained');near(Array.from(points.slice(-3)),Array.from(state.rest.slice(-3)),1e-5);assert.equal(tube.geometry.attributes.position.array,tubeBuffer);assert.equal(tube.geometry.attributes.normal.array,normalBuffer);for(let i=0;i<state.arc.length;i++)if(state.arc[i]>=230)near(Array.from(points.slice(i*3,i*3+3)),Array.from(state.rest.slice(i*3,i*3+3)),1e-5);}
 const feedOpen=poses([...ARM,...CLAMP,817,'bowdenBend']);for(const index of [2,3,5,3,2]){choose('feed-clear',index,1);near(poses([...ARM,...CLAMP,817,'bowdenBend']),feedOpen);sealedCase();assert.deepEqual(v.operationScene.plan.inspectRefs,tasks.find(t=>t.id==='feed-clear').steps[index].refs,'held head must preserve the step-specific LCD/nozzle inspection');}
 choose('feed-clear',4,0);near(poses([...ARM,...CLAMP,817,'bowdenBend']),feedOpen);choose('feed-clear',4,1);near(poses([...ARM,...CLAMP]),closed);near(poses([817,'bowdenBend']),topRest);assert(/flow|tok|Fluss|流れ/.test(v.sceneActors.find(a=>a.accessRole==='fitting').label));
 for(const m of pg)near(pose(m),pgRest.get(m));
 choose('rail',1,1);assert(!marker.visible,'sensor annotation does not leak into other tasks');near(poses([...ARM,...CLAMP]),closed);near(poses([817,'bowdenBend']),topRest);const photos=tasks.find(t=>t.id==='rail').steps[1].sourcePhotos;assert.equal(photos.length,2);for(const photo of photos){assert(photo.url.startsWith('https://help.prusa3d.com/wp-content/uploads/'));assert(photo.credit[language].includes('Prusa Research'));assert(photo.source.endsWith('_829710'));}
 report.cases.push({language:report.languages[language],sensorStages:3,accessSamples:samples.length,directHeldStages:[3,4,6],restore:['extruder3','feed-clear5','rail2'],officialRailPhotos:2});
}
// A language change on the same held step must update its inspection plan and
// existing label, without a next/previous navigation to rebuild the scene.
language=0;choose('extruder',1,1);language=1;binding.localize();v.localize();assert.equal(v.operationScene.plan.inspectionLabel,'Clean the side of the drive gear');for(const label of v.guideLabels.filter(x=>x.inspection))assert.equal(label.el.textContent,'Clean the side of the drive gear');language=0;binding.localize();v.localize();assert.equal(v.operationScene.plan.inspectionLabel,'送りギアの側面を清掃する');
// Fitting absence is a configuration condition, never permission to animate an
// imaginary fitting, move an unrelated guide, or regenerate the PTFE route.
const fitting=v.director.resolve([817]);for(const m of fitting)m.userData.manualExcluded=true;choose('feed-clear',1,1);assert(!v.sceneActors.some(a=>['fitting','guide'].includes(a.accessRole)));near(poses(['bowdenBend']),topRest.slice(-1));assert.equal(tube.maintenanceRelease.last,0);for(const m of fitting)m.userData.manualExcluded=false;
for(const [m,s]of snapshots){assert.equal(m.geometry,s.geometry);assert.equal(m.material,s.material);assert.equal(m.geometry.attributes.position.array,s.position);assert.equal(m.geometry.attributes.normal?.array,s.normal);assert.deepEqual(m.userData.restPosition.toArray(),s.restPosition);assert.deepEqual(m.userData.restQuaternion.toArray(),s.restQuaternion);}
report.result='PASS';report.scope='Three maintenance fixes only; CPU real-CAD state/pose/length and source checks, not global app acceptance';console.log(JSON.stringify(report));
