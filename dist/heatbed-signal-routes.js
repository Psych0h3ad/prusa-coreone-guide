import {channelPacket} from './heatbed-channel-packet.js';
import {channelEntry,freeRgbPeel,ntcInletTurn} from './heatbed-channel-entry.js';
import * as T from 'three';
import {CABLES} from './fastener-data.js';
import {HEATBED_ASSEMBLY as D} from './heatbed-assembly-data.js';
import {V,Q,ArcCurve,Joined,slice,cubic,matchBight,roundedMaterialBight} from './heatbed-material-curves.js';
import {createBedRouteFamily} from './r15-bed-route.js';
import {sampleDirectControls} from './r16-frame-controls.js';
const stocks={rgb:1223.1456626350944,ntc:1129.2201835163805};
function externalPacking(family,kind){
 const arc=new ArcCurve(t=>{const a=t*Math.PI/2;return V([91.00061307+12*Math.cos(a),165.5+12*Math.sin(a),270.54599205]);},256),end=cubic(V([91.00061307,177.5,270.54599205]),V([-1,0,0]),V([64,164,268]),V([-1,0,0]),13,14),centre=new Joined([arc,end]),C=family.controls.C,R=513,previous={};
 const nearest=(row,p)=>{let min=Infinity,out,index,lo=previous[row]===undefined?180:Math.max(0,previous[row]-2),hi=previous[row]===undefined?400:Math.min(512,previous[row]+6);for(let i=lo;i<hi;i++){const k=(row*R+i)*3,a=new T.Vector3().fromArray(C,k),v=new T.Vector3().fromArray(C,k+3).sub(a),f=T.MathUtils.clamp(p.clone().sub(a).dot(v)/v.lengthSq(),0,1),q=a.addScaledVector(v,f),d=q.distanceToSquared(p);if(d<min){min=d;out=q;index=i;}}previous[row]=index;return out;},points=[];
 for(let i=0;i<=128;i++){const p=centre.getPointAt(i/128),t=centre.getTangentAt(i/128),a=nearest(1,p),b=nearest(2,p),n=b.sub(a).addScaledVector(t,-b.dot(t)).normalize(),B=new T.Vector3().crossVectors(t,n).normalize();points.push(p.addScaledVector(B,kind==='rgb'?-2.6:2.35));}return new ArcCurve(t=>{const x=t*128,i=Math.min(127,Math.floor(x));return points[i].clone().lerp(points[i+1],x-i);},512);
}
export function sleeveOffset(family,kind){return channelPacket(family).curves[kind];}

// The NTC clears the PSU and separates from RGB before crossing the
// staged power-bank plane. The
// intermediate station is an authored bend, not an OEM rigid guide.
function peelFromPower(e,et,kind,peelEnd,peelT){return kind==='rgb'?freeRgbPeel():cubic(e,et,peelEnd,peelT,10,10);}
export function geometryParts(kind,z,family,mate,routing=1,channel=null){
 const dz=z-D.bedReferenceZMM,sleeve=sleeveOffset(family,kind),a=sleeve.getPointAt(0),at=sleeve.getTangentAt(0),prefix=[];
 if(kind==='rgb'){
  // The old final control point was an authored partial join between the
  // power terminals, not the RGB cutout. Keep the source LED connection and
  // first four controls; rise through the actual PCB cutout shown by988186.
  const source=CABLES.find(c=>c.id==='rgbWire').points,points=source.map((p,i)=>V(i===source.length-1?[-94,88,69.5]:p).add(V([0,0,dz]))),original=new T.CatmullRomCurve3(points,false,'centripetal');original.arcLengthDivisions=2048;
  const above=V([-94,104,79.3+dz]),bridge=cubic(original.getPoint(1),original.getTangent(1),above,V([0,1,0]),5,5),entry=channelEntry('rgb',z),raise=channel?.enabled?channel.raise:1,placement=channel?.enabled?channel.rgb:1;prefix.push(original,raise===1?bridge:new ArcCurve(t=>bridge.getPointAt(t).add(V([0,0,-3*(1-raise)*Math.sin(Math.PI*t)**2])),512),placement===1?entry:new ArcCurve(t=>{const s=t*entry.getLength();return entry.getPointAt(t).add(V([0,0,5*(1-placement)*Q((s-24)/6)*(1-Q((s-(entry.getLength()-12))/12))]));},2048));
 }else{
  // The source does not expose the embedded thermistor bead. Start inside
  // the real cable-cover channel, not at a claimed manufactured sensor port.
  const entry=channelEntry('ntc',z),placement=channel?.enabled?channel.ntc:1;prefix.push(placement===1?entry:new ArcCurve(t=>{const s=t*entry.getLength();return entry.getPointAt(t).add(V([0,0,-1.5*(1-placement)*Q(s/3)*(1-Q((s-7)/5))]));},2048));
 }
 const fullExt=externalPacking(family,kind),rawExt=kind==='rgb'?slice(fullExt,0,(()=>{let lo=0,hi=1;for(let i=0;i<40;i++){const m=(lo+hi)/2;if(fullExt.getPointAt(m).x>72)lo=m;else hi=m;}return(hi+lo)/2*fullExt.getLength();})()):fullExt,entryCorrection=sleeve.getPointAt(1).sub(rawExt.getPointAt(0)),ext=new ArcCurve(u=>rawExt.getPointAt(u).addScaledVector(entryCorrection,1-Q(Math.min(1,u*rawExt.getLength()/16))),512),e=ext.getPointAt(1),et=ext.getTangentAt(1),level=kind==='rgb'?306:290,side=kind==='rgb'?190:200,A=V([14,side,level]),B=V([-38,side,level]),baseBank=new T.LineCurve3(A,B),peelT=V(kind==='rgb'?[0,.84,.54258639865]:[-1,0,0]).normalize(),peelEnd=kind==='rgb'?e.clone().add(V([-32,0,0])).addScaledVector(peelT,16):e.clone().add(V([-16,34,10])),peel=peelFromPower(e,et,kind,peelEnd,peelT),rear=cubic(peelEnd,peelT,A,V([-1,0,0]),18,16),p=D[kind].tailMM,tail=V(p).add(V([0,18*(1-mate),0])),out=V([0,-1,0]),holeY=kind==='rgb'?170.8:174.8;
 const inletTop=V([-68.2994,holeY,level-30]);if(kind==='ntc'&&routing<.25)inletTop.lerp(V([-88,190,312]),1-Q(routing/.25));if(kind==='rgb'&&routing<.25)inletTop.z+=14*(1-Q(routing/.25));const throat=V([inletTop.x,inletTop.y,kind==='rgb'?225:235]),turn=kind==='ntc'?ntcInletTurn(B,inletTop,routing):cubic(B,V([-1,0,0]),inletTop,V([0,0,-1]),20,20),after=[new T.LineCurve3(inletTop,throat)];
 if(kind==='rgb')after.push(cubic(throat,V([0,0,-1]),tail.clone().add(V([0,14,0])),out,12,18));
 else{const R=15,exit=tail.clone().add(V([0,14,0])),start=exit.clone().add(V([0,R,R])),c=V([tail.x,start.y,112]),bend=new ArcCurve(t=>{const a=t*Math.PI/2;return start.clone().add(V([0,R*(Math.cos(a)-1),-R*Math.sin(a)]));},256);after.push(cubic(throat,V([0,0,-1]),c,V([0,0,-1]),35,26),new T.LineCurve3(c,start),bend);}
 after.push(new T.LineCurve3(tail.clone().add(V([0,14,0])),tail));
 return{prefix:new Joined([...prefix,sleeve,ext,peel,rear]),bank:baseBank,guide:new Joined([turn,...after])};
}
export function createHeatbedSignalRoute(kind,{nativeZMM,family,routing=1,mate=1,channel=null}){
 if(!['rgb','ntc'].includes(kind)||![nativeZMM,routing,mate].every(Number.isFinite)||routing<0||routing>1||mate<0||mate>1)throw Error('Actual signal route inputs required');
 const p=geometryParts(kind,nativeZMM,family,mate,routing,channel);

 const startGuide=p.guide.parts[0].getLength()+24,feed=Math.max(0,(routing-.25)/.75),visited=startGuide+(p.guide.getLength()-startGuide)*feed,guide=slice(p.guide,0,visited),bank=roundedMaterialBight(p.bank,stocks[kind]-p.prefix.getLength()-guide.getLength(),V([0,1,0])),route=new Joined([p.prefix,bank,guide]);
 route.bightMM=bank.bightMM;route.stockMM=stocks[kind];route.sleeveMaterialMM=520;route.materialBasis='Authored represented cable span; individual cutlength is not published in the retained guide';route.tip=route.getPointAt(1);route.tipTangent=route.getTangentAt(1);route.tipRoll=kind==='rgb'?Math.PI/2*Q((route.tip.z-233)/14):0;return route;
}
