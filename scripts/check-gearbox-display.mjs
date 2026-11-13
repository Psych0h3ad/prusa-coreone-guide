import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {GEARBOX_TEXT,GEARBOX_BUTTONS,GEARBOX_PICTURES,gearboxPhases,gearboxTextBlocks} from '../dist/firmware-gearbox.js';
import {lcdButtonRects,lcdLines} from '../dist/firmware-lcd-layout.js';
import {SERVICE_TASKS} from '../dist/maintenance-data.js';
import {firmwareFrames} from '../dist/firmware-step-guide.js';

const setup=SERVICE_TASKS.find(t=>t.id==='initial-setup'),step=setup.steps.find(s=>s.officialStep===11);
const atlas=JSON.parse(fs.readFileSync('dist/assets/firmware-ui/atlas.json'));
const data=JSON.parse(fs.readFileSync('dist/assets/firmware-ui/gearbox.json'));
const digest=file=>createHash('sha256').update(fs.readFileSync(file)).digest('hex');
let screens=0,drawnGlyphs=0,unchangedDiagrams=0;
for(const version of ['6.5.7','8.0.0']){
 const source=fs.readFileSync(`research/quality/service-20261107-135/firmware-source/${version}/src/feature/gearbox_alignment/screen_gearbox_alignment.cpp`,'utf8');
 for(const text of Object.values(GEARBOX_TEXT))assert(source.includes(`_("${text}")`),'display text comes from the selected native source');
 for(const condition of ['unknown','loaded','empty']){
  const phases=firmwareFrames(setup,step,version,{gearboxCase:condition}).filter(f=>f.kind==='gearbox').map(f=>f.phase);
  assert.deepEqual(phases,gearboxPhases(condition));
  assert.equal(phases.filter(p=>p.startsWith('filament_')).length,condition==='empty'?0:1,'mutually exclusive prompts are never shown together');
 }
 for(const language of ['ja','en','cs','de'])for(const phase of Object.keys(GEARBOX_TEXT)){
  const label=key=>{assert(data[version].labels[key]?.[language],'native translation exists');return data[version].labels[key][language];};
  const blocks=gearboxTextBlocks(phase,version,label),buttons=lcdButtonRects(GEARBOX_BUTTONS[phase],label,{x:6,y:278,w:468,h:32});
  assert(GEARBOX_TEXT[phase].includes('1.5')=== (phase==='loosen_screws'));
  for(const b of [...blocks,...buttons.map(b=>({...b,text:label(b.key),font:'big'}))]){
   const font=atlas[version].fonts[b.font],lines=lcdLines(b.text,Math.floor(b.w/font.width));
   assert(lines.length*font.height<=b.h,`${version}/${language}/${phase}: native text is not clipped`);
   for(const char of b.text){assert(font.characters.includes(char),'native glyph exists: '+char);drawnGlyphs++;}
   assert(b.x>=0&&b.y>=0&&b.x+b.w<=480&&b.y+b.h<=320);
  }
  assert.equal(buttons.length,phase==='alignment'?0:GEARBOX_BUTTONS[phase].length,'alignment cannot pretend to offer a continue button');
  screens++;
 }
 for(const name of Object.values(GEARBOX_PICTURES)){
  const file=`transmission_${name}_187x175.png`;
  assert.equal(digest(`dist/assets/firmware-ui/${version}/${file}`),digest(`research/quality/service-20261107-134/firmware/${version}/${file}`),'native pictograms remain byte-identical');unchangedDiagrams++;
 }
}
assert.throws(()=>gearboxPhases('assumed-calibrated'));
assert.equal(setup.steps.length,13);
for(const s of setup.steps){
 assert(!s.body[0].split('\n').some(line=>/^[A-Za-z][A-Za-z ',.:-]{15,}$/.test(line)),'Japanese setup has no untranslated English instructions');
 assert.equal(new URL(s.source).hostname,'help.prusa3d.com');
}
assert(setup.steps[0].body[0].includes('M3×30')&&setup.steps[0].body[0].includes('かじり'),'belt preparation and the source warning are retained');
assert(setup.steps[7].body[0].includes('高温')&&setup.steps[7].body[0].includes('動く'),'selftest cautions include both heat and motion');
assert(setup.steps[11].body[0].includes('ON'),'filament sensor manual switch is checked');
assert(!setup.steps[8].body[0].includes('手を近づけ'),'door position is not confused with a proximity gesture');
assert(setup.steps[4].body.every(s=>/版|version|verzi|Firmwareversion/.test(s)),'startup always checks the installed firmware version');
console.log(JSON.stringify({status:'PASS',screens,drawnGlyphs,unchangedDiagrams,setupSteps:13,conditions:3,versions:2,languages:4,scope:'Versioned native strings, conditional phase order, diagram byte parity, font coverage and text rectangles; browser raster verified separately.'}));
