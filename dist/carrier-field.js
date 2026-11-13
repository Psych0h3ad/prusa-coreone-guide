import * as T from 'three';
export const length615=a=>a.slice(1).reduce((s,p,i)=>s+p.distanceTo(a[i]),0);
export function benchShift615(source,J,stocks,calibration){
 const origin=source.reduce((p,a)=>p.add(a[23]),new T.Vector3()).multiplyScalar(1/22).add(calibration),target=J.reduce((p,a)=>p.add(a[79]),new T.Vector3()).multiplyScalar(1/22),direction=target.sub(origin),distance=direction.length();if(distance<1e-8)return new T.Vector3();direction.multiplyScalar(1/distance);
 const bounds=source.map((a,w)=>{
  const prefix=a.slice(1,24).reduce((sum,p,i)=>sum+p.distanceTo(a[i]),0),tail=J[w][80].distanceTo(J[w][79]),radius=stocks[w]-prefix-tail-12,q=a[23].clone().add(calibration).sub(J[w][79]),d=q.dot(direction),disc=radius*radius-q.lengthSq()+d*d;if(radius<=0||disc<0)throw Error('615 actual freecut stock corridor is infeasible');return -d-Math.sqrt(disc);
 });
 const max=Math.max(...bounds),smooth=max+.2*Math.log(bounds.reduce((sum,b)=>sum+Math.exp((b-max)/.2),0)),positive=smooth<=-.2?0:smooth>=.2?smooth:(smooth+.2)**2/.8;return direction.multiplyScalar(positive);
}
export function rawGlobal615(source,amount,J,base4,stocks){
 const blend=T.MathUtils.smoothstep(amount,3,4),calibration=new T.Vector3(1.55,1.05,0).multiplyScalar(1-blend),bench=benchShift615(source,J,stocks,calibration);
 return source.map((a,w)=>a.map((p,i)=>i>=79?J[w][i].clone():p.clone().add(calibration).addScaledVector(bench,i<=23?1:T.MathUtils.smoothstep((79-i)/56,0,1)).addScaledVector(J[w][i].clone().sub(base4[w][i]),blend)));
}
export function frames615(points){
 const centre=Array.from({length:81},(_,i)=>points.reduce((s,a)=>s.add(a[i]),new T.Vector3()).multiplyScalar(1/22));return Array.from({length:81},(_,i)=>{
  const tangent=centre[Math.min(80,i+1)].clone().sub(centre[Math.max(0,i-1)]).normalize(),row=points[1][i].clone().sub(points[0][i]);row.addScaledVector(tangent,-row.dot(tangent));if(row.length()<1e-9||tangent.length()<.9)throw Error('615 explicit materialframe is degenerate');row.normalize();const up=new T.Vector3().crossVectors(tangent,row);return{row,up,tangent,local(v){return new T.Vector3(v.dot(row),v.dot(up),v.dot(tangent));},world(v){return row.clone().multiplyScalar(v.x).addScaledVector(up,v.y).addScaledVector(tangent,v.z);}};
 });
}
