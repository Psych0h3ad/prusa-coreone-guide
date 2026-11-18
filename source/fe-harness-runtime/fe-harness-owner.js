import{sourceFEStorageHold}from'./fe-upper-column.js';
import{createFESourceCarry}from'./fe-source-carry.js';
import*as T from'three';
import{loadFEReceptacleBuffers,createFEReceptacle}from'./fe-functional-receptacles.js';
import{createFe5CaseFeed408}from'./fe-harness-case.js';
import{createFEField,makeWireGeometry,writeTube,createMovingSpan34}from'./fe-harness-curves.js';
import{operationAt}from'./assembly-director.js?v=20261113-116';
import{ASSEMBLY_PLAN}from'./assembly-plan-runtime.js';
import{withPhysicalFE348}from'./fe-harness-plan.js';
import{FLOWS}from'./data.js?v=20261112-113';
import{isPhysicalFEPlus}from'./fe-source-state.js';
import{followFeHardware as followLegacyFE}from'./fe-hardware.js?v=20261111-94';

const physicalPlans=()=>withPhysicalFE348(ASSEMBLY_PLAN);
const mm=.001,V=p=>new T.Vector3(...p),D=new T.Vector3(0,0,-1);let dataPending;
const decode=b=>JSON.parse(new TextDecoder().decode(b));
export function prepareSharedFE(read){if(!isPhysicalFEPlus(FLOWS))throw Error('Shared FE preparation requires the Plus source manual');return dataPending??=load(read).catch(e=>{dataPending=undefined;throw e;});}
async function load(read){
 const base=new URL('./assets/fe-harness/',import.meta.url),manifest=decode(await read(new URL('manifest.json',base))),data={};
 for(const[k,s]of Object.entries(manifest.buffers)){const b=await read(new URL(s.path,base));if(b.byteLength!==s.bytes)throw Error('FE owned asset length');data[k]=k==='reference45'?decode(b):s.dtype==='Uint32Array'?new Uint32Array(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength)):new Float32Array(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength));}
 const prepared=await loadFEReceptacleBuffers({fetcher:async url=>new Response(await read(url),{status:200})}),frames=decode(await read(new URL('./assets/fe-receptacles/frames.json',import.meta.url))).frames;
 return{manifest,data,prepared,frames};
}
function frame5(pose){return{originMM:pose.port.toArray(),basisColumns:[[0,-1,0],[1,0,0],[0,0,1]].map(p=>V(p).applyQuaternion(pose.rotation).toArray())};}
function matrix(frame){const[x,y,z]=frame.basisColumns,o=frame.originMM;return new T.Matrix4().set(x[0],y[0],z[0],o[0]*mm,x[1],y[1],z[1],o[1]*mm,x[2],y[2],z[2],o[2]*mm,0,0,0,1);}
function wholeTriangles(P,I,M){const out=new Float32Array(I.length*3),v=new T.Vector3();for(let i=0;i<I.length;i++)v.fromArray(P,I[i]*3).applyMatrix4(M).multiplyScalar(1000).toArray(out,i*3);return out;}
const bytes=a=>new Uint8Array(a.buffer,a.byteOffset,a.byteLength);

export function createSharedFEOwner(viewer,prepared){
 if(!isPhysicalFEPlus(FLOWS)||viewer.state?.flow&&!['build','upgrade'].includes(viewer.state.flow))throw Error('Shared FE owner requires the supported Plus build/upgrade viewer');
 const {data,manifest}=prepared,motion=createFe5CaseFeed408(),field=createFEField(data.reference45),resources=new Set(),meshes=[],parts=new Map(),rest=new Map(),identities=[];let carry;let closed=false,adopted=false,last45,last34,lastReference,lastReport;
 const steel=new T.MeshStandardMaterial({color:'#bfc2bf',metalness:.72,roughness:.33}),black=new T.MeshStandardMaterial({color:'#303432',roughness:.72});resources.add(steel);resources.add(black);
 function add(mesh,key,M=new T.Matrix4()){mesh.name=key;mesh.userData={...mesh.userData,part:key,cadName:key,component:key,preserveCadName:true,sharedPhysicalFE:true,physicalGraph:'1-2/2-3/3-4/4-5'};mesh.matrixAutoUpdate=false;mesh.matrix.copy(M);meshes.push(mesh);parts.set(key,mesh);rest.set(key,M.clone());resources.add(mesh.geometry);for(const m of Array.isArray(mesh.material)?mesh.material:[mesh.material])resources.add(m);return mesh;}
 function flat(array,key,material){const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(array.slice(),3));g.computeVertexNormals();g.setIndex(Array.from({length:array.length/3},(_,i)=>i));return add(new T.Mesh(g,material),key,new T.Matrix4().makeScale(mm,mm,mm));}
 function pose(key,offset,rotation=new T.Quaternion(),pivot=new T.Vector3()){const M=new T.Matrix4().makeTranslation(...pivot.clone().add(offset).toArray()).multiply(new T.Matrix4().makeRotationFromQuaternion(rotation)).multiply(new T.Matrix4().makeTranslation(...pivot.clone().negate().toArray())).multiply(rest.get(key));parts.get(key).matrix.copy(M);}
 const poseEnd=motion.at(1),eventWire=field.wire45(poseEnd),referenceGroup=new T.Group();referenceGroup.name='Borrowed shared FE writer — no resource ownership';
 const api={manifest,resources,meshes,parts,motion,field,get report(){return lastReport;},get closed(){return closed;},
  createHardware(native){
   if(closed||adopted)throw Error('FE owner construction state');
   try{
    for(const[kind,key,frame]of[['FE1','feTerminal1',prepared.frames['FE1-staging']],['FE3','feTerminal3',prepared.frames['FE3-mated']],['FE5','feTerminal5',frame5(poseEnd)]]){const part=createFEReceptacle({THREE:T,kind,prepared:prepared.prepared,frame});add(part.mesh,key,part.mesh.matrix);}
    flat(data.terminal2,'feTerminal2',steel);
    const ringGeo=new T.BufferGeometry();ringGeo.setAttribute('position',new T.BufferAttribute(data['terminal4-position'].slice(),3));ringGeo.setAttribute('normal',new T.BufferAttribute(data['terminal4-normal'].slice(),3));ringGeo.setIndex(new T.BufferAttribute(data['terminal4-index'].slice(),1));add(new T.Mesh(ringGeo,steel),'feGroundRing',new T.Matrix4().makeTranslation(-.134199394,.1672,.018645974));
    api.wire12={mesh:add(new T.Mesh(makeWireGeometry(),black),'feWire12'),radius:1.2};flat(data.wire34,'feWire34',black);
    const wire23={mesh:add(new T.Mesh(makeWireGeometry(),black),'feWire23'),radius:1.2},wire45={mesh:add(new T.Mesh(makeWireGeometry(),black),'feWire45'),radius:1.1,samples:512};api.wire23=wire23;api.wire45=wire45;writeTube(wire23,field.wire23.curve,field.end23);eventWire.writeTube(wire45);rest.set('feWire23',wire23.mesh.matrix.clone());rest.set('feWire45',wire45.mesh.matrix.clone());api.span34=createMovingSpan34(data.wire34);
    const clone=id=>{const s=native.find(m=>m.userData.cadPath?.includes(id));if(!s)throw Error('Missing complete FE native hardware'+id);s.updateMatrix();return s.geometry.clone().applyMatrix4(s.matrix);},washer=clone(776),from=V([-.123413,.100293,.078336093]),to=V([-.134199394,.166471722,.033645974]);washer.translate(...from.negate().toArray());washer.applyQuaternion(new T.Quaternion().setFromUnitVectors(V([0,0,1]),V([0,1,0])));washer.translate(...to.toArray());add(new T.Mesh(washer,steel),'feGroundWasher');const screw=clone(189);screw.translate(0,(165.571722+.5+.8-165.451722)*mm,0);add(new T.Mesh(screw,steel),'feGroundScrew');
    for(const mesh of meshes){mesh.geometry.computeBoundingBox();mesh.geometry.computeBoundingSphere();identities.push({mesh,geometry:mesh.geometry,position:mesh.geometry.attributes.position,normal:mesh.geometry.attributes.normal,index:mesh.geometry.index,material:mesh.material});}adopted=true;carry=createFESourceCarry({viewer,owner:api,prepared,parts,rest,field,motion,pose,writeTube});api.sourceCarry=carry;last45=undefined;return{meshes,ring:parts.get('feGroundRing'),lead:parts.get('feWire45'),sharedOwner:api};
   }catch(error){for(const r of resources)r.dispose();resources.clear();closed=true;throw error;}
  },
  syncPhysicalFrames(){for(const mesh of meshes)mesh.updateWorldMatrix(true,false);},
  invalidateFollowCache(){last34=last45=undefined;},
  writeSpan12(curve,end){writeTube(api.wire12,curve,end);},
  acquireServiceLease(request){return carry.leases.acquire(request);},
  planFor(plan,step,flow){if(!isPhysicalFEPlus(FLOWS)||flow!=='build'||plan?.originalSource||step?.originalSource)return plan;plan=carry?.planFor(plan,step,flow)||plan;if(flow==='build'&&[986567,986601].includes(step.officialId)&&!plan.sharedPhysicalFE348&&!plan.sharedPhysicalFEPrepare347)plan=physicalPlans().build[step.officialId];return plan.sharedPhysicalFE348?{...plan,actors:plan.actors.map(spec=>spec.feHarnessEvent==='case-feed'?{...spec,rigidPose(t){const p=motion.at(t),desired=matrix(frame5(p)),r=matrix(frame5(poseEnd)),delta=desired.multiply(r.invert()),position=new T.Vector3(),rotation=new T.Quaternion(),scale=new T.Vector3();delta.decompose(position,rotation,scale);return{offset:position,rotation,pivot:new T.Vector3()};}}:spec)}:plan;},
  follow(){
   if(closed||!adopted)return;field.setClearanceAmount(sourceFEStorageHold(viewer));if(carry.follow()){api.syncPhysicalFrames();lastReport=carry.report;return;}const scene=viewer.operationScene,id=scene?.plan.sharedPhysicalFEPrepare347?986567:scene?.plan.sharedPhysicalFE348?986601:scene?.plan.sequence349?986647:null;if(!id){lastReport={coverage:'pending-outside3.48/3.49',physicalGraph:manifest.stockMM};return;}
   const q=operationAt(viewer.operationProgress,viewer.sceneActors.length),ring=parts.get('feGroundRing'),delta=ring.position.clone(),rot=ring.quaternion.clone();pose('feGroundRing',delta,rot);let t=id===986567?0:1;if(id===986601){const index=viewer.sceneActors.findIndex(a=>a.feHarnessEvent==='case-feed');t=q.index<index?0:q.index>index?1:q.t;}const p=motion.at(t);parts.get('feTerminal5').matrix.copy(matrix(frame5(p)));for(const key of['feGroundWasher','feGroundScrew']){const mesh=parts.get(key);pose(key,mesh.position,mesh.quaternion);}
   const deltaMM=delta.clone().multiplyScalar(1000),key34=delta.toArray().join('|');if(key34!==last34){lastReference=api.span34.write(parts.get('feWire34'),deltaMM);last34=key34;for(const attr of Object.values(parts.get('feWire34').geometry.attributes))attr.needsUpdate=true;parts.get('feWire34').geometry.computeBoundingBox();parts.get('feWire34').geometry.computeBoundingSphere();}
   const key45=[t,field.clearanceAmount,...delta.toArray()].join('|');if(id!==986647&&key45!==last45){field.wire45(p,deltaMM).writeTube(api.wire45);last45=key45;}
   lastReport={sourceState:carry.policy,sourceStepID:id,caseFeed:t,wire34:lastReference,stockMM:manifest.stockMM,radiusMM:manifest.radiusMM,coverage:id===986567?'prepared-full-graph':id===986601?'six-source-actions':'shared3.49writer',old110mmConstructed:false,oldEarthEntitiesConstructed:false};api.syncPhysicalFrames();
  },
  borrowStep349(){return{group:referenceGroup,entity:api.wire45,materials:[],borrowed:true};},
  assertAssemblyWriter(){api.preflight();if(carry?.leases.active)throw Error('Release current FE service lease before assembly writer');},
  preflight(){if(closed||viewer.sharedFE!==api)throw Error('Shared physical FE owner retired/replaced');for(const q of identities)if(q.mesh.geometry!==q.geometry||q.geometry.attributes.position!==q.position||q.geometry.attributes.normal!==q.normal||q.geometry.index!==q.index||q.mesh.material!==q.material)throw Error('Current shared FE geometry/material owner changed');},
  eventFe(){return{curve:eventWire.curve,physicalPath:eventWire.curve,materialStationsMM:Array.from({length:513},(_,i)=>365*i/512),stockMM:365,radiusMM:1.1,ports:[V(data.reference45.points[0]),poseEnd.port],tangents:[D,poseEnd.outward],baseline:eventWire,pointAtPhysicalMM(s){return eventWire.curve.getPointAt(s/365);},makeResultForPhysicalPath(curve,report){const lengthMM=curve.getLength();if(Math.abs(lengthMM-365)>1e-6)throw Error('Entry relief must solve the same365mm stock: '+lengthMM);for(const[t,point,tangent]of[[0,V(data.reference45.points[0]),D],[1,poseEnd.port,poseEnd.outward.clone().negate()]])if(curve.getPointAt(t).distanceTo(point)>1e-7||curve.getTangentAt(t).distanceTo(tangent)>1e-7)throw Error('Entry relief changed a real FE endpoint or tangent');return{curve,report,writeTube(entity){writeTube(entity,curve,poseEnd.port);}};}};},
  async boundaryState(source){
   // Only independently owned FE surfaces replace the old frozen endpoint payloads.
   const model=prepared.prepared.profiles.single,frame=matrix(frame5(poseEnd)),end5=wholeTriangles(model.buffers.position,model.buffers.index,frame),end4=wholeTriangles(data['terminal4-position'],data['terminal4-index'],new T.Matrix4().makeTranslation(-.134199394,.1672,.018645974)),g=makeWireGeometry(),m=new T.Mesh(g,black),entity={mesh:m,radius:1.1,samples:512};m.matrixAutoUpdate=false;eventWire.writeTube(entity);const wire=wholeTriangles(g.attributes.position.array,g.index.array,m.matrix);g.dispose();
   const arrays={'@sharedFE4':end4,'@sharedFE5':end5,'@sharedFE45':wire};api.boundaryBytes=new Map(Object.entries(arrays).map(([k,a])=>[k,bytes(a)]));const descriptors={feTerminal4:'@sharedFE4',feTerminal5:'@sharedFE5',feWire45:'@sharedFE45'};return{...source,surfaces:await Promise.all(source.surfaces.map(async s=>{const name=descriptors[s.label];if(!name)return s;const b=api.boundaryBytes.get(name),digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',b)),v=>v.toString(16).padStart(2,'0')).join('');return{...s,file:name,count:b.byteLength/12,pin:{sha256:digest,qualification:'Whole independently authored shared physical FE boundary in CADmm; no supplier payload'}};}))};
  },
  retire(){if(closed)return;carry?.retire();closed=true;referenceGroup.removeFromParent();/* Adopted resources belong to the ordinary Viewer central Set collector. */if(!adopted)for(const r of resources)r.dispose();resources.clear();parts.clear();rest.clear();meshes.length=0;identities.length=0;api.wire23=api.wire45=api.span34=undefined;if(viewer.feHardware?.sharedOwner===api)viewer.feHardware=undefined;if(viewer.sharedFE===api)viewer.sharedFE=undefined;}
 };
 return api;
}
export function followPhysicalFE(viewer){if(viewer.feHardware?.sharedOwner)return viewer.feHardware.sharedOwner.follow();return followLegacyFE(viewer);}
