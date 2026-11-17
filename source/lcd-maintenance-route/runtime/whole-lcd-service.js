import {ServiceConnection49} from './service-connection49.js';
import {sourceExitNeck48} from './source-exit48.js';
import {Biarc44} from './biarc44.js';
import * as T from 'three';
import {mainSourcePose} from './lcd-source-motion.js';
import {FreeMaterialBank} from './xbuddy-complete-material.js';
import {roundedCablePath,roundedLength} from './lcd-cable-motion.js';
import {baseRibbonProfile,LCD_RIBBON_REFERENCE} from './lcd-ribbon.js';
const V=p=>new T.Vector3(...p),S=T.MathUtils.smoothstep,STOCK=858.7665480736183,N=544,ACROSS=34,RING=68;
const LOCAL=[[94,35,-24],[96,39.6,-18],LCD_RIBBON_REFERENCE];
// Four fixed material hinge zones. Each keeps length pi*.5 mm while
// its radius is length/beta. Straight arms never change material length.
// Across-mesh stations include all hinge endpoints and 45-degree samples
// at full fold; no coarse104-degree hinge facets or collapsed flat cells.
function concertina(beta){
 const L=Math.PI*.5,A=(30-4*L)/5,armIntervals=[4,3,3,3,4],rows=[];
 const sinc=x=>x===0?1:Math.sin(x)/x;
 let u=0,w=0,phi=0;
 rows.push({u,w,phi});
 for(let k=0;k<5;k++){
  const su=u,sw=w;
  for(let j=1;j<=armIntervals[k];j++){const d=A*j/armIntervals[k];rows.push({u:su+d*Math.cos(phi),w:sw+d*Math.sin(phi),phi});}
  u=rows.at(-1).u;w=rows.at(-1).w;
  if(k<4){const turn=(k%2?1:-1)*beta,au=u,aw=w,ap=phi;
   for(let j=1;j<=4;j++){const d=L*j/4,delta=turn*j/4,m=ap+delta/2;rows.push({u:au+d*sinc(delta/2)*Math.cos(m),w:aw+d*sinc(delta/2)*Math.sin(m),phi:ap+delta});}
   u=rows.at(-1).u;w=rows.at(-1).w;phi+=turn;
  }
 }
 if(rows.length!==34)throw Error('Complete original34 across stations required');
 const cu=(Math.min(...rows.map(p=>p.u))+Math.max(...rows.map(p=>p.u)))/2,cw=(Math.min(...rows.map(p=>p.w))+Math.max(...rows.map(p=>p.w)))/2;
 return rows.map(p=>({...p,u:p.u-cu,w:p.w-cw}));
}
// Peel a30mm material window along the same nominal four-crease template.
// Crease radius.5 and gauge.8 never change. The window neutral coordinate15
// stays on the actual centreline. This changes authored crease registration,
// not stock, skin thickness, faces, source caps or the procedure clock.
const MATERIAL_GRID=[0],TEMPLATE=[],HINGE_LENGTH=Math.PI*.5,ARM=(30-4*HINGE_LENGTH)/5;
let material=0,pu=0,pw=0,pphi=0;
for(let k=0;k<5;k++){
 const count=[4,3,3,3,4][k];TEMPLATE.push({start:material,length:ARM,u:pu,w:pw,phi:pphi,turn:0});for(let j=1;j<=count;j++)MATERIAL_GRID.push(material+ARM*j/count);material+=ARM;pu+=ARM*Math.cos(pphi);pw+=ARM*Math.sin(pphi);
 if(k<4){const turn=(k%2?1:-1)*Math.PI;TEMPLATE.push({start:material,length:HINGE_LENGTH,u:pu,w:pw,phi:pphi,turn});for(let j=1;j<=4;j++)MATERIAL_GRID.push(material+HINGE_LENGTH*j/4);const z=turn/2,l=HINGE_LENGTH*Math.sin(z)/z;pu+=l*Math.cos(pphi+z);pw+=l*Math.sin(pphi+z);pphi+=turn;material+=HINGE_LENGTH;}
}
const TEMPLATE_END={u:pu,w:pw},CDF_SLOPES=MATERIAL_GRID.map((u,i)=>{if(i===0||i===33)return 4/ARM;const h0=u-MATERIAL_GRID[i-1],h1=MATERIAL_GRID[i+1]-u,d0=1/h0,d1=1/h1;return 3*(h0+h1)/((2*h1+h0)/d0+(h1+2*h0)/d1);});
function samplingCDF(v){const cycle=Math.floor(v/30),x=v-cycle*30;let lo=0,hi=33;while(hi-lo>1){const m=(lo+hi)>>1;if(MATERIAL_GRID[m]<=x)lo=m;else hi=m;}const h=MATERIAL_GRID[hi]-MATERIAL_GRID[lo],t=(x-MATERIAL_GRID[lo])/h,t2=t*t,t3=t2*t;return cycle*33+(2*t3-3*t2+1)*lo+(t3-2*t2+t)*h*CDF_SLOPES[lo]+(-2*t3+3*t2)*hi+(t3-t2)*h*CDF_SLOPES[hi];}
function samplingInverse(y){const cycle=Math.floor(y/33),q=y-cycle*33,k=Math.floor(q);if(q===k)return cycle*30+MATERIAL_GRID[k];let lo=MATERIAL_GRID[k],hi=MATERIAL_GRID[k+1];for(let n=0;n<38;n++){const m=(lo+hi)/2;if(samplingCDF(m)<q)lo=m;else hi=m;}return cycle*30+(lo+hi)/2;}
function templatePoint(v){
 if(v>=30)return{u:TEMPLATE_END.u+v-30,w:TEMPLATE_END.w,phi:0};
 const seg=TEMPLATE.find(s=>v<=s.start+s.length)||TEMPLATE.at(-1),d=v-seg.start;if(seg.turn===0)return{u:seg.u+d*Math.cos(seg.phi),w:seg.w+d*Math.sin(seg.phi),phi:seg.phi};
 const delta=seg.turn*d/seg.length,z=delta/2,l=d*(z===0?1:Math.sin(z)/z);return{u:seg.u+l*Math.cos(seg.phi+z),w:seg.w+l*Math.sin(seg.phi+z),phi:seg.phi+delta};
}
function peelProfile(open){
 // Exact mathematical endpoint evaluations of this same material chart.
 if(open<=0)return concertina(Math.PI);if(open>=1)return concertina(0);
 const shift=30*open,c=templatePoint(shift+15),f=samplingCDF(shift),rows=[];
 for(let j=0;j<34;j++){const u=j===0?0:j===33?30:samplingInverse(f+j)-shift,p=templatePoint(shift+u);rows.push({u:p.u-c.u,w:p.w-c.w,phi:p.phi,materialMM:u});}
 return rows;
}
class ArcBend extends T.Curve{
 constructor(start,tangent,normal,radius,angle=Math.PI/2){super();this.start=start.clone();this.tangent=tangent.clone();this.normal=normal.clone();this.radius=radius;this.angle=angle;this.arcLengthDivisions=128;}
 getPoint(t,out=new T.Vector3()){const a=t*this.angle;return out.copy(this.start).addScaledVector(this.tangent,this.radius*Math.sin(a)).addScaledVector(this.normal,this.radius*(1-Math.cos(a)));}
 getTangent(t,out=new T.Vector3()){const a=t*this.angle;return out.copy(this.tangent).multiplyScalar(Math.cos(a)).addScaledVector(this.normal,Math.sin(a));}
 getLength(){return this.radius*this.angle;}
}
// C2 geometric skirt, independent of the source procedure clock.
// X moves only after clearing the FE vertical lead. Both endpoint
// derivatives are vertical; the material never traverses a sharp corner.
class FloorSkirt extends T.Curve{
 constructor(){super();this.arcLengthDivisions=1024;const x=[-.906179845938664,-.538469310105683,0,.538469310105683,.906179845938664],w=[.236926885056189,.478628670499366,.568888888888889,.478628670499366,.236926885056189];let L=0;for(let i=0;i<128;i++)for(let k=0;k<5;k++)L+=w[k]*this.derivative((i+(x[k]+1)/2)/128).length()/256;this.L=L;}
 f(x){const u=Math.max(0,Math.min(1,x));return u*u*u*(10+u*(-15+6*u));}
 df(x){const u=Math.max(0,Math.min(1,x));return 30*u*u*(1-u)*(1-u);}
 getPoint(t,out=new T.Vector3()){const z=11-12*t;return out.set(-132-2*this.f((7.5-z)/8),176-3*this.f(t),z);}
 derivative(t,out=new T.Vector3()){const z=11-12*t;return out.set(-3*this.df((7.5-z)/8),-3*this.df(t),-12);}
 getTangent(t,out=new T.Vector3()){return this.derivative(t,out).normalize();}
 getLength(){return this.L;}
}
// C1 regular quintic bank; analytic bank curvature vanishes at its endpoints with zero endpoint derivatives on its degree6 bight.
// Source-mating collar remains fixed; no C2 claim is made.
// Common geometric endpoint rule, not per-clock fitted vertices.
const BXN=1/(.7**7*.3**3);
class RegularFrontBank extends T.Curve{
 constructor(start,U,end,W){super();this.blend=S(end.z-start.z,-33,-14);const free=[3.131591356452711, 7.674579748027147, 3.1247806427328215, -11.743982181999, -10.100161566804758],connected=[2.3, 14.052470221245892, 2.5440187244410395, -18, -10],p=free.map((v,i)=>v+(connected[i]-v)*this.blend);this.h=p[0];this.hEnd=p[1];this.B=V(p.slice(2));this.a=this.B.length();this.D=this.B.clone().divideScalar(this.a);this.P=[start.clone(),start.clone().addScaledVector(U,this.h),start.clone().addScaledVector(U,2*this.h),end.clone().addScaledVector(W,-2*this.hEnd),end.clone().addScaledVector(W,-this.hEnd),end.clone()];this.arcLengthDivisions=2048;
 const x=[-.906179845938664,-.538469310105683,0,.538469310105683,.906179845938664],w=[.236926885056189,.478628670499366,.568888888888889,.478628670499366,.236926885056189];let L=0;for(let i=0;i<128;i++)for(let k=0;k<5;k++)L+=w[k]*this.derivative((i+(x[k]+1)/2)/128).length()/256;this.L=L;this.measuredMM=L;this.minimumMM=null;this.stockMM=null;this.minimumRadiusMM=Infinity;this.minimumSpeed=Infinity;
 for(let i=0;i<=512;i++){const v=this.derivative(i/512),a=this.secondDerivative(i/512),speed=v.length(),cross=v.clone().cross(a).length();this.minimumSpeed=Math.min(this.minimumSpeed,speed);if(cross>0)this.minimumRadiusMM=Math.min(this.minimumRadiusMM,speed**3/cross);}this.updateArcLengths();
 }
 getPoint(t,out=new T.Vector3()){const u=1-t,c=[1,5,10,10,5,1];out.set(0,0,0);for(let i=0;i<6;i++)out.addScaledVector(this.P[i],c[i]*u**(5-i)*t**i);out.addScaledVector(this.B,64*(t*u)**3);out.x+=this.B.x*(BXN*t**7*u**3-64*(t*u)**3);return out;}
 derivative(t,out=new T.Vector3()){const u=1-t,c=[1,4,6,4,1];out.set(0,0,0);for(let i=0;i<5;i++)out.addScaledVector(this.P[i+1].clone().sub(this.P[i]),5*c[i]*u**(4-i)*t**i);out.addScaledVector(this.B,192*t*t*u*u*(1-2*t));out.x+=this.B.x*(BXN*t**6*u**2*(7-10*t)-192*t*t*u*u*(1-2*t));return out;}
 secondDerivative(t,out=new T.Vector3()){const u=1-t,c=[1,3,3,1];out.set(0,0,0);for(let i=0;i<4;i++)out.addScaledVector(this.P[i+2].clone().addScaledVector(this.P[i+1],-2).add(this.P[i]),20*c[i]*u**(3-i)*t**i);const f=384*t-2304*t*t+3840*t**3-1920*t**4;out.addScaledVector(this.B,f);out.x+=this.B.x*(BXN*(42*t**5*u**3-42*t**6*u**2+6*t**7*u)-f);return out;}
 getTangent(t,out=new T.Vector3()){return this.derivative(t,out).normalize();}
 getLength(){return this.L;}
}
// Reference chart from the frozen actual595 source frame; endpoints are
// always supplied by the current native producer, never posed by this helper.
const LCD_REST_Q=new T.Quaternion().setFromRotationMatrix(new T.Matrix4().fromArray([1.0000000418041666, 5.596637954237387e-08, -1.0064602857188628e-07, 0, 3.1593283013834455e-08, 0.7071067917538862, 0.7071068022124922, 0, 1.1074169556190509e-07, -0.707106815975864, 0.7071068055172529, 0, -0.07057700577201083, -0.2555604772432899, -0.05589151330396726, 1])).normalize();
class OutletCurve extends T.Curve{
 constructor(inner,origin,rotation){super();this.inner=inner;this.origin=origin.clone();this.rotation=rotation.clone();for(const k of['L','a','h','hEnd','B','D','blend','measuredMM','minimumMM','stockMM','minimumRadiusMM','minimumSpeed'])this[k]=inner[k];this.arcLengthDivisions=2048;this.updateArcLengths();}
 getPoint(t,out=new T.Vector3()){return this.inner.getPoint(t,out).applyQuaternion(this.rotation).add(this.origin);}
 derivative(t,out=new T.Vector3()){return this.inner.derivative(t,out).applyQuaternion(this.rotation);}
 secondDerivative(t,out=new T.Vector3()){return this.inner.secondDerivative(t,out).applyQuaternion(this.rotation);}
 getTangent(t,out=new T.Vector3()){return this.inner.getTangent(t,out).applyQuaternion(this.rotation);}
 getLength(){return this.L;}
}

class QuinticApproach extends T.Curve{
 constructor(start,U,end,W,h=10,hEnd=h){super();this.P=[start.clone(),start.clone().addScaledVector(U,h),start.clone().addScaledVector(U,2*h),end.clone().addScaledVector(W,-2*hEnd),end.clone().addScaledVector(W,-hEnd),end.clone()];this.arcLengthDivisions=1024;const x=[-.906179845938664,-.538469310105683,0,.538469310105683,.906179845938664],w=[.236926885056189,.478628670499366,.568888888888889,.478628670499366,.236926885056189];let L=0;for(let i=0;i<64;i++)for(let k=0;k<5;k++)L+=w[k]*this.derivative((i+(x[k]+1)/2)/64).length()/128;this.L=L;}
 getPoint(t,out=new T.Vector3()){const u=1-t,c=[1,5,10,10,5,1];out.set(0,0,0);for(let i=0;i<6;i++)out.addScaledVector(this.P[i],c[i]*u**(5-i)*t**i);return out;}
 derivative(t,out=new T.Vector3()){const u=1-t,c=[1,4,6,4,1];out.set(0,0,0);for(let i=0;i<5;i++)out.addScaledVector(this.P[i+1].clone().sub(this.P[i]),5*c[i]*u**(4-i)*t**i);return out;}
 getTangent(t,out=new T.Vector3()){return this.derivative(t,out).normalize();}
 getLength(){return this.L;}
}

class ReferenceMaterialBank extends T.Curve{
 constructor(start,U,end,W,morph){super();const c=[2.300691111200159,14.047169743426798,2.5445013786476314,-17.99480080697224,-10.000083241342166],open=S(morph,0,.7),shorten=S(morph,.7,1),handle=4-3.2*shorten,f=[handle,handle,0,0,0],p=c.map((v,i)=>v+(f[i]-v)*open);this.blend=1-morph;this.h=p[0];this.hEnd=p[1];this.B=V(p.slice(2));this.a=this.B.length();this.D=this.a===0?V([0,0,0]):this.B.clone().divideScalar(this.a);this.P=[start.clone(),start.clone().addScaledVector(U,this.h),start.clone().addScaledVector(U,2*this.h),end.clone().addScaledVector(W,-2*this.hEnd),end.clone().addScaledVector(W,-this.hEnd),end.clone()];this.arcLengthDivisions=2048;const x=[-.906179845938664,-.538469310105683,0,.538469310105683,.906179845938664],w=[.236926885056189,.478628670499366,.568888888888889,.478628670499366,.236926885056189];let L=0;for(let i=0;i<128;i++)for(let k=0;k<5;k++)L+=w[k]*this.derivative((i+(x[k]+1)/2)/128).length()/256;this.L=this.measuredMM=L;this.minimumRadiusMM=Infinity;this.minimumSpeed=Infinity;for(let i=0;i<=512;i++){const v=this.derivative(i/512),a=this.secondDerivative(i/512),speed=v.length(),cross=v.clone().cross(a).length();this.minimumSpeed=Math.min(this.minimumSpeed,speed);if(cross>0)this.minimumRadiusMM=Math.min(this.minimumRadiusMM,speed**3/cross);}this.updateArcLengths();}
 getPoint(t,out=new T.Vector3()){const u=1-t,c=[1,5,10,10,5,1];out.set(0,0,0);for(let i=0;i<6;i++)out.addScaledVector(this.P[i],c[i]*u**(5-i)*t**i);out.addScaledVector(this.B,64*(t*u)**3);out.x+=this.B.x*(BXN*t**7*u**3-64*(t*u)**3);return out;}
 derivative(t,out=new T.Vector3()){const u=1-t,c=[1,4,6,4,1];out.set(0,0,0);for(let i=0;i<5;i++)out.addScaledVector(this.P[i+1].clone().sub(this.P[i]),5*c[i]*u**(4-i)*t**i);out.addScaledVector(this.B,192*t*t*u*u*(1-2*t));out.x+=this.B.x*(BXN*t**6*u**2*(7-10*t)-192*t*t*u*u*(1-2*t));return out;}
 secondDerivative(t,out=new T.Vector3()){const u=1-t,c=[1,3,3,1];out.set(0,0,0);for(let i=0;i<4;i++)out.addScaledVector(this.P[i+2].clone().addScaledVector(this.P[i+1],-2).add(this.P[i]),20*c[i]*u**(3-i)*t**i);const f=384*t-2304*t*t+3840*t**3-1920*t**4;out.addScaledVector(this.B,f);out.x+=this.B.x*(BXN*(42*t**5*u**3-42*t**6*u**2+6*t**7*u)-f);return out;}
 getTangent(t,out=new T.Vector3()){return this.derivative(t,out).normalize();}getLength(){return this.L;}
}
// Integrate a regular unit-tangent homotopy, rather than collapsing control
// points. At every release value the reference speed remains positive. The
// bank first opens at its actual reference material length, then feeds stock
// into the lower service loop only after it has become a straight span.
class CircularHandleApproach extends T.Curve{
 constructor(P,U,G,W,h){super();this.P=[P.clone(),P.clone().addScaledVector(U,h),G.clone().addScaledVector(W,-h),G.clone()];this.arcLengthDivisions=1024;const x=[-.906179845938664,-.538469310105683,0,.538469310105683,.906179845938664],w=[.236926885056189,.478628670499366,.568888888888889,.478628670499366,.236926885056189];let L=0;for(let i=0;i<64;i++)for(let k=0;k<5;k++)L+=w[k]*this.derivative((i+(x[k]+1)/2)/64).length()/128;this.L=L;}
 getPoint(t,o=new T.Vector3()){const u=1-t;return o.copy(this.P[0]).multiplyScalar(u**3).addScaledVector(this.P[1],3*u*u*t).addScaledVector(this.P[2],3*u*t*t).addScaledVector(this.P[3],t**3);}
 derivative(t,o=new T.Vector3()){const u=1-t;return o.copy(this.P[1]).sub(this.P[0]).multiplyScalar(3*u*u).addScaledVector(this.P[2].clone().sub(this.P[1]),6*u*t).addScaledVector(this.P[3].clone().sub(this.P[2]),3*t*t);}
 getTangent(t,o=new T.Vector3()){return this.derivative(t,o).normalize();}getLength(){return this.L;}
}
// One regular constant-curvature bank, continued from a left-hand U to
// the actual straight outlet. Its material comes from the same whole858.7665
// stock solve;24mm is an authored allocation, not a shorter cable.
class SourceMaterialBank extends T.Curve{
 constructor(start,U,end,W,morph){super();this.end=end.clone();this.W=W.clone().normalize();this.open=morph;this.angle=2*Math.PI/3*(1-this.open);this.L=this.measuredMM=14*(1-this.open)+.5*this.open;const width=V([0,1,0]).applyQuaternion(LCD_REST_Q);this.normal=this.W.clone().cross(width).normalize();if(this.normal.lengthSq()===0)throw Error('Source bank frame is not regular');this.minimumRadiusMM=this.angle===0?Infinity:this.L/this.angle;this.minimumSpeed=this.L;this.a=0;this.h=this.hEnd=null;this.B=V([0,0,0]);this.D=V([0,0,0]);this.blend=1-morph;this.arcLengthDivisions=256;}
 sinc(a){return a===0?1:Math.sin(a)/a;}cosc(a){return a===0?0:2*Math.sin(a/2)**2/a;}
 getPoint(t,out=new T.Vector3()){const u=1-t,a=this.angle*u;return out.copy(this.end).addScaledVector(this.W,-this.L*u*this.sinc(a)).addScaledVector(this.normal,this.L*u*this.cosc(a));}
 getTangent(t,out=new T.Vector3()){const a=this.angle*(1-t);return out.copy(this.W).multiplyScalar(Math.cos(a)).addScaledVector(this.normal,-Math.sin(a));}
 derivative(t,out=new T.Vector3()){return this.getTangent(t,out).multiplyScalar(this.L);}
 secondDerivative(t,out=new T.Vector3()){const a=this.angle*(1-t);return out.copy(this.W).multiplyScalar(Math.sin(a)).addScaledVector(this.normal,Math.cos(a)).multiplyScalar(this.L*this.angle);}
 getPointAt(t,out){return this.getPoint(t,out);}getTangentAt(t,out){return this.getTangent(t,out);}getLength(){return this.L;}
}
class UnbendingTurn extends T.Curve{
 constructor(end,Tend,axis,length,angle){super();this.L=length;this.angle=angle;this.tangent=Tend.clone().applyAxisAngle(axis,-angle);this.normal=axis.clone().cross(this.tangent).normalize();this.start=end.clone().addScaledVector(this.tangent,-length*this.sinc(angle)).addScaledVector(this.normal,-length*this.cosc(angle));this.arcLengthDivisions=128;}
 sinc(x){return x===0?1:Math.sin(x)/x;}cosc(x){return x===0?0:2*Math.sin(x/2)**2/x;}
 getPoint(t,out=new T.Vector3()){const a=this.angle*t;return out.copy(this.start).addScaledVector(this.tangent,this.L*t*this.sinc(a)).addScaledVector(this.normal,this.L*t*this.cosc(a));}
 getTangent(t,out=new T.Vector3()){const a=this.angle*t;return out.copy(this.tangent).multiplyScalar(Math.cos(a)).addScaledVector(this.normal,Math.sin(a));}
 getPointAt(t,out){return this.getPoint(t,out);}getTangentAt(t,out){return this.getTangent(t,out);}getLength(){return this.L;}
}

export class WholeLcdService{
 constructor(viewer,native){
  this.v=viewer;this.native=native;this.normalRoute=null;
  // Existing photo-registered nominal header; no manufacturer fit claim.
  const lo=V([-136.83073,165.45172,103.63292]).multiplyScalar(.001),hi=V([-131.04257,171.95172,138.32628]).multiplyScalar(.001),points=[];
  for(const m of viewer.meshes.filter(m=>m.userData.electronicsSource?.key==='xBuddy'||m.userData.part==='xBuddy')){const g=m.geometry,p=g?.attributes.position,ix=g?.index;if(!p)continue;const M=new T.Matrix4().compose(m.userData.restPosition||m.position,m.userData.restQuaternion||m.quaternion,m.scale);for(let f=0;f<(ix?.count||p.count)/3;f++){const a=[0,1,2].map(k=>new T.Vector3().fromBufferAttribute(p,ix?ix.getX(f*3+k):f*3+k).applyMatrix4(M));if(a.every(p=>p.x>=lo.x-1e-7&&p.x<=hi.x+1e-7&&p.y>=lo.y-1e-7&&p.y<=hi.y+1e-7&&p.z>=lo.z-1e-7&&p.z<=hi.z+1e-7))points.push(...a);}}
  if(points.length<12)throw Error('Actual complete xLCD header frame missing');
  const b=new T.Box3().setFromPoints(points);this.root=b.getCenter(new T.Vector3()).multiplyScalar(1000);this.root.y=b.max.y*1000;
  this.frameQualification={kind:'Source171 photo-registered complete xLCD header back plane',sourceVertices:points.length,boundsMM:[b.min.clone().multiplyScalar(1000).toArray(),b.max.clone().multiplyScalar(1000).toArray()],rootMM:this.root.toArray(),axis:[0,1,0],widthAxis:[0,0,1],manufacturerMatingFit:false};
  if(native.geometry.attributes.position.count!==(N+1)*RING)throw Error('Complete original LCD skin topology required');
 }
 restore(){if(!this.normalRoute)return;Object.assign(this.native,this.normalRoute);this.native.poseKey='';this.normalRoute=null;this.key=null;delete this.native.mesh.userData.wholeLcdMaterial;}
 follow(matrix,amount,loose,release,freeFrame,source){
  if(!this.normalRoute)this.normalRoute={route:this.native.route,tail:this.native.tail,attachmentReference:this.native.attachmentReference};
  const key=[...matrix.elements,amount,...loose,release,...freeFrame.elements].join(':');this.key=key; // Native producer ran first: always regenerate the final whole material skin.
  if(!source)throw Error('Current official LCD source context required');
  const root=this.root,reference=V(LCD_RIBBON_REFERENCE).applyMatrix4(matrix),pose=mainSourcePose(matrix,amount,release,freeFrame,source),end=pose.end,rotation=pose.rotation,contact=LOCAL.map(p=>V(p).sub(V(LCD_RIBBON_REFERENCE)).applyQuaternion(rotation).add(end));
  // One common positive-side material bank takes all remaining stock.
  // The base route has no secondary sinusoidal slack wave.
  const endT=end.clone().sub(contact[1]).normalize(),collarMM=end.distanceTo(contact[1]),A=contact[1].clone();
  // Bound the current complete original terminal skin, using its actual
  // endpoint frame and the same material chart used below. These measured bounds remain diagnostic; the common inlet uses the
  // source-relative corridor between native614 and earthR. No old mesh is reused.
  const capAxis=V([0,1,0]).applyQuaternion(rotation);capAxis.addScaledVector(endT,-capAxis.dot(endT)).normalize();const capNormal=endT.clone().cross(capAxis).normalize();let capMinX=Infinity,capMaxX=-Infinity;
  for(let k=0;k<=148;k++){const d=Math.min(collarMM,k/16),open=1-S(d,.5,collarMM),profile=open>0?peelProfile(open):concertina(Math.PI);for(const p of profile)for(const sign of[-1,1]){const u=p.u+sign*Math.sin(p.phi)*.4,w=p.w-sign*Math.cos(p.phi)*.4,x=end.x-endT.x*d+capAxis.x*u+capNormal.x*w;capMinX=Math.min(capMinX,x);capMaxX=Math.max(capMaxX,x);}}
  const materialFree=pose.freeMaterial,bankOpen=pose.straightTurn,bankStraightLength=20-16*S(materialFree,.7,1),materialUnfold=pose.materialUnfold,outletQ=rotation.clone().normalize().multiply(LCD_REST_Q.clone().invert()),outletInv=outletQ.clone().invert(),Wlocal=endT.clone().applyQuaternion(outletInv),oldU=V([0,-.5,-Math.sqrt(3)/2]),Ulocal=oldU.clone().applyQuaternion(new T.Quaternion().slerp(new T.Quaternion().setFromUnitVectors(oldU,Wlocal),bankOpen)),Slocal=V([2.8,6-5*Math.sin(Math.PI/3),16.8180157298506-2.5]).multiplyScalar(1-bankOpen).addScaledVector(Wlocal,-bankStraightLength*bankOpen),outletHeight=Slocal.z+2.5;
  // Complete common route: enter the front chamber above the main
  // harness branch, turn behind the FE return below the cover bottom,
  // and pass forward between its lower wire and actual crimp endpoint.
  const rootOutlet=new T.LineCurve3(root.clone(),root.clone().add(V([0,8,0]))),rootRight=new ArcBend(rootOutlet.v2,V([0,1,0]),V([1,0,0]),5),rootSide=new T.LineCurve3(rootRight.getPoint(1),V([-124,root.y+13,root.z])),rootDown=new ArcBend(rootSide.v2,V([1,0,0]),V([0,0,-1]),6),up=[rootDown.getPoint(1).toArray(),[-118,root.y+13,108],[-118,174.5,102],[-134,174.5,94],[-132,174.5,50],[-132,174.5,48]],upperHead=roundedCablePath(up.map(V),.48),back1=new ArcBend(V(up.at(-1)),V([0,0,-1]),V([0,1,0]),4),backLine=new T.LineCurve3(back1.getPoint(1),V([-132,181,44])),back2=new ArcBend(backLine.v2,V([0,1,0]),V([0,0,-1]),4),midLine=new T.LineCurve3(back2.getPoint(1),V([-132,185,19])),forward1=new ArcBend(midLine.v2,V([0,0,-1]),V([0,-1,0]),4),forwardLine=new T.LineCurve3(forward1.getPoint(1),V([-132,180,15])),forward2=new ArcBend(forwardLine.v2,V([0,-1,0]),V([0,0,-1]),4),floorSkirt=new FloorSkirt(),lowerStraight=new T.LineCurve3(floorSkirt.getPoint(1),V([-134,173,-2.8])),upperExtensions=[back1,backLine,back2,midLine,forward1,forwardLine,forward2,floorSkirt,lowerStraight],upper=new T.CurvePath();[rootOutlet,rootRight,rootSide,rootDown,...upperHead.curves,...upperExtensions].forEach(c=>upper.add(c));
  const arc1=new ArcBend(lowerStraight.v2,V([0,0,-1]),V([0,1,0]),3),arc2=new ArcBend(arc1.getPoint(1),V([0,1,0]),V([0,0,-1]),3),arc3Start=V([-134,179,-10]),arc3=new ArcBend(arc3Start,V([0,0,-1]),V([-1,0,0]),5),link=new T.LineCurve3(arc2.getPoint(1),arc3Start),outletNeckMM=sourceExitNeck48(pose.axialWithdrawalMM,pose.straightTurn),neckStart=A.clone().addScaledVector(endT,-outletNeckMM),bank=new OutletCurve(new SourceMaterialBank(Slocal,Ulocal,V([0,0,0]),Wlocal,pose.straightTurn),neckStart,outletQ);
  // The entire outlet bank and its preceding turn share the real cap
  // width/binormal. No camera/aperture-driven yaw or axis interpolation can
  // flip the plane during payout. The cap and material use the same frame.
  const bankSteer=0,bankT=bank.getTangent(0),turnAxis=V([0,1,0]).applyQuaternion(rotation).negate();turnAxis.addScaledVector(bankT,-turnAxis.dot(bankT)).normalize();
  const uncoilTurn=4*bankOpen*(1-bankOpen);
  const frontDrop=new UnbendingTurn(bank.getPoint(0),bankT,turnAxis,7*Math.PI/3,(1-pose.straightTurn)*Math.PI/6),G=frontDrop.getPoint(0),inletT=frontDrop.getTangent(0),freeTailMM=collarMM+.5+frontDrop.getLength(),leadMM=6+(freeTailMM+6+4-6)*pose.straightTurn;
  let guide,guideT,guideTail,incoming=null;
  if(pose.mode==='outside'){
   const P=pose.aperture.clone(),raw=G.clone().sub(P),advance=Math.min(6*S(Math.abs(raw.z)/(-raw.y),1,3),Math.max(0,-raw.y/2));P.y-=advance;
   // A real straight aperture collar remains normal to the sheet. All four
   // inner Bezier controls stay outside the actual aperture plane; a tight
   // cap turn cannot pull the incoming curve back through native6/634.
   const d=G.distanceTo(P),gap=P.y-G.y;if(!(gap>0))throw Error('Source outlet did not clear the actual aperture plane');
   guideT=pose.gateT.clone();guide=P.clone().addScaledVector(guideT,-leadMM);
   const h=.2*d,hEnd=Math.min(h,6,inletT.y<0?.4*gap/(-inletT.y):Infinity),flex=new QuinticApproach(P,guideT,G,inletT,h,hEnd);incoming=flex;guideTail=[new T.LineCurve3(guide,P),flex];
  }
  else if(pose.mode==='axial'){guideT=pose.gateT.clone();guide=pose.aperture.clone().addScaledVector(guideT,-leadMM);guideTail=[new T.LineCurve3(guide,G)];}
  else{guideT=endT.clone();guide=G.clone().addScaledVector(guideT,-4);guideTail=[new T.LineCurve3(guide,G)];}
  const guideTailMM=guideTail.reduce((n,c)=>n+c.getLength(),0);
  const F=V([guide.x-45,guide.y+20,-8-16*release]);
  const lowPoints=amplitude=>{const turnY=-133+7*S(materialFree,0,.125),splitY=turnY-7,ps=[arc3.getPoint(1).toArray(),[-160,179,-15],[-168,151,-15],[-168,140,-5.8],[-178.8,134,-5.8],[-178.8,turnY,-5.8],[-160,turnY,-5.8],[-150,splitY,-8-16*release]];for(let station=1;station<=9;station++){const x=-150+(F.x+150)*station/9;ps.push([x,splitY+(F.y-splitY)*(x+150)/(F.x+150)+amplitude*Math.sin(Math.PI*(x+150)/(F.x+150))**2,(-8-16*release)+(F.z+8+16*release)*S(station/9,0,1)]);}return ps;};
  const approachAt=amplitude=>{const p=lowPoints(amplitude),U=V(p.at(-1)).sub(V(p.at(-2))).normalize();return new ServiceConnection49({startMM:F,startTangent:U,endMM:guide,endTangent:guideT,ratio:2});};
  const fixedMM=rootOutlet.getLength()+rootRight.getLength()+rootSide.getLength()+rootDown.getLength()+roundedLength(up,8,.48)+upperExtensions.reduce((n,c)=>n+c.getLength(),0)+arc1.getLength()+arc2.getLength()+link.getLength()+arc3.getLength()+guideTailMM+frontDrop.getLength()+bank.measuredMM+outletNeckMM+collarMM,totalAt=amplitude=>fixedMM+roundedLength(lowPoints(amplitude),8,.48)+approachAt(amplitude).getLength(),minimum=totalAt(0);
  if(minimum>STOCK+1e-6)throw Error('Whole LCD42N coupled stocks infeasible '+JSON.stringify({stock:STOCK,minimum,front:bank.measuredMM,end:end.toArray(),G:G.toArray(),inletT:inletT.toArray(),guide:guide.toArray(),guideT:guideT.toArray(),fixedMM,guideTailMM,lowMinimumMM:roundedLength(lowPoints(0),8,.48),approachMinimumMM:approachAt(0).getLength()}));
  let lo=0,hi=8;while(totalAt(hi)<STOCK&&hi<180)hi*=1.5;if(totalAt(hi)<STOCK)throw Error('Whole LCD42N base material root unbracketed');for(let k=0;k<34;k++){const mid=(lo+hi)/2;if(totalAt(mid)<STOCK)lo=mid;else hi=mid;}const baseAmplitude=(lo+hi)/2,low=lowPoints(baseAmplitude),lower=roundedCablePath(low.map(V),.48),approach=approachAt(baseAmplitude),prefix=new T.CurvePath();upper.curves.forEach(c=>prefix.add(c));[arc1,arc2,link,arc3].forEach(c=>prefix.add(c));lower.curves.forEach(c=>prefix.add(c));prefix.add(approach);guideTail.forEach(c=>prefix.add(c));prefix.add(frontDrop);prefix.curves.forEach(c=>c.arcLengthDivisions=128);
  const fixedPrefixMM=fixedMM-bank.measuredMM-outletNeckMM-collarMM+roundedLength(low,8,.48)+approach.getLength(),freeStock=bank.measuredMM,bankMinimum=null,curve=new T.CurvePath();prefix.curves.forEach(c=>curve.add(c));curve.add(bank);curve.add(new T.LineCurve3(neckStart,A));curve.add(new T.LineCurve3(A,end));curve.arcLengthDivisions=8192;
  const amplitude=bank.a,min=minimum,max=STOCK,length=fixedPrefixMM+bank.measuredMM+outletNeckMM+collarMM,sampled=curve.getLength(),prefixMM=prefix.getLength(),guideMaterialMM=prefixMM-frontDrop.getLength()-guideTailMM,guideDistanceMM=sampled-guideMaterialMM,outletDistanceMM=collarMM+outletNeckMM+bank.L+frontDrop.getLength(),unfurlFlatMM=.5+materialUnfold*(collarMM-.5),unfurlEndMM=collarMM+materialUnfold*(outletDistanceMM-collarMM);
  const pos=this.native.geometry.attributes.position,norm=this.native.geometry.attributes.normal,centres=[],tangents=[],stations=[],axes=[];
  // A material frame field independent of the545 display stations. Changing
  // their distribution cannot change the upstream floor or outlet frame.
  const frameGrid=4096,fineAxes=[],fineT=[],transportQ=new T.Quaternion();let transported=V([0,0,1]);
  for(let k=0;k<=frameGrid;k++){const t=curve.getTangent(k/frameGrid).normalize();if(k)transported.applyQuaternion(transportQ.setFromUnitVectors(fineT[k-1],t));transported.addScaledVector(t,-transported.dot(t)).normalize();fineT.push(t);fineAxes.push(transported.clone());}
  const frameAt=material=>{const z=T.MathUtils.clamp(material/sampled,0,1)*frameGrid,k=Math.min(frameGrid-1,Math.floor(z)),f=z-k,t=curve.getTangent(material/sampled).normalize(),a=fineAxes[k].clone().lerp(fineAxes[k+1],f);return a.addScaledVector(t,-a.dot(t)).normalize();};
  const impose=(materialMM,targetAxis,start,end,options={})=>{const t=curve.getTangent(materialMM/sampled).normalize(),a=frameAt(materialMM),b=targetAxis.clone().addScaledVector(t,-targetAxis.dot(t)).normalize();let theta=Math.atan2(t.dot(a.clone().cross(b)),a.dot(b));if(options.preferred!==undefined)theta+=2*Math.PI*Math.round((options.preferred-theta)/(2*Math.PI));theta*=options.strength??1;fineAxes.forEach((a,k)=>a.applyAxisAngle(fineT[k],theta*S(sampled*k/frameGrid,materialMM+start,materialMM+end)));return {materialMM,rollRadians:theta,preferredRollRadians:options.preferred??null};};
  const lowerLine=lowerStraight,marker=V([-134,173,-1]),lowerMM=upper.getLength()-lowerLine.getLength()+lowerLine.v1.distanceTo(marker);
  if(Math.abs(lowerLine.v1.distanceTo(marker)+marker.distanceTo(lowerLine.v2)-lowerLine.getLength())>1e-7)throw Error('Actual lower marker off its source straight');
  const upperAxisLine=upperHead.curves[6],upperAxisMarker=upperAxisLine.v1.clone().lerp(upperAxisLine.v2,.5),upperAxisMM=rootOutlet.getLength()+rootRight.getLength()+rootSide.getLength()+rootDown.getLength()+upperHead.curves.slice(0,6).reduce((n,c)=>n+c.getLength(),0)+upperAxisLine.v1.distanceTo(upperAxisMarker),upperRoll=impose(upperAxisMM,V([1,0,0]),-26,-6);
  const lowerRoll=impose(lowerMM,V([0,1,0]),-49,-29),floorRoll=impose(lowerMM,V([1,0,0]),-4,1),baseLine=lower.curves[8],baseMarker=V([-178.8,80,-5.8]);
  if(!baseLine?.isLineCurve3||Math.abs(baseLine.v1.distanceTo(baseMarker)+baseMarker.distanceTo(baseLine.v2)-baseLine.getLength())>1e-7)throw Error('Actual long base marker off its source span');
  const baseMM=upper.getLength()+arc1.getLength()+arc2.getLength()+link.getLength()+arc3.getLength()+lower.curves.slice(0,8).reduce((n,c)=>n+c.getLength(),0)+baseLine.v1.distanceTo(baseMarker),baseRoll=impose(baseMM,V([0,0,-1]),-100,-65),frontRoll=impose(guideMaterialMM,pose.mode==='inside'?V([0,1,0]).applyQuaternion(rotation):V([-1,0,0]).applyAxisAngle(pose.gateT,Math.PI/9*pose.straightTurn),-80,-20),sourceInletRoll=impose(prefixMM-frontDrop.getLength(),V([0,1,0]).applyQuaternion(rotation),-80,-30),bankRoll=impose(prefixMM+Math.min(15,bank.L*.3),V([0,1,0]).applyQuaternion(rotation),-Math.min(15,bank.L*.3),0);
  const bankExitRoll=impose(sampled-collarMM,new T.Vector3(0,1,0).applyQuaternion(rotation),-24,-4,{preferred:2.77*(1-materialFree)});
  const endTangent=curve.getTangent(1).normalize(),target=new T.Vector3(0,1,0).applyQuaternion(rotation).addScaledVector(endTangent,-new T.Vector3(0,1,0).applyQuaternion(rotation).dot(endTangent)).normalize(),last=frameAt(sampled),twist=Math.atan2(endTangent.dot(last.clone().cross(target)),last.dot(target));
  fineAxes.forEach((a,k)=>a.applyAxisAngle(fineT[k],twist*(1-S(sampled*(1-k/frameGrid),6.5,collarMM))));
  // Every roll and bend contributes to one common positive material density.
  // This selects exact analytic sections, never interpolated mesh vertices.
  const grid=4096,ds=(sampled-44)/grid,cumulative=new Float64Array(grid+1);let priorT=curve.getTangent(32/sampled).normalize(),priorA=frameAt(32),totalBend=0,totalRoll=0,totalPeel=0,priorPeel=1-S(sampled-32,unfurlFlatMM,unfurlEndMM);
  for(let k=1;k<=grid;k++){const material=32+k*ds,t=curve.getTangent(material/sampled).normalize(),a=frameAt(material),bend=Math.acos(T.MathUtils.clamp(priorT.dot(t),-1,1)),carried=priorA.clone().applyQuaternion(transportQ.setFromUnitVectors(priorT,t)),roll=Math.abs(Math.atan2(t.dot(carried.clone().cross(a)),carried.dot(a)));const peel=1-S(sampled-material,unfurlFlatMM,unfurlEndMM),peelAdvance=30*Math.abs(peel-priorPeel);cumulative[k]=cumulative[k-1]+.10*ds+80*bend+120*roll+120*peelAdvance;totalPeel+=peelAdvance;priorPeel=peel;totalBend+=bend;totalRoll+=roll;priorT=t;priorA=a;}
  for(let i=0;i<=N;i++){let s;if(i<=64)s=i/64*32;else if(i>=N-192)s=sampled-12+(i-(N-192))/192*12;else{const target=(i-64)/(N-256)*cumulative[grid];let lo=0,hi=grid;while(hi-lo>1){const mid=(lo+hi)>>1;if(cumulative[mid]<target)lo=mid;else hi=mid;}s=32+(lo+(target-cumulative[lo])/(cumulative[hi]-cumulative[lo]))*ds;}stations.push(s);centres.push(curve.getPoint(s/sampled));tangents.push(curve.getTangent(s/sampled).normalize());axes.push(frameAt(s));}
  let maximumPeelAdvanceMM=0,peelIntervals=0;for(let i=1;i<=N;i++){const delta=30*Math.abs(S(sampled-stations[i],unfurlFlatMM,unfurlEndMM)-S(sampled-stations[i-1],unfurlFlatMM,unfurlEndMM));if(delta>0)peelIntervals++;maximumPeelAdvanceMM=Math.max(maximumPeelAdvanceMM,delta);}
  for(let i=0;i<=N;i++){const s=stations[i],d=sampled-s,t=tangents[i],c=centres[i],a=axes[i],normal=new T.Vector3().crossVectors(t,a).normalize(),angle=Math.PI*S(s,0,6),terminalOpen=1-S(d,unfurlFlatMM,unfurlEndMM),profile=terminalOpen>0?peelProfile(terminalOpen):concertina(angle);for(let j=0;j<RING;j++){const r=profile[j<ACROSS?j:RING-1-j],side=j<ACROSS?-1:1,du=-Math.sin(r.phi)*side,dw=Math.cos(r.phi)*side,u=r.u+du*.4,w=r.w+dw*.4,k=i*RING+j;pos.setXYZ(k,(c.x+a.x*u+normal.x*w)*.001,(c.y+a.y*u+normal.y*w)*.001,(c.z+a.z*u+normal.z*w)*.001);const nn=a.clone().multiplyScalar(du).addScaledVector(normal,dw),across=j<ACROSS?j:RING-1-j;
    // Smooth the complete closed material boundary, including both edge
    // walls and caps. Keep every original face and index winding unchanged.
    if(across===0||across===ACROSS-1)nn.add(a.clone().multiplyScalar(Math.cos(r.phi)*(across===0?-1:1)).addScaledVector(normal,Math.sin(r.phi)*(across===0?-1:1)));
    if(i===0||i===N)nn.addScaledVector(t,i===0?-1:1);
    nn.normalize();norm.setXYZ(k,nn.x,nn.y,nn.z);}}
  pos.needsUpdate=norm.needsUpdate=true;this.native.geometry.computeBoundingBox();this.native.geometry.computeBoundingSphere();this.native.route=curve;this.native.tail=curve;this.native.attachmentReference=reference.multiplyScalar(.001);this.native.mesh.userData.routingLengthError=length-STOCK;this.native.mesh.userData.wholeLcdMaterial={stockMM:STOCK,widthMM:30,thicknessMM:.8,fullOriginalIndex:true,hingeMaterialCoordinatesFixed:false,neutralMaterialCoordinateMM:15,peelWindowWidthMM:30,templateHingeRadiiMM:.5,foldHandedness:-1};
  this.diagnostic={connections49:{incoming:incoming?{controlsMM:incoming.P.map(p=>p.toArray()),startT:incoming.getTangent(0).toArray(),endT:incoming.getTangent(1).toArray()}:null,approach:approach.spec49},clock49:{amount,release,frameStage:source.frameStage,lcdStage:source.lcdStage,axialWithdrawalMM:pose.axialWithdrawalMM,align:pose.straightTurn,freeMaterial:pose.freeMaterial,mode:pose.mode,operator:pose.operatorClock49},incoming:incoming?{kind:'quintic with zero endpoint curvature',ratio:incoming.ratio,minimumRadiusMM:incoming.minimumRadiusMM,joinTangentDot:incoming.joinTangentDot,lengthMM:incoming.L}:null,inletT:inletT.toArray(),Gmm:G.toArray(),guideMM:guide.toArray(),stationsMM:stations,centresMM:centres.map(p=>p.toArray()),axes:axes.map(p=>p.toArray()),tangents:tangents.map(p=>p.toArray()),sampledMM:sampled,prefixMM,guideMaterialMM,frontDropMM:frontDrop.getLength(),bankMM:bank.L,outletNeckMM,collarMM};this.receipt={bankSteerRadians:bankSteer,stockMM:STOCK,lengthMM:length,sampledLengthMM:sampled,amplitude,minLengthMM:min,maximumLengthMM:max,rootFrame:this.frameQualification,endMM:end.toArray(),fullFaces:this.native.geometry.index.count/3,fullVertices:pos.count,continuousSharedReleaseChart:true,sourceMotion:{stage:pose.stage,mode:pose.mode,materialFree,bankOpen,materialUnfold,straightTurn:pose.straightTurn,axialWithdrawalMM:pose.axialWithdrawalMM,apertureMM:pose.aperture.toArray(),guideMM:guide.toArray(),guideMaterialMM,unfurlFlatMM,unfurlEndMM},unfurl37:"30mm sliding material window; span normal bounded4.8mm; true neutral coordinate15",upperRoll,lowerRoll,floorRoll,baseRoll,frontRoll,sourceInletRoll,bankRoll,bankExitRoll,freeHandAxialYawRadians:Math.PI/2,frontLeftRadiiMM:[],constantMaterialTurnLengthMM:frontDrop.getLength(),turnAngleRadians:frontDrop.angle,directRegularBankAfterR5:true,actualCapRelativeGate:true,inletSectionWidthAxis:[0,0,-1],positiveOuterBankBight:true,outerBightXPower:[7,3],adaptiveSampling:{grid,frameGrid,positiveCDF:true,bendingWeight:80,rollWeight:120,peelAdvanceWeight:120,totalPeelAdvanceMM:totalPeel,maximumPeelAdvanceMM,peelIntervals,totalBendRadians:totalBend,totalRollRadians:totalRoll,frameIndependentOfDisplaySampling:true},leftChannelXMM:-178.8,leftChannelWideAxis:[0,0,-1],quinticZeroEndpointCurvature:false,approachContinuity49:"C1 analytic biarc; incoming remainsC2 quintic",gateFromActualCapEnvelope:false,gateOffsetXMM:2.8,sourceOutletCovariant:true,regularApproachLengthMM:approach.getLength(),regularApproachStart:F.toArray(),outletQuaternion:outletQ.toArray(),outletHeightMM:outletHeight,sourceRelativeNarrowCorridor:true,capFanBoundsXMM:[capMinX,capMaxX],inletHalfWidthXMM:2.4,inletFanGapMM:null,gateOffsetYMM:6.0,freeHandHeightAlignedToSourceCollar:false,freeSupportOffsetMM:-6,freeFinalYMM:-135,baseAmplitudeMM:baseAmplitude,baseMinimumTotalMM:minimum,frontCollar:{straightMM:collarMM,outletNeckMM,direction:endT.toArray(),gateMM:G.toArray(),Amm:A.toArray(),bankStockMM:freeStock,bankMeasuredMM:bank.measuredMM,bankMinimumMM:bankMinimum,handleMM:bank.h,controlBumpMM:bank.B.toArray(),geometryBlend:bank.blend,sampledMinimumRadiusMM:bank.minimumRadiusMM,minimumSpeed:bank.minimumSpeed,fixedFrontShape:false,commonGeometricBankRule:true,endHandleMM:bank.hEnd,sourceControlCollar:true},bottomPeelRadiiMM:[3,3,5],endTwistRadians:twist,OEMLengthClaim:false};
 }
}
