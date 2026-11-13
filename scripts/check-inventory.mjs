import fs from 'node:fs';
import assert from 'node:assert/strict';
import {FLOWS} from '../dist/manual-data.js';

const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const manifest=read('scripts/manual-inventory.json');
const ja=read('scripts/inventory-ja.json');
const source=new Map(),plain=s=>s.replace(/<[^>]*>/g,'').replace(/&nbsp;/g,'\u00a0').replace(/&amp;/g,'&').replace(/&gt;/g,'>').replace(/&lt;/g,'<').replace(/&quot;/g,'"').replace(/&#39;/g,"'").trim();
const packs=Object.fromEntries(['en','cs','de'].map(lang=>[lang,read(`dist/locales/manual-${lang}.json`)]));
let steps=0,rows=0;
for(const [flow,f]of Object.entries(FLOWS))for(const step of f.steps){
 const selected=manifest.steps[step.officialId]||[],slug=step.source.split('/guide/')[1].split('#')[0];
 assert.equal(step.supplies.length,selected.length);
 for(const language of ['ja','en','cs','de']){
  const path=language==='ja'||language==='en'?`research/manual-${slug}.json`:`research/i18n/${language}-${slug}.json`;
  if(!source.has(path))source.set(path,read(path));
  const official=source.get(path).steps.find(s=>Number(s.default_id||s.id)===step.officialId);
  const lines=new Map(official.lines.map(l=>[Number(l.default_id||l.id),l]));
  const expected=selected.map(id=>{
   assert(lines.has(id),`${language}/${step.officialId}/${id}`);
   const label=plain(lines.get(id).title),override=manifest.overrides?.[language]?.[id];
   if(override){assert.equal(label,override.original);return override.label;}
   return label;
  });
  const actual=language==='ja'?step.supplies:packs[language][flow].steps[step.officialId].supplies;
  assert.deepEqual(actual,language==='ja'?expected.map(label=>ja.supplies[label]):expected,`${language}/${step.officialId}: reviewed source rows in source order`);
  actual.forEach((label,i)=>{
   const sourceLabel=packs.en[flow].steps[step.officialId].supplies[i];
   const quantity=sourceLabel.match(/\(\s*(\d+)\s*[x×]\s*\)/i);
   const quantityInLabel=language==='ja'?label.match(/（(\d+)(?:本|個|枚|組)）/):label.match(/\(\s*(\d+)\s*[x×]\s*\)/i);
   assert.equal(quantityInLabel?.[1],quantity?.[1],`${language}/${step.officialId}: quantity, including unspecified quantities`);
   const codes=s=>(s.match(/\bM\d+(?:[x×]\d+(?:[.,]\d+)?(?:rT|bT|cT|r|T)?|n[NS]?|w)\b/gi)||[]).map(v=>v.replace(',','.').toLowerCase());
   assert.deepEqual(codes(label),codes(sourceLabel),`${language}/${step.officialId}: fastener types`);
  });
  rows+=actual.length;
 }
 if(selected.length){assert(step.verificationRevision);steps++;}
}
assert.equal(steps,85);assert.equal(rows,318*4);
const get=id=>Object.values(FLOWS).flatMap(f=>f.steps).find(s=>s.officialId===id);
for(const [id,part]of [[989086,'XYキャリッジ（XY-carriage）（2個）'],[993835,'NTCサーミスター 90 mm（1本）'],[993895,'Nextruderスペーサー（3個）'],[994485,'M5-4（1個）'],[997288,'PTFEチューブ 4 x 2.5 x 45 mm（1本）']])assert(get(id).supplies.some(s=>s.includes(part)),`${id}: missing part restored`);
for(const id of [987966,990680,998346])assert(!get(id).supplies.some(s=>/^(Note:|There are both|The M3nS nuts are not required)/.test(s)),'advice is not a part');
assert(packs.cs.upgrade.steps[1023033].supplies.some(s=>s==='Magnet 10x6x2 mm (2x) získaný z tiskárny'));
for(const id of [1014666,1014724,1022696,1023033,1024998,1024071,1023893])assert(get(id).supplies.length,'unquantified and upgrade inventories remain visible');
assert.equal(get(989388).supplies.length,3,'mixed rod information/preparation keeps both rod sizes and screws');
assert.equal(get(1075170).supplies.length,2,'new door-version step keeps handle plate and screws');
const excluded=[];
for(const [flow,f]of Object.entries(FLOWS))for(const step of f.steps){
 const slug=step.source.split('/guide/')[1].split('#')[0],official=source.get(`research/manual-${slug}.json`).steps.find(s=>s.id===step.officialId);
 for(const line of official.lines)if(/\(\s*\d+\s*[x×]\s*\)/i.test(plain(line.title))&&!(manifest.steps[step.officialId]||[]).includes(line.id))excluded.push(line.id);
}
assert.deepEqual(excluded,[982481,982489,982497,982521],'only the four intro tool rows are outside parts inventories; tools are covered in intro guidance');
console.log(`PASS: ${steps} inventories, ${rows} localized rows match retained official line IDs. Missing parts, advice separation, unquantified items, upgrade reuse and Czech two-magnet quantity verified. Data only; no physical/CAD QA.`);
