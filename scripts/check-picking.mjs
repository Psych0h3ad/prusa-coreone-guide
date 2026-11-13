import assert from 'node:assert/strict';
import fs from 'node:fs';
import {registerHooks} from 'node:module';
import * as T from '../dist/vendor/three.module.js';

// Tiny independent boxes exercise the actual raycaster and shipped pick method.
// No CAD, renderer, browser, texture, network or animation loop is started.
registerHooks({resolve(s,c,next){return s==='three'?{url:new URL('../dist/vendor/three.module.js',import.meta.url).href,shortCircuit:true}:next(s,c);}});
globalThis.matchMedia=()=>({matches:false});
const {PrinterViewer}=await import('../dist/viewer.js');
const v=Object.assign(Object.create(PrinterViewer.prototype),{
 camera:new T.PerspectiveCamera(33,4/3,.1,100),raycaster:new T.Raycaster(),pointer:new T.Vector2(),
 renderer:{domElement:{getBoundingClientRect:()=>({left:31,top:47,width:400,height:300})}},
 groups:{},meshes:[],selected:null,applyMaterials(){},onSelect(key,mesh){this.lastPick={key,mesh};}
});
v.camera.position.set(0,0,10);v.camera.lookAt(0,0,0);v.camera.updateMatrixWorld(true);
const scene=new T.Scene(),hiddenParent=new T.Group(),nested=new T.Group();hiddenParent.add(nested);hiddenParent.visible=false;scene.add(hiddenParent);
function box(key,z,parent=scene,glass=false){
 const mesh=new T.Mesh(new T.BoxGeometry(1,1,1));mesh.position.z=z;mesh.userData={part:key,glass};parent.add(mesh);v.meshes.push(mesh);v.groups[key]=mesh;return mesh;
}
const hidden=box('hidden',3,nested),shown=box('shown',0),glass=box('window',5,scene,true);glass.visible=false;
const pick=()=>{scene.updateMatrixWorld(true);v.pick({clientX:231,clientY:197});};
pick();
if(process.argv.includes('--record-before')){
 const result={expected:'shown',actual:v.lastPick?.key,hiddenAncestorSelected:v.lastPick?.mesh===hidden,scope:'Actual raycaster and viewer.pick on two tiny boxes; no CAD/render/browser/network.'};
 assert(result.hiddenAncestorSelected,'baseline must reproduce the hidden-ancestor selection');
 fs.writeFileSync('research/quality/library-picking-before-20261103.json',JSON.stringify({picking:result},null,2)+'\n');
 console.log(JSON.stringify(result));
}else{
 assert.equal(v.lastPick.key,'shown','a hidden ancestor excludes a nearer mesh');assert.equal(v.selected,'shown');
 hiddenParent.visible=true;pick();assert.equal(v.lastPick.mesh,hidden,'visible nearer parts remain selectable');
 nested.visible=false;pick();assert.equal(v.lastPick.mesh,shown,'an immediate hidden parent is excluded');
 nested.visible=true;hidden.visible=false;pick();assert.equal(v.lastPick.mesh,shown,'a hidden leaf is excluded');
 glass.visible=true;pick();assert.equal(v.lastPick.mesh,shown,'an opaque part can be selected through the transparent window');
 shown.visible=false;pick();assert.equal(v.lastPick.mesh,glass,'a window remains selectable when no opaque part is hit');
 glass.visible=false;const selection=v.selected,last=v.lastPick;pick();assert.equal(v.lastPick,last);assert.equal(v.selected,selection,'an empty tap does not choose a hidden part');
 v.pick({clientX:31,clientY:47});assert.equal(v.lastPick,last,'an off-object tap keeps the current selection');
 console.log('PASS: actual raycasting excludes hidden ancestors/parents/leaves, selects the visible nearer part, preserves transparent-window access and leaves selection unchanged for empty taps. Tiny boxes only; no CAD/render/browser/network.');
}
for(const mesh of v.meshes){mesh.geometry.dispose();mesh.material.dispose();}
