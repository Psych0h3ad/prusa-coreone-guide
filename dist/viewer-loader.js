// The manual stays usable while the optional rendering code downloads.
export function createViewerLoader(importer=()=>import('./cable-assembly/viewer.js?v=20261113-118')){
 let pending;
 return async function load(timeout=20000){
  pending??=Promise.resolve().then(importer).catch(cause=>{const error=new Error('Viewer code could not load',{cause});error.needsReload=true;throw error;});
  let timer;
  try{return await Promise.race([pending,new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('Viewer code loading timed out')),timeout);})]);}
  finally{clearTimeout(timer);}
 };
}
