import {registerBedCoverPoses} from '../../dist/bed-cover-model.js';
import * as THREE from 'three';
import {STLLoader} from '../../dist/vendor/STLLoader.js';
import {smoothCreases} from '../../dist/surface-geometry.js';

function finishSolids(geometry,counts=[geometry.attributes.position.count/3]){
 const position=geometry.attributes.position;
 if(counts.some(n=>!Number.isInteger(n)||n<=0)||counts.reduce((a,b)=>a+b,0)*3!==position.count)throw Error('CAD solid ranges do not match the surface');
 let first=0;
 geometry.userData.cadSolidRanges=counts.map(triangles=>{const range={firstTriangle:first,triangles};first+=triangles;return range;});
 if(counts.length===1)return smoothCreases(geometry);
 const normals=new Float32Array(position.count*3);
 // Keep each original solid's normals separate at touching interfaces.
 for(const {firstTriangle,triangles}of geometry.userData.cadSolidRanges){
  const piece=new THREE.BufferGeometry();piece.setAttribute('position',new THREE.BufferAttribute(position.array.slice(firstTriangle*9,(firstTriangle+triangles)*9),3));
  smoothCreases(piece);normals.set(piece.attributes.normal.array,firstTriangle*9);piece.dispose();
 }
 geometry.setAttribute('normal',new THREE.BufferAttribute(normals,3));return geometry;
}

export async function restoreCADSurfaces(meshes){
 const response=await fetch('./assets/cad-surfaces/manifest.json?v=20261116-176');if(!response.ok)throw Error('CAD surfaces could not be loaded');
 const {meshes:specs}=await response.json(),loader=new STLLoader();
 for(const spec of specs){
  const source=meshes.find(m=>m.userData.cadIndex===spec.cadIndex),targets=meshes.filter(m=>spec.cadIndices.includes(m.userData.cadIndex));
  if(!source||targets.length!==spec.cadIndices.length)throw Error('Missing source CAD surface');source.updateMatrix();
  let geometry=await loader.loadAsync(spec.file);geometry.scale(.001,.001,.001);geometry.translate(...spec.origin.map(v=>v*.001));geometry.applyMatrix4(source.matrix.clone().invert());
  if(spec.assemblySolids){
   const counts=spec.solidTriangles,source=geometry,positions=source.attributes.position.array,selected=[];let start=0;
   if(counts.reduce((a,b)=>a+b,0)*9!==positions.length)throw Error('Source solid ranges do not match the surface');
   if(!spec.assemblySolids.length||spec.assemblySolids.some((i,k)=>!Number.isInteger(i)||i<0||i>=counts.length||k&&i<=spec.assemblySolids[k-1]))throw Error('Assembly solid selection must be ordered, unique and nonempty');
   for(const [i,n]of counts.entries()){if(spec.assemblySolids.includes(i))selected.push(positions.slice(start*9,(start+n)*9));start+=n;}
   geometry=new THREE.BufferGeometry();const data=new Float32Array(selected.reduce((n,a)=>n+a.length,0));let offset=0;for(const a of selected){data.set(a,offset);offset+=a.length;}geometry.setAttribute('position',new THREE.BufferAttribute(data,3));source.dispose();
  }
  const input=geometry;geometry=finishSolids(input,spec.assemblySolids?spec.assemblySolids.map(i=>spec.solidTriangles[i]):spec.solidTriangles);if(geometry!==input)input.dispose();
  for(const mesh of targets){mesh.userData.sourceGeometry??=mesh.geometry;mesh.geometry=geometry;mesh.userData.surfaceSource=spec.source;}
 }
 registerBedCoverPoses(meshes);
}
