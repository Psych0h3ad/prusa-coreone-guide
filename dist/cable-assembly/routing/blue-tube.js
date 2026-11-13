import * as T from'three';
const V=p=>new T.Vector3(...p);
export function captureTube(entity,units,incoming){const g=entity.mesh.geometry;return{entity,g,units,curve:incoming?.curve??entity.curve,positions:(incoming?.positions??g.attributes.position.array).slice(),normals:(incoming?.normals??g.attributes.normal.array).slice(),samples:entity.samples,radiusMM:entity.radius};}
export function restoreTube(b){if(b.entity.mesh.geometry!==b.g)return false;b.g.attributes.position.array.set(b.positions);b.g.attributes.normal.array.set(b.normals);b.entity.curve=b.curve;finish(b.g);return true;}
const finish=g=>{g.attributes.position.needsUpdate=true;g.attributes.normal.needsUpdate=true;g.computeBoundingBox();g.computeBoundingSphere();};
export function writeTube(b,curve){
 if(b.entity.mesh.geometry!==b.g)throw Error('Coordinated source geometry changed');const {g,samples,units}=b,old=b.curve,p=g.attributes.position,n=g.attributes.normal;
 for(let i=0;i<=samples;i++){
  const u=i/samples,a=old.getPointAt(u).multiplyScalar(units),c=curve.getPointAt(u).multiplyScalar(units),t0=old.getTangentAt(u).normalize(),t1=curve.getTangentAt(u).normalize(),q=new T.Quaternion().setFromUnitVectors(t0,t1);
  for(let j=0;j<=8;j++){const k=(i*9+j)*3,offset=V(b.positions.slice(k,k+3)).multiplyScalar(1000).sub(a).applyQuaternion(q),normal=V(b.normals.slice(k,k+3)).applyQuaternion(q);p.setXYZ(i*9+j,(c.x+offset.x)*.001,(c.y+offset.y)*.001,(c.z+offset.z)*.001);n.setXYZ(i*9+j,normal.x,normal.y,normal.z);}
 }
 p.array.set(b.positions.subarray(0,27),0);n.array.set(b.normals.subarray(0,27),0);p.array.set(b.positions.subarray(-27),p.array.length-27);n.array.set(b.normals.subarray(-27),n.array.length-27);b.entity.curve=curve;finish(g);
}
