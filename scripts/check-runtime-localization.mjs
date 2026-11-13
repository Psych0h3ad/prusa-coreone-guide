import assert from 'node:assert/strict';
import fs from 'node:fs';
import {runtimeModule}from './runtime-module.mjs';
const {PARTS}=await runtimeModule('data');
const {initializeLocalization,setLanguage,currentLanguage,localizePartMetadata}=await runtimeModule('i18n');
const catalog=JSON.parse(fs.readFileSync('dist/locales/messages.json','utf8'));
const root={nodeType:1,tagName:'HTML',childNodes:[],normalize(){},hasAttribute(){return false;}};
globalThis.document={documentElement:root,querySelectorAll:()=>[]};
globalThis.location={href:'http://localhost/maintenance.html?lang=en'};
globalThis.history={replaceState(){}};
globalThis.localStorage={getItem:()=>null,setItem(){}};
globalThis.fetch=async p=>({ok:true,json:()=>JSON.parse(fs.readFileSync('dist/'+p.split('?')[0],'utf8'))});
await initializeLocalization({flows:{},parts:PARTS,plan:{}});
assert.equal(currentLanguage(),'en');
const before=new Set(Object.keys(PARTS));
await import('./check-viewer.mjs');
const late=Object.keys(PARTS).filter(id=>!before.has(id));
assert.deepEqual(late.sort(),['hallSensor','hallHolder','hallBall','hallMagnet','hallSpring','nextruderCables'].sort());
const authored={
 hallSensor:['Hallフィラメントセンサー','Nextruder内部でフィラメントの有無を検出する基板。ヒートシンクのくぼみに固定します。'],
 hallHolder:['フィラメントセンサーのホルダー','Nextruder内部のフィラメント検出機構。'],
 hallBall:['フィラメントセンサーの鋼球','Nextruder内部のフィラメント検出機構。'],
 hallMagnet:['フィラメントセンサーの磁石','Nextruder内部のフィラメント検出機構。'],
 hallSpring:['フィラメントセンサーのばね','Nextruder内部のフィラメント検出機構。'],
 nextruderCables:['Nextruderの配線','NextruderとLoveBoardをつなぐケーブル。']
};
const check=code=>{
 for(const [id,values]of Object.entries(authored))for(const [i,key]of ['name','desc'].entries()){
  const expected=code==='ja'?values[i]:catalog[values[i]][{en:0,cs:1,de:2}[code]];
  assert.equal(PARTS[id][key],expected,id+' '+key+' '+code);
 }
};
check('en'); // English was selected before the six geometry modules loaded.
document.documentElement=root;document.querySelectorAll=()=>[];
PARTS.lateMetadataProbe={name:'Hallフィラメントセンサー'};
localizePartMetadata();
assert.equal(PARTS.lateMetadataProbe.name,catalog['Hallフィラメントセンサー'][0]);
assert(!('desc'in PARTS.lateMetadataProbe),'optional metadata is not invented');
for(const code of ['cs','de','ja','en','ja']){
 await setLanguage(code);check(code);
 const expected=code==='ja'?'Hallフィラメントセンサー':catalog['Hallフィラメントセンサー'][{en:0,cs:1,de:2}[code]];
 assert.equal(PARTS.lateMetadataProbe.name,expected,'late metadata retains its authored source across round trips');
}
const report={status:'PASS',initialLanguage:'en',latePartIds:late,roundTrips:['cs','de','ja','en','ja'],properties:['name','desc'],optionalMetadata:true,sourceStringsRestored:true};
if(process.env.RUNTIME_LOCALIZATION_REPORT)fs.writeFileSync(process.env.RUNTIME_LOCALIZATION_REPORT,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
