import {DefaultLoadingManager} from 'three';
import {STLLoader} from './vendor/STLLoader.js';

// Parsed, untransformed STL templates stay private. Every caller owns a deep
// clone, so placement, finishes, editing and disposal remain instance-local.
const reusable=new Set(['M3x10-cap.stl','M3nS.stl','M3x8-cap.stl','M3x10-button.stl']);
const bytes=g=>{const buffers=new Set(),add=a=>{if(a?.array)buffers.add(a.array.buffer);else if(a?.data?.array)buffers.add(a.data.array.buffer);};Object.values(g.attributes).forEach(add);add(g.index);return [...buffers].reduce((n,b)=>n+b.byteLength,0);};
const clone=g=>{const owned=g.clone();owned.userData=structuredClone(g.userData);for(const name of ['hasColors','alpha'])if(Object.hasOwn(g,name))owned[name]=g[name];return owned;};

export function createGeometryPromiseCache({maxEntries=4,maxBytes=8*1024*1024}={}){
 let entries=new Map(),residentBytes=0;const stats={loads:0,hits:0,clones:0,failures:0,disposals:0,evictions:0};
 const dispose=e=>{if(e.geometry&&!e.cached&&!e.users&&!e.disposed){e.disposed=true;stats.disposals++;e.geometry.dispose();e.geometry=undefined;}};
 const evict=e=>{if(entries.get(e.key)===e){entries.delete(e.key);residentBytes-=e.bytes;}e.cached=false;dispose(e);};
 const trim=()=>{while(entries.size>maxEntries||residentBytes>maxBytes){const e=entries.values().next().value;if(!e)break;stats.evictions++;evict(e);}};
 function get(key,loadTemplate){
  let e=entries.get(key);
  if(e){stats.hits++;entries.delete(key);entries.set(key,e);}else{
   e={key,users:0,cached:true,bytes:0,disposed:false};entries.set(key,e);stats.loads++;
   e.promise=Promise.resolve().then(loadTemplate).then(g=>{e.geometry=g;e.bytes=bytes(g);if(entries.get(key)===e)residentBytes+=e.bytes;trim();return g;},error=>{stats.failures++;evict(e);throw error;});trim();
  }
  e.users++;
  return e.promise.then(g=>{const result=clone(g);stats.clones++;return result;}).finally(()=>{e.users--;dispose(e);});
 }
 function clear(){const old=[...entries.values()];entries=new Map();residentBytes=0;for(const e of old)e.cached=false;for(const e of old)dispose(e);}
 return {get,clear,get snapshot(){return Object.freeze({...stats,entries:entries.size,residentBytes,maxEntries,maxBytes});}};
}

const pool=createGeometryPromiseCache();
export function loadReusableSTL(loader,url){
 // Other paths, authentication, managers and parser implementations retain
 // their original loading behavior. Full query strings remain part of a key.
 const base=globalThis.document?.baseURI||globalThis.location?.href||import.meta.url,u=new URL(url,base);
 const selected=u.pathname.includes('/assets/sensor/')&&reusable.has(decodeURIComponent(u.pathname.split('/').at(-1)));
 if(!selected||loader.constructor!==STLLoader||loader.parse!==STLLoader.prototype.parse||loader.manager!==DefaultLoadingManager||loader.path||loader.withCredentials||Object.keys(loader.requestHeader||{}).length)return loader.loadAsync(url);
 return pool.get(u.href,()=>loader.loadAsync(url));
}
export function clearReusableSTLCache(){pool.clear();}
export function reusableSTLCacheSnapshot(){return pool.snapshot;}
