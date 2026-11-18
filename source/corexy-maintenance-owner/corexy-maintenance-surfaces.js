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
 write(curve){if(curve.neutral){this.restore();this.posedP.set(this.P);this.posedN.set(this.N);return;}const frames=new Map(this.used.map(k=>[k,{p:curve.materialPoint(k/2048),q:relativeFrame(curve,k/2048)}])),pos=this.g.attributes.position,normal=this.g.attributes.normal;
  for(let i=0;i<this.indices.length;i++){const{p,q}=frames.get(this.indices[i]),v=this.offsets[i].clone().applyQuaternion(q).add(p).multiplyScalar(.001),n=V(Array.from(this.N.subarray(i*3,i*3+3))).applyQuaternion(q);pos.setXYZ(i,v.x,v.y,v.z);normal.setXYZ(i,n.x,n.y,n.z);}pos.needsUpdate=normal.needsUpdate=true;this.g.computeBoundingBox();this.g.computeBoundingSphere();this.posedP.set(pos.array);this.posedN.set(normal.array);
 }
 repeat(){this.g.attributes.position.array.set(this.posedP);this.g.attributes.normal.array.set(this.posedN);this.g.attributes.position.needsUpdate=this.g.attributes.normal.needsUpdate=true;this.g.computeBoundingBox();this.g.computeBoundingSphere();}
}
export function createSleeveEndCaps(source){const stride=9,n=source.samples,P=new Float32Array(2*10*3),N=P.slice(),I=[];for(let e=0;e<2;e++)for(let j=0;j<8;j++){const c=e*10,r=e*10+1+j,k=e*10+1+(j+1)%8;I.push(...(e?[c,r,k]:[c,k,r]));}const g=new T.BufferGeometry().setAttribute('position',new T.BufferAttribute(P,3)).setAttribute('normal',new T.BufferAttribute(N,3)).setIndex(I);
 return{geometry:g,write(curve){const p=source.geometry.attributes.position,normal=g.attributes.normal;for(let e=0;e<2;e++){const ring=e*n*stride;let c=new T.Vector3();for(let j=0;j<8;j++)c.add(new T.Vector3().fromBufferAttribute(p,ring+j));c.multiplyScalar(1/8);g.attributes.position.setXYZ(e*10,c.x,c.y,c.z);const tangent=curve.getTangentAt(e).multiplyScalar(e?1:-1);for(let j=0;j<9;j++){const v=new T.Vector3().fromBufferAttribute(p,ring+j);g.attributes.position.setXYZ(e*10+j+1,v.x,v.y,v.z);}for(let j=0;j<10;j++)normal.setXYZ(e*10+j,tangent.x,tangent.y,tangent.z);}g.attributes.position.needsUpdate=normal.needsUpdate=true;g.computeBoundingBox();g.computeBoundingSphere();}};
}
export class WholeBeltSkin{
 constructor(route){this.route=route;this.count=3048;const P=new Float32Array((this.count+1)*8*3),N=P.slice(),I=[];for(let i=0;i<this.count;i++)for(let k=0;k<4;k++){const a=i*8+k*2,b=a+1,c=a+8,d=c+1;I.push(...(route.upper?[a,b,c,b,d,c]:[a,c,b,b,c,d]));}for(const end of[0,this.count]){const b=end*8,forward=(end===this.count)===route.upper;I.push(...(forward?[b,b+2,b+4,b,b+4,b+6]:[b,b+4,b+2,b,b+6,b+4]));}this.g=new T.BufferGeometry().setAttribute('position',new T.BufferAttribute(P,3)).setAttribute('normal',new T.BufferAttribute(N,3)).setIndex(I);}
 write(){const p=this.g.attributes.position,curve=this.route,tooth=curve.route.tooth;for(let i=0;i<=this.count;i++){const f=i/this.count,c=(curve.getMaterialPointAt?.(f)||curve.getPointAt(f)),t=(curve.getMaterialPointAt?.(Math.min(1,f+1/this.count*.5))||curve.getPointAt(Math.min(1,f+1/this.count*.5))).sub(curve.getMaterialPointAt?.(Math.max(0,f-1/this.count*.5))||curve.getPointAt(Math.max(0,f-1/this.count*.5))).normalize(),w=V([0,0,1]).addScaledVector(t,-t.z).normalize(),n=new T.Vector3().crossVectors(w,t).normalize().multiplyScalar(tooth),phase=(f*1524+(curve.phaseMM||0))%2,depth=phase<.5?.75*phase/.5:phase<1?.75:phase<1.5?.75*(1.5-phase)/.5:0,corner=[[-3,-.63],[-3,depth],[3,depth],[3,-.63]];
  for(let k=0;k<4;k++)for(let j=0;j<2;j++){const[width,d]=corner[(k+j)%4],v=c.clone().addScaledVector(n,d+.254).addScaledVector(w,width).multiplyScalar(.001);p.setXYZ(i*8+k*2+j,v.x,v.y,v.z);}}
  p.needsUpdate=true;this.g.computeVertexNormals();this.g.computeBoundingBox();this.g.computeBoundingSphere();
 }
}
