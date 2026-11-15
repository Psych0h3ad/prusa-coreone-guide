import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {SERVICE_TASKS} from '../dist/maintenance-data.js';
import {OFFICIAL_MAINTENANCE_JA} from '../dist/official-maintenance-ja.js';
import {HEATER_SERVICE_SOURCE} from '../dist/heater-service-source.js';
registerHooks({resolve(s,c,next){if(s==='three')return{url:new URL('../dist/vendor/three.module.js',import.meta.url).href,shortCircuit:true};return next(s,c);}});
// The runtime loads compressed route tables relative to its modules. Node's
// fetch has no file transport; keep this fixture confined to checked-in dist.
const priorFetch=globalThis.fetch,dist=path.resolve('dist')+path.sep;
globalThis.fetch=async(input,options)=>{
 const value=String(input?.url||input);if(!value.startsWith('file:'))return priorFetch(input,options);
 const url=new URL(value);url.search='';url.hash='';const filename=fileURLToPath(url);
 assert(filename.startsWith(dist),'plan fixture reads only distribution assets');
 return new Response(await readFile(filename),{status:200});
};
let maintenanceSceneSpec;
try{({maintenanceSceneSpec}=await import('../dist/maintenance-model.js'));}finally{globalThis.fetch=priorFetch;}
const {HEATER_REFS:R}=await import('../dist/heater-service-geometry.js');
const task=SERVICE_TASKS.find(t=>t.id==='hotend-heater');
// The heater delegates access to the hotend procedure. A supplied measured
// frame must cross that delegation, rather than silently using a default.
const measured={nozzleTipZMM:400,sheetSurfaceZMM:110,startControlZMM:1,targetControlZMM:160};
for(const [index,stage,offset] of [[2,'before',289],[3,'move',130],[4,'after',130],[10,'after',130],[21,'after',130]]){
 const spec=maintenanceSceneSpec(task,index,a=>a[0],null,measured),bed=spec.plan.serviceBedHeight;
 assert.equal(bed.stage,stage);assert.equal(bed.targetControlZMM,160);
 if(stage==='move'){const actor=spec.plan.actors.find(a=>a.serviceBedHeight);assert(actor);assert.equal(actor.posePath.at(-1).offset[2],offset);}
 else assert.equal(spec.plan.workpiecePoses.find(p=>p.serviceBedHeight).offset[2],offset);
}
// Official guide944862 order, including the sock step inserted before945693.
const expected=[944923,944966,945000,945062,945108,945154,945180,945216,945254,945849,945693,945717,945765,945308,945363,945397,945415,945445,945507,945551,945587,945657];
assert(task?.heaterService);assert.equal(task.steps.length,22);
assert.deepEqual(task.steps.map(s=>s.officialId),expected);
assert.deepEqual(HEATER_SERVICE_SOURCE.steps.map(s=>s.id),expected);
assert.deepEqual(OFFICIAL_MAINTENANCE_JA.guides.find(g=>g.id==='944862').tasks,['hotend-heater']);
assert.equal(SERVICE_TASKS.filter(t=>!['hotend-heater','hotend-thermistor','chamber-thermistor','chamber-fan','belt-tensioner-pulley','belt-tensioner-left','belt-tensioner-right','heatsink-replacement','hotend-rebuild','internal-filament-sensor-replacement'].includes(t.id)).reduce((n,t)=>n+t.steps.length,0),330,'retain the original baseline outside separately checked replacement guides');
const photographs=new Set();
for(const [i,step] of task.steps.entries()){
 assert.equal(step.officialStep,i+1);assert.equal(step.source,task.source+'#'+expected[i]);
 assert.equal(HEATER_SERVICE_SOURCE.steps[i].number,i+1);
 for(const field of ['title','body']){assert.equal(step[field].length,4);for(const text of step[field])assert(typeof text==='string'&&text.trim());}
 assert(step.sourcePhotos.length>0);
 for(const image of step.sourcePhotos){for(const src of [image.url,image.full]){const url=new URL(src);assert.equal(url.protocol,'https:');assert.equal(url.hostname,'help.prusa3d.com');assert(url.pathname.startsWith('/wp-content/uploads/'));}photographs.add(image.url);assert.equal(image.credit.length,4);}
}
assert.equal(photographs.size,41);
assert(task.steps[2].firmwareActions.includes('unload')&&task.steps[2].firmwareActions.includes('cooldown'));
assert(task.steps[3].firmwareActions.includes('moveZ'));
assert.match(task.steps[2].body[1],/ambient|room temperature/i);
assert.match(task.steps[3].body[1],/wait.*stop.*switch off.*unplug/i);
assert.match(task.steps[1].body[1],/T6/i);
assert.match(task.steps[12].body[1],/bottom/i);
assert.match(task.steps[12].body[1],/do not overtighten/i);
assert.match(task.steps[14].body[1],/copper ring/i);
assert.match(task.steps[21].body[1],/above 200\s*°C/);
assert.match(task.steps[21].body[1],/cool down and unplug/i);
let scenes=0;
for(let lang=0;lang<4;lang++){
 const scene=i=>maintenanceSceneSpec(task,i,a=>a[lang]);
 for(let i=0;i<22;i++){const s=scene(i);assert(s.plan&&Array.isArray(s.plan.actors));assert(s.hidden.includes(R.original));scenes++;}
 const unplug=scene(7).plan.actors.filter(a=>a.flex).map(a=>a.flex);
 assert.deepEqual(unplug,[['hotendHeater0','hotendHeater1'],['hotendThermistor0','hotendThermistor1']]);
 const route=scene(15).plan.actors.filter(a=>a.flex).map(a=>a.flex);
 const plug=scene(16).plan.actors.filter(a=>a.flex).map(a=>a.flex);
 const thermistorFirst=[['hotendThermistor0','hotendThermistor1'],['hotendHeater0','hotendHeater1']];
 assert.deepEqual(route,thermistorFirst);assert.deepEqual(plug,thermistorFirst);
 const removal=scene(10).plan.actors;
 assert.deepEqual(removal.slice(0,2).map(a=>a.refs),R.screws.map(ref=>[ref]));
 const cartridge=removal.find(a=>a.refs?.includes(R.heater));assert(cartridge);
 assert(!cartridge.refs.includes(R.thermistor)&&!cartridge.refs.includes('serviceNozzle'));
 assert.deepEqual(cartridge.refs,[R.heater,'hotendHeater0','hotendHeater1']);
 assert.equal(removal.length,5,'loosen two screws, remove cartridge, remove old screws');
 const insertion=scene(12).plan.actors;
 assert.deepEqual(insertion.slice(0,2).map(a=>a.refs),R.screws.map(ref=>[ref]));
 assert(insertion[2].refs.includes(R.heater));assert(!insertion[2].refs.includes(R.thermistor));
 assert.equal(insertion.length,6,'start two screws, seat cartridge, secure two screws, refit sock if used');
}
console.log(`PASS_HEATER_SERVICE: ${scenes} localized scenes, 22 official steps, 41 referenced photographs; safety order, cartridge-only motion and both retaining screws.`);
