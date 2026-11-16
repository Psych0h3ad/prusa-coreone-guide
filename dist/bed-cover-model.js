import * as T from 'three';
import {BED_COVER_DATA as D} from './bed-cover-data.js';
export function registerBedCoverPoses(meshes){
 const targets=D.registrations.map(r=>({r,m:meshes.find(m=>m.userData.cadIndex===r.cadIndex)}));
 if(targets.every(({m})=>m?.userData.bedCoverRegistered))return;
 for(const {r,m}of targets){if(!m||m.userData.bedCoverRegistered)throw Error('Complete unregistered bed-cover nut source required');const g=m.geometry;if((g.index?.count??g.attributes.position.count)/3!==r.sourceFaces)throw Error('Whole plain nut source changed');if(!m.position.toArray().every((v,i)=>Math.abs(v-r.expectedPositionMetres[i])<1e-10)||!m.quaternion.toArray().every((v,i)=>Math.abs(v-r.expectedQuaternion[i])<1e-10))throw Error('Bed-cover source pose changed');}
 const screw=meshes.find(m=>m.userData.cadIndex===D.screw);if(!screw?.userData.surfaceSource||(screw.geometry.index?.count??screw.geometry.attributes.position.count)/3!==48344)throw Error('Complete M3x10rT source replacement required');
 for(const {r,m}of targets){m.userData.bedCoverRegistered={sourcePosition:m.position.toArray(),sourceQuaternion:m.quaternion.toArray(),basis:r.basis};m.position.fromArray(r.positionMM).multiplyScalar(.001);m.quaternion.fromArray(r.quaternion).normalize();}
 screw.userData.sourceCadName??=screw.userData.cadName;screw.userData.cadName='M3x10rT';screw.userData.bedCoverRetainerStock='M3x10rT';
}
