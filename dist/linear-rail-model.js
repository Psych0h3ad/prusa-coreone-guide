// SPDX-License-Identifier: MIT
import * as T from 'three';
import {LINEAR_RAIL as D} from './linear-rail-data.js';
export async function createLinearRailSafetyPins(){
 const response=await fetch('./assets/linear-rail/safety-pin.bin?v=20261117-200');
 if(!response.ok)throw Error('Rail safety pin unavailable');const buffer=await response.arrayBuffer();
 if(buffer.byteLength!==172800)throw Error('Incomplete rail safety pin');
 const values=buffer.byteLength/8,geometry=new T.BufferGeometry();
 geometry.setAttribute('position',new T.BufferAttribute(new Float32Array(buffer,0,values),3));
 geometry.setAttribute('normal',new T.BufferAttribute(new Float32Array(buffer,values*4,values),3));geometry.scale(.001,.001,.001);
 return [D.left,D.right].map(d=>{
  const m=new T.Mesh(geometry,new T.MeshStandardMaterial({color:'#0baf83',roughness:.66,metalness:0}));
  m.position.set(d.fourthX*.001,(D.frontY-D.pinFaceClearanceMM)*.001,D.centreZ*.001);
  m.userData={part:'xy',component:d.key,componentOnly:true,toolOnly:true,preserveCadName:true,cadName:'Linear rail anti-ejection safety pin',illustration:true,geometryQualification:'Independent split-pin teaching reference, not OEM CAD or a replacement part.'};return m;
 });
}
