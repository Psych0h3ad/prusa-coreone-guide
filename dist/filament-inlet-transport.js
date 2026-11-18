// Common material chart for the existing complete 710 mm PTFE tube. The
// straight inlet land grows while the guide slides up; the curved guided land
// is the installed centreline transported with the actual complete guide.
// A free Hermite span pays the length from existing slack. No face changes.
const smooth=t=>t*t*(3-2*t),mix=(a,b,t)=>a.map((x,k)=>x+(b[k]-x)*t),add=(a,b)=>a.map((x,k)=>x+b[k]),sub=(a,b)=>a.map((x,k)=>x-b[k]),norm=a=>{const n=Math.hypot(...a);return a.map(x=>x/n);};
export function releaseFilamentInlet(entity){const state=entity?.filamentInletTransport;if(!state?.applied)return;const q=entity.mesh.userData.flexState;entity.lastKey='';entity.update(q.from,q.to,q.t);if(entity.maintenanceRelease){entity.maintenanceRelease.last=undefined;entity.maintenanceRelease.guideLift=undefined;}state.applied=false;}
export function transportFilamentInlet(entity,lift,gap,side){
 if(![lift,gap,side].every(Number.isFinite)||lift<0||lift>8||gap<0||gap>8||Math.abs(side)>35)throw Error('Invalid source inlet transport');
 const state=entity.filamentInletTransport??=(()=>{const reference=entity.filamentInletReference;if(!reference)throw Error('Actual installed inlet reference required');const rest=reference.points.slice(),arc=[0];for(let i=3;i<rest.length;i+=3)arc.push(arc.at(-1)+Math.hypot(rest[i]-rest[i-3],rest[i+1]-rest[i-2],rest[i+2]-rest[i-1]));return{rest,arc,length:arc.at(-1),points:new Float32Array(rest.length)};})();
 const {rest,arc,points}=state;
 const at=s=>{let lo=0,hi=arc.length-1;while(lo<hi){const mid=(lo+hi)>>1;if(arc[mid]<s)lo=mid+1;else hi=mid;}const b=lo,a=Math.max(0,b-1),u=arc[b]===arc[a]?0:(s-arc[a])/(arc[b]-arc[a]);return[0,1,2].map(k=>rest[a*3+k]+(rest[b*3+k]-rest[a*3+k])*u);};
 if(lift===0&&gap===0&&side===0){points.set(rest);entity.surface.update(points);state.applied=true;state.last={lift,gap,side,length:state.length};return;}
 const startS=90,endS=230,land=4,translate=[side,0,lift+gap],a=add(at(startS-gap),translate),b=at(endS),ta=norm(sub(at(startS-gap+.1),at(startS-gap-.1))),tb=norm(sub(at(endS+.1),at(endS-.1))),chord=.3*Math.hypot(...sub(b,a)),normal=norm([-(b[1]-a[1]),b[0]-a[0],0]);
 const baseA=at(startS),baseB=at(endS),baseTA=norm(sub(at(startS+.1),at(startS-.1))),baseTB=tb,baseChord=.3*Math.hypot(...sub(baseB,baseA));
 const evaluate=amplitude=>{let length=0;
  for(let i=0;i<arc.length;i++){
   const s=arc[i];let p;
   if(s>=endS)p=at(s);
   else if(s<=land+gap)p=add(at(0),[side,0,lift+s]);
   else if(s<=startS)p=add(at(s-gap),translate);
   else{const u=(s-startS)/(endS-startS),u2=u*u,u3=u2*u,h=[2*u3-3*u2+1,u3-2*u2+u,-2*u3+3*u2,u3-u2],base=at(s);p=a.map((x,k)=>x*h[0]+ta[k]*chord*h[1]+b[k]*h[2]+tb[k]*chord*h[3]+amplitude*(base[k]-(baseA[k]*h[0]+baseTA[k]*baseChord*h[1]+baseB[k]*h[2]+baseTB[k]*baseChord*h[3])));}
   points.set(p,i*3);if(i)length+=Math.hypot(points[i*3]-points[i*3-3],points[i*3+1]-points[i*3-2],points[i*3+2]-points[i*3-1]);
  }return length;
 };
 let low=0,high=4;const minimum=evaluate(0);if(minimum>state.length)throw Error('Source inlet minimum length exceeds whole stock: '+minimum+' > '+state.length);
 while(evaluate(high)<state.length&&high<128)high*=2;
 if(evaluate(high)<state.length)throw Error('Source inlet slack root not bracketed');
 for(let i=0;i<36;i++){const m=(low+high)/2;if(evaluate(m)<state.length)low=m;else high=m;}
 const amplitude=(low+high)/2,length=evaluate(amplitude);if(Math.abs(length-state.length)>.0001)throw Error('PTFE stock root representation error');entity.surface.update(points);state.applied=true;state.last={lift,gap,side,amplitude,minimum,length,stock:state.length};
}
