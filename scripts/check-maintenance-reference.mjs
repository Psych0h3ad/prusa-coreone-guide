import assert from 'node:assert/strict';
import {SERVICE_TASKS} from '../dist/maintenance-data.js';
import {MAINTENANCE_SOURCES} from '../dist/maintenance-sources.js';
import {resolveMaintenanceReference} from '../dist/maintenance-reference.js';
const rebuild=SERVICE_TASKS.find(task=>task.id==='hotend-rebuild');
const cases=[
 [0,'ja','https://help.prusa3d.com/guide/how-to-rebuild-the-nextruder-hotend_1080488#1089542',2,true],
 [2,'ja','https://help.prusa3d.com/guide/how-to-replace-a-hotend-assembly-core-one_385707#385914',4,true],
 [2,'cs','https://help.prusa3d.com/cs/guide/jak-vymenit-sestavu-hotendu-core-one_385707#385914',4,false],
 [14,'de','https://help.prusa3d.com/de/guide/auswechseln-der-hotend-baugruppe-core-one_385707#386155',11,false]
];
for(const[index,language,url,number,english]of cases){const reference=resolveMaintenanceReference(rebuild,index,language,MAINTENANCE_SOURCES);assert.equal(reference.url,url);assert.equal(reference.official.number,number);assert.equal(reference.english,english);assert.deepEqual(reference.images,rebuild.steps[index].sourcePhotos);}
const inline=rebuild.steps.filter(step=>new URL(step.source).pathname.endsWith('_385707'));assert.equal(inline.length,17);
for(const language of['ja','en','cs','de'])for(const step of inline){const index=rebuild.steps.indexOf(step),reference=resolveMaintenanceReference(rebuild,index,language,MAINTENANCE_SOURCES);assert(new URL(reference.url).pathname.endsWith('_385707'));assert.equal(new URL(reference.url).hash,'#'+step.officialId);assert.equal(reference.official.number,step.officialStep);}
const sensor=SERVICE_TASKS.find(task=>task.id==='internal-filament-sensor-replacement');assert.equal(sensor.steps.length,47);const reference=resolveMaintenanceReference(sensor,21,'ja',MAINTENANCE_SOURCES);assert.equal(reference.url,'https://help.prusa3d.com/guide/how-to-replace-nextruder-filament-sensor-core-one_922421#942418');assert.equal(reference.official.number,23);
console.log('PASS: official references follow all17inline stages in4languages; source numbers, fallback language and matching photographs remain connected.');

// Current official web sidebar includes its start card; PDFs number only instructions.
import {officialStepNumbers,officialReferenceNumbers} from '../dist/official-step-numbers.js';
import {sideIRSelection,setSideIRFamily,setSideIRCoverLength,setSideIRHandleLength} from '../dist/side-ir-service-state.js';
assert.deepEqual(officialStepNumbers(408991,'https://help.prusa3d.com/guide/how-to-replace-the-side-filament-sensor-core-one_408981'),{guideId:408981,instructionStep:1,webStep:2,language:'en'});
assert.equal(officialStepNumbers(408991,'https://help.prusa3d.com/guide/wrong_385707','https://help.prusa3d.com/guide/right_408981'),null,'A contradictory source URL must not inherit a number from another guide');
for(const id of ['hotend-heater','hotend-thermistor','chamber-thermistor']){const t=SERVICE_TASKS.find(t=>t.id===id),r=resolveMaintenanceReference(t,0,'ja',MAINTENANCE_SOURCES);assert.equal(r.numbering.format,'web');assert.equal(r.numbering.webStep,2);assert.equal(r.numbering.instructionStep,1);}
const selected=sideIRSelection();let webCases=0,pdfCases=0;
try{for(const family of ['r1-one','r1-two','plus']){setSideIRFamily(family);const t=SERVICE_TASKS.find(t=>t.id==='side-ir-replacement');for(let i=0;i<t.steps.length;i++)for(const lang of ['ja','en','cs','de']){const r=resolveMaintenanceReference(t,i,lang,MAINTENANCE_SOURCES);assert(r.numbering);if(typeof r.official.id==='number'){assert.equal(r.numbering.format,'web');assert.equal(new URL(r.url).hash,'#'+r.official.id);webCases++;}else{assert.equal(r.numbering.format,'pdf');assert([11,12].includes(r.numbering.instructionStep));assert.equal(r.numbering.pdfPage,11);assert.equal(new URL(r.url).hash,'#page=11');pdfCases++;}}}}finally{setSideIRFamily(selected.family);setSideIRCoverLength(selected.coverLength);setSideIRHandleLength(selected.handleLength);}
assert.equal(webCases,164);assert.equal(pdfCases,16);
assert.equal(officialReferenceNumbers({id:'page=11',source:'https://help.prusa3d.com/wp-content/uploads/generated/printer-maintenance_247_guide_408981_en_2026-05-13.pdf#page=11',number:999}),null,'PDF page membership does not validate an arbitrary step number');
console.log('PASS: official Web/PDF ordinals remain distinct; all3side-sensor choices and4languages retain their actual document anchors.');
