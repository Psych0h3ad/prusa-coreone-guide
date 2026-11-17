import {retireXBuddyCompleteOwner,followXBuddyCompleteOwner} from './xbuddy-complete-owner.js';
import {retireZMotorShafts} from './z-motor-shafts.js';
import {retirePairedPowerOwner,preparePairedPowerFlex} from './paired-power-owner.js';
import {installChamberFanAnatomy,retireChamberFanAnatomy,syncChamberFanAnatomy} from './chamber-fan-anatomy.js?v=20261114-148';
import {retireCrossflowTie13}from './r13-tie-service.js';
import {installBedFamily15} from './r15-bed-family.js';
import {installMainLoomNative615,retireMainLoomNative615}from './main-loom-native.js';
import{createSideSensorInputPtfe}from'./side-sensor-ptfe.js';
import {followSideIRService} from './side-ir-service-follow.js';
import {prepareSidePtfeCompletion,followSidePtfeCompletion} from './side-ptfe-coupling.js';
import {focusAssemblyTeachingCamera,followAssemblyTeachingCamera,clearAssemblyTeachingCamera} from './assembly-teaching-camera.js?v=20261113-116';
import {focusElectronicsTie,followElectronicsTie,clearElectronicsTie}from './electronics-tie-view.js?v=20261112-112';
import {installRearMainForFlows}from './rear-main-flows.js?v=20261111-101';
import {installCorexy577}from './corexy577.js?v=20261111-100';
import {installCorexyWorkingView}from './corexy577-camera.js?v=20261113-116';
import {focusTieWorkingView,followTieWorkingView,clearTieWorkingViewOffset}from './tie-working-view.js?v=20261112-112';
import {focusMainLoomCutView,followMainLoomCutView,clearMainLoomCutViewOffset} from './main-loom-cut-view.js?v=20261111-94';
import {focusPulleyWorkingView,clearPulleyViewOffset} from './pulley-working-view.js?v=20261111-94';
import {createXPulleySetupHardware,followXPulleySetup} from './x-pulley-setup.js?v=20261111-94';
import {focusMainPlugWorkingView,followMainPlugWorkingView,clearMainPlugViewOffset} from './loveboard-main-view.js?v=20261111-94';
import {createSideSensorAssembly} from './side-sensor-assembly.js?v=20261111-94';
import {followMountedSensorLead} from './sensor-retention-route.js';
import {createPulleySetupHardware,followPulleySetup} from './pulley-setup.js?v=20261111-94';
import {createBedstopHardware} from './bedstop-hardware.js?v=20261111-94';
import {WorkDetail} from './work-detail.js?v=20261112-113';
import {t as tr,translateDOM,currentLanguage,localizePartMetadata} from './i18n.js?v=20261112-113';
import {connectorNotice}from './loveboard-connectors.js?v=20261111-94';
import {SOCKETS}from './loveboard-layout.js?v=20261111-94';
import * as THREE from 'three';
import {installHeatbedAssembly} from './heatbed-assembly.js';
import {retireMainService615} from './loveboard-main-service.js';
import {followLcdEarth} from './lcd-cable-motion.js?v=20261111-94';
import {followLcdRibbon} from './lcd-ribbon.js?v=20261111-94';
import {OrbitControls} from './vendor/OrbitControls.js';
import {GLTFLoader} from './vendor/GLTFLoader.js';
import {loadCoreCAD} from './core-cad-transfer.js';
import {createModelLoading} from './model-loading.js';
import {followTensionerService,closeTensionerService} from './tensioner-service-runtime.js';
import {STLLoader} from './vendor/STLLoader.js';
import {MeshoptDecoder} from './vendor/meshopt_decoder.module.js';
import {RoomEnvironment} from './vendor/RoomEnvironment.js';
import {PARTS,CAD_ROOTS,FLOWS} from './data.js?v=20261112-113';
import {AssemblyDirector,approachPath,operationAt,rigidMotion,motionGuide,motionBounds,smooth} from './assembly-director.js?v=20261113-116';
import {frameBox,viewDirection} from './camera.js?v=20261111-94';
import {placeCallout,workAreaObstacle}from './callout-layout.js?v=20261111-94';
import {finishCAD,finishMotor,createDisplayPanel} from './cad-finishes.js?v=20261113-118';
import {installPartMarkings,syncPartMarkings} from './part-markings.js?v=20261111-94';
import {cadDisplayName} from './cad-names.js?v=20261111-94';
import {createElectronics} from './electronics.js?v=20261111-94';
import {createXbuddyNfc,followXbuddyNfc}from './xbuddy-nfc.js?v=20261111-94';
import {createXbuddyWifi}from './xbuddy-wifi.js?v=20261111-94';
import {followThermalPads} from './thermal-pads.js?v=20261111-94';
import {createFasteners} from './fasteners.js?v=20261111-94';
import {createMainLoomAssembly,followMainLoom} from './main-loom-assembly.js?v=20261112-113';
import {createPtfeHardware} from './ptfe-hardware.js?v=20261111-94';
import {createHotendHook} from './hotend-hook.js?v=20261111-94';
import {smoothCreases} from './surface-geometry.js?v=20261111-94';
import {createNextruder} from './nextruder.js?v=20261112-113';
import {preparePgMechanism,followPgMechanism,retirePgMechanism} from './pg-mechanism.js';
import {createNextruderSensor} from './nextruder-sensor.js?v=20261112-113';
import {installNextruderCables}from './loveboard-service-cables.js?v=20261112-113';
import {installAssemblyFanCables}from './service-fan-cables.js?v=20261111-94';
import {createIdlerSwivelSpacer} from './idler-swivel-hardware.js?v=20261111-94';
import {createIdlerSprings,followIdlerSprings}from './idler-spring-hardware.js?v=20261111-94';
import {ventConfiguration,VENT_DATUM} from './vent-configuration.js?v=20261111-94';
import {createVentHardware} from './vent-hardware.js?v=20261111-94';
import {createSensorInternals,sensorBenchQuaternion} from './sensor-assembly.js?v=20261111-94';
import {createCoreXYParts} from './corexy-assembly.js?v=20261111-94';
import {createOriginalTensionerParts} from './original-tensioner-model.js';
import {createTensionerInstallationTools} from './tensioner-installation-model.js';
import {restoreCADSurfaces} from './cad-surfaces.js?v=20261111-94';
import {configurePrintheadCovers} from './printhead-covers.js?v=20261111-94';
import {operationRegion} from './operation-region.js?v=20261111-94';
import {createXlcdHardware} from './xlcd-hardware.js?v=20261111-94';
import {createDoorHardware} from './door-hardware.js?v=20261111-94';
import {createDoorHandleHardware} from './door-handle-hardware.js?v=20261113-119';
import {createStepperSplitter,followStepperSplitter} from './stepper-splitter.js?v=20261111-94';
import {createBaseHardware,followBasePins} from './base-hardware.js?v=20261111-94';
import {createFeHardware,followFeHardware} from './fe-hardware.js?v=20261111-94';
import {createRearSupports,rearWorkingDirection} from './rear-workpose.js?v=20261111-94';

const upgradeFiles={sensorBody:'FILAMENT SENSOR BODY R2.stl',sensorCover:'C1+_FILAMENT_SENSOR_COVER_R1.stl',sensorLever:'C1L FILAMENT SENSOR LEVER R1.stl',sensorSwitch:'C1L FILAMENT SENSOR SWITCH R1.stl',puck:'Puck Universal R1.stl',spoolNew:'Spoolholder static R1.stl',ventLever:'C1+_PRINTHEAD_COVER_RIGHT_LEVER_R1.stl',ventBlock:'C1+_UPG_VENT_BLOCK_R1-A.stl'};
const vec=(a)=>new THREE.Vector3(...a);
const highlightColor=new THREE.Color('#fd5000');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const sourceIndex=(actor,index)=>actor.sourceIndex??index;
const visibleInScene=node=>{for(let current=node;current;current=current.parent)if(current.visible===false)return false;return true;};
function releaseUnadoptedCAD(scene){const geometries=new Set(),materials=new Set(),textures=new Set();scene.traverse(node=>{if(node.geometry)geometries.add(node.geometry);for(const material of (Array.isArray(node.material)?node.material:[node.material]).filter(Boolean))materials.add(material);});for(const material of materials)for(const value of Object.values(material))if(value?.isTexture)textures.add(value);geometries.forEach(value=>value.dispose());materials.forEach(value=>value.dispose());textures.forEach(value=>value.dispose());}
const guideMaterial=(points,maxDash=7)=>{const length=points.slice(1).reduce((n,p,i)=>n+p.distanceTo(points[i]),0),dashSize=Math.min(maxDash,Math.max(1,length/5));return new THREE.LineDashedMaterial({color:0xfd5000,dashSize,gapSize:dashSize*.6,transparent:true,depthTest:false,depthWrite:false});};
const overlayArrow=arrow=>{arrow.traverse(o=>{if(o.material){o.renderOrder=22;o.material.transparent=true;o.material.depthTest=false;o.material.depthWrite=false;}});return arrow;};

export class PrinterViewer{
 retainPreparationGeometries(){
  const retained=this.preparationGeometries??=new Map(),keep=geometry=>{if(!geometry||retained.has(geometry))return;const disposed=()=>{retained.delete(geometry);geometry.removeEventListener("dispose",disposed);};retained.set(geometry,disposed);geometry.addEventListener("dispose",disposed);};
  const visit=node=>{keep(node.geometry);for(const key of["sourceGeometry","referenceGeometry","guideGeometry20"])keep(node.userData?.[key]);};
  for(const mesh of [...this.meshes,...(this.fasteners?.meshes||[]),...(this.mainLoom?.entities||[]).map(e=>e.mesh)])mesh?.traverse(visit);
 }
 meshDimensions(mesh){return new THREE.Box3().setFromObject(mesh,true).getSize(new THREE.Vector3());}
 constructor(container,onSelect,onReady){
  this.container=container;this.onSelect=onSelect;this.onReady=onReady;this.groups={};this.meshes=[];this.records=[];this.labels=true;this.ghost=false;this.explode=0;this.doorOpen=false;this.selected=null;this.dirty=true;this.playing=false;this.manualCamera=false;this.disposed=false;
  try{
  this.scene=new THREE.Scene();this.scene.background=new THREE.Color('#f5f5f2');
  this.camera=new THREE.PerspectiveCamera(33,1,5,5000);this.camera.position.set(700,540,850);
  this.renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});this.renderer.setPixelRatio(Math.min(devicePixelRatio,2));this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.2;this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;container.append(this.renderer.domElement);
  this.controls=new OrbitControls(this.camera,this.renderer.domElement);this.configureControls();
  this.scene.add(new THREE.HemisphereLight(0xffffff,0xa1a397,2.1));
  const key=new THREE.DirectionalLight(0xffffff,3.2);key.position.set(250,850,550);key.castShadow=true;key.shadow.mapSize.setScalar(matchMedia('(pointer: coarse)').matches?1024:2048);Object.assign(key.shadow.camera,{left:-620,right:620,top:620,bottom:-620,near:50,far:1700});key.shadow.normalBias=.6;key.shadow.bias=-.00015;key.shadow.radius=5;this.scene.add(key);
  const fill=new THREE.DirectionalLight(0xe9f0ff,1.4);fill.position.set(-650,400,-250);this.scene.add(fill);
  const pmrem=new THREE.PMREMGenerator(this.renderer);const room=new RoomEnvironment();try{this.environmentTarget=pmrem.fromScene(room,.04);this.scene.environment=this.environmentTarget.texture;}finally{room.dispose();pmrem.dispose();}
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(4000,4000),new THREE.ShadowMaterial({opacity:.16}));floor.rotation.x=-Math.PI/2;floor.position.y=-.65;floor.receiveShadow=true;this.scene.add(floor);
  const grid=new THREE.GridHelper(2400,80,0xd4d8cc,0xe2e5db);grid.position.y=-.5;grid.material.transparent=true;grid.material.opacity=.34;this.scene.add(grid);
  this.printer=new THREE.Group();this.printer.rotation.x=-Math.PI/2;this.printer.scale.setScalar(1000);this.scene.add(this.printer);
  this.arrowLayer=new THREE.Group();this.scene.add(this.arrowLayer);
  this.workDetail=new WorkDetail(container);
  this.raycaster=new THREE.Raycaster();this.pointer=new THREE.Vector2();let start;
  this.pointerDownHandler=e=>{start=e.isPrimary?[e.clientX,e.clientY,e.pointerId]:undefined;};
  this.pointerUpHandler=e=>{if(!start||start[2]!==e.pointerId||Math.hypot(e.clientX-start[0],e.clientY-start[1])>5)return;this.pick(e);start=undefined;};
  this.pointerCancelHandler=()=>{start=undefined;};
  this.renderer.domElement.addEventListener('pointerdown',this.pointerDownHandler);this.renderer.domElement.addEventListener('pointerup',this.pointerUpHandler);this.renderer.domElement.addEventListener('pointercancel',this.pointerCancelHandler);
  this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(container);this.resize();
  this.pointerMode=matchMedia('(pointer: coarse)');this.setInteraction(true);
  this.pointerModeChanged=()=>this.setInteraction(this.interactionEnabled);this.pointerMode.addEventListener('change',this.pointerModeChanged);
  this.visibility=()=>{this.dirty=true;};document.addEventListener('visibilitychange',this.visibility);
  this.fontsChanged=()=>{this.calloutLayout=null;this.dirty=true;};document.fonts?.addEventListener('loadingdone',this.fontsChanged);
  this.loop=this.loop.bind(this);this.raf=requestAnimationFrame(this.loop);
  this.load().catch(e=>{if(this.disposed)return;console.error(e);const report=this.onReady;this.dispose();report?.(false);});
  }catch(e){this.dispose();throw e;}
 }
 dispose(){
  closeTensionerService(this);
  retireCrossflowTie13(this);
  if(this.disposed)return;retireZMotorShafts(this);retireXBuddyCompleteOwner(this);retirePairedPowerOwner(this);retireChamberFanAnatomy(this);retireMainService615(this);retireMainLoomNative615(this);clearAssemblyTeachingCamera(this);this.disposed=true;this.loaded=false;retirePgMechanism(this);this.sidePtfeCompletion?.retire();this.playing=false;this.autoplayPending=false;this.cameraTween=null;
  if(this.raf!==undefined)cancelAnimationFrame(this.raf);this.raf=undefined;
  this.resizeObserver?.disconnect();this.controls?.dispose();this.workDetail?.dispose();
  for(const [type,handler]of [['pointerdown',this.pointerDownHandler],['pointerup',this.pointerUpHandler],['pointercancel',this.pointerCancelHandler]])if(handler)this.renderer?.domElement.removeEventListener(type,handler);
  if(this.pointerModeChanged)this.pointerMode?.removeEventListener('change',this.pointerModeChanged);
  if(this.visibility)document.removeEventListener('visibilitychange',this.visibility);
  if(this.fontsChanged)document.fonts?.removeEventListener('loadingdone',this.fontsChanged);
  this.loadingUI?.remove();this.loadingUI=undefined;this.loadingElement?.remove();this.loadingElement=undefined;this.guideLabels?.forEach(label=>label.el.remove());
  this.surfacePreparationPool?.dispose();this.surfacePreparationPool=undefined;
  const geometries=new Set(),materials=new Set(),textures=new Set(),shadows=new Set(),visit=node=>{if(node.geometry)geometries.add(node.geometry);if(node.userData?.sourceGeometry)geometries.add(node.userData.sourceGeometry);if(node.userData?.referenceGeometry)geometries.add(node.userData.referenceGeometry);if(node.userData?.guideGeometry20)geometries.add(node.userData.guideGeometry20);if(node.shadow)shadows.add(node.shadow);if(node.material)for(const material of Array.isArray(node.material)?node.material:[node.material])materials.add(material);};
  for(const root of [this.scene,this.printer,this.arrowLayer,this.pendingCAD,...(this.fasteners?.meshes||[]),...(this.mainLoom?.entities||[]).map(e=>e.mesh)])root?.traverse(visit);this.pendingCAD=undefined;this.meshes?.forEach(visit);
  for(const [geometry,listener]of this.preparationGeometries||[]){geometry.removeEventListener("dispose",listener);geometries.add(geometry);}this.preparationGeometries?.clear();this.preparationGeometries=undefined;
  for(const material of this.sourceCADMaterials||[])materials.add(material);this.sourceCADMaterials=undefined;
  for(const hardware of [this.ventHardware,this.sensorHardware])hardware?.geometries.forEach(geometry=>geometries.add(geometry));
  const texture=value=>{if(value?.isTexture)textures.add(value);else if(Array.isArray(value))value.forEach(texture);};
  for(const material of materials){Object.values(material).forEach(texture);Object.values(material.uniforms||{}).forEach(uniform=>texture(uniform.value));}
  texture(this.scene?.environment);texture(this.scene?.background);
  if(this.environmentTarget){textures.delete(this.environmentTarget.texture);this.environmentTarget.dispose();this.environmentTarget=undefined;}
  geometries.forEach(geometry=>geometry.dispose());textures.forEach(value=>value.dispose());materials.forEach(material=>material.dispose());shadows.forEach(shadow=>shadow.dispose());
  if(this.scene){this.scene.environment=null;if(this.scene.background?.isTexture)this.scene.background=null;}
  this.renderer?.dispose();this.renderer?.domElement.remove();this.scene?.clear();this.printer?.clear();this.arrowLayer?.clear();
  this.groups={};this.meshes=[];this.records=[];this.sceneActors=[];this.guideLabels=[];this.hotspots=[];this.director=undefined;this.fasteners=undefined;this.mainLoom=undefined;this.ptfeHardware=undefined;this.ventHardware=undefined;this.sensorHardware=undefined;this.operationScene=undefined;
 }
 loadSourceCAD(onProgress,onPhase){return loadCoreCAD(new GLTFLoader().setMeshoptDecoder(MeshoptDecoder),onProgress,onPhase);}
 async load(preparedCAD){
  const loadingUI=createModelLoading(this.container,{stage:preparedCAD?'parts':'network',withCableInputs:!!preparedCAD});this.loadingUI=loadingUI;const loading=loadingUI.element;this.loadingElement=loading;
  const gltf=preparedCAD||await this.loadSourceCAD(loadingUI.transfer,loadingUI.stage);
  if(this.disposed){releaseUnadoptedCAD(gltf.scene);return;}this.pendingCAD=gltf.scene;
  loadingUI.stage('parts');
  const subsets=await fetch('./assets/cad-subsets.json?v=20261106-96').then(r=>{if(!r.ok)throw Error('CAD部品を読み込めません');return r.json();});
  if(this.disposed)return;
  gltf.scene.updateMatrixWorld(true);
  const pending=[];
  const walk=(node,key='frame',name='',path=[],displayName='')=>{
   const id=node.userData.cadIndex;
   if(CAD_ROOTS[id])key=CAD_ROOTS[id];
   const raw=node.userData.cadName||'';
   if(raw&&!raw.startsWith('=>'))name=raw;
   displayName=cadDisplayName(raw,displayName);
   const ids=id===undefined?path:[...path,id];
   if(node.isMesh)pending.push({node,key,name,displayName,ids,matrix:node.matrixWorld.clone()});
   node.children.forEach(n=>walk(n,key,name,ids,displayName));
  };walk(gltf.scene);
  let preparedParts=0;loadingUI.parts(0,pending.length);if(!await loadingUI.paint())return;
  for(const item of pending){
   const {node,name,displayName,ids,matrix}=item;
   // Original nuts move with the old sensor and are removed before the new body.
   const key=ids.some(id=>[228,230].includes(id))?'sensorOld':item.key;
   const subset=subsets[ids.at(-1)];
   if(subset){
    const source=node.geometry,index=source.index,vertices=new Map(),order=[];
    for(const face of subset.faces)for(let k=0;k<3;k++){const i=index?index.getX(face*3+k):face*3+k;if(!vertices.has(i))vertices.set(i,vertices.size);order.push(vertices.get(i));}
    const geometry=new THREE.BufferGeometry();for(const [name,attr]of Object.entries(source.attributes)){const values=new attr.array.constructor(vertices.size*attr.itemSize);for(const [old,i]of vertices)for(let k=0;k<attr.itemSize;k++)values[i*attr.itemSize+k]=attr.array[old*attr.itemSize+k];geometry.setAttribute(name,new THREE.BufferAttribute(values,attr.itemSize,attr.normalized));}geometry.setIndex(order);node.geometry=geometry;node.userData.sourceGeometry=source;
   }
   const group=this.group(key);node.removeFromParent();matrix.decompose(node.position,node.quaternion,node.scale);group.add(node);
   node.userData.sourceRestPosition=node.position.clone();
   for(const [id,offset]of Object.entries(subsets._offsets||{}))if(ids.includes(Number(id)))node.position.add(vec(offset).multiplyScalar(.001));
   node.userData.part=key;node.userData.cadName=displayName;node.userData.cadSourceName=name;node.userData.cadIndex=ids.at(-1);node.userData.cadPath=ids;node.castShadow=true;node.receiveShadow=true;
   const source=Array.isArray(node.material)?node.material:[node.material];
   const sourceCADMaterials=this.sourceCADMaterials??=new Set();for(const material of source)sourceCADMaterials.add(material);
   const finish=source.map(m=>{const mat=m.clone();mat.roughness=.55;mat.metalness=.15;mat.envMapIntensity=.45;
    mat.userData.finish=finishCAD(mat,{key,name,ids});
    const glass=['windowLeft','windowRight'].includes(key)||ids.includes(89)||ids.includes(572);
    if(glass){const top=ids.includes(89);mat.color.set(top?'#3c4140':'#9eacaa');mat.opacity=top ? .45 : .16;mat.transparent=true;mat.depthWrite=false;mat.side=THREE.DoubleSide;mat.roughness=.12;mat.metalness=.04;node.userData.glass=true;node.castShadow=false;}
    mat.userData.originalOpacity=mat.opacity;mat.userData.originalColor=mat.color.clone();return mat;});
   node.material=Array.isArray(node.material)?finish:finish[0];finishMotor(node,name);node.userData.manualExcluded=ids.includes(189)||ids.includes(891)||ids.includes(77)||ids.some(id=>[228,230].includes(id))||[617,619,621,623,625].includes(ids.at(-1));this.meshes.push(node);
   this.records.push({key,name:displayName.replace(/\s+v\d+(?:\.\d+)?/g,'').replace(/:\d+$/,''),sourceName:name,mesh:node,id:node.uuid});
   loadingUI.parts(++preparedParts,pending.length);
   if(preparedParts%32===0&&!await loadingUI.paint())return;
  }
  this.pendingCAD=undefined;
  loadingUI.stage('surfaces');
  if(!await loadingUI.paint())return;
  const surfacesReady=await restoreCADSurfaces(this.meshes,{onProgress:p=>loadingUI.items('surfaces',p.done,p.total),onActivity:s=>{this.surfacePreparationStats=s;loadingUI.workers(s.workerActive,s.workers);},onPool:pool=>{this.surfacePreparationPool=pool;},isCurrent:()=>!this.disposed});if(!surfacesReady||this.disposed)return;
  loadingUI.stage('hardware');
  if(!await loadingUI.paint())return;
  let hardwareDone=0;const hardwareTotal=Object.keys(upgradeFiles).length+12,hardwareProgress=()=>loadingUI.items('hardware',++hardwareDone,hardwareTotal);loadingUI.items('hardware',0,hardwareTotal);
  await installChamberFanAnatomy(this);
  hardwareProgress();
  for(const mesh of await configurePrintheadCovers(this.meshes,this.records)){this.group('head').add(mesh);this.meshes.push(mesh);this.records.push({key:'head',name:mesh.userData.cadName,mesh,id:mesh.uuid});}
  hardwareProgress();
  // Suppress the alternate reference sensor supplied alongside the assembled one.
  if(this.groups.alternate)this.groups.alternate.visible=false;
  // Keep every CAD leaf in the same source frame. Door motion uses the pin axis,
  // rather than shifting the entire library group (which includes fixed leaves).
  const placements=await fetch('./assets/upgrade-placements.json?v=20261105-52').then(r=>{if(!r.ok)throw Error('部品配置を読み込めません');return r.json();});
  hardwareProgress();
  const stl=new STLLoader();
  const upgrades=await Promise.allSettled(Object.entries(upgradeFiles).map(async([key,file])=>{
   const geometry=await stl.loadAsync('./assets/upgrade/'+encodeURIComponent(file));geometry.scale(.001,.001,.001);smoothCreases(geometry);
   const mesh=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color:key==='sensorSwitch'?'#fd5000':'#303331',roughness:.7,metalness:.05,envMapIntensity:.4}));
   const rows=placements[key];const matrix=new THREE.Matrix4().set(...rows.flat());matrix.elements[12]/=1000;matrix.elements[13]/=1000;matrix.elements[14]/=1000;matrix.decompose(mesh.position,mesh.quaternion,mesh.scale);
   mesh.userData.part=key;mesh.userData.cadName=PARTS[key].en;mesh.castShadow=true;mesh.receiveShadow=true;mesh.material.userData.originalOpacity=1;mesh.material.userData.originalColor=mesh.material.color.clone();this.group(key).add(mesh);this.meshes.push(mesh);this.records.push({key,name:PARTS[key].en,mesh,id:mesh.uuid});
   hardwareProgress();
  }));
  const failedUpgrade=upgrades.find(result=>result.status==='rejected');if(failedUpgrade)throw failedUpgrade.reason;
  const ventGeometries=[];
  try{
   for(const length of [10,12]){
    const geometry=await stl.loadAsync(`./assets/hardware/M3x${length}rT.stl`);ventGeometries.push(geometry);geometry.scale(.001,.001,.001);smoothCreases(geometry);
    hardwareProgress();
   }
   const variants=ventGeometries.map(geometry=>Object.fromEntries(Object.entries(VENT_DATUM.underhead).map(([id,origin])=>{
    const mesh=this.meshes.find(m=>m.userData.cadPath?.includes(Number(id)));if(!mesh)throw Error('Missing vent screw in CAD');mesh.updateMatrix();return [id,geometry.clone().translate(...origin).applyMatrix4(mesh.matrix.clone().invert())];
   })));
   this.ventHardware=createVentHardware(this.meshes,variants[1],this.records,variants[0]);
  }finally{ventGeometries.forEach(geometry=>geometry.dispose());}
  const adopt=meshes=>{for(const mesh of meshes){
   const key=mesh.userData.part;
   if(mesh.material.map)mesh.material.map.anisotropy=Math.min(8,this.renderer.capabilities?.getMaxAnisotropy()??8);
   mesh.material.userData.originalOpacity=1;mesh.material.userData.originalColor=mesh.material.color.clone();
   if(!mesh.userData.preserveCadName)mesh.userData.cadName=PARTS[key]?.en||mesh.userData.cadName;
   this.group(key).add(mesh);this.meshes.push(mesh);this.records.push({key,name:mesh.userData.cadName,mesh,id:mesh.uuid});
  }};
  adopt([createDisplayPanel(this.meshes.find(m=>m.userData.cadIndex===595))]);
  hardwareProgress();
  adopt(await createXlcdHardware(this.meshes));
  hardwareProgress();
  adopt(await createDoorHardware(this.meshes,this.records));
  hardwareProgress();
  adopt(createDoorHandleHardware(this.meshes));
  hardwareProgress();
  adopt(createBaseHardware());
  hardwareProgress();
  this.feHardware=createFeHardware(this.meshes);adopt(this.feHardware.meshes);
  hardwareProgress();
  this.splitterHardware=await createStepperSplitter();adopt(this.splitterHardware.meshes);
  hardwareProgress();
  loadingUI.items('electronics',0,7);if(!await loadingUI.paint())return;adopt(await createElectronics());loadingUI.items('electronics',1,7);adopt(await createNextruder());loadingUI.items('electronics',2,7);adopt(await createNextruderSensor());loadingUI.items('electronics',3,7);
  adopt([createIdlerSwivelSpacer()]);
  loadingUI.items('electronics',4,7);
  adopt(createIdlerSprings());
  loadingUI.items('electronics',5,7);
  this.nfcHardware=await createXbuddyNfc();adopt(this.nfcHardware.meshes);
  loadingUI.items('electronics',6,7);
  this.wifiHardware=await createXbuddyWifi();adopt(this.wifiHardware.meshes);
  loadingUI.items('electronics',7,7);
  loadingUI.items('axes',0,9);if(!await loadingUI.paint())return;adopt(await createCoreXYParts(this.meshes));loadingUI.items('axes',1,9);
  adopt(await createBedstopHardware(this.meshes));loadingUI.items('axes',2,9);adopt(createPulleySetupHardware(this));loadingUI.items('axes',3,9);adopt(createXPulleySetupHardware(this));loadingUI.items('axes',4,9);
  this.sensorHardware=await createSensorInternals(this.meshes,this.records);adopt(this.sensorHardware.meshes);loadingUI.items('axes',5,9);adopt([createSideSensorInputPtfe()]);loadingUI.items('axes',6,9);this.sidePtfeCompletion=prepareSidePtfeCompletion(this);adopt(this.sidePtfeCompletion.meshes);loadingUI.items('axes',7,9);
  this.ptfeHardware=await createPtfeHardware(this.meshes);adopt(this.ptfeHardware.meshes);
  loadingUI.items('axes',8,9);
  this.sideSensorHardware=await createSideSensorAssembly(this.meshes);adopt(this.sideSensorHardware.meshes);
  loadingUI.items('axes',9,9);
  loadingUI.items('cables',0,8);if(!await loadingUI.paint())return;this.mainLoom=createMainLoomAssembly();this.retainPreparationGeometries();loadingUI.items('cables',1,8);if(!await loadingUI.paint())return;
  this.fasteners=createFasteners([...this.ptfeHardware.entities,...this.mainLoom.entities,...this.sideSensorHardware.entities]);
  this.retainPreparationGeometries();loadingUI.items('cables',2,8);if(!await loadingUI.paint())return;
  adopt(createOriginalTensionerParts(this));
  loadingUI.items('cables',3,8);
  adopt(createTensionerInstallationTools(this));
  loadingUI.items('cables',4,8);
  this.sidePtfeCompletion.bindEntities(this.fasteners);installNextruderCables(this);
  loadingUI.items('cables',5,8);
  installAssemblyFanCables(this);
  loadingUI.items('cables',6,8);
  localizePartMetadata();
  for(const mesh of this.fasteners.meshes){const key=mesh.userData.part;this.group(key).add(mesh);this.meshes.push(mesh);this.records.push({key,name:mesh.userData.cadName,mesh,id:mesh.uuid});}
  loadingUI.items('cables',7,8);
  installMainLoomNative615(this);
  loadingUI.items('cables',8,8);
  loadingUI.items('finishing',0,5);if(!await loadingUI.paint())return;this.partMarkings=await installPartMarkings(this.meshes);loadingUI.items('finishing',1,5);
  for(const mesh of this.meshes){mesh.userData.restPosition=mesh.position.clone();mesh.userData.restQuaternion=mesh.quaternion.clone();}
  this.hotendHook=createHotendHook(this);
  this.director=new AssemblyDirector(this.meshes);
  loadingUI.items('finishing',2,5);
  preparePgMechanism(this);
  loadingUI.items('finishing',3,5);
  installBedFamily15(this);installHeatbedAssembly(this);
  loadingUI.items('finishing',4,5);
  this.printer.updateMatrixWorld(true);const bbox=new THREE.Box3().setFromObject(this.printer);const center=bbox.getCenter(new THREE.Vector3());this.printer.position.set(-center.x,-bbox.min.y,-center.z);this.printerOrigin=this.printer.position.clone();this.height=bbox.max.y-bbox.min.y;
  this.defaultBounds=bbox.clone().translate(this.printer.position);this.defaultTarget=this.defaultBounds.getCenter(new THREE.Vector3());this.setView('perspective',true,true);this.setupHotspots();loadingUI.items('finishing',5,5);loadingUI.items('motions',0,2);if(!await loadingUI.paint())return;await installCorexy577(this);loadingUI.items('motions',1,2);installCorexyWorkingView(this);this.loaded=true;installRearMainForFlows(this);loadingUI.items('motions',2,2);loadingUI.remove();this.loadingUI=undefined;this.loadingElement=undefined;this.onReady?.(true);if(this.state)this.setState(this.state);this.dirty=true;
 }
 group(key){if(!this.groups[key]){const g=new THREE.Group();g.name=key;g.userData.base=new THREE.Vector3();g.userData.target=new THREE.Vector3();this.groups[key]=g;this.printer.add(g);}return this.groups[key];}
 configureControls(){this.controls.target.set(0,260,0);this.controls.enableDamping=true;this.controls.dampingFactor=.09;this.controls.minDistance=140;this.controls.maxDistance=4000;this.controls.maxPolarAngle=Math.PI*.48;this.controls.addEventListener('change',()=>{this.dirty=true;});this.controls.addEventListener('start',()=>this.holdCamera());}
 holdCamera(){this.manualCamera=true;this.cameraTween=null;this.dirty=true;}
 resize(){this.calloutLayout=null;const w=this.container.clientWidth,h=this.container.clientHeight;if(!w||!h)return;const reframe=!this.lastWidth||Math.abs(w-this.lastWidth)>this.lastWidth*.2||Math.abs(h-(this.lastHeight||h))>(this.lastHeight||h)*.15;this.lastWidth=w;this.lastHeight=h;
  // Keep phone edges crisp, with a bounded framebuffer for large/fullscreen views.
  this.renderer.setPixelRatio?.(Math.min(globalThis.devicePixelRatio||1,2,Math.sqrt(2000000/(w*h))));
  this.renderer.setSize(w,h);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();if(this.loaded&&reframe&&!this.manualCamera){const index=this.activeOperation||0;if(this.lastOperationFocus===index&&(this.sceneActors?.[index]?.flex||this.sceneActors?.[index]?.focusMotion))this.focusOperation(index,true);else this.setView(this.currentView||'perspective',true,true);}this.dirty=true;}
 setInteraction(enabled){this.calloutLayout=null;this.interactionEnabled=enabled;this.controls.enabled=enabled;this.renderer.domElement.style.touchAction=enabled?'none':'pan-y';const b=document.getElementById('touch-model-toggle');if(b){b.removeAttribute('aria-pressed');b.textContent=tr(enabled?'視点を固定':'固定を解除');}const hint=document.getElementById('gesture-help');if(hint)hint.textContent=tr(matchMedia('(pointer: coarse)').matches?(enabled?'1本指で回転・2本指で移動と拡大':'視点を固定中'):'ドラッグで回転・スクロールで拡大');this.dirty=true;}

 setState(state){
  state={...state,edition:state.flow==='build'&&FLOWS.build.manualID===2251?'original2251':state.edition};
  this.state=state;if(!this.loaded)return;
  const signature=[state.edition,state.flow,state.index,state.variant,state.comparison,state.explore].join(':');
  if(signature===this.sceneSignature)return;clearElectronicsTie(this);clearAssemblyTeachingCamera(this);
  this.sceneSignature=signature;this.controls.minDistance=140;this.playing=false;this.selected=null;this.explode=0;this.doorOpen=false;this.doorAngle=0;this.manualCamera=false;
  this.ventHardware?.apply(ventConfiguration(state,FLOWS[state.flow].steps[state.index]));
  this.sensorHardware?.apply(state.edition==='original2251'?'original':state.flow==='upgrade'||state.comparison==='before'?'upgrade':'kit');
  this.operationScene=this.director.scene(state);const scene=this.operationScene;
  this.solidNodes=new Set(this.director.resolve(scene.plan.solidRefs||[]));
  this.fasteners.restore(scene.flexStates);
  this.printer.rotation.set(-Math.PI/2,0,0);
  this.controls.maxPolarAngle=scene.plan.undersideView?Math.PI*.7:Math.PI*.48;
  if(['back','psu','electronics','psu-cover','fan-grid'].includes(scene.plan.workspace))this.printer.rotation.set(0,0,0);
  if(scene.plan.workspace==='board-prep')this.printer.rotation.set(Math.PI,0,0);
  if(scene.plan.pose==='xbuddy-back-up')this.printer.rotation.set(-Math.PI/2,0,0);
  if(scene.plan.pose==='ntc-bench')this.printer.rotation.set(0,0,0);
  if(scene.plan.pose==='bed-stop-bench')this.printer.rotation.set(0,0,-Math.PI/2);
  if(scene.plan.pose==='holders-bench')this.printer.rotation.set(0,0,0);
  if(scene.plan.pose==='lcd-back')this.printer.rotation.set(Math.PI/4,0,0);
  if(scene.plan.pose==='lcd-front')this.printer.rotation.set(-3*Math.PI/4,0,0);
  if(['right-panel','sensor','old-sensor','handle'].includes(scene.plan.workspace))this.printer.rotation.set(0,0,Math.PI/2);
  if(['sensor','old-sensor'].includes(scene.plan.workspace))this.printer.quaternion.copy(sensorBenchQuaternion());
  if(scene.plan.pose==='printer-standing')this.printer.rotation.set(-Math.PI/2,0,0);
  if(scene.plan.workspace==='left-panel')this.printer.rotation.set(0,0,-Math.PI/2);
  if(scene.plan.workspace==='door-panel')this.printer.rotation.set(Math.PI,0,0);
  const n=scene.plan.step;
  if(scene.plan.workspace==='bottom'&&n>=16||scene.plan.workspace==='base'&&n<=5||scene.plan.workspace==='xy'&&([28,29,30,31,40,47,53].includes(n))||scene.plan.workspace==='top'&&(state.flow==='build'?n>=6:n!==27))this.printer.rotation.set(Math.PI/2,0,0);
  if(scene.plan.pose==='underside')this.printer.rotation.set(Math.PI/2,0,0);
  if(scene.plan.pose==='top-outside')this.printer.rotation.set(-Math.PI/2,0,0);
  if(scene.plan.pose==='back-inner'||scene.plan.workspace==='fan-grid')this.printer.rotation.set(Math.PI,0,0);
  if(!this.rearSupports){this.rearSupports=createRearSupports();this.printer.add(this.rearSupports);}
  this.rearSupports.visible=scene.plan.pose==='printer-back';
  if(scene.plan.pose==='printer-back')this.printer.rotation.set(Math.PI,0,0);
  this.sceneActors=[];this.activeOperation=0;this.lastOperationFocus=undefined;this.lastFocusSettled=false;this.operationProgress=scene.actors.length?0:1;this.autoplayPending=scene.actors.length>0&&!reduced;
  this.clearGuides();
  for(const [key,g] of Object.entries(this.groups)){g.position.copy(g.userData.base);g.rotation.z=0;g.visible=key!=='alternate';g.userData.highlight=false;}
  const visible=new Set(scene.visible);this.inspectionNodes=new Set(this.director.resolve(scene.plan.inspectRefs||[]));
  for(const mesh of this.meshes){
   mesh.position.copy(mesh.userData.restPosition);mesh.quaternion.copy(mesh.userData.restQuaternion);
   const rows=scene.restPoses?.[mesh.userData.part];
   if(rows){const matrix=new THREE.Matrix4().set(...rows.flat());for(const i of [12,13,14])matrix.elements[i]*=.001;matrix.decompose(mesh.position,mesh.quaternion,mesh.scale);}
   for(const pose of scene.instanceOffsets||[])if(mesh.userData.cadIndex===pose.cadIndex)mesh.position.add(vec(pose.offset).multiplyScalar(.001));
   mesh.visible=visible.has(mesh);mesh.userData.active=this.inspectionNodes.has(mesh);
  }
  for(const pose of scene.plan.workpiecePoses||[]){
   const angle=vec(pose.rotation),q=new THREE.Quaternion();if(angle.length())q.setFromAxisAngle(angle.clone().normalize(),THREE.MathUtils.degToRad(angle.length()));
   const pivot=vec(pose.pivot).multiplyScalar(.001),offset=vec(pose.offset||[0,0,0]).multiplyScalar(.001);
   for(const mesh of this.director.resolve(pose.refs)){mesh.position.sub(pivot).applyQuaternion(q).add(pivot).add(offset);mesh.quaternion.premultiply(q);}
  }
  for(const mesh of this.meshes){mesh.userData.sceneRestPosition=mesh.position.clone();mesh.userData.sceneRestQuaternion=mesh.quaternion.clone();}
  this.printer.position.copy(this.printerOrigin);this.printer.updateMatrixWorld(true);
  followLcdEarth(this);followLcdRibbon(this);followStepperSplitter(this);followBasePins(this);followFeHardware(this);
  const inv=this.printer.matrixWorld.clone().invert();
  const localBox=nodes=>{const b=new THREE.Box3();for(const m of nodes){m.geometry.computeBoundingBox();b.union(m.geometry.boundingBox.clone().applyMatrix4(m.matrixWorld).applyMatrix4(inv));}return b;};
  const allActors=new Set(scene.actors.flatMap(a=>a.nodes));
  const contextBox=localBox(scene.visible.filter(m=>!allActors.has(m)));
  for(const actor of scene.actors){
   let box,path,focusBox;
   if(actor.flex){
    this.fasteners.animate(actor,1);box=localBox(actor.nodes);focusBox=box.clone();this.fasteners.animate(actor,0);box.union(localBox(actor.nodes));
    if(actor.flex.some(id=>{const e=this.fasteners.entities.get(id);return e?.routeModel&&!e.strap;})){
     // A long tail can extend farther during tightening than at either endpoint.
     for(const t of [...Array.from({length:31},(_,i)=>(i+1)/32),.95,.97,.99]){this.fasteners.animate(actor,t);box.union(localBox(actor.nodes));}
     focusBox=box.clone();this.fasteners.animate(actor,0);
    }
    path=[new THREE.Vector3(),new THREE.Vector3()];
   }else{box=localBox(actor.nodes);path=actor.waypoints?actor.waypoints.map(p=>vec(p).multiplyScalar(.001)):approachPath(box,contextBox,actor.axis,actor.distance,actor.seat);}
   const label=scene.plan.actors[actor.sourceIndex]?.label??actor.label;
   this.sceneActors.push({...actor,label,box,focusBox,path,contextBox:contextBox.clone()});
   if(!actor.remove)contextBox.union(box);
  }
  // A detached workpiece is placed on the desk as one rigid assembly.
  if(scene.plan.pose!=='printer-standing'&&(scene.plan.workspace!=='printer'||scene.plan.pose==='printer-back'||scene.plan.pose==='underside')&&scene.visible.length){const b=new THREE.Box3();for(const m of scene.visible)b.union(new THREE.Box3().setFromObject(m));const c=b.getCenter(new THREE.Vector3());this.printer.position.x-=c.x;this.printer.position.z-=c.z;if(this.rearSupports.visible){this.printer.updateMatrixWorld(true);this.printer.position.y-=new THREE.Box3().setFromObject(this.rearSupports).min.y;}else this.printer.position.y-=b.min.y;}
  if(scene.plan.benchLift)this.printer.position.y+=scene.plan.benchLift;
  this.printer.updateMatrixWorld(true);
  const box=new THREE.Box3();for(const m of scene.visible)box.union(new THREE.Box3().setFromObject(m));
  for(const actor of this.sceneActors)box.union(motionBounds(actor).applyMatrix4(this.printer.matrixWorld));
  // Close-up of small operations, while keeping their real mounting context.
  const focus=scene.plan.focus?.length?this.director.resolve(scene.plan.focus):[];
  if(focus.length){const b=new THREE.Box3();focus.forEach(m=>b.union(new THREE.Box3().setFromObject(m)));b.expandByScalar(scene.plan.focusPadding??65);for(const actor of this.sceneActors)b.union((actor.cableApproach?new THREE.Box3(vec(actor.focusBounds.slice(0,3)).multiplyScalar(.001),vec(actor.focusBounds.slice(3)).multiplyScalar(.001)):motionBounds(actor)).applyMatrix4(this.printer.matrixWorld));this.sceneBounds=b;}else this.sceneBounds=box.isEmpty()?this.defaultBounds:box;
   if(scene.plan.viewBounds&&!scene.full){this.sceneBounds=new THREE.Box3(vec(scene.plan.viewBounds.slice(0,3)).multiplyScalar(.001),vec(scene.plan.viewBounds.slice(3)).multiplyScalar(.001)).applyMatrix4(this.printer.matrixWorld);this.controls.minDistance=scene.plan.viewMinDistance??140;}
   const requested=FLOWS[state.flow].steps[state.index].view||'perspective';
  const view=scene.plan.camera||(scene.plan.pose==='printer-back'?(scene.plan.step===45?'base-right-perspective':'base-left-perspective'):scene.plan.pose==='back-inner'||scene.plan.workspace==='fan-grid'?'fan-perspective':['electronics','board-prep'].includes(scene.plan.workspace)?'board-perspective':scene.plan.workspace!=='printer'?'perspective':this.sceneActors.length&&['back','right','top'].includes(requested)?requested+'-perspective':requested);
  this.guidedView=view;this.buildGuides();this.setProgress(this.operationProgress);this.setView(view,true,true);this.updateOperationUI(true);this.applyMaterials();this.dirty=true;
 }
 clearGuides(){
  this.calloutLayout=null;
  this.guideLabels?.forEach(x=>x.el.remove());this.guideLabels=[];
  this.arrowLayer.traverse(o=>{if(o.userData.ownedGeometry)o.geometry?.dispose();if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose());});this.arrowLayer.clear();
 }
 buildGuides(){
  this.guideGroups=[];
  if(this.inspectionNodes?.size){
   const b=new THREE.Box3();for(const m of this.inspectionNodes)b.union(new THREE.Box3().setFromObject(m));b.expandByScalar(this.operationScene.plan.inspectionPadding??3);
   const size=b.getSize(new THREE.Vector3()),center=b.getCenter(new THREE.Vector3()),boxGeometry=new THREE.BoxGeometry(...size.toArray()),edges=new THREE.EdgesGeometry(boxGeometry);boxGeometry.dispose();
   const outline=new THREE.LineSegments(edges,new THREE.LineDashedMaterial({color:0xfd5000,dashSize:3,gapSize:2,transparent:true,depthTest:false,depthWrite:false}));outline.position.copy(center);outline.computeLineDistances();outline.renderOrder=22;outline.userData.ownedGeometry=true;outline.userData.inspection=true;this.arrowLayer.add(outline);
   const el=document.createElement('div');el.className='operation-callout';el.textContent=this.operationScene.plan.inspectionLabel;document.getElementById('hotspots').append(el);const avoidWorldPoints=[];for(const x of[b.min.x,b.max.x])for(const y of[b.min.y,b.max.y])for(const z of[b.min.z,b.max.z])avoidWorldPoints.push(vec([x,y,z]));this.guideLabels.push({el,point:center,index:-1,inspection:true,avoidWorldPoints});
  }
  this.sceneActors.forEach((actor,i)=>{
   const guide=new THREE.Group();this.arrowLayer.add(guide);this.guideGroups.push(guide);
   if(actor.attentionBounds){const region=operationRegion(this.director.resolve(actor.attentionRefs),actor.attentionBounds);if(region){if(actor.inspection)region.material.opacity=.18;guide.add(region);}}
   if(actor.flex){
    const bayLock=this.operationScene.plan.chapter===6&&this.operationScene.plan.step===56&&actor.flex.includes('box4');
    for(const points of this.fasteners.guides(actor)){
     const world=points.map(p=>p.clone().applyMatrix4(this.printer.matrixWorld));const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(world),guideMaterial(world,3));line.computeLineDistances();line.userData.ownedGeometry=true;line.renderOrder=20;guide.add(line);
     const end=world.at(-1),dir=end.clone().sub(world.at(-2)).normalize(),arrow=actor.guideArrowLength??(bayLock?3:9);guide.add(overlayArrow(new THREE.ArrowHelper(dir,end.clone().addScaledVector(dir,-arrow),arrow,0xfd5000,Math.min(4,arrow*.45),Math.min(2,arrow*.23))));
     const ring=new THREE.Mesh(new THREE.TorusGeometry(actor.guideRadius??(bayLock?1:4),actor.guideTube??(bayLock?.12:.6),6,24),new THREE.MeshBasicMaterial({color:0xfd5000,transparent:true,depthTest:false,depthWrite:false}));ring.position.copy(world[points.targetIndex??1]);ring.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),dir);ring.renderOrder=21;ring.userData.ownedGeometry=true;guide.add(ring);
    }
    const el=document.createElement('div');el.className='operation-callout';el.textContent=`${sourceIndex(actor,i)+1}  ${actor.label}`;document.getElementById('hotspots').append(el);const labelPoint=actor.cableApproach?this.fasteners.entities.get(actor.cableApproach).attachmentReference.clone():actor.anchors?.length?vec(actor.anchors[0]).multiplyScalar(.001):(actor.focusBox||actor.box).getCenter(new THREE.Vector3());this.guideLabels.push({el,point:labelPoint.applyMatrix4(this.printer.matrixWorld),index:i});return;
   }
   if(actor.inspection&&actor.attentionBounds){
    // A check identifies a connector; an insertion arrow would imply movement.
    // Keep the actual socket and its cavity visible inside a light dashed frame.
    const b=actor.attentionBounds,y=b[4]+.3,points=[[b[0],y,b[2]],[b[3],y,b[2]],[b[3],y,b[5]],[b[0],y,b[5]],[b[0],y,b[2]]].map(p=>vec(p).multiplyScalar(.001).applyMatrix4(this.printer.matrixWorld));
    const outline=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineDashedMaterial({color:0xfd5000,dashSize:1.4,gapSize:.8,depthTest:false,depthWrite:false}));outline.computeLineDistances();outline.userData.ownedGeometry=true;outline.renderOrder=22;guide.add(outline);
    const el=document.createElement('div');el.className='operation-callout';el.textContent=`${sourceIndex(actor,i)+1}  ${actor.label}`;document.getElementById('hotspots').append(el);this.guideLabels.push({el,point:vec(actor.anchors[0]).multiplyScalar(.001).applyMatrix4(this.printer.matrixWorld),index:i});return;
   }
   const center=actor.box.getCenter(new THREE.Vector3()),size=actor.box.getSize(new THREE.Vector3());
   const axes=['x','y','z'],normal=axes.reduce((a,k)=>Math.abs(actor.axis[axes.indexOf(k)])>Math.abs(actor.axis[axes.indexOf(a)])?k:a,'x');
   const span=axes.filter(k=>k!==normal).sort((a,b)=>size[b]-size[a])[0];
   // A screw turns about its own axis. Its insertion guide follows that axis,
   // rather than tracing two off-axis points through several full revolutions.
   const axialSpin=actor.spin&&actor.path.some(p=>p.distanceTo(actor.path.at(-1))>1e-9);
   const anchors=actor.anchors?actor.anchors.map(p=>vec(p).multiplyScalar(.001)):axialSpin?[center]:size[span]>.045||actor.spin?[-1,1].map(sign=>{const p=center.clone();p[span]+=sign*size[span]*(actor.spin?.66:.42);return p;}):[center];
   const guidePath=point=>actor.inspection?[point.clone().addScaledVector(vec(actor.axis).normalize(),.012),point.clone()]:motionGuide(axialSpin?{...actor,spin:undefined}:actor,point);
   for(const anchor of anchors){const points=guidePath(anchor).map(p=>p.applyMatrix4(this.printer.matrixWorld));const geometry=new THREE.BufferGeometry().setFromPoints(points);const line=new THREE.Line(geometry,guideMaterial(points));line.computeLineDistances();line.renderOrder=20;line.userData.ownedGeometry=true;guide.add(line);}
   const path=guidePath(actor.guideAtAnchor||actor.spin||actor.inspection?anchors[0]:center).map(p=>p.applyMatrix4(this.printer.matrixWorld));
   const end=path.at(-1),dir=path.at(-1).clone().sub(path.at(-2)).normalize(),travel=path.slice(1).reduce((n,p,i)=>n+p.distanceTo(path[i]),0),arrowLength=actor.guideArrowLength??Math.min(22,Math.max(3,travel*.65));
   if(dir.lengthSq())guide.add(overlayArrow(new THREE.ArrowHelper(actor.remove?dir.clone().negate():dir,actor.remove?path[0]:end.clone().addScaledVector(dir,-arrowLength),arrowLength,0xfd5000,Math.min(9,arrowLength*.45),Math.min(5,arrowLength*.3))));
   const radius=actor.anchors?3.8:Math.max(6,Math.min(22,actor.box.getSize(new THREE.Vector3()).length()*120));
   const finalPose=rigidMotion(actor,1);
   const ringPoints=actor.anchors?anchors.map(p=>p.clone().sub(finalPose.pivot).applyQuaternion(finalPose.rotation).add(finalPose.pivot).add(finalPose.offset).applyMatrix4(this.printer.matrixWorld)):[end];
   if(actor.guideOrigin)ringPoints.push(path[0]);
   for(const point of ringPoints){
    const ring=new THREE.Mesh(new THREE.TorusGeometry(actor.guideRadius??Math.min(radius,Math.max(4,travel*.45)),actor.guideTube??(actor.anchors ? .55 : 1.1),6,32),new THREE.MeshBasicMaterial({color:0xfd5000,transparent:true,depthTest:false,depthWrite:false}));ring.position.copy(point);ring.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),dir.lengthSq()?dir:new THREE.Vector3(0,1,0));ring.renderOrder=21;ring.userData.ownedGeometry=true;guide.add(ring);
   }
   if(actor.guideGhost!==false&&!actor.remove&&!actor.spin&&!actor.handling)for(const mesh of actor.nodes){const ghost=new THREE.Mesh(mesh.geometry,new THREE.MeshBasicMaterial({color:0xfd5000,transparent:true,opacity:.12,depthWrite:false,depthTest:false}));ghost.matrixAutoUpdate=false;const endPose=rigidMotion(actor,1),transform=new THREE.Matrix4().makeTranslation(...endPose.pivot.clone().add(endPose.offset).toArray()).multiply(new THREE.Matrix4().makeRotationFromQuaternion(endPose.rotation)).multiply(new THREE.Matrix4().makeTranslation(...endPose.pivot.clone().negate().toArray()));ghost.matrix.copy(this.printer.matrixWorld).multiply(transform).multiply(this.printer.matrixWorld.clone().invert()).multiply(mesh.matrixWorld);ghost.userData.targetGhost=true;ghost.renderOrder=8;guide.add(ghost);}
   const el=document.createElement('div');el.className='operation-callout';el.textContent=`${sourceIndex(actor,i)+1}  ${actor.label}`;document.getElementById('hotspots').append(el);this.guideLabels.push({el,point:end,index:i});
  });
 }
 setProgress(progress){if(!this.loaded||this.disposed)return;clearTieWorkingViewOffset(this,true);
  this.operationProgress=THREE.MathUtils.clamp(progress,0,1);if(!this.sceneActors?.length){followPgMechanism(this);followMainLoom(this);this.hotendHook?.apply();followIdlerSprings(this);followLcdEarth(this);followLcdRibbon(this);followStepperSplitter(this);followBasePins(this);followFeHardware(this);followThermalPads(this);followXbuddyNfc(this);followPulleySetup(this);followXPulleySetup(this);followSidePtfeCompletion(this);followSideIRService(this);followMountedSensorLead(this);followTensionerService(this);this.rearMainFlowRouting?.follow();followXBuddyCompleteOwner(this);this.updateOperationUI();return;}
  const current=operationAt(this.operationProgress,this.sceneActors.length);
  const flexUpdates=new Map(),posed=new Set(),previewed=new Set();
  for(const actor of this.sceneActors)if(actor.flex)for(const id of actor.flex)if(!flexUpdates.has(id)){const state=this.operationScene.flexStates?.[id]||0;flexUpdates.set(id,{from:state,to:state,t:1,visible:!!state||actor.showBefore===true,active:false});}
  this.sceneActors.forEach((actor,i)=>{
   const before=i>current.index,after=i<current.index,t=before?0:after?1:current.t;
   if(actor.flex){
    if(!before)for(const id of actor.flex)flexUpdates.set(id,{from:actor.fromStates[id]||0,to:actor.to,t,visible:true,active:i===current.index&&this.operationProgress<1});
    if(this.guideGroups?.[i])this.guideGroups[i].visible=Boolean(i===current.index&&this.labels&&(this.operationProgress<1||!!actor.cableApproach));
    return;
   }
   const {offset,rotation,pivot}=rigidMotion(actor,t);
   for(const child of this.guideGroups?.[i]?.children||[])if(child.userData.motionHighlight){child.matrix.copy(this.printer.matrixWorld).multiply(new THREE.Matrix4().makeTranslation(...pivot.clone().add(offset).toArray())).multiply(new THREE.Matrix4().makeRotationFromQuaternion(rotation)).multiply(new THREE.Matrix4().makeTranslation(...pivot.clone().negate().toArray()));}
   for(const mesh of actor.nodes){if(before&&(posed.has(mesh)||actor.carry||actor.reuse&&previewed.has(mesh)))continue;mesh.visible=(!before||actor.showBefore===true)&&!(actor.remove&&t>=1&&!actor.keepRemoved);mesh.position.copy(mesh.userData.sceneRestPosition||mesh.userData.restPosition);if(actor.carriedOffsets){const carried=actor.carriedOffsets.get(mesh);if(!carried)throw Error('Incomplete rigid carry');mesh.position.add(carried);}mesh.position.sub(pivot).applyQuaternion(rotation).add(pivot).add(offset);mesh.quaternion.copy(rotation).multiply(mesh.userData.sceneRestQuaternion||mesh.userData.restQuaternion);mesh.userData.active=!actor.handling&&i===current.index&&this.operationProgress<1;if(!before)posed.add(mesh);else if(actor.showBefore)previewed.add(mesh);
   }
   if(this.guideGroups?.[i]){this.guideGroups[i].visible=Boolean(i===current.index&&this.labels&&(this.operationProgress<1||actor.inspection||actor.keepGuide));for(const child of this.guideGroups[i].children)if(child.userData.targetGhost)child.visible=t<.98;}
  });
  preparePairedPowerFlex(this,flexUpdates);for(const [id,q]of flexUpdates){const e=this.fasteners.entities.get(id);e.update(q.from,q.to,q.t);e.mesh.visible=q.visible;e.mesh.userData.active=q.active;}
  followMainLoom(this);
  this.hotendHook?.apply();
  followIdlerSprings(this);
  followLcdEarth(this);followLcdRibbon(this);followStepperSplitter(this);followBasePins(this);followFeHardware(this);followThermalPads(this);followXbuddyNfc(this);followPulleySetup(this);followXPulleySetup(this);
  followSidePtfeCompletion(this);followSideIRService(this);followMountedSensorLead(this);followPgMechanism(this);followTensionerService(this);this.rearMainFlowRouting?.follow();followXBuddyCompleteOwner(this);
  const settled=!!(this.operationProgress===1&&this.operationScene?.plan.settledFocus);
  if(this.playing&&(this.sceneActors[current.index]?.flex||this.sceneActors[current.index]?.focusMotion)&&(this.lastOperationFocus!==current.index||settled!==this.lastFocusSettled))this.focusOperation(current.index);
  this.activeOperation=current.index;followAssemblyTeachingCamera(this);followTieWorkingView(this);followMainPlugWorkingView(this);followMainLoomCutView(this);const phase=current.index+':'+(this.operationProgress===1);if(this.materialPhase!==phase){this.materialPhase=phase;this.applyMaterials();}this.updateOperationUI();this.dirty=true;
 }
 localize(){
  localizePartMetadata();
  this.calloutLayout=null;
  this.sceneActors?.forEach((a,i)=>{a.label=this.operationScene.plan.actors[sourceIndex(a,i)].label;});
  this.guideLabels?.forEach(({el,index,inspection})=>{if(inspection){el.textContent=this.operationScene.plan.inspectionLabel;return;}const actor=this.sceneActors[index];el.textContent=`${sourceIndex(actor,index)+1}  ${actor.label}`;});
  this.updateOperationUI(true);this.setInteraction(this.interactionEnabled);this.dirty=true;
 }
 updateOperationUI(force=false){
  const now=performance.now();if(!force&&this.lastOperationUI&&now-this.lastOperationUI<80)return;this.lastOperationUI=now;
  const enabled=!!this.sceneActors?.length,actor=this.sceneActors?.[this.activeOperation||0];
  const set=(id,text)=>{const e=document.getElementById(id),localized=tr(text);if(e&&e.textContent!==localized)e.textContent=localized;};
  const play=document.getElementById('operation-play');if(play){play.disabled=!enabled;play.textContent=tr(this.playing?'一時停止':this.operationProgress>=1?'もう一度再生':'再生');play.setAttribute('aria-pressed',String(!!this.playing));}
  const slider=document.getElementById('operation-progress');if(slider){slider.disabled=!enabled;slider.value=String(Math.round((this.operationProgress||0)*1000));}
  for(const id of ['operation-start','operation-end']){const e=document.getElementById(id);if(e)e.disabled=!enabled;}
  set('operation-position',enabled?`${sourceIndex(actor,this.activeOperation||0)+1} / ${this.operationScene?.plan.actors?.length||this.sceneActors.length}`:'写真で確認');
  set('operation-title',enabled?actor.label:this.operationScene?.plan.note||'公式手順を確認してください。');
  const connector=document.getElementById('operation-connector'),connectorState=actor?.flex?.map(id=>this.fasteners.entities.get(id)?.mesh.userData.flexState).find(s=>s?.connectorPhase),notice=currentLanguage()==='ja'&&enabled?connectorNotice(actor,this.operationProgress>=1,connectorState):null;
  if(connector){connector.hidden=!notice;if(notice){const label=connector.querySelector('a'),body=connector.querySelector('span');label.textContent=notice.title;label.href=notice.url;label.title=`メーカーの資料：${notice.part}`;body.textContent=notice.body;}}
  set('stage-hint',this.operationScene?.full?'完成形':this.operationScene?.plan.handheld?'LoveBoard一式を手に持って配線する':this.operationScene?.plan.workspace==='printer'?'本体への取り付け':'作業台でサブアセンブリを組み立て');
 }
 togglePlayback(){if(!this.sceneActors?.length)return false;this.autoplayPending=false;if(this.playing){this.playing=false;this.updateOperationUI(true);return false;}return this.playStep(false);}
 playOperation(requested){const index=this.sceneActors?.findIndex((actor,i)=>sourceIndex(actor,i)===requested);if(!this.loaded||index===undefined||index<0)return false;this.seek(index/this.sceneActors.length);this.playStep(false);return true;}
 focusOperation(index,instant=false,view){if(focusAssemblyTeachingCamera(this,index,instant))return;if(focusElectronicsTie(this,index,instant))return;if(focusTieWorkingView(this,index,instant))return;if(focusPulleyWorkingView(this,index,instant))return;if(focusMainPlugWorkingView(this,index,instant))return;if(focusMainLoomCutView(this,index,instant))return;const actor=this.sceneActors?.[index];if(!actor||this.manualCamera)return;this.lastOperationFocus=index;const plan=this.operationScene?.plan,settled=!!(this.operationProgress===1&&plan?.settledFocus);this.lastFocusSettled=settled;const refs=settled?plan.settledFocus:actor.operationFocus??plan?.operationFocus;let b=(actor.focusMotion?motionBounds(actor):actor.focusBox||actor.box).clone().applyMatrix4(this.printer.matrixWorld);if(actor.focusBounds&&!settled)b=new THREE.Box3(vec(actor.focusBounds.slice(0,3)).multiplyScalar(.001),vec(actor.focusBounds.slice(3)).multiplyScalar(.001)).applyMatrix4(this.printer.matrixWorld);if(refs){const selected=new THREE.Box3();for(const m of this.director.resolve(refs).filter(visibleInScene))selected.union(new THREE.Box3().setFromObject(m));if(!selected.isEmpty())b=selected;}if(!settled)for(const m of this.director.resolve(actor.focusRefs||[]).filter(visibleInScene))b.union(new THREE.Box3().setFromObject(m));const notice=connectorNotice(actor),single=notice?.family==='CLIK-Mate'&&notice.rows===1;let connectorDirection;
 if(single&&!settled){
  const e=this.fasteners.entities.get(actor.flex.find(id=>this.fasteners.entities.has(id))),end=e.curve.getPointAt(1).clone().multiplyScalar(e.id.startsWith('lb')?.001:1).applyMatrix4(e.mesh.matrixWorld);
  b=actor.connectorFocusBounds?new THREE.Box3(vec(actor.connectorFocusBounds.slice(0,3)).add(e.curve.getPointAt(1).clone().sub(e.tail)).multiplyScalar(.001),vec(actor.connectorFocusBounds.slice(3)).add(e.curve.getPointAt(1).clone().sub(e.tail)).multiplyScalar(.001)).applyMatrix4(e.mesh.matrixWorld):new THREE.Box3().setFromCenterAndSize(end,vec([16,16,16]));
  if(!actor.connectorFocusBounds)for(const m of this.meshes.filter(m=>m.userData.connector===notice.socket&&visibleInScene(m)))b.union(new THREE.Box3().setFromObject(m));
  b.expandByScalar(actor.connectorPadding??3);this.controls.minDistance=actor.connectorMinDistance??28;
  const out=SOCKETS[notice.socket].out;connectorDirection=vec(actor.connectorDirectionCAD??(out[1]?[-.7,-1,.45]:out[0]?[1,-1,.45]:[.3,-1,1])).transformDirection(this.printer.matrixWorld);
 }else{b.expandByScalar(actor.focusPadding??plan?.operationPadding??(actor.flex?18:35));this.controls.minDistance=actor.focusMinDistance??140;}
 const guided=actor.camera||plan?.operationCamera;const direction=connectorDirection||rearWorkingDirection(guided?viewDirection(guided).normalize():plan?.pose==='printer-back'?vec([plan.step===45?-1000:1000,80,-1200]).normalize():view?viewDirection(view).normalize():this.camera.position.clone().sub(this.controls.target).normalize(),plan);this.moveCamera(frameBox(b,direction,this.camera.fov,this.camera.aspect,1.2,single&&!settled?actor.connectorMinDistance??28:actor.focusMinDistance??140),instant);}
 seek(progress){this.playing=false;this.autoplayPending=false;this.setProgress(progress);const settled=!!(this.operationProgress===1&&this.operationScene?.plan.settledFocus);if((this.sceneActors?.[this.activeOperation]?.flex||this.sceneActors?.[this.activeOperation]?.focusMotion)&&(this.lastOperationFocus!==this.activeOperation||settled!==this.lastFocusSettled))this.focusOperation(this.activeOperation);this.updateOperationUI(true);}
 applyMaterials(){if(!this.director)return;const operationCutaway=new Set(this.director.resolve(this.sceneActors?.[this.activeOperation]?.transparentRefs||[]));for(const mesh of this.meshes){const key=mesh.userData.part;const g=this.groups[key];const mats=Array.isArray(mesh.material)?mesh.material:[mesh.material];for(const m of mats){if(m.emissive){m.emissive.set(!mesh.userData.preserveColours&&(mesh.userData.active||g.userData.highlight)?'#fd5000':'#000000');m.emissiveIntensity=this.inspectionNodes?.has(mesh)?.55:this.selected===key ? .35 : .12;}const ext=['sideLeft','sideRight','back','top','door','windowLeft','windowRight'].includes(key);if(m.userData.originalColor){m.color.copy(m.userData.originalColor);if(mesh.userData.active&&!mesh.userData.preserveColours)m.color.lerp(highlightColor,this.inspectionNodes?.has(mesh)?.72:.28);}const base=m.userData.originalOpacity??1,inspectionCut=this.inspectionNodes?.size&&!this.inspectionNodes.has(mesh),cutaway=this.operationScene?.plan.contextOpacity,head=mesh.userData.cadPath?.includes(788)||['mainPlate','pgAssembly','pgRing','idlerBearing1','idlerBearing2','idlerPin1','idlerPin2','loveBoard','loveMainPlug','hotend','hotendLeads'].includes(key);const inspectCut=this.operationScene?.plan.transparentRefs?.some(id=>mesh.userData.cadPath?.includes(id))||this.operationScene?.plan.inspectBoard&&!['loveBoard','loveMainPlug','hotend','hotendLeads'].includes(key);m.opacity=operationCutaway.has(mesh)?Math.min(base,.08):this.solidNodes?.has(mesh)||this.inspectionNodes?.has(mesh)?base:inspectionCut?Math.min(base,.045):inspectCut&&!this.operationScene.full?.08:cutaway&&!this.operationScene.full&&!head?Math.min(base,cutaway):this.ghost&&ext?Math.min(base,.055):base;m.transparent=m.opacity<1;m.depthWrite=m.opacity>=.3;}}syncChamberFanAnatomy(this);syncPartMarkings(this.partMarkings,this.state);this.dirty=true;}
 setGhost(value){this.ghost=value;this.applyMaterials();}
 setLabels(value){this.labels=value;document.getElementById('hotspots').hidden=!value;this.setProgress(this.operationProgress);this.dirty=true;}
 setDoor(value){this.doorOpen=value;this.dirty=true;}
 applyDoorPose(angle){
  const pivot=new THREE.Vector3(-.17844637203304407,-.20827588698405032,0),q=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),angle);
  for(const mesh of this.director.resolve([572,575,576,579,581,583,585,590,'doorHandlePlate','doorHandleScrew0','doorHandleScrew1'])){mesh.position.copy(mesh.userData.sceneRestPosition);if(angle)mesh.position.sub(pivot).applyQuaternion(q).add(pivot);mesh.quaternion.copy(q).multiply(mesh.userData.sceneRestQuaternion);}
 }
 moveCamera(pose,instant=false){
  // Drain damped gesture input before a scripted view, preserving the visible pose.
  if(this.controls.enableDamping){const position=this.camera.position.clone(),target=this.controls.target.clone();this.controls.enableDamping=false;this.controls.update();this.camera.position.copy(position);this.controls.target.copy(target);this.controls.update();this.controls.enableDamping=true;}
  if(instant||reduced){this.cameraTween=null;this.camera.position.copy(pose.position);this.controls.target.copy(pose.target);this.controls.update();}else this.cameraTween={from:this.camera.position.clone(),to:pose.position,fromT:this.controls.target.clone(),toT:pose.target,start:performance.now()};this.dirty=true;
 }
 setView(view,instant=false,guided=false){clearElectronicsTie(this);clearAssemblyTeachingCamera(this);clearTieWorkingViewOffset(this);clearMainLoomCutViewOffset(this);clearPulleyViewOffset(this);clearMainPlugViewOffset(this);if(!guided)this.holdCamera();this.currentView=view;if(guided&&focusAssemblyTeachingCamera(this,this.activeOperation||0,instant))return;if(guided&&focusTieWorkingView(this,this.activeOperation||0,instant))return;if(guided&&view==='main-loom-cut-working'&&focusMainLoomCutView(this,this.activeOperation||0,instant))return;const direction=rearWorkingDirection(viewDirection(view),this.operationScene?.plan);const box=this.sceneBounds||this.defaultBounds||new THREE.Box3(vec([-230,0,-280]),vec([230,580,280]));this.moveCamera(frameBox(box,direction,this.camera.fov,this.camera.aspect,1.2,this.operationScene?.plan.viewMinDistance??140),instant);}
 resetCamera(){this.manualCamera=false;this.currentView=this.guidedView||'perspective';const index=this.activeOperation||0;if(this.sceneActors?.[index]?.flex||this.sceneActors?.[index]?.focusMotion)this.focusOperation(index,false,this.currentView);else this.setView(this.currentView,false,true);}

 zoom(factor){this.holdCamera();const d=this.camera.position.clone().sub(this.controls.target).multiplyScalar(factor);d.clampLength(this.controls.minDistance,this.controls.maxDistance);this.camera.position.copy(this.controls.target).add(d);this.dirty=true;}
 focus(key,specific){
  const group=specific||this.groups[key];if(!group||!visibleInScene(group))return false;
  group.updateWorldMatrix(true,true);const box=new THREE.Box3();
  group.traverseVisible(node=>{if(!node.isMesh)return;node.geometry.computeBoundingBox();if(node.geometry.boundingBox)box.union(node.geometry.boundingBox.clone().applyMatrix4(node.matrixWorld));});
  if(box.isEmpty())return false;
  this.holdCamera();const direction=this.camera.position.clone().sub(this.controls.target).normalize();
  this.moveCamera(frameBox(box,direction,this.camera.fov,this.camera.aspect));this.select(key,specific);return true;
 }
 select(key,specific){this.selected=key;for(const [k,g]of Object.entries(this.groups))g.userData.highlight=k===key;this.applyMaterials();this.onSelect?.(key,specific);}
 pick(e){const rect=this.renderer.domElement.getBoundingClientRect();this.pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);this.raycaster.setFromCamera(this.pointer,this.camera);const hits=this.raycaster.intersectObjects([...this.meshes,...(this.chamberFanAnatomy?.pickTargets||[])],false).filter(h=>visibleInScene(h.object));const hit=hits.find(h=>!h.object.userData.glass)||hits[0];if(hit){const owner=this.chamberFanAnatomy?.selectionOwners.get(hit.object)||hit.object;this.select(owner.userData.part,owner);}}
 async playStep(restart=true){
  if(!this.loaded||!this.sceneActors?.length)return false;
  this.autoplayPending=false;
  if(restart||this.operationProgress>=1)this.setProgress(0);
  if(this.sceneActors[this.activeOperation||0]?.flex||this.sceneActors[this.activeOperation||0]?.focusMotion)this.focusOperation(this.activeOperation||0);
  const duration=this.sceneActors.length*2400;
  this.playing={start:performance.now()-this.operationProgress*duration,duration};this.updateOperationUI(true);this.dirty=true;return true;
 }
 setupHotspots(){document.getElementById('hotspots').innerHTML='';this.hotspots=[];}
 updateLabels(){
  if(!this.labels)return;const w=this.container.clientWidth,h=this.container.clientHeight;
  if(!this.calloutLayout){const base=this.container.getBoundingClientRect?.(),obstacles=[];if(base)for(const el of this.container.parentElement.querySelectorAll('.stage-tools,.stage-caption,.touch-model-toggle,.view-controls,.drag-help,.work-detail:not([hidden])')){const r=el.getBoundingClientRect();if(r.width&&r.height)obstacles.push({left:r.left-base.left-4,right:r.right-base.left+4,top:r.top-base.top-4,bottom:r.bottom-base.top+4});}this.calloutLayout={obstacles,measurements:new WeakMap()};}
  for(const {el,point,index,inspection,avoidWorldPoints} of this.guideLabels||[]){
   const p=point.clone().project(this.camera),actor=this.sceneActors[index];
   el.hidden=!inspection&&(this.operationProgress>=1&&!actor?.cableApproach&&!actor?.inspection&&!actor?.keepGuide||index!==this.activeOperation)||p.z>1||Math.abs(p.x)>1||Math.abs(p.y)>1;
   if(el.hidden)continue;
   let size=this.calloutLayout.measurements.get(el);
   if(!size||size.text!==el.textContent){size={text:el.textContent,width:el.offsetWidth||Math.min(200,w*.6),height:el.offsetHeight||60};this.calloutLayout.measurements.set(el,size);}
   const obstacles=[...this.calloutLayout.obstacles],bounds=actor?.calloutAvoidBounds;
   if(avoidWorldPoints){const area=workAreaObstacle(avoidWorldPoints.map(p=>p.clone().project(this.camera)),w,h);if(area)obstacles.push(area);}
   if(bounds){
    const points=[];
    for(const x of[bounds[0],bounds[3]])for(const y of[bounds[1],bounds[4]])for(const z of[bounds[2],bounds[5]])points.push(vec([x,y,z]).multiplyScalar(.001).applyMatrix4(this.printer.matrixWorld).project(this.camera));
    const area=workAreaObstacle(points,w,h);if(area)obstacles.push(area);
   }
   const r=placeCallout({width:w,height:h,labelWidth:size.width,labelHeight:size.height,x:(p.x*.5+.5)*w,y:(-p.y*.5+.5)*h,obstacles});
   el.style.transform=`translate3d(${r.left}px,${r.top}px,0)`;
  }
  for(const {el} of this.hotspots||[])el.hidden=true;
 }
 loop(now){if(this.disposed)return;this.raf=requestAnimationFrame(this.loop);if(document.hidden||!this.container.clientWidth||!this.container.clientHeight){if(this.playing&&this.playing.suspendedAt===undefined)this.playing.suspendedAt=now;return;}if(this.playing?.suspendedAt!==undefined){this.playing.start+=now-this.playing.suspendedAt;delete this.playing.suspendedAt;}let moving=false;this.controls.update();followTieWorkingView(this);followElectronicsTie(this);
  if(this.autoplayPending){this.playStep();}
  if(this.cameraTween){const q=this.cameraTween;const p=THREE.MathUtils.clamp((now-q.start)/(reduced?1:600),0,1);const e=1-Math.pow(1-p,3);this.camera.position.lerpVectors(q.from,q.to,e);this.controls.target.lerpVectors(q.fromT,q.toT,e);moving=true;if(p===1)this.cameraTween=null;}
  if(this.playing){const progress=Math.max(this.operationProgress,Math.min(1,(now-this.playing.start)/this.playing.duration));this.setProgress(progress);moving=true;if(progress===1){this.playing=false;this.updateOperationUI(true);}}
  if(this.operationScene?.full){const target=this.doorOpen?-Math.PI/2:0;if(this.doorAngle!==target){this.doorAngle=THREE.MathUtils.lerp(this.doorAngle??0,target,reduced?1:.1);if(Math.abs(this.doorAngle-target)<.0001)this.doorAngle=target;this.applyDoorPose(this.doorAngle);moving=true;}}
  if(this.dirty||moving){this.renderFrame();this.updateLabels();this.dirty=false;}
 }
 renderFrame(){
  const info=this.renderer.info,autoReset=info?.autoReset,wasDetail=this.workDetail?.visible;
  if(info){info.reset();info.autoReset=false;}
  try{this.renderer.render(this.scene,this.camera);this.workDetail?.render(this);}
  finally{if(info)info.autoReset=autoReset;}
  if(wasDetail!==this.workDetail?.visible)this.calloutLayout=null;
 }
 saveImage(){this.renderFrame();const a=document.createElement('a');a.href=this.renderer.domElement.toDataURL('image/png');a.download='Prusa-CORE-One-Assembly.png';a.click();}
}
