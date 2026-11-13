import * as T from 'three';
import {STLLoader} from './vendor/STLLoader.js';
import {earlyWirePacking} from './service-cover-packing.js?v=20261111-95';
import {COVER_TEXT,RECONSTRUCTION_CREDIT,leftCoverAction,coverStateBefore} from './service-cover-contract.js?v=20261111-95';
import {coverModelState,assetError,setCoverVariant,currentCoverVariant,earlyCoverAvailability,EARLY_SOURCE} from './service-cover-ui.js?v=20261112-105';
export {STORAGE_KEY,COVER_TEXT,COVER_MESSAGES,RECONSTRUCTION_CREDIT,EARLY_SOURCE,currentCoverVariant,earlyCoverAvailability,setCoverVariant,mountServiceCoverUI,startServiceModelPreparation} from './service-cover-ui.js?v=20261112-105';
const assetCache=new Map();let pendingAssets;
export async function prepareServiceCoverAssets(geometry,{earlyAsset,load}={}){
 const normal=!geometry&&!earlyAsset&&!load;
 if(normal&&coverModelState.acceptedEarly&&coverModelState.torx)return;
 if(normal&&pendingAssets)return pendingAssets;
 const work=async()=>{
 if(!geometry&&!earlyAsset&&!load&&coverModelState.acceptedEarly&&coverModelState.torx)return;
 coverModelState.acceptedEarly=undefined;coverModelState.torx=undefined;coverModelState.assetState={status:'loading',code:'ASSETS_LOADING',asset:null};
 const loader=new STLLoader(),read=async(file,metres=false)=>{coverModelState.assetState.asset=file;const get=async()=>{const g=await (load||((url)=>loader.loadAsync(url)))(new URL(file,import.meta.url).href);return metres?g.scale(.001,.001,.001):g;};if(!normal)return get();let p=assetCache.get(file);if(!p){p=get().catch(error=>{assetCache.delete(file);throw error;});assetCache.set(file,p);}return p;};
 try{
  coverModelState.torx=geometry||await read('./assets/hardware/M3x10rT.stl');
  if(!earlyAsset){const geometries={};for(const [key,file]of Object.entries({cover:'./assets/service-cover/left-cover-a5-body1.stl',clip:'./assets/service-cover/lower-mount-reconstruction.stl',rear:'./assets/service-cover/rear-cover-a7.stl',rearScrew:'./assets/service-cover/rear-cover-screw.stl'}))geometries[key]=await read(file,true);earlyAsset={source:EARLY_SOURCE,geometries};}
  if(!coverModelState.torx?.isBufferGeometry||earlyAsset.source?.bearingsMM?.length!==2||!['cover','clip','rear','rearScrew'].every(k=>earlyAsset.geometries?.[k]?.isBufferGeometry))throw Object.assign(Error('Invalid display supplement'),{code:'ASSETS_INVALID'});
  coverModelState.acceptedEarly=earlyAsset;coverModelState.assetState={status:'ready',code:null,asset:null};
 }catch(e){coverModelState.assetState={status:'failed',code:e.code==='ASSETS_INVALID'?e.code:'ASSET_LOAD_FAILED',asset:coverModelState.assetState.asset};throw assetError();}
 };
 if(!normal)return work();
 pendingAssets=work();try{return await pendingAssets;}finally{pendingAssets=undefined;}
}
const id=n=>'service-cover-early-'+n,META=Symbol('canonical cover scene');
export function installServiceCoverVariant(viewer,binding,tasks,text){
 if(viewer.serviceCoverVariant)return viewer.serviceCoverVariant;
 coverModelState.activeViewer=viewer;
 if(coverModelState.variant==='early'&&!coverModelState.acceptedEarly)throw assetError();
 const source=n=>{const m=viewer.meshes.find(m=>m.userData.cadIndex===n);if(!m)throw Error('Missing native '+n);return m;};
 const clones=new Map(),own=new Set(),sourceInfo=coverModelState.acceptedEarly?.source||EARLY_SOURCE;
 const add=(name,g,donor,sourceLeaf)=>{const original=(Array.isArray(donor.material)?donor.material[0]:donor.material),material=original.clone();material.userData.originalColor=original.userData.originalColor?.clone?.()||original.color.clone();const m=new T.Mesh(g,material);m.name=id(name);m.visible=false;m.castShadow=true;m.receiveShadow=true;m.userData={part:'head',component:m.name,maintenanceComponent:m.name,cadName:name.startsWith('screw')?'M3x10bT · T10':donor.userData.cadSourceName,preserveCadName:true,supplement:true,originalCad:false,interfaceReconstruction:name==='clip',sourceCADLeaf:sourceLeaf,sourceCadPath:[...donor.userData.cadPath],source:sourceInfo.url,license:sourceInfo.license,reconstructionCredit:name==='clip'?RECONSTRUCTION_CREDIT:undefined,restPosition:new T.Vector3(),restQuaternion:new T.Quaternion()};g.computeBoundingBox();g.computeBoundingSphere();viewer.group('head').add(m);viewer.meshes.push(m);viewer.records.push({key:'head',mesh:m,id:m.uuid,name:m.userData.cadName});clones.set(name,m);own.add(m);return m;};
 const ensureGeometry=()=>{if(viewer.disposed||!viewer.loaded||!viewer.director||coverModelState.activeViewer!==viewer)return;if(clones.size)return;if(!coverModelState.acceptedEarly||!coverModelState.torx)throw assetError();for(const n of[857,858,859,860,865,879,881])source(n);
 for(const [name,n]of [['cover',858],['clip',857],['mount',859],['rear',860],['rearScrew',865]]){const m=source(n);let g;if(name==='mount'&&m.userData.referenceGeometry){g=m.userData.referenceGeometry.clone().applyMatrix4(new T.Matrix4().compose(m.userData.restPosition,m.userData.restQuaternion,m.scale));}else g=coverModelState.acceptedEarly.geometries[name].clone();add(name,g,m,n);}
 const reverse=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,0,1),new T.Vector3(-1,0,0));
 for(const [i,p]of coverModelState.acceptedEarly.source.bearingsMM.entries()){const g=coverModelState.torx.clone().scale(.001,.001,.001).applyQuaternion(reverse).translate(...p.map(x=>x*.001));add('screw'+i,g,source(879),i?881:879);}
 };
 if(coverModelState.variant==='early')ensureGeometry();

 const sources=new Map([857,858,859,860,865,879,881].map(n=>[source(n),n]));
 const names=new Map([[857,'clip'],[858,'cover'],[859,'mount'],[860,'rear'],[865,'rearScrew'],[879,'screw0'],[881,'screw1']]);
 // These three inserts belong to the later R1/R2 cover set.
 const laterInserts=new Set(['leftCoverNut','mountUpperNut','mountLowerNut']);
 const obsolete=m=>laterInserts.has(m.userData.component);
 const nodes=list=>[...new Set(list.flatMap(m=>own.has(m)||obsolete(m)?[]:sources.has(m)?sources.get(m)===879?[clones.get('screw0'),clones.get('screw1')]:[clones.get(names.get(sources.get(m)))]:[m]).filter(Boolean))];
 const refs=list=>list?.flatMap(r=>{if(laterInserts.has(r))return [];if(r===879)return [id('screw0'),id('screw1')];if(names.has(r))return [id(names.get(r))];const extra=viewer.director.resolve([r]).filter(m=>sources.has(m)).flatMap(m=>sources.get(m)===879?[id('screw0'),id('screw1')]:[id(names.get(sources.get(m)))]);return [r,...extra];});
 const actor=(name,key,remove,extra={})=>({refs:[id(name)],nodes:[clones.get(name)],label:text(COVER_TEXT[key]),axis:[-1,0,0],distance:name==='cover'?35:25,waypoints:[[-(name==='cover'?35:25),0,0],[0,0,0]],remove,showBefore:remove||name==='cover',focusMotion:true,camera:'left-cover-perspective',focusRefs:[id('cover'),id('clip')],guideRadius:1,guideTube:.12,guideArrowLength:4,coverRole:name,...extra});
 const earlyActors=(remove,keepRemoved)=>{const screw=(i,k)=>actor('screw'+i,k,remove,{spin:1080,motionPivot:coverModelState.acceptedEarly.source.bearingsMM[i],keepRemoved});return remove?[screw(0,'upperOut'),screw(1,'lowerOut'),actor('cover','coverOut',true,{keepRemoved})]:[actor('cover','coverIn',false),screw(0,'upperIn'),screw(1,'lowerIn')];};
 const packing=earlyWirePacking(viewer),baseScene=viewer.director.scene.bind(viewer.director);
 const transform=(base,row)=>{
  const scene={...base,plan:{...base.plan,actors:base.plan.actors.map(a=>({...a}))},actors:base.actors.map(a=>({...a})),visible:base.visible.filter(m=>!own.has(m))};
  if(!row||coverModelState.variant!=='early')return scene;
  if(!coverModelState.acceptedEarly)throw assetError();
  scene.plan.earlyCoverVariant=coverModelState.variant;
  // Follow the canonical visibility, including isolated bench stages and moving rear cover.
  scene.visible=nodes(scene.visible);
  for(const k of ['focus','solidRefs','settledFocus','transparentRefs','inspectRefs','visibleRefs'])if(scene.plan[k])scene.plan[k]=refs(scene.plan[k]);
  scene.plan.workpiecePoses=(base.plan.workpiecePoses||[]).map(p=>({...p,refs:refs(p.refs)})).filter(p=>p.refs.length);
  const action=leftCoverAction(row.s),mounted=coverStateBefore(row.task,row.index);
  const parked=!action&&!mounted&&base.visible.some(m=>m.userData.cadIndex===858);
  if(parked){
   scene.plan.workpiecePoses=scene.plan.workpiecePoses.map(p=>({...p,refs:p.refs.filter(r=>![id('cover'),id('screw0'),id('screw1')].includes(r))})).filter(p=>p.refs.length);
   for(const [name,travel]of [['cover',35],['screw0',25],['screw1',25]])scene.plan.workpiecePoses.push({refs:[id(name)],pivot:[0,0,0],rotation:[0,0,0],offset:[-travel,0,0]});
  }
  // Expand only the shared left-cover action, preserving every unrelated actor.
  const coverActor=a=>a.refs?.some(r=>[858,879,881].includes(r));
  let inserted=false;
  scene.actors=base.actors.flatMap(a=>{if(a.refs?.length&&a.refs.every(r=>laterInserts.has(r)))return [];if(action&&coverActor(a)){if(inserted)return [];inserted=true;return earlyActors(action==='out',action==='out'&&a.remove!==true);}return [{...a,refs:refs(a.refs),focusRefs:refs(a.focusRefs),nodes:nodes(a.nodes)}];});
  scene.actors.forEach((a,i)=>a.sourceIndex=i);
  scene.plan.actors=scene.actors.map(({nodes,sourceIndex,...a})=>a);
  if(action){scene.plan.focus=[id('cover'),id('screw0'),id('screw1'),id('clip')];scene.plan.solidRefs=[...new Set([...(scene.plan.solidRefs||[]),id('cover'),id('screw0'),id('screw1'),id('clip')])];scene.plan.settledFocus=[id('cover'),id('clip')];}
  scene[META]={base,row};return scene;
 };
 viewer.director.scene=state=>{const row=state.flow==='service'?binding.rows[state.index]:null;packing.set(coverModelState.variant==='early'&&!!row);return transform(baseScene(state),row);};
 // Source localize addresses its original actor indices. Present that canonical view
 // while calling it, then transfer its localized plan back through this transform.
 const priorLocalize=binding.localize;
 binding.localize=function(...args){
  const scene=viewer.operationScene,meta=scene?.[META];if(!meta)return priorLocalize.apply(this,args);
  const rendered=viewer.sceneActors,projection={...meta.base,plan:{...meta.base.plan,actors:meta.base.plan.actors.map(a=>({...a}))}};
  try{viewer.operationScene=projection;viewer.sceneActors=projection.actors.map(a=>({...a}));priorLocalize.apply(this,args);}finally{viewer.operationScene=scene;viewer.sceneActors=rendered;}
  projection.actors=projection.actors.map(a=>({...a,label:projection.plan.actors[a.sourceIndex]?.label??a.label}));
  const next=transform(projection,meta.row);scene.plan=next.plan;scene.actors=next.actors;scene[META]=next[META];
  for(const a of rendered)a.label=scene.plan.actors[a.sourceIndex]?.label??a.label;
 };
 const role=a=>a?.coverRole||(a?.refs?.includes(858)?'cover':a?.refs?.includes(879)?'screw0':null);
 const refresh=()=>{if(viewer!==coverModelState.activeViewer||viewer.state?.flow!=='service'||!viewer.loaded||viewer.disposed||!viewer.director)return;if(coverModelState.variant==='early')ensureGeometry();const playing=viewer.playing,p=viewer.operationProgress??0,old=viewer.sceneActors||[],idx=Math.min(old.length-1,Math.floor(p*old.length)),part=p===1?1:p*old.length-idx,key=role(old[idx]);viewer.director.cache.clear();viewer.sceneSignature=undefined;viewer.setState({...viewer.state});viewer.autoplayPending=false;const next=key?viewer.sceneActors.findIndex(a=>role(a)===key):-1;viewer.seek(p===1?1:next>=0?(next+part)/viewer.sceneActors.length:p);binding.localize();viewer.localize();if(playing)viewer.playStep(false);};
 coverModelState.listeners.add(refresh);
 const dispose=viewer.dispose;viewer.dispose=function(...args){coverModelState.listeners.delete(refresh);if(coverModelState.activeViewer===viewer)coverModelState.activeViewer=undefined;return dispose.apply(this,args);};
 const context=()=>{if(viewer.disposed||!viewer.loaded||!viewer.director)return false;const row=viewer.state?.flow==='service'?binding.rows[viewer.state.index]:null;if(!row)return false;if(leftCoverAction(row.s))return true;if(![...clones.values()].some(m=>m.visible)&&!source(858).visible)return false;return !!viewer.operationScene?.plan.headOnly||viewer.director.resolve(row.s.refs||[]).some(m=>m.userData.cadPath?.includes(787)||m.userData.part==='hotend');};
 viewer.serviceCoverVariant={source:sourceInfo,clones,ensureGeometry,packingEvidence:packing.evidence,select:setCoverVariant,current:currentCoverVariant,availability:earlyCoverAvailability,refresh,context,binding};return viewer.serviceCoverVariant;
}
