// Deterministic small chain closure only: no collision/PBD solve on RAF.
// The material references set link lengths; both actual end frames stay fixed.
export function closeLinks615(points,edgeLengths,{first=23,end=79,iterations=32,tolerance=1e-9}={}){
 const start=points[first].clone(),target=points[end].clone(),before=points.map(p=>p.clone());let maxInputEdgeErrorMM=0;
 for(let i=first;i<end;i++)maxInputEdgeErrorMM=Math.max(maxInputEdgeErrorMM,Math.abs(points[i+1].distanceTo(points[i])-edgeLengths[i]));
 if(maxInputEdgeErrorMM<1e-9)return{passes:0,maxInputEdgeErrorMM,endResidualMM:0,maxPointMoveMM:0};
 function place(index,origin,length){const p=points[index],q=points[origin],x=p.x-q.x,y=p.y-q.y,z=p.z-q.z,d=Math.hypot(x,y,z);if(d<1e-12)throw Error('615 material chain has a degenerate input link');const f=length/d;p.set(q.x+x*f,q.y+y*f,q.z+z*f);}
 let residual=Infinity,passes=0;for(let n=0;n<iterations;n++){
  points[end].copy(target);for(let i=end-1;i>=first;i--)place(i,i+1,edgeLengths[i]);
  points[first].copy(start);for(let i=first;i<end;i++)place(i+1,i,edgeLengths[i]);
  residual=points[end].distanceTo(target);passes=n+1;if(residual<tolerance)break;
 }
 points[end].copy(target);let maxPointMoveMM=0;for(let i=first+1;i<end;i++)maxPointMoveMM=Math.max(maxPointMoveMM,points[i].distanceTo(before[i]));return{passes,maxInputEdgeErrorMM,endResidualMM:residual,maxPointMoveMM};
}
