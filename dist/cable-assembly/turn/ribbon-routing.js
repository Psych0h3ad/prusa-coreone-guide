import * as T from 'three';
import {Bezier} from '../earth-path/fe23-path-v105.js';
const nodes=[-.906179845938664,-.538469310105683,0,.538469310105683,.906179845938664],weights=[.236926885056189,.478628670499366,.568888888888889,.478628670499366,.236926885056189];
export const vec=p=>new T.Vector3(...p);
export class QuarterArc extends T.Curve{
 constructor(centre,u,v,radius){super();this.c=centre.clone();this.u=u.clone();this.v=v.clone();this.r=radius;}
 getPoint(t,out=new T.Vector3()){const a=t*Math.PI/2;return out.copy(this.c).addScaledVector(this.u,this.r*Math.cos(a)).addScaledVector(this.v,this.r*Math.sin(a));}
 getTangent(t,out=new T.Vector3()){const a=t*Math.PI/2;return out.copy(this.u).multiplyScalar(-Math.sin(a)).addScaledVector(this.v,Math.cos(a));}
 getPointAt(t,out){return this.getPoint(t,out);}getTangentAt(t,out){return this.getTangent(t,out);}getLength(){return this.r*Math.PI/2;}
}
export function cubicLength(p,subdivisions=4){
 let length=0;
 for(let j=0;j<subdivisions;j++)for(let k=0;k<5;k++){
  const t=(j+(nodes[k]+1)*.5)/subdivisions,s=1-t;
  let square=0;
  for(let a=0;a<3;a++){const v=3*(s*s*(p[1][a]-p[0][a])+2*s*t*(p[2][a]-p[1][a])+t*t*(p[3][a]-p[2][a]));square+=v*v;}
  length+=weights[k]*.5/subdivisions*Math.sqrt(square);
 }
 return length;
}
export function cubic(points){const c=new T.CubicBezierCurve3(...points.map(p=>p.isVector3?p:vec(p)));c.arcLengthDivisions=128;const mm=[c.v0,c.v1,c.v2,c.v3].map(p=>p.toArray()),length=cubicLength(mm,8);c.getLength=()=>length;return c;}
export function pathPoint(path,d,out=new T.Vector3()){
 const lengths=path.getCurveLengths();let i=0;while(i<lengths.length-1&&d>lengths[i])i++;
 const start=i?lengths[i-1]:0,u=T.MathUtils.clamp((d-start)/(lengths[i]-start),0,1);return path.curves[i].getPointAt(u,out);
}
export function pathTangent(path,d,out=new T.Vector3()){
 const lengths=path.getCurveLengths();let i=0;while(i<lengths.length-1&&d>lengths[i])i++;
 const start=i?lengths[i-1]:0,u=T.MathUtils.clamp((d-start)/(lengths[i]-start),0,1);return path.curves[i].getTangentAt(u,out).normalize();
}
export function makeCasePrefix(){
 const path=new T.CurvePath(),marks={};let length=0;
 const add=(curve,key)=>{path.add(curve);length+=curve.getLength();if(key)marks[key]=length;};
 const line=(a,b,key)=>add(new T.LineCurve3(vec(a),vec(b)),key);
 const z=120.9796;
 line([-138,176.1,z],[-139,176.1,z]);
 add(new QuarterArc(vec([-139,180.1,z]),vec([0,-1,0]),vec([-1,0,0]),4),'rollStart');
 line([-143,180.1,z],[-143,190.1,z],'rollEnd');
 add(new QuarterArc(vec([-143,190.1,z-6]),vec([0,0,1]),vec([0,1,0]),6),'upperTurnEnd');
 add(cubic([[-143,196.1,z-6],[-143,196.1,107],[-140,189,100],[-140,189,90]]));
 line([-140,189,90],[-140,188,72]);
 line([-140,188,72],[-140,189,40],'accordionStart');
 line([-140,189,40],[-140,189,20]);
 add(cubic([[-140,189,20],[-140,189,14],[-140,172.1,14],[-140,172.1,-4.5]]),'underTurnStart');
 add(new QuarterArc(vec([-140,167.1,-4.5]),vec([0,1,0]),vec([0,0,-1]),5),'underTurnEnd');
 // Two12mm planar bends preserve a radius greater than half the folded
 // cable width; the preceding cubic made two much tighter lateral corners.
 add(new QuarterArc(vec([-152,167.1,-9.5]),vec([1,0,0]),vec([0,-1,0]),12));
 line([-152,155.1,-9.5],[-168.3,155.1,-9.5]);
 add(new QuarterArc(vec([-168.3,143.1,-9.5]),vec([0,1,0]),vec([-1,0,0]),12),'baseRollStart');
 line([-180.3,143.1,-9.5],[-180.3,130,-9.5],'baseRollEnd');
 line([-180.3,130,-9.5],[-180.3,-122.1,-9.5]);
 return{path,marks,length:path.getLength()};
}
export const FRONT_INSIDE=vec([28.817,-198,-21.022]),FRONT_EXIT=vec([28.817,-208,-21.022]);
export function baseControls(amplitude,inside=FRONT_INSIDE){
 const a=[-168.3,-140,-9.5],mid=[-75,-170+amplitude,-12],end=inside.toArray();
 return[[a,[-140,-140,-9.5],[mid[0]-45,mid[1],mid[2]],mid],[mid,[mid[0]+45,mid[1],mid[2]],[end[0],end[1]+25,end[2]],end]];
}
export function baseLength(amplitude,inside=FRONT_INSIDE,exit=FRONT_EXIT){return 5.9+12*Math.PI/2+baseControls(amplitude,inside).reduce((n,p)=>n+cubicLength(p,8),0)+inside.distanceTo(exit);}
export function makeTail(amplitude,external,inside=FRONT_INSIDE,exit=FRONT_EXIT){
 const path=new T.CurvePath();
 path.add(new T.LineCurve3(vec([-180.3,-122.1,-9.5]),vec([-180.3,-128,-9.5])));
 path.add(new QuarterArc(vec([-168.3,-128,-9.5]),vec([-1,0,0]),vec([0,-1,0]),12));
 for(const points of baseControls(amplitude,inside))path.add(cubic(points));
 path.add(new T.LineCurve3(inside.clone(),exit.clone()));
 const baseDistance=path.getLength();path.add(external.bridge);path.add(external.straight);
 return{path,baseDistance,bridgeDistance:external.bridge.getLength()};
}
export function makeExternal(end,frame,exit=FRONT_EXIT,release=0,laneOffset=0){
 const width=vec([0,1,0]).applyQuaternion(frame),tangent=vec([0,0,1]).applyQuaternion(frame);
 // Preserve a real straight 3mm connector approach. The earlier variable
 // 3..14mm straight backed past the front opening and made a tight U-turn.
 // Bound the Bezier handles by the available forward separation so the
 // bridge's Y control polygon remains monotonic for rear-facing leads.
 const straightLength=3,b=end.clone().addScaledVector(tangent,-straightLength);
 const lead=Math.min(6,Math.max(1,(exit.y-b.y)*.45/(1+Math.abs(tangent.y))));
 // Keep the tested held-only lateral bridge. The quartic displacement
 // that preserved the old Y/Z curve touched614 and was rejected. All
 // original endpoints and endpoint tangent directions remain unchanged.
 const bridge=laneOffset?new Bezier([exit.clone(),exit.clone().add(vec([0,-lead,0])),exit.clone().add(vec([-laneOffset,-2*lead,0])),b.clone().addScaledVector(tangent,-2*lead).add(vec([-laneOffset,0,0])),b.clone().addScaledVector(tangent,-lead),b]):cubic([exit.clone(),exit.clone().add(vec([0,-lead,0])),b.clone().addScaledVector(tangent,-lead),b]);
 const straight=new T.LineCurve3(b,end.clone());
 return{bridge,straight,width,tangent,straightLength,bridgeLength:bridge.getLength(),length:bridge.getLength()+straightLength};
}
