import * as T from 'three';
import {frameBox,viewDirection} from './camera.js?v=20261111-94';
import {clearMainPlugViewOffset} from './loveboard-main-view.js?v=20261111-94';
import {PULLEY_SETUP} from './pulley-setup.js?v=20261111-94';
import {X_PULLEY_SETUP} from './x-pulley-setup.js?v=20261111-94';

export function clearPulleyViewOffset(v){
 if(v.pulleyViewOffset){v.camera.clearViewOffset();v.pulleyViewOffset=false;}
}
function freeRectangle(v,box,direction){
 const stage=v.container.getBoundingClientRect?.(),w=v.container.clientWidth,h=v.container.clientHeight;
 if(!stage||typeof document.querySelectorAll!=='function')return null;
 const obstacles=[];
 for(const element of document.querySelectorAll('.stage-tools,.view-controls,#operation-panel,#touch-model-toggle,#compact-view-toggle')){
  if(!element.getClientRects().length)continue;
  const r=element.getBoundingClientRect();if(r.right<=stage.left||r.left>=stage.right||r.bottom<=stage.top||r.top>=stage.bottom)continue;
  obstacles.push({l:Math.max(0,r.left-stage.left-5),r:Math.min(w,r.right-stage.left+5),t:Math.max(0,r.top-stage.top-5),b:Math.min(h,r.bottom-stage.top+5)});
 }
 const xs=[6,w-6,...obstacles.flatMap(r=>[r.l,r.r])].filter(x=>x>=6&&x<=w-6).sort((a,b)=>a-b),ys=[6,h-6,...obstacles.flatMap(r=>[r.t,r.b])].filter(y=>y>=6&&y<=h-6).sort((a,b)=>a-b);
 let best=null,distance=Infinity;
 for(let i=0;i<xs.length;i++)for(let j=i+1;j<xs.length;j++)for(let a=0;a<ys.length;a++)for(let b=a+1;b<ys.length;b++){
  const r={l:xs[i],r:xs[j],t:ys[a],b:ys[b]},rw=r.r-r.l,rh=r.b-r.t;
  if(rw<48||rh<44||obstacles.some(o=>r.l<o.r&&r.r>o.l&&r.t<o.b&&r.b>o.t))continue;
  const fov=T.MathUtils.radToDeg(2*Math.atan(Math.tan(T.MathUtils.degToRad(v.camera.fov)/2)*rh/h));
  const pose=frameBox(box,direction,fov,rw/rh,1.12,45),d=pose.position.distanceToSquared(pose.target);
  if(d<distance){distance=d;best={...r,pose};}
 }
 return best;
}
export function focusPulleyWorkingView(v,index,instant=false){
 const plan=v.operationScene?.plan,actor=v.sceneActors?.[index],x=plan?.step===42;
 if(plan?.chapter!==5||![42,43].includes(plan.step)||![3,5].includes(index)||v.operationScene.full){clearPulleyViewOffset(v);return false;}
 if(v.manualCamera)return false;
 const tool=v.meshes.find(m=>m.userData.component===(x?'xPulleyHeightTool':'pulleyHeightTool')),head=actor?.nodes?.[0];
 if(!tool?.visible||!head)return false;
 const d=x?X_PULLEY_SETUP:PULLEY_SETUP,r=x?8:16;
 v.printer.updateMatrixWorld(true);tool.geometry.computeBoundingBox();
 // Frame actual retained tool material around the contact, without including
 // its long handle. This box is camera metadata and is never rendered.
 const contact=tool.geometry.boundingBox.clone().intersect(new T.Box3(
  new T.Vector3(d.pivot[0]-r,d.pivot[1]-r,d.pulleyFaceZ).multiplyScalar(.001),
  new T.Vector3(d.pivot[0]+r,d.pivot[1]+r,x?d.motorBossZ:d.motorFaceZ).multiplyScalar(.001)
 ));
 if(contact.isEmpty())return false;
 const box=contact.applyMatrix4(tool.matrixWorld).union(new T.Box3().setFromObject(head)).expandByScalar(2.2),direction=viewDirection('back').normalize(),rect=freeRectangle(v,box,direction);
 if(!rect)return false;
 clearMainPlugViewOffset(v);
 const w=v.container.clientWidth,h=v.container.clientHeight;
 v.camera.setViewOffset(w,h,(w-rect.l-rect.r)/2,(h-rect.t-rect.b)/2,w,h);v.pulleyViewOffset=true;
 v.lastOperationFocus=index;v.lastFocusSettled=false;v.controls.minDistance=45;
 v.moveCamera(rect.pose,instant);return true;
}
