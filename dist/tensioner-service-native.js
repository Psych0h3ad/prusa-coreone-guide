import * as T from 'three';
import {makeDoorSwitch,doorSwitchFrame} from './door-switch-source.js';
import {owners,checked} from './tensioner-service-runtime.js';
import {STLLoader} from './vendor/STLLoader.js';
import {ChamberRivet} from './chamber-service-rivets.js';
import {CutBand} from './chamber-service-accessories.js';
import {TIES} from './fastener-data.js';
import {TENSIONER_GEOMETRY,tensionerRivets} from './tensioner-service-scene.js';
import {rigidMotion} from './assembly-director.js';
import {PARTS} from './data.js';
// Preserve all seven cached source solids as alternative actuator states.
// The complete three-solid operating configuration uses the lower mounting
// datum; the original source geometries remain in their CORE One L frame.
const stl=new STLLoader();
function cloneServiceMaterial(source){const material=source.clone();if(source.userData.originalColor?.isColor)material.userData.originalColor=source.userData.originalColor.clone();return material;}
let switchSolids,switchPending,switchMaterialRegions;
export function prepareTensionerAssets(){
 if(switchSolids)return Promise.resolve(switchSolids);
 if(!switchPending)switchPending=Promise.allSettled([...Array.from({length:7},(_,i)=>stl.loadAsync(`./assets/tensioner-service/switch-0-${i}.stl`)),fetch('./assets/tensioner-service/switch-material-groups.json').then(async r=>{if(!r.ok)throw Error('Switch material regions could not be loaded');return r.json();})]).then(results=>{
  const failure=results.find(r=>r.status==='rejected');if(failure){for(const r of results)if(r.status==='fulfilled'&&r.value?.isBufferGeometry)r.value.dispose();throw failure.reason;}
  try{const groups=results[7].value.groups;let offset=0;for(const g of groups||[]){if(g.start!==offset||g.count<=0||g.count%3||![0,1].includes(g.materialIndex))throw Error('Invalid full source switch material regions');offset+=g.count;}if(offset!==results[0].value.attributes.position.count)throw Error('Incomplete switch material regions');switchMaterialRegions=groups;}catch(error){for(const r of results.slice(0,7))r.value.dispose();throw error;}
  return switchSolids=results.slice(0,7).map(r=>r.value);
 }).catch(error=>{switchPending=undefined;throw error;});return switchPending;
}
const V=p=>new T.Vector3(...p),ease=t=>{t=T.MathUtils.clamp(t,0,1);return t*t*(3-2*t);};
const registration=doorSwitchFrame().registration;
export const TENSIONER_SWITCH_REGISTRATION=registration.toArray();
function add(owner,mesh,component){
 const v=owner.viewer;mesh.userData={...mesh.userData,part:'tensionerService',component,serviceTask:'belt-tensioner-pulley',preserveColours:true};
 mesh.userData.restPosition=mesh.position.clone();mesh.userData.restQuaternion=mesh.quaternion.clone();v.group('tensionerService').add(mesh);v.meshes.push(mesh);v.records.push({key:'tensionerService',name:mesh.userData.cadName||component,mesh,id:mesh.uuid});owner.nodes.push(mesh);owner.geometry.set(mesh,mesh.geometry);return mesh;
}
// This is the same authored, source-hole based full pin/body surface used by
// the chamber owner. It is a separate instance and never impersonates that
// owner or calls ChamberRivet.update/guide across the common TEMP boundary.
class ServiceRivet{
 constructor(d,owner){const surface=new ChamberRivet(d,null);this.surface=surface;this.owner=owner;this.id=d.id;this.mesh=surface.mesh;this.geometry=surface.geometry;this.definition=d;this.mesh.userData.flexId=this.id;}
 update(from,to,t){if(!this.owner.viewer.operationScene?.plan.tensionerService||!checked(this.owner)||this.update!==ServiceRivet.prototype.update)return;if(this.owner.viewer.fasteners.entities.get(this.id)!==this)throw Error('Foreign tensioner rivet entity');this.surface.write(T.MathUtils.lerp(from,to,ease(t)));}
 guide(to=1,from=0){if(!checked(this.owner)||this.guide!==ServiceRivet.prototype.guide)return[];if(this.owner.viewer.fasteners.entities.get(this.id)!==this)throw Error('Foreign tensioner rivet guide');return[from,to].map(a=>V(this.definition.p).addScaledVector(V(this.definition.axis),18*(1-a)).multiplyScalar(.001));}
}
class ServiceTie{
 constructor(surface,owner,cut=false){this.surface=surface;this.owner=owner;this.cut=cut;this.id=surface.id;this.mesh=surface.mesh;this.geometry=surface.geometry;this.mesh.userData.flexId=this.id;this.curve=surface.curve;this.sourceUpdate=surface.update;if(cut){this.centres=Array.from({length:193},(_,k)=>{const c=new T.Vector3();for(let j=0;j<8;j++)c.add(V(Array.from(surface.sourcePosition.slice((k*8+j)*3,(k*8+j)*3+3))));return c.multiplyScalar(125);});this.stations=[0];for(let i=1;i<193;i++)this.stations.push(this.stations.at(-1)+this.centres[i].distanceTo(this.centres[i-1]));this.tangents=this.centres.map((p,i)=>this.centres[Math.min(192,i+1)].clone().sub(this.centres[Math.max(0,i-1)]).normalize());}}
 update(from,to,t){if(!this.owner.viewer.operationScene?.plan.tensionerService||!checked(this.owner)||this.update!==ServiceTie.prototype.update)return;if(this.owner.viewer.fasteners.entities.get(this.id)!==this)throw Error('Foreign tensioner tie entity');if(!this.cut){if(this.surface.update!==this.sourceUpdate)return;this.surface.update(from,to,t);return;}if(this.writeCut!==ServiceTie.prototype.writeCut)return;this.writeCut(T.MathUtils.lerp(from,to,ease(t)));}
 writeCut(amount){const s=this.surface,q=1-amount,pull=ease((q-.15)/.65),move=ease((q-.8)/.2),L=this.stations.at(-1),cut=this.stations[96],p=this.geometry.attributes.position,n=this.geometry.attributes.normal,at=value=>{if(value<=0)return {p:this.centres[0].clone().addScaledVector(this.tangents[0],value),t:this.tangents[0]};if(value>=L)return {p:this.centres[192].clone().addScaledVector(this.tangents[192],value-L),t:this.tangents[192]};let lo=0,hi=192;while(hi-lo>1){const m=(lo+hi)>>1;if(this.stations[m]<value)lo=m;else hi=m;}const u=(value-this.stations[lo])/(this.stations[hi]-this.stations[lo]);return {p:this.centres[lo].clone().lerp(this.centres[hi],u),t:this.tangents[lo].clone().lerp(this.tangents[hi],u).normalize()};},retreat=V([-50*move,0,20*move]);
  for(let i=0;i<p.count;i++){const j=s.sources[i];let point=V(Array.from(s.sourcePosition.slice(j*3,j*3+3))).multiplyScalar(1000),normal=i>=s.capStart?s.capNormals[i>=s.capStart+4?1:0].clone():V(Array.from(s.sourceNormal.slice(j*3,j*3+3)));
   if(j<=s.last+7){const k=Math.floor(j/8),right=(s.duplicate<=i&&i<s.capStart)||i>=s.capStart+4||j>s.pinStart+7,target=at(this.stations[k]+(right?pull*(L-cut):-pull*cut)),rotation=new T.Quaternion().setFromUnitVectors(this.tangents[k],target.t);point.sub(this.centres[k]).applyQuaternion(rotation).add(target.p);normal.applyQuaternion(rotation);}else point.add(at(-pull*cut).p.clone().sub(this.centres[0]));point.add(retreat).multiplyScalar(.001);p.setXYZ(i,point.x,point.y,point.z);n.setXYZ(i,normal.x,normal.y,normal.z);}
  p.needsUpdate=true;n.needsUpdate=true;this.geometry.setDrawRange(0,q<.15?s.originalIndexCount:Infinity);this.geometry.computeBoundingBox();this.geometry.computeBoundingSphere();this.mesh.userData.flexState={cut:q>=.15,opening:pull,removed:move,retainedStripMM:L,firstHalfMM:cut,secondHalfMM:L-cut};
 }
 guide(to=1,from=0){if(!checked(this.owner)||this.guide!==ServiceTie.prototype.guide)return[];if(this.owner.viewer.fasteners.entities.get(this.id)!==this)throw Error('Foreign tensioner tie guide');return this.cut?[from,to].map(a=>this.surface.pivotA.clone().add(V([-(1-a)*.05,0,(1-a)*.02]))):this.surface.guide(to,from);}
}

const length=points=>points.slice(1).reduce((n,p,i)=>n+p.distanceTo(points[i]),0);
function idlerEnvelope(geometry){
 const mesh=new T.Mesh(geometry,new T.MeshBasicMaterial({side:T.DoubleSide}));mesh.updateMatrixWorld(true);const ray=new T.Raycaster(),radii=[];
 for(let k=0;k<360;k++){const theta=k*Math.PI/180,radial=V([Math.cos(theta),Math.sin(theta),0]);let radius=0;for(const z of [-3,-1.5,0,1.5,3]){ray.set(radial.clone().multiplyScalar(.02).add(V([0,0,z*.001])),radial.clone().negate());const hit=ray.intersectObject(mesh,false)[0];if(!hit)throw Error('Incomplete native idler radial section');radius=Math.max(radius,20-hit.distance*1000);}radii.push(radius);}
 mesh.material.dispose();return {radii,max:Math.max(...radii),at(theta){const u=(theta*180/Math.PI+360)%360,k=Math.floor(u);return T.MathUtils.lerp(radii[k],radii[(k+1)%360],u-k);}};
}
function resample(points,count){const cumulative=[0];for(let i=1;i<points.length;i++)cumulative.push(cumulative.at(-1)+points[i].distanceTo(points[i-1]));let k=0;return Array.from({length:count+1},(_,i)=>{const s=cumulative.at(-1)*i/count;while(k<cumulative.length-2&&cumulative[k+1]<s)k++;return points[k].clone().lerp(points[k+1],(s-cumulative[k])/(cumulative[k+1]-cumulative[k]||1));});}
class WorkingBelt{
 constructor(side,owner,envelope){this.side=side;this.owner=owner;this.envelope=envelope;this.centre=V(TENSIONER_GEOMETRY[side].centre);this.radius=20*2/(2*Math.PI);this.count=384;this.width=6;this.thickness=1.38;this.stock=length(this.path(this.centre,0));const p=new Float32Array((this.count+1)*8*3),ix=[];for(let i=0;i<this.count;i++)for(let j=0;j<4;j++){const a=i*8+j*2,b=a+1,c=a+8,d=c+1;ix.push(a,c,b,b,c,d);}this.geometry=new T.BufferGeometry().setAttribute('position',new T.BufferAttribute(p,3)).setAttribute('normal',new T.BufferAttribute(p.slice(),3)).setIndex(ix);this.mesh=new T.Mesh(this.geometry,new T.MeshStandardMaterial({color:'#292b2c',roughness:.83}));this.mesh.userData={cadName:'GT2 6 mm working belt span',qualification:'Authored 2 mm pitch, 6 mm width, 1.38 mm backing; wrapped inner envelope derived from full native pulley radial sections with 0.03 mm display clearance; bounded working span, not OEM belt CAD or a manufacturing fit',reference:true};this.write(this.centre);}
 path(c,sag,opening=0){const r=this.radius+opening,rest=this.centre,pts=[],L=V([rest.x-this.radius,rest.y+85,rest.z]),R=V([rest.x+this.radius,rest.y+85,rest.z]),a=V([c.x-r,c.y,c.z]),b=V([c.x+r,c.y,c.z]);
  const leg=(p,q,bow=true)=>{for(let i=0;i<64;i++){const t=i/64,c=p.clone().lerp(q,t);c.z=T.MathUtils.lerp(p.z,q.z,ease(t))+(bow?sag*Math.sin(Math.PI*t)**2:0);pts.push(c);}};
  const ae=a.clone().add(V([0,12,0])),be=b.clone().add(V([0,12,0]));leg(L,ae);leg(ae,a,false);for(let i=0;i<=96;i++){const theta=Math.PI+i*Math.PI/96;pts.push(V([c.x+r*Math.cos(theta),c.y+r*Math.sin(theta),c.z]));}leg(b,be,false);leg(be,R);pts.push(R);return pts;
 }
 write(c,opening=0){let lo=0,hi=120;for(let j=0;j<32;j++){const m=(lo+hi)/2;if(length(this.path(c,m,opening))<this.stock)lo=m;else hi=m;}const raw=this.path(c,(lo+hi)/2,opening),pts=resample(raw,this.count),pos=this.geometry.attributes.position;this.measuredStock=length(raw);this.sampledStock=length(pts);this.amplitude=(lo+hi)/2;this.loop=c.toArray();this.opening=opening;
  for(let i=0;i<=this.count;i++){const tangent=pts[Math.min(this.count,i+1)].clone().sub(pts[Math.max(0,i-1)]).normalize(),across=V([0,0,1]),normal=new T.Vector3().crossVectors(tangent,across).normalize();across.crossVectors(normal,tangent).normalize();const phase=(i*this.stock/this.count)%2,tooth=.75*(phase<.35?phase/.35:phase<1.0?1:phase<1.35?(1.35-phase)/.35:0),relative=pts[i].clone().sub(c),rad=Math.hypot(relative.x,relative.y),blend=ease(1-Math.max(0,relative.y)/10),inner=T.MathUtils.lerp(-tooth,this.envelope.at(Math.atan2(relative.y,relative.x))+.03+opening-rad,blend),outer=T.MathUtils.lerp(this.thickness,this.envelope.max+this.thickness+opening-rad,blend),corners=[[-3,inner],[-3,outer],[3,outer],[3,inner]];for(let j=0;j<4;j++)for(let k=0;k<2;k++){const corner=corners[(j+k)%4],p=pts[i].clone().addScaledVector(across,corner[0]).addScaledVector(normal,corner[1]).multiplyScalar(.001);pos.setXYZ(i*8+j*2+k,p.x,p.y,p.z);}}
  pos.needsUpdate=true;this.geometry.computeVertexNormals();this.geometry.computeBoundingBox();this.geometry.computeBoundingSphere();
 }
}
class DoorLead{
 constructor(owner,source){this.owner=owner;this.radius=source.radius;this.points=source.points.map(V);this.stock=source.curve.getLength()*1000;this.divisions=source.curve.arcLengthDivisions;this.count=source.samples;this.cut=22;this.prefixStock=this.stock*this.cut/this.count;this.geometry=source.geometry.clone();this.geometry.setDrawRange(0,Infinity);this.sourceP=this.geometry.attributes.position.array.slice();this.sourceN=this.geometry.attributes.normal.array.slice();this.cutCentre=new T.Vector3();for(let j=0;j<8;j++)this.cutCentre.add(V(Array.from(this.sourceP.slice((this.cut*9+j)*3,(this.cut*9+j)*3+3))).multiplyScalar(1000));this.cutCentre.multiplyScalar(1/8);this.cutTangent=source.curve.getTangentAt(this.cut/this.count);this.cutNormal=V(Array.from(this.sourceN.slice(this.cut*9*3,this.cut*9*3+3)));this.startTangent=source.curve.getTangentAt(0);this.mesh=new T.Mesh(this.geometry,cloneServiceMaterial(source.mesh.material));this.mesh.userData={cadName:'Retained door sensor lead',reference:true,qualification:'Literal source P/N/I at rest and literal rings22..64 through the native plate opening at all times; 1 mm source gauge, original stock, free-prefix slack solve'};}
 write(delta,rotation){const p=this.geometry.attributes.position,n=this.geometry.attributes.normal;this.fixed=this.points.at(-1).toArray();p.array.set(this.sourceP);n.array.set(this.sourceN);if(delta.lengthSq()===0&&rotation.angleTo(new T.Quaternion())===0){p.needsUpdate=true;n.needsUpdate=true;this.measuredStock=this.stock;return;}
  const end=this.points[0].clone().add(delta),cut=this.cutCentre,t0=this.startTangent.clone().applyQuaternion(rotation),t1=this.cutTangent,make=sag=>{const mid=end.clone().lerp(cut,.5).add(V([-sag,0,0])),t=cut.clone().sub(end).normalize(),path=new T.CurvePath();path.add(new T.CubicBezierCurve3(end,end.clone().addScaledVector(t0,2),mid.clone().addScaledVector(t,-3),mid));path.add(new T.CubicBezierCurve3(mid,mid.clone().addScaledVector(t,3),cut.clone().addScaledVector(t1,-4),cut));path.arcLengthDivisions=1024;return path;};let lo=0,hi=100;for(let i=0;i<32;i++){const m=(lo+hi)/2;if(make(m).getLength()<this.prefixStock)lo=m;else hi=m;}const curve=make((lo+hi)/2);this.measuredStock=this.stock-this.prefixStock+curve.getLength();this.amplitude=(lo+hi)/2;const frames=curve.computeFrenetFrames(this.cut,false),generated=frames.normals[this.cut].clone().negate(),target=this.cutNormal,twist=Math.atan2(t1.dot(new T.Vector3().crossVectors(generated,target)),generated.dot(target));
  for(let i=0;i<this.cut;i++){const c=curve.getPointAt(i/this.cut),turn=new T.Quaternion().setFromAxisAngle(frames.tangents[i],twist*i/this.cut);for(let j=0;j<=8;j++){const a=j*Math.PI/4,normal=frames.normals[i].clone().multiplyScalar(-Math.cos(a)).addScaledVector(frames.binormals[i],Math.sin(a)).applyQuaternion(turn),q=c.clone().addScaledVector(normal,this.radius).multiplyScalar(.001),k=i*9+j;p.setXYZ(k,q.x,q.y,q.z);n.setXYZ(k,normal.x,normal.y,normal.z);}}p.needsUpdate=true;n.needsUpdate=true;this.geometry.computeBoundingBox();this.geometry.computeBoundingSphere();
 }
}

export function installTensionerService(viewer){
 if(owners.has(viewer))return owners.get(viewer);if(viewer.disposed)throw Error('Disposed tensioner viewer');if(!switchSolids)throw Error('Tensioner model assets are not prepared');
 const ids=[...tensionerRivets.map(d=>d.id),'tsOldDoorTie','tsNewDoorTie'];if(ids.some(id=>viewer.fasteners.entities.has(id)))throw Error('Foreign tensioner resource registration');
 PARTS.tensionerService??={name:'ベルトテンショナー',en:'Belt tensioner',desc:'',icon:'tool',offset:[0,0,0]};
 const owner={viewer,active:true,nodes:[],geometry:new Map(),rivets:[],belts:{},switchNodes:[],registration:TENSIONER_SWITCH_REGISTRATION};owners.set(viewer,owner);const idlerSource=viewer.meshes.find(m=>m.userData.part==='carriageIdlerL1'&&m.userData.sourceSolid===0);if(!idlerSource)throw Error('Native idler profile missing');const envelope=idlerEnvelope(idlerSource.geometry);owner.idlerEnvelope={sections:1800,angles:360,z:[-3,-1.5,0,1.5,3],radii:envelope.radii,max:envelope.max};
 for(const [side,d]of Object.entries(TENSIONER_GEOMETRY)){
  const originals=viewer.meshes.filter(m=>m.userData.part==='carriageIdlerL1');if(originals.length!==3)throw Error('Complete three-solid idler source required');
  for(const source of originals){const mesh=new T.Mesh(source.geometry,cloneServiceMaterial(source.material));mesh.position.fromArray(d.centre.map((x,i)=>x-[0,0,0][i])).multiplyScalar(.001);mesh.userData={...source.userData,part:'tensionerService',cadName:'GT2-20 idler · '+side,sourcePart:'Pulley-A10',sourceSolid:source.userData.sourceSolid,registration:'Rigid placement at retained axle; no scaling'};add(owner,mesh,'tsIdler-'+side);}
  const belt=new WorkingBelt(side,owner,envelope);owner.belts[side]=belt;add(owner,belt.mesh,'tsBelt-'+side);
 }
 owner.switchModel=makeDoorSwitch({solids:switchSolids,bodyMaterialGroups:switchMaterialRegions});
 for(const mesh of owner.switchModel.meshes){Object.assign(mesh.userData,{cadName:mesh.userData.sourceSolid===0?'Door sensor case and terminals':mesh.userData.sourceSolid===1?'Door sensor lever':'Door sensor roller',officialSource:mesh.userData.source,geometryStatus:'complete-source-operating-configuration'});owner.switchNodes.push(add(owner,mesh,'tsDoorSwitch'));}
 for(const d of tensionerRivets){const r=new ServiceRivet(d,owner);owner.rivets.push(r);viewer.fasteners.entities.set(r.id,r);add(owner,r.mesh,r.id);}
 const originalTie=viewer.fasteners.entities.get('doorWire'),definition=TIES.find(d=>d.id==='doorWire');if(!originalTie||!definition)throw Error('Original door tie required');const cut=new ServiceTie(new CutBand(originalTie,{...definition,rise:definition.rise-2},null,'tsOldDoorTie'),owner,true),fresh=new ServiceTie(new originalTie.constructor({...definition,id:'tsNewDoorTie'}),owner);owner.ties=[cut,fresh];
 for(const e of owner.ties){viewer.fasteners.entities.set(e.id,e);add(owner,e.mesh,e.id);}
 owner.lead=new DoorLead(owner,viewer.fasteners.entities.get('doorWireLead'));add(owner,owner.lead.mesh,'tsDoorLead');
 viewer.director.cache.clear();return owner;
}
export function prepareTensionerServiceScene(viewer,spec,task){
 if(!task.tensionerService)return spec;const owner=owners.get(viewer);if(!owner||!checked(owner))throw Error('Tensioner resources are not live');
 for(const a of spec.plan.actors)if(a.carriedRefs){const map=new Map();for(const c of a.carriedRefs)for(const mesh of viewer.director.resolve(c.refs)){const value=V(c.offset).multiplyScalar(.001);if(map.has(mesh)&&!map.get(mesh).equals(value))throw Error('Conflicting rigid carry source');map.set(mesh,value);}if(map.size!==new Set(viewer.director.resolve(a.refs)).size)throw Error('Incomplete rigid carry source');a.carriedOffsets=map;}
 for(const a of spec.plan.actors)if(a.threadTurns){const original={...a},nodes=viewer.director.resolve(a.refs),box=new T.Box3();for(const m of nodes){m.geometry.computeBoundingBox();const matrix=new T.Matrix4().compose(m.userData.restPosition,m.userData.restQuaternion,m.scale);box.union(m.geometry.boundingBox.clone().applyMatrix4(matrix));}const pivot=box.getCenter(new T.Vector3()),seed=spec.plan.workpiecePoses.find(p=>p.refs.some(r=>a.refs.includes(r)));if(seed)pivot.add(V(seed.offset).multiplyScalar(.001));a.rigidPose=u=>{const p=rigidMotion(original,u);p.pivot=pivot;p.rotation.setFromAxisAngle(V(a.axis).normalize(),a.threadTurns*2*Math.PI*ease(u));return p;};}
 return spec;
}
