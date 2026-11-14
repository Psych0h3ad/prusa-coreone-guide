// SPDX-License-Identifier: MIT
// Reference internals, independently authored from the published frame envelope
// and official photographs. Geometry CC BY-SA 4.0; not supplier/manufacturing CAD.
import * as T from 'three';
const highlight=new T.Color('#fd5000');
export async function loadChamberFanAnatomy(){
 const url=new URL('./assets/chamber-fan-anatomy/fan-anatomy.json',import.meta.url),response=await fetch(url);
 if(!response.ok)throw Error('Chamber fan reference manifest unavailable');
 const source=await response.json(),raw=await fetch(new URL('./assets/chamber-fan-anatomy/fan-anatomy.bin',import.meta.url));
 if(!raw.ok)throw Error('Chamber fan reference geometry unavailable');
 const data=await raw.arrayBuffer();if(data.byteLength!==source.bytes)throw Error('Chamber fan reference geometry size mismatch');
 const geometries={};
 try{for(const [role,part]of Object.entries(source.parts)){
  const n=part.vertices*3,p=new Float32Array(data.slice(part.offsetBytes,part.offsetBytes+n*4)),normal=new Float32Array(data.slice(part.offsetBytes+n*4,part.offsetBytes+n*8));
  if(p.length!==n||normal.length!==n||!p.every(Number.isFinite)||!normal.every(Number.isFinite))throw Error('Invalid chamber fan reference geometry');
  const geometry=new T.BufferGeometry();geometries[role]=geometry;geometry.setAttribute('position',new T.BufferAttribute(p,3));geometry.setAttribute('normal',new T.BufferAttribute(normal,3));for(const group of part.groups)geometry.addGroup(group.start,group.count,group.material);geometry.scale(.001,.001,.001);geometry.computeBoundingBox();geometry.computeBoundingSphere();
 }return{geometries,source};}catch(error){for(const g of Object.values(geometries))g.dispose();throw error;}
}
export function installChamberFanAnatomy(viewer){
 if(viewer.chamberFanAnatomy&&!viewer.chamberFanAnatomy.retired)return Promise.resolve(viewer.chamberFanAnatomy);
 if(viewer.chamberFanAnatomyPending)return viewer.chamberFanAnatomyPending;
 const pending=install(viewer).finally(()=>{if(viewer.chamberFanAnatomyPending===pending)delete viewer.chamberFanAnatomyPending;});
 viewer.chamberFanAnatomyPending=pending;return pending;
}
async function install(viewer){
 if(viewer.chamberFanAnatomy&&!viewer.chamberFanAnatomy.retired)return viewer.chamberFanAnatomy;
 const frames=[70,72].map(id=>viewer.meshes.find(m=>m.userData.cadIndex===id));
 if(frames.some(m=>!m))throw Error('Both native chamber fan frames are required');
 const {geometries,source}=await loadChamberFanAnatomy();
 if(viewer.disposed){for(const g of Object.values(geometries))g.dispose();return;}
 // The native frame remains the sole assembly actor. Children inherit its
 // pose and visibility and never enter the native CAD/director mesh registry.
 const owned=[],materials=new Set(),selectionOwners=new Map();let retired=false;
 const syncMesh=mesh=>{const frame=selectionOwners.get(mesh),source=Array.isArray(frame.material)?frame.material[0]:frame.material;for(const material of Array.isArray(mesh.material)?mesh.material:[mesh.material]){
  material.color.copy(material.userData.referenceColor);if(frame.userData.active&&!frame.userData.preserveColours)material.color.lerp(highlight,.28);
  material.emissive.copy(source.emissive);material.emissiveIntensity=source.emissiveIntensity;
  material.opacity=source.opacity;material.transparent=source.transparent;material.depthWrite=source.depthWrite;
 }};
 const api={source,frames,owned,geometries,selectionOwners,get retired(){return retired;},get pickTargets(){return retired?[]:owned;},syncMaterials(){if(!retired)for(const mesh of owned)syncMesh(mesh);},retire(){
  if(retired)return;retired=true;
  if(viewer.chamberFanAnatomy===api)delete viewer.chamberFanAnatomy;
  const gs=[...new Set(Object.values(geometries))],ms=[...materials];
  for(const mesh of owned){mesh.removeFromParent();mesh.onBeforeRender=()=>{};}
  owned.length=0;selectionOwners.clear();materials.clear();
  // Return all identities before notifications, so reentrant retirement and
  // the following native traversal cannot dispose these resources twice.
  for(const g of gs)g.dispose();for(const m of ms)m.dispose();
 }};
 try{for(const frame of frames)for(const [role,geometry]of Object.entries(geometries)){
  const makeMaterial=label=>{const base=new T.Color(label?'#b6b7b1':'#242725'),material=new T.MeshStandardMaterial({color:base,roughness:label?.7:.52,metalness:.05,envMapIntensity:.45});material.userData.referenceColor=base.clone();materials.add(material);return material;};
  const material=role==='support'?[makeMaterial(false),makeMaterial(true)]:makeMaterial(false),mesh=new T.Mesh(geometry,material);
  mesh.name='Reference chamber fan '+role;mesh.castShadow=role!=='label';mesh.receiveShadow=true;
  mesh.userData={referenceFanAnatomy:true,referenceRole:role,officialCad:false,geometryOrigin:'independently-authored-reference'};
  mesh.onBeforeRender=()=>syncMesh(mesh);
  frame.add(mesh);owned.push(mesh);selectionOwners.set(mesh,frame);
 }viewer.chamberFanAnatomy=api;api.syncMaterials();return api;}catch(error){api.retire();throw error;}
}
export function retireChamberFanAnatomy(viewer){viewer.chamberFanAnatomy?.retire();}
export function syncChamberFanAnatomy(viewer){viewer.chamberFanAnatomy?.syncMaterials();}
