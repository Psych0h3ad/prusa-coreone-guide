import * as T from 'three';
import {prepareLoadedCurvedAssets} from './loaded-curved-assets.js';
let pending,models;
// Authored reference data is loaded once before synchronous cable actors are
// constructed. Missing data is a load error, never a substitute box shape.
export function loadMolexCad(){return pending??=load().catch(error=>{pending=null;throw error;});}
async function load(){
 const manifest=await fetch('./assets/molex/cad.json?v=clik-functional-20261116').then(r=>{if(!r.ok)throw Error('Molex CAD manifest unavailable');return r.json();});
 const entries=await Promise.all(Object.entries(manifest.parts).map(async([id,meta])=>{
  const response=await fetch('./assets/molex/'+id+'.bin?v=clik-functional-20261116');if(!response.ok)throw Error('Molex CAD unavailable: '+id);
  const buffer=await response.arrayBuffer(),n=meta.vertices*3;if(buffer.byteLength!==n*8)throw Error('Invalid Molex CAD buffer: '+id);
  return [id,{...meta,positions:new Float32Array(buffer,0,n),normals:new Float32Array(buffer,n*4,n)}];
 }));await prepareLoadedCurvedAssets();models=new Map(entries);return models;
}
export function molexCad(id){const m=models?.get(id);if(!m)throw Error('Molex CAD must be loaded before constructing '+id);return m;}
export function molexGeometry(id,material){
 const m=molexCad(id),g=new T.BufferGeometry(),groups=material?m.groups.filter(v=>v.material===material):m.groups;
 const n=groups.reduce((sum,v)=>sum+v.count,0),p=new Float32Array(n*3),normal=new Float32Array(n*3);let at=0;
 for(const v of groups){p.set(m.positions.subarray(v.start*3,(v.start+v.count)*3),at);normal.set(m.normals.subarray(v.start*3,(v.start+v.count)*3),at);at+=v.count*3;}
 g.setAttribute('position',new T.BufferAttribute(p,3));g.setAttribute('normal',new T.BufferAttribute(normal,3));return g;
}
