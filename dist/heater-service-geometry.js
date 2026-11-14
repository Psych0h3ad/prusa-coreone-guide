// SPDX-License-Identifier: MIT
// Independently authored M3x4/T6 display geometry; not a manufacturing model.
// Nominal M3x4bT/T6: Prusa guide 944862 steps 11–13. Bore datums are measured
// from the existing OCL community heater block, not supplier fastener CAD.
import * as T from 'three';
import {PARTS} from './data.js?v=20261112-113';
import {HOTEND_CORE_SOURCE as SOURCE} from './heater-service-cad-data.js';
export const HEATER_REFS=Object.freeze({heater:'heaterServiceCartridge',thermistor:'heaterServiceThermistor',block:'heaterServiceBlock',original:'heaterServiceSourceBatch',screws:['heaterServiceScrew1','heaterServiceScrew2']});
export const HEATER_SCREW_DATUMS=Object.freeze({out:[-.8660254037844393,.4999999999999991,0],bore:[-9.0096037556107,-66.90191660068],z:[314.750419687306-.401,319.250419687306-.401],innerT:1.45,length:4,blockSurfaceT:5.5,minorBoreRadius:1.275,sourceFaces:[31,32]});
const names={heater:['ホットエンドヒーター','Hotend heater','Topení hotendu','Hotend-Heizpatrone'],thermistor:['ノズル側サーミスター（保持）','Nozzle thermistor — retained','Termistor trysky — ponechaný','Düsenthermistor — bleibt montiert'],screw1:['ヒーター固定ねじ①・M3×4bT／T6','Heater screw 1 · M3×4bT / T6','Šroub topení 1 · M3×4bT / T6','Heizungsschraube 1 · M3×4bT / T6'],screw2:['ヒーター固定ねじ②・M3×4bT／T6','Heater screw 2 · M3×4bT / T6','Šroub topení 2 · M3×4bT / T6','Heizungsschraube 2 · M3×4bT / T6']};
const fnv=a=>{let h=2166136261;for(const x of new Uint8Array(a.buffer,a.byteOffset,a.byteLength))h=Math.imul(h^x,16777619)>>>0;return h;};
const V=(r,a,z)=>[r*Math.cos(a),r*Math.sin(a),z];
export function heaterScrewGeometry(index){
 const positions=[],tri=(a,b,c)=>positions.push(...a,...b,...c),N=72,Z=80;
 const radius=(a,z)=>{const phase=((z/.5-a/(2*Math.PI))%1+1)%1;return Math.min(1.2+.3*(1-Math.abs(2*phase-1)),z<.25?1.05+z*1.8:z>3.75?1.5-(z-3.75)*.6:1.5);};
 for(let j=0;j<Z;j++)for(let i=0;i<N;i++){const a=i/N*2*Math.PI,b=(i+1)/N*2*Math.PI,z=j/Z*4,w=(j+1)/Z*4,A=V(radius(a,z),a,z),B=V(radius(b,z),b,z),C=V(radius(b,w),b,w),D=V(radius(a,w),a,w);tri(A,B,C);tri(A,C,D);}
 const hole=a=>.71+.12*Math.cos(6*a);
 for(let i=0;i<N;i++){
  const a=i/N*2*Math.PI,b=(i+1)/N*2*Math.PI;
  tri([0,0,0],V(radius(b,0),b,0),V(radius(a,0),a,0));
  const A=V(radius(a,4),a,4),B=V(radius(b,4),b,4),C=V(hole(b),b,4),D=V(hole(a),a,4);tri(A,B,C);tri(A,C,D);
  const E=V(hole(a),a,3.35),F=V(hole(b),b,3.35);tri(D,C,F);tri(D,F,E);tri([0,0,3.35],E,F);
 }
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.computeVertexNormals();
 const u=new T.Vector3(...HEATER_SCREW_DATUMS.out),q=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,0,1),u),p=new T.Vector3(HEATER_SCREW_DATUMS.bore[0],HEATER_SCREW_DATUMS.bore[1],HEATER_SCREW_DATUMS.z[index]).addScaledVector(u,HEATER_SCREW_DATUMS.innerT);
 g.applyQuaternion(q);g.translate(p.x,p.y,p.z);g.scale(.001,.001,.001);g.computeBoundingBox();g.computeBoundingSphere();return g;
}
export function ensureHeaterResources(viewer,text,context='hotend-heater'){
 if(viewer.heaterService142){const a=viewer.heaterService142;if(a.retired||viewer.disposed||!viewer.loaded||!viewer.director||a.original.userData.component!==HEATER_REFS.original||a.block.userData.component!==HEATER_REFS.block||a.original.geometry!==a.sourceGeometry||a.block.geometry!==a.blockGeometry)throw Error('Heater source ownership changed');a.localize(context);return a;}
 if(viewer.disposed||!viewer.loaded||!viewer.director)throw Error('Heater model requires a live loaded viewer');
 const count=SOURCE.parts.reduce((n,p)=>n+p.vertices,0),matches=viewer.meshes.filter(m=>m.userData.maintenanceComponent==='serviceBlock'&&!m.geometry.index&&m.geometry.attributes.position.count===count),blocks=viewer.meshes.filter(m=>m.userData.maintenanceComponent==='serviceBlock'&&!matches.includes(m));
 if(matches.length!==1||blocks.length!==1)throw Error('Heater/block source binding mismatch');
 const original=matches[0],block=blocks[0];
 for(const[k,s]of Object.entries(SOURCE.combined)){const a=original.geometry.attributes[k];if(!a||a.array.length!==s.length||fnv(a.array)!==s.fnv1a32)throw Error('Heater original buffer mismatch: '+k);}
 // Preflight every borrowed identity before mutating metadata or allocating clones.
 for(const m of[original,block])if(Object.hasOwn(m.userData,'component'))throw Error('Heater source component already owned');
 let retired=false,resourceContext=context;const owned=[],geometries=new Set(),materials=new Set();
 const add=(g,ref,label,material,options={})=>{const m=new T.Mesh(g,material);m.userData={part:'heaterServiceParts',maintenanceComponent:ref,serviceTask:options.serviceTask??'hotend-heater',toolOnly:true,supplement:true,officialCad:false,geometryOrigin:ref.includes('Screw')?'independently-authored-analytic':'existing-community-model',source:options.source??(ref.includes('Screw')?'https://help.prusa3d.com/guide/how-to-replace-a-hotend-heater-core-one_944862':SOURCE.source),heaterServiceNames:label,cadName:text(label),restPosition:m.position.clone(),restQuaternion:m.quaternion.clone()};viewer.group('heaterServiceParts').add(m);viewer.meshes.push(m);viewer.records.push({key:'heaterServiceParts',name:m.userData.cadName,mesh:m,id:m.uuid});owned.push(m);geometries.add(g);materials.add(material);return m;};
 let start=0;for(const[i,role]of['heater','thermistor'].entries()){
  const part=SOURCE.parts[i],g=new T.BufferGeometry();for(const[k,a]of Object.entries(original.geometry.attributes))g.setAttribute(k,new T.BufferAttribute(a.array.slice(start*a.itemSize,(start+part.vertices)*a.itemSize),a.itemSize,a.normalized));g.computeBoundingBox();g.computeBoundingSphere();start+=part.vertices;
  const finish=original.material.clone();finish.color.set(role==='heater'?'#adb2b5':'#b9bec0');finish.metalness=.75;finish.roughness=.32;finish.userData.originalColor=finish.color.clone();
  const m=add(g,HEATER_REFS[role],names[role],finish);m.userData.sourceFile='assets/hotend/'+part.file;m.userData.sourceMeshUUID=original.uuid;
 }
 for(let i=0;i<2;i++)add(heaterScrewGeometry(i),HEATER_REFS.screws[i],names['screw'+(i+1)],new T.MeshStandardMaterial({color:'#a6abae',metalness:.75,roughness:.32}));
 original.userData.component=HEATER_REFS.original;block.userData.component=HEATER_REFS.block;
 PARTS.heaterServiceParts??={name:text(['ヒーター交換部品','Heater replacement parts','Díly pro výměnu topení','Heizungsersatzteile']),en:'Heater replacement parts',desc:text(['標準ホットエンド用の参考表示。','Reference display for the standard hotend.','Referenční zobrazení standardního hotendu.','Referenzdarstellung des Standard-Hotends.']),icon:'extruder',offset:[0,0,0]};
 const api={original,block,owned,addOwnedResource(g,ref,label,material,options={}){if(retired||viewer.disposed||!viewer.loaded||!viewer.director)throw Error('Hotend resource owner is retired');if(viewer.meshes.some(m=>m.userData.maintenanceComponent===ref))throw Error('Hotend resource reference already owned');return add(g,ref,label,material,options);},sourceGeometry:original.geometry,blockGeometry:block.geometry,source:SOURCE,get retired(){return retired;},localize(context){if(retired)return;if(context!==undefined)resourceContext=context;const replacingThermistor=resourceContext==='hotend-thermistor';PARTS.heaterServiceParts.name=text(replacingThermistor?['サーミスター交換部品','Thermistor replacement parts','Díly pro výměnu termistoru','Thermistor-Ersatzteile']:['ヒーター交換部品','Heater replacement parts','Díly pro výměnu topení','Heizungsersatzteile']);for(const m of owned){m.userData.cadName=text(replacingThermistor&&m.userData.maintenanceComponent===HEATER_REFS.thermistor?['ノズル側サーミスター','Nozzle thermistor','Termistor trysky','Düsenthermistor']:m.userData.heaterServiceNames);const r=viewer.records.find(r=>r.mesh===m);if(r)r.name=m.userData.cadName;}},retire(){if(retired)return;retired=true;
   const nativeDisposed=viewer.disposed,ownedGeometries=[...geometries],ownedMaterials=[...materials];
   if(viewer.heaterService142===api)delete viewer.heaterService142;
   if(viewer.dispose===disposeWrapper)viewer.dispose=dispose;
   for(const[m,ref]of[[original,HEATER_REFS.original],[block,HEATER_REFS.block]])if(m.userData.component===ref)delete m.userData.component;
   for(const m of owned){m.parent?.remove(m);if(Array.isArray(viewer.meshes)){const at=viewer.meshes.indexOf(m);if(at>=0)viewer.meshes.splice(at,1);}if(Array.isArray(viewer.records))for(let i=viewer.records.length-1;i>=0;i--)if(viewer.records[i].mesh===m)viewer.records.splice(i,1);}
   // Return hooks, metadata and arrays before notifications; never dispose a
   // later owner's resources or dispose the already-retired native graph again.
   geometries.clear();materials.clear();
   if(!nativeDisposed){for(const g of ownedGeometries)g.dispose();for(const m of ownedMaterials)m.dispose();}
 }};
 viewer.heaterService142=api;viewer.director.cache.clear();api.localize(context);
 const dispose=viewer.dispose,disposeWrapper=function(...args){api.retire();return dispose.apply(this,args);};viewer.dispose=disposeWrapper;return api;
}
export function localizeHeaterResources(viewer){viewer.heaterService142?.localize();}
