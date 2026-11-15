import * as T from 'three';
import {Q,V} from './heatbed-material-curves.js';
// The actual textile strip stays complete. Opening unfolds its measured
// polygon edges; threading/advance follows the same R15 carrier, not a pose
// translation or clipped draw range. Closed final output is byte-preserved.
export function writeSleeveConstruction(family,profile,geometry,stage){
 const source=profile.attributes.position.array,C=family.controls.C,carrier=family.carrierPath,L=carrier.getLength(),out=geometry.attributes.position.array;
 if(stage.insert===1&&stage.thread===1&&stage.wrap===1){out.set(source);geometry.attributes.normal.array.set(profile.attributes.normal.array);geometry.attributes.position.needsUpdate=geometry.attributes.normal.needsUpdate=true;geometry.computeBoundingBox();geometry.computeBoundingSphere();return{stockMM:520,projectedInsertionMM:10,neutralAdvanceMM:0,closedMaterialMM:520,finishedLiteral:true};}
 let lo=0,hi=25;for(let k=0;k<42;k++){const s=(lo+hi)/2;if(carrier.getPointAt(s/L).x<-94)lo=s;else hi=s;}
 const advance=(lo+hi)/2*(1-stage.insert),lastC=new T.Vector3().fromArray(C,512*3),lastT=carrier.getTangentAt(520/L);
 function section(q){
  if(q<=520){const f=Math.max(0,q)/520*512,k=Math.min(511,Math.floor(f)),u=f-k,centre=new T.Vector3().fromArray(C,k*3).lerp(new T.Vector3().fromArray(C,(k+1)*3),u);return Array.from({length:33},(_,j)=>new T.Vector3().fromArray(source,(k*33+j)*3).lerp(new T.Vector3().fromArray(source,((k+1)*33+j)*3),u).multiplyScalar(1000).sub(centre));}
  const rotation=new T.Quaternion().setFromUnitVectors(lastT,carrier.getTangentAt(q/L));return Array.from({length:33},(_,j)=>new T.Vector3().fromArray(source,(512*33+j)*3).multiplyScalar(1000).sub(lastC).applyQuaternion(rotation));
 }
 let minPerimeter=Infinity,maxPerimeter=-Infinity;
 for(let i=0;i<=512;i++){
  const material=i*520/512,q=material+advance,centre=carrier.getPointAt(q/L),points=section(q),blend=Q((material-50)/20),closed=stage.thread*(1-blend)+stage.wrap*blend;let placed=points;
  if(closed<1){
   const normal=new T.Vector3();for(let j=0;j<32;j++)normal.add(new T.Vector3().crossVectors(points[j],points[j+1]));normal.normalize();const y=points[16].clone().normalize(),z=new T.Vector3().crossVectors(normal,y).normalize(),edges=Array.from({length:32},(_,j)=>points[j+1].clone().sub(points[j])),angles=edges.map(e=>Math.atan2(e.dot(z),e.dot(y)));
   for(let j=1;j<32;j++){while(angles[j]-angles[j-1]>Math.PI)angles[j]-=2*Math.PI;while(angles[j]-angles[j-1]<-Math.PI)angles[j]+=2*Math.PI;}
   const flat=(angles[15]+angles[16])/2,bend=2/3+closed/3,directions=edges.map((e,j)=>y.clone().multiplyScalar(Math.cos(flat+(angles[j]-flat)*bend)).addScaledVector(z,Math.sin(flat+(angles[j]-flat)*bend)).multiplyScalar(e.length()));placed=Array(33);placed[16]=points[16].clone();for(let j=16;j<32;j++)placed[j+1]=placed[j].clone().add(directions[j]);for(let j=15;j>=0;j--)placed[j]=placed[j+1].clone().sub(directions[j]);
  }
  const before=points.slice(1).reduce((n,p,j)=>n+p.distanceTo(points[j]),0),after=placed.slice(1).reduce((n,p,j)=>n+p.distanceTo(placed[j]),0);if(Math.abs(before-after)>1e-8)throw Error('Textile edge material changed');minPerimeter=Math.min(minPerimeter,after);maxPerimeter=Math.max(maxPerimeter,after);
  for(let j=0;j<=32;j++)placed[j].clone().add(centre).multiplyScalar(.001).toArray(out,(i*33+j)*3);
 }
 geometry.attributes.position.needsUpdate=true;geometry.computeVertexNormals();geometry.computeBoundingBox();geometry.computeBoundingSphere();return{stockMM:520,projectedInsertionMM:10*stage.insert,neutralAdvanceMM:advance,threadedMaterialMM:50*stage.thread,restWrapped:stage.wrap,openSweepRatio:2/3,sectionPerimeterMM:[minPerimeter,maxPerimeter],finishedLiteral:false};
}
