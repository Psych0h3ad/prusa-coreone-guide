import * as T from 'three';
import {fanBodySeed} from './fan-seeds.js';
const vec=p=>new T.Vector3(...p),ease=x=>{x=T.MathUtils.clamp(x,0,1);return x*x*(3-2*x);},mix=(a,b,t)=>T.MathUtils.lerp(a,b,t);
export const BOARD=[-54.20276,165.43632,206.64597];
export const CHAMBER_LEADS=Object.freeze([
 {id:'cfFan1',body:70,pins:4,root:[.6,186.3,358.5],park:[260,-110,0],rect:[27.639833542906107,-15.151586381363586,35.455561283275706,-7.761315132597003],colors:['#c93d30','#222526','#e3ba31','#3069aa'],radius:.32},
 {id:'cfFan2',body:72,pins:4,root:[-1.6,189.5,358.5],park:[-380,-110,0],rect:[38.85680062316844,-15.21949242031285,47.10347512221233,-7.4847897582611065],colors:['#c93d30','#222526','#e3ba31','#3069aa'],radius:.32}
]);
export function frame(d){const r=d.rect;return new T.Matrix4().set(1,0,0,BOARD[0]-(r[0]+r[2])/2,0,0,1,BOARD[1]+.29,0,-1,0,BOARD[2]-r[1]+2.4,0,0,0,1);}


export const SAMPLES=256,KNOTS=96;
const corridor=d=>d.id==='cfFan1'?7:-6.1;
export function bodyOffset(d,a){return vec(fanBodySeed(d.id,a));}
function endpoint(d,a){const parked=vec(d.root).add(vec(d.park)),sign=d.id==='cfFan2'?1:-1,free=parked.clone().add(new T.Vector3(sign*45,-35,-65)),hole=d.id==='cfFan1'?[-129.6,173.8]:[-131.1,171.0],outside=new T.Vector3(d.id==='cfFan1'?-99.5:-108,d.id==='cfFan1'?162.5:192,260),port=vec([0,0,1.25]).applyMatrix4(frame(d)),above=new T.Vector3(hole[0],hole[1],260),under=new T.Vector3(hole[0],hole[1],238),withdraw=port.clone().add(new T.Vector3(0,0,12));
 const lerp=(p,q,t)=>p.clone().lerp(q,ease(t)),highZ=520;const high=free.clone();high.z=highZ;if(a<.1)return lerp(free,high,a/.1);if(a<.2)return lerp(high,new T.Vector3(0,140,highZ),(a-.1)/.1);if(a<.3)return lerp(new T.Vector3(0,140,highZ),new T.Vector3(0,140,430),(a-.2)/.1);if(a<.4)return lerp(new T.Vector3(0,140,430),new T.Vector3(0,184,430),(a-.3)/.1);if(a<.55)return lerp(new T.Vector3(0,184,430),new T.Vector3(0,184,308),(a-.4)/.15);if(a<1)return lerp(new T.Vector3(0,184,308),outside,(a-.55)/.45);if(a<1.1)return outside;if(a<1.35)return lerp(outside,above,(a-1.1)/.25);if(a<1.65)return lerp(above,under,(a-1.35)/.3);if(a<2)return lerp(under,withdraw,(a-1.65)/.35);return lerp(withdraw,port,a-2);
}
export function headAngle(d,a){return 0;}
export function controls(d,a,w,b=0){const mid=(d.pins-1)/2,off=w-mid,body=bodyOffset(d,a),root=vec(d.root).add(body),end=endpoint(d,a),q=ease((a-.55)/.45),upperWeight=Math.max(0,1-2*q),plane=d.id==='cfFan1'?161:183+24*ease((a-.55)/.1)*(1-ease((a-.72)/.28)),gatherY=d.id==='cfFan1'?166.5:177.2,gatherZ=d.id==='cfFan1'?276:283,ztop=d.id==='cfFan1'?304:302,r=(ztop-gatherZ)/2,B=(d.id==='cfFan2'?35:25)+b*q,hole=d.id==='cfFan1'?-125:-128,roofY=d.id==='cfFan1'?181:180.3,side=d.id==='cfFan2'?1:-1,points=[root.clone()];
 points.push(root.clone().add(new T.Vector3(0,0,-3)),root.clone().add(new T.Vector3(0,0,-9)));
 const neck=points.at(-1).clone(),px=a<=.55?end.x:corridor(d)*q,py=a<=.55?end.y:mix(184,d.id==='cfFan2'?187.3:185.8,q),ptop=new T.Vector3(px,py,Math.max(Math.min(342,neck.z-3),end.z+35*(1-q))),pmid=new T.Vector3(px,py,Math.max(Math.min(330,ptop.z-6),end.z+27*(1-q))),plow=new T.Vector3(px,py,Math.max(Math.min(314,pmid.z-6),end.z+20*(1-q))),frontY=root.y-35-(d.id==='cfFan1'?6*ease((a-.55)/.08)*(1-ease((a-.8)/.15)):0),low=root.z-20,bridgeZ=Math.max(ptop.z+10,end.z+25),top=Math.max(low,bridgeZ+15)+b*(1-q),raw=[[root.x+side*12,frontY,low],[root.x+side*12,frontY,top]],upperArc=[];
 for(let i=1;i<=4;i++){const t=i/4*Math.PI;raw.push([root.x+side*(12+15*(1-Math.cos(t))),frontY,top+15*Math.sin(t)]);upperArc.push(raw.length-1);}
 raw.push([root.x+side*42,frontY,bridgeZ+15]);const bridge=new T.Vector3(px,py,bridgeZ);raw.push(bridge.toArray());const target=ptop;
 const upperStart=points.length;for(let i=0;i<raw.length;i++){const straight=neck.clone().lerp(target,(i+1)/(raw.length+1));points.push(straight.lerp(vec(raw[i]),upperWeight));}
 const upperMark=upperStart+upperArc[1];let lowerMark=upperMark;
 {points.push(ptop,pmid,plow);const lower=[];if(d.id==='cfFan2')lower.push([corridor(d),py,308]);lower.push([d.id==='cfFan2'?-6:8,plane,ztop],[d.id==='cfFan2'?0:12,plane,ztop],[B,plane,ztop]);for(let i=1;i<=4;i++){const t=Math.PI/2-i/4*Math.PI;lower.push([B+r*Math.cos(t),plane,(ztop+gatherZ)/2+r*Math.sin(t)]);}
 const postY=d.id==='cfFan1'?164.5:179,postZ=d.id==='cfFan2'?270:gatherZ;
 lower.push([Math.max(20,Math.min(35,B-4)),plane,gatherZ]);
lower.push([20,gatherY,gatherZ],[18,gatherY,gatherZ],[15,gatherY,gatherZ],[10,gatherY,gatherZ],[8,gatherY,gatherZ]);
 if(d.id==='cfFan2')lower.push([6,gatherY,282],[3,gatherY,281],[-4,gatherY,280],[-8,postY,270]);else lower.push([0,gatherY,gatherZ],[-10,postY,gatherZ]);
 // Keep the entire rear free lead between actual158/205walls and below319fold.
 const columnMix=ease((a-1.65)/.35),entryZ=mix(Math.max(260,end.z+6),260,columnMix),cx=mix(end.x,hole,columnMix),cy=mix(end.y,roofY,columnMix),underZ=mix(end.z+6,244.5,columnMix);
 const caseApproach=ease((a-1.1)/.25),columnY=d.id==='cfFan2'?mix(postY,170.5,caseApproach):postY,bendY=cy,dy=bendY-columnY,sign=Math.sign(dy)||1,rr=Math.min(4,Math.abs(dy)/2),zz=entryZ+rr*2;
 if(d.id==='cfFan2')lower.push([mix(-8,cx,.65),postY,postZ],[mix(-8,cx,.7),columnY,postZ]);
 lower.push([cx,columnY,postZ],[cx,columnY,zz]);
 for(let k=1;k<=4;k++){const t=k/4*Math.PI/2;lower.push([cx,columnY+sign*rr*(1-Math.cos(t)),zz-rr*Math.sin(t)]);}
 lower.push([cx,bendY-sign*rr,entryZ+rr]);
 for(let k=1;k<=4;k++){const t=k/4*Math.PI/2;lower.push([cx,bendY-sign*rr+sign*rr*Math.sin(t),entryZ+rr*Math.cos(t)]);}
 lower.push([cx,cy,mix(entryZ,underZ,1/3)],[cx,cy,mix(entryZ,underZ,2/3)],[cx,cy,underZ]);
 if(d.id==='cfFan1')lower.push([mix(end.x,-110,columnMix),mix(end.y,173.5,columnMix),mix(end.z+6,244,columnMix)],[mix(end.x,-95,columnMix),mix(end.y,173.5,columnMix),mix(end.z+6,244,columnMix)]);
 if(d.id==='cfFan2')lower.push([mix(end.x,-110,columnMix),mix(end.y,181,columnMix),mix(end.z+6,239,columnMix)]);
 const lowerStart=points.length,tailRise=a<1.1?Math.min(6,Math.max(2,312-end.z)):mix(6,Math.min(14,Math.max(2,243.5-end.z)),columnMix),tailTop=end.clone().add(new T.Vector3(0,0,tailRise));
 for(let i=0;i<lower.length;i++){const base=plow.clone().lerp(tailTop,(i+1)/(lower.length+1));points.push(base.lerp(vec(lower[i]),q));}lowerMark=lowerStart+(d.id==='cfFan2'?4:3);points.push(tailTop,end.clone().add(new T.Vector3(0,0,tailRise*.5)),end.clone());
 }
 // Member offsets are applied after parallel transport along the central
 // curve, not along a fixed Y vector that becomes tangent to a lateral bend.
 return{points,body,end,upperMark,lowerMark,q,headAngle:headAngle(d,a)};
}
function curveOf(points){
 const base=new T.CatmullRomCurve3(points,false,'centripetal'),c=new T.Curve(),n=points.length-1,slopes={};
 // Shape-preserving cubic Y/Z avoids Catmull overshoot through a wall or an
 // already completed neighbouring lead. This defines a smooth authored path;
 // no surface positions are clamped after stock is solved.
 for(const key of ['y','z']){const ds=points.slice(1).map((p,i)=>p[key]-points[i][key]);slopes[key]=points.map((p,i)=>i===0?ds[0]:i===n?ds[n-1]:ds[i-1]*ds[i]<=0?0:2*ds[i-1]*ds[i]/(ds[i-1]+ds[i]));}
 c.getPoint=(t,out=new T.Vector3())=>{base.getPoint(t,out);const k=Math.min(n-1,Math.floor(t*n)),u=t*n-k,u2=u*u,u3=u2*u;for(const key of ['y','z'])out[key]=(2*u3-3*u2+1)*points[k][key]+(u3-2*u2+u)*slopes[key][k]+(-2*u3+3*u2)*points[k+1][key]+(u3-u2)*slopes[key][k+1];return out;};c.arcLengthDivisions=768;return c;
}
export const routeDiagnostics={};let last=null;
export function routeSamples(d,a,w,b=0){const x=controls(d,a,w,b),c=curveOf(x.points),pts=Array.from({length:SAMPLES+1},(_,i)=>c.getPointAt(i/SAMPLES)),t=pts.map((p,i)=>pts[Math.min(SAMPLES,i+1)].clone().sub(pts[Math.max(0,i-1)]).normalize()),off=w-(d.pins-1)/2;return pts.map((p,i)=>{const u=i/SAMPLES,remaining=(1-u)*c.getLength(),tail=ease((18-remaining)/10),preferred=new T.Vector3(.2,1,.28).lerp(new T.Vector3(Math.cos(x.headAngle),Math.sin(x.headAngle),0),tail),pass=d.id==='cfFan2'?ease(a/.15-2.5)*ease((p.z-318.5)/1.2)*(1-ease((p.z-341)/8))*ease(u*c.getLength()/8)*(1-ease((Math.abs(p.x-corridor(d))-1)/5)):0,row=preferred.lerp(new T.Vector3(1,0,0),pass).addScaledVector(t[i],-preferred.dot(t[i]));if(row.length()<1e-5)throw Error('Material row singularity '+d.id+' '+a+' '+i);row.normalize();const spread=d.id==='cfFan2'?(.3*ease((p.z-450)/15)*ease((a-.55)/.08)*(1-ease((a-.8)/.15))*ease(u*c.getLength()/24)):0,pitch=mix(.9+spread,1.5,tail),factor=1;return p.addScaledVector(row,off*pitch*factor);});}
export const polyLength=p=>p.reduce((s,q,i)=>s+(i?q.distanceTo(p[i-1]):0),0);
export function solveSamples(d,a,w,stock){let lo=0,hi=4,p=routeSamples(d,a,w,0);if(polyLength(p)>stock+.0002)throw Error('Minimum route exceeds fixed stock '+d.id+' '+a+' '+w+' '+polyLength(p)+'>'+stock);while(polyLength(routeSamples(d,a,w,hi))<stock&&hi<2048)hi*=2;for(let i=0;i<30;i++){const m=(lo+hi)/2;if(polyLength(routeSamples(d,a,w,m))<stock)lo=m;else hi=m;}const amount=(lo+hi)/2,pts=routeSamples(d,a,w,amount);pts.deformation=stockDeformation(d,a,amount);pts.b=amount;return pts;}
export function stockDeformation(d,a,b=30){const x=controls(d,a,(d.pins-1)/2,b),c=curveOf(x.points),arc=c.getLengths(768),at=ix=>{const t=ix/(x.points.length-1)*768,k=Math.floor(t);return mix(arc[k],arc[Math.min(768,k+1)],t-k)/arc[768];};return{upper:at(x.upperMark),lower:at(x.lowerMark),q:x.q,upperFactor:(1-x.q)*Math.max(0,1-2*x.q),lowerFactor:x.q};}
export function slackCentre(d,a){const s=stockDeformation(d,a);return s.q>.5?s.lower:s.upper;}
export function slackDirection(d,a){const s=stockDeformation(d,a);return[s.q,0,1-s.q];}

export function materialFrames(pts){const tangents=pts.map((p,i)=>pts[Math.min(pts.length-1,i+1)].clone().sub(pts[Math.max(0,i-1)]).normalize()),t=tangents[0],axis=Math.abs(t.x)<=Math.abs(t.y)&&Math.abs(t.x)<=Math.abs(t.z)?new T.Vector3(1,0,0):Math.abs(t.y)<=Math.abs(t.z)?new T.Vector3(0,1,0):new T.Vector3(0,0,1),n=t.clone().cross(axis).cross(t).normalize(),normals=[n.clone()],binormals=[t.clone().cross(n).normalize()];for(let i=1;i<pts.length;i++){n.applyQuaternion(new T.Quaternion().setFromUnitVectors(tangents[i-1],tangents[i]));n.addScaledVector(tangents[i],-n.dot(tangents[i])).normalize();normals.push(n.clone());binormals.push(tangents[i].clone().cross(n).normalize());}return{tangents,normals,binormals};}
