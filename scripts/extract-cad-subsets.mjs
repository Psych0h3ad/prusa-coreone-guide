import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as T from '../dist/vendor/three.module.js';
import {GLTFLoader} from '../dist/vendor/GLTFLoader.js';
import {MeshoptDecoder} from '../dist/vendor/meshopt_decoder.module.js';
globalThis.self=globalThis;
const b=fs.readFileSync('dist/assets/core-one.glb'),gltf=await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'');
gltf.scene.updateMatrixWorld(true);let source;
gltf.scene.traverse(m=>{if(!m.isMesh)return;for(let n=m;n;n=n.parent)if(n.userData.cadIndex===786)source=m;});
assert(source);const g=source.geometry,a=g.attributes.position,ix=g.index,count=(ix?.count||a.count)/3,parent=Uint32Array.from({length:count},(_,i)=>i),vertices=new Map();
const find=i=>{while(parent[i]!==i){parent[i]=parent[parent[i]];i=parent[i];}return i;};
for(let i=0;i<count;i++)for(let k=0;k<3;k++){
 const j=ix?ix.getX(i*3+k):i*3+k,p=new T.Vector3().fromBufferAttribute(a,j),key=p.toArray().map(v=>Math.round(v*1e8)).join(',');
 if(vertices.has(key)){const r=find(i),s=find(vertices.get(key));parent[r]=s;}else vertices.set(key,i);
}
const components=new Map();for(let i=0;i<count;i++){const root=find(i);if(!components.has(root))components.set(root,[]);components.get(root).push(i);}
const pieces=[...components.values()].map(faces=>{const box=new T.Box3();for(const f of faces)for(let k=0;k<3;k++)box.expandByPoint(new T.Vector3().fromBufferAttribute(a,ix?ix.getX(f*3+k):f*3+k).applyMatrix4(source.matrixWorld));return {faces,box};}).filter(p=>p.faces.length>100);
assert.equal(pieces.length,2,'reference cable-cover assembly contains two separate solids');pieces.sort((a,b)=>b.box.max.z-a.box.max.z);
const upper=pieces[0];assert(Math.abs(upper.box.max.z*1000-81.5361)<.01);
// The installed R2 mount counterbore floor is at425.2004mm, while the source
// fitting shoulder is at423.9504mm. Seat the fitting on that annular floor.
// The NTC grub-screw occurrence is displaced 0.5mm from the heatsink bore
// in the supplied assembly. Align its axis without changing insertion depth.
fs.writeFileSync('dist/assets/cad-subsets.json',JSON.stringify({786:{sourceTriangles:count,sourceVertices:a.count,faces:upper.faces},_offsets:{811:[.5,.000000238264,0],817:[0,0,1.25]}}));
console.log(`Extracted the existing upper cable-cover solid: ${upper.faces.length} source triangles; duplicate lower cover excluded from this instance.`);
