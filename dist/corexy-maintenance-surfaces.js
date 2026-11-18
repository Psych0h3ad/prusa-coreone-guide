// SPDX-License-Identifier: MIT
import*as T from'three';
const V=p=>new T.Vector3(...p),basis=t=>{const up=V([0,0,1]).addScaledVector(t,-t.z).normalize(),side=new T.Vector3().crossVectors(up,t).normalize();return new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(side,up,t));};
function sourceTangent(curve,f){const e=.002;return curve.getPointAt(Math.min(1,f+e)).sub(curve.getPointAt(Math.max(0,f-e))).normalize();}
export function relativeFrame(curve,f){const a=sourceTangent(curve.source,f),b=curve.materialTangent(f),q=new T.Quaternion().setFromUnitVectors(a,b),u=V([0,0,1]).addScaledVector(a,-a.z),v=V([0,0,1]).addScaledVector(b,-b.z),weight=T.MathUtils.smoothstep(Math.min(u.length(),v.length()),.1,.3);if(weight){u.normalize().applyQuaternion(q);v.normalize();const angle=Math.atan2(b.dot(new T.Vector3().crossVectors(u,v)),u.dot(v));q.premultiply(new T.Quaternion().setFromAxisAngle(b,angle*weight));}return q.normalize();}
export class SourceTubeFollower{
 constructor(entity,sourceCurve,radial,inner=false){Object.assign(this,{entity,sourceCurve,radial,inner});this.mesh=entity.mesh;this.g=entity.mesh.geometry;this.P=this.g.attributes.position.array.slice();this.N=this.g.attributes.normal.array.slice();this.count=inner?entity.surface.segments:entity.samples;this.stride=radial+1;
  this.fractions=Array.from({length:this.count+1},(_,i)=>inner?sourceCurve.lengths[i]/sourceCurve.getLength():i/this.count);this.centres=this.fractions.map(f=>sourceCurve.getPointAt(f));this.posedP=this.P.slice();this.posedN=this.N.slice();
 }
 restore(){this.g.attributes.position.array.set(this.P);this.g.attributes.normal.array.set(this.N);this.g.attributes.position.needsUpdate=this.g.attributes.normal.needsUpdate=true;this.g.computeBoundingBox();this.g.computeBoundingSphere();}
 write(curve){if(curve.neutral){this.restore();this.posedP.set(this.P);this.posedN.set(this.N);return;}const pos=this.g.attributes.position,normal=this.g.attributes.normal,layers=this.inner?2:1,body=(this.count+1)*this.stride*layers;
  for(let i=0;i<=this.count;i++){const f=this.fractions[i],old=this.centres[i],point=curve.materialPoint(f),rigid=curve.materialTransform?.(f),q=rigid?.q||relativeFrame(curve,f),map=k=>{const p=V(Array.from(this.P.subarray(k*3,k*3+3))).multiplyScalar(1000).sub(old).applyQuaternion(q).add(point).multiplyScalar(.001),n=V(Array.from(this.N.subarray(k*3,k*3+3))).applyQuaternion(q);pos.setXYZ(k,p.x,p.y,p.z);normal.setXYZ(k,n.x,n.y,n.z);};
   for(let layer=0;layer<layers;layer++)for(let r=0;r<=this.radial;r++)map(layer*(this.count+1)*this.stride+i*this.stride+r);
   if(this.inner&&(i===0||i===this.count)){const end=i===0?0:1;for(let layer=0;layer<2;layer++)for(let r=0;r<=this.radial;r++)map(body+end*this.stride*2+layer*this.stride+r);}
  }
  pos.needsUpdate=normal.needsUpdate=true;this.g.computeBoundingBox();this.g.computeBoundingSphere();this.posedP.set(pos.array);this.posedN.set(normal.array);
 }
 repeat(){this.g.attributes.position.array.set(this.posedP);this.g.attributes.normal.array.set(this.posedN);this.g.attributes.position.needsUpdate=this.g.attributes.normal.needsUpdate=true;this.g.computeBoundingBox();this.g.computeBoundingSphere();}
}
export class SourceBandFollower{
 constructor(entity,sourceCurve){Object.assign(this,{entity,sourceCurve});this.g=entity.mesh.geometry;this.P=this.g.attributes.position.array.slice();this.N=this.g.attributes.normal.array.slice();const sample=Array.from({length:2049},(_,i)=>sourceCurve.getPointAt(i/2048));this.indices=[];this.offsets=[];
  for(let i=0;i<this.P.length/3;i++){const p=V(Array.from(this.P.subarray(i*3,i*3+3))).multiplyScalar(1000);let at=0,best=Infinity;for(let k=0;k<sample.length;k++){const d=p.distanceToSquared(sample[k]);if(d<best){best=d;at=k;}}this.indices.push(at);this.offsets.push(p.sub(sample[at]));}
  this.used=[...new Set(this.indices)];this.posedP=this.P.slice();this.posedN=this.N.slice();
 }
 restore(){this.g.attributes.position.array.set(this.P);this.g.attributes.normal.array.set(this.N);this.g.attributes.position.needsUpdate=this.g.attributes.normal.needsUpdate=true;this.g.computeBoundingBox();this.g.computeBoundingSphere();}
 write(curve,turn){if(curve.neutral){this.restore();this.posedP.set(this.P);this.posedN.set(this.N);return;}const frames=new Map(this.used.map(k=>[k,{p:curve.materialPoint(k/2048),q:relativeFrame(curve,k/2048)}])),pos=this.g.attributes.position,normal=this.g.attributes.normal;
  for(let i=0;i<this.indices.length;i++){const{p,q}=frames.get(this.indices[i]),v=this.offsets[i].clone().applyQuaternion(q).add(p).multiplyScalar(.001),n=V(Array.from(this.N.subarray(i*3,i*3+3))).applyQuaternion(q);pos.setXYZ(i,v.x,v.y,v.z);normal.setXYZ(i,n.x,n.y,n.z);}if(turn?.angle){const pivot=curve.materialPoint(turn.fraction),q=new T.Quaternion().setFromAxisAngle(curve.materialTangent(turn.fraction),turn.angle);for(let i=0;i<pos.count;i++){const p=new T.Vector3().fromBufferAttribute(pos,i).multiplyScalar(1000).sub(pivot).applyQuaternion(q).add(pivot).multiplyScalar(.001),n=new T.Vector3().fromBufferAttribute(normal,i).applyQuaternion(q);pos.setXYZ(i,p.x,p.y,p.z);normal.setXYZ(i,n.x,n.y,n.z);}}pos.needsUpdate=normal.needsUpdate=true;this.g.computeBoundingBox();this.g.computeBoundingSphere();this.posedP.set(pos.array);this.posedN.set(normal.array);
 }
 repeat(){this.g.attributes.position.array.set(this.posedP);this.g.attributes.normal.array.set(this.posedN);this.g.attributes.position.needsUpdate=this.g.attributes.normal.needsUpdate=true;this.g.computeBoundingBox();this.g.computeBoundingSphere();}
}
// The source sleeve R4.2 surrounds the source main cable R4. Its end faces
// are complete annuli, not solid discs across that cable. Original outer skin
// and all source end-ring vertices remain untouched.
export function createSleeveEndCaps(source,coreRadius=4){
 const stride=9,n=source.samples,ratio=coreRadius/source.radius;if(!(ratio>0&&ratio<1))throw Error('Source sleeve/core radii required');const P=new Float32Array(2*18*3),N=P.slice(),I=[];
 for(let e=0;e<2;e++)for(let j=0;j<8;j++){const a=e*18+j,b=a+1,c=a+9,d=c+1;I.push(...(e?[a,b,c,b,d,c]:[a,c,b,b,c,d]));}
 const g=new T.BufferGeometry().setAttribute('position',new T.BufferAttribute(P,3)).setAttribute('normal',new T.BufferAttribute(N,3)).setIndex(I);
 return{geometry:g,write(curve){const p=source.geometry.attributes.position,normal=g.attributes.normal;for(let e=0;e<2;e++){const ring=e*n*stride;let c=new T.Vector3();for(let j=0;j<8;j++)c.add(new T.Vector3().fromBufferAttribute(p,ring+j));c.multiplyScalar(1/8);const tangent=curve.getTangentAt(e).multiplyScalar(e?1:-1);for(let j=0;j<9;j++){const outer=new T.Vector3().fromBufferAttribute(p,ring+j),inner=outer.clone().sub(c).multiplyScalar(ratio).add(c);for(const[k,v]of[[0,outer],[9,inner]]){g.attributes.position.setXYZ(e*18+k+j,v.x,v.y,v.z);normal.setXYZ(e*18+k+j,tangent.x,tangent.y,tangent.z);}}}g.attributes.position.needsUpdate=normal.needsUpdate=true;g.computeBoundingBox();g.computeBoundingSphere();}};
}
// Circular2GT construction from MISUMI p1459. b=.4 is the flank-circle
// centre offset, not a root-flat width. R1=.15,R2=1,R3=.555,h=.75.
const rootX=Math.sqrt(1.15**2-.15**2)-.4,joinTip=.4*.555/.445,joinRoot=-.4+(rootX+.4)/1.15;
export function referenceGT2Depth(phase){const x=Math.abs(((phase-.75+1)%2+2)%2-1);return x<=joinTip?.195+Math.sqrt(Math.max(0,.555**2-x*x)):x<=joinRoot?Math.sqrt(Math.max(0,1-(x+.4)**2)):x<rootX?.15-Math.sqrt(Math.max(0,.15**2-(x-rootX)**2)):0;}
export class WholeBeltSkin{
 constructor(route){this.route=route;this.count=12192;const P=new Float32Array((this.count+1)*8*3),N=P.slice(),I=[];for(let i=0;i<this.count;i++)for(let k=0;k<4;k++){const a=i*8+k*2,b=a+1,c=a+8,d=c+1;I.push(...(route.upper?[a,b,c,b,d,c]:[a,c,b,b,c,d]));}for(const end of[0,this.count]){const b=end*8,forward=(end===this.count)===route.upper;I.push(...(forward?[b,b+2,b+4,b,b+4,b+6]:[b,b+4,b+2,b,b+6,b+4]));}this.g=new T.BufferGeometry().setAttribute('position',new T.BufferAttribute(P,3)).setAttribute('normal',new T.BufferAttribute(N,3)).setIndex(I);}
 write(){const p=this.g.attributes.position,curve=this.route,tooth=curve.route.tooth,phaseOffset=curve.phaseMM||0,rootD=curve.rootD??.254,point=s=>curve.getMaterialPointAt(T.MathUtils.clamp(s/1524,0,1)),frame=s=>{const at=T.MathUtils.clamp(s,0,1524),c=point(at),t=point(Math.min(1524,at+.001)).sub(point(Math.max(0,at-.001))).normalize(),w=V([0,0,1]).addScaledVector(t,-t.z).normalize(),n=new T.Vector3().crossVectors(w,t).normalize().multiplyScalar(tooth);c.addScaledVector(t,s-at);return{c,t,w,n};},frames=new Map();
  const drive=curve.route.circles[4],rDrive=drive.r,engagedRadius=4.84+1.004;
  for(let i=0;i<=this.count;i++){const s=i/this.count*1524,F=frame(s),phase=((s+phaseOffset)%2+2)%2,depth=referenceGT2Depth(phase),tipS=Math.floor((s+phaseOffset-.75+1)/2)*2+.75-phaseOffset;let C=frames.get(tipS);if(!C){C=frame(tipS);const R=C.c.distanceTo(drive.p),fade=1-T.MathUtils.smoothstep(R,rDrive+.75,rDrive+1.25);C.engagement=fade;C.radius=R;C.phi=curve.driveAngle+curve.driveTurns*(Math.PI/8)+(curve.upper?1:-1)*(tipS-curve.driveTooth)/2*(Math.PI/8);frames.set(tipS,C);}
   // The nominal free section is swept along the supported material path.
   // At the drive it bends around the actual16T datum using the same complete
   // circular reference tooth. The full .63mm backing remains present.
   const root=F.c.clone().addScaledVector(F.n,rootD),rigid=F.c.clone().addScaledVector(F.n,rootD+depth),theta=C.phi+tooth*(s-tipS)/rDrive,polar=drive.p.clone().add(V([Math.cos(theta),Math.sin(theta),0]).multiplyScalar(C.radius-rootD-depth)),profile=rigid.lerp(polar,C.engagement),inner=profile.clone().sub(root).dot(F.n)>0?profile:root,outer=F.c.clone().addScaledVector(F.n,rootD-.63),corners=[outer.clone().addScaledVector(F.w,-3),inner.clone().addScaledVector(F.w,-3),inner.clone().addScaledVector(F.w,3),outer.clone().addScaledVector(F.w,3)];
   for(let k=0;k<4;k++)for(let j=0;j<2;j++){const v=corners[(k+j)%4].clone().multiplyScalar(.001);p.setXYZ(i*8+k*2+j,v.x,v.y,v.z);}
  }p.needsUpdate=true;this.g.computeVertexNormals();this.g.computeBoundingBox();this.g.computeBoundingSphere();
 }
}
