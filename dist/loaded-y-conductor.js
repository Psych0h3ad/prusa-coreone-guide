// Original current-Y complete material path integration, no extra straight wire.
import * as T from 'three';
import {materialPrefix} from './loaded-material-curve.js';
import {extendLayeredGeometry,writeLayeredGeometry} from './loaded-layered-geometry.js';
import {loadedCurvedAssets} from './loaded-curved-assets.js';
import {createMountedContactConstraint} from './loaded-mounted-contact.js';
import {createLeafBuffers,rewriteLeaf} from './loaded-contact-state.js';
export {makeLoadedMaterials} from './loaded-layered-geometry.js';
let solveMounted;
export function loadedYConductorGeometry(curve,port,slot,withdrawalMM,{samples=768,sides=10,radius=.52,headerNativeFrameMM,headerBoundsNativeMM,nativeSeatShiftMM=0}={}){
 if(!headerNativeFrameMM||!headerBoundsNativeMM)throw Error('Current authored Y header frame and complete bounds required');
 const jacket=materialPrefix(curve,curve.getLength()-1.7);
 class Metres extends T.Curve{getPoint(u,out=new T.Vector3()){return jacket.getPointAt(u,out).multiplyScalar(.001);}getTangent(u,out=new T.Vector3()){return jacket.getTangentAt(u,out);}}
 const g=new T.TubeGeometry(new Metres(),samples,radius*.001,sides,false),seed=new T.Vector3().fromBufferAttribute(g.attributes.normal,0),layout=extendLayeredGeometry(g,{wires:1,samples,sides,winding:-1,baseMaterials:1,sourceMaterialArray:true}),nativeFrame=new T.Matrix4().set(-1,0,0,port.x,0,-1,0,port.y-nativeSeatShiftMM,0,0,1,port.z-1.25,0,0,0,1),relative=headerNativeFrameMM.clone().invert().multiply(nativeFrame),parameters=loadedCurvedAssets().parameters,probe=createLeafBuffers(),span=new T.Box3().setFromBufferAttribute(new T.BufferAttribute(probe.positions,3));
 rewriteLeaf(probe,parameters.maximumLeafAngleRadians);span.union(new T.Box3().setFromBufferAttribute(new T.BufferAttribute(probe.positions,3)));span.translate(new T.Vector3(slot,.05,0)).applyMatrix4(relative);
 solveMounted??=createMountedContactConstraint(parameters);const contact=solveMounted(relative,[slot],4,{supportBoundsOverlap:span.intersectsBox(headerBoundsNativeMM)});if(contact.rows[0].modelSupported===false)throw Error('Unsupported current Y contact frame');
 writeLayeredGeometry(layout,{curves:[curve],radii:[radius],seeds:[seed],nativeFrame,slots:[slot],contactAngle:contact.angleRadians,positionOrigin:port});const l=layout.layouts[0];g.userData={positionOriginMM:port.toArray(),loadedLayout:{samples,sides,coreSamples:layout.coreSamples,outer:l.outer,inner:l.inner,jacketCaps:l.jacketCaps,core:l.core,coreCaps:l.coreCaps,frame:l.frame,leaf:l.leaf},referenceWholeConductorStockMM:curve.getLength(),jacketStockMM:curve.getLength()-1.7,jacketRadiusMM:radius,coreRadiusMM:.22,sourceSlotNativeXMM:slot,coreEndNativeYMM:2.75+nativeSeatShiftMM,stripEndNativeYMM:1.05+nativeSeatShiftMM,loadedContactAngle:contact.angleRadians,loadedContact:contact,headerRelativeFrameMM:relative.toArray(),geometryOrigin:'independently authored curved loaded reference',manufacturerCAD:false};return g;
}
