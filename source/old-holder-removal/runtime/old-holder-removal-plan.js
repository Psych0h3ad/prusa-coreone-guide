// SPDX-License-Identifier: MIT
import{PUCK_MOUNT as D}from'./puck-mount-data.js';
const cache=new WeakMap(),parents=[150,152,154,156],leaves=[151,153,155,157];
const labels=["M3x8rT 1/4：ゆるめて抜き、保管する", "M3x8rT 2/4：ゆるめて抜き、保管する", "M3x8rT 3/4：ゆるめて抜き、保管する", "M3x8rT 4/4：ゆるめて抜き、保管する"];
export function withOldHolderRemoval(source){
 if(cache.has(source))return cache.get(source);
 const old=source.upgrade?.[1022670];if(!old||old.oldHolderRemoval)return source;
 const [screws,holder]=old.actors;
 if(old.actors.length!==2||old.workspace!=='right-panel'||!screws.remove||screws.destination!=='loose-puck-screws'||screws.refs?.length!==4||!parents.every((r,i)=>screws.refs[i]===r)||holder.refs?.length!==1||holder.refs[0]!==236||!holder.remove)throw Error('Expected retained four-screw and whole-holder source1022670');
 const actors=parents.map((ref,i)=>{
  const stock=D.screws.find(s=>s.nativeCADIndex===leaves[i]);if(!stock)throw Error('Missing native M3x8rT source');
  const p=stock.bearingMM;
  return{...screws,refs:[ref],label:labels[i],showBefore:true,reuse:true,
   officialStepID:1022670,officialLineIDs:[1022671],sourceOperation:i+1,
   axis:screws.axis.slice(),distance:screws.distance,waypoints:[screws.axis.map(x=>x*screws.distance),[0,0,0]],
   spin:360,threadPitchMM:.5,threadStartMM:stock.threadEngagementMM,threadPivot:p,
   threadQualification:'Nominal right-hand M3 thread illustration using the existing whole stock and panel reference; no OEM turn count or torque is prescribed.',
   focusMotion:true,focusBounds:[p[0]-23,p[1]-10,p[2]-10,p[0]+10,p[1]+10,p[2]+10],focusPadding:4,focusMinDistance:165,cameraDirectionCAD:[-1,.65,.7],
   guideRadius:2.4,guideTube:.22,guideArrowLength:5};
 });
 actors.push({...holder,showBefore:true,officialStepID:1022670,officialLineIDs:[1022672,1042454],sourceOperation:5,focusMotion:true,operationFocus:[236],focusPadding:12,focusMinDistance:280,cameraDirectionCAD:[1,1.25,.9]});
 const plan={...old,oldHolderRemovalOriginalPlan:old,actors,pose:'puck-holes-up',camera:'top',viewBounds:[103,-25,96,140,30,151],viewMinDistance:240,undersideView:true,oldHolderRemoval:{guideID:1014628,stepID:1022670,lineIDs:[1022671,1022672,1042454],operations:5,nativeScrews:leaves.slice(),sourceOrderQualification:'The source requires removing four screws before the holder; the per-screw order shown is an authored teaching sequence, not a prescribed OEM tightening/removal order.',viewQualification:'Show the inner screw-head side upward as required by1022671. Source part poses, withdrawal axes and distances remain unchanged; this is a common display frame, not an extra handling action.'}};
 const result={...source,upgrade:{...source.upgrade,1022670:plan}};cache.set(source,result);return result;
}
