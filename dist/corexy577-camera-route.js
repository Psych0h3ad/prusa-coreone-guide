import * as T from 'three';
const ease=x=>{x=Math.max(0,Math.min(1,x));return x*x*x*(10+x*(-15+6*x));};
const lerp=(a,b,t)=>a+(b-a)*t;
// Smooth approach, a small lateral orbit during plug rotation, then align with
// the opening before the plug clears it. Each component joins with C2 easing.
export function outsideEye(amount){
 const approach=ease((amount-.85)/.25);
 const x=lerp(lerp(-198,-175,approach),-180,ease((amount-1.35)/.3));
 const y=amount<=1.30?lerp(180,160,ease((amount-1.10)/.20)):lerp(160,180,ease((amount-1.30)/.20));
 const z=lerp(lerp(268,260,approach),268,ease((amount-1.24)/.26));
 return[x,y,z];
}
// Read-only packet/oval framing, shared by the actual adapter and its finite
// continuity diagnostics. No jacket, packet, normal, material or actor writes.
export function outsideView(viewer,e,amount=e.mesh.userData.flexState.amount,pose=e.currentPose){
 const eyeCAD=outsideEye(amount),world=p=>new T.Vector3(...p).multiplyScalar(.001).applyMatrix4(viewer.printer.matrixWorld);
 const packet=new T.Box3(),point=new T.Vector3();
 for(let i=0;i<e.packetPositions.length;i+=3)packet.expandByPoint(point.fromArray(e.packetPositions,i).applyMatrix4(pose.matrix));
 const box=packet.union(new T.Box3(new T.Vector3(-153,174.95,287.75),new T.Vector3(-152.2,186.45,310.25))).expandByScalar(3);
 const targetCAD=box.getCenter(new T.Vector3()).toArray(),position=world(eyeCAD),target=world(targetCAD),forward=target.clone().sub(position).normalize();
 const basis=new T.Matrix4().lookAt(position,target,viewer.camera.up),right=new T.Vector3().setFromMatrixColumn(basis,0),up=new T.Vector3().setFromMatrixColumn(basis,1);
 let tangent=0;for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z]){
  const d=world([x,y,z]).sub(position),depth=d.dot(forward);tangent=Math.max(tangent,Math.abs(d.dot(right))/depth/viewer.camera.aspect,Math.abs(d.dot(up))/depth);
 }
 return{eyeCAD,targetCAD,position,target,fov:T.MathUtils.clamp(T.MathUtils.radToDeg(2*Math.atan(tangent*1.15)),42,72)};
}
