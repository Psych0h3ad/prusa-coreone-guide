import * as T from 'three';
import {loadMolexCad,molexCad,molexGeometry} from './molex-cad.js?v=20261111-94';
import {CABLES} from './fastener-data.js?v=20261111-94';
import {sensorRetentionPrefix,createMountedSensorLead} from './sensor-retention-route.js';

// Official 7.23, lines 996723 / 996739 / 996747 / 996755.
// https://help.prusa3d.com/guide/7-bodywork-electronics_982292#996711
// J2/J3 are 502585-0370 right-angle three-circuit headers, not vertical sockets:
// https://www.prusa3d.com/downloads/Electronics_drawings/MK4-xBuddyExtension-06.pdf
// Reuse the retained manufacturer CAD at its full original size. The PCB's
// in-plane placement remains registered to the existing official photograph.
export const SIDE_SENSOR_SOURCES={guide:'https://help.prusa3d.com/guide/7-bodywork-electronics_982292#996711',schematic:'https://www.prusa3d.com/downloads/Electronics_drawings/MK4-xBuddyExtension-06.pdf',header:'https://www.molex.com/en-us/products/part-detail/5025850370',plug:'https://www.molex.com/en-us/products/part-detail/5025780300'};
// JA -> EN / CS / DE. The integration owner can pass this exact map to
// registerMessages; keeping it here avoids concurrent shared-catalog edits.
export const SIDE_SENSOR_MESSAGES={
 '側面センサーの端子を配線束の上からFILAMENTの手前へ案内する':['Guide the side-sensor plug above the bundle to FILAMENT','Veďte konektor bočního senzoru nad svazkem před FILAMENT','Stecker des seitlichen Sensors über dem Bündel vor FILAMENT führen'],
 '向きを合わせ、FILAMENTへまっすぐ差し込む':['Align the plug and insert it straight into FILAMENT','Vyrovnejte konektor a zasuňte jej přímo do FILAMENT','Stecker ausrichten und gerade in FILAMENT einstecken'],
 '背面のケーブル束 1：開口より上で軽くまとめ、余りを切る':['Rear cable bundle 1: secure gently above the openings and trim','Zadní svazek 1: lehce zajistěte nad otvory a odstřihněte konec','Hinteres Kabelbündel 1: oberhalb der Öffnungen locker sichern und Ende kürzen'],
 '背面のケーブル束 2：開口より上で軽くまとめ、余りを切る':['Rear cable bundle 2: secure gently above the openings and trim','Zadní svazek 2: lehce zajistěte nad otvory a odstřihněte konec','Hinteres Kabelbündel 2: oberhalb der Öffnungen locker sichern und Ende kürzen'],
 'FILAMENTへ接続してから2本を個別に留めます。下の開口2つを空け、配線を引っ張らず、締め過ぎないでください。':['Connect FILAMENT, then secure each tie separately. Keep both lower openings clear; do not strain the wires or overtighten.','Zapojte FILAMENT a poté samostatně zajistěte obě pásky. Oba spodní otvory nechte volné; vodiče nenapínejte a pásky nepřetahujte.','FILAMENT anschließen, danach beide Kabelbinder einzeln befestigen. Beide unteren Öffnungen freihalten; Leitungen nicht spannen und Kabelbinder nicht zu fest anziehen.']
};
// The full board photo starts EXT, TEMP, FILAMENT; the cropped 7.23 photo
// omits EXT. Register to the printed FILAMENT label, component index 2.
const FILAMENT_COMPONENT=2;
const words=Object.keys(SIDE_SENSOR_MESSAGES),vec=p=>new T.Vector3(...p),ease=x=>T.MathUtils.smoothstep(x,0,1);
const CAMERA='xbuddy-board-perspective',ROUTE_BOUNDS=[-122,161,208,-49,229,282],CONNECT_BOUNDS=[-87,161,207,-57,201,248],BUNDLE_BOUNDS=[-85,154,210,85,223,310];
export function sideSensorPlan(plan){
 if(plan.chapter!==7||plan.step!==23)return plan;
 const connection=(to,label)=>({flex:['sensorWire'],to,label,officialLine:996723,axis:[0,0,-1],showBefore:true,focusMotion:true,focusBounds:to===2?ROUTE_BOUNDS:CONNECT_BOUNDS,camera:CAMERA,focusPadding:3,focusMinDistance:88,guideRadius:2.5,guideTube:.3,guideArrowLength:5});
 return {...plan,sideSensorAssembly:true,focus:['sensorWire','xBuddyExtension','bundle1','bundle2'],camera:CAMERA,operationCamera:CAMERA,viewBounds:ROUTE_BOUNDS,viewMinDistance:88,settledFocus:undefined,note:words[4],actors:[
  connection(2,words[0]),connection(3,words[1]),
  ...plan.actors.map((a,i)=>({...a,label:words[i+2],officialLine:996739,axis:[0,0,1],focusBounds:BUNDLE_BOUNDS,camera:CAMERA,focusPadding:5,focusMinDistance:140}))
 ]};
}

function removeIllustrativeSocket(meshes,board){
 const c=board.components[FILAMENT_COMPONENT],r=c.rect,[ox,oy,oz]=board.origin,min=vec([ox-Math.max(r[0],r[2]),oy,oz-Math.max(r[1],r[3])]).multiplyScalar(.001),max=vec([ox-Math.min(r[0],r[2]),oy+c.height,oz-Math.min(r[1],r[3])]).multiplyScalar(.001),box=new T.Box3(min,max).expandByScalar(2e-7),removed={};
 // These two non-indexed batches were made by createElectronics, including
 // four generic pins. Replace ONLY that supplemental footprint. Native CAD,
 // board substrate, photograph, other connectors and materials stay intact.
 const batches=meshes.filter(m=>m.userData.part==='xBuddyExtension'&&m.userData.illustration&&['xBuddyExtension / ivory','xBuddyExtension / gold'].includes(m.name)),pending=[];
 if(batches.length!==2)throw Error('FILAMENT reference batches missing');
 for(const m of batches){
  if(m.userData.cadIndex!==undefined||m.geometry.index)throw Error('Expected the supplemental extension-board batch');
  if(m.userData.sideSensorSocketRefined)continue;
  const g=m.geometry,p=g.attributes.position,keep=[];let n=0;
  for(let i=0;i<p.count;i+=3){const inside=[0,1,2].every(k=>box.containsPoint(new T.Vector3().fromBufferAttribute(p,i+k)));if(inside)n+=3;else keep.push(i,i+1,i+2);}
  const expected=m.name.endsWith('ivory')?216:144;
  if(n!==expected)throw Error('FILAMENT footprint changed; refusing to alter adjacent geometry: '+m.name+' '+n);
  const next=new T.BufferGeometry();for(const [name,a]of Object.entries(g.attributes)){const data=new a.array.constructor(keep.length*a.itemSize);keep.forEach((v,i)=>{for(let j=0;j<a.itemSize;j++)data[i*a.itemSize+j]=a.array[v*a.itemSize+j];});next.setAttribute(name,new T.BufferAttribute(data,a.itemSize,a.normalized));}
  next.computeBoundingBox();next.computeBoundingSphere();pending.push({m,next,g,n});
 }
 for(const {m,next,g,n} of pending){m.geometry=next;m.userData.sideSensorSocketRefined=true;removed[m.name]=n;g.dispose();}
 return removed;
}

// Source X = contact row, Y = mating direction, Z = latch side. This proper
// rigid transform puts source Z=-.29 on the PCB and Y along CAD -Z (down).
export function sideSensorSocketFrame(board){
 const [u0,v0,u1]=board.components[FILAMENT_COMPONENT].rect,[x,y,z]=board.origin;
 return new T.Matrix4().set(1,0,0,x-(u0+u1)/2,0,0,1,y+.29,0,-1,0,z-v0+2.4,0,0,0,1);
}

function merge(parts){
 const g=new T.BufferGeometry();let start=0;
 for(const p of parts){p.geometry=p.geometry.index?p.geometry.toNonIndexed():p.geometry;p.start=start;p.count=p.geometry.attributes.position.count;g.addGroup(start,p.count,p.material);start+=p.count;}
 for(const name of ['position','normal']){const data=new Float32Array(start*3);for(const p of parts)data.set(p.geometry.attributes[name].array,p.start*3);g.setAttribute(name,new T.BufferAttribute(data,3));}
 parts.forEach(p=>p.geometry.dispose());return g;
}

class SideSensorCable {
 constructor(frame){
  this.id='sensorWire';this.socketFrame=frame;this.entry=vec([0,0,1.25]).applyMatrix4(frame);const referencePrefix=new T.CatmullRomCurve3(CABLES.find(d=>d.id===this.id).points.slice(0,8).map(vec),false,'centripetal');this.prefixStockMM=referencePrefix.getLength();this.prefix=sensorRetentionPrefix(this.prefixStockMM,referencePrefix.getPoint(1));
  this.anchor=referencePrefix.getPoint(1);this.samples=112;this.radius=1.5;this.parts=[];
  const add=(geometry,material)=>{const part={geometry,material};this.parts.push(part);return part;};
  add(new T.TubeGeometry(this.prefix,144,this.radius,8,false).scale(.001,.001,.001),0);
  this.tail=this.makeTail(1);this.length=0;
  // Fixed gauge, fixed cut length. Slack changes shape in the free tail; the
  // routed prefix and the three terminal leads never shorten during insertion.
  for(let i=0;i<=64;i++)this.length=Math.max(this.length,this.makeTail(1+2*i/64).getLength());
  this.length+=1;
  this.leadLengths=[-1,0,1].map(row=>{let length=0;for(let i=0;i<=64;i++)length=Math.max(length,this.rawStrand(1+2*i/64,row,0).getLength());return length+1;});
  this.dynamic=add(new T.TubeGeometry(this.tail,this.samples,this.radius,8,false).scale(.001,.001,.001),0);
  this.strands=[-1,0,1].map((row,i)=>add(new T.TubeGeometry(this.strand(1,row),24,.5,8,false).scale(.001,.001,.001),i+1));
  this.plug=add(molexGeometry('5025780300').scale(.001,.001,.001),4);
  this.plugCad=molexCad('5025780300');
  this.geometry=merge(this.parts);
  this.mesh=new T.Mesh(this.geometry,['#494e52','#8a6347','#ece9df','#53936b','#e4dbb7'].map(color=>new T.MeshStandardMaterial({color,roughness:.62,metalness:.02})));
  this.mesh.name='Side filament sensor harness / FILAMENT';this.mesh.castShadow=true;
  this.mesh.userData={part:'cables',cadName:'側面フィラメントセンサーケーブル',flexId:this.id,supplement:true,preserveColours:true,sideSensor:true,manufacturerPart:'5025780300',source:SIDE_SENSOR_SOURCES.guide};
  this.update(1,1,1);
 }
 endpoint(amount){
  return this.station(amount,[[1,[-109,218,258]],[1.4,[this.entry.x,218,231]],[1.6,[this.entry.x,194,231]],[2,this.entry.clone().add(vec([0,0,14])).toArray()],[3,this.entry.toArray()]]);
 }
 station(amount,stations){
  if(amount<=stations[0][0])return vec(stations[0][1]);if(amount>=stations.at(-1)[0])return vec(stations.at(-1)[1]);
  const i=Math.max(1,stations.findIndex(s=>s[0]>=amount)),a=stations[i-1],b=stations[i];return vec(a[1]).lerp(vec(b[1]),T.MathUtils.clamp((amount-a[0])/(b[0]-a[0]),0,1));
 }
 neck(amount){
  return this.station(amount,[[1,[-109,218,276]],[1.4,[this.entry.x,220,246]],[1.6,[this.entry.x,213,228]],[2,[this.entry.x,185,231]],[3,[this.entry.x,185,231]]]);
 }
 makeTail(amount,bulge=0){
  const end=this.neck(amount);
  // Native box 168 has its top at Z247.646, front edge Y205.600 and
  // an inner return at Z234.346. Pass outside the edge before entering below
  // that return; no cutaway, scaling, or deletion makes room for this cable.
  const points=[this.anchor.clone(),vec([-112,173,282.5]),vec([-137,205,278]),vec([-139,218,257]),vec([-122,218,232]),vec([end.x,214,226]),end.clone().lerp(vec([end.x,214,226]),.45),end];
  points.forEach((p,i)=>{if(i>=2&&i<=4)p.y+=bulge;});
  const c=new T.CatmullRomCurve3(points,false,'centripetal');c.arcLengthDivisions=512;return c;
 }
 rawStrand(amount,row,bulge){
  const start=this.neck(amount).add(vec([row*.6,0,0])),finish=this.endpoint(amount).add(vec([row*1.5,0,0]));
  return new T.CubicBezierCurve3(start,start.clone().add(vec([0,0,-4-bulge])),finish.clone().add(vec([0,0,5])),finish);
 }
 strand(amount,row){
  let lo=0,hi=80;const length=this.leadLengths[row+1];
  for(let i=0;i<19;i++){const mid=(lo+hi)/2;if(this.rawStrand(amount,row,mid).getLength()<length)lo=mid;else hi=mid;}
  return this.rawStrand(amount,row,(lo+hi)/2);
 }
 writeTube(part,curve,samples,radius){
  const frames=curve.computeFrenetFrames(samples,false),p=this.geometry.attributes.position,n=this.geometry.attributes.normal;
  // TubeGeometry.toNonIndexed expands each original indexed ring triangle.
  let at=part.start;const normal=new T.Vector3(),point=new T.Vector3();
  const put=(ring,side)=>{const a=side/8*2*Math.PI;normal.copy(frames.normals[ring]).multiplyScalar(-Math.cos(a)).addScaledVector(frames.binormals[ring],Math.sin(a));point.copy(curve.getPointAt(ring/samples));p.setXYZ(at,(point.x+radius*normal.x)*.001,(point.y+radius*normal.y)*.001,(point.z+radius*normal.z)*.001);n.setXYZ(at,normal.x,normal.y,normal.z);at++;};
  for(let ring=1;ring<=samples;ring++)for(let j=1;j<=8;j++){put(ring-1,j-1);put(ring,j-1);put(ring-1,j);put(ring,j-1);put(ring,j);put(ring-1,j);}
 }
 update(from,to,t){
  const amount=T.MathUtils.lerp(from,to,ease(t)),pose=Math.max(1,amount),end=this.endpoint(pose);let lo=0,hi=80;
  for(let i=0;i<22;i++){const mid=(lo+hi)/2;if(this.makeTail(pose,mid).getLength()<this.length)lo=mid;else hi=mid;}
  this.tail=this.makeTail(pose,(lo+hi)/2);this.writeTube(this.dynamic,this.tail,this.samples,this.radius);
  this.strands.forEach((part,i)=>this.writeTube(part,this.strand(pose,i-1),24,.5));
  const frame=this.socketFrame.clone(),target=vec([0,0,1.25]).applyMatrix4(this.socketFrame),offset=end.clone().sub(target);frame.elements[12]+=offset.x;frame.elements[13]+=offset.y;frame.elements[14]+=offset.z;
  const p=this.geometry.attributes.position,n=this.geometry.attributes.normal,v=new T.Vector3(),normalMatrix=new T.Matrix3().getNormalMatrix(frame);
  for(let i=0;i<this.plug.count;i++){v.fromArray(this.plugCad.positions,i*3).applyMatrix4(frame).multiplyScalar(.001);p.setXYZ(this.plug.start+i,v.x,v.y,v.z);v.fromArray(this.plugCad.normals,i*3).applyMatrix3(normalMatrix).normalize();n.setXYZ(this.plug.start+i,v.x,v.y,v.z);}
  p.needsUpdate=true;n.needsUpdate=true;this.geometry.setDrawRange(0,amount<1?Math.floor(this.plug.start*Math.max(0,amount)/48)*48:this.geometry.attributes.position.count);this.geometry.computeBoundingBox();this.geometry.computeBoundingSphere();
  this.mesh.userData.flexState={from,to,t,amount,sideSensorPhase:amount<2?'route':amount<3?'insert':'seated',entry:end.toArray(),matingAxis:[0,0,-1],tailLength:this.tail.getLength(),targetTailLength:this.length,wireRadius:.5,sleeveRadius:this.radius};
 }
 guide(to=3,from=1){const points=Array.from({length:41},(_,i)=>this.endpoint(T.MathUtils.lerp(Math.max(1,from),to,i/40)).multiplyScalar(.001));points.targetIndex=points.length-1;return points;}
}

// Integration: call after createElectronics and before createFasteners, adopt
// .meshes, and pass .entities through createFasteners' existing additions hook.
export async function createSideSensorAssembly(meshes){
 const [data]=await Promise.all([fetch('./assets/electronics/boards.json').then(r=>{if(!r.ok)throw Error('Side-sensor PCB reference unavailable');return r.json();}),loadMolexCad()]);
 const board=data.boards.find(b=>b.key==='xBuddyExtension');if(!board)throw Error('xBuddy extension reference missing');
 const refinement=removeIllustrativeSocket(meshes,board),frame=sideSensorSocketFrame(board);
 const sockets=['resin','tin'].map((material,i)=>{
  const g=molexGeometry('5025850370',material).applyMatrix4(frame).scale(.001,.001,.001),m=new T.Mesh(g,new T.MeshStandardMaterial({color:i?'#b7babe':'#e4dbb7',roughness:i?.34:.65,metalness:i?.75:.02}));
  m.name='FILAMENT / '+material;m.userData={part:'xBuddyExtension',cadName:'FILAMENT · Molex 502585-0370',supplement:true,preserveColours:true,preserveCadName:true,connector:'sideFilament',manufacturerPart:'5025850370',source:SIDE_SENSOR_SOURCES.schematic};m.castShadow=true;return m;
 });
 const cable=new SideSensorCable(frame),mountedSensorLead=createMountedSensorLead(meshes,cable);
 return {meshes:[...sockets,mountedSensorLead.mesh],entities:[cable],mountedSensorLead,refinement,frame:frame.toArray(),board};
}
