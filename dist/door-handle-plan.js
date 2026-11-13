import{DOOR_HANDLE as d}from'./door-handle-data.js?v=20261113-119';
const ids=['doorHandlePlate','doorHandleScrew0','doorHandleScrew1'];
// The door and handle keep their existing continuous bench-to-upright move.
// New hardware is positioned in that same final frame, then fitted in order.
const upright=p=>[d.pivot[0]-(p[1]-d.pivot[1]),d.pivot[1]+p[0]-d.pivot[0]-12,p[2]];
export function withDoorHandleFastening(bank){
 const old=bank.build[d.step];if(!old||old.variant!=='screw'||old.actors.length!==1||!old.actors[0].handling)throw Error('Unexpected door handle operation');
 const common={focusMotion:true,focusPadding:5,focusMinDistance:65,guideRadius:3,guideTube:.15,guideArrowLength:5};
 const screws=d.holes.map(([x,z],i)=>{
  const pivot=upright([x,d.screwBearingY+d.screwHeadHeight,z]);
  return{...common,refs:[ids[i+1]],label:`M3x8rT ${i+1}本目：差し込んで軽く締める`,axis:[-1,0,0],distance:18,
   motionPivot:pivot,posePath:[{offset:[-18,0,0],rotation:[0,0,0]},{offset:[-2,0,0],rotation:[0,0,0]},{offset:[0,0,0],rotation:[1440,0,0]}],poseTiming:[.6,.4],
   anchors:[pivot],focusRefs:[ids[i+1]],camera:'left-cover-perspective',officialLine:1075328};
 });
 const plan={...old,note:'プレートのネジ支柱をパネルから離れる向きにそろえ、2本を1本ずつ軽く締めます。',
  workpiecePoses:[...(old.workpiecePoses||[]),{refs:ids,pivot:d.pivot,rotation:[0,0,90],offset:d.uprightOffset}],
  actors:[old.actors[0],{...common,focusPadding:40,refs:[ids[0]],label:'固定プレートを外側から差し込む',axis:[0,-1,0],distance:30,camera:'door-upright-perspective',focusRefs:[ids[0]],officialLine:1075312},...screws],
  settledFocus:[572,590,...ids],photoCheck:undefined};
 const next=bank.build[999206];if(!next?.actors.some(a=>a.scope==='door-panel'))throw Error('Unexpected door handoff');
 const install={...next,workpiecePoses:next.workpiecePoses.map(p=>p.refs.includes(572)&&p.refs.includes(590)?{...p,refs:[...p.refs,...ids]}:p)};
 return{...bank,build:{...bank.build,[d.step]:plan,999206:install}};
}
