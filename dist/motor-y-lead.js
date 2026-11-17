import * as T from 'three';
import {MOTOR_Y_EXIT_X as X,MOTOR_Y_EXIT_Y as Y,MOTOR_Y_EXIT_Z as Z,MOTOR_Y_GROOVE as C,MOTOR_Y_JOIN as E,MOTOR_Y_LEAD_REFERENCE as D} from './motor-y-lead-data.js';
const V=a=>new T.Vector3(...a),S=x=>(x=T.MathUtils.clamp(x,0,1))*x*(3-2*x),slots=[[-1,-1],[-1,1],[1,1],[1,-1]],owners=new WeakMap();
class Join extends T.Curve{
 constructor(parts){super();this.parts=parts;this.lengths=parts.map(p=>p.getLength());this.stockMM=this.lengths.reduce((a,b)=>a+b,0);this.measuredMM=parts.reduce((a,p)=>a+(p.measuredMM??p.getLength()),0);}
 locate(t){let s=T.MathUtils.clamp(t,0,1)*this.stockMM;for(let i=0;i<this.parts.length;i++){if(s<=this.lengths[i]||i===this.parts.length-1)return[this.parts[i],T.MathUtils.clamp(s/this.lengths[i],0,1)];s-=this.lengths[i];}}
 getPoint(t,out=new T.Vector3()){const[p,u]=this.locate(t);return p.getPointAt(u,out);}getPointAt(t,out){return this.getPoint(t,out);}
 getTangent(t,out=new T.Vector3()){const[p,u]=this.locate(t);return p.getTangentAt(u,out);}getTangentAt(t,out){return this.getTangent(t,out);}getLength(){return this.stockMM;}
}
function cubic(a,b,c,d){const p=new T.CubicBezierCurve3(a,b,c,d);p.arcLengthDivisions=1024;p.updateArcLengths();return p;}
function prefix(i,amount){
 const [sx,sy]=slots[i],half=D.squareHalfMM+D.unseatedSpreadMM*(1-amount),x=sx*half,y=sy*half,shift=D.unseatedTravelMM*(1-amount)*Math.SQRT1_2;
 const A=V([X[i],Y,Z]),R=A.clone().add(V([0,6,0])),mean=(X[0]+X[3])/2,row=X[i]-mean;
 const Q=V([192+row,178,386]),H=V([192+x,178+y,374]),K=V([201.8+x,188+y,370]),L=V([201.8+x,188+y,353]);
 const B=V([C[0]+x-shift-10*Math.SQRT1_2,C[1]+y+shift+10*Math.SQRT1_2,353]),M=V([C[0]+x-shift,C[1]+y+shift,346]),F=V([M.x,M.y,330]);
 // Rotate each root-row pair into its square corners while retaining a
 // positive transverse gap. Collapsing a row directly into globalXY corners
 // would make the inner pair approach more closely than the full wire gauge.
 const fan=new T.Curve(),correction=row-[-3.75,-1.25,1.25,3.75][i];fan.arcLengthDivisions=1024;
 const fanFrame=t=>{const q=S(t),dq=6*t*(1-t),r=1.25+(half-1.25)*q,dr=(half-1.25)*dq,angle=q*Math.PI/2,da=dq*Math.PI/2,co=Math.cos(angle),si=Math.sin(angle),h=r*co,dh=dr*co-r*si*da,c=half+h+(1.25-half)*(1-q),dc=dh-(1.25-half)*dq;
  const xx=[-c-h,-c+h,c-h,c+h][i]+correction*(1-q),dx=[-dc-dh,-dc+dh,dc-dh,dc+dh][i]-correction*dq,yy=sy*r*si,dy=sy*(dr*si+r*co*da);return{xx,dx,yy,dy};};
 fan.getPoint=(t,out=new T.Vector3())=>{if(t===0)return out.copy(Q);if(t===1)return out.copy(H);const f=fanFrame(t);return out.set(192+f.xx,178+f.yy,386-12*t);};
 fan.getTangent=(t,out=new T.Vector3())=>{const f=fanFrame(t);return out.set(f.dx,f.dy,-12).normalize();};
 // Each remaining bend is planar in its actual horizontal displacement/Z
 // plane. W is perpendicular to that entire plane; T x W is the transported
 // crossaxis. Decompose the required XY endpoint corners into this normal
 // frame, rather than carrying XY offsets partly along the cable tangent.
 const normalBend=(start,end,startPoint,endPoint,handle)=>{
  const c=cubic(start,start.clone().add(V([0,0,-handle])),end.clone().add(V([0,0,handle])),end),delta=end.clone().sub(start),W=V([delta.y,-delta.x,0]).normalize(),V0=V([0,0,-1]).cross(W),O=V([x,y,0]),u=O.dot(W),v=O.dot(V0),curve=new T.Curve();curve.arcLengthDivisions=1024;
  const jet=t=>{const a=1-t,velocity=c.v1.clone().sub(c.v0).multiplyScalar(3*a*a).addScaledVector(c.v2.clone().sub(c.v1),6*a*t).addScaledVector(c.v3.clone().sub(c.v2),3*t*t),acceleration=c.v2.clone().add(c.v0).addScaledVector(c.v1,-2).multiplyScalar(6*a).addScaledVector(c.v3.clone().add(c.v1).addScaledVector(c.v2,-2),6*t),speed=velocity.length(),Tn=velocity.clone().multiplyScalar(1/speed),dT=acceleration.clone().addScaledVector(Tn,-acceleration.dot(Tn)).multiplyScalar(1/speed);return{velocity,Tn,dT};};
  curve.getPoint=(t,out=new T.Vector3())=>{if(t===0)return out.copy(startPoint);if(t===1)return out.copy(endPoint);const j=jet(t);return c.getPoint(t,out).addScaledVector(W,u).addScaledVector(j.Tn.clone().cross(W),v);};
  curve.getTangent=(t,out=new T.Vector3())=>{const j=jet(t);return out.copy(j.velocity).addScaledVector(j.dT.cross(W),v).normalize();};
  return curve;
 };
 const centreH=V([192,178,374]),centreK=V([201.8,188,370]),centreL=V([201.8,188,353]),centreB=V([C[0]-shift-10*Math.SQRT1_2,C[1]+shift+10*Math.SQRT1_2,353]),centreM=V([C[0]-shift,C[1]+shift,346]);
 return new Join([new T.LineCurve3(A,R),cubic(R,R.clone().add(V([0,6,0])),Q.clone().add(V([0,0,5])),Q),fan,normalBend(centreH,centreK,H,K,5),new T.LineCurve3(K,L),normalBend(centreL,centreB,L,B,5.5),normalBend(centreB,centreM,B,M,5),new T.LineCurve3(M,F)]);
}
function endpoint(i){const[sx,sy]=slots[i];return V([E[0],E[1]+sy*D.squareHalfMM,E[2]+sx*D.squareHalfMM]);}
const lanes=[-8,-5.3,-2.7,0];
function connector(a,b,axis,handle){return cubic(a,a.clone().addScaledVector(axis,handle),b.clone().addScaledVector(axis,-handle),b);}
class QuarterBend extends T.Curve{
 constructor(i){super();const[sx,sy]=slots[i];this.radius=5+sx*D.squareHalfMM;this.centre=V([195,E[1]+sy*D.squareHalfMM,325]);this.stockMM=this.radius*Math.PI/2;}
 getPoint(t,out=new T.Vector3()){const a=t*Math.PI/2;return out.copy(this.centre).add(V([this.radius*Math.cos(a),0,this.radius*Math.sin(a)]));}
 getPointAt(t,out){return this.getPoint(t,out);}getTangent(t,out=new T.Vector3()){const a=t*Math.PI/2;return out.set(-Math.sin(a),0,Math.cos(a));}getTangentAt(t,out){return this.getTangent(t,out);}getLength(){return this.stockMM;}
}
// Tail-only row/square transfer. Each section is normal to its centre tangent.
// Parallel YZ bank planes keep all four full-gauge circuits separated while
// the terminal cross-section retains its original Y/Z handedness.
const bankRows=[-3.75,-1.25,1.25,3.75];
function tailFan(i,half,reverse,start,end,ySign=1){
 const [sx,sy]=slots[i],curve=new T.Curve();curve.arcLengthDivisions=1024;
 const section=t=>{const u=reverse?1-t:t,q=S(u),dq=6*u*(1-u)*(reverse?-1:1),r=1.25+(half-1.25)*q,dr=(half-1.25)*dq,a=q*Math.PI/2,da=dq*Math.PI/2,h=r*Math.cos(a),dh=dr*Math.cos(a)-r*Math.sin(a)*da,c=half+h+(1.25-half)*(1-q),dc=dh-(1.25-half)*dq;return{x:[-c-h,-c+h,c-h,c+h][i],dx:[-dc-dh,-dc+dh,dc-dh,dc+dh][i],y:sy*r*Math.sin(a),dy:sy*(dr*Math.sin(a)+r*Math.cos(a)*da)};};
 const jet=t=>{const q=S(t),dq=6*t*(1-t),ddq=6*(1-2*t),dx=(end.x-start.x)*dq,dz=end.z-start.z,L=Math.hypot(dx,dz),nx=Math.abs(dz)/L,nz=-dx*Math.sign(dz)/L,ddx=(end.x-start.x)*ddq;return{centre:V([start.x+(end.x-start.x)*q,start.y,start.z+dz*t]),dx,dz,n:V([nx,0,nz]),dn:V([-Math.abs(dz)*dx*ddx/L**3,0,-Math.sign(dz)*dz*dz*ddx/L**3])};};
 curve.getPoint=(t,out=new T.Vector3())=>{const f=section(t),j=jet(t);return out.copy(j.centre).addScaledVector(j.n,f.x).add(V([0,ySign*f.y,0]));};
 curve.getTangent=(t,out=new T.Vector3())=>{const f=section(t),j=jet(t);return out.set(j.dx,0,j.dz).addScaledVector(j.n,f.dx).addScaledVector(j.dn,f.x).add(V([0,ySign*f.dy,0])).normalize();};
 return curve;
}
function compactBankApproach(i,half,start,end){
 const sy=slots[i][1],c=cubic(start,start.clone().add(V([0,0,5])),end.clone().add(V([0,8,0])),end),curve=new T.Curve();curve.arcLengthDivisions=1024;
 const section=t=>{const q=S(t),dq=6*t*(1-t),r=1.25+(half-1.25)*q,dr=(half-1.25)*dq,a=q*Math.PI/2,da=dq*Math.PI/2,h=r*Math.cos(a),dh=dr*Math.cos(a)-r*Math.sin(a)*da,centre=half+h+(1.25-half)*(1-q),dc=dh-(1.25-half)*dq;return{x:[-centre-h,-centre+h,centre-h,centre+h][i],dx:[-dc-dh,-dc+dh,dc-dh,dc+dh][i],y:sy*r*Math.sin(a),dy:sy*(dr*Math.sin(a)+r*Math.cos(a)*da)};};
 const jet=t=>{const u=1-t,velocity=c.v1.clone().sub(c.v0).multiplyScalar(3*u*u).addScaledVector(c.v2.clone().sub(c.v1),6*u*t).addScaledVector(c.v3.clone().sub(c.v2),3*t*t),acceleration=c.v2.clone().add(c.v0).addScaledVector(c.v1,-2).multiplyScalar(6*u).addScaledVector(c.v3.clone().add(c.v1).addScaledVector(c.v2,-2),6*t),speed=velocity.length(),Tn=velocity.clone().multiplyScalar(1/speed),dT=acceleration.clone().addScaledVector(Tn,-acceleration.dot(Tn)).multiplyScalar(1/speed),raw=V([1,0,0]).addScaledVector(Tn,-Tn.x),L=raw.length(),n=raw.clone().multiplyScalar(1/L),dn=dT.clone().multiplyScalar(-Tn.x).addScaledVector(Tn,-dT.x);dn.addScaledVector(n,-dn.dot(n)).multiplyScalar(1/L);return{velocity,n,dn,b:n.clone().cross(Tn),db:dn.clone().cross(Tn).add(n.clone().cross(dT))};};
 curve.getPoint=(t,out=new T.Vector3())=>{const f=section(t),j=jet(t);return c.getPoint(t,out).addScaledVector(j.n,f.x).addScaledVector(j.b,-f.y);};
 curve.getTangent=(t,out=new T.Vector3())=>{const f=section(t),j=jet(t);return out.copy(j.velocity).addScaledVector(j.dn,f.x).addScaledVector(j.n,f.dx).addScaledVector(j.db,-f.y).addScaledVector(j.b,-f.dy).normalize();};return curve;
}
function tailParts(i,p,amount){
 const F=p.getPointAt(1),shift=D.unseatedTravelMM*(1-amount)*Math.SQRT1_2,meanX=C[0]-shift,meanY=C[1]+shift,half=D.squareHalfMM+D.unseatedSpreadMM*(1-amount),row=bankRows[i],bankX=meanX-1.5;
 const A=V([bankX+row,meanY,315]),J=V([bankX+row,155,325]),W=V([198,120,329]),fanStart=V([197+row,E[1],305]),arc=new QuarterBend(i);
 const before=tailFan(i,half,true,V([meanX,meanY,330]),V([bankX,meanY,315])),after=tailFan(i,D.squareHalfMM,false,V([197,E[1],305]),V([200,E[1],325]));
 const [sx,sy]=slots[i],turnRadius=5,outerTurn=new BankCircle(W.x+sx*D.squareHalfMM,W.y,W.z-turnRadius,turnRadius+sy*D.squareHalfMM,Math.PI/2,Math.PI/2),innerTurn=new BankCircle(fanStart.x,(W.y-turnRadius+E[1])/2,fanStart.z,(W.y-turnRadius-E[1])/2,0,-Math.PI);
 return{before:[before],after:[compactBankApproach(i,D.squareHalfMM,V([bankX,155,325]),W),outerTurn,tailFan(i,D.squareHalfMM,true,V([W.x,W.y-turnRadius,W.z-turnRadius]),V([197,W.y-turnRadius,305]),-1),innerTurn,after,arc,new T.LineCurve3(arc.getPointAt(1),endpoint(i))],bank:{start:A,end:J,startT:V([0,0,-1]),endT:V([0,0,1])}};
}
class BankCircle extends T.Curve{
 constructor(x,y,z,r,a,span){super();Object.assign(this,{x,y,z,r,a,span});this.arcLengthDivisions=512;}
 getPoint(t,out=new T.Vector3()){const a=this.a+this.span*t;return out.set(this.x,this.y+this.r*Math.cos(a),this.z+this.r*Math.sin(a));}
 getPointAt(t,out){return this.getPoint(t,out);}getTangent(t,out=new T.Vector3()){const a=this.a+this.span*t;return out.set(0,-Math.sin(a)*Math.sign(this.span),Math.cos(a)*Math.sign(this.span));}getTangentAt(t,out){return this.getTangent(t,out);}getLength(){return this.r*Math.abs(this.span);}
}
class MotorBank extends T.Curve{
 constructor({start,end,startT,endT,stock}){
  super();const r=(end.z-start.z)/2;if(!(r>0)||start.x!==end.x||startT.distanceTo(V([0,0,-1]))!==0||endT.distanceTo(V([0,0,1]))!==0)throw Error('Planar freebank requires its actual ordered frames');
  const upperFront=Math.min(start.y,end.y)-r,minimum=start.y+end.y-2*r-2*upperFront+2*Math.PI*r;this.stockMM=stock===null?minimum:stock;if(this.stockMM<minimum)throw Error('Motor lead has insufficient free material');
  const front=(start.y+end.y-2*r+2*Math.PI*r-this.stockMM)/2,first=new BankCircle(start.x,start.y-r,start.z,r,0,-Math.PI/2),turn=new BankCircle(start.x,front,start.z,r,-Math.PI/2,-Math.PI),last=new BankCircle(start.x,end.y-r,end.z,r,-Math.PI/2,Math.PI/2);
  this.path=new Join([first,new T.LineCurve3(first.getPointAt(1),turn.getPointAt(0)),turn,new T.LineCurve3(turn.getPointAt(1),last.getPointAt(0)),last]);this.measuredMM=this.path.measuredMM;this.frontY=front-r;this.minimumRadiusMM=r;
 }
 getPoint(t,out=new T.Vector3()){return this.path.getPoint(t,out);}getPointAt(t,out){return this.getPoint(t,out);}getTangent(t,out=new T.Vector3()){return this.path.getTangent(t,out);}getTangentAt(t,out){return this.getTangent(t,out);}getLength(){return this.stockMM;}
}
const totalLength=parts=>parts.reduce((sum,p)=>sum+p.getLength(),0);
function makeStock(){return X.map((_,i)=>{let maximum=0;for(let k=0;k<=20;k++){const amount=k/20,p=prefix(i,amount),tail=tailParts(i,p,amount),minimum=new MotorBank({...tail.bank,stock:null}).measuredMM;maximum=Math.max(maximum,p.getLength()+totalLength(tail.before)+minimum+totalLength(tail.after));}return maximum+D.freeSlackMM;});}
class MeanMetres extends T.Curve{
 constructor(owner){super();this.owner=owner;}
 getPoint(t,out=new T.Vector3()){out.set(0,0,0);for(const p of this.owner.paths)out.add(p.getPointAt(t));return out.multiplyScalar(.00025);}getPointAt(t,out){return this.getPoint(t,out);}
 getTangent(t,out=new T.Vector3()){out.set(0,0,0);for(const p of this.owner.paths)out.add(p.getTangentAt(t));return out.normalize();}getTangentAt(t,out){return this.getTangent(t,out);}
 getLength(){let L=0,a=this.getPoint(0);for(let k=1;k<=1024;k++){const b=this.getPoint(k/1024);L+=a.distanceTo(b);a=b;}return L;}
}
export class MotorYLead{
 constructor(def){
  Object.assign(this,def);this.radius=D.radiusMM;this.stockMM=D.referenceStockMM?[...D.referenceStockMM]:makeStock();this.paths=[];this.samples=D.samples;this.geometry=new T.BufferGeometry();this.curve=new MeanMetres(this);
  const N=D.samples,R=D.sides,per=(N+1)*(R+1)+2*(R+2),positions=new Float32Array(4*per*3),normals=new Float32Array(positions.length),indices=[];
  this.perWireVertices=per;
  for(let wire=0;wire<4;wire++){const base=wire*per,start=indices.length;for(let k=0;k<N;k++)for(let j=0;j<R;j++){const a=base+k*(R+1)+j,b=a+R+1;indices.push(a,b,a+1,b,b+1,a+1);}for(let end=0;end<=1;end++){const cap=base+(N+1)*(R+1)+end*(R+2);for(let j=0;j<R;j++)indices.push(...(end?[cap,cap+j+1,cap+j+2]:[cap,cap+j+2,cap+j+1]));}this.geometry.addGroup(start,indices.length-start,wire);}
  this.geometry.setAttribute('position',new T.BufferAttribute(positions,3).setUsage(T.DynamicDrawUsage));this.geometry.setAttribute('normal',new T.BufferAttribute(normals,3).setUsage(T.DynamicDrawUsage));this.geometry.setIndex(indices);
  const materials=D.colours.map(colour=>{const m=new T.MeshStandardMaterial({color:colour,roughness:.72,metalness:.05});m.userData.originalOpacity=1;m.userData.originalColor=m.color.clone();return m;});
  this.mesh=new T.Mesh(this.geometry,materials);this.mesh.userData={part:'cables',cadName:def.name,flexId:def.id,supplement:true,preserveColours:true,motorLeadReference:true,wireRadiusMM:D.radiusMM,referenceBundleEnvelopeRadiusMM:1.3};this.mesh.castShadow=true;owners.set(this,{geometry:this.geometry,p:this.geometry.attributes.position,n:this.geometry.attributes.normal,index:this.geometry.index,materials});this.update(1,1,1);
 }
 update(from,to,t){
  const own=owners.get(this);if(!own||this.mesh.geometry!==own.geometry||this.geometry.attributes.position!==own.p||this.geometry.attributes.normal!==own.n||this.geometry.index!==own.index)return;
  const amount=T.MathUtils.clamp(from+(to-from)*S(t),0,1),key=String(amount);if(this.lastKey===key)return;this.lastKey=key;
  this.paths=this.stockMM.map((stock,i)=>{const p=prefix(i,amount),tail=tailParts(i,p,amount),bank=new MotorBank({...tail.bank,stock:stock-p.getLength()-totalLength(tail.before)-totalLength(tail.after)});return new Join([p,...tail.before,bank,...tail.after]);});
  const N=D.samples,R=D.sides,p=own.p,n=own.n,normalMatrix=own.fromCAD?new T.Matrix3().getNormalMatrix(own.fromCAD):null;
  const write=(index,point,normal)=>{const q=point.clone().multiplyScalar(.001),nn=normal.clone();if(own.fromCAD){q.applyMatrix4(own.fromCAD);nn.applyMatrix3(normalMatrix).normalize();}p.setXYZ(index,q.x,q.y,q.z);n.setXYZ(index,nn.x,nn.y,nn.z);};
  for(let wire=0;wire<4;wire++){const c=this.paths[wire],f=c.computeFrenetFrames(N,false),base=wire*this.perWireVertices;for(let k=0;k<=N;k++){const centre=c.getPointAt(k/N);for(let j=0;j<=R;j++){const angle=j/R*Math.PI*2,radial=f.normals[k].clone().multiplyScalar(-Math.cos(angle)).addScaledVector(f.binormals[k],Math.sin(angle)),point=centre.clone().addScaledVector(radial,D.radiusMM),q=base+k*(R+1)+j;write(q,point,radial);}}
   for(let end=0;end<=1;end++){const cap=base+(N+1)*(R+1)+end*(R+2),centre=c.getPointAt(end),normal=c.getTangentAt(end).multiplyScalar(end?1:-1);write(cap,centre,normal);const capNormal=normalMatrix?normal.clone().applyMatrix3(normalMatrix).normalize():normal;for(let j=0;j<=R;j++){const side=base+end*N*(R+1)+j;p.setXYZ(cap+j+1,p.getX(side),p.getY(side),p.getZ(side));n.setXYZ(cap+j+1,capNormal.x,capNormal.y,capNormal.z);}}
  }
  p.needsUpdate=n.needsUpdate=true;this.geometry.computeBoundingBox();this.geometry.computeBoundingSphere();this.mesh.userData.flexState={from,to,t,amount,wholeConductors:4,neutralStockMM:[...this.stockMM],measuredMM:this.paths.map(p=>p.measuredMM),wireRadiusMM:D.radiusMM,source:'native567 capped exit planes; authored routes, colours and neutral stock; not OEM specifications'};
 }
 guide(to=1,from=0){
  from=T.MathUtils.clamp(from??0,0,1);to=T.MathUtils.clamp(to,0,1);if(from===to)return[];
  const points=Array.from({length:17},(_,k)=>{const amount=from+(to-from)*S(k/16),shift=D.unseatedTravelMM*(1-amount)*Math.SQRT1_2;return V([C[0]-shift,C[1]+shift,C[2]]).multiplyScalar(.001);});
  points.targetIndex=points.length-1;return points;
 }
}
export function motorYContinuationSource(entity){
 const q=owners.get(entity);if(!q||entity.mesh.geometry!==q.geometry||entity.geometry!==q.geometry||entity.geometry.attributes.position!==q.p||entity.geometry.attributes.normal!==q.n||entity.geometry.index!==q.index) return null;
 return entity.paths.map((path,i)=>{const end=path.getPointAt(1),tangent=path.getTangentAt(1),j=i*entity.perWireVertices+D.samples*(D.sides+1),row=new T.Vector3().fromBufferAttribute(q.n,j);if(q.toCAD)row.applyMatrix3(new T.Matrix3().getNormalMatrix(q.toCAD)).normalize();return{point:end.toArray(),tangent:tangent.toArray(),row:row.toArray(),neutralStockMM:entity.stockMM[i],wireRadiusMM:D.radiusMM,jacketColour:D.colours[i]};});
}
export function followMotorYLead(viewer){
 const e=viewer.fasteners?.entities.get('motorYWire'),own=owners.get(e);if(!own||e.mesh.geometry!==own.geometry||viewer.disposed)return;
 const motor=viewer.meshes.find(m=>m.userData.cadIndex===567);if(!motor)return;
 if(!own.fromCAD){own.toCAD=new T.Matrix4().compose(motor.userData.restPosition,motor.userData.restQuaternion,motor.scale);own.fromCAD=own.toCAD.clone().invert();own.toCAD.decompose(e.mesh.userData.restPosition,e.mesh.userData.restQuaternion,e.mesh.scale);const state=e.mesh.userData.flexState;e.lastKey='';e.update(state.from,state.to,state.t);}
 motor.updateWorldMatrix(true,false);e.mesh.parent.updateWorldMatrix(true,false);const pose=e.mesh.parent.matrixWorld.clone().invert().multiply(motor.matrixWorld);pose.decompose(e.mesh.position,e.mesh.quaternion,e.mesh.scale);e.mesh.matrixAutoUpdate=false;e.mesh.matrix.copy(pose);e.mesh.matrixWorldNeedsUpdate=true;let show=true;for(let m=motor;m&&m!==viewer.printer;m=m.parent)if(!m.visible)show=false;e.mesh.visible=show;
}
