import * as T from 'three';
import {TIES} from './fastener-data.js';
import {ORIGINAL_TENSIONER_DATUMS as D} from './original-tensioner-source.js';
// All parts are ordinary resources of the existing full viewer. No late owner
// or dispose wrapper, no native replacement, no borrowed-geometry mutation.
export function createOriginalTensionerParts(viewer){
 const meshes=[],owned=[];
 try{
  for(const side of ['left','right'])for(const solid of[0,1,2]){
   const source=viewer.meshes.find(m=>m.userData.part==='carriageIdlerL1'&&m.userData.sourceSolid===solid);if(!source)throw Error('Missing whole official idler solid '+solid);
   const mesh=new T.Mesh(source.geometry,source.material.clone());mesh.position.fromArray(D[side].idlerCentre).multiplyScalar(.001);mesh.userData={part:'xy',component:'originalTensionerIdler-'+side,componentOnly:true,sourceSolid:solid,originalTensionerOwnerCAD:D[side].body,cadName:side+' belt tensioner GT2-20 / solid '+(solid+1),preserveCadName:true,assemblyPrimitive:'original-tensioner-assembly',officialProductIDS:2245,geometrySource:source.userData.officialSource,geometryQualification:'Whole existing Pulley-A10 three-solid library. Original/Plus common-spare correspondence; no Gen2 identity.'};meshes.push(mesh);
  }
  const template=viewer.fasteners.entities.get('bundle1'),def=TIES.find(d=>d.id==='bundle1');if(!template||!def)throw Error('Existing whole reference tie required');
  const tie=new template.constructor({...def,id:'originalTensionerApplicator',p:[0,0,0],u:[1,0,0],v:[0,1,0],length:100});tie.update(0,0,0);owned.push(tie.geometry);
  const p=tie.geometry.attributes.position,tip=new T.Vector3();for(let i=0;i<8;i++)tip.add(new T.Vector3().fromBufferAttribute(p,192*8+i));tip.multiplyScalar(1/8);tie.geometry.translate(-tip.x,-tip.y,-tip.z);tie.geometry.rotateX(-Math.PI/2);
  const mesh=tie.mesh;mesh.position.fromArray(D.applicatorRest).multiplyScalar(.001);mesh.userData={part:'xy',component:'originalTensionerApplicator',componentOnly:true,toolOnly:true,preserveCadName:true,cadName:'Whole cable tie used as grease applicator',assemblyPrimitive:'original-tensioner-assembly',reference:true,sourceStock:'Existing full FlexibleTie geometry,100mm strip2.4x0.5mm plus complete lock; uncut state0',materialLengthMM:100,qualification:'Optional source-listed applicator. Existing authored stock reference, not manufacturerCAD or a lubricant/fluid/force model. No original tie entity or stock is moved.'};meshes.push(mesh);
  const keyGeometry=createAllenReferenceGeometry();owned.push(keyGeometry);
  for(const [id,component]of[[436,'originalAllenLeft30'],[438,'originalAllenRight30'],[412,'originalAllenLeft18'],[418,'originalAllenRight18'],[399,'originalAllenDoor12']]){
   const source=viewer.meshes.find(m=>m.userData.cadIndex===id);if(!source)throw Error('Missing complete source screw '+id);source.updateMatrix();
   const f=D.screws[id],point=new T.Vector3();point.setComponent(f.socketAxis,(f.headLocalMM+f.engagementMM)*.001);point.applyMatrix4(source.matrix);
   const basis=f.socketAxis===0?new T.Matrix4().makeBasis(new T.Vector3(0,1,0),new T.Vector3(1,0,0),new T.Vector3(0,0,-1)):new T.Matrix4().makeBasis(new T.Vector3(1,0,0),new T.Vector3(0,0,1),new T.Vector3(0,-1,0));
   const key=new T.Mesh(keyGeometry,new T.MeshStandardMaterial({color:0x555b5c,metalness:.72,roughness:.33}));key.position.copy(point);key.quaternion.copy(source.quaternion).normalize().multiply(new T.Quaternion().setFromRotationMatrix(basis));key.userData={part:'xy',component,componentOnly:true,toolOnly:true,preserveCadName:true,cadName:'2.5 mm Allen key',assemblyPrimitive:'original-tensioner-assembly',reference:true,officialToolSource:'https://help.prusa3d.com/guide/5-corexy-assembly_835522#843214',officialToolLineID:852302,sourceScrewCAD:id,acrossFlatsMM:2.5,qualification:D.allenReference.dimensionsQualification,stockRepresentation:D.allenReference.representation,workingEnd:'Complete plain short leg; rounded long end is retained outside the socket',sourceSocketEngagementMM:f.engagementMM};meshes.push(key);
  }
  return meshes;
 }catch(error){for(const g of owned)g.dispose();for(const m of meshes)m.material.dispose();throw error;}
}

// Complete authored nominal reference. Official photograph852169 shows the
// supplied L-shaped2.5mm key with a rounded long end. Only2.5mm AF is specified
// by the guide; arm/bend/rounded-end dimensions are declared reference values.
export function createAllenReferenceGeometry(){
 const s=D.allenReference,r=s.bendRadiusMM,R=s.acrossFlatsMM/Math.sqrt(3),rings=[];
 const add=(x,y,tx,ty,k=1)=>rings.push({x,y,tx,ty,k});
 add(0,0,0,-1);add(0,-(s.shortLegMM-r),0,-1);
 for(let i=1;i<=24;i++){const a=Math.PI+i*Math.PI/48;add(r+r*Math.cos(a),-(s.shortLegMM-r)+r*Math.sin(a),-Math.sin(a),Math.cos(a));}
 add(75,-s.shortLegMM,1,0);
 for(const[x,k]of[[76,.96],[77,.68],[77.7,.68],[78.4,.94],[79,1],[79.5,.84],[79.8,.53],[80,.15]])add(x,-s.shortLegMM,1,0,k);
 const vertices=[],indices=[];
 for(const p of rings)for(let j=0;j<6;j++){const a=Math.PI/6+j*Math.PI/3,c=Math.cos(a)*R*p.k,z=Math.sin(a)*R*p.k;vertices.push((p.x-p.ty*c)*.001,(p.y+p.tx*c)*.001,z*.001);}
 for(let i=0;i<rings.length-1;i++)for(let j=0;j<6;j++){const n=(j+1)%6,a=i*6+j,b=i*6+n,c=(i+1)*6+j,d=(i+1)*6+n;indices.push(a,b,c,b,d,c);}
 for(const[first,k]of[[true,0],[false,rings.length-1]]){const p=rings[k],centre=vertices.length/3;vertices.push(p.x*.001,p.y*.001,0);for(let j=0;j<6;j++){const a=k*6+j,b=k*6+(j+1)%6;indices.push(...(first?[centre,b,a]:[centre,a,b]));}}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.setIndex(indices);const flat=g.toNonIndexed();g.dispose();flat.computeVertexNormals();flat.computeBoundingBox();flat.computeBoundingSphere();return flat;
}
