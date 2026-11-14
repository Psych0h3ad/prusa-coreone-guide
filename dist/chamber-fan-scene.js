// Pure fan procedure extension of the ONE common647 plan. No resource owner.
import {chamberResourceScene} from './chamber-service-plan.js';
import {FAN_IDS,fanScrewPark,appendChamberNativeSeeds} from './fan-seeds.js';
const LABELS={unplug:['ラッチを解除して本体を抜く','Release latch and withdraw housing','Odjistit a vytáhnout tělo','Entriegeln und Gehäuse abziehen'],out:['配線を穴から戻し、ファンを取り出す','Feed the lead back through the openings and remove the fan','Vytáhnout kabel otvory a vyjmout ventilátor','Kabel durch die Öffnungen zurückführen und Lüfter entnehmen'],route:['右側の穴へファン配線を通す','Feed the fan lead through the right-hand hole','Protáhnout kabel ventilátoru pravým otvorem','Lüfterkabel durch die rechte Öffnung führen'],plug:['向きを合わせて本体をまっすぐ差す','Align and insert the housing straight','Vyrovnat a přímo zasunout tělo','Gehäuse ausrichten und gerade einstecken']};
export function chamberFanScene(task,index,text,bedFrame){
 if(task.id!=='chamber-fan')return null;
 const spec=chamberResourceScene(task,index,text,bedFrame),p=spec.plan,action=task.steps[index].action;
 // These two are replacement-reference copies used only by the TEMP task.
 // Fan replacement retains and moves the actual original thermistor tie.
 spec.hidden.push('ctOldGridTie','ctNewGridTie');
 // The new tie is free along the same rear loom, not through a fixed hole.
 // Fan-only placement atX0 admits all three full cable parts at260mm TEMP.
 // The TEMP-only scene retains the originalX15 placement unchanged.
 p.workpiecePoses.push({refs:['cfHarnessTie'],offset:[-15,0,0],pivot:[0,0,0],rotation:[0,0,0]});
 const amount=index<=9||index>=16?3:index===10?2:index<=12?0:index<=14?1:1.1;
 for(const id of FAN_IDS)spec.flexStates[id]=amount;
 p.solidRefs=[...new Set([...p.solidRefs,...FAN_IDS])];
 const actor=(id,from,to,key)=>({flex:[id],fromStates:{[id]:from},to,label:text(LABELS[key])+' · '+id.replace('cf',''),showBefore:true,focusMotion:true,camera:from>=2&&to>=2?'xbuddy-board-perspective':'perspective',focusBounds:from>=2&&to>=2?[id==='cfFan1'?-100:-111,157,211,id==='cfFan1'?-71:-83,190,247]:[-160,145,220,85,245,425],focusPadding:6,focusMinDistance:100,guideRadius:2,guideTube:.25,guideArrowLength:5});
 if(action==='cf-unplug')p.actors.push(...FAN_IDS.map(id=>actor(id,3,2,'unplug')));
 if(action==='cf-power'){
  p.focus=['psu'];p.solidRefs.push('psu');
  p.actors.push({refs:['psu'],label:text(['実機で電源コードを接続し、背面をONにする','On the printer, reconnect the power cord and switch the rear power ON','Na tiskárně připojit napájecí kabel a zapnout zadní vypínač','Am Drucker Netzkabel anschließen und hinten einschalten']),axis:[0,0,1],distance:0,showBefore:true,inspection:true,handling:true,focusMotion:true,camera:'back',focusPadding:12,focusMinDistance:140});
 }
 if(action==='cf-fans-out')p.actors.push(...FAN_IDS.map(id=>actor(id,2,0,'out')));
 if(action==='cf-fasten'){
  const align=p.actors.findIndex(a=>a.flex?.includes('cfTemp'));
  const all=['cfTemp',...FAN_IDS],labels=[['ファン2個を支え、真上へ持ち上げる','Support both fans and lift vertically','Podepřít oba ventilátory a zvednout svisle','Beide Lüfter stützen und senkrecht anheben'],['配線を挟まずグリッドの固定穴へ合わせる','Align with the grid mounting holes without pinching leads','Vyrovnat s otvory mřížky bez skřípnutí kabelů','Ohne eingeklemmte Leitungen an den Gitterlöchern ausrichten']];
  if(align<0)throw Error('Common grid alignment actor missing');
  p.actors.splice(align,1,...[[1,1.05],[1.05,1.1]].map(([from,to],i)=>({...p.actors[align],flex:all,fromStates:Object.fromEntries(all.map(id=>[id,from])),to,label:text(labels[i])})));
 }
 if(action==='cf-connect'){
  const at=p.actors.findIndex(a=>a.flex?.includes('cfHarnessTie'));
  if(at<0)throw Error('Common harness-tie actor missing');
  // Official969963 lines979487..979490: both fans first, then TEMP.
  p.actors.splice(0,0,...FAN_IDS.flatMap(id=>[actor(id,1.1,2,'route'),actor(id,2,3,'plug')]));
 }
 // Retain each complete removed M3x30. First withdraw on its actual axis,
 // then put it to the side; reverse follows the same stations. Keeping an
 // uninstalled screw floating42mm ahead of its bore obstructs the free lead.
 if(index>10&&index<14){
  p.workpiecePoses=p.workpiecePoses.filter(pose=>!pose.refs.every(id=>[138,140,142,144].includes(id)));
  for(const id of[138,140,142,144])p.workpiecePoses.push({refs:[id],offset:fanScrewPark(id),pivot:[0,0,0],rotation:[0,0,0]});
 }
 for(const a of p.actors){
  const id=a.refs?.[0];
  if(a.refs?.length===1&&[138,140,142,144].includes(id)&&a.posePath?.[0].offset[1]===-42){
   a.posePath.unshift({...a.posePath[0],offset:fanScrewPark(id)});
  }
 }
 return appendChamberNativeSeeds(spec);
}
