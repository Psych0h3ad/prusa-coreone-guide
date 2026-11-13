import * as T from 'three';
import {smoothCreases} from './surface-geometry.js?v=20261111-94';
import {BEDSTOP_REAR_SEAT} from './bedstop-data.js?v=20261111-94';

// Reuse the two original nuts; clone native DIN 562 geometry for the third slot.
export function createBedstopHardware(meshes){
 const body=meshes.find(m=>m.userData.cadIndex===385);
 const source=meshes.find(m=>m.userData.cadIndex===555);
 if(!body||!source)throw Error('Rear bed-stop hardware is missing');
 body.updateMatrix();source.updateMatrix();
 const geometry=source.geometry.clone();
 geometry.applyMatrix4(body.matrix.clone().invert().multiply(source.matrix));
 geometry.computeBoundingBox();const center=geometry.boundingBox.getCenter(new T.Vector3());
 geometry.translate(-center.x,-center.y,-center.z);smoothCreases(geometry);
 const local=new T.Matrix4().makeTranslation(0,Math.fround(.0005),Math.fround(.0252))
  .multiply(new T.Matrix4().makeRotationX(Math.PI/2));
 const material=(Array.isArray(source.material)?source.material[0]:source.material).clone();
 const mesh=new T.Mesh(geometry,material);
 body.matrix.clone().multiply(local).decompose(mesh.position,mesh.quaternion,mesh.scale);
 mesh.userData={part:'xy',component:'bedStopNutCenter',cadName:'M3nS',preserveCadName:true,
  nativeGeometrySource:555,placementSource:'rear-bed-stop-transverse-slot'};
 mesh.castShadow=true;mesh.receiveShadow=true;
 const screwSource=meshes.find(m=>m.userData.cadIndex===544);
 if(!screwSource)throw Error('M3x8rT source is missing');
 screwSource.updateMatrix();const datum=screwSource.position.clone();datum.z-=.00165;
 const screwGeometry=screwSource.geometry.clone();
 screwGeometry.applyMatrix4(new T.Matrix4().makeTranslation(-datum.x,-datum.y,-datum.z).multiply(screwSource.matrix));
 smoothCreases(screwGeometry);
 const screwMaterial=(Array.isArray(screwSource.material)?screwSource.material[0]:screwSource.material).clone();
 const screw=new T.Mesh(screwGeometry,screwMaterial);
 screw.position.fromArray(BEDSTOP_REAR_SEAT).multiplyScalar(.001);screw.rotation.x=-Math.PI/2;
 screw.userData={part:'xy',component:'bedStopRearScrew',cadName:'M3x8rT',preserveCadName:true,
  nativeGeometrySource:544,placementSource:'rear-panel-oval-hole-and-bed-stop-nut'};
 screw.castShadow=true;screw.receiveShadow=true;return [mesh,screw];
}
