import{installBox4Close}from'./controller.js';
const assembly=s=>s?.flow==='build'||s?.flow==='upgrade';
// No plan compiler, FE/LCD/rear wrapper, scene owner or camera is replaced.
// Parent supplies the Three-free derived plan to its existing compiler/UI.
export function installBox4CloseViewer(viewer,{normalizedPhase,...options}={}){
 if(viewer.box4Close277?.active)return viewer.box4Close277;if(!viewer.loaded||!viewer.fasteners?.entities||!viewer.director)throw Error('Loaded actual viewer required');
 const previousState=viewer.setState,previousDispose=viewer.dispose;
 const live=()=>viewer.loaded&&!viewer.disposed&&viewer.director&&viewer.fasteners?.entities;let owner=null,entity=null,previousProgress=null,progress=null;
 function retire(restoreSource){owner?.dispose({restoreSource});owner=entity=null;if(progress&&viewer.setProgress===progress)viewer.setProgress=previousProgress;progress=previousProgress=null;}
 function activate(){const next=viewer.fasteners?.entities.get('box4');if(!next)throw Error('Actual box4 entity missing');if(entity===next&&owner?.active)return false;if(owner)retire(false);entity=next;owner=installBox4Close(entity,options);return true;}
 function follow(){if(!owner||!normalizedPhase)return;const p=normalizedPhase(viewer);if(p!==undefined&&p!==null)owner.apply(p);}
 function attach(){if(!normalizedPhase||progress)return;const delegate=viewer.setProgress;previousProgress=delegate;const ownedProgress=function(...args){if(!live())return;const r=delegate.apply(this,args);if(api.active&&progress===ownedProgress)follow();return r;};progress=ownedProgress;viewer.setProgress=progress;}
 const wrapped=function(state,...args){if(!api.active||!live())return previousState.call(this,state,...args);if(api.active&&!assembly(state))retire(true);let r=previousState.call(this,state,...args);if(api.active&&assembly(state)){if(activate())r=previousState.call(this,state,...args);attach();follow();}return r;};
 const api={active:true,get controller(){return owner;},get entity(){return entity;},follow(phase){if(!owner)throw Error('Box4 is inactive outside assembly');return owner.apply(phase);},dispose(){if(!api.active)return;api.active=false;retire(false);if(viewer.setState===wrapped)viewer.setState=previousState;if(viewer.dispose===wrappedDispose)viewer.dispose=previousDispose;if(viewer.box4Close277===api)delete viewer.box4Close277;},ownership:'Box4 entity controller and conditional setState/progress hooks only. No global plan/cohort or scene/camera ownership.'};
 const wrappedDispose=function(...args){api.dispose();return previousDispose.apply(this,args);};
 viewer.box4Close277=api;viewer.setState=wrapped;viewer.dispose=wrappedDispose;try{if(viewer.state)wrapped.call(viewer,viewer.state);return api;}catch(e){api.dispose();throw e;}
}
