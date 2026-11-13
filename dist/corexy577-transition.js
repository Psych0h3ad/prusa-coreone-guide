import * as T from 'three';
import {frameBox} from './camera.js?v=20261111-99';
import {operationAt} from './assembly-director.js?v=20261113-116';
export const THREAD_END=.75;
export const CAMERA_TRANSITION_MESSAGES={
 '通過完了：全体位置を見て内側から確認':['Plug passed: locate the work, then check from inside','Konektor protažen: ověřte polohu a zkontrolujte zevnitř','Stecker durchgeführt: Position ansehen, dann von innen prüfen'],
 '次のケーブルへ視点を戻す':['Return the view to the next lead','Vraťte pohled k dalšímu kabelu','Ansicht zur nächsten Leitung zurückführen']
};
const V=p=>new T.Vector3(...p),centre=V([-152.5993938751,180.6997221025,298.9459736382]),packetBounds=new WeakMap();
const clamp=x=>T.MathUtils.clamp(x,0,1),smooth=x=>{x=clamp(x);return x*x*x*(x*(x*6-15)+10);};
export function threadClock(t,end=THREAD_END){return clamp(t/end);}
export function cameraTransitionPlan(plan){
 if(plan.actors.some(a=>a.corexyCameraCheck))return plan;
 const actors=[];let previousPark=null;
 for(const actor of plan.actors){
  if(actor.to===1&&actor.flex?.some(id=>id.startsWith('corexy577'))&&previousPark)actors.push({...actor,to:0,corexyCameraReturn:true,corexyPrevId:previousPark.flex[0],label:'次のケーブルへ視点を戻す'});
  actors.push(actor);
  if(actor.to===2&&actor.flex?.some(id=>id.startsWith('corexy577')))actors.push({...actor,to:2,corexyCameraCheck:true,label:'通過完了：全体位置を見て内側から確認'});
  if(actor.to===3&&actor.flex?.some(id=>id.startsWith('corexy577')))previousPark=actor;
 }
 return {...plan,actors};
}
function workingBox(e,pose=e.currentPose){
 let local=packetBounds.get(e);if(!local){local=new T.Box3();const p=new T.Vector3();for(let i=0;i<e.packetPositions.length;i+=3)local.expandByPoint(p.fromArray(e.packetPositions,i));packetBounds.set(e,local);}
 return new T.Box3(centre.clone().add(V([-.4,-5.75,-11.25])),centre.clone().add(V([.4,5.75,11.25]))).union(local.clone().applyMatrix4(pose.matrix)).expandByPoint(pose.neck).expandByScalar(4);
}
function worldPoint(v,p){return p.clone().multiplyScalar(.001).applyMatrix4(v.printer.matrixWorld);}
function outsidePose(v,e,s){const box=workingBox(e).applyMatrix4(new T.Matrix4().makeScale(.001,.001,.001)).applyMatrix4(v.printer.matrixWorld),pose=frameBox(box,V([-20,-100,-40]).transformDirection(v.printer.matrixWorld),s.baseFov,v.camera.aspect,1.15,115),local=pose.position.clone().applyMatrix4(v.printer.matrixWorld.clone().invert()).multiplyScalar(1000);local.x=Math.max(local.x,-202);pose.position.copy(worldPoint(v,local));return{...pose,fov:s.baseFov,name:'outside'};}
function overviewPose(v){return{position:worldPoint(v,V([-480,-120,700])),target:worldPoint(v,V([-30,90,300])),fov:52,name:'overview'};}
function insidePose(v,e,followPark=false){const delta=followPark?workingBox(e).getCenter(new T.Vector3()).sub(workingBox(e,e.pose(2)).getCenter(new T.Vector3())):new T.Vector3();return{position:worldPoint(v,V([-50,164,275])),target:worldPoint(v,V([-145,182,298]).add(delta)),fov:42,name:'inside'};}
function setCamera(v,pose){v.camera.fov=pose.fov;v.camera.updateProjectionMatrix();v.controls.minDistance=70;v.controls.maxPolarAngle=Math.PI*.95;v.moveCamera(pose,true);v.camera.updateMatrixWorld(true);v.dirty=true;}
function hideOverlay(s){if(s.overlay){s.overlay.style.display='none';s.overlay.style.opacity='0';}s.visibleFade=null;}
function overlayFor(v,s){if(s.overlay)return s.overlay;const c=document.createElement('canvas');c.dataset.corexyViewDissolve='';Object.assign(c.style,{position:'absolute',inset:'0',width:'100%',height:'100%',display:'none',pointerEvents:'none'});v.renderer.domElement.insertAdjacentElement('afterend',c);s.overlay=c;return c;}
function cacheIdentity(v,at){const c=v.renderer.domElement;return [v.state?.flow,v.state?.index,at.index,c.width,c.height,v.labels,v.ghost,v.selected,...v.corexy577.entities.flatMap(e=>[e.mesh.userData.flexState?.amount,e.geometry.attributes.position.version])].join('|');}
function blendViews(v,s,at,from,to,mix){
 const identity=cacheIdentity(v,at);if(s.cacheIdentity!==identity){s.cache.clear();s.cacheIdentity=identity;}
 const key=from.name;let source=s.cache.get(key);
 // Material/guide ownership is settled after the outer setProgress returns.
 // Its source sync invokes this callback again before the next visible paint.
 const stable=v.activeOperation===at.index;
 if(!source&&stable){setCamera(v,from);v.scene.updateMatrixWorld(true);v.renderer.render(v.scene,v.camera);source=document.createElement('canvas');source.width=v.renderer.domElement.width;source.height=v.renderer.domElement.height;source.getContext('2d').drawImage(v.renderer.domElement,0,0);s.cache.set(key,source);s.captureCount++;}
 setCamera(v,to);
 if(!source){hideOverlay(s);return;}
 const c=overlayFor(v,s),imageKey=identity+'|'+from.name;if(c.width!==source.width||c.height!==source.height||s.overlayImageKey!==imageKey){c.width=source.width;c.height=source.height;const ctx=c.getContext('2d');ctx.clearRect(0,0,c.width,c.height);ctx.drawImage(source,0,0);s.overlayImageKey=imageKey;}c.style.opacity=String(1-mix);c.style.display=mix>=1?'none':'block';s.visibleFade={from,to,mix,opacity:1-mix,key:identity+'|'+from.name};
}
function presetSequence(v,s,at,from,overview,to){const t=at.t;if(t<.2){blendViews(v,s,at,from,overview,smooth(t/.2));return{view:'outside-to-overview',mix:smooth(t/.2),from:from.name,to:overview.name};}if(t<.4){hideOverlay(s);setCamera(v,overview);return{view:'overview-hold',mix:1,from:overview.name,to:overview.name};}if(t<.6){blendViews(v,s,at,overview,to,smooth((t-.4)/.2));return{view:'overview-to-confirmation',mix:smooth((t-.4)/.2),from:overview.name,to:to.name};}hideOverlay(s);setCamera(v,to);return{view:'confirmation-hold',mix:1,from:to.name,to:to.name};}
export function applyCorexyCameraTransition(v){
 const s=v.corexyCameraTransition256,plan=v.operationScene?.plan;if(!s)return false;
 if(v.manualCamera||s.settingState||plan?.chapter!==5||plan.step!==77||!v.sceneActors?.length){hideOverlay(s);return false;}
 const at=operationAt(v.operationProgress,v.sceneActors.length),actor=v.sceneActors[at.index],id=actor?.flex?.find(id=>id.startsWith('corexy577')),e=id&&v.fasteners.entities.get(id);
 if(!e?.currentPose||!e.packetPositions||(![1,2,3].includes(actor.to)&&!actor.corexyCameraReturn)){hideOverlay(s);return false;}
 v.printer.updateMatrixWorld(true);let phase,display;
 if(actor.corexyCameraCheck){phase='camera-check';const overview=overviewPose(v),inside=insidePose(v,e);if(at.t<.25){hideOverlay(s);setCamera(v,overview);display={view:'overview-hold',mix:1,from:'overview',to:'overview'};}else if(at.t<.5){const mix=smooth((at.t-.25)/.25);blendViews(v,s,at,overview,inside,mix);display={view:'overview-to-confirmation',mix,from:'overview',to:'inside'};}else{hideOverlay(s);setCamera(v,inside);display={view:'confirmation-hold',mix:1,from:'inside',to:'inside'};}}
 else if(actor.corexyCameraReturn){phase='camera-return';const previous=v.fasteners.entities.get(actor.corexyPrevId);display=presetSequence(v,s,at,insidePose(v,previous,true),overviewPose(v),outsidePose(v,e,s));}
 else if(actor.to===2&&at.t>=s.threadEnd){phase='complete-overview';const mix=smooth((at.t-s.threadEnd)/(1-s.threadEnd));blendViews(v,s,at,outsidePose(v,e,s),overviewPose(v),mix);display={view:'outside-to-overview',mix,from:'outside',to:'overview'};}
 else{hideOverlay(s);phase=actor.to===3?'park':actor.to===2?'thread':'approach';const pose=actor.to===3?insidePose(v,e,true):outsidePose(v,e,s);setCamera(v,pose);display={view:pose.name,mix:1,from:pose.name,to:pose.name};}
 s.last={id,actor:at.index,t:at.t,phase,amount:e.mesh.userData.flexState.amount,cameraMode:'labelled-preset-dissolve',...display,fov:v.camera.fov,near:v.camera.near,overlayOpacity:s.visibleFade?.opacity||0,overlayKey:s.visibleFade?.key||null,cameraPosition:v.camera.position.toArray(),cameraTarget:v.controls.target.toArray()};return true;
}
export function installCorexyCameraTransition(viewer,{threadEnd=THREAD_END}={}){
 if(viewer.corexyCameraTransition256)return viewer.corexyCameraTransition256;
 if(viewer.corexyWorkingView255)throw Error('Replace the old CoreXY camera owner; do not stack installers.');
 if(!(threadEnd>0&&threadEnd<1))throw Error('Leave a physical completion hold before the named views.');
 const state={threadEnd,last:null,baseFov:viewer.camera.fov,baseNear:viewer.camera.near,cache:new Map(),cacheIdentity:null,captureCount:0,originalUpdates:new Map(),originalGuides:new Map(),previousView:viewer.corexy577ExternalView,originalSetState:viewer.setState,originalHoldCamera:viewer.holdCamera,originalApplyMaterials:viewer.applyMaterials,originalDispose:viewer.dispose};viewer.corexyCameraTransition256=state;
 for(const e of viewer.corexy577.entities){
  const original=e.update;state.originalUpdates.set(e.id,original);
  e.update=function(from,to,t){return original.call(this,from,to,from===1&&to===2?threadClock(t,threadEnd):t);};
  const guide=e.guide;state.originalGuides.set(e.id,guide);e.guide=function(to,from){return guide.call(this,to,to===2&&from===2?1:from);};
 }
 viewer.corexy577ExternalView=v=>applyCorexyCameraTransition(v)||state.previousView?.(v)===true;
 viewer.holdCamera=function(...args){if(state.visibleFade?.opacity>=.5)setCamera(this,state.visibleFade.from);hideOverlay(state);return state.originalHoldCamera.apply(this,args);};
 viewer.applyMaterials=function(...args){const result=state.originalApplyMaterials.apply(this,args);state.cache.clear();state.cacheIdentity=null;if(!state.settingState)applyCorexyCameraTransition(this);return result;};
 viewer.setState=function(next,...args){const leaving=this.operationScene?.plan?.chapter===5&&this.operationScene.plan.step===77&&(next?.flow!==this.state?.flow||next?.index!==this.state?.index);if(leaving){hideOverlay(state);this.camera.fov=state.baseFov;this.camera.near=state.baseNear;this.camera.updateProjectionMatrix();}state.settingState=true;let result;try{result=state.originalSetState.call(this,next,...args);}finally{state.settingState=false;}applyCorexyCameraTransition(this);return result;};
 if(state.originalDispose)viewer.dispose=function(...args){state.overlay?.remove();state.cache.clear();return state.originalDispose.apply(this,args);};
 applyCorexyCameraTransition(viewer);return state;
}
