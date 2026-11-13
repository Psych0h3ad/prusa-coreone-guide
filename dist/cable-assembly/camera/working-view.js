import{upgradeTarget,upgradeWorkingPose}from'./upgrade-pose.js?v=20261113-116';
import*as T from'three';
import{frameBox}from'../../camera.js?v=20261111-94';
import{tieWorkingRectangle}from'../../tie-working-view.js?v=20261112-112';
const smooth=x=>{x=T.MathUtils.clamp(x,0,1);return x*x*(3-2*x);};
const signature=c=>c.view&&['enabled','fullWidth','fullHeight','offsetX','offsetY','width','height'].map(k=>c.view[k]).join(':');
const descriptor=(o,k)=>Object.getOwnPropertyDescriptor(o,k),put=(o,k,d)=>d?Object.defineProperty(o,k,d):delete o[k];
// The rectangle helper has a45mm camera-distance floor. A1mm probe makes
// every narrow strip tie at that floor; a100mm probe selects useful free area.
const unit=new T.Box3(new T.Vector3(-50,-50,-50),new T.Vector3(50,50,50));
function target(v,index=v.activeOperation||0){const upgrade=upgradeTarget(v,index);if(upgrade)return upgrade;if(v.disposed||!v.loaded||!v.operationScene)return null;const a=v.step349Live335,p=v.operationScene?.plan,actor=v.sceneActors?.[index];return a?.active&&a.owned!==false&&a.controller?.hasPose&&v.state?.flow==='build'&&!v.state.explore&&v.state.comparison!=='before'&&!v.operationScene.full&&p?.chapter===3&&p.step===49&&actor?.manualEvent?{cohort:a,actor,index}:null;}
function headBox(e){e.mesh.updateWorldMatrix(true,false);const box=new T.Box3(),p=new T.Vector3(),a=e.mesh.geometry.attributes.position;for(let i=e.headOffset;i<a.count;i++)box.expandByPoint(p.fromBufferAttribute(a,i).applyMatrix4(e.mesh.matrixWorld));return box;}
function ringBox(e,limit=e.loop.points.length-1){const box=new T.Box3();for(let i=0;i<=limit;i++)box.expandByPoint(e.loop.points[i].clone().multiplyScalar(.001).applyMatrix4(e.mesh.matrixWorld));return box;}
export function step349WorkingPose(v,index=v.activeOperation||0){
 const s=target(v,index);if(!s||v.manualCamera||!v.container.clientWidth||!v.container.clientHeight)return null;if(s.upgrade)return upgradeWorkingPose(v,s);
 v.printer.updateMatrixWorld(true);const{actor,cohort}=s,c=cohort.controller,e=c.tie,event=actor.manualEvent,head=headBox(e),phase=c.box5.field.phase;let box,direction;
 if(event==='lcd-entry'){
  box=new T.Box3();for(const mesh of c.native.packet.meshes){mesh.updateWorldMatrix(true,false);box.union(new T.Box3().setFromObject(mesh));}
  // Include the first few centimetres at the plug, never the entire830mm lead.
  const frames=cohort.report.model.frames;for(const f of frames){if(f.distance>30)break;box.expandByPoint(f.centre.clone().multiplyScalar(.001).applyMatrix4(v.printer.matrixWorld));}
  box.expandByScalar(6);direction=new T.Vector3(.65,1,.4);
 }else if(event==='cables-gather'){
  box=ringBox(e).union(head);const local=new T.Box3(new T.Vector3(-163,163,48),new T.Vector3(-113,214,100)).applyMatrix4(v.printer.matrixWorld.clone().multiply(new T.Matrix4().makeScale(.001,.001,.001)));box.union(local).expandByScalar(5);direction=new T.Vector3(.65,1,.55);
 }else if(event==='bottom-tie-thread'){
  const broad=ringBox(e).union(head).expandByScalar(5),detail=head.clone().expandByScalar(8),b=smooth((phase-.40)/.16);box=new T.Box3(broad.min.clone().lerp(detail.min,b),broad.max.clone().lerp(detail.max,b));direction=new T.Vector3(.65,1,.55).lerp(new T.Vector3(1,1,.35),b);
 }else if(event==='bottom-tie-close'){
  const limit=Math.min(e.loop.points.length-1,Math.ceil(c.box5.field.loopLength/c.box5.field.mainLength*e.loop.count));box=ringBox(e,limit).union(head).expandByScalar(4);direction=new T.Vector3(.8,1,.55);
 }else if(event==='bottom-tie-cut'){box=head.clone().expandByScalar(8);direction=new T.Vector3(1,1,.35);}
 else return null;
 direction.transformDirection(v.printer.matrixWorld);const rect=tieWorkingRectangle(v,unit,direction),w=v.container.clientWidth,h=v.container.clientHeight;
 const fov=rect?T.MathUtils.radToDeg(2*Math.atan(Math.tan(T.MathUtils.degToRad(v.camera.fov/2))*(rect.b-rect.t)/h)):v.camera.fov,aspect=rect?(rect.r-rect.l)/(rect.b-rect.t):v.camera.aspect;
 return{...s,box,rect,w,h,pose:frameBox(box,direction,fov,aspect,1.1,28),key:JSON.stringify([index,w,h,event,...box.min.toArray(),...box.max.toArray(),...direction.toArray(),rect?.l,rect?.r,rect?.t,rect?.b])};
}
export function installStep349WorkingView(v){
 if(v.step349WorkingView345?.active)return v.step349WorkingView345;
 const keys=['focusOperation','setView','loop','dispose'],original=Object.fromEntries(keys.map(k=>[k,v[k]])),descriptors=Object.fromEntries(keys.map(k=>[k,descriptor(v,k)])),avoid=new Map();let active=true,ownedProjection=null,minimum,dimensions,key,tween,originalUp,ownedUp;
 const owns=()=>active&&!v.disposed&&v.step349WorkingView345===api&&v.focusOperation===focus&&v.setView===view;
 function restoreUp(){if(originalUp){if(v.camera.up.equals(ownedUp))v.camera.up.copy(originalUp);originalUp=ownedUp=undefined;}}
 function clear(){restoreUp();if(ownedProjection&&signature(v.camera)===ownedProjection)v.camera.clearViewOffset();if(minimum!==undefined&&v.controls.minDistance===28)v.controls.minDistance=minimum;for(const[a,r]of avoid)if(a.calloutAvoidBounds===r.value)put(a,'calloutAvoidBounds',r.original);avoid.clear();ownedProjection=minimum=dimensions=key=tween=undefined;}
 function place(p,instant){
  if(p.up){originalUp??=v.camera.up.clone();v.camera.up.copy(p.up);ownedUp=p.up.clone();}else restoreUp();
  if(minimum===undefined)minimum=v.controls.minDistance;v.controls.minDistance=28;
  if(p.rect){v.camera.setViewOffset(p.w,p.h,(p.w-p.rect.l-p.rect.r)/2,(p.h-p.rect.t-p.rect.b)/2,p.w,p.h);ownedProjection=signature(v.camera);}
  if(p.actor){const r=avoid.get(p.actor)||{original:descriptor(p.actor,'calloutAvoidBounds')},b=p.box.clone().applyMatrix4(v.printer.matrixWorld.clone().invert());r.value=[...b.min.clone().multiplyScalar(1000).toArray(),...b.max.clone().multiplyScalar(1000).toArray()];p.actor.calloutAvoidBounds=r.value;avoid.set(p.actor,r);}
  v.lastOperationFocus=p.index;v.lastFocusSettled=false;dimensions=[p.w,p.h];key=p.key;v.moveCamera(p.pose,instant);tween=v.cameraTween;
 }
 function follow(){
  if(!owns())return;if(!target(v)){clear();return;}
  if(v.manualCamera){if(dimensions&&(dimensions[0]!==v.container.clientWidth||dimensions[1]!==v.container.clientHeight)&&ownedProjection&&signature(v.camera)===ownedProjection){v.camera.clearViewOffset();ownedProjection=null;}return;}
  const p=step349WorkingPose(v);if(!p||p.key===key)return;
  if(v.cameraTween&&v.cameraTween===tween){if(p.rect){v.camera.setViewOffset(p.w,p.h,(p.w-p.rect.l-p.rect.r)/2,(p.h-p.rect.t-p.rect.b)/2,p.w,p.h);ownedProjection=signature(v.camera);}v.cameraTween.to.copy(p.pose.position);v.cameraTween.toT.copy(p.pose.target);key=p.key;}
  else place(p,key!==undefined);
 }
 const focus=function(index,instant=false,...rest){if(v.disposed)return;if(owns()){const p=step349WorkingPose(v,index);if(p){place(p,instant);return;}}return original.focusOperation.call(this,index,instant,...rest);};
 const view=function(name,instant=false,guided=false,...rest){if(v.disposed)return;const upgrade=owns()&&guided?upgradeWorkingPose(v):null;if(!guided||!target(v))clear();else if(!upgrade)restoreUp();const result=original.setView.call(this,name,instant,guided,...rest);if(upgrade)place(upgrade,instant);return result;};
 const loop=now=>{if(v.disposed)return;if(active)follow();return original.loop(now);};
 const dispose=function(...args){api.retire();return original.dispose.apply(this,args);};
 const api={get active(){return active;},focus(index=v.activeOperation||0,instant=false){if(!owns())return false;const p=step349WorkingPose(v,index);if(p){place(p,instant);return true;}return false;},follow,retire(){if(!active)return;active=false;clear();for(const[k,f]of[['focusOperation',focus],['setView',view],['loop',loop],['dispose',dispose]])if(v[k]===f)put(v,k,descriptors[k]);if(v.step349WorkingView345===api)delete v.step349WorkingView345;}};
 v.step349WorkingView345=api;v.focusOperation=focus;v.setView=view;v.loop=loop;v.dispose=dispose;api.focus(v.activeOperation||0,false);return api;
}
