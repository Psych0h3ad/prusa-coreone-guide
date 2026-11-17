// SPDX-License-Identifier: MIT
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {registerHooks} from 'node:module';
const page=new URL('../dist/original.html',import.meta.url),map=JSON.parse(fs.readFileSync(page,'utf8').match(/<script type="importmap">([\s\S]*?)<\/script>/)[1]).imports;
const aliases=new Map(Object.entries(map).map(([k,v])=>[k.startsWith('.')?new URL(k,page).href:k,new URL(v,page).href]));
registerHooks({resolve(s,c,next){const r=next(s,c),url=aliases.get(r.url)||aliases.get(s);return url?{url,shortCircuit:true}:r;}});
const {FLOWS}=await import('../dist/data.js'),{ASSEMBLY_PLAN:P}=await import('../dist/assembly-plan-runtime.js'),{installOriginal}=await import('../dist/original/register.js'),{ORIGINAL_ROD_HOLDERS:D}=await import('../dist/original-rod-holder-data.js'),{originalRodHolderScene:project}=await import('../dist/original-rod-holder-scene.js');
const upgrade=JSON.stringify(P.upgrade);installOriginal();assert.equal(JSON.stringify(P.upgrade),upgrade,'Original registration preserves the upgrade plan');assert.equal(FLOWS.build.steps.length,369);
const expected={843822:12,843942:0,843986:6,844362:14,844434:8,844583:2,846922:3};
assert.equal(Object.values(expected).reduce((a,b)=>a+b),45);
for(const [id,count]of Object.entries(expected)){
 const p=P.build[id],source=FLOWS.build.steps.find(s=>s.officialId===+id);assert.equal(p.actors.length,count);assert(source.verificationRevision.endsWith(':rod-holders-v1'),'changed mechanical steps require renewed confirmation');
 for(const a of p.actors)assert(a.originalSource.lineIDs.every(id=>source.originalSource.lineIDs.includes(id)),'actor remains tied to lines in its actual Original step');
}
assert.equal(FLOWS.build.steps.filter(s=>s.verificationRevision.endsWith(':rod-holders-v1')).length,7);
assert(FLOWS.build.steps.every(s=>P.build[s.officialId].originalRodHolderFrame===D.frame.key),'mounted frame persists in all later Original stages');
assert.deepEqual(P.build[844583].actors.map(a=>a.refs[0]),[500,502],'5.14 tightens only the upper front screws');
assert.deepEqual(P.build[846922].actors.slice(1).map(a=>a.refs[0]),[504,506],'5.75 tightens the lower right, then lower left');
const examples=P.build[844362].actors.filter(a=>a.instructionKind==='handling-example');assert.equal(examples.length,4);assert(examples.every(a=>a.label.startsWith('持ち替え例：')&&a.sourceHandlingQualification),'authored extra handling is visibly identified');
for(const step of[33,34,36,74]){
 const s=FLOWS.build.steps.find(s=>s.chapter===4&&s.officialStep===step),p=P.build[s.officialId];
 for(const id of[504,506])assert.equal(p.workpiecePoses.filter(q=>q.refs.length===1&&q.refs[0]===id).length,1,'lower rod screws stay loose alongside the rail assembly');
}
assert.equal(P.build[843531].actors.length,10,'rod integration preserves the safety-pin and rail sequence');
assert.deepEqual(P.build[866050].actors.slice(1).map(a=>a.refs[0]),[538,528,536,530,534,532],'later rail tightening order is preserved');
const scene={plan:{originalRodHolderFrame:D.frame.key},instanceOffsets:[{cadIndex:1,offset:[0,0,0]}]},before=JSON.stringify(scene);
const a=project(scene,{flow:'build'},{manualID:2251}),b=project(scene,{flow:'build'},{manualID:2251});assert.equal(JSON.stringify(scene),before,'frame projection never accumulates in a cached scene');assert.deepEqual(a,b);assert.equal(a.instanceOffsets.length,5);assert.throws(()=>project(a,{flow:'build'},{manualID:2251}),/Conflicting/);
assert.strictEqual(project(scene,{flow:'upgrade'},{manualID:2251}),scene);assert.strictEqual(project(scene,{flow:'build'},{manualID:0}),scene);
for(const id of[565,482])assert(D.frame.offsetsMM[id][0]<0);for(const id of[376,480])assert(D.frame.offsetsMM[id][0]>0);
for(const name of['data','plan','scene','source'])assert.equal(fs.readFileSync(new URL(`../dist/original-rod-holder-${name}.js`,import.meta.url),'utf8'),fs.readFileSync(new URL(`../source/original-rod-holders/original-rod-holder-${name}.js`,import.meta.url),'utf8'),'preferred source and runtime match');
const sources=JSON.parse(fs.readFileSync(new URL('../source/original-rod-holders/SOURCES.json',import.meta.url)));
for(const [name,hash]of Object.entries(sources.runtimeSources))assert.equal(createHash('sha256').update(fs.readFileSync(new URL('../'+name,import.meta.url))).digest('hex'),hash,'source manifest identifies the actual current runtime');
console.log('PASS: Original 7 stages / 45 actions, mounted outward frame, upper/lower timing, authored handling labels, progress revision, rail coexistence and unchanged upgrade.');
