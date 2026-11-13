import assert from 'node:assert/strict';
import * as T from '../dist/vendor/three.module.js';
import {ventConfiguration,VENT_DATUM} from '../dist/vent-configuration.js';
import {createVentHardware} from '../dist/vent-hardware.js';
import {FLOWS} from '../dist/data.js';
import {ASSEMBLY_PLAN} from '../dist/assembly-plan.js';

for(const [flow,f]of Object.entries(FLOWS))for(const step of f.steps){
 const state={flow,comparison:'after',explore:false};
 assert.equal(ventConfiguration({...state,comparison:'before'},step),'original');
 assert.equal(ventConfiguration({...state,explore:true},step),flow==='build'?'kit':'upgrade');
 assert.equal(ventConfiguration(state,step),flow==='build'?'kit':step.chapter<1||step.chapter===1&&step.officialStep<28?'original':'upgrade');
}

// Tiny independent placeholder geometries check selection policy, not CAD fit.
const fixture=new T.BufferGeometry();
const screws=[98,100,102].map(id=>{const mesh=new T.Mesh(fixture.clone());Object.assign(mesh.userData,{cadPath:[87,id,id+1],cadName:'Source Torx screw',restPosition:mesh.position.clone()});return mesh;});
const nuts=[94,94,96,96].map(id=>{const mesh=new T.Mesh();mesh.position.set(id/1000,.1,.483);Object.assign(mesh.userData,{cadPath:[87,id,id+1],restPosition:mesh.position.clone()});return mesh;});
const baseNutPositions=nuts.map(m=>m.position.clone()),records=screws.map(mesh=>({mesh,name:mesh.userData.cadName})),longGeometries=Object.fromEntries([98,100,102].map(id=>[id,new T.BufferGeometry()])),hardware=createVentHardware([...screws,...nuts],longGeometries,records);
assert.throws(()=>createVentHardware(screws,{}),/verified M3x12/);
for(const mode of ['kit','original','upgrade','kit','upgrade','original']){
 hardware.apply(mode);
 assert.deepEqual(screws.map(m=>m.userData.fastenerLength),mode==='original'?[10,10,10]:mode==='kit'?[12,12,12]:[10,12,12]);
 for(const [i,nut]of nuts.entries())assert(nut.userData.restPosition.distanceTo(baseNutPositions[i].clone().add(new T.Vector3(0,0,mode==='original'?0:-.002)))<1e-12,'nut offsets must not accumulate');
 if(mode==='original')assert(records.every(r=>r.name==='Source Torx screw'),'original CAD labels restore');
 else assert(records.slice(mode==='kit'?0:1).every(r=>r.name.includes('M3x12')),'replacement length appears in part information');
}
const step=FLOWS.build.steps.find(s=>s.chapter===7&&s.officialStep===6),scene=ASSEMBLY_PLAN.build[step.officialId];
assert.equal(scene.actors.length,5);assert(scene.actors[0].handling);assert(scene.actors[0].refs.includes(88));
assert.deepEqual(scene.actors[2].refs,[92],'the right nut is started before fitting the block');
assert.deepEqual(scene.actors[4].refs,[94,96],'the last two nuts secure the block');
console.log('PASS: kit/original/upgrade hardware policy, separately supplied geometry variants, rejection of missing M3x12 assets, reversible nonaccumulating nut offsets and official nut order. Policy fixtures only; no source geometry loaded. Correct threaded M3x12 geometry and production motion/contact checks remain pending.');
