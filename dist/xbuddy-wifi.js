import * as T from 'three';
import {XBUDDY_WIFI_RECEPTACLE as RECEPTACLE,XBUDDY_BOARD_ORIGIN}from './xbuddy-layout.js?v=20261111-94';
import {splitTop,smoothCreases}from './surface-geometry.js?v=20261111-94';
const mm=.001;

// Supplemental illustration. Only the module envelope has published dimensions;
// the carrier and connectors are registered to official photographs/CAD interfaces.
export async function createXbuddyWifi(){
 const response=await fetch('./assets/electronics/wifi.json');if(!response.ok)throw Error('Wi-Fi source unavailable');const data=await response.json(),meshes=[];
 const texture=await new T.TextureLoader().loadAsync(data.texture);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=8;
 const mats={pcb:new T.MeshStandardMaterial({color:'#252a2b',roughness:.83}),blue:new T.MeshStandardMaterial({color:'#126676',roughness:.7}),ivory:new T.MeshStandardMaterial({color:'#e9dfc5',roughness:.66}),dark:new T.MeshStandardMaterial({color:'#232729',roughness:.75}),metal:new T.MeshStandardMaterial({color:'#b8babc',metalness:.78,roughness:.32}),gold:new T.MeshStandardMaterial({color:'#c4a360',metalness:.7,roughness:.38}),photo:new T.MeshBasicMaterial({map:texture,toneMapped:false})};
 const [X,Y,Z]=data.origin,M=new T.Matrix4().set(0,0,mm,X*mm,mm,0,0,Y*mm,0,-mm,0,Z*mm,0,0,0,1);
 function add(g,mat,component,photoH){
  if(photoH){const p=g.attributes.position,uv=new Float32Array(p.count*2),H=photoH;for(let i=0;i<p.count;i++){const u=p.getX(i),v=p.getY(i),d=H[2][0]*u+H[2][1]*v+H[2][2];uv[i*2]=(H[0][0]*u+H[0][1]*v+H[0][2])/d/1024;uv[i*2+1]=1-(H[1][0]*u+H[1][1]*v+H[1][2])/d/1024;}g.setAttribute('uv',new T.BufferAttribute(uv,2));}
  if(component.startsWith('radio'))g.translate(...data.registration.moduleOffset_uv,0);
  g.applyMatrix4(M);
  // Photo right/down axes reflect the CAD frame. Keep the outward face winding.
  if(g.index){const a=g.index.array;for(let i=0;i<a.length;i+=3)[a[i+1],a[i+2]]=[a[i+2],a[i+1]];}
  else for(const a of Object.values(g.attributes))for(let i=0;i<a.count;i+=3)for(let k=0;k<a.itemSize;k++){const j=(i+1)*a.itemSize+k,l=(i+2)*a.itemSize+k;[a.array[j],a.array[l]]=[a.array[l],a.array[j]];}
  g.computeBoundingBox();g.computeBoundingSphere();const m=new T.Mesh(g,mats[mat]);m.name='Wi-Fi / '+component;m.userData={part:'xbWifi',component,cadName:'Wi-Fi adapter',toolOnly:true,serviceTask:'xbuddy',illustration:true};m.castShadow=mat!=='photo';m.receiveShadow=false;meshes.push(m);return m;
 }
 function box(u0,v0,u1,v1,h0,h1,mat,component,photoH){const g=new T.BoxGeometry(u1-u0,v1-v0,h1-h0);g.translate((u0+u1)/2,(v0+v1)/2,(h0+h1)/2);if(photoH){const s=splitTop(g);add(s.body,mat,component);add(s.top,'photo',component,photoH);}else add(g,mat,component);}
 function ring(u,v,r,inner,h0,h1,mat,component){const s=new T.Shape();s.absarc(u,v,r,0,Math.PI*2,false);const hole=new T.Path();hole.absarc(u,v,inner,0,Math.PI*2,true);s.holes.push(hole);const g=new T.ExtrudeGeometry(s,{depth:h1-h0,bevelEnabled:false,curveSegments:32});g.translate(0,0,h0);add(smoothCreases(g),mat,component);}
 const outline=new T.Shape(data.outline.map(p=>new T.Vector2(...p)));for(const [u,v,r]of data.holes){const h=new T.Path();h.absarc(u,v,r,0,Math.PI*2,true);outline.holes.push(h);}
 const pcb=new T.ExtrudeGeometry(outline,{depth:data.thickness,bevelEnabled:false,curveSegments:32});pcb.translate(0,0,-data.thickness);const surfaces=splitTop(pcb);add(surfaces.body,'pcb','carrier');add(surfaces.top,'photo','carrier',data.photoHomography);
 const [hu,hv,hr]=data.holes[0];ring(hu,hv,3.45,hr,-data.thickness-.15,.75,'metal','mountingEyelet');
 box(0,0,20,18,0,.8,'blue','radioSubstrate');box(.9,1.15,13.2,16.85,.8,3.2,'metal','radioShield',data.shieldHomography);
 for(const v of [0,18])for(let i=0;i<9;i++)box(.45+i*1.5,v===0?0:17.1,1.35+i*1.5,v===0?.9:18,.8,.86,'gold','radioPads');
 function socket(u,v,rightAngle){
  const w=13.3,d=6.4,h=rightAngle?5.3:7.1,t=.65;
  box(u-w/2,v-d/2,u+w/2,v+d/2,0,.7,'ivory','auxSocket');
  box(u-w/2,v-d/2,u-w/2+t,v+d/2,.7,h,'ivory','auxSocket');box(u+w/2-t,v-d/2,u+w/2,v+d/2,.7,h,'ivory','auxSocket');
  box(u-w/2+t,v+d/2-t,u+w/2-t,v+d/2,.7,h,'ivory','auxSocket');
  if(rightAngle)box(u-w/2+t,v-d/2,u+w/2-t,v+d/2-t,h-t,h,'ivory','auxSocket');else box(u-w/2+t,v-d/2,u+w/2-t,v-d/2+t,.7,h,'ivory','auxSocket');
  for(let i=0;i<6;i++){const q=u+(i-2.5)*2;box(q-.2,v-.25,q+.2,v+.25,.7,rightAngle?3.5:5.3,'gold','auxPins');}
 }
 // The left opening is fixed by the source cover aperture, not the raised
 // connector's apparent position in the oblique product photograph.
 socket(171.25-Y,Z-82.01,false);socket(187-Y,Z-82.01,true);
 // Right-angle eight-pin coupling through the original case side aperture.
 const yc=168.52172,zc=80.78846;
 box(yc-Y-3.1,Z-zc-5.1,yc-Y+3.1,Z-zc+5.1,-8.6,-data.thickness,'dark','boardCoupling');
 for(const height of RECEPTACLE.rows)for(let i=0;i<4;i++){const y=XBUDDY_BOARD_ORIGIN[1]+height,z=XBUDDY_BOARD_ORIGIN[2]-RECEPTACLE.centreV+(i-1.5)*RECEPTACLE.pitch,r=RECEPTACLE.pinSize/2;box(y-Y-r,Z-z-r,y-Y+r,Z-z+r,-15.5,-8.6,'gold','boardPins');}
 return {meshes,data};
}
