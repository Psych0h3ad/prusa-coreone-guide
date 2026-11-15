import {replaceCanonicalTerminalBodies} from './xbuddy-terminal-source.js';
import * as T from 'three';
import {installServicePeBank} from './xbuddy-pe-free-bank.js';
import{FAMILY_ROLES,PowerMaterialCurve,terminalOffset,terminalFrame,terminalMount}from'./xbuddy-power-family-route.js';
import{POWER_REFERENCE,closedTube,screwGeometry}from'./xbuddy-power-solids.js';
import{referenceSleeveGeometry}from'./xbuddy-bed-material-route.js';
import{freeLugUnionGeometry}from'./xbuddy-free-lug-union.js';
import{bedLugUnionGeometry}from'./xbuddy-bed-lug-union.js';
import{terminalBodiesGeometry}from'./xbuddy-terminal-bodies.js';
import{psuForkGeometry}from'./xbuddy-psu-fork-reference.js';
import{extensionLugGeometry}from'./xbuddy-extension-lug-reference.js';
import{extensionPlugGeometry}from'./xbuddy-extension-plug-reference.js';
import{methodSnapshot,methodsCurrent}from'./xbuddy-lease-guards.js';
const V=p=>new T.Vector3(...p),S=x=>(x=T.MathUtils.clamp(x,0,1))*x*(3-2*x),mount=POWER_REFERENCE.mountMM;
const terminals=[[-83.01012012648114,165.45172,58.52363480813378,-69.8547933961756,174.45172,71.68390260166979],[-92.44494112706141,165.45172,58.52363480813378,-81.39546131968757,174.45172,71.68390260166979],[-93.91680288181584,165.45172,28.300195749655273,-83.06441465012003,174.45172,41.06683825762519],[-103.85749359928985,165.45172,28.300195749655273,-93.18736355896999,174.45172,41.06683825762522],[-117.11174788925518,165.45172,28.300195749655273,-106.10285009784751,174.45172,41.06683825762522],[-126.52924435844112,165.45172,28.300195749655273,-116.40033260857419,174.45172,41.06683825762522]];
function material(c,metal=false){const m=new T.MeshStandardMaterial({color:c,roughness:metal?.35:.75,metalness:metal?.7:0,side:T.DoubleSide});m.userData.originalOpacity=1;m.userData.originalColor=m.color.clone();return m;}
function translated(g,p){g.translate(...p.map((x,i)=>(x-mount[i])*.001));return g;}
export function lugForRole(r){if(!r.lower)return translated(freeLugUnionGeometry(),r.mount);const g=r.extension?extensionLugGeometry():freeLugUnionGeometry();if(!r.extension)g.translate(...mount.map(x=>-x*.001));g.rotateY(r.angle??Math.PI);g.translate(...r.mount.map(x=>x*.001));return g;}
function tag(m,id,component,name){m.userData={part:id,component,flexId:component===id?id:undefined,serviceTask:'xbuddy',supplement:true,constructedStock:true,cadName:name};return m;}
function applyTerminalPose(e,amount,pair){const f=terminalFrame(e.id,amount,pair),pivot=f.pivot.clone().multiplyScalar(.001);e.lug.quaternion.copy(f.quaternion);e.lug.position.copy(pivot).addScaledVector(f.offset,.001).sub(pivot.clone().applyQuaternion(f.quaternion));}
const wireOwnership=new WeakMap();
export class PowerConductor{
 constructor(id,pairStateProvider){this.pairStateProvider=pairStateProvider;const r=FAMILY_ROLES[id];this.id=id;this.radius=r.radius;this.samples=1024;this.stock=r.stock;this.mesh=tag(new T.Mesh(new T.BufferGeometry(),material(r.color)),id,id,id+' individual conductor');this.lug=tag(new T.Mesh(lugForRole(r),material('#b9bec2',true)),id,id+'Lug',id+' L/crimp');this.geometry=this.mesh.geometry;wireOwnership.set(this,{geometry:this.geometry,lugGeometry:this.lug.geometry,current:null});this.update(1,1,1);}
 update(from,to,t){
  const owned=wireOwnership.get(this);if(!owned||owned.current&&!owned.current()||this.geometry!==owned.geometry||this.mesh.geometry!==owned.geometry||this.lug.geometry!==owned.lugGeometry)return;
  const amount=T.MathUtils.lerp(from,to,S(t));if(!Number.isFinite(amount)||amount<0||amount>1)throw Error('Invalid power conductor amount');
  const pair=this.pairStateProvider?.(this.id,amount,from,to,t),pairKey=this.id.startsWith('xbHeatIn')?JSON.stringify(pair||{}):'';
  if(this.amount===amount&&this.pairKey===pairKey){applyTerminalPose(this,amount,pair);this.mesh.userData.flexState={...this.mesh.userData.flexState,from,to,t};return;}
  const curve=new PowerMaterialCurve(this.id,amount,pair),next=closedTube(curve,this.samples,this.radius),old=owned.geometry;
  owned.geometry=next;this.mesh.geometry=this.geometry=next;this.curve=curve;this.amount=amount;this.pairKey=pairKey;this.rebuilds=(this.rebuilds||0)+1;applyTerminalPose(this,amount,pair);
  this.mesh.userData.flexState={from,to,t,amount,pairState:pair,stockMM:this.stock,measuredCurveMM:curve.stock,bightMM:curve.tailBightMM,fixedMM:curve.getPointAt(0).toArray(),freeMM:curve.getPointAt(1).toArray()};
  // Disposal may synchronously retire this owner or install a foreign one.
  // Publish the complete owned state first; make no writes after notifications.
  old.dispose();
 }
 guide(to=0,from=1){return Array.from({length:25},(_,i)=>terminalMount(this.id,T.MathUtils.lerp(from,to,i/24)).multiplyScalar(.001));}
}
const replaceTerminalBodies=replaceCanonicalTerminalBodies;

function removalActors(officialId,text=a=>a[0]){const removal=officialId===910527?['xbBedMinus','xbBedPlus']:officialId===910568?['xbHeatInPlus','xbHeatInMinus','xbPowerMinus','xbPowerPlus','xbExtensionRed']:null;if(!removal)return[];const actors=[],used=new Set();for(const id of removal){const r=FAMILY_ROLES[id];if(!r)continue;const ref='xbPowerScrew'+r.terminal,m=r.mount,red=id.endsWith('Plus')||id==='xbExtensionRed',color=red?['赤線','red lead','červeného vodiče','roten Leitung']:['黒線','black lead','černého vodiče','schwarzen Leitung'];const common={showBefore:true,focusMotion:true,camera:'xbuddy-board-perspective',focusBounds:[m[0]-12,165,m[2]-10,m[0]+12,210,m[2]+29]};
 if(!used.has(ref)){used.add(ref);actors.push({refs:[ref],label:text([color[0]+'の固定ねじを外す','Remove the '+color[1]+' screw','Vyjměte šroub '+color[2],'Schraube der '+color[3]+' entfernen']),remove:true,keepRemoved:true,axis:[0,1,0],distance:12,rigidPose:u=>{const q=1-u,s=S(Math.min(1,q/.72)),park=S((q-.72)/.28),lift=6.35*s+33.65*park;return{offset:V([0,lift,0]).multiplyScalar(.001),rotation:new T.Quaternion().setFromAxisAngle(V([0,1,0]),(6.35/(25.4/32))*2*Math.PI*s),pivot:V([m[0],r.terminal===42?175.75172:m[1]+.6,m[2]]).multiplyScalar(.001)};},...common});}
 actors.push({flex:[id],fromStates:{[id]:1},to:0,label:text([color[0]+'の端子を外す','Disconnect the '+color[1]+' terminal','Odpojte koncovku '+color[2],'Anschluss der '+color[3]+' abnehmen']),axis:[0,1,0],...common});}return actors;}
export function powerFamilyActors(officialId,text=a=>a[0]){if([910527,910568].includes(officialId))return removalActors(officialId,text);const roles=officialId===910978?['xbHeatInPlus','xbHeatInMinus']:officialId===911019?['xbExtensionRed','xbPowerPlus','xbPowerMinus']:officialId===911167?['xbBedMinus','xbBedPlus']:null;if(!roles)return[];const source=[...removalActors(910527,text),...removalActors(910568,text)],out=[];const wire=id=>{const a=source.find(a=>a.flex?.[0]===id),r=FAMILY_ROLES[id],red=id.endsWith('Plus')||id==='xbExtensionRed';return{...a,fromStates:{[id]:0},to:1,label:text(red?['赤線の端子を接続する','Connect the red lead terminal','Připojte koncovku červeného vodiče','Anschluss der roten Leitung verbinden']:['黒線の端子を接続する','Connect the black lead terminal','Připojte koncovku černého vodiče','Anschluss der schwarzen Leitung verbinden'])};};const screw=id=>{const r=FAMILY_ROLES[id],a=source.find(a=>a.refs?.[0]==='xbPowerScrew'+r.terminal);return{...a,remove:false,keepRemoved:false,label:text(['端子の固定ねじを締める','Tighten the terminal screw','Dotáhněte šroub svorky','Anschlussschraube festziehen'])};};for(const id of roles){out.push(wire(id));if(officialId===911019&&id==='xbExtensionRed')continue;out.push(screw(id));}return out;}
export const POWER_OFFICIAL_ORDER=[909911,909947,910009,910077,910139,910185,910221,910250,910445,910483,910527,910568,910594,910642,910697,910747,910787,910837,910925,910941,910978,910887,911030,911019,911124,911211,911253,911298,911342,911167,911406,910277,910304,910340];
export function powerFamilyInitialStates(officialId){const i=POWER_OFFICIAL_ORDER.indexOf(officialId);if(i<0)return null;const states={};for(const id of Object.keys(FAMILY_ROLES))states[id]=id.startsWith('xbBed')?(i>10&&i<=29?0:1):id.startsWith('xbHeat')?(i>11&&i<=20?0:1):(i>11&&i<=23?0:1);return states;}
export function installPowerFamily(viewer,{pairProvider,isCurrent,onSourceDispose,preserveSourceBedSleeve=true}={}){const sharedBed=viewer.bedFamily15,borrowedBedIds=new Set(['xbBedMinus','xbBedPlus']);if(!sharedBed?.active||[...borrowedBedIds].some(id=>sharedBed.roles.get(id)!==viewer.fasteners.entities.get(id)))throw Error('Shared R15/R16 bed provider required, never a parallel bed pair');if(Object.keys(FAMILY_ROLES).some(id=>viewer.fasteners.entities.has(id)&&!borrowedBedIds.has(id)))throw Error('Power family owner already installed');const peSource=viewer.feHardware;if(!peSource||peSource.serviceFollow||peSource.lead?.geometry?.attributes.position?.count!==1161)throw Error('Expected unowned source PE skin');const body=replaceTerminalBodies(viewer),entities=new Map(),added=[],screws=new Map(),materialOwned=new Set();let active=true;
 const fasteners=viewer.fasteners,registry=fasteners.entities,containers=[{owner:viewer,key:'meshes'},{owner:viewer,key:'records'},{owner:fasteners,key:'meshes'}].map(r=>({...r,array:r.owner[r.key],methods:methodSnapshot(r.owner[r.key],['splice','filter'])}));
 const add=m=>{viewer.group(m.userData.part).add(m);viewer.meshes.push(m);viewer.records.push({key:m.userData.part,name:m.userData.cadName,mesh:m,id:m.uuid});m.userData.restPosition=m.position.clone();m.userData.restQuaternion=m.quaternion.clone();added.push(m);return m;};
 const casing=tag(new T.Mesh(terminalBodiesGeometry(),body.mesh.material),'xBuddy','xbPowerTerminalBodies','Six terminal bodies with reference bores');add(casing);
 for(const[id,r]of Object.entries(FAMILY_ROLES)){const borrowed=borrowedBedIds.has(id),e=borrowed?sharedBed.roles.get(id):new PowerConductor(id,pairProvider);entities.set(id,e);if(!borrowed){add(e.mesh);add(e.lug);viewer.fasteners.entities.set(id,e);viewer.fasteners.meshes.push(e.mesh);}
  if(!screws.has(r.terminal)){const p=[...r.mount];if(r.terminal===42)p[1]=175.15172;const s=tag(new T.Mesh(translated(screwGeometry(),p),material('#bac0c4',true)),'xbPowerScrews','xbPowerScrew'+r.terminal,'6-32 terminal screw');screws.set(r.terminal,add(s));}
  if(borrowed)continue;const update=e.update.bind(e),wrapper=function(...a){if(!wireOwnership.get(e).current())return;return update(...a);};wireOwnership.get(e).current=()=>active&&!viewer.disposed&&sharedBed.active&&[...borrowedBedIds].every(k=>sharedBed.roles.get(k)===viewer.fasteners.entities.get(k))&&(!isCurrent||isCurrent())&&e.update===wrapper&&viewer.fasteners.entities.get(id)===e;e.update=wrapper;
 }
 for(const[id,mirror]of[['xbBedMinus',false],['xbBedPlus',true]]){if(!entities.has(id)||borrowedBedIds.has(id))continue;const g=bedLugUnionGeometry();if(mirror){const p=g.attributes.position;for(let i=0;i<p.count;i++)p.setX(i,2*(-114.918497334175)*.001-p.getX(i));const a=g.attributes.position.array;for(let i=0;i<a.length;i+=9)for(let k=0;k<3;k++){const x=a[i+3+k];a[i+3+k]=a[i+6+k];a[i+6+k]=x;}g.computeVertexNormals();}add(tag(new T.Mesh(g,material('#b9bec2',true)),id+'FixedEnd',id+'FixedLug','Fixed heatbed ring/crimp'));}
 for(const[id,r]of Object.entries(FAMILY_ROLES))if(r.psuSlot!==undefined){const g=psuForkGeometry();g.translate(r.fixed[0]*.001,.1767629,(r.fixed[2]+14.5)*.001);add(tag(new T.Mesh(g,material('#b9bec2',true)),id+'FixedEnd',id+'FixedFork','Fixed PSU U/crimp'));}
 add(tag(new T.Mesh(extensionPlugGeometry(),material('#e4ddd2')),'xbExtensionRedFixedEnd','xbExtensionRedPlug','Extension plug / fixed wire exit reference'));
 const sleeveEntity=viewer.fasteners.entities.get('bedWire'),sleeveOld={geometry:sleeveEntity.geometry,meshGeometry:sleeveEntity.mesh.geometry,curve:sleeveEntity.curve},sleeve=preserveSourceBedSleeve?null:referenceSleeveGeometry();if(sleeve){sleeveEntity.geometry=sleeveEntity.mesh.geometry=sleeve.geometry;sleeveEntity.curve=sleeve.curve;}
 const sourceDisposed=()=>{if(!active)return;if(onSourceDispose)onSourceDispose();else retire();};const peLease=installServicePeBank(viewer,sourceDisposed);
 const refs=[[body.mesh,body.source],...(sleeve?[[sleeveEntity.mesh,sleeveOld.meshGeometry]]:[])],oldRefs=refs.map(([m])=>m.userData.referenceGeometry);refs.forEach(([m,g],i)=>{if(oldRefs[i]===undefined)m.userData.referenceGeometry=g;});
 const onDispose=sourceDisposed;body.source.addEventListener('dispose',onDispose);const owned=new Map(added.map(m=>[m,m.geometry])),ownedMaterials=new Map(added.map(m=>[m,m.material]));
 function retire(){
  if(!active)return;active=false;const nativeDisposed=viewer.disposed,toDispose=new Set(),materialsToDispose=new Set(),detached=new Set();
  peLease.retire();body.source.removeEventListener('dispose',onDispose);
  refs.forEach(([m,g],i)=>{if(oldRefs[i]===undefined&&m.userData.referenceGeometry===g)delete m.userData.referenceGeometry;});
  if(body.mesh.geometry===body.replacement){body.mesh.geometry=body.source;toDispose.add(body.replacement);}
  if(sleeve&&sleeveEntity.mesh.geometry===sleeve.geometry){sleeveEntity.mesh.geometry=sleeveOld.meshGeometry;if(sleeveEntity.geometry===sleeve.geometry)sleeveEntity.geometry=sleeveOld.geometry;if(sleeveEntity.curve===sleeve.curve)sleeveEntity.curve=sleeveOld.curve;toDispose.add(sleeve.geometry);}
  for(const m of added){
   const e=entities.get(m.userData.flexId),g=e?wireOwnership.get(e)?.geometry:owned.get(m),stillOwned=m.geometry===g&&(!e||e.geometry===g);
   if(stillOwned){m.removeFromParent();detached.add(m);toDispose.add(g);if(m!==casing&&m.material===ownedMaterials.get(m))materialsToDispose.add(m.material);}
   else if(m.geometry!==g)toDispose.add(g);
  }
  if(viewer.fasteners===fasteners&&fasteners.entities===registry)for(const[id,e]of entities){if(borrowedBedIds.has(id))continue;if(detached.has(e.mesh)&&registry.get(id)===e)registry.delete(id);}
  for(const r of containers)if(r.owner[r.key]===r.array&&methodsCurrent(r.array,r.methods)&&(r.owner===viewer||viewer.fasteners===fasteners))r.array.splice(0,r.array.length,...r.array.filter(x=>!detached.has(r.key==='records'?x.mesh:x)));
  // Restore all owned pointers before disposal callbacks can reenter.
  // Native Viewer.dispose has already collected its resource sets.
  if(!nativeDisposed){for(const g of toDispose)g?.dispose();for(const m of materialsToDispose)m.dispose();}
 }

 return{entities,screws,added,body,casing,sleeve,sharedBed,borrowedBedIds,retire,get active(){return active;}};
}
