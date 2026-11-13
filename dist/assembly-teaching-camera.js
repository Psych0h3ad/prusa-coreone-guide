import * as T from 'three';
import {frameBox} from './camera.js?v=20261111-94';
import {motionBounds} from './assembly-director.js?v=20261113-116';
import {tieWorkingRectangle} from './tie-working-view.js?v=20261112-112';

const owners=new WeakMap(),unit=new T.Box3(new T.Vector3(-50,-50,-50),new T.Vector3(50,50,50));
const signature=c=>c.view&&['enabled','fullWidth','fullHeight','offsetX','offsetY','width','height'].map(k=>c.view[k]).join(':');
const smooth=x=>{x=T.MathUtils.clamp(x,0,1);return x*x*(3-2*x);};
const visible=m=>{for(let p=m;p;p=p.parent)if(!p.visible)return false;return true;};
const localBox=(v,min,max)=>new T.Box3(new T.Vector3(...min).multiplyScalar(.001),new T.Vector3(...max).multiplyScalar(.001)).applyMatrix4(v.printer.matrixWorld);
function selectedBox(v,refs){const b=new T.Box3();for(const m of v.director.resolve(refs).filter(visible))b.union(new T.Box3().setFromObject(m));return b;}
function target(v,index){
 if(v.disposed||!v.loaded||v.state?.flow!=='build'||v.state.explore||v.state.comparison==='before'||v.operationScene?.full)return null;
 const p=v.operationScene?.plan,a=v.sceneActors?.[index],kind=p?.teachingCamera;
 if(!a||!(kind==='rear-z-screws'&&index===0||kind==='y-pulley-flat'&&index===0||kind==='idler-nut'&&index<=2||kind==='fe-front-exit'&&index===0))return null;
 return {p,a,kind,index};
}
function framing(v,box,direction,min=45){
 const w=v.container.clientWidth,h=v.container.clientHeight,rect=tieWorkingRectangle(v,unit,direction);
 const fov=rect?T.MathUtils.radToDeg(2*Math.atan(Math.tan(T.MathUtils.degToRad(v.camera.fov/2))*(rect.b-rect.t)/h)):v.camera.fov,aspect=rect?(rect.r-rect.l)/(rect.b-rect.t):v.camera.aspect;
 return {pose:frameBox(box,direction,fov,aspect,1.12,min),rect,w,h,min};
}
function idlerEntryFrame(v,s){
 // Fit separate real parts and the swept moving-part box. A single union AABB
 // adds empty near-plane corners, especially along the screw approach.
 const parts=[798,808,799].map(id=>selectedBox(v,[id]));
 parts.push(motionBounds(s.a).applyMatrix4(v.printer.matrixWorld));
 const boxes=parts.filter(b=>!b.isEmpty()).map(b=>b.expandByScalar(1));
 const box=new T.Box3();for(const b of boxes)box.union(b);
 const direction=new T.Vector3(550,650,1100),frame=framing(v,box,direction);
 const forward=direction.clone().normalize(),basis=new T.Matrix4().lookAt(forward,new T.Vector3(),new T.Vector3(0,1,0));
 const right=new T.Vector3().setFromMatrixColumn(basis,0),up=new T.Vector3().setFromMatrixColumn(basis,1);
 const tanY=Math.tan(T.MathUtils.degToRad(v.camera.fov/2))*(frame.rect?(frame.rect.b-frame.rect.t)/frame.h:1);
 const tanX=tanY*(frame.rect?(frame.rect.r-frame.rect.l)/(frame.rect.b-frame.rect.t):v.camera.aspect);
 let distance=frame.min;
 for(const b of boxes)for(const x of[b.min.x,b.max.x])for(const y of[b.min.y,b.max.y])for(const z of[b.min.z,b.max.z]){
  const p=new T.Vector3(x,y,z).sub(frame.pose.target),depth=p.dot(forward);
  distance=Math.max(distance,depth+1.05*Math.abs(p.dot(right))/tanX,depth+1.05*Math.abs(p.dot(up))/tanY);
 }
 frame.pose.position.copy(frame.pose.target).addScaledVector(forward,distance);
 return {...frame,box,kind:s.kind,index:s.index};
}
function pose(v,index=v.activeOperation||0){
 const s=target(v,index);if(!s||!v.container.clientWidth||!v.container.clientHeight||v.manualCamera)return null;
 v.printer.updateMatrixWorld(true);let box,direction;
 if(s.kind==='rear-z-screws'){
  box=motionBounds(s.a).applyMatrix4(v.printer.matrixWorld).expandByScalar(4);direction=new T.Vector3(550,1100,850);
 }else if(s.kind==='y-pulley-flat'){
  // Shaft/root working envelope, in the same source-mm frame as the retained pulley.
  box=localBox(v,[170,130,327],[190,152,368]).union(motionBounds(s.a).applyMatrix4(v.printer.matrixWorld)).expandByScalar(2);direction=new T.Vector3(0,100,-1250);
 }else if(s.kind==='idler-nut'){
  if(s.index<2)return idlerEntryFrame(v,s);
  box=selectedBox(v,[798,799]).union(motionBounds(s.a).applyMatrix4(v.printer.matrixWorld)).expandByScalar(3);direction=new T.Vector3(450,450,-1100);
 }else{
  // Existing route view first; only its last part approaches the front exit.
  const t=T.MathUtils.clamp(v.operationProgress*v.sceneActors.length-index,0,1),blend=smooth((t-.62)/.30);
  const broad=(s.a.focusBox||s.a.box).clone().applyMatrix4(v.printer.matrixWorld).expandByScalar(18),originalDirection=new T.Vector3(-1000,80,1200),detail=localBox(v,[20,-275,-44],[62,-128,10]);
  const from=frameBox(broad,originalDirection,v.camera.fov,v.camera.aspect,1.2,140),to=framing(v,detail,new T.Vector3(700,1000,500),70);
  to.pose={position:from.position.clone().lerp(to.pose.position,blend),target:from.target.clone().lerp(to.pose.target,blend)};to.blend=blend;
  // Interpolate the projection offset as well, keeping the entry view unchanged.
  to.offsetScale=blend;to.box=detail;to.kind=s.kind;to.index=index;return to;
 }
 return {...framing(v,box,direction),box,kind:s.kind,index};
}
export function clearAssemblyTeachingCamera(v){
 const c=owners.get(v);if(!c)return;
 if(c.projection&&signature(v.camera)===c.projection)v.camera.clearViewOffset();
 if(v.controls.minDistance===c.minimum)v.controls.minDistance=c.originalMinimum;
 owners.delete(v);
}
function place(v,p,instant,c){
 const scale=p.offsetScale??1;
 if(p.rect&&scale){v.camera.setViewOffset(p.w,p.h,(p.w-p.rect.l-p.rect.r)/2*scale,(p.h-p.rect.t-p.rect.b)/2*scale,p.w,p.h);c.projection=signature(v.camera);}
 else if(c.projection&&signature(v.camera)===c.projection){v.camera.clearViewOffset();c.projection=null;}
 c.minimum=p.min;v.controls.minDistance=p.min;c.width=p.w;c.height=p.h;
 v.lastOperationFocus=p.index;v.lastFocusSettled=false;
 const key=JSON.stringify([p.kind,p.index,p.w,p.h,p.blend,...p.pose.position.toArray(),...p.pose.target.toArray()]);
 if(c.key!==key){
  if(!instant&&v.cameraTween&&v.cameraTween===c.tween){v.cameraTween.to.copy(p.pose.position);v.cameraTween.toT.copy(p.pose.target);}
  else{v.moveCamera(p.pose,instant);c.tween=v.cameraTween;}
  c.key=key;
 }
}
export function focusAssemblyTeachingCamera(v,index,instant=false){
 const p=pose(v,index);if(!p){if(!target(v,index)||!v.manualCamera)clearAssemblyTeachingCamera(v);return false;}
 let c=owners.get(v);if(!c){c={originalMinimum:v.controls.minDistance};owners.set(v,c);}place(v,p,instant,c);return true;
}
export function followAssemblyTeachingCamera(v){
 if(!target(v,v.activeOperation||0)){clearAssemblyTeachingCamera(v);return;}
 const c=owners.get(v);
 if(v.manualCamera){if(c&&(c.width!==v.container.clientWidth||c.height!==v.container.clientHeight)&&c.projection&&signature(v.camera)===c.projection){v.camera.clearViewOffset();c.projection=null;}return;}
 const p=pose(v);if(!p)return;
 const owner=c||{originalMinimum:v.controls.minDistance};if(!c)owners.set(v,owner);
 // Geometry is already current when setProgress calls us; the source clock stays intact.
 place(v,p,!!c&&!v.cameraTween,owner);
}
