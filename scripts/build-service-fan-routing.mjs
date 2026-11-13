import fs from 'node:fs';
import * as T from '../dist/vendor/three.module.js';
import {SERVICE_FAN_DEFINITIONS} from '../dist/service-fan-data.js';
import {fanCableFrames,ServiceFanCurve} from '../dist/service-fan-frame.js';

const smooth=x=>{x=T.MathUtils.clamp(x,0,1);return x*x*(3-2*x);},routes={};
for(const d of SERVICE_FAN_DEFINITIONS){
 const seated=d.seated.map(p=>new T.Vector3(...p)),loose=d.loose.map(p=>new T.Vector3(...p)),aligned=seated.map(p=>p.clone());
 for(const p of aligned.slice(-3))p.y-=10;
 const outside=aligned.map(p=>p.clone()),routed=d.id==='servicePrintLead';
 if(routed){aligned.at(-4).y-=10;aligned.at(-5).y-=5;}else{aligned[5].y-=10;aligned[4].y-=4;}
 for(let i=0;i<outside.length;i++)outside[i].copy(aligned[i]);
 if(routed){for(const p of outside.slice(2,-2))p.x=-36;outside.at(-2).x=-39;outside.at(-1).x=-39;}
 const base=amount=>{
  const a=amount>=.85?aligned:routed&&amount>=.55?outside:loose,b=amount>=.85?seated:routed&&amount<.55?outside:aligned,start=amount>=.85?.85:routed&&amount>=.55?.55:0,duration=amount>=.85?.15:routed?(amount<.55?.55:.30):.85;
  return a.map((p,i)=>p.clone().lerp(b[i],smooth((amount-start)/duration)));
 };
 const curve=new ServiceFanCurve(base(0));curve.arcLengthDivisions=768;
 const length=p=>{curve.points=p;curve.needsUpdate=true;return curve.getLength();};
 const target=Math.max(...Array.from({length:257},(_,i)=>length(base(i/256))))+.25,stages=[],ranges=[];
 for(const at of [...new Set([...Array.from({length:257},(_,i)=>i/256),.55,.70,.85])].sort((a,b)=>a-b)){
  const points=base(at),dress=T.MathUtils.smoothstep(at,.70,.85),bow=amount=>points.map((p,j)=>{
   const q=p.clone();if(j>1&&j<points.length-2)q.x-=amount*(1-dress)*Math.sin((j-1)*Math.PI/(points.length-3));
   if(routed&&j===1)q.x-=amount*dress;
   if(!routed&&j===points.length-3)q.z+=amount*dress;
   if(!routed&&j===points.length-4)q.z+=amount*dress*.55;
   return q;
  });
  let lo=0,hi=80;for(let j=0;j<24;j++){const mid=(lo+hi)/2;if(length(bow(mid))<target)lo=mid;else hi=mid;}
  const final=bow((lo+hi)/2);ranges.push(length(final));stages.push({at,points:final.map(p=>p.toArray().map(x=>+x.toFixed(5)))});
 }
 let previous;for(const s of stages){curve.points=s.points.map(p=>new T.Vector3(...p));curve.updateArcLengths();const f=fanCableFrames(curve,d.id,96,previous?.roll,previous?.angles);s.roll=f.roll;s.angles=f.angles.map(x=>+x.toFixed(8));previous=f;}
 routes[d.id]={length:target,stages};console.log(d.id,'centreline',target.toFixed(3),'mm; sampled range',Math.min(...ranges).toFixed(4),Math.max(...ranges).toFixed(4));
}
fs.writeFileSync('dist/service-fan-routing.js','// Generated cable centreline poses. Units: mm; illustrative slack, no force model.\nexport const SERVICE_FAN_ROUTES='+JSON.stringify(routes)+';\n');
