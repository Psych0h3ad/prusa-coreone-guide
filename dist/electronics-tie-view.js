import * as T from 'three';
import {frameBox}from './camera.js?v=20261111-94';
import {tieWorkingRectangle}from './tie-working-view.js?v=20261112-112';
const owners=new WeakMap();
const projection=c=>c.view&&['enabled','fullWidth','fullHeight','offsetX','offsetY','width','height'].map(k=>c.view[k]).join(':');
const sensorTie=(plan,id)=>plan?.chapter===7&&plan?.step===23&&/^bundle[12]$/.test(id);
function workingTie(v,index=v.activeOperation||0){
 const plan=v.operationScene?.plan,actor=v.sceneActors?.[index];
 if(v.operationScene?.full)return null;
 return actor?.flex?.find(id=>(plan?.chapter===6&&plan?.step===56&&id==='box4')||sensorTie(plan,id))||null;
}
export function electronicsTieDirection(entity,plan){
 if((!/^box[1245]$/.test(entity?.id)&&!sensorTie(plan,entity?.id))||!entity?.loop?.firstTangent||!entity.loop?.firstSide)return null;
 const width=entity.loop.firstSide.clone(),root=entity.loop.firstTangent.clone().negate(),feed=new T.Vector3().crossVectors(width,root).normalize(),height=new T.Vector3().crossVectors(feed,width).normalize();
 return feed.addScaledVector(height,.35).addScaledVector(width,sensorTie(plan,entity.id)?.8:.15).transformDirection(entity.mesh.matrixWorld);
}
function pose(v,index=v.activeOperation||0){
 const plan=v.operationScene?.plan,actor=v.sceneActors?.[index],id=workingTie(v,index);
 if(v.manualCamera||!id)return null;
 const e=v.fasteners.entities.get(id);if(!e?.mesh.visible)return null;
 e.mesh.updateWorldMatrix(true,false);const direction=electronicsTieDirection(e,plan);if(!direction)return null;
 const box=new T.Box3(),p=new T.Vector3(),a=e.geometry.attributes.position;
 for(let i=e.headOffset;i<a.count;i++)box.expandByPoint(p.fromBufferAttribute(a,i).applyMatrix4(e.mesh.matrixWorld));
 box.expandByScalar(3);
 const rect=tieWorkingRectangle(v,box,direction),w=v.container.clientWidth,h=v.container.clientHeight;
 return{pose:rect?.pose||frameBox(box,direction,v.camera.fov,v.camera.aspect,1.12,42),rect,w,h,key:[index,...box.min.toArray(),...box.max.toArray(),...direction.toArray(),v.camera.aspect,rect?.l,rect?.r,rect?.t,rect?.b].join(':'),actor,box,polarLimit:sensorTie(plan,id)?Math.min(Math.PI,Math.acos(T.MathUtils.clamp(direction.y,-1,1))+.05):undefined};
}
function restorePolar(v,c){if(c.polarLimit!==undefined&&v.controls.maxPolarAngle===c.polarLimit)v.controls.maxPolarAngle=c.maxPolarAngle;c.polarLimit=undefined;c.maxPolarAngle=undefined;}
function place(v,p,c){
 if(p.polarLimit===undefined)restorePolar(v,c);
 else if(c.polarLimit===undefined||v.controls.maxPolarAngle===c.polarLimit){c.maxPolarAngle??=v.controls.maxPolarAngle;c.polarLimit=Math.max(c.maxPolarAngle,p.polarLimit);v.controls.maxPolarAngle=c.polarLimit;}
 if(p.rect){v.camera.setViewOffset(p.w,p.h,(p.w-p.rect.l-p.rect.r)/2,(p.h-p.rect.t-p.rect.b)/2,p.w,p.h);c.projection=projection(v.camera);}c.width=p.w;c.height=p.h;
}
function release(v){const c=owners.get(v);if(!c)return;if(c.projection&&projection(v.camera)===c.projection)v.camera.clearViewOffset();if(v.controls.minDistance===24)v.controls.minDistance=c.minDistance;restorePolar(v,c);owners.delete(v);}
export function focusElectronicsTie(v,index,instant=false){
 if(v.manualCamera&&workingTie(v,index))return false;
 const p=pose(v,index);if(!p){release(v);return false;}
 let c=owners.get(v);if(!c){c={minDistance:v.controls.minDistance};owners.set(v,c);}v.controls.minDistance=24;v.lastOperationFocus=index;v.lastFocusSettled=false;
 place(v,p,c);v.moveCamera(p.pose,instant);c.tween=v.cameraTween;c.key=p.key;return true;
}
export function followElectronicsTie(v){
 if(v.manualCamera&&owners.has(v)&&workingTie(v)){const c=owners.get(v);if((c.width!==v.container.clientWidth||c.height!==v.container.clientHeight)&&c.projection&&projection(v.camera)===c.projection){v.camera.clearViewOffset();c.projection=null;}return;}
 const p=pose(v);if(!p){release(v);return;}
 const c=owners.get(v);if(!c||c.key===p.key)return;c.key=p.key;
 place(v,p,c);
 if(v.cameraTween&&v.cameraTween===c.tween){v.cameraTween.to.copy(p.pose.position);v.cameraTween.toT.copy(p.pose.target);}else v.moveCamera(p.pose,true);
}

export function clearElectronicsTie(v){release(v);}
