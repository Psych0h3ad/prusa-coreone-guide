import * as T from 'three';
import {FLOWS} from './data.js?v=20261112-113';
// During the source-marked handover, the carrier/packet is disconnected from
// the box. Its staging translation is a rigid handover, not extra wire stock.
const selected=v=>v.operationScene?.plan.detachedBedPacket===true&&!v.operationScene.full;
function toPrinter(v,node){const m=new T.Matrix4();for(;node&&node!==v.printer;node=node.parent){if(node.matrixAutoUpdate)node.updateMatrix();m.premultiply(node.matrix);}if(node!==v.printer)throw Error('Detached bed must remain in printer hierarchy');return m;}
function authored(v,bed){return toPrinter(v,bed.parent).multiply(new T.Matrix4().compose(bed.userData.sceneRestPosition,bed.userData.sceneRestQuaternion,bed.scale));}
export function detachedBedDatum(v,bed,box){
 if(!selected(v))return null;
 if(!bed.geometry.boundingBox)bed.geometry.computeBoundingBox();
 box.copy(bed.geometry.boundingBox).applyMatrix4(authored(v,bed));
 return box.max.z*1000+(205.2-204.59941577673532);
}
export function followDetachedBedPacket(v){
 if(!selected(v))return;
 const bed=v.meshes.find(m=>m.userData.cadIndex===659),now=toPrinter(v,bed),sourceFrame=authored(v,bed);
 // This source primitive translates the complete carrier along its insertion
 // axis. Copy its authored linear frame; do not manufacture tiny rotations by
 // multiplying a matrix by a numerically computed inverse of that same frame.
 for(const i of[0,1,2,3,4,5,6,7,8,9,10,11,15])if(!Object.is(now.elements[i],sourceFrame.elements[i]))throw Error('Detached bed packet requires its audited translation-only carrier primitive');
 const delta=new T.Matrix4().makeTranslation(now.elements[12]-sourceFrame.elements[12],now.elements[13]-sourceFrame.elements[13],now.elements[14]-sourceFrame.elements[14]);
 const skins=['bedWire','rgbWire','bedNtcAssembly','xbBedMinus','xbBedPlus'];
 const lugNames=['xbBedMinusLug','xbBedPlusLug','xbBedMinusFixedLug','xbBedPlusFixedLug'];
 for(const mesh of v.meshes){
  const skin=skins.includes(mesh.userData.flexId),lug=lugNames.includes(mesh.userData.component);if(!skin&&!lug)continue;
  const parent=toPrinter(v,mesh.parent),source=skin?new T.Matrix4().compose(mesh.userData.restPosition,mesh.userData.restQuaternion,mesh.scale):mesh.matrix.clone();
  if(lug){mesh.updateMatrix();source.copy(mesh.matrix);}
  parent.clone().invert().multiply(delta).multiply(parent).multiply(source).decompose(mesh.position,mesh.quaternion,mesh.scale);
 }
 const plan=v.operationScene.plan,step=FLOWS[v.state?.flow]?.steps[v.state?.index];
 v.originalBedTransferReceipt={sourceStepID:plan.originalSource?.stepID??plan.sourceStepID??step?.officialId,programStepID:plan.programOfficialId??step?.programOfficialId??step?.officialId,connectedToBox:false,rigidDelta:delta.elements.slice(),stockUnchanged:true};
}
