import * as THREE from 'three';
import {STLLoader} from './vendor/STLLoader.js';
import {GLTFLoader} from './vendor/GLTFLoader.js';
import {smoothCreases} from './surface-geometry.js?v=20261111-94';
import {SENSOR_ASSEMBLY} from './sensor-assembly-data.js?v=20261111-94';

import {loadReusableSTL} from './stl-geometry-cache.js?v=20261113-128';

// Source-local mating frames are retained in mm; the renderer uses metres.
export async function createSensorInternals(sourceMeshes=[],records=[]){
 const meshes=[],geometries=new Set(),materials=new Set(),covers=[],handles=[],loader=new STLLoader(),gltf=new GLTFLoader();
 const load=async url=>{let source;if(url.endsWith('.glb')){const result=await gltf.loadAsync(url);result.scene.traverse(m=>{if(m.isMesh){source=m.geometry;(Array.isArray(m.material)?m.material:[m.material]).forEach(x=>x.dispose());}});if(!source)throw Error('Sensor geometry is missing');}else source=await loadReusableSTL(loader,url);source.scale(.001,.001,.001);const g=smoothCreases(source);if(g!==source)source.dispose();geometries.add(g);return g;};
 const add=(key,geometry,finish={})=>{
  const material=new THREE.MeshStandardMaterial({color:'#afb2b3',metalness:.85,roughness:.26,envMapIntensity:.65,...finish});materials.add(material);
  const mesh=new THREE.Mesh(geometry,material),matrix=new THREE.Matrix4().set(...SENSOR_ASSEMBLY.partWorld[key].flat());
  for(const i of [12,13,14])matrix.elements[i]*=.001;
  matrix.decompose(mesh.position,mesh.quaternion,mesh.scale);
  mesh.userData.part=key;mesh.castShadow=true;mesh.receiveShadow=true;meshes.push(mesh);return mesh;
 };
 try{
  const response=await fetch('./assets/sensor/IR-finish.json');if(!response.ok)throw Error('IR finish data could not be loaded');const finishes=await response.json();
  for(const key of ['sensorBall','sensorLeverMagnet','sensorSwitchMagnet']){
   const geometry=key==='sensorBall'?new THREE.SphereGeometry(.0035,40,24):new THREE.BoxGeometry(.006,.002,.010);geometries.add(geometry);add(key,geometry);
  }
  for(const spec of SENSOR_ASSEMBLY.meshes){
   const geometry=await load(spec.url),mesh=add(spec.key,geometry,{color:spec.color,metalness:spec.metalness,roughness:spec.roughness});
   if(spec.finishIndex!==null&&spec.finishIndex!==undefined){
    const {palette,faces}=finishes[spec.finishIndex],count=geometry.attributes.position.count;if(faces.length*3!==count)throw Error('IR source finish does not match its geometry');
    const colors=new Float32Array(count*3);faces.forEach((index,i)=>{for(let k=0;k<3;k++)colors.set(palette[index],(i*3+k)*3);});geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));mesh.material.vertexColors=true;
   }
   if(spec.upgradeUrl)covers.push({mesh,kit:geometry,upgrade:await load(spec.upgradeUrl)});
  }
  for(const spec of SENSOR_ASSEMBLY.handleScrews||[]){
   const mesh=sourceMeshes.find(m=>m.userData.cadPath?.includes(spec.cad));if(!mesh)throw Error('Missing handle screw in CAD');mesh.updateMatrix();
   const geometry=await load(spec.url),matrix=new THREE.Matrix4().set(...spec.partToWorld.flat());for(const i of [12,13,14])matrix.elements[i]*=.001;
   geometry.applyMatrix4(mesh.matrix.clone().invert().multiply(matrix));geometries.add(mesh.geometry);handles.push({mesh,kit:mesh.geometry,upgrade:geometry,name:mesh.userData.cadName});
  }
  return {meshes,geometries,serviceSources(){return {handles:handles.map(({mesh,kit,upgrade})=>({mesh,kit,upgrade})),covers:covers.map(({mesh,kit,upgrade})=>({mesh,kit,upgrade}))};},apply(configuration){
   for(const {mesh,kit,upgrade}of covers){mesh.geometry=configuration==='upgrade'?upgrade:kit;mesh.userData.fastenerLength=configuration==='upgrade'?8:10;}
   for(const {mesh,kit,upgrade,name}of handles){mesh.geometry=configuration==='upgrade'?upgrade:kit;mesh.userData.fastenerLength=configuration==='upgrade'?10:8;mesh.userData.cadName=configuration==='upgrade'?'M3x10rT (ISO 7380-1)':name;for(const record of records)if(record.mesh===mesh)record.name=mesh.userData.cadName;}
  }};
 }catch(error){geometries.forEach(g=>{if(!handles.some(h=>h.kit===g))g.dispose();});materials.forEach(m=>m.dispose());throw error;}
}

export function sensorBenchQuaternion(){
 const source=new THREE.Matrix4().set(...SENSOR_ASSEMBLY.bodyWorld.flat());
 source.setPosition(0,0,0);
 const rotation=new THREE.Matrix4().makeRotationX(-Math.PI/2).multiply(source.invert());
 return new THREE.Quaternion().setFromRotationMatrix(rotation);
}
