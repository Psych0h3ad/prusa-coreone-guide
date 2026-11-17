import assert from 'node:assert/strict';
// This shared plan fixture installs Node's bounded asset transport before the
// runtime's compressed tables are imported. It does not create a renderer.
import './check-heater-service.mjs';
import {SERVICE_TASKS} from '../dist/maintenance-data.js';
import {OFFICIAL_MAINTENANCE_JA} from '../dist/official-maintenance-ja.js';
import {THERMISTOR_SERVICE_SOURCE as source} from '../dist/thermistor-service-source.js';
const {maintenanceSceneSpec:scene}=await import('../dist/maintenance-model.js');
const {HEATER_REFS:R}=await import('../dist/heater-service-geometry.js');
const {THERMISTOR_SCREW_REF:SCREW,THERMISTOR_SCREW_DATUM:D}=await import('../dist/thermistor-service-geometry.js');
const expected=[945908,945950,945992,946054,946100,946146,946172,946208,946246,946300,946886,946924,946950,946318,946372,946406,946424,946454,946516,946560,946666];
const task=SERVICE_TASKS.find(t=>t.id==='hotend-thermistor'),images=new Set();
assert(task?.thermistorService);assert.equal(task.steps.length,21);
assert.deepEqual(task.steps.map(s=>s.officialId),expected);
assert.deepEqual(source.steps.map(s=>s.id),expected);
assert.deepEqual(OFFICIAL_MAINTENANCE_JA.guides.find(g=>g.id==='944854').tasks,[task.id]);
assert.equal(SERVICE_TASKS.filter(t=>t.id!==task.id&&t.id!=='chamber-thermistor'&&t.id!=='chamber-fan'&&!['belt-tensioner-pulley','belt-tensioner-left','belt-tensioner-right','heatsink-replacement','hotend-rebuild','internal-filament-sensor-replacement','xbuddy','side-ir-replacement','z-motor-replacement','z-motor-replacement-rear','z-motor-replacement-left','z-motor-replacement-right','z-motor-replacement-front'].includes(t.id)).reduce((n,t)=>n+t.steps.length,0),352,'retain the original baseline outside separately checked replacement guides');
for(const [i,s]of task.steps.entries()){
 assert.equal(s.officialStep,i+1);assert.equal(source.steps[i].number,i+1,'source links display a real matching step number');
 assert.equal(s.source,task.source+'#'+expected[i]);assert(s.sourcePhotos.length>0);
 assert.deepEqual(source.steps[i].images,s.sourcePhotos);
 for(const field of['title','body']){assert.equal(s[field].length,4);for(const text of s[field])assert(typeof text==='string'&&text.trim());}
 for(const im of s.sourcePhotos){for(const value of[im.url,im.full]){const u=new URL(value);assert.equal(u.protocol,'https:');assert.equal(u.hostname,'help.prusa3d.com');assert(u.pathname.startsWith('/wp-content/uploads/'));}images.add(im.url);}
}
assert.equal(images.size,45);
assert.deepEqual(task.steps[2].firmwareActions,['unload','cooldown']);assert.deepEqual(task.steps[3].firmwareActions,['moveZ']);
assert.match(task.steps[1].body[1],/T6/);assert.match(task.steps[2].body[1],/ambient|room temperature/i);
assert.match(task.steps[3].body[1],/wait.*stop.*switch off.*unplug/i);
assert.match(task.steps[10].body[1],/without removing|do not remove|leave.*block/i);
assert.match(task.steps[12].body[1],/middle hole/i);assert.match(task.steps[12].body[1],/long side of T6/);
assert.match(task.steps[14].body[1],/barely visible/i,'retain this guide’s seating description rather than borrowing the heater guide');
assert.match(task.steps[20].body[1],/above 200\s*°C/);
let scenes=0;
const custom={nozzleTipZMM:410,sheetSurfaceZMM:80,startControlZMM:2,targetControlZMM:170};
for(let lang=0;lang<4;lang++){
 const at=(i,frame)=>scene(task,i,a=>a[lang],null,frame);
 for(let i=0;i<21;i++){
  const s=at(i,custom),p=s.plan,stage=i<3?'before':i===3?'move':'after';
  assert.equal(p.serviceBedHeight.stage,stage);assert.equal(p.serviceBedHeight.targetControlZMM,170);
  const moving=p.actors.filter(a=>a.serviceBedHeight),held=(p.workpiecePoses||[]).filter(a=>a.serviceBedHeight);
  assert.equal(moving.length,stage==='move'?1:0);assert.equal(held.length,stage==='move'?0:1);
  if(stage==='move')assert.equal(moving[0].posePath.at(-1).offset[2],160);
  else assert.equal(held[0].offset[2],stage==='before'?328:160);
  assert(s.hidden.includes(R.original));scenes++;
 }
 const removal=at(10).plan.actors,insertion=at(12).plan.actors;
 assert.deepEqual(removal.map(a=>a.refs),[[SCREW],[R.thermistor,'hotendThermistor0','hotendThermistor1']]);
 assert(removal[1].remove&&removal[1].keepRemoved);
 assert.deepEqual(removal[0].axis,D.out);assert.deepEqual(removal[0].posePath.at(-1).offset,D.out.map(x=>x*D.loosenTravelMM));
 assert.deepEqual(insertion.map(a=>a.refs),[[R.thermistor,'hotendThermistor0','hotendThermistor1'],[SCREW],['serviceSock']]);
 assert.equal(insertion[1].showBefore,true);assert(!insertion[1].carry,'the future tightening actor retains its loose before-pose during sensor insertion');
 assert.deepEqual(insertion[1].posePath[0].offset,D.out.map(x=>x*D.loosenTravelMM));
 for(const actor of[...removal,...insertion])assert(!actor.refs.some(ref=>R.screws.includes(ref)||ref===R.heater||ref==='serviceNozzle'),'heater screws, heater and nozzle remain on the block');
 for(const i of[8,13]){
  const p=at(i).plan,whole=[...p.actors,...(p.workpiecePoses||[])].filter(a=>a.refs?.includes(R.block)&&a.refs.includes(R.thermistor));
  assert(whole.length>0);assert(whole.every(a=>a.refs.includes(SCREW)),'retained screw accompanies the whole hotend frame');
 }
}
console.log(`PASS_THERMISTOR_SERVICE: ${scenes} localized scenes, 21 numbered source steps, ${images.size} remote photographs; single retained T6 screw, measured bed frame and whole-hotend handoffs.`);
