import * as T from 'three';
import {writeSleeveConstruction} from './heatbed-sleeve-construction.js';
import {BED_DATUM,AUTHORED_WIRE_STOCKS} from './r15-bed-route.js';
import {createBedRenderer} from './r16-bed-renderer.js';
import {freeLugUnionGeometry} from './r15-free-lug.js';
import {bedLugUnionGeometry} from './r15-bed-lug.js';
const ids=Object.keys(BED_DATUM.roles),V=p=>new T.Vector3(...p),S=t=>t*t*(3-2*t);
const material=(color,metal=false)=>{const m=new T.MeshStandardMaterial({color,roughness:metal?.35:.75,metalness:metal?.7:0,side:T.DoubleSide});m.userData.originalOpacity=1;m.userData.originalColor=m.color.clone();return m;};
class Metres extends T.Curve{constructor(c){super();this.c=c;}getPoint(t,out=new T.Vector3()){return this.c.getPointAt(t,out).multiplyScalar(.001);}getTangent(t,out=new T.Vector3()){return this.c.getTangentAt(t,out);}}
export function installBedFamily15(viewer){
 if(viewer.bedFamily15)return viewer.bedFamily15;
 if(ids.some(id=>viewer.fasteners.entities.has(id)))throw Error('Bed roles already have a power provider; integrate the shared R15 field there instead of duplicating it');
 const base=viewer.fasteners.entities.get('bedWire'),heatbed=viewer.meshes.find(m=>m.userData.cadIndex===659);if(!base||!heatbed||base.mesh.geometry!==base.geometry)throw Error('Actual source bed sleeve and native659 required');
 const {createBedFrameFamily,bedSleeveGeometry,bedWireGeometry,dispose:disposeBedRenderer}=createBedRenderer();
 const original={geometry:base.geometry,curve:base.curve,update:base.update,restore:viewer.fasteners.restore,setState:viewer.setState,setProgress:viewer.setProgress,dispose:viewer.dispose},added=[],roles=new Map(),rigids=[],stack=[777,699,779,701].map(id=>({mesh:viewer.meshes.find(m=>m.userData.cadIndex===id),last:null,source:null}));
 const fasteners=viewer.fasteners,ownedGeometries=new Set(),ownedMaterials=new Set();
 let active=true,depth=0,signature='',materialSignature='',current=null,ownedSleeve=null,ownedCurve=null,boxRoutingAmount=1,packetProfile=null,construction={enabled:false,powers:1,thread:1,insert:1,wrap:1},sleeveConstruction=null;const inv=new T.Matrix4(),box=new T.Box3();
 const add=(g,component,mat)=>{ownedGeometries.add(g);ownedMaterials.add(mat);const mesh=new T.Mesh(g,mat);mesh.name=component;mesh.userData={part:'cables',component,componentOnly:true,supplement:true,constructedStock:true,bedFamily15:true,cadName:component};viewer.group('cables').add(mesh);viewer.meshes.push(mesh);viewer.fasteners.meshes.push(mesh);viewer.records.push({key:'cables',name:component,mesh,id:mesh.uuid});mesh.userData.restPosition=mesh.position.clone();mesh.userData.restQuaternion=mesh.quaternion.clone();added.push(mesh);return mesh;};
 for(const id of ids){
  const r=BED_DATUM.roles[id],mesh=add(new T.BufferGeometry(),id,material(r.color)),entity={id,mesh,geometry:mesh.geometry,amount:1,stock:AUTHORED_WIRE_STOCKS[id],radius:1.65,
   update(from,to,t){if(![from,to,t].every(Number.isFinite)||from<0||from>1||to<0||to>1||t<0||t>1)throw Error('Invalid actual bed role state');this.amount=from+(to-from)*S(t);mesh.userData.flexState={from,to,t,amount:this.amount};},
   guide(to=0,from=1){return Array.from({length:25},(_,i)=>V(r.port).add(V([0,18*(1-(from+(to-from)*i/24)),0])).multiplyScalar(.001));}};
  roles.set(id,entity);viewer.fasteners.entities.set(id,entity);
  const free=freeLugUnionGeometry();free.translate((r.port[0]-BED_DATUM.roles.xbBedMinus.port[0])*.001,0,0);rigids.push({id,kind:'free',mesh:add(free,id+'Lug',material('#b9bec2',true))});
  const fixed=bedLugUnionGeometry();if(id==='xbBedPlus'){const p=fixed.attributes.position;for(let i=0;i<p.count;i++)p.setX(i,2*(-114.918497334175)*.001-p.getX(i));const a=p.array;for(let i=0;i<a.length;i+=9)for(let k=0;k<3;k++){const x=a[i+3+k];a[i+3+k]=a[i+6+k];a[i+6+k]=x;}fixed.computeVertexNormals();}
  rigids.push({id,kind:'fixed',mesh:add(fixed,id+'FixedLug',material('#b9bec2',true))});
 }
 function nativeZ(){viewer.printer.updateMatrixWorld(true);inv.copy(viewer.printer.matrixWorld).invert();box.setFromObject(heatbed).applyMatrix4(inv);return box.max.z*1000+(205.2-204.59941577673532);}
 function write(g,next){if(!g.attributes.position){g.dispose();return next;}for(const name of['position','normal']){if(g.attributes[name].count!==next.attributes[name].count)throw Error('Bed profile topology changed');g.attributes[name].array.set(next.attributes[name].array);g.attributes[name].needsUpdate=true;}next.dispose();g.computeBoundingBox();g.computeBoundingSphere();return g;}
 function stackOffset(shown){for(const r of stack){if(!r.mesh)continue;const p=r.mesh.position;if(r.last&&p.equals(r.last)){if(!shown){p.copy(r.source);r.last=null;}continue;}if(shown){r.source=p.clone();p.z+=.0006;r.last=p.clone();}}}
 function follow(){
  if(!active||viewer.disposed)return;
  if(ownedSleeve&&base.mesh.geometry!==ownedSleeve)throw Error('Bed sleeve geometry changed owner; retire R15 first');for(const e of roles.values())if(e.mesh.geometry!==e.geometry)throw Error('Bed conductor geometry changed owner');
  const z=nativeZ(),amounts=Object.fromEntries([...roles].map(([id,e])=>[id,e.amount])),powerChannelAmount=construction.enabled?construction.powers:1,materialKey=[z,boxRoutingAmount,...ids.map(id=>amounts[id]),powerChannelAmount].join(':'),key=[materialKey,...Object.values(construction)].join(':');
  // Exact owner-local material inputs; cloth-only motion never changes controls.
  if(materialSignature!==materialKey){current=createBedFrameFamily({crimpZMM:z,bedPortAmounts:amounts,boxRoutingAmount,powerChannelAmount});base.geometry=base.mesh.geometry=bedSleeveGeometry(current.sleeve,base.geometry===original.geometry?undefined:base.geometry);base.curve=ownedCurve=new Metres(current.sleeve);
   for(const[id,e]of roles){e.geometry=e.mesh.geometry=bedWireGeometry(current.wires.get(id),e.geometry);e.curve=current.wires.get(id);e.mesh.userData.materialReference={stockMM:e.stock,actualCurveMM:e.curve.getLength(),fixedMM:e.curve.getPointAt(0).toArray(),portMM:e.curve.getPointAt(1).toArray()};}
   // One canonical full profile, owned and disposed by this R15 instance.
   // Do not capture a previously opened/slid cloth skin as the next source.
   if(!packetProfile){packetProfile=base.geometry.clone();ownedGeometries.add(packetProfile);}else for(const k of ['position','normal'])packetProfile.attributes[k].array.set(base.geometry.attributes[k].array);
   ownedSleeve=base.geometry;ownedGeometries.add(ownedSleeve);materialSignature=materialKey;
  }
  if(signature!==key){
   for(const k of ['position','normal']){base.geometry.attributes[k].array.set(packetProfile.attributes[k].array);base.geometry.attributes[k].needsUpdate=true;}
   if(construction.enabled)sleeveConstruction=writeSleeveConstruction(current,packetProfile,base.geometry,construction);else{sleeveConstruction=null;base.geometry.computeBoundingBox();base.geometry.computeBoundingSphere();}
   signature=key;
  }
  const amount=base.mesh.userData.flexState?.amount??1,visible=base.mesh.visible;for(const m of added)m.visible=visible;
  base.geometry.setDrawRange(0,base.geometry.index.count);for(const e of roles.values())e.geometry.setDrawRange(0,e.geometry.index.count);
  for(const r of rigids){r.mesh.position.copy(r.mesh.userData.restPosition);r.mesh.quaternion.copy(r.mesh.userData.restQuaternion);if(r.kind==='free'){if(boxRoutingAmount<1&&current.routingTips?.[r.id]){const tip=current.routingTips[r.id],q=new T.Quaternion().setFromUnitVectors(V([0,0,-1]),tip.tangent),old=V(BED_DATUM.roles[r.id].port).multiplyScalar(.001);r.mesh.quaternion.premultiply(q);r.mesh.position.add(tip.point.clone().multiplyScalar(.001).sub(old.clone().applyQuaternion(q)));}else r.mesh.position.y+=18*(1-roles.get(r.id).amount)*.001;}else r.mesh.position.z+=(z-205.2)*.001;}
  stackOffset(visible&&amount>0);api.receipt={boxRoutingAmount,nativeCrimpZMM:z,electricalAmounts:amounts,sleeveStockMM:current.sleeve.getLength(),sleeveBackProjectionMM:8,wireStocks:{...AUTHORED_WIRE_STOCKS},fullFaces:[base.geometry.index.count/3,...[...roles.values()].map(e=>e.geometry.index.count/3)],nativeStackReferenceMM:.6,sleeveConstruction,renderer:{mode:current.mode,lookup:current.lookup,materialFrameTable:true,geometryPersistent:true}};viewer.dirty=true;
 }
 const update=function(...args){const result=original.update.apply(this,args);return result;};base.update=update;base.lastKey='';
 const restore=function(states={}){const next={...states};for(const id of ids)if(!Object.hasOwn(next,id))next[id]=1;return original.restore.call(this,next);};viewer.fasteners.restore=restore;
 function run(name,self,args){depth++;let result,ok=false;try{result=original[name].apply(self,args);ok=true;}finally{depth--;}if(ok&&!depth)follow();return result;}
 const setState=function(...args){return run('setState',this,args);},setProgress=function(...args){return run('setProgress',this,args);},dispose=function(...args){api.retire();return original.dispose.apply(this,args);};viewer.setState=setState;viewer.setProgress=setProgress;viewer.dispose=dispose;
 const api={roles,receipt:null,follow,get constructionStage(){return construction;},setConstructionStage(stage){if(this!==api||!active||viewer.disposed)return;for(const k of ['powers','thread','insert','wrap'])if(!Number.isFinite(stage[k])||stage[k]<0||stage[k]>1)throw Error('Invalid construction stage');if(typeof stage.enabled!=='boolean')throw Error('Explicit construction mode required');construction=stage;},setBoxRoutingAmount(a){if(!Number.isFinite(a)||a<0||a>1)throw Error('Invalid physical box routing');boxRoutingAmount=a;},get materialFrames(){return current?{controls:current.controls,sleeve:current.sleeve,wires:current.wires,sleeveSurface:base.geometry,packetSurface:construction.enabled?packetProfile:null,carrierPath:current.carrierPath,construction}:null;},get active(){return active;},setPortAmounts(amounts){for(const[id,a]of Object.entries(amounts)){const e=roles.get(id);if(!e||!Number.isFinite(a)||a<0||a>1)throw Error('Invalid canonical bed port input');e.update(a,a,1);}},retire(){
  if(!active)return;
  active=false;
  disposeBedRenderer();
  const nativeDisposed=viewer.disposed,geometries=[...ownedGeometries],materials=[...ownedMaterials];
  // Return borrowed pointers and hooks before any disposal notification can
  // install another owner. Never read a later owner's resources to dispose them.
  for(const[id,e]of roles)if(fasteners.entities.get(id)===e)fasteners.entities.delete(id);
  if(viewer.fasteners===fasteners&&fasteners.restore===restore)fasteners.restore=original.restore;
  for(const[k,f]of[['setState',setState],['setProgress',setProgress],['dispose',dispose]])if(viewer[k]===f)viewer[k]=original[k];
  if(viewer.bedFamily15===api)delete viewer.bedFamily15;
  if(!nativeDisposed){
   stackOffset(false);
   if(base.mesh.geometry===ownedSleeve)base.mesh.geometry=original.geometry;
   if(base.geometry===ownedSleeve)base.geometry=original.geometry;
   if(base.curve===ownedCurve)base.curve=original.curve;
   if(base.update===update){base.update=original.update;base.lastKey='';}
  }
  for(const m of added)m.removeFromParent();
  if(Array.isArray(viewer.meshes))viewer.meshes.splice(0,viewer.meshes.length,...viewer.meshes.filter(m=>!added.includes(m)));
  fasteners.meshes.splice(0,fasteners.meshes.length,...fasteners.meshes.filter(m=>!added.includes(m)));
  if(Array.isArray(viewer.records))viewer.records=viewer.records.filter(r=>!added.includes(r.mesh));
  if(!nativeDisposed){geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}
  ownedGeometries.clear();ownedMaterials.clear();
 }};viewer.bedFamily15=api;follow();return api;
}
