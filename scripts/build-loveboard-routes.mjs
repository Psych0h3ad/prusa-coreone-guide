import fs from 'node:fs';
import * as T from '../dist/vendor/three.module.js';
import {LoveBoardServiceCable,LOVEBOARD_CABLE_DEFINITIONS} from '../dist/loveboard-service-cables.js';
import {ServiceFanCurve} from '../dist/service-fan-frame.js';
const result={};
for(const d of LOVEBOARD_CABLE_DEFINITIONS){
 const e=new LoveBoardServiceCable(d),poses=e.basePoses,n=e.connected.length;
 const anchors=[...new Set([...Array.from({length:257},(_,i)=>i/256),...poses.map(p=>p.at)])].sort((a,b)=>a-b);
 const raw=amount=>{let hi=poses.findIndex(p=>p.at>=amount);if(hi<1)hi=1;const a=poses[hi-1],b=poses[hi],t=(amount-a.at)/(b.at-a.at);return a.points.map((p,i)=>p.clone().lerp(b.points[i],t));};
 const curve=new ServiceFanCurve(e.connected.map(p=>p.clone()));curve.arcLengthDivisions=320;
 const length=points=>{curve.points=points;curve.updateArcLengths();return curve.getLength();};
 const target=Math.max(...anchors.map(t=>length(raw(t))))+.1;
 const settings={lbMotorLead:{lo:n-11,hi:n-2,axis:[-1,0,1]},lbNtcLead:{lo:1,hi:4,axis:[-1,0,0]},lbLoadcellLead:{lo:0,hi:12,axis:[0,0,1]},lbFilamentLead:{lo:0,hi:10,axis:[0,0,1]},lbMainLead:{lo:n-5,hi:n-2,axis:[-1,0,1]}}[d.id],axis=new T.Vector3(...settings.axis).normalize();
 const stages=anchors.map(at=>{const base=raw(at),shape=amount=>base.map((p,i)=>p.clone().addScaledVector(axis,i<=settings.lo||i>=settings.hi?0:amount*Math.sin(Math.PI*(i-settings.lo)/(settings.hi-settings.lo))));let lo=0,hi=1;while(length(shape(hi))<target&&hi<128)hi*=2;if(hi>=128)throw Error('No length bracket '+d.id);for(let i=0;i<26;i++){const mid=(lo+hi)/2;if(length(shape(mid))<target)lo=mid;else hi=mid;}const points=shape((lo+hi)/2);return {at,points:points.map(p=>p.toArray())};});
 result[d.id]={length:target,stages};e.geometry.dispose();for(const m of e.mesh.material)m.dispose();console.log(d.id,'fixed centreline',target.toFixed(4),'mm',stages.length,'poses');
}
fs.writeFileSync('dist/loveboard-service-routing.js','// Precomputed fixed-length centreline poses. Mating axes and endpoints stay fixed.\nexport const LOVEBOARD_ROUTES='+JSON.stringify(result)+';\n');
