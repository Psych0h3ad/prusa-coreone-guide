import * as T from 'three';
import {frameBox} from './camera.js?v=20261111-94';
import {socketCentre} from './loveboard-layout.js?v=20261111-94';

// Camera/guide metadata only. The four operations, rigid transforms, original
// loom, 22 conductors, terminal mesh and materials remain owned by the plan.
export function mainPlugWorkingActor(actor,pivot){
 const anchor=new T.Vector3(...socketCentre('J13')).sub(new T.Vector3(...pivot))
  .applyAxisAngle(new T.Vector3(1,0,0),-Math.PI/2).add(new T.Vector3(...pivot));
 anchor.x-=9.5;anchor.z+=.8;
 return{...actor,camera:'loveboard-main-working',anchors:[anchor.toArray()],
  guideAtAnchor:true,guideGhost:false,guideRadius:1.25,guideTube:.18,guideArrowLength:4};
}

const shellBounds=new WeakMap();
function plugBodyBox(lead){
 const g=lead.geometry,p=g.attributes.position;let cached=shellBounds.get(g);
 if(!cached||cached.version!==p.version){
  const group=g.groups.find(g=>g.materialIndex===lead.socket.pins);
  if(!group)return null;
  const box=new T.Box3(),point=new T.Vector3();
  for(let i=group.start;i<group.start+group.count;i++)
   box.expandByPoint(point.fromBufferAttribute(p,g.index?g.index.getX(i):i));
  cached={version:p.version,box};shellBounds.set(g,cached);
 }
 return cached.box.clone().applyMatrix4(lead.mesh.matrixWorld);
}
const visible=m=>{for(let p=m;p;p=p.parent)if(!p.visible)return false;return true;};
const workRects=new WeakMap();
function clearWorkRect(v,box,direction){
 const stage=v.container.getBoundingClientRect(),w=stage.width,h=stage.height,obstacles=[];
 for(const el of (v.container.closest('.stage-column')||v.container.parentElement).querySelectorAll('.stage-tools,.view-controls,.touch-model-toggle,#compact-view-toggle,#operation-panel')){
  const r=el.getBoundingClientRect();if(!r.width||!r.height||r.bottom<=stage.top||r.top>=stage.bottom)continue;
  obstacles.push({l:Math.max(0,r.left-stage.left-6),r:Math.min(w,r.right-stage.left+6),t:Math.max(0,r.top-stage.top-6),b:Math.min(h,r.bottom-stage.top+6)});
 }
 const key=JSON.stringify([w,h,obstacles]),cached=workRects.get(v);if(cached?.key===key)return cached.rect;
 const xs=[6,w-6,...obstacles.flatMap(r=>[r.l,r.r])].filter(x=>x>=6&&x<=w-6).sort((a,b)=>a-b),ys=[6,h-6,...obstacles.flatMap(r=>[r.t,r.b])].filter(y=>y>=6&&y<=h-6).sort((a,b)=>a-b);
 let best={l:6,r:w-6,t:6,b:h-6},bestDistance=Infinity;
 for(let i=0;i<xs.length;i++)for(let j=i+1;j<xs.length;j++)for(let a=0;a<ys.length;a++)for(let b=a+1;b<ys.length;b++){
  const rect={l:xs[i],r:xs[j],t:ys[a],b:ys[b]},rw=rect.r-rect.l,rh=rect.b-rect.t;
  if(rw<40||rh<36||obstacles.some(o=>rect.l<o.r&&rect.r>o.l&&rect.t<o.b&&rect.b>o.t))continue;
  const fov=T.MathUtils.radToDeg(2*Math.atan(Math.tan(T.MathUtils.degToRad(v.camera.fov)/2)*rh/h));
  const pose=frameBox(box,direction,fov,rw/rh,1.2,45),distance=pose.position.distanceToSquared(pose.target);
  if(distance<bestDistance){best=rect;bestDistance=distance;}
 }
 workRects.set(v,{key,rect:best});return best;
}
function frameWorkingArea(v,box,direction){
 const w=v.container.clientWidth,h=v.container.clientHeight,rect=clearWorkRect(v,box,direction),rw=rect.r-rect.l,rh=rect.b-rect.t;
 box.expandByScalar(h<240?2.5:7);
 const tanY=Math.tan(T.MathUtils.degToRad(v.camera.fov)/2),fov=T.MathUtils.radToDeg(2*Math.atan(tanY*rh/h));
 // Move the principal point, not the physical eye: translating a close camera
 // sideways changes the working angle and can put the mount in front of J13.
 v.camera.setViewOffset(w,h,(w-rect.l-rect.r)/2,(h-rect.t-rect.b)/2,w,h);
 v.mainPlugViewOffset=true;
 return frameBox(box,direction,fov,rw/rh,1.2,45);
}
export function clearMainPlugViewOffset(v){
 if(v.mainPlugViewOffset){v.camera.clearViewOffset();v.mainPlugViewOffset=false;}
}
function workingPose(v,index){
 const plan=v.operationScene?.plan,actor=v.sceneActors?.[index];
 if(plan?.chapter!==6||plan.step!==31||actor?.camera!=='loveboard-main-working'){clearMainPlugViewOffset(v);return null;}
 if(v.manualCamera)return null;
 const lead=v.mainLoom?.model.lead;if(!lead||!visible(lead.mesh))return null;
 v.printer.updateMatrixWorld(true);
 const box=plugBodyBox(lead);if(!box)return null;
 const ports=v.meshes.filter(m=>m.userData.connector==='J13'&&visible(m));
 if(!ports.length)return null;
 for(const port of ports)box.union(new T.Box3().setFromObject(port));
 // Reserve the actual swept connector area for the existing callout placer.
 // This is not a proxy mesh and is never rendered.
 const avoid=box.clone().expandByScalar(1.4).applyMatrix4(v.printer.matrixWorld.clone().invert());
 actor.calloutAvoidBounds=[...avoid.min.clone().multiplyScalar(1000).toArray(),...avoid.max.clone().multiplyScalar(1000).toArray()];
 // Approach: inspect the open socket. Seating: a slightly lower side view
 // retains the junction between the original plug and receptacle walls.
 const t=T.MathUtils.smoothstep(v.operationProgress*v.sceneActors.length-index,0,1);
 const direction=new T.Vector3(.70+.30*t,1-.18*t,-.40).normalize();
 return frameWorkingArea(v,box,direction);
}
export function focusMainPlugWorkingView(v,index,instant=false){
 const pose=workingPose(v,index);if(!pose)return false;
 v.lastOperationFocus=index;v.lastFocusSettled=false;v.controls.minDistance=28;
 v.moveCamera(pose,instant);v.mainPlugViewTween=v.cameraTween;return true;
}
export function followMainPlugWorkingView(v){
 const plan=v.operationScene?.plan;
 if(plan?.chapter!==6||plan.step!==31||v.sceneActors?.[v.activeOperation]?.camera!=='loveboard-main-working'){clearMainPlugViewOffset(v);return;}
 if(v.lastOperationFocus!==v.activeOperation)return;
 const pose=workingPose(v,v.activeOperation);if(!pose)return;
 // Retain the existing entry/reset tween. Follow the real connector bounds
 // continuously once it finishes; gestures still set manualCamera and win.
 if(v.cameraTween&&v.cameraTween===v.mainPlugViewTween){
  v.cameraTween.to.copy(pose.position);v.cameraTween.toT.copy(pose.target);
 }else v.moveCamera(pose,true);
}
