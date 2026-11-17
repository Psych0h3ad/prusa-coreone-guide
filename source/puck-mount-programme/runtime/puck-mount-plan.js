// SPDX-License-Identifier: MIT
import{PUCK_MOUNT as D}from'./puck-mount-data.js';
const cache=new WeakMap(),N=D.normal.map(x=>-x),body='puckMountBody',screws=D.screws.map(s=>s.component),packet=[52,body,...screws];
const point=(offset,rotation=[0,0,0])=>({offset,rotation});
const view={focusBounds:[110,-35,85,165,40,165],focusMinDistance:260,cameraDirectionCAD:[-1,.7,.8]};
function programme(p,flow){
 const s=D.sources[flow],base={originalOmit:true,officialStepID:s.stepID,puckMountSource:{...s},showBefore:true,focusMotion:true,reuse:true,...view};
 const handling=(refs,key,lineIDs,poses,extra={})=>({...base,refs,label:D.labels[key][0],officialLineIDs:lineIDs,handling:true,axis:N,distance:0,motionPivot:D.pivot,posePath:poses,...extra});
 const actors=[
  handling([body],'place',s.place,[point([-25,0,30]),point([-25,0,0]),point([0,0,0])],{focusPadding:8,focusBounds:[96,-35,85,165,40,188],focusMinDistance:240}),
  handling([52],'panel',s.panel,[point([-65,0,0]),point([0,0,0])],{showBefore:false,focusBounds:[98,-35,88,145,40,160],focusPadding:8,focusMinDistance:280}),
  ...D.screws.map((screw,i)=>({...base,showBefore:false,focusBounds:[D.pivot[0]-24,screw.bearingMM[1]-9,screw.bearingMM[2]-9,D.pivot[0]+10,screw.bearingMM[1]+9,screw.bearingMM[2]+9],focusPadding:4,focusMinDistance:160,refs:[screw.component],label:D.labels['screw'+i][0],officialLineIDs:s.screws,axis:N,distance:18,waypoints:[N.map(x=>x*18),[0,0,0]],spin:360,threadPitchMM:.5,threadStartMM:screw.threadEngagementMM,threadPivot:screw.bearingMM,nominalThreadQualification:'Nominal right-hand M3 pitch demonstration; no OEM prescribed turn count or torque.'})),
  handling(packet,'turn',s.screws,[point([0,0,0]),point([-D.turnLiftMM,0,0]),point([-D.turnLiftMM,0,0],[0,0,180]),point(D.turnEndOffsetMM,[0,0,180])],{destination:'right-panel',showBefore:false,sourceHandlingQualification:'3Dでは持ち替えの一例として、固定後のパネルを持ち上げ、ホルダー差込口を上に返して支えます。ねじ頭が箱に触れない位置で保持する例で、公式で追加の必須作業や持ち上げ量を指定したものではありません。',sourceDerivedRestoration:true,focusBounds:[-130,-190,-34,260,190,329],focusMinDistance:770})
 ];
 return{...p,puckMountOriginalPlan:p,workspace:'puck-mount',pose:'puck-holes-up',seed:[...new Set([...(p.seed||[]),52,'puckMountBox'])],contextFrom:[],actors,focus:[52,body,...screws],solidRefs:[52,body,...screws,'puckMountBox'],workpiecePoses:[],viewMinDistance:630,camera:'perspective',puckMountAssembly:{stepID:s.stepID,operations:7,wholePuckFaces:9832,wholePanelFaces:5574,wholeScrewFaces:9048,physicalQualification:'Exact unchanged source surfaces with source-measured rigid registrations. Full moving-neighbour contact audit is still pending.'}};
}
export function withPuckMountAssembly(source){
 if(cache.has(source))return cache.get(source);if(source.build?.[997250]?.puckMountAssembly&&source.upgrade?.[1022736]?.puckMountAssembly)return source;
 const carry=p=>{let changed=false;const workpiecePoses=p.workpiecePoses?.map(q=>{if(!q.refs?.some(r=>r==='puck'||r==='spoolNew'))return q;changed=true;return{...q,refs:[...new Set([...q.refs,...D.screws.map(s=>s.nativeCADIndex)])]};});return changed?{...p,workpiecePoses}:p;};
 const result={...source};for(const flow of['build','upgrade']){const id=D.sources[flow].stepID,p=source[flow]?.[id];if(p)result[flow]={...Object.fromEntries(Object.entries(source[flow]).map(([id,p])=>[id,carry(p)])),[id]:programme(p,flow)};}
 const old=result.upgrade?.[1022670];if(old)result.upgrade[1022670]={...old,sourceRetentionQualification:'Official1022671 removes four M3x8rT;1042454 permits disposal of the old holder only. Retain the four complete screws for1022740.',actors:old.actors.map(a=>a.refs?.some(r=>[150,152,154,156].includes(r))?{...a,destination:'loose-puck-screws'}:a)};
 cache.set(source,result);return result;
}
