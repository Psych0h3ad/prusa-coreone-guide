import assert from 'node:assert/strict';
import * as T from '../dist/vendor/three.module.js';
import {v} from './check-viewer.mjs';
import {FLOWS} from '../dist/data.js';
const show=(step)=>{v.setState({flow:'build',index:FLOWS.build.steps.findIndex(s=>s.chapter===2&&s.officialStep===step),variant:'screw',comparison:'after',explore:false,completed:[]});v.autoplayPending=false;};
let probes=0;
for(const [width,height]of [[320,380],[390,420],[430,440],[844,280]]){
 v.camera.aspect=width/height;v.camera.updateProjectionMatrix();
 for(const [step,actorIndex]of [[45,1],[45,2],[45,3],[46,1],[46,2],[46,3]]){
  show(step);v.seek((actorIndex+.8)/v.sceneActors.length);v.focusOperation(actorIndex);
  const pose=v.cameraTween;v.camera.position.copy(pose.to);v.controls.target.copy(pose.toT);v.cameraTween=null;v.controls.update();v.scene.updateMatrixWorld(true);v.camera.updateMatrixWorld(true);
  const actor=v.sceneActors[actorIndex],normal=new T.Vector3(0,0,-1).transformDirection(v.printer.matrixWorld);
  assert(normal.dot(v.camera.position.clone().sub(v.controls.target).normalize())>.7,'the wired face points toward the camera');
  const box=new T.Box3();for(const m of v.operationScene.visible)box.union(new T.Box3().setFromObject(m));
  assert(box.min.y>-.01,'the laid-down printer stays above the ground');
  const vertices=[];
  for(const m of actor.nodes){const a=m.geometry.attributes.position;for(let i=0;i<a.count;i++)vertices.push(new T.Vector3().fromBufferAttribute(a,i).applyMatrix4(m.matrixWorld));}
  const front=Math.min(...vertices.map(p=>p.z));
  const targets=vertices.filter(p=>p.z<front+1.5),hardware=v.meshes.filter(m=>m.visible&&!m.userData.flexId&&!m.userData.glass&&m.parent.visible);
  let visible=0;
  for(const p of targets){
   const q=p.clone().project(v.camera);assert(Math.abs(q.x)<.9&&Math.abs(q.y)<.9,'the band fits with a margin at each viewport size');
   const direction=p.clone().sub(v.camera.position),distance=direction.length(),ray=new T.Raycaster(v.camera.position,direction.normalize(),0,distance-.8);
   if(!ray.intersectObjects(hardware,false).length)visible++;
   probes++;
  }
  assert(visible/targets.length>.8,`manual 3.${step}, operation ${actorIndex+1}: its fastening surface must be visible without looking through steel`);
 }
}
console.log(`PASS: ${probes} source-CAD visibility/framing probes; all six base tie closeups, four viewport sizes, correct work face and ground placement.`);
