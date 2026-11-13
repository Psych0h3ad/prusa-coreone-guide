import * as T from 'three';
import {MainLoomPhysical} from './main-loom/physical.js?v=20261112-113';

export const MAIN_LOOM_PIVOT=[9,-24.6,408];
export const MAIN_LOOM_BODY=[859,'mountUpperNut','mountLowerNut','loveBoard',847];
const ids=['assemblyMainLead','assemblyMainSleeve'];
const smooth=t=>T.MathUtils.smoothstep(t,0,1),vec=p=>new T.Vector3(...p);
const pivot=vec(MAIN_LOOM_PIVOT).multiplyScalar(.001),axis=new T.Vector3(1,0,0);

export function createMainLoomAssembly(){
 const model=new MainLoomPhysical(),lead=model.lead.mesh,jacket=model.jacketMesh;
 Object.assign(lead.userData,{part:'loveMainPlug',flexId:ids[0],cadName:'LoveBoard メインケーブル',supplement:true,preserveColours:true,toolOnly:true,workspaceOnly:'loveboard'});
 Object.assign(jacket.userData,{part:'benchMainSleeve',flexId:ids[1],cadName:'メインケーブルのスリーブ',supplement:true,toolOnly:true,preserveColours:true,workspaceOnly:'loveboard'});
 lead.castShadow=jacket.castShadow=true;
 const entities=[lead,jacket].map((mesh,i)=>({
  id:ids[i],mesh,model,
  update(from,to,t){const amount=T.MathUtils.lerp(from,to,smooth(t));model.update(amount);mesh.userData.flexState={from,to,t,amount};},
  guide(to,from=0){
   if(i)return [];
   // Follow the material beside the sleeve edge, including the assembly's
   // turnover. The open textile cut (u=0) is the fold/channel workpoint;
   // the remote upstream tail (u=.92) does not describe this local operation.
   const points=Array.from({length:49},(_,j)=>{
    const amount=T.MathUtils.lerp(from,to,j/48),s=model.shape(amount),p=s.jacket.getPointAt(0).multiplyScalar(.001);
    if(to===1){const c=s.jacket.getPointAt(.5).multiplyScalar(.001),tangent=s.jacket.getTangentAt(.5),row=new T.Vector3(1,0,0).cross(tangent).normalize();if(!row.lengthSq())row.set(0,0,1);p.copy(c).addScaledVector(row.applyAxisAngle(tangent,Math.PI*j/48),.008);}
    return p.sub(pivot).applyAxisAngle(axis,T.MathUtils.degToRad(s.unitRotationXDeg)).add(pivot);
   });points.targetIndex=points.length-1;return points;
  }
 }));
 return {model,entities};
}

// The four flex operations carry the board, mount, plug and sleeve as one unit.
// Recompute from the scene rest pose, so arbitrary seeks cannot accumulate turns.
export function followMainLoom(viewer){
 const scene=viewer.operationScene,p=scene?.plan,model=viewer.mainLoom?.model;if(!model||!p)return;
 const bench=viewer.mainLoom.entities[1].mesh;
 if(scene.full||p.workspace==='printer'&&(p.chapter>6||p.chapter===6&&p.step>=40))bench.visible=false;
 if(!p.mainLoomFlip||scene.full)return;
 const refs=[...MAIN_LOOM_BODY,'loveMainPlug','benchMainSleeve'],q=new T.Quaternion().setFromAxisAngle(axis,T.MathUtils.degToRad(model.current.unitRotationXDeg+90));
 for(const mesh of viewer.director.resolve(refs)){
  mesh.position.copy(mesh.userData.sceneRestPosition).sub(pivot).applyQuaternion(q).add(pivot);
  mesh.quaternion.copy(q).multiply(mesh.userData.sceneRestQuaternion);
 }
}
