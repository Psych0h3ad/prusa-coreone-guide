import{createGluedContactTurn}from'./glued-contact-turn.js';
import * as THREE from 'three';
import {GLUED_HANDLE_DATUM} from './glued-handle-plan.js';
export {GLUED_HANDLE_DATUM,withGluedInstalledPose,withGluedHandleMotion} from './glued-handle-plan.js';

// Rigid illustration of the glued version: align, counterclockwise turn, press.
// A native bevel/edge reference establishes alignment; rigid closing translation
// reaches adhesive contact during the turn. The press arrows show force without
// translating or deforming the original metal and full-thickness pads.
const d=GLUED_HANDLE_DATUM,finish=new THREE.Vector3(...d.finalOffsetMM);
const ease=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)};
const turn=createGluedContactTurn(d);
const turnEnd=turn(1).delta;
export function gluedHandlePose(phase,t){
 const u=ease(t);let rotation,delta;
 if(phase==='align'){({rotation,delta}=turn(0));delta.addScaledVector(new THREE.Vector3(...d.approachOffsetMM),1-u);}
 else if(phase==='turn')({rotation,delta}=turn(u));
 else{rotation=new THREE.Quaternion();delta=finish.clone();}
 // Scene rest is the installed legacy instance. Convert an absolute measured
 // native-frame pose to a relative rigid motion without changing shared rest.
 const offset=delta.sub(finish.clone().applyQuaternion(rotation)).multiplyScalar(.001);
 return{offset,rotation,pivot:new THREE.Vector3()};
}
