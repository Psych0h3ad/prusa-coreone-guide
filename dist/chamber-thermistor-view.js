// View/guide metadata only. MIT; see the chamber reference model notice.
import * as T from 'three';
import {tempHead,seatedOutlet,tempBodyOffset} from './chamber-temp-route.js';
import {probeHandling} from './chamber-temp-handling.js';
const bench=[100,-120,80],onBench=p=>p.map((n,i)=>n+bench[i]);
const hole=[-.5,185.8,335],caseEntry=tempHead(1).toArray(),port=seatedOutlet().toArray();
const box=(p,d)=>p.map((n,i)=>n-d[i]).concat(p.map((n,i)=>n+d[i]));
const openingBounds=[-18,170,306,17,202,355],caseBounds=box(caseEntry,[15,18,31]),portBounds=box(port,[13,14,17]);
const probeBounds=[45,5,438,137,126,493],probeAnchor=onBench([13,179,376]),tieBounds=box(onBench([-.5,178.3,353.7]),[14,16,17]);
function focus(a,b,anchor,camera,min=85){Object.assign(a,{camera,focusBounds:b.slice(),focusPadding:3,focusMinDistance:min,anchors:[anchor.slice()]});}
export function applyChamberThermistorView(p,index,text){
 for(const a of p.actors){
  a.label=a.label?.replace(/·\s*Temp$/u,'· TEMP');
  if(a.flex?.includes('cfTemp')){
   if(index===16&&a.fromStates.cfTemp===1.1&&a.to===2){
    focus(a,caseBounds,caseEntry,'fan-perspective');a.label=text(['TEMPケーブルを左上の穴へ通す','Feed the TEMP cable through the upper-left opening','Provléct kabel TEMP levým horním otvorem','TEMP-Kabel durch die obere linke Öffnung führen']);
   }else if(a.fromStates.cfTemp>=2&&a.to>=2){
    focus(a,portBounds,port,'xbuddy-board-perspective',75);
   }else if(index===10){
    focus(a,openingBounds,hole,'rear-wiring-perspective',95);a.label=text(['TEMPケーブルを二つの開口から引き戻す','Pull the TEMP cable back through both openings','Vytáhnout kabel TEMP zpět oběma otvory','TEMP-Kabel durch beide Öffnungen zurückführen']);
   }
  }
  if(a.flex?.includes('ctProbeHandling'))focus(a,probeBounds,a.to===0?onBench([20,179,372.3]):probeAnchor,'front',100);
  if(a.flex?.some(id=>['ctOldGridTie','ctNewGridTie'].includes(id)))focus(a,tieBounds,onBench([-.5,178.3,353.7]),'back',85);
 }
 if(index===16){p.camera='fan-perspective';p.viewBounds=caseBounds.slice();p.viewMinDistance=85;}
 if(index===11||index===13){p.camera='front';p.viewBounds=probeBounds.slice();p.viewMinDistance=100;}
}
export function chamberTempTeachingGuide(to,from){
 // Display only the relevant portion of the unchanged actual head path.
 // This does not change its material writer, actor clock or native pose.
 let a=from,b=to;
 if(from===2&&to===0){a=.55;b=.35;}
 else if(from===0&&to===1){a=.35;b=.55;}
 else if(from===1.1&&to===2)b=1.55;
 const parameters=Array.from({length:41},(_,i)=>T.MathUtils.lerp(a,b,i/40));let target;
 if((from===2&&to===0)||(from===0&&to===1))target=crossing(.35,.55,u=>tempHead(u).z,335,false);
 else if(from===1.1&&to===2)target=crossing(1.35,1.65,u=>tempHead(u).z,247.15,false);
 if(target!==undefined)parameters.push(target);parameters.sort((x,y)=>a<b?x-y:y-x);
 const points=parameters.map(u=>tempHead(u).multiplyScalar(.001));points.targetIndex=target===undefined?points.length-1:parameters.indexOf(target);return points;
}
function crossing(lo,hi,value,at,increasing){for(let i=0;i<45;i++){const mid=(lo+hi)/2;if((value(mid)<at)===increasing)lo=mid;else hi=mid;}return(lo+hi)/2;}
export function chamberProbeTeachingGuide(to,from){
 // A display cue for the first genuine bore passage of this operation,
 // rather than the whole-part parking point. Every point is sampled from
 // the unchanged rigid-probe path, with the circle on the native grid plane.
 const remove=to>from,a=remove?.2:.9,b=remove?.45:.75,target=remove?crossing(.2,.45,u=>probeHandling(u).root.y,179,true):crossing(.75,.9,u=>probeHandling(u).root.y,179,false),parameters=Array.from({length:41},(_,i)=>T.MathUtils.lerp(a,b,i/40));parameters.push(target);parameters.sort((x,y)=>a<b?x-y:y-x);
 const points=parameters.map(u=>{const h=probeHandling(u);return h.root.add(tempBodyOffset(0)).add(h.shift).multiplyScalar(.001);});points.targetIndex=parameters.indexOf(target);return points;
}
