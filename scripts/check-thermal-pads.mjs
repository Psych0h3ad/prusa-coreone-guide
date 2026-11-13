import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from '../dist/vendor/three.module.js';
import {v} from './check-viewer.mjs';
import {FLOWS} from '../dist/data.js';
import {SERVICE_TASKS} from '../dist/maintenance-data.js';
import {installMaintenanceModel} from '../dist/maintenance-model.js';
import {XBUDDY_TASK} from '../dist/xbuddy-service-data.js';
import {THERMAL_PAD_FREE_THICKNESS as FREE,XBUDDY_PAD_CONTACT_Y as CONTACT,fittedBoardThickness} from '../dist/thermal-pads.js';

const pads=v.meshes.filter(m=>m.userData.thermalPad),boards=JSON.parse(fs.readFileSync('dist/assets/electronics/boards.json')).boards;
const main=boards.find(b=>b.key==='xBuddy');assert.equal(main.thickness,1.6,'retain nominal laminate specification');
assert(Math.abs(fittedBoardThickness(main)-1.54999)<1e-8,'illustration underside fits CAD supports without moving the front');
assert.equal(fittedBoardThickness(boards.find(b=>b.key==='xBuddyExtension')),1.6,'extension laminate unchanged');
const chooseBuild=(n,p=1)=>{const index=FLOWS.build.steps.findIndex(s=>s.chapter===2&&s.officialStep===n);v.setState({flow:'build',index,comparison:'after',variant:'screw',explore:false,completed:[]});v.autoplayPending=false;v.seek(p);};
const depth=()=>pads.map(m=>m.userData.thermalPad.thickness);
const anchors=()=>{for(const m of pads){const d=m.userData.thermalPad,a=m.geometry.attributes.position;for(let i=0;i<a.count;i++)if(Math.abs(d.free[i*3+1]-d.backY)<1e-7)assert(Math.abs(a.getY(i)-d.backY)<2e-8,'pad remains attached to board underside');}};
const near=(xs,target,tolerance=2e-5)=>xs.forEach(x=>assert(Math.abs(x-target)<tolerance,`${x} vs ${target}`));
chooseBuild(8);near(depth(),FREE);anchors();
chooseBuild(9);near(depth(),2);anchors();
const fitted=depth();
for(const n of[22,23]){chooseBuild(n,.5);depth().forEach((x,i)=>assert(Math.abs(x-fitted[i])<1e-6,'whole-case transfer retains compression'));anchors();}
const binding=installMaintenanceModel(v,[...SERVICE_TASKS,XBUDDY_TASK],a=>a[0]);
const choose=(n,p)=>{v.setState({flow:'service',index:binding.indexOf('xbuddy',n-1),comparison:'after',variant:'screw',explore:false,completed:[]});v.autoplayPending=false;v.seek(p);};
let largestChange=0,previous;
for(let k=0;k<=256;k++){
 choose(15,(5+k/256)/6);const current=depth();anchors();
 for(const [i,d] of current.entries()){assert(d>=1.8&&d<=FREE+1e-7);if(previous)largestChange=Math.max(largestChange,Math.abs(d-previous[i]));}
 previous=current;
}
near(depth(),FREE);choose(17,1);near(depth(),FREE);choose(18,1);near(depth(),2);
let fineChange=0;previous=null;
for(let k=0;k<=4096;k++){choose(15,(5+k/4096)/6);const current=depth();if(previous)current.forEach((d,i)=>fineChange=Math.max(fineChange,Math.abs(d-previous[i])));previous=current;}
assert(fineChange<.015&&fineChange<largestChange*.15,`compression changes converge with smaller time steps: ${largestChange}, ${fineChange}`);
choose(15,(5+.37)/6);const intermediate=depth();choose(18,(1-.37)/6);depth().forEach((d,i)=>assert(Math.abs(d-intermediate[i])<1e-9,'replacement retraces compression state'));
choose(15,0);v.printer.updateMatrixWorld(true);const inv=v.printer.matrixWorld.clone().invert(),minimum=[];
for(const m of pads){const M=inv.clone().multiply(m.matrixWorld),a=m.geometry.attributes.position,p=new T.Vector3();let min=Infinity;for(let i=0;i<a.count;i++)min=Math.min(min,p.fromBufferAttribute(a,i).applyMatrix4(M).y*1000);minimum.push(min-CONTACT);assert(min>=CONTACT-2e-5,'installed pad stays above metal contact plane');}
fs.mkdirSync('research/quality/service-20261105-54',{recursive:true});fs.writeFileSync('research/quality/service-20261105-54/thermal-pad-check.json',JSON.stringify({pads:3,freeThickness_mm:FREE,fittedThickness_mm:depth(),largestChangePer256th_mm:largestChange,largestChangePer4096th_mm:fineChange,minimumGapToMetalPlane_mm:minimum,scope:'Supplemental illustration only. Front/fastener datums and source CAD metalwork unchanged; browser GPU and physical hardware not exercised.'},null,2));
console.log('PASS: 3 thermal pads; free 2.2 mm, fitted 2 mm; board-facing anchors, whole-case transfer, coarse/fine removal continuity, reversible compression and metal contact plane.');
