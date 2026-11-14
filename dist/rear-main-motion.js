import * as T from 'three';
import {V,Cubic,Metres,Spline,ArcLineArc,mainPath,writeRing} from './rear-main-curves.js';
import {makeMovingTail,writeMovingTail} from './rear-main-tail.js';
import {makeMovingMain,writeMovingMain} from './rear-main-bend.js';

// Parent supplies already-composed ribbon/FE references. This module only owns
// the five rear-main entities and does not seek or install another FE harness.
export function installRearMain(viewer,{referenceData}={}){
 if(viewer.rearMainRouting)return viewer.rearMainRouting;
 if(!referenceData)throw Error('Rear-main requires its explicit r3 reference data');
 const {coupled,blue,sleeveSource,tiePoses}=referenceData;
 const entity=id=>{const e=viewer.fasteners?.entities.get(id);if(!e)throw Error('Missing rear-main entity '+id);return e;};
 const main=entity('mainRear'),box=entity('boxLower'),sleeve=entity('mainSleeve'),ties=['bundle1','bundle2'].map(entity);
 const inheritedBlue=box.rearBlue3;if(inheritedBlue&&(inheritedBlue.radiusMM!==2.5||Math.abs(inheritedBlue.stockMM-221.248465580051)>1e-8))throw Error('Existing boxLower adapter differs from blue3');
 const moving=[main,sleeve,box,...ties],saved=moving.map(e=>({e,external:e===box&&!!inheritedBlue,geometry:e.geometry,curve:e.curve,samples:e.samples,update:e.update}));
 const sensor=entity('sensorWire');
 const sourceSleeve=sleeve.curve,originalSleeve=sleeve.geometry,originalBlue=box.geometry;
 const stocks={mainRear:600.207597850728,mainSleeve:532.3522924495494,boxLower:221.248465580051};
 for(const [value,target] of [[coupled.main.stockMM,stocks.mainRear],[coupled.sleeve.stockMM,stocks.mainSleeve],[blue.stockMM,stocks.boxLower]])if(Math.abs(value-target)>1e-8)throw Error('Rear-main stock drift');
 for(const [e,r] of [[main,4],[sleeve,4.2],[box,2.5]])if(e.radius!==r)throw Error('Rear-main gauge drift');
 function tube(e,frames,path,n,capSource){
  const g=new T.TubeGeometry(new Metres(path),n,e.radius*.001,8,false);
  for(let i=0;i<=n;i++)writeRing(g,i,frames.centres[i],frames.tangents[i],frames.normals[i],e.radius);
  if(capSource)for(const name of ['position','normal']){
   const old=capSource.attributes[name].array;g.attributes[name].array.set(old.slice(0,27));g.attributes[name].array.set(old.slice(-27),n*27);
  }
  g.setDrawRange(0,g.index.count);g.computeBoundingBox();g.computeBoundingSphere();
  e.geometry=e.mesh.geometry=g;e.curve=new Metres(path);e.samples=n;
 }
 const {path:mainGuide}=mainPath(coupled.main);tube(main,coupled.main,mainGuide,256);if(inheritedBlue)inheritedBlue.follow();else tube(box,blue,new Spline(blue),128,originalBlue);
 const sp=coupled.sleeve,[a,b]=sp.cutArc,root=new Cubic(sp.rootControls,sp.rootMM,4096),endTail=new ArcLineArc(sp.tailPath);let tail=endTail;
 const sourceTangent=(u,out=new T.Vector3())=>{
  const raw=sourceSleeve.getUtoTmapping(u),n=sleeveSource.coefficients.length,i=Math.min(n-1,Math.floor(raw*n)),t=raw*n-i,c=sleeveSource.coefficients[i];
  return out.copy(V(c[1])).addScaledVector(V(c[2]),2*t).addScaledVector(V(c[3]),3*t*t).normalize();
 };
 const guide={
  getPointAt(u,out=new T.Vector3()){return u<a?root.getPointAt(u/a,out):u>b?tail.getPointAt((u-b)/(1-b),out):out.copy(sourceSleeve.getPointAt(u)).multiplyScalar(1000);},
  getTangentAt(u,out=new T.Vector3()){return u<a?root.getTangentAt(u/a,out):u>b?tail.getTangentAt((u-b)/(1-b),out):sourceTangent(u,out);},
  getLength(){return sp.stockMM;}
 };
 const sg=originalSleeve.clone();for(const [key,f] of Object.entries(sp.frames))writeRing(sg,+key,f.centre,f.tangent,f.normal,4.2);
 sg.setDrawRange(0,sg.index.count);sg.computeBoundingBox();sg.computeBoundingSphere();sleeve.geometry=sleeve.mesh.geometry=sg;sleeve.curve=new Metres(guide);
 for(const e of [main,box,sleeve]){
  if(e===box&&inheritedBlue)continue;
  const original=saved.find(s=>s.e===e).update;
  e.update=function(...args){original.apply(this,args);this.geometry.setDrawRange(0,this.geometry.index.count);};
 }
 const tieState=new Map();
 for(const e of ties){
  if(!e.free)throw Error('Only unanchored bundle clamps may move');
  const [angle,dy,dz]=tiePoses[e.id].input,rotation=new T.Matrix4().makeRotationX(angle),matrix=rotation.clone().setPosition(0,dy,dz),original=e.update;
  const route=e.routeModel,oldAt=route.at,stockWidth=e.W.clone();
  if(e.id==='bundle2')route.at=function(distance,out=new T.Vector3(),wrapped=false){if(distance>=0)return oldAt.call(this,distance,out,wrapped);const s=-distance,lead=3,r=28;if(s<=lead)return out.copy(this.head).addScaledVector(this.V,s);const a=Math.min(Math.PI/2,(s-lead)/r);out.copy(this.head).addScaledVector(this.V,lead+r*Math.sin(a)).addScaledVector(this.W,r*(1-Math.cos(a)));if(s>lead+r*Math.PI/2)out.addScaledVector(this.W,s-lead-r*Math.PI/2);return out;};
  const cache={position:e.geometry.attributes.position.array.slice(),normal:e.geometry.attributes.normal.array.slice(),sourceKey:e.lastKey,matrix,rotation,oldAt};tieState.set(e.id,cache);
  e.update=function(...args){
   const g=this.geometry;for(const n of ['position','normal'])g.attributes[n].array.set(cache[n]);
   if(e.id==='bundle2'){const q=route.pose(...args);this.W.copy(stockWidth);if(q.start<0){const rootT=route.points[1].clone().sub(route.points[0]).normalize(),startT=route.at(q.start+.0001).sub(route.at(q.start-.0001)).normalize();this.W.applyQuaternion(new T.Quaternion().setFromUnitVectors(rootT,startT));}}
   try{original.apply(this,args);}finally{this.W.copy(stockWidth);}
   for(const n of ['position','normal'])cache[n]=g.attributes[n].array.slice();cache.sourceKey=this.lastKey;
   const q=this.mesh.userData.flexState;cache.currentMatrix=matrix;cache.currentRotation=rotation;
   const p=new T.Vector3();for(const n of ['position','normal']){
    const attr=g.attributes[n];for(let i=0;i<attr.count;i++){p.fromBufferAttribute(attr,i);if(n==='position')p.multiplyScalar(1000).applyMatrix4(cache.currentMatrix).multiplyScalar(.001);else p.transformDirection(cache.currentRotation);attr.setXYZ(i,p.x,p.y,p.z);}attr.needsUpdate=true;
   }
   g.computeBoundingBox();g.computeBoundingSphere();
  };
  // One actual update converts the currently seated buffer; future seeks always
  // regenerate from the original route before the one rigid transform.
  const q=e.mesh.userData.flexState;e.update(q.from,q.to,q.t);
 }
 const endSleeve=Object.fromEntries(['position','normal'].map(n=>[n,sg.attributes[n].array.slice()])),endMain=Object.fromEntries(['position','normal'].map(n=>[n,main.geometry.attributes[n].array.slice()]));let lastAmplitude,lastMainAmplitude;
 const follow=()=>{if(!api.active||viewer.disposed||!viewer.fasteners)return;const motor=viewer.fasteners.entities.get('lbMotorLead'),value=motor?.mesh.userData.flexState?.amount??1,amplitude=1.5*(1-T.MathUtils.smoothstep(value,0,1));
  if(amplitude!==lastAmplitude){lastAmplitude=amplitude;for(const n of ['position','normal']){sg.attributes[n].array.set(endSleeve[n]);sg.attributes[n].needsUpdate=true;}if(amplitude===0){tail=endTail;sg.computeBoundingBox();sg.computeBoundingSphere();}else{tail=makeMovingTail(sp.tailPath,amplitude);writeMovingTail(sleeve,tail,sp,sleeveSource);}}
  const sensorValue=sensor.mesh.userData.flexState?.amount??3,mainAmplitude=1.5*T.MathUtils.smoothstep(sensorValue,1.35,1.65)*(1-T.MathUtils.smoothstep(sensorValue,1.94,2));
  if(mainAmplitude!==lastMainAmplitude){lastMainAmplitude=mainAmplitude;for(const n of ['position','normal']){main.geometry.attributes[n].array.set(endMain[n]);main.geometry.attributes[n].needsUpdate=true;}if(mainAmplitude===0){main.curve=new Metres(mainGuide);main.geometry.computeBoundingBox();main.geometry.computeBoundingSphere();}else{const path=makeMovingMain(coupled.main,mainGuide,mainAmplitude);writeMovingMain(main,path,coupled.main);main.curve=new Metres(path);}}
  api.motionReport={sourceMotorValue:value,amplitudeMM:amplitude,tailLengthMM:tail.getLength(),stockMM:sp.stockMM,baseRadiusMM:tail.radius??sp.tailPath.radiusMM,sensorValue,mainAmplitudeMM:mainAmplitude,mainStockMM:main.curve.getLength()*1000};
 };
 const originalProgress=viewer.setProgress,wrappedProgress=(...args)=>{if(viewer.disposed)return;const result=originalProgress.apply(viewer,args);if(api.active)follow();return result;};
 const api={revision:'rear-main-r3-motion-r2',active:true,stocksMM:stocks,mainGuide,sleeveGuide:guide,follow,changedSleeveRings:Object.keys(sp.frames).map(Number),movingIds:moving.map(e=>e.id),coupledIds:[],
  carrier(id){const e=entity(id),s=tieState.get(id);return e.routeModel.points.map(p=>s?p.clone().applyMatrix4(s.currentMatrix??s.matrix):p.clone());},
  dispose(){if(!api.active)return;api.active=false;if(viewer.setProgress===wrappedProgress)viewer.setProgress=originalProgress;for(const s of saved){if(s.external)continue;const e=s.e,q=e.mesh.userData.flexState;e.update=s.update;if(tieState.has(e.id))e.routeModel.at=tieState.get(e.id).oldAt;else{e.geometry.dispose();e.geometry=e.mesh.geometry=s.geometry;e.curve=s.curve;e.samples=s.samples;}e.lastKey='';if(q)e.update(q.from,q.to,q.t);}delete viewer.rearMainRouting;}
 };
 viewer.rearMainRouting=api;viewer.setProgress=wrappedProgress;follow();return api;
}
