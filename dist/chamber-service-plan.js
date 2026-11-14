// Three-free service plan. Native references retain the original CAD frame.
import {CHAMBER_RIVETS,CHAMBER_SCREW_AXES} from './chamber-service-datums.js';
export const CHAMBER_HARDWARE=Object.freeze({fans:[70,72],grid:71,fanScrews:[138,140,142,144],rear:[78],rearScrews:[146,148],box:[206],boxScrews:[193,195,197,199,201,203],side:[48],sideTop:[83],top:[87]});

const H=CHAMBER_HARDWARE,ids=['cfTemp'];
const words={unplug:['ラッチを解除して本体を抜く','Release latch and withdraw housing','Odjistit a vytáhnout tělo','Entriegeln und Gehäuse abziehen'],out:['配線を穴から戻し、部品を取り出す','Feed lead back through openings and remove part','Vytáhnout kabel otvory a vyjmout díl','Kabel durch Öffnungen zurückführen und Teil entnehmen'],place:['向きを保ち、配線を穴へ通して部品を置く','Keep orientation, feed lead through openings and place part','Zachovat orientaci, protáhnout kabel a vložit díl','Ausrichtung halten, Kabel durchführen und Teil einsetzen'],route:['上部の正しい穴へ配線を通す','Feed lead through the correct upper opening','Protáhnout kabel správným horním otvorem','Kabel durch richtige obere Öffnung führen'],plug:['向きを合わせてまっすぐ接続する','Align and insert straight','Vyrovnat a přímo zapojit','Ausrichten und gerade einstecken']};
export function chamberResourceScene(task,index,text,bedFrame){
 if(task.id!=='chamber-fan')return null;
 const frame=bedFrame||{nozzleTipZMM:305.5994212627411,sheetSurfaceZMM:78.43609840000578,startControlZMM:.5},BED_HOME=frame.nozzleTipZMM-frame.sheetSurfaceZMM-frame.startControlZMM,BED_WORK=BED_HOME-100;
 const s=task.steps[index],plan={serviceTask:task.id,workspace:'printer',pose:'printer-standing',chapter:10,step:index+1,camera:index>=7&&index<=9||index>=15&&index<=17?'rear-wiring-perspective':'perspective',focus:s.refs,focusPadding:12,operationPadding:9,contextOpacity:.16,undersideView:true,transparentRefs:[],solidRefs:[...s.refs,70,71,72,'xBuddyExtension','cfSockets',...ids,...CHAMBER_RIVETS.map(r=>r.id)],actors:[],seed:[],workpiecePoses:[],note:text(s.title)},hidden=[],flexStates=Object.fromEntries(ids.map(id=>[id,index<=9||index>=16?3:index<=11?0:1]));
 const pose=(refs,offset)=>plan.workpiecePoses.push({refs,pivot:[0,0,0],rotation:[0,0,0],offset});
 const a=(refs,label,axis,distance,extra={})=>plan.actors.push({refs,label,axis,distance,showBefore:true,focusMotion:true,guideRadius:3,guideTube:.35,guideArrowLength:6,...extra});
 const screw=(refs,remove,axis,length,label)=>refs.forEach((id,i)=>{const axial=H.fanScrews.includes(id)?3.5:4,turn=axial/.5*360*axis[1],off=axis.map(n=>n*length),neck=axis.map(n=>n*axial);a([id],label+' '+(i+1)+'/'+refs.length,axis,length,{remove,keepRemoved:true,showBefore:remove,focusPadding:9,focusMinDistance:95,motionPivot:CHAMBER_SCREW_AXES[id],posePath:[{offset:off,rotation:[0,turn,0]},{offset:neck,rotation:[0,turn,0]},{offset:[0,0,0],rotation:[0,0,0]}]});});
 const flex=(id,from,to,label)=>plan.actors.push({flex:[id],fromStates:{[id]:from},to,label,showBefore:true,focusMotion:true,camera:from>=2&&to>=2?'xbuddy-board-perspective':'perspective',focusBounds:from>=2&&to>=2?[-113,157,212,-77,194,264]:[-160,145,220,85,245,425],focusPadding:6,focusMinDistance:100,guideRadius:2,guideTube:.25,guideArrowLength:5});
 for(const r of CHAMBER_RIVETS){const first=r.family==='top'?3:r.family==='sideTop'?5:6,last=r.family==='top'?19:18;flexStates[r.id]=index<=first||index>last?1:0;}
 const rivets=(family,remove)=>{const list=CHAMBER_RIVETS.filter(r=>r.family===family);if(family==='top')list.sort((a,b)=>Math.hypot(a.p[0]-105.001,a.p[1]+169.486)-Math.hypot(b.p[0]-105.001,b.p[1]+169.486));for(const [i,r]of list.entries()){flexStates[r.id]=remove?1:0;plan.actors.push({flex:[r.id],fromStates:{[r.id]:remove?1:0},to:remove?0:1,label:text(remove?[`リベット ${i+1}/${list.length}：ピン解除→引抜き`,`Rivet ${i+1}/${list.length}: release pin, then withdraw`,`Nýt ${i+1}/${list.length}: odjistit kolík a vytáhnout`,`Niete ${i+1}/${list.length}: Stift lösen, dann herausziehen`]:[`リベット ${i+1}/${list.length}：本体を入れ、ピンでロック`,`Rivet ${i+1}/${list.length}: insert body, then lock pin`,`Nýt ${i+1}/${list.length}: vložit tělo a zajistit kolík`,`Niete ${i+1}/${list.length}: Körper einsetzen und Stift verriegeln`]),showBefore:true,focusMotion:true,camera:family==='top'?'top-perspective':'base-right-perspective',focusBounds:r.p.map(n=>n-25).concat(r.p.map(n=>n+25)),focusPadding:4,focusMinDistance:95,guideRadius:2,guideTube:.25});}};
 // Park removed full parts, rather than erasing them from an exploded view.
 if(index>3&&index<19)pose(H.top,[0,-450,40]);
 if(index>5&&index<18)pose(H.sideTop,[-100,0,0]);
 if(index>6&&index<18)pose(H.side,[-110,0,0]);
 if(index>7&&index<17){pose(H.rear,[0,100,-2]);pose(H.rearScrews,[0,-35,0]);}
 if(index>8&&index<16){pose(H.box,[0,90,0]);pose(H.boxScrews,[0,35,0]);}
 if(index>10&&index<14)pose(H.fanScrews,[0,-42,0]);
 if(index<4||index>19)hidden.push('cfProtectionMat');
 if(index<9)hidden.push('cfOldCutTie');else hidden.push('bundle1');
 if(index<15)hidden.push('cfHarnessTie');
 flexStates.cfOldCutTie=index<=9?1:0;flexStates.cfHarnessTie=index<=15?0:7;
 plan.solidRefs.push('cfOldCutTie','cfHarnessTie','cfProtectionMat');
 // The old open-ended temperature branch is represented once, by cfTemp.
 hidden.push('thermistorWire');
 // Original corner/bracket screws remain unchanged; the cover rivets occupy
 // the separate real 3.2 mm holes recovered from native51/84/89.
 switch(s.action){
 case'cf-safe':a(['heatbed','sheet','bedSupport'],text(['Auto Homeを実行し、完了を待つ','Run Auto Home and wait','Spustit Auto Home a vyčkat','Auto Home ausführen und warten']),[0,0,1],BED_HOME,{camera:'front',motionPivot:[0,0,0],posePath:[{offset:[0,0,0],rotation:[0,0,0]},{offset:[0,0,BED_HOME],rotation:[0,0,0]}]});a(['heatbed','sheet','bedSupport'],text(['ベッドを100 mm下降させ、停止を待つ','Lower the bed100 mm and wait','Spustit podložku100 mm a vyčkat','Bett100 mm absenken und warten']),[0,0,-1],100,{reuse:true,camera:'front',motionPivot:[0,0,0],posePath:[{offset:[0,0,BED_HOME],rotation:[0,0,0]},{offset:[0,0,BED_WORK],rotation:[0,0,0]}]});break;
 case'cf-top-out':rivets('top',true);a(H.top,text(s.title),[0,-1,0],450,{remove:true,keepRemoved:true,motionPivot:[0,0,0],posePath:[{offset:[0,-450,40],rotation:[0,0,0]},{offset:[0,0,40],rotation:[0,0,0]},{offset:[0,0,0],rotation:[0,0,0]}]});break;
 case'cf-protect':a(['cfProtectionMat'],text(s.title),[0,0,1],40,{showBefore:false});break;
 case'cf-side-top-out':rivets('sideTop',true);a(H.sideTop,text(s.title),[-1,0,0],100,{remove:true,keepRemoved:true,camera:'base-right-perspective'});break;
 case'cf-side-out':rivets('side',true);a(H.side,text(s.title),[-1,0,0],110,{remove:true,keepRemoved:true,camera:'base-right-perspective'});break;
 case'cf-rear-out':screw(H.rearScrews,true,[0,-1,0],35,'M3×4rT');a(H.rear,text(s.title),[0,1,0],100,{remove:true,keepRemoved:true,motionPivot:[0,180,313],posePath:[{offset:[0,100,-2],rotation:[0,0,0]},{offset:[0,55,-2],rotation:[15,0,0]},{offset:[0,0,-2],rotation:[0,0,0]},{offset:[0,0,0],rotation:[0,0,0]}]});break;
 case'cf-box-out':screw(H.boxScrews,true,[0,1,0],35,'M3×4rT');a(H.box,text(s.title),[0,1,0],90,{remove:true,keepRemoved:true});break;
 case'cf-unplug':plan.actors.push({flex:['cfOldCutTie'],fromStates:{cfOldCutTie:1},to:0,label:text(['配線を避けて古いバンドを切り、取り除く','Cut the old tie clear of wires and remove it','Přestřihnout starou pásku mimo vodiče a odstranit ji','Alten Kabelbinder abseits der Leitungen durchtrennen und entfernen']),showBefore:true,focusMotion:true,camera:'rear-wiring-perspective',focusBounds:[-8,155,265,40,235,305],focusMinDistance:120});for(const id of ids)flex(id,3,2,(id==='cfTemp'?'TEMP':id==='cfFan1'?'FAN1':'FAN2')+' · '+text(words.unplug));break;
 case'cf-fans-out':screw(H.fanScrews,true,[0,-1,0],42,'M3×30');for(const id of ids)flex(id,2,0,text(words.out)+' · '+id.replace('cf',''));break;
 case'cf-fans-in':for(const id of ['cfFan1','cfFan2'])flex(id,0,1,text(words.place)+' · '+id.replace('cf',''));break;
 case'cf-grid-in':flex('cfTemp',0,1,text(words.place)+' · TEMP');break;
 case'cf-fasten':
  plan.actors.push({flex:ids,fromStates:Object.fromEntries(ids.map(id=>[id,1])),to:1.1,label:text(['ファンとグリッドを支え、固定穴を合わせる','Support fans and grid and align mounting holes','Podepřít ventilátory a mřížku a vyrovnat montážní otvory','Lüfter und Gitter stützen und Befestigungslöcher ausrichten']),showBefore:true,focusMotion:true,focusBounds:[-75,165,330,75,220,425]});
  for(const [i,id]of H.fanScrews.entries())a([id],text([`M3×30 ${i+1}/4：まだ緩く保持`,`M3×30 ${i+1}/4: start loosely`,`M3×30 ${i+1}/4: zatím volně`,`M3×30 ${i+1}/4: zunächst lose ansetzen`]),[0,-1,0],42,{motionPivot:CHAMBER_SCREW_AXES[id],posePath:[{offset:[0,-42,0],rotation:[0,-2520,0]},{offset:[0,-3.5,0],rotation:[0,-2520,0]},{offset:[0,-2,0],rotation:[0,-1440,0]}],showBefore:true});
  for(const [i,id]of H.fanScrews.entries())a([id],text([`M3×30 ${i+1}/4：軽く本締め`,`M3×30 ${i+1}/4: tighten gently`,`M3×30 ${i+1}/4: šetrně dotáhnout`,`M3×30 ${i+1}/4: leicht festziehen`]),[0,-1,0],2,{reuse:true,motionPivot:CHAMBER_SCREW_AXES[id],posePath:[{offset:[0,-2,0],rotation:[0,-1440,0]},{offset:[0,0,0],rotation:[0,0,0]}]});break;
 case'cf-connect':for(const id of ids){flex(id,1.1,2,text(words.route)+' · '+id.replace('cf',''));flex(id,2,3,text(words.plug)+' · '+(id==='cfTemp'?'TEMP':id==='cfFan1'?'FAN1':'FAN2'));}for(const [from,to,label]of[[0,1,['新しいバンド1本を回して先端を通す','Wrap one new tie and feed its tip','Obtočit jednu novou pásku a provléct konec','Einen neuen Kabelbinder herumführen und einfädeln']],[1,3,['配線を引かず軽くまとめる','Secure gently without pulling wires','Lehce zajistit bez tahu za vodiče','Ohne Zug an Leitungen locker sichern']],[3,7,['配線を避けて余りを切り、切れ端を離す','Trim clear of wires and move the offcut away','Odstřihnout přebytek mimo vodiče a odložit odstřižek','Überstand abseits der Leitungen abschneiden und weglegen']]])plan.actors.push({flex:['cfHarnessTie'],fromStates:{cfHarnessTie:from},to,label:text(label),showBefore:from!==0,focusMotion:true,camera:'rear-wiring-perspective',focusBounds:[-5,155,265,35,205,305],focusMinDistance:115});break;
 case'cf-box-in':a(H.box,text(s.title),[0,1,0],90,{showBefore:true});screw(H.boxScrews,false,[0,1,0],35,'M3×4rT');break;
 case'cf-rear-in':a(H.rear,text(s.title),[0,1,0],100,{showBefore:true,motionPivot:[0,180,313],posePath:[{offset:[0,100,-2],rotation:[0,0,0]},{offset:[0,55,-2],rotation:[15,0,0]},{offset:[0,0,-2],rotation:[0,0,0]},{offset:[0,0,0],rotation:[0,0,0]}]});screw(H.rearScrews,false,[0,-1,0],35,'M3×4rT');break;
 case'cf-side-in':a(H.side,text(s.title),[-1,0,0],110);rivets('side',false);a(H.sideTop,text(s.title),[-1,0,0],100);rivets('sideTop',false);break;
 case'cf-restore':a(['cfProtectionMat'],text(['保護材・工具を取り出す','Remove protection and tools','Odstranit ochranu a nářadí','Schutz und Werkzeug entfernen']),[0,0,1],40,{remove:true});a(H.top,text(s.title),[0,-1,0],450,{motionPivot:[0,0,0],posePath:[{offset:[0,-450,40],rotation:[0,0,0]},{offset:[0,0,40],rotation:[0,0,0]},{offset:[0,0,0],rotation:[0,0,0]}]});rivets('top',false);break;
 case'cf-test':for(const id of [70,72])a([id],text(s.title),[0,0,1],0,{inspection:true,handling:true});break;
 }
 plan.serviceBedHeight={...frame,stage:index<2?'before':index===2?'move':'after',startOffsetMM:BED_HOME,endOffsetMM:BED_WORK,targetControlZMM:frame.startControlZMM+100,owner:'chamber-fan'};
 if(index>=3)pose(['heatbed','sheet','bedSupport','cfProtectionMat'],[0,0,BED_WORK]);
 if(index>=10&&index<=14){plan.camera='perspective';plan.viewBounds=[-85,145,330,85,220,425];plan.viewMinDistance=150;}
 if(index===11)for(const id of ids)flexStates[id]=0;
 if(index===12){flexStates.cfFan1=0;flexStates.cfFan2=0;flexStates.cfTemp=0;}
 if(index===13){flexStates.cfTemp=0;flexStates.cfFan1=1;flexStates.cfFan2=1;}
 if(index===9)for(const id of ids)flexStates[id]=3;
 if(index===10)for(const id of ids)flexStates[id]=2;
 if(index===15)for(const id of ids)flexStates[id]=1.1;
 return{plan,hidden,flexStates};
}
