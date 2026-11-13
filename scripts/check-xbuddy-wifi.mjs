import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from '../dist/vendor/three.module.js';
import {v}from './check-viewer.mjs';
import {SERVICE_TASKS}from '../dist/maintenance-data.js';
import {XBUDDY_TASK}from '../dist/xbuddy-service-data.js';
import {installMaintenanceModel}from '../dist/maintenance-model.js';
import {XBUDDY_WIFI_RECEPTACLE as RECEPTACLE,XBUDDY_BOARD_ORIGIN}from '../dist/xbuddy-layout.js';
const hardware=v.wifiHardware;assert(hardware?.meshes.length>0);
assert(hardware.meshes.every(m=>m.userData.toolOnly&&m.userData.serviceTask==='xbuddy'));
assert(!SERVICE_TASKS.some(t=>t.id==='xbuddy'),'the unfinished procedure remains gated');
const radio=new T.Box3();
let triangles=0;
for(const m of hardware.meshes){
 const g=m.geometry,p=g.attributes.position,n=g.attributes.normal,ix=g.index?.array||Array.from({length:p.count},(_,i)=>i);
 if(m.userData.component.startsWith('radio'))radio.union(g.boundingBox);
 for(let j=0;j<ix.length;j+=3){const a=new T.Vector3().fromBufferAttribute(p,ix[j]),b=new T.Vector3().fromBufferAttribute(p,ix[j+1]),c=new T.Vector3().fromBufferAttribute(p,ix[j+2]),cross=b.sub(a).cross(c.sub(a));if(cross.lengthSq()<1e-24)continue;assert(cross.dot(new T.Vector3().fromBufferAttribute(n,ix[j]))>0,'outward winding survives the reflected photograph frame');triangles++;}
}
const size=radio.getSize(new T.Vector3()).multiplyScalar(1000);
for(const [observed,expected]of [[size.x,3.2],[size.y,20],[size.z,18]])assert(Math.abs(observed-expected)<1e-4,'radio matches published Espressif envelope');
const bind=installMaintenanceModel(v,[...SERVICE_TASKS,XBUDDY_TASK],a=>a[0]);
const choose=(n,p)=>{v.setState({flow:'service',index:bind.indexOf('xbuddy',n-1),comparison:'after',variant:'screw',explore:false,completed:[]});v.autoplayPending=false;v.seek(p);};
const snapshot=()=>hardware.meshes.map(m=>[...m.position.toArray(),...m.quaternion.toArray()]);
choose(14,0);const seated=snapshot();assert(hardware.meshes.every(m=>m.visible));
// Rays follow the corners of the actual mating pins, so a solid dummy header
// fails this check even if its outline and the connector centres look correct.
const header=v.director.resolve(['xBuddy']).map(m=>{const copy=new T.Mesh(m.geometry,new T.MeshBasicMaterial({side:T.DoubleSide}));copy.updateMatrixWorld(true);return copy;});
let boardTriangles=0;
for(const mesh of header){
 const g=mesh.geometry,p=g.attributes.position,n=g.attributes.normal,ix=g.index?.array||Array.from({length:p.count},(_,i)=>i);
 for(let j=0;j<ix.length;j+=3){
  const a=new T.Vector3().fromBufferAttribute(p,ix[j]),b=new T.Vector3().fromBufferAttribute(p,ix[j+1]),c=new T.Vector3().fromBufferAttribute(p,ix[j+2]),cross=b.sub(a).cross(c.sub(a));
  if(cross.lengthSq()<1e-24)continue;
  for(let k=0;k<3;k++)assert(cross.dot(new T.Vector3().fromBufferAttribute(n,ix[j+k]))>0,'board and cavity normals follow the outward triangle winding');
  boardTriangles++;
 }
}
let cavityRays=0,minTipClearance=Infinity;
const photoPoint=(u,v,h)=>new T.Vector3(XBUDDY_BOARD_ORIGIN[0]-u,XBUDDY_BOARD_ORIGIN[1]+h,XBUDDY_BOARD_ORIGIN[2]-v).multiplyScalar(.001);
const surface=(u,v,h,direction)=>{const hit=new T.Raycaster(photoPoint(u,v,h),new T.Vector3(...direction)).intersectObjects(header,false)[0];assert(hit,'receptacle envelope ray reaches a source surface');return hit.point.clone().multiplyScalar(1000);};
const probeU=RECEPTACLE.entryU+6.8,probeV=RECEPTACLE.centreV,top=surface(probeU,probeV,20,[0,-1,0]),left=surface(probeU,probeV-12,2.5,[0,0,-1]),right=surface(probeU,probeV+12,2.5,[0,0,1]),front=surface(RECEPTACLE.entryU-10,probeV,2.5,[-1,0,0]),back=surface(RECEPTACLE.entryU+20,probeV,2.5,[1,0,0]);
const observedHousing=[Math.abs(right.z-left.z),Math.abs(front.x-back.x),top.y-XBUDDY_BOARD_ORIGIN[1]];
for(const [i,expected]of[RECEPTACLE.width,RECEPTACLE.depth,RECEPTACLE.height].entries())assert(Math.abs(observedHousing[i]-expected)<1e-4,'actual receptacle housing uses the manufacturer nominal envelope');
for(const pin of hardware.meshes.filter(m=>m.userData.component==='boardPins')){
 const b=pin.geometry.boundingBox,c=b.getCenter(new T.Vector3());
 for(const observed of[b.max.y-b.min.y,b.max.z-b.min.z])assert(Math.abs(observed*1000-RECEPTACLE.pinSize)<1e-4,'mating pins match the specified0.64mm square');
 assert(RECEPTACLE.rows.some(h=>Math.abs(c.y*1000-XBUDDY_BOARD_ORIGIN[1]-h)<1e-4),'pin row height matches the5mm housing and2.54mm row pitch');
 for(const y of[b.min.y,c.y,b.max.y])for(const z of[b.min.z,c.z,b.max.z]){
  const ray=new T.Raycaster(new T.Vector3(b.max.x+.005,y,z),new T.Vector3(-1,0,0)),hit=ray.intersectObjects(header,false)[0];assert(hit,'the pin ray reaches the receptacle back');
  const gap=b.min.x-hit.point.x;assert(gap>.001,'the mating pin fits inside the header cavity before reaching its back');minTipClearance=Math.min(minTipClearance,gap);cavityRays++;
 }
}
choose(14,1);for(const [i,m]of hardware.meshes.entries()){assert(Math.abs(m.position.x-seated[i][0]-.035)<1e-12);assert.equal(m.position.y,seated[i][1]);assert.equal(m.position.z,seated[i][2]);}
for(const n of [15,16,17,18]){choose(n,0);assert(hardware.meshes.every(m=>!m.visible),'module remains off the printer during the board exchange');}
choose(19,1);assert.deepEqual(snapshot(),seated,'reinstallation recovers the source mating datum');
for(const n of [13,20])for(const p of [0,.25,.5,.75,1]){choose(n,p);assert.deepEqual(snapshot(),seated,'removing the cover does not drag the module out of the board connector');}
choose(14,.4);const expected=snapshot();v.seek(.9);v.seek(.1);v.seek(.4);assert.deepEqual(snapshot(),expected,'reverse seeks retain a rigid carrier and module');
const coverSnapshot=()=>v.director.resolve([170]).map(m=>[...m.position.toArray(),...m.quaternion.toArray()]);
let coverReverseSamples=0;
for(let k=0;k<=128;k++){
 const t=k/128;choose(13,(1+t)/2);const out=coverSnapshot();choose(20,(1-t)/2);const into=coverSnapshot();
 for(let i=0;i<out.length;i++)for(let j=0;j<out[i].length;j++)assert(Math.abs(out[i][j]-into[i][j])<1e-12,'cover reinstallation retraces the same relative path');coverReverseSamples++;
}
const report={moduleEnvelope_mm:[size.x,size.y,size.z],meshes:hardware.meshes.length,triangles,boardTriangles,withdrawal_mm:35,receptacle:RECEPTACLE.part,receptacleHousing_mm:observedHousing,matingPinSize_mm:RECEPTACLE.pinSize,sourceDatumRecovered:true,coverDoesNotDragBoard:true,hiddenDuringBoardSwap:true,reverseSeeking:true,coverReverseSamples,cavityRays,minTipClearance_mm:minTipClearance*1000,limitations:'Envelope, winding, cavity rays and handovers. Carrier/connector details remain reconstructed; nominal receptacle dimensions use the manufacturer drawing. Actual rendered-triangle sweep is checked separately; retained source cover/case overlap and real printed fit are not certified here. The full xBuddy procedure remains gated.'};
const dir=process.env.PRUSA_QA_DIR||'research/quality/latest';fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(dir+'/wifi-check.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
