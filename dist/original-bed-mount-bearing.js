import * as T from 'three';
import {ORIGINAL_BED_MOUNT as D} from './original-bed-mount-data.js';
import {readSurfaceBuffer} from './surface-transfer.js';

// Both instances share the complete exported twenty-face body. No surrogate
// ball rows, cropped skin, seam suppression or per-instance geometry scaling.
export async function loadOriginalBedBearings(materialSource,{isCurrent=()=>true}={}){
 const current=()=>{if(!isCurrent())throw new DOMException('Original bed preparation stopped','AbortError');};
 current();
 const pinned=D.bearingSource,response=await fetch(pinned.manifestURL);
 if(!response.ok)throw Error('Complete LM8UU reference could not be loaded');
 const manifestBuffer=await response.arrayBuffer();
 if(manifestBuffer.byteLength!==pinned.manifestBytes||!globalThis.crypto?.subtle)throw Error('Complete LM8UU verification unavailable');
 const digest=new Uint8Array(await crypto.subtle.digest('SHA-256',manifestBuffer));
 if(Array.from(digest,x=>x.toString(16).padStart(2,'0')).join('')!==pinned.manifestSHA256)throw Error('LM8UU source manifest checksum mismatch');
 const spec=JSON.parse(new TextDecoder().decode(manifestBuffer));
 if(spec.file!==pinned.file||spec.sha256!==pinned.sha256||spec.bufferBytes!==604800||spec.vertices!==25200||spec.triangles!==8400||spec.units!=='mm'||spec.encoding!=='gzip'||spec.allSourceFacesRetained!==true||spec.internalBallRowsPresent!==false)throw Error('LM8UU complete source manifest changed');
 const buffer=await readSurfaceBuffer('./assets/linear-bearings/'+spec.file,{decodedBytes:spec.bufferBytes,sha256:spec.sha256});
 current();
 const values=new Float32Array(buffer),positions=new Float32Array(spec.vertices*3),normals=new Float32Array(spec.vertices*3);
 if(values.length!==positions.length+normals.length)throw Error('LM8UU full P/N layout changed');
 for(let i=0;i<positions.length;i++){
  if(!Number.isFinite(values[i])||!Number.isFinite(values[positions.length+i]))throw Error('Nonfinite LM8UU source');
  positions[i]=values[i]*.001;normals[i]=values[positions.length+i];
 }
 let next=0;for(const f of spec.faces){if(f.firstVertex!==next||f.count%3)throw Error('Incomplete LM8UU source-face coverage');next+=f.count;}
 if(next!==spec.vertices||spec.faces.length!==20)throw Error('Incomplete LM8UU twenty-face body');
 const geometry=new T.BufferGeometry(),parts=[],materials=[];
 try{
  geometry.setAttribute('position',new T.BufferAttribute(positions,3));geometry.setAttribute('normal',new T.BufferAttribute(normals,3));
  geometry.setDrawRange(0,spec.vertices);
  for(const f of spec.faces)geometry.addGroup(f.firstVertex,f.count,0);
  geometry.computeBoundingBox();geometry.computeBoundingSphere();
  for(const r of D.bearings){
   const material=materialSource.clone();materials.push(material);
   const mesh=new T.Mesh(geometry,material),matrix=new T.Matrix4().set(...r.matrixMM.flat());
   for(const i of [12,13,14])matrix.elements[i]*=.001;
   matrix.decompose(mesh.position,mesh.quaternion,mesh.scale);
   mesh.userData={part:'bedSupport',component:r.component,componentOnly:true,cadPath:[],cadName:'LM8UU / '+r.component,preserveCadName:true,originalBedMountComponent:true,originalBedMountOwner:r.ownerCAD,sourceFaces:8400,sourceCAD:null,materialStock:'LM8UU',manualID:2251,assemblyPrimitive:'original-bed-mount401',geometryProvenance:pinned.provenance,sourceWholeSHA256:spec.sha256,bearingBallRowsModeled:false,bearingPoseQualification:'External body static frame only; no ball-row orientation or elastic fit certificate.'};
   mesh.castShadow=true;mesh.receiveShadow=true;parts.push(mesh);
  }
  return parts;
 }catch(error){geometry.dispose();for(const material of materials)material.dispose();throw error;}
}
