import assert from 'node:assert/strict';
import * as T from '../dist/vendor/three.module.js';
import {v} from './check-viewer.mjs';
import {TIES} from '../dist/fastener-data.js';
import {CROSS_FLOW_TIE13} from '../dist/r13-tie-adapter.js';
import {JOINT_DATA} from '../dist/r13-tie-joint.js';
import {createTieLockGeometry} from '../dist/tie-lock.js';

const lock=createTieLockGeometry(),edges=new Map(),p=lock.attributes.position,ix=lock.index.array;
let volume=0;
for(let i=0;i<ix.length;i+=3){
 const a=new T.Vector3().fromBufferAttribute(p,ix[i]),b=new T.Vector3().fromBufferAttribute(p,ix[i+1]),c=new T.Vector3().fromBufferAttribute(p,ix[i+2]);
 assert(b.clone().sub(a).cross(c.clone().sub(a)).length()>.00001,'no degenerate lock faces');volume+=a.dot(b.clone().cross(c))/6;
 for(const [a,b]of [[ix[i],ix[i+1]],[ix[i+1],ix[i+2]],[ix[i+2],ix[i]]]){const key=Math.min(a,b)+':'+Math.max(a,b),e=edges.get(key)||{count:0,direction:0};e.count++;e.direction+=a<b?1:-1;edges.set(key,e);}
}
for(const e of edges.values())assert(e.count===2&&e.direction===0,'lock is one closed, consistently oriented shell');
assert(volume>20&&volume<50,'outward shell winding and plausible lock volume');
const lockMesh=new T.Mesh(lock,new T.MeshBasicMaterial({side:T.DoubleSide}));lockMesh.updateMatrixWorld();
let openingRays=0;
for(const x of [-1.2,0,1.2])for(const z of [1.1,1.35,1.6])for(const y of [-5,5]){const ray=new T.Raycaster(new T.Vector3(x,y,z),new T.Vector3(0,-Math.sign(y),0));assert.equal(ray.intersectObject(lockMesh).length,0,'full-width strip clears both lock lead-ins');openingRays++;}

let surfaces=0,crowns=0,sections=0;
const r13Rows=[],r19Rows=[],coverage=new Set(),r19Coverage=new Set(),toleranceMM=.0002;
const vertex=(g,i)=>new T.Vector3().fromBufferAttribute(g.attributes.position,i);
function rendered(tie,partName){
 const owner=v.sidePtfeCompletion?.wraps.find(w=>w.e===tie&&w.g===tie.mesh.geometry)?.reference||tie,g=tie.mesh.geometry;
 assert.equal(owner.geometry,g,'inspect the current rendered provider, not a dormant source strip');
 if(tie.crossflow13){
  const parts=g.userData.parts,part=parts.find(p=>p.name===(partName||'newattachedStrip'));
  assert(part,'R13 drawn strip part is present');const count=part.vertices/8-1,start=g.index.getX(part.startTriangle*3);
  assert(Number.isInteger(count)&&count>0,'infer real strip rings from the active part');
  if(!partName)assert.equal(count,tie.loop.count,'R13 declared rings match its actual strip');
  const end=part.startTriangle*3+part.triangles*3;
  assert(end<=g.drawRange.start+g.drawRange.count,'part is inside the actual draw range');
  for(let k=part.startTriangle*3;k<end;k++)assert(g.index.getX(k)>=start&&g.index.getX(k)<start+part.vertices,'active strip indices address its packed vertices');
  // The integral head is relocated to a reserved buffer region. Neither its
  // source offsets nor unused capacity may be mistaken for strip positions.
  const head=parts.find(p=>p.name==='newintegralHeadRoot');assert(head,'R13 integral head remains drawn');
  assert.equal(head.vertices,JOINT_DATA.positionsMM.length/3);assert.equal(head.triangles,JOINT_DATA.indices.length/3);
  for(let k=head.startTriangle*3;k<(head.startTriangle+head.triangles)*3;k++)assert(g.index.getX(k)>=tie.headOffset&&g.index.getX(k)<tie.headOffset+head.vertices,'whole head uses its actual relocated range');
  return {g,owner,start,count,textile:false,r13:true,part};
 }
 return {g,owner,start:0,count:owner.loop.count,textile:!!tie.strap,r13:false};
}
function section(r,i){
 const {g,start,count,textile}=r;
 const ids=textile?[i*11,i*11+10,(count+1)*13+i*11,(count+1)*13+i*11+10]:[start+i*8,start+i*8+1,start+i*8+4,start+i*8+5];
 const [a,b,c,d]=ids.map(i=>vertex(g,i));for(const p of[a,b,c,d])assert(p.toArray().every(Number.isFinite),'finite actual strip positions');
 return{width:(a.distanceTo(b)+c.distanceTo(d))*500,gauge:(a.distanceTo(d)+b.distanceTo(c))*500,centre:a.clone().add(b).add(c).add(d).multiplyScalar(.25)};
}
function faces(r,label){
 const {g,start,count,textile}=r,n=g.attributes.normal,p=g.attributes.position;
 for(let i=4;i<count-4;i++){
  const first=textile?i*11+10:start+i*8+1,second=textile?(count+1)*11+i*2:start+i*8+2;
  assert(vertex(g,first).distanceTo(vertex(g,second))<1e-9,'duplicated corners preserve strip dimensions');
  const broad=new T.Vector3().fromBufferAttribute(n,first),edge=new T.Vector3().fromBufferAttribute(n,second);
  assert(broad.toArray().every(Number.isFinite)&&edge.toArray().every(Number.isFinite),'finite rendered face normals');
  assert(Math.abs(broad.dot(edge))<.25,`flat broad face ${label}/${i}`);surfaces++;
 }
}
function measured(r,width,gauge,{tapered=false,label=''}={}){
 const S=Array.from({length:r.count+1},(_,i)=>section(r,i)),remaining=new Float64Array(S.length);
 for(let i=r.count-1;i>=0;i--)remaining[i]=remaining[i+1]+S[i].centre.distanceTo(S[i+1].centre)*1000;
 for(let i=0;i<S.length;i++){
  assert(Math.abs(S[i].gauge-gauge)<toleranceMM,`actual full thickness ${label}/${i}`);
  if(!tapered||remaining[i]>=width*.5+5)assert(Math.abs(S[i].width-width)<toleranceMM,`actual untapered width ${label}/${i}`);
  sections++;
 }
 return{S,remaining,bodyChordMM:remaining[0]};
}
function r13Contract(tie,state){
 tie.update(state,state,1);const r=rendered(tie),g=r.g,q=measured(r,CROSS_FLOW_TIE13.widthMM,CROSS_FLOW_TIE13.thicknessMM,{label:`R13/${state}`});faces(r,`R13/${state}`);
 assert.equal(g.userData.newMaterialMM,CROSS_FLOW_TIE13.newStockMM);assert.equal(g.userData.integralClosedRoot,true);
 assert.equal(r.count,320,'R13 uses its own 320 segments, not the old 192 observer');
 // This accepted field has a full-width square terminal, not the legacy
 // tapered free end. The active cap, full gauge and offcut are all checked.
 assert.equal(r.part.triangles,r.count*8+2,'integral-root strip has its terminal cap');
 assert(Math.abs(q.S.at(-1).width-2.4)<toleranceMM,'R13 full-width terminal contract');
 let offcut=null;if(state===5||state===7){const o=rendered(tie,'newTrimOffcut'),z=measured(o,2.4,.5,{label:`R13 offcut/${state}`});assert.equal(o.part.triangles,o.count*8+4,'detached offcut retains both caps');assert.equal(o.count,128);assert(g.userData.liveNewStripMM<100);offcut={segments:o.count,bodyChordMM:z.bodyChordMM};}
 r13Rows.push({state,segments:r.count,bodyChordMM:q.bodyChordMM,allocatedBodyMM:g.userData.liveNewStripMM-3,fullWidthTipMM:q.S.at(-1).width,gaugeMM:q.S.at(-1).gauge,offcut});
}
for(const def of TIES){
 const tie=v.fasteners.entities.get(def.id);assert(tie,`tie ${def.id} exists`);coverage.add(def.id);
 if(tie.crossflow13){for(const state of[0,1,2,3,4,5,6,7])r13Contract(tie,state);continue;}
 for(const state of[2,4]){
  tie.update(state,state,1);const r=rendered(tie);faces(r,`${def.id}/${state}`);
  if(!def.strap&&!def.apexHead){
   const route=r.owner.routeModel,points=route.points;assert(Array.isArray(points),'legacy crown path remains present');
   const projection=points.map(p=>p.clone().sub(route.origin).dot(route.V)),crown=projection.indexOf(Math.max(...projection)),tangent=(a,b)=>points[b].clone().sub(points[a]).normalize();
   assert(tangent(crown-1,crown).angleTo(tangent(crown,crown+1))<.12,`rounded crown ${def.id}/${state}`);crowns++;
  }
 }
 if(def.id.startsWith('base')){
  tie.update(2,2,1);assert(tie.mesh.userData.flexState.rise>35);assert(Math.abs(tie.mesh.userData.flexState.tail-9)<.001,'manual 2.3 engages only the first teeth');
  const r=tie.routeModel,tip=r.at(r.length),tail=tip.clone().sub(r.entry);assert(Math.abs(tail.dot(r.U))<1e-8&&Math.abs(tail.dot(r.W))<1e-8&&tail.dot(r.V)>0,'base tail continues upward through the top lock, matching manual 2.3');
 }
 if(!def.strap){
  tie.update(2,2,1);const r=rendered(tie),q=measured(r,def.width||2.4,def.thickness||.5,{tapered:true,label:def.id});
  assert(Math.abs(q.S.at(-1).width-.72)<.0001,'legacy rounded tapered free tip');
  const full=q.remaining.findLastIndex(x=>x>=5.1);assert(full>=0&&q.S[full].width>2.35,'legacy taper stays within final five millimetres');
  tie.update(5,5,1);const cut=rendered(tie);assert(Math.abs(section(cut,cut.count).width-2.4)<.0001,'legacy trimmed end has a full-width flat cut');
 }
 if(['arm2','arm3','free1','free2'].includes(def.id)){
  for(const t of[0,.5,1]){
   tie.update(1,4,t);const r=rendered(tie);assert.equal(r.owner.routeModel.def.naturalPtfeTextile,true,'R19 live provider is actually exercised');
   const q=measured(r,10,.65,{tapered:true,label:`R19 ${def.id}/${t}`});faces(r,`R19 ${def.id}/${t}`);
   const full=q.remaining.findLastIndex(x=>x>=5.1);assert(full>=0&&Math.abs(q.S[full].width-10)<toleranceMM,'full textile width up to the rounded last five millimetres');
   assert(Math.abs(q.S.at(-1).width-.02)<toleranceMM,'R19 rounded textile tip is retained');
   assert.equal(tie.mesh.userData.flexState.materialLength,100);assert.equal(tie.mesh.userData.flexState.cut,false,'textile is laid back, not cut');
   r19Rows.push({id:def.id,t,segments:r.count,bodyChordMM:q.bodyChordMM,tipWidthMM:q.S.at(-1).width});r19Coverage.add(def.id);
  }
 }
}
assert.equal(coverage.size,TIES.length,'no tie family is omitted');assert.equal(r13Rows.length,8,'every R13 legacy state0..7 is checked');assert.equal(r19Coverage.size,4,'all four R19 live textile providers are checked');
console.log(JSON.stringify({surfaces,crowns,sections,ties:coverage.size,openingRays,lockVolume_mm3:volume,r13:r13Rows,r19:r19Rows,result:'PASS: legacy lock/crowns/tapers retained; actual packed R13 full-gauge flat strip, all0..7, terminal caps/offcuts; all four live R19 textile strips with measured width/gauge/rounded tips. Finite Node geometry test, not GPU/physical clearance certification.'}));
