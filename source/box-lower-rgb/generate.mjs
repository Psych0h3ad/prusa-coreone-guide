// SPDX-License-Identifier: MIT
// Pure numeric preferred source; no renderer or third-party package required.
const add=(a,b)=>a.map((x,i)=>x+b[i]),mul=(a,s)=>a.map(x=>x*s),dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],unit=a=>mul(a,1/Math.hypot(...a));
export function generate(p){
 const {q,points,slopes}=p;
 function at(s,derivative=false){let i=q.findIndex((v,k)=>k&&v>=s)-1;if(i<0)i=q.length-2;const h=q[i+1]-q[i],u=(s-q[i])/h,[a,b,c,d]=[points[i],points[i+1],slopes[i],slopes[i+1]],f=derivative?[6*u*u-6*u,3*u*u-4*u+1,-6*u*u+6*u,3*u*u-2*u]:[2*u**3-3*u*u+1,u**3-2*u*u+u,-2*u**3+3*u*u,u**3-u*u];return[0,1,2].map(k=>derivative?(f[0]*a[k]+f[2]*b[k])/h+f[1]*c[k]+f[3]*d[k]:f[0]*a[k]+f[1]*h*c[k]+f[2]*b[k]+f[3]*h*d[k]);}
 const samples=[...new Set([...Array.from({length:4097},(_,i)=>q.at(-1)*i/4096),...q])].sort((a,b)=>a-b),arc=[0];let previous=Math.hypot(...at(samples[0],true));
 for(let i=1;i<samples.length;i++){const next=Math.hypot(...at(samples[i],true));arc.push(arc.at(-1)+(previous+next)/2*(samples[i]-samples[i-1]));previous=next;}
 const total=arc.at(-1);for(let i=0;i<arc.length;i++)arc[i]/=total;
 function parameter(t){if(t<=0)return 0;if(t>=1)return q.at(-1);let lo=0,hi=arc.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(arc[m]<t)lo=m;else hi=m;}return samples[lo]+(samples[hi]-samples[lo])*(t-arc[lo])/(arc[hi]-arc[lo]);}
 const centres=[],tangents=[],normals=[p.startNormal.slice()];
 for(let i=0;i<=p.samples;i++){const s=parameter(i/p.samples);centres.push(at(s));tangents.push(unit(at(s,true)));}
 for(let i=1;i<=p.samples;i++){let axis=cross(tangents[i-1],tangents[i]),sn=Math.hypot(...axis),co=dot(tangents[i-1],tangents[i]),n=normals[i-1];if(sn>0){axis=mul(axis,1/sn);n=add(add(mul(n,co),mul(cross(axis,n),sn)),mul(axis,dot(axis,n)*(1-co)));}normals.push(unit(add(n,mul(tangents[i],-dot(n,tangents[i])))));}
 const roll=Math.atan2(dot(tangents.at(-1),cross(normals.at(-1),p.endNormal)),dot(normals.at(-1),p.endNormal));
 for(let i=0;i<=p.samples;i++){const u=i/p.samples,a=roll*u*u*(3-2*u);normals[i]=add(mul(normals[i],Math.cos(a)),mul(cross(tangents[i],normals[i]),Math.sin(a)));}
 normals[0]=p.startNormal.slice();normals[p.samples]=p.endNormal.slice();
 return{stockMM:p.stockMM,points:points.map(x=>x.slice()),q:q.slice(),slopes:slopes.map(x=>x.slice()),centres,tangents,normals};
}
