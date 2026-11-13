import assert from 'node:assert/strict';
import fs from 'node:fs';
import {runtimeModule} from './runtime-module.mjs';
const {FLOWS,PARTS}=await runtimeModule('data');
const {ASSEMBLY_PLAN}=await runtimeModule('assembly-plan');

// Exercise the actual viewer text methods without constructing WebGL or loading CAD.
const nodes=new Map();
const element=()=>({textContent:'',value:'',disabled:false,attributes:{},setAttribute(k,v){this.attributes[k]=v;},removeAttribute(k){delete this.attributes[k];}});
globalThis.document={
 documentElement:{nodeType:1,tagName:'HTML',childNodes:[],hasAttribute:()=>false},
 querySelectorAll:()=>[],getElementById(id){if(!nodes.has(id))nodes.set(id,element());return nodes.get(id);}
};
globalThis.matchMedia=()=>({matches:true});
globalThis.location={href:'https://assembly.example/?lang=ja'};
globalThis.history={replaceState(_state,_title,url){location.href=String(url);}};
globalThis.localStorage={getItem:()=>null,setItem(){}};
globalThis.fetch=async path=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(new URL('../dist/'+path.split('?')[0].replace(/^\.\//,''),import.meta.url),'utf8'))});
const {PrinterViewer}=await import('../dist/viewer.js');
const {initializeLocalization,setLanguage,t}=await runtimeModule('i18n');
const refs=structuredClone({flows:FLOWS,parts:PARTS,plan:ASSEMBLY_PLAN});
await initializeLocalization(refs);
const sourceLabels=Object.fromEntries([993595,993789,993869].map(id=>[id,refs.plan.build[id].actors.map(a=>a.label)]));
let count=0;
for(const language of ['en','cs','de','ja']){
 await setLanguage(language);
 for(const model of ['CORE One','CORE One+']){
  const viewer=Object.assign(Object.create(PrinterViewer.prototype),{sceneActors:[],operationScene:{plan:{note:model+'の完成形'},full:true},operationProgress:1});
  viewer.updateOperationUI(true);const caption=document.getElementById('operation-title').textContent;
  assert(caption.includes(model));if(language!=='ja')assert(!/[\u3040-\u30ff\u3400-\u9fff]/u.test(caption),'assembled printer captions are translated by the same live module');
 }
 for(const [id,sources]of Object.entries(sourceLabels))for(const interaction of [true,false]){
  const plan=refs.plan.build[id],playing={start:1234,duration:7200};
  const state={flow:'build',index:FLOWS.build.steps.findIndex(s=>String(s.officialId)===id),variant:'screw',comparison:'after',explore:false,completed:[0]};
  const signature=[state.flow,state.index,state.variant,state.comparison,state.explore].join(':');
  const viewer=Object.create(PrinterViewer.prototype);
  Object.assign(viewer,{
   sceneActors:plan.actors.map((a,i)=>({...a,label:sources[i]})),
   operationScene:{plan,full:false},guideLabels:plan.actors.map((_,index)=>({el:element(),index})),
   operationProgress:.37,activeOperation:plan.actors.length-1,playing,
   autoplayPending:false,sceneSignature:signature,lastOperationFocus:2,state,loaded:true,
   interactionEnabled:interaction,controls:{enabled:interaction},renderer:{domElement:{style:{}}}
  });
  viewer.localize();
  const expected=sources.map(t);
  assert.deepEqual(viewer.sceneActors.map(a=>a.label),expected);
  assert.deepEqual(viewer.guideLabels.map(g=>g.el.textContent),expected.map((s,i)=>`${i+1}  ${s}`));
  assert.equal(document.getElementById('operation-title').textContent,expected.at(-1));
  assert.equal(document.getElementById('operation-position').textContent,`${expected.length} / ${expected.length}`);
  assert.equal(document.getElementById('operation-progress').value,'370');
  assert.equal(viewer.operationProgress,.37);assert.equal(viewer.playing,playing);
  assert.equal(viewer.autoplayPending,false);assert.equal(viewer.sceneSignature,signature);
  assert.equal(viewer.state,state);assert.equal(viewer.lastOperationFocus,2);
  assert.equal(viewer.interactionEnabled,interaction);assert.equal(viewer.controls.enabled,interaction);
  assert.equal(viewer.renderer.domElement.style.touchAction,interaction?'none':'pan-y');
  assert.equal(document.getElementById('touch-model-toggle').attributes['aria-pressed'],undefined);
  assert.equal(document.getElementById('touch-model-toggle').textContent,t(interaction?'視点を固定':'固定を解除'));
  const actors=viewer.sceneActors,operationScene=viewer.operationScene;
  const afterUncheck={...state,completed:[]};viewer.setState(afterUncheck);
  assert.equal(viewer.state,afterUncheck);assert.deepEqual(viewer.state.completed,[]);
  assert.equal(viewer.sceneActors,actors);assert.equal(viewer.operationScene,operationScene);
  assert.equal(viewer.operationProgress,.37);assert.equal(viewer.playing,playing);
  assert.equal(viewer.sceneSignature,signature);assert.equal(viewer.lastOperationFocus,2);
  assert.equal(viewer.autoplayPending,false);assert.equal(viewer.interactionEnabled,interaction);
  if(language!=='ja')for(const label of expected)assert(!/[\u3040-\u30ff\u3400-\u9fff]/u.test(label));
  count++;
 }
}
console.log(`PASS: actual viewer localization and completion update methods, ${count} scene/language/gesture cases; captions translated and confirmation revoked without changing playback, scene, focus or touch pause. No renderer, CAD or GPU instantiated.`);
