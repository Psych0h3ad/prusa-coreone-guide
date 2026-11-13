import*as T from'three';
const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x);},mix=(a,b,t)=>a+(b-a)*t;
const table=points=>{const lengths=[0];for(let i=1;i<points.length;i++)lengths.push(lengths.at(-1)+points[i].distanceTo(points[i-1]));return{points,lengths,length:lengths.at(-1)};};
function sample(path,s,out=new T.Vector3()){const{points:p,lengths:l}=path;if(s<=0)return out.copy(p[0]);if(s>=l.at(-1))return out.copy(p.at(-1));let a=0,b=l.length-1;while(b-a>1){const m=(a+b)>>1;if(l[m]<s)a=m;else b=m;}return out.lerpVectors(p[a],p[b],(s-l[a])/(l[b]-l[a]||1));}
const basis=Array.from({length:193},(_,i)=>{const t=i/192,u=1-t;return[u*u*u,3*u*u*t,3*u*t*t,t*t*t];});
export class Box5ThreadField{
 constructor({prepared,closedTarget}){
  if(prepared.def.id!=='box5'||prepared.length!==100||closedTarget.route.length!==100)throw Error('Explicit coherent box5 prepared/closed100mm routes required');
  this.prepared=prepared;this.target=closedTarget.route;this.params=closedTarget.params;this.report=closedTarget.report;this.U=this.target.head.clone().set(...prepared.def.u);this.V=new T.Vector3(...prepared.def.v);this.origin=new T.Vector3(...prepared.def.p);this.W=this.U.clone().cross(this.V).normalize();
  const offset=this.report.prefixPointOffset;this.rootEnd=prepared.points.findIndex(p=>Math.abs(p.clone().sub(this.origin).dot(this.V)-7)<1e-9);if(this.rootEnd<0)throw Error('Prepared incoming straight datum missing');
  this.sourceRoot=table(prepared.points.slice(0,this.rootEnd+1));this.closedRoot=table(this.target.points.slice(0,offset+this.rootEnd+1));this.fixedEnd=this.rootEnd;
  for(let i=this.rootEnd+1;i<prepared.points.length&&offset+i<this.target.points.length;i++){if(this.target.points[offset+i].distanceTo(prepared.points[i])>1e-9)break;this.fixedEnd=i;}
  if(this.fixedEnd<prepared.passageEnd)throw Error('Closed target must retain the directed actual mounting passages');
  this.fixed=prepared.points.slice(this.rootEnd+1,this.fixedEnd+1);this.exit=this.fixed.at(-1);this.uv=p=>[p.clone().sub(this.origin).dot(this.U),p.clone().sub(this.origin).dot(this.V)];
  this.fractions=[...new Set([...this.sourceRoot.lengths.map(x=>x/this.sourceRoot.length),...this.closedRoot.lengths.map(x=>x/this.closedRoot.length)])].sort((a,b)=>a-b);this.fedLoop=Math.min(98,this.target.loopLength+1.5);this.phase=-1;this.setPhase(0);
 }
 point(u,v){return this.origin.clone().addScaledVector(this.U,u).addScaledVector(this.V,v);}
 root(alpha){if(alpha===1)return this.closedRoot.points;if(alpha===0)return this.sourceRoot.points;return this.fractions.map(f=>sample(this.sourceRoot,f*this.sourceRoot.length).lerp(sample(this.closedRoot,f*this.closedRoot.length),alpha));}
 curve(uv){const curve=new T.CubicBezierCurve3(...uv.map(p=>this.point(...p)));return Array.from({length:192},(_,i)=>curve.getPoint((i+1)/192));}
 compose(root,c1,c2,direction,extra=0){const second=c2.map(p=>p.slice());second[1][1]+=extra;const points=[...root,...this.fixed,...this.curve(c1),...this.curve(second)],end=points.at(-1).clone();for(let i=1;i<=32;i++)points.push(end.clone().addScaledVector(direction,this.params.slotLead*i/32));return table(points);}
 solve(root,c1,c2,direction,wanted){
  const before=[...root,...this.fixed,...this.curve(c1)],prefix=table(before).length,du=[],dv=[],db=[];let pu=c2[0][0],pv=c2[0][1],pb=0;
  for(let i=1;i<=192;i++){const b=basis[i],u=b.reduce((n,x,k)=>n+x*c2[k][0],0),v=b.reduce((n,x,k)=>n+x*c2[k][1],0);du.push(u-pu);dv.push(v-pv);db.push(b[1]-pb);pu=u;pv=v;pb=b[1];}
  const length=extra=>{let n=prefix+this.params.slotLead;for(let i=0;i<192;i++)n+=Math.hypot(du[i],dv[i]+db[i]*extra);return n;};let lo=0,hi=16;
  if(length(0)>=wanted-1e-8)return{extra:0,baseLength:length(0)};while(length(hi)<wanted&&hi<256)hi*=2;if(length(hi)<wanted)throw Error('Upper bight cannot hold explicit virtual route stock');for(let i=0;i<34;i++){const mid=(lo+hi)/2;if(length(mid)<wanted)lo=mid;else hi=mid;}return{extra:(lo+hi)/2,baseLength:length(0)};
 }
 setPhase(value){
  if(!Number.isFinite(value)||value<0||value>1)throw Error('Box5 phase0..1 required');if(value===this.phase)return this;this.phase=value;this.mainLength=100;this.offcutLength=0;this.cut=value>=.90;this.closed=0;this.inSlot=false;this.height=2;this.extra=0;
  if(value===0){Object.assign(this,{points:this.prepared.points,lengths:this.prepared.lengths,loopLength:this.prepared.loopLength,stage:'prepared',tailDirection:this.U.clone().negate()});return this;}
  const p=this.params,root=this.root(smooth(value/.12)),e=this.uv(this.exit),outside=[p.outsideU,p.outsideV],head=this.uv(this.target.head),slot=[head[0]-p.slotLead,head[1]+1.35],c1target=[e,[-15,2],[p.outsideU,7],outside],Tend=this.U.clone();let c1,c2,direction,wanted;
  if(value<.30){const b=smooth((value-.12)/.18),angle=Math.PI*b/2,cv=mix(2,p.outsideV,b),handle=mix(3,p.outsideV-7,b),tu=-Math.cos(angle),tv=Math.sin(angle),end=[p.outsideU,cv],control=[end[0]-tu*handle,end[1]-tv*handle],controlU=Math.max(-15-12*b*(1-b),control[0]+.2);c1=[e,[controlU,2],control,end];direction=this.U.clone().multiplyScalar(tu).addScaledVector(this.V,tv);const point=(distance)=>[end[0]+tu*distance,end[1]+tv*distance];c2=[end,point(7),point(13),point(21)];this.stage=value<.12?'align-head':'lift-free-tip';this.height=cv;}
  else{
   c1=c1target;
   if(value<.50){const b=smooth((value-.30)/.20),start=[outside[0],outside[1]+21],end=[mix(start[0],slot[0],b),mix(start[1],slot[1],b)],angle=Math.PI*b/2,tu=Math.sin(angle),tv=Math.cos(angle);direction=this.U.clone().multiplyScalar(tu).addScaledVector(this.V,tv);c2=[outside,[p.outsideU,p.crownV],[end[0]-tu*p.returnHandle,end[1]-tv*p.returnHandle],end];const base=this.compose(root,c1,c2,direction).length;wanted=mix(base,110,smooth((b-.2)/.5));this.stage='align-tip-to-lock';}
   else{direction=Tend;c2=[outside,[p.outsideU,p.crownV],[slot[0]-p.returnHandle,slot[1]],slot];this.inSlot=true;if(value<.60){wanted=mix(110,this.fedLoop,smooth((value-.50)/.10));this.stage='feed-through-lock';this.closed=smooth((value-.50)/.10);}else{wanted=mix(this.fedLoop,this.target.loopLength,smooth((value-.60)/.18));this.stage=value<.80?'tighten':value<.90?'cut-ready':'cut';this.closed=1;}}
  }
  let path;
  if(value>=.78){path={points:this.target.points,lengths:this.target.lengths,length:this.target.loopLength};this.extra=0;}
  else{const solved=wanted===undefined?{extra:0}:this.solve(root,c1,c2,direction,wanted);this.extra=solved.extra;path=this.compose(root,c1,c2,direction,this.extra);}
  this.points=path.points;this.lengths=path.lengths;this.loopLength=path.length;this.tailDirection=direction;this.height=value>=.30?p.crownV+this.extra:this.height;
  if(value>=.90){const retained=this.loopLength+2.5;if(retained>100)throw Error('Actual cut partition exceeds100mm stock');this.mainLength=retained;this.offcutLength=100-this.mainLength;}
  return this;
 }
 at(s,out=new T.Vector3()){
  if(this.phase===0)return this.prepared.at(s,out);
  if(s>=this.loopLength){const d=s-this.loopLength;if(this.inSlot){const p=this.params,a=Math.min(Math.PI/2,Math.max(0,d-p.tailLead)/p.tailRadius);return out.copy(this.points.at(-1)).addScaledVector(this.U,Math.min(d,p.tailLead)+p.tailRadius*Math.sin(a)).addScaledVector(this.V,p.tailRadius*(1-Math.cos(a))+Math.max(0,d-p.tailLead-p.tailRadius*Math.PI/2));}return out.copy(this.points.at(-1)).addScaledVector(this.tailDirection,d);}
  return sample(this,s,out);
 }
 materialAt(s,out=new T.Vector3(),detached=s>this.mainLength){this.at(s,out);if(this.cut&&detached)out.addScaledVector(this.V,30*smooth((this.phase-.90)/.10));return out;}
}
