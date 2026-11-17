import assert from 'node:assert/strict';
import fs from 'node:fs';
import {registerHooks} from 'node:module';
import * as T from '../dist/vendor/three.module.js';
registerHooks({resolve(specifier,context,next){return specifier==='three'?{url:new URL('../dist/vendor/three.module.js',import.meta.url).href,shortCircuit:true}:next(specifier,context);}});
const {GLTFLoader}=await import('../dist/vendor/GLTFLoader.js');
const {MeshoptDecoder}=await import('../dist/vendor/meshopt_decoder.module.js');
const {finishMotor}=await import('../dist/cad-finishes.js');
const bytes=fs.readFileSync(new URL('../dist/assets/core-one.glb',import.meta.url));
const {scene}=await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
scene.updateMatrixWorld(true);
let zMotors=0,xyMotors=0,checkedFaces=0;
scene.traverse(mesh=>{
 const name=mesh.userData.cadName||'';if(!mesh.isMesh||!name.includes('NEMA17'))return;
 const original=mesh.geometry,positions=original.attributes.position.array.slice(),normals=original.attributes.normal.array.slice(),indices=original.index.array.slice();
 // The viewer detaches each mesh into a semantic group with its complete CAD
 // transform. Use that same transform for the existing XY finish convention.
 mesh.matrixWorld.decompose(mesh.position,mesh.quaternion,mesh.scale);
 mesh.material=new T.MeshStandardMaterial();finishMotor(mesh,name);
 assert.deepEqual(mesh.geometry.attributes.position.array,positions,'finish preserves all native positions');
 assert.deepEqual(mesh.geometry.attributes.normal.array,normals,'finish preserves all native normals');
 assert.deepEqual(mesh.geometry.index.array,indices,'finish preserves all native faces');
 if(name.includes('TR-320')){
  zMotors++;const g=mesh.geometry,p=g.attributes.position,ix=g.index,start=Math.fround(.0215);let next=0,metal=0;
  assert.equal(p.count,4204);assert.equal(ix.count,12504);assert.equal(mesh.material.length,2);
  assert.equal(mesh.material[0].color.getHexString(),'292b2a');assert.equal(mesh.material[1].color.getHexString(),'bbc0c2');
  assert(mesh.material[0].roughness>=.7&&mesh.material[0].metalness<.3);
  for(const group of g.groups){assert.equal(group.start,next);next+=group.count;for(let k=group.start;k<next;k+=3){
   const y=[p.getY(ix.getX(k)),p.getY(ix.getX(k+1)),p.getY(ix.getX(k+2))],shaft=Math.min(...y)>=start&&Math.max(...y)>start;
   assert.equal(group.materialIndex,shaft?1:0,'only lead-screw faces are bare metal');metal+=shaft?1:0;checkedFaces++;
  }}
  assert.equal(next,ix.count);assert.equal(metal,225);assert(mesh.material.every(m=>!m.vertexColors));
 }else{
  xyMotors++;const a=mesh.geometry.attributes.color;assert(a);
  assert.equal(new Set(Array.from({length:a.count},(_,i)=>a.getX(i).toFixed(4))).size,2,'XY two-tone finish is preserved');
 }
});
assert.equal(zMotors,3);assert.equal(xyMotors,2);
console.log(`PASS: ${zMotors} native Z motors, ${checkedFaces} complete faces, ${xyMotors} XY finishes; native positions/normals/indices unchanged.`);
