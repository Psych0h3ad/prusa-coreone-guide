import * as T from 'three';

// Small elastic opening of the cable hook while guiding the wires through its
// mouth. This is an assembly illustration, not a material/force simulation.
const smooth=x=>{x=T.MathUtils.clamp(x,0,1);return x*x*(3-2*x);};
const slope=x=>x>0&&x<1?6*x*(1-x):0;
function refineJaw(source,frame){
 const g=source.index?source.toNonIndexed():source.clone(),position=g.attributes.position,normal=g.attributes.normal,triangles=[];
 for(let i=0;i<position.count;i+=3)triangles.push([0,1,2].map(j=>({p:new T.Vector3().fromBufferAttribute(position,i+j),n:new T.Vector3().fromBufferAttribute(normal,i+j)})));
 let faces=triangles;
 for(const plane of [-6,-4.5,-3,-1.5]){
  const result=[];
  for(const face of faces){const x=face.map(v=>v.p.clone().applyMatrix4(frame).x*1000-plane);
   if(Math.min(...x)>=-1e-8||Math.max(...x)<=1e-8){result.push(face);continue;}
   for(const sign of [-1,1]){const polygon=[];for(let i=0;i<3;i++){const j=(i+1)%3,a=face[i],b=face[j],inside=x[i]*sign>=0,next=x[j]*sign>=0;if(inside)polygon.push(a);if(inside!==next){const u=x[i]/(x[i]-x[j]);polygon.push({p:a.p.clone().lerp(b.p,u),n:a.n.clone().lerp(b.n,u).normalize()});}}for(let i=1;i+1<polygon.length;i++)result.push([polygon[0],polygon[i],polygon[i+1]]);}
  }faces=result;
 }
 const out=new T.BufferGeometry(),p=[],n=[];for(const f of faces)for(const v of f){p.push(...v.p.toArray());n.push(...v.n.toArray());}out.setAttribute('position',new T.Float32BufferAttribute(p,3));out.setAttribute('normal',new T.Float32BufferAttribute(n,3));g.dispose();return out;
}
export function createHotendHook(viewer){
 const mesh=viewer.meshes.find(m=>m.userData.cadIndex===857);
 if(!mesh)throw Error('Nextruder cable hook is missing');
 mesh.updateMatrix();const frame=mesh.matrix.clone(),inverse=frame.clone().invert(),normalFrame=new T.Matrix3().getNormalMatrix(frame),normalBack=normalFrame.clone().invert();
 const source=mesh.geometry,geometry=refineJaw(source,frame);mesh.geometry=geometry;
 const position=geometry.attributes.position,normal=geometry.attributes.normal,rest=position.array.slice(),restNormals=normal.array.slice(),weights=new Float32Array(position.count*3),normals=new Float32Array(position.count*3),p=new T.Vector3(),n=new T.Vector3(),direction=new T.Vector3(0,.001,0).transformDirection(inverse).multiplyScalar(.001);
 for(let i=0;i<position.count;i++){
  p.fromBufferAttribute(position,i).applyMatrix4(frame).multiplyScalar(1000);
  const x=(p.x+6)/3,z=(p.z-354)/2.5,side=p.y<-47.7?-1:1,k=i*3;
  weights[k]=smooth(x)*smooth(z)*side;weights[k+1]=slope(x)/3*smooth(z)*side;weights[k+2]=smooth(x)*slope(z)/2.5*side;
  n.fromBufferAttribute(normal,i).applyMatrix3(normalFrame).normalize().toArray(normals,k);
 }
 let last=NaN;
 return {mesh,source,rest,restNormals,apply(){
  let opening=0;
  for(const [id,e]of viewer.fasteners.entities)if(id.startsWith('hotend')&&e.mesh.visible){
   const amount=e.mesh.userData.flexState?.amount??1;if(amount<=0||amount>=.35)continue;
   // Open before the pair reaches the narrow mouth; release only after the
   // second wire is inside. Reversing the same pose sequence opens it first.
   opening=Math.max(opening,1.4*smooth((amount-.025)/.05)*smooth((.35-amount)/.025));
  }
  if(opening===last)return;last=opening;
  for(let i=0;i<position.count;i++){
   const k=i*3,delta=opening*weights[k];position.setXYZ(i,rest[k]+direction.x*delta,rest[k+1]+direction.y*delta,rest[k+2]+direction.z*delta);
   n.fromArray(normals,k);n.x-=opening*weights[k+1]*n.y;n.z-=opening*weights[k+2]*n.y;n.applyMatrix3(normalBack).normalize();normal.setXYZ(i,n.x,n.y,n.z);
  }
  // At rest return the exact source data, including the original normals.
  if(!opening){position.array.set(rest);normal.array.set(restNormals);}
  position.needsUpdate=true;normal.needsUpdate=true;geometry.computeBoundingBox();geometry.computeBoundingSphere();mesh.userData.hookOpening=opening;
 }};
}
