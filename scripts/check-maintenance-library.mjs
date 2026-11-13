import assert from 'node:assert/strict';
import {OFFICIAL_MAINTENANCE_JA as catalog}from '../dist/official-maintenance-ja.js';
import {findOfficialGuides as find}from '../dist/maintenance-library.js';
import {SERVICE_TASKS as tasks}from '../dist/maintenance-data.js';
import {guideText,groupText,libraryCount}from '../dist/maintenance-library-locales.js';
assert.equal(catalog.guides.length,new Set(catalog.guides.map(g=>g.id)).size,'unique source IDs');
for(const g of catalog.guides){
 const url=new URL(g.url);assert.equal(url.hostname,'help.prusa3d.com');assert.equal(url.protocol,'https:');assert(url.pathname.endsWith('_'+g.id));
 assert(catalog.groups.some(x=>x.id===g.group));assert(g.title.trim()&&g.search.trim());
 for(const id of g.tasks||[])assert(tasks.some(t=>t.id===id),`${g.id}: real procedure`);
}
const linked=new Set(catalog.guides.flatMap(g=>g.tasks||[]));
const reachable=new Set(linked),queue=[...linked];
for(let i=0;i<queue.length;i++)for(const id of tasks.find(t=>t.id===queue[i]).steps.flatMap(s=>s.related||[])){
 assert(tasks.some(t=>t.id===id),'related link opens a real task');
 if(!reachable.has(id)){reachable.add(id);queue.push(id);}
}
assert.deepEqual([...reachable].sort(),tasks.map(t=>t.id).sort(),'all current procedures reachable from a matching official guide and its related procedures');
assert(tasks.find(t=>t.id==='sensor-clean').steps.some(s=>s.related?.includes('sensor-service')),'advanced cleaning is reachable after normal sensor checks');
assert(tasks.find(t=>t.id==='sensor-service').steps.some(s=>s.related?.includes('sensor-gearbox-recovery')),'separated PG recovery remains a conditional branch');
assert.equal(find({query:'ＬｏｖｅＢｏａｒｄ'})[0].id,'958922','full-width Latin input matches');
assert.deepEqual(find({query:'HT ノズル'}),[],'HT guides excluded from standard equipment by default');
assert(find({query:'HT ノズル',extras:true}).some(g=>g.id==='1218972'));
assert(find({query:'チャンバー ファン'}).some(g=>g.id==='944814'));
assert(find({query:'メインケーブル'}).some(g=>g.id==='1075162'));
assert(find({query:'31117'}).some(g=>g.id==='862005'));
assert(find({query:'ベルト'}).some(g=>g.tasks?.includes('belts')),'adjustment accessible alongside replacement');
assert(find({query:'詰まり'}).some(g=>g.tasks?.includes('fragment')),'fragment procedure remains accessible');
assert.deepEqual(catalog.guides.find(g=>g.id==='922421').tasks,undefined,'sensor cleaning is not relabelled as sensor replacement');
assert.deepEqual(catalog.guides.find(g=>g.id==='908859').tasks,undefined,'unreviewed xBuddy scene stays out of task navigation');
assert(find({group:'cooling'}).every(g=>g.group==='cooling'));
assert(find().every(g=>!g.equipment));
assert.equal(find({query:'<script>alert(1)</script>'}).length,0);
assert.equal(find({extras:true}).length,catalog.guides.length);
// Both tool configurations must be selectable alongside the two existing
// replacement methods, without relabeling the ordinary guide as the jig guide.
const methodIds=['nozzle','hotend','nozzle-tool','nozzle-tool-bare'];
for(const id of methodIds)assert(find({query:'ノズル'}).some(g=>g.tasks?.includes(id)),`${id}: discoverable through the nozzle source library`);
assert.deepEqual([...catalog.guides.find(g=>g.id==='734706').tasks].sort(),[...methodIds].sort(),'the official methods overview links all four working choices');
assert.deepEqual(catalog.guides.find(g=>g.id==='821168').tasks,['nozzle'],'ordinary removal guide keeps its own task identity');
assert.deepEqual(catalog.guides.find(g=>g.id==='385707').tasks,['hotend'],'whole-hotend guide keeps its own task identity');
for(const id of methodIds){const entry=tasks.find(t=>t.id===id).steps[0];for(const other of methodIds.filter(other=>other!==id))assert(entry.related.includes(other),`${id}: the other replacement methods can be selected in-app`);}
for(const language of ['ja','en','cs','de']){
 const guides=find({language,extras:true});
 assert.deepEqual(guides.map(g=>g.id),catalog.guides.map(g=>g.id),'localization preserves source identity and ordering');
 assert.equal(find({language}).length,43,'optional hardware stays opt-in');
 assert.equal(find({language,group:'accessories',extras:true}).length,9);
 assert.equal(find({language,query:'31117'})[0].id,'862005','error numbers work in every language');
 for(const g of guides){
  const text=guideText(g,language);assert(text.title.trim());
  if(language!=='ja')assert(!/[\u3040-\u30ff\u3400-\u9fff]/u.test(text.title+(text.note||'')+(text.equipment||'')),'translated row has no Japanese fallback');
 }
 for(const group of catalog.groups)assert(groupText(group,language).trim());
}
for(const [language,query,id]of [['en','side filament','408981'],['cs','bocniho','408981'],['de','lufter','922413'],['en','基板','908859']])assert(find({language,query}).some(g=>g.id===id),`${language}: localized, accent-insensitive and original search terms`);
assert.deepEqual(find({language:'unsupported',query:'ノズル'}).map(g=>g.id),find({language:'ja',query:'ノズル'}).map(g=>g.id),'unknown search locale uses Japanese');
assert.equal(libraryCount(1,'cs'),'1 návod');assert.equal(libraryCount(4,'cs'),'4 návody');assert.equal(libraryCount(9,'cs'),'9 návodů');
console.log(`PASS: ${catalog.guides.length} source-linked references in four languages; ${linked.size} direct and ${reachable.size} reachable procedures; optional equipment and localized search.`);
