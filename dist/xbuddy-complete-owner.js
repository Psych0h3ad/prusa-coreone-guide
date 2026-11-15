import {yChannelExit02} from './xbuddy-y-channel-route02.js';
import {buildYConductorRoutes03,Y_ENTRY03} from './xbuddy-y-entry03.js';
import * as T from 'three';
import {GLTFLoader} from './vendor/GLTFLoader.js';
import {XBUDDY_PORTS,xBuddyPortCentre,xBuddyPortBounds} from './xbuddy-layout.js';
import {nativeJ13Geometry,J13_DATUM,deformJ13Latch,prepareNativeJ13} from './native-j13.js';
import {ribbonProfile,baseRibbonProfile} from './lcd-ribbon.js';
import {FreeMaterialBank,MaterialJoin,closedRound,rewriteGeometry,V,S} from './xbuddy-complete-material.js';
import {clikMateMotion,createClikMatePlug} from './clik-mate-plug.js';
import {loadMolexCad,molexGeometry,molexCad} from './molex-cad.js';
import {releaseField} from './clik-mate-release-skin.js';
import {installUpperTie} from './xbuddy-upper-ties.js';
import {createXBuddyLeaseGuard,methodSnapshot,methodsCurrent,captureGeometryStorage,geometryStorageCurrent,ownDataValue} from './xbuddy-lease-guards.js';
import {publishXBuddyAssetsReady} from './xbuddy-assets-state.js';
import {registerCrossflowDependent13} from './r13-tie-service.js';
import {rearMainReference} from './rear-main-reference.js';
import {mainPath} from './rear-main-curves.js';
import {roundedCablePath,roundedLength} from './lcd-cable-motion.js';
const owners=new WeakMap(),nativeRetiring=new WeakSet(),leasePredicates=new WeakMap(),leaseGuards=new WeakMap(),rolePredicates=new WeakMap(),knownCompleteCapabilities=new WeakMap();
const leaseOwned=q=>leasePredicates.get(q)?.()===true;
const writerStorage=new WeakMap();
const rememberStorage=g=>{if(!writerStorage.has(g))writerStorage.set(g,captureGeometryStorage(g));return g;};
function rewriteOwnedGeometry(g,next){const result=rewriteGeometry(g,next,writerStorage.get(g));if(result===next)rememberStorage(next);return result;}
const sourceRoot=new URL('./cable-assembly/native/',import.meta.url);
let assets,pending;
export function prepareXBuddyCompleteAssets(){return assets?Promise.resolve(assets):pending??=prepare().catch(e=>{pending=null;throw e;});}
async function prepare(){
 await prepareNativeJ13();
 await loadMolexCad();
 const load=async name=>{const r=await fetch(new URL(name,sourceRoot));if(!r.ok)throw Error('Required xBuddy source asset unavailable: '+name);return r.json();};
 const [calibration,anatomy,...scenes]=await Promise.all([load('packet/calibration.json'),load('packet/anatomy-materials.json'),...['2-215083-4','9-338069-4'].map(id=>new GLTFLoader().loadAsync(new URL('models/'+id+'.glb',sourceRoot).href))]);
 const headerRoot=new URL('./assets/xbuddy-replacement/headers/',import.meta.url),metaResponse=await fetch(new URL('manifest.json',headerRoot));if(!metaResponse.ok)throw Error('Required authored VT4 manifest unavailable');const headerMeta=await metaResponse.json(),headerResponse=await fetch(new URL('xb-vt4-reference.bin',headerRoot));if(!headerResponse.ok)throw Error('Required authored VT4 reference unavailable');const headerBuffer=await headerResponse.arrayBuffer(),count=headerMeta.parts['xb-vt4-reference'].vertices*3;if(headerBuffer.byteLength!==count*8)throw Error('Invalid authored VT4 reference buffer');
 assets={calibration,anatomy,scenes,vt4:{meta:headerMeta.parts['xb-vt4-reference'],positions:new Float32Array(headerBuffer,0,count),normals:new Float32Array(headerBuffer,count*4,count)}};publishXBuddyAssetsReady();return assets;
}
const mat=(c,metal=false)=>{const m=new T.MeshStandardMaterial({color:c,roughness:metal?.35:.75,metalness:metal?.7:0});m.userData.originalColor=m.color.clone();m.userData.originalOpacity=1;return m;};
const port=key=>{const p=XBUDDY_PORTS.find(p=>p.key===key);if(!p)throw Error('Unknown source port '+key);return p;};
const centre=key=>V(xBuddyPortCentre(port(key)));
const mmMatrix=a=>{const m=new T.Matrix4().fromArray(a);for(const i of[12,13,14])m.elements[i]*=.001;return m;};
const extent=(a,b,pad=12)=>[0,1,2].map(k=>Math.min(a[k],b[k])-pad).concat([0,1,2].map(k=>Math.max(a[k],b[k])+pad));
function add(viewer,lease,g,id,material,extra={}){
 rememberStorage(g);
 const mesh=new T.Mesh(g,material);mesh.name=id;mesh.userData={part:'cables',component:id,componentOnly:true,serviceTask:'xbuddy',supplement:true,illustration:true,...extra};viewer.group('cables').add(mesh);viewer.meshes.push(mesh);viewer.records.push({key:'cables',name:id,mesh,id:mesh.uuid});mesh.userData.restPosition=mesh.position.clone();mesh.userData.restQuaternion=mesh.quaternion.clone();lease.added.push(mesh);lease.owned?.set(mesh,{geometry:g,material});return mesh;
}
function snapshotCurve(c,scale=1,reverse=false,N=1024){
 const points=Array.from({length:N+1},(_,i)=>c.getPointAt(reverse?1-i/N:i/N).clone().multiplyScalar(scale)),lengths=[0];for(let i=1;i<=N;i++)lengths.push(lengths.at(-1)+points[i].distanceTo(points[i-1]));
 return {points,lengthMM:lengths.at(-1),getLength(){return lengths.at(-1);},getPointAt(u,out=new T.Vector3()){const s=u*lengths.at(-1);let lo=0,hi=N;while(hi-lo>1){const m=(hi+lo)>>1;if(lengths[m]<s)lo=m;else hi=m;}return out.copy(points[lo]).lerp(points[hi],(s-lengths[lo])/Math.max(1e-15,lengths[hi]-lengths[lo]));},getTangentAt(u,out=new T.Vector3()){const h=1/N;return this.getPointAt(Math.min(1,u+h),out).sub(this.getPointAt(Math.max(0,u-h))).normalize();}};
}
function prefix(c,L){const total=c.getLength();return{getLength:()=>L,getPointAt:(u,out)=>c.getPointAt(u*L/total,out),getTangentAt:(u,out)=>c.getTangentAt(u*L/total,out)};}
// Supplemental motor/MMU/Power Panic plug references are built around the
// CURRENT photo-registered cavity. They are not misidentified supplier CAD.
function referencePlug(key,pins){
 const p=port(key),b=xBuddyPortBounds(p),w=b[3]-b[0]-1.8,d=b[5]-b[2]-1.8,shape=new T.Shape();shape.moveTo(-w/2,-d/2);shape.lineTo(w/2,-d/2);shape.lineTo(w/2,d/2);shape.lineTo(-w/2,d/2);shape.closePath();
 const pitch=1.5;
 for(let i=0;i<pins;i++){const h=new T.Path(),x=(i-(pins-1)/2)*pitch;h.moveTo(x-.38,-.38);h.lineTo(x-.38,.38);h.lineTo(x+.38,.38);h.lineTo(x+.38,-.38);h.closePath();shape.holes.push(h);}
 const g=new T.ExtrudeGeometry(shape,{depth:7,bevelEnabled:false,curveSegments:6});g.applyMatrix4(new T.Matrix4().set(.001,0,0,0,0,0,-.001,0,0,.001,0,0,0,0,0,1));g.userData={origin:'independently authored cavity-matched connector illustration',pinCount:pins,pitchMM:pitch,estimatedPitch:true,sourceGuide:'908859',sourcePort:key,supplierSKUConfirmed:false};
 return g;
}
function genericSocket(key,pins){
 const b=xBuddyPortBounds(port(key)),w=b[3]-b[0],d=b[5]-b[2],shape=new T.Shape([new T.Vector2(-w/2,-d/2),new T.Vector2(w/2,-d/2),new T.Vector2(w/2,d/2),new T.Vector2(-w/2,d/2)]),hole=new T.Path([new T.Vector2(-w/2+.65,-d/2+.65),new T.Vector2(-w/2+.65,d/2-.65),new T.Vector2(w/2-.65,d/2-.65),new T.Vector2(w/2-.65,-d/2+.65)]);shape.holes.push(hole);
 const shell=new T.ExtrudeGeometry(shape,{depth:4.8,bevelEnabled:false,curveSegments:1});shell.applyMatrix4(new T.Matrix4().set(1,0,0,0,0,0,1,-9,0,1,0,0,0,0,0,1));const pieces=[{g:shell,material:0},{g:new T.BoxGeometry(w,.7,d).translate(0,-9.35,0),material:0}];for(let i=0;i<pins;i++)pieces.push({g:new T.BoxGeometry(.4,3.8,.4).translate((i-(pins-1)/2)*1.5,-7.1,0),material:1});
 const positions=[],normals=[],g=new T.BufferGeometry();let at=0;for(const piece of pieces){const p=piece.g.index?piece.g.toNonIndexed():piece.g;positions.push(...p.attributes.position.array);normals.push(...p.attributes.normal.array);g.addGroup(at,p.attributes.position.count,piece.material);at+=p.attributes.position.count;piece.g.dispose();if(p!==piece.g)p.dispose();}g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('normal',new T.Float32BufferAttribute(normals,3));g.scale(.001,.001,.001);g.userData={origin:'Independently authored photo-registered6-circuit socket reference',supplierSKUConfirmed:false,pins,pitchMM:1.5,pitchIsEstimate:true};return g;
}
function signalSocket(viewer,lease,e){
 let g,kind;
 if(e.definition.pins===4){const s=assets.vt4;g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(s.positions.slice(),3)).setAttribute('normal',new T.Float32BufferAttribute(s.normals.slice(),3));for(const a of s.meta.groups)g.addGroup(a.start,a.count,a.material==='resin'?0:1);kind='independently authored VT4 reference; no manufacturer SKU';}
 else if(e.definition.pins===2){g=molexGeometry('5025840260');for(const a of molexCad('5025840260').groups)g.addGroup(a.start,a.count,a.material==='resin'?0:1);kind='current independently authored VT2 family reference; fitted supplier not identified';}
 else{g=genericSocket(e.definition.port,e.definition.pins);kind='generic photo-registered6-circuit reference';}
 if(e.definition.pins!==6){g.rotateZ(Math.PI);g.translate(0,0,-1.25);g.scale(.001,.001,.001);}
 const m=add(viewer,lease,g,e.id+'Socket',[mat('#e5dfcb'),mat('#b9bec2',true)],{sourcePort:e.definition.port,geometryOrigin:kind,manufacturerCAD:false,supplierSKUConfirmed:false});m.matrixAutoUpdate=false;m.matrix.makeTranslation(...e.seated.clone().multiplyScalar(.001).toArray());e.header=m;lease.signalHeaders??=[];lease.signalHeaders.push({mesh:m,base:m.matrix.clone(),role:e.id});
}
class SignalRole{
 constructor(viewer,lease,definition){
  this.id=definition.id;this.definition=definition;this.radius=definition.radius;this.amount=1;rolePredicates.set(this,()=>leaseOwned(lease));this.current=rolePredicates.get(this);const seated=centre(definition.port);seated.y=165.45172+9.7;this.seated=seated;this.stock=definition.stock;
  this.mesh=add(viewer,lease,new T.BufferGeometry(),this.id,mat(definition.color||'#3c403e'),{flexId:this.id,referenceStockMM:this.stock});this.geometry=this.mesh.geometry;
  if(definition.port==='Y'){this.wireMeshes=[this.mesh];this.mesh.userData.circuit=0;this.mesh.userData.referenceBundleEnvelopeRadiusMM=1.3;this.mesh.userData.wireRadiusMM=Y_ENTRY03.wireRadiusMM;for(let i=1;i<4;i++)this.wireMeshes.push(add(viewer,lease,new T.BufferGeometry(),this.id+'Wire'+i,this.mesh.material,{sourcePort:'Y',circuit:i,wireRadiusMM:Y_ENTRY03.wireRadiusMM,referenceBundleEnvelopeRadiusMM:1.3,referencePerConductorStockMM:this.stock}));}
  // Reuse the complete currently authored four/two-circuit housing surfaces.
  // This is a family reference, not a new assertion of the printer supplier SKU.
  this.nativeSkin=[2,4].includes(definition.pins)?createClikMatePlug(definition.pins):null;
  this.retainedPacket=definition.retainedPacket;this.splice=definition.splice||this.retainedPacket?.splice;if(this.retainedPacket)this.nativeSkin=null;
  if(definition.fixedRoute){const points=[V(definition.start),...definition.fixedRoute.map(V)];this.fixedRoute=new T.CatmullRomCurve3(points,false,'centripetal');this.fixedRoute.arcLengthDivisions=2048;this.fixedRoute.updateArcLengths();if(definition.bankStock){this.stock=this.fixedRoute.getLength()+definition.bankStock;this.mesh.userData.referenceStockMM=this.stock;}}
  let pg;if(this.retainedPacket){pg=this.retainedPacket.geometry;pg.rotateZ(Math.PI);pg.translate(0,0,-1.25);pg.scale(.001,.001,.001);}else if(this.nativeSkin){pg=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(this.nativeSkin.positions,3)).setAttribute('normal',new T.Float32BufferAttribute(this.nativeSkin.normals,3));pg.rotateX(Math.PI/2);pg.scale(.001,.001,.001);}else pg=referencePlug(definition.port,definition.pins);
  this.plug=add(viewer,lease,pg,this.id+'Plug',this.retainedPacket?this.retainedPacket.materials:mat('#e5dfcb'),{sourcePort:definition.port,geometryOrigin:this.retainedPacket?'complete retained CoreXY source packet, partitioned with every source face accounted for':this.nativeSkin?'current independently authored complete release skin':'authored six-circuit generic reference',sourceMeshSHA256:this.nativeSkin?.sourceMeshSHA256,manufacturerCAD:false,supplierSKUConfirmed:false});
  if(!this.nativeSkin&&!this.retainedPacket){const latch=new T.BoxGeometry(.0016,.0007,.0038);latch.translate(0,-.004,.0026);this.latch=add(viewer,lease,latch,this.id+'Latch',mat('#e5dfcb'),{sourcePort:definition.port});}
  this.update(1,1,1);
 }
 endpoint(a){if(this.definition.port==='Y')return yChannelExit02(this.seated,a);const q=1-a,clear=S(q/.35),park=S((q-.35)/.65);return this.seated.clone().add(V(this.definition.wireExitOffset||[0,0,0])).add(V([this.definition.side*22*park,12*clear+27*park,16*park]));}
 update(from,to,t){
  if(!rolePredicates.get(this)?.()||this.mesh.geometry!==this.geometry)return;const motion=clikMateMotion(from,to,t),a=motion.amount,end=this.endpoint(a),press=motion.press*(this.definition.port==='Y'?(1-S((end.y-this.seated.y-6.2)/.8)):(1-S((1-a)*12/4)));this.amount=a;
  if(this.lastAmount!==a){
   if(this.definition.port==='Y'){
    const harness=buildYConductorRoutes03(this.fixedRoute,end,this.stock);this.curve=harness.mean;this.wireCurves=harness.curves;this.receipt=harness.receipt;
    for(let i=0;i<4;i++){const mesh=this.wireMeshes[i],next=closedRound(harness.curves[i],Y_ENTRY03.wireRadiusMM,Y_ENTRY03.samples,Y_ENTRY03.sides);mesh.geometry=rewriteOwnedGeometry(mesh.geometry,next);mesh.userData.referencePerConductorStockMM=this.stock;}this.geometry=this.mesh.geometry;this.lastAmount=a;
   }else{
   const prefix=this.fixedRoute,L=prefix?.getLength()||0,bank=new FreeMaterialBank({start:prefix?prefix.getPointAt(1):V(this.definition.start),startT:prefix?prefix.getTangentAt(1):V(this.definition.startT),end,endT:V(this.definition.endT||[0,-1,0]),stock:this.stock-L,direction:this.definition.direction||[0,1,0],directionTail:this.definition.directionTail,tailBlend:this.definition.tailBlend});
   this.curve=prefix?new MaterialJoin(prefix,L,bank):bank;this.curve.measuredMM=L+bank.measuredMM;
   const samples=this.definition.samples||192,sides=this.splice?8:12,next=closedRound(this.curve,this.radius,samples,sides);
   if(this.splice){const p=next.attributes.position,n=next.attributes.normal,splice=this.splice,delta=this.curve.getPointAt(1/samples).sub(this.curve.getPointAt(0)).multiplyScalar(.001),centre=new T.Vector3();for(let j=0;j<=sides;j++){const k=j%sides,point=V(splice.positions[k]);p.setXYZ(j,...point.toArray());p.setXYZ(sides+1+j,...point.clone().add(delta).toArray());n.setXYZ(j,...splice.normals[k]);n.setXYZ(sides+1+j,...splice.normals[k]);if(j<sides)centre.add(point);}centre.divideScalar(sides);p.setXYZ((samples+1)*(sides+1),...centre.toArray());next.computeBoundingBox();next.computeBoundingSphere();}
   this.geometry=this.mesh.geometry=rewriteOwnedGeometry(this.geometry,next);this.lastAmount=a;
   }
  }
  this.press=press;this.applyPose();
  if(this.nativeSkin){const s=this.nativeSkin,p=this.plug.geometry.attributes.position,n=this.plug.geometry.attributes.normal;for(let i=0;i<p.count;i++){const k=i*3,x=s.positions[k]+(s.pressedPositions[k]-s.positions[k])*press,y=s.positions[k+1]+(s.pressedPositions[k+1]-s.positions[k+1])*press,z=s.positions[k+2]+(s.pressedPositions[k+2]-s.positions[k+2])*press;p.setXYZ(i,x*.001,-z*.001,y*.001);const q=V([s.normals[k]+(s.pressedNormals[k]-s.normals[k])*press,s.normals[k+1]+(s.pressedNormals[k+1]-s.normals[k+1])*press,s.normals[k+2]+(s.pressedNormals[k+2]-s.normals[k+2])*press]).normalize();n.setXYZ(i,q.x,-q.z,q.y);}p.needsUpdate=n.needsUpdate=true;this.plug.geometry.computeBoundingBox();this.plug.geometry.computeBoundingSphere();}
  if(this.retainedPacket){const s=this.retainedPacket,p=this.plug.geometry.attributes.position,n=this.plug.geometry.attributes.normal;for(let i=0;i<s.headerVertices;i++){const k=i*3,x=s.nativePositions[k],y=s.nativePositions[k+1],z=s.nativePositions[k+2],nx=s.nativeNormals[k],ny=s.nativeNormals[k+1],nz=s.nativeNormals[k+2],f=releaseField(x,y,z,this.definition.pins,s.roles[i]);p.setXYZ(i,-x*.001,-y*.001,(z-1.25-press*f.delta)*.001);const q=V([-nx,-ny-press*f.dy*nz,nz]).normalize();n.setXYZ(i,q.x,q.y,q.z);}p.needsUpdate=n.needsUpdate=true;this.plug.geometry.computeBoundingBox();this.plug.geometry.computeBoundingSphere();}
  this.mesh.userData.flexState={from,to,t,amount:a,connectorPhase:motion.phase,referenceStockMM:this.stock,measuredMM:this.curve.measuredMM,fixedMM:this.definition.start,freeMM:end.toArray(),port:this.definition.port};
 }
 applyPose(){if(!rolePredicates.get(this)?.())return;const end=this.endpoint(this.amount).sub(V(this.definition.wireExitOffset||[0,0,0])).multiplyScalar(.001);for(const m of[this.plug,this.latch].filter(Boolean)){m.position.copy(end);m.quaternion.identity();m.scale.set(1,1,1);if(m===this.latch)m.position.z-=(this.press||0)*.00065;m.visible=this.mesh.visible;m.updateMatrix();}for(const m of this.wireMeshes||[]){m.visible=this.mesh.visible;m.userData.active=this.mesh.userData.active;}}
 guide(to=0,from=1){return Array.from({length:33},(_,i)=>this.endpoint(from+(to-from)*i/32).multiplyScalar(.001));}
}
function boardComponentLease(viewer,indices){
 const {boards}=assets.boards||{},records=[];
 // Only a source component's own box skin, pins and latch within its exact
 // photo bounds are replaced. No unrelated board/photo face is hidden.
 for(const mesh of viewer.meshes.filter(m=>m.userData.part==='xBuddy'&&m.userData.illustration)){
  const g=mesh.geometry,p=g.attributes.position;if(g.index||['xBuddy / photo','xBuddy / orange'].includes(mesh.name))continue;const removed=[];
  for(let f=0;f<p.count/3;f++)if(indices.some(key=>{const b=xBuddyPortBounds(port(key));return[0,1,2].every(j=>[0,1,2].every(k=>{const x=p.array[f*9+j*3+k]*1000;return x>=b[k]-.0001&&x<=b[k+3]+.0001;}));}))removed.push(f);
  if(!removed.length)continue;const gone=new Set(removed),kept=Array.from({length:p.count/3},(_,i)=>i).filter(i=>!gone.has(i)),next=g.clone();next.setIndex(kept.flatMap(f=>[3*f,3*f+1,3*f+2]));next.setDrawRange(0,kept.length*3);mesh.geometry=next;records.push({mesh,source:g,geometry:next,removed,retained:kept.length});
 }
 return records;
}
function nativeMainFrame(){const b=xBuddyPortBounds(port('Nextruder')),x=(b[0]+b[3])/2-J13_DATUM.footprintCentreZ,z=(b[2]+b[5])/2;return new T.Matrix4().set(0,0,1,x,0,-1,0,165.45172+11.2,1,0,0,z,0,0,0,1);}
function registerEntity(viewer,lease,e){if(viewer.fasteners.entities.has(e.id))throw Error('Duplicate service conductor '+e.id);viewer.fasteners.entities.set(e.id,e);viewer.fasteners.meshes.push(e.mesh);lease.entities.set(e.id,e);}
function sourceSkin(viewer,lease,id){
 const e=viewer.fasteners.entities.get(id),source=e.geometry;if(!source||e.mesh.geometry!==source)throw Error('Actual source cable required '+id);
 const g=source.clone();rememberStorage(g);e.geometry=e.mesh.geometry=g;const record={e,source,curve:e.curve,geometry:g,initialGeometry:g,update:e.update,maintenanceComponent:e.mesh.userData.maintenanceComponent};lease.borrowed.push(record);return record;
}
function retainXFeed(viewer,lease){
 const existing=viewer.fasteners.entities.get('corexy577X');if(existing?.definition?.id!=='corexy577X')throw Error('Known complete CoreXY X feed required');existing.update(3,3,1);
 const r=sourceSkin(viewer,lease,'corexy577X'),e=r.e,g=r.geometry; r.role='xbCompleteX';
 if(g.index||e.jacketCount%3||g.attributes.position.count!==e.jacketCount+e.packetPositions.length/3)throw Error('Exact retained X feed partition required');
 const total=g.attributes.position.count/3;g.setIndex(Array.from({length:e.jacketCount},(_,i)=>i));g.clearGroups();g.addGroup(0,e.jacketCount,0);
 const packet=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(e.packetPositions.slice(),3)).setAttribute('normal',new T.Float32BufferAttribute(e.packetNormals.slice(),3));
 for(const group of e.packetGeometry.groups)packet.addGroup(group.start,group.count,group.materialIndex);
 const materials=(Array.isArray(e.mesh.material)?e.mesh.material:[e.mesh.material]).map(m=>{const n=m.clone();n.userData.originalColor=n.color.clone();n.userData.originalOpacity=n.opacity;return n;});
 lease.sourcePartition={source:'corexy577X',sourceTriangles:total,retainedJacketTriangles:e.jacketCount/3,movedPacketTriangles:packet.attributes.position.count/3,allSourceFacesRetained:total===e.jacketCount/3+packet.attributes.position.count/3,existingFeedStockMM:e.curve.getLength(),addedContinuationStock:'Measured authored fixed prefix plus125mm free bank; not OEM stock'};
 const positions=[],normals=[];for(let j=0;j<8;j++){const i=e.jacketCount-48+j*6+1;positions.push(new T.Vector3().fromBufferAttribute(g.attributes.position,i).toArray());normals.push(new T.Vector3().fromBufferAttribute(g.attributes.normal,i).toArray());}
 const cad=molexCad('5025780400'),headerVertices=e.packetGeometry.groups[0].count;if(headerVertices!==cad.vertices)throw Error('Retained full X housing/source count mismatch');const roles=Array.from({length:headerVertices},(_,i)=>{const group=cad.releaseSkinGroups.find(g=>i>=g.start&&i<g.start+g.count);if(!group)throw Error('Retained X housing source face is untagged');return group.role;});
 return{geometry:packet,materials,splice:{positions,normals},headerVertices,nativePositions:cad.positions,nativeNormals:cad.normals,roles,start:e.curve.getPointAt(1).toArray(),startT:e.curve.getTangentAt(1).toArray()};
}
function makeMain(viewer,lease){
 const r=sourceSkin(viewer,lease,'mainRear'),source=mainPath(rearMainReference.coupled.main).path,stock=source.getLength(),L=Math.max(0,stock-200),fixed=prefix(source,L),F=nativeMainFrame(),C=V([0,0,J13_DATUM.wireCentreZ]).applyMatrix4(F),header=add(viewer,lease,nativeJ13Geometry(J13_DATUM.header).scale(.001,.001,.001),'xbCompleteMainHeader',[mat('#e8e1d1'),mat('#bfc4c5',true),mat('#bfc4c5',true)],{sourcePort:'Nextruder',sourceKind:'shared151-authored-reference'}),plug=add(viewer,lease,nativeJ13Geometry(J13_DATUM.plug).scale(.001,.001,.001),'xbCompleteMainPlug',mat('#e8e1d1'),{sourcePort:'Nextruder',sourceKind:'shared151-authored-reference'});
 r.e.mesh.userData.maintenanceComponent='xbCompleteMain';
 const plugBase={p:Float32Array.from(plug.geometry.attributes.position.array,x=>x*1000),n:plug.geometry.attributes.normal.array.slice()};
 for(const m of[header,plug]){m.matrixAutoUpdate=false;m.matrix.copy(F);for(const k of[12,13,14])m.matrix.elements[k]*=.001;}
 const e={id:'xbCompleteMain',mesh:r.e.mesh,stock,amount:1,update(from,to,t){if(!leaseOwned(lease))return;const motion=clikMateMotion(from,to,t),a=motion.amount;this.amount=a;this.motion=motion;this.mesh.userData.completeMainAmount=a;},guide(to=0,from=1){return Array.from({length:33},(_,i)=>C.clone().add(V([0,18*(1-(from+(to-from)*i/32)),0])).multiplyScalar(.001));},follow(boardDelta){
  if(!leaseOwned(lease))return;
  if(this.last!==this.amount){const end=C.clone().add(V([0,18*(1-this.amount),0])),bank=new FreeMaterialBank({start:fixed.getPointAt(1),startT:fixed.getTangentAt(1),end,endT:V([0,-1,0]),stock:stock-L,direction:[1,.1,0]}),curve=new MaterialJoin(fixed,L,bank),next=closedRound(curve,4,256,8);r.geometry=r.e.geometry=r.e.mesh.geometry=rewriteOwnedGeometry(r.geometry,next);r.e.curve={getLength:()=>stock*.001,getPointAt:(u,out)=>curve.getPointAt(u,out).multiplyScalar(.001),getTangentAt:(u,out)=>curve.getTangentAt(u,out)};this.curve=curve;this.last=this.amount;}
  if(this.surfaceAmount!==this.amount){this.surfaceAmount=this.amount;this.surfaceP=r.geometry.attributes.position.array.slice();this.surfaceN=r.geometry.attributes.normal.array.slice();}
  else{r.geometry.attributes.position.array.set(this.surfaceP);r.geometry.attributes.normal.array.set(this.surfaceN);r.geometry.attributes.position.needsUpdate=r.geometry.attributes.normal.needsUpdate=true;}
  r.geometry.setDrawRange(0,r.geometry.index.count);
  header.matrix.copy(F);for(const k of[12,13,14])header.matrix.elements[k]*=.001;header.matrix.premultiply(boardDelta);header.matrixWorldNeedsUpdate=true;
  plug.matrix.copy(F);for(const k of[12,13,14])plug.matrix.elements[k]*=.001;plug.matrix.elements[13]+=.018*(1-this.amount);plug.matrixWorldNeedsUpdate=true;
  if(this.motion){const p=plug.geometry.attributes.position,n=plug.geometry.attributes.normal;for(let k=0;k<p.count;k++){const q=deformJ13Latch(...plugBase.p.subarray(k*3,k*3+3),...plugBase.n.subarray(k*3,k*3+3),this.motion.press);p.array.set(q.position.map(x=>x*.001),k*3);n.array.set(q.normal,k*3);}p.needsUpdate=n.needsUpdate=true;}
  header.visible=lease.board.visible;plug.visible=r.e.mesh.visible;this.receipt={stockMM:stock,bankMM:stock-L,neutralMeasuredMM:this.curve?.bank.measuredMM+L,wirePortMM:C.clone().add(V([0,18*(1-this.amount),0])).toArray(),outward:[0,1,0],nativePlugFaces:plug.geometry.attributes.position.count/3,nativeHeaderFaces:header.geometry.attributes.position.count/3,amount:this.amount};
 }};
 viewer.fasteners.entities.set(e.id,e);lease.entities.set(e.id,e);lease.main=e;return e;
}
function makeRibbon(viewer,lease){
 const display=viewer.director.resolve([595])[0],native=viewer.fasteners.entities.get('lcdWire');if(!display||!native?.follow)throw Error('Actual assembled LCD datum and source ribbon required');
 const frontMatrix=new T.Matrix4().compose(display.userData.restPosition,display.userData.restQuaternion,display.scale);for(const k of[12,13,14])frontMatrix.elements[k]*=1000;native.follow(frontMatrix,1,true);
 const r=sourceSkin(viewer,lease,'lcdWire'),sourceL=r.e.route.getLength(),stock=sourceL,frontAllowance=12,contact=[[94,35,-24],[96,39.6,-18],[94,39.6,-9]].map(p=>V(p).applyMatrix4(frontMatrix)),frontAxis=V([0,1,0]).transformDirection(frontMatrix);
 const basePoints=amplitude=>{const a=[[-180.9,-122.1,-5.3],[-170,-140,-8],[-150,-140,-8]];for(const x of[-130,-110,-90,-70,-50,-30,-10,10])a.push([x,-140+amplitude*Math.sin(Math.PI*(x+150)/160)**2,-8]);a.push([27.1,-140,-8],[27.1,-175,-26.2],[27.1,-198,-26.2],[27.1,-207,-26.2]);return a;};
 const frontLength=a=>roundedLength([...basePoints(a),...contact.map(p=>p.toArray())],4,.4);const frontTarget=frontLength(0)+frontAllowance;if(frontLength(0)>frontTarget||frontLength(180)<frontTarget)throw Error('Source-derived LCD front allocation cannot bracket '+JSON.stringify({frontTarget,minimum:frontLength(0),maximum:frontLength(180),stock}));let lo=0,hi=180;for(let i=0;i<30;i++){const mid=(lo+hi)/2;if(frontLength(mid)<frontTarget)lo=mid;else hi=mid;}
 const front=snapshotCurve(roundedCablePath([...basePoints((lo+hi)/2).map(V),...contact],.4),1,true,2048),electronics=new T.CatmullRomCurve3([[-180.9,-122.1,-5.3],[-180.9,-60,-5.3],[-180.9,0,-5.3],[-180.9,80,-5.3],[-180.9,130,-5.3],[-170,170,-8],[-110,173,-16],[-110,173,-6],[-110,173,4],[-110,173,10],[-110,173,15],[-137,190.5,30],[-137,190.5,65],[-137,190.5,85]].map(V),false,'centripetal');electronics.arcLengthDivisions=2048;electronics.updateArcLengths();electronics.stockMM=electronics.getLength();
 const frontL=front.getLength(),fixed=new MaterialJoin(front,frontL,electronics),L=frontL+electronics.getLength();fixed.stockMM=L;const A=fixed.getPointAt(1),At=fixed.getTangentAt(1),C=V([-136.43665,174.418788623827,120.9796]),N=544,W=68,profileCount=34;
 lease.lcdAllocation={totalStockMM:stock,frontTargetMM:frontTarget,frontMeasuredMM:frontL,baseAndElectronicsMM:electronics.getLength(),freeBankMM:stock-L,frontDatum:'Native CAD595 rest transform; original LCD local route scalars and rounded-path algorithm',baseFold:'Existing30mm/0.8mm material with existing accordion profile; no width/gauge reduction'};
 r.e.mesh.userData.maintenanceComponent='xbCompleteLcd';
 const packet=[];
 for(let i=0;i<2;i++){const original=[];assets.scenes[i].scene.traverse(m=>{if(m.isMesh)original.push(m);});if(original.length!==1)throw Error('Expected one full TE source mesh');const id=i===0?'xbCompleteLcdPlug':'xbCompleteLcdSocket',m=add(viewer,lease,original[0].geometry.clone(),id,mat(i===0?'#af3141':'#404447'),{sourcePort:'xLCD',sourceKind:'shared151-authored-reference',sourceAllFaces:true});m.matrixAutoUpdate=false;packet.push(m);}
 const baseMatrices=[assets.calibration.rootFromPlugNativeMM,assets.calibration.rootFromSocketNativeMM].map(mmMatrix);
 const e={id:'xbCompleteLcd',mesh:r.e.mesh,stock,amount:1,update(from,to,t){if(!leaseOwned(lease))return;this.amount=from+(to-from)*S(t);},guide(to=0,from=1){return Array.from({length:33},(_,i)=>C.clone().add(V([0,14*(1-(from+(to-from)*i/32)),0])).multiplyScalar(.001));},follow(boardDelta){
  if(!leaseOwned(lease))return;
  if(this.last!==this.amount){
   const end=C.clone().add(V([0,14*(1-this.amount),0])),bank=new FreeMaterialBank({start:A,startT:At,end,endT:V([1,0,0]),stock:stock-L,direction:[1,.1,0]}),curve=new MaterialJoin(fixed,L,bank),g=r.geometry,p=g.attributes.position,n=g.attributes.normal,frames=curve.computeFrenetFrames(N,false),axis=new T.Vector3(),normal=new T.Vector3();
   for(let i=0;i<=N;i++){const u=i/N,s=u*stock,c=curve.getPointAt(u),tangent=curve.getTangentAt(u),near=stock-s,baseFold=S((s-30)/45)*(1-S((s-stock+30)/20)),target=s<12?frontAxis:V([0,0,1]);axis.copy(target).addScaledVector(tangent,-target.dot(tangent));if(axis.lengthSq()<.05)axis.copy(V([1,0,0])).addScaledVector(tangent,-tangent.x);axis.normalize();normal.crossVectors(tangent,axis).normalize();const angle=Math.PI*Math.min(S((near-.5)/3),S((s-.5)/3)),shape=baseFold>0?baseRibbonProfile(angle,baseFold):ribbonProfile(angle);
    for(let j=0;j<W;j++){const a=shape[j<profileCount?j:W-1-j],side=j<profileCount?-1:1,du=-Math.sin(a.phi)*side,dw=Math.cos(a.phi)*side,d=axis.clone().multiplyScalar(du).addScaledVector(normal,dw),point=c.clone().addScaledVector(axis,a.u).addScaledVector(normal,a.w).addScaledVector(d,.4),k=i*W+j;p.setXYZ(k,point.x*.001,point.y*.001,point.z*.001);n.setXYZ(k,d.x,d.y,d.z);}
   }
   p.needsUpdate=n.needsUpdate=true;g.setDrawRange(0,g.index.count);g.computeBoundingBox();g.computeBoundingSphere();this.curve=curve;this.last=this.amount;
  }
  if(this.surfaceAmount!==this.amount){this.surfaceAmount=this.amount;this.surfaceP=r.geometry.attributes.position.array.slice();this.surfaceN=r.geometry.attributes.normal.array.slice();}
  else{r.geometry.attributes.position.array.set(this.surfaceP);r.geometry.attributes.normal.array.set(this.surfaceN);r.geometry.attributes.position.needsUpdate=r.geometry.attributes.normal.needsUpdate=true;}
  r.geometry.setDrawRange(0,r.geometry.index.count);
  packet.forEach((m,i)=>{m.matrix.copy(baseMatrices[i]);if(i===0)m.matrix.elements[13]+=.014*(1-this.amount);else m.matrix.premultiply(boardDelta);m.matrixWorldNeedsUpdate=true;m.visible=i===0?r.e.mesh.visible:lease.board.visible;});
  this.receipt={stockMM:stock,sourceGeneratedRouteMM:sourceL,newFreeBankMM:stock-L,bankMeasuredMM:this.curve?.bank.measuredMM,wirePortMM:C.clone().add(V([0,14*(1-this.amount),0])).toArray(),widthMaterialMM:30,gaugeMM:.8,vertices:r.geometry.attributes.position.count,triangles:r.geometry.index.count/3,sourceTopologyLiteral:r.geometry.index.array.every((x,i)=>x===r.source.index.array[i]),amount:this.amount};
 }};
 viewer.fasteners.entities.set(e.id,e);lease.entities.set(e.id,e);lease.ribbon=e;return e;
}
const roleDefinitions=[
 // The +Y bank crossed native rear-frame42/66. Pay out the same310mm in
 // a +X/+Y bight rising toward +Z, blending toward +Y at the board.
 // This illustrative bank retains both endpoints, estimated gauge and stock.
 {id:'xbCompleteX',port:'X',pins:4,radius:1.7,start:[-120,192,280],startT:[0,0,-1],endT:[0,-1,0],wireExitOffset:[0,3,0],side:1,bankStock:125,direction:[1,.1,0],fixedRoute:[[-120,192,274],[-134,179,261],[-134,179,250],[-134,179,238]],samples:384},
 {id:'xbCompleteY',port:'Y',pins:4,radius:1.3,start:[193,108.35,330],startT:[-1,0,0],side:1,bankStock:140,direction:[0,.3,-1],fixedRoute:[[193,110,325],[180,110,325],[170,110,325],[160,110,325],[150,135,280],[140,145,280],[130,145,280],[100,145,280],[70,145,280],[0,145,280],[-70,145,280],[-120,145,280],[-140,145,280],[-172,176,283],[-158,177,300],[-141,177,303],[-139,177,260],[-139,177,238]],samples:512},
 {id:'xbCompleteMmu',port:'MMU',pins:6,radius:1.4,stock:138,start:[-113.48459058906943,175.13632,177.69546358869096],startT:[0,1,0],side:-1},
 {id:'xbCompletePanic',port:'PWR_PAN',pins:2,radius:1.05,stock:255,start:[-126,143,15],startT:[0,1,0],side:-1}
];
export function retireXBuddyCompleteOwner(viewer){nativeRetiring.add(viewer);knownCompleteCapabilities.get(viewer)?.retire();}
export function followXBuddyCompleteOwner(viewer){knownCompleteCapabilities.get(viewer)?.follow();}
export function installXBuddyCompleteOwner(viewer){
 if(viewer.disposed||nativeRetiring.has(viewer))throw Error('Cannot install xBuddy on a disposing viewer');
 if(owners.has(viewer)||viewer.xBuddyComplete)throw Error('Existing xBuddy replacement owner');
 let active=true,lease=null,publisherMethods=null,lastLoss=null,releaseDependency;
 function depend(){if(releaseDependency)return;if(!viewer.crossflowTie13?.active)throw Error('xBuddy requires the current known R13 generation');releaseDependency=registerCrossflowDependent13(viewer,retire);}
 const baseCurrent=()=>active&&!viewer.disposed&&!nativeRetiring.has(viewer)&&owners.get(viewer)===api&&Object.getOwnPropertyDescriptor(viewer,'xBuddyComplete')?.value===api;
 function current(){
  if(!baseCurrent()||publisherMethods&&!methodsCurrent(api,publisherMethods)){
   if(lease?.active&&!viewer.disposed&&!nativeRetiring.has(viewer))lose([{reason:'foreign publisher/callable',all:true}]);
   return false;
  }return true;
 }
 function lose(losses){
  if(!lease?.active)return;lastLoss=losses.map(r=>({reason:r.reason,id:r.id,role:r.role,roles:r.roles,all:r.all}));
  retireKnown(losses);
 }
 function restore(losses=[]){
  const old=lease;if(!old)return;const guard=leaseGuards.get(old)?.guard;lease=null;old.active=false;
  const borrowedKept=r=>retained.roles.has(r.role||(r.e.id==='mainRear'?'xbCompleteMain':'xbCompleteLcd'))||keep.has(r.e.mesh);
  const retained=guard?.retained(losses)||{roles:new Set(),meshes:new Set()},keep=retained.meshes,keptGeometries=new Set([...keep].flatMap(m=>[ownDataValue(m,'geometry'),guard?.geometryForMesh(m)]).filter(Boolean));
  if(old.sentinel&&(!guard||guard.canDisposeGeometry(old.sentinel)))old.sentinel.removeEventListener('dispose',old.onSourceDispose);
  for(const e of old.ties||[])if(!keep.has(e.mesh))e.retire();
  for(const[id,e]of old.entities)if(!retained.roles.has(id)&&viewer.fasteners?.entities.get(id)===e)viewer.fasteners.entities.delete(id);
  for(const r of old.borrowed){if(borrowedKept(r))continue;const owned=r.e.geometry===r.geometry&&r.e.mesh.geometry===r.geometry;if(r.e.geometry===r.geometry)r.e.geometry=r.source;if(r.e.mesh.geometry===r.geometry)r.e.mesh.geometry=r.source;if(owned){r.e.curve=r.curve;if(Object.hasOwn(r.e,'lastKey'))r.e.lastKey='';if(Object.hasOwn(r.e,'poseKey'))r.e.poseKey='';}if(r.e.mesh.userData.maintenanceComponent===({mainRear:'xbCompleteMain',lcdWire:'xbCompleteLcd'}[r.e.id])){if(r.maintenanceComponent===undefined)delete r.e.mesh.userData.maintenanceComponent;else r.e.mesh.userData.maintenanceComponent=r.maintenanceComponent;}}
  for(const r of old.proxies)if(!keep.has(r.mesh)&&r.mesh.geometry===r.geometry)r.mesh.geometry=r.source;
  const gone=new Set();for(const m of old.added)if(!keep.has(m)&&m.geometry===old.owned?.get(m)?.geometry){m.removeFromParent();gone.add(m);}
  if(!guard||guard.containersCurrent()){for(const key of['meshes','records'])if(Array.isArray(viewer[key]))viewer[key].splice(0,viewer[key].length,...viewer[key].filter(m=>!gone.has(key==='records'?m.mesh:m)));if(viewer.fasteners?.meshes)viewer.fasteners.meshes.splice(0,viewer.fasteners.meshes.length,...viewer.fasteners.meshes.filter(m=>!gone.has(m)));}
  const geoms=new Set([...old.owned].filter(([m])=>!keep.has(m)).map(([,r])=>r.geometry).concat(old.borrowed.filter(r=>!borrowedKept(r)).flatMap(r=>[r.geometry,r.initialGeometry]),old.proxies.filter(r=>!keep.has(r.mesh)).map(r=>r.geometry))),mats=new Set([...old.owned].filter(([m])=>!keep.has(m)).flatMap(([,r])=>Array.isArray(r.material)?r.material:[r.material]));
  // Publish all restoration/removal before resource notifications can reenter.
  const keptMaterials=new Set([...keep].flatMap(m=>{const material=ownDataValue(m,'material');return Array.isArray(material)?material:[material];}));
  const disposedGeometry=[],skippedGeometry=[];for(const g of geoms){if(!keptGeometries.has(g)&&(!guard||guard.canDisposeGeometry(g))){disposedGeometry.push(g.uuid);g.dispose();}else skippedGeometry.push(g.uuid);}for(const m of mats)if(!keptMaterials.has(m)&&(!guard||guard.canDisposeMaterial(m)))m.dispose();api.retirementReceipt={disposedGeometry,skippedGeometry};
 }
 function acquire(){
  if(!assets)throw Error('Await prepareXBuddyCompleteAssets before creating xBuddy CAD');
  const q={active:true,added:[],borrowed:[],entities:new Map(),proxies:[],ties:[],owned:new Map()},internal={guard:null,view:null,pins:null};const check=()=>{if(!current()||lease!==q||Object.getOwnPropertyDescriptor(q,'active')?.value!==true)return false;if(Object.getOwnPropertyDescriptor(q,'current')?.value!==check||(internal.guard&&(Object.getOwnPropertyDescriptor(q,'guard')?.value!==internal.view||!methodsCurrent(internal.view,internal.pins)))){lose([{reason:'foreign lease/current/guard capability',all:true}]);return false;}const losses=internal.guard?.losses()||[];if(losses.length){lose(losses);return false;}return true;};q.current=check;lease=q;leasePredicates.set(q,check);leaseGuards.set(q,internal);const capability={current:check,publishMesh:m=>internal.guard?.publish(m)};
  try{for(const entry of roleDefinitions){const d={...entry};if(d.port==='X'){d.retainedPacket=retainXFeed(viewer,q);d.start=d.retainedPacket.start;d.startT=d.retainedPacket.startT;}else if(d.port==='Y'){const source=viewer.fasteners.entities.get('motorYWire');if(!source?.curve)throw Error('Actual motor lead source required');d.start=source.curve.getPointAt(1).multiplyScalar(1000).toArray();const p=source.geometry.attributes.position,n=source.geometry.attributes.normal;d.splice={positions:[],normals:[]};for(let j=0;j<8;j++){const k=p.count-9+j;d.splice.positions.push(new T.Vector3().fromBufferAttribute(p,k).toArray());d.splice.normals.push(new T.Vector3().fromBufferAttribute(n,k).toArray());}}const e=new SignalRole(viewer,q,d);registerEntity(viewer,q,e);signalSocket(viewer,q,e);}makeMain(viewer,q);makeRibbon(viewer,q);q.proxies=boardComponentLease(viewer,['Nextruder','xLCD','X','Y','MMU','PWR_PAN']);}catch(e){restore();throw e;}
  for(const id of['box1','box2','box4']){const tie=installUpperTie(viewer,capability,id);q.ties.push(tie);registerEntity(viewer,q,tie);}
  q.board=viewer.meshes.find(m=>m.name==='xBuddy / photo');if(!q.board)throw Error('Actual current board required');q.boardRest=new T.Matrix4().compose(q.board.userData.restPosition,q.board.userData.restQuaternion,q.board.scale);q.boardRestRoot=q.boardRest.clone();
  // Finish the one topology allocation before sealing the resource identities.
  q.main.follow(new T.Matrix4());q.ribbon.follow(new T.Matrix4());
  q.owned=new Map(q.added.map(m=>[m,{geometry:m.geometry,material:m.material}]));internal.guard=createXBuddyLeaseGuard(viewer,q);internal.view={losses:internal.guard.losses.bind(internal.guard),canDisposeGeometry:internal.guard.canDisposeGeometry.bind(internal.guard),canDisposeMaterial:internal.guard.canDisposeMaterial.bind(internal.guard)};internal.pins=methodSnapshot(internal.view,['losses','canDisposeGeometry','canDisposeMaterial']);q.guard=internal.view;q.sentinel=q.board.geometry;q.onSourceDispose=()=>{if(current()&&lease===q&&q.active)retire();};q.sentinel.addEventListener('dispose',q.onSourceDispose);
 }
 function retireKnown(losses){if(!active&&!lease)return;active=false;if(owners.get(viewer)===api)owners.delete(viewer);if(Object.getOwnPropertyDescriptor(viewer,'xBuddyComplete')?.value===api)delete viewer.xBuddyComplete;const transaction=releaseDependency?.('begin');releaseDependency=undefined;try{transaction?.retireLater();}finally{try{restore(losses);}finally{transaction?.finish();}}}
 function retire(){retireKnown(leaseGuards.get(lease)?.guard?.losses()||[]);}
 const api={get active(){return current();},get lease(){return lease;},get ownershipLoss(){return lastLoss;},prepare(task){if(!current()){if(task?.id==='xbuddy')throw Error(lastLoss?'xBuddy resources have a foreign owner; retire that owner before reacquiring':'The known xBuddy/R13 generation has retired');return;}if(lease&&!leaseOwned(lease))return;if(task?.id!=='xbuddy'){releaseDependency?.();releaseDependency=undefined;restore();return;}depend();if(!lease)acquire();},
  follow(){if(!lease||!leaseOwned(lease)||viewer.operationScene?.plan.serviceTask!=='xbuddy')return;
   const b=lease.board;b.updateMatrix();const delta=b.matrix.clone().multiply(lease.boardRest.clone().invert());lease.main.follow(delta);lease.ribbon.follow(delta);for(const r of lease.signalHeaders||[]){r.mesh.matrix.copy(r.base).premultiply(delta);r.mesh.matrixWorldNeedsUpdate=true;r.mesh.visible=b.visible;}for(const e of lease.ties)e.follow(viewer.operationScene.plan.step);
   for(const e of lease.entities.values())if(e instanceof SignalRole)e.applyPose();
   api.receipt={roles:[...lease.entities.values()].map(e=>({id:e.id,amount:e.amount,stockMM:e.stock,sourcePort:e.definition?.port,portMM:e.endpoint?.(e.amount).toArray(),measuredMM:e.curve?.measuredMM,detail:e.receipt})),singleBedProvider:viewer.bedFamily15?.active===true,sourcePartition:lease.sourcePartition,proxies:lease.proxies.map(r=>({mesh:r.mesh.name,removed:r.removed,retained:r.retained}))};
  },
  decorate(spec,task,index,text){
   if(!lease||!leaseOwned(lease)||task.id!=='xbuddy')return spec;
   const n=index+1,plan={...spec.plan,officialId:task.steps[index].officialId,source:task.steps[index].source,localStep:n,safetyState:n<5?'preparation':n===5?'lower-bed-then-switch-off-and-unplug':n<34?'cold-and-unplugged':'reconnect-then-calibrate',actors:[...spec.plan.actors],workpiecePoses:[...(spec.plan.workpiecePoses||[])]},hidden=[...(spec.hidden||[])],flexStates={...spec.flexStates};
   const phases={xbCompleteX:[10,29],xbCompleteY:[10,29],xbCompleteMmu:[10,23],xbCompletePanic:[10,26],xbCompleteMain:[10,27],xbCompleteLcd:[10,27]};
   for(const[id,[out,inside]]of Object.entries(phases))flexStates[id]=n>out&&n<=inside?0:1;
   for(const e of lease.ties)flexStates[e.id]=n<=10?1:0;
   // All referenced meshes are actual registered full surfaces, not empty
   // diagram actions. Static preparation/ESD pages intentionally have no actor.
   const roleActor=(id,connect)=>{
    const e=lease.entities.get(id),p=e.definition?.port|| (id==='xbCompleteMain'?'Nextruder':'xLCD'),keyed=p==='xLCD'||p==='PWR_PAN',label=p+': '+text(connect?['コネクターを接続する','Seat the connector','Zapojit konektor','Stecker einsetzen']:keyed?['向きを保って端子を抜く','Withdraw the connector without twisting','Vytáhnout konektor bez otáčení','Stecker ohne Verdrehen abziehen']:['ラッチを解除して端子を抜く','Release the latch and unplug','Uvolnit západku a odpojit','Verriegelung lösen und abziehen']);
    return {flex:[id],fromStates:{[id]:connect?0:1},to:connect?1:0,label,showBefore:true,focusMotion:true,camera:'xbuddy-board-perspective',sourcePort:p,focusBounds:xBuddyPortBounds(port(p),20)};
   };
   if(n===10){
    const zr=plan.actors.find(a=>a.refs?.includes('splitterZRPlug')),bottom=plan.actors.filter(a=>a.tie13Operation);
    const upper=[];for(const e of lease.ties)upper.push({flex:[e.id],fromStates:{[e.id]:1},to:0,label:text(['配線を避けてバンドを切り、抜き取る','Cut clear of wires and withdraw the tie','Přestřihnout mimo vodiče a vytáhnout pásku','Mit Abstand zu Leitungen schneiden und Binder herausziehen']),showBefore:true,focusMotion:true,upperTieRemoval:true});
    plan.actors=[roleActor('xbCompleteX',false),roleActor('xbCompleteY',false),...(zr?[zr]:[]),roleActor('xbCompleteMmu',false),...upper,...bottom,roleActor('xbCompleteLcd',false),roleActor('xbCompleteMain',false),roleActor('xbCompletePanic',false)];
   }
   if(n===23)plan.actors=[roleActor('xbCompleteMmu',true)];
   if(n===26)plan.actors=[roleActor('xbCompletePanic',true),...plan.actors];
   if(n===27)plan.actors=[roleActor('xbCompleteMain',true),roleActor('xbCompleteLcd',true),...plan.actors];
   if(n===29){plan.actors=[roleActor('xbCompleteX',true),roleActor('xbCompleteY',true)];for(const id of['box1','box2','box4'])plan.actors.push({flex:[id],fromStates:{[id]:1},to:4,label:text(['配線束を締めすぎず固定する','Secure the bundle without overtightening','Zajistit svazek bez přílišného utažení','Kabelbündel ohne Überziehen sichern']),showBefore:true,focusMotion:true},{flex:[id],fromStates:{[id]:4},to:5,label:text(['配線を避けて余りを切る','Trim the tail clear of wires','Odstřihnout konec mimo vodiče','Überstand mit Abstand zu Leitungen abschneiden']),showBefore:true});}
   // Borrowed full cable skins receive deformation after the original source
   // frame update, so source LCD-follow cannot overwrite the current native join.
   plan.visibleRefs=[...(plan.visibleRefs||[]),...(spec.isolated?lease.added.filter(m=>(m.userData.component==='xbCompleteMainHeader'||m.userData.component?.endsWith('Socket'))):lease.added).map(m=>m.userData.component),...(spec.isolated?[]:['mainRear','lcdWire','corexy577X'])];
   if(spec.isolated)spec={...spec,isolated:[...spec.isolated,'xbCompleteMainHeader','xbCompleteLcdSocket',...(lease.signalHeaders||[]).map(r=>r.mesh.userData.component)]};
   plan.solidRefs=[...new Set([...(plan.solidRefs||[]),...plan.visibleRefs])];
   const covered=new Set(['xb-unplug-upper','xb-unplug-lower','xb-power-out','xb-heat-in','xb-mmu-in','xb-power-in','xb-z-panic-in','xb-main-lcd-in','xb-sensors-in','xb-xy-in','xb-bed-out-in','xb-ties-in','xb-wiring-check']);
   return {...spec,plan,hidden,flexStates,pendingOperations:spec.pendingOperations.filter(x=>!covered.has(x))};
  },retire
 };publisherMethods=methodSnapshot(api,['prepare','follow','decorate','retire']);owners.set(viewer,api);viewer.xBuddyComplete=api;knownCompleteCapabilities.set(viewer,{retire,follow:api.follow.bind(api)});return api;
}
