import * as T from 'three';
import {LOVEBOARD,SOCKETS,boardPoint} from './loveboard-layout.js?v=20261111-94';
import {clikMateMotion,clikMatePress} from './clik-mate-plug.js?v=20261111-94';

// Independently authored analytic reference surfaces; current illustration PCB frame retained.
// Part numbers are compatibility identifiers, not a manufacturer-origin claim.
// Source X is the pin lane, +Y insertion, +Z the latch side. Millimetres.
export const J13_DATUM=Object.freeze({header:'5031542290',plug:'5031492200',pins:22,rows:2,pitch:1.5,rowSeparation:2.7,wirePlaneY:0,wireRowsZ:Object.freeze([1.625,4.325]),wireCentreZ:2.975,pcbPlaneY:11.2,footprintCentreZ:4.525});
const sourceURL=meta=>new URL(meta.source,new URL('./assets/j13/',import.meta.url)).href;
let pending,models;
export function prepareNativeJ13(){
 if(models)return Promise.resolve();
 return pending??=load().catch(error=>{pending=undefined;throw error;});
}
async function load(){
 const root=new URL('./assets/j13/',import.meta.url),manifestResponse=await fetch(new URL('cad.json?v=20261114-136',root));
 if(!manifestResponse.ok)throw Error('J13 native manifest unavailable');
 const manifest=await manifestResponse.json(),entries=await Promise.all([J13_DATUM.header,J13_DATUM.plug].map(async id=>{
  const meta=manifest.parts[id],response=await fetch(new URL(id+'.bin?v=20261114-136',root));
  if(!response.ok)throw Error('J13 native geometry unavailable: '+id);
  const buffer=await response.arrayBuffer(),n=meta.vertices*3;
  if(buffer.byteLength!==n*8)throw Error('Invalid J13 native buffer: '+id);
  return [id,{meta,positions:new Float32Array(buffer,0,n),normals:new Float32Array(buffer,n*4,n)}];
 }));models=new Map(entries);
}
function model(id){const m=models?.get(id);if(!m)throw Error('prepareNativeJ13 must finish before constructing '+id);return m;}
export function nativeJ13Geometry(id){
 const {meta,positions,normals}=model(id),g=new T.BufferGeometry();
 g.setAttribute('position',new T.BufferAttribute(positions.slice(),3));g.setAttribute('normal',new T.BufferAttribute(normals.slice(),3));
 for(const v of meta.groups)g.addGroup(v.start,v.count,['resin','contacts','holdDowns'].indexOf(v.material));
 g.userData={manufacturerPart:id,source:sourceURL(meta),sourceMeshSHA256:meta.meshSha256,sourceFaces:meta.sourceFaces,allFacesRetained:true,manufacturerCAD:false,geometryOrigin:meta.sourceKind,materialAssignment:'anatomy-derived display, not supplier face colors'};
 return g;
}
export function nativeJ13SocketFrame(){
 const [l,t,r,b]=SOCKETS.J13.rect,p=boardPoint((l+r)/2,(t+b)/2);
 return new T.Matrix4().set(0,0,-1,p[0]+J13_DATUM.footprintCentreZ,0,1,0,LOVEBOARD.datumCAD[1]-J13_DATUM.pcbPlaneY,1,0,0,p[2],0,0,0,1);
}
export function nativeJ13WirePorts(frame=nativeJ13SocketFrame()){
 const outward=new T.Vector3(0,-1,0).transformDirection(frame).toArray();
 return J13_DATUM.wireRowsZ.flatMap((z,row)=>Array.from({length:11},(_,column)=>({row,column,source:[(column-5)*1.5,0,z],position:new T.Vector3((column-5)*1.5,0,z).applyMatrix4(frame).toArray(),outward:outward.slice()})));
}
export function nativeJ13WireCentre(frame=nativeJ13SocketFrame()){return new T.Vector3(0,0,J13_DATUM.wireCentreZ).applyMatrix4(frame);}
function renderingPorts(frame){return nativeJ13WirePorts(frame).map(p=>({...p,wireIndex:(1-p.row)*11+p.column})).sort((a,b)=>a.wireIndex-b.wireIndex);}
// Preserve legacy visible wire identity: negative-worldX row first, columns
// increasing worldZ. Supplier/electrical pin numbering is not inferred.
export function nativeJ13PinOffsets(){return renderingPorts(new T.Matrix4()).map(p=>new T.Vector2(J13_DATUM.wireCentreZ-p.source[2],-p.source[0]));}
export function nativeJ13HeaderPieces(){
 const m=model(J13_DATUM.header);
 return ['resin','contacts','holdDowns'].map(material=>{const groups=m.meta.groups.filter(g=>g.material===material),count=groups.reduce((s,g)=>s+g.count,0),p=new Float32Array(count*3),n=new Float32Array(count*3);let at=0;
  for(const g of groups){p.set(m.positions.subarray(g.start*3,(g.start+g.count)*3),at);n.set(m.normals.subarray(g.start*3,(g.start+g.count)*3),at);at+=g.count*3;}
  const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.BufferAttribute(p,3));geometry.setAttribute('normal',new T.BufferAttribute(n,3));return {material,geometry,source:sourceURL(m.meta),sourceFaces:m.meta.materialFaceCounts[material]??0,modelSourceFaces:m.meta.sourceFaces,sourceMeshSHA256:m.meta.meshSha256,geometryOrigin:m.meta.sourceKind,manufacturerCAD:false};
 });
}
const ease=x=>{const u=T.MathUtils.clamp(x,0,1);return u*u*(3-2*u);};
// Main-loom state .5 is still mated, with its cable channel released. Only
// .5→0 releases/withdraws this plug. Existing CLIK-Mate timing is reused on
// that connection interval; .5→1 is routing with the plug stationary.
export function nativeJ13Motion(from,to,t){
 const u=T.MathUtils.clamp(t,0,1),low=Math.min(from,to),high=Math.max(from,to);
 if(low>=.5)return {amount:T.MathUtils.lerp(from,to,ease(u)),press:0,phase:'route'};
 if(high<=.5){const m=clikMateMotion(from*2,to*2,u);return {...m,amount:m.amount/2};}
 const distance=Math.abs(to-from),routeFraction=(high-.5)/distance,unplug=from>to;
 if(unplug){if(u<routeFraction)return {amount:T.MathUtils.lerp(from,.5,ease(u/routeFraction)),press:0,phase:'route'};return nativeJ13Motion(.5,to,(u-routeFraction)/(1-routeFraction));}
 const connectionFraction=1-routeFraction;
 if(u<=connectionFraction)return nativeJ13Motion(from,.5,u/connectionFraction);
 return {amount:T.MathUtils.lerp(.5,to,ease((u-connectionFraction)/routeFraction)),press:0,phase:'route'};
}
const smooth=(x,a,b)=>T.MathUtils.smoothstep(x,a,b),slope=(x,a,b)=>x<=a||x>=b?0:6*(x-a)/(b-a)*(1-(x-a)/(b-a))/(b-a);
// A smooth explanatory latch depression only, not a measured force/travel law.
// Native unpressed positions remain literal. Inverse-transpose normals follow
// the same deformation; no flipped normals or removed latch surfaces.
export function deformJ13Latch(x,y,z,nx,ny,nz,press=1){
 if(press<=0)return {position:[x,y,z],normal:[nx,ny,nz],determinant:1};
 const ax=Math.abs(x),a=1-smooth(ax,7,9),b=1-smooth(y,6.3,8.5),c=smooth(z,6.55,8.2),d=.65*T.MathUtils.clamp(press,0,1),dx=-d*Math.sign(x)*slope(ax,7,9)*b*c,dy=-d*a*slope(y,6.3,8.5)*c,dz=d*a*b*slope(z,6.55,8.2),n=new T.Vector3(nx+dx*nz/(1-dz),ny+dy*nz/(1-dz),nz/(1-dz)).normalize();
 return {position:[x,y,z-d*a*b*c],normal:n.toArray(),determinant:1-dz};
}
export function createNativeJ13Plug(){
 const m=model(J13_DATUM.plug),positions=new Float32Array(m.positions.length),normals=new Float32Array(positions.length),pressedPositions=new Float32Array(positions.length),pressedNormals=new Float32Array(positions.length);
 for(let i=0;i<positions.length;i+=3){
  const [x,y,z]=m.positions.subarray(i,i+3),[nx,ny,nz]=m.normals.subarray(i,i+3),v=deformJ13Latch(x,y,z,nx,ny,nz);
  positions.set([J13_DATUM.wireCentreZ-z,-x,y],i);normals.set([-nz,-nx,ny],i);
  pressedPositions.set([J13_DATUM.wireCentreZ-v.position[2],-v.position[0],v.position[1]],i);pressedNormals.set([-v.normal[2],-v.normal[0],v.normal[1]],i);
 }
 const posedPositions=positions.slice(),posedNormals=normals.slice();let lastPress=0;
 return {positions,normals,pressedPositions,pressedNormals,posedPositions,posedNormals,write(press){if(press===lastPress)return;lastPress=press;
  if(press<=0){posedPositions.set(positions);posedNormals.set(normals);return;}
  for(let i=0;i<positions.length;i+=3){const v=deformJ13Latch(...m.positions.subarray(i,i+3),...m.normals.subarray(i,i+3),press);posedPositions.set([J13_DATUM.wireCentreZ-v.position[2],-v.position[0],v.position[1]],i);posedNormals.set([-v.normal[2],-v.normal[0],v.normal[1]],i);}
 },pins:22,rows:2,pitch:1.5,rowSeparation:2.7,manufacturerPart:J13_DATUM.plug,source:sourceURL(m.meta),officialSource:undefined,sourceMeshSHA256:m.meta.meshSha256,sourceFaces:m.meta.sourceFaces,allFacesRetained:true,manufacturerCAD:false,geometryOrigin:m.meta.sourceKind,elasticReferenceOnly:true};
}
function tailForAmount(amount){
 const end=nativeJ13WireCentre();
 if(amount<.5){const points=[[0,[-14,-8,0]],[.25,[0,-8,0]],[.5,[0,0,0]]],hi=amount<=.25?1:2,lo=points[hi-1],up=points[hi],blend=T.MathUtils.clamp((amount-lo[0])/(up[0]-lo[0]),0,1);end.add(new T.Vector3(...lo[1]).lerp(new T.Vector3(...up[1]),blend));}return end;
}
export function nativeJ13Pose(from,to,t,{tail,amount:observedAmount}={}){
 const motion=nativeJ13Motion(from,to,t),amount=observedAmount??motion.amount,seated=nativeJ13WireCentre(),end=tail?.clone()??tailForAmount(amount),out=new T.Vector3(0,-1,0),clearance=end.clone().sub(seated).dot(out),press=clikMatePress(motion,clearance),frame=nativeJ13SocketFrame();
 frame.setPosition(new T.Vector3().setFromMatrixPosition(frame).add(end.clone().sub(seated)));
 return {motion:{...motion,amount},press,clearance,sourceToWorld:frame,ports:nativeJ13WirePorts(frame),wireCentre:end};
}
export function sampleNativeJ13({from=1,to=1,t=1,amount,tail}={}){
 const motion=nativeJ13Motion(from,to,t),a=amount??motion.amount,end=tail?new T.Vector3(...tail):tailForAmount(a);
 const pose=nativeJ13Pose(from,to,t,{tail:end,amount:a});
 return Object.freeze({generation:'native-j13-616-v1',frame:'CAD-mm',housingMatrixCADMM:Object.freeze(pose.sourceToWorld.toArray()),amount:a,press:pose.press,phase:pose.motion.phase,entries:Object.freeze(renderingPorts(pose.sourceToWorld).map(p=>Object.freeze({wireIndex:p.wireIndex,row:p.row,col:p.column,pointCADMM:Object.freeze(p.position),tangentIntoWireCAD:Object.freeze(p.outward)})))});
}
// Consumer-owned attributes, native source frame, CAD-mm packet -> metres.
// The wire-route owner appends all native vertices; no wire/stock is created.
export function createNativeJ13SurfaceWriter(){
 const m=model(J13_DATUM.plug),p=new T.Vector3(),n=new T.Vector3(),matrix=new T.Matrix4(),normalMatrix=new T.Matrix3();
 return {vertices:m.meta.vertices,sourceFaces:m.meta.sourceFaces,sourceMeshSHA256:m.meta.meshSha256,geometryOrigin:m.meta.sourceKind,manufacturerCAD:false,manufacturerPart:J13_DATUM.plug,write(position,normal,{offset=0,packet}){
  if(packet?.generation!=='native-j13-616-v1'||packet.frame!=='CAD-mm'||packet.housingMatrixCADMM.length!==16)throw Error('Invalid native J13 pose packet');
  if(position.count<offset+m.meta.vertices||normal.count<offset+m.meta.vertices)throw Error('J13 native writer target is too short');
  matrix.fromArray(packet.housingMatrixCADMM);normalMatrix.getNormalMatrix(matrix);
  for(let i=0;i<m.positions.length;i+=3){const v=deformJ13Latch(...m.positions.subarray(i,i+3),...m.normals.subarray(i,i+3),packet.press);p.fromArray(v.position).applyMatrix4(matrix).multiplyScalar(.001);n.fromArray(v.normal).applyMatrix3(normalMatrix).normalize();position.setXYZ(offset+i/3,p.x,p.y,p.z);normal.setXYZ(offset+i/3,n.x,n.y,n.z);}
 }};
}
export function createNativeJ13ShellConsumer(entity){
 const geometry=entity.geometry,mesh=entity.mesh,position=geometry.attributes.position,normal=geometry.attributes.normal,writer=createNativeJ13SurfaceWriter(),offset=22*81*7;
 if(entity.clikMate?.manufacturerPart!==J13_DATUM.plug||position.count!==offset+writer.vertices)throw Error('J13 consumer requires the complete native shell range');
 let retired=false;
 const retire=()=>{if(retired)return;retired=true;geometry.removeEventListener('dispose',retire);};geometry.addEventListener('dispose',retire);
 return {write(packet){
  if(retired||entity.geometry!==geometry||mesh.geometry!==geometry||geometry.attributes.position!==position||geometry.attributes.normal!==normal)return false;
  writer.write(position,normal,{offset,packet});position.needsUpdate=normal.needsUpdate=true;geometry.computeBoundingBox();geometry.computeBoundingSphere();return true;
 },retire,get retired(){return retired;},offset,vertices:writer.vertices};
}
export function createNativeJ13Pair(){
 const resin=()=>new T.MeshStandardMaterial({color:'#e9e2d2',roughness:.72,metalness:0}),metal=()=>new T.MeshStandardMaterial({color:'#bec3c5',roughness:.34,metalness:.75}),header=new T.Mesh(nativeJ13Geometry(J13_DATUM.header),[resin(),metal(),metal()]),plug=new T.Mesh(nativeJ13Geometry(J13_DATUM.plug),resin());
 header.userData={...header.geometry.userData,connector:'J13',geometryRole:'nativeHeader',illustrationRegistration:true};plug.userData={...plug.geometry.userData,connector:'J13',geometryRole:'nativePlug',elasticReferenceOnly:true};
 const g=plug.geometry,hg=header.geometry,ownedMaterials=[...header.material,plug.material],p=g.attributes.position,n=g.attributes.normal,baseP=p.array.slice(),baseN=n.array.slice(),frame=nativeJ13SocketFrame();header.matrixAutoUpdate=plug.matrixAutoUpdate=false;header.matrix.copy(frame);plug.matrix.copy(frame);
 let disposed=false;
 return {header,plug,update({from=1,to=1,t=1,tail}={}){if(disposed||plug.geometry!==g||header.geometry!==hg)return null;const pose=nativeJ13Pose(from,to,t,{tail});
  for(let i=0;i<baseP.length;i+=3){const v=deformJ13Latch(...baseP.subarray(i,i+3),...baseN.subarray(i,i+3),pose.press);p.array.set(v.position,i);n.array.set(v.normal,i);}p.needsUpdate=n.needsUpdate=true;plug.matrix.copy(pose.sourceToWorld);g.computeBoundingBox();g.computeBoundingSphere();return pose;
 },dispose(){if(disposed)return;disposed=true;header.removeFromParent();plug.removeFromParent();hg.dispose();g.dispose();for(const mat of ownedMaterials)mat.dispose();},get disposed(){return disposed;}};
}
