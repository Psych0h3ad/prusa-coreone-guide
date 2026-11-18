import * as T from 'three';
import {SIDE_PTFE_SEATS} from './side-ptfe-seats.js';
import {reconstructSidePtfeTail} from './side-ptfe-tail.js';
// The side inlet remains installed during Nextruder work even in a close-up.
// Use its actual installed source frame, never renderer visibility or a pose
// left by the preceding assembly step, to obtain the existing complete stock.
export function prepareFilamentInletReference(viewer){
 const e=viewer.fasteners.entities.get('ptfeTube'),api=viewer.sidePtfeCompletion;
 if(!e||!api?.active||api.tube!==e||api.tubeGeometry!==e.geometry)throw Error('Current native PTFE source owner required');
 const part=viewer.state?.edition==='original2251'?'sensorOld':'sensorBody',body=[...api.baseMatrices.keys()].find(m=>m.userData.part===part&&api.baseGeometries.get(m)===m.geometry);
 if(!body||!body.userData.restPosition||!body.userData.restQuaternion)throw Error('Installed side inlet source frame unavailable');
 const rest=new T.Matrix4().compose(body.userData.restPosition,body.userData.restQuaternion,body.userData.restScale||body.scale),delta=rest.multiply(api.baseMatrices.get(body).clone().invert()),colletMatrix=delta.clone();for(const i of[12,13,14])delta.elements[i]*=1000;
 const source=e.sample(5,1,new Float32Array(e.stride)),result=reconstructSidePtfeTail(source,SIDE_PTFE_SEATS.long,{transformPoint:p=>new T.Vector3(...p).applyMatrix4(delta).toArray()});
 if(!result.ok||result.points.length!==source.length)throw Error('Installed PTFE source construction failed: '+JSON.stringify({...result,points:undefined}));
 e.filamentInletReference={points:result.points.slice(),sourceBody:body,sourceGeometry:body.geometry,sourceMatrix:delta.toArray(),follow(){if(api.baseGeometries.get(body)!==body.geometry||!api.active||api.tube!==e)throw Error('Installed inlet source epoch changed');colletMatrix.decompose(api.meshes[1].position,api.meshes[1].quaternion,api.meshes[1].scale);api.meshes[1].updateMatrixWorld(true);},nominalStockMM:710,joinPortCADMM:[...SIDE_PTFE_SEATS.long.mouthCADMM]};
 return e.filamentInletReference;
}
