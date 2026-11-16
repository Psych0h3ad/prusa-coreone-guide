// Original contact constraint and full-stock leaf map. Code MIT.
export function contactConstraint(parameters){
 const q=structuredClone(parameters.unloadedHeaderContour),C=q.lowerNoseCenter,R=q.lowerNoseRadius;
 const tangent=p=>{const a=Math.atan2(p[1]-C[1],p[0]-C[0]),off=Math.acos(R/Math.hypot(p[0]-C[0],p[1]-C[1]));return[-1,1].map(t=>[C[0]+R*Math.cos(a+t*off),C[1]+R*Math.sin(a+t*off)]).sort((a,b)=>b[1]-a[1])[0];};
 const t0=tangent(q.lowerStart),t1=tangent(q.lowerShoulder),stations=[q.lowerStart,t0,t1,q.lowerShoulder,...q.lowerBackStations];
 const top=y=>{for(let i=0;i<stations.length-1;i++){const a=stations[i],b=stations[i+1];if(a[0]<=y&&y<=b[0])return i===1?C[1]+Math.sqrt(Math.max(0,R*R-(y-C[0])**2)):a[1]+(b[1]-a[1])*(y-a[0])/(b[0]-a[0]);}throw Error('Outside contact contour');};
 function gap(a,d){const root=3.35-d,r=a ? .30/a : 0,arcEnd=a?root+(r+.075)*Math.sin(a):root,tip=a?arcEnd+3.30*Math.cos(a):6.95-d,low=Math.max(root,stations[0][0]),high=Math.min(tip,stations.at(-1)[0]);if(high<low)return{gapMM:null,contactYMM:null};
  const p=[low,high,...stations.map(x=>x[0]).filter(y=>low<=y&&y<=high)];if(low<=arcEnd&&arcEnd<=high)p.push(arcEnd);const slope=Math.tan(a),critical=C[0]-slope*R/Math.sqrt(1+slope*slope);if(Math.max(low,t0[0],arcEnd)<=critical&&critical<=Math.min(high,t1[0]))p.push(critical);
  let result={gapMM:Infinity,contactYMM:null};for(const y of p){const outer=r+.075,dy=y-root,z=!a ? .8 : y<=arcEnd ? .8+dy*dy/(outer+Math.sqrt(Math.max(0,outer*outer-dy*dy))) : .8+outer*2*Math.sin(a/2)**2+(y-arcEnd)*Math.tan(a),g=z-top(y);if(g<result.gapMM)result={gapMM:g,contactYMM:y};}return result;
 }
 return d=>{if(!Number.isFinite(d)||d<0||d>7)throw Error('Outside reference withdrawal');const g=gap(0,d);if(g.gapMM===null||g.gapMM>=0)return{angleRadians:0,...g};let lo=0,hi=.14;if(gap(hi,d).gapMM<0)throw Error('Reference contact cannot clear pose');for(let i=0;i<60;i++){const mid=(lo+hi)/2;if(gap(mid,d).gapMM<0)lo=mid;else hi=mid;}return{angleRadians:hi,...gap(hi,d)};};
}
export function mapLeaf(x,s,h,angle){
 if(!angle)return{p:[x,3.3+s,.875+h],c:1,s:0,k:1};const r=.30/angle,phi=s<=.30?s/r:angle,c=Math.cos(phi),sn=Math.sin(phi),straight=Math.max(0,s-.30);return{p:[x,3.3+(r-h)*sn+straight*c,.875+h+(r-h)*2*Math.sin(phi/2)**2+straight*sn],c,s:sn,k:s<=.30?1-h/r:1};
}
export function createLeafBuffers(){
 const positions=[],normals=[],coordinates=[],stations=Array.from({length:17},(_,i)=>.30*i/16).concat([3.60]);
 function tri(a,b,c,n){const p=[a,b,c].map(([x,s,h])=>[x,3.3+s,.875+h]),u=p[1].map((x,i)=>x-p[0][i]),v=p[2].map((x,i)=>x-p[0][i]),cross=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];if(cross.reduce((t,x,i)=>t+x*n[i],0)<0)[b,c]=[c,b];for(const q of[a,b,c]){coordinates.push(...q);positions.push(q[0],3.3+q[1],.875+q[2]);normals.push(...n);}}
 function quad(a,b,c,d,n){tri(a,b,c,n);tri(a,c,d,n);}
 for(let i=0;i<stations.length-1;i++){const a=stations[i],b=stations[i+1];quad([-.405,a,.075],[.405,a,.075],[.405,b,.075],[-.405,b,.075],[0,0,1]);quad([-.405,a,-.075],[.405,a,-.075],[.405,b,-.075],[-.405,b,-.075],[0,0,-1]);for(const x of[-.405,.405])quad([x,a,-.075],[x,b,-.075],[x,b,.075],[x,a,.075],[Math.sign(x),0,0]);}
 for(const s of[0,3.60])quad([-.405,s,-.075],[.405,s,-.075],[.405,s,.075],[-.405,s,.075],[0,s?1:-1,0]);return{positions:new Float32Array(positions),normals:new Float32Array(normals),coordinates:new Float64Array(coordinates),restNormals:new Float64Array(normals)};
}
export function rewriteLeaf(buffers,angle){for(let i=0;i<buffers.positions.length;i+=3){const[x,s,h]=buffers.coordinates.subarray(i,i+3),q=mapLeaf(x,s,h,angle),[nx,ny,nz]=buffers.restNormals.subarray(i,i+3),n=[q.k*nx,q.c*ny-q.k*q.s*nz,q.s*ny+q.k*q.c*nz],l=Math.hypot(...n);buffers.positions.set(q.p,i);buffers.normals.set(n.map(x=>x/l),i);}}
