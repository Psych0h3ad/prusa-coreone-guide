import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from '../dist/vendor/three.module.js';
import {v} from './check-viewer.mjs';
import {FLOWS} from '../dist/data.js';
const show=n=>{v.setState({flow:'build',index:FLOWS.build.steps.findIndex(s=>s.chapter===7&&s.officialStep===n),variant:'screw',comparison:'after',explore:false,completed:[]});v.autoplayPending=false;};
const visible=id=>v.director.resolve([id]).some(m=>m.visible);
show(13);for(const id of [596,597,607,609,611,613,614,634,'lcdFaston'])assert(!visible(id),`future xLCD part ${id} is absent`);
show(15);v.seek(1);assert(visible(596));assert(!visible(614));
show(16);v.seek(1);for(const id of [595,596,609,611,613,614])assert(visible(id));assert(!visible(607)&&!visible('lcdFaston'),'fourth hole remains empty for the ground terminal');assert(!visible(597));
show(17);assert.equal(v.sceneActors.length,2,'place terminal before its screw');v.seek(.5-1e-8);assert(visible('lcdFaston')&&!visible(607),'terminal is seated before the screw appears');v.seek(1);assert(visible(607));assert(!visible(597));
let probes=0;
for(const n of [15,16,17,18,20,21]){
 show(n);
 const normal=new T.Vector3(0,-Math.SQRT1_2,Math.SQRT1_2).transformDirection(v.printer.matrixWorld);
 assert(n<18||n===20?normal.y<-.999:normal.y>.999,'the working face points up');
 for(let i=0;i<=48;i++){
  v.seek(i/48);v.scene.updateMatrixWorld(true);
  for(const m of v.meshes.filter(m=>m.visible&&m.parent.visible)){
   const box=new T.Box3().setFromObject(m,true);assert(box.min.y>-.05,`xLCD ${n} mesh ${m.userData.cadIndex||m.userData.part} crosses the workbench: ${box.min.y}`);probes++;
  }
 }
}
show(18);assert(v.sceneActors[0].nodes.some(m=>m.userData.cadIndex===614),'rear mount turns with the display');assert(v.sceneActors[0].nodes.filter(m=>[607,609,611,613].includes(m.userData.cadIndex)).length===4,'four screws turn with the display');assert(v.sceneActors[0].nodes.some(m=>m.userData.part==='lcdFaston'),'ground terminal turns with the display');
v.seek(1);assert(visible(597));
const cadPoints=m=>{v.scene.updateMatrixWorld(true);const transform=v.printer.matrixWorld.clone().invert().multiply(m.matrixWorld),a=m.geometry.attributes.position;return Array.from({length:a.count},(_,i)=>new T.Vector3().fromBufferAttribute(a,i).applyMatrix4(transform).multiplyScalar(1000));};
show(17);v.seek(1);
const terminalSpec=JSON.parse(fs.readFileSync('dist/assets/xlcd/manifest.json')),holeOrigin=new T.Vector3(...terminalSpec.screwUnderheadBeforePlate),rearAxis=new T.Vector3(...terminalSpec.screwAxis).negate();
const headSurface=cadPoints(v.director.resolve([607])[0]).map(p=>p.sub(holeOrigin)).filter(p=>p.clone().addScaledVector(rearAxis,-p.dot(rearAxis)).length()>3);
assert(Math.abs(Math.min(...headSurface.map(p=>p.dot(rearAxis)))-.8)<.0001,'actual screw underside leaves the 0.8 mm terminal plate thickness');
const terminal=v.director.resolve(['lcdFaston'])[0],terminalMatrix=v.printer.matrixWorld.clone().invert().multiply(terminal.matrixWorld),hole=new T.Vector3(-.003915,0,0).applyMatrix4(terminalMatrix).multiplyScalar(1000);
assert(hole.distanceTo(holeOrigin)<.00001,'terminal hole and original screw axis share their mounting datum');
assert(terminal.geometry.attributes.position.count/3===1156,'complete official terminal tessellation is loaded');
assert(terminal.material.userData.originalColor.getHexString()==='b59a55','terminal retains its brass finish after animation');
show(26);assert(v.sceneActors[0].nodes.some(m=>m.userData.cadIndex===274)&&v.sceneActors[1].nodes.some(m=>m.userData.cadIndex===68),'right-hand seal precedes left-hand seal');
show(20);v.seek(1);
const rear=v.director.resolve([614])[0],mountY=Math.max(...cadPoints(rear).map(p=>p.y));
for(const id of [603,605]){
 const mesh=v.director.resolve([id])[0],points=cadPoints(mesh),box=new T.Box3().setFromPoints(points),center=box.getCenter(new T.Vector3());
 const head=points.filter(p=>Math.hypot(p.x-center.x,p.z-center.z)>2),gap=Math.min(...head.map(p=>p.y))-mountY;
 assert(gap>=3&&gap<3.6,`M3x6 ${id} has at least 3 mm under its head (${gap})`);
}
show(21);assert.equal(v.sceneActors.length,5,'turn, enter large holes, slide, then tighten each screw');
assert(v.sceneActors[0].nodes.some(m=>m.userData.cadIndex===599),'nuts turn with the complete display');
const slide=v.sceneActors[2];assert.equal(slide.path[0].clone().sub(slide.path[1]).length(),.008,'8 mm from large opening to narrow keyhole end');
for(const boundary of [.2,.4,.6,.8]){
 v.seek(boundary-1e-8);const prior=new Map(v.meshes.filter(m=>m.visible).map(m=>[m,m.position.clone()]));
 v.seek(boundary+1e-8);for(const [m,p]of prior)if(m.visible)assert(m.position.distanceTo(p)<.000001,'no teleport between repeated workpiece and screw operations');
}
show(22);v.seek(1);const frontDisplay=new Map(v.director.resolve([595,614,634,603,605]).map(m=>[m,m.position.clone()]));
assert(v.operationScene.plan.contextOwners.includes('lcd'),'display remains visible in front of printer while connections are checked');
show(23);v.seek(0);for(const [m,p]of frontDisplay)assert(m.position.distanceTo(p)<1e-8,'connected display is not teleported into frame on next step');
assert.equal(v.sceneActors.length,4,'lift, guide both tabs, engage left, then engage right');
for(const boundary of [.25,.5,.75]){
 v.seek(boundary-1e-8);const prior=new Map(v.director.resolve([595,614,634,603,605,627,629,631,633]).map(m=>[m,m.position.clone()]));
 v.seek(boundary+1e-8);for(const [m,p]of prior)assert(m.position.distanceTo(p)<1e-6,'display, tightened screws and magnets stay together between operations');
}
for(const [index,point]of [[2,[-159,-200,.9]],[3,[159,-200,.9]]]){
 v.seek((index+.5)/4);v.focusOperation(index,true);v.scene.updateMatrixWorld(true);v.camera.updateMatrixWorld(true);
 const region=v.guideGroups[index].children.find(m=>m.userData.motionHighlight);assert(region,'each hook uses an overlay clipped from its actual CAD triangles');
 region.geometry.computeBoundingBox();const b=region.geometry.boundingBox,limits=v.sceneActors[index].attentionBounds;
 for(const [j,key]of ['x','y','z'].entries()){assert(b.min[key]*1000>=limits[j]-.001&&b.max[key]*1000<=limits[j+3]+.001,'attention geometry stays inside its small CAD region');}
 assert(region.matrix.elements.every(Number.isFinite),'attention overlay has a finite moving workpiece transform');
 const p=new T.Vector3(...point).multiplyScalar(.001).applyMatrix4(v.printer.matrixWorld).project(v.camera);
 assert(Math.abs(p.x)<.85&&Math.abs(p.y)<.85,'each tab is inside its guided close-up on a phone');
 const target=v.controls.target.clone(),camera=v.camera.position.clone();v.holdCamera();v.focusOperation(1,true);assert(v.controls.target.equals(target)&&v.camera.position.equals(camera),'automatic tab focus respects manual camera control');v.manualCamera=false;
}
v.seek(1);for(const id of [595,596,597,607,609,611,613,614,634,627,629,631,633,'lcdFaston'])assert(visible(id),'complete display and bezel magnets transfer to printer');
v.setState({...v.state,explore:true});for(const id of [617,619,621,623,625])assert(!v.meshes.some(m=>m.visible&&m.userData.cadIndex===id),'overlapping alternate hardware stays hidden');
console.log(`PASS: xLCD official order, fourth-hole reservation, complete turnovers, table clearance (${probes} mesh/pose probes), actual 3 mm screw gaps, 8 mm keyhole travel, continuous installation handoffs, both tab close-ups, CAD-clipped attention overlays, manual camera control and duplicate exclusion. Mesh/pose checks; not a swept clearance certification.`);
