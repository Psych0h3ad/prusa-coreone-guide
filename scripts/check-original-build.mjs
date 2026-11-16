import assert from 'node:assert/strict';
import {FLOWS} from '../dist/data.js?v=20261112-113';
import {ASSEMBLY_PLAN} from '../dist/assembly-plan-runtime.js?v=20261113-116';
import {SENSOR_ASSEMBLY} from '../dist/sensor-assembly-data.js?v=20261111-94';
import {installOriginal} from '../dist/original/register.js';
import {encodeOriginalProgress,decodeOriginalProgress} from '../dist/original-progress.js';

const bridge=FLOWS.upgrade,bridgePlan=ASSEMBLY_PLAN.upgrade;
const registration=installOriginal(),flow=FLOWS.build;
assert.equal(flow.manualID,2251);
assert.equal(flow.steps.length,369);
assert.equal(flow.chapters.length,9);
assert.equal(new Set(flow.steps.map(s=>s.officialId)).size,369);
assert.equal(flow.steps.reduce((n,s)=>n+s.primaryInstructions.length,0),1679);
assert.equal(registration.mappings.length,369);
assert(registration.programmedStages>=162);
assert(registration.actorEntries>=445);
assert.strictEqual(FLOWS.upgrade,bridge);
assert.strictEqual(ASSEMBLY_PLAN.upgrade,bridgePlan);
for(const step of flow.steps){
  assert(step.description.trim(),step.officialId);
  assert(step.checks.length,step.officialId);
  assert(step.source.startsWith('https://help.prusa3d.com/ja/guide/'),step.officialId);
  assert(step.primaryInstructions.every(l=>Number.isInteger(l.lineID)&&l.text.trim()),step.officialId);
  assert.equal(ASSEMBLY_PLAN.build[step.officialId].originalSource.stepID,step.officialId);
}
const line=id=>flow.steps.flatMap(s=>s.primaryInstructions).find(l=>l.lineID===id)?.text;
assert.match(line(920299),/歯のある側をモーター本体へ向け/);
assert.match(line(920291),/歯のある側をモーター本体から離れる/);
for(const key of ['sensorOldCoverScrewLeft','sensorOldCoverScrewRight']){
  const screw=SENSOR_ASSEMBLY.meshes.find(m=>m.key===key);
  assert.equal(screw.fastenerLength,8);
  assert.equal(screw.url,'./assets/sensor/M3x8-cap.stl');
}
const saved={flow:'build',build:{index:17,done:[0],checks:{0:[0]},checkRevisions:{}},upgrade:{index:0,done:[],checks:{}}};
const encoded=encodeOriginalProgress(saved,FLOWS);
assert.equal(encoded.sourceProgress.cursor,flow.steps[17].officialId);
const reordered={...FLOWS,build:{...flow,steps:[flow.steps[17],...flow.steps.filter((_,i)=>i!==17)]}};
assert.equal(decodeOriginalProgress(encoded,reordered).build.index,0);
assert.equal(decodeOriginalProgress(encoded,FLOWS).build.index,17);
assert.strictEqual(encodeOriginalProgress(saved,{...FLOWS,build:{...flow,manualID:1}}),saved);
console.log(JSON.stringify({status:'PASS_ORIGINAL_SOURCE_MODEL_BRANCH_AND_PROGRESS',manual:2251,stages:369,lines:1679,programmed:registration.programmedStages,actors:registration.actorEntries,allStagesAnimated:false,fullClearanceCertified:false}));
