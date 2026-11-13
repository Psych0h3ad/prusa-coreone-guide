import*as T from'three';
import{GLTFLoader}from'../../../vendor/GLTFLoader.js';
import{bindRootPacketMeshes}from'../../route/packet-pose.js';
const assetEpoch='20261114-135';
const sourceBase=new URL('../models/',import.meta.url);
const assetURL=(name,base)=>{const url=new URL(name,base);url.searchParams.set('v',assetEpoch);return url;};
const MM=m=>{const out=new T.Matrix4().fromArray(m);for(const k of[12,13,14])out.elements[k]*=.001;return out;};
const json=async name=>{const r=await fetch(assetURL(name,import.meta.url));if(!r.ok)throw Error('Missing LCD packet input '+name);return r.json();};
function anatomyGeometry(original,definition){
 const geometry=original.clone(),index=original.index;if(!index||definition.triangleMaterial.length!==index.count/3)throw Error('Native TE triangle/material provenance differs');
 const order=[];geometry.clearGroups();let offset=0;
 for(let material=0;material<3;material++){const start=order.length;for(let i=0;i<definition.triangleMaterial.length;i++)if(definition.triangleMaterial[i]===material){order.push(index.getX(i*3),index.getX(i*3+1),index.getX(i*3+2));}geometry.addGroup(start,order.length-start,material);offset+=order.length-start;}
 if(offset!==index.count)throw Error('A native triangle was dropped');geometry.setIndex(order);geometry.setDrawRange(0,index.count);geometry.computeBoundingBox();geometry.computeBoundingSphere();return geometry;
}
function setRootPose(root,mesh,matrix){root.updateWorldMatrix(true,false);mesh.parent.updateWorldMatrix(true,false);const parentRoot=root.matrixWorld.clone().invert().multiply(mesh.parent.matrixWorld),local=parentRoot.invert().multiply(matrix);local.decompose(mesh.position,mesh.quaternion,mesh.scale);mesh.matrix.copy(local);mesh.matrixAutoUpdate=false;mesh.matrixWorldNeedsUpdate=true;}
// This consumer deliberately does not remove/replace native PCB illustration
// component13. The parent owns that explicit, reversible geometry transaction.
export async function createNativeLcdPacket({root,parent=root,calibration,anatomy,loadScene=async url=>(await new GLTFLoader().loadAsync(url)).scene}={}){
 if(!root?.isObject3D||!parent?.isObject3D)throw Error('Supply the actual printer root and packet parent');
 calibration??=await json('calibration.json');anatomy??=await json('anatomy-materials.json');
 if((calibration.referenceCalibration!==true&&calibration.privateEvaluationOnly!==true)||calibration.plugSKUConfirmed!==false)throw Error('An explicit reference calibration is required');
 const group=new T.Group();group.name='calibrated LCD connector reference';parent.add(group);const records=[],materials=[new T.MeshStandardMaterial({color:'#a82d22',roughness:.5,metalness:0}),new T.MeshStandardMaterial({color:'#bfc4ca',roughness:.29,metalness:.8}),new T.MeshStandardMaterial({color:'#666d75',roughness:.65,metalness:0})];materials.forEach((m,i)=>m.name=['identified red resin','identified contact metal; socket finish provisional','unresolved native surface'][i]);
 for(const[role,part,key]of[['socket','9-338069-4','rootFromSocketNativeMM'],['plug','2-215083-4','rootFromPlugNativeMM']]){
  const scene=await loadScene(assetURL(part+'.glb',sourceBase).href),meshes=[];scene.updateMatrixWorld(true);scene.traverse(m=>{if(m.isMesh)meshes.push(m);});if(meshes.length!==1||!meshes[0].matrixWorld.equals(new T.Matrix4()))throw Error('Retained raw TE GLB node calibration changed');
  const original=meshes[0].geometry,mesh=new T.Mesh(anatomyGeometry(original,anatomy.parts[part]),materials);const sourceKind=anatomy.parts[part].sourceKind??'manufacturer-cad-derived';mesh.name='LCD '+role+' reference '+part;mesh.userData={part:'lcd-native-packet',role,manufacturerCandidate:part,sourceKind,referenceCalibration:true,privateEvaluationOnly:sourceKind!=='independently-authored-analytic',plugSKUConfirmed:false,sourceGLB:assetURL(part+'.glb',sourceBase).href,allSourceTriangles:true};if(sourceKind!=='independently-authored-analytic')mesh.userData.allNativeTriangles=true;group.add(mesh);const seated=MM(calibration[key]);setRootPose(root,mesh,seated);records.push({role,part,mesh,originalGeometry:original,seatedRootFromMeshM:seated});
 }
 const moving=records.filter(r=>r.role==='plug'),socket=records.find(r=>r.role==='socket'),binding=bindRootPacketMeshes({root,parts:moving,side:'freeSource'});let active=true;
 const api={kind:'calibrated-lcd-moving-plug-fixed-socket',sourceKind:records.every(r=>r.mesh.userData.sourceKind==='independently-authored-analytic')?'independently-authored-analytic':'manufacturer-cad-derived',privateEvaluationOnly:records.some(r=>r.mesh.userData.privateEvaluationOnly),group,records,meshes:records.map(r=>r.mesh),movingParts:moving,fixedSocket:socket.mesh,calibration,apply(pose){if(!active)throw Error('LCD packet consumer disposed');const a=pose?.freeSource?.rootDeltaFromSeatedMM;if(!a||a.length!==16||!a.every(Number.isFinite))throw Error('Missing finite source root delta');const m=new T.Matrix4().fromArray(a),x=new T.Vector3().setFromMatrixColumn(m,0),y=new T.Vector3().setFromMatrixColumn(m,1),z=new T.Vector3().setFromMatrixColumn(m,2);if(Math.abs(m.determinant()-1)>1e-6||[x,y,z].some(v=>Math.abs(v.length()-1)>1e-6)||Math.max(Math.abs(x.dot(y)),Math.abs(y.dot(z)),Math.abs(z.dot(x)))>1e-6)throw Error('Packet root delta must be rigid, without scale/shear');binding.apply(pose);},restore(){if(active)binding.restore();},dispose(){if(!active)return;binding.restore();active=false;group.removeFromParent();for(const r of records)r.mesh.geometry.dispose();for(const m of materials)m.dispose();},get active(){return active;},ownership:'Only this new group/geometry/materials; original native source, socket pose, PCB illustration and R11 ribbon are not rewritten. Parent owns viewer registration/visibility and exact component13 replacement.'};return api;
}

export function describeComponent13Replacement(viewer,{boundsMM,epsilonMM=.00006}={}){
 if(!boundsMM||boundsMM.length!==6)throw Error('Supply exact source component13 box bounds');const root=viewer.printer,rows=[];root.updateWorldMatrix(true,false);const inv=root.matrixWorld.clone().invert(),v=new T.Vector3();
 for(const mesh of viewer.meshes.filter(m=>m.userData.illustration&&m.userData.part==='xBuddy'&&['xBuddy / orange','xBuddy / photo'].includes(m.name))){mesh.updateWorldMatrix(true,false);const matrix=inv.clone().multiply(mesh.matrixWorld),g=mesh.geometry,p=g.attributes.position,ix=g.index,ids=[];
  for(let i=0;i<(ix?.count??p.count);i+=3){const triangle=[];for(let j=0;j<3;j++)triangle.push(v.fromBufferAttribute(p,ix?ix.getX(i+j):i+j).applyMatrix4(matrix).multiplyScalar(1000).toArray());const inside=triangle.every(q=>q.every((x,k)=>x>=boundsMM[k]-epsilonMM&&x<=boundsMM[k+3]+epsilonMM)),face=Array.from({length:6},(_,k)=>triangle.every(q=>Math.abs(q[k%3]-boundsMM[k])<=epsilonMM)).some(Boolean);if(inside&&face)ids.push(i/3);}
  if(ids.length)rows.push({mesh,geometryReference:g,meshName:mesh.name,sourceVertexCount:p.count,triangleIndices:ids});
 }
 const count=rows.reduce((n,r)=>n+r.triangleIndices.length,0);return{kind:'proposed-component13-only-replacement',complete:count===12,sourceComponent:13,rows,triangleCount:count,applied:false,ownership:'Parent may replace exactly these12 source illustration box triangles after checking geometry identity/provenance; two merged meshes also contain unrelated components and must never be removed wholesale. Source board/photo and native CAD remain. No mutation is performed here.'};
}
