import * as T from 'three';
import {CABLES} from './fastener-data.js?v=20261111-94';

// The free LoveBoard assembly needs the jacket beside the channel mouth too.
// Retain the exact last rings of the installed loom, including their normals.
export function createBenchMainSleeve(){
 const d=CABLES.find(d=>d.id==='mainSleeve'),samples=d.samples||256;
 const curve=new T.CatmullRomCurve3(d.points.map(p=>new T.Vector3(...p).multiplyScalar(.001)),false,'centripetal');
 curve.arcLengthDivisions=Math.max(200,samples*4);curve.updateArcLengths();
 const first=Math.max(0,Math.floor((1-.07/curve.getLength())*samples));
 const full=new T.TubeGeometry(curve,samples,d.radius*.001,8,false),source=full.toNonIndexed(),geometry=new T.BufferGeometry();
 for(const name of ['position','normal'])geometry.setAttribute(name,new T.BufferAttribute(source.attributes[name].array.slice(first*8*6*3),3));
 full.dispose();source.dispose();geometry.computeBoundingBox();geometry.computeBoundingSphere();
 const mesh=new T.Mesh(geometry,new T.MeshStandardMaterial({color:d.color,roughness:.72,metalness:.05,side:T.DoubleSide}));
 mesh.castShadow=true;mesh.userData={part:'benchMainSleeve',cadName:d.name,supplement:true,toolOnly:true,workspaceOnly:'loveboard',geometryRole:'benchSleeve',sourceFirstRing:first};
 return mesh;
}
