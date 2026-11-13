import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from '../dist/vendor/three.module.js';
import {v}from './check-viewer.mjs';
import {SERVICE_TASKS}from '../dist/maintenance-data.js';
import {XBUDDY_TASK}from '../dist/xbuddy-service-data.js';
import {installMaintenanceModel}from '../dist/maintenance-model.js';
import {XBUDDY_PORTS,XBUDDY_SENSOR_COMPONENTS,XBUDDY_PORT_SOURCE,xBuddyPortBounds}from '../dist/xbuddy-layout.js';
const official=JSON.parse(fs.readFileSync('research/quality/service-20261105-52/guide-908859.json','utf8')).steps;
assert(XBUDDY_PORT_SOURCE.endsWith('#'+official[30].id),'source anchor identifies the wiring-check step');
const board=JSON.parse(fs.readFileSync('dist/assets/electronics/boards.json','utf8')).boards.find(b=>b.key==='xBuddy');
for(const port of XBUDDY_PORTS){
 const rect=[Infinity,Infinity,-Infinity,-Infinity];
 for(const index of port.components){const c=board.components[index];rect[0]=Math.min(rect[0],c.rect[0]);rect[1]=Math.min(rect[1],c.rect[1]);rect[2]=Math.max(rect[2],c.rect[2]);rect[3]=Math.max(rect[3],c.rect[3]);}
 assert(rect.every((n,i)=>Math.abs(n-port.rect[i])<.00001),'attention regions retain the registered component footprint');
 assert.equal(port.title.length,4);assert(port.title.every(Boolean));
}
assert.deepEqual(XBUDDY_PORTS.find(p=>p.key==='BED_TEMP').components,[10],'the H-tagged plug belongs beside HEATBED OUT, not the unused left socket');
assert.deepEqual(XBUDDY_PORTS.find(p=>p.key==='A_TEMP').components,[5]);
assert.deepEqual(Object.values(XBUDDY_SENSOR_COMPONENTS).map(p=>p.pins),[2,2]);
let language=0;const binding=installMaintenanceModel(v,[...SERVICE_TASKS,XBUDDY_TASK],a=>a[language]);
v.setState({flow:'service',index:binding.indexOf('xbuddy',30),comparison:'after',variant:'screw',explore:false,completed:[]});v.autoplayPending=false;
assert.equal(v.sceneActors.length,14);assert(v.sceneActors.every(a=>a.nodes.length&&a.handling&&a.inspection&&a.distance===0));
assert(v.operationScene.plan.actors.every(a=>a.label&&a.port));
const boardMeshes=v.director.resolve(['xBuddy']),snapshot=()=>boardMeshes.map(m=>[...m.position.toArray(),...m.quaternion.toArray()]),rest=snapshot();
const regions=[];
for(let i=0;i<v.sceneActors.length;i++){
 const actor=v.sceneActors[i],guide=v.guideGroups[i],overlay=guide.children.filter(c=>c.userData.motionHighlight);
 assert(overlay.length>0,'every port attention region clips real source triangles');
 assert(overlay.every(m=>m.material.opacity<=.2),'the attention tint preserves socket and cavity detail');
 assert(guide.children.some(c=>c.isLine&&c.material.isLineDashedMaterial),'inspection has a dashed attention frame');
 assert(guide.children.every(c=>!c.isArrowHelper),'checking a port does not imply an insertion movement');
 assert(guide.children.every(c=>!c.userData.targetGhost),'inspection does not ghost the whole board');
 const expected=new T.Box3(new T.Vector3(...actor.attentionBounds.slice(0,3)).multiplyScalar(.001),new T.Vector3(...actor.attentionBounds.slice(3)).multiplyScalar(.001));
 let triangles=0;
 for(const m of overlay){m.geometry.computeBoundingBox();assert(expected.clone().expandByScalar(1e-8).containsBox(m.geometry.boundingBox));triangles+=m.geometry.attributes.position.count/3;}
 assert(triangles>0);regions.push({port:actor.port,triangles});
 v.seek((i+.5)/v.sceneActors.length);
 assert.deepEqual(snapshot(),rest,'inspecting a port never moves the board');
 assert(boardMeshes.every(m=>!m.userData.active),'only the clipped port overlay is highlighted');
 assert.equal(v.guideGroups.filter(g=>g.visible).length,1,'only the current port is marked');
 for(const[width,height]of[[320,380],[390,420],[430,440],[844,280],[1280,720]]){
  v.camera.aspect=width/height;v.camera.updateProjectionMatrix();v.manualCamera=false;v.focusOperation(i,true);v.printer.updateMatrixWorld(true);v.camera.updateMatrixWorld(true);
  for(const x of[actor.focusBounds[0],actor.focusBounds[3]])for(const y of[actor.focusBounds[1],actor.focusBounds[4]])for(const z of[actor.focusBounds[2],actor.focusBounds[5]]){
   const p=new T.Vector3(x,y,z).multiplyScalar(.001).applyMatrix4(v.printer.matrixWorld).project(v.camera);
   assert(Math.abs(p.x)<.9&&Math.abs(p.y)<.9&&p.z<1,'the entire attention region fits the guided camera at every tested viewport');
  }
 }
 const progress=v.operationProgress,camera=v.camera.position.clone();
 for(language of[1,2,3,0]){binding.localize();v.localize();assert.equal(v.sceneActors[i].label,i<XBUDDY_PORTS.length?XBUDDY_PORTS[i].title[language]:v.operationScene.plan.actors[i].label);assert.equal(v.operationProgress,progress);assert(v.camera.position.equals(camera));assert.deepEqual(snapshot(),rest);}
}
v.seek(1);assert(v.guideGroups.at(-1).visible,'the final PE marker remains visible after playback');
v.seek(.37);const before=snapshot();v.seek(.9);v.seek(.03);v.seek(.37);assert.deepEqual(snapshot(),before,'random and reverse inspection seeks preserve physical poses');
assert(!SERVICE_TASKS.some(t=>t.id==='xbuddy'),'unfinished wiring remains gated');
const report={ports:regions,languages:4,viewportSizes:5,physicalMotion:false,wholeBoardHighlight:false,finalMarkerRetained:true,source:XBUDDY_PORT_SOURCE,bedThermistorComponent:10,doorComponent:5,limits:'Actual CAD/illustration triangle overlays and mathematical framing only; no GPU or mobile visual check. Full xBuddy cable routes remain incomplete and gated.'};
const dir=process.env.PRUSA_QA_DIR||'research/quality/latest';fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(dir+'/inspection-check.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
