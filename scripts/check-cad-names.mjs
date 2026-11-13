import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import * as T from '../dist/vendor/three.module.js';

// Exercise actual viewer loading with five tiny boxes, stopping before supplements.
// No CAD asset, mesh decoder, renderer, browser or network is used.
registerHooks({resolve(s,c,next){return s==='three'?{url:new URL('../dist/vendor/three.module.js',import.meta.url).href,shortCircuit:true}:next(s,c);}});
globalThis.matchMedia=()=>({matches:false});
globalThis.document={createElement:()=>({nodeType:1,tagName:'DIV',childNodes:[],hasAttribute:()=>false,querySelectorAll:()=>[],querySelector:()=>null,remove(){}})};
const {PrinterViewer}=await import('../dist/viewer.js');
const {GLTFLoader}=await import('../dist/vendor/GLTFLoader.js');
const {STLLoader}=await import('../dist/vendor/STLLoader.js');
const {cadDisplayName}=await import('../dist/cad-names.js');
assert.equal(cadDisplayName('=>[reference]','parent'),'parent');
assert.equal(cadDisplayName('Component2:1'),'Component2:1');
assert.equal(cadDisplayName(' Body12:2 ','parent'),'parent');
assert.equal(cadDisplayName('NEMA17 1.8deg','parent'),'NEMA17 1.8deg');
const source=new T.Group(),expected=new Map();
function add(id,parentId,parentName,raw){
 const parent=new T.Group();parent.userData={cadIndex:parentId,cadName:parentName};
 const mesh=new T.Mesh(new T.BoxGeometry(.001,.001,.001),new T.MeshStandardMaterial({color:'#808080'}));
 mesh.userData={cadIndex:id,cadName:raw};parent.add(mesh);source.add(parent);expected.set(id,{mesh,raw,parentName});
}
add(107,106,'M3x4rT (ISO 7380) v2:1','Component2:1');
add(389,388,'x-pulley_16T v6:1','SOLID1-15517:1');
add(402,401,'XY carriage','XY pulley(Mirror)(Mirror):1');
add(14,13,'orange panel','=>[source reference]');
add(812,811,'gearbox','NEMA17 fixture');
const originalGLTF=GLTFLoader.prototype.loadAsync,originalSTL=STLLoader.prototype.loadAsync,originalFetch=globalThis.fetch;
GLTFLoader.prototype.loadAsync=async()=>({scene:source});
STLLoader.prototype.loadAsync=async()=>{throw Error('Stop before upgrade assets');};
globalThis.fetch=async path=>{if(path.includes('cad-subsets'))return {ok:true,json:async()=>({})};throw Error('Stop before supplements');};
const viewer=Object.assign(Object.create(PrinterViewer.prototype),{container:{append(){}},printer:new T.Group(),groups:{},meshes:[],records:[]});
try{
 await assert.rejects(viewer.load(),/Stop before supplements/);
 assert.equal(viewer.records.length,5);
 for(const [id,{mesh,raw,parentName}]of expected){
  const legacy=raw.startsWith('=>')?parentName:raw,record=viewer.records.find(r=>r.mesh===mesh);
  assert.equal(mesh.userData.cadSourceName,legacy);assert.equal(record.sourceName,legacy);
  const display=cadDisplayName(raw,parentName);assert.equal(mesh.userData.cadName,display);
  assert.equal(record.name,display.replace(/\s+v\d+(?:\.\d+)?/g,'').replace(/:\d+$/,''));
  assert.equal(mesh.userData.cadIndex,id);assert.equal(viewer.meshes.filter(m=>m===mesh).length,1);
 }
 const screw=expected.get(107).mesh,pulley=expected.get(389).mesh;
 assert.equal(screw.material.userData.finish,'powder','display names cannot silently change the existing finish classification');
 assert.equal(pulley.material.userData.finish,'powder');
 assert.equal(expected.get(812).mesh.userData.finish,'motor','the existing motor finishing input remains intact');
}finally{
 GLTFLoader.prototype.loadAsync=originalGLTF;STLLoader.prototype.loadAsync=originalSTL;globalThis.fetch=originalFetch;
 for(const mesh of viewer.meshes){mesh.geometry.dispose();mesh.material.dispose();}
}
console.log('PASS: actual viewer load inherits named CAD ancestors over generic leaves, preserves original search aliases, exact mesh IDs and existing finish inputs. Five tiny boxes only;no CAD/render/appearance certification.');
