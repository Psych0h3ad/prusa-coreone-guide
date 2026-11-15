import * as T from'three';
import{SENSOR_ASSEMBLY as S}from'./sensor-assembly-data.js?v=20261111-94';
export const SIDE_IR_SOURCE_BODY=new T.Matrix4().set(...S.bodyWorld.flat());
// Supported working poses, not OEM fixture coordinates. Full source bodies move.
export const SIDE_IR_HANDLING_PIVOT=new T.Vector3(42.25,19.25,7.5).applyMatrix4(SIDE_IR_SOURCE_BODY);
const flat=new T.Matrix4().set(0,1,0,0,-1,0,0,0,0,0,1,0,0,0,0,1),rotation=flat.clone().multiply(SIDE_IR_SOURCE_BODY.clone().invert());rotation.setPosition(0,0,0);
const q=new T.Quaternion().setFromRotationMatrix(rotation),C=SIDE_IR_HANDLING_PIVOT;
const at=(x,z)=>new T.Matrix4().makeRotationFromQuaternion(q).setPosition(new T.Vector3(x,C.y,z).sub(C.clone().applyQuaternion(q)));
export const SIDE_IR_HOLD_FRAMES=[new T.Matrix4(),new T.Matrix4().makeTranslation(0,0,-22),new T.Matrix4().makeTranslation(35,0,-22),new T.Matrix4().makeTranslation(35,0,-35)];
export function sampleSideIRHandlingFrames(){const rows=[];for(let i=1;i<SIDE_IR_HOLD_FRAMES.length;i++){const a=SIDE_IR_HOLD_FRAMES[i-1],b=SIDE_IR_HOLD_FRAMES[i],qa=new T.Quaternion().setFromRotationMatrix(a),qb=new T.Quaternion().setFromRotationMatrix(b);for(let j=0;j<=16;j++){const u=j/16,q=qa.clone().slerp(qb,u),p=C.clone().applyMatrix4(a).lerp(C.clone().applyMatrix4(b),u).sub(C.clone().applyQuaternion(q));rows.push(new T.Matrix4().makeRotationFromQuaternion(q).setPosition(p));}}return rows;}
