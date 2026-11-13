import * as T from 'three';
import {XBUDDY_BOARD_ORIGIN,XBUDDY_PORTS,xBuddyPortCentre}from './xbuddy-layout.js?v=20261111-94';
import {ServiceFanCurve}from './service-fan-frame.js?v=20261111-94';

// These service illustrations stop at the upper cable-bundle boundary. The
// remaining harness, crimp/latch details and sensor ends are not supplier CAD.
// Port identity, wire colours and mating direction follow the official guide;
// two circuits at1.50mm and9.70mm mated height follow the Molex502584 family.
export const XBUDDY_SENSOR_LEADS=[
 {id:'xbBedTempLead',port:'BED_TEMP',colours:['#292c2d','#292c2d'],tag:true,park:[-180,232,95],prefix:[[-143.5,180.5,210],[-143.5,180.5,195],[-143.5,180.5,180],[-143.5,180.5,158],[-143.5,180.5,137],[-143.5,180.5,114],[-132,193,91],[-109,193,74]]},
 {id:'xbDoorLead',port:'A_TEMP',colours:['#e1dfd6','#73503d'],park:[-170,216,115],prefix:[[-140,184,210],[-140,184,195],[-140,184,180],[-138,184,170],[-130,184,166],[-113,186,160],[-80,192,151],[-65,197,141]]}
];
const vec=p=>new T.Vector3(...p),samples=96,sides=8,per=(samples+1)*(sides+1),ease=t=>{t=T.MathUtils.clamp(t,0,1);return t*t*(3-2*t);};
const material=colour=>{const m=new T.MeshStandardMaterial({color:colour,roughness:.8});m.userData.originalColor=m.color.clone();m.userData.originalOpacity=1;return m;};
export class XBuddySensorCable{
 constructor(definition){
  this.id=definition.id;this.definition=definition;this.port=XBUDDY_PORTS.find(p=>p.key===definition.port);
  const centre=xBuddyPortCentre(this.port);centre[1]=XBUDDY_BOARD_ORIGIN[1]+9.7;this.tail=vec(centre);
  this.connected=[...definition.prefix.map(vec),this.tail.clone().add(new T.Vector3(0,11,0)),this.tail.clone()];
  this.curve=new ServiceFanCurve(this.connected.map(p=>p.clone()));this.curve.arcLengthDivisions=64;
  const withdrawn=this.connected.map((p,i)=>p.clone().add(new T.Vector3(0,12*ease((i-4)/(this.connected.length-6)),0)));
  const [side,back,z]=definition.park,neck=[[definition.tag?-122:-128,definition.tag?175:182,190],[definition.tag?-117:-123,definition.tag?175:183,190]];
  const parked=[...this.connected.slice(0,2).map(p=>p.clone()),...neck.concat([[definition.tag?-114:-122,back,184],[side,back+2,180],[side-8,back+2,160],[side-8,back+6,z+25],[side,back+11,z],[side,back,z]]).map(vec)];
  const extended=[...this.connected.slice(0,2).map(p=>p.clone()),...neck.concat([[definition.tag?-114:-122,definition.tag?226:216,184],[this.connected[5].x,218,155],[this.connected[6].x,219,Math.max(135,this.connected[6].z)],[this.connected[7].x,220,Math.max(98,this.connected[7].z)],[this.tail.x,227,this.tail.z],[this.tail.x,216,this.tail.z]]).map(vec)];
  if(definition.tag)for(const route of[parked,extended])for(const i of[2,3,4])route[i].z+=8;
  const inside=withdrawn.map(p=>p.clone());if(definition.tag)for(const i of[3,4,5])inside[i].x=-129;
  const raw=amount=>{const [a,b,t]=amount<.4?[parked,extended,ease(amount/.4)]:amount<.6?[extended,inside,ease((amount-.4)/.2)]:amount<.72?[inside,withdrawn,ease((amount-.6)/.12)]:[withdrawn,this.connected,ease((amount-.72)/.28)];return a.map((p,i)=>p.clone().lerp(b[i],t));};
  const length=points=>{this.curve.points=points;this.curve.updateArcLengths();return this.curve.getLength();};
  this.length=Math.max(...[0,.4,.6,.72,1,...Array.from({length:65},(_,i)=>i/64)].map(amount=>length(raw(amount))))+1;
  this.poseAmounts=[...new Set([.4,.6,.72,...Array.from({length:257},(_,i)=>i/256)])].sort((a,b)=>a-b);
  this.poses=this.poseAmounts.map(amount=>{const points=raw(amount),direction=new T.Vector3(definition.tag?ease((amount-.4)/.32):0,1-ease((amount-.4)/.32),definition.tag?0:ease((amount-.4)/.32)).normalize(),shaped=bulge=>points.map((p,k)=>p.clone().addScaledVector(direction,bulge*(k===5||k===6?1:k===7?.5:0)));let lo=0,hi=90;while(length(shaped(hi))<this.length&&hi<360)hi*=2;for(let j=0;j<20;j++){const mid=(lo+hi)/2;if(length(shaped(mid))<this.length)lo=mid;else hi=mid;}return shaped((lo+hi)/2);});
  // A hollow plug leaves both mating contact positions open. The envelope
  // remains registered to the existing photo-derived receptacle footprint.
  const [u0,v0,u1,v1]=this.port.rect,w=u1-u0-1.7,d=v1-v0-1.7,shape=new T.Shape([[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[.85,d/2],[.85,d/2-.65],[-.85,d/2-.65],[-.85,d/2],[-w/2,d/2]].map(p=>new T.Vector2(...p)));
  for(const sign of[-1,1]){const hole=new T.Path();hole.absarc(0,sign*.75,.5,0,2*Math.PI,true);shape.holes.push(hole);}
  const shell=new T.ExtrudeGeometry(shape,{depth:8.3,bevelEnabled:false,curveSegments:12});
  // (x,z,depth) -> (x,-depth,z) is a proper rotation; open nose is below tail.
  shell.applyMatrix4(new T.Matrix4().set(1,0,0,0,0,0,-1,0,0,1,0,0,0,0,0,1));
  const positions=shell.attributes.position,normals=shell.attributes.normal,keptPosition=[],keptNormal=[],aa=new T.Vector3(),bb=aa.clone(),cc=aa.clone();
  // Closed arc endpoints can duplicate a zero-area face after float storage.
  for(let i=0;i<positions.count;i+=3){aa.fromBufferAttribute(positions,i);bb.fromBufferAttribute(positions,i+1);cc.fromBufferAttribute(positions,i+2);if(bb.sub(aa).cross(cc.sub(aa)).lengthSq()<1e-16)continue;for(let j=0;j<3;j++){keptPosition.push(positions.getX(i+j),positions.getY(i+j),positions.getZ(i+j));keptNormal.push(normals.getX(i+j),normals.getY(i+j),normals.getZ(i+j));}}
  this.shellPosition=new Float32Array(keptPosition);this.shellNormal=new Float32Array(keptNormal);this.plugRange={start:per*3,count:keptPosition.length/3};shell.dispose();
  const tag=[];function box(x,y,z,w,h,d,mat){const g=new T.BoxGeometry(w,h,d);g.translate(x,y,z);tag.push({position:g.attributes.position.array.slice(),normal:g.attributes.normal.array.slice(),index:Array.from(g.index.array),mat});g.dispose();}
  if(definition.tag){box(0,0,0,5,.45,5,4);box(-1.1,.24,0,.55,.06,3,5);box(1.1,.24,0,.55,.06,3,5);box(0,.24,0,2.2,.06,.5,5);}
  this.tagParts=tag;const count=per*3+this.shellPosition.length/3+tag.reduce((n,g)=>n+g.position.length/3,0),g=this.geometry=new T.BufferGeometry(),indices=[];
  g.setAttribute('position',new T.BufferAttribute(new Float32Array(count*3),3).setUsage(T.DynamicDrawUsage));g.setAttribute('normal',new T.BufferAttribute(new Float32Array(count*3),3).setUsage(T.DynamicDrawUsage));
  for(let wire=0;wire<3;wire++){const start=indices.length;for(let i=0;i<samples;i++)for(let j=0;j<sides;j++){const a=wire*per+i*(sides+1)+j,b=a+sides+1;indices.push(a,a+1,b,b,a+1,b+1);}g.addGroup(start,indices.length-start,wire);}
  let offset=per*3,start=indices.length;for(let i=0;i<this.shellPosition.length/3;i++)indices.push(offset+i);g.addGroup(start,indices.length-start,3);offset+=this.shellPosition.length/3;
  for(const part of tag){start=indices.length;indices.push(...part.index.map(i=>i+offset));g.addGroup(start,indices.length-start,part.mat);offset+=part.position.length/3;}
  g.setIndex(indices);this.mesh=new T.Mesh(g,['#25292b',...definition.colours,'#e7dfcf','#42824c','#f2f1e8'].map(material));
  this.mesh.userData={part:definition.id,component:definition.id,flexId:definition.id,serviceTask:'xbuddy',toolOnly:true,illustration:true,preserveColours:true,cadName:definition.port+' service lead'};this.mesh.castShadow=false;this.update(1,1,1);
 }
 update(from,to,t){
  const key=from+':'+to+':'+t;if(this.key===key)return;this.key=key;const amount=T.MathUtils.lerp(from,to,ease(t)),hi=Math.max(1,this.poseAmounts.findIndex(a=>a>=amount)),lo=hi-1,blend=(amount-this.poseAmounts[lo])/(this.poseAmounts[hi]-this.poseAmounts[lo]);
  this.curve.points=this.poses[lo].map((p,i)=>p.clone().lerp(this.poses[lo+1][i],blend));this.curve.updateArcLengths();
  // Interpolated control poses lose a little arc length between samples.
  // Recover that slack in the bend, keeping both end frames unchanged.
  const direction=new T.Vector3(this.definition.tag?ease((amount-.4)/.32):0,1-ease((amount-.4)/.32),this.definition.tag?0:ease((amount-.4)/.32)).normalize(),adjust=delta=>{for(const[k,p]of this.curve.points.entries())p.addScaledVector(direction,delta*(k===5||k===6?1:k===7?.5:0));this.curve.updateArcLengths();};
  for(let j=0;j<3;j++){const length=this.curve.getLength(),error=this.length-length;if(Math.abs(error)<.0001)break;adjust(.05);const slope=(this.curve.getLength()-length)/.05;adjust(T.MathUtils.clamp(error/Math.max(.001,slope),-2,2)-.05);}
  const pos=this.geometry.attributes.position,norm=this.geometry.attributes.normal,p=new T.Vector3(),n=new T.Vector3(),across=new T.Vector3(0,0,1),end=this.curve.points.at(-1),length=this.curve.getLength(),split=1-18/length;
  // Transport the plug's wire-spacing frame along the full centreline.
  // A fixed Z projection collapses on the vertical bundle section.
  const frameCount=192,tangents=Array.from({length:frameCount+1},(_,i)=>this.curve.getTangentAt(i/frameCount).normalize()),rows=[];rows[frameCount]=across.clone();
  for(let i=frameCount-1;i>=0;i--){rows[i]=rows[i+1].clone().applyQuaternion(new T.Quaternion().setFromUnitVectors(tangents[i+1],tangents[i]));rows[i].addScaledVector(tangents[i],-rows[i].dot(tangents[i])).normalize();}
  for(let wire=0;wire<3;wire++)for(let i=0;i<=samples;i++){
   const t=wire?split+(1-split)*i/samples:split*i/samples,c=this.curve.getPointAt(t),tangent=this.curve.getTangentAt(t).normalize(),k=Math.min(frameCount-1,Math.floor(t*frameCount)),row=rows[k].clone().lerp(rows[k+1],t*frameCount-k);row.addScaledVector(tangent,-row.dot(tangent)).normalize();const up=tangent.clone().cross(row).normalize(),radius=wire?.42:1.05;
   if(wire)c.addScaledVector(row,(wire===1?-1:1)*.75);
   for(let j=0;j<=sides;j++){const angle=j/sides*Math.PI*2,k=wire*per+i*(sides+1)+j;n.copy(row).multiplyScalar(Math.cos(angle)).addScaledVector(up,Math.sin(angle));p.copy(c).addScaledVector(n,radius).multiplyScalar(.001);pos.setXYZ(k,p.x,p.y,p.z);norm.setXYZ(k,n.x,n.y,n.z);}
  }
  let offset=per*3;for(let i=0;i<this.shellPosition.length/3;i++){p.fromArray(this.shellPosition,i*3).add(end).multiplyScalar(.001);pos.setXYZ(offset+i,p.x,p.y,p.z);n.fromArray(this.shellNormal,i*3);norm.setXYZ(offset+i,n.x,n.y,n.z);}offset+=this.shellPosition.length/3;
  const tagCentre=this.curve.getPointAt(1-8/length);for(const part of this.tagParts){for(let i=0;i<part.position.length/3;i++){p.fromArray(part.position,i*3).add(tagCentre).multiplyScalar(.001);pos.setXYZ(offset+i,p.x,p.y,p.z);n.fromArray(part.normal,i*3);norm.setXYZ(offset+i,n.x,n.y,n.z);}offset+=part.position.length/3;}
  pos.needsUpdate=true;norm.needsUpdate=true;this.geometry.computeBoundingBox();this.geometry.computeBoundingSphere();this.mesh.userData.flexState={from,to,t,amount,length};
 }
 endpoint(amount){const hi=Math.max(1,this.poseAmounts.findIndex(a=>a>=amount)),lo=hi-1,t=(amount-this.poseAmounts[lo])/(this.poseAmounts[hi]-this.poseAmounts[lo]);return this.poses[lo].at(-1).clone().lerp(this.poses[hi].at(-1),t);}
 guide(to=1,from=0){const points=Array.from({length:33},(_,i)=>this.endpoint(T.MathUtils.lerp(from,to,i/32)).multiplyScalar(.001));return points.filter((p,i)=>!i||p.distanceToSquared(points[i-1])>1e-16);}
}
const SENSOR_ACTIONS={
 unplug:['コネクターを抜く','Unplug the connector','Odpojit konektor','Stecker abziehen'],
 lift:['ボックスの縁の外へ出す','Lift clear of the box edge','Zvednout nad okraj boxu','Über den Gehäuserand führen'],
 park:['ボックスの脇によける','Park beside the box','Odložit vedle boxu','Neben dem Gehäuse ablegen'],
 return:['取り付け位置の前へ戻す','Bring in front of the socket','Přesunout před konektor','Vor die Buchse führen'],
 align:['端子の向きを合わせる','Align with the socket','Vyrovnat s konektorem','An der Buchse ausrichten'],
 seat:['コネクターを接続する','Seat the connector','Zapojit konektor','Stecker aufstecken']
};
export function xBuddySensorActors(id,connect,text){
 const definition=XBUDDY_SENSOR_LEADS.find(d=>d.id===id),port=XBUDDY_PORTS.find(p=>p.key===definition.port),tail=xBuddyPortCentre(port);tail[1]=XBUDDY_BOARD_ORIGIN[1]+9.7;
 const points={0:definition.park,.4:[tail[0],216,tail[2]],.72:[tail[0],tail[1]+12,tail[2]],1:tail},phases=connect?[[0,.4,'return'],[.4,.72,'align'],[.72,1,'seat']]:[[1,.72,'unplug'],[.72,.4,'lift'],[.4,0,'park']];
 return phases.map(([from,to,phase])=>{const a=points[from],b=points[to],bounds=[0,1,2].map(k=>Math.min(a[k],b[k])-9).concat([0,1,2].map(k=>Math.max(a[k],b[k])+9));return {flex:[id],fromStates:{[id]:from},to,phase,port:definition.port,label:definition.port+': '+text(SENSOR_ACTIONS[phase]),showBefore:true,anchors:[b.slice()],focusBounds:bounds,camera:'xbuddy-board-perspective'};});
}
export function installXBuddySensorCables(viewer){for(const definition of XBUDDY_SENSOR_LEADS){if(viewer.fasteners.entities.has(definition.id))continue;const e=new XBuddySensorCable(definition),m=e.mesh;viewer.fasteners.entities.set(e.id,e);viewer.fasteners.meshes.push(m);viewer.group(m.userData.part).add(m);viewer.meshes.push(m);viewer.records.push({key:m.userData.part,name:m.userData.cadName,mesh:m,id:m.uuid});m.userData.restPosition=m.position.clone();m.userData.restQuaternion=m.quaternion.clone();}}
