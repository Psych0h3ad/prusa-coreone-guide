import * as T from 'three';
import {smoothCreases} from './surface-geometry.js?v=20261111-94';

// The source assembly omits the spacer. Its 6 × 3.1 × 8 mm dimensions come
// from the official kit parts list. The first swivel screw is CAD node 810;
// node 802 belongs to the Idler-nut pivot fitted in the following step.
export const SWIVEL_SPACER={outerDiameter:6,innerDiameter:3.1,length:8,centre:[-23.793938366273707,-58.495377681496465,414.07792324955244]};
export function createIdlerSwivelSpacer(){
 const s=SWIVEL_SPACER,r=s.innerDiameter/2,R=s.outerDiameter/2,h=s.length/2;
 const g=new T.LatheGeometry([[r,-h],[R,-h],[R,h],[r,h],[r,-h]].map(([x,y])=>new T.Vector2(x,y)),96);
 g.translate(...s.centre);g.scale(.001,.001,.001);smoothCreases(g);
 const material=new T.MeshStandardMaterial({color:'#b7b9b7',metalness:.8,roughness:.3});
 const mesh=new T.Mesh(g,material);mesh.castShadow=true;mesh.receiveShadow=true;
 mesh.userData={part:'head',component:'idlerSwivelSpacer',supplement:true,cadName:'Spacer 6×3.1×8'};
 return mesh;
}
