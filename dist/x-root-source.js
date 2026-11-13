import {applyXPathTangent} from './x-c1-curves.js?v=20261111-100';
import * as T from 'three';
const V=p=>new T.Vector3(...p),smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*x*(10-15*x+6*x*x);};
export const integrate=(c,n=6400)=>{let p=c.getPoint(0),s=0;for(let i=1;i<=n;i++){const q=c.getPoint(i/n);s+=p.distanceTo(q);p=q;}return s;};
const materialCurve=path=>{const c=new T.Curve();c.arcLengthDivisions=6400;c.getPoint=(t,p=new T.Vector3())=>path.getPoint(t,p).multiplyScalar(.001);c.getTangent=(t,p=new T.Vector3())=>path.getTangent(t,p).normalize();return c;};
function replace(entity,curve,radius){const geometry=new T.TubeGeometry(curve,entity.samples||64,radius*.001,8,false);entity.curve=curve;entity.geometry=geometry;entity.mesh.geometry=geometry;}
export function repairXYBundle(entity){
 if(entity.packingRepair)return entity.packingRepair;
 const original=entity.curve,stock=integrate(original,25600)*1000;
 const trial=alpha=>{const c=new T.Curve();c.arcLengthDivisions=6400;
  c.getPoint=(t,p=new T.Vector3())=>{p.copy(original.getPoint(t));const y=p.y*1000,w=smooth((y-35)/35)*(1-smooth((y-122)/36)),free=smooth((y-35)/15)*(1-smooth((y-77)/15));p.x+=(.10*w+alpha*free)*.001;p.z+=.10*w*.001;return p;};
  c.getTangent=(t,p=new T.Vector3())=>{const y=original.getPoint(t).y*1000;return y<=35||y>=158?p.copy(original.getTangent(t)):T.Curve.prototype.getTangent.call(c,t,p);};return c;};
 const length=a=>integrate(trial(a),6400)*1000;
 let lo=-6,hi=6;for(let i=0;i<32;i++){const a=lo+(hi-lo)/3,b=hi-(hi-lo)/3;if(length(a)<length(b))hi=b;else lo=a;}
 const minimum=(lo+hi)/2;if(length(minimum)>stock+.0001)throw Error('Authored XY cannot meet stock with this local smooth route');
 const roots=[];for(const end of [-6,6]){let a=minimum,b=end;for(let i=0;i<36;i++){const mid=(a+b)/2;if(length(mid)<stock)a=mid;else b=mid;}roots.push((a+b)/2);}
 const alpha=roots.sort((a,b)=>Math.abs(a)-Math.abs(b))[0],curve=trial(alpha);replace(entity,curve,2);
 return entity.packingRepair={stockMM:stock,denseMM:integrate(curve,25600)*1000,alpha,originalStartMM:original.getPoint(0).multiplyScalar(1000).toArray(),originalEndMM:original.getPoint(1).multiplyScalar(1000).toArray(),startMM:curve.getPoint(0).multiplyScalar(1000).toArray(),endMM:curve.getPoint(1).multiplyScalar(1000).toArray(),sourceStartDirection:original.getTangent(0).toArray(),sourceEndDirection:original.getTangent(1).toArray(),startDirection:curve.getTangent(0).toArray(),endDirection:curve.getTangent(1).toArray()};
}
export function repairMotorSource(entity){
 if(entity.motorPackingRepair)return entity.motorPackingRepair;
 const original=entity.curve,originalLengthMM=integrate(original,25600)*1000;
 const path=new T.CurvePath();let start=original.getPoint(0).multiplyScalar(1000),axis=original.getTangent(0);
 const add=(end,endAxis,h0,h1)=>{end=V(end);endAxis=V(endAxis).normalize();const c=new T.CubicBezierCurve3(start,start.clone().addScaledVector(axis,h0),end.clone().addScaledVector(endAxis,-h1),end);c.arcLengthDivisions=2400;path.add(c);start=end;axis=endAxis;};
 add([-192.635,186.3,344],[0,0,-1],6.7,6.7);
 // The actual C-guide opens toward +X,+Y. Ease through that mouth, then
 // follow the triangle-distance corridor through the plate's real free area.
 const origin=start.clone(),delta=V([1.335,1.5,-5.5]),ramp=new T.Curve();ramp.arcLengthDivisions=2400;
 ramp.xJet=u=>{const s=u*u*u*(10-15*u+6*u*u),v=30*u*u*(1-u)*(1-u),a=60*u*(1-u)*(1-2*u);return {p:origin.clone().add(V([delta.x*s,delta.y*s,delta.z*u])),v:V([delta.x*v,delta.y*v,delta.z]),a:V([delta.x*a,delta.y*a,0])};};
 ramp.getPoint=(u,p=new T.Vector3())=>p.copy(ramp.xJet(u).p);ramp.getTangent=(u,p=new T.Vector3())=>p.copy(ramp.xJet(u).v).normalize();path.add(ramp);start=ramp.getPoint(1);axis=ramp.getTangent(1);
 const choose=[[1],[1,1],[1,2,1],[1,3,3,1],[1,4,6,4,1],[1,5,10,10,5,1]];
 const evaluate=(c,u)=>{const p=new T.Vector3(),n=c.length-1;for(let i=0;i<=n;i++)p.addScaledVector(c[i],choose[n][i]*u**i*(1-u)**(n-i));return p;};
 const quintic=(end,endAxis,h0,h1)=>{end=V(end);endAxis=V(endAxis).normalize();const c=[start,start.clone().addScaledVector(axis,h0),start.clone().addScaledVector(axis,2*h0),end.clone().addScaledVector(endAxis,-2*h1),end.clone().addScaledVector(endAxis,-h1),end],v=c.slice(1).map((p,i)=>p.clone().sub(c[i]).multiplyScalar(5)),a=v.slice(1).map((p,i)=>p.clone().sub(v[i]).multiplyScalar(4)),curve=new T.Curve();curve.arcLengthDivisions=2400;curve.xJet=u=>({p:evaluate(c,u),v:evaluate(v,u),a:evaluate(a,u)});curve.getPoint=(u,p=new T.Vector3())=>p.copy(evaluate(c,u));curve.getTangent=(u,p=new T.Vector3())=>p.copy(evaluate(v,u)).normalize();path.add(curve);start=end;axis=endAxis;};
 quintic([-195.5,181,330.5],[0,-1,0],2,2);
 add([-195.5,170,330.5],[0,-1,0],3.67,3.67);
 quintic([-198,145,319],[0,0,-1],5,3);
 applyXPathTangent(path);
 const curve=materialCurve(path),denseLengthMM=integrate(curve,25600)*1000;replace(entity,curve,1.7);
 const frames=curve.computeFrenetFrames(entity.samples||64,false);
 return entity.motorPackingRepair={end:start,tangent:axis,endNormal:frames.normals.at(-1),endBinormal:frames.binormals.at(-1),originalLengthMM,sourceLengthMM:curve.getLength()*1000,denseLengthMM,lengthDeltaMM:originalLengthMM-denseLengthMM,portMM:original.getPoint(0).multiplyScalar(1000).toArray(),originalPortDirection:original.getTangent(0).toArray()};
}
export function alignRootFrames(curve,repair,endAxis=null){const original=curve.computeFrenetFrames.bind(curve);curve.computeFrenetFrames=(segments,closed)=>{const f=original(segments,closed);f.tangents[0].copy(repair.tangent);f.normals[0].copy(repair.endNormal);f.binormals[0].copy(repair.endBinormal);if(endAxis)f.tangents[segments].copy(endAxis);for(let i=1;i<=segments;i++){const q=new T.Quaternion().setFromUnitVectors(f.tangents[i-1],f.tangents[i]);f.normals[i].copy(f.normals[i-1]).applyQuaternion(q).addScaledVector(f.tangents[i],-f.normals[i].dot(f.tangents[i])).normalize();f.binormals[i].crossVectors(f.tangents[i],f.normals[i]).normalize();}return f;};}
