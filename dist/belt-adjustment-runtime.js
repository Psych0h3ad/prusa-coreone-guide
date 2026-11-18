// SPDX-License-Identifier: MIT
import*as T from'three';
import{BELT_ADJUSTERS,BELT_ADJUSTMENT_PITCH_MM,beltAdjustmentLabel}from'./belt-adjustment-model.js';
import{beltAdjustmentControls}from'./belt-adjustment-controls.js';
const owners=new WeakMap(),ease=t=>T.MathUtils.smoothstep(t,0,1);
export function installBeltAdjustment(viewer,binding,text){
 if(owners.has(viewer))return owners.get(viewer);
 const reference=Object.fromEntries(Object.entries(BELT_ADJUSTERS).map(([side,d])=>{
  const screw=viewer.director.resolve([d.screw]);if(screw.length!==1)throw Error('Expected one complete native belt adjuster '+d.screw);
  const m=screw[0],q=m.userData.restQuaternion,axis=new T.Vector3(1,0,0).applyQuaternion(q).normalize();if(axis.y<0)axis.negate();
  const nodes=viewer.director.resolve(d.carrier);if(nodes.length!==6)throw Error('Expected complete carrier, nut, axle and three idler solids '+side);
  return[side,{screw:m,axis,pivot:m.userData.restPosition.clone().multiplyScalar(1000),nodes}];
 }));
 const prior={scene:viewer.director.scene,setState:viewer.setState,setProgress:viewer.setProgress,dispose:viewer.dispose,localize:binding.localize};let active=true,engaged=false,direction='tighten',last=null;
 const applies=()=>!!viewer.operationScene?.plan.beltAdjustment,controls=beltAdjustmentControls(viewer,text,next=>api.select(next));
 function restore(screws=false){if(!engaged)return;for(const r of Object.values(reference))for(const m of screws?[r.screw,...r.nodes]:r.nodes){m.position.copy(m.userData.restPosition);m.quaternion.copy(m.userData.restQuaternion);}engaged=false;}
 function follow(){if(!active||viewer.disposed||!applies())return;engaged=true;const clock=viewer.operationProgress*viewer.sceneActors.length,sign=direction==='tighten'?-1:1;last={direction,turns:.5,pitchMM:BELT_ADJUSTMENT_PITCH_MM,sides:{}};
  for(const[side,r]of Object.entries(reference)){const i=viewer.sceneActors.findIndex(a=>a.beltAdjustment?.side===side),t=clock===viewer.sceneActors.length?1:T.MathUtils.clamp(clock-i,0,1),mm=sign*.5*BELT_ADJUSTMENT_PITCH_MM*ease(t),offset=r.axis.clone().multiplyScalar(mm*.001);
   for(const m of r.nodes){m.position.copy(m.userData.sceneRestPosition||m.userData.restPosition).add(offset);m.quaternion.copy(m.userData.sceneRestQuaternion||m.userData.restQuaternion);}last.sides[side]={progress:t,carrierTravelMM:mm,screwSeat:r.screw.position.toArray()};
  }
 }
 function scene(state){const s=prior.scene.call(viewer.director,state);if(!active||!s.plan.beltAdjustment)return s;
  const actors=s.actors.map(a=>{if(!a.beltAdjustment)return a;const{side}=a.beltAdjustment,r=reference[side],sign=direction==='tighten'?1:-1;return{...a,label:beltAdjustmentLabel(side,direction,text),axis:r.axis.toArray(),motionPivot:r.pivot.toArray(),posePath:[{offset:[0,0,0],rotation:[0,0,0]},{offset:[0,0,0],rotation:r.axis.toArray().map(x=>x*sign*180)}],beltAdjustment:{side,direction}};});
  return{...s,actors,plan:{...s.plan,actors:actors.map(({nodes,sourceIndex,...a})=>a),beltAdjustment:{...s.plan.beltAdjustment,direction}}};
 }
 function setState(...args){if(active)restore();const value=prior.setState.apply(this,args);follow();controls.render(direction,active&&applies());return value;}
 function setProgress(...args){const value=prior.setProgress.apply(this,args);follow();return value;}
 function localize(...args){const value=prior.localize.apply(this,args);if(active&&applies())for(const list of[viewer.operationScene.plan.actors,viewer.sceneActors])for(const a of list)if(a.beltAdjustment)a.label=beltAdjustmentLabel(a.beltAdjustment.side,direction,text);controls.render(direction,active&&applies());return value;}
 function retire(){if(!active)return;restore(true);controls.close();active=false;owners.delete(viewer);if(viewer.beltAdjustment===api)delete viewer.beltAdjustment;for(const[k,f]of[['setState',setState],['setProgress',setProgress],['dispose',dispose]])if(viewer[k]===f)viewer[k]=prior[k];if(viewer.director.scene===scene)viewer.director.scene=prior.scene;if(binding.localize===localize)binding.localize=prior.localize;}
 function dispose(...args){retire();return prior.dispose.apply(this,args);}
 const api={reference,select(next){if(!['tighten','loosen'].includes(next))throw Error('Invalid belt adjustment direction');if(!active||viewer.disposed)return false;if(next===direction)return false;direction=next;if(applies()){const p=viewer.operationProgress;viewer.sceneSignature=undefined;viewer.setState({...viewer.state});viewer.seek(p);}return true;},evidence(){return last;},retire};
 owners.set(viewer,api);viewer.beltAdjustment=api;viewer.director.scene=scene;viewer.setState=setState;viewer.setProgress=setProgress;viewer.dispose=dispose;binding.localize=localize;return api;
}
