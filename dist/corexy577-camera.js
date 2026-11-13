import * as T from 'three';
import {outsideView} from './corexy577-camera-route.js?v=20261111-100';
import {currentLanguage} from './i18n.js?v=20261112-113';
const HINTS={ja:'穴の外側から拡大表示：青いXケーブルと端子を確認',en:'Outside close-up: follow the blue X lead and plug',cs:'Detail zvenku: sledujte modrý kabel X a konektor',de:'Außenansicht: blaues X-Kabel und Stecker verfolgen'};
import {operationAt} from './assembly-director.js?v=20261113-116';
import {installCorexyCameraTransition as installParent} from './corexy577-transition.js?v=20261113-116';
import {applyCorexyCameraTransition} from './corexy577-transition.js?v=20261113-116';

// Camera-only adapter. The parent's actor clock, completion hold, overview and
// inside-preset dissolve remain the single transition owner.
export function installCorexyWorkingView(viewer, options={}) {
 if(viewer.corexyXCamera262)return viewer.corexyCameraTransition256;
 const parent=installParent(viewer,options),move=viewer.moveCamera,hold=viewer.holdCamera,dispose=viewer.dispose,hooks=new Map();let active=true;
 const state={eyeCAD:[-198,180,268],fov:52,minDistance:28,last:null,parent};
 viewer.corexyXCamera262=state;
 const hint=document.createElement('div');hint.dataset.xWorkingView262='';hint.textContent='穴の外側から拡大表示：青いXケーブルと端子を確認';
 Object.assign(hint.style,{position:'absolute',top:'58px',left:'8px',maxWidth:'260px',padding:'6px 8px',borderRadius:'4px',background:'rgba(255,255,248,.94)',color:'#252a2b',fontSize:'12px',lineHeight:'1.45',pointerEvents:'none'});
 hint.hidden=true;viewer.renderer.domElement.insertAdjacentElement('afterend',hint);state.hint=hint;
 const world=p=>new T.Vector3(...p).multiplyScalar(.001).applyMatrix4(viewer.printer.matrixWorld);
 const workingMove=function(pose,instant=false){
  if(this.disposed)return;if(!active)return move.call(this,pose,instant);
  const plan=this.operationScene?.plan,at=operationAt(this.operationProgress,this.sceneActors?.length||1),actor=this.sceneActors?.[at.index];
  const working=plan?.chapter===5&&plan.step===77&&actor?.flex?.includes('corexy577X')&&!this.manualCamera;
  if(working&&pose.name==='outside'){
   const e=this.fasteners.entities.get('corexy577X'),working=outsideView(this,e);
   state.eyeCAD=working.eyeCAD;state.fov=working.fov;
   this.controls.minDistance=state.minDistance;this.camera.fov=state.fov;this.camera.updateProjectionMatrix();
   pose={...pose,position:working.position,target:working.target,fov:state.fov};
   const targetCAD=working.targetCAD;
   hint.textContent=HINTS[currentLanguage()]||HINTS.ja;hint.hidden=false;state.last={eyeCAD:[...state.eyeCAD],targetCAD,fov:state.fov,amount:e.mesh.userData.flexState.amount,actor:at.index,t:at.t};
  }else hint.hidden=true;
  return move.call(this,pose,instant);
 };
 const workingHold=function(...args){if(this.disposed)return;const result=hold.apply(this,args);if(active)hint.hidden=true;return result;};
 viewer.moveCamera=workingMove;viewer.holdCamera=workingHold;
 // c12 retains a legacy camera sync after these methods. Reassert the
 // existing parent camera owner after that sync; do not change the actor or
 // physical update, and do not let the legacy side switch win on seek/play.
 for(const key of ['setProgress','focusOperation','setView','resize']){
  const original=viewer[key],wrapped=function(...args){if(this.disposed)return;const result=original.apply(this,args);if(active&&!applyCorexyCameraTransition(this))hint.hidden=true;return result;};
  hooks.set(key,{original,wrapped});viewer[key]=wrapped;
 }
 const workingDispose=function(...args){if(active){active=false;for(const[key,{original,wrapped}]of hooks)if(this[key]===wrapped)this[key]=original;hint.remove();if(this.moveCamera===workingMove)this.moveCamera=move;if(this.holdCamera===workingHold)this.holdCamera=hold;if(this.corexyXCamera262===state)delete this.corexyXCamera262;if(this.dispose===workingDispose)this.dispose=dispose;}return dispose?.apply(this,args);};
 viewer.dispose=workingDispose;
 applyCorexyCameraTransition(viewer);
 return parent;
}
