import * as T from'three';
const V=p=>new T.Vector3(...p),C=ps=>{const c=new T.CatmullRomCurve3(ps.map(V),false,'centripetal');c.arcLengthDivisions=8192;return c;};
export const BED_ROUTE={grommetMM:[103.00061307,157.5,270.54599205],grommetRadiusFitMM:6.991481973460458,grommetFitResidualMM:.00855,
 fixedCrimpMM:[-120,112,205.2],washerLiftMM:.6,sleeveStockMM:352.74711027135774,sleeveRadiusMM:4,
 notes:'Corrected supplemental sleeve preserves old constructed neutral length/radius/topology, not claimed OEM. Native port axes unchanged. Added .6mm bed ring requires +.6mm reference stack offset of native washer777 / screw699; full native surfaces unchanged. This reference offset is explicit, not a measurement of OEM stack.'};
const lead=C([BED_ROUTE.fixedCrimpMM,[-120,116,205.2],[-119,120,204.8],[-115,126,203],[-113,135,202.3],[-104,139,200],[-96,139,200],[-90,139,201],[-80,145,218],[-10,145,240],[60,145,270.54599205],[80,145,270.54599205],[91.00061307,145,270.54599205]]);
class EntryArc extends T.Curve{getPoint(t,target=new T.Vector3()){const a=-Math.PI/2+t*Math.PI/2;return target.set(91.00061307+12*Math.cos(a),157+12*Math.sin(a),270.54599205);}getTangent(t,target=new T.Vector3()){const a=-Math.PI/2+t*Math.PI/2;return target.set(-Math.sin(a),Math.cos(a),0);}getLength(){return 12*Math.PI/2;}getPointAt(t,target){return this.getPoint(t,target);}getTangentAt(t,target){return this.getTangent(t,target);}}
const entryArc=new EntryArc(),entryLine=new T.LineCurve3(V([103.00061307,157,270.54599205]),V([103.00061307,163,270.54599205]));
class Prefix extends T.Curve{constructor(){super();this.parts=[lead,entryArc,entryLine];this.lengths=this.parts.map(p=>p.getLength());this.stock=this.lengths.reduce((a,b)=>a+b);}locate(t){let s=Math.max(0,Math.min(1,t))*this.stock;for(let i=0;i<3;i++){if(s<=this.lengths[i]||i===2)return[i,Math.max(0,Math.min(1,s/this.lengths[i]))];s-=this.lengths[i];}}getPoint(t,target=new T.Vector3()){const[i,u]=this.locate(t);return this.parts[i].getPointAt(u,target);}getTangent(t,target=new T.Vector3()){const[i,u]=this.locate(t);return this.parts[i].getTangentAt(u,target);}getPointAt(t,target){return this.getPoint(t,target);}getTangentAt(t,target){return this.getTangent(t,target);}getLength(){return this.stock;}}
const prefix=new Prefix();
const sleeveBase=[[103.00061307,163,270.54599205],[103.00061307,176,270.54599205],[60,184,285],[0,182,285],[-55,178,277],[-68.2994,177.5997,266],[-68.2994,177.5997,252],[-68.2994,177.5997,235],[-67,183,200],[-68,183,155]];
function sleeveCurve(){const c=C(sleeveBase);const length=a=>{c.points=sleeveBase.map((p,i)=>V(p).addScaledVector(V([0,1,0]),a*(i===2||i===3?1:0)));c.updateArcLengths();return c.getLength();};if(length(0)>BED_ROUTE.sleeveStockMM)throw Error('Sleeve base exceeds original constructed stock '+length(0));let lo=0,hi=100;for(let j=0;j<36;j++){const a=(lo+hi)/2;if(length(a)<BED_ROUTE.sleeveStockMM)lo=a;else hi=a;}length((lo+hi)/2);return c;}
const sleeve=sleeveCurve(),P0=sleeve.getPoint(1),D0=sleeve.getTangent(1),E0=V([-76.43245676132837,177.35172,89.60376870490178]);
function tail(amount){const end=E0.clone().add(V([0,18*(1-amount),0])),p1=P0.clone().addScaledVector(D0,22),p2=end.clone().add(V([0,0,25]));class Bight extends T.Curve{constructor(){super();this.a=0;this.arcLengthDivisions=4096;}getPoint(t,target=new T.Vector3()){const u=1-t;return target.copy(P0).multiplyScalar(u*u*u).addScaledVector(p1,3*u*u*t).addScaledVector(p2,3*u*t*t).addScaledVector(end,t*t*t).addScaledVector(V([0,1,0]),this.a*Math.sin(Math.PI*t)**2);}getTangent(t,target=new T.Vector3()){const u=1-t;return target.copy(p1).sub(P0).multiplyScalar(3*u*u).addScaledVector(p2.clone().sub(p1),6*u*t).addScaledVector(end.clone().sub(p2),3*t*t).addScaledVector(V([0,1,0]),this.a*Math.PI*Math.sin(2*Math.PI*t)).normalize();}}return new Bight();}
const restTail=tail(1);const tailStock=725.6603506954922-prefix.getLength()-BED_ROUTE.sleeveStockMM-12;

// A fixed material seed avoids 35 dense length solves on every animation frame.
// The actual curve is still closed to the same 4096-chord stock, not interpolated.
const tailSeeds=[23.52538390114205,23.741272887855303,23.91425326204626,24.046073127829004,24.138006432622205,24.190903395356145,24.205222581804264,24.181047205638606,24.118086993985344];
const tailBasis=Float64Array.from({length:4097},(_,i)=>Math.sin(Math.PI*i/4096)**2);
function seedTail(amount){
 const x=amount*8,start=Math.max(0,Math.min(5,Math.floor(x)-1));let result=0;
 for(let j=start;j<start+4;j++){let weight=1;for(let k=start;k<start+4;k++)if(k!==j)weight*=(x-k)/(j-k);result+=weight*tailSeeds[j];}
 return result;
}
function measureTail(t,a){
 t.a=a;const previous=t.getPoint(0),point=new T.Vector3();let length=0,derivative=0;
 for(let i=1;i<=4096;i++){
  t.getPoint(i/4096,point);const dx=point.x-previous.x,dy=point.y-previous.y,dz=point.z-previous.z,d=Math.sqrt(dx*dx+dy*dy+dz*dz);
  length+=d;if(d>0)derivative+=dy*(tailBasis[i]-tailBasis[i-1])/d;previous.copy(point);
 }
 return{length,derivative};
}
function closeTail(amount){
 if(!Number.isFinite(amount)||amount<0||amount>1)throw Error('Invalid bed lead amount');
 const t=tail(amount);let a=seedTail(amount),closed=false;
 for(let iteration=0;iteration<4;iteration++){
  const measured=measureTail(t,a),error=measured.length-tailStock;
  if(Math.abs(error)<=2e-8){closed=true;break;}
  if(!(measured.derivative>1e-8))throw Error('Bed lead stock derivative invalid');
  a-=error/measured.derivative;
  if(!Number.isFinite(a)||a<0||a>100)throw Error('Bed lead stock closure out of range');
 }
 if(!closed)throw Error('Bed lead material stock did not close');
 t.updateArcLengths();
 if(Math.abs(t.getLength()-tailStock)>2e-8)throw Error('Bed lead stock cache mismatch');
 return t;
}

export class BedMaterialCurve extends T.Curve{
 constructor(amount){super();this.arcLengthDivisions=16384;const t=closeTail(amount);const end=E0.clone().add(V([0,18*(1-amount),0])),straight=new T.LineCurve3(end,end.clone().add(V([0,0,-12])));this.parts=[prefix,sleeve,t,straight];this.lengths=[prefix.getLength(),sleeve.getLength(),t.getLength(),12];this.stock=this.lengths.reduce((a,b)=>a+b);this.tailBightMM=t.a;}
 locate(t){let s=Math.max(0,Math.min(1,t))*this.stock;for(let i=0;i<this.parts.length;i++){if(s<=this.lengths[i]||i===this.parts.length-1)return[i,Math.max(0,Math.min(1,s/this.lengths[i]))];s-=this.lengths[i];}}
 getPoint(t,target=new T.Vector3()){const[i,u]=this.locate(t);return this.parts[i].getPointAt(u,target);}
 getTangent(t,target=new T.Vector3()){const[i,u]=this.locate(t);return this.parts[i].getTangentAt(u,target);}
 getPointAt(t,target=new T.Vector3()){return this.getPoint(t,target);}
 getTangentAt(t,target=new T.Vector3()){return this.getTangent(t,target);}
 getLength(){return this.stock;}
}
export function referenceSleeveGeometry(){class Metres extends T.Curve{getPoint(t,target=new T.Vector3()){return sleeve.getPointAt(t,target).multiplyScalar(.001);}getTangent(t,target=new T.Vector3()){return sleeve.getTangentAt(t,target);}}const m=new Metres();return{geometry:new T.TubeGeometry(m,64,.004,8,false),curve:m,sourceMM:sleeve};}
