import fs from 'node:fs';
import * as T from '../dist/vendor/three.module.js';
import {ServiceFanCurve,fanCableFrames}from '../dist/service-fan-frame.js';

// Keep the free print-fan loop outside the hotend sensor wires while routing.
// Register the explanatory outlet to the native fan housing edge. Keep the
// channel span and seated connector pose fixed; no electrical pin claim.
export function dressPrintFanLoop(routes){
 const r=routes.servicePrintLead;if(r.loopClearanceVersion===2)return;
 if(r.loopClearanceVersion)throw Error('Unknown print-fan loop version');
 const outlet=new T.Vector3(-20.08603902703254,7.13025150243609,371.27915542940417);
 // Include the previously missing short span from the housing edge. The
 // total remains one constant illustrative length throughout the motion.
 r.length+=outlet.distanceTo(new T.Vector3(...r.stages[0].points[0]));
 let previous;
 for(const s of r.stages){
  const p=s.points.map(q=>new T.Vector3(...q)),u=T.MathUtils.smoothstep(s.at,.70,.85)*(1-T.MathUtils.smoothstep(s.at,.91,1));
  p[0].copy(outlet);
  p[7].x-=4*u;p[8].x-=4*u;
  const curve=new ServiceFanCurve(p);curve.arcLengthDivisions=768;
  const length=x=>{p[1].x=x;curve.updateArcLengths();return curve.getLength();};
  let a=-75,b=-15;for(let k=0;k<40;k++){const x=a+(b-a)/3,y=b-(b-a)/3;if(length(x)<length(y))b=y;else a=x;}
  let lo=-75,hi=(a+b)/2;
  if(length(hi)>r.length+.0001)throw Error('Print-fan loop exceeds display length at '+s.at+': '+length(hi));
  for(let k=0;k<35;k++){const mid=(lo+hi)/2;if(length(mid)>r.length)lo=mid;else hi=mid;}
  length((lo+hi)/2);s.points=p.map(v=>v.toArray());
  const f=fanCableFrames(curve,'servicePrintLead',96,previous?.roll,previous?.angles);s.roll=f.roll;s.angles=f.angles;previous=f;
 }
 r.loopClearanceVersion=2;
}
if(process.argv[1]&&new URL(import.meta.url).pathname.toLowerCase().endsWith(process.argv[1].replaceAll('\\','/').toLowerCase())){
 const file='dist/service-fan-routing.js',text=fs.readFileSync(file,'utf8'),routes=JSON.parse(text.slice(text.indexOf('={')+1,text.lastIndexOf(';')));
 dressPrintFanLoop(routes);fs.writeFileSync(file,'// Generated cable centreline poses. Units: mm; illustrative slack, no force model.\nexport const SERVICE_FAN_ROUTES='+JSON.stringify(routes)+';\n');
}
