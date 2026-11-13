import {PARTS} from './data.js?v=20261112-113';
import {SHORT_INPUT_PTFE as d} from './side-sensor-ptfe-data.js';

// Pure data only: imported by the shared app/director plan bank before CAD loads.
PARTS[d.id]??={name:'側面入力PTFEチューブ 45mm',en:'Side input PTFE tube — 45mm',desc:'右ハンドル下からフィラメントを案内する短いチューブ。',icon:'cable',offset:[0,0,0]};
const id=d.id,out=d.axisOutCAD,inside=out.map(x=>-x),offset=(v,n)=>v.map(x=>x*n),zero={offset:[0,0,0],rotation:[0,0,0]};
const L={insert:['短いPTFEチューブをハンドルへ差し込む','Insert the short PTFE tube into the handle','Zasuňte krátkou PTFE trubičku do rukojeti','Kurzen PTFE-Schlauch in den Griff einsetzen'],push:['短いPTFEチューブをハンドルの内側へ押し通して外す','Push the short PTFE tube through the handle to remove it','Protlačte krátkou PTFE trubičku rukojetí a vyjměte ji','Kurzen PTFE-Schlauch durch den Griff drücken und entnehmen'],feed:['実機の指示が出たら、短いPTFEの先端へフィラメントを挿入する','When prompted on the printer, insert filament into the short PTFE tube tip','Na výzvu tiskárny zasuňte filament do konce krátké PTFE trubičky','Nach Aufforderung am Drucker Filament in das Ende des kurzen PTFE-Schlauchs einführen'],remove:['実機のキャリブレーション完了後、フィラメントを抜く','After calibration finishes on the printer, remove the filament','Po dokončení kalibrace na tiskárně vyjměte filament','Nach Abschluss der Kalibrierung am Drucker das Filament entfernen']};
export const SHORT_INPUT_MESSAGES=Object.fromEntries(Object.values(L).map(a=>[a[0],a.slice(1)]));
const bounds=point=>[...point.map(x=>x-9),...point.map(x=>x+9)];
function insertion(clearanceMM=5){const start=offset(out,d.referenceEngagementMM+clearanceMM),points=[d.innerEndCADMM,d.freeTipCADMM,d.freeTipCADMM.map((x,k)=>x+start[k]),d.mouthCADMM],box=[...[0,1,2].map(k=>Math.min(...points.map(p=>p[k]))-6),...[0,1,2].map(k=>Math.max(...points.map(p=>p[k]))+6)];return{refs:[id],label:L.insert[0],axis:out,distance:0,showBefore:true,focusMotion:true,motionPivot:[0,0,0],posePath:[{offset:start,rotation:[0,0,0]},zero],focusBounds:box,focusPadding:3,focusMinDistance:65,camera:'right-perspective',guideAtAnchor:true,anchors:[[...d.freeTipCADMM]],guideRadius:2.5,guideTube:.13};}
function pushThrough(){const far=offset(inside,45-d.referenceEngagementMM+8);return{refs:[id],label:L.push[0],axis:inside,distance:0,remove:true,destination:'short-ptfe-reserve',showBefore:true,focusMotion:true,motionPivot:[0,0,0],posePath:[{offset:far,rotation:[0,0,0]},zero],focusBounds:bounds(d.mouthCADMM),focusPadding:6,focusMinDistance:65,camera:'hotend-perspective',guideRadius:2.5,guideTube:.13};}
export function withSideSensorInputPtfe(bank){
 const build={...bank.build},upgrade={...bank.upgrade};
 const add=(flow,key,actor,first=false)=>{const p=flow[key];if(!p||p.actors.some(a=>a.refs?.includes(id)))return;flow[key]={...p,actors:first?[actor,...p.actors]:[...p.actors,actor],undersideView:true};};
 add(build,997446,insertion());
 // The original short tube stays in the handle until the explicitly documented
 // upgrade20 push-through removal. It follows the unchanged native handle poses.
 for(const[key,p]of Object.entries(upgrade))if(p.chapter===2&&p.step<20){let changed=false;const actors=p.actors.map(a=>{if(!a.refs?.includes(75)||a.refs.includes(id))return a;changed=true;return{...a,refs:[...a.refs,id]};}),poses=p.workpiecePoses?.map(a=>a.refs?.includes(75)&&!a.refs.includes(id)?(changed=true,{...a,refs:[...a.refs,id]}):a);if(changed)upgrade[key]={...p,actors,...(poses?{workpiecePoses:poses}:{})};}
 add(upgrade,1023411,pushThrough(),true);add(upgrade,1023656,insertion(20));
 return{...bank,build,upgrade};
}
export function shortInputPhaseCaption(phase,text){if(phase==='success'||/remove/.test(phase||''))return text(L.remove);if(/insert/.test(phase||''))return text(L.feed);return '';}
export function shortInputInspection(phase,text){const removal=phase==='success'||/remove/.test(phase||'');return{refs:[id],label:text(removal?L.remove:L.feed),axis:removal?inside:out,distance:0,showBefore:true,inspection:true,focusMotion:true,focusBounds:bounds(d.freeTipCADMM),anchors:[[...d.freeTipCADMM]],guideAtAnchor:true,guideRadius:2.3,guideTube:.1,guideArrowLength:4,guideGhost:false,focusPadding:2,focusMinDistance:42,camera:'hotend-perspective'};}
