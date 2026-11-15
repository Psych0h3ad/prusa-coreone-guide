import * as T from 'three';
import {ArcCurve,V,Q} from './heatbed-material-curves.js';
import {clampFibreOffset} from './heatbed-clamp-packet.js';
import {CLAMP_SECTIONS} from './r15-clamp-sections.js';

// Read the single live R16 skin. No substitute circular sleeve, new provider,
// scaled gauge, cut face or alternate material stock is introduced here.
const cache=new WeakMap();
const same=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1];
function signedDistance(p,polygon){
 let inside=false,min=Infinity;
 for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
  const a=polygon[j],b=polygon[i],x=b[0]-a[0],y=b[1]-a[1],t=T.MathUtils.clamp(((p[0]-a[0])*x+(p[1]-a[1])*y)/(x*x+y*y),0,1);
  min=Math.min(min,Math.hypot(p[0]-a[0]-t*x,p[1]-a[1]-t*y));
  if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])inside=!inside;
 }
 return inside?min:-min;
}
function crossing(C,k,centre,normal){
 let best=null,d=Infinity;
 for(let i=0;i<512;i++){
  const at=(k*513+i)*3,ax=C[at],ay=C[at+1],az=C[at+2],bx=C[at+3],by=C[at+4],bz=C[at+5],da=(ax-centre.x)*normal.x+(ay-centre.y)*normal.y+(az-centre.z)*normal.z,db=(bx-centre.x)*normal.x+(by-centre.y)*normal.y+(bz-centre.z)*normal.z;
  if(da*db>0||Math.abs(da-db)<1e-12)continue;
  const f=da/(da-db),px=ax+(bx-ax)*f,py=ay+(by-ay)*f,pz=az+(bz-az)*f,dx=px-centre.x,dy=py-centre.y,dz=pz-centre.z,distance=dx*dx+dy*dy+dz*dz;
  if(distance<d){d=distance;best={p:new T.Vector3(px,py,pz),tangent:new T.Vector3(bx-ax,by-ay,bz-az).normalize(),station:i+f};}
 }
 if(!best)throw Error('Bed packet: power control does not cross actual sleeve section');
 return best;
}
export function channelPacket(family){
 const C=family.controls.C,crimpZMM=C[2]-CLAMP_SECTIONS[0].centreYZ[1]+205.2,surface=family.packetSurface??family.sleeveSurface,P=surface?.attributes.position?.array;
 if(!P||P.length!==513*33*3)throw Error('Bed packet requires the actual R16 513x33 sleeve surface');
 const previous=cache.get(family.controls);
 if(previous&&previous.constructing===!!family.packetSurface&&same(previous.C,C)&&same(previous.P,P))return previous.packet;
 const paths={rgb:[],ntc:[]},rows=[];let entryPower,previousY;
 for(let i=0;i<=512;i++){
  const centre=new T.Vector3().fromArray(C,i*3),points=Array.from({length:32},(_,j)=>new T.Vector3().fromArray(P,(i*33+j)*3).multiplyScalar(1000)),normal=new T.Vector3(),forward=new T.Vector3().fromArray(C,Math.min(512,i+1)*3).sub(new T.Vector3().fromArray(C,Math.max(0,i-1)*3)).normalize();
  for(let j=0;j<32;j++)normal.add(new T.Vector3().crossVectors(points[j].clone().sub(centre),points[(j+1)%32].clone().sub(centre)));
  normal.normalize();if(normal.dot(forward)<0)normal.negate();
  const powers=[crossing(C,1,centre,normal),crossing(C,2,centre,normal)];
  const Y=powers[1].p.clone().sub(powers[0].p).addScaledVector(normal,-powers[1].p.clone().sub(powers[0].p).dot(normal)).normalize();
  if(previousY&&Y.dot(previousY)<0)Y.negate();previousY=Y;
  const Z=new T.Vector3().crossVectors(normal,Y).normalize(),polygon=points.map(p=>{const v=p.clone().sub(centre);return[v.dot(Y),v.dot(Z)];}),obstacles=powers.map(w=>{const v=w.p.clone().sub(centre);return{p:[v.dot(Y),v.dot(Z)],radius:1.65/Math.max(.65,Math.abs(w.tangent.dot(normal)))};});
  if(i===0)entryPower=powers;
  const row={i,materialMM:i*520/512,centre:centre.toArray(),normal:normal.toArray(),power:obstacles,chosen:{}};
  for(const [kind,radius,side]of[['rgb',1.3,-1],['ntc',1.05,1]]){
   const envelope=radius/Math.max(.85,Math.abs(forward.dot(normal)))+.015;
   const point=centre.clone().addScaledVector(Z,side*(kind==='rgb'?2.6:2.35));
   const s=i*520/512,exit=family.sleeve.clampExitMaterialMM;
   if(s<=exit){const d=clampFibreOffset(kind,centre.x,centre,crimpZMM);point.copy(centre).add(V([0,d[0],d[1]]));}
   else if(s<exit+26){
    const d=clampFibreOffset(kind,-94.5,null,crimpZMM),free=Q((s-exit-2)/18),q=new T.Quaternion().slerp(new T.Quaternion().fromArray(family.controls.Q,i*4),Q((s-exit)/4));
    const packed=centre.clone().add(V([0,d[0]*(1-free),d[1]+((kind==='rgb'?2.6:-2.35)-d[1])*free]).applyQuaternion(q));
    point.lerp(packed,1-Q((s-exit-20)/6));
   }
   const delta=point.clone().sub(centre),actual=[delta.dot(Y),delta.dot(Z)],clearance=Math.min(signedDistance(actual,polygon)-envelope,...obstacles.map(w=>Math.hypot(actual[0]-w.p[0],actual[1]-w.p[1])-envelope-w.radius));
   paths[kind].push(point);row.chosen[kind]={localMM:actual,clearanceMM:clearance,pointMM:point.toArray()};
  }
  row.signalGapMM=paths.rgb.at(-1).distanceTo(paths.ntc.at(-1))-2.35;rows.push(row);
 }
 const curves={};
 for(const [kind,side]of[['rgb',-1],['ntc',1]]){
  const raw=new T.CatmullRomCurve3(paths[kind],false,'centripetal');raw.arcLengthDivisions=4096;
  const curve=new ArcCurve(t=>raw.getPoint(t),4096),first=curve.getPointAt(0),tangent=curve.getTangentAt(0);
  const at=(k,u)=>{const f=u*entryPower[k-1].station,i=Math.min(511,Math.floor(f));return new T.Vector3().fromArray(C,(k*513+i)*3).lerp(new T.Vector3().fromArray(C,(k*513+i+1)*3),f-i);};
  const mid=u=>at(1,u).add(at(2,u)).multiplyScalar(.5);
  const approachPoint=u=>{
   const a=at(1,u),b=at(2,u),t=mid(Math.min(1,u+.001)).sub(mid(Math.max(0,u-.001))).normalize(),axis=new T.Vector3().crossVectors(t,b.clone().sub(a).normalize()).normalize(),half=a.distanceTo(b)/2;
   const minimum=Math.sqrt(Math.max(0,(1.65+(kind==='rgb'?1.3:1.05)+.13)**2-half*half));
   const distance=kind==='ntc'?2.35:Math.max(.9,minimum+.15);
   return a.add(b).multiplyScalar(.5).addScaledVector(axis,side*distance);
  };
  const correction=first.clone().sub(approachPoint(1)),approachPoints=Array.from({length:65},(_,i)=>{const u=i/64;return approachPoint(u).addScaledVector(correction,Q(u));});
  // The actual section path fixes the mouth tangent, rather than bending a
  // circular offset back across the sleeve rim at a mismatched end station.
  const lastStep=approachPoints.at(-1).distanceTo(approachPoints.at(-2));
  approachPoints[63]=first.clone().addScaledVector(tangent,-lastStep);
  const approachRaw=new T.CatmullRomCurve3(approachPoints,false,'centripetal');approachRaw.arcLengthDivisions=2048;
  curve.approach=new ArcCurve(t=>approachRaw.getPoint(t),2048);curve.sourceSleeveStockMM=520;curves[kind]=curve;
 }
 const packet={curves,rows,basis:family.packetSurface?'intended clamp profile from the single R16 carrier; actual open/sliding cloth is separately emitted and collision-tested':'actual live deformed sleeve rings and intersected R16 power controls',minSectionClearanceMM:Math.min(...rows.flatMap(r=>Object.values(r.chosen).map(v=>v.clearanceMM))),minSignalGapMM:Math.min(...rows.map(r=>r.signalGapMM))};
 cache.set(family.controls,{C:C.slice(),P:P.slice(),constructing:!!family.packetSurface,packet});return packet;
}
