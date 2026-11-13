import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import * as T from '../dist/vendor/three.module.js';

// Vectors, bounds and the real OrbitControls event handlers only. No CAD assets,
// WebGL context, renderer, browser, network or animation frame is started.
registerHooks({resolve(specifier,context,next){
 if(specifier==='three')return {url:new URL('../dist/vendor/three.module.js',import.meta.url).href,shortCircuit:true};
 return next(specifier,context);
}});
const reduced=process.argv.includes('--reduced-motion');
globalThis.matchMedia=()=>({matches:reduced});
globalThis.document={hidden:false,getElementById:()=>null};
globalThis.requestAnimationFrame=()=>0;
const {PrinterViewer}=await import('../dist/viewer.js');
const {OrbitControls}=await import('../dist/vendor/OrbitControls.js');
const {viewDirection}=await import('../dist/camera.js');

function events(){
 const listeners=new Map();
 return {style:{},clientWidth:390,clientHeight:560,setPointerCapture(){},releasePointerCapture(){},
  addEventListener(type,fn){if(!listeners.has(type))listeners.set(type,new Set());listeners.get(type).add(fn);},
  removeEventListener(type,fn){listeners.get(type)?.delete(fn);},
  emit(type,event={}){for(const fn of [...listeners.get(type)||[]])fn({preventDefault(){},...event});}
 };
}
function fixture(){
 const canvas=events(),root=events();canvas.getRootNode=()=>root;
 const v=Object.create(PrinterViewer.prototype),camera=new T.PerspectiveCamera(33,390/560,5,5000);
 camera.position.set(700,540,850);
 const controls=new OrbitControls(camera,canvas);
 Object.assign(v,{loaded:true,camera,controls,renderer:{domElement:canvas,setSize(){},setPixelRatio(){},render(){}},
  container:{clientWidth:390,clientHeight:560},printer:new T.Group(),printerOrigin:new T.Vector3(),groups:{},meshes:[],
  labels:false,manualCamera:false,playing:false,autoplayPending:false,operationProgress:0,activeOperation:0,
  sceneBounds:new T.Box3(new T.Vector3(-220,0,-240),new T.Vector3(220,500,240)),
  defaultBounds:new T.Box3(new T.Vector3(-220,0,-240),new T.Vector3(220,500,240)),
  operationScene:{plan:{workspace:'printer',operationCamera:'rear-wiring-perspective'}},guidedView:'rear-wiring-perspective',
  sceneActors:[0,100].map(x=>({flex:[],fromStates:{},to:1,label:'fixture',focusBox:new T.Box3(new T.Vector3(x-6,100,-200),new T.Vector3(x+6,120,-180))})),
  fasteners:{restore(){},entities:new Map()},clearGuides(){},buildGuides(){},applyMaterials(){},updateOperationUI(){},updateLabels(){},
  director:{resolve:()=>[],scene:()=>({plan:{workspace:'printer',actors:[],note:''},visible:[],actors:[],flexStates:{},full:false})}
 });
 v.configureControls();v.setInteraction(true);v.controls.update();
 return {v,canvas};
}
const snapshot=v=>({position:v.camera.position.clone(),target:v.controls.target.clone()});
const same=(v,before)=>{assert(v.camera.position.distanceTo(before.position)<1e-8);assert(v.controls.target.distanceTo(before.target)<1e-8);};
function requestFocus(v){
 v.focusOperation(0);
 assert(reduced?v.cameraTween===null:!!v.cameraTween,'guided camera follows the motion preference');
}

// Real mouse, touch, pinch and wheel handlers must yield an in-flight camera.
for(const kind of ['mouse','touch','pinch','wheel']){
 const {v,canvas}=fixture();requestFocus(v);const prior=snapshot(v);
 if(kind==='wheel')canvas.emit('wheel',{deltaY:-80,clientX:180,clientY:200});
 else{
  canvas.emit('pointerdown',{pointerId:1,pointerType:kind==='mouse'?'mouse':'touch',button:0,clientX:100,clientY:100,pageX:100,pageY:100});
  if(kind==='pinch')canvas.emit('pointerdown',{pointerId:2,pointerType:'touch',clientX:180,clientY:100,pageX:180,pageY:100});
  canvas.emit('pointermove',{pointerId:kind==='pinch'?2:1,pointerType:kind==='mouse'?'mouse':'touch',clientX:240,clientY:180,pageX:240,pageY:180});
  assert(v.camera.position.distanceTo(prior.position)>1e-5,`${kind}: the gesture moves the real camera`);
 }
 assert.equal(v.cameraTween,null,`${kind}: input cancels camera movement`);
 assert(v.manualCamera,`${kind}: manual view remains in control`);
 const before=snapshot(v);v.seek(.8);same(v,before);assert.equal(v.cameraTween,null);
 assert.equal(v.activeOperation,1,'scrubbing still advances assembly operations');
 if(kind!=='wheel'){
  if(kind==='pinch')canvas.emit('pointerup',{pointerId:2});
  canvas.emit('pointerup',{pointerId:1});
 }
 v.controls.dispose();
}
{
 const {v,canvas}=fixture();v.focusOperation(0,true);
 canvas.emit('pointerdown',{pointerId:1,pointerType:'mouse',button:0,clientX:100,clientY:100});
 canvas.emit('pointermove',{pointerId:1,pointerType:'mouse',clientX:240,clientY:180});
 canvas.emit('pointerup',{pointerId:1});
 v.resetCamera();const q=v.cameraTween,expected=reduced?snapshot(v):{position:q.to.clone(),target:q.toT.clone()};
 const start=q?.start||performance.now();
 for(let frame=0;frame<8;frame++)v.loop(start+600+frame*16);
 same(v,expected);v.controls.dispose();
}
{
 const {v,canvas}=fixture();v.setInteraction(false);requestFocus(v);
 const pending=v.cameraTween;canvas.emit('pointerdown',{pointerId:1,pointerType:'touch',pageX:100,pageY:100});
 assert.equal(v.manualCamera,false,'paused gestures do not take camera control');assert.equal(v.cameraTween,pending);
 v.setInteraction(true);assert.equal(canvas.style.touchAction,'none');assert(v.controls.enabled,'gestures start enabled');
 v.camera.position.set(700,540,850);const distance=v.camera.position.distanceTo(v.controls.target);
 v.zoom(.83);assert.equal(v.cameraTween,null);assert(v.manualCamera);
 assert(Math.abs(v.camera.position.distanceTo(v.controls.target)-distance*.83)<1e-8,'toolbar zoom is retained');
 const before=snapshot(v);v.playStep(false);
 v.loop(v.playing.start+v.playing.duration*.8);assert.equal(v.cameraTween,null);
 assert.equal(v.activeOperation,1,'animation continues while the manual camera remains held');same(v,before);
 const progress=v.operationProgress,playing=v.playing;
 v.resetCamera();assert.equal(v.manualCamera,false);assert.equal(v.operationProgress,progress);assert.equal(v.playing,playing);
 const direction=(reduced?v.camera.position.clone().sub(v.controls.target):v.cameraTween.to.clone().sub(v.cameraTween.toT)).normalize();
 assert(direction.dot(viewDirection('rear-wiring-perspective').normalize())>1-1e-10,'reset restores the guided rear working view');
 v.setView('front',true);assert(v.manualCamera);const front=snapshot(v);
 v.seek(.2);same(v,front);assert.equal(v.cameraTween,null,'explicit front view survives a different operation');
 v.container.clientWidth=844;v.container.clientHeight=280;v.resize();same(v,front);
 assert.equal(v.camera.aspect,844/280,'orientation updates aspect without replacing the manual view');
 v.resetCamera();v.seek(.8);v.focusOperation(1,true);const centre=v.controls.target.clone();
 v.lastWidth=844;v.lastHeight=280;v.container.clientWidth=320;v.container.clientHeight=420;v.resize();
 assert(v.controls.target.distanceTo(centre)<1e-8,'guided resize retains the current operation close-up');
 assert.equal(v.lastOperationFocus,1);assert.equal(v.cameraTween,null);
 const group=new T.Group(),mesh=new T.Mesh(new T.BoxGeometry(10,10,10));group.userData.base=new T.Vector3();group.add(mesh);v.groups.part=group;
 v.focus('part');assert(v.manualCamera);assert.equal(v.selected,'part');
 assert(reduced?v.cameraTween===null:!!v.cameraTween,'part focus follows the motion preference');
 const chosen=v.cameraTween;v.seek(.9);assert.equal(v.cameraTween,chosen,'animation does not replace a chosen part focus');
 mesh.geometry.dispose();mesh.material.dispose();
 const state={flow:'build',index:1,variant:'screw',comparison:'after',explore:false};
 v.setState(state);assert.equal(v.manualCamera,false,'a new step restores guided framing');assert.equal(v.cameraTween,null);
 v.zoom(1.2);const held=snapshot(v);v.setState({...state});assert(v.manualCamera);same(v,held);
 v.setState({...state,index:2});assert.equal(v.manualCamera,false,'next-step framing is not left locked by the previous step');
 v.controls.dispose();
}
{
 const {v}=fixture(),parent=new T.Group(),group=new T.Group(),hiddenParent=new T.Group();parent.position.set(100,20,-30);parent.add(group);v.groups.part=group;
 const shown=new T.Mesh(new T.BoxGeometry(340,110,210)),second=new T.Mesh(new T.BoxGeometry(80,40,60)),hidden=new T.Mesh(new T.BoxGeometry(10,10,10)),nested=new T.Mesh(new T.BoxGeometry(10,10,10));
 shown.position.set(20,70,50);second.position.set(-180,40,20);hidden.position.x=10000;hidden.visible=false;hiddenParent.position.x=-12000;hiddenParent.visible=false;hiddenParent.add(nested);group.add(shown,second,hidden,hiddenParent);
 parent.updateMatrixWorld(true);const bounds=new T.Box3().setFromObject(shown).union(new T.Box3().setFromObject(second)),centre=bounds.getCenter(new T.Vector3());
 for(const [width,height]of [[320,420],[390,560],[844,280],[1280,720]]){
  v.camera.aspect=width/height;v.camera.updateProjectionMatrix();v.camera.position.set(700,540,850);v.controls.target.set(0,0,0);
  assert.equal(v.focus('part'),true);const position=reduced?v.camera.position:v.cameraTween.to,target=reduced?v.controls.target:v.cameraTween.toT;
  assert(target.distanceTo(centre)<1e-8,'hidden future parts do not pull the focus away from the visible workpiece');
  v.camera.position.copy(position);v.camera.lookAt(target);v.camera.updateMatrixWorld(true);
  for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z]){
   const p=new T.Vector3(x,y,z).project(v.camera);assert(Math.abs(p.x)<.9&&Math.abs(p.y)<.9&&p.z>-1&&p.z<1,'visible workpiece fits portrait and landscape views');
  }
 }
 assert.equal(hidden.visible,false);assert.equal(hiddenParent.visible,false,'focus never reveals a future part');
 v.manualCamera=false;const before=snapshot(v),tween=v.cameraTween,selected=v.selected;
 const unchanged=()=>{same(v,before);assert.equal(v.cameraTween,tween);assert.equal(v.manualCamera,false);assert.equal(v.selected,selected);};
 assert.equal(v.focus('missing'),false);unchanged();
 assert.equal(v.focus('part',hidden),false);unchanged();
 assert.equal(v.focus('part',nested),false);unchanged();
 parent.visible=false;assert.equal(v.focus('part',shown),false);unchanged();parent.visible=true;
 shown.visible=false;second.visible=false;assert.equal(v.focus('part'),false);unchanged();
 for(const m of [shown,second,hidden,nested]){m.geometry.dispose();m.material.dispose();}v.controls.dispose();
}
console.log(`PASS: real OrbitControls mouse/touch/pinch/wheel handlers, toolbar zoom, playback/scrubbing, presets, reset, orientation, part focus and step changes preserve camera intent (${reduced?'reduced':'normal'} motion). No CAD, WebGL or browser.`);
