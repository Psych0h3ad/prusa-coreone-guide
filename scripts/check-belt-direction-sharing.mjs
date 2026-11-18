// SPDX-License-Identifier: MIT
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {SERVICE_TASKS} from '../dist/maintenance-data.js';
import {beltAdjustmentScene} from '../dist/belt-adjustment-model.js';
import {maintenanceShareIndex,maintenanceStepURL,readMaintenanceStepLink} from '../dist/maintenance-step-share.js';
import {operationAnchor,resolveShareOperation} from '../dist/step-share.js';

const base='https://psych0h3ad.github.io/prusa-coreone-guide/maintenance.html';
const task=SERVICE_TASKS.find(t=>t.id==='belts'),index=maintenanceShareIndex(SERVICE_TASKS),sid=index.get(task.id).rows[3].sid;
assert.ok(sid);let roundTrips=0;
for(const [language,li]of['ja','en','cs','de'].map((l,i)=>[l,i])){
 const actors=beltAdjustmentScene(task,3,a=>a[li]).plan.actors;
 for(const direction of['tighten','loosen'])for(let actor=0;actor<actors.length;actor++)for(const fraction of[0,.5,1]){
  const anchor=operationAnchor(actors,actor,fraction),url=maintenanceStepURL(base,{task:task.id,step:4,sid,view:'model',lang:language,beltDirection:direction,...anchor});
  const route=readMaintenanceStepLink(url,index),position=resolveShareOperation(new URL(url).searchParams,actors);
  assert.equal(route.valid,true);assert.equal(route.taskId,task.id);assert.equal(route.index,3);assert.equal(route.lang,language);assert.equal(route.view,'model');
  assert.equal(route.beltDirection,direction);assert.equal(position.index,actor);assert.equal(position.fraction,fraction);assert.equal(new URL(url).searchParams.get('action'),anchor.action);roundTrips++;
 }
}
const legacy=readMaintenanceStepLink(base+'?task=belts&step=4&view=model&lang=ja',index);
assert.equal(legacy.valid,true);assert.equal(legacy.beltDirection,'tighten');
for(const query of['beltDirection=','beltDirection=unknown','beltDirection=loosen&beltDirection=tighten'])assert.equal(readMaintenanceStepLink(base+'?task=belts&step=4&'+query,index).valid,false);
for(const context of[{task:'belts',step:3},{task:'panels',step:1}]){
 const url=maintenanceStepURL(base,{...context,view:'model',lang:'ja',beltDirection:'loosen'});
 assert.equal(new URL(url).searchParams.has('beltDirection'),false);
 const route=readMaintenanceStepLink(url,index);assert.equal(route.valid,true);assert.equal(route.beltDirection,undefined);
 assert.equal(readMaintenanceStepLink(url+'&beltDirection=loosen',index).valid,false);
}
assert.equal(roundTrips,48);
const html=fs.readFileSync(new URL('../dist/maintenance.html',import.meta.url),'utf8'),imports=JSON.parse(html.split('<script type="importmap">')[1].split('</script>')[0]).imports;
const entry=html.match(/data-guide-entry="([^"]+)"/)?.[1];assert.ok(entry);assert.equal(imports[entry]||entry,imports['./maintenance.js']);
console.log('PASS_BELT_DIRECTION_SHARING: 48 action-link round trips across four languages; legacy default, invalid/duplicate query, procedure scope and canonical bootstrap entry. Controller/browser execution is checked separately.');
