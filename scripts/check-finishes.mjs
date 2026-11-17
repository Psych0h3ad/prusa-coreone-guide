import assert from 'node:assert/strict';
import {v} from './check-viewer.mjs';
import {FLOWS} from '../dist/data.js';
import * as T from '../dist/vendor/three.module.js';
const materials=id=>v.director.resolve([id]).flatMap(m=>Array.isArray(m.material)?m.material:[m.material]);
for(const id of [71,74,76,236,309,312,373,374,375,376,378,379,386,405,558,559,560,574,575,595,597,636,637,638,639,640,780,786,829,861,886]){
 const mats=materials(id);assert(mats.length,'missing critical finish '+id);
 for(const m of mats)assert(['polymer','powder'].includes(m.userData.finish),'black manufactured part retains a neutral CAD default '+id);
}
for(const id of [313,377,384])for(const m of materials(id)){assert.equal(m.userData.finish,'steel');assert(m.metalness>.7,'rods and rail have metal reflectance');}
for(const id of [10,14])for(const m of materials(id))assert.equal(m.userData.finish,'orange','orange front-profile variant');
for(const id of [8,12])for(const m of materials(id))assert.equal(m.userData.finish,'steel','pressed nuts are not painted orange with their parent profile');
const motors=v.meshes.filter(m=>m.userData.finish==='motor');assert(motors.length>=5);
for(const m of motors){
 if(m.userData.cadSourceName.includes('TR-320')){
  const g=m.geometry,p=g.attributes.position,index=g.index,shaftStart=Math.fround(.0215);let shaftFaces=0,covered=0;
  assert.equal(p.count,4204);assert.equal(index.count,12504);assert.equal(m.material.length,2);
  assert.equal(m.material[0].color.getHexString(),'292b2a','Z housing and both end caps are black');
  assert.equal(m.material[1].color.getHexString(),'bbc0c2','Z lead screw retains its metallic finish');
  assert(m.material[0].roughness>=.7&&m.material[0].metalness<.3,'housing is matte black, not bright bare metal');
  for(const group of g.groups){assert.equal(group.start,covered);covered+=group.count;for(let k=group.start;k<covered;k+=3){
   const ys=[p.getY(index.getX(k)),p.getY(index.getX(k+1)),p.getY(index.getX(k+2))],shaft=Math.min(...ys)>=shaftStart&&Math.max(...ys)>shaftStart;
   assert.equal(group.materialIndex,shaft?1:0,'only complete lead-screw faces use bare metal');if(shaft)shaftFaces++;
  }}
  assert.equal(covered,index.count);assert.equal(shaftFaces,225,'all native shaft faces remain metallic');
 }else{
  const a=m.geometry.attributes.color;assert(a);const colors=new Set();for(let i=0;i<a.count;i++)colors.add(a.getX(i).toFixed(3));assert(colors.size===2,'XY motor keeps its dark stator and metal end caps');
 }
}
const show=n=>{v.setState({flow:'build',index:FLOWS.build.steps.findIndex(s=>s.chapter===5&&s.officialStep===n),comparison:'after',variant:'screw',completed:[],explore:false});v.autoplayPending=false;v.seek(1);};
show(50);assert(materials(790).some(m=>m.opacity<.1),'motor becomes transparent to expose wiring sockets');
show(58);for(const m of materials(790))assert.equal(m.opacity,1,'temporary inspection transparency does not leak into the finished model');
show(50);v.setState({...v.state,explore:true});assert.deepEqual(v.operationScene.plan.focus,[]);assert(v.sceneBounds.getSize(new T.Vector3()).y>500,'completed-model toggle restores whole-printer framing');for(const m of materials(790))assert.equal(m.opacity,1);
const screen=v.director.resolve(['lcdScreen']);assert.equal(screen.length,1);assert(screen[0].visible);assert(screen[0].material.color.r<.02,'display aperture has a dark unpowered screen');
v.scene.updateMatrixWorld(true);v.camera.updateMatrixWorld(true);const centre=new T.Box3().setFromObject(screen[0]).getCenter(new T.Vector3()),ray=new T.Raycaster(v.camera.position,centre.clone().sub(v.camera.position).normalize());
const front=ray.intersectObjects(v.meshes,false).find(h=>h.object.visible&&!h.object.userData.glass);assert.equal(front.object,screen[0],'screen must appear in front of the cover placeholder rather than remain hidden behind it');
console.log('PASS: critical manufactured finishes, separate orange profiles/metal inserts, motor caps/stator/shaft, and inspection transparency reset.');
