import * as T from 'three';
import {mainSourcePose,earthSourcePose,lcdParkOffset,LCD_APERTURE_REST} from './lcd-source-motion.js';
import {LCD_EARTH_REFERENCE} from './lcd-cable-motion.js';
const V=p=>new T.Vector3(...p),Q=x=>(x=T.MathUtils.clamp(x,0,1),x*x*(3-2*x));
// Read-only reproduction of the registered frame offset for camera/annotations.
// These values never enter a physical producer or controller state.
const frameOffset=a=>a<=.15?[0,0,-55*Q(a/.15)]:[0,-540*Q((a-.15)/.85),-55];
function lcdPose(a){return a<=1?{offset:[0,-8*Q(a),0],angle:.25*Q(a)}:a<=2?{offset:V([0,-8,0]).lerp(V([5,-14,-2]),Q(a-1)).toArray(),angle:.25}:{offset:lcdParkOffset(Q(a-2)),angle:.25*(1-Q(a-2))};}
function capPose(s,kind,r){
 const p=lcdPose(s.zmLcd),pivot=V([0,-210,-10]),carrier=new T.Matrix4().makeRotationX(Math.PI/2*Q(s.zmFlip)*Q(s.zmLcd-2)),M=new T.Matrix4().makeTranslation(...pivot.clone().add(V(p.offset)).toArray()).multiply(new T.Matrix4().makeRotationX(p.angle)).multiply(new T.Matrix4().makeTranslation(...pivot.clone().negate().toArray())),frameM=new T.Matrix4().makeTranslation(...frameOffset(s.zmFrame)).multiply(r.frameRestMM),openingCurrent=r.openingLocal.clone().applyMatrix4(frameM),feed=Q(s.zmLcdFeed),earthFeed=Q(s.zmLcdFeed-1),freeZ=-52.8-16*feed-6+V([-2,0,9]).transformDirection(r.lcdFreeFrame).z*Math.sqrt(85),context={heldMain:r.heldMain,heldEarth:r.heldEarth,lcdStage:s.zmLcd,frameStage:s.zmFrame,openingCurrent,openingFeed:V(LCD_APERTURE_REST).add(V(frameOffset(.02))),outsideMain:[27.1,-224,freeZ+16*feed],insideMain:[27.1,-135,freeZ+16*feed-16]};
 if(kind==='main')return mainSourcePose(carrier.clone().multiply(M).multiply(r.mainRestMM),s.zmLcdRibbon,feed,r.lcdFreeFrame,context);
 const earthMatrix=carrier.clone().multiply(M).multiply(r.earthRestMM),reference=V(LCD_EARTH_REFERENCE).applyMatrix4(earthMatrix);
 return{end:earthSourcePose(reference,s.zmLcdEarth,earthFeed,context),rotation:new T.Quaternion().setFromRotationMatrix(earthMatrix)};
}
export function decorateMotorApertureSpec(spec,reference){
 if(!spec?.plan?.motorService)return spec;
 const states={...spec.flexStates},actors=spec.plan.actors.map(actor=>{
  let decorated=actor;
  if(actor.motorOperation==='zmLcdFeed'){
   const from=actor.fromStates.zmLcdFeed,to=actor.to,kind=Math.min(from,to)>=1?'earth':'main',opening=reference.openingLocal.clone().applyMatrix4(new T.Matrix4().makeTranslation(...frameOffset(states.zmFrame)).multiply(reference.frameRestMM)),hole=opening.clone().add(kind==='earth'?V([7,0,0]):V([0,0,0])),samples=Array.from({length:25},(_,i)=>capPose({...states,zmLcdFeed:from+(to-from)*i/24},kind,reference)),first=samples[0],last=samples.at(-1),axis=kind==='main'?V([-2,0,9]).normalize():V([-1,0,0]),fromT=axis.clone().applyQuaternion(first.rotation).normalize(),toT=axis.clone().applyQuaternion(last.rotation).normalize(),travel=V([0,to>from?1:-1,0]),path=(points,targetIndex,kind)=>({pointsMM:points.map(p=>p.toArray()),targetIndex,kind}),paths=[path(samples.map(p=>p.end),24,'actual-cap-reference-path'),path([hole.clone().addScaledVector(travel,-12),hole,hole.clone().addScaledVector(travel,12)],1,'actual-frame-aperture'),path([first.end,first.end.clone().addScaledVector(fromT,7)],0,'from-cap-axis'),path([last.end,last.end.clone().addScaledVector(toT,7)],0,'to-cap-axis')];
   decorated={...actor,focusMotion:false,focusRefs:[],focusBounds:[hole.x-24,hole.y-42,hole.z-22,hole.x+24,hole.y+42,hole.z+22],focusPadding:4,focusMinDistance:70,cameraDirectionCAD:[.24,-1,-.28],anchors:[hole.toArray()],guideRadius:1.6,guideTube:.2,guideArrowLength:5,apertureGuideCAD:{units:'CAD mm; convert once to printer-local metres before Viewer matrixWorld',frameStage:states.zmFrame,kind,from,to,holeMM:hole.toArray(),frameOpeningMM:opening.toArray(),fromCapMM:first.end.toArray(),toCapMM:last.end.toArray(),fromAxisCAD:fromT.toArray(),toAxisCAD:toT.toArray(),paths}};
  }
  for(const id of actor.flex||[])states[id]=actor.to;
  return decorated;
 });
 const detail=actors.some(a=>a.apertureGuideCAD);
 return{...spec,plan:{...spec.plan,actors,...(detail?{solidRefs:[...new Set([...(spec.plan.solidRefs||[]),6,'zmLcd','zmLcdRibbon','zmLcdEarth'])]}:{})}};
}
export function apertureGuidesLocal(actor){return actor?.apertureGuideCAD?.paths.map(path=>{const points=path.pointsMM.map(p=>V(p).multiplyScalar(.001));points.targetIndex=path.targetIndex;return points;});}

// Guides are created in world millimetres. Keep their registration separate
// from the live printer flip, and never change a source mesh or cable pose.
export function registerMotorGuideFrame(viewer){
 viewer.printer.updateWorldMatrix(true,false);const inverse=viewer.printer.matrixWorld.clone().invert();
 for(const group of viewer.guideGroups||[]){group.userData.motorGuideInverse=inverse.clone();group.matrixAutoUpdate=false;}
 for(const label of viewer.guideLabels||[])label.motorPrinterPoint=label.point.clone().applyMatrix4(inverse);
 syncMotorGuideFrame(viewer);
}
export function syncMotorGuideFrame(viewer){
 if(!viewer.operationScene?.plan.motorService)return;
 viewer.printer.updateWorldMatrix(true,false);
 for(const group of viewer.guideGroups||[])if(group.userData.motorGuideInverse){group.matrix.copy(viewer.printer.matrixWorld).multiply(group.userData.motorGuideInverse);group.matrixWorldNeedsUpdate=true;}
 for(const label of viewer.guideLabels||[])if(label.motorPrinterPoint)label.point.copy(label.motorPrinterPoint).applyMatrix4(viewer.printer.matrixWorld);
}
