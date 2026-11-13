import * as T from 'three';
import {STLLoader} from './vendor/STLLoader.js';
import {smoothCreases} from './surface-geometry.js?v=20261111-94';
import {FINISHES} from './cad-finishes.js?v=20261111-94';

import {loadReusableSTL} from './stl-geometry-cache.js?v=20261113-128';

// Match the kit guide's R1 left cover, R2 rear cover and single M3x10 fixing.
// The reference assembly also contains the older two-post left-cover fixing.
export async function configurePrintheadCovers(meshes,records){
 const response=await fetch('./assets/nextruder/printhead-covers.json');if(!response.ok)throw Error('Printhead covers could not be loaded');
 const spec=await response.json(),loader=new STLLoader(),added=[];
 const placement=rows=>{const m=new T.Matrix4().set(...rows.flat());for(const i of [12,13,14])m.elements[i]*=.001;return m;};
 const geometry=async(file,matrix)=>{const g=await loadReusableSTL(loader,file);g.scale(.001,.001,.001);g.applyMatrix4(matrix);return smoothCreases(g);};
 const replace=async(item,file,source)=>{
  const mesh=meshes.find(m=>m.userData.cadIndex===item.cadIndex);if(!mesh)throw Error('Missing printhead cover hardware');mesh.updateMatrix();
  const next=await geometry(file,mesh.matrix.clone().invert().multiply(placement(item.placement)));
  mesh.userData.sourceGeometry??=mesh.geometry;mesh.userData.referenceGeometry=mesh.geometry;mesh.geometry=next;mesh.userData.cadName=item.name;mesh.userData.revisionSource=source;
  const record=records.find(r=>r.mesh===mesh);if(record)record.name=item.name;
 };
 for(const cover of spec.covers)await replace(cover,'./assets/nextruder/'+(cover.assembledFile||cover.file),spec.source);
 for(const item of spec.fastenerOffsets||[]){
  const mesh=meshes.find(m=>m.userData.cadIndex===item.cadIndex);if(!mesh)throw Error('Missing R2 cover fixing');mesh.updateMatrix();
  mesh.userData.sourceGeometry??=mesh.geometry;mesh.userData.referenceGeometry??=mesh.geometry;
  const shift=new T.Matrix4().makeTranslation(...item.offset.map(n=>n*.001));
  mesh.geometry=mesh.geometry.clone().applyMatrix4(mesh.matrix.clone().invert().multiply(shift).multiply(mesh.matrix));
  mesh.userData.revisionSource=spec.source;mesh.userData.cadName=item.name;
  const record=records.find(r=>r.mesh===mesh);if(record)record.name=item.name;
 }
 await replace(spec.screw,spec.screw.file,'https://www.printables.com/model/1520471');
 const fanResponse=await fetch('./assets/nextruder/print-fan-fixing.json');if(!fanResponse.ok)throw Error('Print fan fixing could not be loaded');
 const fanScrew=await fanResponse.json(),fanMesh=meshes.find(m=>m.userData.cadIndex===fanScrew.cadIndex),fanName=fanMesh.userData.cadName;
 await replace(fanScrew,fanScrew.file,fanScrew.source);fanMesh.userData.guideGeometry20=fanMesh.geometry;fanMesh.geometry=fanMesh.userData.referenceGeometry;fanMesh.userData.cadName=fanName;fanMesh.userData.referenceName=fanName;
 const screw=meshes.find(m=>m.userData.cadIndex===spec.screw.cadIndex);for(const m of(Array.isArray(screw.material)?screw.material:[screw.material])){m.color.set(FINISHES.blackSteel.color);m.roughness=FINISHES.blackSteel.roughness;m.metalness=FINISHES.blackSteel.metalness;m.userData.originalColor=m.color.clone();m.userData.finish='blackSteel';}
 for(const item of[{...spec.nut,component:'leftCoverNut'},...(spec.mountNuts||[])]){
  const g=await geometry(item.file,placement(item.placement)),material=new T.MeshStandardMaterial(FINISHES.steel),nut=new T.Mesh(g,material);material.userData.finish='steel';
  nut.userData={part:'head',component:item.component,cadPath:[787],cadName:item.name,officialSource:'https://www.printables.com/model/1520471'};nut.castShadow=true;nut.receiveShadow=true;added.push(nut);
 }
 for(const item of spec.obsolete){const mesh=meshes.find(m=>m.userData.cadIndex===item.cadIndex);if(!mesh)throw Error('Missing reference cover post');mesh.userData.manualExcluded=true;mesh.userData.revisionReason=item.reason;}
 return added;
}
