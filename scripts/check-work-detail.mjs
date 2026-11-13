import assert from 'node:assert/strict';import * as T from '../dist/vendor/three.module.js';import {v}from './check-viewer.mjs';import {FLOWS}from '../dist/data.js';import {WorkDetail}from '../dist/work-detail.js';
v.workDetail=new WorkDetail(v.container);let cases=0;
for(const [width,height]of [[320,380],[390,420],[430,440],[844,280]]){
 v.container.clientWidth=width;v.container.clientHeight=height;v.camera.aspect=width/height;v.camera.updateProjectionMatrix();
 for(const step of [45,46])for(let actor=1;actor<=3;actor++){
  v.setState({flow:'build',index:FLOWS.build.steps.findIndex(s=>s.chapter===2&&s.officialStep===step),variant:'screw',comparison:'after',explore:false,completed:[]});v.autoplayPending=false;
  for(const t of [.2,.5,.8,.97]){
   v.seek((actor+t)/v.sceneActors.length);v.focusOperation(actor,true);v.scene.updateMatrixWorld(true);v.workDetail.update(v);
   const detail=v.workDetail;assert(detail.visible);const r=detail.rect;assert(r.left>=0&&r.top>=0&&r.left+r.width<=width&&r.top+r.height<=height-65);
   const points=[];for(const x of [detail.lockBox.min.x,detail.lockBox.max.x])for(const y of[detail.lockBox.min.y,detail.lockBox.max.y])for(const z of[detail.lockBox.min.z,detail.lockBox.max.z])points.push(new T.Vector3(x,y,z).project(detail.camera));
   assert(points.every(p=>Math.abs(p.x)<.9&&Math.abs(p.y)<.9&&p.z<1),'the actual lock fits inside the detail camera');
   const px=(Math.max(...points.map(p=>p.x))-Math.min(...points.map(p=>p.x)))*r.width/2,py=(Math.max(...points.map(p=>p.y))-Math.min(...points.map(p=>p.y)))*r.height/2;
   assert(Math.max(px,py)>=24&&Math.min(px,py)>=12,'lock remains legible at the narrowest viewport');
   cases++;
  }
 }
}
v.setState({flow:'build',index:0,variant:'screw',comparison:'after',explore:false,completed:[]});v.workDetail.update(v);assert(!v.workDetail.visible,'the extra view is absent on unrelated steps');
let viewport,scissor=false,draws=0;const original=v.renderer;v.renderer={shadowMap:{autoUpdate:true},setScissorTest(b){scissor=b;},setViewport(...a){viewport=a;},setScissor(){},render(){draws++;throw Error('synthetic render failure');}};
v.setState({flow:'build',index:81,variant:'screw',comparison:'after',explore:false,completed:[]});v.autoplayPending=false;v.seek(.7);const guides=v.arrowLayer.visible;
assert.throws(()=>v.workDetail.render(v),/synthetic render failure/);assert(!scissor);assert.equal(v.renderer.shadowMap.autoUpdate,true);assert.equal(v.arrowLayer.visible,guides);assert.deepEqual(viewport,[0,0,v.container.clientWidth,v.container.clientHeight]);v.renderer=original;v.workDetail.dispose();
console.log(JSON.stringify({status:'PASS',cases,scope:'Actual CAD band/lock geometry and production detail camera, four viewport sizes, four tightening phases, hide on unrelated steps and renderer-state restoration on failure. Browser raster reviewed separately.'}));
