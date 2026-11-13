import * as THREE from 'three';
import {STLLoader} from './vendor/STLLoader.js';
import {smoothCreases} from './surface-geometry.js?v=20261111-94';
import {FINISHES} from './cad-finishes.js?v=20261111-94';

export async function createDoorHardware(sourceMeshes,records){
 const response=await fetch('./assets/door/manifest.json');if(!response.ok)throw Error('Door hardware could not be loaded');
 const spec=await response.json(),loader=new STLLoader(),meshes=[];
 const placement=rows=>{const m=new THREE.Matrix4().set(...rows.flat());for(const i of [12,13,14])m.elements[i]*=.001;return m;};
 const geometry=async file=>{const g=await loader.loadAsync('./assets/door/'+file);g.scale(.001,.001,.001);return smoothCreases(g);};
 const nut=sourceMeshes.find(m=>m.userData.cadIndex===spec.nutAdjustment.cadIndex),targets=spec.screws.instances.map(item=>sourceMeshes.find(m=>m.userData.cadIndex===item.cadIndex));
 if(!nut||targets.some(m=>!m))throw Error('Missing door-holder hardware');
 const magnet=await geometry(spec.magnets.file);let screw;
 try{screw=await geometry(spec.screws.file);}catch(error){magnet.dispose();throw error;}
 for(const item of spec.magnets.instances){
  const material=new THREE.MeshStandardMaterial(FINISHES.steel),mesh=new THREE.Mesh(magnet,material);material.userData.finish='steel';
  placement(item.placement).decompose(mesh.position,mesh.quaternion,mesh.scale);
  mesh.userData={part:item.key,cadName:spec.magnets.sourcePart,officialSource:spec.magnets.source};mesh.castShadow=true;mesh.receiveShadow=true;meshes.push(mesh);
 }
 const pin=await geometry(spec.hingePins.file);
 for(const item of spec.hingePins.instances){
  const material=new THREE.MeshStandardMaterial(FINISHES.steel),mesh=new THREE.Mesh(pin,material);material.userData.finish='steel';mesh.position.fromArray(item.origin).multiplyScalar(.001);
  mesh.userData={part:item.key,cadName:spec.hingePins.sourcePart,officialSource:spec.hingePins.source,geometryStatus:'nominal-reconstruction'};mesh.castShadow=true;mesh.receiveShadow=true;meshes.push(mesh);
 }
 for(const [i,item]of spec.screws.instances.entries()){
  const mesh=targets[i];mesh.updateMatrix();
  mesh.userData.sourceGeometry??=mesh.geometry;mesh.geometry=screw.clone().applyMatrix4(placement(item.placement)).applyMatrix4(mesh.matrix.clone().invert());
  mesh.userData.cadName='M3x5rT';mesh.userData.hardwareSource=spec.screws.source;mesh.userData.underheadLength=5;
  const record=records.find(r=>r.mesh===mesh);if(record)record.name='M3x5rT';
 }screw.dispose();
 nut.position.add(new THREE.Vector3(...spec.nutAdjustment.offset).multiplyScalar(.001));nut.userData.assemblyOffset=spec.nutAdjustment.offset;
 for(const item of spec.assemblyOffsets||[]){const mesh=sourceMeshes.find(m=>m.userData.cadIndex===item.cadIndex);if(!mesh)throw Error('Missing door registration');mesh.position.add(new THREE.Vector3(...item.offset).multiplyScalar(.001));mesh.userData.assemblyOffset=item.offset;}
 return meshes;
}
