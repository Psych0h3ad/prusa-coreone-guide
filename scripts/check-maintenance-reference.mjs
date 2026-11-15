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
