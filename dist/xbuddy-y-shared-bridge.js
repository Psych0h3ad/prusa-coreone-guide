// A material handover, not four endpoint-interpolated centre lines.
// All dimensions below are authored route construction, not OEM specifications.
import * as T from 'three';
const V=a=>new T.Vector3(...a),smooth=x=>{x=T.MathUtils.clamp(x,0,1);return x*x*x*(10+x*(-15+6*x));};
const mean=a=>a.reduce((p,x)=>p.add(x),new T.Vector3()).multiplyScalar(1/a.length);
class Centre extends T.Curve{
 constructor(A,B,U,W,h){super();Object.assign(this,{A,B,U,W,h});}
 getPoint(t,out=new T.Vector3()){const t2=t*t,t3=t2*t,t4=t3*t,t5=t4*t;return out.copy(this.A).multiplyScalar(1-10*t3+15*t4-6*t5).addScaledVector(this.B,10*t3-15*t4+6*t5).addScaledVector(this.U,this.h*(t-6*t3+8*t4-3*t5)).addScaledVector(this.W,this.h*(-4*t3+7*t4-3*t5));}
 getTangent(t,out=new T.Vector3()){const u=1-t,t2=t*t,t3=t2*t,t4=t3*t;return out.copy(this.B).sub(this.A).multiplyScalar(30*t2*u*u).addScaledVector(this.U,this.h*(1-18*t2+32*t3-15*t4)).addScaledVector(this.W,this.h*(-12*t2+28*t3-15*t4)).normalize();}
}
class Strand extends T.Curve{
 constructor(bundle,i){super();this.bundle=bundle;this.i=i;this.arcLengthDivisions=4096;this.updateArcLengths();this.stockMM=T.Curve.prototype.getLength.call(this);}
 getPoint(t,out=new T.Vector3()){
  const b=this.bundle,i=this.i,c=b.centre,Tan=c.getTangent(t),R=b.row(t),up=R.clone().cross(Tan),s=b.xy[i];let x=s.x,y=s.y;
  // The fixed circuit correspondence reverses the labelled quadrilateral.
  // Circuits1/3 physically pass around opposite sides of the two retained
  // strands: spread, half-turn, close. Identity and destination never change.
  if(i===1||i===3){const r=Math.hypot(x,y),spread=smooth(t/.35)*(1-smooth((t-.65)/.35)),radius=r+(b.orbitRadius-r)*spread,phi=Math.PI*smooth((t-.25)/.5),a=Math.atan2(y,x)+phi;x=radius*Math.cos(a);y=radius*Math.sin(a);}
  out.copy(c.getPoint(t)).addScaledVector(R,x).addScaledVector(up,y);
  const q=T.MathUtils.clamp((t-.65)/.35,0,1),g=.35*q*q*q*(q-1);
  return out.addScaledVector(b.endCorrection[i],smooth(q)).addScaledVector(b.endDerivativeCorrection[i],g);
 }
 getTangent(t,out=new T.Vector3()){if(t<=0)return out.copy(this.bundle.U);if(t>=1)return out.copy(this.bundle.endsT[this.i]);return super.getTangent(t,out);}
 getLength(){return this.stockMM??super.getLength();}
}
class LeadAndStrand extends T.Curve{
 constructor(start,startT,strand,leadMM,meta){super();Object.assign(this,{start,startT,strand,leadMM,meta});this.stockMM=leadMM+strand.getLength();}
 getPoint(t,out=new T.Vector3()){return this.getPointAt(t,out);}
 getPointAt(t,out=new T.Vector3()){const s=T.MathUtils.clamp(t,0,1)*this.stockMM;return s<=this.leadMM?out.copy(this.start).addScaledVector(this.startT,s):this.strand.getPointAt((s-this.leadMM)/this.strand.getLength(),out);}
 getTangent(t,out=new T.Vector3()){return this.getTangentAt(t,out);}
 getTangentAt(t,out=new T.Vector3()){const s=T.MathUtils.clamp(t,0,1)*this.stockMM;return s<=this.leadMM?out.copy(this.startT):this.strand.getTangentAt((s-this.leadMM)/this.strand.getLength(),out);}
 getLength(){return this.stockMM;}
}
export function makeSharedYBridge(source,ends,endsT,{leadMM=2.5,orbitRadiusMM=2.3}={}){
 if(source.length!==4||ends.length!==4||endsT.length!==4)throw Error('Complete four-circuit handover required');
 const starts=source.map(s=>V(s.point)),startT=source.map(s=>V(s.tangent).normalize()),U=mean(startT).normalize(),W=mean(endsT).normalize();
 if(startT.some(t=>t.dot(U)<1-1e-12))throw Error('Current source end tangents are not parallel');
 const root=mean(starts),A=root.clone().addScaledVector(U,leadMM),B=mean(ends),h=16;
 const R0=starts[0].clone().add(starts[1]).sub(starts[2]).sub(starts[3]).projectOnPlane(U).normalize(),up0=R0.clone().cross(U);
 // R1 is a proper frame. The required labelled reflection is performed by
 // the explicit separated1/3 exchange above, never by collapsing this basis.
 const R1=ends[0].clone().add(ends[3]).sub(ends[1]).sub(ends[2]).projectOnPlane(W).normalize(),centre=new Centre(A,B,U,W,h),N=1024,tangents=Array.from({length:N+1},(_,k)=>centre.getTangent(k/N)),rows=[R0];
 for(let k=1;k<=N;k++)rows.push(rows[k-1].clone().applyQuaternion(new T.Quaternion().setFromUnitVectors(tangents[k-1],tangents[k])).projectOnPlane(tangents[k]).normalize());
 const roll=Math.atan2(W.dot(rows[N].clone().cross(R1)),rows[N].dot(R1));
 const b={centre,U,W,endsT,orbitRadius:orbitRadiusMM,xy:starts.map(p=>{const d=p.clone().sub(root);return{x:d.dot(R0),y:d.dot(up0)};}),endCorrection:ends.map(()=>new T.Vector3()),endDerivativeCorrection:endsT.map(t=>t.clone().sub(W).multiplyScalar(h)),row(t){const k=Math.min(N,Math.floor(t*N)),Tn=centre.getTangent(t);return rows[k].clone().applyQuaternion(new T.Quaternion().setFromUnitVectors(tangents[k],Tn)).applyAxisAngle(Tn,roll*smooth(t));}};
 const strands=starts.map((_,i)=>new Strand(b,i));
 for(let i=0;i<4;i++){const mappedEnd=strands[i].getPoint(1);b.endCorrection[i].copy(ends[i]).sub(mappedEnd);}
 for(const s of strands){s.stockMM=undefined;s.updateArcLengths();s.stockMM=T.Curve.prototype.getLength.call(s);}
 return strands.map((s,i)=>new LeadAndStrand(starts[i],startT[i],s,leadMM,{kind:'shared transported normal frame with separated circuit1/3 exchange',leadMM,orbitRadiusMM,circuit:i,end:ends[i].toArray(),endT:endsT[i].toArray(),stockMM:leadMM+s.getLength()}));
}
