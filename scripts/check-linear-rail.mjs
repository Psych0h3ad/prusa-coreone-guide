// SPDX-License-Identifier: MIT
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {registerHooks} from 'node:module';
import * as T from '../dist/vendor/three.module.js';
const page=new URL('../dist/index.html',import.meta.url),map=JSON.parse(fs.readFileSync(page,'utf8').match(/<script type="importmap">([\s\S]*?)<\/script>/)[1]).imports;
const aliases=new Map(Object.entries(map).map(([k,v])=>[k.startsWith('.')?new URL(k,page).href:k,new URL(v,page).href]));
registerHooks({resolve(s,c,next){if(s==='three')return{url:new URL('../dist/vendor/three.module.js',import.meta.url).href,shortCircuit:true};const r=next(s,c),url=aliases.get(r.url)||aliases.get(s);return url?{url,shortCircuit:true}:r;}});
const {LINEAR_RAIL:D}=await import('../dist/linear-rail-data.js'),{LINEAR_RAIL_SOURCES:S}=await import('../dist/linear-rail-source.js'),{LINEAR_RAIL_LABELS:L}=await import('../dist/linear-rail-labels.js'),{linearRailPlan}=await import('../dist/linear-rail-plan.js'),{rigidMotion}=await import('../dist/assembly-director.js');
for(const edition of ['original2251','plus']){
 const source=S[edition],plans=Object.fromEntries(Object.entries(source).map(([stage,s])=>[stage,linearRailPlan({chapter:5,workspace:stage==='install'?'xy':'rail',seed:[],actors:stage==='install'?[{scope:'rail',axis:[0,-1,0]}]:[],workpiecePoses:[]},edition,s.stepID,{prepare:32,place:33,retain:34,installPrep:35,install:36,remove:37,align:76}[stage])]));
 assert.deepEqual(Object.values(plans).map(p=>p.actors.length),[0,6,10,0,7,2,7]);
 const move=plans.place.actors.findIndex(a=>a.refs?.includes(D.carriage));assert.equal(move,edition==='original2251'?5:1,'preserve edition-specific carriage order');
 assert.deepEqual(plans.align.actors.slice(1).map(a=>a.refs[0]),[538,528,536,530,534,532],'official photo order is outside pairs before inside pairs');
 assert(plans.retain.actors.slice(0,2).every(a=>a.refs.length===1&&!a.refs.includes(D.carriage)),'one pin at a time without moving the carriage');
 assert(plans.retain.actors.filter(a=>a.spin).every(a=>!a.showBefore),'future screws must not occupy safety-pin holes');
 for(const p of Object.values(plans))for(const a of p.actors){
  if(a.linearRailSource){const s=a.linearRailSource[edition];assert(s.lineIDs.every(id=>Number.isInteger(id)&&source[Object.keys(source).find(k=>source[k].stepID===s.stepID)].lineIDs.includes(id)));}
  if(a.spin){assert(a.spin<0);assert(a.threadPivot?.length===3);}
  if(a.label&&a.label!=='リニアレールアセンブリ')assert(L[a.label]?.every(t=>typeof t==='string'&&t.trim()),'all new operation labels have EN/CS/DE');
 }
 const mount=plans.install.actors[1],actor={...mount,path:mount.waypoints.map(p=>new T.Vector3(...p).multiplyScalar(.001)),box:new T.Box3(new T.Vector3(),new T.Vector3(1,1,1))};
 assert(rigidMotion(actor,.2).rotation.angleTo(new T.Quaternion())<1e-12,'do not spin during the free approach before thread contact');
 assert.deepEqual(rigidMotion(actor,1).offset.toArray(),[0,0,0]);
}
const raw=fs.readFileSync(new URL('../dist/assets/linear-rail/safety-pin.bin',import.meta.url));assert.equal(raw.length,172800);const manifest=JSON.parse(fs.readFileSync(new URL('../dist/assets/linear-rail/safety-pin.json',import.meta.url),'utf8'));assert.equal(manifest.triangles,2400);assert.equal(manifest.solids,1);
assert.equal(D.tightening.length,6);assert.equal(new Set(D.tightening).size,6);
console.log('PASS: both rail source orders, one-at-a-time pin ownership, six native mounting screws, loose/final tightening, exact endpoints, thread approach, three translations and complete pin geometry.');
