import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import * as T from '../dist/vendor/three.module.js';
import {v} from './check-viewer.mjs';
const {installChamberFanAnatomy,retireChamberFanAnatomy}=await import('../dist/chamber-fan-anatomy.js');
const {PrinterViewer}=await import('../dist/viewer.js');
const digest=b=>crypto.createHash('sha256').update(b).digest('hex'),source=JSON.parse(fs.readFileSync('dist/assets/chamber-fan-anatomy/fan-anatomy.json')),binary=fs.readFileSync('dist/assets/chamber-fan-anatomy/fan-anatomy.bin');
assert.equal(digest(binary),source.sha256);assert.equal(binary.length,source.bytes);assert.equal(source.parameters.blades,7);
const first=v.chamberFanAnatomy,frames=first.frames,registry=v.meshes.slice(),records=v.records.slice(),before=frames.map(m=>({m,g:m.geometry,material:m.material,positions:digest(Buffer.from(m.geometry.attributes.position.array.buffer)),matrix:m.matrix.toArray()}));
assert.equal(first.owned.length,4);assert.equal(first.geometries.support.groups.length,2);assert(!registry.some(m=>m.userData.referenceFanAnatomy));
assert.equal(await installChamberFanAnatomy(v),first,'installation is idempotent');
for(const [role,g]of Object.entries(first.geometries)){
 const row=source.parts[role];assert.equal(row.solids,1);assert(row.validSolid);assert.equal(row.vertices,g.attributes.position.count);
 assert.equal(digest(binary.subarray(row.offsetBytes,row.offsetBytes+row.bytes)),row.sha256);
 if(role==='rotor'){const p=g.attributes.position;let radius=0;for(let i=0;i<p.count;i++)radius=Math.max(radius,Math.hypot(p.getX(i),p.getY(i)));assert(radius<.028,'rotor inside native 29mm bore');assert(g.boundingBox.min.z>.004&&g.boundingBox.max.z<.021);}
}
for(const frame of frames){
 const mat=frame.material,old={opacity:mat.opacity,transparent:mat.transparent,depthWrite:mat.depthWrite};
 mat.opacity=.045;mat.transparent=true;mat.depthWrite=false;first.syncMaterials();
 for(const mesh of first.owned.filter(m=>m.parent===frame))for(const m of Array.isArray(mesh.material)?mesh.material:[mesh.material]){assert.equal(m.opacity,.045);assert(m.transparent);assert(!m.depthWrite);}
 Object.assign(mat,old);first.syncMaterials();
 const rotor=first.owned.find(m=>m.parent===frame&&m.userData.referenceRole==='rotor');frame.updateWorldMatrix(true,true);
 const origin=frame.localToWorld(new T.Vector3(0,0,-.01)),direction=new T.Vector3(0,0,1).transformDirection(frame.matrixWorld),ray=new T.Raycaster(origin,direction),hit=ray.intersectObjects([frame,...first.pickTargets],false)[0];
 assert.equal(hit.object,rotor,'clicking the open frame centre hits the new hub');assert.equal(first.selectionOwners.get(hit.object),frame);
}
function counted(owner){const counts=new Map();for(const r of new Set([...Object.values(owner.geometries),...owner.owned.flatMap(m=>Array.isArray(m.material)?m.material:[m.material])])){counts.set(r,0);r.addEventListener('dispose',()=>{counts.set(r,counts.get(r)+1);owner.retire();});}return counts;}
const firstCounts=counted(first);retireChamberFanAnatomy(v);retireChamberFanAnatomy(v);assert([...firstCounts.values()].every(n=>n===1));assert(first.retired);assert(!v.chamberFanAnatomy);assert.equal(first.pickTargets.length,0);
assert.deepEqual(v.meshes,registry);assert.deepEqual(v.records,records);
for(const row of before){assert.equal(row.m.geometry,row.g);assert.equal(row.m.material,row.material);assert.equal(digest(Buffer.from(row.g.attributes.position.array.buffer)),row.positions);assert.deepEqual(row.m.matrix.toArray(),row.matrix);}
const pending=installChamberFanAnatomy(v);assert.equal(installChamberFanAnatomy(v),pending,'concurrent callers share a single owner load');
const second=await pending,secondCounts=counted(second);assert.notEqual(second,first);
// Native-first disposal bypasses wrappers; owned resources must leave the
// graph before the native resource Set is collected, including reentrancy.
globalThis.cancelAnimationFrame=()=>{};
v.renderer.dispose=()=>{};
PrinterViewer.prototype.dispose.call(v);v.dispose();assert([...secondCounts.values()].every(n=>n===1));assert(second.retired);assert(!v.chamberFanAnatomy);assert(v.disposed);
console.log('PASS: chamber fan source hashes, analytic solid metadata, rotor envelope, native identity, picking, opacity before draw, reinstall and native-first/reentrant disposal.');
