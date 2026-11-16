import * as T from'three';
import{TENSIONER_INSTALLATION_DATA as D}from'./tensioner-installation-source.js';
// Ordinary full-viewer resources, with one supplied key in exclusive workpiece poses.
export function createTensionerInstallationTools(viewer){
 const template=viewer.meshes.find(m=>m.userData.component==='originalAllenLeft30');if(!template)throw Error('Complete nominal2.5mm key dependency required');const meshes=[];
 try{for(const[id,f]of Object.entries(D.screws))for(const pose of(+id===444?[0,1]:[0])){
  const source=viewer.meshes.find(m=>m.userData.cadIndex===+id);if(!source)throw Error('Whole native mounting screw missing '+id);source.updateMatrix();
  const point=new T.Vector3((f.headLocalMM+f.engagementMM)*.001,0,0).applyMatrix4(source.matrix),basis=new T.Matrix4().makeBasis(new T.Vector3(0,1,0),new T.Vector3(1,0,0),new T.Vector3(0,0,-1));
  const key=new T.Mesh(template.geometry,template.material.clone());key.position.copy(point);key.quaternion.copy(source.quaternion).normalize().multiply(new T.Quaternion().setFromRotationMatrix(basis));if(pose)key.quaternion.premultiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(...f.axis),-Math.PI));key.userData={part:'xy',component:'tensionerMountAllen'+id+(+id===444?'pose'+pose:''),componentOnly:true,toolOnly:true,preserveCadName:true,cadName:'2.5 mm Allen key',assemblyPrimitive:'tensioner-frame-installation',reference:true,sourceScrewCAD:+id,sourceSocketEngagementMM:f.engagementMM,stockRepresentation:'One supplied2.5mm key in exclusive installation workpiece poses; no extra tool stock.',geometryQualification:D.qualification};meshes.push(key);
 }return meshes;}catch(error){for(const m of meshes)m.material.dispose();throw error;}
}
