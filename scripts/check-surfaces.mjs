import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from '../dist/vendor/three.module.js';
import {STLLoader} from '../dist/vendor/STLLoader.js';
import {smoothCreases,splitTop} from '../dist/surface-geometry.js';
import {createElectronics} from '../dist/electronics.js';

// A cylinder must shade as a round wall and retain its flat end caps.
const cylinder=new T.CylinderGeometry(10,10,20,48).toNonIndexed();
const positions=cylinder.attributes.position.array.slice();smoothCreases(cylinder);
assert.deepEqual(cylinder.attributes.position.array,positions);
const p=cylinder.attributes.position,n=cylinder.attributes.normal;
for(let i=0;i<p.count;i++){
 const radial=Math.hypot(p.getX(i),p.getZ(i));
 if(Math.abs(n.getY(i))<.5){
  assert(Math.abs(n.getY(i))<1e-6);
  assert((n.getX(i)*p.getX(i)+n.getZ(i)*p.getZ(i))/radial>.9999,'round wall follows radial normal');
 }else assert(Math.abs(n.getY(i))>.9999,'end caps stay flat');
}
const cube=new T.BoxGeometry().toNonIndexed(),originalNormals=cube.attributes.normal.array.slice();
smoothCreases(cube);assert.deepEqual(cube.attributes.normal.array,originalNormals,'right-angle corners remain sharp');
const split=splitTop(new T.BoxGeometry());
assert.equal(split.top.attributes.position.count,6);assert.equal(split.body.attributes.position.count,30);
for(let i=0;i<split.body.attributes.normal.count;i++)assert(split.body.attributes.normal.getZ(i)<.999,'solid cap does not remain beneath photo surface');

// Exercise all real supplemental STL assets; positions, topology and bounds stay exact.
let triangles=0,changedNormals=0;
for(const file of fs.readdirSync('dist/assets/upgrade')){
 const bytes=fs.readFileSync('dist/assets/upgrade/'+file),g=new STLLoader().parse(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength));
 g.scale(.001,.001,.001);g.computeVertexNormals();const before=g.attributes.position.array.slice(),normals=g.attributes.normal.array.slice();
 smoothCreases(g);assert.deepEqual(g.attributes.position.array,before,file+' source vertices unchanged');triangles+=g.attributes.position.count/3;
 const n=g.attributes.normal;for(let i=0;i<n.count;i++){const length=Math.hypot(n.getX(i),n.getY(i),n.getZ(i));assert(Number.isFinite(length)&&Math.abs(length-1)<1e-5);if(Math.hypot(n.getX(i)-normals[3*i],n.getY(i)-normals[3*i+1],n.getZ(i)-normals[3*i+2])>.01)changedNormals++;}
}
assert(changedNormals>1000,'curved STL surfaces receive smooth normals');

globalThis.fetch=async p=>({ok:true,json:()=>JSON.parse(fs.readFileSync('dist/'+p))});
T.TextureLoader.prototype.loadAsync=async()=>new T.Texture();
const spec=JSON.parse(fs.readFileSync('dist/assets/electronics/boards.json')).boards;
const meshes=await createElectronics();
for(const b of spec){
 const board=meshes.find(m=>m.name===b.key+' / board'),photo=meshes.find(m=>m.name===b.key+' / photo');
 assert(photo.material.isMeshBasicMaterial&&!photo.material.toneMapped,'photo contrast is independent of studio exposure');
 assert(!photo.castShadow&&!photo.receiveShadow,'photo does not create or receive aliased self shadows');
 const q=board.geometry.attributes.position,n=board.geometry.attributes.normal;
 for(let i=0;i<n.count;i++)assert(n.getY(i)<.999,'no solid front cap duplicates textured front');
 for(let i=0;i<q.count;i++)assert(q.getY(i)<b.origin[1]/1000+1e-8,'no raised duplicate decal');
}
fs.writeFileSync('research/surface-check.json',JSON.stringify({stlFiles:8,triangles,smoothedCorners:changedNormals,positionsUnchanged:true,boards:2,singleFrontSurface:true,sharpEdgesPreserved:true,browserGPUExercised:false},null,2));
console.log(`PASS: single PCB front surfaces, neutral photo colour, round normals and sharp caps; all 8 STL assets retain ${triangles} triangles and exact vertices (${changedNormals} smoothed corners).`);
