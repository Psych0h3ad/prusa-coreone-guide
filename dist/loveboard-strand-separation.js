// Coupled fixed-link projection of the free conductor ends only. Collision
// capsules keep their full .26mm radii. Prefix, last2 stations, and all original
// strand material lengths stay fixed. This is not a manufacturer motion law.
const clamp=x=>Math.max(0,Math.min(1,x));
export function separateMainStrands(strands,{iterations=900,gap=.555}={}){
 const p=strands.map(s=>s.points),lengths=p.map(a=>a.slice(1).map((v,i)=>v.distanceTo(a[i]))),movable=i=>i>55&&i<79;
 function edge(w,i){const a=p[w][i],b=p[w][i+1],d=b.clone().sub(a),l=d.length(),wa=movable(i)?1:0,wb=movable(i+1)?1:0;if(!wa&&!wb)return;d.multiplyScalar((l-lengths[w][i])/Math.max(l,1e-12)/(wa+wb));if(wa)a.add(d);if(wb)b.sub(d);}
 function collide(w,i,v,j){
  const a=p[w][i],b=p[w][i+1],c=p[v][j],d=p[v][j+1];
  const u=b.clone().sub(a),z=d.clone().sub(c),r=a.clone().sub(c),aa=u.lengthSq(),bb=u.dot(z),cc=z.lengthSq(),dd=u.dot(r),ee=z.dot(r),den=aa*cc-bb*bb;
  let s=den>1e-12?clamp((bb*ee-cc*dd)/den):0,t=(bb*s+ee)/cc;
  if(t<0){t=0;s=clamp(-dd/aa);}else if(t>1){t=1;s=clamp((bb-dd)/aa);}
  const normal=a.clone().addScaledVector(u,s).sub(c).addScaledVector(z,-t),distance=normal.length();if(distance>=gap)return 0;
  if(distance<1e-10)normal.set(w<v?-1:1,0,0);else normal.multiplyScalar(1/distance);
  const weights=[movable(i)?1-s:0,movable(i+1)?s:0,movable(j)?1-t:0,movable(j+1)?t:0],q=weights.reduce((n,x)=>n+x*x,0);if(!q)return 0;
  normal.multiplyScalar((gap-distance)/q*.8);a.addScaledVector(normal,weights[0]);b.addScaledVector(normal,weights[1]);c.addScaledVector(normal,-weights[2]);d.addScaledVector(normal,-weights[3]);return gap-distance;
 }
 let maxPenetration=0,passes=0;
 for(let n=0;n<iterations;n++){
  for(let pass=0;pass<3;pass++)for(let w=0;w<22;w++){if(n%2)for(let i=78;i>=55;i--)edge(w,i);else for(let i=55;i<79;i++)edge(w,i);}
  if(n%3!==0)continue;
  const cells=new Map(),segments=[];
  for(let w=0;w<22;w++)for(let i=55;i<80;i++){
   const a=p[w][i],b=p[w][i+1],k=segments.length;segments.push([w,i]);
   for(let x=Math.floor((Math.min(a.x,b.x)-gap)/3);x<=Math.floor((Math.max(a.x,b.x)+gap)/3);x++)for(let y=Math.floor((Math.min(a.y,b.y)-gap)/3);y<=Math.floor((Math.max(a.y,b.y)+gap)/3);y++)for(let z=Math.floor((Math.min(a.z,b.z)-gap)/3);z<=Math.floor((Math.max(a.z,b.z)+gap)/3);z++){const key=x+','+y+','+z;if(!cells.has(key))cells.set(key,[]);cells.get(key).push(k);}
  }
  const seen=new Set();maxPenetration=0;for(const ids of cells.values())for(let a=0;a<ids.length;a++)for(let b=a+1;b<ids.length;b++){const i=ids[a],j=ids[b],key=i*segments.length+j;if(seen.has(key))continue;seen.add(key);const [w,k]=segments[i],[v,l]=segments[j];if(w===v)continue;maxPenetration=Math.max(maxPenetration,collide(w,k,v,l));}
  passes=n+1;let maxEdge=0;for(let w=0;w<22;w++)for(let i=55;i<80;i++)maxEdge=Math.max(maxEdge,Math.abs(p[w][i+1].distanceTo(p[w][i])-lengths[w][i]));
  if(maxPenetration<1e-7&&maxEdge<1e-10)break;
 }
 // Report residuals rather than relabelling an unconverged rod exact.
 let maxEdgeErrorMM=0;for(let w=0;w<22;w++){strands[w].lengthMM=p[w].slice(1).reduce((s,v,i)=>s+v.distanceTo(p[w][i]),0);for(let i=55;i<80;i++)maxEdgeErrorMM=Math.max(maxEdgeErrorMM,Math.abs(p[w][i+1].distanceTo(p[w][i])-lengths[w][i]));}
 return {passes,maxPenetrationMM:maxPenetration,maxEdgeErrorMM};
}
