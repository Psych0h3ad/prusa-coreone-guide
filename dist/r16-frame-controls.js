import * as T from 'three';
export const RINGS=513,STRANDS=3,ROWS=RINGS*STRANDS;
class Metres extends T.Curve{constructor(c){super();this.c=c;}getPoint(t,out=new T.Vector3()){return this.c.getPointAt(t,out).multiplyScalar(.001);}getTangent(t,out=new T.Vector3()){return this.c.getTangentAt(t,out);}}
// Material-centre/orientation controls, not a cache of surface vertices.
export function sampleDirectControls(family,output){
 const C=output?.C??new Float64Array(ROWS*3),Q=output?.Q??new Float64Array(ROWS*4),m=new T.Matrix4(),q=new T.Quaternion(),b=new T.Vector3();
 const curves=[family.sleeve,...family.wires.values()];
 for(let k=0;k<3;k++){
  const c=curves[k],path=k?new Metres(c):null,frames=k?path.computeFrenetFrames(512,false):null;let prior=c.getTangentAt(0),normal=new T.Vector3(0,1,0).addScaledVector(prior,-prior.y).normalize();
  for(let i=0;i<RINGS;i++){
   const centre=k?path.getPointAt(i/512).multiplyScalar(1000):c.getPointAt(i/512),tangent=k?frames.tangents[i]:c.getTangentAt(i/512);
   if(k)normal=frames.normals[i];else{if(i)normal.applyQuaternion(new T.Quaternion().setFromUnitVectors(prior,tangent));normal.addScaledVector(tangent,-normal.dot(tangent)).normalize();prior=tangent;}
   b.crossVectors(tangent,normal).normalize();m.makeBasis(tangent,normal,b);q.setFromRotationMatrix(m).normalize();const row=k*RINGS+i;centre.toArray(C,row*3);q.toArray(Q,row*4);
  }
 }
 return {C,Q,clampExitMaterialMM:family.sleeve.clampExitMaterialMM,stocks:[520,...family.authoredStocks?Object.values(family.authoredStocks):[...family.wires.values()].map(c=>c.getLength())]};
}
