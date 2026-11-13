import*as T from'three';
export const rootFromExitMM=f=>new T.Matrix4().makeBasis(f.axis,f.normal,f.tangent).setPosition(f.centre);
export function entryPacketPose(source,model){
 const part=(index,name)=>{const f=model.frames[index],seated=source.frames[index],matrix=rootFromExitMM(f),delta=matrix.clone().multiply(rootFromExitMM(seated).invert());return{name,materialRing:index,rootFromMaterialExitMM:matrix.toArray(),rootDeltaFromSeatedMM:delta.toArray(),positionMM:f.centre.toArray(),widthAxis:f.axis.toArray(),normalAxis:f.normal.toArray(),longitudinalAxis:f.tangent.toArray()};};
 return{schema:'lcd-entry-root-pose-v1',coordinateFrame:'viewer.printer local CAD coordinates, millimetres, right-handed',time:model.time,phase:{...model.phase},freeSource:part(0,'case-side source plug exit'),remote:part(544,'parked display-side packet exit'),stock:{...model.stock},calibration:'rootFromPacketMM = rootFromMaterialExitMM * materialExitFromPacketMM; caller retains the measured seated calibration and original packet geometry. Neither width-axis nor longitudinal-axis is automatically a connector mating direction.',endpointSHA:source.metadata.wholeSHA};
}
// Bind actual packet children using their measured seated root matrices. The
// wire exit and every packet child consume the same root delta. Stationary
// PCB sockets must never be included in this moving packet list.
export function bindRootPacketMeshes({root,parts,side='freeSource'}){
 if(!parts?.length)throw Error('A moving packet binding needs actual packet meshes');
 const retained=parts.map(({mesh,seatedRootFromMeshM})=>{if(!mesh?.parent||!seatedRootFromMeshM)throw Error('Missing measured seated packet root calibration');return{mesh,seated:seatedRootFromMeshM.clone(),initial:mesh.matrix.clone(),matrixAutoUpdate:mesh.matrixAutoUpdate};});
 return{kind:'calibrated-root-packet-meshes',apply(pose){const delta=new T.Matrix4().fromArray(pose[side].rootDeltaFromSeatedMM);for(const k of[12,13,14])delta.elements[k]*=.001;root.updateWorldMatrix(true,false);const inverse=root.matrixWorld.clone().invert();
  for(const r of retained){r.mesh.parent.updateWorldMatrix(true,false);const parentRoot=inverse.clone().multiply(r.mesh.parent.matrixWorld),local=parentRoot.invert().multiply(delta).multiply(r.seated);local.decompose(r.mesh.position,r.mesh.quaternion,r.mesh.scale);r.mesh.matrix.copy(local);r.mesh.matrixAutoUpdate=false;r.mesh.matrixWorldNeedsUpdate=true;}
 },restore(){for(const r of retained){r.initial.decompose(r.mesh.position,r.mesh.quaternion,r.mesh.scale);r.mesh.matrix.copy(r.initial);r.mesh.matrixAutoUpdate=r.matrixAutoUpdate;r.mesh.matrixWorldNeedsUpdate=true;}}};
}
