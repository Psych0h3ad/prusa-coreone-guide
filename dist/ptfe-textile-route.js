import * as T from 'three';
const selected=new Set(['arm2','arm3','free1','free2']);
// Whole 10 mm width slabs of the current main sleeve/PTFE, projected into the
// actual band frames. Source-generated bend conformance stretched width up to
// 24.5%. A planar, constant-width textile instead encloses these finite bundle
// sections. Values include observed curvature, not a change to either cable.
const sectionRadii={arm2:[4.20003,2.00003],arm3:[4.40,2.20],free1:[4.87,2.71],free2:[4.52,2.93]};
export function textileDefinition(def){
 if(!selected.has(def.id)||!def.strap||def.free&&!def.retainedMaterial)return def;
 return {...def,naturalPtfeTextile:true,bandSweep:null,strapProfile:{...def.strapProfile,circles:def.strapProfile.circles.map(([u,v,r],i)=>[u,v,Math.max(r,sectionRadii[def.id][i])])}};
}
const clamp=x=>Math.max(0,Math.min(1,x));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
const mix=(a,b,t)=>a+(b-a)*t;
function lengths(points){const a=[0];for(let i=1;i<points.length;i++)a.push(a.at(-1)+points[i].distanceTo(points[i-1]));return a;}
function sample(points,ls,s,out=new T.Vector3()){
 if(s<=0)return out.copy(points[0]);if(s>=ls.at(-1))return out.copy(points.at(-1));
 let a=0,b=ls.length-1;while(b-a>1){const m=(a+b)>>1;if(ls[m]<s)a=m;else b=m;}
 return out.lerpVectors(points[a],points[b],(s-ls[a])/(ls[b]-ls[a]));
}
function convex(points){
 const p=points.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]),a=[],b=[];
 const turn=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);
 for(const q of p){while(a.length>1&&turn(a.at(-2),a.at(-1),q)<=0)a.pop();a.push(q);}
 for(const q of p.reverse()){while(b.length>1&&turn(b.at(-2),b.at(-1),q)<=0)b.pop();b.push(q);}
 return a.slice(0,-1).concat(b.slice(0,-1));
}
// Four textile eye straps only. Distances are millimetres; the unchanged
// section is swept with its width along the bundle, bending in its thin plane.
// The integral 3.2 mm eye and the 96.8 mm body share the authored 100 mm stock.
export function textileRoute(def,legacy){return def.naturalPtfeTextile?new TextileRoute(def,legacy):legacy;}
class TextileRoute{
 constructor(def,legacy){
  this.def=def;this.length=legacy.length;this.bodyLength=this.length-3.2;
  for(const k of ['U','V','W','origin'])this[k]=legacy[k].clone();
  legacy.make(def.rise);this.base=legacy;this.closedLength=legacy.loopLength;
  this.head=legacy.head.clone();this.entry=legacy.entry.clone();this.feed=1;
  this.pose(4,4,1);
 }
 state(s){return {height:this.def.rise,closed:s>=2?1:0,trimmed:false,wrapped:s>=2};}
 make(){return this;}
 grid(feed){
  if(this.gridFeed===feed)return this.gridPoints;
  const base=this.base,grid=[],n=320;
  // The part behind the arm and the main/PTFE contact arc remain seated.
  // Only the accessible right/front return carries a soft outward bight.
  const stop=base.loopLength-1.9*(1-feed);
  for(let i=0;i<=n;i++){
   const s=stop*i/n,f=s/base.loopLength,p=base.at(s),d=.65,c=new T.Vector3();
   if(f>.55&&f<.91){
    const t=base.at(Math.min(base.loopLength,s+d)).sub(base.at(Math.max(0,s-d))).normalize();
    const outward=this.U.clone().multiplyScalar(t.dot(this.V)).addScaledVector(this.V,-t.dot(this.U)).normalize();
    const w=Math.sin(Math.PI*(f-.55)/.36)**2;c.copy(outward).multiplyScalar(w);
   }
   grid.push({p,c});
  }
  this.gridFeed=feed;this.gridPoints=grid;return grid;
 }
 build(amplitude,feed,write=false){
  const grid=this.grid(feed);let length=0,px=0,py=0,pz=0;const points=write?[]:null,ls=write?[0]:null;
  for(let i=0;i<grid.length;i++){
   const {p,c}=grid[i],x=p.x+c.x*amplitude,y=p.y+c.y*amplitude,z=p.z+c.z*amplitude;
   if(i)length+=Math.hypot(x-px,y-py,z-pz);
   if(write){points.push(new T.Vector3(x,y,z));if(i)ls.push(length);}
   px=x;py=y;pz=z;
  }
  return write?{points,lengths:ls}:length;
 }
 configure(feed,loopBudget,fold){
  this.feed=feed;const minimum=this.build(0,feed);let amp=0;
  if(loopBudget>minimum){
   let lo=0,hi=(loopBudget-minimum)*.6+4;
   while(this.build(hi,feed)<loopBudget)hi*=1.5;
   for(let i=0;i<18;i++){const m=(lo+hi)/2,q=this.build(m,feed);if(q<loopBudget)lo=m;else hi=m;}
   // Choose the enclosing side so a sub-micron solve residual cannot select
   // the outside-tail branch before the tip has reached the eye.
   amp=hi;
  }
  const chosen=this.build(amp,feed,true);
  this.points=chosen.points;this.lengths=chosen.lengths;this.loopLength=this.lengths.at(-1);this.entry=this.points.at(-1);
  this.fold=fold;this.amplitude=amp;this.tailLength=Math.max(0,this.bodyLength-this.loopLength);
  this.makeOutsideWrap();
 }
 makeOutsideWrap(){
  const uv=p=>{p=p.clone().sub(this.origin);return[p.dot(this.U),p.dot(this.V)];},world=([u,v])=>this.origin.clone().addScaledVector(this.U,u).addScaledVector(this.V,v);
  const hull=convex(this.points.map(uv)),offset=[];
  for(let i=0;i<hull.length;i++){
   const a=hull[(i+hull.length-1)%hull.length],b=hull[i],c=hull[(i+1)%hull.length],angle=p=>Math.atan2(-(p[0]-b[0]),p[1]-b[1]);
   let aa=angle(a)+Math.PI,bb=angle(c);while(bb<aa)bb+=Math.PI*2;
   const count=Math.max(1,Math.ceil((bb-aa)/.12));
   for(let j=0;j<=count;j++){const q=aa+(bb-aa)*j/count,n=[Math.cos(q),Math.sin(q)];offset.push({p:[b[0]+.9*n[0],b[1]+.9*n[1]],n});}
  }
  offset.reverse();const entry=uv(this.entry);let cut=0,fraction=0,best=-Infinity;
  for(let i=0;i<offset.length;i++){const a=offset[i].p,b=offset[(i+1)%offset.length].p;if((a[0]-entry[0])*(b[0]-entry[0])<=0&&a[0]!==b[0]){const f=(entry[0]-a[0])/(b[0]-a[0]),v=mix(a[1],b[1],f);if(v>best){best=v;cut=i;fraction=f;}}}
  const a=offset[cut],b=offset[(cut+1)%offset.length],n=[mix(a.n[0],b.n[0],fraction),mix(a.n[1],b.n[1],fraction)],start={p:[entry[0],best],n};let ordered=[start];
  for(let i=1;i<=offset.length;i++)ordered.push(offset[(cut+i)%offset.length]);ordered.push(start);
  // Advance five millimetres along the outer contour before joining it.
  // Joining directly above the slot reverses the tangent in <1 mm and folds
  // the .65 mm thickness sheet over itself at the eye exit.
  let j=0,travel=0;while(j<ordered.length-2&&travel+Math.hypot(ordered[j+1].p[0]-ordered[j].p[0],ordered[j+1].p[1]-ordered[j].p[1])<5){travel+=Math.hypot(ordered[j+1].p[0]-ordered[j].p[0],ordered[j+1].p[1]-ordered[j].p[1]);j++;}
  const aa=ordered[j],bb=ordered[j+1],f=(5-travel)/Math.hypot(bb.p[0]-aa.p[0],bb.p[1]-aa.p[1]),join={p:aa.p.map((v,i)=>mix(v,bb.p[i],f)),n:aa.n.map((v,i)=>mix(v,bb.n[i],f))};
  ordered=[join,...ordered.slice(j+1,-1),...ordered.slice(0,j+1),join];
  const end=world(join.p),t=this.U.clone().multiplyScalar(join.n[1]).addScaledVector(this.V,-join.n[0]).normalize(),d=this.entry.distanceTo(end),bridge=new T.CubicBezierCurve3(this.entry,this.entry.clone().addScaledVector(this.V,Math.max(1,d*.4)),end.clone().addScaledVector(t,-Math.min(2,d*.5+.4)),end);
  this.wrapPoints=bridge.getPoints(Math.max(12,Math.ceil(d/.25)));
  for(let turn=0;turn<3;turn++)for(let i=turn?0:1;i<ordered.length;i++){const q=ordered[i],r=.85*(turn+i/(ordered.length-1));this.wrapPoints.push(world([q.p[0]+q.n[0]*r,q.p[1]+q.n[1]*r]));}
  this.wrapLengths=lengths(this.wrapPoints);
 }
 pose(from,to,t){
  t=clamp(t);let start=0,feed=1,fold=1,budget=this.closedLength,phase='secured';
  if(to===1){
   start=from===1?0:-this.bodyLength*(1-smooth(t));feed=0;fold=0;budget=this.bodyLength;phase='thread-around';
  }else if(from<2&&to>=2){
   feed=smooth(t/.16);const pull=smooth((t-.16)/.84);
   budget=mix(this.bodyLength,this.closedLength,pull);fold=1;
   phase=t<.16?'tip-through-eye':'pull-and-wrap';
  }
  this.configure(feed,budget,fold);
  this.height=this.def.rise;
  return {start,length:this.bodyLength,height:this.height,closed:feed,cut:false,wrapped:true,tail:this.tailLength,phase};
 }
 at(s,out=new T.Vector3()){
  if(s<0){
   const d=-s,r=16,a=Math.min(Math.PI/2,d/r);
   out.copy(this.head).addScaledVector(this.U,r*Math.sin(a)).addScaledVector(this.V,r*(1-Math.cos(a)));
   if(d>r*Math.PI/2){const a=(d-r*Math.PI/2)/45;out.addScaledVector(this.U,-45*(1-Math.cos(a))).addScaledVector(this.V,45*Math.sin(a));}
   return out;
  }
  if(s<this.loopLength)return sample(this.points,this.lengths,s,out);
  // Lay the actual emerging material along the outside as it is pulled.
  // A tangent extension from the rear of the partial wrap struck the arm;
  // continuing the soft wrap brings it around that real edge instead.
  const x=s-this.loopLength;return sample(this.wrapPoints,this.wrapLengths,x,out);
 }
 guide(target){const r=new TextileRoute(this.def,new this.base.constructor(this.def));r.pose(target===1?0:1,target,1);return Array.from({length:129},(_,i)=>r.at(r.bodyLength*i/128));}
}
