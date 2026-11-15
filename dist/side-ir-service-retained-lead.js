import * as T from'three';
export const SIDE_IR_SIGNAL_JOIN_MM=[170,180,301];
// The existing source prefix starts at an authored waypoint outside the side
// sheet. For this procedure it passes through the actual native66 cable slot.
// Retain its entire fixed stock and the literal remaining jacket, three leads
// and complete manufacturer plug. The original entity is never modified.
export function installSideIRRetainedLead(viewer,add){
 const source=viewer.fasteners.entities.get('sensorWire');
 if(!source?.parts||source.parts.length!==6||source.radius!==1.5)throw Error('Complete side-sensor source harness required');
 const geometry=source.geometry.clone(),sample=Object.create(source);
 sample.geometry=geometry;sample.mesh={userData:{}};sample.update(3,3,1);
 const prefix=source.parts[0],stockMM=source.prefix.getLength(),make=rise=>{const c=new T.CatmullRomCurve3([SIDE_IR_SIGNAL_JOIN_MM,[160,181,301],[154,181,301],[146,181,301],[138,181,295],[128,176,286],[120,174,282.5],[90,174,282.5],[60,174,282.5],[70+rise,180,282.5],[80+rise,180,282.5],[60+rise,190,282.5],[40,190,282.5],[15,180,282.5],source.anchor.toArray()].map(p=>new T.Vector3(...p)),false,'centripetal');c.arcLengthDivisions=1024;return c;};
 if(make(0).getLength()>stockMM)throw Error('Existing side-sensor prefix stock cannot reach cable slot');
 let lo=0,hi=90;for(let i=0;i<32;i++){const mid=(lo+hi)/2;if(make(mid).getLength()<stockMM)lo=mid;else hi=mid;}
 const route=make((lo+hi)/2),tube=new T.TubeGeometry(route,144,source.radius,8,false).toNonIndexed(),position=geometry.attributes.position,normal=geometry.attributes.normal;
 if(tube.attributes.position.count!==prefix.count)throw Error('Side-sensor prefix source range changed');
 for(let i=0;i<prefix.count;i++){for(const[name,attr]of[['position',position],['normal',normal]]){const p=new T.Vector3().fromBufferAttribute(tube.attributes[name],i);if(name==='position')p.multiplyScalar(.001);attr.setXYZ(prefix.start+i,p.x,p.y,p.z);}}
 tube.dispose();position.needsUpdate=normal.needsUpdate=true;geometry.computeBoundingBox();geometry.computeBoundingSphere();geometry.setDrawRange(0,position.count);
 const materials=source.mesh.material.map(m=>{const n=m.clone();n.userData={...m.userData,originalColor:m.color.clone(),originalOpacity:m.userData.originalOpacity??m.opacity};return n;});
 const mesh=add('sideIRRetainedLead',geometry,materials,undefined,{sourcePart:'sensorWire',sourcePrefixRange:{start:prefix.start,count:prefix.count},referencePrefixStockMM:stockMM,prefixRouteLengthMM:route.getLength(),jacketRadiusMM:source.radius,sourceCableOpeningCAD:66,sourceCableOpeningMM:[150,181,301],manufacturerPlug:'5025780300',qualification:'Authored fixed-length prefix routed through complete native66 slot; all source suffix positions/normals and full terminal body retained literally.'});
 return{mesh,source,route,stockMM,prefix};
}
