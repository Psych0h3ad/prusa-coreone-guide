import{TENSIONER_INSTALLATION_DATA as D}from'./tensioner-installation-source.js';
import{ORIGINAL_TENSIONER_DATUMS as A}from'./original-tensioner-source.js';
const z=[0,0,0],label=k=>D.labels[k][0],key=id=>'tensionerMountAllen'+id,map=(stage,lines)=>Object.fromEntries(Object.entries(D.source).map(([edition,s])=>[edition,{guideID:s.guideID,stepID:s.steps[stage].stepID,lineIDs:lines.map(i=>s.steps[stage].lineIDs[i]),photoIDs:s.steps[stage].photoIDs}]));
function actor(refs,text,path,stage,lines,extra={}){return{refs,label:text,axis:[0,0,1],waypoints:path,focusMotion:true,guideGhost:false,originalTensionerSource:map(stage,lines),...extra};}
function mounting(id,body,stage,line){
 const f=D.screws[id],start=[0,0,f.finalAdvanceMM],camera=stage?'corexy-right-perspective':'corexy-left-perspective',focus={camera,focusRefs:[id,body,key(id)],focusMinDistance:160},axis=f.axis;
 const outside=start.map((x,i)=>x-axis[i]*30),removed=start.map((_,i)=>-axis[i]*35);
 if(id===444)return indexedLeft18(stage,line,'splitter-prep-perspective');
 return[
  actor([id],label('insert'+id),[[0,0,f.lengthMM+6],start],stage,[line],{camera,focusRefs:[id,body],focusMinDistance:120}),
  actor([key(id)],A.labels.keyIn[0],[outside,start],stage,[line],focus),
  actor([id,key(id)],label(id===444?'tighten18':'tighten30'),[start,z],stage,[line],{...focus,reuse:true,axis,motionPivot:f.originMM,posePath:[{offset:start,rotation:z},{offset:z,rotation:axis.map(v=>v*f.finalAdvanceMM/.5*360)}]}),
  actor([key(id)],A.labels.keyOut[0],[removed,z],stage,[line],{...focus,reuse:true,remove:true,destination:'removed'})];
}
function indexedLeft18(stage,line,camera){
 const f=D.screws[444],axis=f.axis,rotation=n=>axis.map(v=>v*n*180),offset=z=>[0,0,z],actors=[actor([444],label('insert444'),[[0,0,24],[0,0,2.5]],stage,[line],{camera,focusRefs:[444,400],focusMinDistance:120})];
 for(let n=0;n<10;n++){
  const component='tensionerMountAllen444pose'+(n%2),a=2.5-n*.25,b=a-.25,focus={camera,focusRefs:[444,400,component],focusMinDistance:160,motionPivot:f.originMM};
  actors.push(actor([component],A.labels.keyIn[0],[offset(a+35),offset(a)],stage,[line],{...focus,reuse:n>=2,posePath:[{offset:offset(a+35),rotation:rotation(n)},{offset:offset(a),rotation:rotation(n)}]}));
  actors.push(actor([444,component],label('halfTurn18'),[offset(a),offset(b)],stage,[line],{...focus,reuse:true,axis,posePath:[{offset:offset(a),rotation:rotation(n)},{offset:offset(b),rotation:rotation(n+1)}]}));
  actors.push(actor([component],label('reindex'),[offset(b+35),offset(b)],stage,[line],{...focus,reuse:true,remove:true,destination:'removed',posePath:[{offset:offset(b+35),rotation:rotation(n)},{offset:offset(b+35),rotation:rotation(n+1)},{offset:offset(b),rotation:rotation(n+1)}]}));
 }
 return actors;
}
export function withTensionerFrameInstallation(source){
 const build={...source.build};for(const[stage,id,side,body,refs]of[[0,990420,'left',400,[440,442,444]],[1,990472,'right',396,[446,448,450]]]){
  const old=build[id];if(!old)throw Error('Current whole-root installation source step missing '+id);
  const camera=stage?'corexy-right-perspective':'corexy-left-perspective',actors=[];
  if(!stage)actors.push(actor([373],label('orientation'),[z,z],0,[0],{inspection:true,camera,focusRefs:[373]}));
  actors.push(actor([],label(stage?'rightPacket':'leftPacket'),[[0,0,40],z],stage,stage?[0,1]:[1,2],{scope:side+'-tensioner',camera,focusRefs:[body,stage?375:374],focusMinDistance:180}));
  for(const native of refs)actors.push(...mounting(native,body,stage,stage?2:native===444?4:3));
  build[id]={...old,actors,note:D.notes[stage][0],overview:false,pose:'top-outside',camera,operationPadding:6,focus:[body],guideGhost:false};
 }
 return{...source,build};
}
