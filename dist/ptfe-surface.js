import * as T from 'three';

// Fixed buffers, an open lumen, and separate annular end normals.
export class TubeSurface{
 constructor(segments=1024,radial=16){
  Object.assign(this,{segments,radial});const rings=segments+1,stride=radial+1,body=rings*stride*2,total=body+stride*4;
  const g=this.geometry=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(new Float32Array(total*3),3).setUsage(T.DynamicDrawUsage));g.setAttribute('normal',new T.BufferAttribute(new Float32Array(total*3),3).setUsage(T.DynamicDrawUsage));
  const ix=[];
  for(let inner=0;inner<2;inner++)for(let i=0;i<segments;i++)for(let j=0;j<radial;j++){
   const a=inner*rings*stride+i*stride+j,b=a+1,c=a+stride,d=c+1;
   if(inner)ix.push(a,c,b,b,c,d);else ix.push(a,b,c,b,d,c);
  }
  for(let end=0;end<2;end++)for(let j=0;j<radial;j++){
   const a=body+end*stride*2+j,b=a+1,c=a+stride,d=c+1;
   if(end)ix.push(a,b,c,b,d,c);else ix.push(a,c,b,b,c,d);
  }
  g.setIndex(ix);this.tangent=new T.Vector3();this.previous=new T.Vector3();this.side=new T.Vector3();this.binormal=new T.Vector3();this.rotation=new T.Quaternion();this.normal=new T.Vector3();
 }
 update(points){
  const n=this.segments,r=this.radial,stride=r+1,rings=n+1,body=rings*stride*2,p=this.geometry.attributes.position,normal=this.geometry.attributes.normal;
  for(let i=0;i<=n;i++){
   const a=Math.max(0,i-1)*3,b=Math.min(n,i+1)*3;this.tangent.set(points[b]-points[a],points[b+1]-points[a+1],points[b+2]-points[a+2]).normalize();
   if(i===0){this.side.set(Math.abs(this.tangent.x)<.8?1:0,Math.abs(this.tangent.x)<.8?0:1,0);}
   else{this.rotation.setFromUnitVectors(this.previous,this.tangent);this.side.applyQuaternion(this.rotation);}
   this.side.addScaledVector(this.tangent,-this.side.dot(this.tangent)).normalize();this.binormal.crossVectors(this.tangent,this.side).normalize();this.previous.copy(this.tangent);
   for(let j=0;j<=r;j++){
    const angle=j/r*Math.PI*2;this.normal.copy(this.side).multiplyScalar(Math.cos(angle)).addScaledVector(this.binormal,Math.sin(angle));
    for(let inner=0;inner<2;inner++){
     const k=inner*rings*stride+i*stride+j,radius=inner?1.25:2;
     p.setXYZ(k,(points[i*3]+radius*this.normal.x)*.001,(points[i*3+1]+radius*this.normal.y)*.001,(points[i*3+2]+radius*this.normal.z)*.001);
     const sign=inner?-1:1;normal.setXYZ(k,sign*this.normal.x,sign*this.normal.y,sign*this.normal.z);
     if(i===0||i===n){const end=i===0?0:1,q=body+end*stride*2+inner*stride+j;p.setXYZ(q,p.getX(k),p.getY(k),p.getZ(k));normal.setXYZ(q,this.tangent.x*(end?1:-1),this.tangent.y*(end?1:-1),this.tangent.z*(end?1:-1));}
    }
   }
  }
  p.needsUpdate=true;normal.needsUpdate=true;this.geometry.computeBoundingBox();this.geometry.computeBoundingSphere();return this.geometry;
 }
}
