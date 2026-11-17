import * as T from 'three';
import {roundedCablePath,roundedLength} from './lcd-cable-motion.js';
import {FreeMaterialBank} from './xbuddy-complete-material.js';
const V=p=>new T.Vector3(...p);
export class MotorLead{
 constructor(id,stockMM,points){
  this.id=id;this.stockMM=stockMM;this.reference=points.map(p=>[...p]);this.samples=256;this.meshes=[];this.receipt=null;let longest=0;this.slackSegment=0;for(let i=0;i<this.reference.length-1;i++){const d=V(this.reference[i]).distanceTo(V(this.reference[i+1]));if(d>longest){longest=d;this.slackSegment=i;}}const a=V(this.reference[this.slackSegment]),b=V(this.reference[this.slackSegment+1]),mid=a.clone().add(b).multiplyScalar(.5);this.slackDirection=new T.Vector3(0,0,1).cross(b.clone().sub(a)).normalize();if(this.slackDirection.lengthSq()<.5)this.slackDirection.set(1,0,0);if(this.slackDirection.dot(new T.Vector3(-mid.x,-mid.y,0))<0)this.slackDirection.negate();this.slackDirection.normalize();
  for(const [i,color]of ['#cc303b','#365ea9','#26947b','#292c2e'].entries()){
   const g=new T.BufferGeometry(),ix=[];g.setAttribute('position',new T.BufferAttribute(new Float32Array(257*9*3),3));g.setAttribute('normal',new T.BufferAttribute(new Float32Array(257*9*3),3));
   for(let j=0;j<256;j++)for(let k=0;k<8;k++){const a=j*9+k,b=a+9;ix.push(a,a+1,b,b,a+1,b+1);}g.setIndex(ix);
   const m=new T.MeshStandardMaterial({color,roughness:.58});m.userData.originalColor=m.color.clone();m.userData.originalOpacity=1;const mesh=new T.Mesh(g,m);mesh.userData={part:'motorServiceParts',component:id,maintenanceComponent:id,componentOnly:true,toolOnly:true,serviceTask:'z-motor-replacement',reference:true,cadName:id+' · complete conductor '+(i+1),qualification:'Functional reference: fixed authored centreline stock, source171 .37mm conductor radius and .72mm bundle orbit; not an OEM wire cutlength or supplier mesh.'};this.meshes.push(mesh);
  }
 }
 write(root,end,delta,following,placementMM=[0,0,0]){
  // The director restores object transforms before every ordinary seek.
  for(const mesh of this.meshes){mesh.position.copy(V(placementMM).multiplyScalar(.001));mesh.quaternion.identity();}
  const poseKey=[...root,...end,...delta,following,...placementMM,...this.outward.toArray()].join(':');if(poseKey===this.poseKey)return this.receipt;
  const route=this.reference.map(p=>V(p).add(V(delta).multiplyScalar(following)));route[0]=V(root);route[1]=V(this.reference[1]).add(V(delta));route[route.length-1]=V(end);route[route.length-2]=V(end).addScaledVector(this.outward,5);route[route.length-3]=V(end).addScaledVector(this.outward,17);
  let curve,amp,minimum,measured,chart='rounded fixed support span';
  if(this.id.startsWith('zmFL')){
   // A permanent semicircle carries the real +X cap axis into a -X return.
   // Only the broad bank pays material in/out as the splitter/motor move.
   const A=V([-100,-110,-35]).add(V(delta).multiplyScalar(following)),start=V(root),t0=V([1,0,0]),tA=V([0,1,0]),prefix=new T.CubicBezierCurve3(start,start.clone().addScaledVector(t0,20),A.clone().addScaledVector(tA,-20),A);prefix.arcLengthDivisions=2048;
   const centre=V(end).add(V([40,20,0])),P=centre.clone().add(V([0,20,0])),C=centre.clone().add(V([0,-20,0])),R=20;
   class HalfTurn extends T.Curve{getPoint(t,out=new T.Vector3()){return out.copy(centre).add(V([R*Math.sin(Math.PI*t),R*Math.cos(Math.PI*t),0]));}getTangent(t,out=new T.Vector3()){return out.set(Math.cos(Math.PI*t),-Math.sin(Math.PI*t),0);}getLength(){return Math.PI*R;}}
   const fixed=prefix.getLength()+Math.PI*R+C.distanceTo(V(end)),stock=this.stockMM-fixed;if(!(stock>0))throw Error('Left lead fixed arc exceeds full stock '+this.id+' '+fixed);
   const bank=new FreeMaterialBank({start:A,startT:tA,end:P,endT:t0,stock,direction:[0,1,0],handleMM:110}),arc=new HalfTurn(),tail=new T.LineCurve3(C,V(end));curve=new T.CurvePath();curve.add(prefix);curve.add(bank);curve.add(arc);curve.add(tail);amp=bank.a;minimum=fixed+A.distanceTo(P);measured=fixed+bank.measuredMM;chart='C1 prefix + material bank with110mm tangent handles + radius20 XY semicircle +40mm actual +X cap straight';
  }else{
   const k=this.slackSegment,a=route[k],b=route[k+1],direction=this.slackDirection,build=amp=>[...route.slice(0,k+1),...Array.from({length:9},(_,i)=>a.clone().lerp(b,(i+1)/10).addScaledVector(direction,amp*Math.sin(Math.PI*(i+1)/10)**2)),...route.slice(k+1)].filter((p,i,ps)=>!i||p.distanceTo(ps[i-1])>1e-8),length=amp=>roundedLength(build(amp).map(p=>p.toArray()),4,.4);
   minimum=length(0);if(minimum>this.stockMM+.0001)throw Error('Motor lead stock infeasible '+this.id+' '+minimum+' > '+this.stockMM);
   let lo=0,hi=20;while(length(hi)<this.stockMM&&hi<1280)hi*=2;if(length(hi)<this.stockMM)throw Error('Motor lead slack bracket '+this.id);
   for(let i=0;i<35;i++){const mid=(lo+hi)/2;if(length(mid)<this.stockMM)lo=mid;else hi=mid;}
   amp=(lo+hi)/2;curve=roundedCablePath(build(amp),.4);measured=length(amp);
  }
  curve.arcLengthDivisions=4096;const frames=curve.computeFrenetFrames(256,false);
  for(let wire=0;wire<4;wire++){this.meshes[wire].position.copy(V(placementMM).multiplyScalar(.001));const g=this.meshes[wire].geometry,p=g.attributes.position,n=g.attributes.normal;
   for(let i=0;i<=256;i++){const c=curve.getPointAt(i/256),angle=i/256*12*Math.PI+wire*Math.PI/2,normal=frames.normals[i],binormal=frames.binormals[i],centre=c.clone().addScaledVector(normal,.72*Math.cos(angle)).addScaledVector(binormal,.72*Math.sin(angle));
    for(let j=0;j<=8;j++){const r=j/8*2*Math.PI,d=normal.clone().multiplyScalar(Math.cos(r)).addScaledVector(binormal,Math.sin(r)),q=centre.clone().addScaledVector(d,.37).sub(V(placementMM)).multiplyScalar(.001);p.setXYZ(i*9+j,q.x,q.y,q.z);n.setXYZ(i*9+j,d.x,d.y,d.z);}
   }p.needsUpdate=true;n.needsUpdate=true;g.computeBoundingBox();g.computeBoundingSphere();
  }
  this.curve=curve;this.receipt={stockMM:this.stockMM,roundedLengthMM:measured,dense4096LengthMM:curve.getLengths(4096).at(-1),slackAmplitudeMM:amp,minimumRouteMM:minimum,chart,rootMM:root,endMM:end,placementMM,connectorFrameShared:true,radiusMM:.37,conductorCount:4,completeTrianglesPerConductor:4096,qualification:'Authored bundle-centreline stock, not OEM cutlength or individual-conductor strain certification. dense4096LengthMM is a sampled polyline observation. Complete fixed-radius geometry; infeasible roots throw and are never replaced with old geometry.'};this.poseKey=poseKey;return this.receipt;
 }
}
