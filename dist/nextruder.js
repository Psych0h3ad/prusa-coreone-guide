import {createPgPlanetGeometry,createPgCarrierGeometry,createPgRingGeometry} from './pg-gear-reference.js';
import {createNativeMainPacket615}from './native-main-packet.js';
import {canonical as mainCanonical615}from './loveboard-main-canonical.js';
import * as T from 'three';
import {prepareNativeJ13,nativeJ13SocketFrame,nativeJ13HeaderPieces} from './native-j13.js?v=20261114-129';
import {STLLoader} from './vendor/STLLoader.js';
import {smoothCreases,splitTop} from './surface-geometry.js?v=20261111-94';
import {LOVEBOARD,SOCKETS,socketCentre} from './loveboard-layout.js?v=20261111-94';
import {loadMolexCad,molexCad,molexGeometry} from './molex-cad.js?v=20261111-94';
import {molexSocketFrame} from './molex-frames.js?v=20261111-94';
import {LoveBoardServiceCable,LOVEBOARD_CABLE_DEFINITIONS} from './loveboard-service-cables.js?v=20261112-113';

// Manufacturer meshes and supplementary assembly illustrations are kept distinct.
// No dimensions or gear tooth profile in the illustrations are manufacturing data.
export async function createNextruder(){
 await Promise.all([loadMolexCad(),prepareNativeJ13()]);
 const result=[],stl=new STLLoader(),rows=await fetch('./assets/nextruder/official-meshes.json').then(r=>r.json());
 const materials={dark:new T.MeshStandardMaterial({color:'#303332',roughness:.72}),metal:new T.MeshStandardMaterial({color:'#b8babe',metalness:.7,roughness:.35}),gold:new T.MeshStandardMaterial({color:'#bd9c51',metalness:.65,roughness:.4}),seal:new T.MeshStandardMaterial({color:'#202322',roughness:.85}),ivory:new T.MeshStandardMaterial({color:'#ede6d1',roughness:.68}),board:new T.MeshStandardMaterial({color:'#292c2e',roughness:.84})};
 materials.copper=new T.MeshStandardMaterial({color:'#a66336',metalness:.7,roughness:.38});
 materials.tin=new T.MeshStandardMaterial({color:'#bec3c5',metalness:.8,roughness:.32});
 materials.blueWire=new T.MeshStandardMaterial({color:'#257dba',roughness:.8});
 materials.redWire=new T.MeshStandardMaterial({color:'#c13c32',roughness:.8});
 const batches=new Map();
 function collect(g,key,mat,illustration=true,extra={}){
  const id=key+':'+mat+':'+(extra.maintenanceComponent||'')+':'+(extra.maintenanceRegion||'')+':'+(extra.connector||'')+':'+(extra.geometryRole||'');if(!batches.has(id))batches.set(id,{key,mat,illustration,extra,list:[]});
  batches.get(id).list.push(g.index?g.toNonIndexed():g);
 }
 function ring(key,x,z,r,inner,y0,y1,mat='metal'){
  const s=new T.Shape();s.absarc(x,z,r,0,Math.PI*2,false);
  if(inner){const h=new T.Path();h.absarc(x,z,inner,0,Math.PI*2,true);s.holes.push(h);}
  const g=new T.ExtrudeGeometry(s,{depth:y1-y0,bevelEnabled:false,curveSegments:48});
  // x,z in the CAD plane, positive extrusion points towards the printhead front.
  g.applyMatrix4(new T.Matrix4().set(.001,0,0,0,0,0,-.001,y1/1000,0,.001,0,0,0,0,0,1));collect(smoothCreases(g),key,mat);
 }
 function block(key,x0,z0,x1,z1,y0,y1,mat='dark'){
  const g=new T.BoxGeometry((x1-x0)/1000,(y1-y0)/1000,(z1-z0)/1000);g.translate((x0+x1)/2000,(y0+y1)/2000,(z0+z1)/2000);collect(g,key,mat);
 }
 for(const row of rows){
  const g=await stl.loadAsync('./assets/nextruder/'+row.file);g.scale(.001,.001,.001);smoothCreases(g);
  const m=new T.Matrix4().set(...row.matrix.flat());m.elements[12]/=1000;m.elements[13]/=1000;m.elements[14]/=1000;g.applyMatrix4(m);
  collect(g,row.key,'dark',false,{toolOnly:!!row.toolOnly,officialSource:'https://www.printables.com/model/1167816-core-one-printable-parts'});
 }
 const hotendRows=await fetch('./assets/hotend/meshes.json').then(r=>r.json());
 for(const row of hotendRows){
  const g=await stl.loadAsync('./assets/hotend/'+row.file);g.translate(...row.offset);g.scale(.001,.001,.001);smoothCreases(g);
  const maintenanceComponent=['nozzle-tube.stl','heatbreak.stl','nozzle-tip.stl'].includes(row.file)?'serviceNozzle':row.file==='silicone-sock.stl'?'serviceSock':'serviceBlock';
  collect(g,row.key,row.material,false,{communitySource:'https://www.printables.com/model/1533491-prusa-core-one-full-cad-with-nextruder-hotend',maintenanceComponent,maintenanceRegion:({'nozzle-tube.stl':'regionTube','heatbreak.stl':'regionHeatbreak','nozzle-tip.stl':'regionTip'}[row.file]||'')});
 }
 // 693-2RS bearings and the 2.9 x 8.5 pins specified by official step 6.2.
 for(const [i,x,z]of [[1,-7.629901,397.108141],[2,-7.488981,388.85956]]){
  ring('idlerBearing'+i,x,z,4,1.5,-60.5452524,-56.5452524);
  for(const y of [-60.56,-56.57])ring('idlerBearing'+i,x,z,3.6,2.05,y,y+.035,'seal');
  ring('idlerPin'+i,x,z,1.45,0,-62.7952524,-54.2952524);
 }
 const cx=9.05642165,cz=393.00041426;
 // The two planet centres are taken from the official adapter, 21 mm apart.
 // Tooth detail and stack heights are visual estimates, not a meshing simulation.
 function teeth(key,x,z,root,tip,count,y0,y1,hole=0,mat='metal'){
  const pts=[];for(let i=0;i<count;i++)for(const [f,r]of [[0,root],[.27,tip],[.60,tip],[.87,root]]){const a=(i+f)*Math.PI*2/count;pts.push(new T.Vector2(x+r*Math.cos(a),z+r*Math.sin(a)));}
  const shape=new T.Shape(pts);if(hole){const h=new T.Path();h.absarc(x,z,hole,0,Math.PI*2,true);shape.holes.push(h);}
  const g=new T.ExtrudeGeometry(shape,{depth:y1-y0,bevelEnabled:false});g.applyMatrix4(new T.Matrix4().set(.001,0,0,0,0,0,-.001,y1/1000,0,.001,0,0,0,0,0,1));collect(smoothCreases(g,Math.PI/7),key,mat);
 }
 ring('pgAssembly',cx,cz,12.35,2.6,-65.7,-59.8);
 const cg=createPgCarrierGeometry(cx,cz);collect(cg,'pgAssembly','metal');
 for(const dx of [-10.5,10.5]){
  collect(createPgPlanetGeometry(cx+dx,cz,-71.2,-67.2,dx<0?Math.PI:0),'pgAssembly','metal');
  ring('pgAssembly',cx+dx,cz,3.25,1.5,-71.24,-71.2,'seal');
  ring('pgAssembly',cx+dx,cz,1.45,0,-72,-65.8);
 }
 // PG ring: integrated126-tooth reference; source outer wall and four mounting holes retained.
 collect(createPgRingGeometry(cx,cz),'pgRing','gold');
 const b=await fetch('./assets/nextruder/loveboard.json?v=20261105-52').then(r=>r.json()),[px,py]=b.datumPixel,[ox,oy,oz]=b.datumCAD;
 if(b.scale!==LOVEBOARD.scale)throw new Error('LoveBoard illustration and connector frames use different calibration');
 const X=x=>ox+(x-px)*b.scale,Z=y=>oz-(y-py)*b.scale;
 const shape=new T.Shape(b.outline.map(([x,y])=>new T.Vector2(X(x),Z(y))));
 for(const [x,y,r]of b.holes){const p=new T.Path();p.absarc(X(x),Z(y),r,0,Math.PI*2,true);shape.holes.push(p);}
 const board=new T.ExtrudeGeometry(shape,{depth:b.thickness,bevelEnabled:false,curveSegments:32});
 const top=splitTop(board),back=splitTop(top.body.clone().scale(1,1,-1));back.body.scale(1,1,-1);back.top.scale(1,1,-1);
 const bm=new T.Matrix4().set(.001,0,0,0,0,0,-.001,(oy+b.thickness)/1000,0,.001,0,0,0,0,0,1);
 back.body.applyMatrix4(bm);collect(back.body,'loveBoard','board');
 const photo=top.top,p=photo.attributes.position,uv=new Float32Array(p.count*2),[x0,y0,x1,y1]=b.bounds;
 for(let i=0;i<p.count;i++){uv[2*i]=((p.getX(i)-ox)/b.scale+px-x0)/(x1-x0);uv[2*i+1]=1-((oz-p.getY(i))/b.scale+py-y0)/(y1-y0);}
 photo.setAttribute('uv',new T.BufferAttribute(uv,2));photo.applyMatrix4(bm);
 const texture=await new T.TextureLoader().loadAsync(b.texture);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=8;materials.photo=new T.MeshBasicMaterial({map:texture,toneMapped:false});collect(photo,'loveBoard','photo');
 const rear=back.top,rp=rear.attributes.position,ruv=new Float32Array(rp.count*2);for(let i=0;i<rp.count;i++){ruv[2*i]=((rp.getX(i)-ox)/b.scale+px-x0)/(x1-x0);ruv[2*i+1]=1-((oz-rp.getY(i))/b.scale+py-y0)/(y1-y0);}rear.setAttribute('uv',new T.BufferAttribute(ruv,2));rear.applyMatrix4(bm);
 const rearTexture=await new T.TextureLoader().loadAsync(b.backTexture);rearTexture.colorSpace=T.SRGBColorSpace;rearTexture.anisotropy=8;materials.backPhoto=new T.MeshBasicMaterial({map:rearTexture,toneMapped:false});collect(rear,'loveBoard','backPhoto');
 // Copper lands are already in the official face photograph. Duplicating them
 // as proud annular solids put the display layer into the mounting surface.
 for(const c of b.components){const [l,t,r,bottom]=c.rect;block('loveBoard',X(l),Z(bottom),X(r),Z(t),oy-c.height,oy,'dark');}
 for(const [id,c]of Object.entries(SOCKETS)){
  if(id==='J13'){
   const frame=nativeJ13SocketFrame();
   for(const p of nativeJ13HeaderPieces()){
    p.geometry.applyMatrix4(frame).scale(.001,.001,.001);collect(p.geometry,'loveBoard',p.material==='resin'?'ivory':'tin',true,{connector:id,geometryRole:p.material==='resin'?'housing':p.material,pinCount:22,manufacturerPart:'5031542290',source:p.source,sourceFaces:p.sourceFaces,modelSourceFaces:p.modelSourceFaces,sourceMeshSHA256:p.sourceMeshSHA256,geometryOrigin:p.geometryOrigin,manufacturerCAD:false,illustrationRegistration:true});
   }
   continue;
  }
  if(c.manufacturerPart){
   const frame=molexSocketFrame(id);
   for(const [kind,mat]of [['resin','ivory'],['tin','tin']]){
    const g=molexGeometry(c.manufacturerPart,kind);g.applyMatrix4(frame).scale(.001,.001,.001);
    collect(g,'loveBoard',mat,true,{connector:id,geometryRole:kind==='resin'?'housing':'contacts',pinCount:c.pins,manufacturerPart:c.manufacturerPart,officialSource:'https://www.molex.com/en-us/products/part-detail/'+c.manufacturerPart,geometryOrigin:molexCad(c.manufacturerPart).geometryOrigin,manufacturerCAD:false,sourceMeshSHA256:molexCad(c.manufacturerPart).meshSha256,illustrationRegistration:true});
   }
   continue;
  }
  const [l,t,r,bottom]=c.rect,vertical=!!c.out[1],right=!!c.out[0],width=vertical||!right?(r-l)*b.scale:c.height,height=vertical||right?(bottom-t)*b.scale:c.height,depth=vertical?c.height:right?(r-l)*b.scale:(bottom-t)*b.scale;
  const origin=new T.Vector3(...socketCentre(id)),u=new T.Vector3(...(right?[0,c.out[0],0]:[1,0,0])),v=new T.Vector3(...(vertical?[0,0,1]:right?[0,0,1]:[0,1,0])),w=new T.Vector3(...c.out),frame=new T.Matrix4().makeBasis(u,v,w).setPosition(origin);
  const piece=(x0,y0,x1,y1,z0,z1,mat,role)=>{const g=new T.BoxGeometry(x1-x0,y1-y0,z1-z0);g.translate((x0+x1)/2,(y0+y1)/2,(z0+z1)/2);g.applyMatrix4(frame).scale(.001,.001,.001);collect(g,'loveBoard',mat,true,{connector:id,geometryRole:role,pinCount:c.pins});};
  const a=width/2,h=height/2,wall=.55,mat=c.material||'ivory';
  piece(-a,-h,a,h,-depth,-depth+.65,mat,'housing');
  const single=id!=='P1'&&c.rows===1,lockHalf=c.pins<4?.9:1.65;
  // The central locking window is a real opening in the wall. A solid wall
  // here would pass through the hook even with the plug correctly seated.
  const lockWall=(x0,y0,x1,y1,splitX)=>{
   piece(x0,y0,x1,y1,-depth+.65,-3.3,mat,'housing');piece(x0,y0,x1,y1,-1.3,0,mat,'housing');
   if(splitX){piece(x0,y0,-lockHalf,y1,-3.3,-1.3,mat,'housing');piece(lockHalf,y0,x1,y1,-3.3,-1.3,mat,'housing');}
   else{piece(x0,y0,x1,-lockHalf,-3.3,-1.3,mat,'housing');piece(x0,lockHalf,x1,y1,-3.3,-1.3,mat,'housing');}
  };
  if(single&&(vertical||right))lockWall(-a,-h,-a+wall,h,false);else piece(-a,-h,-a+wall,h,-depth+.65,0,mat,'housing');
  piece(a-wall,-h,a,h,-depth+.65,0,mat,'housing');
  if(single&&!vertical&&!right)lockWall(-a+wall,-h,a-wall,-h+wall,true);else piece(-a+wall,-h,a-wall,-h+wall,-depth+.65,0,mat,'housing');
  piece(-a+wall,h-wall,a-wall,h,-depth+.65,0,mat,'housing');
  const perRow=c.pins/c.rows;
  for(let row=0;row<c.rows;row++)for(let i=0;i<perRow;i++){
   const along=(i-(perRow-1)/2)*c.pitch,across=(row-(c.rows-1)/2)*3,x=vertical||right?across:along,y=vertical||right?along:across;
   piece(x-.12,y-.12,x+.12,y+.12,-depth+.65,-1.25,'gold','contacts');
  }
 }
 // Assembly and maintenance share the routed loom and its terminal frame.
 const mainPacket=createNativeMainPacket615(),mainGeometry=mainPacket.geometry.toNonIndexed();
 for(const [i,group]of mainGeometry.groups.entries()){
  const g=new T.BufferGeometry();
  for(const name of ['position','normal'])g.setAttribute(name,new T.BufferAttribute(mainGeometry.attributes[name].array.slice(group.start*3,(group.start+group.count)*3),3));
  const extra=i===22?{geometryRole:'nativeMainPlug',manufacturerPart:'5031492200',sourceMeshSHA256:mainPacket.writer.sourceMeshSHA256,nativeSourceFaces:mainPacket.writer.sourceFaces,geometryOrigin:mainPacket.writer.geometryOrigin,manufacturerCAD:mainPacket.writer.manufacturerCAD,allFacesRetained:true,illustrationRegistration:true}:{geometryRole:'mainWire',wireIndices:Array.from({length:22},(_,w)=>w).filter(w=>w%4===i%4),referenceCentreMM:171.54146529311816};
  collect(g,'loveMainPlug',i===22?'ivory':['blueWire','dark','ivory','redWire'][i%4],true,{workspaceOnly:'printer',mainRepresentation:'native171',...extra});
 }
 mainGeometry.dispose();mainPacket.dispose();
 for(const {key,mat,illustration,extra,list}of batches.values()){
  const merged=new T.BufferGeometry();for(const name of ['position','normal','uv']){const size=name==='uv'?2:3,data=new Float32Array(list.reduce((n,g)=>n+g.attributes.position.count*size,0));let offset=0;for(const g of list){const a=g.attributes[name];if(a)data.set(a.array,offset);offset+=g.attributes.position.count*size;}merged.setAttribute(name,new T.BufferAttribute(data,size));}merged.computeBoundingBox();merged.computeBoundingSphere();list.forEach(g=>g.dispose());
  const mesh=new T.Mesh(merged,materials[mat].clone());mesh.userData={part:key,cadName:key,illustration,...extra};mesh.castShadow=!['photo','backPhoto'].includes(mat);mesh.receiveShadow=false;result.push(mesh);
 }
 const sleeveGeometry=new T.BufferGeometry();for(const name of ['position','normal'])sleeveGeometry.setAttribute(name,new T.BufferAttribute(new Float32Array(mainCanonical615.sleeve[name]),3));sleeveGeometry.setIndex(mainCanonical615.sleeve.index);
 const sleeveMaterial=new T.MeshStandardMaterial({color:mainCanonical615.jacketColor,roughness:.72,metalness:.05});sleeveMaterial.userData.originalColor=sleeveMaterial.color.clone();sleeveMaterial.userData.originalOpacity=1;const sleeveMesh=new T.Mesh(sleeveGeometry,sleeveMaterial);sleeveMesh.scale.setScalar(.001);sleeveMesh.userData={part:'loveMainPlug',cadName:'メインケーブルのスリーブ',workspaceOnly:'printer',geometryRole:'terminalJacket',referenceLengthMM:mainCanonical615.prefixReferenceMM,illustration:true,preserveColours:true};result.push(sleeveMesh);
 return result;
}
