import fs from 'node:fs';import * as T from '../dist/vendor/three.module.js';import {LoveBoardServiceCable,LOVEBOARD_CABLE_DEFINITIONS}from '../dist/loveboard-service-cables.js';import {LOVEBOARD_ROUTES}from '../dist/loveboard-service-routing.js';import {ServiceFanCurve}from '../dist/service-fan-frame.js';
import {loadMolexCad}from '../dist/molex-cad.js?v=20261111-94';
globalThis.fetch=async p=>({ok:true,json:()=>JSON.parse(fs.readFileSync('dist/'+p.split('?')[0])),arrayBuffer:()=>{const b=fs.readFileSync('dist/'+p.split('?')[0]);return b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength);}});
await loadMolexCad();
for(const id of['lbMotorLead','lbLoadcellLead']){
 const d=LOVEBOARD_CABLE_DEFINITIONS.find(d=>d.id===id),e=new LoveBoardServiceCable(d),source=new T.Vector3(...d.points[0]),dir=new T.Vector3(...d.routeShape.sourceDirection),curve=new ServiceFanCurve(e.connected),stages=[];curve.arcLengthDivisions=320;const anchors=[...new Set([...Array.from({length:257},(_,i)=>i/256),...e.basePoses.map(p=>p.at)])].sort((a,b)=>a-b);
 for(const at of anchors){let hi=e.basePoses.findIndex(p=>p.at>=at);if(hi<1)hi=1;const a=e.basePoses[hi-1],b=e.basePoses[hi],tail=a.points.at(-1).clone().lerp(b.points.at(-1),(at-a.at)/(b.at-a.at));const shape=L=>[source.clone(),source.clone().addScaledVector(dir,L),tail.clone().addScaledVector(e.out,L),tail.clone()];const length=L=>{curve.points=shape(L);curve.updateArcLengths();return curve.getLength();};let low=0,high=128;if(length(low)>d.routeShape.length||length(high)<d.routeShape.length)throw Error('Invalid length bracket');for(let i=0;i<30;i++){const mid=(low+high)/2;if(length(mid)<d.routeShape.length)low=mid;else high=mid;}stages.push({at,points:shape((low+high)/2).map(p=>p.toArray())});}
 LOVEBOARD_ROUTES[id]={length:d.routeShape.length,stages};console.log(id,d.routeShape.length,stages.length);
}
fs.writeFileSync('dist/loveboard-service-routing.js','// Precomputed fixed-length centreline poses. Mating axes and endpoints stay fixed.\nexport const LOVEBOARD_ROUTES='+JSON.stringify(LOVEBOARD_ROUTES)+';\n');

