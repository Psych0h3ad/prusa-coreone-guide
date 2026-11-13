import * as THREE from 'three';
import {CONTACT_SUPPORT as support} from './glued-contact-datums.js';

// Runtime-only Three callback. Pure startup plans need only gluedPhase/datums.
// u is the existing550 smoothstep output, not a new actor clock or body pose.
export function createGluedContactTurn(d){
 const finish=new THREE.Vector3(...d.finalOffsetMM),zAxis=new THREE.Vector3(0,0,1),front=new THREE.Vector3(...support.frontCorner),rear=new THREE.Vector3(...support.rearCorner),split=support.transferFraction;
 function reference(u){const rotation=new THREE.Quaternion().setFromAxisAngle(zAxis,-Math.PI/4*(1-u));const p=new THREE.Vector3(d.startContact[0],d.startContact[1],0).lerp(new THREE.Vector3(d.endContact[0],d.endContact[1],0),u).applyQuaternion(rotation);return{rotation,delta:new THREE.Vector3(d.panelRightX-p.x,d.contactY-p.y,d.finalOffsetMM[2])};}
 function envelope(rotation,u){
  const referenceRear=rear.clone().addScaledVector(new THREE.Vector3(0,1,0),support.sourceCoordinateULPMM*support.rearReferenceULPs*4*u*(1-u));
  const nf=new THREE.Vector3(...support.frontPlane.normal).applyQuaternion(rotation),nb=new THREE.Vector3(...support.lowerPadFreePlane.normal).applyQuaternion(rotation),a=nf.dot(front)-support.frontPlane.constant,b=nb.dot(referenceRear)-support.lowerPadFreePlane.constant,det=nf.x*nb.y-nf.y*nb.x;
  return{nf,nb,a,b,x:(a*nb.y-nf.y*b)/det,y:(nf.x*b-a*nb.x)/det};
 }
 const start=reference(0),at0=envelope(start.rotation,0),at1=envelope(new THREE.Quaternion(),1),startOpening=start.delta.x-at0.x,endOpening=finish.x-at1.x;
 if(startOpening<0||endOpening<0)throw Error('Source endpoint is outside the measured contact corridor');
 return function turn(u){
  if(u<=0)return reference(0);
  const rotation=new THREE.Quaternion().setFromAxisAngle(zAxis,-Math.PI/4*(1-u));
  if(u>=1)return{rotation,delta:finish.clone()};
  const s=envelope(rotation,u),frontPhase=u<=split,amount=frontPhase?(split-u)/split:(u-split)/(1-split),opening=(frontPhase?startOpening:endOpening)*amount*amount,x=s.x+opening;
  // Both support constraints meet at split. Quadratic opening has zero first
  // derivative there, giving a C1 transition between contact envelopes.
  const y=frontPhase?(s.a-s.nf.x*x)/s.nf.y:(s.b-s.nb.x*x)/s.nb.y;
  return{rotation,delta:new THREE.Vector3(x,y,finish.z)};
 };
}
