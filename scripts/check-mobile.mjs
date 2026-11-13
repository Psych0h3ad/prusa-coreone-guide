import assert from 'node:assert/strict';
import fs from 'node:fs';
import {FLOWS} from '../dist/data.js';
import {navigationState,COMPACT_QUERY} from '../dist/mobile.js';
let count=0;
for(const [flow,f]of Object.entries(FLOWS))for(const variant of ['screw','glued']){
 const validIndices=f.steps.map((s,i)=>!s.variant||s.variant===variant?i:-1).filter(i=>i>=0);
 for(const [position,index]of validIndices.entries()){
  const args={steps:f.steps,index,variant,done:[],checked:[],view:'guide'};
  let n=navigationState(args);
  assert.equal(n.position,position+1);assert.equal(n.previous,validIndices[position-1]);assert.equal(n.next,validIndices[position+1]);
  assert(n.disabled,'unread instructions cannot be marked complete from guide view');
  n=navigationState({...args,view:'model'});assert(!n.disabled,'CAD navigation remains available');
  if(f.steps[index].final)assert(n.readFirst&&n.label==='手順を確認する','final completion still needs checks');
  else assert(n.previewNext&&!n.readFirst&&n.label==='次の手順へ','unverified CAD preview advances without claiming completion');
  n=navigationState({...args,checked:f.steps[index].checks.map((_,i)=>i)});assert(!n.disabled&&n.valid&&!n.verified);
  n=navigationState({...args,done:[index]});assert(!n.disabled&&n.verified,'completed steps can be revisited');
  count+=7;
 }
}
const html=fs.readFileSync('dist/index.html','utf8'),css=fs.readFileSync('dist/mobile.css','utf8'),app=fs.readFileSync('dist/app.js','utf8');
for(const id of ['mobile-workbar','mobile-previous','mobile-next','mobile-complete','mobile-action-hint','mobile-position','mobile-chapters','touch-model-toggle','model-fullscreen-close'])assert.equal([...html.matchAll(new RegExp(`id="${id}"`,'g'))].length,1,`${id} must have exactly one target`);
assert(html.includes('viewport-fit=cover')&&!/user-scalable=no|maximum-scale=1/.test(html),'browser zoom remains available');
assert(css.includes('safe-area-inset-bottom')&&css.includes('safe-area-inset-left'),'mobile controls respect safe areas in both orientations');
assert(css.includes('font-size:16px')&&css.includes('min-height:48px'),'touch input and primary targets have mobile sizes');
assert(css.includes('data-mobile-view=guide')&&css.includes('data-mobile-view=model'),'guide and 3D are distinct mobile views');
assert(css.includes('max-height:600px')&&COMPACT_QUERY.includes('max-height: 600px'),'compact landscape view enabled');
assert(app.includes("if(!compact.matches)ensureViewer()"),'phone guide does not download or render CAD before needed');
assert(!/ひとつずつ、できました|理解が、自信になる|もっと身近に|触って、仕組み/.test(app+html),'removed promotional copy must not return');
console.log(`PASS: ${count} mobile navigation checks; touch, safe-area, orientation and UI contracts.`);
