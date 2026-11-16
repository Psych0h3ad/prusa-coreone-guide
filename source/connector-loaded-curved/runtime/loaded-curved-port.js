// Source-factory integration; no viewer/R13/R15 method wrappers. Code MIT.
import * as T from 'three';
import {createMountedContactConstraint} from './loaded-mounted-contact.js';
import {SOCKETS} from './loveboard-layout.js';
import {molexCad} from './molex-cad.js';
import {createLeafBuffers,rewriteLeaf} from './loaded-contact-state.js';
import {LOVEBOARD_ROUTES} from './loveboard-service-routing.js';
import {SERVICE_FAN_ROUTES} from './service-fan-routing.js';
import {molexSocketFrame} from './molex-frames.js';
import {captureGeometryStorage,geometryStorageCurrent,ownDataValue,methodSnapshot,methodsCurrent} from './xbuddy-lease-guards.js';
import {MaterialPolyline,CurvedTermination} from './loaded-material-curve.js';
import {loadedCurvedAssets} from './loaded-curved-assets.js';
import {MOTOR_DUCT,createMotorDuctCurves} from './loaded-motor-duct.js';
import {extendLayeredGeometry,writeLayeredGeometry,makeLoadedMaterials} from './loaded-layered-geometry.js';
const records=new WeakMap(),peers=new WeakMap(),bindings=new WeakMap();
const definitions={lbMotorLead:{socket:'J4',wires:4,samples:80,sides:6,reverse:true},lbLoadcellLead:{socket:'J14',wires:4,samples:80,sides:6,reverse:true},lbFilamentLead:{socket:'J2',wires:3,samples:80,sides:6,reverse:true},lbNtcLead:{socket:'J12',wires:2,samples:80,sides:6},servicePrintLead:{socket:'J5',wires:3,samples:96,sides:6},serviceHotendFanLead:{socket:'J6',wires:3,samples:96,sides:6},hotendThermistor0:{socket:'J1',wires:1,pins:2,slot:0,samples:256,sides:8,winding:-1},hotendThermistor1:{socket:'J1',wires:1,pins:2,slot:1,samples:256,sides:8,winding:-1}};
// Conservative full-source bounds prevent an unloaded, transversely parked
// plug from retaining the axial-reference contact deflection. No clearance
// tolerance or cropped header geometry is used. Overlap is not a fit proof.
let mountedContact;
const headerBounds=new Map(),contactProbe=createLeafBuffers(),restContactBounds=new T.Box3().setFromBufferAttribute(new T.BufferAttribute(contactProbe.positions,3));
export function mountedContactForPort(socket,relative,slots){
 const part=SOCKETS[socket].manufacturerPart;
 if(!headerBounds.has(part))headerBounds.set(part,new T.Box3().setFromBufferAttribute(new T.BufferAttribute(molexCad(part).positions,3)));
 rewriteLeaf(contactProbe,loadedCurvedAssets().parameters.maximumLeafAngleRadians);const span=restContactBounds.clone().union(new T.Box3().setFromBufferAttribute(new T.BufferAttribute(contactProbe.positions,3)));span.min.x+=Math.min(...slots);span.max.x+=Math.max(...slots);span.min.y+=.05;span.max.y+=.05;span.applyMatrix4(relative);
 const supportBoundsOverlap=headerBounds.get(part).intersectsBox(span);
 mountedContact??=createMountedContactConstraint(loadedCurvedAssets().parameters);return mountedContact(relative,slots,SOCKETS[socket].pins,{supportBoundsOverlap});
}
const nativeMap=new T.Matrix4().set(-1,0,0,0,0,0,1,-1.25,0,1,0,0,0,0,0,1);
export function loveboardNativeFrame(e,frame){const d=e.socket,m=d.out[1]||d.out[0]?new T.Matrix4().set(0,-1,0,0,1,0,0,0,0,0,1,0,0,0,0,1):new T.Matrix4();return frame.clone().multiply(m).multiply(nativeMap);}
export function fanNativeFrame(end,quaternion){return new T.Matrix4().makeRotationFromQuaternion(quaternion).setPosition(end.clone().multiplyScalar(1000)).multiply(new T.Matrix4().set(0,-1,0,0,0,0,1,0,-1,0,0,0,0,0,0,1)).multiply(nativeMap);}
export function bindLoadedThermistorPair(a,b){if(!a||!b)return;peers.set(a,b);peers.set(b,a);const r=records.get(b),first=records.get(a);if(r&&first?.frame)apply(r,first.frame);}
export function bindLoadedPortViewer(viewer){for(const id of Object.keys(definitions)){const e=viewer.fasteners.entities.get(id);if(e)bindings.set(e,{viewer,fasteners:viewer.fasteners,id});}}
function current(r){const b=bindings.get(r.e);return r.active&&methodsCurrent(r.e,r.nativeMethods)&&(!r.plug||ownDataValue(r.e,'plug')===r.plug&&methodsCurrent(r.plug,r.plugMethods))&&(!b||!b.viewer.disposed&&b.viewer.fasteners===b.fasteners&&b.fasteners.entities.get(b.id)===r.e)&&r.e.geometry===r.g&&r.e.mesh===r.mesh&&r.mesh.geometry===r.g&&r.mesh.material===r.material&&geometryStorageCurrent(r.storage)&&ownDataValue(r.g.attributes,'uv')===r.uv&&(!r.uv||ownDataValue(r.uv,'array')===r.uva&&methodsCurrent(r.uv,r.uvMethods));}
export function canWriteLoadedCurvedPort(e){const r=records.get(e);return !r||current(r);}
function captureSource(e,d){const p=e.geometry.attributes.position,n=e.geometry.attributes.normal,per=(d.samples+1)*(d.sides+1),paths=[],seeds=[];for(let w=0;w<d.wires;w++){const points=[];for(let i=0;i<=d.samples;i++){const c=new T.Vector3();for(let j=0;j<d.sides;j++)c.add(new T.Vector3().fromBufferAttribute(p,w*per+i*(d.sides+1)+j));points.push(c.multiplyScalar(1000/d.sides));}paths.push(new MaterialPolyline(points));seeds.push(new T.Vector3().fromBufferAttribute(n,w*per));}return{paths,seeds};}
function initialize(e,d,source){const g=e.geometry,mesh=e.mesh,oldMaterial=mesh.material,sourceMaterialArray=Array.isArray(oldMaterial),materials=sourceMaterialArray?[...oldMaterial]:[oldMaterial],extra=makeLoadedMaterials(materials[0]);materials.push(extra[1],extra[2]);const stock=loadedCurvedAssets().stocks[e.id]?.stockMM?.slice();if(stock?.length!==d.wires||stock.some(x=>!Number.isFinite(x)))throw Error('Existing per-conductor stock required: '+e.id);
 const layout=extendLayeredGeometry(g,{...d,winding:d.winding??1,baseMaterials:sourceMaterialArray?oldMaterial.length:1,sourceMaterialArray});mesh.material=materials;
 const uv=g.attributes.uv,r={e,d,g,mesh,material:materials,layout,stock,prefixFraction:loadedCurvedAssets().stocks[e.id].protectedPrefixFraction,handleFraction:loadedCurvedAssets().stocks[e.id].bankHandleFraction,bankTurns:loadedCurvedAssets().stocks[e.id].bankTurnRadians,bankDirectionNative:loadedCurvedAssets().stocks[e.id].bankDirectionNative,source,frame:null,active:true,nativeMethods:methodSnapshot(e,['update']),plug:ownDataValue(e,'plug'),plugMethods:ownDataValue(e,'plug')?methodSnapshot(ownDataValue(e,'plug'),['write']):null,storage:captureGeometryStorage(g),uv,uva:uv?.array,uvMethods:uv?methodSnapshot(uv,['setXY','needsUpdate']):null};g.addEventListener('dispose',()=>{r.active=false;});records.set(e,r);return r;
}
function apply(r,frame){if(!current(r))return false;r.frame=frame.clone();const{e,d,source}=r,pins=d.pins??d.wires,slots=Array.from({length:d.wires},(_,w)=>((d.slot??(d.reverse?pins-1-w:w))-(pins-1)/2)*1.5),radii=Array(d.wires).fill(e.definition?.wireRadius??(e.id.startsWith('lb')?.26:e.id.startsWith('service')?.32:e.radius)),duct=e.id==='lbMotorLead',curves=duct?createMotorDuctCurves(source.paths,r.stock,frame,slots):source.paths.map((c,i)=>new CurvedTermination(c,r.stock[i],frame,slots[i],r.stock[i]*r.prefixFraction,r.handleFraction,r.bankTurns[i],r.bankDirectionNative));
 const relative=molexSocketFrame(d.socket).invert().multiply(frame),dMM=Math.max(0,Math.min(7,-relative.elements[13])),contact=mountedContactForPort(d.socket,relative,slots);writeLayeredGeometry(r.layout,{curves,radii,seeds:source.seeds,nativeFrame:frame,slots,contactAngle:contact.angleRadians,contactAngles:contact.rows.map(r=>r.angleRadians)});
 e.loadedCurved={...(duct?{routeMode:'analytic-source-motor-duct',referenceRoutingParameters:MOTOR_DUCT}:{}),socket:d.socket,stockAuthority:'Existing assembled per-conductor rendered reference stock, unchanged',stockMM:r.stock,radiiMM:radii,coreRadiusMM:.22,curves,slots,sourcePaths:source.paths,nativeFrameMM:frame.clone(),relativeHeaderFrame:relative.clone(),contact,withdrawalMM:dMM,measuredMM:curves.map(c=>c.measuredMM),stripPointsMM:curves.map(c=>c.getPointAt((c.getLength()-1.7)/c.getLength()).toArray()),coreEndsMM:curves.map(c=>c.getPointAt(1).toArray()),sourceStartsMM:source.paths.map(c=>c.getPointAt(0).toArray()),layout:r.layout};return true;
}
export function writeLoadedCurvedPort(e,frame){const d=definitions[e.id];if(!d)return;let r=records.get(e);if(r&&!current(r))return;const source=captureSource(e,d);if(!r)r=initialize(e,d,source);else r.source=source;
 const peer=peers.get(e),peerRecord=peer&&records.get(peer),actualFrame=frame??peerRecord?.frame;if(actualFrame)apply(r,actualFrame);if(e.id==='hotendThermistor0'&&peerRecord&&frame)apply(peerRecord,frame);
}
