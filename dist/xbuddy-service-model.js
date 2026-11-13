import {XBUDDY_WIFI_COVER_MOTION}from './xbuddy-wifi-motion.js?v=20261111-94';
import {XBUDDY_PORTS,xBuddyPortBounds,xBuddyPortCentre}from './xbuddy-layout.js?v=20261111-94';
import {xBuddySensorActors}from './xbuddy-sensor-cables.js?v=20261111-94';
import {FE_GROUND}from './fe-hardware.js?v=20261111-94';
const BED=['bedSupport','heatbed','sheet'],BED_START=305.5994212627411-78.43609840000578-.5;
export const XBUDDY_HARDWARE={boardFixings:[179,181,183,185,187],boxFixings:[193,195,197,199,201,203],rearFixings:[146,148],nfcFixings:[258,260],wifiFixing:191,rear:78,boxCover:206,nfcCover:240,wifiCover:170};
const H=XBUDDY_HARDWARE,BOARD=['xBuddy','thermalPads','xbNfcSocket'],PIVOT=[-49.20276,165.45172,96.64597],REAR_RELEASE=2;
// The board's silver ports must first clear the side apertures. Its pads stay
// with the removed board; the extension board and its four screws stay fixed.
export const XBUDDY_BOARD_MOTION={motionPivot:PIVOT,posePath:[
 {offset:[-20,160,0],rotation:[-90,0,0]},
 {offset:[-20,160,0],rotation:[0,0,0]},
 {offset:[-20,75,0],rotation:[0,0,0]},
 {offset:[-11,55,0],rotation:[0,0,-35]},
 {offset:[-11,5,0],rotation:[0,0,-35]},
 {offset:[0,0,0],rotation:[0,0,0]}
]};
const rearMotion={motionPivot:[0,180,313],posePath:[
 {offset:[0,75,-REAR_RELEASE],rotation:[15,0,0]},
 {offset:[0,55,-REAR_RELEASE],rotation:[15,0,0]},
 {offset:[0,55,-REAR_RELEASE],rotation:[0,0,0]},
 {offset:[0,0,-REAR_RELEASE],rotation:[0,0,0]}
]};
const wifiMotion=XBUDDY_WIFI_COVER_MOTION;
export const XBUDDY_ZR_MOTION={motionPivot:[0,0,0],posePath:[
 {offset:[0,15,-145],rotation:[0,0,0]},
 {offset:[0,15,0],rotation:[0,0,0]},
 {offset:[0,0,0],rotation:[0,0,0]}
]};
export const XBUDDY_PE_MOTION={motionPivot:[0,0,0],posePath:[
 {offset:[14,10,-13],rotation:[0,0,0]},
 {offset:[0,10,0],rotation:[0,0,0]},
 {offset:[0,0,0],rotation:[0,0,0]}
]};
export function xBuddyServiceScene(task,index,text){
 const s=task.steps[index],n=index+1,hidden=[],pendingOperations=[],flexStates={xbBedTempLead:n>11&&n<=28?0:1,xbDoorLead:n>11&&n<=28?0:1};
 const plan={serviceTask:'xbuddy',workspace:'printer',pose:'printer-standing',chapter:10,step:n,camera:n<6?'front':'rear-wiring-perspective',focus:s.refs,focusPadding:14,operationPadding:9,contextOpacity:.045,undersideView:true,transparentRefs:[],solidRefs:[168,'xBuddy','xBuddyExtension','xbNfcSocket',...s.refs],actors:[],seed:[],workpiecePoses:[],note:''};
 if([13,14,19,20].includes(n)){plan.camera='right-perspective';plan.solidRefs.push('xbWifi');}
 if(n===9||n===32)plan.solidRefs.push('xbNfcCoil','xbNfcPlug','xbNfcCable');
 const pose=(refs,offset,rotation=[0,0,0],pivot=[0,0,0])=>plan.workpiecePoses.push({refs,offset,rotation,pivot});
 const a=(refs,label,axis,distance,extra={})=>plan.actors.push({refs,label,axis,distance,focusMotion:true,showBefore:true,...extra});
 const screws=(refs,remove,axis=[0,1,0],label='M3×6')=>{for(const id of refs)a([id],label,axis,20,{remove,spin:1080,showBefore:remove,focusRefs:[168,'xBuddy']});};
 const sensor=(id,portKey,connect)=>{plan.actors.push(...xBuddySensorActors(id,connect,text));plan.solidRefs.push(id);};
 plan.solidRefs.push('xbBedTempLead','xbDoorLead');
 if(n<5)pose(BED,[0,0,BED_START]);else if(n>5)pose(BED,[0,0,BED_START-100]);
 // The official disconnection step cuts the side ties; fresh ties are
 // inserted at22 and tightened later. Their cutting/closure animation remains
 // flagged with the unfinished upper-wiring and tie operations.
 if(n>10&&n<22)hidden.push('box1','box2','box4','box5');
 if(n>=22&&n<=29)for(const id of['box1','box2','box4','box5'])flexStates[id]=id==='box5'&&n>27?7:1;
 if(n===22)for(const id of['box1','box2','box4','box5'])flexStates[id]=0;
 if(n===7)hidden.push(...H.rearFixings);
 if(n>7&&n<33)hidden.push(H.rear,...H.rearFixings);
 if(n>8&&n<=32)hidden.push(H.boxCover,...H.boxFixings);
 if(n>9&&n<=32)hidden.push(H.nfcCover,...H.nfcFixings,'xbNfcCoil','xbNfcPlug','xbNfcCable');
 if(n>13&&n<=20)hidden.push(H.wifiCover,H.wifiFixing);
 if(n>14&&n<=19)hidden.push('xbWifi');
 if(n>15&&n<=18)hidden.push(...H.boardFixings);
 if(n>11&&n<=25)hidden.push('feGroundWasher','feGroundScrew');
 if(n>10&&n<26)pose(['splitterZRPlug'],XBUDDY_ZR_MOTION.posePath[0].offset);
 if(n>11&&n<25)pose(['feGroundRing'],XBUDDY_PE_MOTION.posePath[0].offset);
 if(n===16||n===17){const q=XBUDDY_BOARD_MOTION.posePath[0];pose(BOARD,q.offset,q.rotation,PIVOT);plan.workspace='board-prep';plan.pose='xbuddy-back-up';plan.camera='top-perspective';plan.focus=BOARD;plan.solidRefs=BOARD;}
 if(n===16)hidden.push('thermalPads');
 let isolated=n===16||n===17?BOARD:null;
 switch(s.action){
 case'xb-ties-in':for(const [i,y,z]of[[1,181.8,207.65],[2,181.8,172.65],[4,181.8,102.65],[5,174.8,67.65]])plan.actors.push({flex:['box'+i],fromStates:{['box'+i]:0},to:1,showBefore:false,label:text([`結束バンド${i}：先端を穴に通す`,`Tie ${i}: thread the tip through the slots`,`Páska ${i}: provléct konec otvory`,`Kabelbinder ${i}: Spitze durch die Schlitze führen`]),anchors:[[-131.5,y+2,z]],focusBounds:[-155,y-6,z-6,-62,y+116,z+6],camera:'xbuddy-board-perspective'});pendingOperations.push(s.action);break;
 case'xb-bed-down':plan.solidRefs.push(...BED);a(BED,text(s.title),[0,0,-1],100,{remove:true,keepRemoved:true,camera:'front',motionPivot:[0,0,0],posePath:[{offset:[0,0,BED_START-100],rotation:[0,0,0]},{offset:[0,0,BED_START],rotation:[0,0,0]}]});break;
 case'xb-rear-release':screws(H.rearFixings,true,[0,-1,0],'M3×4');a([H.rear],text(s.title),[0,0,-1],REAR_RELEASE,{remove:true,keepRemoved:true,anchors:[[-130,181,311],[-40,181,311],[40,181,311],[130,181,311]]});break;
 case'xb-rear-out':a([H.rear],text(s.title),[0,1,0],65,{...rearMotion,remove:true,keepRemoved:false});plan.workpiecePoses=plan.workpiecePoses.filter(p=>!p.refs.includes(H.rear));break;
 case'xb-box-out':screws(H.boxFixings,true,[0,1,0],'M3×4');a([H.boxCover],text(s.title),[0,1,0],55,{remove:true});break;
 case'xb-nfc-out':screws(H.nfcFixings,true,[0,1,0],'M3×10');a(['xbNfcPlug'],text(['NFC端子を真上に持ち上げて外す','Lift the NFC connector straight off','Konektor NFC zvednout kolmo nahoru','NFC-Stecker senkrecht abheben']),[0,1,0],8,{remove:true,keepRemoved:true,focusRefs:['xbNfcSocket'],focusBounds:[-70,162,64,-55,180,79]});a([H.nfcCover,'xbNfcCoil'],text(s.title),[0,1,0],70,{remove:true});break;
 case'xb-unplug-upper':
  for(const [op,to,label]of[['cut-old',5,['一番下の結束バンドを2か所で切る（配線を避ける）','Cut the lowest tie in two places; protect the wires','Spodní pásku přestřihnout na dvou místech mimo vodiče','Untersten Kabelbinder an zwei Stellen mit Abstand zu Leitungen schneiden']],['remove-old',0,['切った一番下のバンドを穴から抜く','Withdraw the cut lowest tie through the passage','Vytáhnout přestřiženou spodní pásku z otvoru','Durchtrennten untersten Kabelbinder aus der Durchführung ziehen']]])plan.actors.push({flex:['box5'],fromStates:{box5:5},to,tie13Operation:op,label:text(label),showBefore:true});
  a(['splitterZRPlug'],text(['Zモーター（ZR）を抜いて脇へよける','Unplug Z motors (ZR) and park the plug','Odpojit motory Z (ZR) a odložit konektor','Z-Motoren (ZR) abstecken und Stecker beiseitelegen']),[0,1,0],45,{...XBUDDY_ZR_MOTION,remove:true,keepRemoved:true});pendingOperations.push(s.action);break;
 case'xb-unplug-lower':sensor('xbDoorLead','A_TEMP',false);sensor('xbBedTempLead','BED_TEMP',false);a(['feGroundScrew'],'M3×6',[0,1,0],30,{remove:true,spin:720});a(['feGroundWasher'],'M3w',[0,1,0],25,{remove:true});a(['feGroundRing'],text(['PE端子を外して脇へよける','Remove PE and park the lug beside the board','Odpojit PE a odložit oko vedle desky','PE lösen und Ringöse neben die Platine legen']),[0,1,0],10,{...XBUDDY_PE_MOTION,remove:true,keepRemoved:true});pendingOperations.push(s.action);break;
 case'xb-main-lcd-in':plan.actors.push({flex:['box5'],fromStates:{box5:1},to:3,tie13Operation:'close-new',label:text(['一番下のバンドへ先端を通し、締めすぎず固定する','Thread and gently secure the lowest tie','Provléct a přiměřeně zajistit spodní pásku','Untersten Kabelbinder einfädeln und maßvoll schließen']),showBefore:true},{flex:['box5'],fromStates:{box5:3},to:7,tie13Operation:'trim-new',label:text(['配線を避けて余りを切り、切れ端を離す','Trim excess clear of wires and move the offcut away','Odstřihnout přebytek mimo vodiče a odložit odstřižek','Überstand mit Abstand zu Leitungen schneiden und entfernen']),showBefore:true});pendingOperations.push(s.action);break;
 case'xb-sensors-in':sensor('xbBedTempLead','BED_TEMP',true);sensor('xbDoorLead','A_TEMP',true);pendingOperations.push(s.action);break;
 case'xb-wifi-cover-out':screws([H.wifiFixing],true,[1,0,0],'M3×12');a([H.wifiCover],text(s.title),[1,0,0],35,{...wifiMotion,remove:true});break;
 case'xb-wifi-out':a(['xbWifi'],text(s.title),[1,0,0],35,{remove:true,camera:'right-perspective'});break;
 case'xb-wifi-in':a(['xbWifi'],text(s.title),[1,0,0],35,{showBefore:true,camera:'right-perspective'});break;
 case'xb-wifi-cover-in':a([H.wifiCover],text(s.title),[1,0,0],35,{...wifiMotion,showBefore:false});screws([H.wifiFixing],false,[1,0,0],'M3×12');break;
 case'xb-board-out':screws(H.boardFixings,true);a(BOARD,text(s.title),[0,1,0],35,{...XBUDDY_BOARD_MOTION,remove:true,keepRemoved:true});break;
 case'xb-pads':for(let i=0;i<3;i++)a([`xbPad${i+1}`],text(s.title),[0,0,1],18,{showBefore:false,focusRefs:BOARD});break;
 case'xb-board-in':a(BOARD,text(s.title),[0,1,0],35,{...XBUDDY_BOARD_MOTION,showBefore:true});screws(H.boardFixings,false);break;
 case'xb-pe-in':a(['feGroundRing'],text(s.title),[0,1,0],50,{...XBUDDY_PE_MOTION,showBefore:true});a(['feGroundWasher'],'M3w',[0,1,0],25,{showBefore:false});a(['feGroundScrew'],'M3×6',[0,1,0],30,{showBefore:false,spin:720});break;
 case'xb-z-panic-in':a(['splitterZRPlug'],text(['Zモーター（ZR）を接続する','Connect Z motors (ZR)','Zapojit motory Z (ZR)','Z-Motoren (ZR) anschließen']),[0,1,0],45,{...XBUDDY_ZR_MOTION,showBefore:true});pendingOperations.push(s.action);break;
 case'xb-wiring-check':
  plan.operationPadding=9;plan.operationCamera='xbuddy-board-perspective';plan.camera=plan.operationCamera;
  for(const port of XBUDDY_PORTS)a(['xBuddy'],text(port.title),[0,1,0],0,{inspection:true,handling:true,port:port.key,anchors:[xBuddyPortCentre(port)],attentionRefs:['xBuddy'],attentionBounds:xBuddyPortBounds(port,.12),focusBounds:xBuddyPortBounds(port,3)});
  {const [x,y,z]=FE_GROUND.axis;a(['feGroundRing','feGroundScrew','feGroundWasher'],text(['PE：丸端子・ワッシャー・M3×6','PE: ring lug, washer and M3×6','PE: oko, podložka a M3×6','PE: Ringöse, Unterlegscheibe und M3×6']),[0,1,0],0,{inspection:true,handling:true,port:'PE',anchors:[[x,y+3,z]],attentionRefs:['feGroundRing','feGroundScrew','feGroundWasher'],attentionBounds:[x-7,y-2,z-16,x+7,y+14,z+7],focusBounds:[x-10,y-5,z-19,x+10,y+17,z+10]});}
  // The review has port-specific attention, but remains incomplete until all
  // cable routes represented by this diagram have been implemented and checked.
  pendingOperations.push(s.action);break;
 case'xb-box-in':a([H.nfcCover,'xbNfcCoil'],text(['NFCカバーをボックスの近くに置く','Bring the NFC cover close to the box','Přiblížit kryt NFC k boxu','NFC-Abdeckung an das Gehäuse heranführen']),[0,1,0],70,{motionPivot:[0,0,0],posePath:[{offset:[0,70,0],rotation:[0,0,0]},{offset:[0,15,0],rotation:[0,0,0]}]});a(['xbNfcPlug'],text(['NFC端子を合わせ、軽く押して接続する','Align and gently press the NFC connector','Vyrovnat a lehce přitlačit konektor NFC','NFC-Stecker ausrichten und leicht aufdrücken']),[0,1,0],8,{focusRefs:['xbNfcSocket'],focusBounds:[-70,162,64,-55,180,79]});a([H.nfcCover,'xbNfcCoil'],text(['NFCケーブルを挟まずカバーを合わせる','Seat the cover without trapping the NFC cable','Nasadit kryt bez skřípnutí kabelu NFC','Abdeckung ohne eingeklemmtes NFC-Kabel aufsetzen']),[0,1,0],15,{reuse:true});screws(H.nfcFixings,false,[0,1,0],'M3×10');a([H.boxCover],text(s.title),[0,1,0],55,{showBefore:false});screws(H.boxFixings,false,[0,1,0],'M3×4');break;
 case'xb-rear-in':a([H.rear],text(s.title),[0,1,0],65,{...rearMotion,showBefore:false});a([H.rear],text(s.title),[0,0,-1],REAR_RELEASE,{reuse:true,showBefore:true});screws(H.rearFixings,false,[0,-1,0],'M3×4');break;
 default:if(s.action)pendingOperations.push(s.action);
 }
 return {plan,hidden,isolated,flexStates,pendingOperations};
}
