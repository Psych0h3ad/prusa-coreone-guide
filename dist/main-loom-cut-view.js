import * as T from 'three';
import {frameBox}from './camera.js?v=20261111-94';

const active=v=>!v.disposed&&v.loaded&&!v.operationScene?.full&&v.operationScene?.plan.chapter===6&&v.operationScene.plan.step===32;
const visible=m=>{for(let p=m;p;p=p.parent)if(!p.visible)return false;return true;};
const guideCache=new WeakMap();
const cache=new WeakMap(),entryFits=new WeakMap(),polar=Math.PI*.99;
const viewKey=c=>JSON.stringify(c.view?.enabled?c.view:null);
export function clearMainLoomCutViewOffset(v){
 if(v.mainLoomCutViewOffset){
  if(viewKey(v.camera)===v.mainLoomCutOwnedView){const p=v.mainLoomCutPriorView;if(p?.enabled)v.camera.setViewOffset(p.fullWidth,p.fullHeight,p.offsetX,p.offsetY,p.width,p.height);else v.camera.clearViewOffset();}
  v.mainLoomCutViewOffset=false;delete v.mainLoomCutPriorView;delete v.mainLoomCutOwnedView;
 }
 if(v.mainLoomCutPriorMin!==undefined){if(v.controls.minDistance===28)v.controls.minDistance=v.mainLoomCutPriorMin;delete v.mainLoomCutPriorMin;}
 if(v.mainLoomCutPriorPolar!==undefined){if(v.controls.maxPolarAngle===polar)v.controls.maxPolarAngle=v.mainLoomCutPriorPolar;delete v.mainLoomCutPriorPolar;}
 entryFits.delete(v);
}
// Three position writes must mark needsUpdate, as for rendering. Also detect
// reparenting, transforms, replaced attributes/geometries and changed children.
export function mainLoomWorkingGuide(v,index){
 const group=v.guideGroups?.[index];if(!group)return null;
 group.updateWorldMatrix(true,true);const nodes=[];
 group.traverse(node=>{const p=node.geometry?.attributes.position;if(p)nodes.push({node,geometry:node.geometry,p,array:p.array,count:p.count,version:p.version,matrix:node.matrixWorld.toArray()});});
 const prior=guideCache.get(group);
 if(prior&&prior.nodes.length===nodes.length&&nodes.every((q,i)=>{const p=prior.nodes[i];return q.node===p.node&&q.geometry===p.geometry&&q.p===p.p&&q.array===p.array&&q.count===p.count&&q.version===p.version&&q.matrix.every((n,j)=>n===p.matrix[j]);}))return prior;
 const points=[];for(const q of nodes)for(let i=0;i<q.count;i++)points.push(new T.Vector3().fromBufferAttribute(q.p,i).applyMatrix4(q.node.matrixWorld));
 const data={group,nodes,points,bounds:new T.Box3().setFromPoints(points)};guideCache.set(group,data);return data;
}
function entryKey(v,index){return{scene:v.operationScene,index,guide:mainLoomWorkingGuide(v,index),w:v.container.clientWidth,h:v.container.clientHeight,auto:v.controls.autoRotate};}
const sameEntry=(a,b)=>a&&a.scene===b.scene&&a.index===b.index&&a.guide===b.guide&&a.w===b.w&&a.h===b.h&&a.auto===b.auto;
export function mainLoomCutFrame(v){
 const model=v.mainLoom?.model,mesh=model?.jacketMesh;if(!mesh||!visible(mesh))return null;
 v.printer.updateMatrixWorld(true);
 const normal=model.current.jacket.getTangentAt(0).negate().transformDirection(mesh.matrixWorld);
 const p=mesh.geometry.attributes.position,sides=mesh.geometry.parameters.radialSegments,ring=Array.from({length:sides},(_,i)=>new T.Vector3().fromBufferAttribute(p,i).applyMatrix4(mesh.matrixWorld));
 // Read the translated real ring, not the pre-r13 source curve centre.
 const point=ring.reduce((sum,p)=>sum.add(p),new T.Vector3()).multiplyScalar(1/ring.length);
 const across=ring[0].clone().sub(point).normalize(),mount=v.director.resolve([859]).find(visible),away=mount?point.clone().sub(new T.Box3().setFromObject(mount).getCenter(new T.Vector3())):across.clone();
 away.addScaledVector(normal,-away.dot(normal));if(away.lengthSq()<1e-8)away.copy(across);else away.normalize();
 return {point,normal,across,away,ring};
}
function freeRectangle(v,points,direction){
 const w=v.container.clientWidth,h=v.container.clientHeight,stage=v.container.getBoundingClientRect?.(),obstacles=[];
 const parent=v.container.closest?.('.stage-column')||v.container.parentElement;
 for(const el of parent?.querySelectorAll?.('.stage-tools,.view-controls,.touch-model-toggle,#compact-view-toggle,#operation-panel')||[]){
  const r=el.getBoundingClientRect();if(!r.width||!r.height||!stage||r.right<=stage.left||r.left>=stage.right||r.bottom<=stage.top||r.top>=stage.bottom)continue;
  obstacles.push({l:Math.max(0,r.left-stage.left-6),r:Math.min(w,r.right-stage.left+6),t:Math.max(0,r.top-stage.top-6),b:Math.min(h,r.bottom-stage.top+6)});
 }
 const basis=new T.Matrix4().lookAt(direction,new T.Vector3(),new T.Vector3(0,1,0)),right=new T.Vector3().setFromMatrixColumn(basis,0),up=new T.Vector3().setFromMatrixColumn(basis,1),rx=points.map(p=>p.dot(right)),uy=points.map(p=>p.dot(up)),sx=Math.max(...rx)-Math.min(...rx),sy=Math.max(...uy)-Math.min(...uy);
 const key=JSON.stringify([w,h,obstacles,...direction.toArray(),Math.round(sx*10),Math.round(sy*10)]);if(cache.get(v)?.key===key)return cache.get(v).rect;
 const xs=[6,w-6,...obstacles.flatMap(o=>[o.l,o.r])].filter(x=>x>=6&&x<=w-6).sort((a,b)=>a-b),ys=[6,h-6,...obstacles.flatMap(o=>[o.t,o.b])].filter(y=>y>=6&&y<=h-6).sort((a,b)=>a-b);
 let rect={l:6,r:w-6,t:6,b:h-6},score=Infinity;
 for(let i=0;i<xs.length;i++)for(let j=i+1;j<xs.length;j++)for(let a=0;a<ys.length;a++)for(let b=a+1;b<ys.length;b++){
  const r={l:xs[i],r:xs[j],t:ys[a],b:ys[b]},rw=r.r-r.l,rh=r.b-r.t;
  if(rw<40||rh<36||obstacles.some(o=>r.l<o.r&&r.r>o.l&&r.t<o.b&&r.b>o.t))continue;
  const fit=Math.max(sx/rw,sy/rh);if(fit<score){rect=r;score=fit;}
 }
 cache.set(v,{key,rect});return rect;
}
// Fit actual points. A world-axis box invents far corners between the fold
// path extrema and needlessly backs away from this small workpiece.
function fitPoints(points,direction,fov,aspect,margin=1.1,minDistance=55){
 const forward=direction.clone().normalize(),basis=new T.Matrix4().lookAt(forward,new T.Vector3(),new T.Vector3(0,1,0)),right=new T.Vector3().setFromMatrixColumn(basis,0),up=new T.Vector3().setFromMatrixColumn(basis,1),axes=[right,up,forward],mid=axes.map(axis=>{const a=points.map(p=>p.dot(axis));return(Math.min(...a)+Math.max(...a))/2;}),target=new T.Vector3();axes.forEach((axis,i)=>target.addScaledVector(axis,mid[i]));
 const tanY=Math.tan(T.MathUtils.degToRad(fov/2)),tanX=tanY*aspect;let distance=minDistance;
 for(const p of points){const q=p.clone().sub(target),depth=q.dot(forward);distance=Math.max(distance,depth+margin*Math.abs(q.dot(right))/tanX,depth+margin*Math.abs(q.dot(up))/tanY);}
 return{target,position:target.clone().addScaledVector(forward,distance)};
}
function workingPose(v,index){
 if(!active(v)){clearMainLoomCutViewOffset(v);return null;}
 if(v.manualCamera)return null;
 const frame=mainLoomCutFrame(v);if(!frame)return null;
 // Look from the outward side of the actual mount lip. An arbitrary Frenet
 // roll can place the opaque lip in front of half the opening after turnover.
 const cloud=frame.ring.map(p=>p.clone());
 let direction=frame.normal.clone().addScaledVector(frame.away,.6).normalize();const box=new T.Box3().setFromPoints(frame.ring);
 box.expandByPoint(frame.point.clone().addScaledVector(frame.normal,6)).expandByScalar(v.container.clientHeight<220?1.5:2.5);
 if(index<3){
  for(const mesh of v.director.resolve([859,'loveBoard',847]).filter(visible)){const b=new T.Box3().setFromObject(mesh);box.union(b);for(const x of[b.min.x,b.max.x])for(const y of[b.min.y,b.max.y])for(const z of[b.min.z,b.max.z])cloud.push(new T.Vector3(x,y,z));}
  box.expandByScalar(4);direction=index===1?new T.Vector3(v.container.clientWidth>v.container.clientHeight?.08:-.5,1,v.container.clientWidth>v.container.clientHeight?0:.5).normalize():new T.Vector3(.2,1,.22).normalize();
  // Guides are already scene-mm. Fit their actual vertices, not a large box.
  const data=mainLoomWorkingGuide(v,index);if(data&&!data.bounds.isEmpty()){box.union(data.bounds);cloud.push(...data.points);}
 }
 const w=v.container.clientWidth,h=v.container.clientHeight,rect=freeRectangle(v,index<3?cloud:frame.ring,direction),rw=rect.r-rect.l,rh=rect.b-rect.t;
 const fov=T.MathUtils.radToDeg(2*Math.atan(Math.tan(T.MathUtils.degToRad(v.camera.fov/2))*rh/h));
 if(!v.mainLoomCutViewOffset)v.mainLoomCutPriorView=v.camera.view?{...v.camera.view}:null;
 v.camera.setViewOffset(w,h,(w-rect.l-rect.r)/2,(h-rect.t-rect.b)/2,w,h);v.mainLoomCutViewOffset=true;v.mainLoomCutOwnedView=viewKey(v.camera);
 const actor=v.sceneActors?.[index];if(actor){const avoid=box.clone().applyMatrix4(v.printer.matrixWorld.clone().invert());actor.calloutAvoidBounds=[...avoid.min.clone().multiplyScalar(1000).toArray(),...avoid.max.clone().multiplyScalar(1000).toArray()];}
 v.mainLoomCutPriorPolar??=v.controls.maxPolarAngle;v.controls.maxPolarAngle=polar;
 return index<3?fitPoints(cloud,direction,fov,rw/rh):frameBox(box,direction,fov,rw/rh,1.15,55);
}
export function focusMainLoomCutView(v,index,instant=false){
 const pose=workingPose(v,index);if(!pose)return false;
 v.lastOperationFocus=index;v.lastFocusSettled=false;v.mainLoomCutPriorMin??=v.controls.minDistance;v.controls.minDistance=28;
 v.moveCamera(pose,instant);v.mainLoomCutTween=v.cameraTween;entryFits.set(v,entryKey(v,index));return true;
}
export function followMainLoomCutView(v){
 if(!active(v)){clearMainLoomCutViewOffset(v);return;}
 if(v.manualCamera)return;
 const index=v.activeOperation||0,key=entryKey(v,index);
 // Fit on entry, operation or viewport/guide changes even with autorotation.
 // Subsequent progress updates leave the user's orbit to OrbitControls.
 if(v.controls.autoRotate&&sameEntry(entryFits.get(v),key))return;
 const pose=workingPose(v,index);if(!pose)return;
 if(v.cameraTween&&v.cameraTween===v.mainLoomCutTween){v.cameraTween.to.copy(pose.position);v.cameraTween.toT.copy(pose.target);}
 else v.moveCamera(pose,true);
 entryFits.set(v,key);
}
