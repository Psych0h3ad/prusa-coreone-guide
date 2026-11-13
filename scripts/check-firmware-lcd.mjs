import assert from 'node:assert/strict';
import fs from 'node:fs';
import {FIRMWARE_UI} from '../dist/firmware-ui-data.js';
import {FirmwareLCDState} from '../dist/firmware-lcd-state.js';
let routes=0,checks=0;
const atlas=JSON.parse(fs.readFileSync('dist/assets/firmware-ui/atlas.json','utf8'));
for(const [version,fw] of Object.entries(FIRMWARE_UI.versions)){
 for(const [name,path]of Object.entries(fw.paths)){
  const state=new FirmwareLCDState(fw,path);
  for(let depth=0;depth<=path.length;depth++){
   state.goto(depth);assert.equal(state.depth,depth,version+':'+name+':'+depth);checks++;
  }
  assert.ok(state.arrived);if(state.editing){state.back();assert.equal(state.editing,null);}if(state.operation){state.back();assert.equal(state.operation,null);assert.equal(state.operationResult,'closed');}state.back();assert.ok(!state.arrived);routes++;
 }
 assert.equal(fw.paths.heat.at(-1),'Nozzle Temperature');
 assert.equal(fw.menus.printhead.title,'PRINTHEAD');
 assert.deepEqual(fw.menus.control.items.map(r=>r.key).slice(0,4),version==='8.0.0'?['Return','Set Ready','Temperature & Fans','Auto Home']:['Return','Move Axis','Temperature','Auto Home']);
 assert.equal(fw.menus.tests.items[2].key,'Fan Test');assert.equal(fw.menus.tests.items[2].number,2);
 for(const [kind,font]of Object.entries(atlas[version].fonts)){
  assert.ok(fs.existsSync(`dist/assets/firmware-ui/${version}/${font.file}`));
  if(kind==='large')continue;
  for(const text of Object.values(fw.labels).flatMap(t=>Object.values(t)))for(const char of text){assert.ok(font.characters.includes(char),version+' missing '+char);checks++;}
 }
 const state=new FirmwareLCDState(fw,fw.paths.heat);state.goto(3);assert.ok(state.editing);
 state.key('clear');for(const k of '250')state.key(k);state.key('ok');assert.equal(state.values['temperature:Nozzle Temperature'],250);assert.equal(state.editing,null);
 state.activate(state.menu.items.findIndex(r=>r.key==='Nozzle Temperature'));state.editing.text='999';state.key('ok');assert.ok(state.editing,'Reject out-of-range input');state.editing.text='250.5';state.key('ok');assert.ok(state.editing,'Integer temperature entry');state.key('cancel');assert.equal(state.values['temperature:Nozzle Temperature'],250);
 state.goto(3);assert.equal(state.editing.focus,'0');state.rotate(1);assert.equal(state.editing.focus,'ok');assert.equal(state.editing.text,'250','Knob changes key focus, not numeric value');
 state.reset();state.rotate(-999);assert.equal(state.selected,0);state.rotate(999);assert.equal(state.selected,state.menu.items.length-1);
 const before=JSON.stringify(fw);state.goto(2);state.reset();assert.equal(JSON.stringify(fw),before,'Immutable generated firmware data');
}
assert.ok(!('8.0.1' in FIRMWARE_UI.versions),'XL/MINI-only release must not be advertised for COREONE');
console.log(`PASS firmware LCD: ${routes} routes, ${checks} checks; bitmap coverage, version-specific order, return paths, numeric range and immutable data.`);
