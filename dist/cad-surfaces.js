import {registerBedCoverPoses} from './bed-cover-model.js';
import * as THREE from 'three';
import {CAD_TRANSPORT} from './core-cad-transfer.js';
import {CAD_SURFACE_READY as READY} from './cad-surface-ready-binding.js';
import {decodeSurfacePack} from './surface-pack.js';
import {createSurfacePool} from './surface-pool.js?v=20261117-187';
const pause=()=>new Promise(resolve=>setTimeout(resolve,0));
async function readManifest(){
 const response=await fetch(READY.manifestURL);if(!response.ok)throw Error('Prepared CAD surface index could not be loaded');
 const buffer=await response.arrayBuffer();
 if(globalThis.crypto?.subtle){const digest=new Uint8Array(await crypto.subtle.digest('SHA-256',buffer)),hash=Array.from(digest,n=>n.toString(16).padStart(2,'0')).join('');if(hash!==READY.manifestSHA256)throw Error('Prepared CAD surface index checksum mismatch');}
 const data=JSON.parse(new TextDecoder().decode(buffer));
 if(data.format!=='PCADSUR1'||data.nativeCADSHA256!==READY.nativeCADSHA256||data.nativeCADSHA256!==CAD_TRANSPORT.sha256||data.meshes.length!==READY.parts)throw Error('Prepared CAD surfaces do not match this source model');
 return data.meshes;
}
export async function restoreCADSurfaces(meshes,{onProgress=()=>{},isCurrent=()=>true,onPool=()=>{},onActivity=()=>{}}={}){
 if(!isCurrent())return false;
 const specs=await readManifest();if(!isCurrent())return false;
 const jobs=specs.map(spec=>{
  const source=meshes.find(m=>m.userData.cadIndex===spec.cadIndex),targets=meshes.filter(m=>spec.cadIndices.includes(m.userData.cadIndex));
  if(!source||targets.length!==spec.cadIndices.length)throw Error('Missing source CAD surface');source.updateMatrix();
  if(!source.matrix.elements.every((x,i)=>x===spec.sourceMatrix[i]))throw Error('Prepared CAD surface source frame mismatch');
  return {spec,source,targets,geometry:null};
 });
 let pool,tasks=[],prepared=0,adopted=false;
 const undo=[];const current=()=>{if(!isCurrent())throw new DOMException('Preparation stopped','AbortError');};
 try{
  onProgress({done:0,total:specs.length});await pause();current();
  pool=createSurfacePool({onActivity});onPool(pool);current();
  tasks=jobs.map(async job=>{
   current();const spec=job.spec,buffer=await pool.read(spec.preparedURL,{rawURL:spec.rawURL,decodedBytes:spec.decodedBytes,sha256:spec.sha256});current();
   const {positions,normals,solidRanges}=decodeSurfacePack(buffer,spec),g=new THREE.BufferGeometry();job.geometry=g;
   g.setAttribute('position',new THREE.BufferAttribute(positions,3));g.setAttribute('normal',new THREE.BufferAttribute(normals,3));g.userData.cadSolidRanges=solidRanges;
   prepared++;if(prepared<specs.length)onProgress({done:prepared,total:specs.length,name:spec.sourcePart});
   await pause();current();
  });
  await Promise.all(tasks);current();
  // No pending geometry is attached to the Viewer before the entire verified
  // batch is ready. Viewer close cannot dispose half a batch while it decodes.
  for(const {spec,source}of jobs){source.updateMatrix();if(!source.matrix.elements.every((x,i)=>x===spec.sourceMatrix[i]))throw Error('CAD surface frame changed during preparation');}
  for(const {spec,targets,geometry}of jobs)for(const mesh of targets){
   undo.push({mesh,geometry:mesh.geometry,sourceGeometry:Object.getOwnPropertyDescriptor(mesh.userData,'sourceGeometry'),surfaceSource:Object.getOwnPropertyDescriptor(mesh.userData,'surfaceSource')});
   mesh.userData.sourceGeometry??=mesh.geometry;mesh.geometry=geometry;mesh.userData.surfaceSource=spec.source;
  }
  registerBedCoverPoses(meshes);adopted=true;onProgress({done:specs.length,total:specs.length});return true;
 }catch(error){
  pool?.dispose();await Promise.allSettled(tasks);
  if(!adopted){for(const r of undo.reverse()){r.mesh.geometry=r.geometry;for(const key of['sourceGeometry','surfaceSource']){if(r[key])Object.defineProperty(r.mesh.userData,key,r[key]);else delete r.mesh.userData[key];}}for(const j of jobs)j.geometry?.dispose();}
  if(!isCurrent()&&error.name==='AbortError')return false;
  throw error;
 }finally{pool?.dispose();onPool(null);}
}
