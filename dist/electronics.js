import * as T from 'three';
import {bedTerminalBodyReference} from './heatbed-terminal-geometry.js';
import {splitTop,smoothCreases} from './surface-geometry.js?v=20261111-94';
import {registerThermalPad,THERMAL_PAD_FREE_THICKNESS,fittedBoardThickness} from './thermal-pads.js?v=20261111-94';
import {XBUDDY_SENSOR_COMPONENTS,XBUDDY_WIFI_RECEPTACLE as WIFI}from './xbuddy-layout.js?v=20261111-94';

// Supplemental assembly illustrations. Mounting centres use the original CAD;
// footprints use the official manual photos. Heights are illustrative.
export async function createElectronics(){
 const response=await fetch('./assets/electronics/boards.json');
 if(!response.ok)throw Error('基板モデルを読み込めません');
 const {boards}=await response.json(),result=[];
 for(const b of boards){
  const thickness=fittedBoardThickness(b);
  const texture=await new T.TextureLoader().loadAsync(b.texture);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=8;
  const materials={photo:new T.MeshBasicMaterial({map:texture,toneMapped:false}),
   board:new T.MeshStandardMaterial({color:'#252d32',roughness:.82}),
   ivory:new T.MeshStandardMaterial({color:'#e4dbb7',roughness:.65}),
   dark:new T.MeshStandardMaterial({color:'#26282a',roughness:.72}),
   metal:new T.MeshStandardMaterial({color:'#b7babe',metalness:.75,roughness:.34}),
   gold:new T.MeshStandardMaterial({color:'#c4a866',metalness:.7,roughness:.4}),
   orange:new T.MeshStandardMaterial({color:'#d5572b',roughness:.6})};
  const batches=new Map();
  const M=new T.Matrix4().set(-.001,0,0,b.origin[0]/1000,0,0,.001,b.origin[1]/1000,0,-.001,0,b.origin[2]/1000,0,0,0,1);
  function add(geometry,material,photo=false){
   let g=geometry.index?geometry.toNonIndexed():geometry;
   if(photo){const p=g.attributes.position,uv=new Float32Array(p.count*2),[u0,v0,u1,v1]=b.bounds;for(let i=0;i<p.count;i++){uv[2*i]=(p.getX(i)-u0)/(u1-u0);uv[2*i+1]=1-(p.getY(i)-v0)/(v1-v0);}g.setAttribute('uv',new T.BufferAttribute(uv,2));}
   else if(!g.attributes.uv)g.setAttribute('uv',new T.BufferAttribute(new Float32Array(g.attributes.position.count*2),2));
   g.applyMatrix4(M);
   // Photo axes (right/down) reflect the CAD frame; keep outward winding.
   for(const a of Object.values(g.attributes))for(let i=0;i<a.count;i+=3)for(let k=0;k<a.itemSize;k++){const j=(i+1)*a.itemSize+k,l=(i+2)*a.itemSize+k,t=a.array[j];a.array[j]=a.array[l];a.array[l]=t;}
   if(!batches.has(material))batches.set(material,[]);batches.get(material).push(g);
  }
  function box(u0,v0,u1,v1,h0,h1,mat='dark',photoTop=false){
   const g=new T.BoxGeometry(Math.abs(u1-u0),Math.abs(v1-v0),h1-h0);g.translate((u0+u1)/2,(v0+v1)/2,(h0+h1)/2);
   if(photoTop){const surfaces=splitTop(g);add(surfaces.body,mat);add(surfaces.top,'photo',true);}else add(g,mat);
  }
  function cylinder(u,v,r,h0,h1,mat='metal',inner=0){
   const shape=new T.Shape();shape.absarc(u,v,r,0,Math.PI*2,false);
   if(inner){const hole=new T.Path();hole.absarc(u,v,inner,0,Math.PI*2,true);shape.holes.push(hole);}
   const g=new T.ExtrudeGeometry(shape,{depth:h1-h0,bevelEnabled:false,curveSegments:24});g.translate(0,0,h0);add(smoothCreases(g,Math.PI/5,1e-4),mat);
  }
  const shape=new T.Shape(b.outline.map(p=>new T.Vector2(...p)));
  for(const [u,v,r] of b.holes){const hole=new T.Path();hole.absarc(u,v,r,0,Math.PI*2,true);shape.holes.push(hole);}
  const substrate=new T.ExtrudeGeometry(shape,{depth:thickness,bevelEnabled:false,curveSegments:16});substrate.translate(0,0,-thickness);
  const surfaces=splitTop(substrate);add(surfaces.body,'board');add(surfaces.top,'photo',true);
  for(const [u,v]of b.holes.slice(0,b.key==='xBuddy'?6:4))cylinder(u,v,2.65,.025,.09,'gold',1.7);
  for(const [componentIndex,c]of b.components.entries()){
   let [u0,v0,u1,v1]=c.rect;if(u0>u1)[u0,u1]=[u1,u0];if(v0>v1)[v0,v1]=[v1,v0];
   const w=u1-u0,d=v1-v0,h=c.height,u=(u0+u1)/2,v=(v0+v1)/2;
   if(b.key==='xBuddy'&&componentIndex===14){
    // Side-entry 2x4 receptacle. The Wi-Fi pins enter along the board's u axis;
    // a solid outline block would incorrectly run through the mating pins.
    const entry=WIFI.entryU,low=WIFI.centreV-WIFI.width/2,high=WIFI.centreV+WIFI.width/2,depth=WIFI.cavityDepth,r=.52,profile=new T.Shape([new T.Vector2(low,0),new T.Vector2(high,0),new T.Vector2(high,WIFI.height),new T.Vector2(low,WIFI.height)]);
    for(const height of WIFI.rows)for(let i=0;i<4;i++){
     const center=WIFI.centreV+(i-1.5)*WIFI.pitch,hole=new T.Path();hole.moveTo(center-r,height-r);hole.lineTo(center-r,height+r);hole.lineTo(center+r,height+r);hole.lineTo(center+r,height-r);hole.closePath();profile.holes.push(hole);
     for(const side of [-1,1])box(entry+WIFI.contactDepth-.5,center+side*.43-.035,entry+WIFI.contactDepth+1.1,center+side*.43+.035,height-.23,height+.23,'gold');
     // Simplified formed SMT tails: sheet3 gives3.20 and3.70mm runs
     // beyond the8.50mm housing. The PCB contact lands remain at height0.
     const end=entry+WIFI.depth+(height===WIFI.rows[0]?3.2:6.9),start=entry+WIFI.depth-.25,strip=new T.Shape([new T.Vector2(start,height-.2),new T.Vector2(start+.55,height-.2),new T.Vector2(end-.8,.05),new T.Vector2(end,.05),new T.Vector2(end,.45),new T.Vector2(end-.6,.45),new T.Vector2(start+.8,height+.2),new T.Vector2(start,height+.2)]);
     const tail=new T.ExtrudeGeometry(strip,{depth:.64,bevelEnabled:false});tail.applyMatrix4(new T.Matrix4().set(1,0,0,0,0,0,-1,center+.32,0,1,0,0,0,0,0,1));add(smoothCreases(tail),'metal');
    }
    const g=new T.ExtrudeGeometry(profile,{depth,bevelEnabled:false,curveSegments:1});
    g.applyMatrix4(new T.Matrix4().set(0,0,1,entry,1,0,0,0,0,1,0,0,0,0,0,1));add(smoothCreases(g),'dark');
    box(entry+depth,low,entry+WIFI.depth,high,0,WIFI.height,'dark');
   }else if(c.kind==='socket'){
    box(u0,v0,u1,v1,0,.7,'ivory');const wall=.65;
    box(u0,v0,u0+wall,v1,.7,h,'ivory');box(u1-wall,v0,u1,v1,.7,h,'ivory');
    box(u0+wall,v0,u1-wall,v0+wall,.7,h,'ivory');box(u0+wall,v1-wall,u1-wall,v1,.7,h,'ivory');
    const zr=b.key==='xBuddy'&&componentIndex===3;
    const sensor=b.key==='xBuddy'&&XBUDDY_SENSOR_COMPONENTS[componentIndex],count=sensor?sensor.pins:zr?4:Math.max(2,Math.min(12,Math.round(Math.max(w,d)/2)));const horizontal=w>d;
    for(let i=0;i<count;i++){const along=sensor?(i-(count-1)/2)*sensor.pitch:null,x=zr?u+(i-1.5)*1.7:sensor&&horizontal?u+along:horizontal?u0+w*(i+.5)/count:u,y=sensor&&!horizontal?v+along:horizontal?v:v0+d*(i+.5)/count;box(x-.2,y-.2,x+.2,y+.2,.7,h-1.1,'gold');}
    box(u-.7,v0+wall,u+.7,v0+1.2,h-.6,h,'ivory');
   }else if(c.kind==='ethernet'||c.kind==='usbC'){
    const wall=c.kind==='ethernet'?.5:.35;
    box(u0,v0,u1,v1,0,wall,'metal');box(u0,v0,u1,v1,h-wall,h,'metal');
    box(u0,v0,u1-wall,v0+wall,wall,h-wall,'metal');box(u0,v1-wall,u1-wall,v1,wall,h-wall,'metal');box(u1-wall,v0,u1,v1,wall,h-wall,'metal');
    box(u0+wall,v0+wall,u1-wall,v1-wall,wall,h*.23,'dark');
    const count=c.kind==='ethernet'?8:8;for(let i=0;i<count;i++){const y=v0+d*(i+1)/(count+1);box(u0+.7,y-.12,u0+2.7,y+.12,h*.28,h*.28+.25,'gold');}
   }else if(c.kind==='capacitor'){
    cylinder(u,v,Math.min(w,d)/2,0,h-.25,'dark');cylinder(u,v,Math.min(w,d)*.46,h-.25,h,'metal');
   }else if(c.kind==='terminal'){
    if(b.key==='xBuddy'&&[38,39].includes(componentIndex))add(bedTerminalBodyReference(c),'dark');else box(u0,v0,u1,v1,0,h,'dark');cylinder(u,v,Math.min(w,d)*.31,h-.4,h+.1,'metal',Math.min(w,d)*.19);
   }else{
    const mat=c.kind==='header'&&w<d?'orange':c.kind==='battery'?'metal':'dark';
    box(u0,v0,u1,v1,0,h,mat,true);
   }
  }
  for(const [material,geometries]of batches){
   const merged=new T.BufferGeometry();for(const attr of ['position','normal','uv']){const size=attr==='uv'?2:3,n=geometries.reduce((n,g)=>n+g.attributes[attr].array.length,0),data=new Float32Array(n);let offset=0;for(const g of geometries){data.set(g.attributes[attr].array,offset);offset+=g.attributes[attr].array.length;}merged.setAttribute(attr,new T.BufferAttribute(data,size));}
   merged.computeBoundingBox();merged.computeBoundingSphere();geometries.forEach(g=>g.dispose());
   const mesh=new T.Mesh(merged,materials[material]);mesh.name=b.key+' / '+material;mesh.userData={part:b.key,cadName:b.key==='xBuddy'?'xBuddy board':'xBuddy extension board',illustration:true,electronicsSource:b};
   // Millimetre-scale connectors cannot receive a whole-printer shadow map
   // without aliasing. The registered photo already supplies their fine detail.
   mesh.castShadow=material!=='photo';mesh.receiveShadow=false;result.push(mesh);
  }
  for(const [i,[u,v,w,d]]of (b.pads||[]).entries()){
   const h=THERMAL_PAD_FREE_THICKNESS,g=new T.BoxGeometry(w/1000,h/1000,d/1000);g.translate((b.origin[0]-u)/1000,(b.origin[1]-thickness-h/2)/1000,(b.origin[2]-v)/1000);
   const mesh=new T.Mesh(g,new T.MeshStandardMaterial({color:'#a3aba8',roughness:.95}));mesh.name='Thermal pad '+(i+1);mesh.userData={part:'thermalPads',cadName:mesh.name,illustration:true};registerThermalPad(mesh,(b.origin[1]-thickness)/1000);mesh.castShadow=true;result.push(mesh);
  }
 }
 return result;
}
