import * as T from 'three';
import {createReleaseSkin} from './clik-mate-release-skin.js?v=20261114-137';
import {molexCad} from './molex-cad.js?v=20261111-94';

// Unpressed housing uses the selected full single-row asset, in millimetres. The canonical
// origin is the wire-entry row (native Z=1.25). Native +Y is insertion and
// native +Z faces the latch; the returned cable frame uses +Z for insertion.
// Elastic travel below is an explanatory deformation, not a force simulation.
export function createClikMatePlug(pins){
 if(![2,3,4].includes(pins))throw Error('Unsupported single-row CLIK-Mate');
 const part='5025780'+pins+'00',cad=molexCad(part),skin=createReleaseSkin(cad,pins),{positions,normals,pressedPositions,pressedNormals}=skin;
 return {positions,normals,pressedPositions,pressedNormals,pins,pitch:1.5,width:pins*1.5+4.3,length:8.6,thickness:6.1,locks:1,manufacturerPart:part,officialSource:'https://www.molex.com/en-us/products/part-detail/'+part,releaseSkin:skin,geometryOrigin:cad.geometryOrigin,manufacturerCAD:cad.manufacturerCAD,sourceMeshSHA256:cad.meshSha256,sourceMeshTriangles:cad.vertices/3,preferredSource:cad.preferredSource};
}
const ease=x=>{const u=T.MathUtils.clamp(x,0,1);return u*u*(3-2*u);};
// A reversible path: release the lock with the housing stationary, then pull.
// Insertion follows the same path backwards, letting the tongue spring back
// only after the housing is seated. Non-connector routing retains its timing.
export function clikMateMotion(from,to,t){
 const u=T.MathUtils.clamp(t,0,1),connecting=from!==to&&((from===1&&to<1)||(to===1&&from<1));
 if(!connecting)return {amount:T.MathUtils.lerp(from,to,ease(u)),press:0,phase:'idle'};
 const q=from===1?u:1-u,other=from===1?to:from;
 return {amount:T.MathUtils.lerp(1,other,ease((q-.18)/.82)),press:ease(q/.18),phase:q<=.18?(from===1?'unlock':'lock'):(from===1?'withdraw':'insert')};
}
export function clikMatePress(motion,clearance){return motion.press*(1-T.MathUtils.smoothstep(clearance,3.3,4.5));}
