import * as THREE from 'three';
import {STLLoader} from './vendor/STLLoader.js';
import {smoothCreases} from './surface-geometry.js?v=20261111-94';
import {XY_MOUNT_FRAMES} from './xy-mount-frames.js';
export {XY_MOUNT_FRAMES} from './xy-mount-frames.js';
export const XY_TOOL_SOURCE_FRAME=[132.694,105,13.436903];
export const XY_MOUNT_MEMBERS={right:[559,569,454,422,'xyMountrightLower','xyMountrightUpper','xyMountrightSingle','xyMountRightM3nS'],left:[386,549,452,420,'xyMountleftLower','xyMountleftUpper','xyMountleftSingle']};
export const XY_MOUNT_HARDWARE_SOURCE={original2251:{officialProductIDS:2245,manualBOM:'GT2-20 Idler pulley',geometry:'Existing complete official CORE One L Pulley-A10; shared spare compatibility confirmed by Prusa product2245 for CORE One/+,CORE One L'},plus:{officialProductIDS:2245,geometry:'Same official compatible spare as Original'},gen2:{geometry:'Separate verification required',sourceIDsReusable:true,automaticGeometryAlias:false,reason:'Official2245 compatibility list explicitly excludes CORE One+ (Gen2); motion/source mapping does not prove hardware identity'}};
export async function createXYMountParts(sourceMeshes){
 const meshes=[],ownedGeometry=[],material=new THREE.MeshStandardMaterial({color:0x282b2a,roughness:.7});
 try{
 for(const [side,f]of Object.entries(XY_MOUNT_FRAMES))for(const [suffix,center]of [['Lower',[f.pair[0],f.pair[1],f.pair[2]-5.5]],['Upper',[f.pair[0],f.pair[1],f.pair[2]+5.5]],['Single',f.single]])for(const solid of [0,1,2]){
  const source=sourceMeshes.find(m=>m.userData.part==='carriageIdlerL1'&&m.userData.sourceSolid===solid);if(!source)throw Error('Missing complete official Pulley-A10 solid '+solid);
  const m=new THREE.Mesh(source.geometry,source.material.clone());m.position.fromArray(center).multiplyScalar(.001);
  m.userData={part:'xy',component:`xyMount${side}${suffix}`,componentOnly:true,cadName:`${side} motor-mount pulley ${suffix} / solid ${solid+1}`,preserveCadName:true,sourceSolid:solid,xyMountOwnerCAD:f.mount,officialProductIDS:2245,officialSource:source.userData.officialSource,geometryProvenance:'Exact existing Pulley-A10 complete3-solid CAD; Original/Plus common spare compatibility via official product2245. No Gen2 hardware identity claim.',assemblyPrimitive:'xy-mount-374'};meshes.push(m);
 }
 const stl=await new STLLoader().loadAsync('./assets/xy-mount/assembly-multi-tool-r2.stl');
 ownedGeometry.push(stl);
 stl.translate(...XY_TOOL_SOURCE_FRAME.map(x=>-x));stl.applyMatrix4(new THREE.Matrix4().makeBasis(new THREE.Vector3(0,0,1),new THREE.Vector3(-1,0,0),new THREE.Vector3(0,-1,0)));stl.scale(.001,.001,.001);smoothCreases(stl);
 const tool=new THREE.Mesh(stl,material);tool.position.fromArray(XY_MOUNT_FRAMES.right.pair).multiplyScalar(.001);tool.userData={part:'xy',component:'xyMountAssemblyTool',componentOnly:true,toolOnly:true,cadName:'Assembly Multi Tool R2 (official STL)',preserveCadName:true,officialSource:'https://www.printables.com/model/1167816',officialFileID:5506949,license:'GPL-2.0',assemblyPrimitive:'xy-mount-374'};meshes.push(tool);
 const sourceNut=sourceMeshes.find(m=>m.userData.cadIndex===555);if(!sourceNut)throw Error('Missing native square nut source555');sourceNut.updateMatrix();const nutGeo=sourceNut.geometry.clone().applyMatrix4(sourceNut.matrix);ownedGeometry.push(nutGeo);nutGeo.computeBoundingBox();const c=nutGeo.boundingBox.getCenter(new THREE.Vector3());nutGeo.translate(-c.x,-c.y,-c.z);nutGeo.rotateY(Math.PI/2);
 const nut=new THREE.Mesh(nutGeo,sourceNut.material.clone());nut.position.set(.19720134853,.17924848,.3621004138);nut.userData={part:'xy',component:'xyMountRightM3nS',componentOnly:true,cadName:'Right motor-mount M3nS',preserveCadName:true,nativeGeometrySource:555,xyMountOwnerCAD:559,geometryProvenance:'Additional source-listed M3nS; complete native555 solid rigidly re-instanced, not a second display of native555',officialSource:'https://help.prusa3d.com/guide/5-corexy-assembly_835522#1045914',assemblyPrimitive:'xy-mount-374'};meshes.push(nut);
 const screw=sourceMeshes.find(m=>m.userData.cadIndex===452);if(!screw)throw Error('Missing native long screw452');
 // Root CAD places this head 0.0999873837mm above the annular seat. Retain
 // the complete screw and stock; seat it by the measured rigid axial delta.
 screw.userData.xyMountSourceRestPosition=screw.position.toArray();screw.userData.xyMountSeatDeltaMM=-.09998738369660032;screw.position.z-=.00009998738369660032;
 return meshes;
 }catch(error){for(const g of ownedGeometry)g.dispose();const materials=new Set([material,...meshes.flatMap(m=>Array.isArray(m.material)?m.material:[m.material])]);for(const m of materials)m.dispose();throw error;}
}
