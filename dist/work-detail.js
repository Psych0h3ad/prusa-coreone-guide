import {electronicsTieDirection}from './electronics-tie-view.js?v=20261112-112';
import * as T from 'three';
import {frameBox} from './camera.js?v=20261111-94';
import {t} from './i18n.js?v=20261112-113';

function detailRectangle(viewer){
 const container=viewer.container,width=container.clientWidth,height=container.clientHeight,stage=container.getBoundingClientRect?.(),parent=container.closest?.('.stage-column')||container.parentElement,obstacles=[];
 for(const element of parent?.querySelectorAll?.('.stage-tools,.view-controls,.touch-model-toggle,#compact-view-toggle,#operation-panel')||[]){
  const r=element.getBoundingClientRect();if(!stage||!r.width||!r.height||r.right<=stage.left||r.left>=stage.right||r.bottom<=stage.top||r.top>=stage.bottom)continue;
  obstacles.push({left:r.left-stage.left-6,right:r.right-stage.left+6,top:r.top-stage.top-6,bottom:r.bottom-stage.top+6});
 }
 const preferred=Math.floor(Math.max(96,Math.min(160,width*.36,height*.36)));
 for(let size=preferred;size>=80;size-=8){
  const target={left:10,top:height-76-size},xs=[10,width-size-10,...obstacles.flatMap(o=>[o.left-size,o.right])],ys=[target.top,10,height-size-10,...obstacles.flatMap(o=>[o.top-size,o.bottom])];
  let best=null,score=Infinity;
  for(const left of xs)for(const top of ys){
   if(left<10||top<10||left+size>width-10||top+size>height-10||obstacles.some(o=>left<o.right&&left+size>o.left&&top<o.bottom&&top+size>o.top))continue;
   const distance=(left-target.left)**2+(top-target.top)**2;if(distance<score){score=distance;best={left,top,width:size,height:size};}
  }
  if(best)return best;
 }
 return null;
}

// The overview retains the complete uncut tail. This second view uses the
// same scene, geometry and renderer to show the small feed opening clearly.
export class WorkDetail {
 constructor(container){
  this.camera=new T.PerspectiveCamera(33,1,.5,5000);
  this.box=new T.Box3();this.point=new T.Vector3();this.direction=new T.Vector3();
  this.element=document.createElement('div');this.element.className='work-detail';
  this.element.setAttribute('aria-hidden','true');this.element.hidden=true;
  this.label=document.createElement('span');this.element.append(this.label);container.append(this.element);
 }
 update(viewer){
  const actor=viewer.sceneActors?.[viewer.activeOperation||0];
  const entity=actor?.flex?.map(id=>viewer.fasteners.entities.get(id)).find(e=>e?.routeModel&&!e.strap);
  const width=viewer.container.clientWidth,height=viewer.container.clientHeight;
  const rectangle=entity?.mesh.visible&&!viewer.operationScene?.full?detailRectangle(viewer):null;
  this.visible=!!rectangle;
  this.element.hidden=!this.visible;
  if(!this.visible)return;
  entity.mesh.updateWorldMatrix(true,false);
  const positions=entity.geometry.attributes.position;this.box.makeEmpty();
  for(let i=entity.headOffset;i<positions.count;i++)this.box.expandByPoint(this.point.fromBufferAttribute(positions,i).applyMatrix4(entity.mesh.matrixWorld));
  this.lockBox=this.box.clone();
  this.rect=rectangle;
  Object.assign(this.element.style,{left:this.rect.left+'px',top:this.rect.top+'px',width:this.rect.width+'px',height:this.rect.height+'px'});
  const label=t('ロック部');if(this.label.textContent!==label)this.label.textContent=label;
  const plan=viewer.operationScene.plan;
  this.direction.copy(viewer.camera.position).sub(viewer.controls.target).normalize();
  if(!viewer.manualCamera&&plan.pose==='printer-back')this.direction.set(plan.step===45?-400:1000,950,-1200).normalize();
  if(!viewer.manualCamera){const direction=electronicsTieDirection(entity);if(direction)this.direction.copy(direction);}
  const pose=frameBox(this.box.expandByScalar(4),this.direction,33,1,1.2,32);
  this.camera.position.copy(pose.position);this.camera.lookAt(pose.target);this.camera.updateMatrixWorld(true);
 }
 render(viewer){
  this.update(viewer);
  const renderer=viewer.renderer;if(!this.visible||!renderer.setScissorTest)return;
  const {left,top,width,height}=this.rect,h=viewer.container.clientHeight;
  const guides=viewer.arrowLayer.visible,autoShadow=renderer.shadowMap.autoUpdate;
  try{
   viewer.arrowLayer.visible=false;renderer.shadowMap.autoUpdate=false;
   renderer.setViewport(left,h-top-height,width,height);renderer.setScissor(left,h-top-height,width,height);renderer.setScissorTest(true);
   renderer.render(viewer.scene,this.camera);
  }finally{
   viewer.arrowLayer.visible=guides;renderer.shadowMap.autoUpdate=autoShadow;
   renderer.setScissorTest(false);renderer.setViewport(0,0,viewer.container.clientWidth,h);
  }
 }
 dispose(){this.element.remove();}
}
