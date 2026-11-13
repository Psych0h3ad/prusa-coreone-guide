import * as T from 'three';
import {LOVEBOARD,SOCKETS,boardPoint} from './loveboard-layout.js?v=20261111-94';
// Source X is the row, Y is the mating axis, Z is the latch side.
// Retained assembly contact planes: vertical Y=9.7, RA Z=-0.29.
// In-plane board placement is registered to the available board photograph.
export function molexSocketFrame(id){
 const s=SOCKETS[id],[l,t,r,b]=s.rect,p=boardPoint((l+r)/2,(t+b)/2),oy=LOVEBOARD.datumCAD[1];
 if(s.out[1])return new T.Matrix4().set(0,0,-1,p[0]+2.41,0,1,0,oy-9.7,1,0,0,p[2],0,0,0,1);
 if(s.out[0])return new T.Matrix4().set(0,-1,0,boardPoint(r,0)[0]+2.4,0,0,-1,oy-.29,1,0,0,p[2],0,0,0,1);
 return new T.Matrix4().set(-1,0,0,p[0],0,0,-1,oy-.29,0,-1,0,boardPoint(0,t)[2]+2.4,0,0,0,1);
}
export function molexWireEntry(id){return new T.Vector3(0,0,1.25).applyMatrix4(molexSocketFrame(id));}
