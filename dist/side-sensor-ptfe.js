import * as T from 'three';
import {TubeSurface} from './ptfe-surface.js?v=20261111-94';
import {SHORT_INPUT_PTFE as d} from './side-sensor-ptfe-data.js';

// Analytic hollow stock; source dimensions are official. Placement is a bounded
// reference in the existing native assembly, not a manufacturer BREP/stop datum.
export function createSideSensorInputPtfe(){
 const surface=new TubeSurface(1,64),points=new Float32Array([...d.innerEndCADMM,...d.freeTipCADMM]);
 const geometry=surface.update(points),material=new T.MeshStandardMaterial({color:'#e5e7dd',roughness:.55,metalness:0,envMapIntensity:.5});
 material.userData.originalColor=material.color.clone();material.userData.originalOpacity=1;
 const mesh=new T.Mesh(geometry,material);mesh.castShadow=true;mesh.receiveShadow=true;
 mesh.userData={part:d.id,cadName:'PTFE input tube — 45mm',supplement:true,authoredReference:true,manufacturerCAD:false,preserveColours:true,stock:{lengthMM:45,outerDiameterMM:4,innerDiameterMM:2.5},sourceReference:{nativeHandle:75,leaf:76},officialSource:d.source,sourceLines:d.stockLines,referenceEngagementMM:d.referenceEngagementMM,placementQualification:d.placementQualification,freeTipCADMM:[...d.freeTipCADMM]};
 return mesh;
}
