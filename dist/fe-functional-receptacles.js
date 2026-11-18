/* MIT code; independently authored geometry CC-BY-SA-4.0. Native datum facts retain OCL-1.0 attribution. */
export const FE_RECEPTACLE_PROFILES=Object.freeze({FE1:'single',FE3:'dual',FE5:'single'});

// Async preparation belongs to the caller's existing load/cancel owner.
// This data-only helper has no Three import, top-level await or global cache.
export async function loadFEReceptacleBuffers({fetcher=fetch,baseURL=new URL('./assets/fe-receptacles/',import.meta.url)}={}){
 const manifest=await(await fetcher(new URL('manifest.json',baseURL))).json(),profiles={};
 for(const model of manifest.models){
  const buffers={};
  for(const[key,spec]of Object.entries(model.buffers)){
   const response=await fetcher(new URL(spec.path,baseURL));if(!response.ok)throw Error('FE reference asset '+response.status);
   const data=await response.arrayBuffer();if(data.byteLength!==spec.bytes)throw Error('FE reference byte count');
   if(globalThis.crypto?.subtle){const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',data)),x=>x.toString(16).padStart(2,'0')).join('');if(digest!==spec.sha256)throw Error('FE reference checksum');}
   buffers[key]=key==='index'?new Uint32Array(data):new Float32Array(data);
  }
  profiles[model.profile]={model,buffers};
 }
 return {manifest,profiles};
}

export function createFEReceptacle({THREE,kind,prepared,frame}){
 const profile=FE_RECEPTACLE_PROFILES[kind],record=prepared.profiles[profile];if(!record)throw Error('FE reference kind');
 const geometry=new THREE.BufferGeometry(),material=new THREE.MeshStandardMaterial({color:0xbfc4c8,roughness:.34,metalness:.78});
 const {position,normal,index}=record.buffers;
 // Each instance owns complete typed buffers and material; no foreign provider or dispose wrapper.
 geometry.setAttribute('position',new THREE.BufferAttribute(position.slice(),3));geometry.setAttribute('normal',new THREE.BufferAttribute(normal.slice(),3));geometry.setIndex(new THREE.BufferAttribute(index.slice(),1));geometry.computeBoundingBox();geometry.computeBoundingSphere();
 const mesh=new THREE.Mesh(geometry,material);mesh.name='authored-'+kind+'-functional-receptacle';mesh.matrixAutoUpdate=false;mesh.userData.functionalReference=true;mesh.userData.noVerifiedSupplierSKU=true;
 let closed=false;
 function setFrame(value){
  if(closed)throw Error('FE reference owner closed');
  const[x,y,z]=value.basisColumns,o=value.originMM;
  mesh.matrix.set(x[0],y[0],z[0],o[0]*.001,x[1],y[1],z[1],o[1]*.001,x[2],y[2],z[2],o[2]*.001,0,0,0,1);mesh.matrixWorldNeedsUpdate=true;return mesh;
 }
 function pointAt(local){
  if(!local)throw Error('FE reference port');
  return {pointMM:new THREE.Vector3(...local).multiplyScalar(.001).applyMatrix4(mesh.matrix).multiplyScalar(1000),away:new THREE.Vector3(0,0,-1).transformDirection(mesh.matrix),toward:new THREE.Vector3(0,0,1).transformDirection(mesh.matrix)};
 }
 setFrame(frame);
 return {mesh,geometry,material,profile,kind,setFrame,port:(index=0)=>pointAt(record.model.wirePortsMM[index]),entry:(index=0)=>pointAt(record.model.wireEntryPortsMM[index]),mouth:()=>pointAt(record.model.tabMouthMM),dispose(){if(closed)return;closed=true;mesh.removeFromParent();geometry.dispose();material.dispose();}};
}
