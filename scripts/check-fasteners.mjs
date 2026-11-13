import assert from 'node:assert/strict';
import * as T from '../dist/vendor/three.module.js';
import {v} from './check-viewer.mjs';
import {FLOWS} from '../dist/data.js';
import {TIES} from '../dist/fastener-data.js';
const show=(ch,n,p=1)=>{v.setState({flow:'build',index:FLOWS.build.steps.findIndex(s=>s.chapter===ch-1&&s.officialStep===n),variant:'screw',comparison:'after',explore:false,completed:[]});v.autoplayPending=false;v.seek(p);};
const entity=id=>v.fasteners.entities.get(id),state=id=>entity(id).mesh.userData.flexState;
const visible=id=>entity(id).mesh.visible;
show(2,2);assert(!visible('baseL1'),'ties are absent before insertion');
show(2,3);for(const side of ['L','R'])for(let i=1;i<=3;i++){const id=`base${side}${i}`;assert(visible(id));assert.equal(state(id).closed,1);assert(state(id).rise>35&&state(id).rise<45,'manual 2.3 leaves a tall loose loop');assert(Math.abs(state(id).tail-9)<.001,'only the first teeth are engaged');}
show(3,11);assert.deepEqual(v.sceneActors.map(a=>a.flex[0]),['box1','box2','box4','box5']);for(const id of ['box1','box2','box4','box5'])assert.equal(state(id).closed,0,'box ties are prethreaded, not tightened');
assert(!entity('box3')&&!entity('box6'),'unused perforations have no band');
show(3,22);assert(v.sceneActors[0].nodes.includes(entity('box1').mesh),'case transfer includes its bands');
show(3,23);assert(v.sceneActors[0].nodes.includes(entity('box5').mesh),'keyhole seating carries the bands');
show(3,35);assert(v.sceneActors[0].nodes.includes(entity('thermistor').mesh),'fan-grid tie transfers with rear panel');
show(3,45);for(let i=1;i<=3;i++){assert(Math.abs(state(`baseR${i}`).tail-2.5)<1e-9);assert.equal(state(`baseL${i}`).rise,entity(`baseL${i}`).routeModel.looseHeight,'left bands still loose');}
show(3,46);for(let i=1;i<=3;i++){assert(state(`baseL${i}`).rise>=14,'left loop clears the 12 mm-deep routed harness and remains adjustable');assert(Math.abs(state(`baseL${i}`).tail-2.5)<1e-9);}
show(3,49);assert(Math.abs(state('box5').tail-2.5)<1e-9);for(const id of ['box1','box2','box4'])assert.equal(state(id).closed,0);
show(6,56);for(const id of ['box1','box2','box4','box5']){assert.equal(state(id).closed,1);assert(Math.abs(state(id).tail-2.5)<1e-9);}assert(visible('mainRear'));
show(3,11,.2);assert.equal(state('box1').closed,0,'rewinding later wiring restores open ties');assert(!visible('mainRear'));
// Shape changes are deformations, not a translated rigid proxy. Seeking must
// restore vertex buffers as well as visibility and must keep their identities.
show(3,49,.8);const e=entity('box5'),g=e.geometry,buffer=g.attributes.position.array,shape=Float32Array.from(buffer);
v.seek(.99);const second=Float32Array.from(buffer);const differences=Array.from({length:buffer.length/3},(_,i)=>new T.Vector3(buffer[i*3]-shape[i*3],buffer[i*3+1]-shape[i*3+1],buffer[i*3+2]-shape[i*3+2]));assert(differences.some(d=>d.distanceTo(differences[0])>.01),'strip bends and the free end changes length');
v.seek(0);v.seek(.99);assert.deepEqual(buffer,second);assert.equal(g.attributes.position.array,buffer);assert.equal(e.geometry,g);
// CAD datums measured independently from the rendered bands. Both legs go
// through the real plate holes; the root of the lock stays above the plate.
for(const side of ['L','R'])for(let i=1;i<=3;i++){
 const tie=entity(`base${side}${i}`),x=side==='L'?-180.8:180.8,y=[-117.1,2.9,122.9][i-1];tie.update(2,2,1);
 for(const dx of [-5,5])assert(Math.min(...tie.routeModel.points.map(p=>p.distanceTo(new T.Vector3(x+dx,y,0))))<.27,'base leg must pass an actual CAD hole');
 assert(tie.loop.points[0].z< -35,'manual 2.3 places the loose lock at the top of the loop');
}
assert.equal(entity('motorY').p[2],350.3,'right motor uses its cable window');
assert.equal(entity('motorX').p[0],-192.635,'left motor uses its rear corner clip');
assert.deepEqual(entity('doorWire').p,[-186,-191.2,347.65],'door lead uses the tensioner slots');
for(const def of TIES){const tie=entity(def.id),buffer=tie.geometry.attributes.position.array;
 for(const [from,to]of [[0,1],[0,2],[1,4],[2,7],[1,5]])for(const t of [0,.25,.68,.8,.93,.94,1]){
  tie.update(from,to,t);const s=tie.mesh.userData.flexState;
  for(const name of ['position','normal'])assert([...tie.geometry.attributes[name].array].every(Number.isFinite),`finite ${def.id}`);
  const length=tie.loop.points.slice(1).reduce((sum,p,i)=>sum+p.distanceTo(tie.loop.points[i]),0);
  assert(Math.abs(length-s.stripLength)<1.2,`material length ${def.id} ${from}:${to}:${t}: ${length}/${s.stripLength}`);
  if(t<.94)assert.equal(s.stripLength,100,'feeding and pulling must conserve the strip');
  assert.equal(tie.geometry.attributes.position.array,buffer);
 }
}
show(4,14);assert(visible('rgbWire'));for(let i=1;i<=3;i++)assert(Math.abs(state(`rgb${i}`).tail-2.5)<1e-9);
show(5,68);for(let i=1;i<=3;i++)assert.equal(state(`xy${i}`).rise,entity(`xy${i}`).routeModel.looseHeight);assert(!visible('xyWires'));
show(5,71);assert(visible('xyWires'));for(let i=1;i<=3;i++)assert(Math.abs(state(`xy${i}`).tail-2.5)<1e-9);
show(6,40);assert(visible('mainSleeve'));assert(!visible('ptfeTube'));assert.equal(state('arm1').to,6,'first band retains wrapped excess');
show(6,42);assert(visible('ptfeTube'));assert(!v.sceneActors.some(a=>a.flex?.includes('arm1')),'PTFE does not enter first band');assert(Math.abs(new T.Vector3(...entity('free1').p).distanceTo(new T.Vector3(...entity('free2').p))-100)<1e-8);
// At each handover only the band being worked on may remain open. Previous
// bands retain the tube; future bands must not be staged around the bundle.
show(6,42,0);const ptfeActors=v.sceneActors;
for(let i=0;i<4;i++){
 const id=['arm2','arm3','free1','free2'][i],open=ptfeActors.findIndex(a=>a.flex?.includes(id)&&a.to===1),close=ptfeActors.findIndex(a=>a.flex?.includes(id)&&a.to===4);
 assert(open>=0&&close>open,'prepare and fasten every band separately');
 show(6,42,(open+1-.001)/ptfeActors.length);
 assert(visible('ptfeTube')&&state('ptfeTube').to===(i<2?4:5),'lay the tube on the main cable, then pass its end through the guide before fastening the free bands');
 for(const [j,id]of ['arm2','arm3','free1','free2'].entries()){
  assert.equal(visible(id),j<=i,'only introduce the current band');
  if(j<i)assert(state(id).closed===1&&state(id).to===4,'finish each band before introducing the next');
  if(j===i)assert.equal(state(id).closed,0,'the current band is ready to feed through its slit');
 }
  show(6,42,(close+1-.001)/ptfeActors.length);
 assert(state(['arm2','arm3','free1','free2'][i]).closed>.999,'complete the current fastening');
}
for(const id of ['arm1','arm2','arm3','free1','free2']){const tie=entity(id);assert(tie.strap&&tie.width===10,'all five arm bands use wide hook-and-loop straps');tie.update(1,4,.7999);const before=tie.loop.points.map(p=>p.clone());tie.update(1,4,.8001);assert(Math.max(...tie.loop.points.map((p,i)=>p.distanceTo(before[i])))<.1,'wound excess cannot jump at 80%');}
for(const id of ['arm1','arm2','arm3','free1','free2']){
 const tie=entity(id);tie.update(0,1,1);const open=tie.geometry.attributes.position.array.slice();
 assert.equal(state(id).start,0,'the textile end remains attached, without a long translated root');
 assert.equal(state(id).closed,0,'the prepared loop has not yet been threaded through its slit');
 assert(state(id).loopLength>state(id).materialLength+7.9,'the returning tip stops short of the slit before feeding');
 assert(tie.routeModel.entry.distanceTo(tie.routeModel.head)>1.9,'root and returning passage are distinct');
 tie.update(1,4,0);assert.deepEqual(tie.geometry.attributes.position.array,open,'prepared and closing stages have identical handover geometry');
 for(let k=0;k<=40;k++){tie.update(1,4,k/40);assert.equal(state(id).start,0,'tightening bends the loop instead of translating a rigid strip');}
 tie.update(1,4,1);assert(state(id).tail>0&&state(id).closed===1,'the excess wraps outside the closed loop');
}
show(7,22);assert.equal(state('sensor').rise,9);assert(Math.abs(state('sensor').tail-2.5)<1e-9);
show(7,23);assert.equal(state('bundle1').rise,11);assert.equal(state('bundle2').rise,11);
let motions=0;
for(const scene of v.director.compile('build','screw'))for(const actor of scene.actors)if(actor.flex?.length===1&&entity(actor.flex[0]).span){
 const tie=entity(actor.flex[0]);motions++;
 for(let k=0;k<=40;k++){
  tie.update(actor.fromStates[tie.id]||0,actor.to,k/40);const p=tie.bandSweep?tie.loop.points.map(p=>tie.bandSweep.map(p.clone())):tie.loop.points,arc=[0];for(let i=1;i<p.length;i++)arc.push(arc.at(-1)+p[i].distanceTo(p[i-1]));
  const limit=tie.strap?.59:.44;
  for(let i=0;i<p.length;i++)for(let j=i+1;j<p.length;j++)if(arc[j]-arc[i]>3&&p[i].distanceTo(p[0])>4&&p[j].distanceTo(p[0])>4)assert(p[i].distanceToSquared(p[j])>=limit*limit,`strip self crossing ${tie.id} ${actor.to} ${k}/40`);
 }
}
assert.equal(motions,54,'all build band motions are covered');
// Closing is an axial insertion. A strip with an already protruding tail must
// never slide sideways into the lock. Test both a newly threaded and an open band.
for(const def of TIES.filter(d=>!d.strap))for(const from of [0,1]){
 const tie=entity(def.id),r=tie.routeModel;let entered=false;
 for(let i=0;i<=400;i++){
  const q=r.pose(from,2,i/400),tip=r.at(q.start+q.length),endOffset=r.entry.clone().sub(r.head).dot(r.W);
  if(q.start+q.length>=r.loopLength-1e-5){
   assert(Math.abs(q.start)<1e-8,`${def.id}: head must be seated before insertion`);
   assert(Math.abs(endOffset)<1e-8,`${def.id}: tip must be aligned before entering the lock`);entered=true;
   if(def.tailDirection&&q.tail>0){const d=Math.min(q.tail,def.approachLead??3),axial=r.at(r.loopLength+d).sub(r.entry);assert(Math.abs(axial.dot(r.V))<1e-7&&Math.abs(axial.dot(r.W))<1e-7,`${def.id}: excess exits the lock on-axis before bending away`);}
   const tail=tip.clone().sub(r.entry);if(!def.tailDirection&&q.tail>0)assert(Math.abs(tail.dot(def.apexHead?r.U:r.V))<1e-8&&Math.abs(tail.dot(r.W))<1e-8,`${def.id}: tail feeds along the lock axis`);
  }else if(entered)assert.fail(`${def.id}: tip withdrew from the lock`);
 }
 assert(entered);r.pose(from,2,1);assert(r.length-r.loopLength>=9-.001,'loose band retains a grippable tail');if(!def.apexHead)assert(r.height<=def.loose,'loose loop must not consume the entire strip');
}
console.log('PASS: paired CAD openings, deforming strips, retained buffers, reversible geometry, staged loose/tight/trim states, cable threading, workpiece handoffs, PTFE first-band exclusion and 100 mm spacing. No GPU or mechanical clearance certification.');
