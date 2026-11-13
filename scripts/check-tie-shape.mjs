import assert from 'node:assert/strict';
import * as T from '../dist/vendor/three.module.js';
import {v} from './check-viewer.mjs';
import {TIES} from '../dist/fastener-data.js';
import {createTieLockGeometry} from '../dist/tie-lock.js';

const lock=createTieLockGeometry(),edges=new Map(),p=lock.attributes.position,ix=lock.index.array;
let volume=0;
for(let i=0;i<ix.length;i+=3){
 const a=new T.Vector3().fromBufferAttribute(p,ix[i]),b=new T.Vector3().fromBufferAttribute(p,ix[i+1]),c=new T.Vector3().fromBufferAttribute(p,ix[i+2]);
 assert(b.clone().sub(a).cross(c.clone().sub(a)).length()>.00001,'no degenerate lock faces');volume+=a.dot(b.clone().cross(c))/6;
 for(const [a,b]of [[ix[i],ix[i+1]],[ix[i+1],ix[i+2]],[ix[i+2],ix[i]]]){const key=Math.min(a,b)+':'+Math.max(a,b),e=edges.get(key)||{count:0,direction:0};e.count++;e.direction+=a<b?1:-1;edges.set(key,e);}
}
for(const e of edges.values())assert(e.count===2&&e.direction===0,'lock is one closed, consistently oriented shell');
assert(volume>20&&volume<50,'outward shell winding and plausible lock volume');
const lockMesh=new T.Mesh(lock,new T.MeshBasicMaterial({side:T.DoubleSide}));lockMesh.updateMatrixWorld();
let openingRays=0;
for(const x of [-1.2,0,1.2])for(const z of [1.1,1.35,1.6])for(const y of [-5,5]){const ray=new T.Raycaster(new T.Vector3(x,y,z),new T.Vector3(0,-Math.sign(y),0));assert.equal(ray.intersectObject(lockMesh).length,0,'full-width strip clears both lock lead-ins');openingRays++;}

let surfaces=0,crowns=0;
for(const def of TIES){
 const tie=v.fasteners.entities.get(def.id);
 for(const state of [2,4]){
  tie.update(state,state,1);
  const g=tie.geometry,n=g.attributes.normal,p=g.attributes.position;
  // At a shared corner, broad-face and edge normals must remain distinct.
  // This detects the rounded-hose shading regression on the actual mesh.
  for(let i=4;i<tie.loop.count-4;i++){
   // Textile broad faces now have ten cells across their width; nylon retains
   // the eight duplicated corners. Compare the same seam in either layout.
   const first=def.strap?i*11+10:i*8+1,second=def.strap?(tie.loop.count+1)*11+i*2:i*8+2;
   const a=new T.Vector3().fromBufferAttribute(p,first),b=new T.Vector3().fromBufferAttribute(p,second);
   assert(a.distanceTo(b)<1e-9,'duplicated corners preserve strip dimensions');
   const broad=new T.Vector3().fromBufferAttribute(n,first),edge=new T.Vector3().fromBufferAttribute(n,second);
   assert(Math.abs(broad.dot(edge))<.25,`flat broad face ${def.id}/${state}/${i}`);surfaces++;
  }
  if(!def.strap&&!def.apexHead){
   const r=tie.routeModel,points=r.points,projection=points.map(p=>p.clone().sub(r.origin).dot(r.V));
   const crown=projection.indexOf(Math.max(...projection));
   const tangent=(a,b)=>points[b].clone().sub(points[a]).normalize();
   const incoming=tangent(crown-1,crown),outgoing=tangent(crown,crown+1);
   assert(incoming.angleTo(outgoing)<.12,`rounded crown ${def.id}/${state}`);crowns++;
  }
 }
 if(def.id.startsWith('base')){
  tie.update(2,2,1);assert(tie.mesh.userData.flexState.rise>35);assert(Math.abs(tie.mesh.userData.flexState.tail-9)<.001,'manual 2.3 engages only the first teeth');
  const r=tie.routeModel,tip=r.at(r.length),tail=tip.clone().sub(r.entry);
  assert(Math.abs(tail.dot(r.U))<1e-8&&Math.abs(tail.dot(r.W))<1e-8&&tail.dot(r.V)>0,'base tail continues upward through the top lock, matching manual 2.3');
 }
 if(!def.strap){
  const width=i=>new T.Vector3().fromBufferAttribute(tie.geometry.attributes.position,i*8).distanceTo(new T.Vector3().fromBufferAttribute(tie.geometry.attributes.position,i*8+1))*1000;
  tie.update(2,2,1);assert(Math.abs(width(192)-.72)<.0001,'rounded tapered free tip');
  assert(width(180)>2.35,'tip taper is limited to the last five millimetres');
  tie.update(5,5,1);assert(Math.abs(width(192)-2.4)<.0001,'trimmed end has a full-width flat cut');
 }
}
console.log(JSON.stringify({surfaces,crowns,openingRays,lockVolume_mm3:volume,result:'flat strip faces, smooth crowns, moulded open lock, tapered free tips and square cut ends; no GPU or physical stiffness certification'}));
