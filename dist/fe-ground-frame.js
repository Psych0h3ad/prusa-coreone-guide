// MIT. Source-registered native frame; explicit retirement before the known PE owner.
import * as T from 'three';
import {writeNativeGroundLead} from './fe-ground-lead.js';
import {ownDataValue,captureGeometryStorage,geometryStorageCurrent,methodSnapshot,methodsCurrent} from './xbuddy-lease-guards.js';
const sources=new WeakMap();
export function registerNativeFeSource(h){
 if(sources.has(h))throw Error('Native FE source already registered');const m=h.lead,g=m.geometry,b=h.barrel;m.updateMatrix();
 sources.set(h,{mesh:m,geometry:g,storage:captureGeometryStorage(g),aperture:b,apertureGeometry:b.geometry,apertureStorage:captureGeometryStorage(b.geometry),matrix:m.matrix,matrixElements:m.matrix.elements,restMatrix:m.matrix.clone(),restAuto:m.matrixAutoUpdate,applyMatrix:g.applyMatrix4,applyMethods:methodSnapshot(g,['applyMatrix4']),active:false});
}
function sourceCurrent(h,r){return !!r&&ownDataValue(h,'lead')===r.mesh&&ownDataValue(r.mesh,'geometry')===r.geometry&&r.mesh.matrix===r.matrix&&r.matrix.elements===r.matrixElements&&geometryStorageCurrent(r.storage)&&methodsCurrent(r.geometry,r.applyMethods)&&ownDataValue(h,'barrel')===r.aperture&&ownDataValue(r.aperture,'geometry')===r.apertureGeometry&&geometryStorageCurrent(r.apertureStorage);}
const versionsCurrent=r=>r.storage.p.a.version===r.pVersion&&r.storage.n.a.version===r.nVersion;
export function nativeFeFrameCurrent(h){const r=sources.get(h);return sourceCurrent(h,r)&&r.active&&versionsCurrent(r)&&h.lead.matrixAutoUpdate===false&&h.lead.matrix.equals(r.relative);}
export function nativeFeApertureFrame(viewer){const h=viewer.feHardware,r=sources.get(h);if(!sourceCurrent(h,r))throw Error('Native FE aperture/source storage changed');viewer.printer.updateWorldMatrix(true,true);return viewer.printer.matrixWorld.clone().invert().multiply(r.aperture.matrixWorld);}
export function writeNativeFeApertureFrame(viewer,curve,sourceFrames,cadFrame){
 const h=viewer.feHardware,r=sources.get(h);if(!sourceCurrent(h,r)||h.serviceFollow||r.active&&!versionsCurrent(r))throw Error('Native FE frame does not own current source storage');const m=r.mesh,b=r.aperture;
 b.updateWorldMatrix(true,false);m.parent.updateWorldMatrix(true,false);const relative=m.parent.matrixWorld.equals(b.parent.matrixWorld)?b.matrix.clone():m.parent.matrixWorld.clone().invert().multiply(b.matrixWorld);
 writeNativeGroundLead(r.geometry,curve,sourceFrames,cadFrame.clone().invert());m.matrixAutoUpdate=false;m.matrix.copy(relative);m.matrix.decompose(m.position,m.quaternion,m.scale);m.matrixWorldNeedsUpdate=true;
 Object.assign(r,{active:true,relative:relative.clone(),cadFrame:cadFrame.clone(),pVersion:r.storage.p.a.version,nVersion:r.storage.n.a.version});
}
export function prepareNativeFeService(h){
 const r=sources.get(h);if(!r?.active)return;
 if(h.serviceFollow||!sourceCurrent(h,r)||!versionsCurrent(r))throw Error('Native FE handoff requires its current unleased source storage');
 const pose=new T.Matrix4().compose(r.mesh.position,r.mesh.quaternion,r.mesh.scale);if(!pose.equals(r.relative)&&!pose.equals(r.restMatrix))throw Error('Native FE handoff found a foreign current pose');
 r.applyMatrix.call(r.geometry,r.cadFrame);r.mesh.matrix.copy(r.restMatrix);r.mesh.matrix.decompose(r.mesh.position,r.mesh.quaternion,r.mesh.scale);r.mesh.matrixAutoUpdate=r.restAuto;r.mesh.matrixWorldNeedsUpdate=true;h.lastPose='';r.active=false;
}
