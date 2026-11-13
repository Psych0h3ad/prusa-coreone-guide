import assert from 'node:assert/strict';
import * as T from '../dist/vendor/three.module.js';
import {v} from './check-viewer.mjs';
import {motionBounds,rigidMotion} from '../dist/assembly-director.js';
import {FLOWS} from '../dist/data.js';
const upper=v.meshes.find(m=>m.userData.cadPath?.includes(786));
assert(upper.userData.sourceGeometry,'original reference assembly is retained');
assert.equal(upper.geometry.index.count/3,4280,'upper cover contains one source solid');
assert.equal(upper.userData.sourceGeometry.index.count/3,11064,'source geometry remains intact');
const source=upper.userData.sourceGeometry.attributes.position,selected=upper.geometry.attributes.position;
const originals=new Set(Array.from({length:source.count},(_,i)=>[source.getX(i),source.getY(i),source.getZ(i)].join(',')));
for(let i=0;i<selected.count;i++)assert(originals.has([selected.getX(i),selected.getY(i),selected.getZ(i)].join(',')),'selected vertices are copied exactly');
const show=(ch,n)=>{v.setState({flow:'build',index:FLOWS.build.steps.findIndex(s=>s.chapter===ch-1&&s.officialStep===n),completed:[],comparison:'after',explore:false,variant:'screw'});v.autoplayPending=false;};
show(4,27);v.seek(1);const inv=v.printer.matrixWorld.clone().invert(),box=upper.geometry.boundingBox.clone().applyMatrix4(new T.Matrix4().multiplyMatrices(inv,upper.matrixWorld));
assert(Math.abs(box.max.z*1000-81.5361)<.01);assert(box.min.z*1000>74.68,'duplicate lower cover is excluded');
show(3,9);const actor=v.sceneActors[0],bounds=motionBounds(actor);
for(let k=0;k<=100;k++){const q=rigidMotion(actor,k/100);for(const x of [actor.box.min.x,actor.box.max.x])for(const y of [actor.box.min.y,actor.box.max.y])for(const z of [actor.box.min.z,actor.box.max.z])assert(bounds.containsPoint(new T.Vector3(x,y,z).sub(q.pivot).applyQuaternion(q.rotation).add(q.pivot).add(q.offset)),'camera bounds contain the entire tilted insertion');}
show(6,38);v.seek(1);const fitting=v.director.resolve([817]);assert.equal(fitting.length,2,'current M5-4 display has a body and a separate collet');const fitBox=new T.Box3();
for(const m of fitting){assert(m.userData.illustrative&&m.userData.geometryNote,'reconstructed fitting is identified as illustrative');assert(!m.userData.manualExcluded,'original reference fitting is excluded from the active assembly');fitBox.union(m.geometry.boundingBox.clone().applyMatrix4(new T.Matrix4().multiplyMatrices(v.printer.matrixWorld.clone().invert(),m.matrixWorld)));}
assert(Math.abs(fitBox.min.z*1000-422.2004)<.01&&Math.abs(fitBox.max.z*1000-438.4004)<.01,'body and collet retain their registered mounting/insertion heights');
console.log('PASS: original upper-cover solid extracted without changing source vertices, lower cover not duplicated, full tilted motion bounds, two-part illustrative fitting retains its registered seat.');
