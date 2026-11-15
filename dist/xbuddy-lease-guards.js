// SPDX-License-Identifier: MIT
// Identity guards cover live registration, callable descriptors, complete
// attribute/view/backing-store identity, and the mesh resources actually used.
const own=(o,k)=>Object.getOwnPropertyDescriptor(o,k);
const value=(o,k)=>{const d=own(o,k);return d&&'value'in d?d.value:undefined;};
export const ownDataValue=value;
const dataSlot=(o,k)=>{const d=own(o,k);if(d&&!('value'in d))throw Error('Untrusted geometry data descriptor: '+k);return{o,k,d};};
const sameData=(s,ignoreValue=false)=>{const d=own(s.o,s.k),a=s.d;return !a?!d:!!d&&'value'in d&&d.writable===a.writable&&d.enumerable===a.enumerable&&d.configurable===a.configurable&&(ignoreValue||d.value===a.value);};
function callable(o,k){let p=o;while(p){const d=own(p,k);if(d)return{owner:p,descriptor:d};p=Object.getPrototypeOf(p);}return null;}
function sameCallable(o,k,s){const n=callable(o,k),a=s?.descriptor,b=n?.descriptor;return !!a===!!b&&(!a||n.owner===s.owner&&a.value===b.value&&a.get===b.get&&a.set===b.set&&a.writable===b.writable&&a.enumerable===b.enumerable&&a.configurable===b.configurable);}
export const methodSnapshot=(o,keys)=>keys.map(k=>[k,callable(o,k)]);
export const methodsCurrent=(o,rows)=>rows.every(([k,s])=>sameCallable(o,k,s));
const typedPrototype=Object.getPrototypeOf(Float32Array.prototype),typedGetters=Object.fromEntries(['buffer','byteOffset','byteLength','length'].map(k=>[k,own(typedPrototype,k).get]));
const typedMetadata=a=>Object.fromEntries(Object.entries(typedGetters).map(([k,get])=>[k,get.call(a)]));
function attribute(a){
 if(!a)return null;const slots=['array','count','itemSize','normalized'].map(k=>dataSlot(a,k)),array=slots[0].d?.value,meta=typedMetadata(array),version=dataSlot(a,'version');
 return{a,array,count:slots[1].d?.value,itemSize:slots[2].d?.value,normalized:slots[3].d?.value,slots,version,meta,methods:methodSnapshot(a,['setXYZ','copy','getX','getY','getZ','needsUpdate']),arrayMethods:methodSnapshot(array,['set','buffer','byteOffset','byteLength','length'])};
}
function sameAttribute(a,s){
 if(!s)return !a;if(a!==s.a||!s.slots.every(r=>sameData(r))||!sameData(s.version,true)||typeof value(a,'version')!=='number'||!methodsCurrent(a,s.methods)||!methodsCurrent(s.array,s.arrayMethods))return false;
 try{const m=typedMetadata(s.array);return Object.keys(m).every(k=>m[k]===s.meta[k]);}catch{return false;}
}
export function captureGeometryStorage(g){
 const attributesSlot=dataSlot(g,'attributes'),indexSlot=dataSlot(g,'index'),attributes=attributesSlot.d?.value;if(!attributes||typeof attributes!=='object')throw Error('Required own geometry attribute map');
 const slots=['position','normal','index'].map(k=>dataSlot(attributes,k));
 return{g,attributes,attributesSlot,indexSlot,slots,p:attribute(slots[0].d?.value),n:attribute(slots[1].d?.value),ix:attribute(indexSlot.d?.value),methods:methodSnapshot(g,['setIndex','setAttribute','dispose','computeBoundingBox','computeBoundingSphere','setDrawRange','addEventListener','removeEventListener'])};
}
export function geometryStorageCurrent(s,ignoreIndex=false){
 return !!s&&sameData(s.attributesSlot)&&s.slots.every(r=>sameData(r))&&(ignoreIndex||sameData(s.indexSlot))&&sameAttribute(s.slots[0].d?.value,s.p)&&sameAttribute(s.slots[1].d?.value,s.n)&&(ignoreIndex||sameAttribute(s.indexSlot.d?.value,s.ix))&&methodsCurrent(s.g,s.methods);
}
const geometry=captureGeometryStorage;
function sameGeometry(g,s){return g===s.g&&geometryStorageCurrent(s);}
function mesh(m){return{m,parent:m.parent,userData:m.userData,geometry:geometry(m.geometry),material:m.material,materials:Array.isArray(m.material)?[...m.material]:null,materialMethods:(Array.isArray(m.material)?m.material:[m.material]).map(x=>[x,methodSnapshot(x,['dispose'])]),position:m.position,quaternion:m.quaternion,scale:m.scale,matrix:m.matrix,elements:m.matrix.elements};}
function sameMesh(m,s){return m===s.m&&m.parent===s.parent&&m.userData===s.userData&&sameGeometry(value(m,'geometry'),s.geometry)&&m.material===s.material&&(!s.materials||s.materials.every((x,i)=>m.material[i]===x)&&m.material.length===s.materials.length)&&s.materialMethods.every(([m,r])=>methodsCurrent(m,r))&&m.position===s.position&&m.quaternion===s.quaternion&&m.scale===s.scale&&m.matrix===s.matrix&&m.matrix.elements===s.elements;}
export function createXBuddyLeaseGuard(viewer,lease){
 const fasteners=viewer.fasteners,registry=fasteners.entities,containers={meshes:viewer.meshes,records:viewer.records,fastenerMeshes:fasteners.meshes},meshes=new Map(),links=new Map(),entities=[];
 const link=(m,role)=>{if(!m)return;if(!meshes.has(m))meshes.set(m,mesh(m));if(!links.has(m))links.set(m,new Set());links.get(m).add(role);};
 for(const[id,e]of lease.entities){
  const related=[e.mesh,e.plug,e.latch,e.header,...(e.wireMeshes||[]),...lease.added.filter(m=>id==='xbCompleteMain'?m.userData.component?.startsWith('xbCompleteMain'):id==='xbCompleteLcd'?m.userData.component?.startsWith('xbCompleteLcd'):false)].filter(Boolean);
  for(const m of related)link(m,id);
  entities.push({id,e,role:id,mesh:e.mesh,geometry:e.geometry,slots:['plug','latch','header','definition','retainedPacket','nativeSkin'].map(k=>[k,value(e,k)]),methods:methodSnapshot(e,['current','endpoint','applyPose','update','follow','guide','retire','reset']),related});
 }
 for(const r of lease.borrowed){const role=r.role||(r.e.id==='mainRear'?'xbCompleteMain':'xbCompleteLcd');link(r.e.mesh,role);entities.push({id:r.e.id,e:r.e,role,mesh:r.e.mesh,geometry:r.e.geometry,methods:methodSnapshot(r.e,['update','guide','followEnd']),related:[r.e.mesh]});}
 for(const e of lease.ties){const source=registry.get(e.sourceId);entities.push({id:e.sourceId,e:source,role:e.id,mesh:source.mesh,geometry:source.geometry,methods:methodSnapshot(source,['update','guide','setOpenPreparation']),related:[source.mesh]});}
 for(const r of lease.proxies)link(r.mesh,'board-proxy');
 for(const m of lease.added)if(!meshes.has(m))link(m,'unassigned');
 link(lease.board,'board-source');
 const headerArray=lease.signalHeaders,headerRecords=(headerArray||[]).map(r=>({r,mesh:r.mesh,base:r.base}));
 const geometrySnapshots=new Map(),materialSnapshots=new Map();
 for(const s of meshes.values()){geometrySnapshots.set(s.geometry.g,s.geometry);for(const[m,r]of s.materialMethods)materialSnapshots.set(m,r);}
 for(const r of lease.borrowed)if(!geometrySnapshots.has(r.initialGeometry))geometrySnapshots.set(r.initialGeometry,geometry(r.initialGeometry));
 const api={geometryForMesh:m=>meshes.get(m)?.geometry.g,containersCurrent:()=>viewer.fasteners===fasteners&&fasteners.entities===registry&&viewer.meshes===containers.meshes&&viewer.records===containers.records&&fasteners.meshes===containers.fastenerMeshes,
  losses(){
   if(viewer.fasteners!==fasteners||fasteners.entities!==registry||viewer.meshes!==containers.meshes||viewer.records!==containers.records||fasteners.meshes!==containers.fastenerMeshes)return[{reason:'foreign owner container',all:true}];
   const out=[];
   if(value(lease,'signalHeaders')!==headerArray||headerArray?.length!==headerRecords.length||headerRecords.some((s,i)=>headerArray[i]!==s.r||value(s.r,'mesh')!==s.mesh||value(s.r,'base')!==s.base))return[{reason:'foreign header registration',all:true}];
   for(const r of entities)if(registry.get(r.id)!==r.e||value(r.e,'mesh')!==r.mesh||('geometry'in r.e&&value(r.e,'geometry')!==r.geometry)||r.slots?.some(([k,v])=>value(r.e,k)!==v)||!methodsCurrent(r.e,r.methods))out.push({reason:'foreign entity/registration/callable',role:r.role,id:r.id,meshes:r.related});
   for(const[m,s]of meshes)if(!sameMesh(m,s))out.push({reason:'foreign mesh/attribute/view/backing-store/resource',roles:[...links.get(m)],meshes:[m]});
   return out;
  },
  publish(m){
   // Called only by the guarded strip writer immediately after its own
   // setIndex operation, which has no disposal or asynchronous notification.
   if(!meshes.has(m)||!geometryStorageCurrent(meshes.get(m).geometry,true))throw Error('Unowned geometry publication');const s=mesh(m);meshes.set(m,s);geometrySnapshots.set(s.geometry.g,s.geometry);
   for(const r of entities)if(r.mesh===m)r.geometry=r.e.geometry;
  },
  canDisposeGeometry(g){const s=geometrySnapshots.get(g);return !!s&&sameGeometry(g,s);},
  canDisposeMaterial(m){const s=materialSnapshots.get(m);return !!s&&methodsCurrent(m,s);},
  retained(losses){
   const roles=new Set(),keep=new Set();
   if(losses.some(r=>r.all)){for(const m of meshes.keys())keep.add(m);for(const r of entities)roles.add(r.role);return{roles,meshes:keep};}
   for(const r of losses){if(r.role)roles.add(r.role);for(const id of r.roles||[])roles.add(id);for(const m of r.meshes||[])keep.add(m);}
   for(const[m,ids]of links)if([...ids].some(id=>roles.has(id)))keep.add(m);
   return{roles,meshes:keep};
  }
 };return api;
}
