import * as T from '../dist/vendor/three.module.js';

// Relax the individual insulated strands, rather than forcing an offset curve
// through a tight bend. Endpoints and the two straight terminal spans stay fixed.
const N=129,margin=.12,fixed=i=>i<3||i>=N-3;
const curve=points=>{const c=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)),false,'centripetal');c.arcLengthDivisions=1024;return c;};
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],sub=(a,b)=>a.map((x,i)=>x-b[i]),clamp=x=>Math.max(0,Math.min(1,x));
function closest(p1,q1,p2,q2){
 const d1=sub(q1,p1),d2=sub(q2,p2),r=sub(p1,p2),a=dot(d1,d1),e=dot(d2,d2),b=dot(d1,d2),c=dot(d1,r),f=dot(d2,r),denom=a*e-b*b;let s=denom?clamp((b*f-c*e)/denom):0,t=(b*s+f)/e;
 if(t<0){t=0;s=clamp(-c/a);}else if(t>1){t=1;s=clamp((b-c)/a);}
 const delta=r.map((x,i)=>x+d1[i]*s-d2[i]*t);return {s,t,delta,d:Math.hypot(...delta)};
}
function repel(a,b,ra,rb,stationaryB=false){
 let worst=0;
 for(let i=0;i<N-1;i++)for(let j=0;j<N-1;j++){
  const taper=Math.max(0,Math.min(1,(Math.min(i,j)-96)/8,(124-Math.max(i,j))/6)),size=ra+rb+margin+.4*taper;
  if(a[i].some((v,k)=>Math.min(v,a[i+1][k])>Math.max(b[j][k],b[j+1][k])+size||Math.max(v,a[i+1][k])<Math.min(b[j][k],b[j+1][k])-size))continue;
  const q=closest(a[i],a[i+1],b[j],b[j+1]);if(q.d>=size)continue;worst=Math.max(worst,size-q.d);
  const weights=[1-q.s,q.s,1-q.t,q.t],ids=[i,i+1,j,j+1],nodes=[a[i],a[i+1],b[j],b[j+1]],signs=[1,1,-1,-1],locked=k=>fixed(ids[k])||(stationaryB&&k>=2),mass=weights.reduce((v,w,k)=>v+(locked(k)?0:w*w),0);if(!mass)continue;
  const direction=q.d>1e-8?q.delta.map(v=>v/q.d):[0,1,0];
  nodes.forEach((p,k)=>{if(!locked(k)){const move=Math.min(.35,(size-q.d)*weights[k]/Math.max(.05,mass)*.8)*signs[k];for(let x=0;x<3;x++)p[x]+=direction[x]*move;}});
 }
 return worst;
}
function plugFrame(a,b){
 const end=new T.Vector3(...a.at(-1)),other=new T.Vector3(...b.at(-1)),axis=end.clone().sub(new T.Vector3(...a.at(-2))).normalize(),across=other.clone().sub(end).normalize(),side=new T.Vector3().crossVectors(across,axis).normalize();return {centre:end.add(other).multiplyScalar(.5),axis,across,side};
}
function repelPlug(points,r,frame,heater){
 const outerY=heater?2.85:2.5,outerZ=heater?2.8:2.2,holeY=heater?1.2:.8,pitch=heater?3:1.5,holeZ=heater?1.1:.6,gap=heater?4:3.35;
 const boxes=[[-outerY,-holeY,-outerZ,outerZ],[holeY,outerY,-outerZ,outerZ],[-holeY,holeY,-outerZ,-pitch/2-holeZ],[-holeY,holeY,-pitch/2+holeZ,pitch/2-holeZ],[-holeY,holeY,pitch/2+holeZ,outerZ]],axes=[frame.axis,frame.side,frame.across],p=new T.Vector3();
 for(let i=3;i<N-3;i++){
  for(const [y0,y1,z0,z1]of boxes){
   const delta=new T.Vector3(...points[i]).sub(frame.centre),local=axes.map(v=>delta.dot(v)),clearance=r+(i>96&&i<120?.3:margin);
   const lo=[-.8,y0,z0],hi=[gap+1.4,y1,z1],nearest=local.map((v,k)=>Math.max(lo[k],Math.min(hi[k],v))),difference=sub(local,nearest);let distance=Math.hypot(...difference),normal;
   if(distance>=clearance)continue;
   if(distance>1e-8)normal=difference.map(v=>v/distance);
   else{const options=local.flatMap((v,k)=>[{k,d:v-lo[k],s:-1},{k,d:hi[k]-v,s:1}]).sort((a,b)=>a.d-b.d),q=options[0];normal=[0,0,0];normal[q.k]=q.s;distance=-q.d;}
   p.set(0,0,0);axes.forEach((axis,k)=>p.addScaledVector(axis,normal[k]*(clearance-distance)*.8));points[i]=points[i].map((v,k)=>v+p.getComponent(k));
  }
 }
}
export function relaxHotendRoutes(routes){
 const ids=Object.keys(routes),radii=ids.map(id=>routes[id].radius),stages=routes[ids[0]].routeStages;
 const originals=stages.map((s,stage)=>ids.map(id=>{const c=curve(routes[id].routeStages[stage].points),p=c.getSpacedPoints(N-1).map(p=>p.toArray()),start=p[0],end=p.at(-1),axis=c.getTangentAt(1);for(const [i,d]of [[1,.25],[2,.5]]){p[i]=start.map((v,k)=>v+(k===2?d:0));p[N-1-i]=end.map((v,k)=>v-axis.getComponent(k)*d);}return p;}));
 const anchors=[0,45,128],held=anchors.map(i=>structuredClone(originals[i])),lengthsFor=paths=>paths.map(p=>p.slice(1).map((q,i)=>Math.hypot(...sub(q,p[i]))));
 const settle=(paths,bases,lengths)=>paths.forEach((path,k)=>{
    for(let pass=0;pass<2;pass++)for(let i=0;i<N-1;i++){
     const d=sub(path[i+1],path[i]),length=Math.hypot(...d),error=(length-lengths[k][i])/Math.max(1e-8,length),mass=+!fixed(i) + +!fixed(i+1);if(!mass)continue;
     for(let x=0;x<3;x++){if(!fixed(i))path[i][x]+=d[x]*error*.6/mass;if(!fixed(i+1))path[i+1][x]-=d[x]*error*.6/mass;}
    }
    const displacements=path.map((p,i)=>sub(p,bases[k][i]));
    for(let i=3;i<N-3;i++)for(let x=0;x<3;x++)path[i][x]+=(displacements[i-1][x]+displacements[i+1][x]-2*displacements[i][x])*.08-displacements[i][x]*.003;
   });
 const own=paths=>{let error=0;for(const [a,b]of [[0,1],[2,3]])error=Math.max(error,repel(paths[a],paths[b],radii[a],radii[b]));const f=[plugFrame(paths[0],paths[1]),plugFrame(paths[2],paths[3])];paths.forEach((p,k)=>repelPlug(p,radii[k],f[k<2?0:1],k>=2));return error;};
 // Solve the shared handover poses together. Later frames cannot move them.
 const combinations=[[0,0],[1,0],[1,1],[2,0],[2,1],[2,2]],anchorLengths=held.map(lengthsFor);
 for(let iteration=0;iteration<300;iteration++){
  held.forEach((p,k)=>{settle(p,originals[anchors[k]],anchorLengths[k]);own(p);});
  for(const [n,h]of combinations){for(let a=0;a<2;a++)for(let b=2;b<4;b++)repel(held[n][a],held[h][b],radii[a],radii[b]);const nf=plugFrame(held[n][0],held[n][1]),hf=plugFrame(held[h][2],held[h][3]);for(let a=0;a<2;a++)repelPlug(held[n][a],radii[a],hf,true);for(let b=2;b<4;b++)repelPlug(held[h][b],radii[b],nf,false);}
 }
 console.log('Solved shared loose, threaded and seated handovers');
 const previous=ids.map(()=>null);let largestMove=0,worst=0;
 const frames=held.map(p=>[plugFrame(p[0],p[1]),plugFrame(p[2],p[3])]);
 for(let stage=0;stage<stages.length;stage++){
  const at=stages[stage].at,which=anchors.indexOf(stage),left=at<.35?0:1,right=left+1,u=left===0?at/.35:(at-.35)/.65;
  const bases=originals[stage].map((path,k)=>path.map((p,i)=>p.map((v,x)=>v+T.MathUtils.lerp(held[left][k][i][x]-originals[anchors[left]][k][i][x],held[right][k][i][x]-originals[anchors[right]][k][i][x],u))));
  const paths=structuredClone(which<0?bases:held[which]),lengths=lengthsFor(bases);
  if(which<0){
   paths.forEach((path,k)=>{if(previous[k])path.forEach((p,i)=>{if(!fixed(i))for(let x=0;x<3;x++)p[x]+=previous[k][i][x]*.6;});});
   for(let iteration=0;iteration<100;iteration++){
    settle(paths,bases,lengths);let error=own(paths);
    for(let k=0;k<4;k++){const states=k<2?(at<.35?[0]:[0,1]):(at<.35?[1,2]:[2]),other=k<2?[2,3]:[0,1];for(const state of states){for(const b of other)error=Math.max(error,repel(paths[k],held[state][b],radii[k],radii[b],true));repelPlug(paths[k],radii[k],frames[state][k<2?1:0],k<2);}}
    if(iteration===99)worst=Math.max(worst,error);
   }
  }
  paths.forEach((path,k)=>{previous[k]=path.map((p,i)=>sub(p,bases[k][i]));largestMove=Math.max(largestMove,...path.map((p,i)=>Math.hypot(...sub(p,originals[stage][k][i]))));routes[ids[k]].routeStages[stage].points=path.map(p=>p.map(v=>+v.toFixed(5)));});
  if(stage%32===0)console.log('Relaxed cable pose',stage);
 }
 for(const id of ids){routes[id].loosePoints=routes[id].routeStages[0].points;routes[id].points=routes[id].routeStages.at(-1).points;}
 if(largestMove>6)throw Error('Cable relaxation exceeded the local routing envelope: '+largestMove);
 console.log('Strand relaxation: maximum displacement',largestMove.toFixed(3),'mm; pre-final-pass separation residual',worst.toFixed(3),'mm');
}
