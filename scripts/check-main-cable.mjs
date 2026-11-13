import assert from 'node:assert/strict';
import {createHash}from 'node:crypto';
import {pathToFileURL}from 'node:url';
import * as T from 'three';
import {v}from './check-viewer.mjs';
import {FLOWS}from '../dist/data.js';

const visible=mesh=>{for(let p=mesh;p;p=p.parent)if(!p.visible)return false;return true;};
const materials=mesh=>[mesh.material].flat();
const vec=p=>new T.Vector3(...p),mm=.001,geometryToleranceMM=.001;
const stageIndex=step=>FLOWS.build.steps.findIndex(s=>s.chapter===5&&s.officialStep===step);
function select(step,progress=1){
 v.setState({flow:'build',index:stageIndex(step),comparison:'after',variant:'screw',explore:false,completed:[]});
 v.autoplayPending=false;v.seek(progress);v.scene.updateMatrixWorld(true);
}
// Empty DOM obstacles in the existing Node scene mock; actual browser control
// and overlay hit tests remain separate. The adopted camera needs this API.
function nodeStageLayout(){
 v.container.getBoundingClientRect=()=>({left:0,top:0,right:v.container.clientWidth,bottom:v.container.clientHeight,width:v.container.clientWidth,height:v.container.clientHeight});
 v.container.closest=()=>({querySelectorAll:()=>[]});
}
function nearest(curve,target){
 let best=0,distance=Infinity;
 for(let i=0;i<=256;i++){const d=curve.getPointAt(i/256).distanceToSquared(target);if(d<distance){best=i/256;distance=d;}}
 let lo=Math.max(0,best-1/256),hi=Math.min(1,best+1/256);
 for(let i=0;i<45;i++){const a=(2*lo+hi)/3,b=(lo+2*hi)/3;if(curve.getPointAt(a).distanceToSquared(target)<curve.getPointAt(b).distanceToSquared(target))hi=b;else lo=a;}
 const u=(lo+hi)/2;return {u,distanceMM:curve.getPointAt(u).distanceTo(target)};
}
export function assertMaterialLength(curve,expectedMM){
 assert(Math.abs(curve.getLength()-expectedMM)<geometryToleranceMM,'material length reported by the current curve is retained');
 let measured=0,previous=curve.getPointAt(0);
 for(let i=1;i<=2048;i++){const point=curve.getPointAt(i/2048);assert(point.toArray().every(Number.isFinite),'finite material curve');measured+=point.distanceTo(previous);previous=point;}
 assert(Math.abs(measured-expectedMM)<geometryToleranceMM,'independently sampled material length is retained');
 return measured;
}
function ringCentre(attribute,start,sides,scale=1){
 const centre=new T.Vector3();for(let i=0;i<sides;i++)centre.add(new T.Vector3().fromBufferAttribute(attribute,start+i));return centre.multiplyScalar(scale/sides);
}
export function assertJacket(model,radiusMM){
 const {jacket}=model.current,g=model.jacketMesh.geometry,p=g.attributes.position,n=g.attributes.normal;
 const sides=g.parameters.radialSegments,segments=g.parameters.tubularSegments;
 assert.equal(g.parameters.closed,false,'the sleeve cut remains open');assert.equal(g.parameters.radius,radiusMM);
 assert.deepEqual(model.jacketMesh.scale.toArray(),[mm,mm,mm],'jacket CAD-mm geometry retains its unit scale');
 for(let i=0;i<=segments;i++){
  const centre=ringCentre(p,i*(sides+1),sides),path=jacket.getPointAt(i/segments);
  assert(centre.distanceTo(path)<geometryToleranceMM,'rendered sleeve ring follows the physical material curve');
  for(let j=0;j<=sides;j++){
   const k=i*(sides+1)+j,radial=new T.Vector3().fromBufferAttribute(p,k).sub(centre),normal=new T.Vector3().fromBufferAttribute(n,k);
   assert(Math.abs(radial.length()-radiusMM)<geometryToleranceMM,'full circular jacket radius is retained at every ring');
   assert(Math.abs(normal.length()-1)<1e-5&&normal.dot(radial.clone().normalize())>.9999,'jacket normals follow the actual circular section');
  }
 }
 // Tube faces span adjacent material rings; an added cap cannot stand in for
 // the open cut. This checks actual indices, not a geometryRole label.
 for(let i=0;i<g.index.count;i+=3){const rings=[0,1,2].map(j=>Math.floor(g.index.getX(i+j)/(sides+1)));assert.equal(Math.max(...rings)-Math.min(...rings),1,'sleeve faces join adjacent rings without a filled cut');}
}
export function assertCapturedWires(model,radiusMM){
 const lead=model.lead,{wire,jacket}=model.current,root=wire.getPointAt(0),cut=jacket.getPointAt(0);
 const atCut=nearest(wire,cut),atRoot=nearest(jacket,root);
 assert(atCut.distanceMM<geometryToleranceMM,'actual wire centreline passes through the sleeve cut');
 assert(atRoot.distanceMM<geometryToleranceMM&&atRoot.u>0&&atRoot.u<1,'wire roots remain captured inside the actual jacket');
 // Jacket runs from its cut back towards the incoming loom. Wires run from
 // their captured roots out through that cut, so their tangents oppose it.
 assert(wire.getTangentAt(atCut.u).dot(jacket.getTangentAt(0))<-.9999,'conductors leave the sleeve cut along its axis');
 assert(wire.getTangentAt(0).dot(jacket.getTangentAt(atRoot.u))<-.9999,'captured roots share the jacket material direction');
 assert(wire.getPointAt(1).distanceTo(lead.tail)<geometryToleranceMM,'connector wire-entry anchor is fixed');
 assert.equal(lead.socket.pins,22);assert.equal(lead.packedStrands.length,22);
 const g=lead.geometry,p=g.attributes.position,n=g.attributes.normal,groups=g.groups.filter(group=>group.materialIndex<lead.socket.pins);
 assert.equal(groups.length,22,'all captured wire groups remain rendered');
 for(let conductor=0;conductor<22;conductor++){
  const group=groups[conductor],indices=Array.from({length:group.count},(_,i)=>g.index.getX(group.start+i));
  const first=Math.min(...indices),last=Math.max(...indices),strand=lead.packedStrands[conductor],perRing=(last-first+1)/strand.length,sides=perRing-1;
  assert(Number.isInteger(perRing)&&sides>=4,'wire group has complete material rings');
  const captured=ringCentre(p,first,sides,1000);
  assert(captured.distanceTo(root)<radiusMM-.5,'each rendered wire root starts inside the sleeve cross-section');
  assert.equal(lead.mesh.material[conductor].color.getHexString(),new T.Color(lead.definition.colors[conductor]).getHexString(),'conductor material identity is retained');
  for(let i=0;i<strand.length;i++){
   const centre=ringCentre(p,first+i*perRing,sides,1000);
   assert(centre.distanceTo(strand[i])<geometryToleranceMM,'every rendered wire ring follows its continuous strand');
   if(i)assert(strand[i].distanceTo(strand[i-1])>1e-8,'conductor material stations are not collapsed');
   for(let j=0;j<perRing;j++){
    const k=first+i*perRing+j,point=new T.Vector3().fromBufferAttribute(p,k).multiplyScalar(1000),normal=new T.Vector3().fromBufferAttribute(n,k);
    assert(point.toArray().every(Number.isFinite)&&Math.abs(point.distanceTo(centre)-.26)<geometryToleranceMM,'actual conductor radius is retained');
    assert(Math.abs(normal.length()-1)<1e-5,'finite unit conductor normals');
   }
  }
  for(let i=0;i<indices.length;i+=3){const rings=indices.slice(i,i+3).map(k=>Math.floor((k-first)/perRing));assert.equal(Math.max(...rings)-Math.min(...rings),1,'wire triangles join adjacent material stations');}
 }
 return {cutGapMM:atCut.distanceMM,rootGapMM:atRoot.distanceMM};
}
export function assertDuctEnclosure(viewer,curve,matrix){
 const channel=viewer.director.resolve([859,860]),ray=new T.Raycaster(),rows=[];
 assert(channel.length>=2&&channel.every(visible),'probe the actual installed mount and closed cover');
 for(const x of [10,15,20]){
  let point,best=Infinity;for(let i=0;i<=2048;i++){const p=curve.getPointAt(i/2048),d=Math.abs(p.x-x);if(d<best){point=p;best=d;}}
  assert(best<.1,'actual sleeve crosses each native duct section');const origin=point.clone().applyMatrix4(matrix);
  for(const direction of [[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]]){
   ray.set(origin,vec(direction).transformDirection(matrix));ray.near=.01;ray.far=15;
   const hit=ray.intersectObjects(channel,false)[0];assert(hit,`main loom must be enclosed by CAD duct at X=${x}, ray=${direction}`);
   rows.push({x,direction,distanceMM:hit.distance,cad:hit.object.userData.cadPath?.at(-1)});
  }
 }
 return rows;
}
function snapshot(meshes){
 return meshes.map(mesh=>{const h=createHash('sha256');for(const a of [...Object.values(mesh.geometry.attributes),mesh.geometry.index].filter(Boolean))h.update(Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength));return {mesh:mesh.uuid,geometry:h.digest('hex'),matrix:mesh.matrixWorld.toArray(),material:materials(mesh).map(m=>[m.color?.getHex(),m.opacity,m.transparent,m.side,m.depthWrite,m.roughness,m.metalness])};});
}
function mouthProjection(viewer,model){
 const mesh=model.jacketMesh,point=model.current.jacket.getPointAt(0),world=point.clone().applyMatrix4(mesh.matrixWorld),screen=world.clone().project(viewer.camera);
 // Preserve the old +/-3mm inspection span, now in the actual cut plane.
 // Inspect its minor axis so an edge-on opening cannot pass on width alone.
 const g=mesh.geometry,sides=g.parameters.radialSegments,centre=ringCentre(g.attributes.position,0,sides),ring=Array.from({length:sides},(_,i)=>new T.Vector3().fromBufferAttribute(g.attributes.position,i).sub(centre).multiplyScalar(3/g.parameters.radius).add(centre).applyMatrix4(mesh.matrixWorld).project(viewer.camera));
 const diameters=ring.slice(0,sides/2).map((p,i)=>Math.hypot((p.x-ring[i+sides/2].x)*viewer.container.clientWidth/2,(p.y-ring[i+sides/2].y)*viewer.container.clientHeight/2));
 const eye=viewer.camera.position.clone().applyMatrix4(mesh.matrixWorld.clone().invert()),outward=model.current.jacket.getTangentAt(0).negate();
 const eyeDelta=eye.sub(point);return {screen:screen.toArray(),inspectionSpanMM:6,minorDiameterPX:Math.min(...diameters),axialEyeDistanceMM:eyeDelta.dot(outward),intoOpeningDot:eyeDelta.normalize().dot(outward)};
}
export function runMainCableChecks(){
 nodeStageLayout();const model=v.mainLoom.model,lead=model.lead,bench=model.jacketMesh,installed=v.fasteners.entities.get('mainSleeve');
 const cases=[],metrics={physicalStates:[],duct:[],mouth:[]},check=(name,fn)=>{try{fn();cases.push({name,status:'PASS'});}catch(error){cases.push({name,status:'FAIL',message:error.message});}};
 check('live physical sleeve registration and lifecycle',()=>{
  assert.equal(v.fasteners.entities.get('assemblyMainSleeve').mesh,bench);assert.equal(v.fasteners.entities.get('assemblyMainLead').mesh,lead.mesh);
  assert.deepEqual(v.director.resolve(['benchMainSleeve']),[bench],'one live physical bench jacket');
  for(const scene of v.director.compile('build'))if(scene.visible.includes(bench)||scene.actors.some(a=>a.nodes.includes(bench)))assert.equal(scene.plan.workspace,'loveboard');
  for(const step of [31,32,33]){
   const scene=v.director.compile('build').find(s=>s.plan.chapter===6&&s.plan.step===step);assert(scene.visible.includes(bench),`textile sleeve belongs to official6.${step}`);
   // 6.31 introduces the cable in actor4, after mounting/turning the board.
   for(const progress of step===31?[.75,.875,.98,1]:[0,.5,1]){select(step,progress);assert(visible(bench)&&visible(lead.mesh),`actual jacket and conductors remain visible at6.${step}/${progress}`);}
  }
  const full=v.director.scene({flow:'build',index:0,variant:'screw',explore:true});assert(!full.visible.includes(bench)&&!full.visible.includes(lead.mesh),'completed printer excludes both temporary bench pieces');
 });
 const lengths={wire:model.rest.route.getLength(),jacket:model.rest.jacket.getLength()},material=model.driver.material.slice();
 for(const amount of [0,.25,.5,.75,1,1.25,1.5,1.75,1.94,1.97,2,2.5,3,3.25,3.5,3.59375,3.625,3.75,4])check(`physical material, anchors, radius and22 conductors at ${amount}`,()=>{
  model.update(amount);assert.deepEqual(model.driver.material,material,'retained material stations are not rewritten');
  const nodes=model.current.nodes;for(let i=1;i<nodes.length;i++)assert(Math.abs(nodes[i].distanceTo(nodes[i-1])-model.driver.lengths[i-1])<1e-8,'each rod material segment retains its length');
  const wireLengthMM=assertMaterialLength(model.current.wire,lengths.wire),jacketLengthMM=assertMaterialLength(model.current.jacket,lengths.jacket);
  assertJacket(model,installed.radius);const anchors=assertCapturedWires(model,installed.radius);metrics.physicalStates.push({amount,wireLengthMM,jacketLengthMM,...anchors});
 });
 // Compare the real28 meshes with/without the working camera at each pose.
 for(const progress of [.75,.875,.98,1])check(`6.31 working camera preserves geometry at ${progress}`,()=>{
  v.manualCamera=true;select(31,progress);const meshes=v.meshes.filter(visible);assert.equal(meshes.length,28);
  const before=snapshot(meshes);v.manualCamera=false;v.focusOperation(3,true);v.scene.updateMatrixWorld(true);
  assert.deepEqual(snapshot(meshes),before);assert(meshes.every(m=>materials(m).every(m=>m.opacity===1)),'working camera keeps source context opaque');
 });
 check('closed CAD duct encloses actual physical jacket at6.33',()=>{select(33);metrics.duct=assertDuctEnclosure(v,model.current.jacket,bench.matrixWorld);});
 check('opaque installed wiring context without bench duplicates at6.54',()=>{
  select(54);
  for(const id of ['mainSleeve','loveMainPlug',790,794,859]){
   const all=v.director.resolve([id]),temporary=all.filter(m=>m.userData.toolOnly&&m.userData.workspaceOnly==='loveboard'),source=all.filter(m=>!temporary.includes(m));
   assert(source.length&&source.every(visible),'installed wiring overview retains source hardware '+id);
   assert(all.every(m=>materials(m).every(m=>m.opacity===1)),'all source and temporary materials stay opaque '+id);
   if(temporary.length){assert.deepEqual(temporary,[lead.mesh]);assert(!visible(lead.mesh),'bench-only conductor model is not a completed duplicate');}
  }
  assert(!visible(bench),'completed-printer wiring has no duplicate bench jacket');
 });
 for(const [width,height]of [[320,380],[390,420],[430,440],[844,280]])for(const mode of ['guided-view','operation-focus']){
  v.container.clientWidth=width;v.container.clientHeight=height;v.resize();v.manualCamera=false;select(32);v.manualCamera=false;
  if(mode==='guided-view')v.setView(v.guidedView,true,true);else v.focusOperation(3,true);
  v.scene.updateMatrixWorld(true);v.camera.updateMatrixWorld(true);const mouth=mouthProjection(v,model);metrics.mouth.push({width,height,mode,...mouth});
  check(`6.32 mouth framing ${width}x${height}/${mode}`,()=>assert(Math.abs(mouth.screen[0])<.65&&Math.abs(mouth.screen[1])<.65,'actual sleeve cut stays clear of viewport edges'));
  check(`6.32 mouth size ${width}x${height}/${mode}`,()=>assert(mouth.minorDiameterPX>12,`actual sleeve opening minor diameter ${mouth.minorDiameterPX.toFixed(3)}px must exceed12px`));
  check(`6.32 open end direction ${width}x${height}/${mode}`,()=>assert(mouth.axialEyeDistanceMM>30,`guided eye must be at least30mm in front of the actual cut plane; normal dot=${mouth.intoOpeningDot.toFixed(6)}, signed distance=${mouth.axialEyeDistanceMM.toFixed(3)}mm`));
 }
 check('later steps reset6.31 close working distance and projection',()=>{
  v.manualCamera=false;select(31,1);v.focusOperation(3,true);assert.equal(v.controls.minDistance,28);
  select(33);assert.equal(v.controls.minDistance,140,'next-step framing is not left at the close inspection distance');assert(!v.mainPlugViewOffset&&!v.camera.view?.enabled,'next step clears the working projection offset');
 });
 return {status:cases.every(c=>c.status==='PASS')?'PASS':'FAIL',cases,metrics,scope:'Canonical current MainLoomPhysical scene/projection test using existing Node mocks; no GPU, browser DOM overlay or continuous clearance certification.'};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const result=runMainCableChecks(),failures=result.cases.filter(c=>c.status==='FAIL');
 for(const failure of failures)console.error(`FAIL: ${failure.name}: ${failure.message}`);
 assert.equal(failures.length,0,`main cable: ${result.cases.length-failures.length}/${result.cases.length} cases passed; ${failures.length} real failures remain`);
 console.log('PASS: live physical sleeve6.31–33, retained material/anchors/radii and22 captured conductors, camera-only28-mesh invariance,12 enclosing CAD probes, opaque installed context, four viewport open-mouth checks and later camera reset.');
}
