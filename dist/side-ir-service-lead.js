import * as T from'three';
import{SENSOR_ASSEMBLY as S}from'./sensor-assembly-data.js?v=20261111-94';
import{SIDE_IR_SIGNAL_JOIN_MM,installSideIRRetainedLead}from'./side-ir-service-retained-lead.js';
import{SIDE_IR_WIRE_PATHS as ROUTES}from'./side-ir-service-wire-paths.js';
import{wirePrefix}from'./side-ir-service-wire-prefix.js';
import{sideIRBundle}from'./side-ir-service-wire-bundle.js';
import{sideIRSelection}from'./side-ir-service-state.js';

const prefixCount=384,tailCount=512,externalCount=384,radial=8,rings=prefixCount+tailCount-1+externalCount;
class ArcPolyline{
 constructor(raw){this.points=[];this.lengths=[];this.length=0;for(const p of raw){const q=new T.Vector3(...p),last=this.points.at(-1),distance=last?q.distanceTo(last):0;if(last&&(!(distance>0)||this.length+distance===this.length))continue;this.length+=distance;this.points.push(q);this.lengths.push(this.length);}if(this.points.length<2)throw Error('Side IR route has no length');}
 at(u){const d=Math.max(0,Math.min(1,u))*this.length;let lo=1,hi=this.points.length-1;while(lo<hi){const mid=(lo+hi)>>1;if(this.lengths[mid]<d)lo=mid+1;else hi=mid;}const a=this.lengths[lo-1],b=this.lengths[lo];return this.points[lo-1].clone().lerp(this.points[lo],(d-a)/(b-a));}
}
class OffsetCurve extends T.Curve{
 constructor(points,row,normal){super();this.base=new T.CatmullRomCurve3(points,false,'centripetal');this.row=row;this.normal=normal;this.arcLengthDivisions=512;}
 getPoint(t,target=new T.Vector3()){const tangent=this.base.getTangent(t),normal=this.normal.clone();if(t!==0)normal.addScaledVector(tangent,-this.normal.dot(tangent));if(normal.lengthSq()<1e-10)throw Error('Side IR offset frame is singular');return target.copy(this.base.getPoint(t)).addScaledVector(normal.normalize(),(this.row-1)*.9);}
}
const pathLength=p=>{let L=0;for(let i=1;i<p.length;i++)L+=p[i].distanceTo(p[i-1]);return L;};
export function installSideIRLead(viewer,plug,add,bodyNodes){
 const retained=installSideIRRetainedLead(viewer,add),id='sideIRFreeLead',body=new T.Matrix4().set(...S.bodyWorld.flat()),inverse=body.clone().invert(),ir=new T.Matrix4().set(...S.partWorld.sensorIR.flat()),bodyY=new T.Vector3(...S.bodyWorld.slice(0,3).map(r=>r[1])),B=new T.Vector3(...SIDE_IR_SIGNAL_JOIN_MM),radiusMM=.4,lengths=ROUTES.stockLengthsMM.slice(),basePoints=[0,1,2].map(row=>new T.Vector3(-9,[1.46,4,6.54][row],2.92).applyMatrix4(ir)),baseLocal=basePoints.map(p=>p.clone().applyMatrix4(inverse).toArray());
 const geometry=new T.BufferGeometry(),positions=new Float32Array(3*rings*(radial+1)*3),normals=new Float32Array(positions.length),indices=[];geometry.setAttribute('position',new T.BufferAttribute(positions,3));geometry.setAttribute('normal',new T.BufferAttribute(normals,3));
 for(let row=0;row<3;row++){const begin=indices.length;for(let i=1;i<rings;i++)for(let j=0;j<radial;j++){const a=(row*rings+i-1)*(radial+1)+j,b=a+radial+1;indices.push(a,b,a+1,b,b+1,a+1);}geometry.addGroup(begin,indices.length-begin,row);}geometry.setIndex(indices);
 const materials=['#8c603e','#478c5b','#e9e5d8'].map(color=>{const m=new T.MeshStandardMaterial({color,roughness:.6});m.userData.originalColor=m.color.clone();m.userData.originalOpacity=1;return m;}),mesh=add(id,geometry,materials,undefined,{flexId:id,authoredReference:true,manufacturerCAD:false,stock:{radiusMM,referenceCutLengthsMM:lengths},retainedRoutedCableJoinMM:B.toArray(),joinProvenance:'Reference centreline before native66 slot; no OEM clamp or cut length asserted',internalRouteSource:'Measured unchanged native R1/One+ cavities and actual IR outlets'});
 const entity={id,mesh,retained,lengths,radiusMM,curve:null,initialized:false,active:false,pendingRestore:false,restorePlugMatrix:new T.Matrix4().toArray(),restoreBodyMatrix:new T.Matrix4().toArray(),lastKey:'',
 update(from,to,t){
  if(this.initialized&&(!this.active||viewer.state?.flow!=='service'))return;const restore=this.pendingRestore;this.pendingRestore=false;const family=sideIRSelection().family==='plus'?'Plus':'R1',nativeBody=bodyNodes(sideIRSelection().family),frame=restore?new T.Matrix4().fromArray(this.restoreBodyMatrix).multiply(body):new T.Matrix4().compose(nativeBody.position.clone().multiplyScalar(1000),nativeBody.quaternion,nativeBody.scale),frameInverse=frame.clone().invert(),restorePlug=new T.Matrix4().fromArray(this.restorePlugMatrix),starts=[0,1,2].map(row=>restore?basePoints[row].clone().applyMatrix4(restorePlug):new T.Vector3(-9,[1.46,4,6.54][row],2.92).multiplyScalar(.001).applyQuaternion(plug.quaternion).add(plug.position).multiplyScalar(1000)),key=family+':'+frame.elements.join(',')+':'+starts.flatMap(p=>p.toArray()).join(',');if(key===this.lastKey)return;this.lastKey=key;const rows=[],delta=frame.clone().multiply(inverse),normal=bodyY.clone().transformDirection(delta),external=amplitude=>{
   const out=[[-4,6.5,7.5],[-8,6.5,7.5]].map(p=>new T.Vector3(...p).applyMatrix4(frame));for(const p of[[199,62,325],[199,76,315]])out.push(new T.Vector3(...p).applyMatrix4(delta));for(const p of[[193,100,310],[193-amplitude,116,303],[190,136,301],[182,156,301],[182,176,301],[176,180,301]])out.push(new T.Vector3(...p));out.push(B.clone());return out;};
  const internals=[],required=[];for(let row=0;row<3;row++){const cfg=ROUTES.families[family].rows[row],a=starts[row].clone().applyMatrix4(frameInverse).toArray(),prefix=new ArcPolyline(wirePrefix(a,row,baseLocal[row],cfg.end,cfg.tangent)),points=Array.from({length:prefixCount},(_,i)=>prefix.at(i/(prefixCount-1)).applyMatrix4(frame));for(const p of cfg.points.slice(1))points.push(new T.Vector3(...p).applyMatrix4(frame));internals.push(points);required.push(lengths[row]-pathLength(points));}
  const bundle=sideIRBundle(external,normal,required);
  for(let row=0;row<3;row++){
   const points=internals[row],internalLength=pathLength(points);if(points.at(-1).distanceTo(bundle.rows[row][0])>1e-5)throw Error('Side IR wire route join moved');points.push(...bundle.rows[row].slice(1));if(points.length!==rings)throw Error('Side IR ring inventory changed');
   const tangents=points.map((p,i)=>points[Math.min(points.length-1,i+1)].clone().sub(points[Math.max(0,i-1)]).normalize());let n=new T.Vector3(0,1,0).applyQuaternion(plug.quaternion);n.addScaledVector(tangents[0],-n.dot(tangents[0])).normalize();
   for(let i=0;i<rings;i++){if(i)n.applyQuaternion(new T.Quaternion().setFromUnitVectors(tangents[i-1],tangents[i]));n.addScaledVector(tangents[i],-n.dot(tangents[i])).normalize();const binormal=tangents[i].clone().cross(n).normalize().negate(),centre=points[i];for(let j=0;j<=radial;j++){const angle=j/radial*Math.PI*2,d=n.clone().multiplyScalar(Math.cos(angle)).addScaledVector(binormal,Math.sin(angle)),at=(row*rings+i)*(radial+1)+j;geometry.attributes.position.setXYZ(at,(centre.x+d.x*radiusMM)*.001,(centre.y+d.y*radiusMM)*.001,(centre.z+d.z*radiusMM)*.001);geometry.attributes.normal.setXYZ(at,d.x,d.y,d.z);}}
   rows.push({startMM:starts[row].toArray(),endMM:points.at(-1).toArray(),lengthMM:pathLength(points),stockLengthMM:lengths[row],internalLengthMM:internalLength,radiusMM,rings});if(row===0)this.curve={getPoints:n=>Array.from({length:n+1},(_,i)=>points[Math.round(i/n*(points.length-1))].clone())};
  }
  geometry.attributes.position.needsUpdate=true;geometry.attributes.normal.needsUpdate=true;geometry.computeBoundingBox();geometry.computeBoundingSphere();mesh.userData.flexState={from,to,t,amount:1,rows,sharedRoute:{stockMM:bundle.stockMM,radiiMM:bundle.radii,layAmplitudeRadians:bundle.phi}};this.initialized=true;
 },guide(){return this.curve.getPoints(48).map(p=>p.multiplyScalar(.001));}};
 if(viewer.fasteners.entities.has(id))throw Error('Duplicate side IR tail');viewer.fasteners.entities.set(id,entity);entity.update(1,1,1);return entity;
}
