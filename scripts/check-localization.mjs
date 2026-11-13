import assert from 'node:assert/strict';
import fs from 'node:fs';
import {FLOWS,PARTS} from '../dist/data.js';
import {ASSEMBLY_PLAN} from '../dist/assembly-plan-runtime.js';

const read=path=>JSON.parse(fs.readFileSync(new URL('../dist/'+path,import.meta.url),'utf8'));
const catalog=read('locales/messages.json');
const guidance=JSON.parse(fs.readFileSync(new URL('./step-guidance.json',import.meta.url),'utf8'));
for(const [id,record]of Object.entries(guidance)){
 const entry=record.sameAs?guidance[record.sameAs]:record;
 const step=Object.values(FLOWS).flatMap(f=>f.steps).find(s=>String(s.officialId)===id);
 assert(step?.verificationRevision,`versioned guidance: ${id}`);
 assert.equal(step.description,entry.description[0]);
 if(entry.title)assert.equal(step.title,entry.title[0]);
 assert.deepEqual(step.checks,entry.checks.map(c=>c[0]));
 for(const [source,...translations]of [entry.description,...entry.checks])assert.deepEqual(catalog[source],translations,`guidance translations: ${id}`);
}
const packs=Object.fromEntries(['en','cs','de'].map(lang=>[lang,read(`locales/manual-${lang}.json`)]));
const credits=fs.readFileSync(new URL('../dist/credits.html',import.meta.url),'utf8');
for(const variant of ['screw','glued']){
 const motionCounts=Object.fromEntries(Object.entries(FLOWS).map(([flow,guide])=>[flow,guide.steps.filter(s=>(!s.variant||s.variant===variant)&&ASSEMBLY_PLAN[flow][s.officialId].actors.length).length]));
 assert(credits.includes(`${motionCounts.build+motionCounts.upgrade}手順`),`${variant}: credits animation count matches the steps actually shown`);
 assert(credits.includes(`組み立て${motionCounts.build}、アップグレード${motionCounts.upgrade}`),`${variant}: both per-guide animation counts match`);
}
for(const match of credits.matchAll(/href="(\.\/[^"#?]+)(?:[?#][^"]*)?"/g))assert(fs.existsSync(new URL('../dist/'+decodeURIComponent(match[1].slice(2)),import.meta.url)),'missing credits resource: '+match[1]);
const sourceCache=new Map();let sourceMatches=0;
const variables=s=>[...s.matchAll(/\{(\w+)\}/g)].map(m=>m[1]).sort();
for(const [source,values]of Object.entries(catalog)){
 assert.equal(values.length,3,source);
 for(const value of values){assert(value.trim(),source);assert(!/[\u3040-\u30ff\u3400-\u9fff]/u.test(value),source);assert.deepEqual(variables(value),variables(source),source);}
}
for(const [language,pack]of Object.entries(packs))for(const [flow,f]of Object.entries(FLOWS)){
 assert.equal(pack[flow].chapters.length,f.chapters.length);
 assert.equal(Object.keys(pack[flow].steps).length,f.steps.length);
 const anchors=new Set();
 for(const step of f.steps){
  const localized=pack[flow].steps[step.officialId],url=new URL(localized.source);
  assert(localized.title.trim());assert.equal(url.origin,'https://help.prusa3d.com');
  assert(url.pathname.startsWith(`/${language==='en'?'':language+'/'}guide/`));
  assert(/^#\d+$/.test(url.hash));assert(!anchors.has(localized.source));anchors.add(localized.source);
  assert(Array.isArray(localized.supplies)&&localized.supplies.every(v=>typeof v==='string'));
  const slug=step.source.split('/guide/')[1].split('#')[0],cachePath=new URL(`../research/${language==='en'?'manual-':'i18n/'+language+'-'}${slug}.json`,import.meta.url);
  if(!sourceCache.has(cachePath.href))sourceCache.set(cachePath.href,fs.existsSync(cachePath)?JSON.parse(fs.readFileSync(cachePath,'utf8')):null);
  const official=sourceCache.get(cachePath.href);
  if(official){
   const source=official.steps.find(s=>Number(s.default_id||s.id)===step.officialId);
   assert(source,`source step ${language}/${step.officialId}`);assert.equal(url.hash,'#'+source.id);
   assert.equal(url.pathname,`/${language==='en'?'':language+'/'}guide/${official.guide.slug}`);sourceMatches++;
  }else if(process.argv.includes('--cache-required'))assert.fail('Missing retained official source: '+cachePath.pathname);
 }
}

// Host shims for the data and persistence contract. This does not test layout or WebGL.
const document={documentElement:{nodeType:1,tagName:'HTML',childNodes:[],hasAttribute:()=>false},querySelectorAll:()=>[]};
Object.assign(globalThis,{document,location:{href:'https://assembly.example/?lang=ja#workspace'},history:{replaceState(_state,_title,url){location.href=String(url);}}});
let memory=new Map(),requests=[],fetchMode;
globalThis.localStorage={getItem:key=>memory.get(key)||null,setItem:(key,value)=>memory.set(key,value)};
globalThis.fetch=async path=>{
 requests.push(path);
 const file=path.split('?')[0].replace(/^\.\//,'');
 if(fetchMode)return fetchMode(file);
 return {ok:true,json:async()=>structuredClone(read(file))};
};
let serial=0;
const fresh=async()=>{
 const module=await import(`../dist/i18n.js?check=${++serial}`),refs=structuredClone({flows:FLOWS,parts:PARTS,plan:ASSEMBLY_PLAN});
 await module.initializeLocalization(refs);return {module,refs};
};
const invariant=refs=>{
 const copy=structuredClone(refs);
 for(const f of Object.values(copy.flows)){
  delete f.title;delete f.guide;delete f.chapters;
  for(const s of f.steps)for(const key of ['title','description','tip','action','tools','checks','supplies','source'])delete s[key];
 }
 for(const p of Object.values(copy.parts)){delete p.name;delete p.desc;}
 for(const scenes of Object.values(copy.plan))for(const scene of Object.values(scenes)){delete scene.note;for(const actor of scene.actors)delete actor.label;}
 return copy;
};
const progressKey='prusa-assembly-lab-manual-v2',languageKey='prusa-assembly-lab-language';
const progress=JSON.stringify({flow:'upgrade',build:{index:45,variant:'glued',done:[0,20],checks:{20:[0]}},upgrade:{index:17,done:[0,1],checks:{17:[0]}}});
memory.set(progressKey,progress);
const {module,refs}=await fresh(),original=structuredClone(refs),geometry=invariant(refs),firstStep=refs.flows.build.steps[0],firstScene=Object.values(refs.plan.build)[0];
for(const language of ['en','cs','de','en','ja','cs','ja']){
 assert.equal(await module.setLanguage(language),true);
 assert.equal(module.currentLanguage(),language);assert.equal(document.documentElement.lang,language);
 assert.equal(memory.get(languageKey),language);assert.equal(new URL(location.href).searchParams.get('lang'),language);
 assert.equal(new URL(location.href).hash,'#workspace');assert.equal(memory.get(progressKey),progress);
 assert.equal(refs.flows.build.steps[0],firstStep,'step identity must be stable');
 assert.equal(Object.values(refs.plan.build)[0],firstScene,'scene identity must be stable');
 assert.deepEqual(invariant(refs),geometry,'language must not change geometry, motion, IDs, order or variants');
 if(language==='ja')assert.deepEqual(refs,original,'Japanese restores every source field');
 else for(const [flow,f]of Object.entries(refs.flows))for(const s of f.steps){
  assert.equal(s.title,packs[language][flow].steps[s.officialId].title);
  assert.equal(s.source,packs[language][flow].steps[s.officialId].source);
 }
 assert.equal(module.untranslated.size,0,[...module.untranslated].join('\n'));
}
assert.equal(requests.filter(p=>p.includes('messages.json')).length,1,'catalog is reused');
for(const lang of ['en','cs','de'])assert.equal(requests.filter(p=>p.includes(`manual-${lang}`)).length,1,'manual pack is reused');
assert.equal(module.t('1操作'),'1操作');await module.setLanguage('en');assert.equal(module.t('1操作'),'1 operation');
await module.setLanguage('cs');assert.equal(module.t('左Zスムースロッド'),'Hladká tyč Z vlevo');
await module.setLanguage('ja');assert.equal(module.t('第6章 · 手順31'),'第6章 · 手順31');
await assert.rejects(module.setLanguage('xx'));assert.equal(module.currentLanguage(),'ja');

// A failed or incomplete pack must not partially mutate the data or the saved choice.
for(const failure of ['network','incomplete','bad-supplies','bad-catalog']){
 memory=new Map([[progressKey,progress]]);location.href='https://assembly.example/?lang=ja';fetchMode=undefined;
 const freshCase=await fresh(),before=structuredClone(freshCase.refs),savedLanguage=memory.get(languageKey);
 fetchMode=async file=>{
  if(failure==='network')throw Error('offline');
  const data=structuredClone(read(file));
  if(file.includes('manual-')){
   const id=Object.keys(data.build.steps)[0];
   if(failure==='incomplete')delete data.build.steps[id];
   if(failure==='bad-supplies')data.build.steps[id].supplies=null;
  }
  if(file.includes('messages')&&failure==='bad-catalog')data['言語']=['English'];
  return {ok:true,json:async()=>data};
 };
 await assert.rejects(freshCase.module.setLanguage('de'));
 assert.equal(freshCase.module.currentLanguage(),'ja');assert.deepEqual(freshCase.refs,before);
 assert.equal(memory.get(progressKey),progress);assert.equal(memory.get(languageKey),savedLanguage,'failed language loading preserves the initialized choice');
 fetchMode=undefined;assert.equal(await freshCase.module.setLanguage('de'),true,'a retry succeeds');
}

// Stale network completions and failures cannot override a later choice.
for(const lateFails of [false,true]){
 memory=new Map();location.href='https://assembly.example/?lang=ja';fetchMode=undefined;
 const freshCase=await fresh();let finish;
 fetchMode=file=>file.includes('manual-en')?new Promise((resolve,reject)=>{finish=()=>lateFails?reject(Error('late failure')):resolve({ok:true,json:async()=>structuredClone(packs.en)});}):Promise.resolve({ok:true,json:async()=>structuredClone(read(file))});
 const old=freshCase.module.setLanguage('en');await Promise.resolve();
 assert.equal(await freshCase.module.setLanguage('de'),true);finish();assert.equal(await old,false);
 assert.equal(freshCase.module.currentLanguage(),'de');assert.equal(memory.get(languageKey),'de');
}
memory=new Map();location.href='https://assembly.example/?lang=ja';fetchMode=undefined;
const cancelled=await fresh();let finishCancelled;
fetchMode=file=>file.includes('manual-en')?new Promise(resolve=>{finishCancelled=()=>resolve({ok:true,json:async()=>structuredClone(packs.en)});}):Promise.resolve({ok:true,json:async()=>structuredClone(read(file))});
const pending=cancelled.module.setLanguage('en');await Promise.resolve();await cancelled.module.setLanguage('ja');finishCancelled();assert.equal(await pending,false);assert.equal(cancelled.module.currentLanguage(),'ja');

// Reload uses the saved choice; a valid URL choice overrides it. Blocked storage remains usable.
fetchMode=undefined;memory=new Map([[languageKey,'de']]);location.href='https://assembly.example/';assert.equal((await fresh()).module.currentLanguage(),'de');
location.href='https://assembly.example/?lang=cs';assert.equal((await fresh()).module.currentLanguage(),'cs');
globalThis.localStorage={getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}};
location.href='https://assembly.example/?lang=en';const blockedStorage=await fresh();assert.equal(blockedStorage.module.currentLanguage(),'en');await blockedStorage.module.setLanguage('ja');assert.equal(blockedStorage.module.currentLanguage(),'ja');
location.href='https://assembly.example/#workspace';await blockedStorage.module.setLanguage('de');assert.equal(new URL(location.href).searchParams.get('lang'),'de','URL preserves a language choice when browser storage is blocked');assert.equal(new URL(location.href).hash,'#workspace');
console.log(`PASS: four languages; 425 step mappings per translation; ${sourceMatches} exact official source anchors verified from retained cache; source restoration; stable geometry and motion metadata; progress and URL persistence; cache; malformed/offline rollback; retry; stale request cancellation; blocked storage. Data contract only; no layout or GPU.`);
