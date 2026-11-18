import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {FLOWS,PARTS,CAD_ROOTS} from '../dist/data.js';
import {ASSEMBLY_PLAN} from '../dist/assembly-plan.js';
let count=0;
function ok(value,message){assert.ok(value,message);count++;}
const same=(a,b)=>[...a].sort().join('|')===[...b].sort().join('|');
const expected={build:[15,22,53,40,83,58,44,46,18],upgrade:[6,30,10]};
const original=Object.keys(PARTS).filter(k=>!PARTS[k].plus);
const upgraded=Object.keys(PARTS).filter(k=>!PARTS[k].old);
const messages=JSON.parse(fs.readFileSync(path.join('dist','locales','messages.json'),'utf8'));
for(const [key,translations]of Object.entries(messages)){
 ok(Array.isArray(translations)&&translations.length===3&&translations.every(s=>typeof s==='string'&&s.trim()),`EN/CS/DE catalogue entry: ${key}`);
}
for(const [flow,f]of Object.entries(FLOWS)){
 ok(f.steps[0].overview&&f.steps.at(-1).final,`${flow}: introduction and final check`);
 ok(f.steps.length===expected[flow].reduce((a,b)=>a+b,0),`${flow}: exact official step count`);
 ok(new Set(f.steps.map(s=>s.officialId)).size===f.steps.length,`${flow}: unique official step IDs`);
 for(let chapter=0;chapter<f.chapters.length;chapter++){
  const steps=f.steps.filter(s=>s.chapter===chapter);
  ok(steps.length===expected[flow][chapter],`${flow}: chapter ${chapter+1} count`);
  const slug=steps[0].source.split('/guide/')[1].split('#')[0];
  const sourceFile=`research/manual-${slug}.json`;
  const source=fs.existsSync(sourceFile)?JSON.parse(fs.readFileSync(sourceFile,'utf8')):null;
  steps.forEach((s,i)=>{
   ok(s.officialStep===i+1&&s.chapterSteps===steps.length,`${flow}: chapter step number ${chapter}.${i}`);
   ok(s.source===`https://help.prusa3d.com/guide/${slug}#${s.officialId}`,`${flow}: exact source deep link`);
   if(source)ok(s.officialId===source.steps[i].id,`${flow}: official source order ${chapter}.${i}`);
  });
 }
 for(const [i,s]of f.steps.entries()){
  ok(s.chapter>=0&&s.chapter<f.chapters.length,`${flow}: chapter valid`);
  ok(s.title&&typeof s.description==='string'&&typeof s.tip==='string'&&s.checks.length,`${flow}: valid guidance fields (completeness requires separate review)`);
  ok(s.parts.every(k=>PARTS[k]),`${flow}: referenced parts exist`);
  ok([...(s.add||[]),...(s.remove||[])].every(k=>s.parts.includes(k)),`${flow}: mutation applies to highlighted parts`);
  ok([...(s.reveal||[]),...(s.previewParts||[])].every(k=>PARTS[k]),`${flow}: preview parts exist`);
  if(s.photo)ok(new URL(s.photo).protocol==='https:',`${flow}: secure official image`);
  const p=ASSEMBLY_PLAN[flow][s.officialId];ok(p&&p.chapter===s.chapter+1&&p.step===s.officialStep,`${flow}: scene matches official step ID`);
 }
}
for(const variant of ['screw','glued']){
 const indices=FLOWS.build.steps.map((s,i)=>({s,i})).filter(({s})=>!s.variant||s.variant===variant).map(({i})=>i);
 ok(indices.length===377,`${variant}: branch has 377 applicable steps`);
 for(let i=0;i<indices.length;i++){
  const index=indices[i];let next=index+1,previous=index-1;
  const applicable=n=>!FLOWS.build.steps[n]?.variant||FLOWS.build.steps[n].variant===variant;
  while(next<FLOWS.build.steps.length&&!applicable(next))next++;
  while(previous>=0&&!applicable(previous))previous--;
  if(i<indices.length-1)ok(next===indices[i+1],`${variant}: next skips other branch`);
  if(i>0)ok(previous===indices[i-1],`${variant}: previous skips other branch`);
 }
}
const dist=path.resolve('dist');
const files=fs.readdirSync(dist,{recursive:true}).filter(p=>fs.statSync(path.join(dist,p)).isFile());
for(const name of files){
 ok(!/\.(step|stp|f3d)$/i.test(name),'public assets contain no raw CAD source');
 ok(fs.statSync(path.join(dist,name)).size<25*1024*1024,`asset size: ${name}`);
 if(/\.(js|css|html)$/.test(name)){
  const source=fs.readFileSync(path.join(dist,name),'utf8');
  const refs=[...source.matchAll(/(?:from\s*|import\s*)['"](\.\.?\/[^'"]+)['"]/g)].map(m=>m[1]);
  if(/\.(html|css)$/.test(name))refs.push(...[...source.matchAll(/(?:src=|href=|url\()['"]?(\.\/[^'"\s)<>]+)/g)].map(m=>m[1]));
  for(const ref of refs)ok(fs.existsSync(path.resolve(dist,path.dirname(name),decodeURIComponent(ref.split(/[?#]/)[0]))),`local reference ${name} -> ${ref}`);
 }
}
const buf=fs.readFileSync(path.join(dist,'assets/core-one.glb'));
ok(buf.readUInt32LE(0)===0x46546c67,'valid binary glTF');
const gltf=JSON.parse(buf.subarray(20,20+buf.readUInt32LE(12)));
const ids=gltf.nodes.map(n=>n.extras?.cadIndex).filter(n=>n!==undefined);
ok(new Set(ids).size===895,'all 895 original CAD nodes preserved');
for(const id of Object.keys(CAD_ROOTS))ok(ids.includes(+id),`semantic root ${id} preserved`);
ok(fs.readFileSync('dist/licenses/OCL-1.0.txt','utf8').startsWith('Open Community License (OCL v1)'),'matching original CAD license');
for(const name of ['credits.html','licenses/GPL-2.0.txt','licenses/THREE-LICENSE.txt','licenses/Inter-OFL.txt','licenses/Barlow-OFL.txt','licenses/MESHOPT-LICENSE.txt'])ok(fs.existsSync(path.join(dist,name)),`attribution: ${name}`);
await import('./check-assembly-plan-compiled.mjs');
await import('./check-diagnostics.mjs');
await import('./check-z-motor-service.mjs');
await import('./check-heater-service.mjs');
await import('./check-xbuddy-complete.mjs');
await import('./check-thermistor-service.mjs');
await import('./check-maintenance-reference.mjs');
await import('./check-manual-photo-selection.mjs');
await import('./check-filament-imports.mjs');
await import('./check-belt-direction-sharing.mjs');
console.log(`PASS: ${count} assertions. ${FLOWS.build.steps.length} official assembly steps, ${FLOWS.upgrade.steps.length} official upgrade steps. ${ids.length} original CAD nodes.`);
