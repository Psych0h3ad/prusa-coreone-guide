// SPDX-License-Identifier: MIT
// The annotation datums come from longitudinal edges of the complete Prusa
// source rods. They identify a surface; no rod or bearing is displaced.
export const Y_ROD_GUIDE_SOURCE='https://help.prusa3d.com/article/regular-printer-maintenance-core-one_829710';
export const Y_ROD_SURFACES=[
 {id:377,edge:[[-173.1731419572215,-186.19998648948194,322.99735644040663],[-173.1731419571604,137.79999683526353,322.99736760828984]]},
 {id:566,edge:[[172.82684363352698,-186.19998648929482,322.99735644040663],[172.82684404220896,137.79999683545068,322.99736760828984]]}
];
const areas=[{side:0,y:-115,range:[-155,-75],name:['左ロッド・前側','Left rod · front','Levá tyč · přední část','Linke Stange · vorne']},{side:0,y:65,range:[0,120],name:['左ロッド・後側','Left rod · rear','Levá tyč · zadní část','Linke Stange · hinten']},{side:1,y:-115,range:[-155,-75],name:['右ロッド・前側','Right rod · front','Pravá tyč · přední část','Rechte Stange · vorne']},{side:1,y:65,range:[0,120],name:['右ロッド・後側','Right rod · rear','Pravá tyč · zadní část','Rechte Stange · hinten']}];
const operation=[['清掃する範囲','Area to wipe','Oblast čištění','Bereich zum Abwischen'],['少量塗る位置','Apply a small amount here','Místo pro malé množství maziva','Hier wenig Schmiermittel auftragen'],['動きを確認する箇所','Check movement here','Místo kontroly pohybu','Hier Leichtgängigkeit prüfen']];
export function rodSurfacePoint(side,y){const [a,b]=Y_ROD_SURFACES[side].edge,t=(y-a[1])/(b[1]-a[1]);if(t<0||t>1||!Number.isFinite(t))throw Error('Y rod guide must stay on the source surface');return a.map((v,i)=>v+(b[i]-v)*t);}
export function routineMaintenanceScene(task,index,text){
 if(!task.routineRod)return null;if(task.id!=='rod'||index<0||index>2)throw Error('Unknown Y rod maintenance stage');
 const selected=index===2?[areas[1],areas[3]]:areas;
 const actors=selected.map(area=>{const p=rodSurfacePoint(area.side,area.y),x=p[0],z=p[2];return{refs:[Y_ROD_SURFACES[area.side].id],label:text(area.name)+' — '+text(operation[index]),axis:[0,0,1],distance:0,inspection:true,showBefore:true,focusMotion:true,anchors:[p],guideRadius:2.5,guideTube:.35,guideArrowLength:10,focusBounds:[x-18,area.range[0],z-14,x+18,area.range[1],z+32],focusPadding:10,focusMinDistance:125,camera:'top-perspective'};});
 return{plan:{workspace:'printer',pose:'printer-standing',chapter:10,step:index+1,camera:'top-perspective',focus:[377,566],focusPadding:18,viewBounds:actors[0].focusBounds,viewMinDistance:125,operationPadding:10,contextOpacity:.07,transparentRefs:[48,52,373,89,572,570],solidRefs:[377,566],actors,seed:[],note:''},hidden:[],disconnect:false,flexStates:{serviceHotendFanLead:1,servicePrintLead:1}};
}
