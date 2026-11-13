import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from '../dist/vendor/three.module.js';
import {v} from './check-viewer.mjs';
import {FLOWS} from '../dist/data.js';

const boards=JSON.parse(fs.readFileSync('dist/assets/electronics/boards.json')).boards;
const show=(ch,n,progress=1)=>{const index=FLOWS.build.steps.findIndex(s=>s.chapter===ch-1&&s.officialStep===n);v.setState({flow:'build',index,completed:[],comparison:'after',explore:false,variant:'screw'});v.seek(progress);v.printer.updateMatrixWorld(true);};
const part=k=>v.meshes.filter(m=>m.userData.part===k),visible=k=>part(k).some(m=>m.visible);
const original=id=>v.meshes.filter(m=>m.userData.cadPath?.includes(id));
const fasteners={xBuddy:[179,181,183,185,187],xBuddyExtension:[171,173,175,177]};

show(3,10);
let mountingResidual=0;
for(const b of boards){
 assert.equal(b.thickness,1.6);assert(b.provenance.includes('illustration'));
 assert(part(b.key).length>=5&&part(b.key).length<=8,'component geometry is batched for mobile rendering');
 assert(part(b.key).some(m=>m.material.map),'PCB surface includes official-photo detail');
 for(const m of part(b.key))for(const name of ['position','normal','uv'])assert([...m.geometry.attributes[name].array].every(Number.isFinite));
 for(const id of fasteners[b.key]){
  const inv=v.printer.matrixWorld.clone().invert(),box=new T.Box3();
  for(const m of original(id))box.union(m.geometry.boundingBox.clone().applyMatrix4(new T.Matrix4().multiplyMatrices(inv,m.matrixWorld)));
  const centre=box.getCenter(new T.Vector3()).multiplyScalar(1000);
  const best=Math.min(...b.holes.map(([u,w])=>Math.hypot(centre.x-(b.origin[0]-u),centre.z-(b.origin[2]-w))));
  mountingResidual=Math.max(mountingResidual,best);assert(best<.015,'hole centre coincides with original fastener axis');
  assert(Math.abs(box.min.y*1000+6-b.origin[1])<.015,'board front seats under original screw head');
 }
}
show(3,6);assert(!visible('xBuddy')&&!visible('xBuddyExtension'),'boards do not appear in case preparation');
show(3,8);assert(visible('xBuddy')&&visible('thermalPads')&&!visible('xBuddyExtension'));assert(!original(167)[0].visible,'thermal pads use a separate board workpiece');
assert.equal(part('thermalPads').length,3);
show(3,9,0);assert.equal(v.sceneActors.length,2);assert(v.sceneActors[0].nodes.some(m=>m.userData.part==='thermalPads'),'pads travel with the board');
assert.equal(v.sceneActors[1].nodes.length,5);assert.equal(v.sceneActors[0].anchors.length,5);assert(!visible('xBuddyExtension'));
show(3,10,0);assert(visible('xBuddy'),'mainboard remains fitted while extension is staged');assert.equal(v.sceneActors[1].nodes.length,4);assert.equal(v.sceneActors[0].anchors.length,4);
const mainPositions=part('xBuddy').map(m=>m.position.toArray());v.seek(.49);assert.deepEqual(part('xBuddy').map(m=>m.position.toArray()),mainPositions,'mainboard stays fixed during extension insertion');
assert(v.sceneActors[1].nodes.every(m=>!m.visible),'screws wait until board is seated');
v.seek(1);assert(visible('xBuddyExtension'));assert(v.guideGroups.every(g=>!g.visible),'guides clear after seating');
assert.equal(v.currentView,'board-perspective','default camera shows inside the enclosure');
for(const n of [22,23]){
 show(3,n,.5);const actor=v.sceneActors[0];for(const k of ['xBuddy','xBuddyExtension','thermalPads'])assert(part(k).every(m=>actor.nodes.includes(m)),'entire electronics unit moves rigidly');
 const offset=part('xBuddy')[0].position.clone().sub(part('xBuddy')[0].userData.restPosition);
 for(const id of [167,169,...Object.values(fasteners).flat()])for(const m of original(id))assert(m.position.clone().sub(m.userData.restPosition).distanceTo(offset)<1e-9,'case, boards and screws share the same motion');
}
show(3,35);assert(visible('xBuddy')&&visible('xBuddyExtension'));
v.setState({flow:'upgrade',index:0,completed:[],comparison:'before',explore:false,variant:'screw'});assert(visible('xBuddy')&&visible('xBuddyExtension'));
assert(original(189).every(m=>!m.visible),'the manual leaves the lower right hole empty');
fs.writeFileSync('research/electronics-check.json',JSON.stringify({boards:2,fasteners:9,mountingAxisResidual_mm:mountingResidual,geometry:'Photo-registered assembly illustrations; component heights approximate',browserGPUExercised:false},null,2));
console.log('PASS: 2 boards, 3 pads, 5+4 fasteners, empty lower-right hole, hole-axis registration, per-step visibility, mounting guides, rigid case transfers. Largest sampled mounting-axis residual '+mountingResidual.toFixed(4)+' mm.');
