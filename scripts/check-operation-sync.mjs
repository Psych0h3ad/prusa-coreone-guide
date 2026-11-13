import assert from 'node:assert/strict';
import fs from 'node:fs';
import {registerHooks} from 'node:module';
import * as T from '../dist/vendor/three.module.js';
import {runtimeModule} from './runtime-module.mjs';

// Exercise the shipped director, viewer and language data with six tiny boxes.
// They represent references only: no CAD files, textures, renderer or browser.
registerHooks({resolve(s,c,next){return s==='three'?{url:new URL('../dist/vendor/three.module.js',import.meta.url).href,shortCircuit:true}:next(s,c);}});
const elements=new Map();
function element(tag='DIV'){
 return {nodeType:1,tagName:tag,style:{},childNodes:[],attributes:new Map(),textContent:'',
  hasAttribute(name){return this.attributes.has(name);},getAttribute(name){return this.attributes.get(name);},setAttribute(name,value){this.attributes.set(name,value);},removeAttribute(name){this.attributes.delete(name);},
  append(child){this.childNodes.push(child);child.parent=this;},remove(){if(this.parent)this.parent.childNodes=this.parent.childNodes.filter(c=>c!==this);}
 };
}
const document={documentElement:element('HTML'),querySelectorAll:()=>[],createElement:()=>element(),getElementById(id){if(!elements.has(id))elements.set(id,element());return elements.get(id);}};
const memory=new Map();
Object.assign(globalThis,{document,matchMedia:()=>({matches:false}),location:{href:'https://assembly.example/?lang=ja'},
 localStorage:{getItem:key=>memory.get(key)||null,setItem:(key,value)=>memory.set(key,value)},
 history:{replaceState(_state,_title,url){location.href=String(url);}},
 fetch:async path=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(new URL('../dist/'+path.slice(2).split('?')[0],import.meta.url),'utf8'))})
});
const {FLOWS,PARTS}=await runtimeModule('data');
const {ASSEMBLY_PLAN}=await runtimeModule('assembly-plan');
const {initializeLocalization,setLanguage}=await runtimeModule('i18n');
await initializeLocalization({flows:FLOWS,parts:PARTS,plan:ASSEMBLY_PLAN});
const {AssemblyDirector}=await runtimeModule('assembly-director');
const {PrinterViewer}=await import('../dist/viewer.js');
const v=Object.assign(Object.create(PrinterViewer.prototype),{
 loaded:true,groups:{},meshes:[],printer:new T.Group(),printerOrigin:new T.Vector3(),arrowLayer:new T.Group(),
 camera:new T.PerspectiveCamera(33,390/560,5,5000),controls:{target:new T.Vector3(),update(){}},
 renderer:{domElement:{style:{}}},labels:true,interactionEnabled:false,manualCamera:false,
 defaultBounds:new T.Box3(new T.Vector3(-50,0,-50),new T.Vector3(50,100,50)),
 fasteners:{restore(){},entities:new Map()},applyMaterials(){}
});
v.controls.update=()=>v.camera.lookAt(v.controls.target);v.camera.position.set(300,300,400);v.printer.scale.setScalar(1000);
for(const id of [309,338,262,265,98,90]){
 const mesh=new T.Mesh(new T.BoxGeometry(.01,.01,.01));
 mesh.userData={part:'frame',cadPath:[id],restPosition:new T.Vector3(),restQuaternion:new T.Quaternion()};
 v.group('frame').add(mesh);v.meshes.push(mesh);
}
v.director=new AssemblyDirector(v.meshes);
const state=(flow,id)=>({flow,index:FLOWS[flow].steps.findIndex(s=>s.officialId===id),variant:'screw',comparison:'after',explore:false,completed:[]});
const show=(flow,id)=>{v.setState(state(flow,id));v.autoplayPending=false;};
const numbers=()=>v.sceneActors.map(a=>a.sourceIndex);
const displayed=()=>v.guideLabels.map(({el})=>el.textContent);
const poses=()=>v.meshes.map(m=>[m.visible,...m.position.toArray(),...m.quaternion.toArray()]);
const labelsMatch=()=>{
 const expected=v.sceneActors.map(a=>v.operationScene.plan.actors[a.sourceIndex].label);
 assert.deepEqual(v.sceneActors.map(a=>a.label),expected);
 assert.deepEqual(displayed(),v.sceneActors.map((a,i)=>`${a.sourceIndex+1}  ${expected[i]}`));
};

// One source operation is intentionally absent. Its omission must not relabel
// either subsequent operation or change the source index selected by a button.
show('build',983329);assert.deepEqual(numbers(),[1,2]);
v.seek(.61);v.manualCamera=true;v.playStep(false);
const before={progress:v.operationProgress,active:v.activeOperation,playing:v.playing,poses:poses(),camera:v.camera.position.toArray(),target:v.controls.target.toArray(),tween:v.cameraTween};
for(const language of ['en','cs','de','ja']){
 await setLanguage(language);v.setState({...v.state});v.localize();labelsMatch();
 assert.equal(v.operationProgress,before.progress);assert.equal(v.activeOperation,before.active);assert.equal(v.playing,before.playing);
 assert.deepEqual(poses(),before.poses);assert.deepEqual(v.camera.position.toArray(),before.camera);assert.deepEqual(v.controls.target.toArray(),before.target);
 assert.equal(v.cameraTween,before.tween);assert(v.manualCamera);assert.equal(v.interactionEnabled,false);
 assert.equal(document.getElementById('operation-position').textContent,'3 / 3');
 assert.equal(document.getElementById('operation-title').textContent,v.operationScene.plan.actors[2].label);
}
for(const [requested,compiled]of [[1,0],[2,1]]){
 assert.equal(v.playOperation(requested),true);assert.equal(v.activeOperation,compiled);assert.equal(v.sceneActors[compiled].sourceIndex,requested);
 assert.equal(v.operationProgress,compiled/2);assert(v.playing);v.updateOperationUI(true);
 assert.equal(document.getElementById('operation-position').textContent,`${requested+1} / 3`);
}
const unmoved={progress:v.operationProgress,playing:v.playing,poses:poses()};
for(const requested of [0,-1,3,NaN,undefined]){
 assert.equal(v.playOperation(requested),false,'an unavailable source operation must not play a neighbour');
 assert.equal(v.operationProgress,unmoved.progress);assert.equal(v.playing,unmoved.playing);assert.deepEqual(poses(),unmoved.poses);
}
v.loaded=false;assert.equal(v.playOperation(1),false);v.loaded=true;

// Compilation happened in Japanese before any switch. Visiting cached future
// steps must pick up the current source labels without requiring localize().
let visits=0;
for(const language of ['en','cs','de','ja']){
 await setLanguage(language);
 for(const [flow,id,expected]of [['build',983939,[0,1]],['upgrade',1024023,[0,2]],['build',983329,[1,2]]]){
  show(flow,id);assert.deepEqual(numbers(),expected);labelsMatch();visits++;
  if(flow==='upgrade'){
   assert.equal(v.playOperation(2),true);assert.equal(v.activeOperation,1);v.updateOperationUI(true);
   assert.equal(document.getElementById('operation-position').textContent,'3 / 3');
   const playing=v.playing;assert.equal(v.playOperation(1),false);assert.equal(v.playing,playing);
  }
 }
}
v.clearGuides();for(const m of v.meshes){m.geometry.dispose();m.material.dispose();}
console.log(`PASS: four-language live relabeling and ${visits} cached-step visits retain the source operation, geometry state, playback, camera and gesture choice. Missing first/middle references do not shift labels, guide numbers or button targets. No CAD, WebGL or browser.`);
