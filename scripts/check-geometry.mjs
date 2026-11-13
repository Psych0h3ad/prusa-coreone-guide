import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as THREE from '../dist/vendor/three.module.js';
import {GLTFLoader} from '../dist/vendor/GLTFLoader.js';
import {MeshoptDecoder} from '../dist/vendor/meshopt_decoder.module.js';
import {STLLoader} from '../dist/vendor/STLLoader.js';
globalThis.self=globalThis;
const loader=new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
const parse=async p=>{const b=fs.readFileSync(p);return loader.parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'');};
const original=await parse('research/core-tagged.glb');
const packed=await parse('dist/assets/core-one.glb');
function inspect(gltf){
 const parts=new Map(),areas=new Map();let triangles=0,degenerate=0;
 gltf.scene.updateMatrixWorld(true);
 gltf.scene.traverse(node=>{
  if(!node.isMesh)return;
  let ancestor=node;while(ancestor&&ancestor.userData.cadIndex===undefined)ancestor=ancestor.parent;
  assert(ancestor,'every mesh retains a CAD part identity');
  const id=ancestor.userData.cadIndex;
  const box=new THREE.Box3().setFromObject(node);
  if(!parts.has(id))parts.set(id,new THREE.Box3());parts.get(id).union(box);
  const p=node.geometry.attributes.position;
  assert(p.count>0&&Number.isFinite(box.min.x)&&Number.isFinite(box.max.z));
  triangles+=(node.geometry.index?.count||p.count)/3;
  const index=node.geometry.index;let area=0;const a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3();
  for(let i=0;i<(index?.count||p.count);i+=3){a.fromBufferAttribute(p,index?index.getX(i):i).applyMatrix4(node.matrixWorld);b.fromBufferAttribute(p,index?index.getX(i+1):i+1).applyMatrix4(node.matrixWorld);c.fromBufferAttribute(p,index?index.getX(i+2):i+2).applyMatrix4(node.matrixWorld);const triangleArea=b.sub(a).cross(c.sub(a)).length()*.5;if(triangleArea<1e-14)degenerate++;area+=triangleArea;}
  areas.set(id,(areas.get(id)||0)+area);
 });return {parts,triangles,areas,degenerate};
}
const a=inspect(original),b=inspect(packed);
assert.equal(a.triangles-a.degenerate,b.triangles-b.degenerate,'compression retains every nondegenerate triangle');
assert.equal(a.parts.size,b.parts.size,'compression must retain every mesh part');
let max=0;
for(const [id,box]of a.parts){const other=b.parts.get(id);assert(other);max=Math.max(max,box.min.distanceTo(other.min)*1000,box.max.distanceTo(other.max)*1000);}
assert(max<.001,`component bounding-box deviation ${max}mm`);
let maxAreaRelative=0;for(const [id,area]of a.areas){const other=b.areas.get(id);maxAreaRelative=Math.max(maxAreaRelative,Math.abs(area-other)/area);}
assert(maxAreaRelative<.00001,`per-part surface area relative deviation ${maxAreaRelative}`);
const stl=new STLLoader(),placements=JSON.parse(fs.readFileSync('dist/assets/upgrade-placements.json'));
const results=[];
for(const file of fs.readdirSync('dist/assets/upgrade')){
 const bytes=fs.readFileSync('dist/assets/upgrade/'+file);const geo=stl.parse(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength));geo.computeBoundingBox();
 const size=geo.boundingBox.getSize(new THREE.Vector3());assert(size.toArray().every(n=>n>0&&n<500));
 results.push({file,triangles:geo.attributes.position.count/3,dimensions_mm:size.toArray()});
}
assert.equal(Object.keys(placements).length,8);
for(const matrix of Object.values(placements)){const m=new THREE.Matrix4().set(...matrix.flat());assert(Math.abs(m.determinant()-1)<1e-5);}
const report={source_parts:a.parts.size,compressed_parts:b.parts.size,source_triangles:a.triangles,compressed_triangles:b.triangles,source_degenerate_triangles:a.degenerate,compressed_degenerate_triangles:b.degenerate,max_part_surface_area_relative_difference:maxAreaRelative,max_component_bbox_corner_difference_mm:max,upgrade_shapes:results};
fs.writeFileSync('research/geometry-check.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({status:'PASS',parts:b.parts.size,triangles:b.triangles,source_degenerate:a.degenerate,packed_degenerate:b.degenerate,area_relative_difference:maxAreaRelative,bbox_corner_difference_mm:max,upgrade_shapes:results.length}));
