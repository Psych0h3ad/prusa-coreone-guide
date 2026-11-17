import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import * as T from '../dist/vendor/three.module.js';

// Actual viewer lifecycle and exact upgrade-request group, tiny boxes and injected failure only.
// Renderer initialization is replaced before construction. No CAD files,
// WebGL context, browser, image, network or animation loop is started.
// Local route tables use an explicit file transport before Viewer imports.
const localDist=fileURLToPath(new URL('../dist/',import.meta.url));
globalThis.fetch=async input=>{const u=new URL(input?.url||input,new URL('../dist/',import.meta.url)),p=fileURLToPath(u);assert(u.protocol==='file:'&&p.startsWith(localDist),'fixture reads only local dist inputs');return new Response(fs.readFileSync(p));};
function events(){
 const listeners=new Map();
 return {style:{},clientWidth:390,clientHeight:560,
  addEventListener(type,fn){if(!listeners.has(type))listeners.set(type,new Set());listeners.get(type).add(fn);},
  removeEventListener(type,fn){listeners.get(type)?.delete(fn);},
  count(){return [...listeners.values()].reduce((n,set)=>n+set.size,0);},setPointerCapture(){},releasePointerCapture(){}};
}
let rendererDisposals=0,canvasRemovals=0,latestCanvas,latestRoot;
globalThis.RecoveryTestRenderer=class{
 constructor(){latestCanvas=events();latestRoot=events();latestCanvas.getRootNode=()=>latestRoot;latestCanvas.remove=()=>canvasRemovals++;this.domElement=latestCanvas;this.shadowMap={};}
 setPixelRatio(){}dispose(){rendererDisposals++;}
};
globalThis.RecoveryTestPMREM=class{constructor(){throw Error('Injected environment initialization failure');}};
const facade='data:text/javascript,'+encodeURIComponent(`export * from ${JSON.stringify(new URL('../dist/vendor/three.module.js',import.meta.url).href)};export const WebGLRenderer=globalThis.RecoveryTestRenderer;export const PMREMGenerator=globalThis.RecoveryTestPMREM;`);
registerHooks({resolve(s,c,next){return s==='three'?{url:facade,shortCircuit:true}:next(s,c);}});
function element(tag='DIV'){
 return {nodeType:1,tagName:tag,childNodes:[],attributes:new Map(),style:{},dataset:{},textContent:'',
  hasAttribute(name){return this.attributes.has(name);},getAttribute(name){return this.attributes.get(name);},setAttribute(name,value){this.attributes.set(name,value);},
  append(...children){for(const child of children){this.childNodes.push(child);child.parent=this;}},removeAttribute(name){this.attributes.delete(name);},querySelector(){return element('SMALL');},remove(){if(this.parent)this.parent.childNodes=this.parent.childNodes.filter(c=>c!==this);}};
}
const removedEvents=[],cancelled=[];let scheduled=0;
Object.assign(globalThis,{document:{hidden:true,documentElement:{lang:'ja'},head:element(),querySelector:()=>null,getElementById:()=>null,removeEventListener:(...args)=>removedEvents.push(args),createElement:()=>element()},
 matchMedia:()=>({matches:false}),devicePixelRatio:1,requestAnimationFrame:()=>{scheduled++;return 0;},cancelAnimationFrame:id=>cancelled.push(id)});
const {PrinterViewer}=await import('../dist/viewer.js');
assert.throws(()=>new PrinterViewer({append(){}},()=>{},()=>{}),/Injected environment initialization failure/);
assert.equal(rendererDisposals,1);assert.equal(canvasRemovals,1);assert.equal(latestCanvas.count(),0);assert.equal(latestRoot.count(),0,'partial initialization releases controls and canvas');

const counts=new Map(),track=(object,name)=>object.addEventListener('dispose',()=>counts.set(name,(counts.get(name)||0)+1));
const geometry=new T.BoxGeometry(1,1,1),source=new T.BoxGeometry(1,1,1),orphanGeometry=new T.BoxGeometry(1,1,1),hiddenVariant=new T.BoxGeometry(1,1,1),texture=new T.Texture(),uniformTexture=new T.Texture(),environmentTexture=new T.Texture();
const material=new T.MeshStandardMaterial({map:texture}),shader=new T.ShaderMaterial({uniforms:{sample:{value:[uniformTexture,texture]}}});
for(const [object,name]of [[geometry,'geometry'],[source,'source'],[orphanGeometry,'orphan'],[hiddenVariant,'hiddenVariant'],[texture,'texture'],[uniformTexture,'uniform'],[environmentTexture,'environmentTexture'],[material,'material'],[shader,'shader']])track(object,name);
const scene=new T.Scene(),printer=new T.Group(),arrowLayer=new T.Group();scene.add(printer,arrowLayer);
const mesh=new T.Mesh(geometry,material),shared=new T.Mesh(geometry,[material,shader]),orphan=new T.Mesh(orphanGeometry,material);mesh.userData.sourceGeometry=source;printer.add(mesh,shared);arrowLayer.add(new T.Mesh(geometry,material));
let targetDisposals=0,shadowDisposals=0,controlsDisposals=0,disconnects=0,mediaRemovals=0,labelRemovals=0,loadingRemovals=0;
const light=new T.DirectionalLight();light.shadow.map={dispose(){shadowDisposals++;}};scene.add(light);scene.environment=environmentTexture;scene.background=texture;
const visibility=()=>{},pointerModeChanged=()=>{},v=Object.assign(Object.create(PrinterViewer.prototype),{
 scene,printer,arrowLayer,meshes:[mesh,shared,orphan],groups:{part:printer},records:[{}],sceneActors:[{}],
 ventHardware:{geometries:new Set([geometry,source,hiddenVariant])},
 environmentTarget:{texture:environmentTexture,dispose(){targetDisposals++;}},
 renderer:{dispose(){rendererDisposals++;},domElement:{remove(){canvasRemovals++;}}},controls:{dispose(){controlsDisposals++;}},
 resizeObserver:{disconnect(){disconnects++;}},pointerMode:{removeEventListener(type,fn){assert.equal(type,'change');assert.equal(fn,pointerModeChanged);mediaRemovals++;}},
 visibility,pointerModeChanged,guideLabels:[{el:{remove(){labelRemovals++;}}}],loadingElement:{remove(){loadingRemovals++;}},
 raf:73,loaded:true,playing:{},autoplayPending:true,cameraTween:{},director:{},fasteners:{},ptfeHardware:{entities:[{}]},operationScene:{}
});
const cleanupCanvas=events();cleanupCanvas.remove=()=>canvasRemovals++;v.renderer.domElement=cleanupCanvas;
for(const [type,key]of [['pointerdown','pointerDownHandler'],['pointerup','pointerUpHandler'],['pointercancel','pointerCancelHandler']]){v[key]=()=>{};cleanupCanvas.addEventListener(type,v[key]);}
v.dispose();v.dispose();v.loop(100);
for(const name of ['geometry','source','orphan','hiddenVariant','texture','uniform','material','shader'])assert.equal(counts.get(name),1,`${name} released once despite shared references`);
assert.equal(counts.get('environmentTexture'),undefined,'render target owns its environment texture');
assert.deepEqual([targetDisposals,shadowDisposals,controlsDisposals,disconnects,mediaRemovals,labelRemovals,loadingRemovals],[1,1,1,1,1,1,1]);
assert.equal(rendererDisposals,2);assert.equal(canvasRemovals,2);assert.deepEqual(cancelled,[73]);assert.equal(scheduled,0,'disposed loops cannot schedule frames');
assert.equal(cleanupCanvas.count(),0,'viewer-owned pointer handlers are removed');
assert.deepEqual(removedEvents,[['visibilitychange',visibility]]);assert.equal(scene.environment,null);assert.equal(scene.background,null);
assert.equal(scene.children.length+printer.children.length+arrowLayer.children.length,0);assert.equal(v.loaded,false);assert.equal(v.playing,false);assert.equal(v.director,undefined);assert.deepEqual(v.groups,{});
assert.equal(v.ptfeHardware,undefined,'disposed viewers release the PTFE cache owner');

// A fast failed upgrade request must wait for its already-issued siblings.
// Otherwise a retry can overlap their late mutations on the failed instance.
const {STLLoader}=await import('../dist/vendor/STLLoader.js'),{requestAssetBuffer}=await import('../dist/asset-request.js');
const originalParse=STLLoader.prototype.parse,originalFetch=globalThis.fetch;
const keys=['sensorBody','sensorCover','sensorLever','sensorSwitch','puck','spoolNew','ventLever','ventBlock'],identity=[[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]];
let requests=0,release,settled=false,started,parsed=0,othersReady;const groupStarted=new Promise(resolve=>{started=resolve;}),siblingsParsed=new Promise(resolve=>{othersReady=resolve;});
globalThis.fetch=async()=>{const index=requests++;if(requests===8)started();if(index===0)return new Response('',{status:404});if(index===1)return new Promise(resolve=>{release=()=>resolve(new Response(new Uint8Array(4)));});return new Response(new Uint8Array(4));};
STLLoader.prototype.parse=()=>{if(++parsed===6)othersReady();return new T.BoxGeometry(1,1,1);};
const container=element(),loadScene=new T.Scene(),loadPrinter=new T.Group();loadScene.add(loadPrinter);const loader=Object.assign(Object.create(PrinterViewer.prototype),{container,scene:loadScene,meshes:[],records:[],groups:{},printer:loadPrinter,arrowLayer:new T.Group()});
const viewerSource=fs.readFileSync('dist/viewer.js','utf8'),releaseUnadoptedCAD=Function('return ('+viewerSource.match(/^function releaseUnadoptedCAD[^\r\n]+/m)[0]+')')();
const batchStart=viewerSource.indexOf('  const stl=new STLLoader()'),batchEnd=viewerSource.indexOf('  const ventGeometries=[];',batchStart);assert(batchStart>=0&&batchEnd>batchStart);
const {smoothCreases}=await import('../dist/surface-geometry.js'),controller=new AbortController(),loadBatch=Function('THREE','STLLoader','PARTS','upgradeFiles','smoothCreases','hardwareProgress','placements','requestAssetBuffer','controller','loadingUI','releaseUnadoptedCAD','return async function(){'+viewerSource.slice(batchStart,batchEnd)+'};')(T,STLLoader,Object.fromEntries(keys.map(k=>[k,{en:k}])),Object.fromEntries(keys.map(k=>[k,k+'.stl'])),smoothCreases,()=>{},Object.fromEntries(keys.map(k=>[k,identity])),requestAssetBuffer,controller,{retry(){}},releaseUnadoptedCAD);
try{
 const outcome=loadBatch.call(loader).then(()=>{settled=true;return null;},error=>{settled=true;return error;});
 let waitTimer;try{await Promise.race([Promise.all([groupStarted,siblingsParsed]),outcome.then(error=>{throw error||Error('Load ended before the request group settled');}),new Promise((_,reject)=>{waitTimer=setTimeout(()=>reject(Error('Request group did not start')),2000);})]);}finally{clearTimeout(waitTimer);}
 assert.equal(requests,8);assert.equal(settled,false,'failure is reported only after every issued request settles');assert.equal(loader.meshes.length,6);
 release();const error=await outcome;assert.equal(error.name,'AssetRequestError');assert.equal(error.status,404);assert.equal(loader.meshes.length,7);
 const geometryEvents=[],materialEvents=[];for(const m of loader.meshes){m.geometry.addEventListener('dispose',()=>geometryEvents.push(m));m.material.addEventListener('dispose',()=>materialEvents.push(m));}
 loader.dispose();for(let i=0;i<5;i++)await Promise.resolve();
 assert.equal(geometryEvents.length,7);assert.equal(materialEvents.length,7);assert.equal(loader.meshes.length,0);assert.equal(loadPrinter.children.length,0);assert.equal(container.childNodes.length,0);
}finally{STLLoader.prototype.parse=originalParse;globalThis.fetch=originalFetch;}
console.log('PASS: actual partial-constructor cleanup,shared geometry/material/texture/render-target/shadow disposal,observer/control/media/visibility/RAF removal,idempotence and exact settled failed-request group. Tiny proxies and injected failure;no native printer CAD/WebGL/browser/network.');
