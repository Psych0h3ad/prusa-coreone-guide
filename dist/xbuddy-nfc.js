import * as T from 'three';
import {STLLoader}from './vendor/STLLoader.js';
import {roundedCablePath,roundedLength}from './lcd-cable-motion.js?v=20261111-94';
const mm=.001,segments=128,sides=8;
export const NFC_ILLUSTRATIVE_LENGTH=150;
const v=p=>new T.Vector3(...p);
function subdivide(a,b,c,depth,emit){if(!depth){emit(a,b,c);return;}const ab=a.clone().add(b).multiplyScalar(.5),bc=b.clone().add(c).multiplyScalar(.5),ca=c.clone().add(a).multiplyScalar(.5);for(const t of[[a,ab,ca],[ab,b,bc],[ca,bc,c],[ab,bc,ca]])subdivide(...t,depth-1,emit);}
export async function createXbuddyNfc(){
 const response=await fetch('./assets/electronics/nfc.json');if(!response.ok)throw Error('NFC source unavailable');const data=await response.json(),meshes=[];
 const add=(geometry,part,material,illustration=true,component)=>{geometry.computeBoundingBox();geometry.computeBoundingSphere();const m=new T.Mesh(geometry,material);m.userData={part,component,serviceTask:'xbuddy',toolOnly:true,cadName:part,illustration};m.name=part;m.castShadow=!!illustration;meshes.push(m);return m;};
 const black=new T.MeshStandardMaterial({color:'#222a2f',roughness:.82}),gold=new T.MeshStandardMaterial({color:'#b99b50',roughness:.38,metalness:.72}),ivory=new T.MeshStandardMaterial({color:'#ede6cf',roughness:.7});
 const source=await new STLLoader().loadAsync(data.mesh),p=source.attributes.position,n=source.attributes.normal,body=[],front=[],uv=[],H=data.photoHomography;
 const emit=(...points)=>{for(const q of points){front.push(q.x*mm,q.y*mm,q.z*mm);const u=42-q.z,w=q.x+119,d=H[2][0]*u+H[2][1]*w+H[2][2];uv.push((H[0][0]*u+H[0][1]*w+H[0][2])/d/data.photoSize[0],1-(H[1][0]*u+H[1][1]*w+H[1][2])/d/data.photoSize[1]);}};
 for(let i=0;i<p.count;i+=3){const points=[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(p,i+j));if(n.getY(i)<-.99)subdivide(...points,4,emit);else for(const q of points)body.push(q.x*mm,q.y*mm,q.z*mm);}
 const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(body,3));g.computeVertexNormals();const coil=add(g,'xbNfcCoil',black,false,'xbNfcSubstrate');
 const surface=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(front,3)).setAttribute('uv',new T.Float32BufferAttribute(uv,2));surface.computeVertexNormals();
 const texture=await new T.TextureLoader().loadAsync(data.texture);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=8;add(surface,'xbNfcCoil',new T.MeshBasicMaterial({map:texture,toneMapped:false}),false,'xbNfcPhoto');source.dispose();
 function box(point,size,part,mat,component){const g=new T.BoxGeometry(...size.map(x=>x*mm));g.translate(...point.map(x=>x*mm));return add(g,part,mat,true,component);}
 function annulus(point,direction,outer,inner,height,part,mat,component){const shape=new T.Shape();shape.absarc(0,0,outer,0,2*Math.PI,false);if(inner){const hole=new T.Path();hole.absarc(0,0,inner,0,2*Math.PI,true);shape.holes.push(hole);}const g=new T.ExtrudeGeometry(shape,{depth:height,bevelEnabled:false,curveSegments:24});g.applyQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0,0,1),v(direction)));g.scale(mm,mm,mm);g.translate(...point.map(x=>x*mm));return add(g,part,mat,true,component);}
 const B=data.boardPort,C=data.coilPort;
 box([B[0],B[1]+.25,B[2]],[3.1,.5,3.1],'xbNfcSocket',ivory);annulus([B[0],B[1]+.5,B[2]],[0,1,0],1.15,.52,.6,'xbNfcSocket',gold);
 const plug=annulus([B[0],B[1]+1.11,B[2]],[0,1,0],1.38,.58,1.1,'xbNfcPlug',gold);box([B[0],B[1]+1.65,B[2]-1.25],[1.4,1.1,2],'xbNfcPlug',gold);
 box([C[0],C[1]-.25,C[2]],[3.1,.5,3.1],'xbNfcCoil',ivory,'xbNfcCoilSocket');annulus([C[0],C[1]-.5,C[2]],[0,-1,0],1.15,.52,.6,'xbNfcCoil',gold,'xbNfcCoilSocket');annulus([C[0],C[1]-1.11,C[2]],[0,-1,0],1.38,.58,1.1,'xbNfcCoil',gold,'xbNfcCoilPlug');box([C[0]+1.25,C[1]-1.65,C[2]],[2,1.1,1.4],'xbNfcCoil',gold,'xbNfcCoilPlug');
 const start=[B[0],B[1]+1.65,B[2]-2.25],end=[C[0]+2.25,C[1]-1.65,C[2]],curve=roundedCablePath([v(start),v(end)]),wireGeometry=new T.TubeGeometry(curve,segments,.55,sides,false);wireGeometry.scale(mm,mm,mm);const wire=add(wireGeometry,'xbNfcCable',new T.MeshStandardMaterial({color:'#242525',roughness:.76}));
 return {meshes,coil,plug,wire,start,end,boardPort:B,coilPort:C};
}
function points(start,end,slack){const delta=start.clone().sub(v(this.start)),tail=end.clone().sub(v(this.end));return [start.toArray(),start.clone().add(v([0,4,-4])).toArray(),v([-66,183,56]).add(delta).toArray(),v([-75-slack,190,44]).addScaledVector(tail,.35).toArray(),v([-85-slack,195,30]).addScaledVector(tail,.7).toArray(),v([-75-slack,198,16]).add(tail).toArray(),end.clone().add(v([8,-.5,-3])).toArray(),end.clone().add(v([3,0,0])).toArray(),end.toArray()];}
export function followXbuddyNfc(viewer){
 const h=viewer.nfcHardware;if(!h||viewer.operationScene?.plan.serviceTask!=='xbuddy')return;
 if(viewer.operationScene.plan.step===9&&!h.coil.visible)h.plug.visible=false;
 // Both endpoints follow their physical owners; the curve pays out its loop.
 h.wire.visible=h.coil.visible&&h.plug.visible;if(!h.wire.visible)return;
 const start=v(h.start).multiplyScalar(mm).applyQuaternion(h.plug.quaternion).add(h.plug.position).multiplyScalar(1000),end=v(h.end).multiplyScalar(mm).applyQuaternion(h.coil.quaternion).add(h.coil.position).multiplyScalar(1000),signature=[...start.toArray(),...end.toArray()].join(',');if(signature===h.signature)return;h.signature=signature;
 let low=0,high=65;for(let i=0;i<17;i++){const m=(low+high)/2;if(roundedLength(points.call(h,start,end,m))<NFC_ILLUSTRATIVE_LENGTH)low=m;else high=m;}
 const routePoints=points.call(h,start,end,(low+high)/2);h.centrelineLength=roundedLength(routePoints);h.route=roundedCablePath(routePoints.map(v));const route=h.route,frames=route.computeFrenetFrames(segments,false),g=h.wire.geometry,p=g.attributes.position,n=g.attributes.normal;
 for(let i=0;i<=segments;i++){const c=route.getPointAt(i/segments);for(let j=0;j<=sides;j++){const a=j/sides*2*Math.PI,q=frames.normals[i].clone().multiplyScalar(Math.cos(a)).addScaledVector(frames.binormals[i],Math.sin(a)),k=i*(sides+1)+j;p.setXYZ(k,(c.x+.55*q.x)*mm,(c.y+.55*q.y)*mm,(c.z+.55*q.z)*mm);n.setXYZ(k,q.x,q.y,q.z);}}
 p.needsUpdate=true;n.needsUpdate=true;g.computeBoundingBox();g.computeBoundingSphere();
}
