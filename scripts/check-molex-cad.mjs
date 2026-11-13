import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from '../dist/vendor/three.module.js';
import {v}from './check-viewer.mjs';
import {SERVICE_TASKS}from '../dist/maintenance-data.js';
import {installMaintenanceModel}from '../dist/maintenance-model.js';
const molexSpecifier=fs.readFileSync(new URL('../dist/clik-mate-plug.js',import.meta.url),'utf8').match(/from ['"]([^'"]*molex-cad\.js[^'"]*)['"]/)[1];
const {molexCad}=await import(new URL('../dist/'+molexSpecifier,import.meta.url));
import {molexSocketFrame,molexWireEntry}from '../dist/molex-frames.js';
import {SOCKETS,LOVEBOARD}from '../dist/loveboard-layout.js';
installMaintenanceModel(v,SERVICE_TASKS,a=>a[0]);
let maxMatingErrorMM=0,maxNormalError=0;const cases=[],triangle=new T.Triangle(),nearest=new T.Vector3();
for(const [socket,id]of [['J4','lbMotorLead'],['J14','lbLoadcellLead'],['J2','lbFilamentLead'],['J12','lbNtcLead'],['J5','servicePrintLead'],['J6','serviceHotendFanLead'],['J1','hotendThermistor0']]){
 const s=SOCKETS[socket],e=v.fasteners.entities.get(id);e.update(1,1,1);
 let caseError=0;const cad=molexCad('5025780'+s.pins+'00'),skin=(e.clikMate||e.plug.clikMate).releaseSkin,p=e.geometry.attributes.position,start=p.count-skin.positions.length/3,frame=molexSocketFrame(socket).invert(),point=new T.Vector3();
 assert(skin.parentFaces.length*9===skin.positions.length,'every retessellated triangle has a source face');
 for(let i=0;i<skin.positions.length/3;i++){
  point.fromBufferAttribute(p,start+i).multiplyScalar(1000).applyMatrix4(frame);
  const source=skin.parentFaces[Math.floor(i/3)]*9;triangle.a.fromArray(cad.positions,source);triangle.b.fromArray(cad.positions,source+3);triangle.c.fromArray(cad.positions,source+6);
  triangle.closestPointToPoint(point,nearest);caseError=Math.max(caseError,point.distanceTo(nearest));maxMatingErrorMM=Math.max(maxMatingErrorMM,caseError);
 }
 // Both complete authored material batches are registered to the board.
 const headers=v.meshes.filter(m=>m.userData.connector===socket);assert.equal(headers.length,2);
 assert(headers.every(m=>m.userData.manufacturerPart===s.manufacturerPart&&m.userData.illustration&&m.userData.manufacturerCAD===false&&m.userData.geometryOrigin==='independently-authored-analytic'));
 for(const h of headers){const n=h.geometry.attributes.normal;for(let i=0;i<n.count;i++)maxNormalError=Math.max(maxNormalError,Math.abs(point.fromBufferAttribute(n,i).length()-1));}
 const native=molexCad(s.manufacturerPart),contact=s.out[1]?new T.Vector3(0,9.7,0):new T.Vector3(0,0,-.29);
 contact.applyMatrix4(molexSocketFrame(socket));assert(Math.abs(contact.y-LOVEBOARD.datumCAD[1])<1e-10,'PCB contact plane matches board face');
 assert.equal(native.manufacturerCAD,false);assert.equal(native.sourceFacesCopied,0);assert.equal(native.packagingTapeModelled,false,'reference parts contain no shipping tape');
 const tail=e.curve.getPointAt(1).multiplyScalar(id.startsWith('lb')?1:1000);
 if(socket==='J1')tail.add(v.fasteners.entities.get('hotendThermistor1').curve.getPointAt(1).multiplyScalar(1000)).multiplyScalar(.5);
 assert(tail.distanceTo(molexWireEntry(socket))<.0001,socket+' wire exits registered to the retained reference entry row');
 cases.push({socket,caseError,plug:'5025780'+s.pins+'00',header:s.manufacturerPart});
}
assert(maxMatingErrorMM<.01,'Every retessellated plug vertex remains on its authored source surface in the mating frame');
assert(maxNormalError<.000001,'Analytic CAD normals remain unit length');
console.log(JSON.stringify({status:'PASS',cases,maxMatingErrorMM,maxNormalError,scope:'Actual loaded simulator meshes, seven single-row ports, retessellated vertex-to-parent-triangle registration, wire exits, board mounting planes, authored provenance and normals. Does not certify collision-free motion.'}));

