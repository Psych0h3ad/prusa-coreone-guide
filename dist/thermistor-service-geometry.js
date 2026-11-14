// SPDX-License-Identifier: MIT
// Independently authored retaining-screw illustration. The guide specifies one
// retained T6 screw; envelope/thread length are reference estimates, not a new part specification.
import * as T from 'three';
import {ensureHeaterResources,heaterScrewGeometry,HEATER_SCREW_DATUMS} from './heater-service-geometry.js';
export const THERMISTOR_SCREW_REF='thermistorServiceScrew';
export const THERMISTOR_SCREW_DATUM=Object.freeze({bore:[-6.36385244454612,-62.3193409057241,317.000419687306-.401],out:[-.8660254037844393,.4999999999999991,0],sourceBlockFace:30,sourceMinorBoreRadiusMM:1.275,referenceInnerTMM:1.45,referenceLengthMM:4,loosenTravelMM:1.1,guide:'https://help.prusa3d.com/guide/how-to-replace-a-hotend-thermistor-core-one_944854#946886'});
const names=['サーミスター固定ねじ・T6（保持）','Thermistor retaining screw · T6 — retained','Ponechaný šroub termistoru · T6','Thermistor-Halteschraube · T6 — bleibt eingesetzt'];
export function thermistorScrewGeometry(){
 const g=heaterScrewGeometry(0),d=THERMISTOR_SCREW_DATUM;
 g.translate((d.bore[0]-HEATER_SCREW_DATUMS.bore[0])*.001,(d.bore[1]-HEATER_SCREW_DATUMS.bore[1])*.001,(d.bore[2]-HEATER_SCREW_DATUMS.z[0])*.001);g.computeBoundingBox();g.computeBoundingSphere();return g;
}
export function ensureThermistorResources(viewer,text){
 if(viewer.disposed||!viewer.loaded||!viewer.director)throw Error('Thermistor resources require a live loaded viewer');
 const prior=viewer.heaterService142?.thermistorScrew,matching=viewer.meshes.filter(m=>m.userData.maintenanceComponent===THERMISTOR_SCREW_REF);
 if(prior){const shared=ensureHeaterResources(viewer,text,'hotend-thermistor');if(matching.length!==1||matching[0]!==prior.mesh||prior.mesh.geometry!==prior.geometry||prior.mesh.material!==prior.material)throw Error('Thermistor screw resource changed owner');return shared;}
 if(matching.length)throw Error('Thermistor screw reference already owned');
 const shared=ensureHeaterResources(viewer,text,'hotend-thermistor'),geometry=thermistorScrewGeometry(),material=new T.MeshStandardMaterial({color:'#a6abae',metalness:.75,roughness:.32});
 try{const mesh=shared.addOwnedResource(geometry,THERMISTOR_SCREW_REF,names,material,{serviceTask:'hotend-thermistor',source:THERMISTOR_SCREW_DATUM.guide});shared.thermistorScrew={mesh,geometry,material};viewer.director.cache.clear();return shared;}
 catch(error){geometry.dispose();material.dispose();throw error;}
}
