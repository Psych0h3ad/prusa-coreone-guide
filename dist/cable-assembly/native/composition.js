import*as T from'three';
import{createNativeLcdPacket,describeComponent13Replacement}from'./packet/native-packet.js';
import{entryPacketPose}from'../route/packet-pose.js';
import{joinNativeSource}from'./join.js';
// The plug consumes the OLD material-frame delta: the calibrated native exit
// already includes the local translation. Using joined frame delta would apply
// the correction twice. Stationary socket is owned by the retained consumer.
export async function createNativeJoinConsumer({root,parent=root,source,packetOptions={}}){
 const packet=await createNativeLcdPacket({root,parent,...packetOptions});let active=true;
 return{packet,apply(baseModel,joinOptions){if(!active)throw Error('Native join consumer disposed');const model=joinNativeSource(baseModel,joinOptions),pose=entryPacketPose(source,baseModel);packet.apply(pose);const exit=new T.Vector3(...packet.calibration.cableExit.rootCentreMM).applyMatrix4(new T.Matrix4().fromArray(pose.freeSource.rootDeltaFromSeatedMM)),error=exit.distanceTo(model.frames[0].centre);if(error>1e-8)throw Error('Native/root material join calibration mismatch '+error);return{model,pose,estimatedExitMM:exit.toArray(),joinResidualMM:error};},restore(){if(active)packet.restore();},dispose(){if(!active)return;active=false;packet.dispose();}};
}
export function replaceComponent13({root,meshes,boundsMM}){
 const proposal=describeComponent13Replacement({printer:root,meshes},{boundsMM});if(!proposal.complete||proposal.triangleCount!==12)throw Error('Exact original component13 twelve-triangle provenance is required');
 const changes=[];let active=true;try{for(const r of proposal.rows){if(r.mesh.geometry!==r.geometryReference)throw Error('Component13 geometry ownership changed');const g=r.geometryReference,ix=g.index,remove=new Set(r.triangleIndices),indices=[];for(let i=0;i<(ix?.count??g.attributes.position.count);i+=3)if(!remove.has(i/3))for(let k=0;k<3;k++)indices.push(ix?ix.getX(i+k):i+k);const replacement=g.clone();replacement.setIndex(indices);replacement.setDrawRange(0,indices.length);r.mesh.geometry=replacement;changes.push({...r,replacement,retainedTriangles:indices.length/3});}}catch(e){for(const r of changes){r.mesh.geometry=r.geometryReference;r.replacement.dispose();}throw e;}
 return{proposal,changes,get active(){return active;},restore(){if(!active)return;for(const r of changes)if(r.mesh.geometry!==r.replacement)throw Error('Later component13 geometry owner must retire before restoration');for(const r of changes){r.mesh.geometry=r.geometryReference;r.replacement.dispose();}active=false;},dispose(){this.restore();},scope:'Only proposed12 illustration triangles via cloned index buffers. Other PCB/photo/native geometry/visibility remain; original geometry references restore exactly.'};
}
