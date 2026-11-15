// Authored strain-relief route in the measured, unmodified connector bay.
// All dimensions are reference routing values, not OEM bend/cut specifications.
export const prefixEnds=[4.3,6.7,9.5],prefixHeights=[6.1,8.5,10.9];
const mix=(a,b,t)=>a.map((v,k)=>v+(b[k]-v)*t),smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);},cubic=(a,b,c,d,t)=>a.map((v,k)=>(1-t)**3*v+3*(1-t)**2*t*b[k]+3*(1-t)*t*t*c[k]+t**3*d[k]);
function prefixCurve(A,row,baseA,end,tangent){
 const delta=Math.hypot(...A.map((v,k)=>v-baseA[k])),f=smooth(delta),laneY=8-(2-row)*.9*f,endZ=prefixEnds[row],R=.9,X=row===2?Math.max(34.5,A[0]+2.2999700948463885):36.3,U=row===2?X-34:[.5,1.4][row],seed=[A[0]+1.4999700948463885,A[1]-.0094717773683876,A[2]],start=[X,seed[1],A[2]],dy=laneY-start[1],highZ=Math.max(prefixHeights[row],start[2]+Math.sqrt(Math.max(0,2.25-dy*dy)),endZ+U+R),dz=highZ-start[2],radius=Math.hypot(dy,dz)/2,centre=[X,(start[1]+laneY)/2,(start[2]+highZ)/2],length=Math.hypot(dy,dz),points=[];
 const line=(a,b,n=12)=>{for(let i=points.length?1:0;i<=n;i++)points.push(mix(a,b,i/n));},bezier=(a,b,c,d,n=36)=>{for(let i=1;i<=n;i++)points.push(cubic(a,b,c,d,i/n));};
 line(A,seed);const dx=start[0]-seed[0],span=Math.max(.02,Math.min(.5,dx/3));bezier(seed,[seed[0]+span,seed[1],seed[2]],[start[0]-span,start[1],start[2]],start);
 for(let i=1;i<=96;i++){const t=Math.PI*i/96;points.push([X+radius*Math.sin(t),centre[1]-radius*Math.cos(t)*dy/length,centre[2]-radius*Math.cos(t)*dz/length]);}
 const dropBegin=points.length-1;for(let i=1;i<=48;i++){const t=Math.PI/2*i/48;points.push([X-U*Math.sin(t),laneY,highZ-U+U*Math.cos(t)]);}
 const top=points.at(-1),lower=[X-U,laneY,endZ+R];if(top[2]<lower[2]-1e-9)throw Error('Wire-prefix drop lost its full radius');line(top,lower,Math.max(36,Math.ceil(Math.hypot(...lower.map((v,k)=>v-top[k]))/.02)));
 for(let i=1;i<=48;i++){const t=Math.PI/2*i/48;points.push([X-U-R+R*Math.cos(t),laneY,endZ+R-R*Math.sin(t)]);}
 if(row<2){const arc=[0];for(let i=dropBegin+1;i<points.length;i++)arc.push(arc.at(-1)+Math.hypot(...points[i].map((v,k)=>v-points[i-1][k])));const L=arc.at(-1);for(let i=dropBegin+1;i<points.length;i++){const t=arc[i-dropBegin]/L;points[i][1]+=(end[1]+.8-laneY)*t**3*(10-15*t+6*t*t);}}
 const a=points.at(-1);if(row<2){const r=.8,tail=[],startX=end[0]+r;for(let i=0;i<=24;i++)tail.push([a[0]+(startX-a[0])*i/24,end[1]+r]);for(let i=1;i<=64;i++){const t=Math.PI/2+Math.PI/2*i/64;tail.push([end[0]+r+r*Math.cos(t),end[1]+r*Math.sin(t)]);}const arc=[0];for(let i=1;i<tail.length;i++)arc.push(arc.at(-1)+Math.hypot(tail[i][0]-tail[i-1][0],tail[i][1]-tail[i-1][1]));const L=arc.at(-1),slope=tangent[2]/Math.hypot(tangent[0],tangent[1]);for(let i=1;i<tail.length;i++){const t=arc[i]/L,z=a[2]*(2*t**3-3*t*t+1)+end[2]*(-2*t**3+3*t*t)+slope*L*(t**3-t*t);points.push([tail[i][0],tail[i][1],z]);}}
 else {const h=(a[0]-end[0])/3;bezier(a,[a[0]-h,a[1],a[2]],end.map((v,k)=>v-tangent[k]*h),end);}return points;
}

// During extraction the common connector translates across the open top of the bay.
// Carry the upper strain relief with it; the lower routed fan stays seated.
export function wirePrefix(A,row,baseA,end,tangent){
 const lateral=A[1]-baseA[1];
 if(lateral<=0)return prefixCurve(A,row,baseA,end,tangent);
 const canonical=[A[0],baseA[1],A[2]],bottom=11.7,top=Math.max(bottom+.1,A[2]-row*2.54-.6);
 const c2=x=>{x=Math.max(0,Math.min(1,x));return x**3*(10-15*x+6*x*x);};return prefixCurve(canonical,row,baseA,end,tangent).map(p=>[p[0],p[1]+lateral*c2((p[2]-bottom)/(top-bottom)),p[2]]);
}
