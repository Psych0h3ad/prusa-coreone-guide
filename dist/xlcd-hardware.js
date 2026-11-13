import * as THREE from 'three';
import {STLLoader} from './vendor/STLLoader.js';
import {smoothCreases} from './surface-geometry.js?v=20261111-94';
import {FINISHES} from './cad-finishes.js?v=20261111-94';

// The Faston plate is between the printed mount and the fourth screw head.
// Its mounting hole is registered to that screw, with its blade facing inward.
export async function createXlcdHardware(sourceMeshes){
 const response=await fetch('./assets/xlcd/manifest.json');if(!response.ok)throw Error('xLCD hardware could not be loaded');
 const spec=await response.json(),screw=sourceMeshes.find(m=>m.userData.cadIndex===607);
 if(!screw)throw Error('Missing xLCD ground screw in source CAD');
 let geometry=await new STLLoader().loadAsync('./assets/xlcd/'+spec.file);
 geometry.scale(.001,.001,.001);const original=geometry;geometry=smoothCreases(original);if(geometry!==original)original.dispose();
 const material=new THREE.MeshStandardMaterial(FINISHES.brass),mesh=new THREE.Mesh(geometry,material);
 const matrix=new THREE.Matrix4().set(...spec.placement.flat());for(const i of [12,13,14])matrix.elements[i]*=.001;
 matrix.decompose(mesh.position,mesh.quaternion,mesh.scale);
 mesh.userData={part:'lcdFaston',cadName:'xLCD FE Faston 6.3 × 0.8',officialSource:spec.source,sourcePart:spec.sourcePart};
 material.userData.finish='brass';mesh.castShadow=true;mesh.receiveShadow=true;
 if(!screw.userData.fastonPlateOffset){
  screw.position.add(new THREE.Vector3(...spec.screwAxis).multiplyScalar(-spec.plateThickness*.001));
  screw.userData.fastonPlateOffset=spec.plateThickness;
 }
 return [mesh];
}
