// Original preparation code: MIT. Source CAD retains Prusa OCL v1.
import fs from 'node:fs';
import path from 'node:path';
export async function prepareNativeFrames(root){
 const T=await import('three'),{GLTFLoader}=await import('../../dist/vendor/GLTFLoader.js'),{MeshoptDecoder}=await import('../../dist/vendor/meshopt_decoder.module.js');
 globalThis.self=globalThis;
 const bytes=fs.readFileSync(path.join(root,'dist/assets/core-one.glb'));
 const gltf=await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
 const subsets=JSON.parse(fs.readFileSync(path.join(root,'dist/assets/cad-subsets.json')));
 gltf.scene.updateMatrixWorld(true);
 const pending=[],walk=(node,ids=[])=>{const next=node.userData.cadIndex===undefined?ids:[...ids,node.userData.cadIndex];if(node.isMesh)pending.push({node,ids:next,matrix:node.matrixWorld.clone()});node.children.forEach(n=>walk(n,next));};walk(gltf.scene);
 const group=new T.Group(),meshes=[];
 // Same flatten -> decompose -> subset offset -> source.updateMatrix as Viewer.
 // The source matrices must NOT be serialized matrixWorld directly: that skips
 // the original decomposition/recomposition rounding used before restoration.
 for(const {node,ids,matrix}of pending){
  const subset=subsets[ids.at(-1)];
  if(subset){const source=node.geometry,index=source.index,vertices=new Map(),order=[];for(const face of subset.faces)for(let k=0;k<3;k++){const i=index?index.getX(face*3+k):face*3+k;if(!vertices.has(i))vertices.set(i,vertices.size);order.push(vertices.get(i));}const geometry=new T.BufferGeometry();for(const [name,attr]of Object.entries(source.attributes)){const values=new attr.array.constructor(vertices.size*attr.itemSize);for(const [old,i]of vertices)for(let k=0;k<attr.itemSize;k++)values[i*attr.itemSize+k]=attr.array[old*attr.itemSize+k];geometry.setAttribute(name,new T.BufferAttribute(values,attr.itemSize,attr.normalized));}geometry.setIndex(order);node.geometry=geometry;node.userData.sourceGeometry=source;}
  node.removeFromParent();matrix.decompose(node.position,node.quaternion,node.scale);group.add(node);node.userData.sourceRestPosition=node.position.clone();
  for(const[id,offset]of Object.entries(subsets._offsets||{}))if(ids.includes(Number(id)))node.position.add(new T.Vector3(...offset).multiplyScalar(.001));
  node.userData.cadIndex=ids.at(-1);node.userData.cadPath=ids;node.updateMatrix();meshes.push(node);
 }
 return {gltf,group,meshes};
}
