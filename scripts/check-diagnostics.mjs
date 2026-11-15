import assert from 'node:assert/strict';
import {
 DIAGNOSTIC_NODES as nodes, DIAGNOSTIC_SOURCES as sources,
 diagnosticTransition, diagnosticNodes
} from '../dist/maintenance-diagnostics.js';
import {SERVICE_TASKS as tasks} from '../dist/maintenance-data.js';

const languages=['ja','en','cs','de'];
const expectedTaskIds=[
 'belt-tensioner-pulley','belt-tensioner-left','belt-tensioner-right',
 'chamber-fan','chamber-thermistor','belts','clog','coldpull','coldpull-manual','debris','electronics','extruder','fans','feed-clear',
 'firmware-reflash','firmware-update','fragment','heatsink-ntc','heatsink-replacement','hotend','hotend-heater','hotend-thermistor','hotend-rebuild','internal-filament-sensor-replacement','side-ir-replacement',
 'hotend-clean','hotendfan','initial-setup','loveboard','nozzle',
 'motor-check','needle-clear','nozzle-tool','nozzle-tool-bare','panels','printfan','rail','rod',
 'sensor-clean','sensor-service','sensor-gearbox-recovery','sheet','xbuddy'
].sort();
// PG recovery follows actual separation during internal cleaning. Heater
// replacement is a selected component repair, not a recommendation to replace
// a heater for an unconfirmed symptom. These remain available in the task and
// official-guide catalogs without becoming generic diagnostic remedies.
const conditionalTaskIds=['belt-tensioner-pulley','belt-tensioner-left','belt-tensioner-right','chamber-thermistor','sensor-service','sensor-gearbox-recovery','hotend-heater','hotend-thermistor','heatsink-replacement','hotend-rebuild','internal-filament-sensor-replacement','xbuddy','side-ir-replacement'];
const diagnosticTaskIds=expectedTaskIds.filter(id=>!conditionalTaskIds.includes(id));
const taskById=new Map(tasks.map(task=>[task.id,task]));
assert.equal(taskById.size,tasks.length,'service task IDs are unique');
assert.deepEqual([...taskById.keys()].sort(),expectedTaskIds,'current 43 service tasks, including selected component replacement and conditional recovery procedures');

function textField(value,label){
 assert(Array.isArray(value)&&value.length===4,label+': four language slots');
 for(const [index,text] of value.entries()){
  assert(typeof text==='string'&&text.trim(),label+': nonempty '+languages[index]);
  assert(!/\b(?:TODO|TBD|placeholder|TRANSLATE)\b/i.test(text),label+': no placeholder');
  if(index)assert(!/[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u.test(text),label+': no Japanese fallback in '+languages[index]);
 }
}
function reachable(graph){
 const seen=new Set(),queue=['start'];
 while(queue.length){
  const id=queue.shift();if(seen.has(id))continue;
  assert(graph[id],'reachable node exists: '+id);seen.add(id);
  for(const choice of graph[id].choices||[])queue.push(choice.next);
 }
 return seen;
}
function topology(graph){
 return Object.fromEntries(Object.entries(graph).map(([id,node])=>[id,{
  choices:node.choices?.map(choice=>choice.next),sources:node.sources,
  tasks:node.tasks,inspection:node.inspection,observations:node.observations?.map(item=>item.url)
 }]));
}
let edges=0,observations=0,textFields=0;
for(const [id,node] of Object.entries(nodes)){
 for(const [field,value] of [['title',node.title],['body',node.body]]){
  textField(value,id+'.'+field);textFields++;
 }
 for(const [index,choice] of (node.choices||[]).entries()){
  textField(choice.title,id+'.choice.'+index);textFields++;edges++;
  assert(Object.hasOwn(nodes,choice.next),id+': destination exists');
 }
 for(const source of node.sources||[]){
  assert(Object.hasOwn(sources,source),id+': source key exists');
  const url=new URL(sources[source]);
  assert.equal(url.protocol,'https:',id+': HTTPS source');
  assert(['help.prusa3d.com','www.prusa3d.com'].includes(url.hostname),id+': official remedy source');
 }
 for(const task of node.tasks||[])assert(taskById.has(task),id+': live task '+task);
 if(node.inspection){
  const task=taskById.get(node.inspection.task),step=task?.steps[node.inspection.step];
  assert(Number.isInteger(node.inspection.step)&&node.inspection.step>=0,id+': valid inspection index');
  assert(step?.refs?.length,id+': real inspection geometry');
  assert(task.id==='clog'||step.inspection,id+': inspection cannot launch an installation animation');
 }
 for(const [index,item] of (node.observations||[]).entries()){
  textField(item.title,id+'.observation.'+index+'.title');
  textField(item.body,id+'.observation.'+index+'.body');textFields+=2;observations++;
  const url=new URL(item.url);
  assert.equal(url.protocol,'https:');assert.equal(url.hostname,'forum.prusa3d.com','community report stays separate from official instructions');
 }
}
for(const language of languages){
 const graph=diagnosticNodes(language),seen=reachable(graph),offered=new Set();
 assert.deepEqual(topology(graph),topology(nodes),language+': identical history, sources, observations and task/inspection topology');
 assert.equal(seen.size,Object.keys(graph).length,language+': no unreachable nodes');
 for(const id of seen){
  for(const task of graph[id].tasks||[])offered.add(task);
  if(graph[id].inspection)offered.add(graph[id].inspection.task);
 }
 assert.deepEqual([...offered].sort(),diagnosticTaskIds,language+': every applicable diagnostic remedy is reachable; advanced procedures remain conditional');
}
assert.equal(Object.keys(nodes).length,81,'inventory: 71 original checks, five nozzle selectors, four completion-route checks and one confirmed chamber-fan replacement');

// These paths are independently specified user scenarios, not paths generated
// from the graph under test. Each must work in every language and while changing
// language at every answer.
const criticalPaths=[
 ['start','error-kind','fan-kind','chamber-fan-check','chamber-fan-replace','resolved'],
 ['start','loading-direction','location','gear','fragment-check','fragment','flow'],
 ['start','loading-direction','unloading','fragment-check','hotend-path','blocked','blocked-remedy'],
 ['start','loading-direction','obstruction','sensor-test','support'],
 ['start','loading-direction','supply','location'],
 ['start','loading-direction','path','gear','gear-stuck','support'],
 ['start','print-flow','flow','partial','coldpull-compatibility','coldpull-method','coldpull-ready','resolved'],
 ['start','print-flow','flow','partial','coldpull-compatibility','coldpull-method','manual-coldpull-ready','blocked'],
 ['start','print-flow','flow','partial','nonhf-needle','hotend-path'],
 ['start','loading-direction','path','gear','motor-check-ready','gear-stuck','support'],
 ['start','print-flow','flow','partial','coldpull-compatibility','nozzle-other','support'],
 ['start','print-flow','flow','blocked','blocked-remedy','nozzle-method','nozzle-standard'],
 ['start','print-flow','flow','print-settings','support'],
 ['start','print-flow','flow-check','flow'],
 ['start','print-flow','time-dependent','ventilation','fan-kind'],
 ['start','print-flow','hotend-seating','nozzle-method','nozzle-tool-variant','nozzle-tool-sock'],
 ['start','print-flow','hotend-seating','nozzle-method','nozzle-tool-variant','nozzle-tool-bare'],
 ['start','print-flow','hotend-seating','nozzle-method','nozzle-tool-variant','nozzle-standard'],
 ['start','print-flow','hotend-seating','nozzle-method','nozzle-tool-variant','support'],
 ['start','print-flow','hotend-seating','nozzle-method','other-configuration','support'],
 ['start','movement','xy-motion','belt-method','belt-acoustic'],
 ['start','movement','xy-motion','belt-method','belt-wizard'],
 ['start','movement','noise','fans','support'],
 ['start','movement','noise','axes','resolved'],
 ['start','sensor-kind','side-sensor','support'],
 ['start','sensor-kind','sensor-test','location'],
 ['start','first-layer','sheet-check','nozzle-clean-test','hotend-seating'],
 ['start','first-layer','loadcell','support'],
 ['start','error-kind','chamber-temperature','chamber-cold','chamber-fan-check'],
 ['start','error-kind','chamber-temperature','chamber-hot','support'],
 ['start','error-kind','hotend-temperature','hotend-service','resolved'],
 ['start','error-kind','hotend-temperature','heatsink-service','support'],
 ['start','error-kind','bed-temperature','support'],
 ['start','error-kind','fan-kind','print-fan-check','resolved'],
 ['start','error-kind','fan-kind','hotend-fan-check','resolved'],
 ['start','error-kind','electrical','board-service','support'],
 ['start','startup','selftest-kind','loadcell'],
 ['start','startup','setup-guide','selftest-kind','sensor-kind'],
 ['start','startup','ui-stopped','support'],
 ['start','startup','firmware-service','firmware-update-guide','resolved'],
 ['start','startup','firmware-service','firmware-reflash-guide','support'],
 ['start','routine','routine-clean','resolved'],
 ['start','routine','lubrication','resolved'],
 ['start','routine','routine-head','support'],
 ['start','other-configuration','support']
];
function walk(route,languageAt){
 let history=[route[0]];
 for(let index=1;index<route.length;index++){
  const saved=[...history],graph=diagnosticNodes(languageAt(index-1));
  const next=diagnosticTransition(history,route[index],graph);
  assert.notEqual(next,history,'valid scenario: '+route[index-1]+' -> '+route[index]);
  assert.deepEqual(history,saved,'transition does not mutate retained history');
  history=next;
 }
 assert.deepEqual(history,route,'complete scenario history');
}
for(const route of criticalPaths){
 for(const language of languages)walk(route,()=>language);
 for(let offset=0;offset<languages.length;offset++)walk(route,index=>languages[(index+offset)%languages.length]);
}
for(const language of languages){
 const graph=diagnosticNodes(language);
 for(const [from,to] of [
  ['start','location'],['start','flow'],['start','nozzle-tool-sock'],
  ['blocked','coldpull-ready'],['blocked','coldpull-compatibility'],
  ['partial','coldpull-ready'],['nozzle-other','coldpull-ready'],
  ['coldpull-compatibility','coldpull-ready'],['blocked','manual-coldpull-ready'],
  ['gear-stuck','motor-check-ready'],
  ['nozzle-method','nozzle-tool-sock'],['nozzle-method','nozzle-tool-bare'],
  ['hotend-temperature','heatsink-ntc'],['print-flow','heatsink-service'],
  ['sheet-check','heatsink-service'],['start','not-a-node']
 ]){
  const history=[from],saved=[...history];
  assert.equal(diagnosticTransition(history,to,graph),history,language+': cannot bypass an observation or condition: '+from+' -> '+to);
  assert.deepEqual(history,saved,'rejected transition leaves history unchanged');
 }
}

function expectedChoices(graph,id,targets){
 assert.deepEqual(graph[id].choices?.map(choice=>choice.next),targets,id+': independently specified decision branches');
}
function expectedTasks(graph,id,ids){
 assert.deepEqual(graph[id].tasks||[],ids,id+': applicable procedures only');
}
function translatedPatterns(graph,id,field,patterns){
 for(let index=0;index<4;index++){
  for(const pattern of [].concat(patterns[index]))assert.match(graph[id][field][index],pattern,id+'.'+field+': '+languages[index]+' retains the condition');
 }
}
function choiceCondition(graph,id,index,next,patterns){
 assert.equal(graph[id].choices[index].next,next,id+': condition leads to its remedy');
 for(let language=0;language<4;language++)assert.match(graph[id].choices[index].title[language],patterns[language],id+': translated choice condition '+languages[language]);
}
function checkCriticalSafety(graph){
 expectedChoices(graph,'flow',['partial','blocked','print-settings','flow-check']);
 choiceCondition(graph,'flow',0,'partial',[/少しは出る/,/Some exits/i,/Trochu vychází/,/Etwas tritt aus/]);
 choiceCondition(graph,'flow',1,'blocked',[/まったく出ない/,/Nothing exits/i,/Nevychází nic/,/Es tritt nichts aus/]);
 for(const id of ['partial','blocked','coldpull-compatibility','coldpull-method','nozzle-other','gear-stuck','hotend-path','nozzle-method','nozzle-tool-variant'])expectedTasks(graph,id,[]);
 expectedTasks(graph,'coldpull-ready',['coldpull']);
 expectedTasks(graph,'blocked-remedy',['feed-clear']);
 expectedTasks(graph,'fragment',['fragment']);
 expectedTasks(graph,'print-settings',[]);
 expectedChoices(graph,'coldpull-compatibility',['coldpull-method','nozzle-other','blocked']);
 choiceCondition(graph,'coldpull-compatibility',0,'coldpull-method',[/Nozzle Xではなく/,/not Nozzle X/,/není to Nozzle X/,/keine Nozzle X/]);
 expectedChoices(graph,'coldpull-method',['coldpull-ready','manual-coldpull-ready']);
 expectedTasks(graph,'manual-coldpull-ready',['coldpull-manual']);
 expectedTasks(graph,'nonhf-needle',['needle-clear']);
 expectedTasks(graph,'motor-check-ready',['motor-check']);
 translatedPatterns(graph,'coldpull-method','body',languages.map(()=>[/270\s*°C/,/100\s*°C/]));
 translatedPatterns(graph,'nonhf-needle','body',[
  [/非HF/,/HFや種類不明なら針を入れません/],
  [/non-HF/,/Do not insert a needle into HF or unidentified nozzles/],
  [/bez HF/,/Do HF trysky ani neznámého typu jehlu nezavádějte/],
  [/Nicht-HF/,/Keine Nadel in HF-Düsen oder unbekannte Typen einführen/]
 ]);
 for(const [id,node] of Object.entries(graph)){
  assert(!(node.tasks||[]).some(task=>conditionalTaskIds.includes(task)),id+': advanced internal cleaning and conditional PG recovery are not generic diagnostic recommendations');
 }
 choiceCondition(graph,'coldpull-compatibility',1,'nozzle-other',[/Nozzle X・種類が不明/,/Nozzle X, unknown type/,/Nozzle X, neznámý typ/,/Nozzle X, unbekannter Typ/]);
 translatedPatterns(graph,'blocked','body',[
  /完全に出ない状態でコールドプルを始めない/,
  /Do not start a cold pull when nothing can be extruded/i,
  /Pokud materiál vůbec nevychází, nezačínejte cold pull/,
  /Bei vollständig fehlender Extrusion keinen Cold Pull beginnen/
 ]);
 translatedPatterns(graph,'coldpull-compatibility','body',[
  [/Nozzle Xには使いません/,/HFノズルには清掃針を入れません/],
  [/Do not use it with Nozzle X/,/Do not insert a cleaning needle into an HF nozzle/],
  [/Nepoužívejte jej s Nozzle X/,/Do HF trysky nezavádějte čisticí jehlu/],
  [/Nicht bei Nozzle X anwenden/,/Keine Reinigungsnadel in eine HF-Düse einführen/]
 ]);
 expectedChoices(graph,'fragment-check',['fragment','hotend-path','hotend-path','tube','gear-stuck']);
 choiceCondition(graph,'fragment-check',0,'fragment',[/先端をつかめる/,/can grip its end/,/konec lze uchopit/,/Ende ist greifbar/]);
 choiceCondition(graph,'fragment-check',1,'hotend-path',[/つかめない/,/not grippable/,/nelze jej uchopit/,/nicht greifbar/]);

 // A generic heating error must not recommend the wrong temperature sensor.
 expectedTasks(graph,'hotend-temperature',['electronics']);
 expectedTasks(graph,'heatsink-service',['heatsink-ntc']);
 expectedTasks(graph,'hotend-service',['hotend']);
 assert.deepEqual(graph['heatsink-service'].sources,['heatsinkNtc']);
 assert.deepEqual(graph['hotend-temperature'].sources,['hotendMin','runaway']);
 assert.deepEqual(graph['bed-temperature'].sources,['bedTemp','overcurrent']);
 choiceCondition(graph,'hotend-temperature',1,'heatsink-service',[/ヒートシンクNTCの交換を案内された/,/was advised.*heatsink NTC/,/doporučena výměna NTC chladiče/,/Kühlkörper-NTC wurde empfohlen/]);
 expectedChoices(graph,'heatsink-service',['resolved','support']);
 translatedPatterns(graph,'heatsink-service','body',[
  [/別の部品/,/確認できた場合だけ/],
  [/different parts/,/only when.*confirmed/],
  [/různé díly/,/jen při potvrzené výměně/],
  [/verschiedene Teile/,/nur bei bestätigtem Austausch/]
 ]);

 // Nozzle/jig tasks have exactly one entry, after the method/variant decision.
 expectedChoices(graph,'nozzle-method',['nozzle-standard','nozzle-tool-variant','hotend-service','other-configuration']);
 expectedChoices(graph,'nozzle-tool-variant',['nozzle-tool-sock','nozzle-tool-bare','nozzle-standard','support']);
 choiceCondition(graph,'nozzle-method',1,'nozzle-tool-variant',[/適合する公式交換治具を用意している/,/prepared the matching official tool/,/připravený odpovídající oficiální přípravek/,/Passendes offizielles Werkzeug ist vorbereitet/]);
 choiceCondition(graph,'nozzle-tool-variant',0,'nozzle-tool-sock',[/ソックあり.*治具を用意した/,/Sock fitted; matching tool prepared/,/Návlek nasazen;.*přípravek připraven/,/Socke montiert;.*Werkzeug vorbereitet/]);
 choiceCondition(graph,'nozzle-tool-variant',1,'nozzle-tool-bare',[/ソックなし.*治具を用意した/,/Bare block; matching tool prepared/,/Holý blok;.*přípravek připraven/,/Ohne Socke;.*Werkzeug vorbereitet/]);
 for(const [id,task] of [['nozzle-standard','nozzle'],['nozzle-tool-sock','nozzle-tool'],['nozzle-tool-bare','nozzle-tool-bare']]){
  expectedTasks(graph,id,[task]);
  const owners=Object.entries(graph).filter(([,node])=>node.tasks?.includes(task)).map(([key])=>key).sort();
  assert.deepEqual(owners,[id],task+': cannot appear before its explicit method selection');
 }
 for(const id of ['nozzle-tool-sock','nozzle-tool-bare']){
  const incoming=Object.entries(graph).filter(([,node])=>node.choices?.some(choice=>choice.next===id)).map(([key])=>key);
  assert.deepEqual(incoming,['nozzle-tool-variant'],id+': no automatic or unrelated entry');
 }
 assert.equal(taskById.get('nozzle-tool').nozzleTool.sock,true,'sock task matches the real maintenance variant');
 assert.equal(taskById.get('nozzle-tool-bare').nozzleTool.sock,false,'bare task matches the real maintenance variant');
 translatedPatterns(graph,'nozzle-method','body',languages.map(()=>[/HT Hotend/,/V6/]));
 translatedPatterns(graph,'nozzle-tool-variant','body',[
  [/完全に室温まで冷ましてから装着/,/加熱・印刷前に治具を外します/],
  [/Cool fully to room temperature before fitting/,/remove the tool before heating or printing/],
  [/Před nasazením nechte zcela vychladnout na pokojovou teplotu/,/před ohřevem nebo tiskem přípravek sejměte/],
  [/Vor Anbringen vollständig auf Raumtemperatur abkühlen lassen/,/vor Heizen oder Drucken Werkzeug entfernen/]
 ]);
 translatedPatterns(graph,'nozzle-standard','body',[
  [/通常の1本ネジ/,/初期型の2本ネジ/],
  [/one standard screw/,/two on early printers/],
  [/jeden běžný šroub/,/dva u raných tiskáren/],
  [/eine Standardschraube/,/frühen Druckern zwei Schrauben/]
 ]);

 // Retain the old suite's distinct sensor, belt and chamber/fan decisions.
 assert.deepEqual(graph['chamber-cold'].sources,['chamberLow']);
 assert.deepEqual(graph['chamber-hot'].sources,['chamberHigh']);
 expectedTasks(graph,'belt-acoustic',['belts']);expectedTasks(graph,'belt-wizard',[]);
 translatedPatterns(graph,'belt-acoustic','body',[
  /X右端・Y最前部/,/X fully right and Y fully forward/,
  /X zcela doprava a Y zcela dopředu/,/X ganz rechts und Y ganz vorn/
 ]);
 translatedPatterns(graph,'belt-wizard','body',languages.map(()=>/Settings → Manual Belt Tuning/));
 expectedTasks(graph,'print-fan-check',['fans','printfan']);
 expectedTasks(graph,'hotend-fan-check',['fans','hotendfan']);
 expectedTasks(graph,'chamber-fan-check',['fans','electronics']);
 expectedTasks(graph,'chamber-fan-replace',['chamber-fan']);
 assert.deepEqual(Object.entries(graph).filter(([,node])=>node.tasks?.includes('chamber-fan')).map(([id])=>id),['chamber-fan-replace'],'chamber fan replacement requires its confirmed repair route');
 choiceCondition(graph,'chamber-fan-check',0,'chamber-fan-replace',[/交換が必要と確認/,/confirmed necessary/,/potvrzena jako nutná/,/notwendig bestätigt/]);
 assert.deepEqual(Object.entries(graph).filter(([,node])=>node.choices?.some(c=>c.next==='chamber-fan-replace')).map(([id])=>id),['chamber-fan-check'],'no unrelated or automatic chamber-fan repair entry');
 assert.deepEqual(graph['chamber-fan-replace'].sources,['chamberFanReplacement']);
 assert.equal(graph['chamber-fan-replace'].taskSteps['chamber-fan'],0,'open the complete repair from its beginning');
 const inspectionCases=[
  ['supply',0,['sensorBody','sensorCover','sensorLever']],
  ['side-sensor',0,['sensorBody','sensorCover','sensorLever']],
  ['obstruction',1,[817]],['sensor-test',1,[817]],
  ['gear',2,['pgAssembly','idlerBearing1','idlerBearing2']],
  ['fragment-check',3,['regionTube','regionHeatbreak']],
  ['hotend-path',3,['regionTube','regionHeatbreak']],
  ['flow',4,['regionTip']]
 ];
 for(const [id,index,refs] of inspectionCases){
  assert.deepEqual(graph[id].inspection,{task:'clog',step:index},id+': independently expected inspection area');
  const actual=taskById.get('clog').steps[index].refs;
  for(const ref of refs)assert(actual.includes(ref),id+': required inspection geometry '+ref);
 }
}
for(const language of languages)checkCriticalSafety(diagnosticNodes(language));

// Independent article IDs catch accidental source swaps despite valid URLs.
for(const [key,id] of Object.entries({
 chamberFanReplacement:944814,clog:411823,obstruction:916795,stuck:690089,sensor:465702,care:829710,
 cold:930551,nozzleTypes:928993,nozzleMethods:734706,heatsinkNtc:922429,
 hotendMin:401189,runaway:401076,seating:821168
}))assert(new URL(sources[key]).pathname.endsWith('_'+id),key+': correct official article/guide');
assert.deepEqual(Object.entries(nodes).filter(([,node])=>node.observations?.length).map(([id])=>id).sort(),['blocked-remedy','fragment-check','gear']);
assert.equal(observations,3,'all three retained community observations');
translatedPatterns(nodes,'gear','body',languages.map(()=>/PG-assembly-adapter/));

// Exercise the safety assertions against plausible regressions, in memory
// only. None of these mutations is written to a product or evidence file.
const regressions=[
 ['unconfirmed chamber fan sent to replacement',graph=>{graph['chamber-fan-check'].tasks.push('chamber-fan');}],
 ['chamber replacement skips confirmation',graph=>{graph['chamber-fan-check'].choices[0].title[1]='Replace immediately';}],
 ['full-clog prohibition removed',graph=>{graph.blocked.body[1]=graph.blocked.body[1].replace('Do not start a cold pull','Start a cold pull');}],
 ['Nozzle X sent directly to cold pull',graph=>{graph['coldpull-compatibility'].choices[1].next='coldpull-ready';}],
 ['cold pull offered before checking complete blockage',graph=>{graph.blocked.tasks=['coldpull'];}],
 ['manual cold pull offered for complete blockage',graph=>{graph.blocked.tasks=['coldpull-manual'];}],
 ['HF needle prohibition removed',graph=>{graph['nonhf-needle'].body[1]=graph['nonhf-needle'].body[1].replace('Do not insert a needle into HF','Insert a needle into HF');}],
 ['manual cold-pull procedure swapped',graph=>{graph['manual-coldpull-ready'].tasks=['coldpull'];}],
 ['conditional PG recovery offered for a generic sensor symptom',graph=>{graph['sensor-test'].tasks=['sensor-gearbox-recovery'];}],
 ['wrong temperature-sensor replacement',graph=>{graph['heatsink-service'].tasks=['hotend'];}],
 ['tool task offered before variant selection',graph=>{graph['nozzle-tool-variant'].tasks=['nozzle-tool'];}],
 ['sock and bare tasks swapped',graph=>{graph['nozzle-tool-sock'].tasks=['nozzle-tool-bare'];}],
 ['prepared-tool condition removed',graph=>{graph['nozzle-method'].choices[1].title[1]='I have no tool';}],
 ['ungrippable fragment sent to pliers procedure',graph=>{graph['fragment-check'].choices[1].next='fragment';}],
 ['printer belt wizard sent to acoustic task',graph=>{graph['belt-wizard'].tasks=['belts'];}],
 ['cold chamber sent to overheating source',graph=>{graph['chamber-cold'].sources=['chamberHigh'];}]
];
for(const [label,mutate] of regressions){
 const graph=structuredClone(nodes);mutate(graph);
 assert.throws(()=>checkCriticalSafety(graph),{name:'AssertionError'},'detect regression: '+label);
}

console.log('PASS: '+Object.keys(nodes).length+' shared diagnostic nodes, '+languages.length+' languages, '+edges+' choice edges, '+expectedTaskIds.length+' real tasks, '+textFields+' complete text fields and '+observations+' community observations.');
console.log('PASS: '+criticalPaths.length+' independent critical paths in each language and '+criticalPaths.length*4+' rotating-language history cases; safety, official-source and inspection mappings verified.');
console.log('PASS: '+regressions.length+' in-memory unsafe-regression probes rejected. Diagnostic scope only; no browser rerun or physical-repair acceptance.');
