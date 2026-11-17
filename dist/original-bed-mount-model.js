import * as T from 'three';
import{FLOWS}from'./data.js?v=20261112-113';
import{loadOriginalBedBearings}from'./original-bed-mount-bearing.js';
import{ORIGINAL_BED_MOUNT as D}from'./original-bed-mount-data.js';
// These are ten additional source-listed whole M3nN items, not ten copies of
// the already-installed electrical nuts. The complete753 shell+nylon CAD is
// reused literally. Each oldDIN934 is an exclusive full-part placeholder for
// one source-listed item, only in the Original2251 graph.
export async function createOriginalBedMountParts(meshes,{isCurrent=()=>true}={}){
 if(FLOWS.build?.manualID!==D.manualID)return [];
 if(!isCurrent())throw new DOMException('Original bed preparation stopped','AbortError');
 const parts=[],materials=[],donorsByCAD=new Map();
 for(const spec of Object.values(D.donors)){const donors=meshes.filter(m=>m.userData.cadIndex===spec.cadIndex);if(donors.length!==spec.solids.length)throw Error('Complete native hardware donor required');
  const ordered=spec.solids.map(s=>{const m=donors.find(m=>(m.geometry.index?.count??m.geometry.attributes.position.count)/3===s.faces);if(!m)throw Error('Whole native hardware solid missing');m.updateMatrix();if(!m.matrix.elements.every((v,i)=>v===s.expectedMatrix[i]))throw Error('Native hardware source frame changed');return m;});donorsByCAD.set(spec.cadIndex,ordered);
 }
 const placeholders=D.registrations.map(r=>{const matches=meshes.filter(m=>m.userData.cadIndex===r.retiredPlainNutCAD);if(matches.length!==1||(matches[0].geometry.index?.count??matches[0].geometry.attributes.position.count)/3!==734)throw Error('Whole single nativeDIN934 counterpart required');return matches[0];});
 const attachments=D.nativeAttachments.map(r=>{const m=meshes.find(m=>m.userData.cadIndex===r.cadIndex);if(!m||(m.geometry.index?.count??m.geometry.attributes.position.count)/3!==2648)throw Error('Whole nativeM3x10 attachment required');return m;});
 try{
  parts.push(...await loadOriginalBedBearings(donorsByCAD.get(753)[0].material,{isCurrent}));
  if(!isCurrent())throw new DOMException('Original bed preparation stopped','AbortError');
  for(const r of D.registrations){const ordered=donorsByCAD.get(r.sourceDonorCAD),spec=D.donors[r.sourceDonorCAD],rigid=r.rotationMatrix3?new T.Matrix4().set(...r.rotationMatrix3[0],0,...r.rotationMatrix3[1],0,...r.rotationMatrix3[2],0,0,0,0,1):new T.Matrix4().makeRotationZ(r.rotationZRadians);rigid.setPosition(...r.translationMM.map(x=>x*.001));
   for(let i=0;i<ordered.length;i++){
    const source=ordered[i],material=source.material.clone();materials.push(material);const m=new T.Mesh(source.geometry,material);rigid.clone().multiply(source.matrix).decompose(m.position,m.quaternion,m.scale);
    m.userData={part:'bedSupport',component:r.component,componentOnly:true,cadPath:[],cadName:r.materialStock+' / '+r.component+' / '+(i?'nylon':'shell'),preserveCadName:true,originalBedMountComponent:true,originalBedMountOwner:r.ownerCAD,retiredSourceCounterpart:r.retiredPlainNutCAD,sourceCAD:r.sourceDonorCAD,sourceSolid:i,sourceFaces:spec.solids[i].faces,materialStock:r.materialStock,manualID:2251,assemblyPrimitive:'original-bed-mount399',geometryProvenance:'Literal whole existing native hardware; rigid source-listed stock instance and actual printed-seat registration. Geometry/scale/caps not reduced.'};m.castShadow=true;m.receiveShadow=true;parts.push(m);
   }
  }
  placeholders.forEach((m,i)=>{m.userData.originalBedMountReplacedBy=D.registrations[i].component;});
  attachments.forEach((m,i)=>{m.userData.originalBedMountAttachedTo=D.nativeAttachments[i].ownerCAD;});
  return parts;
 }catch(e){const geometries=new Set(parts.filter(m=>m.userData.materialStock==='LM8UU').map(m=>m.geometry));for(const g of geometries)g.dispose();for(const m of parts)if(!materials.includes(m.material))m.material.dispose();for(const m of materials)m.dispose();throw e;}
}
export function originalBedMountVariant(mesh,isOriginal){
 if(mesh.userData.originalBedMountComponent)return isOriginal;
 if(mesh.userData.originalBedMountReplacedBy)return !isOriginal;
 return true;
}
export function originalBedMountCarry(meshes,nodes,owner,isOriginal){
 if(!isOriginal)return nodes;
 const attached=meshes.filter(m=>(m.userData.originalBedMountComponent||m.userData.originalBedMountAttachedTo)&&owner.has(m)&&nodes.some(body=>body.userData.cadIndex===(m.userData.originalBedMountOwner??m.userData.originalBedMountAttachedTo)&&owner.get(body)===owner.get(m)));
 return [...new Set([...nodes,...attached])];
}
