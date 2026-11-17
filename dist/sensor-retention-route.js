import * as T from 'three';
import {SENSOR_ASSEMBLY as S} from './sensor-assembly-data.js?v=20261111-94';
import {SIDE_IR_WIRE_PATHS as ROUTES} from './side-ir-service-wire-paths.js';
import {wirePrefix} from './side-ir-service-wire-prefix.js';
import {sideIRBundle,SIDE_IR_BUNDLE_STOCK_MM} from './side-ir-service-wire-bundle.js';
import {SENSOR_RETENTION_FRAME,SENSOR_RETENTION_JOIN_MM} from './sensor-retention-frame.js';
export {SENSOR_RETENTION_FRAME,SENSOR_RETENTION_JOIN_MM} from './sensor-retention-frame.js';

// Reference CAD millimetres. Native373's complete horizontal flange has two
// slots centred at X189.001344/197.001345,Y108.350000. Z334/336 are its faces.
// Official982292#996619 and#996665 show the band through that beam and the
// cable underneath. These are CAD-reference dimensions, not specimen/OEM fit.
const V=p=>new T.Vector3(...p),length=p=>{let L=0;for(let i=1;i<p.length;i++)L+=p[i].distanceTo(p[i-1]);return L;};
export function sensorRetentionPrefix(stockMM,anchor){
 // Same source-native66 opening/corridor and stock solve as the existing
 // complete service harness. Only the ordinary authored outside-post prefix
 // is replaced; the literal downstream jacket, leads and plug are retained.
 const make=rise=>{const c=new T.CatmullRomCurve3([SENSOR_RETENTION_JOIN_MM,[160,181,294],[154,181,294],[146,181,294],[138,174,289],[128,171,289],[120,171,289],[90,171,289],[70+rise,164,289],[80+rise,164,289],[60+rise,171,289],[60,171,284],[48,171,284],[30,171,284],[15,171,284],[0,171,289],[-40,166,289],[-65,166,289],[-73,166,289],[-75,174,284.5],[-76.0019512,171.875061,282.5],anchor.toArray()].map(V),false,'centripetal');c.arcLengthDivisions=1024;return c;};
 if(make(0).getLength()>stockMM||make(50).getLength()<stockMM)throw Error('Complete sensor prefix stock cannot reach the native cable corridor');
 let lo=0,hi=50;for(let i=0;i<32;i++){const m=(lo+hi)/2;if(make(m).getLength()<stockMM)lo=m;else hi=m;}const c=make((lo+hi)/2);c.userData={source:'982292#996665',referenceStockMM:stockMM,referenceSampledLengthMM:c.getLength(),manufacturerCutLength:false};return c;
}
class ArcPolyline{
 constructor(raw){this.p=[];this.s=[];this.L=0;for(const q0 of raw){const q=V(q0),a=this.p.at(-1),d=a?q.distanceTo(a):0;if(a&&(!(d>0)||this.L+d===this.L))continue;this.L+=d;this.p.push(q);this.s.push(this.L);}if(this.p.length<2)throw Error('Complete source conductor prefix required');}
 at(u){const d=T.MathUtils.clamp(u,0,1)*this.L;let a=1,b=this.p.length-1;while(a<b){const m=(a+b)>>1;if(this.s[m]<d)a=m+1;else b=m;}return this.p[a-1].clone().lerp(this.p[a],(d-this.s[a-1])/(this.s[a]-this.s[a-1]));}
}
const P=384,Q=512,E=384,R=P+Q-1+E,RAD=8,BODY_VERTICES=3*R*(RAD+1),VERTICES=BODY_VERTICES+6*(RAD+2);
function makeLead(frame,family){
 const body=new T.Matrix4().set(...S.bodyWorld.flat()),inverse=body.clone().invert(),ir=new T.Matrix4().set(...S.partWorld.sensorIR.flat()),localIR=new T.Matrix4().set(...S.partBody.sensorIR.flat()),normal=V([0,1,0]).transformDirection(frame),base=[0,1,2].map(row=>V([-9,[1.46,4,6.54][row],2.92]).applyMatrix4(ir).applyMatrix4(inverse).toArray()),starts=[0,1,2].map(row=>V([-9,[1.46,4,6.54][row],2.92]).applyMatrix4(localIR).applyMatrix4(frame)),internals=[],required=[];
 for(let row=0;row<3;row++){
  const cfg=ROUTES.families[family].rows[row],a=starts[row].clone().applyMatrix4(frame.clone().invert()).toArray(),prefix=new ArcPolyline(wirePrefix(a,row,base[row],cfg.end,cfg.tangent)),points=Array.from({length:P},(_,i)=>prefix.at(i/(P-1)).applyMatrix4(frame));for(const p of cfg.points.slice(1))points.push(V(p).applyMatrix4(frame));internals.push(points);required.push(ROUTES.stockLengthsMM[row]-length(points));
 }
 const delta=frame.clone().multiply(inverse),external=amplitude=>{
  const out=[[-4,6.5,7.5],[-8,6.5,7.5]].map(p=>V(p).applyMatrix4(frame));
  // Keep the existing whole200mm neutral stock. Slack occupies the approach
  // and rear free span; the actual tie passage stays fixed under the beam.
  for(const p of [[199,62,325],[198.5,76,326.750413],[198.5,88,326.750413],[198.5,95,326.750413]])out.push(V(p).applyMatrix4(delta));
  for(const p of [[193.001345,103,326.750413],[193.001345,108.3499999365,326.750413],[193.001345,115,326.750413],[193.001345,125,326.750413],[193.001345,142,326.750413],[193.001345,148,323],[193-amplitude,160,312],[182,174,295],[176,179.4,294]])out.push(V(p));out.push(V(SENSOR_RETENTION_JOIN_MM));return out;
 };
 const bundle=sideIRBundle(external,normal,required),positions=new Float32Array(VERTICES*3),normals=new Float32Array(positions.length),reports=[];
 for(let row=0;row<3;row++){
  const points=internals[row],internalLength=length(points);if(points.at(-1).distanceTo(bundle.rows[row][0])>1e-5)throw Error('Native conductor exit and full external route do not join');points.push(...bundle.rows[row].slice(1));if(points.length!==R)throw Error('Complete sensor conductor source-ring inventory changed');
  const tangents=points.map((p,i)=>points[Math.min(points.length-1,i+1)].clone().sub(points[Math.max(0,i-1)]).normalize());let n=normal.clone();n.addScaledVector(tangents[0],-n.dot(tangents[0])).normalize();
  for(let i=0;i<R;i++){if(i)n.applyQuaternion(new T.Quaternion().setFromUnitVectors(tangents[i-1],tangents[i]));n.addScaledVector(tangents[i],-n.dot(tangents[i])).normalize();const b=tangents[i].clone().cross(n).normalize().negate();for(let j=0;j<=RAD;j++){const t=j/RAD*Math.PI*2,d=n.clone().multiplyScalar(Math.cos(t)).addScaledVector(b,Math.sin(t)),k=(row*R+i)*(RAD+1)+j,p=points[i].clone().addScaledVector(d,ROUTES.radiusMM);positions.set(p.multiplyScalar(.001).toArray(),k*3);normals.set(d.toArray(),k*3);}}
  for(let end=0;end<2;end++){const ring=end?R-1:0,at=BODY_VERTICES+(row*2+end)*(RAD+2),n=tangents[ring].clone().multiplyScalar(end?1:-1);positions.set(points[ring].clone().multiplyScalar(.001).toArray(),at*3);normals.set(n.toArray(),at*3);for(let j=0;j<=RAD;j++){const k=(row*R+ring)*(RAD+1)+j;positions.set(positions.subarray(k*3,k*3+3),(at+1+j)*3);normals.set(n.toArray(),(at+1+j)*3);}}
  reports.push({startMM:starts[row].toArray(),endMM:points.at(-1).toArray(),referenceCutStockMM:ROUTES.stockLengthsMM[row],sampledLengthMM:length(points),internalLengthMM:internalLength,radiusMM:ROUTES.radiusMM,rings:R,completeEndCaps:2});
 }
 return {positions,normals,report:{family,bodyFrameCADMM:frame.toArray(),conductors:reports,neutralStockMM:SIDE_IR_BUNDLE_STOCK_MM,neutralSampledLengthMM:bundle.stockMM,layRadiiMM:bundle.radii,layAmplitudeRadians:bundle.phi,source:'Existing independent complete SideIR source leads,982292#996619/#996665 retention frame',qualification:'CAD-reference/illustrative cut stocks and routing; not OEM cut specifications, specimen measurements, force or fit certification.'}};
}
export function createMountedSensorLead(sourceMeshes,sourceCable){
 if(sourceCable?.id!=='sensorWire')throw Error('The actual complete side-sensor harness is required');
 // Bind the two independently loaded functional bodies, not native leaves that
 // share the aggregate sensorOld part tag. Construction/preparation must use
 // these bodies' captured installed frames even while the whole assembly is hidden.
 const bodies=sourceMeshes.filter(m=>['sensorBody','sensorOld'].includes(m.userData.part)&&m.userData.cadIndex===undefined&&!(m.userData.cadPath?.length));for(const part of ['sensorBody','sensorOld'])if(bodies.filter(m=>m.userData.part===part).length!==1)throw Error('Exact functional side-sensor body required: '+part);
 const g=new T.BufferGeometry(),pa=new T.BufferAttribute(new Float32Array(VERTICES*3),3),na=new T.BufferAttribute(new Float32Array(pa.array.length),3),topology=sensorMountedLeadTopology();g.setAttribute('position',pa);g.setAttribute('normal',na);for(const group of topology.groups)g.addGroup(group.start,group.count,group.materialIndex);g.setIndex(topology.indices);
 const colors=new Float32Array(VERTICES*3);for(let row=0;row<3;row++){const c=new T.Color(['#8c603e','#478c5b','#e9e5d8'][row]),at=row*R*(RAD+1);for(let k=0;k<R*(RAD+1);k++)colors.set([c.r,c.g,c.b],(at+k)*3);for(let k=0;k<2*(RAD+2);k++)colors.set([c.r,c.g,c.b],(BODY_VERTICES+row*2*(RAD+2)+k)*3);}g.setAttribute('color',new T.BufferAttribute(colors,3));const material=new T.MeshStandardMaterial({color:'#ffffff',vertexColors:true,roughness:.6});material.userData.originalColor=material.color.clone();material.userData.originalOpacity=1;const mesh=new T.Mesh(g,material),bodyGeometries=new Map(bodies.map(m=>[m,m.geometry])),bodyFrames=new Map(bodies.map(m=>{m.updateMatrix();return[m,m.matrix.clone()];})),cache=new Map(),index=g.index;let active=true;
 mesh.visible=false;mesh.castShadow=true;mesh.userData={part:'cables',flexId:'mountedSideSensorLead',cadName:'側面センサーの本体側ケーブル',supplement:true,preserveColours:true,manufacturerCAD:false,referenceStockMM:ROUTES.stockLengthsMM.slice(),radiusMM:ROUTES.radiusMM,source:'https://help.prusa3d.com/guide/7-bodywork-electronics_982292#996665'};
 const api={mesh,report:null,get active(){return active;},update(viewer){
  if(!active||viewer.disposed||viewer.sideSensorHardware?.mountedSensorLead!==api||api.update!==ownedUpdate)return;
  if(mesh.geometry!==g||g.attributes.position!==pa||g.attributes.normal!==na||g.index!==index||g.attributes.position.array!==pa.array||g.attributes.normal.array!==na.array)throw Error('Mounted sensor lead geometry owner changed');
  const visible=m=>{for(let p=m;p;p=p.parent)if(!p.visible)return false;return true;},shown=bodies.find(visible),body=shown||bodies.find(m=>m.userData.part===(viewer.state?.edition==='original2251'?'sensorOld':'sensorBody')),normalContext=viewer.state?.flow!=='service',mountedContext=viewer.operationScene?.full||viewer.operationScene?.plan.workspace==='printer',sourceCurrent=viewer.fasteners?.entities.get('sensorWire')===sourceCable&&sourceCable.geometry===sourceCable.mesh.geometry,assembledHarness=sourceCurrent&&visible(sourceCable.mesh)&&sourceCable.mesh.userData.flexState?.amount>=1;mesh.visible=!!(normalContext&&mountedContext&&assembledHarness&&shown&&shown.geometry===bodyGeometries.get(shown));if(!normalContext||!sourceCurrent||!body||body.geometry!==bodyGeometries.get(body))return;
  body.updateMatrix();const frame=mesh.visible?body.matrix.clone():bodyFrames.get(body).clone();for(const k of [12,13,14])frame.elements[k]*=1000;const family=body.userData.part==='sensorOld'?'R1':'Plus',key=family+':'+frame.elements.join(',');let q=cache.get(key);if(!q){q=makeLead(frame,family);if(cache.size>=2)cache.delete(cache.keys().next().value);cache.set(key,q);}if(api.key===key)return;api.key=key;pa.array.set(q.positions);na.array.set(q.normals);pa.needsUpdate=na.needsUpdate=true;g.computeBoundingBox();g.computeBoundingSphere();api.report=q.report;mesh.userData.flexState=q.report;
 },retire(){retireOwned();}};
 const ownedUpdate=api.update,retireOwned=()=>{if(!active)return;active=false;cache.clear();};g.addEventListener('dispose',retireOwned);return api;
}
export function followMountedSensorLead(viewer){viewer.sideSensorHardware?.mountedSensorLead?.update(viewer);}

// Preferred analytic reference entry point; no native mesh payload is read.
export {makeLead as sensorMountedLeadReference};

export function sensorMountedLeadTopology(){const ix=[],groups=[];for(let row=0;row<3;row++){const begin=ix.length;for(let i=1;i<R;i++)for(let j=0;j<RAD;j++){const a=(row*R+i-1)*(RAD+1)+j,b=a+RAD+1;ix.push(a,b,a+1,b,b+1,a+1);}for(let end=0;end<2;end++){const a=BODY_VERTICES+(row*2+end)*(RAD+2);for(let j=0;j<RAD;j++)ix.push(a,a+1+j+(end?1:0),a+1+j+(end?0:1));}groups.push({start:begin,count:ix.length-begin,materialIndex:0});}return{indices:ix,groups};}
