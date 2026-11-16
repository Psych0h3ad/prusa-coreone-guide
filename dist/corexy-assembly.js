import {createXYMountParts} from './xy-mount-model.js';
import * as THREE from 'three';
import {STLLoader} from './vendor/STLLoader.js';
import {smoothCreases} from './surface-geometry.js?v=20261111-94';
import {FINISHES} from './cad-finishes.js?v=20261111-94';

export async function createCoreXYParts(sourceMeshes){
 const response=await fetch('./assets/corexy/manifest.json');if(!response.ok)throw Error('CoreXY parts could not be loaded');
 const data=await response.json(),meshes=[],geometries=new Set(),loader=new STLLoader();
 try{
  for(const spec of data.meshes){
   let geometry=await loader.loadAsync('./assets/corexy/'+spec.file);geometry.scale(.001,.001,.001);const source=geometry;geometry=smoothCreases(source);if(geometry!==source)source.dispose();
   geometries.add(geometry);const material=new THREE.MeshStandardMaterial(FINISHES[spec.finish]),mesh=new THREE.Mesh(geometry,material);material.userData.finish=spec.finish;
   mesh.position.fromArray(spec.origin).multiplyScalar(.001);mesh.userData={part:spec.key,cadName:spec.sourcePart,officialSource:data.source};mesh.castShadow=true;mesh.receiveShadow=true;meshes.push(mesh);
  }
  const placement=new THREE.Matrix4().set(...data.bearingScrewTransform.flat());for(const i of [12,13,14])placement.elements[i]*=.001;
  for(const id of data.bearingScrewSources){
   const source=sourceMeshes.find(m=>m.userData.cadPath?.includes(id));if(!source)throw Error('Missing bearing screw in source CAD');source.updateMatrix();
   const material=source.material.clone(),geometry=source.geometry.clone();geometries.add(geometry);const mesh=new THREE.Mesh(geometry,material);placement.clone().multiply(source.matrix).decompose(mesh.position,mesh.quaternion,mesh.scale);
   mesh.userData={part:'leftBearingScrews',cadName:'M3x8rT',sourceCAD:id,officialSource:'https://www.printables.com/model/1520471'};mesh.castShadow=true;mesh.receiveShadow=true;meshes.push(mesh);
  }
  for(const spec of data.idler.solids){
   let geometry=await loader.loadAsync('./assets/corexy/'+spec.file);geometry.scale(.001,.001,.001);const source=geometry;geometry=smoothCreases(source);if(geometry!==source)source.dispose();geometries.add(geometry);
   for(const instance of data.idler.instances){
    const material=new THREE.MeshStandardMaterial(FINISHES[spec.finish]),mesh=new THREE.Mesh(geometry,material);material.userData.finish=spec.finish;
    mesh.position.fromArray(instance.center).multiplyScalar(.001);mesh.userData={part:instance.key,cadName:data.idler.sourcePart,officialSource:data.source,sourceSolid:spec.solid};mesh.castShadow=true;mesh.receiveShadow=true;meshes.push(mesh);
   }
  }
  meshes.push(...await createXYMountParts([...sourceMeshes,...meshes]));
  return meshes;
 }catch(error){for(const geometry of geometries)geometry.dispose();for(const mesh of meshes)mesh.material.dispose();throw error;}
}
