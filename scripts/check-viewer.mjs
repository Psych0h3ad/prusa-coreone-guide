import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath}from 'node:url';
import {registerHooks} from 'node:module';
import * as THREE from '../dist/vendor/three.module.js';
// Use the same URL identities as the browser. Plain and versioned imports of
// stateful asset modules must resolve to one instance, as the page import map
// requires; otherwise this CPU fixture creates its own unloaded model cache.
const pageURL=new URL('../dist/index.html',import.meta.url);
const importMap=JSON.parse(fs.readFileSync(pageURL,'utf8').match(/<script\s+type="importmap">([\s\S]*?)<\/script>/)[1]);
const browserImports=new Map(Object.entries(importMap.imports).map(([key,value])=>[key.startsWith('.')?new URL(key,pageURL).href:key,new URL(value,pageURL).href]));
registerHooks({resolve(specifier,context,next){
 if(specifier==='three')return {url:new URL('../dist/vendor/three.module.js',import.meta.url).href,shortCircuit:true};
 const resolved=next(specifier,context),mapped=browserImports.get(resolved.url)||browserImports.get(specifier);
 return mapped?{url:mapped,shortCircuit:true}:resolved;
}});
const [{GLTFLoader},{STLLoader},{OrbitControls}]=await Promise.all([
 import('../dist/vendor/GLTFLoader.js'),import('../dist/vendor/STLLoader.js'),import('../dist/vendor/OrbitControls.js')
]);
globalThis.self=globalThis;
globalThis.matchMedia=()=>({matches:false});
globalThis.requestAnimationFrame=()=>0;
const el=()=>({style:{},dataset:{},innerHTML:'',clientWidth:390,clientHeight:420,append(){},insertAdjacentElement(){},querySelector:()=>({textContent:''}),remove(){},setAttribute(){},removeAttribute(){},addEventListener(){},removeEventListener(){},getRootNode(){return this;},getBoundingClientRect(){return {x:0,y:0,width:this.clientWidth,height:this.clientHeight,top:0,left:0,right:this.clientWidth,bottom:this.clientHeight};},closest(){return this;},querySelectorAll(){return [];}});
globalThis.document={hidden:false,createElement:el,getElementById:el};
const assetPath=p=>{const s=String(p),f=p instanceof URL||s.startsWith('file:')?fileURLToPath(p):path.resolve('dist',decodeURIComponent(s.split('?')[0]));assert(f.startsWith(path.resolve('dist')+path.sep),'test asset remains inside dist');return f;};
THREE.TextureLoader.prototype.loadAsync=async function(p){assert(fs.statSync(assetPath(p)).size>1000,'PCB texture asset exists');const t=new THREE.Texture();t.userData.sourcePath=p;return t;};
GLTFLoader.prototype.loadAsync=async function(p){const b=fs.readFileSync(assetPath(p));return this.parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'');};
STLLoader.prototype.loadAsync=async function(p){const b=fs.readFileSync(assetPath(p));return this.parse(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength));};
// Install the local asset transport before importing runtime modules: route
// tables are loaded during module evaluation and need a real Response body.
globalThis.fetch=async p=>new Response(fs.readFileSync(assetPath(p?.url||p)),{status:200});
const {PrinterViewer}=await import('../dist/viewer.js');
const v=Object.create(PrinterViewer.prototype);
Object.assign(v,{scene:new THREE.Scene(),container:el(),groups:{},meshes:[],records:[],labels:true,explode:0,arrowLayer:new THREE.Group(),printer:new THREE.Group(),camera:new THREE.PerspectiveCamera(33,390/420,1,5000),setupHotspots(){},updateLabels(){}});
v.scene.add(v.printer);v.printer.rotation.x=-Math.PI/2;v.printer.scale.setScalar(1000);
v.controls=new OrbitControls(v.camera,el());v.controls.enableDamping=true;v.controls.minDistance=140;v.controls.maxDistance=4000;v.controls.maxPolarAngle=Math.PI*.48;
let frames=0;v.renderer={domElement:el(),setSize(){},render(){frames++;v.scene.updateMatrixWorld(true);v.camera.updateMatrixWorld(true);}};
await v.load();
for(const [width,height]of [[320,380],[390,420],[430,440],[844,280],[720,560]]){
 v.camera.aspect=width/height;v.camera.updateProjectionMatrix();v.setView('perspective',true,true);
 v.setState({flow:'build',index:0,completed:[],comparison:'after',explore:false});
 for(let i=0;i<250;i++)v.loop(i*16);
 const frustum=new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(v.camera.projectionMatrix,v.camera.matrixWorldInverse));
 const visible=v.meshes.filter(m=>m.parent.visible&&m.visible);
 const inView=visible.filter(m=>frustum.intersectsObject(m));
 const box=new THREE.Box3();visible.forEach(m=>box.union(new THREE.Box3().setFromObject(m)));
 const center=box.getCenter(new THREE.Vector3()).project(v.camera);
 assert(visible.length>400,'full printer must be visible in introductory step');
 assert(inView.length>400,'printer meshes must intersect the view frustum');
 assert(Math.abs(center.x)<.2&&Math.abs(center.y)<.2,'printer must be centered');
 for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z]){const p=new THREE.Vector3(x,y,z).project(v.camera);assert(Math.abs(p.x)<.9&&Math.abs(p.y)<.9,'all bounding-box corners fit with margin');}
}
v.setInteraction(false);assert.equal(v.controls.enabled,false);assert.equal(v.renderer.domElement.style.touchAction,'pan-y');
v.setInteraction(true);assert.equal(v.controls.enabled,true);assert.equal(v.renderer.domElement.style.touchAction,'none');
v.container.clientWidth=390;v.container.clientHeight=420;v.resize();const normalDistance=v.camera.position.distanceTo(v.controls.target);v.container.clientHeight=844;v.resize();assert(v.camera.position.distanceTo(v.controls.target)>normalDistance,'fullscreen height change reframes at the same width');v.container.clientHeight=420;v.resize();
const {FLOWS}=await import('../dist/data.js');const index=FLOWS.upgrade.steps.findIndex(s=>s.remove?.length);
v.setState({flow:'upgrade',index,completed:[],comparison:'after',explore:false});v.playStep();
const start=v.playing.start,duration=v.playing.duration;for(let t=0;t<=duration+100;t+=16)v.loop(start+t);
assert.equal(v.playing,false,'animation returns to idle');assert(frames>0,'real scene render callback runs after loading');
v.loop(start+2500);assert.equal(v.playing,false,'idle render loop stays valid after animation');
console.log('PASS: actual CAD scene, five viewport sizes, complete framing, idle/animation loop, touch/scroll switching. GPU output is not exercised.');
export {v};
