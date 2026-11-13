import * as T from 'three';

// Clip copies of the actual CAD triangles to a small attention region. This
// overlay follows the workpiece; it does not replace or alter its geometry.
export function operationRegion(meshes,bounds){
 const output=[],lo=bounds.slice(0,3).map(v=>v*.001),hi=bounds.slice(3).map(v=>v*.001);
 const clip=(polygon,axis,limit,sign)=>{
  const result=[];for(let i=0;i<polygon.length;i++){
   const a=polygon[i],b=polygon[(i+1)%polygon.length],da=(a[axis]-limit)*sign,db=(b[axis]-limit)*sign;
   if(da>=0)result.push(a);if((da>=0)!==(db>=0))result.push(a.map((v,k)=>v+(b[k]-v)*da/(da-db)));
  }return result;
 };
 for(const m of meshes){
  const g=m.geometry,a=g.attributes.position,index=g.index,mat=new T.Matrix4().compose(m.userData.sceneRestPosition,m.userData.sceneRestQuaternion,m.scale),count=index?index.count:a.count;
  for(let i=0;i<count;i+=3){
   let polygon=[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(a,index?index.getX(i+j):i+j).applyMatrix4(mat).toArray());
   for(let axis=0;axis<3&&polygon.length;axis++){polygon=clip(polygon,axis,lo[axis],1);polygon=clip(polygon,axis,hi[axis],-1);}
   for(let j=1;j<polygon.length-1;j++)output.push(...polygon[0],...polygon[j],...polygon[j+1]);
  }
 }
 if(!output.length)return null;
 const geometry=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(output,3));
 const mesh=new T.Mesh(geometry,new T.MeshBasicMaterial({color:0xfd5000,side:T.DoubleSide,transparent:true,opacity:.85,depthTest:false,depthWrite:false,toneMapped:false}));
 mesh.matrixAutoUpdate=false;mesh.renderOrder=23;mesh.userData={ownedGeometry:true,motionHighlight:true};return mesh;
}
