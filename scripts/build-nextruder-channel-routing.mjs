// Route references: official Nextruder guide6.52 and wiring check6.54.
// https://help.prusa3d.com/guide/6-nextruder-assembly_982284#995316
// Cable lengths and the visible loadcell exit are explanatory, not OEM dimensions.
import fs from 'node:fs';
import * as T from 'three';
import {LOVEBOARD_ROUTES} from '../dist/loveboard-service-routing.js';
import {LOAD_CELL_BENCH_ROUTE} from '../dist/loadcell-bench-routing.js';
import {MOTOR_SENSOR_BENCH_ROUTES} from '../dist/motor-sensor-bench-routing.js';
import {FILAMENT_SERVICE_ROUTE} from '../dist/filament-service-routing.js';
import {ServiceFanCurve} from '../dist/service-fan-frame.js';
const result={},reports=[];
function refine(points,count){let p=points.map(p=>p.clone()),knots=[0,0,0,0,1,1,1,1];for(let j=1;j<=count-4;j++){const u=j/(count-3),n=p.length-1;let k=3;while(k<n&&u>=knots[k+1])k++;const q=Array(n+2);for(let i=0;i<=k-3;i++)q[i]=p[i].clone();for(let i=k;i<=n;i++)q[i+1]=p[i].clone();for(let i=k-2;i<=k;i++){const a=(u-knots[i])/(knots[i+3]-knots[i]);q[i]=p[i-1].clone().lerp(p[i],a);}p=q;knots.splice(k+1,0,u);}return p;}
for(const id of ['lbMotorLead','lbLoadcellLead']){
 const targetLength=id==='lbMotorLead'?50:47,old=LOVEBOARD_ROUTES[id],negative=id==='lbLoadcellLead'?LOAD_CELL_BENCH_ROUTE:MOTOR_SENSOR_BENCH_ROUTES[id],poses=[...negative.stages.filter(s=>s.at<0),...old.stages];
 const source=id==='lbMotorLead'?new T.Vector3(...poses[0].points[0]):new T.Vector3(31.2,-55.4,376.7),end=new T.Vector3(...old.stages.at(-1).points.at(-1)),curve=new ServiceFanCurve(Array.from({length:id==='lbMotorLead'?10:9},()=>new T.Vector3()));curve.arcLengthDivisions=2048;
 const tailAt=at=>{
  if(id==='lbLoadcellLead')return at<0?end.clone().add(new T.Vector3(10,-4,8)).lerp(new T.Vector3(42,-36,405),-at):at<.55?end.clone().add(new T.Vector3(10,-4,8)).lerp(end.clone().add(new T.Vector3(8,0,0)),at/.55):end.clone().add(new T.Vector3(8*(1-at)/.45,0,0));
  let hi=poses.findIndex(s=>s.at>=at);if(hi<1)hi=1;const a=poses[hi-1],b=poses[hi];return new T.Vector3(...a.points.at(-1)).lerp(new T.Vector3(...b.points.at(-1)),(at-a.at)/(b.at-a.at));
 };
 const cache=new Map();const oldAt=at=>{if(cache.has(at))return cache.get(at).map(p=>p.clone());
  const tail=tailAt(at),dir=new T.Vector3(id==='lbMotorLead'?-1:1,0,0),out=new T.Vector3(...(id==='lbMotorLead'?[0,0,1]:[1,0,0]));
  const c=new ServiceFanCurve([source.clone(),source.clone(),tail.clone(),tail.clone()]);c.arcLengthDivisions=512;
  const shape=h=>[source.clone(),source.clone().addScaledVector(dir,h),tail.clone().addScaledVector(out,h),tail.clone()];let lo=0,hi=100;
  for(let i=0;i<30;i++){const h=(lo+hi)/2;c.points=shape(h);c.updateArcLengths();if(c.getLength()<targetLength)lo=h;else hi=h;}const result=shape((lo+hi)/2);cache.set(at,result);return result.map(p=>p.clone());
 };
 const shape=(at,bow)=>{
  const tail=tailAt(at),delta=tail.clone().sub(end),motor=id==='lbMotorLead';
  if(!motor){
   // Keep the factory outlet fixed; allow the retained neighbouring loom
   // to flex aside during service without moving its plug or solder pads.
   const entry=tail.clone().add(new T.Vector3(.7,-8,0));
   return[source.clone(),source.clone().add(new T.Vector3(0,4,0)),source.clone().add(new T.Vector3(0,8,0)),source.clone().lerp(entry,.62).setX(source.x).add(new T.Vector3(0,0,-bow)),entry,tail.clone().add(new T.Vector3(2.4,-4,0)),tail.clone().add(new T.Vector3(2.4,-1.5,0)),tail.clone().add(new T.Vector3(1.4,0,0)),tail.clone()];
  }

  const raw=[[9,-36.15,416],[4,-36.15,416],[-2,-36.15,416],[-4,-34.5,417],[-4,-36,425],[-7,-34,434+bow],[-4,-28,432+bow],[-.7952463137,-29,428+bow*.5],[-.7952463137,-26.9352523998,423],end.toArray()];
  const routed=raw.map((p,i)=>new T.Vector3(...p).addScaledVector(delta,T.MathUtils.smoothstep(i/(raw.length-1),.45,1))),original=refine(oldAt(at),raw.length),dress=T.MathUtils.smoothstep(at,0,.85);
  return original.map((p,i)=>{p.lerp(routed[i],dress);const w=i===5||i===6?1:i===7?.5:0;p.z+=bow*(1-dress)*w;p.y+=([0,0,0,0,2,6,6,3,0,0][i])*Math.sin(Math.PI*Math.max(0,at));return p;});
 };
 const length=(at,bow)=>{curve.points=shape(at,bow);curve.updateArcLengths();return curve.getLength();};
 const stages=[];let maxError=0,bowRange=[Infinity,-Infinity];
 for(let k=0;k<=512;k++){
  const at=-1+k/256,target=targetLength;let lo=-10,hi=50;
  // Use the increasing branch of the slack bow; all endpoint datums stay fixed.
  curve.arcLengthDivisions=64;let best=null;for(let q=0;q<=240;q++){const a=-10+q*.25,b=a+.25;if(length(at,a)<=target&&length(at,b)>=target){best=[a,b];break;}}
  if(!best)throw Error(id+' has no length bracket at '+at+' lengths '+[-10,0,10,20,30,40,50].map(b=>[b,length(at,b)]));[lo,hi]=best;curve.arcLengthDivisions=512;lo-=.1;hi+=.1;
  while(length(at,lo)>target)lo-=.1;
  while(length(at,hi)<target)hi+=.1;
  for(let j=0;j<25;j++){const mid=(lo+hi)/2;if(length(at,mid)<target)lo=mid;else hi=mid;}
  const bow=(lo+hi)/2,points=shape(at,bow);maxError=Math.max(maxError,Math.abs(length(at,bow)-target));bowRange=[Math.min(bowRange[0],bow),Math.max(bowRange[1],bow)];stages.push({at,points:points.map(p=>p.toArray())});
 }
 result[id]={length:targetLength,stages};reports.push({id,targetLength,maxError,bowRange,root:source.toArray()});
}
// Grey sensor loom: park the free plug forward of the motor while the
// loadcell is connected; then dress the loop inside the right cover.
const clearance=JSON.parse(fs.readFileSync(new URL('./nextruder-sensor-clearance.json',import.meta.url)));
function clearanceAt(amount){const count=clearance.length-1,j=T.MathUtils.clamp(amount,0,1)*count,i=Math.min(count-1,Math.floor(j)),t=j-i;return {angle:T.MathUtils.lerp(clearance[i].angle,clearance[i+1].angle,t),entryY:T.MathUtils.lerp(clearance[i].entryY,clearance[i+1].entryY,t)};}
const oldFilament=FILAMENT_SERVICE_ROUTE,targetFilamentLength=oldFilament.length;
const prefix=[[24.556553678702826,-54.5952524055465,382.74208359075567],[25.4,-54.5952524,382.45],[26.2,-54.5952524,382.15],[27.2,-54.5952524,381.8],[28.2,-54.5952524,381.5],[29.2,-54.5952524,381.2],[30.2,-54.5952524,381.2],[31.4,-54.5952524,381.2],[31.8,-53,382]].map(p=>new T.Vector3(...p));
const end=new T.Vector3(30.2015536863,-26.9352523998,385.4082213562),heldEnd=new T.Vector3(52,-36,385.4082213562),fc=new ServiceFanCurve(Array.from({length:25},()=>new T.Vector3()));fc.arcLengthDivisions=640;
const filament={length:targetFilamentLength,rightChannelLane:1.15,parkedLoose:true,straightExit:2.1,stages:[]};
function filamentPose(at,neighbor=1){
 const relief=clearanceAt(neighbor),u=Math.max(0,at),dress=T.MathUtils.smoothstep(u,0,.85),tail=u<.55?heldEnd.clone().lerp(end.clone().add(new T.Vector3(8,0,0)),u/.55):end.clone().add(new T.Vector3(8*(1-u)/.45,0,0)),entry=tail.clone().add(new T.Vector3(2.4,-T.MathUtils.lerp(9,relief.entryY,dress),0)),angle=dress*relief.angle;
 const shape=h=>{
  const points=prefix.map(p=>p.clone());for(let i=9;i<=18;i++){const t=(i-8)/11;points.push(prefix[8].clone().lerp(entry,t).add(new T.Vector3(h*Math.cos(angle),0,h*Math.sin(angle)).multiplyScalar(Math.sin(Math.PI*t))));}
  points.push(entry,tail.clone().add(new T.Vector3(2.4,-1.5,0)),tail.clone().add(new T.Vector3(2.1,0,0)),tail.clone().add(new T.Vector3(1.4,0,0)),tail.clone().add(new T.Vector3(.7,0,0)),tail.clone());
  // A planar entry keeps the three strands beside one another at the plug.
  for(let i=18;i<points.length;i++)points[i].z=tail.z;return points;
 };
 const length=h=>{fc.points=shape(h);fc.updateArcLengths();return fc.getLength();};let lo=0,hi=100;if(length(lo)>targetFilamentLength)throw Error('Sensor route too short');
 for(let j=0;j<32;j++){const mid=(lo+hi)/2;if(length(mid)<targetFilamentLength)lo=mid;else hi=mid;}
 return {at,points:shape((lo+hi)/2).map(p=>p.toArray())};
}
for(let k=0;k<=512;k++)filament.stages.push(filamentPose(-1+k/256));
const relief={length:targetFilamentLength,stages:Array.from({length:257},(_,k)=>({...filamentPose(1,k/256),at:k/256}))};
const service={length:targetFilamentLength,stages:Array.from({length:513},(_,k)=>filamentPose(-1+k/256,0))};
result.lbFilamentLead=filament;
for(const id of ['lbMotorLead','lbLoadcellLead'])LOVEBOARD_ROUTES[id]={length:result[id].length,stages:result[id].stages.filter(s=>s.at>=0)};
const load={...result.lbLoadcellLead,source:[31.2,-55.4,376.7],heldTail:[42,-36,405],stages:result.lbLoadcellLead.stages.filter(s=>s.at<=0)};
MOTOR_SENSOR_BENCH_ROUTES.lbMotorLead={...result.lbMotorLead,stages:result.lbMotorLead.stages.filter(s=>s.at<=0)};
const write=(file,name,value)=>fs.writeFileSync(new URL('../dist/'+file,import.meta.url),'// Display cable routes fitted to the official guide and cover clearances. Units: mm.\nexport const '+name+'='+JSON.stringify(value)+';\n');
write('loveboard-service-routing.js','LOVEBOARD_ROUTES',LOVEBOARD_ROUTES);
write('loadcell-bench-routing.js','LOAD_CELL_BENCH_ROUTE',load);
write('motor-sensor-bench-routing.js','MOTOR_SENSOR_BENCH_ROUTES',MOTOR_SENSOR_BENCH_ROUTES);
write('filament-service-routing.js','FILAMENT_SERVICE_ROUTE',result.lbFilamentLead);
fs.appendFileSync(new URL('../dist/filament-service-routing.js',import.meta.url),'// Temporary elastic clearance with the sensor plug retained and Hall pads fixed.\nexport const FILAMENT_SERVICE_RELIEF='+JSON.stringify(relief)+';\n');
fs.appendFileSync(new URL('../dist/filament-service-routing.js',import.meta.url),'// Unplug the sensor after the loadcell, with a continuous connected endpoint.\nexport const FILAMENT_SERVICE_UNPLUG='+JSON.stringify(service)+';\n');
console.log(JSON.stringify(reports));
