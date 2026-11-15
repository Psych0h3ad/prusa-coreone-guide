import * as T from 'three';
import {roundedCablePath,roundedLength} from './lcd-cable-motion.js?v=20261111-94';

// The screw axis and washer come from the official assembly CAD. The crimp
// and flexible lead supplement it from the official 3.48 photographs.
export const FE_GROUND={axis:[-134.199394,165.451722,33.645974],ringBack:165.571722,ringThickness:.5,washerThickness:.8,wireEnd:[-134.199394,167.2,18.645974],loose:[-137,190,48],leadLength:110};
const mm=.001;
export function createFeHardware(source){
 const meshes=[],steel=new T.MeshStandardMaterial({color:'#bfc2bf',metalness:.72,roughness:.33}),black=new T.MeshStandardMaterial({color:'#292c2b',roughness:.65});
 const add=(g,key,mat,illustration=false)=>{g.computeBoundingBox();g.computeBoundingSphere();const m=new T.Mesh(g,mat);m.name=key;m.userData={part:key,cadName:key,illustration};m.castShadow=true;meshes.push(m);return m;};
 const clone=(id)=>{const s=source.find(m=>m.userData.cadPath?.includes(id));if(!s)throw Error('Missing FE source hardware '+id);s.updateMatrix();return s.geometry.clone().applyMatrix4(s.matrix);};
 const [x,,z]=FE_GROUND.axis;
 const ring=new T.Shape();ring.absarc(0,0,3.7,0,Math.PI*2,false);const bore=new T.Path();bore.absarc(0,0,1.7,0,Math.PI*2,true);ring.holes.push(bore);
 const flat=new T.ExtrudeGeometry(ring,{depth:.5,bevelEnabled:false,curveSegments:40});
 // Profile XY becomes CAD XZ; its extrusion normal faces +CAD Y.
 const M=new T.Matrix4().set(mm,0,0,x*mm,0,0,mm,FE_GROUND.ringBack*mm,0,-mm,0,z*mm,0,0,0,1);flat.applyMatrix4(M);
 const ringMesh=add(flat,'feGroundRing',steel,true);
 const neck=new T.Shape([[-1.9,2.9],[1.9,2.9],[1.35,8.2],[-1.35,8.2]].map(p=>new T.Vector2(...p)));
 const ng=new T.ExtrudeGeometry(neck,{depth:.5,bevelEnabled:false});ng.applyMatrix4(M);add(ng,'feGroundRing',steel,true);
 const barrel=new T.Shape();barrel.absarc(0,0,1.4,0,Math.PI*2,false);const inside=new T.Path();inside.absarc(0,0,1.0,0,Math.PI*2,true);barrel.holes.push(inside);
 const bg=new T.ExtrudeGeometry(barrel,{depth:7,bevelEnabled:false,curveSegments:24});bg.scale(mm,mm,mm);bg.translate(x*mm,.1672,(z-15)*mm);add(bg,'feGroundRing',steel,true);
 const washer=clone(776),from=new T.Vector3(-.123413,.100293,.078336093),to=new T.Vector3(x*mm,(FE_GROUND.ringBack+.5+.4)*mm,z*mm);
 washer.translate(...from.clone().negate().toArray());washer.applyQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0,0,1),new T.Vector3(0,1,0)));washer.translate(...to.toArray());add(washer,'feGroundWasher',steel);
 const screw=clone(189);screw.translate(0,(FE_GROUND.ringBack+.5+.8-FE_GROUND.axis[1])*mm,0);add(screw,'feGroundScrew',steel);
 const route=roundedCablePath(leadPoints(new T.Vector3(...FE_GROUND.wireEnd),new T.Vector3(0,0,-1),10).map(p=>new T.Vector3(...p)));
 const wg=new T.TubeGeometry(route,128,1,8,false);wg.scale(mm,mm,mm);const lead=add(wg,'feGroundWire',black,true);
 return {meshes,ring:ringMesh,lead};
}

function leadPoints(end,back,slack,entryDelta=new T.Vector3()){
 return [[-148,170,12],[-145,170,7],[-136,178,7],...Array.from({length:17},(_,i)=>{
  const a=i/16*Math.PI;return [-136+slack*Math.sin(a),178,31-4*Math.cos(a)+entryDelta.z];
 }),new T.Vector3(-137,175,26).add(entryDelta).toArray(),end.clone().addScaledVector(back,3).toArray(),end.toArray()];
}

export function followFeHardware(viewer){
 const hardware=viewer.feHardware;if(!hardware||!hardware.ring.visible)return;
 if(hardware.serviceFollow){hardware.serviceFollow(viewer);return;}
 const ring=hardware.ring,end=new T.Vector3(...FE_GROUND.wireEnd).multiplyScalar(mm).applyQuaternion(ring.quaternion).add(ring.position).multiplyScalar(1000),back=new T.Vector3(0,0,-1).applyQuaternion(ring.quaternion);
 const entryDelta=viewer.operationScene?.plan.serviceTask==='xbuddy'?end.clone().sub(new T.Vector3(...FE_GROUND.wireEnd)):new T.Vector3();
 const signature=end.toArray().join(',')+'|'+back.toArray().join(',')+'|'+entryDelta.toArray().join(',');if(signature===hardware.lastPose)return;hardware.lastPose=signature;
 // A loose return bend pays out instead of stretching the wire as the lug
 // moves. Its 110 mm length is illustrative, not a cable specification.
 let lo=.001,hi=35;for(let i=0;i<17;i++){const mid=(lo+hi)/2;if(roundedLength(leadPoints(end,back,mid,entryDelta))<FE_GROUND.leadLength)lo=mid;else hi=mid;}
 const points=leadPoints(end,back,(lo+hi)/2,entryDelta);hardware.leadLength=roundedLength(points);
 const route=roundedCablePath(points.map(p=>new T.Vector3(...p))),frames=route.computeFrenetFrames(128,false),g=hardware.lead.geometry,p=g.attributes.position,n=g.attributes.normal;
 for(let i=0;i<=128;i++){const c=route.getPointAt(i/128);for(let j=0;j<=8;j++){const a=j/8*2*Math.PI,q=frames.normals[i].clone().multiplyScalar(Math.cos(a)).addScaledVector(frames.binormals[i],Math.sin(a)),k=i*9+j;p.setXYZ(k,(c.x+q.x)*mm,(c.y+q.y)*mm,(c.z+q.z)*mm);n.setXYZ(k,q.x,q.y,q.z);}}
 p.needsUpdate=true;n.needsUpdate=true;g.computeBoundingBox();g.computeBoundingSphere();
}
