import assert from 'node:assert/strict';
import * as T from '../dist/vendor/three.module.js';
import {v} from './check-viewer.mjs';
import {FLOWS} from '../dist/data.js';

let probes=0;
for(const [width,height]of [[320,380],[390,528],[430,600],[844,280]]){
 v.camera.aspect=width/height;v.camera.updateProjectionMatrix();
 v.setState({flow:'build',index:FLOWS.build.steps.findIndex(s=>s.chapter===5&&s.officialStep===20),variant:'screw',comparison:'after',explore:false,completed:[]});
 v.autoplayPending=false;v.seek(1);
 for(const [operation,ref,axis,minimum]of [[0,806,[0,1,0],.9],[1,811,[0,0,-1],.65]]){
  v.manualCamera=false;v.focusOperation(operation,true);v.scene.updateMatrixWorld(true);v.camera.updateMatrixWorld(true);
  assert(v.camera.position.y>0,'the camera stays above the workbench');
  const targets=v.director.resolve([ref]).filter(m=>m.visible&&!m.userData.flexId),direction=new T.Vector3(...axis).transformDirection(v.printer.matrixWorld),points=[];
  for(const m of targets){const a=m.geometry.attributes.position;for(let i=0;i<a.count;i++)points.push(new T.Vector3().fromBufferAttribute(a,i).applyMatrix4(m.matrixWorld));}
  const end=Math.max(...points.map(p=>p.dot(direction))),surface=points.filter(p=>p.dot(direction)>end-.3),hardware=v.meshes.filter(m=>m.visible&&m.parent.visible&&!targets.includes(m)&&!m.userData.flexId&&!m.userData.glass);
  assert(surface.length>20,'sample the real source-CAD entry face');let clear=0;
  for(let i=0;i<surface.length;i+=Math.max(1,Math.floor(surface.length/300))){
   const p=surface[i],q=p.clone().project(v.camera);assert(Math.abs(q.x)<.9&&Math.abs(q.y)<.9,'the opening and socket fit with margin');
   const dir=p.clone().sub(v.camera.position),distance=dir.length(),ray=new T.Raycaster(v.camera.position,dir.normalize(),0,distance-.15);
   if(!ray.intersectObjects(hardware,false).length)clear++;probes++;
  }
  const sampled=Math.ceil(surface.length/Math.max(1,Math.floor(surface.length/300)));
  assert(clear/sampled>=minimum,`NTC operation ${operation+1}: entry face visible, observed ${clear}/${sampled}`);
 }
}
console.log(`PASS: ${probes} source-CAD NTC entry/socket visibility and framing probes, four viewport sizes, camera above workbench.`);
