import * as T from 'three';

// The official pads are 2.2 mm before fitting. The CAD backplate is at
// Y=161.89973 mm and the support bosses are at Y=163.89973 mm. The soft pad
// compresses into that gap. Keep its board-facing surface attached while
// releasing compression as the board is lifted. This affects illustrations,
// not the original metalwork or PCB mounting datum.
export const THERMAL_PAD_FREE_THICKNESS=2.2;
export const XBUDDY_PAD_CONTACT_Y=161.89973;
export const XBUDDY_BOARD_SUPPORT_Y=163.89973;
export function fittedBoardThickness(board){
 // The photo-registered illustration has nominal 1.6 mm laminate. Fit its
 // underside to the CAD bosses without moving the screw-head/connector datum.
 return board.key==='xBuddy'?Math.min(board.thickness,board.origin[1]-XBUDDY_BOARD_SUPPORT_Y-.002):board.thickness;
}
export function registerThermalPad(mesh,backY){
 const p=mesh.geometry.attributes.position,box=new T.Box3().setFromBufferAttribute(p);
 mesh.userData.thermalPad={backY,free:p.array.slice(),thickness:THERMAL_PAD_FREE_THICKNESS,corners:[
  [box.min.x,backY,box.min.z],[box.min.x,backY,box.max.z],
  [box.max.x,backY,box.min.z],[box.max.x,backY,box.max.z]
 ]};
}
export function followThermalPads(viewer){
 if(viewer.thermalPadCache?.count!==viewer.meshes.length)viewer.thermalPadCache={count:viewer.meshes.length,pads:viewer.meshes.filter(m=>m.userData.thermalPad),enclosure:viewer.meshes.find(m=>m.userData.cadIndex===168)};
 const {pads,enclosure}=viewer.thermalPadCache;
 if(!pads.length)return;
 if(!enclosure)return;
 enclosure.updateWorldMatrix(true,false);
 const reference=new T.Matrix4().compose(enclosure.userData.restPosition,enclosure.userData.restQuaternion,enclosure.scale);
 const inverse=reference.multiply(enclosure.matrixWorld.clone().invert());
 for(const m of pads){
  m.updateWorldMatrix(true,false);const d=m.userData.thermalPad,M=inverse.clone().multiply(m.matrixWorld),axis=new T.Vector3(0,-1,0).transformDirection(M);
  let depth=THERMAL_PAD_FREE_THICKNESS;
  if(enclosure.visible&&axis.y<-.98){
   const gap=Math.min(...d.corners.map(q=>(new T.Vector3(...q).applyMatrix4(M).y*1000-XBUDDY_PAD_CONTACT_Y)/-axis.y));
   if(gap>=1.8&&gap<depth+.002)depth=Math.min(depth,gap-.002);
  }
  if(Math.abs(depth-d.thickness)<1e-7)continue;
  const p=m.geometry.attributes.position;
  for(let i=0;i<p.count;i++)p.setY(i,d.backY-(d.backY-d.free[3*i+1])*depth/THERMAL_PAD_FREE_THICKNESS);
  p.needsUpdate=true;m.geometry.computeBoundingBox();m.geometry.computeBoundingSphere();d.thickness=depth;
 }
}
