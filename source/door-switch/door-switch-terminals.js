import * as T from 'three';
import {doorSwitchFrame} from './door-switch-source.js';

// Wire colours and the separate blue resistor follow the prepared assembly
// photograph. The resistor is deliberately unmarked: its value is not given
// by this guide. Dimensions below describe an authored display reference.
export const DOOR_TERMINAL_REFERENCE={
 source:'https://help.prusa3d.com/guide/how-to-replace-the-door-sensor-core-one_458290#834305',
 photo:'https://help.prusa3d.com/wp-content/uploads/2025/01/225555acb7b67ba53d136f2eae2253b6_painted.jpeg',
 terminals:{C:[5,-3.55,0],NO:[5,5.45,0],NC:[5,12.45,0]},
 colours:{C:'#ece8dd',NO:'#73503d'},resistorValue:null,
 wireRadiusMM:.42,jacketRadiusMM:1,
 qualification:'Photo-guided original wire/heat-shrink/resistor illustration. Switch terminal positions use the complete registered source; gauges and unmarked resistor envelope are approximate. NC is unused. This is the sensor-end portion, not a separate complete cable.'
};
const V=p=>new T.Vector3(...p);
export function makeDoorSwitchTerminals({frame=doorSwitchFrame(),sourceEndMM=[-185,-191,363]}={}){
 const inverse=frame.basis.clone().transpose(),start=V(sourceEndMM).sub(frame.originMM).applyMatrix4(inverse),joint=V([6,-4,-7.5]);
 const transform=frame.basis.clone().setPosition(frame.originMM).premultiply(new T.Matrix4().makeScale(.001,.001,.001)),meshes=[];
 const material=(color,metalness=0)=>{const m=new T.MeshStandardMaterial({color,roughness:metalness?.4:.75,metalness});m.userData.originalColor=m.color.clone();m.userData.originalOpacity=1;return m;};
 const mats={jacket:material('#292c2b'),white:material(DOOR_TERMINAL_REFERENCE.colours.C),brown:material(DOOR_TERMINAL_REFERENCE.colours.NO),metal:material('#b5b8b5',.7),blue:material('#567d9f')};
 const add=(geometry,mat,name)=>{geometry.applyMatrix4(transform);const mesh=new T.Mesh(geometry,mat);mesh.userData={cadName:name,reference:true,geometryOrigin:'original photo-guided terminal illustration',source:DOOR_TERMINAL_REFERENCE.source,preserveColours:true};meshes.push(mesh);return mesh;};
 const tube=(points,radius,mat,name)=>{const curve=new T.CatmullRomCurve3(points.map(V),false,'centripetal');curve.arcLengthDivisions=512;const geometry=new T.TubeGeometry(curve,64,radius,12,false);add(geometry,mat,name);return curve;};
 // Reach the exposed edge outside the case. Do not connect the former
 // jacket start to the terminal by a straight line through the housing.
 const j=joint.toArray();tube([start.toArray(),[3,-4,-7.4],j],1,mats.jacket,'Door sensor cable jacket transition');
 const white=tube([j,[6,-4,-5],[6,-3.55,-2],[5.3,-3.55,0],[5,-3.55,0]],.42,mats.white,'White wire · C');
 const brown=tube([j,[6.5,-1,-6.6],[6.5,3.5,-3.2],[6.3,5.45,-1],[5.3,5.45,0],[5,5.45,0]],.42,mats.brown,'Brown wire · NO');
 // Distinct insulated sleeves and solder joints remain separate from the
 // source terminal faces; the third terminal has no invented wire.
 for(const [name,y,wire]of [['C',-3.55,white],['NO',5.45,brown]]){
  const L=wire.getLength(),u0=1-2.7/L,u1=1-.65/L,sleeve=new T.Curve();sleeve.getPoint=(u,out=new T.Vector3())=>wire.getPointAt(u0+(u1-u0)*u,out);
  add(new T.TubeGeometry(sleeve,24,.61,12,false),mats.jacket,'Black sleeve · '+name);
  const solder=new T.SphereGeometry(.56,12,8);solder.scale(.8,1,1);solder.translate(5.08,y,0);add(solder,mats.metal,'Solder joint · '+name);
 }
 tube([[5,-3.55,0],[5.7,-3.3,0],[5.7,-1.55,0]],.18,mats.metal,'Resistor lead · C');
 tube([[5.7,3.45,0],[5.7,5.2,0],[5,5.45,0]],.18,mats.metal,'Resistor lead · NO');
 const body=new T.CylinderGeometry(.85,.85,5,12,1);body.translate(5.7,.95,0);add(body,mats.blue,'Blue resistor · value unspecified');
 let disposed=false;return {meshes,reference:DOOR_TERMINAL_REFERENCE,wireLengthsMM:{C:white.getLength(),NO:brown.getLength()},sourceEndMM:[...sourceEndMM],dispose(){if(disposed)return;disposed=true;for(const m of meshes){m.removeFromParent();m.geometry.dispose();}for(const m of Object.values(mats))m.dispose();}};
}
