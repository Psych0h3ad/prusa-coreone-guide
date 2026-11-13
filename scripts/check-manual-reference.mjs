import assert from 'node:assert/strict';
import fs from 'node:fs';
import {FLOWS} from '../dist/data.js';
import {JAPANESE_SOURCES} from '../dist/manual-ja-sources.js';
import {createReferenceLoader} from '../dist/manual-reference.js';

let steps=0,photos=0,localizedAnchors=0;
const read=path=>JSON.parse(fs.readFileSync(new URL('../'+path,import.meta.url),'utf8'));
for(const [flow,f]of Object.entries(FLOWS))for(let ch=0;ch<f.chapters.length;ch++){
 const chapter=f.steps.filter(s=>s.chapter===ch),index=read(`dist/assets/manual-reference/${flow}-${ch}.json`);
 const slug=chapter[0].source.split('/guide/')[1].split('#')[0],source=read(`research/manual-${slug}.json`),ja=read(`research/i18n/ja-${slug}.json`);
 assert.deepEqual(Object.keys(index.steps).sort(),chapter.map(s=>String(s.officialId)).sort());
 assert.deepEqual(chapter.map(s=>s.officialId),source.steps.map(s=>s.default_id||s.id),`source sequence ${flow}/${ch}`);
 assert.deepEqual(chapter.map(s=>s.officialId),ja.steps.map(s=>s.default_id||s.id),`Japanese sequence ${flow}/${ch}`);
 for(const step of chapter){
  const original=source.steps.find(s=>s.id===step.officialId),translated=ja.steps.find(s=>(s.default_id||s.id)===step.officialId);
  assert(translated,`Japanese source ${step.officialId}`);
  assert.equal(JAPANESE_SOURCES[step.officialId],`https://help.prusa3d.com/ja/guide/${ja.guide.slug}#${translated.id}`);
  const expected=(original.media?.gallery||[]).filter(p=>(p.child||p).original),actual=index.steps[step.officialId].photos;
  assert.equal(actual.length,expected.length,`all photos for ${flow}/${step.officialId}`);
  actual.forEach((photo,i)=>{
   const item=expected[i],annotated=item.child||item;
   assert.equal(photo.url,annotated.original);assert.equal(photo.id,annotated.id);
   assert.equal(photo.preview,annotated.large||annotated.original,`preview ${flow}/${step.officialId}/${i}`);
   assert.equal(photo.thumbnail,annotated.thumbnail||annotated.original,`thumbnail ${flow}/${step.officialId}/${i}`);
   assert.equal(photo.plain,item.child&&item.original?item.original:undefined,`unmarked photo ${flow}/${step.officialId}/${i}`);
   for(const dimension of ['width','height'])assert.equal(photo[dimension],annotated.resolution?.original?.[dimension],`${dimension} ${flow}/${step.officialId}/${i}`);
   for(const url of [photo.url,photo.preview,photo.thumbnail,photo.plain].filter(Boolean)){
    assert.equal(new URL(url).origin,'https://help.prusa3d.com');assert(new URL(url).pathname.startsWith('/wp-content/uploads/'));
   }
   photos++;
  });steps++;localizedAnchors++;
 }
}
// Each published language must deep-link to the same default step, even where
// the translated page uses a different anchor or a localized chapter slug.
for(const language of ['en','cs','de']){
 const localized=read(`dist/locales/manual-${language}.json`);
 for(const [flow,f]of Object.entries(FLOWS))for(let ch=0;ch<f.chapters.length;ch++){
  const chapter=f.steps.filter(s=>s.chapter===ch),slug=chapter[0].source.split('/guide/')[1].split('#')[0];
  const source=read(language==='en'?`research/manual-${slug}.json`:`research/i18n/${language}-${slug}.json`);
  assert.deepEqual(chapter.map(s=>s.officialId),source.steps.map(s=>s.default_id||s.id),`${language} source sequence ${flow}/${ch}`);
  for(const step of chapter){
   const translated=source.steps.find(s=>(s.default_id||s.id)===step.officialId);
   assert.equal(localized[flow].steps[step.officialId].source,`https://help.prusa3d.com/${language==='en'?'':language+'/'}guide/${source.guide.slug}#${translated.id}`);
   localizedAnchors++;
  }
 }
}
// Concurrent readers share a chapter request; transient failure never poisons the cache.
let calls=0,fail=true;
const loader=createReferenceLoader(async path=>{calls++;if(fail)throw Error('offline');return {ok:true,json:async()=>read('dist/'+path.replace('./','').split('?')[0])};});
await assert.rejects(loader('build',2,984811));fail=false;
const [a,b]=await Promise.all([loader('build',2,984811),loader('build',2,984811)]);
assert.equal(calls,2);assert.deepEqual(a,b);assert.equal(a.length,2);
await loader('build',2,984733).catch(error=>assert.equal(error.message,'Missing official step'));
assert.equal(calls,2);
await assert.rejects(loader('../',0,1));
const app=fs.readFileSync(new URL('../dist/app.js',import.meta.url),'utf8');
assert(app.includes('step.source=JAPANESE_SOURCES[step.officialId]||step.source'));
console.log(JSON.stringify({steps,photos,localizedAnchors,loader:'deduplication, retry and missing-step handling passed'}));
