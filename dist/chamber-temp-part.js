import * as T from 'three';
import {chamberTempTeachingGuide} from './chamber-thermistor-view.js';
import {molexCad} from './molex-cad.js?v=20261111-94';
import {createClikMatePlug,clikMateMotion,clikMatePress} from './clik-mate-plug.js?v=20261111-94';
import {TEMP_REFERENCE as D,tempMaterialPath,tempFrame,tempHead,tempBodyOffset,seatedOutlet} from './chamber-temp-route.js';
const smooth=x=>{x=T.MathUtils.clamp(x,0,1);return x*x*(3-2*x);},vec=a=>new T.Vector3(...a);
function material(color,metalness=0){const m=new T.MeshStandardMaterial({color,metalness,roughness:metalness?.35:.8});m.userData.originalColor=m.color.clone();m.userData.originalOpacity=1;return m;}
export class ChamberTempPart{
 constructor(owner){
  this.id='cfTemp';this.d={body:71};this.owner=owner;this.body=owner.nativeGrid;this.bodyGeometry=this.body.geometry;this.bodyPosition=this.body.userData.restPosition.clone();this.retainedTie=owner.viewer.fasteners.entities.get('thermistor');this.retainedTieGeometry=this.retainedTie.mesh.geometry;this.retainedTiePosition=this.retainedTie.mesh.userData.restPosition.clone();
  this.skin=createClikMatePlug(2);this.cad=molexCad('5025780200');this.frame=tempFrame();
  this.stations=[...new Set([0,D.probeLengthMM,247,...Array.from({length:244},(_,i)=>247*i/243)])].sort((a,b)=>a-b);this.tailStations=Array.from({length:25},(_,i)=>247+13*i/24);
  const counts=[this.stations.length,this.tailStations.length,this.tailStations.length],rings=counts.reduce((n,c)=>n+c,0)*9;this.plugStart=rings;this.tipCentre=rings+this.skin.positions.length/3;const count=this.tipCentre+1,g=new T.BufferGeometry(),indices=[];g.setAttribute('position',new T.BufferAttribute(new Float32Array(count*3),3).setUsage(T.DynamicDrawUsage));g.setAttribute('normal',new T.BufferAttribute(new Float32Array(count*3),3).setUsage(T.DynamicDrawUsage));
  let base=0;for(let w=0;w<3;w++){const s=w?this.tailStations:this.stations;for(let i=0;i<s.length-1;i++){const first=indices.length;for(let j=0;j<8;j++){const a=base+i*9+j,b=a+9;indices.push(a,a+1,b,b,a+1,b+1);}g.addGroup(first,indices.length-first,w===0&&s[i+1]<=D.probeLengthMM+1e-9?3:0);}base+=s.length*9;}
  const first=indices.length;for(let i=0;i<this.skin.positions.length/3;i++)indices.push(this.plugStart+i);let at=first;for(const group of this.cad.groups){const count=Array.from(this.skin.releaseSkin.parentFaces).filter(f=>f*3>=group.start&&f*3<group.start+group.count).length*3;g.addGroup(at,count,group.material==='tin'?3:2);at+=count;}const cap=indices.length;for(let j=0;j<8;j++)indices.push(this.tipCentre,j+1,j);g.addGroup(cap,24,3);g.setIndex(indices);this.geometry=g;
  this.mesh=new T.Mesh(g,[material('#282a2b'),material('#282a2b'),material('#e6dec6'),material('#b8bbc0',.75)]);this.mesh.userData={part:this.id,component:this.id,maintenanceRegion:'ctThermistorAssembly',flexId:this.id,serviceTask:'chamber-thermistor',cadName:'Chamber thermistor · complete reference probe, cable, tails and2-pole plug',reference:true,supplement:true,preserveColours:true,qualification:D.qualification};this.curve=new T.CatmullRomCurve3([new T.Vector3(),new T.Vector3(0,0,.001)]);this.lastAmount=undefined;this.lastPress=undefined;
 }
 owns(){return this.owner.owns(this)&&this.body.geometry===this.bodyGeometry;}
 update(from,to,t){if(!this.owns()||!this.owner.enabled||this.update!==ChamberTempPart.prototype.update)return;let motion,amount;if(from>=2&&to>=2){motion=clikMateMotion(from-2,to-2,t);amount=2+motion.amount;}else amount=T.MathUtils.lerp(from,to,smooth(t));this.write(amount,motion);}
 syncBody(amount){const off=tempBodyOffset(amount).multiplyScalar(.001);this.owner.positionBorrowed(this.body,this.bodyPosition.clone().add(off));if(this.owner.viewer.fasteners.entities.get('thermistor')===this.retainedTie&&this.retainedTie.mesh.geometry===this.retainedTieGeometry)this.owner.positionBorrowed(this.retainedTie.mesh,this.retainedTiePosition.clone().add(off));for(const e of this.owner.entities)if(e.followChamberBody===this.id&&this.owner.owns(e))e.mesh.position.copy(e.mesh.userData.restPosition).add(off);}
 write(amount,motion,handling=0){
  const press=motion?clikMatePress(motion,Math.max(0,3-amount)*12):0;this.amount=amount;this.syncBody(amount);
  if(this.lastAmount===amount&&this.lastPress===press&&this.lastHandling===handling)return;this.lastAmount=amount;this.lastPress=press;this.lastHandling=handling;const path=tempMaterialPath(amount,handling),p=this.geometry.attributes.position,n=this.geometry.attributes.normal;
  const centre=[];let base=0,terminalNormal;
  for(let w=0;w<3;w++){
   const stations=w?this.tailStations:this.stations,points=stations.map(s=>{const c=path.at(s);if(w){const t=path.tangent(s),row=new T.Vector3(1,0,0).addScaledVector(t,-t.x).normalize(),offset=(w===1?-1:1)*(.5+.25*smooth((s-247)/4));c.addScaledVector(row,offset);}return c;});let previous=w?path.tangent(247):path.tangent(0);
   // Transport the complete cross-section with the rigid probe. A fixed Y
   // seed collapses when the probe is aligned with either honeycomb bore.
   const normal=w?terminalNormal.clone():new T.Vector3(0,1,0).applyQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(.2,0,-Math.sqrt(.96)),previous));
   for(let i=0;i<stations.length;i++){
    const c=points[i],tangent=w?points[Math.min(points.length-1,i+1)].clone().sub(points[Math.max(0,i-1)]).normalize():path.tangent(stations[i]);
    normal.applyQuaternion(new T.Quaternion().setFromUnitVectors(previous,tangent));normal.addScaledVector(tangent,-normal.dot(tangent)).normalize();const binormal=tangent.clone().cross(normal).normalize();previous=tangent;
    if(!w)centre.push(c.clone().multiplyScalar(.001));for(let j=0;j<=8;j++){const angle=j/8*Math.PI*2,N=normal.clone().multiplyScalar(Math.cos(angle)).addScaledVector(binormal,Math.sin(angle)),P=c.clone().addScaledVector(N,w?D.tailRadiusMM:D.bulkRadiusMM).multiplyScalar(.001),at=base+i*9+j;p.setXYZ(at,P.x,P.y,P.z);n.setXYZ(at,N.x,N.y,N.z);}
   }
   if(!w)terminalNormal=normal.clone();base+=stations.length*9;
  }
  const endpoint=path.head,delta=endpoint.clone().sub(seatedOutlet()),P=new T.Vector3(),N=new T.Vector3(),a=this.skin.positions,b=this.skin.pressedPositions,c=this.skin.normals,d=this.skin.pressedNormals;for(let i=0;i<a.length/3;i++){const j=i*3;P.set(a[j]+(b[j]-a[j])*press,a[j+1]+(b[j+1]-a[j+1])*press,a[j+2]+(b[j+2]-a[j+2])*press);N.set(c[j]+(d[j]-c[j])*press,c[j+1]+(d[j+1]-c[j+1])*press,c[j+2]+(d[j+2]-c[j+2])*press).normalize();P.set(-P.x,P.z,P.y+1.25).applyMatrix4(this.frame).add(delta).multiplyScalar(.001);N.set(-N.x,N.z,N.y).transformDirection(this.frame);p.setXYZ(this.plugStart+i,P.x,P.y,P.z);n.setXYZ(this.plugStart+i,N.x,N.y,N.z);}
  const tip=path.at(0).multiplyScalar(.001),tipNormal=path.tangent(0).negate();p.setXYZ(this.tipCentre,tip.x,tip.y,tip.z);n.setXYZ(this.tipCentre,tipNormal.x,tipNormal.y,tipNormal.z);p.needsUpdate=true;n.needsUpdate=true;this.geometry.computeBoundingBox();this.geometry.computeBoundingSphere();this.curve.points=centre;this.curve.updateArcLengths();this.metrics={materialReferenceMM:D.stockMM,analyticCentrelineMM:path.length,stockErrorMM:path.stockErrorMM,bulkRadiusMM:D.bulkRadiusMM,tailRadiusMM:D.tailRadiusMM,probeLengthMM:D.probeLengthMM,referenceNotOEMMetrology:true};this.mesh.userData.flexState={amount,handling,press,phase:motion?.phase||(handling?'probe-unthreading':'routing'),...this.metrics};
 }
 guide(to=3,from=0){if(!this.owns()||!this.owner.enabled||this.guide!==ChamberTempPart.prototype.guide)return[];return chamberTempTeachingGuide(to,from);}
}
