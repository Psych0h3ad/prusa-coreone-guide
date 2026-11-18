import * as T from 'three';
import {transportFilamentInlet,releaseFilamentInlet} from './filament-inlet-transport.js';
import {followSidePtfeCompletion} from './side-ptfe-coupling.js';
import {operationAt} from './assembly-director.js?v=20261113-116';

// Native screw axes (800, 802), in the printer CAD frame, mm. Opening angles
// and the loose fitting's presentation travel are guide poses, not adjustment
// settings or claimed manufacturer motion limits. No tension screw is turned.
export const IDLER_PIVOT=[-6.443571,-58.3952524,377.500413];
// CAD802 joins the swivel to the nut. CAD810 is the latching crossbar,
// not the opening hinge. The nut, tension screws and springs stay seated.
export const CLAMP_PIVOT=[-12.3941536,-58.4953777,414.147763];
export const FIXED_TENSION=[799,801,802,805,815,'idlerSpring1','idlerSpring2'];
export const ARM=[793,796,797,803,'idlerBearing1','idlerBearing2','idlerPin1','idlerPin2'];
export const CLAMP=[798,808,809,810,'idlerSwivelSpacer'];
export const AIR_HOLE='sensorAirHoleMarker';
export const DRIVE_ACCESS='driveGearAccessMarker';
const L={
 hole:['エア清掃穴（フィラメント入口とは別）','Air-cleaning hole (separate from filament inlet)','Otvor pro čištění vzduchem (oddělený od vstupu filamentu)','Luft-Reinigungsöffnung (getrennt vom Filamenteingang)'],
 driveSide:['送りギアの側面を清掃する','Clean the side of the drive gear','Vyčistit bok podávacího kola','Seite des Antriebsrads reinigen'],
 release:['スイベルを持ち上げてロックを外す','Lift the swivel to unlock the idler','Zvednout otočný díl a odjistit idler','Schwenkhebel anheben und Idler entriegeln'],
 open:['送りを解除する位置までアイドラーを開く','Open the idler enough to release the filament','Otevřít idler tak, aby uvolnil filament','Idler so weit öffnen, dass das Filament freigegeben wird'],
 close:['清掃後／流れが戻った場合にアイドラーを閉じる','After cleaning / if flow returns, close the idler','Po čištění / obnovení toku zavřít idler','Nach Reinigung / bei wiederhergestelltem Fluss Idler schließen'],
 latch:['スイベルを下げてロックする','Lower the swivel to lock the idler','Sklopit otočný díl a zajistit idler','Schwenkhebel absenken und Idler verriegeln'],
 guideUp:['装着されているガイドを持ち上げて金属継手を露出させる','If fitted, lift the guide to expose the metal fitting','Je-li osazeno vodítko, zvednout je a odkrýt kovové šroubení','Falls vorhanden: Führung anheben und Metallfitting freilegen'],
 guideDown:['外した継手を戻してからガイドを押し下げる','After refitting the removed fitting, push the guide down','Po vrácení sejmutého šroubení zatlačit vodítko dolů','Nach Montage des entfernten Fittings Führung herunterschieben'],
 fitting:['装着されている場合だけ金属継手をねじって外す','Only if fitted, unscrew and withdraw the metal fitting','Pouze je-li osazeno, vyšroubovat a vyjmout kovové šroubení','Nur falls vorhanden: Metallfitting herausschrauben und herausnehmen'],
 refit:['流れが戻り、PLAをアンロードした後、外した継手をねじ戻す','After flow returns and PLA is unloaded, screw the removed fitting back in','Po obnovení toku a vysunutí PLA zašroubovat sejmuté šroubení zpět','Nach wiederhergestelltem Fluss und Entladen des PLA entferntes Fitting wieder einschrauben']
};
const rotate=(refs,pivot,degrees)=>({refs,pivot,rotation:[0,degrees,0],offset:[0,0,0]});
const motion=(refs,pivot,from,to,label,role)=>({refs,label,accessRole:role,axis:[0,1,0],distance:0,showBefore:true,focusMotion:true,focusPadding:6,focusMinDistance:115,camera:'hotend-perspective',focusBounds:[-65,-78,370,30,-30,465],motionPivot:pivot,posePath:[{offset:[0,0,0],rotation:[0,from,0]},{offset:[0,0,0],rotation:[0,to,0]}]});
export function accessScene(task,index,text,spec){
 const {plan}=spec;
 if(task.id==='sensor-clean'&&index<3){
  plan.inspectRefs=[AIR_HOLE];plan.focus=[AIR_HOLE];plan.inspectionLabel=text(L.hole);plan.inspectionPadding=.5;
  plan.camera='top-perspective';plan.transparentRefs=[48,52,87,570];plan.solidRefs=['mainPlate',794,817,816];
  plan.viewBounds=[-13,-73,408,23,-48,442];plan.viewMinDistance=75;plan.contextOpacity=.08;
 }
 if(task.id==='sensor-clean'&&index===3)spec.hidden.push(AIR_HOLE);
 if(!['extruder','feed-clear','fragment'].includes(task.id))return spec;
 const feed=task.id==='feed-clear',fragment=task.id==='fragment',opening=index===(feed?1:0),closing=index===(feed?4:fragment?3:2),held=feed?[2,3,5].includes(index):fragment?[1,2].includes(index):index===1;
 if(!opening&&!closing&&!held)return spec;
 plan.access={opening,closing,held,feed};plan.contextOpacity=.08;
 plan.solidRefs=[...ARM,...CLAMP,800,...FIXED_TENSION,816,817,794,'mainPlate','pgAssembly','pgRing','bowdenBend','ptfeTube'];
 // The PG gearbox case stays fitted and opaque. Only the inlet/side access is used.
 plan.transparentRefs=[790,858,48,52,87,570];
 if(!feed&&!held)spec.hidden.push(DRIVE_ACCESS);
 if(!held){plan.headOnly=true;plan.inspectRefs=[];plan.camera='hotend-perspective';plan.focus=[...ARM,...CLAMP,817];plan.viewBounds=[-65,-80,368,34,-28,466];plan.viewMinDistance=125;}
 if(held){
  plan.workpiecePoses=[rotate(CLAMP,CLAMP_PIVOT,45),rotate(ARM,IDLER_PIVOT,-10)];
  if(!feed&&!fragment){plan.inspectRefs=[DRIVE_ACCESS];plan.focus=[DRIVE_ACCESS];plan.inspectionLabel=text(L.driveSide);plan.camera='service-drive-side';plan.viewBounds=[-20,-72,378,18,-45,412];plan.viewMinDistance=100;}
 }else if(opening){
  plan.actors=[motion(CLAMP,CLAMP_PIVOT,0,45,text(L.release),'clamp'),motion(ARM,IDLER_PIVOT,0,-10,text(L.open),'arm')];
 }else{
  plan.actors=[motion(ARM,IDLER_PIVOT,-10,0,text(L.close),'arm'),motion(CLAMP,CLAMP_PIVOT,45,0,text(L.latch),'clamp')];
 }
 if(feed&&!held){
  const common={axis:[0,0,1],distance:0,showBefore:true,focusMotion:true,focusBounds:[-35,-78,414,20,-25,535],focusMinDistance:120,camera:'top-perspective'};
  const guide={...common,refs:['bowdenBend'],label:text(L[opening?'guideUp':'guideDown']),accessRole:'guide',motionPivot:[0,0,0],posePath:[{offset:[0,0,opening?0:8],rotation:[0,0,0]},{offset:[0,0,opening?8:0],rotation:[0,0,0]}]};
  // Turn count/travel illustrate unscrewing, not a tightening prescription.
  const fitting={...common,refs:[817],label:text(L[opening?'fitting':'refit']),accessRole:'fitting',motionPivot:[-2.943578,-58.395252,426.9],posePath:[{offset:[0,0,opening?0:24],rotation:[0,0,opening?0:1080]},{offset:[0,0,opening?24:0],rotation:[0,0,opening?1080:0]}]};
  plan.actors.push(...(opening?[guide,fitting]:[fitting,guide]));
 }
 return spec;
}
function transform(pivot,angle){const p=new T.Vector3(...pivot).multiplyScalar(.001);return new T.Matrix4().makeTranslation(...p.toArray()).multiply(new T.Matrix4().makeRotationY(T.MathUtils.degToRad(angle))).multiply(new T.Matrix4().makeTranslation(...p.negate().toArray()));}
function place(mesh,matrix){mesh.position.copy(mesh.userData.restPosition).applyMatrix4(matrix);mesh.quaternion.setFromRotationMatrix(matrix).multiply(mesh.userData.restQuaternion);mesh.updateMatrixWorld(true);}
const smooth=t=>t*t*(3-2*t);
function phase(viewer,role,from,to){const actorIndex=viewer.sceneActors.findIndex(a=>a.accessRole===role);if(actorIndex<0)return from;const at=operationAt(viewer.operationProgress,viewer.sceneActors.length),t=at.index<actorIndex?0:at.index>actorIndex?1:at.t;return from+(to-from)*smooth(t);}

// Follow the existing PTFE mesh at the withdrawn inlet. The tied route beyond
// 230 mm and the far endpoint remain exactly fixed. Preserve its sampled arc
// length by adjusting slack in the free span, using the same TubeSurface and
// its existing attribute buffers. Never replace a net or swallow a failure.
export function tubeRelease(entity,lift,guideLift=0,side=0,sourceGuide=false){
 if(!entity)return;
 if(sourceGuide)return transportFilamentInlet(entity,lift,guideLift,side);
 if(entity.filamentInletTransport?.applied){releaseFilamentInlet(entity);}
 if(!Number.isFinite(lift)||!Number.isFinite(guideLift)||lift<0||guideLift<0||guideLift>65)throw Error('Invalid PTFE inlet/guide release request');
 const state=entity.maintenanceRelease??=(function(){const rest=entity.sample(5,1,new Float32Array(entity.stride)).slice(),arc=[0];for(let i=3;i<rest.length;i+=3)arc.push(arc.at(-1)+Math.hypot(rest[i]-rest[i-3],rest[i+1]-rest[i-2],rest[i+2]-rest[i-1]));const at=s=>{const i=arc.findIndex(n=>n>=s),t=(s-arc[i-1])/(arc[i]-arc[i-1]);return [0,1,2].map(k=>rest[(i-1)*3+k]+t*(rest[i*3+k]-rest[(i-1)*3+k]));};return {rest,arc,start:at(70),end:at(230),length:arc.at(-1),points:new Float32Array(rest.length),last:undefined};})();
 if(state.last===lift&&state.guideLift===guideLift)return;
 const {rest,arc,points}=state;
 const down=entity.sample(3,1,new Float32Array(entity.stride)),up=entity.sample(3,1-guideLift/65,new Float32Array(entity.stride)),headIndex=arc.findIndex(n=>n>=70),delta=[0,1,2].map(k=>up[headIndex*3+k]-down[headIndex*3+k]);
 const evaluate=curvature=>{let length=0;for(let i=0;i<arc.length;i++){const s=arc[i],u=Math.max(0,Math.min(1,(s-70)/160)),w=1-smooth(u);for(let k=0;k<3;k++){const guided=s<=70?up[i*3+k]-down[i*3+k]:delta[k]*w,moved=rest[i*3+k]+guided+(k===2?lift*w:0),line=state.start[k]+(state.end[k]-state.start[k])*u+(delta[k]+(k===2?lift:0))*(1-u);points[i*3+k]=s<=70||s>=230?moved:line+(moved-line)*curvature;}if(i)length+=Math.hypot(points[i*3]-points[i*3-3],points[i*3+1]-points[i*3-2],points[i*3+2]-points[i*3-1]);}return length;};
 if(lift===0&&guideLift===0){points.set(rest);}else{let lo=0,hi=1;const minimum=evaluate(0);if(minimum>state.length+.002)throw Error(`PTFE inlet release has insufficient slack: ${minimum}>${state.length}; inlet ${lift}, guide ${guideLift}`);while(evaluate(hi)<state.length&&hi<4)hi*=2;if(evaluate(hi)<state.length)throw Error('PTFE inlet release cannot conserve length');for(let i=0;i<30;i++){const mid=(lo+hi)/2;if(evaluate(mid)<state.length)lo=mid;else hi=mid;}evaluate((lo+hi)/2);}
 entity.surface.update(points);state.last=lift;state.guideLift=guideLift;
}
export function installMaintenanceAccess(viewer){
 if(viewer.maintenanceAccessInstalled)return;viewer.maintenanceAccessInstalled=true;
 const plate=viewer.meshes.find(m=>m.userData.part==='mainPlate'),matrix=new T.Matrix4().compose(plate.userData.restPosition,plate.userData.restQuaternion,plate.scale),a=plate.geometry.attributes.position,unique=new Map();
 for(let i=0;i<a.count;i++){const p=new T.Vector3().fromBufferAttribute(a,i).applyMatrix4(matrix);if(Math.abs(p.z-.414000414)<.000001&&p.x>.008&&p.x<.0101&&p.y>-.0659&&p.y<-.0637)unique.set(p.toArray().map(v=>v.toFixed(7)).join(','),p);}
 if(unique.size<30)throw Error('Native main-plate cleaning-hole rim was not found');
 const points=[...unique.values()],centre=points.reduce((p,q)=>p.add(q),new T.Vector3()).multiplyScalar(1/points.length);points.sort((p,q)=>Math.atan2(p.y-centre.y,p.x-centre.x)-Math.atan2(q.y-centre.y,q.x-centre.x));
 const marker=new T.LineLoop(new T.BufferGeometry().setFromPoints(points),new T.LineBasicMaterial({color:0xfd5000,depthTest:false,depthWrite:false}));marker.renderOrder=25;marker.userData={part:'mainPlate',maintenanceComponent:AIR_HOLE,serviceTask:'sensor-clean',annotation:true,cadName:'Native cleaning-hole rim — annotation',restPosition:new T.Vector3(),restQuaternion:new T.Quaternion(),nativeRim:points.map(p=>p.toArray()),holeCentre:centre.toArray()};viewer.group('mainPlate').add(marker);viewer.meshes.push(marker);
 // Mark the exposed left flank of the existing drive-ring illustration.
 // This is a work-area annotation, not a new opening or replacement geometry.
 const drivePoints=Array.from({length:40},(_,i)=>{const a=i*Math.PI*2/40;return new T.Vector3(-.0035,-.06275+.0025*Math.cos(a),.39300041426+.0045*Math.sin(a));});
 const driveMarker=new T.LineLoop(new T.BufferGeometry().setFromPoints(drivePoints),new T.LineBasicMaterial({color:0xfd5000,depthWrite:false}));
 driveMarker.userData={part:DRIVE_ACCESS,maintenanceComponent:DRIVE_ACCESS,serviceTask:'extruder',annotation:true,cadName:'Drive-gear side work area — annotation',restPosition:new T.Vector3(),restQuaternion:new T.Quaternion()};viewer.group(DRIVE_ACCESS).add(driveMarker);viewer.meshes.push(driveMarker);
 const original=viewer.setProgress.bind(viewer);
 viewer.setProgress=function(progress){original(progress);const mode=this.operationScene?.plan.access;
  if(!mode){const tube=this.fasteners.entities.get('ptfeTube'),returning=Boolean(tube?.filamentInletTransport?.applied);if(returning){releaseFilamentInlet(tube);followSidePtfeCompletion(this);}else if(tube?.maintenanceRelease?.last||tube?.maintenanceRelease?.guideLift){tubeRelease(tube,0);}return;}
  const release=mode.clampHold??(mode.held?45:phase(this,'clamp',mode.closing?45:0,mode.closing?0:45)),angle=mode.materialLoadedHold?this.filamentMaintenance.loadedArmAngle():mode.armHold??(mode.held?-10:phase(this,'arm',mode.closing?-10:(mode.armFrom??0),mode.closing?0:-10)),arm=transform(IDLER_PIVOT,angle),clamp=transform(CLAMP_PIVOT,release);
  for(const m of this.director.resolve(ARM))place(m,arm);for(const m of this.director.resolve(CLAMP))place(m,clamp);
  // Only the actually installed fitting variant is withdrawn. Absence of the
  // fitting suppresses the whole fitting/guide/tube transaction.
  const fitting=this.director.resolve([817]),lift=mode.feed&&fitting.length?((mode.inletHeld??mode.held)?24:phase(this,'fitting',mode.closing?24:0,mode.closing?0:24)):0,guide=mode.feed&&fitting.length?((mode.inletHeld??mode.held)?(mode.guideLift??8):phase(this,'guide',mode.closing?(mode.guideLift??8):0,mode.closing?0:(mode.guideLift??8))):0;
  const sideMax=fitting.length?(mode.sidePark||0):0,amount=(mode.inletHeld??mode.held)?1:phase(this,'fitting',mode.closing?1:0,mode.closing?0:1),side=sideMax*Math.min(1,Math.max(0,(amount-.5)/.5)),actualLift=sideMax?(mode.inletLift??24)*Math.min(1,amount/.5):lift;
  const axis=new T.Vector3(-.002943578,-.058395252,.4269),turn=1080*actualLift/(mode.inletLift??24),fitTransform=new T.Matrix4().makeTranslation(axis.x+side*.001,axis.y,axis.z+actualLift*.001).multiply(new T.Matrix4().makeRotationZ(T.MathUtils.degToRad(turn))).multiply(new T.Matrix4().makeTranslation(...axis.negate().toArray()));
  for(const m of fitting)place(m,fitTransform);for(const m of this.director.resolve(['bowdenBend']))place(m,new T.Matrix4().makeTranslation(side*.001,0,(sideMax?Math.max(guide,actualLift):actualLift+guide)*.001));tubeRelease(this.fasteners.entities.get('ptfeTube'),actualLift,sideMax?Math.max(0,guide-actualLift):guide,side,Boolean(sideMax));
  this.filamentMaintenance?.follow();this.printer.updateMatrixWorld(true);this.dirty=true;
 };
}
