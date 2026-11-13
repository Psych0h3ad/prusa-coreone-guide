import assert from 'node:assert/strict';
import {FLOWS} from '../dist/manual-data.js';
import {restoreProgress} from '../dist/progress.js';

const saved={flow:'upgrade'};
for(const [flow,f]of Object.entries(FLOWS))saved[flow]={
 index:f.steps.findIndex(s=>s.verificationRevision),
 done:f.steps.map((_,i)=>i),checks:Object.fromEntries(f.steps.map((s,i)=>[i,[0]])),
 ...(flow==='build'?{variant:'glued'}:{})
};
const input=structuredClone(saved),restored=restoreProgress(saved,FLOWS);
assert.deepEqual(saved,input,'restoring must not mutate saved data');
assert.equal(restored.flow,'upgrade');assert.equal(restored.build.variant,'glued');
let updated=0,retained=0;
for(const [flow,f]of Object.entries(FLOWS)){
 assert.equal(restored[flow].index,saved[flow].index,'keep the exact current step');
 for(const [index,step]of f.steps.entries()){
  if(step.verificationRevision){
   assert(!restored[flow].done.includes(index),'legacy generic checks do not verify new conditions');
   assert.equal(restored[flow].checks[index],undefined);
   assert.equal(restored[flow].checkRevisions[step.officialId],step.verificationRevision);updated++;
  }else{
   assert(restored[flow].done.includes(index));
   assert.deepEqual(restored[flow].checks[index],[0]);retained++;
  }
 }
}
assert.equal(updated,425);assert.equal(retained,0);
assert.deepEqual(restoreProgress(restored,FLOWS),restored,'migration runs only once');

// Recheck one changed step, then reload: confirmation must now survive.
const index=restored.build.index,step=FLOWS.build.steps[index];
restored.build.checks[index]=step.checks.map((_,i)=>i);restored.build.done.push(index);
assert.deepEqual(restoreProgress(restored,FLOWS),restored);
const changed=structuredClone(FLOWS);
changed.build.steps[index].verificationRevision='updated-physical-condition';
const later=restoreProgress(restored,changed);
assert(!later.build.done.includes(index));assert.equal(later.build.checks[index],undefined);
assert.deepEqual(later.upgrade,restored.upgrade,'a build edit must not clear upgrade progress');
assert.deepEqual(later.build.done,restored.build.done.filter(i=>i!==index),'reset only the changed step');

// Translating conditions must never invalidate verification.
const localized=structuredClone(FLOWS);
for(const f of Object.values(localized))for(const s of f.steps)s.checks=s.checks.map((_,i)=>`Localized condition ${i}`);
assert.deepEqual(restoreProgress(restored,localized),restored);
const currentIndex=1,currentStep=FLOWS.build.steps[currentIndex];
const dirty={flow:'invalid',build:{index:-1,variant:'invalid',done:[currentIndex,currentIndex,-1,'2',9999],checks:{[currentIndex]:[0,0,1,-1,'0'],bad:[0]},checkRevisions:{[currentStep.officialId]:currentStep.verificationRevision}},upgrade:{index:9999}};
const clean=restoreProgress(dirty,FLOWS);
assert.equal(clean.flow,'build');assert.equal(clean.build.index,0);assert.equal(clean.build.variant,'screw');
assert.deepEqual(clean.build.done,[currentIndex]);assert.deepEqual(clean.build.checks[currentIndex],[0]);
assert.equal(clean.build.checks.bad,undefined);assert.equal(clean.upgrade.index,0);
assert.doesNotThrow(()=>restoreProgress(null,FLOWS));
assert.doesNotThrow(()=>restoreProgress({build:{checks:[]}},FLOWS));
for(const flow of ['constructor','toString','__proto__',{toString:'not a function'}])assert.equal(restoreProgress({flow},FLOWS).flow,'build');
const stale=structuredClone(restored),multi=FLOWS.build.steps.findIndex(s=>s.officialId===987044);
stale.build.done.push(multi);stale.build.checks[multi]=[0];
const repaired=restoreProgress(stale,FLOWS);
assert(!repaired.build.done.includes(multi),'a matching revision does not make a partial checklist complete');
assert.deepEqual(repaired.build.checks[multi],[0],'retain the remaining checked condition');
const legacyFlows={build:{steps:[{checks:['Condition']}]},upgrade:{steps:[]}};
const unchecked={build:{done:[0],checks:{0:[]}}};
assert(!restoreProgress(unchecked,legacyFlows).build.done.includes(0),'also repair stale completion in unversioned legacy flows');
console.log('PASS: all 425 source-versioned checks migrate correctly; exact location, variant and both flows retained. Reload, language changes, later edits, malformed storage and unversioned legacy flows verified.');
