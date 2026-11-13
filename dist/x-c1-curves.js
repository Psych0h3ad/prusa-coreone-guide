import * as T from 'three';
const V=()=>new T.Vector3();
const choose=[[1],[1,1],[1,2,1],[1,3,3,1],[1,4,6,4,1],[1,5,10,10,5,1],[1,6,15,20,15,6,1],[1,7,21,35,35,21,7,1]];
function bezier(controls,u){
 const n=controls.length-1,p=V();
 for(let i=0;i<=n;i++)p.addScaledVector(controls[i],choose[n][i]*u**i*(1-u)**(n-i));
 return p;
}
function bezierJet(controls,u){
 const n=controls.length-1,first=controls.slice(1).map((p,i)=>p.clone().sub(controls[i]).multiplyScalar(n));
 const second=first.slice(1).map((p,i)=>p.clone().sub(first[i]).multiplyScalar(n-1));
 return {p:bezier(controls,u),v:bezier(first,u),a:bezier(second,u)};
}
function warp(u,a,b){
 if(!(a>0&&b>0))throw Error('X C1 map requires positive endpoint speeds');
 // Rational quadratic: positive derivative for any positive endpoint speeds.
 const n=a*u+(1-a)*u*u,d=1+(a+b-2)*u*(1-u);
 const n1=a+2*(1-a)*u,n2=2*(1-a),d1=(a+b-2)*(1-2*u),d2=-2*(a+b-2);
 return {p:n/d,v:(n1*d-n*d1)/(d*d),a:n2/d-n*d2/(d*d)-2*n1*d1/(d*d)+2*n*d1*d1/(d*d*d)};
}
function compose(jet,velocity,acceleration){
 return {p:jet.p,v:jet.v.clone().multiplyScalar(velocity),a:jet.a.multiplyScalar(velocity*velocity).addScaledVector(jet.v,acceleration)};
}
function mix(a,b,w){return {p:a.p.lerp(b.p,w),v:a.v.lerp(b.v,w),a:a.a.lerp(b.a,w)};}
function catmullJets(points){
 const coefficients=[];
 for(let i=0;i<7;i++){
  const p1=points[i],p2=points[i+1],p0=i?points[i-1]:p1.clone().multiplyScalar(2).sub(p2),p3=i<6?points[i+2]:p2.clone().multiplyScalar(2).sub(p1);
  let d0=Math.sqrt(p0.distanceTo(p1)),d1=Math.sqrt(p1.distanceTo(p2)),d2=Math.sqrt(p2.distanceTo(p3));
  if(d1<1e-4)d1=1;if(d0<1e-4)d0=d1;if(d2<1e-4)d2=d1;
  const v0=p1.clone().sub(p0).divideScalar(d0).sub(p2.clone().sub(p0).divideScalar(d0+d1)).add(p2.clone().sub(p1).divideScalar(d1)).multiplyScalar(d1);
  const v1=p2.clone().sub(p1).divideScalar(d1).sub(p3.clone().sub(p1).divideScalar(d1+d2)).add(p3.clone().sub(p2).divideScalar(d2)).multiplyScalar(d1);
  coefficients.push([p1.clone(),v0,p2.clone().sub(p1).multiplyScalar(3).addScaledVector(v0,-2).sub(v1),p1.clone().sub(p2).multiplyScalar(2).add(v0).add(v1)]);
 }
 return (t,side=0)=>{
  const position=t*7,integer=Math.round(position);
  const i=Math.max(0,Math.min(6,side<0&&Math.abs(position-integer)<1e-10?integer-1:Math.floor(position))),u=position-i;
  const [a,b,c,d]=coefficients[i];
  return {p:a.clone().addScaledVector(b,u).addScaledVector(c,u*u).addScaledVector(d,u*u*u),
   v:b.clone().addScaledVector(c,2*u).addScaledVector(d,3*u*u).multiplyScalar(7),
   a:c.clone().multiplyScalar(2).addScaledVector(d,6*u).multiplyScalar(49)};
 };
}
export function applyXC1Route(outside,points,S,tangent,guideWeight,loopWeight,loopDepth,guideOffset=null,guideSupport=.9,endArch=0){
 const start=2.1/7,end=4.6/7,nodes=[0,1/7,2/7,start,3/7,4/7,end,5/7,6/7,1],raw=catmullJets(points);
 const speeds=nodes.map((t,i)=>{
  const left=raw(t,-1).v.length(),right=raw(t,1).v.length();
  return i===0?right:i===nodes.length-1?left:2*left*right/(left+right);
 });
 const intervals=nodes.slice(1).map((hi,i)=>({lo:nodes[i],hi,
  a:speeds[i]/raw(nodes[i],1).v.length(),b:speeds[i+1]/raw(hi,-1).v.length()}));
 const inverseNative=s=>{
  if(s<=0)return 0;if(s>=1)return 1;
  const item=intervals.find(({hi})=>s<=hi),span=item.hi-item.lo,r=(s-item.lo)/span;
  if(r<=0)return item.lo;if(r>=1)return item.hi;
  const A=1-item.a+r*(item.a+item.b-2),B=item.a-r*(item.a+item.b-2);
  const u=2*r/(B+Math.sqrt(B*B+4*A*r));
  return item.lo+span*u;
 };
 const native=(t,side=0)=>{
  let i=nodes.findIndex((end,index)=>index>0&&(t<end||t===end&&side<=0))-1;
  if(i<0)i=nodes.length-2;
  const lo=nodes[i],hi=nodes[i+1],span=hi-lo,u=(t-lo)/span;
  const w=warp(u,intervals[i].a,intervals[i].b);
  return compose(raw(lo+span*w.p,t===hi?-1:1),w.v,w.a/span);
 };
 const join=native(end,1),port=native(1,-1);
 join.p.set(-190,140,305);join.v.set(0,join.v.length(),0);
 const incoming=(S.y-140)/3,outgoing=(S.x+190)/3;
 if(!(incoming>0&&outgoing>0))throw Error('X guide waypoint lost its positive handles');
 const guideControls=[join.p,join.p.clone().add(new T.Vector3(0,incoming,0)),join.p.clone().add(new T.Vector3(0,2*incoming,0)),S.clone().addScaledVector(tangent,-2*outgoing),S.clone().addScaledVector(tangent,-outgoing),S];
 const guideSpan=1-end,guideSlopes=[join.v.length()*guideSpan/(5*incoming),port.v.length()*guideSpan/(5*outgoing)];
 const guide=(t,side=0)=>{
  const base=native(t,side);
  if(t<end||t===end&&side<0||guideWeight===0)return base;
  const w=warp((t-end)/guideSpan,...guideSlopes);
  return mix(base,compose(bezierJet(guideControls,w.p),w.v/guideSpan,w.a/(guideSpan*guideSpan)),guideWeight);
 };
 let controls,loopSlopes;
 if(loopWeight>0){
  const a=guide(start,-1),b=guide(end,1),curvature=j=>j.a.clone().addScaledVector(j.v,-j.a.dot(j.v)/j.v.lengthSq()).divideScalar(j.v.lengthSq());
  controls=[a.p,a.p.clone().addScaledVector(a.v.clone().normalize(),10),a.p.clone().addScaledVector(a.v.clone().normalize(),20).addScaledVector(curvature(a),(7/6)*100),
   new T.Vector3(-213,110-loopDepth,294),new T.Vector3(-125,110-loopDepth,294),
   b.p.clone().addScaledVector(b.v.clone().normalize(),-28).addScaledVector(curvature(b),(7/6)*196),b.p.clone().addScaledVector(b.v.clone().normalize(),-14),b.p];
  loopSlopes=[a.v.length()*(end-start)/70,b.v.length()*(end-start)/98];
 }
 const jet=(t,side=0)=>{
  const base=guide(t,side);
  if(loopWeight===0||t<start||t>end)return base;
  const span=end-start,w=warp((t-start)/span,...loopSlopes);
  return mix(base,compose(bezierJet(controls,w.p),w.v/span,w.a/(span*span)),loopWeight);
 };
 // Arc samples stay in the original native chart. The inverse is analytic,
 // so getPointAt/getTangentAt evaluate the same C1 curve at the same location.
 outside.getLengths=function(divisions=this.arcLengthDivisions){
  if(this.cacheArcLengths?.length===divisions+1&&!this.needsUpdate)return this.cacheArcLengths;
  const lengths=[0];let previous=jet(0).p;
  for(let i=1;i<=divisions;i++){
   const point=jet(inverseNative(i/divisions)).p;
   lengths.push(lengths.at(-1)+previous.distanceTo(point));previous=point;
  }
  this.needsUpdate=false;this.cacheArcLengths=lengths;return lengths;
 };
 outside.getUtoTmapping=function(u,distance){
  const lengths=this.getLengths(),last=lengths.length-1,target=distance===undefined?u*lengths[last]:distance;
  if(target<=0)return 0;if(target>=lengths[last])return 1;
  let lo=0,hi=last;
  while(lo<=hi){const mid=(lo+hi)>>1;if(lengths[mid]<target)lo=mid+1;else hi=mid-1;}
  const i=Math.max(0,hi),fraction=(target-lengths[i])/(lengths[i+1]-lengths[i]);
  return inverseNative((i+fraction)/last);
 };
 outside.xLoopControls=controls;outside.xJet=jet;outside.xJoins=[...nodes];
 outside.getPoint=(t,target=V())=>target.copy(jet(t).p);
 outside.getTangent=(t,target=V())=>target.copy(jet(t).v).normalize();
}
function inverseWarp(r,a,b){
 if(r<=0)return 0;if(r>=1)return 1;
 const A=1-a+r*(a+b-2),B=a-r*(a+b-2);
 return 2*r/(B+Math.sqrt(B*B+4*A*r));
}
export function applyXPathTangent(path){
 for(const curve of path.curves){
  if(curve.isCubicBezierCurve3)curve.getTangent=(t,target=V())=>target.copy(bezierJet([curve.v0,curve.v1,curve.v2,curve.v3],t).v).normalize();
 }
 const lengths=path.getCurveLengths(),total=lengths.at(-1),pieces=path.curves.map((curve,i)=>{
  const length=curve.getLength(),lo=i?lengths[i-1]:0;
  const speed=t=>curve.xJet?curve.xJet(t).v.length():curve.isCubicBezierCurve3?bezierJet([curve.v0,curve.v1,curve.v2,curve.v3],t).v.length():curve.getPoint(1).distanceTo(curve.getPoint(0));
  return {curve,length,lo,hi:lo+length,a:length/speed(0),b:length/speed(1)};
 });
 const locate=t=>pieces.find(piece=>piece.hi>=t*total)||pieces.at(-1);
 const chart=new T.Curve();chart.arcLengthDivisions=600;
 chart.getPoint=(t,target)=>T.CurvePath.prototype.getPoint.call(path,t,target);
 const chartTangent=(t,target=V())=>{
  const piece=locate(t),u=(t*total-piece.lo)/piece.length;
  return piece.curve.getTangentAt(Math.max(0,Math.min(1,u)),target);
 };
 path.getPoint=(t,target=V())=>{
  const piece=locate(t),u=(t*total-piece.lo)/piece.length;
  return piece.curve.getPoint(warp(Math.max(0,Math.min(1,u)),piece.a,piece.b).p,target);
 };
 path.getTangent=(t,target=V())=>{
  const piece=locate(t),u=(t*total-piece.lo)/piece.length;
  return piece.curve.getTangent(warp(Math.max(0,Math.min(1,u)),piece.a,piece.b).p,target);
 };
 // A separate material chart retains the existing source attachment mesh.
 // Both charts evaluate one geometric curve; no positions are blended.
 path.getPointAt=(u,target)=>chart.getPointAt(u,target);
 path.getSpacedPoints=(divisions=40)=>T.Curve.prototype.getSpacedPoints.call(path,divisions);
 path.getTangentAt=(u,target)=>chartTangent(chart.getUtoTmapping(u),target);
 path.getUtoTmapping=(u,distance)=>{
  const t=chart.getUtoTmapping(u,distance),piece=locate(t),fraction=(t*total-piece.lo)/piece.length;
  const raw=piece.curve.getUtoTmapping(Math.max(0,Math.min(1,fraction)));
  return (piece.lo+piece.length*inverseWarp(raw,piece.a,piece.b))/total;
 };
 path.computeFrenetFrames=(segments,closed)=>T.Curve.prototype.computeFrenetFrames.call(chart,segments,closed);
 path.xJoinParameters=pieces.slice(0,-1).map(piece=>piece.hi/total);
 for(const piece of pieces){
  for(const t of piece.curve.xJoins??[]){
   const value=(piece.lo+piece.length*inverseWarp(t,piece.a,piece.b))/total;
   if(value>0&&value<1)path.xJoinParameters.push(value);
  }
 }
}

// One real tail curve, C1 at both functional ports, with the existing lateral
// clearance arch retained as a function of CAD X (not a pointAt blend).
export function makeXTail(S,neck,incoming,outgoing,detour){
 const handle=Math.min(S.distanceTo(neck)/5,(neck.x-S.x)*.24),controls=[S,S.clone().addScaledVector(incoming,handle),S.clone().addScaledVector(incoming,2*handle),neck.clone().addScaledVector(outgoing,-2*handle),neck.clone().addScaledVector(outgoing,-handle),neck],curve=new T.Curve();curve.arcLengthDivisions=2400;
 curve.xJet=u=>{
  const jet=bezierJet(controls,u),width=-157-S.x,w=(jet.p.x-S.x)/width;
  if(detour&&w>0&&w<1){const a=Math.PI*w,s=Math.sin(a),d=detour*Math.PI*Math.sin(2*a)/width,dd=detour*2*Math.PI*Math.PI*Math.cos(2*a)/(width*width);jet.p.y+=detour*s*s;jet.a.y+=dd*jet.v.x*jet.v.x+d*jet.a.x;jet.v.y+=d*jet.v.x;}
  return jet;
 };
 curve.getPoint=(t,p=V())=>p.copy(curve.xJet(t).p);curve.getTangent=(t,p=V())=>p.copy(curve.xJet(t).v).normalize();return curve;
}
