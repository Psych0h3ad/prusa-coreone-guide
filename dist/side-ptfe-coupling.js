import * as T from 'three';
import {FLOWS} from './data.js?v=20261112-113';
import {SIDE_PTFE_SEATS as seats} from './side-ptfe-seats.js';
import {reconstructSidePtfeTail} from './side-ptfe-tail.js';
import {transportSidePtfeFeed} from './side-ptfe-feed.js';
import {SIDE_PTFE_ROUTE as route} from './side-ptfe-route-data.js';
import {createSidePtfeReferenceStrap} from './side-ptfe-wrap-generator.js';
const vec=p=>new T.Vector3(...p),visible=m=>{for(let p=m;p;p=p.parent)if(!p.visible)return false;return true;};
export function sidePtfeServiceRegistration(viewer){
 const s=viewer.state,scene=viewer.operationScene,plan=scene?.plan,api=viewer.sidePtfeCompletion;
 const reference=viewer.fasteners?.entities.get('ptfeTube')?.filamentInletReference;
 // The installed side port and its TWO actual retained wraps stay in their
 // source frame while Nextruder work uses a close-up. Camera isolation does
 // not change their physical producer or select the legacy wrap route.
 if(s?.flow==='service'&&s.comparison==='after'&&!s.explore&&plan?.filament&&plan.workspace==='printer'&&reference&&api?.active&&api.baseGeometries.get(reference.sourceBody)===reference.sourceGeometry&&reference.sourceBody.geometry===reference.sourceGeometry)return true;
 if(s?.flow!=='service'||s.comparison!=='after'||s.explore||!plan||plan.headOnly||plan.workspace!=='printer')return false;
 const body=scene.visible?.find(m=>m.userData.part===(viewer.state?.edition==='original2251'?'sensorOld':'sensorBody'));
 return !!(body&&api?.active&&api.baseGeometries.get(body)===body.geometry);
}
const routingContext=viewer=>viewer.state?.flow!=='service'||sidePtfeServiceRegistration(viewer);
const assemblyFeed=(viewer,phase)=>{const s=viewer.state,step=FLOWS[s?.flow]?.steps[s?.index];return phase===5&&s?.flow==='build'&&s.comparison==='after'&&!s.explore&&step&&(step.chapter>5||step.chapter===5&&step.officialStep>=42);};
const feedStamp=(viewer,u)=>[viewer.state?.flow,viewer.state?.index,viewer.state?.comparison,viewer.state?.explore,u].join(':');
function restoreOriginalTube(viewer,api){
 const e=api.tube;if(!e||e.mesh.userData.sidePtfeJoin!==api.joinTag)return;
 if(!viewer.disposed&&e.sample===api.tubeSample&&e.geometry===api.tubeGeometry&&e.mesh.geometry===api.tubeGeometry){const q=e.mesh.userData.flexState;e.points.set((api.active?api.tubeSample:api.tubeSourceSample||api.tubeSample).call(e,q.phase,q.amount,new Float32Array(e.points.length)));e.surface.update(e.points);e.lastKey='';}
 delete e.mesh.userData.sidePtfeJoin;api.tailKey=undefined;api.feedApplied=undefined;
}
function collet(part,c,a,profile){
 // Authored split flexible sleeve/reference gripping lip. Dimensions fit the measured
 // empty native socket. This is NOT manufacturer CAD, force, or press-stroke data.
 const gripAngle=(Math.PI/4-.05)/8,gripRadius=2/Math.cos(gripAngle/2);profile=profile.map(([z,r])=>[z,r===2?gripRadius:r]);
 const axis=vec(a),u=new T.Vector3(1,0,0).addScaledVector(axis,-axis.x).normalize(),v=new T.Vector3().crossVectors(axis,u),p=[],ix=[];
 const segments=64,slots=8;
 for(let sector=0;sector<slots;sector++){const start=sector*Math.PI/4+.025,end=(sector+1)*Math.PI/4-.025,base=p.length/3,n=8;
  for(let i=0;i<=n;i++){const angle=start+(end-start)*i/n,rad=u.clone().multiplyScalar(Math.cos(angle)).addScaledVector(v,Math.sin(angle));for(const[z,r]of profile)p.push(...vec(c).addScaledVector(axis,z).addScaledVector(rad,r).multiplyScalar(.001).toArray());}
  const w=profile.length;for(let i=0;i<n;i++)for(let j=0;j<w;j++){const k=(j+1)%w,A=base+i*w+j,B=base+i*w+k,C=A+w,D=B+w;ix.push(A,B,C,B,D,C);}
  // The neck/flange section is concave. Earcut the actual section: a centroid fan
  // would incorrectly fill the outside of the narrow retaining neck.
  const caps=T.ShapeUtils.triangulateShape(profile.map(([z,r])=>new T.Vector2(z,r)),[]);
  const forward=caps.some(t=>t.some((a,i)=>a===0&&t[(i+1)%3]===1));
  for(const i of [0,n])for(const[a,b,c]of caps){const ids=[a,b,c].map(j=>base+i*w+j);if(i===0?forward:!forward)ids.reverse();ix.push(...ids);}
 }
 for(let i=0;i<ix.length;i+=3){const j=ix[i+1];ix[i+1]=ix[i+2];ix[i+2]=j;}
 const geometry=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(p,3));geometry.setIndex(ix);geometry.computeVertexNormals();geometry.computeBoundingBox();geometry.computeBoundingSphere();
 const material=new T.MeshStandardMaterial({color:'#303332',roughness:.6,metalness:0});material.userData.originalColor=material.color.clone();material.userData.originalOpacity=1;
 const mesh=new T.Mesh(geometry,material);mesh.userData={part,supplement:true,preserveColours:true,authoredReference:true,manufacturerCAD:false,role:'4mm tube retaining split collet reference',nativeSocketEvidence:part==='sideSensorInputCollet'?889:'R1/R2 printed sensor socket',fitAssumptions:{axialRadialProfileMM:profile.map(p=>[...p]),flangeOD:7.8,slitRadians:.05,gripNominalDiameter:4,forceQualified:false}};return mesh;
}
export function prepareSidePtfeCompletion(viewer){
 const old=viewer.meshes.find(m=>m.userData.cadIndex===76),native=viewer.meshes.find(m=>m.userData.cadIndex===889);if(!old||!native)throw Error('Native collet-capable handle889 or owner76 missing');
 old.updateMatrix();native.updateMatrix();const original=old.geometry,geometry=native.geometry.clone().applyMatrix4(old.matrix.clone().invert().multiply(native.matrix));
 old.geometry=geometry;const originalMetadata=old.userData.sidePtfeNativeReplacement,ownedMetadata={sourceCADIndex:889,originalCADIndex:76,reason:'Official collet-capable native branch; original geometry retained without deformation'};old.userData.sidePtfeNativeReplacement=ownedMetadata;
 viewer.sensorHardware.geometries.add(original);viewer.sensorHardware.geometries.add(geometry);
 const hc=collet('sideSensorInputCollet',seats.short.mouthCADMM,seats.short.axisOutCAD,[[-4.3,2.03],[-4.3,2.4],[-4.0,3.3],[-2.8,3.3],[-2.3,2.45],[.8,2.45],[.8,3.9],[1.6,3.9],[1.6,2.03],[-3.2,2.03],[-3.5,2.0],[-3.8,2.03]]),sc=collet('sideSensorTubeCollet',seats.long.mouthCADMM,seats.long.axisOutCAD,[[-5.5,2.03],[-5.5,3.2],[-3.6,3.2],[-3.1,2.15],[.02,2.15],[.02,3.9],[.82,3.9],[.82,2.03],[-4.1,2.03],[-4.5,2.0],[-4.8,2.03]]);
 const baseMatrices=new Map();for(const m of viewer.meshes.filter(m=>['sensorBody','sensorOld'].includes(m.userData.part)||m===old)){m.updateMatrix();baseMatrices.set(m,m.matrix.clone());}
 const baseGeometries=new Map([...baseMatrices.keys()].map(m=>[m,m.geometry]));
 const api={active:true,meshes:[hc,sc],oldHandle:old,geometry,baseMatrices,baseGeometries,lastReport:null,wraps:[],bindEntities(fasteners){
  if(api.wraps.length)return;
  const cable=fasteners.entities.get('mainSleeve'),tube=fasteners.entities.get('ptfeTube'),sourceSample=tube.sample;
  api.tube=tube;api.tubeGeometry=tube.geometry;api.tubeSourceSample=sourceSample;api.joinTag={source:'native R1/R2 common socket',materialLengthMM:710};
  api.feedTarget=reconstructSidePtfeTail(sourceSample.call(tube,5,1,new Float32Array(tube.points.length)),seats.long).points;
  const sample=function(phase,u,out=this.points){if(!api.active||viewer.disposed||viewer.fasteners?.entities.get('ptfeTube')!==tube||tube.sample!==sample||tube.geometry!==api.tubeGeometry||tube.mesh.geometry!==api.tubeGeometry||tube.mesh.userData.sidePtfeJoin&&tube.mesh.userData.sidePtfeJoin!==api.joinTag)return out;sourceSample.call(this,phase,u,out);if(assemblyFeed(viewer,phase))transportSidePtfeFeed(out,api.feedTarget,u);if(out===tube.points)api.feedApplied=feedStamp(viewer,u);return out;};
  api.tubeSample=sample;tube.sample=sample;
  for(const d of route.freeWraps){
   const e=fasteners.entities.get(d.id);if(!e?.free||!e.strap)throw Error('Only existing unanchored sleeve straps may relocate');
   const m=e.mesh,originalGeometry=m.geometry,originalUpdate=e.update,originalGuide=e.guide,oldTag=m.userData.sidePtfeWrapRelocation;
   const reference=createSidePtfeReferenceStrap(d.id,d.newCentreCADMM,cable,m.material),g=reference.geometry;
   const tag={source:'official994911 free wraps',separationMM:100,shiftAlongCableMM:d.alongCableShiftMM,nominalStockMM:100,widthMM:e.width,thicknessMM:e.thickness,holdClearanceAddedMM:d.id==='free2'?.55:0,authoredReference:true};
   const owns=()=>api.active&&!viewer.disposed&&e.update===update&&e.guide===guide&&e.geometry===m.geometry&&(m.geometry===g||m.geometry===originalGeometry);
   const update=function(...args){if(!owns())return;if(routingContext(viewer)){e.geometry=m.geometry=g;reference.update(...args);m.userData.flexState={...reference.mesh.userData.flexState};m.userData.sidePtfeWrapRelocation=tag;}else{e.geometry=m.geometry=originalGeometry;e.lastKey='';originalUpdate.apply(e,args);if(m.userData.sidePtfeWrapRelocation===tag){if(oldTag===undefined)delete m.userData.sidePtfeWrapRelocation;else m.userData.sidePtfeWrapRelocation=oldTag;}}};
   const guide=function(...args){if(!owns())return null;return routingContext(viewer)?reference.guide(...args):originalGuide.apply(e,args);};
   e.update=update;e.guide=guide;e.geometry=m.geometry=g;
   for(const value of [originalGeometry,e.ribbonGeometry,g,reference.ribbonGeometry])if(value)viewer.sensorHardware.geometries.add(value);
   const onDispose=()=>api.retire();g.addEventListener('dispose',onDispose);const q=m.userData.flexState;update(q?.from??4,q?.to??4,q?.t??1);
   api.wraps.push({e,m,g,reference,originalGeometry,originalUpdate,originalGuide,oldTag,tag,update,guide,onDispose});
  }
 },retire(){
  if(!api.active)return;api.active=false;geometry.removeEventListener('dispose',retire);restoreOriginalTube(viewer,api);if(api.tube&&api.tube.sample===api.tubeSample)api.tube.sample=api.tubeSourceSample;
  for(const w of api.wraps){
   w.g.removeEventListener('dispose',w.onDispose);const ownsUpdate=w.e.update===w.update,ownsGeometry=w.e.geometry===w.g&&w.m.geometry===w.g;
   if(ownsUpdate)w.e.update=w.originalUpdate;if(w.e.guide===w.guide)w.e.guide=w.originalGuide;
   if(ownsUpdate&&ownsGeometry){const q=w.m.userData.flexState;w.e.geometry=w.m.geometry=w.originalGeometry;if(!viewer.disposed&&q){w.e.lastKey='';w.originalUpdate.call(w.e,q.from,q.to,q.t);}}
   if(w.m.userData.sidePtfeWrapRelocation===w.tag){if(w.oldTag===undefined)delete w.m.userData.sidePtfeWrapRelocation;else w.m.userData.sidePtfeWrapRelocation=w.oldTag;}
  }
  if(old.geometry===geometry)old.geometry=original;if(old.userData.sidePtfeNativeReplacement===ownedMetadata){if(originalMetadata===undefined)delete old.userData.sidePtfeNativeReplacement;else old.userData.sidePtfeNativeReplacement=originalMetadata;}
 }};const retire=()=>api.retire();geometry.addEventListener('dispose',retire);
 return api;
}
export function followSidePtfeCompletion(viewer){
 const api=viewer.sidePtfeCompletion;if(!api?.active||viewer.disposed||!viewer.loaded)return;
 const body=[...api.baseMatrices.keys()].find(m=>m!==api.oldHandle&&visible(m));
 // Plan actors own collet positions. This follower only handles static assemblies;
 // it never overwrites a current explicit collet insertion actor.
 const follow=(mesh,source)=>{if(!source||viewer.sceneActors?.some(a=>a.nodes?.includes(mesh)))return;source.updateMatrix();const d=source.matrix.clone().multiply(api.baseMatrices.get(source).clone().invert());d.decompose(mesh.position,mesh.quaternion,mesh.scale);};
 follow(api.meshes[0],api.oldHandle);follow(api.meshes[1],body);
 const e=viewer.fasteners?.entities.get('ptfeTube');if(api.tube&&e!==api.tube)return;if(!e||e.mesh.userData.flexState?.phase!==5){restoreOriginalTube(viewer,api);api.lastReport={active:false,reason:'Original non-terminal PTFE phase retained'};return;}
 const s=viewer.state,step=FLOWS[s?.flow]?.steps[s?.index];if(!step){restoreOriginalTube(viewer,api);return;}
 const prepared=assemblyFeed(viewer,e.mesh.userData.flexState.phase),sampleOwner=e.sample===api.tubeSample&&e.geometry===api.tubeGeometry&&e.mesh.geometry===api.tubeGeometry&&(!e.mesh.userData.sidePtfeJoin||e.mesh.userData.sidePtfeJoin===api.joinTag);
 if(prepared&&sampleOwner){const u=e.mesh.userData.flexState.amount;if(api.feedApplied!==feedStamp(viewer,u)){api.tubeSample.call(e,5,u,e.points);e.surface.update(e.points);}const docking=step.chapter===6&&step.officialStep===21;if(!body||docking){api.tailKey=undefined;Object.assign(api.joinTag,{mated:!!(docking&&body&&api.baseGeometries.get(body)===body.geometry&&viewer.operationProgress===1),joinPortCADMM:docking&&body&&api.baseGeometries.get(body)===body.geometry&&viewer.operationProgress===1?[...seats.long.mouthCADMM]:undefined,note:docking?'Sensor docks over stationary prepared tube':'Prepared free tube; no mounted port claimed'});e.mesh.userData.sidePtfeJoin=api.joinTag;api.lastReport={ok:true,prepared:true,mated:api.joinTag.mated,materialLengthMM:710};return;}}
 const mounted=s.flow==='service'?sidePtfeServiceRegistration(viewer):s.explore||s.comparison==='before'||(s.flow==='build'&&(step.chapter>6||step.chapter===6&&step.officialStep>=21))||(s.flow==='upgrade'&&(step.chapter!==1||step.officialStep<8||step.officialStep>=19));
 if(!mounted||!body||api.baseGeometries.get(body)!==body.geometry){restoreOriginalTube(viewer,api);api.lastReport={active:false,reason:!mounted?'Source-specific unmated context retained':!body?'No visible compatible source port in this workspace':'Foreign source-body geometry retained'};return;}
 if(!api.tube){api.tube=e;api.tubeSample=e.sample;api.tubeGeometry=e.geometry;api.joinTag={source:'native R1/R2 common socket',materialLengthMM:710};}
 if(e.sample!==api.tubeSample||e.geometry!==api.tubeGeometry||e.mesh.geometry!==api.tubeGeometry||e.mesh.userData.sidePtfeJoin&&e.mesh.userData.sidePtfeJoin!==api.joinTag)return;
 let delta=new T.Matrix4();if(body&&!(s.flow==='build'&&step.chapter===6&&step.officialStep===21)){body.updateMatrix();delta.copy(body.matrix).multiply(api.baseMatrices.get(body).clone().invert());}const key=delta.elements.join(',');
 if(api.tailKey!==key){api.tailKey=key;const mm=delta.clone();for(const i of [12,13,14])mm.elements[i]*=1000;api.staticTail=reconstructSidePtfeTail(e.sample(5,1,new Float32Array(e.points.length)),seats.long,{transformPoint:p=>vec(p).applyMatrix4(mm).toArray()});}
 const q=api.staticTail;api.lastReport={...q,points:undefined};
 if(!q.ok)return;if(e.points.at(-1)!==q.points.at(-1)||e.points.at(-2)!==q.points.at(-2)){e.points.set(q.points);e.surface.update(e.points);}Object.assign(api.joinTag,{mated:true,anchor:q.anchor,stockRedistribution:q.stockRedistribution,joinPortCADMM:[...seats.long.mouthCADMM],note:'Actual mounted frame follower; selected contact evidence does not qualify the whole continuous motion'});e.mesh.userData.sidePtfeJoin=api.joinTag;
}
