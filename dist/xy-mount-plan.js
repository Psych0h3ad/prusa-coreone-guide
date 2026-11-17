import {XY_MOUNT_SOURCE} from './xy-mount-source.js';
import {XY_MOUNT_FRAMES} from './xy-mount-frames.js';
const p=(offset)=>({offset,rotation:[0,0,0]});
// The tool's2mm centre blade seats between the two complete pulley cap planes.
//374 rounded the source STL origin and pushed the barrels into the smaller
//5.95mm cups. Use the open-mouth flange-support position, in TOOL axes.
export const XY_MOUNT_ENGAGEMENT={openMouthMM:3,axialPlaneCorrectionMM:.00041170278564095497};
function sourceMap(stage,indices){return Object.fromEntries(Object.entries(XY_MOUNT_SOURCE).map(([edition,x])=>[edition,{guideID:x.guideID,stepID:x.steps[stage].stepID,lineIDs:indices.map(i=>x.steps[stage].lineIDs[i]),photoIDs:x.steps[stage].photoIDs}]));}
function actor(refs,label,path,stage,lines,extra={}){return {refs,label,axis:[0,1,0],motionPivot:[0,0,0],focusMotion:true,guideGhost:false,posePath:path.map(p),xyMountSource:sourceMap(stage,lines),...extra};}
export function xyMountPlans(side,oldI={},oldII={}){
 const f=XY_MOUNT_FRAMES[side],right=side==='right',stage=right?0:2,dx=f.pair[0]-XY_MOUNT_FRAMES.right.pair[0],angle=right?0:-5,r=angle*Math.PI/180,d=XY_MOUNT_ENGAGEMENT.openMouthMM,toolPose={refs:['xyMountAssemblyTool'],offset:[dx-Math.sin(r)*d,Math.cos(r)*d,XY_MOUNT_ENGAGEMENT.axialPlaneCorrectionMM],rotation:[0,0,angle],pivot:XY_MOUNT_FRAMES.right.pair},lower=`xyMount${side}Lower`,upper=`xyMount${side}Upper`,single=`xyMount${side}Single`,packet=[lower,f.spacer,upper,'xyMountAssemblyTool'],benchX=right?0:.5;
 const base={workspace:right?'right-mount':'left-mount',overview:false,pose:'top-outside',camera:'back-perspective',workpiecePoses:[toolPose],focus:[f.mount,...packet],settledFocus:[f.mount],focusPadding:12,operationPadding:10};
 return [{...oldI,...base,seed:[f.mount],actors:[
  actor(['xyMountAssemblyTool'],'マルチツールを手で支える',[[benchX,80,0],[benchX,80,0]],stage,[0],{handling:true}),
  actor([lower],'下側のプーリーを工具へ1個入れる',[[benchX,50,0],[benchX,80,0]],stage,[0]),
  actor([f.spacer],'3.2/6×2スペーサーをプーリーへ重ねる',[[benchX,50,0],[benchX,80,0]],stage,[1]),
  actor([upper],'上側のプーリーを工具へ1個入れる',[[benchX,50,0],[benchX,80,0]],stage,[2]),
  actor(packet,'面取りの向きを合わせ、プーリー一式を工具ごと入れる',right?[[0,80,0],[0,0,0]]:[[.5,80,0],[.5,20,0],[0,0,0]],stage,right?[3]:[3,4],{reuse:true,carry:true})
 ],note:'面取りの向きを確認し、工具上でプーリーとスペーサーを重ねてからマウントへ入れます。'},
 {...oldII,...base,seed:[],focus:[f.mount,...packet,single],actors:[
  {refs:[f.longScrew],label:'M3×30ネジを入れ、ゆっくり締める',axis:[0,0,1],waypoints:[[0,0,30],[0,0,0]],spin:-21600,focusMotion:true,guideGhost:false,xyMountSource:sourceMap(stage+1,[0,1,2])},
  {refs:['xyMountAssemblyTool'],label:'ネジで固定してから工具を抜く',axis:[0,1,0],waypoints:right?[[0,60,0],[0,0,0]]:[[.5,60,0],[.5,20,0],[0,0,0]],remove:true,destination:'removed',focusMotion:true,guideGhost:false,xyMountSource:sourceMap(stage+1,[3])},
  actor([single],'残りのプーリーを隣のポケットへ入れる',[[0,45,0],[0,0,0]],stage+1,[4]),
  {refs:[f.shortScrew],label:'M3×18ネジを締め、頭がマウントに当たったところで止める',axis:[0,0,1],waypoints:[[0,0,18],[0,0,0]],spin:-12960,focusMotion:true,guideGhost:false,xyMountSource:sourceMap(stage+1,[5])},
  ...(right?[actor(['xyMountRightM3nS'],'右マウントの溝へM3nSナットを1個入れる',[[0,15,0],[0,0,0]],stage+1,[6])]:[])
 ],note:'ネジを1本ずつ締め、頭がマウントに当たったところで止めます。M3×30で固定してから工具を抜きます。'}];
}
export function withXYMountAssembly(source){const build={...source.build};for(const side of ['right','left']){const ids=side==='right'?[989706,989784]:[989828,989906],plans=xyMountPlans(side,...ids.map(id=>build[id]));ids.forEach((id,i)=>{build[id]=plans[i];});}return {...source,build};}
