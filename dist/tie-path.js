import * as T from 'three';
import {makeStrapProfile} from './strap-profile.js?v=20261111-94';
const lerp=(a,b,t)=>a+(b-a)*t;
const clamp=t=>Math.max(0,Math.min(1,t));
const smooth=t=>{t=clamp(t);return t*t*(3-2*t);};

// A strip is transported along this route by distance. Only the loop above
// the workpiece changes when it closes; both passages stay on the CAD datums.
export class TieRoute {
 constructor(def){
  this.def=def;this.U=new T.Vector3(...def.u);this.V=new T.Vector3(...def.v);this.W=new T.Vector3().crossVectors(this.U,this.V).normalize();this.origin=new T.Vector3(...def.p);this.points=[];this.lengths=[];this.length=def.length||100;
  this.make(def.loose);const maximumLoose=this.heightForTail(9);this.looseHeight=def.strap||def.apexHead?maximumLoose:Math.min(def.loose??maximumLoose,maximumLoose);
  this.contactHeight=this.heightForTail(0);this.alignHeight=this.heightForTail(-8);
 }
 point(u,v,w=0){return this.origin.clone().addScaledVector(this.U,u).addScaledVector(this.V,v).addScaledVector(this.W,w);}
 make(height,lift=0){
  if(this.def.strapProfile)return makeStrapProfile(this,height,lift);
  const d=this.def,s=d.span,r=d.bend||.85,channel=d.route==='channel',depth=d.free?d.freeDepth??d.rise*.6:d.depth;
  const left=channel?-s-r:-s,right=channel?s+r:s;
  this.left=left;this.height=height;this.points=[];const headHeight=d.strap?height:d.headHeight??3.2;
  const add=(u,v)=>this.points.push(this.point(u,v));
  const line=(u,v)=>{const p=this.point(u,v),a=this.points.at(-1),n=Math.max(1,Math.ceil(a.distanceTo(p)/.5));for(let i=1;i<=n;i++)this.points.push(a.clone().lerp(p,i/n));};
  const quad=(c,e)=>{const a=this.points.at(-1),curve=new T.QuadraticBezierCurve3(a,this.point(...c),this.point(...e));for(let i=1;i<=12;i++)this.points.push(curve.getPoint(i/12));};
  if(d.apexHead){
   // Manual 2.3: the loose lock is at the top of the loop, not seated on
   // a passage. The root leaves its side and the returning tip feeds up.
   const b=smooth((height-14)/18),angle=b*Math.PI/2,root=lerp(-s-(d.seatSetback||0),-1.6,b),rootHeight=lerp(3.2,height,b),lead=1.5;
   const rootU=-Math.sin(angle),rootV=-Math.cos(angle),feedU=-Math.cos(angle),feedV=Math.sin(angle),entryU=root+Math.sin(angle),entryV=rootHeight+Math.cos(angle);
   this.feedAxis=this.U.clone().multiplyScalar(feedU).addScaledVector(this.V,feedV);this.rootAxis=this.U.clone().multiplyScalar(-rootU).addScaledVector(this.V,-rootV);
   this.apexBlend=b;
   add(root,rootHeight);
   const curve=(a,b,e)=>{const c=new T.CubicBezierCurve3(this.points.at(-1),this.point(...a),this.point(...b),this.point(...e));for(let i=1;i<=64;i++)this.points.push(c.getPoint(i/64));};
   const rootLead=Math.min(4,Math.hypot(root+s,rootHeight-lead)*.45);
   curve([root+rootU*rootLead,rootHeight+rootV*rootLead],[-s,lead+Math.min(10,(rootHeight-lead)*.5)],[-s,lead]);
   line(-s,-depth+r);quad([-s,-depth],[-s+r,-depth]);line(s-r,-depth);quad([s,-depth],[s,-depth+r]);line(s,lead);
   const exitIndex=this.points.length-1;
   const top=Math.max(height,rootHeight+2.5),crownU=lerp((s+root)*.5,entryU,b),crownV=lerp(top,entryV-2.5,b),handle=Math.max((s-root)*.28,Math.sqrt((top-entryV)*(s-root))*.65)*(1-b),tipLead=lerp(2,1.2,b);
   curve([s,lerp(top,rootHeight*.60,b)],[lerp(crownU+handle,entryU,b),lerp(top,entryV-5,b)],[crownU,crownV]);
   curve([crownU-handle,crownV],[entryU-feedU*tipLead,entryV-feedV*tipLead],[entryU,entryV]);
   if(lift)for(let i=exitIndex+1;i<this.points.length;i++)this.points[i].addScaledVector(this.W,lift*smooth((i-exitIndex)/(this.points.length-1-exitIndex)));
   this.lengths=[0];for(let i=1;i<this.points.length;i++)this.lengths.push(this.lengths.at(-1)+this.points[i].distanceTo(this.points[i-1]));
   this.loopLength=this.lengths.at(-1);this.exitLength=this.lengths[exitIndex];this.head=this.points[0];this.entry=this.points.at(-1);this.tailPoints=null;return this;
  }
  const headLeft=left-(d.headSetback||0);add(headLeft,headHeight);
  if(d.headSetback){const c=new T.CubicBezierCurve3(this.points.at(-1),this.point(headLeft,headHeight-1.5),this.point(left,1.5),this.point(left,.5));for(let i=1;i<=24;i++)this.points.push(c.getPoint(i/24));}
  if(d.route==='arch'){line(-s,0);for(let i=1;i<=48;i++){const a=Math.PI*i/48;add(-s*Math.cos(a),-depth*Math.sin(a));}}
  else if(channel){line(left,r);quad([left,0],[-s,0]);line(s,0);quad([right,0],[right,r]);}
  else {line(-s,-depth+r);quad([-s,-depth],[-s+r,-depth]);line(s-r,-depth);quad([s,-depth],[s,-depth+r]);}
  const lead=channel?r:Math.min(1.5,height*.2);line(right,lead);const exitIndex=this.points.length-1;
  // The returning tip enters a separate slot in the lock, parallel to the
  // attached root. It never folds back through its own strip.
  const entry=d.strap?left-1.35:left+1.35;
  if(d.strap){if(d.flareRight)line(right+d.flareRight,lead+2);const curve=new T.CubicBezierCurve3(this.points.at(-1),this.point(right+(d.flareRight||0),height+8),this.point(entry,height+8),this.point(entry,height));for(let i=1;i<=72;i++)this.points.push(curve.getPoint(i/72));}
  else {
   const top=Math.max(height,headHeight+2.5),entryHeight=headHeight+1.35,crown=(right+headLeft)*.5,span=right-headLeft,handle=Math.max(span*.28,Math.sqrt((top-entryHeight)*span)*(d.roundedLoop?.65:.45));
   // Matching crown tangents AND normal curvature avoid a flat shelf followed
   // by a sudden crease. The endpoints still follow the passage and lock axes.
   const curves=[new T.CubicBezierCurve3(this.points.at(-1),this.point(right,entryHeight),this.point(crown+handle,top),this.point(crown,top)),new T.CubicBezierCurve3(this.point(crown,top),this.point(crown-handle,top),this.point(headLeft+2,entryHeight),this.point(headLeft,entryHeight))];
   for(const curve of curves)for(let i=1;i<=64;i++)this.points.push(curve.getPoint(i/64));
  }
  // While the head is being brought to the workpiece, the free tip stays to
  // one side. It enters the lock only after the head has reached its seat.
  if(lift)for(let i=exitIndex+1;i<this.points.length;i++)this.points[i].addScaledVector(this.W,lift*smooth((i-exitIndex)/(this.points.length-1-exitIndex)));
  this.lengths=[0];for(let i=1;i<this.points.length;i++)this.lengths.push(this.lengths.at(-1)+this.points[i].distanceTo(this.points[i-1]));this.loopLength=this.lengths.at(-1);this.exitLength=this.lengths[exitIndex];this.head=this.points[0];this.entry=this.points.at(-1);
  if(d.strap){
   // Fold the hook-and-loop tail back onto the OUTSIDE of the band. An
   // interior spiral sweeps straight through the cable as the loop shrinks.
   const outer=this.points.map((p,i)=>{const t=this.points[Math.min(i+1,this.points.length-1)].clone().sub(this.points[Math.max(0,i-1)]),n=this.U.clone().multiplyScalar(t.dot(this.V)).addScaledVector(this.V,-t.dot(this.U)).normalize();return p.clone().addScaledVector(n,.9);}).reverse();
   const c=new T.CubicBezierCurve3(this.entry,this.entry.clone().addScaledVector(this.V,-2),outer[0].clone().addScaledVector(this.U,-1.2).addScaledVector(this.V,-2),outer[0]);
   this.wrapPoints=Array.from({length:25},(_,i)=>c.getPoint(i/24)).concat(outer.slice(1));
   this.wrapLengths=[0];for(let i=1;i<this.wrapPoints.length;i++)this.wrapLengths.push(this.wrapLengths.at(-1)+this.wrapPoints[i].distanceTo(this.wrapPoints[i-1]));
  }
  return this;
 }
 heightForTail(tail){let lo=Math.max(3,this.def.rise),hi=100;for(let i=0;i<22;i++){const h=(lo+hi)/2;this.make(h);if(this.loopLength>this.length-tail)hi=h;else lo=h;}return (lo+hi)/2;}
 at(distance,out=new T.Vector3(),wrapped=false){
  if(distance<0)return this.extension(this.head,-distance,this.def.approach,out,this.def.apexHead?this.rootAxis:this.V);
  if(distance>=this.loopLength){const x=distance-this.loopLength;if(this.def.strap){
    const lengths=this.wrapLengths,points=this.wrapPoints;if(x>=lengths.at(-1))return out.copy(points.at(-1)).addScaledVector(this.V,x-lengths.at(-1));let lo=0,hi=lengths.length-1;while(hi-lo>1){const mid=(lo+hi)>>1;if(lengths[mid]<x)lo=mid;else hi=mid;}return out.lerpVectors(points[lo],points[hi],(x-lengths[lo])/(lengths[hi]-lengths[lo]||1));
   }if(this.def.apexHead)return this.baseTail(x,out);
   if(wrapped){const radius=Math.max(5,this.def.rise*.7),a=x/radius;return out.copy(this.entry).addScaledVector(this.U,radius*(1-Math.cos(a))).addScaledVector(this.V,radius*Math.sin(a)).addScaledVector(this.W,x*.035);}
   return this.extension(this.entry,x,this.def.apexHead?this.V.toArray():this.def.tailDirection,out,this.def.apexHead?this.feedAxis:this.U.clone().negate(),this.def.tailBend??(this.def.apexHead?5:3),this.def.apexHead?9:undefined);
  }
  let lo=0,hi=this.lengths.length-1;while(hi-lo>1){const mid=(lo+hi)>>1;if(this.lengths[mid]<distance)lo=mid;else hi=mid;}
  return out.lerpVectors(this.points[lo],this.points[hi],(distance-this.lengths[lo])/(this.lengths[hi]-this.lengths[lo]||1));
 }
 baseTail(distance,out){
  if(!this.tailPoints){
   const inward=this.U.clone().negate(),feed=this.feedAxis,points=[this.entry.clone()];
   const line=(end,count)=>{const start=points.at(-1);for(let i=1;i<=count;i++)points.push(start.clone().lerp(end,i/count));};
   line(this.entry.clone().addScaledVector(feed,lerp(3,9,this.apexBlend)),36);
   const angle=Math.acos(Math.max(-1,Math.min(1,inward.dot(feed)))),side=inward.clone().addScaledVector(feed,-inward.dot(feed)).normalize(),start=points.at(-1).clone();
   for(let i=1;i<=32;i++){const a=angle*i/32;points.push(start.clone().addScaledVector(feed,3*Math.sin(a)).addScaledVector(side,3*(1-Math.cos(a))));}
   // Pull the long tail toward the open centre of the base, above the
   // routed wires. It must not sweep through the bottom profile or harness.
   const a=points.at(-1),rise=Math.max(0,12-a.clone().sub(this.origin).dot(this.V)),end=a.clone().addScaledVector(inward,12).addScaledVector(this.V,rise),curve=new T.CubicBezierCurve3(a,a.clone().addScaledVector(inward,4),end.clone().addScaledVector(inward,-4),end);
   for(let i=1;i<=64;i++)points.push(curve.getPoint(i/64));
   this.tailPoints=points;this.tailLengths=[0];for(let i=1;i<points.length;i++)this.tailLengths.push(this.tailLengths.at(-1)+points[i].distanceTo(points[i-1]));
  }
  const points=this.tailPoints,lengths=this.tailLengths;
  if(distance>=lengths.at(-1))return out.copy(points.at(-1)).addScaledVector(this.U,-(distance-lengths.at(-1)));
  let lo=0,hi=lengths.length-1;while(hi-lo>1){const mid=(lo+hi)>>1;if(lengths[mid]<distance)lo=mid;else hi=mid;}
  return out.lerpVectors(points[lo],points[hi],(distance-lengths[lo])/(lengths[hi]-lengths[lo]||1));
 }
 extension(origin,d,direction,out,axis=this.V,r=3,leadOverride){
  if(!direction)return out.copy(origin).addScaledVector(axis,d);
  const turn=new T.Vector3(...direction),lead=leadOverride??this.def.approachLead??3;
  if(turn.dot(axis)<-.99){const side=this.def.approachTurn?new T.Vector3(...this.def.approachTurn):this.U;out.copy(origin).addScaledVector(axis,Math.min(d,lead));if(d<=lead)return out;const a=Math.min(Math.PI,(d-lead)/r);out.addScaledVector(axis,r*Math.sin(a)).addScaledVector(side,r*(1-Math.cos(a)));if(d>lead+r*Math.PI)out.addScaledVector(turn,d-lead-r*Math.PI);return out;}
  const cosine=Math.max(-1,Math.min(1,turn.dot(axis))),angle=Math.acos(cosine);
  if(angle<1e-8)return out.copy(origin).addScaledVector(axis,d);
  const side=turn.clone().addScaledVector(axis,-cosine).normalize();
  out.copy(origin).addScaledVector(axis,Math.min(d,lead));if(d<=lead)return out;
  const a=Math.min(angle,(d-lead)/r);out.addScaledVector(axis,r*Math.sin(a)).addScaledVector(side,r*(1-Math.cos(a)));
  if(d>lead+r*angle)out.addScaledVector(turn,d-lead-r*angle);return out;
 }
 state(state){return {height:state===1?(this.def.openRise??this.looseHeight):state===2?this.looseHeight:state===3||state===7?this.def.rise+2:this.def.rise,closed:state>=2?1:0,trimmed:state===5||state===7,wrapped:state===6};}
 pose(from,to,t){
  if(this.def.strapProfile)return this.strapPose(from,to,t);
  if(!this.def.strap&&to>=2&&from<2)return this.closePose(from,to,t);
  const a=this.state(from),b=this.state(to),first=!from,thread=smooth(t/.6),close=smooth((t-.6)/.24),seating=from===1&&to>=2;
  // First feed the tip through the fixed passage with the head still outside.
  // Once it emerges, guide it into the head, then pull the remaining tail.
  const open=this.state(1),pull=first?smooth((t-.84)/.09):seating?smooth((t-.45)/.4):smooth(t/.8);let h=first?lerp(open.height,b.height,b.closed?pull:0):lerp(a.height,b.height,pull);
  const lift=to===1?10:first?10*(1-smooth((t-.84)/.09)):seating?10*(1-smooth((t-.25)/.2)):0;
  this.make(h,lift*(this.def.tipSide??1));
  const openStart=Math.min(-8,this.exitLength+10-this.length);
  let start=first?lerp(lerp(-this.length-8,openStart,thread),b.closed?0:openStart,close):lerp(from===1?openStart:0,to===1?openStart:0,seating?smooth(t/.25):smooth(t/.8));
  const cut=b.trimmed&&(!a.trimmed||first)&&t>=.94;
  const length=(a.trimmed&&!first||cut)?Math.min(this.length,this.loopLength+2.5):this.length;
  return {start,length,height:h,closed:first?b.closed*close:lerp(a.closed,b.closed,smooth(t/.8)),cut,wrapped:b.wrapped&&t>.8,tail:Math.max(0,start+length-this.loopLength),phase:first&&t<.68?'thread':t<.8?'close':cut?'cut':'pull'};
 }
 strapPose(from,to,t){
  const open=this.alignHeight,target=this.state(to).height;
  let height,phase;
  // Keep the textile end attached to its own strip. A long translated root
  // made the old animation look like a rigid board and a floating buckle.
  if(to===1){height=lerp(from?open:open+8,open,smooth(t));phase='thread';}
  else if(from<2){
   const start=from===1?open:open+8;
   if(t<.35){height=lerp(start,this.contactHeight,smooth(t/.35));phase='approach';}
   else if(t<.55){height=lerp(this.contactHeight,this.looseHeight,smooth((t-.35)/.2));phase='feed';}
   else {height=lerp(this.looseHeight,target,smooth((t-.55)/.4));phase='pull';}
  }else {height=lerp(this.state(from).height,target,smooth(t));phase='pull';}
  this.make(height);
  return {start:0,length:this.length,height,closed:this.loopLength<=this.length?1:0,cut:false,wrapped:to===6,tail:Math.max(0,this.length-this.loopLength),phase};
 }
 closePose(from,to,t){
  const first=!from,b=this.state(to),open=this.state(1);
  const seatEnd=first?.55:.30,alignEnd=first?.65:.48,contactEnd=first?.73:.60,feedEnd=first?.83:.78;
  const feed=first?smooth(t/.35):1,seat=smooth((t-(first?.35:0))/(seatEnd-(first?.35:0)));
  const align=smooth((t-seatEnd)/(alignEnd-seatEnd));
  const contact=smooth((t-alignEnd)/(contactEnd-alignEnd)),through=smooth((t-contactEnd)/(feedEnd-contactEnd));
  const pull=smooth((t-feedEnd)/(.92-feedEnd));
  // Keep the end eight millimetres short of the lock while aligning it.
  // Only then feed it along the lock axis. A tail cannot already be sticking
  // through the head while the whole return branch moves sideways into it.
  let h=lerp(open.height,this.alignHeight,seat);
  if(t>=seatEnd)h=lerp(this.alignHeight,this.contactHeight,contact);
  if(t>=contactEnd)h=lerp(this.contactHeight,this.looseHeight,through);
  if(t>=feedEnd)h=lerp(this.looseHeight,b.height,pull);
  this.make(h,10*(1-align)*(this.def.tipSide??1));
  const openStart=Math.min(-8,this.exitLength+10-this.length);
  const staged=first?lerp(-this.length-8,openStart,feed):openStart;
  const start=lerp(staged,0,seat),cut=b.trimmed&&t>=.94;
  const length=cut?Math.min(this.length,this.loopLength+2.5):this.length;
  return {start,length,height:h,closed:t<contactEnd?0:through,cut,wrapped:b.wrapped&&t>.92,tail:Math.max(0,start+length-this.loopLength),phase:t<seatEnd?'thread':t<alignEnd?'align':t<contactEnd?'approach':t<feedEnd?'feed':cut?'cut':'pull'};
 }
}
