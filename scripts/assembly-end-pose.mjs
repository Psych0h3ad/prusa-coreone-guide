import {rigidMotion} from '../dist/assembly-director.js';
import {X_PULLEY_SETUP} from '../dist/x-pulley-setup.js?v=20261111-94';
import {PULLEY_SETUP} from '../dist/pulley-setup.js?v=20261111-94';

// Independent test expectation for the composed final pose. The production
// post-actor pulley hook retains tightened screws at their shaft seats.
// Every CAD node is still checked with the original strict tolerances.
export function expectedAssemblyEndPose(viewer,actor,mesh){
 const end=rigidMotion(actor,1),start=mesh.userData.sceneRestPosition||mesh.userData.restPosition,q=mesh.userData.sceneRestQuaternion||mesh.userData.restQuaternion;
 const generic={position:start.clone().sub(end.pivot).applyQuaternion(end.rotation).add(end.pivot).add(end.offset),quaternion:end.rotation.clone().multiply(q),basis:'generic actor final transform'};
 const id=mesh.userData.cadIndex;
 const spec=id===394||id===395?{motor:387,step:42,seat:id===394?X_PULLEY_SETUP.firstSeat:X_PULLEY_SETUP.secondSeat}:id===390||id===391?{motor:567,step:43,seat:id===390?PULLEY_SETUP.firstSeat:PULLEY_SETUP.secondSeat}:null;
 if(!spec)return generic;
 const scene=viewer.operationScene,plan=scene?.plan;
 const fitted=scene?.full||viewer.state?.flow==='upgrade'||plan?.chapter>5||plan?.chapter===5&&plan.step>=spec.step;
 if(!fitted)return generic;
 const motor=viewer.meshes.find(m=>m.userData.cadIndex===spec.motor);
 if(!motor)throw Error('Missing pulley source motor '+spec.motor);
 const relative=motor.quaternion.clone().multiply(motor.userData.restQuaternion.clone().invert());
 const seat=mesh.position.clone().set(...spec.seat).multiplyScalar(.001);
 return{position:mesh.userData.restPosition.clone().add(seat).sub(motor.userData.restPosition).applyQuaternion(relative).add(motor.position),quaternion:relative.multiply(mesh.userData.restQuaternion),basis:'source screw seat carried by fitted motor',sourceMotor:spec.motor,seatMM:spec.seat};
}
