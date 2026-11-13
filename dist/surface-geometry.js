import * as T from 'three';

// Partition surfaces, rather than laying a decal over another depth-writing face.
export function splitTop(geometry){
 const source=geometry.index?geometry.toNonIndexed():geometry;
 const top=[],body=[],normal=source.attributes.normal;
 for(let i=0;i<normal.count;i+=3)(normal.getZ(i)>.999?top:body).push(i,i+1,i+2);
 const copy=indices=>{
  const g=new T.BufferGeometry();
  for(const [name,a]of Object.entries(source.attributes)){
   const data=new a.array.constructor(indices.length*a.itemSize);
   indices.forEach((v,i)=>{for(let k=0;k<a.itemSize;k++)data[i*a.itemSize+k]=a.array[v*a.itemSize+k];});
   g.setAttribute(name,new T.BufferAttribute(data,a.itemSize,a.normalized));
  }
  return g;
 };
 const result={top:copy(top),body:copy(body)};
 if(source!==geometry)source.dispose();geometry.dispose();return result;
}

// STL stores independent triangles. Smooth their shared curved edges without
// moving vertices, welding separate surfaces, or rounding mechanical corners.
export function smoothCreases(geometry,angle=Math.PI/5,tolerance=1e-7){
 const g=geometry.index?geometry.toNonIndexed():geometry,p=g.attributes.position;
 const normals=new Float32Array(p.count*3),faces=[],corners=[],buckets=new Map();
 const a=new T.Vector3(),b=new T.Vector3(),c=new T.Vector3();
 const key=i=>`${Math.round(p.getX(i)/tolerance)},${Math.round(p.getY(i)/tolerance)},${Math.round(p.getZ(i)/tolerance)}`;
 for(let i=0;i<p.count;i+=3){
  a.fromBufferAttribute(p,i);b.fromBufferAttribute(p,i+1);c.fromBufferAttribute(p,i+2);
  const ab=b.clone().sub(a),ac=c.clone().sub(a),n=ab.clone().cross(ac).normalize();faces.push(n);
  const points=[a.clone(),b.clone(),c.clone()];
  for(let k=0;k<3;k++){
   const edge1=points[(k+1)%3].clone().sub(points[k]),edge2=points[(k+2)%3].clone().sub(points[k]);
   const weight=edge1.lengthSq()&&edge2.lengthSq()?edge1.angleTo(edge2):0;
   const id=key(i+k);if(!buckets.has(id))buckets.set(id,[]);
   buckets.get(id).push({face:i/3,weight});corners.push(id);
  }
 }
 const limit=Math.cos(angle),sum=new T.Vector3();
 for(let i=0;i<p.count;i++){
  const normal=faces[Math.floor(i/3)];sum.set(0,0,0);
  for(const other of buckets.get(corners[i]))if(normal.dot(faces[other.face])>=limit)sum.addScaledVector(faces[other.face],other.weight);
  if(sum.lengthSq()<1e-16)sum.copy(normal);sum.normalize().toArray(normals,i*3);
 }
 g.setAttribute('normal',new T.BufferAttribute(normals,3));return g;
}
