import {SIDE_PTFE_ROUTE as route} from './side-ptfe-route-data.js';
const add=(a,b,s=1)=>a.map((x,k)=>x+b[k]*s),sub=(a,b)=>add(a,b,-1),norm=a=>Math.hypot(...a),unit=a=>a.map(x=>x/norm(a));
const cubic=(p,t)=>{const n=p.length-1,choose=n===4?[1,4,6,4,1]:[1,3,3,1];return[0,1,2].map(k=>p.reduce((s,v,i)=>s+choose[i]*(1-t)**(n-i)*t**i*v[k],0));};
function table(controls,n=2048){const p=[controls[0]],a=[0];for(let i=1;i<=n;i++){p.push(cubic(controls,i/n));a.push(a.at(-1)+norm(sub(p.at(-1),p.at(-2))));}return{p,a};}
function at(q,s){let lo=0,hi=q.a.length-1;while(lo<hi){const m=(lo+hi)>>1;if(q.a[m]<s)lo=m+1;else hi=m;}const j=Math.max(1,lo),t=(s-q.a[j-1])/(q.a[j]-q.a[j-1]);return add(q.p[j-1],sub(q.p[j],q.p[j-1]),t);}
export function reconstructSidePtfeTail(base,seat,{anchor=660,segments=1024,lengthMM=710,transformPoint=p=>p}={}){
 if(base.length!==(segments+1)*3)throw Error('PTFE template topology mismatch');const points=new Float32Array(base);
 for(const segment of route.upstream){const up=table(segment.controlsCADMM);for(let i=segment.first;i<=segment.last;i++)points.set(at(up,up.a.at(-1)*(i-segment.first)/(segment.last-segment.first)),i*3);}
 let prefixLength=0;for(let i=1;i<=anchor;i++)prefixLength+=norm(sub(Array.from(points.slice(i*3,i*3+3)),Array.from(points.slice(i*3-3,i*3))));
 const C=route.tailControlsCADMM[1].map(p=>[...p]);C[2]=transformPoint(C[2]);C[3]=transformPoint(C[3]);const end=transformPoint(seat.innerEndCADMM),straight=seat.engagementMM+4,neck=table(C),target=lengthMM-prefixLength-straight-neck.a.at(-1),p0=Array.from(points.slice(anchor*3,anchor*3+3)),B=C[0],d0=[1,0,0],dB=unit(sub(C[1],B));
 if(target<norm(sub(B,p0)))return{ok:false,reason:'Fixed stock cannot reach current source pose',materialLengthMM:lengthMM};
 const parameters=route.upperControlParameters,make=s=>[p0,add(p0,d0,parameters[0]*s),[parameters[1],parameters[2],476.5],add(B,dB,-parameters[3]*s),B];let lo=0,hi=3;for(let i=0;i<32;i++){const s=(lo+hi)/2;if(table(make(s),512).a.at(-1)<target)lo=s;else hi=s;}
 const upper=table(make((lo+hi)/2));const combined={p:[...upper.p,...neck.p.slice(1),end],a:[...upper.a,...neck.a.slice(1).map(x=>x+upper.a.at(-1)),upper.a.at(-1)+neck.a.at(-1)+straight]};
 for(let i=anchor+1;i<=segments;i++)points.set(at(combined,(lengthMM-prefixLength)*(i-anchor)/(segments-anchor)),i*3);points.set(end,segments*3);
 return{ok:true,points,materialLengthMM:lengthMM,anchor,prefixLengthMM:prefixLength,externalArcMM:upper.a.at(-1)+neck.a.at(-1),internalStraightMM:straight,plateGuideCADMM:B,stockRedistribution:{upstreamIntervals:route.upstream.map(s=>[s.first,s.last]),freeWrapPositions:route.freeWraps,freeWrapSeparationMM:route.freeWrapSeparationMM,fixedNativeAnchorGeometryUnchanged:true,preservedCentrelineIntervals:[[0,92],[410,660]]},changedSurfaceRingIntervals:[[92,410],[660,1024]],currentEndCADMM:end};
}
