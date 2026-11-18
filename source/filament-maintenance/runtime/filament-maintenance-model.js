import {accessScene,ARM,CLAMP,IDLER_PIVOT,CLAMP_PIVOT} from './maintenance-access.js';
import {FILAMENT_COPY as C} from './filament-maintenance-data.js';
const rotate=(refs,pivot,y)=>({refs,pivot,rotation:[0,y,0],offset:[0,0,0]});
const ref='workingPLA',broken='workingFragment';
function material(plan,id,from,to,label,text){plan.actors.push({refs:[id],flex:[id],fromStates:{[id]:from},to,label:text(label),axis:[0,0,-1],distance:0,showBefore:true,focusMotion:true,focusBounds:[-38,-113,315,40,-30,507],focusMinDistance:145,camera:'service-drive-side'});if(to===435)plan.actors.push({refs:[id],flex:[id],fromStates:{[id]:435},to:515,label:text(['抜いた材料全体を入口から離す','Move all removed material clear of the inlet','Přemístit celý vyjmutý materiál mimo vstup','Vollständig entferntes Material vom Einlass wegnehmen']),axis:[1,0,0],distance:0,showBefore:true,focusMotion:true,camera:'service-drive-side'});}
export function filamentMaintenanceScene(task,index,text){
 if(!task.filamentMaintenance)return null;
 const step=task.steps[index],feed=task.id==='feed-clear',fragment=task.id==='fragment',manual=task.id==='coldpull-manual',id=step.id;
 if(manual)return null; // Existing stable-ID cold-pull access phases are decorated below.
 const opening=index===(feed?1:0),closeArm=index===(feed?6:3),closeInlet=index===(feed?7:4),held=index>(feed?1:0)&&!closeArm&&!closeInlet;
 const spec={plan:{workspace:'printer',pose:'printer-standing',chapter:10,step:index+1,actors:[],focus:step.refs,inspectRefs:step.refs,inspectionLabel:text(step.title),solidRefs:[],transparentRefs:[],contextOpacity:.08,headOnly:true},hidden:[],disconnect:false,flexStates:{}};
 if(!opening&&!held&&!closeArm&&!closeInlet)return decorateFilamentMaintenance(spec,task,index,text);
 accessScene({id:'feed-clear'},opening?1:closeArm||closeInlet?4:2,text,spec);
 const p=spec.plan;p.filament={task:task.id,reference:text(C.reference)};
 if(closeArm)p.actors=p.actors.filter(a=>['arm','clamp'].includes(a.accessRole));
 if(closeInlet)p.actors=p.actors.filter(a=>['fitting','guide'].includes(a.accessRole));
 if(fragment&&(closeArm||closeInlet))for(const a of p.actors)a.label=text(step.title);
 const armOpen=!closeInlet&&!closeArm;
 Object.assign(p.access,{feed:true,inletHeld:!opening&&!closeInlet,sidePark:-35,inletLift:8,guideLift:1,armHold:opening||closeArm?undefined:armOpen?-10:0,clampHold:opening||closeArm?undefined:armOpen?45:0});
 if(!opening&&!closeArm)p.workpiecePoses=[rotate(ARM,IDLER_PIVOT,armOpen?-10:0),rotate(CLAMP,CLAMP_PIVOT,armOpen?45:0)];
 if(feed&&index===4)material(p,ref,435,328,C.feed,text);
 if(feed&&index===5)material(p,ref,328,435,C.withdraw,text);
 if(fragment&&index===2)material(p,broken,350,435,C.fragment,text);
 const visibleMaterial=feed&&index>=4?ref:fragment?broken:null;
 if(visibleMaterial){p.visibleRefs=[visibleMaterial];p.solidRefs.push(visibleMaterial);spec.flexStates[visibleMaterial]=fragment?(index<=2?350:515):index===4?435:index===5?328:515;}
 return decorateFilamentMaintenance(spec,task,index,text);
}
export function decorateFilamentMaintenance(spec,task,index,text){
 if(!task.filamentMaintenance)return spec;
 const p=spec.plan,id=task.steps[index].id,manual=task.id==='coldpull-manual';
 p.filament??={task:task.id,reference:text(C.reference)};
 p.access??={feed:true,inletHeld:false,armHold:0,clampHold:0};
 if(p.access){p.access.sidePark=-35;p.access.inletLift=8;p.access.guideLift=1;p.access.feed=true;for(const a of p.actors||[])if(a.accessRole==='guide'){a.posePath=[{offset:[0,0,p.access.closing?1:0],rotation:[0,0,0]},{offset:[0,0,p.access.closing?0:1],rotation:[0,0,0]}];}else if(a.accessRole==='fitting'){const poses=[{offset:[0,0,0],rotation:[0,0,0]},{offset:[0,0,8],rotation:[0,0,1080]},{offset:[-35,0,8],rotation:[0,0,1080]}];a.posePath=p.access.closing?poses.reverse():poses;}}
 if(manual){
  if(id==='manual-load')p.access.materialLoadedHold=true;

  const values={'manual-load':[435,328,C.feed],'manual-fill':[328,320,C.push],'manual-cool-fill':[320,319.5,C.push],'manual-pull':[319.5,435,C.pull]};
  if(values[id]){const[a,b,label]=values[id];material(p,ref,a,b,label,text);}
  const states={'manual-load':435,'manual-idler-open':328,'manual-fill':328,'manual-cool-fill':320,'manual-wait':319.5,'manual-pull':319.5,'manual-idler-close':515,'manual-inlet-refit':515,'manual-result':515};
  if(Object.hasOwn(states,id)){spec.flexStates[ref]=states[id];p.visibleRefs=[...(p.visibleRefs||[]),ref];p.solidRefs=[...(p.solidRefs||[]),ref];}
 }
 if((p.actors||[]).some(a=>a.flex?.includes(ref)||a.flex?.includes(broken))||p.visibleRefs?.some(r=>[ref,broken].includes(r))){
  p.headOnly=true;p.camera='service-drive-side';p.viewBounds=[-43,-115,314,45,-27,512];p.viewMinDistance=155;p.focus=[ref,broken,794,'regionTube'];p.inspectRefs=['regionTube'];p.contextOpacity=.08;
  p.transparentRefs=[...new Set([...(p.transparentRefs||[]),790,794,'mainPlate','regionTube','regionHeatbreak'])];
  p.solidRefs=(p.solidRefs||[]).filter(r=>![790,794,'mainPlate','regionTube','regionHeatbreak'].includes(r));
  p.inspectionLabel=text(task.steps[index].title);
 }
 return spec;
}

