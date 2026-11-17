import * as T from 'three';
import {roundedCablePath} from './lcd-cable-motion.js';
const V=p=>new T.Vector3(...p);
export class EarthQuarterTurn extends T.Curve{
 constructor(){super();this.arcLengthDivisions=128;}
 getPoint(t,o=new T.Vector3()){const a=t*Math.PI/2;return o.set(113,177.7-3*(1-Math.cos(a)),-3-3*Math.sin(a));}
 getTangent(t,o=new T.Vector3()){const a=t*Math.PI/2;return o.set(0,-Math.sin(a),-Math.cos(a));}
 getLength(){return 3*Math.PI/2;}
}
export class StockWave extends T.Curve{
 constructor(startY,endY,amplitude,axis='x'){super();this.startY=startY;this.endY=endY;this.amplitude=amplitude;this.axis=axis;this.arcLengthDivisions=1024;const x=[-.906179845938664,-.538469310105683,0,.538469310105683,.906179845938664],w=[.236926885056189,.478628670499366,.568888888888889,.478628670499366,.236926885056189];let L=0;for(let i=0;i<64;i++)for(let k=0;k<5;k++)L+=w[k]*this.derivative((i+(x[k]+1)/2)/64).length()/128;this.L=L;}
 getPoint(t,o=new T.Vector3()){const d=this.amplitude*Math.sin(Math.PI*t)**2;return o.set(180.8-(this.axis==='x'?d:0),this.startY+(this.endY-this.startY)*t,-6-(this.axis==='z'?d:0));}
 derivative(t,o=new T.Vector3()){const d=this.amplitude*Math.PI*Math.sin(2*Math.PI*t);return o.set(this.axis==='x'?-d:0,this.endY-this.startY,this.axis==='z'?-d:0);}
 getTangent(t,o=new T.Vector3()){return this.derivative(t,o).normalize();}getLength(){return this.L;}
}
export function prefix43(amplitude,axis='x'){
 const p=new T.CurvePath();p.add(new T.LineCurve3(V([113,177.7,15]),V([113,177.7,-3])));p.add(new EarthQuarterTurn());
 const top=roundedCablePath([[113,174.7,-6],[113,170,-6],[138,160,-6],[175,160,-6],[180.8,132.9,-6],[180.8,122.9,-6]].map(V),.48);top.curves.forEach(c=>p.add(c));p.add(new StockWave(122.9,2.9,amplitude,axis));p.add(new StockWave(2.9,-117.1,amplitude,axis));return p;
}
