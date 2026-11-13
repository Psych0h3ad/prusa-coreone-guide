import*as T from'three';
import{motionBounds}from'../../assembly-director.js?v=20261113-116';
import{tieWorkingRectangle}from'../../tie-working-view.js?v=20261112-112';
const probe=new T.Box3(new T.Vector3(-50,-50,-50),new T.Vector3(50,50,50));
export function upgradeTarget(v,index=v.activeOperation||0){
 const mode=!v.disposed&&v.loaded&&v.state?.flow==='upgrade'&&!v.operationScene?.full&&!v.state.explore&&v.state.comparison!=='before'?v.operationScene?.plan.upgradeWorkingView407:null;
 return mode?{upgrade:true,mode,index,actor:v.sceneActors?.[index]}:null;
}
function frame(box,direction,up,camera,w,h,rect){
 const target=box.getCenter(new T.Vector3()),out=direction.clone().normalize(),right=new T.Vector3().crossVectors(up,out).normalize(),vertical=new T.Vector3().crossVectors(out,right).normalize();
 const tanY=Math.tan(T.MathUtils.degToRad(camera.fov/2))*(rect?rect.b-rect.t:h)/h,tanX=tanY*(rect?(rect.r-rect.l)/(rect.b-rect.t):w/h);let distance=28;
 for(let i=0;i<8;i++){const p=new T.Vector3(i&1?box.max.x:box.min.x,i&2?box.max.y:box.min.y,i&4?box.max.z:box.min.z).sub(target);distance=Math.max(distance,p.dot(out)+1.1*Math.max(Math.abs(p.dot(right))/tanX,Math.abs(p.dot(vertical))/tanY));}
 return{position:target.clone().addScaledVector(out,distance),target};
}
export function upgradeWorkingPose(v,s=upgradeTarget(v)){
 if(!s||v.manualCamera||!v.container.clientWidth||!v.container.clientHeight)return null;
 v.printer.updateMatrixWorld(true);const box=new T.Box3();let direction,up=new T.Vector3(0,1,0);
 if(s.mode==='cover-right'){
  // Actual four-actor envelope stays fixed while old/new swap visibility.
  for(const a of v.sceneActors)box.union(motionBounds(a).applyMatrix4(v.printer.matrixWorld));
  box.expandByScalar(4);direction=new T.Vector3(1,-.10,-.05);
 }else if(s.mode==='ir-connector'){
  const nodes=v.director.resolve(['sensorIR']);if(!nodes.length)return null;
  for(const m of nodes)box.union(new T.Box3().setFromObject(m));box.expandByScalar(1.4);
  const matrix=nodes[0].matrixWorld,normal=new T.Vector3(0,0,1).transformDirection(matrix),connector=new T.Vector3(-1,0,0).transformDirection(matrix);
  up=new T.Vector3(0,1,0).transformDirection(matrix);direction=normal.addScaledVector(connector,.22).addScaledVector(up,.08).normalize();
 }else return null;
 if(box.isEmpty())return null;const rect=tieWorkingRectangle(v,probe,direction),w=v.container.clientWidth,h=v.container.clientHeight;
 return{...s,box,up,direction,rect,w,h,pose:frame(box,direction,up,v.camera,w,h,rect),key:JSON.stringify([s.mode,w,h,...box.min.toArray(),...box.max.toArray(),rect?.l,rect?.r,rect?.t,rect?.b])};
}
