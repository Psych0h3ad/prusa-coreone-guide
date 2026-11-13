import {FLOWS} from '../../data.js?v=20261112-113';
import {XBUDDY_PORTS,xBuddyPortBounds} from '../../xbuddy-layout.js';
import {describeComponent13Replacement} from '../native/packet/native-packet.js';

const expected={
 'xBuddy / photo':{vertices:945,triangles:[281,282]},
 'xBuddy / orange':{vertices:30,triangles:[0,1,2,3,4,5,6,7,8,9]}
};
const live=v=>!v.disposed&&v.loaded&&v.director&&v.fasteners;
const sameList=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
const own=(o,k)=>Object.getOwnPropertyDescriptor(o,k);
const put=(o,k,d)=>d?Object.defineProperty(o,k,d):delete o[k];
const sameDescriptor=(a,b,value=b?.value)=>a&&b?'value'in a&&'value'in b&&a.value===value&&a.writable===b.writable&&a.enumerable===b.enumerable&&a.configurable===b.configurable:a===b;

function attribute(a){return a&&{ref:a,array:a.array,bytes:new Uint8Array(a.array.buffer,a.array.byteOffset,a.array.byteLength).slice(),itemSize:a.itemSize,normalized:a.normalized};}
function equalAttribute(a,s){
 if(!s)return a===null||a===undefined;
 if(a!==s.ref||a.array!==s.array||a.itemSize!==s.itemSize||a.normalized!==s.normalized||a.array.byteLength!==s.bytes.length)return false;
 const b=new Uint8Array(a.array.buffer,a.array.byteOffset,a.array.byteLength);
 return b.every((x,i)=>x===s.bytes[i]);
}
function geometry(g){return{g,index:attribute(g.index),keys:Object.keys(g.attributes).sort(),attrs:Object.fromEntries(Object.entries(g.attributes).map(([k,a])=>[k,attribute(a)])),groups:JSON.stringify(g.groups),draw:{...g.drawRange}};}
function checkGeometry(s){const g=s.g;return sameList(Object.keys(g.attributes).sort(),s.keys)&&equalAttribute(g.index,s.index)&&s.keys.every(k=>equalAttribute(g.attributes[k],s.attrs[k]))&&JSON.stringify(g.groups)===s.groups&&g.drawRange.start===s.draw.start&&g.drawRange.count===s.draw.count;}
function fail(name){throw Error('Foreign component13 owner must retire first: '+name);}

// Install AFTER the normal106 Box4 ready hook and BEFORE installStep349Live335.
// These immutable inner delegates never replace 335's public hook identities.
export function installComponent13Owner(viewer){
 if(viewer.component13Owner347?.active)return viewer.component13Owner347;
 if(viewer.step349Live335?.active)throw Error('Install component13 inner hooks before335');
 if(!live(viewer))throw Error('Loaded source106 viewer required');
 const prior={setState:viewer.setState,setProgress:viewer.setProgress,dispose:viewer.dispose};
 const boundsMM=xBuddyPortBounds(XBUDDY_PORTS.find(p=>p.key==='xLCD'));
 const sources=Object.entries(expected).map(([name,spec])=>{
  const matches=viewer.meshes.filter(m=>m.name===name&&m.userData.illustration&&m.userData.part==='xBuddy');
  if(matches.length!==1)throw Error('Exact source component13 mesh missing: '+name);
  const mesh=matches[0],g=mesh.geometry;
  if(g.index||g.attributes.position.count!==spec.vertices||g.groups.length||g.drawRange.start!==0||(g.drawRange.count!==Infinity&&g.drawRange.count!==spec.vertices))throw Error('Different source component13 geometry: '+name);
  const reference=own(mesh.userData,'referenceGeometry');
  if(reference&&(!('value'in reference)||!reference.writable||!reference.configurable||reference.value!==g))fail(name+' referenceGeometry');
  const geometryProperty=own(mesh,'geometry'),materialProperty=own(mesh,'material');
  if(!geometryProperty?.writable||!('value'in geometryProperty)||!('value'in materialProperty))fail(name+' mesh properties');
  return{mesh,name,spec,original:g,snapshot:geometry(g),material:mesh.material,reference,geometryProperty,materialProperty};
 });
 let active=true,current=null,depth=0,generation=0,pending=[],queued=false,bridge=null;
 const stats={leases:0,restorations:0,clonesCreated:0,clonesDisposed:0};

 function preflight(){
  // Entire two-row transaction is checked before either pointer changes.
  for(const s of sources){
   const r=current?.active?current.rows.find(r=>r.source===s):null;
   if(live(viewer)&&!viewer.meshes.includes(s.mesh))fail(s.name+' mesh registry');
   if(!sameDescriptor(own(s.mesh,'geometry'),s.geometryProperty,r?r.replacement:s.original)||!sameDescriptor(own(s.mesh,'material'),s.materialProperty)||!checkGeometry(s.snapshot))fail(s.name+' geometry/material/source data');
   if(r&&(!checkGeometry(r.snapshot)||!sameDescriptor(own(s.mesh.userData,'referenceGeometry'),r.referenceProperty)))fail(s.name+' replacement/reference data');
   if(!r&&(!sameDescriptor(own(s.mesh.userData,'referenceGeometry'),s.reference)||(!s.reference&&!Object.isExtensible(s.mesh.userData))))fail(s.name+' reference owner');
  }
 }
 function eligible(){
  const s=viewer.state,a=viewer.step349Live335;
  return !!(active&&viewer.component13Owner347===api&&live(viewer)&&s?.flow==='build'&&!s.explore&&s.comparison!=='before'&&FLOWS.build.steps[s.index]?.officialId===986647&&!viewer.operationScene?.full&&a?.owned&&a.controller?.native.packet.active);
 }
 function schedule(){if(queued||!pending.length)return;queued=true;queueMicrotask(()=>{queued=false;flushDisposals();});}
 function closeLease(){
  if(!current)return;
  preflight();const lease=current;
  // All old bindings/metadata and public lease state are detached before ANY
  // owned clone can emit dispose, including reentrant listeners.
  lease.active=false;current=null;++generation;
  for(const r of lease.rows){r.source.mesh.geometry=r.source.original;put(r.source.mesh.userData,'referenceGeometry',r.source.reference);}
  stats.restorations++;pending.push(...lease.rows.map(r=>r.replacement));schedule();
 }
 function flushDisposals(){
  if(depth)return false;
  const batch=pending;pending=[];let first;
  for(const g of batch)try{g.dispose();}catch(e){first??=e;}
  schedule();if(first)throw first;return true;
 }
 function openLease(){
  preflight();
  // Discovery uses the CURRENT target board pose, after the ordinary state
  // update. Installation on an earlier bench scene does not assume its pose.
  const proposal=describeComponent13Replacement(viewer,{boundsMM});
  if(!proposal.complete||proposal.triangleCount!==12||proposal.rows.length!==2)throw Error('Exact component13 twelve-triangle provenance required');
  for(const s of sources){const p=proposal.rows.find(p=>p.mesh===s.mesh);if(!p||p.geometryReference!==s.original||p.sourceVertexCount!==s.spec.vertices||!sameList(p.triangleIndices,s.spec.triangles))throw Error('Different component13 triangle subset: '+s.name);}
  const lease={active:false,id:++stats.leases,rows:[],removedTriangles:12};
  try{
   for(const s of sources){
    const remove=new Set(s.spec.triangles),indices=[];
    for(let i=0;i<s.spec.vertices;i+=3)if(!remove.has(i/3))indices.push(i,i+1,i+2);
    const replacement=s.original.clone();replacement.setIndex(indices);replacement.setDrawRange(0,indices.length);
    const row={source:s,replacement,retainedTriangles:indices.length/3,removed:s.spec.triangles.slice(),snapshot:geometry(replacement),disposals:0};
    const nativeDispose=replacement.dispose;
    replacement.dispose=function(...args){
     if(row.disposals)return;
     // Also cover a native-prototype-first disposer. Its source collector sees
     // the leased referenceGeometry and owns disposal of the original source.
     if(current===lease&&lease.active){if(viewer.disposed)retire();else closeLease();}
     row.disposals++;stats.clonesDisposed++;return nativeDispose.apply(this,args);
    };
    lease.rows.push(row);stats.clonesCreated++;
   }
   preflight();
   for(const r of lease.rows){r.source.mesh.geometry=r.replacement;Object.defineProperty(r.source.mesh.userData,'referenceGeometry',r.source.reference?{...r.source.reference,value:r.source.original}:{value:r.source.original,writable:true,enumerable:true,configurable:true});r.referenceProperty=own(r.source.mesh.userData,'referenceGeometry');}
   lease.active=true;current=lease;++generation;
  }catch(e){pending.push(...lease.rows.map(r=>r.replacement));schedule();throw e;}
 }
 function sync(){if(!active||viewer.component13Owner347!==api||!live(viewer))return;if(eligible()){if(!current)openLease();else preflight();}else if(current)closeLease();}
 function run(name,self,args){
  if(viewer.disposed)return;
  if(!active)return prior[name].apply(self,args);
  preflight();depth++;let result,ok=false;
  try{result=prior[name].apply(self,args);ok=true;}finally{depth--;}
  if(ok&&depth===0&&active&&live(viewer))sync();return result;
 }
 const setState=function(...args){return run('setState',this,args);};
 const setProgress=function(...args){return run('setProgress',this,args);};
 function retire(){
  if(!active)return false;
  if(current)preflight();
  active=false;++generation;
  if(viewer.component13Owner347===api)delete viewer.component13Owner347;
  for(const[k,value]of[['setState',setState],['setProgress',setProgress],['dispose',dispose]])if(viewer[k]===value)viewer[k]=prior[k];
  if(bridge&&bridge.controller.preflight===bridge.wrapped)bridge.controller.preflight=bridge.prior;bridge=null;
  closeLease();sources.length=0;return true;
 }
 const dispose=function(...args){
  if(active)retire();let result,error;
  try{result=prior.dispose.apply(this,args);}catch(e){error=e;}
  try{flushDisposals();}catch(e){error??=e;}
  if(error)throw error;return result;
 };
 function bind335Controller(controller){
  if(!active||!controller?.preflight)throw Error('Active347 and prepared335 controller required');
  if(bridge){if(bridge.controller===controller)return;throw Error('A335 preflight bridge is already owned');}
  const prior=controller.preflight,wrapped=function(...args){if(active)preflight();return prior.apply(this,args);};bridge={controller,prior,wrapped};controller.preflight=wrapped;
 }
 const api={get active(){return active;},get lease(){return current;},get pendingDisposals(){return pending.length;},get generation(){return generation;},get stats(){return{...stats};},get sourceRows(){return sources.slice();},boundsMM:boundsMM.slice(),preflight,sync,flushDisposals,retire,dispose:retire,bind335Controller,
  scope:'Only original component13 illustration12 triangles while owned335 build986647 is active. Source mesh/material/other triangles preserved. Retire335 before347. Clone notifications deferred until the source/335 stack ends.'};
 viewer.component13Owner347=api;viewer.setState=setState;viewer.setProgress=setProgress;viewer.dispose=dispose;
 return api;
}
