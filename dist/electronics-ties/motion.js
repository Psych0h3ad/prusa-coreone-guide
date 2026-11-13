import*as T from'three';import{XBuddyPreparedTieRoute}from'../xbuddy-tie-routing.js';
const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x);},mix=(a,b,t)=>a+(b-a)*t,V=a=>new T.Vector3(...a);
function lengths(points){const a=[0];for(let i=1;i<points.length;i++)a.push(a.at(-1)+points[i].distanceTo(points[i-1]));return a;}
function sample(points,ls,s,out=new T.Vector3()){
 if(s<=0)return out.copy(points[0]).addScaledVector(points[1].clone().sub(points[0]).normalize(),s);
 let lo=0,hi=ls.length-1;if(s>=ls[hi])return out.copy(points[hi]).addScaledVector(points[hi].clone().sub(points[hi-1]).normalize(),s-ls[hi]);
 while(hi-lo>1){const m=(lo+hi)>>1;if(ls[m]<s)lo=m;else hi=m;}return out.lerpVectors(points[lo],points[hi],(s-ls[lo])/(ls[hi]-ls[lo]));
}
export function createPrepared26(def){
 const route=new XBuddyPreparedTieRoute(def),trim=-12,start=route.at(trim),end=route.points[route.passageEnd];
 route.points=[start,...route.points.filter((p,i)=>route.lengths[i]>trim)];route.lengths=lengths(route.points);route.passageEnd=route.points.indexOf(end);route.loopLength=route.lengths[route.passageEnd];return route;
}
export class Box4CloseField{
 constructor(def,prepared,{headHeight=17,closedHeight=12,headShift=-.4,tailRadius=.65}={}){
  if(def.id!=='box4'||def.strap||prepared.length!==100)throw Error('Expected source box4 /100mm preparation');
  this.def=def;this.prepared=prepared;this.U=V(def.u);this.V=V(def.v);this.W=this.U.clone().cross(this.V).normalize();this.origin=V(def.p);this.length=100;this.headHeight=headHeight;this.closedHeight=closedHeight;this.headShift=headShift;this.tailRadius=tailRadius;
  const first=prepared.at(0).sub(this.origin);if(Math.abs(first.dot(this.V)-26)>1e-7)throw Error('Expected frozen head26 preparation');
  this.headU=first.dot(this.U);this.preparedHeadHeight=26;this.setPhase(0);
 }
 point(u,v){return this.origin.clone().addScaledVector(this.U,u).addScaledVector(this.V,v);}
 headAtU(headHeight){return this.headU+this.headShift*clamp((26-headHeight)/(26-this.headHeight));}
 prefix(headHeight){const pp=this.prepared,hu=this.headAtU(headHeight),points=[this.point(hu,headHeight),this.point(hu,headHeight-1)],c=new T.CubicBezierCurve3(points.at(-1),this.point(hu,(headHeight+7)/2),this.point(this.headU,10),this.point(this.headU,8));for(let i=1;i<=32;i++)points.push(c.getPoint(i/32));points.push(this.point(this.headU,7));for(let i=0;i<=pp.passageEnd+96;i++)if(pp.lengths[i]>19+1e-8)points.push(pp.points[i].clone());return points;}
 freeCurves(height,blend,headHeight,lead){
  const s=this.def.span,E=[-s-(this.def.bend||.85),2],end=[this.headAtU(headHeight)-lead,headHeight+1.35];
  // de Casteljau split of the exact retained resting cubic: identical192
  // samples at blend0, with the same fixed passage/bend and tangent.
  const source=[E,[-s-4,2],[-s-4,-5.5],[-s-20,-5.5]].map(p=>this.point(...p));
  const a=source[0].clone().lerp(source[1],.5),b=source[1].clone().lerp(source[2],.5),c=source[2].clone().lerp(source[3],.5),d=a.clone().lerp(b,.5),e=b.clone().lerp(c,.5),f=d.clone().lerp(e,.5);
  const local=p=>[p.clone().sub(this.origin).dot(this.U),p.clone().sub(this.origin).dot(this.V)],start=local(f),outside=[-19.6,3.2],tangent=e.clone().sub(f).normalize(),approach=local(f.clone().addScaledVector(tangent,1)),handle=8;
  const aa=f.clone().lerp(e,.5),bb=e.clone().lerp(c,.5),cc=c.clone().lerp(source[3],.5),dd=aa.clone().lerp(bb,.5),ee=bb.clone().lerp(cc,.5),ff=dd.clone().lerp(ee,.5);
  const rest=[[f,aa,dd,ff],[ff,ee,cc,source[3]]],target=[[start,approach,[outside[0],outside[1]-4],outside],[outside,[outside[0],height],[end[0]-handle,height],end]].map(row=>row.map(p=>this.point(...p)));
  const horizontal=smooth((blend-.35)/.65),curves=rest.map((row,k)=>new T.CubicBezierCurve3(...row.map((p,i)=>{if(k===1&&i>0){const q=p.clone(),du=target[k][i].clone().sub(p).dot(this.U),dv=target[k][i].clone().sub(p).dot(this.V);return q.addScaledVector(this.U,du*horizontal).addScaledVector(this.V,dv*blend);}return p.clone().lerp(target[k][i],blend);}))),dir=this.U.clone().multiplyScalar(Math.cos(Math.PI*(1-blend))).addScaledVector(this.V,Math.sin(Math.PI*(1-blend)));
  curves[1].v2.copy(curves[1].v3).addScaledVector(dir,-mix(4,handle,blend));
  return{curves,end:curves[1].v3,dir};
 }
 make(headHeight,height,blend,lead=12){
  const points=this.prefix(headHeight),{curves,end,dir}=this.freeCurves(height,blend,headHeight,lead);for(const c of curves)for(let i=1;i<=48;i++)points.push(c.getPoint(i/48));
  //12mm straight at the real head axis: the9.7mm-short aligned tip is
  // still outside the1.7mm slot face. It enters by material feed, not a warp.
  for(let i=1;i<=30;i++)points.push(end.clone().addScaledVector(dir,lead*i/30));
  return{points,lengths:lengths(points),head:points[0],dir,blend};
 }
 solve(headHeight,target,lead=12){let lo=this.closedHeight,hi=80;for(let i=0;i<34;i++){const m=(lo+hi)/2;if(this.make(headHeight,m,1,lead).lengths.at(-1)>target)hi=m;else lo=m;}return(lo+hi)/2;}
 setPhase(phase){
  if(!Number.isFinite(phase)||phase<0||phase>1)throw Error('Expected normalized box4 phase0..1');this.phase=phase;
  if(phase===0){this.points=this.prepared.points;this.lengths=this.prepared.lengths;this.loopLength=this.prepared.loopLength;this.head=this.prepared.at(0);this.height=2;this.mainLength=100;this.offcutLength=0;this.closed=0;this.cut=false;this.stage='prepared';return this;}
  const headHeight=mix(26,this.headHeight,smooth(phase/.30)),aligned=this.solve(headHeight,109.7),minimum=this.make(headHeight,this.closedHeight,1).lengths.at(-1),fed=this.solve(headHeight,Math.min(98,Math.max(91,minimum+2)));
  let height=aligned,blend=smooth(phase/.45);if(phase>=.45)height=mix(aligned,fed,smooth((phase-.45)/.15));if(phase>=.60)height=mix(fed,this.closedHeight,smooth((phase-.60)/.18));
  const lead=mix(12,4,smooth((phase-.60)/.18)),r=this.make(headHeight,height,blend,lead);Object.assign(this,r);this.loopLength=this.lengths.at(-1);this.height=height;
  const retained=this.loopLength+2.5,partition=smooth((phase-.80)/.08);if(partition>0&&retained>100)throw Error('Box4 route exceeds100mm stock');this.mainLength=mix(100,retained,partition);this.offcutLength=100-this.mainLength;this.closed=phase<.45?0:smooth((phase-.45)/.15);this.cut=phase>=.90;this.stage=phase<.45?'align':phase<.60?'thread':phase<.80?'close':phase<.90?'cut-ready':'cut';return this;
 }
 at(s,out=new T.Vector3()){if(this.phase>=.45&&s>=this.loopLength){const x=s-this.loopLength,lead=1.7,r=this.tailRadius,arc=Math.min(Math.PI/2,Math.max(0,x-lead)/r);out.copy(this.points.at(-1)).addScaledVector(this.U,Math.min(x,lead)+r*Math.sin(arc)).addScaledVector(this.V,r*(1-Math.cos(arc))+Math.max(0,x-lead-r*Math.PI/2));return out;}return sample(this.points,this.lengths,s,out);}
 materialAt(s,out=new T.Vector3(),detached=s>this.mainLength){this.at(s,out);if(this.cut&&detached)out.addScaledVector(this.V,30*smooth((this.phase-.90)/.10));return out;}
}
function taperRibbon(ribbon,distances,total){
 const pos=ribbon.g.attributes.position;
 for(let i=0;i<=ribbon.count;i++){const k=ribbon.offset+i*8,lo=V([pos.getX(k),pos.getY(k),pos.getZ(k)]),hi=V([pos.getX(k+1),pos.getY(k+1),pos.getZ(k+1)]),side=hi.sub(lo).multiplyScalar(.5),factor=mix(.3,1,smooth((total-distances[i])/5));
  for(let j=0;j<8;j++){const sign=[-1,1,1,1,1,-1,-1,-1][j];pos.setXYZ(k+j,pos.getX(k+j)+side.x*sign*(factor-1),pos.getY(k+j)+side.y*sign*(factor-1),pos.getZ(k+j)+side.z*sign*(factor-1));}
 }
}
export function writeBox4Field(entity,field){
 const N=entity.loop.count,M=entity.offcut.count,main=field.mainLength,off=field.offcutLength,ss=[];
 for(let i=0;i<=N;i++){const s=main*i/N;ss.push(s);field.at(s,entity.loop.points[i]);}entity.loop.write(entity.loop.points,entity.W,1,false);taperRibbon(entity.loop,ss,100);
 for(let i=0;i<=M;i++){const s=main+off*i/M,p=entity.offcut.points[i];field.materialAt(s,p,true);if(off===0){const head=field.at(0),tip=field.at(100);p.copy(head).lerp(tip,smooth((field.phase-.65)/.15));}}
 entity.offcut.write(entity.offcut.points,entity.W,off>0?1:0,false);if(off>0)taperRibbon(entity.offcut,Array.from({length:M+1},(_,i)=>main+off*i/M),100);
 // One material seam before cutting, matching cut faces after separation.
 // Independent coarse/fine secants would give the two rows different cut
 // planes and create a false sliver overlap at this same stock station.
 if(off>0){const centre=field.at(main),tangent=field.at(main+.001).sub(field.at(main-.001)).normalize(),side=entity.W,normal=new T.Vector3().crossVectors(side,tangent),factor=mix(.3,1,smooth(off/5)),drop=field.cut?30*smooth((field.phase-.90)/.10):0,pos=entity.ribbonGeometry.attributes.position;
  for(let j=0;j<8;j++){const c=[0,1,1,2,2,3,3,0][j],sw=c===0||c===3?-1:1,st=c<2?-1:1,p=centre.clone().addScaledVector(side,sw*entity.loop.width*.5*factor).addScaledVector(normal,st*entity.loop.thickness*.5);pos.setXYZ(entity.loop.offset+N*8+j,p.x*.001,p.y*.001,p.z*.001);p.addScaledVector(field.V,drop);pos.setXYZ(entity.offcut.offset+j,p.x*.001,p.y*.001,p.z*.001);}
 }
 const head=field.at(0),headW=entity.loop.firstSide,root=entity.loop.firstTangent.clone().negate(),headV=new T.Vector3().crossVectors(headW,root),headU=new T.Vector3().crossVectors(headV,headW),pos=entity.ribbonGeometry.attributes.position;
 for(let i=0;i<entity.lockPosition.length/3;i++){const j=i*3,p=head.clone().addScaledVector(headW,entity.lockPosition[j]).addScaledVector(headV,entity.lockPosition[j+1]).addScaledVector(headU,entity.lockPosition[j+2]);pos.setXYZ(entity.headOffset+i,p.x*.001,p.y*.001,p.z*.001);}
 pos.needsUpdate=true;entity.geometry.computeVertexNormals();entity.geometry.computeBoundingBox();entity.geometry.computeBoundingSphere();
 entity.mesh.userData.flexState={phase:field.stage,normalizedPhase:field.phase,materialLength:100,stripLength:main,offcutLength:off,closed:field.closed,cut:field.cut,loopLength:field.loopLength,tail:Math.max(0,100-field.loopLength),rise:field.height,start:0};
 return field;
}
