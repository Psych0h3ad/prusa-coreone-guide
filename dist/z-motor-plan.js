import{zMotorOperationLabels}from'./z-motor-locales.js';
import {withZMotorWorkingView} from './z-motor-working-plan.js';
import {CHAMBER_RIVETS} from './chamber-service-datums.js';
export const Z_HARDWARE=Object.freeze({
 R:{cad:367,mount:363,pad:310,centre:[-5.40000014,132.599993,-8.99999961],port:'J7',label:'RIGHT',chassis:[331,333,335,337],mountScrews:[355,357,359,361],park:[-550,350,-450],stock:[290,-210,-350]},
 FL:{cad:311,mount:309,pad:364,centre:[-159.500003,-178.900005,-8.99999961],port:'J1',label:'LEFT',chassis:[315,317,319,321],mountScrews:[339,341,343,345],park:[-550,-350,-450],stock:[700,0,-350]},
 FR:{cad:366,mount:362,pad:365,centre:[159.500003,-178.900005,-8.99999961],port:'J5',label:'LEFT',chassis:[323,325,327,329],mountScrews:[347,349,351,353],park:[550,-350,-450],stock:[-200,-100,-350]}
});
// Official photos1039791/1039843: retain the U-frame's inner corner joints.
// Rear underside screws are concealed by the two retained rear rubber feet.
export const Z_FRAME_SCREWS=[119,121,297,300,285,288,289,291];
export const Z_SIDE_RIVETS=CHAMBER_RIVETS.filter(r=>r.family==='side').map((r,i)=>({...r,id:'zmLeftRivet'+i}));
export const Z_RIGHT_RIVETS=Z_SIDE_RIVETS.slice(8).map((r,i)=>({...r,id:'zmRightRivet'+i,native:54,p:[206,...r.p.slice(1)],axis:[1,0,0]}));
const initial={zmBed:150,zmFlip:0,zmLcd:0,zmLcdRibbon:1,zmLcdEarth:1,zmLcdFeed:0,zmLeftPanel:0,zmFeet:0,zmSplitter:0,zmPin0:0,zmPin1:0,zmFrame:0};
for(const r of [...Z_SIDE_RIVETS,...Z_RIGHT_RIVETS])initial[r.id]=1;
for(let i=0;i<3;i++){initial['zmCutTie'+i]=1;initial['zmFreshTie'+i]=0;}
for(const cad of Z_FRAME_SCREWS)initial['zmScrew'+cad]=0;
for(const [side,h]of Object.entries(Z_HARDWARE)){for(const[k,v]of Object.entries({OldMotor:0,NewMotor:3,OldPlug:0,NewPlug:4,Mount:0,Pad:0}))initial['zm'+side+k]=v;for(const cad of [...h.chassis,...h.mountScrews])initial['zmScrew'+cad]=0;}
export const Z_INITIAL=Object.freeze(initial);
const op=(id,to,ja,en,extra={})=>({id,to,label:zMotorOperationLabels(id,ja,en),...extra});
export function zOperations(official,side='FL',withPad=true){
 const h=Z_HARDWARE[side],prefix='zm'+side,screw=(ids,to)=>ids.map((cad,i)=>op('zmScrew'+cad,to,`M3×${Z_FRAME_SCREWS.includes(cad)?'4rT':'8'} ${i+1}/${ids.length}`,`M3×${Z_FRAME_SCREWS.includes(cad)?'4rT':'8'} ${i+1}/${ids.length}`));
 switch(official){
 case 2:return[op('zmBed',.5,'Auto Home：ベッドを上端へ','Auto Home: raise bed to home')];
 case 4:return[op('zmLcd',1,'xLCD下側を持ち上げる','Tilt the lower xLCD edge out'),op('zmLcd',2,'右フック、左フックを外す','Release right and left hooks')];
 case 5:return[op('zmLcdRibbon',0,'xLCDメイン端子を抜く','Unplug xLCD main connector'),op('zmLcdEarth',0,'FE Fastonを抜く','Unplug FE Faston'),op('zmLcd',3,'xLCD一式をESDに配慮した場所へ','Park the complete xLCD assembly')];
 case 6:return[...Z_SIDE_RIVETS.map((r,i)=>op(r.id,0,`左リベット ${i+1}/11：解除→引抜き`,`Left rivet ${i+1}/11: unlock and withdraw`)),op('zmLeftPanel',1,'左側パネルを保管する','Park the left panel')];
 case 7:return[op('zmFlip',1,'フレームを支えて背面を下にする','Support the frame and lay it on its back')];
 case 8:return[op('zmFeet',1,'背面側のゴム足2個をはがし、保管する','Peel and retain both rear rubber feet')];
 case 9:return[0,1,2].map(i=>op('zmCutTie'+i,0,`古いバンド ${i+1}/3を切って取り除く`,`Cut and remove old tie ${i+1}/3`));
 case 10:return[op('zmPin0',.35,'1本目の爪をつまみ、基板を外す','Squeeze first pin hooks and release board'),op('zmPin1',.35,'2本目の基板側の爪を解除する','Release second board-side pin hooks')];
 case 11:return[op('zmPin0',1,'1本目を板金から抜き、保管する','Remove and retain first push pin'),op('zmPin1',1,'2本目を抜き、保管する','Remove and retain second push pin'),op('zmSplitter',1,'配線を引かず基板をよける','Move splitter aside without pulling leads')];
 case 12:return[op('zmROldPlug',1,'Z Rのラッチを押し、端子を抜く','Release Z R latch and unplug'),...screw(Z_HARDWARE.R.chassis,1)];
 case 13:return[op('zmROldMotor',1,'ねじ軸を反時計回りに回し、ナットから外す','Turn shaft counter-clockwise to disengage nut'),op('zmROldMotor',2,'軸全体を底側へ抜く','Withdraw the complete shaft below the base'),op('zmROldMotor',3,'古いモーターと全ケーブルを保管する','Park old motor with its complete lead')];
 case 14:return[...screw(Z_HARDWARE.R.mountScrews,1),op('zmRMount',1,'後側の樹脂マウントを外す','Remove rear plastic mount'),...(withPad?[op('zmRPad',1,'元の透明パッドを保管する','Retain the original transparent pad')]:[])];
 case 16:return[...(withPad?[op('zmRPad',2,'元のパッドを新しいRIGHTへ移す','Transfer pad to new RIGHT motor')]:[]),op('zmRMount',2,'マウントを新しいモーターへ合わせる','Align mount with new motor'),...screw(Z_HARDWARE.R.mountScrews,2),op('zmRMount',3,'後側マウントを取り付けた状態へ','Keep the rear mount attached')];
 case 17:return[op('zmRNewMotor',2,'RIGHTを後側開口の下へ合わせる','Align RIGHT below the rear opening'),op('zmRNewMotor',1,'ねじ軸をナットへ差し込む','Feed threaded shaft into carriage nut'),op('zmRNewMotor',0,'時計回りにねじ込み、着座・直角を確認する','Thread clockwise; check seating and bed squareness')];
 case 18:return[...screw(Z_HARDWARE.R.chassis,0),op('zmRNewPlug',0,'後側RIGHTをZ Rへ接続する','Connect rear RIGHT to Z R')];
 case 19:return screw(Z_FRAME_SCREWS.slice(0,6),1);
 case 20:return[...Z_RIGHT_RIVETS.map((r,i)=>op(r.id,0,`右下リベット ${i+1}/3を外す`,`Remove lower right rivet ${i+1}/3`)),...screw(Z_FRAME_SCREWS.slice(6),1)];
 case 21:return[op('zmFrame',.02,'底部フレームの固定を解く','Release the lower frame'),op('zmLcdFeed',1,'メイン端子と全リボンを中央開口の内側へ戻す','Feed main plug and complete ribbon inward through the central opening'),op('zmLcdFeed',2,'続いてFE端子と全接地線を内側へ戻す','Then feed FE plug and complete earth lead inward'),op('zmFrame',.15,'配線の外側で下方へ離す','Disengage downwards outside the freed cables'),op('zmFrame',1,'底部フレームを保管する','Park the complete lower frame')];
 case 22:return[...screw(h.chassis,1),op(prefix+'OldPlug',1,`${side}のラッチを解除し、端子を抜く`,`Release ${side} latch and unplug`)];
 case 23:return[op(prefix+'OldMotor',1,'ねじ軸を反時計回りに回す','Turn shaft counter-clockwise'),op(prefix+'OldMotor',2,'ねじ軸を底側へ抜く','Withdraw shaft below the base'),op(prefix+'OldMotor',3,'古いLEFTと全ケーブルを保管する','Park old LEFT with its complete lead')];
 case 24:return[...screw(h.mountScrews,1),op(prefix+'Mount',1,'元のマウントを外す','Remove retained mount'),...(withPad?[op(prefix+'Pad',1,'元のパッドを保管する','Retain original pad')]:[])];
 case 26:return[...(withPad?[op(prefix+'Pad',2,'元のパッドを新しいLEFTへ移す','Transfer pad to new LEFT')]:[]),op(prefix+'Mount',2,'新しいモーターへマウントを合わせる','Align mount with new motor'),...screw(h.mountScrews,2),op(prefix+'Mount',3,'マウントを取り付けた状態へ','Keep mount attached')];
 case 27:return[op(prefix+'NewMotor',2,'LEFTを対象の開口の下へ合わせる','Align LEFT below its opening'),op(prefix+'NewMotor',1,'ねじ軸をナットへ入れる','Feed shaft into nut'),op(prefix+'NewMotor',0,'時計回りにねじ込み、着座・直角を確認する','Thread clockwise; check seating and squareness')];
 case 28:return[...screw(h.chassis,0),op(prefix+'NewPlug',0,`${side}を対応する端子へ接続する`,`Connect ${side} to its matching splitter port`)];
 case 30:return[op('zmFrame',.15,'底部フレームを開口付近へ合わせる','Bring lower frame to its opening'),op('zmFrame',.02,'開口へ配線を通せる位置まで戻す','Bring frame back to cable-feed clearance'),op('zmLcdFeed',1,'FE端子を先に外へ通す','Feed FE plug outward first'),op('zmLcdFeed',0,'続いてxLCD端子を外へ通す','Then feed xLCD plug outward')];
 case 31:return[op('zmFrame',0,'4辺の板金の重なりを合わせる','Seat all four frame overlaps')];
 case 32:return[...Z_RIGHT_RIVETS.map((r,i)=>op(r.id,1,`右下リベット ${i+1}/3を戻す`,`Refit lower right rivet ${i+1}/3`)),...screw(Z_FRAME_SCREWS.slice(6),0),...screw(Z_FRAME_SCREWS.slice(4,6),0)];
 case 33:return[...screw(Z_FRAME_SCREWS.slice(2,4),0),...screw(Z_FRAME_SCREWS.slice(0,2),0),op('zmFeet',0,'保管したゴム足2個を戻す','Refit both retained rubber feet')];
 case 34:return[op('zmPin0',.35,'1本目のピンを板金へ戻す','Refit first pin into frame'),op('zmPin1',.35,'2本目のピンを戻す','Refit second pin'),op('zmSplitter',0,'splitterの穴を2本のピンへ合わせる','Align splitter bores with both pins'),op('zmPin0',0,'1本目の基板側をロックする','Lock first board-side hook'),op('zmPin1',0,'2本目の基板側をロックする','Lock second board-side hook')];
 case 35:return[0,1,2].flatMap(i=>[op('zmFreshTie'+i,1,`新しいバンド ${i+1}/3を通す`,`Thread new tie ${i+1}/3`),op('zmFreshTie'+i,4,'LCDの余長を残し、軽くまとめる','Secure gently, retaining xLCD slack'),op('zmFreshTie'+i,7,'配線を避けて余りを切る','Trim the tail clear of cables')]);
 case 36:return[op('zmLeftPanel',0,'左側パネルを元へ戻す','Refit left panel'),...Z_SIDE_RIVETS.map((r,i)=>op(r.id,1,`左リベット ${i+1}/11をロックする`,`Lock left rivet ${i+1}/11`))];
 case 37:return[op('zmLcd',2,'保管したxLCDを本体の近くへ戻す','Bring retained xLCD back'),op('zmLcdRibbon',1,'三角印とラッチの向きを合わせて接続する','Align triangle and latch, then connect'),op('zmLcdEarth',1,'FE接地Fastonを接続する','Connect FE earth Faston')];
 case 38:return[op('zmLcd',1,'左フックを掛け、右側を下ろす','Engage left hook and lower right side'),op('zmLcd',0,'右フックと両端の着座を確認する','Engage right hook and check both ends'),op('zmFlip',0,'フレームを支えて通常の姿勢へ戻す','Support frame and return printer upright')];
 case 40:return[op('zmBed',.5,'Auto Homeの動作を確認する','Verify Auto Home'),op('zmBed',100,'Move Zで動作を確認する','Verify motion with Move Z')];
 default:return[];
 }
}
export function zScene(task,index,text){
 if(!task.motorService||task.motorService.axis!=='z')return null;
 const step=task.steps[index],states={...Z_INITIAL};
 for(let i=0;i<index;i++)for(const o of task.steps[i].motorOperations)states[o.id]=o.to;
 const actors=[];for(const o of step.motorOperations){const from=states[o.id];actors.push({flex:[o.id],fromStates:{[o.id]:from},to:o.to,label:text(o.label),showBefore:true,focusMotion:true,focusRefs:step.refs,motorOperation:o.id});states[o.id]=o.to;}
 const before={...Z_INITIAL};for(let i=0;i<index;i++)for(const o of task.steps[i].motorOperations)before[o.id]=o.to;
 const inWork=index>=task.steps.findIndex(s=>s.motorOfficialIndex===7)&&index<=task.steps.findIndex(s=>s.motorOfficialIndex===38);
 const plan={workspace:'printer',pose:'printer-standing',chapter:10,step:index+1,serviceTask:task.id,motorService:true,camera:inWork?'perspective':'front',headOnly:false,focus:step.refs,solidRefs:step.refs,contextOpacity:.28,focusPadding:35,undersideView:true,actors,seed:[],workpiecePoses:[],note:text(step.title)};
 return withZMotorWorkingView({plan,hidden:[311,366,367,'splitterWires','baseL1','baseL2','baseL3'],flexStates:before});
}
