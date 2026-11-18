import {apertureGuidesLocal} from './z-aperture-workview.js';
import {EarthStockRoute44} from './earth-stock-route44.js';
import {textileRoute,textileDefinition} from './ptfe-textile-route.js';
import {CrossflowTie5} from './r13-tie-adapter.js';
import * as T from 'three';
import {canWriteLoadedCurvedPort,writeLoadedCurvedPort,bindLoadedThermistorPair} from './loaded-curved-port.js';
import {strapProfile,createStrapSweep} from './strap-profile.js?v=20261111-94';
import {refineStrapSurface} from './strap-surface.js?v=20261111-94';
import {textileTexture} from './strap-material.js?v=20261111-94';
import {TieRoute} from './tie-path.js?v=20261111-94';
import {MotorYTieRoute} from './motor-y-tie-route.js';
import {MotorYLead} from './motor-y-lead.js';
import {createTieLockGeometry,createStrapBuckleGeometry} from './tie-lock.js?v=20261111-94';
import {TIES,CABLES,TIE_STATES} from './fastener-data.js?v=20261111-94';
import {attachHotendPlug} from './hotend-plug.js?v=20261111-94';
import {clikMateMotion,clikMatePress}from './clik-mate-plug.js?v=20261111-94';
import {earthRoute,LCD_EARTH_LOOSE,LCD_EARTH_TAIL_LENGTH} from './lcd-cable-motion.js?v=20261111-94';
import {LcdRibbonCable,LCD_RIBBON_LOOSE} from './lcd-ribbon.js?v=20261111-94';
const ease=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
const mix=(a,b,t)=>a+(b-a)*t;
const vec=p=>new T.Vector3(...p);
const segments=192,tailSegments=48,ribbonStride=8;
const ribbonCorners=[0,1,1,2,2,3,3,0];
// Fixed buffers: animation updates positions/normals, never replaces the mesh.
class Ribbon {
 constructor(g,offset,count,width,thickness){Object.assign(this,{g,offset,count,width,thickness});this.remaining=new Float64Array(count+1);this.points=Array.from({length:count+1},()=>new T.Vector3());this.tangent=new T.Vector3();this.previous=new T.Vector3();this.normal=new T.Vector3();this.side=new T.Vector3();this.rotation=new T.Quaternion();this.fallback=new T.Vector3();}
 write(points,widthAxis,scale=1,tapered=true,startSection=null){
  const remaining=this.remaining;for(let i=this.count-1;i>=0;i--)remaining[i]=remaining[i+1]+points[i].distanceTo(points[i+1]);
  const a=this.g.attributes.position;for(let i=0;i<=this.count;i++){
   this.tangent.subVectors(points[Math.min(i+1,this.count)],points[Math.max(0,i-1)]).normalize();
   if(i===0&&startSection)this.tangent.copy(startSection.tangent);
   if(i===0)this.side.copy(startSection?.side||widthAxis);
   else {this.rotation.setFromUnitVectors(this.previous,this.tangent);this.side.applyQuaternion(this.rotation);}
   this.side.addScaledVector(this.tangent,-this.side.dot(this.tangent));if(this.side.lengthSq()<.00001){this.fallback.set(Math.abs(this.tangent.x)<.8?1:0,0,Math.abs(this.tangent.x)<.8?0:1);this.side.copy(this.fallback).addScaledVector(this.tangent,-this.fallback.dot(this.tangent));}this.side.normalize();
   if(i===0){this.firstSide=this.side.clone();this.firstTangent=this.tangent.clone();}this.previous.copy(this.tangent);this.normal.crossVectors(this.side,this.tangent).normalize();
   const taper=tapered==='round'?Math.max(.002,Math.sqrt(1-Math.max(0,1-remaining[i]/(this.width*.5))**2)):tapered?mix(.3,1,ease(remaining[i]/5)):1;
   // Duplicate the corners per face: a nylon strip has broad flat surfaces,
   // not the cylindrical shading produced by averaging all four faces.
   for(let j=0;j<ribbonStride;j++){const corner=ribbonCorners[j],side=corner===0||corner===3?-1:1,up=corner<2?-1:1;const p=points[i];a.setXYZ(this.offset+i*ribbonStride+j,(p.x+this.side.x*side*this.width*.5*scale*taper+this.normal.x*up*this.thickness*.5*scale)*.001,(p.y+this.side.y*side*this.width*.5*scale*taper+this.normal.y*up*this.thickness*.5*scale)*.001,(p.z+this.side.z*side*this.width*.5*scale*taper+this.normal.z*up*this.thickness*.5*scale)*.001);}
   // Reuse the named material cut section exactly, including its duplicated
   // face corners. The rest of the offcut is transported from this frame.
   if(i===0&&startSection)for(let j=0;j<ribbonStride;j++){const k=startSection.offset+j,o=startSection.translation;
    a.setXYZ(this.offset+j,a.getX(k)+o.x*.001,a.getY(k)+o.y*.001,a.getZ(k)+o.z*.001);
   }
  }
 }
}
function ribbonIndices(ix,offset,n){for(let i=0;i<n;i++)for(let j=0;j<4;j++){const a=offset+i*ribbonStride+j*2,b=a+1,c=b+ribbonStride,d=a+ribbonStride;ix.push(a,b,d,b,c,d);}ix.push(offset,offset+3,offset+1,offset,offset+5,offset+3);const e=offset+n*ribbonStride;ix.push(e,e+1,e+3,e,e+3,e+5);}
function material(color){const m=new T.MeshStandardMaterial({color,roughness:.72,metalness:.05,side:T.DoubleSide});m.userData.originalOpacity=1;m.userData.originalColor=m.color.clone();return m;}
class FlexibleTie {
 constructor(def){
  def={...def,strapProfile:strapProfile(def.id)};
  def=textileDefinition(def);Object.assign(this,def);this.routeModel=textileRoute(def,def.id==='motorY'?new MotorYTieRoute(def):new TieRoute(def));this.origin=vec(def.p);this.U=vec(def.u);this.V=vec(def.v);this.W=new T.Vector3().crossVectors(this.U,this.V).normalize();this.Out=this.V;
  const headOffset=(segments+1)*ribbonStride+(tailSegments+1)*ribbonStride,g=new T.BufferGeometry(),lock=def.strap?createStrapBuckleGeometry(def.width):createTieLockGeometry(def.width||2.4);
  this.lockPosition=lock.attributes.position.array.slice();const lockUV=lock.attributes.uv;
  g.setAttribute('position',new T.BufferAttribute(new Float32Array((headOffset+lock.attributes.position.count)*3),3).setUsage(T.DynamicDrawUsage));
  g.setAttribute('normal',new T.BufferAttribute(new Float32Array((headOffset+lock.attributes.position.count)*3),3).setUsage(T.DynamicDrawUsage));
  if(def.strap){const uv=new Float32Array((headOffset+lock.attributes.position.count)*2);uv.set(lockUV.array,headOffset*2);g.setAttribute('uv',new T.BufferAttribute(uv,2));}
  const ix=[];ribbonIndices(ix,0,segments);this.offcutIndex=ix.length;ribbonIndices(ix,(segments+1)*ribbonStride,tailSegments);this.offcutCount=ix.length-this.offcutIndex;
  this.loop=new Ribbon(g,0,segments,def.width||2.4,def.thickness||.5);this.offcut=new Ribbon(g,(segments+1)*ribbonStride,tailSegments,def.width||2.4,def.thickness||.5);this.headOffset=headOffset;this.boxPoint=new T.Vector3();
  // W = width, V = feed, U = thickness. The returning strip passes through
  // an actual opening in the lock, separate from the attached root.
  for(const index of lock.index.array)ix.push(headOffset+index);lock.dispose();
  g.setIndex(ix);this.ribbonGeometry=g;this.surface=def.strap?refineStrapSurface(g,segments,tailSegments,ribbonStride,headOffset):null;this.geometry=this.surface?.geometry||g;
  this.mesh=new T.Mesh(this.geometry,material('#343735'));if(def.strap){this.mesh.material.roughness=1;this.mesh.material.metalness=0;this.mesh.material.map=textileTexture();this.mesh.material.bumpMap=this.mesh.material.map;this.mesh.material.bumpScale=.00005;}this.mesh.userData={part:'cableTies',cadName:def.name,flexId:def.id,supplement:true};this.mesh.castShadow=true;this.update(5,5,1);
 }
 point(u,v,out=new T.Vector3()){return out.copy(this.origin).addScaledVector(this.U,u).addScaledVector(this.V,v);}
 setOpenPreparation(route){if(this.openPreparation===route)return;this.openPreparation=route;this.lastKey='';}
 update(from,to,t){
  const key=`${from}:${to}:${t}`;if(this.lastKey===key)return;this.lastKey=key;
  const route=to===1&&from<=1&&this.openPreparation?this.openPreparation:this.routeModel,q=route.pose(from,to,t);
  for(let i=0;i<=segments;i++)route.at(q.start+q.length*i/segments,this.loop.points[i],q.wrapped);
  this.loop.write(this.loop.points,this.W,1,this.strap?'round':!q.cut&&from!==5&&from!==7);
  // Cut once, then let the detached excess move away from the workpiece.
  // Before that instant the strip keeps its original material length.
  const detached=q.cut&&t<1,drop=ease((t-.94)/.06),excess=Math.max(0,route.length-route.loopLength-2.5);
  for(let i=0;i<=tailSegments;i++){const f=i/tailSegments,p=this.offcut.points[i];if(detached){route.at(route.loopLength+2.5+f*excess,p);p.addScaledVector(this.V,drop*30);}else p.copy(this.loop.points[0]);}
  const cutSection=this.id==='motorY'&&detached?{tangent:this.loop.tangent,side:this.loop.side,offset:this.loop.offset+this.loop.count*ribbonStride,translation:this.V.clone().multiplyScalar(drop*30)}:null;
  this.offcut.write(this.offcut.points,this.W,detached?1:0,!this.strap,cutSection);
  const head=route.at(q.start),pos=this.ribbonGeometry.attributes.position,headW=this.loop.firstSide,root=this.id==='motorY'?route.rootAxis.clone():this.loop.firstTangent.clone().negate();if(this.strap&&Math.abs(q.start)<1e-6)root.copy(this.U);
  const headV=this.strap?root:new T.Vector3().crossVectors(headW,root),headU=new T.Vector3().crossVectors(headV,headW);if(this.strap){headU.negate();head.addScaledVector(root,1.6);}
  for(let i=0;i<this.lockPosition.length/3;i++){const j=i*3,p=this.boxPoint.copy(head).addScaledVector(headW,this.lockPosition[j]).addScaledVector(headV,this.lockPosition[j+1]).addScaledVector(headU,this.lockPosition[j+2]);pos.setXYZ(this.headOffset+i,p.x*.001,p.y*.001,p.z*.001);}
  const target=this.geometry.attributes.position;
  if(this.surface){const {a,b,weights}=this.surface,values=pos.array;for(let i=0;i<a.length;i++){const j=a[i]*3,k=b[i]*3,t=weights[i],p=this.boxPoint.set((values[j]+(values[k]-values[j])*t)*1000,(values[j+1]+(values[k+1]-values[j+1])*t)*1000,(values[j+2]+(values[k+2]-values[j+2])*t)*1000);this.bandSweep?.map(p);target.setXYZ(i,p.x*.001,p.y*.001,p.z*.001);}}
  target.needsUpdate=true;this.geometry.computeVertexNormals();this.geometry.computeBoundingBox();this.geometry.computeBoundingSphere();
  this.mesh.userData.flexState={from,to,t,closed:q.closed,rise:q.height,tail:q.tail,phase:q.phase,materialLength:route.length,stripLength:q.length,cut:q.cut,start:q.start,loopLength:route.loopLength};
 }
 guide(target){if(target===1&&this.openPreparation)return Array.from({length:129},(_,i)=>this.openPreparation.at(this.openPreparation.length*i/128).multiplyScalar(.001));if(this.routeModel.guide)return this.routeModel.guide(target).map(p=>{this.bandSweep?.map(p);return p.multiplyScalar(.001);});const route=new TieRoute(this);route.make(route.state(target).height);return route.points.filter((p,i)=>i%6===0||i===route.points.length-1).map(p=>{p=p.clone();this.bandSweep?.map(p);return p.multiplyScalar(.001);});}
}
class FlexibleCable {
 constructor(def){
  Object.assign(this,def);this.samples=def.samples||(['mainSleeve','ptfeTube'].includes(def.id)?256:64);this.curve=new T.CatmullRomCurve3(def.points.map(p=>vec(p).multiplyScalar(.001)),false,'centripetal');this.curve.arcLengthDivisions=Math.max(200,this.samples*4);this.curve.updateArcLengths();
  const g=new T.TubeGeometry(this.curve,this.samples,def.radius*.001,8,false);this.geometry=g;this.mesh=new T.Mesh(g,material(def.color));this.mesh.userData={part:'cables',cadName:def.name,flexId:def.id,supplement:true};this.mesh.castShadow=true;this.lastKey='';
 }
 update(from,to,t){const key=`${from}:${to}:${t}`;if(this.lastKey===key)return;this.lastKey=key;const amount=from?1:ease(t);this.geometry.setDrawRange(0,Math.floor(this.samples*amount)*8*6);this.mesh.userData.flexState={from,to,t,amount};}
 guide(){return this.curve.getPoints(24);}
}
class LcdEarthCable extends FlexibleCable {
 constructor(def){
  super(def);this.prefix=new T.CatmullRomCurve3(def.points.slice(0,11).map(vec),false,'centripetal');this.prefix.arcLengthDivisions=512;this.sourcePrefix=this.prefix;this.stockRoute=null;
  this.followEnd(vec(LCD_EARTH_LOOSE));
 }
 followEnd(end,release=0){
  if(this.sourcePose){const pose=this.sourcePose();if(!pose?.end?.isVector3||!pose.end.toArray().every(Number.isFinite)||!Number.isFinite(pose.release))throw Error('Actual current service FE source required');end=pose.end;release=pose.release;this.attachmentReference=pose.reference.clone().multiplyScalar(.001);this.stockRoute??=new EarthStockRoute44(this,this.sourcePrefix);const key='service|'+end.toArray().join(':')+'|'+release+'|'+pose.unplugged+'|'+pose.aperture.toArray().join(':');if(key===this.endKey)return;this.endKey=key;this.stockRoute.follow(end,earthRoute(this.sourcePrefix,end).path,release,pose);return;}
  if(this.prefix!==this.sourcePrefix){this.prefix=this.sourcePrefix;this.endKey='';}
  const key=end.toArray().join(':');if(key===this.endKey)return;this.endKey=key;
  const {path,tail,amplitude}=earthRoute(this.prefix,end);this.route=path;this.tail=tail;this.tailAmplitude=amplitude;
  this.mesh.userData.routingLengthError=tail.getLength()-LCD_EARTH_TAIL_LENGTH;
  const frames=path.computeFrenetFrames(this.samples,false),p=this.geometry.attributes.position,n=this.geometry.attributes.normal,normal=new T.Vector3();
  for(let i=0;i<=this.samples;i++){
   const c=path.getPoint(i/this.samples).multiplyScalar(.001);
   for(let j=0;j<=8;j++){
    const a=j/8*Math.PI*2,k=i*9+j;normal.copy(frames.normals[i]).multiplyScalar(-Math.cos(a)).addScaledVector(frames.binormals[i],Math.sin(a));
    n.setXYZ(k,normal.x,normal.y,normal.z);p.setXYZ(k,c.x+normal.x*this.radius*.001,c.y+normal.y*this.radius*.001,c.z+normal.z*this.radius*.001);
   }
  }
  p.needsUpdate=true;n.needsUpdate=true;this.geometry.computeBoundingBox();this.geometry.computeBoundingSphere();
 }
 guide(){return this.route.getPoints(64).map(p=>p.multiplyScalar(.001));}
}
// Keep the cartridge end fixed while guiding the free end to the board.
// Position/normal buffers are reused while scrubbing and playing.
class RoutedCable {
 constructor(def){
  Object.assign(this,def);this.loose=def.loosePoints.map(p=>vec(p).multiplyScalar(.001));this.seated=def.points.map(p=>vec(p).multiplyScalar(.001));
  if(this.loose.length!==this.seated.length)throw Error('Cable routes need matching control points: '+def.id);
  this.routeStages=(def.routeStages||[{at:0,points:def.loosePoints},{at:1,points:def.points}]).map(s=>({at:s.at,points:s.points.map(p=>vec(p).multiplyScalar(.001))}));
  if(this.routeStages.some(s=>s.points.length!==this.loose.length))throw Error('Cable routing stages need matching control points: '+def.id);
  this.curve=new T.CatmullRomCurve3(this.loose.map(p=>p.clone()),false,'centripetal');this.curve.arcLengthDivisions=1024;
  this.geometry=new T.TubeGeometry(this.curve,256,def.radius*.001,8,false);
  if(def.id.endsWith('0')){this.plug=attachHotendPlug(this.geometry,def.id.includes('Heater'));this.peer=CABLES.find(d=>d.id===def.id.slice(0,-1)+'1').routeStages;}
  this.mesh=new T.Mesh(this.geometry,this.plug?[material(def.color),material(def.id.includes('Heater')?'#303332':'#e8e0ce')]:material(def.color));
  this.mesh.userData={part:'hotendLeads',cadName:def.name,flexId:def.id,supplement:true};this.mesh.castShadow=false;this.lastKey='';this.update(0,0,1);
 }
 update(from,to,t){
  if(!canWriteLoadedCurvedPort(this))return;
  const key=`${from}:${to}:${t}`;if(this.lastKey===key)return;this.lastKey=key;const motion=this.id.startsWith('hotendThermistor')?clikMateMotion(from,to,t):null,amount=motion?motion.amount:mix(from,to,ease(t));
  const stages=this.routeStages,next=stages.findIndex(s=>s.at>=amount),a=stages[Math.max(0,next-1)],b=stages[Math.max(0,next)],u=b.at===a.at?1:(amount-a.at)/(b.at-a.at);
  this.curve.points.forEach((p,i)=>p.lerpVectors(a.points[i],b.points[i],u));this.curve.updateArcLengths();
  const frames=this.curve.computeFrenetFrames(256,false),p=this.geometry.attributes.position,n=this.geometry.attributes.normal,normal=new T.Vector3();
  for(let i=0;i<=256;i++){const c=this.curve.getPointAt(i/256);for(let j=0;j<=8;j++){const a=j/8*Math.PI*2,x=-Math.cos(a),y=Math.sin(a),k=i*9+j;normal.copy(frames.normals[i]).multiplyScalar(x).addScaledVector(frames.binormals[i],y);n.setXYZ(k,normal.x,normal.y,normal.z);p.setXYZ(k,c.x+normal.x*this.radius*.001,c.y+normal.y*this.radius*.001,c.z+normal.z*this.radius*.001);}}
  const axis=this.seated.at(-1).clone().sub(this.seated.at(-2)).normalize(),clearance=this.seated.at(-1).clone().sub(this.curve.getPointAt(1)).dot(axis)*1000,latch=motion?clikMatePress(motion,clearance):0;
  if(this.plug){const pa=this.peer[Math.max(0,next-1)].points.at(-1),pb=this.peer[Math.max(0,next)].points.at(-1);this.plug.write(this.curve,new T.Vector3(...pa).lerp(new T.Vector3(...pb),u).multiplyScalar(.001),latch);}
  if(this.id.startsWith('hotendThermistor'))writeLoadedCurvedPort(this,this.plug?.loadedNativeFrame);
  p.needsUpdate=true;n.needsUpdate=true;this.geometry.computeBoundingBox();this.geometry.computeBoundingSphere();this.mesh.userData.flexState={from,to,t,amount,latch,connectorPhase:motion?.phase};
 }
 guide(to=1){const i=this.routeStages.findIndex(s=>s.at>=to),a=this.routeStages[Math.max(0,i-1)],b=this.routeStages[Math.max(0,i)],u=b.at===a.at?1:(to-a.at)/(b.at-a.at);return a.points.map((p,k)=>p.clone().lerp(b.points[k],u));}
}
export function createFasteners(additions=[],{excludedCableIds=[]}={}){
 const cableEntities=CABLES.filter(d=>!excludedCableIds.includes(d.id)).map(d=>additions.find(e=>e.id===d.id)||(d.id==='motorYWire'?new MotorYLead(d):d.id==='earthR'?new LcdEarthCable({...d,samples:512,color:'#343735'}):d.id==='lcdWire'?new LcdRibbonCable(d):d.loosePoints?new RoutedCable(d):new FlexibleCable(d)));
 const entities=new Map([...TIES.map(d=>{if(d.alignCable){const cable=cableEntities.find(e=>e.id===d.alignCable);let at=0,best=Infinity;for(let i=0;i<=1000;i++){const p=cable.curve.getPoint(i/1000),distance=(p.x*1000-d.p[0])**2+(p.y*1000-d.p[1])**2;if(distance<best){best=distance;at=i/1000;}}const w=cable.curve.getTangent(at);w.z=0;w.normalize();if(w.x<0)w.negate();d={...d,v:[w.y,-w.x,0]};}if(d.strap)d={...d,bandSweep:createStrapSweep(cableEntities.find(e=>e.id==='mainSleeve').curve,d)};return d.id==='box5'?new CrossflowTie5(d):new FlexibleTie(d);}),...cableEntities].map(e=>[e.id,e]));
 for(const entity of additions)if(!entities.has(entity.id))entities.set(entity.id,entity);
 bindLoadedThermistorPair(entities.get('hotendThermistor0'),entities.get('hotendThermistor1'));
 return {entities,meshes:[...entities.values()].map(e=>e.mesh),restore(states={}){for(const [id,e]of entities){const state=states[id]||0;e.update(state,state,1);}},animate(actor,t){for(const id of actor.flex){const e=entities.get(id);e.update(actor.fromStates[id]||0,actor.to,t);}},guides(actor){const aperture=apertureGuidesLocal(actor);if(aperture)return aperture;return actor.flex.map(id=>{const e=entities.get(id);return actor.cableApproach===id?[vec(id==='lcdWire'?LCD_RIBBON_LOOSE:LCD_EARTH_LOOSE).multiplyScalar(.001),e.attachmentReference.clone()]:e.guide(actor.to,actor.fromStates?.[id]);}).filter(points=>points?.length>1);}};
}
