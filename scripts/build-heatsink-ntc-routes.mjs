import fs from 'node:fs';
import * as T from '../dist/vendor/three.module.js';
import {ServiceFanCurve} from '../dist/service-fan-frame.js';
import {HEATSINK_NTC} from '../dist/heatsink-ntc-layout.js';

// Fixed display length follows the nominal90mm thermistor in Prusa's parts list.
// The free bends illustrate access; they are not recovered factory wire shapes.
const file='dist/loveboard-service-routing.js',text=fs.readFileSync(file,'utf8');
const routes=JSON.parse(text.slice(text.indexOf('={')+1,text.lastIndexOf(';')));
const vec=p=>new T.Vector3(...p),target=vec([-17.5961463137,-35.0952523998,401.3767213562]),loose=vec([-25,-62,395]),length=90;
let maxError=0,maxAdjustment=0;
function conserve(points){
 const curve=new ServiceFanCurve(points);curve.arcLengthDivisions=768;
 const baseX=points[10].x,measure=d=>{points[10].x=baseX-d;curve.updateArcLengths();return curve.getLength();};
 if(measure(0)>length+1e-8)throw Error(`Unstretched NTC route already too long: ${curve.getLength()}mm`);
 let l=0,h=1;while(measure(h)<length&&h<100)h*=2;
 if(h>=100)throw Error('No outward length-preserving NTC bend');
 for(let n=0;n<45;n++){const m=(l+h)/2;if(measure(m)>length)h=m;else l=m;}
 const adjustment=(l+h)/2;measure(adjustment);
 maxAdjustment=Math.max(maxAdjustment,adjustment);maxError=Math.max(maxError,Math.abs(curve.getLength()-length));
 return points.map(p=>p.toArray());
}
const seated=[];
for(let j=0;j<=256;j++){
 const at=j/256,blend=T.MathUtils.smoothstep(at,0,.55),out=new T.Vector3(0,-1,0);
 const end=at<.55?loose.clone().lerp(target.clone().addScaledVector(out,8),at/.55):target.clone().addScaledVector(out,8*(1-(at-.55)/.45));
 // Preserve the constrained sensor/hook path. Only the free upper bend
 // follows forward while unplugging, clear of the fan plug's moving shell.
 const points=[vec(HEATSINK_NTC.source),vec(HEATSINK_NTC.source).add(new T.Vector3(0,2,0)),vec([-5,-44,336]),vec([-6.3,-47.5,340]),vec([-6.3,-47.5,352]),vec([-6.3,-47.5,364]),vec([-6.3,-47.5,367]),vec([-13.5,-47.5,369.5]),vec([-19,-47.5,373]),vec([-19,-52,381]),vec([-19,-52.5,389]),vec([-17.5961463137,-44,401.3767213562]),end.clone().addScaledVector(out,4),end];
 points[9].lerp(vec([-20,-57,379]),1-blend);points[10].lerp(vec([-24,-61,387]),1-blend);points[11].lerp(vec([-26,-65,392]),1-blend);
 seated.push({at,points:conserve(points)});
}
const hook=[];
for(let j=0;j<256;j++){
 const at=-1+j/256,release=-at,points=seated[0].points.map(vec);
 points[10].x=-20;
 // Move the lead out through the open +X side of the printed carriage hook.
 // The sensor stays fixed; the already unplugged end follows the released
 // span slightly so the 90mm wire does not need to stretch.
 // Keep the initial turn away from the two native insulation stems. Only
 // the middle span moves sideways; the sensor-end guide remains unchanged.
 for(const [i,dx]of [[3,8],[4,12],[5,12],[6,12]])points[i].x+=dx*release;
 points[9].z-=4*release;
 for(let i=10;i<points.length;i++)points[i].z-=14*release;
 hook.push({at,points:conserve(points)});
}
routes.lbNtcLead={length,stages:[...hook,...seated]};
fs.writeFileSync(file,'// Precomputed cable poses in millimetres.\nexport const LOVEBOARD_ROUTES='+JSON.stringify(routes)+';\n');
console.log(JSON.stringify({status:'GENERATED; physical audit required',stages:routes.lbNtcLead.stages.length,maxErrorMM:maxError,maxAdjustmentMM:maxAdjustment,scope:'Negative states release the unplugged wire from its carriage hook; zero is unplugged/routed, one is connected.'}));
