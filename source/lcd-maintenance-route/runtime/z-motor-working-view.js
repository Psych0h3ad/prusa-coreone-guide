import * as T from 'three';
import {frameBox} from './camera.js';
import {tieWorkingRectangle} from './tie-working-view.js?v=20261112-112';

// Presentation only. Read the enabled source owner's current complete parts;
// never derive a physical pose, edit a source buffer, or fit a full lead stock.
const V=p=>new T.Vector3(...p),tracking=new WeakMap();
const projectionFields=['enabled','fullWidth','fullHeight','offsetX','offsetY','width','height'],projections=new WeakMap(),probe=new T.Box3(V([-50,-50,-50]),V([50,50,50]));
const projectionSignature=v=>v&&projectionFields.map(k=>v[k]).join(':');
export function clearZMotorWorkingProjection(v){const owned=projections.get(v);if(owned&&projectionSignature(v.camera.view)===owned.signature)v.camera.clearViewOffset();projections.delete(v);}
function worldBox(meshes){const b=new T.Box3();for(const m of meshes){m.updateWorldMatrix(true,false);m.geometry.computeBoundingBox();b.union(m.geometry.boundingBox.clone().applyMatrix4(m.matrixWorld));}return b;}
function corners(b){const p=[];for(const x of[b.min.x,b.max.x])for(const y of[b.min.y,b.max.y])for(const z of[b.min.z,b.max.z])p.push(V([x,y,z]));return p;}
export function zMotorWorkingFrame(v,a){
 const w=a?.zMotorWorkingView,owner=v.motorService;if(!w||!owner?.active||!owner.enabled||v.disposed||!v.operationScene?.plan.motorService)return null;
 const e=owner.entities.get(a.motorOperation);if(!e)return null;
 v.printer.updateWorldMatrix(true,false);
 const native=id=>v.meshes.filter(m=>m.userData.cadIndex===id&&!m.userData.componentOnly),sign=w.side==='FL'?-1:w.side==='FR'?1:.35;
 let target,box,axis,direction,referenceMesh,context=[];
 if(w.kind==='thread'){
  const body=e.meshes.find(m=>m.userData.component?.endsWith('Body'));if(!body)return null;
  referenceMesh=e.meshes.find(m=>m.userData.component?.endsWith('Shaft'));if(!referenceMesh)return null;
  body.updateWorldMatrix(true,false);body.geometry.computeBoundingBox();referenceMesh.updateWorldMatrix(true,false);
  const collar=body.geometry.boundingBox.getCenter(new T.Vector3());collar.z=body.geometry.boundingBox.max.z;collar.applyMatrix4(body.matrixWorld);
  axis=V([0,0,1]).transformDirection(referenceMesh.matrixWorld);
  // Show the real lower rod the hand turns, above the base opening. The upper
  // carriage/nut remains in the full scene, not the foreground fit target.
  target=collar.clone().addScaledVector(axis,48);
  box=new T.Box3().setFromCenterAndSize(target,V([40,40,56]));
  direction=V(w.side==='R'?[sign*.35,-1,.65]:[-.6,.7,1]).transformDirection(body.matrixWorld);context=[w.nutCAD,w.mountCAD];
 }else if(w.kind==='plug'){
  referenceMesh=e.mesh;box=worldBox(e.meshes);target=box.getCenter(new T.Vector3());
  const c=v.splitterHardware.connections.find(c=>c.id===w.port),board=owner.entities.get('zmSplitter').mesh;
  board.updateWorldMatrix(true,false);const rest=board.userData.restPosition,offset=board.position.clone().sub(rest),socket=V(c.end).add(offset).applyMatrix4(v.printer.matrixWorld);
  box.expandByPoint(socket);axis=V(c.outward).transformDirection(v.printer.matrixWorld).multiplyScalar(Math.sign(w.to-w.from)||1);
  direction=V([c.outward[0]*.65,-.85,-1]).transformDirection(v.printer.matrixWorld);context=['stepperSplitter',w.port];box.expandByScalar(12);
 }else{
  referenceMesh=e.meshes.find(m=>m.userData.component?.endsWith('Body'));if(!referenceMesh)return null;
  box=worldBox([referenceMesh]);const local=referenceMesh.geometry.boundingBox,collar=local.getCenter(new T.Vector3());collar.z=local.max.z;
  target=collar.applyMatrix4(referenceMesh.matrixWorld);axis=V([0,0,1]).transformDirection(referenceMesh.matrixWorld);
  // Keep the complete body and its actual near-shaft exit in view. The rest
  // of the original shaft/lead remains rendered in the same whole model.
  box.expandByPoint(target.clone().addScaledVector(axis,65));box.expandByScalar(16);
  direction=V([sign*.85,-1,-.65]).transformDirection(referenceMesh.matrixWorld);context=[w.mountCAD];
 }
 const guideAxis=w.kind==='thread'?axis: w.kind==='plug'?axis:axis.clone().multiplyScalar(Math.sign(w.to-w.from)>0?-1:1);
 const workBox=box.clone(),cameraBox=box.clone().expandByScalar(w.kind==='thread'?6:8);
 return {kind:w.kind,side:w.side,port:w.port,target,box:cameraBox,workBox,axis:guideAxis,direction,referenceMesh,context,guideLength:w.kind==='plug'?14:25};
}
function guidePoints(f,a){
 if(f.kind!=='thread')return[f.target.clone(),f.target.clone().addScaledVector(f.axis,f.guideLength)];
 // Follow the source shaft's signed rotation, not a new thread convention.
 const axis=f.axis,normal=V([1,0,0]);if(Math.abs(axis.dot(normal))>.9)normal.set(0,1,0);normal.addScaledVector(axis,-normal.dot(axis)).normalize();
 const sign=Math.sign(a.zMotorWorkingView.to-a.zMotorWorkingView.from),arc=Array.from({length:25},(_,i)=>normal.clone().applyAxisAngle(axis,-sign*Math.PI*1.5*i/24).multiplyScalar(14).add(f.target));arc.targetIndex=0;return arc;
}
export function buildZMotorWorkingGuide(v,a,index,group){
 if(!a?.zMotorWorkingView)return false;
 const f=zMotorWorkingFrame(v,a);if(!f){group.userData.zMotorWorkingPending={actor:a,index};return true;}
 delete group.userData.zMotorWorkingPending;
 const points=guidePoints(f,a),geometry=new T.BufferGeometry().setFromPoints(points),line=new T.Line(geometry,new T.LineDashedMaterial({color:0xfd5000,dashSize:3,gapSize:2,depthTest:false,depthWrite:false}));
 line.computeLineDistances();line.renderOrder=20;line.userData.ownedGeometry=true;group.add(line);
 const arrow=new T.ArrowHelper(V([0,0,1]),f.target,7,0xfd5000,3,1.7);arrow.traverse(n=>{if(n.geometry){n.geometry=n.geometry.clone();n.userData.ownedGeometry=true;}if(n.material){n.material.depthTest=false;n.material.depthWrite=false;}n.renderOrder=21;});group.add(arrow);
 const ring=new T.Mesh(new T.TorusGeometry(f.kind==='plug'?4:7,.45,6,32),new T.MeshBasicMaterial({color:0xfd5000,depthTest:false,depthWrite:false}));ring.renderOrder=21;ring.userData.ownedGeometry=true;group.add(ring);
 const el=document.createElement('div');el.className='operation-callout';el.textContent=`${(a.sourceIndex??index)+1}  ${a.label}`;document.getElementById('hotspots').append(el);
 const label={el,point:f.target.clone(),index,avoidWorldPoints:corners(f.workBox)},row={actor:a,index,line,arrow,ring,label};v.guideLabels.push(label);group.userData.zMotorWorkingGuide=row;
 updateGuide(group,row,f);return true;
}
function updateGuide(group,row,f){
 // Other Z guides retain their established build/current-printer transform.
 // These live guides already contain world-mm points, so apply no extra CAD
 // or printer transform to this explicitly identified annotation group.
 group.matrixAutoUpdate=false;group.matrix.identity();group.matrixWorldNeedsUpdate=true;
 const points=guidePoints(f,row.actor),p=row.line.geometry.attributes.position;for(let i=0;i<points.length;i++)p.setXYZ(i,...points[i].toArray());p.needsUpdate=true;row.line.computeLineDistances();row.line.geometry.computeBoundingSphere();
 const end=points.at(-1),dir=end.clone().sub(points.at(-2)).normalize();row.arrow.position.copy(end.clone().addScaledVector(dir,-7));row.arrow.setDirection(dir);row.ring.position.copy(f.target);row.ring.quaternion.setFromUnitVectors(V([0,0,1]),f.axis);
 row.label.point.copy(f.target);row.label.avoidWorldPoints=corners(f.workBox);
}
function cameraPose(v,f){
 if(f.kind!=='thread'){clearZMotorWorkingProjection(v);return frameBox(f.box,f.direction,v.camera.fov,v.camera.aspect,1.45,f.kind==='plug'?110:180);}
 const w=v.container.clientWidth,h=v.container.clientHeight,rect=w&&h?tieWorkingRectangle(v,probe,f.direction):null;
 if(!rect){clearZMotorWorkingProjection(v);return frameBox(f.box,f.direction,v.camera.fov,v.camera.aspect,1.45,180);}
 v.camera.setViewOffset(w,h,(w-rect.l-rect.r)/2,(h-rect.t-rect.b)/2,w,h);
 projections.set(v,{signature:projectionSignature(v.camera.view),width:w,height:h,rect:{l:rect.l,r:rect.r,t:rect.t,b:rect.b}});
 const fov=T.MathUtils.radToDeg(2*Math.atan(Math.tan(T.MathUtils.degToRad(v.camera.fov/2))*(rect.b-rect.t)/h));
 return frameBox(f.box,f.direction,fov,(rect.r-rect.l)/(rect.b-rect.t),1.18,180);
}
export function focusZMotorWorkingView(v,index,instant=false){
 if(v.manualCamera)return false;const a=v.sceneActors?.[index],f=zMotorWorkingFrame(v,a);if(!f){clearZMotorWorkingProjection(v);return false;}
 v.controls.minDistance=f.kind==='plug'?90:140;v.lastOperationFocus=index;v.lastFocusSettled=false;
 tracking.set(v,{plan:v.operationScene.plan,actor:a,index});v.moveCamera(cameraPose(v,f),instant);return true;
}
export function syncZMotorWorkingView(v,currentIndex=v.activeOperation){
 if(v.disposed||!v.motorService?.enabled){clearZMotorWorkingProjection(v);return;}
 for(const group of v.guideGroups||[]){const pending=group.userData.zMotorWorkingPending;if(pending&&v.sceneActors?.[pending.index]===pending.actor)buildZMotorWorkingGuide(v,pending.actor,pending.index,group);const row=group.userData.zMotorWorkingGuide;if(!row)continue;const f=zMotorWorkingFrame(v,row.actor);if(f)updateGuide(group,row,f);}
 const owned=projections.get(v);if(owned&&(owned.width!==v.container.clientWidth||owned.height!==v.container.clientHeight)&&v.manualCamera)clearZMotorWorkingProjection(v);
 const saved=tracking.get(v);if(!saved||saved.plan!==v.operationScene?.plan||saved.actor!==v.sceneActors?.[currentIndex]||v.manualCamera)return;
 const f=zMotorWorkingFrame(v,saved.actor);if(!f)return;const pose=cameraPose(v,f);
 if(v.cameraTween){v.cameraTween.to.copy(pose.position);v.cameraTween.toT.copy(pose.target);}else{v.camera.position.copy(pose.position);v.controls.target.copy(pose.target);v.controls.update();}
 v.dirty=true;
}
