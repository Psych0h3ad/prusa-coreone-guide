import * as T from 'three';
import {frameBox}from './camera.js?v=20261111-94';

const cache=new WeakMap(),fields=['enabled','fullWidth','fullHeight','offsetX','offsetY','width','height'];
const visible=m=>{for(let p=m;p;p=p.parent)if(!p.visible)return false;return true;};
const active=(v,index=v.activeOperation||0)=>!v.operationScene?.full&&v.operationScene?.plan.chapter===6&&v.operationScene.plan.step===42&&v.sceneActors?.[index]?.flex?.some(id=>id==='free1'||id==='free2');
const signature=view=>view&&fields.map(k=>view[k]).join(':');
export function clearTieWorkingViewOffset(v,inactiveOnly=false){
 if(inactiveOnly&&active(v))return;
 const c=cache.get(v);if(!c)return;
 // A different helper may already own the current projection. Only remove
 // the exact offset this helper last installed; release before later hooks.
 if(c.projection&&signature(v.camera.view)===c.projection)v.camera.clearViewOffset();
 if(c.minDistance!==undefined&&v.controls.minDistance===28)v.controls.minDistance=c.minDistance;
 c.projection=null;c.key=null;c.minDistance=undefined;v.tieWorkingViewOffset=false;
}
function mapped(e,p){const q=p.clone();e.bandSweep?.map(q);return q.multiplyScalar(.001).applyMatrix4(e.mesh.matrixWorld);}
export function tieWorkingFrame(v,index=v.activeOperation||0){
 if(!active(v,index))return null;
 const id=v.sceneActors[index].flex.find(id=>id==='free1'||id==='free2'),e=v.fasteners.entities.get(id);if(!e?.surface||!visible(e.mesh))return null;
 v.printer.updateMatrixWorld(true);
 const c=cache.get(v)||{};cache.set(v,c);const frameKey=[id,v.sceneActors[index].to,e.geometry.attributes.position.version,...e.mesh.matrixWorld.elements].join(':');if(c.frameKey===frameKey)return c.frame;
 const fastening=v.sceneActors[index].to===4,workingRadius=fastening?16:8;
 const r=e.routeModel,eye=r.head.clone().addScaledVector(e.U,1.6).addScaledVector(e.V,.325),point=mapped(e,eye);
 const normal=mapped(e,eye.clone().addScaledVector(e.V,.5)).sub(point).normalize(),up=mapped(e,eye.clone().addScaledVector(e.U,.5)).sub(point).normalize(),across=mapped(e,eye.clone().addScaledVector(e.W,.5)).sub(point).normalize();
 const p=e.geometry.attributes.position,box=new T.Box3(),head=[];
 // Keep the eye and nearby loop/tube together while fastening. The loose
 // tail and the full printer envelope must not determine the working frame.
 for(let i=0;i<e.surface.a.length;i++)if(e.surface.a[i]>=e.headOffset){const q=new T.Vector3().fromBufferAttribute(p,i).applyMatrix4(e.mesh.matrixWorld);head.push(q);box.expandByPoint(q);}
 const nearRows=new Set();
 for(let i=0;i<e.loop.points.length;i++)if(mapped(e,e.loop.points[i]).distanceTo(point)<=workingRadius)nearRows.add(i);
 for(let i=0;i<e.surface.a.length;i++){const s=e.surface.a[i];if(s<193*8&&nearRows.has(Math.floor(s/8)))box.expandByPoint(new T.Vector3().fromBufferAttribute(p,i).applyMatrix4(e.mesh.matrixWorld));}
 // Include a tip once it reaches the immediate6mm working area. A remote
 // unthreaded end must not pull the head back into the whole loose-loop frame.
 if(e.mesh.userData.flexState.closed===0){const tip=mapped(e,e.loop.points.at(-1));if(tip.distanceTo(point)<=6)box.expandByPoint(tip);}
 box.expandByPoint(point.clone().addScaledVector(normal,3)).expandByScalar(fastening?3:1.5);
 c.frameKey=frameKey;c.frame={id,e,point,normal,up,across,head,box,fastening};return c.frame;
}
export function tieWorkingRectangle(v,box,direction){
 const stage=v.container.getBoundingClientRect?.(),w=v.container.clientWidth,h=v.container.clientHeight,obstacles=[];
 const parent=v.container.closest?.('.stage-column')||v.container.parentElement;
 for(const el of parent?.querySelectorAll?.('.stage-tools,.view-controls,.touch-model-toggle,#compact-view-toggle,#operation-panel')||[]){
  const r=el.getBoundingClientRect();if(!r.width||!r.height||!stage||r.right<=stage.left||r.left>=stage.right||r.bottom<=stage.top||r.top>=stage.bottom)continue;
  obstacles.push({l:Math.max(0,r.left-stage.left-6),r:Math.min(w,r.right-stage.left+6),t:Math.max(0,r.top-stage.top-6),b:Math.min(h,r.bottom-stage.top+6)});
 }
 const c=cache.get(v)||{};cache.set(v,c);const rectKey=JSON.stringify([w,h,obstacles,box.min.toArray(),box.max.toArray(),direction.toArray()]);if(c.rectKey===rectKey)return c.rect;
 const xs=[6,w-6,...obstacles.flatMap(o=>[o.l,o.r])].filter(x=>x>=6&&x<=w-6).sort((a,b)=>a-b),ys=[6,h-6,...obstacles.flatMap(o=>[o.t,o.b])].filter(y=>y>=6&&y<=h-6).sort((a,b)=>a-b);
 let best=null,distance=Infinity;
 for(let i=0;i<xs.length;i++)for(let j=i+1;j<xs.length;j++)for(let a=0;a<ys.length;a++)for(let b=a+1;b<ys.length;b++){
  const rect={l:xs[i],r:xs[j],t:ys[a],b:ys[b]},rw=rect.r-rect.l,rh=rect.b-rect.t;
  if(rw<44||rh<36||obstacles.some(o=>rect.l<o.r&&rect.r>o.l&&rect.t<o.b&&rect.b>o.t))continue;
  const fov=T.MathUtils.radToDeg(2*Math.atan(Math.tan(T.MathUtils.degToRad(v.camera.fov/2))*rh/h)),pose=frameBox(box,direction,fov,rw/rh,1.08,45),d=pose.position.distanceToSquared(pose.target);
  if(d<distance){distance=d;best={...rect,pose};}
 }
 c.rectKey=rectKey;c.rect=best;return best;
}
function workingPose(v,index){
 if(!active(v,index)){clearTieWorkingViewOffset(v);return null;}
 if(v.manualCamera)return null;
 const frame=tieWorkingFrame(v,index);if(!frame)return null;
 const direction=frame.normal.clone().addScaledVector(frame.up,frame.fastening?.45:.18).addScaledVector(frame.across,frame.fastening?.30:0).normalize();
 // Select free screen area with a probe larger than the rectangle helper's
 // distance floor, then fit the real working region within that rectangle.
 const probe=new T.Box3(new T.Vector3(-50,-50,-50),new T.Vector3(50,50,50)),rect=tieWorkingRectangle(v,probe,direction);if(!rect)return null;
 const w=v.container.clientWidth,h=v.container.clientHeight;v.camera.setViewOffset(w,h,(w-rect.l-rect.r)/2,(h-rect.t-rect.b)/2,w,h);
 const c=cache.get(v)||{};cache.set(v,c);c.projection=signature(v.camera.view);c.minDistance??=v.controls.minDistance;v.controls.minDistance=28;v.tieWorkingViewOffset=true;
 const actor=v.sceneActors[index],avoid=frame.box.clone().applyMatrix4(v.printer.matrixWorld.clone().invert());actor.calloutAvoidBounds=[...avoid.min.clone().multiplyScalar(1000).toArray(),...avoid.max.clone().multiplyScalar(1000).toArray()];
 const fov=T.MathUtils.radToDeg(2*Math.atan(Math.tan(T.MathUtils.degToRad(v.camera.fov/2))*(rect.b-rect.t)/h)),pose=frameBox(frame.box,direction,fov,(rect.r-rect.l)/(rect.b-rect.t),1.15,65);
 return{pose,c,key:[index,frame.e.geometry.attributes.position.version,w,h,rect.l,rect.r,rect.t,rect.b].join(':')};
}
export function focusTieWorkingView(v,index,instant=false){
 const p=workingPose(v,index);if(!p)return false;v.lastOperationFocus=index;v.lastFocusSettled=false;v.moveCamera(p.pose,instant);p.c.tween=v.cameraTween;p.c.key=p.key;return true;
}
export function followTieWorkingView(v){
 const p=workingPose(v,v.activeOperation||0);if(!p||p.key===p.c.key)return;
 p.c.key=p.key;
 if(v.cameraTween&&v.cameraTween===p.c.tween){v.cameraTween.to.copy(p.pose.position);v.cameraTween.toT.copy(p.pose.target);}
 else v.moveCamera(p.pose,true);
}
