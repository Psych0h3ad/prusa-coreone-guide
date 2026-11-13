import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from '../dist/vendor/three.module.js';
import {v}from './check-viewer.mjs';
import {SERVICE_TASKS}from '../dist/maintenance-data.js';
import {XBUDDY_TASK}from '../dist/xbuddy-service-data.js';
import {installMaintenanceModel}from '../dist/maintenance-model.js';
const ids=['box1','box2','box4','box5'],baseline=new Map(ids.map(id=>{const e=v.fasteners.entities.get(id);e.update(5,5,1);return[id,e.geometry.attributes.position.array.slice()];}));
let language=0;const binding=installMaintenanceModel(v,[...SERVICE_TASKS,XBUDDY_TASK],x=>x[language]);
const choose=n=>{v.setState({flow:'service',index:binding.indexOf('xbuddy',n-1),comparison:'after',variant:'screw',explore:false,completed:[]});v.autoplayPending=false;v.seek(1);};
const report=[];
choose(22);
assert.equal(v.sceneActors.length,4);
for(const id of ids){
 const e=v.fasteners.entities.get(id),route=e.openPreparation,position=e.geometry.attributes.position;
 assert(route&&e.mesh.visible);assert.equal(e.mesh.userData.flexState.phase,'prepared');assert.equal(e.mesh.userData.flexState.closed,0);
 const head=route.at(0),tip=route.at(route.length);assert(head.x<e.p[0]-e.span+2,'head is outside the board edge');assert(tip.x>e.p[0]+e.span+35,'unlatched tip lies across the board');assert(tip.y<e.p[1]+8,'tail is not projecting toward the viewer');
 for(const x of[e.p[0]-e.span,e.p[0]+e.span])assert(route.points.some(p=>Math.abs(p.x-x)<1e-9&&Math.abs(p.y-(e.p[1]-e.depth+.85))<1e-9),'both original passage datums retained');
 const points=Array.from({length:4097},(_,k)=>route.at(route.length*k/4096)),length=points.slice(1).reduce((n,p,k)=>n+p.distanceTo(points[k]),0);assert(Math.abs(length-route.length)<.005,'prepared routing preserves strip length');
 for(let k=e.headOffset;k<position.count;k++)assert(position.getX(k)*1000<e.p[0]-e.span+4,'actual lock geometry stays beyond the board edge');
 report.push({id,head:head.toArray(),tip:tip.toArray(),stripLength_mm:route.length,sampledLength_mm:length});
}
for(let k=0;k<=64;k++){choose(22);v.seek(k/64);const actor=Math.min(3,Math.floor(k/64*4));for(let i=0;i<4;i++){const e=v.fasteners.entities.get(ids[i]);assert.equal(e.mesh.visible,i<=actor,'later ties wait for their operation');if(i<=actor){assert.equal(e.mesh.userData.flexState.stripLength,100,'feeding does not change nylon material length');assert.equal(e.mesh.userData.flexState.closed,0,'preparation never latches the head');}}}
choose(22);const seated=ids.map(id=>v.fasteners.entities.get(id).geometry.attributes.position.array.slice());choose(23);for(let i=0;i<4;i++)assert.deepEqual(v.fasteners.entities.get(ids[i]).geometry.attributes.position.array,seated[i],'following step retains the threaded open shape');
choose(22);v.seek(.45);const progress=v.operationProgress,camera=v.camera.position.clone(),midway=ids.map(id=>v.fasteners.entities.get(id).geometry.attributes.position.array.slice());
for(language of[1,2,3,0]){binding.localize();v.localize();assert(v.sceneActors.every(a=>a.label.startsWith(['結束バンド','Tie','Páska','Kabelbinder'][language])));assert.equal(v.operationProgress,progress);assert(v.camera.position.equals(camera));for(let i=0;i<4;i++)assert.deepEqual(v.fasteners.entities.get(ids[i]).geometry.attributes.position.array,midway[i],'language change retains threaded geometry');}
choose(28);for(const id of ids.slice(0,3))assert.equal(v.fasteners.entities.get(id).mesh.userData.flexState.phase,'prepared');assert.equal(v.fasteners.entities.get('box5').mesh.userData.flexState.closed,1,'bottom tie is already tightened at27');
choose(21);for(const id of ids)assert.equal(v.fasteners.entities.get(id).openPreparation,null);
v.setState({flow:'build',index:0,comparison:'after',variant:'screw',explore:false,completed:[]});
for(const id of ids){const e=v.fasteners.entities.get(id);assert.equal(e.openPreparation,null);e.update(5,5,1);assert.deepEqual(e.geometry.attributes.position.array,baseline.get(id),'source assembly tie geometry restored after leaving service');}
const dir=process.env.PRUSA_QA_DIR||'research/quality/service-20261105-63';fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(dir+'/tie-check.json',JSON.stringify({prepared:report,threadingSamples:65,languages:4,stageHandover:true,restoresSource:true,limits:'Threading and prepared state implemented. Cutting and closure service animations and collision contacts remain flagged; physical collision and visual audits are separate.'},null,2)+'\n');
console.log('PASS: four prepared open ties preserve strip length and passage datums; heads outside, tips over the board, assembly geometry restored. Service tie animations remain incomplete.');
