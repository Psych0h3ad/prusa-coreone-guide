import * as T from 'three';
import {probeHandling} from './chamber-temp-handling.js';
const v=a=>new T.Vector3(...a),mix=(a,b,t)=>v(a).lerp(v(b),t),smooth=x=>{x=T.MathUtils.clamp(x,0,1);return x*x*(3-2*x);};
export const TEMP_REFERENCE=Object.freeze({stockMM:260,bulkRadiusMM:1,tailRadiusMM:.32,probeLengthMM:15.3,probeRadiusMM:1,root:[8.74,176,376+21.3*Math.sqrt(.96)],gridDatum:[-.5,176,369],bench:[100,-120,80],qualification:'Independent teaching path:260mm nominal part designation used as reference material length; not a measured OEM neutral cut datum. Probe15.3mm/outer-jacket reference dimensions and free handling are inferred. Registration uses actual grid honeycomb holes and official photographs, not an OEM probe drawing.'});
export const TEMP_RECT=[7.9687997970496465,-15.382738403891594,15.528351794625948,-7.8108503188902505],BOARD=[-54.20276,165.43632,206.64597];
export function tempFrame(){const r=TEMP_RECT;return new T.Matrix4().set(1,0,0,BOARD[0]-(r[0]+r[2])/2,0,0,1,BOARD[1]+.29,0,-1,0,BOARD[2]-r[1]+2.4,0,0,0,1);}
export const seatedOutlet=()=>v([0,0,1.25]).applyMatrix4(tempFrame());
export function tempBodyOffset(a){const held=smooth(a/.25)*(1-smooth((a-.35)/.3));return v(TEMP_REFERENCE.bench).multiplyScalar(1-smooth(a/.25)).add(new T.Vector3(0,-3*held,30*held));}
const headKnots=[[0,null],[.15,[-.5,184,349]],[.35,[-.5,184,347]],[.55,[-.5,184,308]],[1,[-69,171,266]],[1.35,[-69,171,255]],[1.65,[-69,171,237]],[2,null],[3,null]];
export function tempHead(a){const seated=seatedOutlet(),park=v(TEMP_REFERENCE.gridDatum).add(v(TEMP_REFERENCE.bench)).add(new T.Vector3(-35,-25,-45)),p=headKnots.map(([t,q])=>[t,q?v(q):t===0?park:t===2?seated.clone().add(new T.Vector3(0,0,12)):seated]);let i=p.findIndex(([t])=>t>=a);if(i<=0)return p[0][1].clone();const [x,A]=p[i-1],[y,B]=p[i];return A.clone().lerp(B,smooth((a-x)/(y-x)));}
class Line {constructor(a,b){this.a=a;this.b=b;this.length=a.distanceTo(b);}point(t){return this.a.clone().lerp(this.b,t);}tangent(){return this.b.clone().sub(this.a).normalize();}}
class Arc {constructor(c,a,b,axis,angle){this.c=c;this.a=a;this.b=b;this.axis=axis;const u=a.clone().sub(c).normalize(),w=b.clone().sub(c).normalize();this.angle=angle??Math.acos(T.MathUtils.clamp(u.dot(w),-1,1));this.radius=a.distanceTo(c);this.length=this.angle*this.radius;}point(t){return this.a.clone().sub(this.c).applyAxisAngle(this.axis,this.angle*t).add(this.c);}tangent(t){return this.axis.clone().cross(this.point(t).sub(this.c)).normalize();}}
export function roundedPath(points,radius=4){
 const clean=[];for(const p of points)if(!clean.length||p.distanceTo(clean.at(-1))>1e-8)clean.push(p);points=clean;
 // Intermediate stations on the same straight are material guides, not
 // corners. Keep one straight before calculating fillet room; otherwise a
 // harmless short guide interval incorrectly squeezes its adjacent bend.
 for(let i=1;i<points.length-1;){const a=points[i].clone().sub(points[i-1]).normalize(),b=points[i+1].clone().sub(points[i]).normalize();if(a.dot(b)>1-1e-12)points.splice(i,1);else i++;}
 const pieces=[],add=(a,b)=>{if(a.distanceTo(b)>1e-9)pieces.push(new Line(a.clone(),b.clone()));};let last=points[0].clone();
 for(let i=1;i<points.length-1;i++){
  const p=points[i],incoming=p.clone().sub(points[i-1]),outgoing=points[i+1].clone().sub(p),l=incoming.length(),m=outgoing.length();if(l<1e-8||m<1e-8)continue;incoming.divideScalar(l);outgoing.divideScalar(m);const angle=Math.acos(T.MathUtils.clamp(incoming.dot(outgoing),-1,1)),axis=incoming.clone().cross(outgoing);if(angle<1e-6||axis.length()<1e-8){add(last,p);last=p.clone();continue;}
  const desired=radius*Math.tan(angle/2),cut=Math.min(desired,l*.42,m*.42),r=cut/Math.tan(angle/2),A=p.clone().addScaledVector(incoming,-cut),B=p.clone().addScaledVector(outgoing,cut);axis.normalize();const c=A.clone().addScaledVector(axis.clone().cross(incoming),r);add(last,A);pieces.push(new Arc(c,A,B,axis));last=B;
 }
 add(last,points.at(-1));const length=pieces.reduce((s,p)=>s+p.length,0);return {pieces,length,at(s){s=T.MathUtils.clamp(s,0,length);for(const p of pieces){if(s<=p.length)return p.point(p.length?s/p.length:0);s-=p.length;}return pieces.at(-1).point(1);},tangent(s){s=T.MathUtils.clamp(s,0,length);for(const p of pieces){if(s<=p.length)return p.tangent(p.length?s/p.length:0);s-=p.length;}return pieces.at(-1).tangent(1);}};
}
function pathOf(pieces){const length=pieces.reduce((s,p)=>s+p.length,0);return {pieces,length,at(s){s=T.MathUtils.clamp(s,0,length);for(const p of pieces){if(s<=p.length)return p.point(p.length?s/p.length:0);s-=p.length;}return pieces.at(-1).point(1);},tangent(s){s=T.MathUtils.clamp(s,0,length);for(const p of pieces){if(s<=p.length)return p.tangent(p.length?s/p.length:0);s-=p.length;}return pieces.at(-1).tangent(1);}};}
function template(a,handling=0){
 const held=smooth(a/.25)*(1-smooth((a-.35)/.3)),off=tempBodyOffset(a),root=v(TEMP_REFERENCE.root).add(off),G=v(TEMP_REFERENCE.gridDatum).add(off),end=tempHead(a),radius=2+4*(1-smooth(a/.3)),lead=3+7*(1-smooth(a/.3)),C=G.clone().add(new T.Vector3(radius+2*held*(2-held),-4-5*(1-smooth(a/.3)),-24)),D=C.clone().add(new T.Vector3(-2*radius,0,0)),thread=smooth((a-.15)/.2),caseXY=a<=1.65?end:v([-69,171,237]),gather=smooth((a-.55)/.45),guideX=caseXY.x-3*gather;
 const local=p=>v(p).add(off),h=probeHandling(handling),shift=h.shift;
 if(handling>0&&a!==0)throw Error('Thermistor unthreading requires the free grid state');
 const tailOfPrefix=[local([-.5,176,353.7]),C.clone().add(new T.Vector3(0,lead,0)),C];let prefix;
 if(h.turn){
  const turn=h.turn,first=(turn.segments[0]?.a||turn.end).clone().add(off),approach=roundedPath([h.root.clone().add(off),h.neck.clone().add(off),first],2),parts=turn.segments.map(s=>s.kind==='line'?new Line(s.a.clone().add(off),s.b.clone().add(off)):new Arc(s.c.clone().add(off),s.a.clone().add(off),s.b.clone().add(off),s.axis,s.angle)),after=roundedPath([turn.end.clone().add(off),local([20,176,372.3]),...tailOfPrefix],2);prefix=pathOf([...approach.pieces,...parts,...after.pieces]);
 }else prefix=roundedPath([...([h.root,h.neck,...h.guides].map(p=>p.clone().add(off))),...tailOfPrefix],2);
 const lower=smooth((345-end.z)/15),frontY=185.8,frontLevel=345-10*lower,front=end.clone().add(new T.Vector3(0,0,35)).lerp(v([-.5,frontY,Math.max(frontLevel,end.z+35)]),thread),above=end.clone().add(new T.Vector3(0,0,28)).lerp(v([-.5,185.8,Math.max(335,end.z+28)]),thread),mid=end.clone().add(new T.Vector3(0,0,24)).lerp(v([-.5,185.8,Math.max(330,end.z+24)]),thread),low=end.clone().add(new T.Vector3(0,0,21)).lerp(v([-.5,185.8,Math.max(316,end.z+21)]),thread);
 // Successive approach stations remain ordered above the actual plug mouth.
 // Collapsing all three onto end+7 created a microscopic S bend while the
 // free plug crossed the backplate, despite an otherwise correct260mm sum.
 const tail=roundedPath([D,D.clone().add(new T.Vector3(0,lead,0)),front,above,mid,low,v([guideX,T.MathUtils.lerp(caseXY.y,185.8,gather),Math.max(270,end.z+17)]),v([guideX,caseXY.y,Math.max(254,end.z+13)]),v([guideX,caseXY.y,Math.max(241,end.z+10)]),end.clone().add(new T.Vector3(0,0,7)),end]);
 return{root,end,C,D,prefix,tail,radius,shift};
}
export function tempMaterialPath(amount,handling=0){
 const a=T.MathUtils.clamp(amount,0,3),stock=TEMP_REFERENCE.stockMM,{C,D,prefix,tail,radius,shift}=template(a,handling),minimum=prefix.length+tail.length+radius*Math.PI,extent=(stock-minimum)/2;if(extent<0)throw Error('TEMP reference minimum path exceeds260mm: '+a+' handling'+handling+' '+minimum);
 const A=C.clone().add(new T.Vector3(0,-extent,0)),B=D.clone().add(new T.Vector3(0,-extent,0)),centre=A.clone().add(new T.Vector3(-radius,0,0)),pieces=[...prefix.pieces];if(extent>1e-9)pieces.push(new Line(C,A));pieces.push(new Arc(centre,A,B,new T.Vector3(0,0,-1)));if(extent>1e-9)pieces.push(new Line(B,D));pieces.push(...tail.pieces);const path=pathOf(pieces);return {...path,at:s=>path.at(s).add(shift),amount:a,handling,extent,materialLengthMM:stock,stockErrorMM:path.length-stock,head:tempHead(a).add(shift),bodyOffset:tempBodyOffset(a)};
}
