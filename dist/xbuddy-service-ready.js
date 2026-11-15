// SPDX-License-Identifier: MIT
import {xBuddyAssetsPrepared} from './xbuddy-assets-state.js';
export const xBuddyPrepared=xBuddyAssetsPrepared;
export const XBUDDY_ASSET_ERROR_COPY=[
 'xBuddyの3D部品を読み込めませんでした。「再読み込み」でこの作業の部品を再試行できます。',
 'The xBuddy 3D parts could not load. Use Reload to retry the parts for this procedure.',
 '3D díly xBuddy se nepodařilo načíst. Tlačítkem Znovu načíst zopakujete načtení dílů pro tento postup.',
 'Die xBuddy-3D-Teile konnten nicht geladen werden. Mit Neu laden können Sie die Teile für diese Anleitung erneut laden.'
];
const prepare=()=>import('./xbuddy-complete-owner.js').then(m=>m.prepareXBuddyCompleteAssets());
export function createXBuddyReadiness(){
 let generation=0,pending=null,failure=null,disposed=false;
 const finish=token=>{if(!token.finished){token.finished=true;token.feedback?.finish();}};
 function cancel(){generation++;const old=pending;pending=null;failure=null;if(old)finish(old);}
 const api={get disposed(){return disposed;},get failure(){return failure;},get pending(){return !!pending;},cancel,
  wait(viewer,key,{isCurrent,ready,failed,indicator}){
   if(disposed||viewer.disposed)return false;
   if(xBuddyAssetsPrepared()){if(pending)cancel();return true;}
   if(failure?.viewer===viewer&&failure.key===key){if(isCurrent())failed(failure.error);return false;}
   if(pending?.viewer===viewer&&pending.key===key)return false;
   cancel();const token={viewer,key,generation,finished:false,feedback:indicator()};pending=token;
   const live=()=>!disposed&&pending===token&&generation===token.generation&&!viewer.disposed&&isCurrent();
   Promise.resolve().then(prepare).then(()=>{
    if(!live())return;pending=null;finish(token);ready();
   },error=>{
    if(!live())return;pending=null;failure={viewer,key,error};finish(token);failed(error);
   }).finally(()=>{if(pending===token)pending=null;finish(token);});
   return false;
  },
  dispose(){if(disposed)return;cancel();disposed=true;}
 };return api;
}
