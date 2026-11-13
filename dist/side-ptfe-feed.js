// Same original PtfeTube factory/section/stock. Only the existing phase5
// centreline sample is transported to the accepted571 final free-end route.
// Fixed fitting prefix and both native arm fixing intervals remain unchanged.
const length=p=>{let n=0;for(let i=3;i<p.length;i+=3)n+=Math.hypot(p[i]-p[i-3],p[i+1]-p[i-2],p[i+2]-p[i-1]);return n;};
export function transportSidePtfeFeed(base,target,u){
 if(u<=0)return base;if(u>=1){base.set(target);return base;}
 const originalLength=length(base),targetLength=length(target),p=new Float64Array(base),w=new Float64Array(1025);
 for(let i=92;i<=1024;i++)if(i<=410||i>660)for(let k=0;k<3;k++)p[i*3+k]=base[i*3+k]*(1-u)+target[i*3+k]*u;
 // Actual373 opening: follow the accepted final neck's Y(Z) while crossing
 // the plate, rather than interpolating through the solid front slot edge.
 const smooth=t=>(t=Math.max(0,Math.min(1,t)),t*t*(3-2*t));
 for(let i=661;i<=1024;i++){const j=i*3,z=p[j+2];if(z<=325||z>=350)continue;let k=900;while(k<1023&&target[(k+1)*3+2]>z)k++;const a=k*3,b=a+3,t=(target[a+2]-z)/(target[a+2]-target[b+2]),y=target[a+1]+(target[b+1]-target[a+1])*t,g=smooth((z-325)/6)*smooth((350-z)/6);if(p[j+1]<y)p[j+1]+=(y-p[j+1])*g;}
 // Store the redistributed free material above the frame, away from the
 // last passage/port segment. Its endpoints and end tangents do not move.
 for(let i=661;i<1024;i++){const t=(i-660)/364/.65;if(t<1)w[i]=Math.sin(Math.PI*t)**2;}
 const wanted=Math.max(length(p),originalLength*(1-u)+targetLength*u),gradient=[0,0,0];
 for(let i=1;i<=1024;i++){const j=i*3,d=[p[j]-p[j-3],p[j+1]-p[j-2],p[j+2]-p[j-1]],n=Math.hypot(...d),dw=w[i]-w[i-1];if(n)for(let k=0;k<3;k++)gradient[k]+=d[k]/n*dw;}
 let direction=[0,0,1];
 if(gradient[2]<0){const n=gradient.reduce((s,x)=>s+x*x,0);direction=direction.map((x,k)=>x-gradient[k]*gradient[2]/n);if(Math.hypot(...direction)<1e-8)direction=[1,0,0];const d=Math.hypot(...direction);direction=direction.map(x=>x/d);}
 const arc=a=>{let s=0;for(let i=1;i<=1024;i++){const j=i*3,dw=(w[i]-w[i-1])*a;s+=Math.hypot(p[j]-p[j-3]+direction[0]*dw,p[j+1]-p[j-2]+direction[1]*dw,p[j+2]-p[j-1]+direction[2]*dw);}return s;};
 let lo=0,hi=1;while(arc(hi)<wanted&&hi<512)hi*=2;for(let i=0;i<36;i++){const m=(lo+hi)/2;if(arc(m)<wanted)lo=m;else hi=m;}
 const amplitude=(lo+hi)/2;for(let i=0;i<=1024;i++)for(let k=0;k<3;k++)base[i*3+k]=p[i*3+k]+direction[k]*w[i]*amplitude;
 return base;
}
