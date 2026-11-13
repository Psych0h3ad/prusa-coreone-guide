import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from '../dist/vendor/three.module.js';
import {v} from './check-viewer.mjs';
import {FLOWS} from '../dist/data.js';
import {BASE_PIN_DATUM} from '../dist/base-hardware.js';
const directory='research/quality/splitter-20261104-35';fs.mkdirSync(directory,{recursive:true});
const show=(ch,n,p=1)=>{v.setState({flow:'build',index:FLOWS.build.steps.findIndex(s=>s.chapter===ch-1&&s.officialStep===n),variant:'screw',comparison:'after',explore:false,completed:[]});v.autoplayPending=false;v.seek(p);v.scene.updateMatrixWorld(true);};
const part=k=>v.meshes.filter(m=>m.userData.part===k),visible=k=>part(k).some(m=>m.visible);
const h=v.splitterHardware;
assert.deepEqual(h.connections.map(c=>[c.id,c.connection]),[['J6','Stepper splitter cable'],['J7','Z-axis motor R'],['J1','Z-axis motor L'],['J5','Z-axis motor L']]);
for(const [i,p]of h.datum.holes.slice(0,2).entries())assert(Math.hypot(h.datum.origin[0]+p[0]-BASE_PIN_DATUM.x,h.datum.origin[1]+p[1]-BASE_PIN_DATUM.y[1-i])<1e-8);
show(3,35);assert(!visible('stepperSplitter'));
show(3,36);assert(visible('stepperSplitter')&&!visible('splitterWires'));assert(h.connections.every(c=>!visible(c.key)));
show(3,37);assert(!visible('stepperSplitter'),'prepare on the bench before moving to the frame');
show(3,38,0);assert.equal(v.sceneActors.length,4);assert(h.connections.every(c=>visible(c.key)));
assert(v.sceneActors.every(a=>a.showBefore&&a.focusMotion&&a.distance===12));
const buffers=h.wireGroups.map(m=>m.geometry.attributes.position.array);let attachments=0,pinProbes=0;
for(const step of [38,39]){
 show(3,step,0);
 for(let i=0;i<=64;i++){
  v.seek(i/64);v.scene.updateMatrixWorld(true);
  for(const [index,c]of h.connections.entries()){
   const plug=part(c.key)[0],target=new T.Vector3(...c.end).applyQuaternion(plug.quaternion).add(plug.position),mean=new T.Vector3();
   for(const m of h.wireGroups){assert(buffers.includes(m.geometry.attributes.position.array),'reuse wire buffers');const p=m.geometry.attributes.position;for(let k=0;k<6;k++)mean.add(new T.Vector3().fromBufferAttribute(p,index*129*7+128*7+k));}
   mean.divideScalar(24);assert(mean.distanceTo(target)<1e-7,'four wire ends follow the plug');attachments++;
  }
  if(step===39){
   const z0=h.datum.origin[2]+part('stepperSplitter')[0].position.z*1000;
   for(const pin of part('baseSpacerPinFront').concat(part('baseSpacerPinRear'))){const p=pin.geometry.attributes.position;for(let j=0;j<p.count;j++){const z=(p.getZ(j)+pin.position.z)*1000;if(z>z0&&z<z0+1.6){assert(Math.hypot(p.getX(j),p.getY(j))*1000<2.05,'deflected pin passes through the PCB bore');pinProbes++;}}}
  }
 }
}
show(3,38,1);const connected=h.connections.map(c=>part(c.key)[0].position.toArray()),board=part('stepperSplitter')[0].position.toArray();
show(3,39,0);assert.deepEqual(h.connections.map(c=>part(c.key)[0].position.toArray()),connected);assert.deepEqual(part('stepperSplitter')[0].position.toArray(),board,'no jump between connecting and mounting');
assert.equal(v.sceneActors.length,1);assert(h.connections.every(c=>v.sceneActors[0].nodes.includes(part(c.key)[0])),'connected plugs move with the board');
v.seek(.42);const snapshot=h.wireGroups.map(m=>Array.from(m.geometry.attributes.position.array));const pinSnapshot=part('baseSpacerPinFront').map(m=>Array.from(m.geometry.attributes.position.array));v.seek(.94);v.seek(.42);assert.deepEqual(h.wireGroups.map(m=>Array.from(m.geometry.attributes.position.array)),snapshot);assert.deepEqual(part('baseSpacerPinFront').map(m=>Array.from(m.geometry.attributes.position.array)),pinSnapshot);
show(3,40);assert(visible('stepperSplitter')&&visible('splitterWires'));
// Export actual scene triangles and sampled poses for an independent FCL check.
const triangles=mesh=>{mesh.updateWorldMatrix(true,false);const matrix=v.printer.matrixWorld.clone().invert().multiply(mesh.matrixWorld),p=mesh.geometry.attributes.position,index=mesh.geometry.index,values=[];for(let i=0;i<(index?.count||p.count);i++){const q=new T.Vector3().fromBufferAttribute(p,index?index.getX(i):i).applyMatrix4(matrix).multiplyScalar(1000);values.push(...q.toArray());}return new Float32Array(values);};
const write=(name,ms)=>{const arrays=ms.map(triangles),data=new Float32Array(arrays.reduce((n,a)=>n+a.length,0));let offset=0;for(const a of arrays){data.set(a,offset);offset+=a.length;}fs.writeFileSync(directory+'/'+name+'.bin',Buffer.from(data.buffer));};
show(3,39,1);
for(const id of [6,306,311,366,367])write('cad-'+id,v.director.resolve([id]));
for(const step of [38,39]){
 show(3,step,0);
 for(let i=0;i<=32;i++){
  v.seek(i/32);v.scene.updateMatrixWorld(true);
  write(`${step}-${i}-board`,part('stepperSplitter'));
  write(`${step}-${i}-plugs`,h.connections.flatMap(c=>part(c.key)));
  write(`${step}-${i}-pins`,part('baseSpacerPinFront').concat(part('baseSpacerPinRear')));
  write(`${step}-${i}-wires`,h.wireGroups);
 }
}
const report={portMapping:4,sourcePinAxisResidual_mm:0,attachmentProbes:attachments,pinBoreProbes:pinProbes,sampledFrames:66,limits:'Photo-based PCB/connector/pin detail and illustrative slack. No manufacturer dimensions, continuous collision or electrical certification.'};
fs.writeFileSync(directory+'/check.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
