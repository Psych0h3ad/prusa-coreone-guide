import * as T from 'three';
import {ServiceFanCurve}from './service-fan-frame.js?v=20261111-94';
import {MAIN_CABLE_ENTRY}from './main-cable-entry.js?v=20261111-94';

// The fixed channel entry and the moving plug lead retain separate lengths.
export class MainCableCurve extends T.Curve{
 constructor(points){
  super();this.lead=new ServiceFanCurve(points);this.lead.arcLengthDivisions=320;this.points=this.lead.points;
  const root=points[0],tangent=points[1].clone().sub(root).normalize();
  this.entry=new ServiceFanCurve([...MAIN_CABLE_ENTRY.map(p=>new T.Vector3(...p)),root.clone().addScaledVector(tangent,-.5),root.clone()]);this.entry.arcLengthDivisions=320;
  this.entryLength=this.entry.getLength();
 }
 getLength(){return this.entryLength+this.lead.getLength();}
 updateArcLengths(){this.lead.updateArcLengths();this.needsUpdate=true;}
 getPoint(t,target=new T.Vector3()){
  const distance=T.MathUtils.clamp(t,0,1)*this.getLength();
  return distance<this.entryLength?this.entry.getPointAt(distance/this.entryLength,target):this.lead.getPointAt((distance-this.entryLength)/this.lead.getLength(),target);
 }
 getPointAt(t,target){return this.getPoint(t,target);}
 getTangent(t,target=new T.Vector3()){
  const distance=T.MathUtils.clamp(t,0,1)*this.getLength();
  return distance<this.entryLength?this.entry.getTangentAt(distance/this.entryLength,target):this.lead.getTangentAt((distance-this.entryLength)/this.lead.getLength(),target);
 }
 getTangentAt(t,target){return this.getTangent(t,target);}
}
