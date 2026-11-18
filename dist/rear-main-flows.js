import {returnXBuddyAssemblySource} from './xbuddy-complete-owner.js';
import {installRearMain} from './rear-main-motion.js';
import {rearMainReference} from './rear-main-reference.js';
export const rearMainIds=Object.freeze(['mainRear','mainSleeve','boxLower','bundle1','bundle2']);
export function rearMainFlowPolicy(viewer,state){const flow=state?.flow??viewer.state?.flow??'build',missing=rearMainIds.filter(id=>!viewer.fasteners?.entities.has(id));return {flow,enabled:(flow==='build'||flow==='upgrade'||flow==='service'&&viewer.coreXYMaintenanceSource?.(state??viewer.state))&&!missing.length,missing};}

// Assembly/upgrade use full r2 in every variant and presentation. Service
// retains the application's existing director/routing/camera callbacks.
// Explicit adoption transfers existing rear/blue cleanup to this controller.
export function installRearMainForFlows(viewer,{referenceData=rearMainReference,adoptExisting={}}={}){
 if(viewer.rearMainFlowRouting)return viewer.rearMainFlowRouting;
 const oldGate=viewer.rearR2SceneGate,retiredOldSceneGate=!!oldGate?.active;
 if(retiredOldSceneGate){oldGate.dispose();if(oldGate.active)throw Error('The superseded scene gate must release ownership');}
 const box=viewer.fasteners?.entities.get('boxLower'),existingRear=viewer.rearMainRouting,existingBlue=box?.rearBlue3;
 if(existingRear&&adoptExisting.rear!==existingRear||existingBlue&&adoptExisting.blue!==existingBlue)throw Error('Transfer existing rear/blue handles explicitly before attaching flow routing');
 if(existingRear&&(existingRear.active!==true||existingRear.revision!=='rear-main-r3-motion-r2'))throw Error('Only an active frozen full r2 handle can be transferred');
 if(existingBlue&&(existingBlue.active!==true||existingBlue.revision!=='r3-blue3-only-r2'||existingBlue.radiusMM!==2.5||!Number.isFinite(existingBlue.stockMM)||Math.abs(existingBlue.stockMM-221.248465580051)>1e-8))throw Error('Only an active compatible r2 blue handle can be transferred');
 let rear=existingRear??null,blue=existingBlue??null,refreshing=false;const originalState=viewer.setState;
 function prepare(state){const decision=rearMainFlowPolicy(viewer,state);let changed=false;
  if(!decision.enabled){if(rear){rear.dispose();rear=null;changed=true;}if(blue){blue.dispose();blue=null;changed=true;}}
  else if(!rear){if(!returnXBuddyAssemblySource(viewer))throw Error('xBuddy must return the assembly source before rear routing can acquire it');if(viewer.rearMainRouting||box?.rearBlue3&&box.rearBlue3!==blue)throw Error('An untransferred routing owner remains active');rear=installRearMain(viewer,{referenceData});changed=true;}
  if(changed)viewer.sceneSignature=undefined;
  api.current={...decision,rearActive:!!rear,transferredBlueActive:!!blue};return changed;
 }
 const wrappedState=function(state,...args){if(api.active)prepare(state);const result=originalState.call(this,state,...args);if(api.active&&api.current.enabled){if(!rear?.active||viewer.rearMainRouting!==rear)throw Error('Another callback retired or replaced the active full r2 owner');rear.follow();}return result;};
 const stateKey=s=>JSON.stringify([s?.flow,s?.index,s?.variant,s?.comparison,!!s?.explore]);
 const api={active:true,current:null,retiredOldSceneGate,follow(){if(api.active&&api.current?.enabled)rear?.follow();},refresh(){if(!api.active||refreshing)return;refreshing=true;try{if(viewer.state){const state=viewer.state,key=stateKey(state),progress=viewer.operationProgress;viewer.setState(state);if(api.active&&stateKey(viewer.state)===key&&Number.isFinite(progress))viewer.setProgress(progress);}else prepare({flow:'build'});}finally{refreshing=false;}},
  dispose(){if(!api.active)return;api.active=false;rear?.dispose();rear=null;blue?.dispose();blue=null;if(api.current)api.current={...api.current,enabled:false,rearActive:false,transferredBlueActive:false};viewer.sceneSignature=undefined;if(viewer.setState===wrappedState)viewer.setState=originalState;if(viewer.rearMainFlowRouting===api)delete viewer.rearMainFlowRouting;}
 };
 viewer.rearMainFlowRouting=api;viewer.setState=wrappedState;api.refresh();return api;
}
