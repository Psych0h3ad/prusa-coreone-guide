import * as T from 'three';
import {ORIGINAL_BED_MOUNT as D} from './original-bed-mount-data.js';
import {frameBox,viewDirection} from './camera.js?v=20261111-94';

// Authored visual kinematics authorized401; not measured hinge, elastic modulus,
// force or a material constitutive law. Formula matches the pinned parent probe.
export const BED_OPENING=Object.freeze({deltaMM:.35,neutralRMM:8.7,fullRMM:10,zeroRMM:16});
const owners=new WeakMap();
const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
export function spreadBedPoint(u,v,z,delta){
 const r=Math.hypot(u,v);
 if(delta===0||r>=BED_OPENING.zeroRMM)return{point:[u,v,z],jacobian:[1,0,0,1],determinant:1};
 if(!(r>0)||!Number.isFinite(delta)||delta<0||delta>BED_OPENING.deltaMM)throw Error('Invalid original bed opening material coordinate');
 const t=Math.max(0,Math.min(1,(r-BED_OPENING.fullRMM)/(BED_OPENING.zeroRMM-BED_OPENING.fullRMM))),w=1-t*t*(3-2*t),d=delta*w;
 const dr=t>0&&t<1?delta*(-6*t+6*t*t)/(BED_OPENING.zeroRMM-BED_OPENING.fullRMM):0;
 const k=BED_OPENING.neutralRMM/(BED_OPENING.neutralRMM+d),kr=-BED_OPENING.neutralRMM*dr/(BED_OPENING.neutralRMM+d)**2,theta=Math.atan2(v,u),sgn=Math.sign(theta);
 const angle=sgn*(Math.PI-(Math.PI-Math.abs(theta))*k),ar=(theta-sgn*Math.PI)*kr,c=Math.cos(angle),s=Math.sin(angle),rr=r+d;
 const frx=dr+(1+dr)*c-rr*s*ar,fry=(1+dr)*s+rr*c*ar,ftx=-rr*s*k,fty=rr*c*k;
 const a=frx*u/r-ftx*v/(r*r),b=frx*v/r+ftx*u/(r*r),c1=fry*u/r-fty*v/(r*r),d1=fry*v/r+fty*u/(r*r),det=a*d1-b*c1;
 if(!(det>0)||!Number.isFinite(det))throw Error('Original bed opening map lost orientation');
 return{point:[d+rr*c,rr*s,z],jacobian:[a,b,c1,d1],determinant:det};
}
function acquire(viewer){
 let entries=owners.get(viewer);if(entries)return entries;
 entries=[];
 try{
  for(const spec of D.bearings){
   const bodies=viewer.meshes.filter(m=>m.userData.cadIndex===spec.ownerCAD),bearings=viewer.meshes.filter(m=>m.userData.component===spec.component);
   if(bodies.length!==1||bearings.length!==1)throw Error('Complete original bed body/bearing owner required');
   const body=bodies[0],original=body.geometry,faces=(original.index?.count??original.attributes.position.count)/3;
   if(faces!==(spec.ownerCAD===637?10156:10502))throw Error('Whole original bed mount face inventory changed');
   if(viewer.meshes.some(m=>m!==body&&m.geometry===original))throw Error('Original bed source geometry must have one native owner');
   const geometry=original.clone(),p=geometry.attributes.position,n=geometry.attributes.normal;
   if(p.itemSize!==3||n.itemSize!==3||p.count!==n.count)throw Error('Complete bed mount P/N required');
   const base=new T.Matrix4().compose(body.userData.restPosition,body.userData.restQuaternion,body.scale),inverseBase=base.clone().invert(),normalToCAD=new T.Matrix3().getNormalMatrix(base),normalToMesh=new T.Matrix3().setFromMatrix4(base).transpose(),frame=new T.Matrix4().set(...spec.matrixMM.flat()),inverseFrame=frame.clone().invert(),R=new T.Matrix3().setFromMatrix4(frame),inverseR=R.clone().transpose(),positions=p.array.slice(),normals=n.array.slice(),localPoints=new Float64Array(p.count*3),localNormals=new Float64Array(n.count*3),q=new T.Vector3();
   for(let i=0;i<p.count;i++){
    q.fromArray(positions,i*3).applyMatrix4(base).multiplyScalar(1000).applyMatrix4(inverseFrame).toArray(localPoints,i*3);
    q.fromArray(normals,i*3).applyMatrix3(normalToCAD).normalize().applyMatrix3(inverseR).toArray(localNormals,i*3);
   }
   const attributes=Object.entries(geometry.attributes).map(([name,a])=>({name,a,array:a.array,itemSize:a.itemSize,count:a.count,normalized:a.normalized,version:a.version}));
   entries.push({spec,body,bearing:bearings[0],original,geometry,p,n,positions,normals,localPoints,localNormals,frame,R,normalToMesh,inverseBase,attributes,index:geometry.index,indexArray:geometry.index?.array,indexVersion:geometry.index?.version,groups:JSON.stringify(geometry.groups),drawRange:JSON.stringify(geometry.drawRange),pVersion:p.version,nVersion:n.version,delta:0});
  }
  for(const e of entries)e.body.geometry=e.geometry;
  owners.set(viewer,entries);return entries;
 }catch(error){for(const e of entries)e.geometry.dispose();throw error;}
}
function guard(e){
 if(e.body.geometry!==e.geometry||e.geometry.attributes.position!==e.p||e.geometry.attributes.normal!==e.n||e.p.version!==e.pVersion||e.n.version!==e.nVersion||e.geometry.index!==e.index||e.index?.array!==e.indexArray||e.index?.version!==e.indexVersion||JSON.stringify(e.geometry.groups)!==e.groups||JSON.stringify(e.geometry.drawRange)!==e.drawRange)throw Error('Original bed opening geometry ownership changed');
 if(Object.keys(e.geometry.attributes).length!==e.attributes.length)throw Error('Original bed opening attribute inventory changed');
 for(const r of e.attributes){const a=e.geometry.attributes[r.name];if(a!==r.a||a.array!==r.array||a.itemSize!==r.itemSize||a.count!==r.count||a.normalized!==r.normalized||r.name!=='position'&&r.name!=='normal'&&a.version!==r.version)throw Error('Original bed opening source attribute changed');}
}
function write(e,delta){
 guard(e);if(Object.is(delta,e.delta))return;
 if(delta===0){e.p.array.set(e.positions);e.n.array.set(e.normals);}
 else{
  const q=new T.Vector3(),nn=new T.Vector3();
  for(let i=0;i<e.p.count;i++){
   const j=i*3,u=e.localPoints[j],v=e.localPoints[j+1],z=e.localPoints[j+2];
   if(Math.hypot(u,v)>=BED_OPENING.zeroRMM){for(let k=0;k<3;k++){e.p.array[j+k]=e.positions[j+k];e.n.array[j+k]=e.normals[j+k];}continue;}
   const map=spreadBedPoint(u,v,z,delta),[a,b,c,d]=map.jacobian;
   q.fromArray(map.point).applyMatrix4(e.frame).multiplyScalar(.001).applyMatrix4(e.inverseBase).toArray(e.p.array,j);
   const nx=e.localNormals[j],ny=e.localNormals[j+1];
   nn.set((d*nx-c*ny)/map.determinant,(-b*nx+a*ny)/map.determinant,e.localNormals[j+2]).applyMatrix3(e.R).applyMatrix3(e.normalToMesh).normalize().toArray(e.n.array,j);
  }
 }
 e.p.needsUpdate=e.n.needsUpdate=true;e.pVersion=e.p.version;e.nVersion=e.n.version;e.delta=delta;
 e.geometry.computeBoundingBox();e.geometry.computeBoundingSphere();
}
export function resetOriginalBedMountOpening(viewer){
 for(const e of owners.get(viewer)||[])write(e,0);
}
export function retireOriginalBedMountOpening(viewer){
 const entries=owners.get(viewer);if(!entries)return [];
 owners.delete(viewer);
 const geometries=[];
 for(const e of entries){if(e.body.geometry===e.geometry)e.body.geometry=e.original;else if(e.body.geometry!==e.original&&!viewer.meshes.some(m=>m.geometry===e.original))geometries.push(e.original);geometries.push(e.geometry);}
 return geometries;
}
export function followOriginalBedMountOpening(viewer){
 if(viewer.operationScene?.full||!viewer.sceneActors?.some(a=>a.originalBedMountOpening)){resetOriginalBedMountOpening(viewer);return;}
 const entries=acquire(viewer),count=viewer.sceneActors.length,p=Math.max(0,Math.min(1,viewer.operationProgress))*count,index=Math.min(count-1,Math.floor(p)),fraction=p>=count?1:p-Math.floor(p),deltas=new Map(D.bearings.map(r=>[r.ownerCAD,0]));
 for(let i=0;i<count&&i<=index;i++){
  const phase=viewer.sceneActors[i].originalBedMountOpening;if(!phase)continue;
  const t=i<index?1:fraction,opening=phase.from+(phase.to-phase.from)*smooth(t);deltas.set(phase.mountCAD,opening);
 }
 const receipt=[];
 for(const e of entries){
  const delta=deltas.get(e.spec.ownerCAD);write(e,delta);
  e.bearing.position.copy(e.bearing.userData.sceneRestPosition).add(new T.Vector3(e.spec.matrixMM[0][0],e.spec.matrixMM[1][0],e.spec.matrixMM[2][0]).multiplyScalar(delta*.001));
  receipt.push({mountCAD:e.spec.ownerCAD,bearing:e.spec.component,openingDeltaMM:delta,completeNativeFaces:(e.geometry.index?.count??e.p.count)/3,wholeBearingTriangles:8400});
 }
 viewer.originalBedMountOpeningReceipt={sourceStepID:842336,notchLineID:1042363,illustrativeKinematics:true,notFEM:true,parameters:BED_OPENING,rows:receipt};
}
export function focusOriginalBedMountView(viewer,view,instant){
 const plan=viewer.operationScene?.plan,actor=viewer.sceneActors?.[viewer.activeOperation||0];
 if(!plan?.originalBedMountAssembly||viewer.operationScene.full||!actor)return false;
 const refs=viewer.operationProgress===1&&plan.settledFocus?plan.settledFocus:[...(actor.operationFocus??actor.refs??[]),...(actor.focusRefs??[])],box=new T.Box3();
 for(const m of viewer.director.resolve(refs))if(m.visible)box.union(new T.Box3().setFromObject(m));
 if(box.isEmpty())throw Error('Original bed current assembly camera target missing');
 box.expandByScalar(actor.focusPadding??plan.operationPadding??8);viewer.controls.minDistance=actor.focusMinDistance??80;
 viewer.moveCamera(frameBox(box,viewDirection(view),viewer.camera.fov,viewer.camera.aspect,1.2,viewer.controls.minDistance),instant);return true;
}
