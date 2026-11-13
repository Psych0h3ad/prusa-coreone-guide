import * as T from 'three';
import {roundedCablePath,roundedLength} from './lcd-cable-motion.js?v=20261111-94';
import {splitTop,smoothCreases} from './surface-geometry.js?v=20261111-94';

// Registered xBuddy photograph: X, Y, ZL, ZR, extension (left to right).
// The fourth small socket is ZR; the larger extension socket is not a motor port.
export const SPLITTER_ZR={key:'splitterZRPlug',end:[-99.5661731345,173.85172,161.7707382195],aperture:[-130,170,0],loose:[-182,151,-5],through:[-130,170,8]};

// Source CAD fixes the two pin axes. PCB outline, connector envelopes and
// flexible wire slack supplement it using the official manual photographs.
export async function createStepperSplitter(){
 const response=await fetch('./assets/electronics/splitter.json');if(!response.ok)throw Error('Stepper Splitterを読み込めません');
 const b=await response.json(),meshes=[],batches=new Map();
 const textures=await Promise.all(['front','back'].map(async side=>{const t=await new T.TextureLoader().loadAsync(`./assets/electronics/splitter-${side}.webp`);t.colorSpace=T.SRGBColorSpace;t.anisotropy=8;return t;}));
 const mats={board:new T.MeshStandardMaterial({color:'#20272b',roughness:.8}),front:new T.MeshBasicMaterial({map:textures[0],toneMapped:false}),back:new T.MeshBasicMaterial({map:textures[1],toneMapped:false}),ivory:new T.MeshStandardMaterial({color:'#e4dbb7',roughness:.6}),gold:new T.MeshStandardMaterial({color:'#c4a866',roughness:.4,metalness:.7}),metal:new T.MeshStandardMaterial({color:'#b4b6b3',roughness:.35,metalness:.7}),yellow:new T.MeshStandardMaterial({color:'#e9b632',roughness:.6})};
 const M=new T.Matrix4().set(.001,0,0,b.origin[0]/1000,0,.001,0,b.origin[1]/1000,0,0,-.001,b.origin[2]/1000,0,0,0,1);
 const world=(u,v,z)=>new T.Vector3(u,v,z).applyMatrix4(M);
 function add(g,material,part='stepperSplitter',photo=false){
  if(g.index){const old=g;g=g.toNonIndexed();old.dispose();}
  const p=g.attributes.position,uv=new Float32Array(p.count*2),[u0,v0,u1,v1]=b.bounds;
  if(photo)for(let i=0;i<p.count;i++){const x=(p.getX(i)-u0)/(u1-u0);uv[i*2]=material==='back'?1-x:x;uv[i*2+1]=1-(p.getY(i)-v0)/(v1-v0);}
  g.setAttribute('uv',new T.BufferAttribute(uv,2));g.applyMatrix4(M);
  // The photographic right/down frame reflects CAD Z. Preserve outward faces.
  for(const a of Object.values(g.attributes))for(let i=0;i<a.count;i+=3)for(let k=0;k<a.itemSize;k++){const j=(i+1)*a.itemSize+k,l=(i+2)*a.itemSize+k,t=a.array[j];a.array[j]=a.array[l];a.array[l]=t;}
  const key=part+':'+material;if(!batches.has(key))batches.set(key,[]);batches.get(key).push(g);
 }
 function box(u,v,z,w,d,h,mat,part){const g=new T.BoxGeometry(w,d,h);g.translate(u,v,z);add(g,mat,part);}
 const shape=new T.Shape(b.outline.map(p=>new T.Vector2(...p)));
 for(const [u,v,r]of b.holes){const hole=new T.Path();hole.absarc(u,v,r,0,2*Math.PI,true);shape.holes.push(hole);}
 const substrate=new T.ExtrudeGeometry(shape,{depth:b.thickness,bevelEnabled:false,curveSegments:32});substrate.translate(0,0,-b.thickness);
 const faces=splitTop(substrate);add(smoothCreases(faces.body,Math.PI/5,1e-4),'board');add(faces.top,'front','stepperSplitter',true);
 // A separate rear face has real through-holes and outward-facing winding.
 const rear=new T.ShapeGeometry(shape,32);rear.translate(0,0,-b.thickness-.005);
 const back=rear.index?rear.toNonIndexed():rear;const pos=back.attributes.position;
 for(let i=0;i<pos.count;i+=3)for(let k=0;k<3;k++){const j=(i+1)*3+k,l=(i+2)*3+k,t=pos.array[j];pos.array[j]=pos.array[l];pos.array[l]=t;}
 back.computeVertexNormals();add(back,'back','stepperSplitter',true);
 const connections=[];
 for(const port of b.ports){
  const [u,v]=port.centre,s=port.side,key='splitterPlug'+port.id;
  // Right-angle, open-ended socket. The plug enters along U; its nose stops
  // before the inner wall. Four terminals sit beneath the mating cavity.
  box(u,v,.35,7.2,10.8,.7,'ivory');
  box(u-s*3.15,v,2.65,.9,10.8,4.6,'ivory');
  for(const sign of [-1,1])box(u,v+sign*5.05,2.65,7.2,.7,4.6,'ivory');
  box(u,v,4.75,7.2,10.8,.5,'ivory');
  for(let i=0;i<4;i++){const y=v+(i-1.5)*2;box(u-s*3.9,y,.2,2.2,.65,.35,'metal');box(u-s*1.5,y,1.1,2.4,.55,.45,'gold');}
  const pu=u+s*4.1;
  box(pu,v,2.75,4.2,8.8,3.2,'ivory',key);
  box(pu+s*1.1,v,4.5,1.6,4,.3,'yellow',key);
  const end=world(pu+s*2.1,v,2.75);
  connections.push({...port,key,end:end.toArray(),outward:[s,0,0]});
 }
 for(const [key,gs]of batches){
  const [part,mat]=key.split(':'),g=new T.BufferGeometry();
  for(const attr of ['position','normal','uv']){const size=attr==='uv'?2:3,data=new Float32Array(gs.reduce((n,g)=>n+g.attributes[attr].array.length,0));let offset=0;for(const x of gs){data.set(x.attributes[attr].array,offset);offset+=x.attributes[attr].array.length;}g.setAttribute(attr,new T.BufferAttribute(data,size));}
  gs.forEach(g=>g.dispose());g.computeBoundingBox();g.computeBoundingSphere();
  const m=new T.Mesh(g,mats[mat]);m.name=part+' / '+mat;m.userData={part,cadName:part,illustration:true,splitterDatum:b.origin,splitterPort:part.startsWith('splitterPlug')?part.slice(12):undefined};m.castShadow=!['front','back'].includes(mat);m.receiveShadow=false;meshes.push(m);
 }
 // Four separate pin bores leave the xBuddy socket's terminals unobstructed.
 // The envelope is photographic, not a manufacturer connector specification.
 const connectorShape=new T.Shape([[-3.7,-2.55],[-.85,-2.55],[-.85,-2.1],[.85,-2.1],[.85,-2.55],[3.7,-2.55],[3.7,2.55],[-3.7,2.55]].map(p=>new T.Vector2(...p)));
 for(let i=0;i<4;i++){const hole=new T.Path();hole.absarc((i-1.5)*1.7,0,.43,0,2*Math.PI,true);connectorShape.holes.push(hole);}
 const cg=new T.ExtrudeGeometry(connectorShape,{depth:6.4,bevelEnabled:false,curveSegments:12});cg.translate(0,0,2);
 const socketUV=[45.3634131345,.8752317805];
 const CM=new T.Matrix4().set(-.001,0,0,-.05420276,0,0,.001,.16545172,0,-.001,0,.16264597,0,0,0,1);
 cg.translate(...socketUV,0);cg.applyMatrix4(CM);
 if(cg.index)throw Error('Connector must have independent faces');
 for(const at of Object.values(cg.attributes))for(let i=0;i<at.count;i+=3)for(let k=0;k<at.itemSize;k++){const j=(i+1)*at.itemSize+k,l=(i+2)*at.itemSize+k,t=at.array[j];at.array[j]=at.array[l];at.array[l]=t;}
 const zr=new T.Mesh(cg,mats.ivory);zr.name='Stepper Splitter / xBuddy ZR plug';zr.userData={part:SPLITTER_ZR.key,cadName:zr.name,illustration:true};zr.castShadow=true;meshes.push(zr);
 const colours=['#cc303b','#365ea9','#26947b','#292c2e'];
 const routes={
  // Stay straight beyond the front tie before turning toward the splitter.
  // Turning at the tie centre sweeps the conductors through its lock body.
  J6:[[-182,151,-9],[-181.3,122.9,-8],[-181.3,2.9,-8],[-181.3,-117.1,-8],[-181.3,-125.1,-8],[-167,-130,-8],[-130,-126,-8],[-130,-185,-8]],
  J7:[[17,132.6,-22],[34,160,-10],[-34,160,-10],[-42,150,-10],[-170,150,-10],[-181.3,122.9,-11],[-181.3,2.9,-11],[-181.3,-117.1,-11],[-181.3,-121.1,-11],[-170,-136,-18],[-126,-135,-40]],
  J1:[[-137.2,-178.9,-22],[-129,-181,-18],[-119,-190,-18],[-50,-190,-18]],
  J5:[[137.2,-178.9,-22],[123,-155,-25],[80,-140,-34],[0,-128,-39],[-60,-120,-40]]
 };
 const wireGroups=colours.map((color,i)=>{
  const positions=new Float32Array(4*129*7*3),indices=[];let cursor=0;
  for(let cable=0;cable<4;cable++)for(let j=0;j<128;j++)for(let k=0;k<6;k++){const a=cable*129*7+j*7+k,b=a+7;indices.push(a,b,a+1,b,b+1,a+1);}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(positions,3));g.setIndex(indices);
  const m=new T.Mesh(g,new T.MeshStandardMaterial({color,roughness:.58}));m.name='Stepper Splitter / wire '+i;m.userData={part:'splitterWires',cadName:m.name,illustration:true,splitterWire:i};m.castShadow=false;m.receiveShadow=false;meshes.push(m);return m;
 });
 return {meshes,datum:b,connections,wireGroups,routes,zrPlug:zr};
}

export function followStepperSplitter(viewer){
 const hardware=viewer.splitterHardware;if(!hardware)return;
 const plan=viewer.operationScene?.plan,full=viewer.operationScene?.full;
 const available=full||viewer.state?.flow==='upgrade'||plan?.chapter>3||plan?.chapter===3&&plan?.step>=38;
 const shown=available&&hardware.wireGroups.some(m=>m.visible);
 // Retire the earlier single-colour routing illustration once the four
 // connector-specific harnesses exist; do not show duplicate wires.
 if(available){const old=viewer.fasteners?.entities.get('baseMotor')?.mesh;if(old)old.visible=false;}
 if(!shown)return;
 const signature=[...hardware.connections.map(c=>viewer.meshes.find(m=>m.userData.part===c.key)),hardware.zrPlug].map(p=>p?[...p.position.toArray(),...p.quaternion.toArray(),p.visible].join(','):'').join('|');
 if(signature===hardware.lastPose)return;hardware.lastPose=signature;
 hardware.connections.forEach((c,index)=>{
  const plug=viewer.meshes.find(m=>m.userData.part===c.key),end=new T.Vector3(...c.end).applyQuaternion(plug.quaternion).add(plug.position),out=new T.Vector3(...c.outward).applyQuaternion(plug.quaternion);
  let prefix=hardware.routes[c.id].map(p=>new T.Vector3(...p).multiplyScalar(.001));
  if(c.id==='J6'){
   const plug=hardware.zrPlug,free=new T.Vector3(...SPLITTER_ZR.end).multiplyScalar(.001).applyQuaternion(plug.quaternion).add(plug.position),back=new T.Vector3(0,1,0).applyQuaternion(plug.quaternion);
   // Shape depends on the physical end pose, never on a chapter number.
   // This also keeps arbitrary seeks and adjacent manual steps continuous.
   const through=Math.max(0,Math.min(1,(free.z+.014)/.022))*Math.max(0,Math.min(1,(free.x+.151)/.021));
   const hole=new T.Vector3(-.130,.170,-.008),lead=free.clone().addScaledVector(back,.005);
   const under=new T.Vector3(-.151,.157,-.005);
   if(free.z>=.008-1e-12){
    // Once the tail is above the plate, the through-hole stays fixed. Form
    // the loose bend above that hole, then carry it around the PE lead.
    const gate=new T.Vector3(-.130,.170,.006);
    const formed=Math.min(1,(Math.hypot(free.x+.130,free.y-.170)+Math.max(0,free.z-.008))/.015);
    const straight=back.z<0?Math.min(.005,Math.max(0,(free.z-.006)/-back.z)):.005;
    const exit=free.clone().addScaledVector(back,straight);
    // Form the bend on the case side of the PE loop. Keep a short return
    // while carrying the low end, then retain the seated service route.
    const shortReturn=.008*(1-Math.max(0,Math.min(1,(free.z-.060)/.020)));
    const side=new T.Vector3(-.145,.168+Math.max(shortReturn,free.y-SPLITTER_ZR.end[1]*.001),Math.max(.018,free.z)).lerp(gate,1-formed);
    const foot=new T.Vector3(-.145,.168,.018).lerp(gate,1-formed);
    prefix=[free,exit,side,foot,gate,hole,under,...prefix.slice(1)];
   }else if(through>0)prefix=[free,lead,hole.clone().lerp(lead,1-through),under,...prefix.slice(1)];
   else prefix=[free,lead,under,...prefix.slice(1)];
  }
  // A broad slack bend follows the plug. Its final 5 mm remain parallel to
  // the connector's mating axis throughout both connection and mounting.
  const separation=c.id==='J5'?.008:0;
  const outside=end.clone().addScaledVector(out,.012+separation);outside.y=prefix.at(-1).y;outside.z=prefix.at(-1).z;
  const far=end.clone().addScaledVector(out,.009+separation);
  far.z=c.id==='J1'?end.z+.012:Math.max(end.z-.012,-.053);
  let points=[...prefix,outside,far,end.clone().addScaledVector(out,.005),end];
  if(c.id==='J6'){
   // Reserve a loose loop below the plate. It pays out as the end is lifted
   // to ZR, so routing does not lengthen the cable by the height of the box.
   const gate=prefix.findIndex(p=>Math.abs(p.x+.151)<1e-8&&Math.abs(p.y-.157)<1e-8);
   const a=points[gate],b=points[gate+1];
   const loose=[[-55,130,-5],[-55,60,-5],[-158,60,-5],[-166,144,-5],[-181.3,144,-8]];
   const fractions=[.15,.3,.5,.75,.85];
   const withSlack=amount=>[...points.slice(0,gate+1),...loose.map((p,i)=>a.clone().lerp(b,fractions[i]).lerp(new T.Vector3(...p).multiplyScalar(.001),amount)),...points.slice(gate+1)].filter((p,i,ps)=>!i||p.distanceTo(ps[i-1])>1e-9).map(p=>p.clone().multiplyScalar(1000));
   let lo=0,hi=1;for(let i=0;i<15;i++){const mid=(lo+hi)/2;if(roundedLength(withSlack(mid).map(p=>p.toArray()))<730)lo=mid;else hi=mid;}
   const mm=withSlack((lo+hi)/2);hardware.j6Length=roundedLength(mm.map(p=>p.toArray()));hardware.j6Slack=(lo+hi)/2;points=mm.map(p=>p.multiplyScalar(.001));
  }
  const millimetres=['J6','J7'].includes(c.id);
  const curve=millimetres?roundedCablePath(points.map(p=>p.clone().multiplyScalar(1000))):new T.CatmullRomCurve3(points,false,'centripetal');
  const frames=curve.computeFrenetFrames(128,false);
  for(let wire=0;wire<4;wire++){
   const g=hardware.wireGroups[wire].geometry,p=g.attributes.position;
   for(let j=0;j<=128;j++){
    const centre=curve.getPointAt(j/128).multiplyScalar(millimetres?.001:1),angle=j/128*12*Math.PI+wire*Math.PI/2;
    const normal=frames.normals[j],binormal=frames.binormals[j];centre.addScaledVector(normal,.00072*Math.cos(angle)).addScaledVector(binormal,.00072*Math.sin(angle));
    for(let k=0;k<=6;k++){const a=k/6*2*Math.PI,q=centre.clone().addScaledVector(normal,.00037*Math.cos(a)).addScaledVector(binormal,.00037*Math.sin(a));p.setXYZ(index*129*7+j*7+k,q.x,q.y,q.z);}
   }
   p.needsUpdate=true;
  }
 });
 for(const m of hardware.wireGroups){m.geometry.computeVertexNormals();m.geometry.computeBoundingBox();m.geometry.computeBoundingSphere();}
}
