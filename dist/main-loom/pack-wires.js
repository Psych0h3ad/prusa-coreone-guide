import * as T from"three";import{packedOffsets}from"./rest.js?v=20261112-113";
export function packMainWires(lead,curve,{twist=0,spreadScale=1}={}){
 const n=80,sides=6,per=(n+1)*(sides+1),centres=Array.from({length:n+1},(_,i)=>curve.getPointAt(i/n)),
  tangents=centres.map((_,i)=>curve.getTangentAt(i/n)),rows=[];rows[n]=lead.across.clone();
 for(let i=n-1;i>=0;i--){rows[i]=rows[i+1].clone().applyQuaternion(new T.Quaternion().setFromUnitVectors(tangents[i+1],tangents[i]));rows[i].addScaledVector(tangents[i],-rows[i].dot(tangents[i])).normalize();}
 const normal=new T.Vector3(),point=new T.Vector3(),offsets=lead.mainPackedOffsets??=packedOffsets(lead.pinOffsets),pos=lead.geometry.attributes.position,norm=lead.geometry.attributes.normal;
 lead.packedStrands=[];
 for(let wire=0;wire<22;wire++){
  const strand=centres.map((c,i)=>{
   const blend=T.MathUtils.smoothstep(i/n,.88,1),o=offsets[wire].clone().lerp(lead.pinOffsets[wire],blend),
    row=rows[i].clone().applyAxisAngle(tangents[i],twist*(1-T.MathUtils.smoothstep(i/n,.8,1))),up=tangents[i].clone().cross(row);
   const p=c.clone().addScaledVector(row,o.x).addScaledVector(up,o.y),material=curve.getLength()*(1-i/n),spread=spreadScale*T.MathUtils.smoothstep(material,82,90)*(1-T.MathUtils.smoothstep(material,110,118)),plane=new T.Vector3(tangents[i].z,0,-tangents[i].x);if(plane.lengthSq()<1e-10)plane.set(1,0,0);else plane.normalize();return p.addScaledVector(plane,p.clone().sub(c).dot(plane)*spread);
  });
  lead.packedStrands.push(strand);
  for(let i=0;i<=n;i++){
   const tangent=i===n?tangents[n]:strand[Math.min(n,i+1)].clone().sub(strand[Math.max(0,i-1)]).normalize(),
    row=rows[i].clone().addScaledVector(tangent,-rows[i].dot(tangent)).normalize(),up=tangent.clone().cross(row);
   for(let j=0;j<=sides;j++){
    const angle=j/sides*Math.PI*2,k=wire*per+i*(sides+1)+j;normal.copy(row).multiplyScalar(Math.cos(angle)).addScaledVector(up,Math.sin(angle));point.copy(strand[i]).addScaledVector(normal,.26).multiplyScalar(.001);
    pos.setXYZ(k,point.x,point.y,point.z);norm.setXYZ(k,normal.x,normal.y,normal.z);
   }
  }
 }
 pos.needsUpdate=norm.needsUpdate=true;lead.geometry.computeBoundingBox();lead.geometry.computeBoundingSphere();
}
