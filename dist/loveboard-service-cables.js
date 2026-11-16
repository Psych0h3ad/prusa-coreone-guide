import * as T from 'three';
import {canWriteLoadedCurvedPort,writeLoadedCurvedPort,loveboardNativeFrame} from './loaded-curved-port.js';
import {createNativeJ13Plug,nativeJ13PinOffsets,nativeJ13WireCentre,nativeJ13Motion} from './native-j13.js?v=20261114-129';
import {SOCKETS,socketCentre} from './loveboard-layout.js?v=20261111-94';
import {ServiceFanCurve} from './service-fan-frame.js?v=20261111-94';
import {LOVEBOARD_ROUTES}from './loveboard-service-routing.js?v=20261111-94';
import {HALL_CABLE}from './hall-sensor-layout.js?v=20261111-94';
import {PARTS}from './data.js?v=20261112-113';
import {createClikMatePlug,clikMateMotion,clikMatePress}from './clik-mate-plug.js?v=20261111-94';
import {molexWireEntry}from './molex-frames.js?v=20261111-94';
import {HEATSINK_NTC}from './heatsink-ntc-layout.js?v=20261111-94';
import {LOAD_CELL_BENCH_ROUTE}from './loadcell-bench-routing.js?v=20261111-94';
import {MOTOR_SENSOR_BENCH_ROUTES}from './motor-sensor-bench-routing.js?v=20261111-94';
import {FILAMENT_SERVICE_ROUTE,FILAMENT_SERVICE_RELIEF,FILAMENT_SERVICE_UNPLUG}from './filament-service-routing.js?v=20261111-94';
import {MAIN_CABLE_ENTRY}from './main-cable-entry.js?v=20261111-94';
import {MainCableCurve}from './main-cable-curve.js?v=20261111-94';
// Cable paths and plug shells illustrate access. Pin counts, pitch and mating
// axes use the shared schematic-based board frames; this is not a pin-out.
// The factory cable lengths and free curves are explanatory display geometry.
export const LOVEBOARD_CABLE_DEFINITIONS=[
 {id:'lbMotorLead',socket:'J4',fanoutStart:.9,fanoutEnd:.95,routeShape:{sourceDirection:[-1,0,0],length:50},sourceAcross:[0,1,0],bundlePitch:.7,colors:['#2877b8','#282b2d','#c44436','#dedbd0'],withdraw:8,looseDelta:[0,5,14],points:[[9,-36.15,416]]},
 {id:'lbNtcLead',socket:'J12',colors:['#303335','#303335'],sourceAnchors:HEATSINK_NTC.sourceAnchors,sourceAcross:HEATSINK_NTC.sourceAcross,sourceDirection:HEATSINK_NTC.sourceDirection,bundlePitch:1,wireRadius:HEATSINK_NTC.wireRadius,withdraw:8,looseDelta:[-7.4038536863,-26.9047476002,-6.3767213562],points:[HEATSINK_NTC.source,[1.2233865,-41.395252,335.0199355],[-5,-44,336],[-7,-47.5,340],[-7,-47.5,352],[-7,-47.5,364],[-7,-47.5,367],[-13.5,-47.5,369.5],[-19,-47.5,373],[-19,-52,381],[-19,-52.5,395],[-17.5961463137,-44,401.3767213562]]},
 // Visible factory loom exit below the motor, estimated from guide6.52 photos.
 // The internal loadcell wiring and the display cable length are not OEM CAD.
 {id:'lbLoadcellLead',socket:'J14',fanoutStart:.9,fanoutEnd:.95,strandUp:[0,0,1],routeShape:{sourceDirection:[0,1,0],length:47},sourceDirection:[0,1,0],withdraw:8,looseDelta:[10,-4,8],sourceAcross:[1,0,0],bundlePitch:.7,colors:['#d7d8ce','#c34538','#343737','#2779b6'],points:[[31.2,-55.4,376.7]]},
 {id:'lbFilamentLead',socket:'J2',fanoutStart:.9,fanoutEnd:.95,strandUp:[0,0,1],colors:Array(3).fill(HALL_CABLE.color),withdraw:9,looseDelta:[14,0,0],sourceAnchors:HALL_CABLE.pads,bundlePitch:HALL_CABLE.pitch,points:[[24.556553678702826,-54.5952524055465,382.74208359075567],[25.4,-54.5952524,382.45],[26.2,-54.5952524,382.15],[27.2,-54.5952524,381.8],[28.2,-54.5952524,381.5],[29.2,-54.5952524,381.2],[30.2,-54.5952524,381.2],[31.4,-54.5952524,381.2],[31.8,-53,382],[31.8,-51,383],[31.8,-49,384],[31.8,-47,385],[31.8,-45,386],[31.8,-43,387],[31.8,-41,388],[31.8,-39,388],[31.8,-37,388],[31.8,-35,386.2],[32.5,-33,385.4082214],[33.5,-31,385.4082214],[33.5,-29.5,385.4082214],[32.5,-28.5952524,385.4082214],[30.5,-28.5952524,385.4082214]]},
 {id:'lbMainLead',socket:'J13',colors:Array.from({length:22},(_,i)=>['#2878ba','#303438','#e3dfd0','#c33c35'][i%4]),withdraw:8,looseDelta:[-14,-8,0],points:[[23.4,-21.2,441.7],[29,-18.2,434],[30.6,-17.4,428.2],[28.56,-18.47,421.54],[14,-18,405],[1,-18,392],[-9,-18,379],[-13.1,-18,375],[-13.1,-18,367],[-13.1,-18,367],[-13.1,-35,367],[-13.1,-35,367],[-22,-44,380],[-25,-45,386.4337]]}
];
const samples=80,sides=6,unit=.001,vec=p=>new T.Vector3(...p),material=color=>{const m=new T.MeshStandardMaterial({color,roughness:.8});m.userData.originalColor=m.color.clone();m.userData.originalOpacity=1;return m;};
export class LoveBoardServiceCable{
 constructor(d){
  this.id=d.id;this.definition=d;const s=SOCKETS[d.socket];this.socket=s;this.out=vec(s.out);this.origin=vec(socketCentre(d.socket));
  this.across=vec(s.out[0]?[0,1,0]:[1,0,0]);this.up=this.out.clone().negate().cross(this.across).normalize();
  const vertical=!!s.out[1],right=!!s.out[0],[l,t,r,b]=s.rect,width=vertical||!right?(r-l)*.0586:s.height,height=vertical||right?(b-t)*.0586:s.height;
  this.pinOffsets=Array.from({length:s.pins},(_,k)=>{const along=(k%(s.pins/s.rows)-(s.pins/s.rows-1)/2)*s.pitch,across=(Math.floor(k/(s.pins/s.rows))-(s.rows-1)/2)*3;return new T.Vector2(vertical||right?across:along,vertical||right?-along:-across);});
  const w=width-1.5,h=height-1.5,shape=new T.Shape();shape.moveTo(-w/2,-h/2);shape.lineTo(w/2,-h/2);shape.lineTo(w/2,h/2);shape.lineTo(-w/2,h/2);shape.closePath();
  for(const p of this.pinOffsets){const q=new T.Path();q.moveTo(p.x-.42,p.y-.42);q.lineTo(p.x-.42,p.y+.42);q.lineTo(p.x+.42,p.y+.42);q.lineTo(p.x+.42,p.y-.42);q.closePath();shape.holes.push(q);}
  const shell=new T.ExtrudeGeometry(shape,{depth:7.5,bevelEnabled:false,steps:1}),raw=shell.index?shell.toNonIndexed():shell;this.shellPosition=raw.attributes.position.array.slice();this.shellNormal=raw.attributes.normal.array.slice();shell.dispose();if(raw!==shell)raw.dispose();
  if(d.socket==='J13'&&d.nativeJ13===true){
   this.nativeJ13=true;this.clikMate=createNativeJ13Plug();this.pinOffsets=nativeJ13PinOffsets();this.shellPosition=this.clikMate.positions;this.shellNormal=this.clikMate.normals;
  }
  if(s.rows===1){
   this.clikMate=createClikMatePlug(s.pins);const c=this.clikMate;
   const m=vertical||right?new T.Matrix4().set(0,-1,0,0,1,0,0,0,0,0,1,0,0,0,0,1):new T.Matrix4();
   const p=new T.Vector3(),normal=new T.Matrix3().setFromMatrix4(m);
   for(const name of ['positions','pressedPositions'])for(let i=0;i<c[name].length;i+=3)p.fromArray(c[name],i).applyMatrix4(m).toArray(c[name],i);
   for(const name of ['normals','pressedNormals'])for(let i=0;i<c[name].length;i+=3)p.fromArray(c[name],i).applyMatrix3(normal).toArray(c[name],i);
   this.shellPosition=c.positions;this.shellNormal=c.normals;
  }
  this.tail=this.nativeJ13?nativeJ13WireCentre():s.manufacturerPart?molexWireEntry(d.socket):this.origin.clone().addScaledVector(this.out,s.out[0]?1.5:3.5);this.connected=[...d.points.map(vec),this.tail.clone().addScaledVector(this.out,s.out[0]?.7:5),this.tail.clone()];
  this.unrouted=d.id==='lbMainLead'?this.connected.map((p,i)=>p.clone().add(new T.Vector3(0,i<5?8*Math.sin(Math.PI*i/5):0,0))):null;
  const seated=this.unrouted||this.connected,delta=vec(d.looseDelta||s.out.map(x=>x*22)),withdraw=this.out.clone().multiplyScalar(d.withdraw||22);
  const displaced=delta=>seated.map((p,i)=>p.clone().addScaledVector(delta,T.MathUtils.smoothstep(i/(seated.length-1),d.sourceAnchors?8/(seated.length-1):d.id==='lbLoadcellLead'?(seated.length-20)/(seated.length-1):d.id==='lbMainLead'?(seated.length-4)/(seated.length-1):s.out[0]?(seated.length-10)/(seated.length-1):.28,d.sourceAnchors?(seated.length-4)/(seated.length-1):d.sourceAcross?(seated.length-7)/(seated.length-1):d.id==='lbMainLead'?(seated.length-2)/(seated.length-1):s.out[0]?(seated.length-2)/(seated.length-1):.8)));
  this.loose=displaced(delta);this.withdrawn=displaced(withdraw);
  this.poses=this.unrouted?[{at:0,points:this.loose},{at:.25,points:this.withdrawn},{at:.5,points:this.unrouted},{at:1,points:this.connected}]:[{at:0,points:this.loose},{at:.55,points:this.withdrawn},{at:1,points:this.connected}];
  if(d.routeShape){
   const source=vec(d.points[0]),shape=tail=>[source.clone(),source.clone().addScaledVector(vec(d.routeShape.sourceDirection),15),tail.clone().addScaledVector(this.out,15),tail.clone()];
   this.connected=shape(this.tail);this.loose=shape(this.tail.clone().add(delta));this.withdrawn=shape(this.tail.clone().add(withdraw));
   this.poses=[{at:0,points:this.loose},{at:.55,points:this.withdrawn},{at:1,points:this.connected}];
  }
  this.basePoses=this.poses;const route=LOVEBOARD_ROUTES[d.id];if(route)this.poses=route.stages.map(p=>({at:p.at,points:p.points.map(vec)}));
  const bench=d.id==='lbLoadcellLead'?LOAD_CELL_BENCH_ROUTE:MOTOR_SENSOR_BENCH_ROUTES[d.id];
  if(bench)this.poses=[...bench.stages.filter(p=>p.at<0).map(p=>({at:p.at,points:p.points.map(vec)})),...this.poses];
  if(d.id==='lbFilamentLead')this.poses=FILAMENT_SERVICE_ROUTE.stages.map(p=>({at:p.at,roll:p.roll,points:p.points.map(vec)}));
  if(d.id==='lbFilamentLead')this.reliefPoses=FILAMENT_SERVICE_RELIEF.stages.map(p=>({at:p.at,points:p.points.map(vec)}));
  if(d.id==='lbFilamentLead')this.servicePoses=FILAMENT_SERVICE_UNPLUG.stages.map(p=>({at:p.at,points:p.points.map(vec)}));
  const controls=this.poses.at(-1).points;if(this.poses.some(p=>p.points.length!==controls.length))throw Error('Cable poses need matching control-point counts: '+d.id);
  const Curve=d.id==='lbMainLead'?MainCableCurve:ServiceFanCurve;this.curve=new Curve(controls.map(p=>p.clone()));this.fixedEntryLength=this.curve.entryLength||0;this.curve.arcLengthDivisions=320;
  if(d.id==='lbMainLead'){
   const base=new MainCableCurve(this.connected.map(p=>p.clone()));base.arcLengthDivisions=320;const tangents=Array.from({length:samples+1},(_,i)=>base.getTangentAt(i/samples));let row=this.across.clone();for(let i=samples-1;i>=0;i--){row.applyQuaternion(new T.Quaternion().setFromUnitVectors(tangents[i+1],tangents[i]));row.addScaledVector(tangents[i],-row.dot(tangents[i])).normalize();}this.anchorAcross=row;
  }else if(d.sourceAnchors||d.sourceAcross){
   this.anchorAcross=vec(d.sourceAcross||[0,1,0]);
   if(d.id==='lbNtcLead'){
    // J12's pin row uses the frame's up axis. Align that axis to the two
    // actual sensor lead ends, rather than twisting them together as the
    // fixed source-anchor correction fades into the free cable.
    this.anchorAcross=vec(d.sourceDirection).cross(vec(d.sourceAcross)).normalize();
   }
  }
  const per=(samples+1)*(sides+1),count=per*s.pins,pos=new Float32Array(count*3+this.shellPosition.length),normal=new Float32Array(pos.length),indices=[],g=new T.BufferGeometry();
  g.setAttribute('position',new T.BufferAttribute(pos,3).setUsage(T.DynamicDrawUsage));g.setAttribute('normal',new T.BufferAttribute(normal,3).setUsage(T.DynamicDrawUsage));
  // Ring normals use tangent × row; wind only the tube faces outward.
  for(let wire=0;wire<s.pins;wire++){const start=indices.length;for(let i=0;i<samples;i++)for(let j=0;j<sides;j++){const a=wire*per+i*(sides+1)+j,b=a+sides+1;indices.push(a,a+1,b,b,a+1,b+1);}g.addGroup(start,indices.length-start,wire);}
  const start=indices.length;for(let i=0;i<this.shellPosition.length/3;i++)indices.push(count+i);g.addGroup(start,indices.length-start,s.pins);g.setIndex(indices);this.geometry=g;
  this.mesh=new T.Mesh(g,[...d.colors.map(material),material('#e9e2d2')]);this.mesh.userData={part:'hotendLeads',component:d.id,flexId:d.id,serviceTask:'loveboard',cadName:d.socket,supplement:true,illustration:true,...(this.nativeJ13?{manufacturerPart:'5031492200',toolOnly:true,componentOnly:true,nativeSourceFaces:this.clikMate.sourceFaces,sourceMeshSHA256:this.clikMate.sourceMeshSHA256,geometryOrigin:this.clikMate.geometryOrigin,manufacturerCAD:this.clikMate.manufacturerCAD,elasticReferenceOnly:true,illustrationRegistration:true}:{})};this.mesh.castShadow=false;this.update(1,1,1);
 }
 update(from,to,t){
  if(!canWriteLoadedCurvedPort(this))return;
  const neighbor=this.neighbor?.mesh.userData.flexState?.amount??1,key=`${from}:${to}:${t}:${neighbor}`;if(this.lastKey===key)return;this.lastKey=key;const u=T.MathUtils.clamp(t,0,1),motion=this.nativeJ13?nativeJ13Motion(from,to,t):this.clikMate?clikMateMotion(from,to,t):null,amount=motion?motion.amount:T.MathUtils.lerp(from,to,u*u*(3-2*u));
  const poses=this.reliefPoses&&amount===1?this.reliefPoses:this.servicePoses&&neighbor===0?this.servicePoses:this.poses,routeAmount=poses===this.reliefPoses?T.MathUtils.clamp(neighbor,0,1):amount;
  let hi=poses.findIndex(p=>p.at>=routeAmount);if(hi<1)hi=1;const a=poses[hi-1].points,b=poses[hi].points,blend=T.MathUtils.clamp((routeAmount-poses[hi-1].at)/(poses[hi].at-poses[hi-1].at),0,1);
  this.curve.points.forEach((p,i)=>p.lerpVectors(a[i],b[i],blend));this.curve.updateArcLengths();
  const centres=Array.from({length:samples+1},(_,i)=>this.curve.getPointAt(i/samples)),tangents=centres.map((_,i)=>this.curve.getTangentAt(i/samples)),rows=[];rows[samples]=this.across.clone();
  if(this.anchorAcross){
   rows[0]=this.anchorAcross.clone();for(let i=1;i<=samples;i++){rows[i]=rows[i-1].clone().applyQuaternion(new T.Quaternion().setFromUnitVectors(tangents[i-1],tangents[i]));rows[i].addScaledVector(tangents[i],-rows[i].dot(tangents[i])).normalize();}
   let roll=Math.atan2(rows[samples].clone().cross(this.across).dot(tangents[samples]),rows[samples].dot(this.across));
   const reference=T.MathUtils.lerp(poses[hi-1].roll??NaN,poses[hi].roll??NaN,blend);if(Number.isFinite(reference)){while(roll-reference>Math.PI)roll-=2*Math.PI;while(roll-reference<-Math.PI)roll+=2*Math.PI;}
   // This cable's strand centres use the fixed vertical pin row. A continuous
   // radial phase avoids a facet-frame flip as its held loop changes winding.
   const phase=T.MathUtils.lerp(poses[hi-1].frameRoll??NaN,poses[hi].frameRoll??NaN,blend);if(this.id==='lbLoadcellLead'&&Number.isFinite(phase))roll=phase;
   for(let i=0;i<=samples;i++)rows[i].applyAxisAngle(tangents[i],roll*T.MathUtils.smoothstep(i/samples,this.definition.sourceAnchors?.6:this.id==='lbMotorLead'?.2:.4,this.definition.sourceAnchors?.86:this.id==='lbMotorLead'?.5:.75));
  }else for(let i=samples-1;i>=0;i--){rows[i]=rows[i+1].clone().applyQuaternion(new T.Quaternion().setFromUnitVectors(tangents[i+1],tangents[i]));rows[i].addScaledVector(tangents[i],-rows[i].dot(tangents[i])).normalize();}
  const pos=this.geometry.attributes.position,norm=this.geometry.attributes.normal,per=(samples+1)*(sides+1),p=new T.Vector3(),normal=new T.Vector3();
  // Keep the motor bundle frame away from its bend tangent. Projecting a
  // nearly parallel row otherwise flips the outer strands through the loop.
  const motorRows=this.id==='lbMotorLead'?tangents.map((t,i)=>{const r=vec(this.definition.sourceAcross).lerp(this.across,T.MathUtils.smoothstep(i/samples,.4,.9));r.z+=.7*Math.sin(Math.PI*i/samples);return r.addScaledVector(t,-r.dot(t)).normalize();}):null;
  for(let wire=0;wire<this.socket.pins;wire++){
   const base=this.definition.bundlePitch?this.definition.bundlePitch/this.socket.pitch:.18,a=this.pinOffsets[wire];
   const centre=i=>{const taper=base+(1-base)*T.MathUtils.smoothstep(i/samples,this.definition.fanoutStart??(this.definition.sourceAnchors?.90:this.definition.sourceAcross?.80:this.id==='lbMainLead'?.92:.86),this.definition.fanoutEnd??(this.definition.sourceAnchors?.97:this.definition.sourceAcross?.94:1)),row=motorRows?motorRows[i]:rows[i],up=this.definition.strandUp?vec(this.definition.strandUp).addScaledVector(tangents[i],-vec(this.definition.strandUp).dot(tangents[i])).normalize():this.id==='lbLoadcellLead'?row.clone().cross(tangents[i]):tangents[i].clone().cross(row);return centres[i].clone().addScaledVector(row,a.x*taper).addScaledVector(up,a.y*taper);};
   let strand=this.definition.sourceAcross?centres.map((_,i)=>centre(i)):undefined;
   if(this.definition.bundleTwist){const {radius,pitch}=this.definition.bundleTwist;strand=centres.map((c,i)=>{const u=i/samples,w=T.MathUtils.smoothstep(u,.04,.15)*(1-T.MathUtils.smoothstep(u,.78,.95)),angle=wire/this.socket.pins*Math.PI*2+u*this.curve.getLength()/pitch*Math.PI*2,compact=c.clone().addScaledVector(rows[i],radius*Math.cos(angle)).addScaledVector(tangents[i].clone().cross(rows[i]),radius*Math.sin(angle));return centre(i).lerp(compact,w);});}
   if(this.definition.sourceAnchors){
    const offset=vec(this.definition.sourceAnchors[wire]).sub(centre(0));
    strand=centres.map((_,i)=>centre(i).addScaledVector(offset,1-T.MathUtils.smoothstep(i/samples,0,.23)));
   }
   for(let i=0;i<=samples;i++){
    const c=strand?strand[i]:centre(i),tangent=i===0&&this.definition.sourceDirection?vec(this.definition.sourceDirection).normalize():strand?strand[Math.min(samples,i+1)].clone().sub(strand[Math.max(0,i-1)]).normalize():tangents[i],row=strand?rows[i].clone().addScaledVector(tangent,-rows[i].dot(tangent)).normalize():rows[i],up=tangent.clone().cross(row);
    for(let j=0;j<=sides;j++){const angle=j/sides*Math.PI*2,k=wire*per+i*(sides+1)+j;normal.copy(row).multiplyScalar(Math.cos(angle)).addScaledVector(up,Math.sin(angle));p.copy(c).addScaledVector(normal,this.definition.wireRadius??.26).multiplyScalar(unit);pos.setXYZ(k,p.x,p.y,p.z);norm.setXYZ(k,normal.x,normal.y,normal.z);}
   }
  }
  const pressed=new T.Vector3(),axis=this.out.clone().negate(),frame=new T.Matrix4().makeBasis(this.across,this.up,axis).setPosition(centres[samples]);
  const latch=motion?clikMatePress(motion,centres[samples].clone().sub(this.tail).dot(this.out)):0;
  if(this.nativeJ13)this.clikMate.write(latch);
  for(let i=0;i<this.shellPosition.length/3;i++){const k=(this.geometry.userData.loadedShellOffset??per*this.socket.pins)+i;p.fromArray(this.nativeJ13?this.clikMate.posedPositions:this.shellPosition,i*3);if(this.clikMate&&!this.nativeJ13)p.lerp(pressed.fromArray(this.clikMate.pressedPositions,i*3),latch);p.applyMatrix4(frame).multiplyScalar(unit);pos.setXYZ(k,p.x,p.y,p.z);normal.fromArray(this.nativeJ13?this.clikMate.posedNormals:this.shellNormal,i*3);if(this.clikMate&&!this.nativeJ13)normal.lerp(pressed.fromArray(this.clikMate.pressedNormals,i*3),latch);normal.transformDirection(frame);norm.setXYZ(k,normal.x,normal.y,normal.z);}
  if(this.socket.rows===1)writeLoadedCurvedPort(this,loveboardNativeFrame(this,frame));
  pos.needsUpdate=true;norm.needsUpdate=true;this.geometry.computeBoundingBox();this.geometry.computeBoundingSphere();this.mesh.userData.flexState={from,to,t,amount,latch,connectorPhase:motion?.phase,length:this.curve.getLength(),neighborAmount:neighbor};
  if(this.dependent){const q=this.dependent.mesh.userData.flexState;this.dependent.update(q.from,q.to,q.t);}
 }
 guide(to=1,from=0){
  if(this.id==='lbNtcLead'&&Math.min(from,to)<0){
   const pose=amount=>{let hi=this.poses.findIndex(p=>p.at>=amount);if(hi<1)hi=1;const a=this.poses[hi-1],b=this.poses[hi],t=T.MathUtils.clamp((amount-a.at)/(b.at-a.at),0,1);return new ServiceFanCurve(a.points.map((p,i)=>p.clone().lerp(b.points[i],t)));};
   const routed=pose(0),hook=new T.Vector3(-7,-47.5,360);let u=0,best=Infinity;
   for(let i=0;i<=80;i++){const d=routed.getPointAt(i/80).distanceToSquared(hook);if(d<best){u=i/80;best=d;}}
   const points=Array.from({length:17},(_,i)=>pose(T.MathUtils.lerp(from,to,i/16)).getPointAt(u).multiplyScalar(unit));points.targetIndex=points.length-1;return points;
  }
  if(this.id==='lbMainLead')return [...MAIN_CABLE_ENTRY.map(vec),...this.connected].map(p=>p.clone().multiplyScalar(unit));
  const tailAt=amount=>{let hi=this.poses.findIndex(p=>p.at>=amount);if(hi<1)hi=1;const a=this.poses[hi-1],b=this.poses[hi],t=T.MathUtils.clamp((amount-a.at)/(b.at-a.at),0,1);return a.points.at(-1).clone().lerp(b.points.at(-1),t).multiplyScalar(unit);};
  const low=Math.min(from,to),high=Math.max(from,to),amounts=[from,...this.basePoses.map(p=>p.at).filter(t=>t>low&&t<high).sort((a,b)=>to>from?a-b:b-a),to],points=[];
  for(const amount of amounts){const p=tailAt(amount);if(!points.length||p.distanceTo(points.at(-1))>1e-9)points.push(p);}
  for(let i=points.length-2;i>0;i--){const a=points[i].clone().sub(points[i-1]),b=points[i+1].clone().sub(points[i]);if(a.clone().cross(b).length()<1e-12&&a.dot(b)>=0)points.splice(i,1);}
  points.targetIndex=points.length-1;return points;
 }
}
export function installNextruderCables(viewer){
 PARTS.nextruderCables??={name:'Nextruderの配線',en:'Nextruder cables',desc:'NextruderとLoveBoardをつなぐケーブル。',icon:'cable',offset:[0,40,0]};
 // Focus the sensor seating face without including its attached free cable.
 for(const m of viewer.meshes)if(m.userData.cadIndex===806)m.userData.component='heatsinkNtc';
 const parents={lbMotorLead:790,lbLoadcellLead:794,lbFilamentLead:794};
 for(const d of LOVEBOARD_CABLE_DEFINITIONS.filter(d=>parents[d.id])){
  if(viewer.fasteners.entities.has(d.id))continue;
  const e=new LoveBoardServiceCable(d),m=e.mesh;delete m.userData.serviceTask;
  Object.assign(m.userData,{part:'nextruderCables',cadPath:[787,788,789,parents[d.id]],cadName:d.id==='lbMotorLead'?'Eモーターのケーブル':d.id==='lbLoadcellLead'?'ロードセルのケーブル':'フィラメントセンサーのケーブル'});
  viewer.fasteners.entities.set(d.id,e);viewer.fasteners.meshes.push(m);
 }
 coupleSensorLeads(viewer);
}
function coupleSensorLeads(viewer){const load=viewer.fasteners.entities.get('lbLoadcellLead'),sensor=viewer.fasteners.entities.get('lbFilamentLead');if(load&&sensor){load.dependent=sensor;sensor.neighbor=load;}}
export function installLoveBoardServiceCables(viewer){for(const d of LOVEBOARD_CABLE_DEFINITIONS){if(viewer.fasteners.entities.has(d.id))continue;const e=new LoveBoardServiceCable(d.id==='lbMainLead'?{...d,nativeJ13:true}:d),m=e.mesh;viewer.fasteners.entities.set(d.id,e);viewer.fasteners.meshes.push(m);viewer.group(m.userData.part).add(m);viewer.meshes.push(m);viewer.records.push({key:m.userData.part,name:d.socket,mesh:m,id:m.uuid});m.userData.restPosition=m.position.clone();m.userData.restQuaternion=m.quaternion.clone();}coupleSensorLeads(viewer);}
