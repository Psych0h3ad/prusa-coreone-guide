import {socketCentre}from './loveboard-layout.js?v=20261111-94';
import {NEXTRUDER_BODY_REFS,NEXTRUDER_INTERNAL_REFS}from './nextruder-service-parts.js?v=20261111-94';
import {leftCoverMotion,leftCoverScrewMotion,leftCoverView,loveBoardMotion}from './printhead-cover-motion.js?v=20261111-94';
const HOTEND=['hotend','hotendThermistor0','hotendThermistor1','hotendHeater0','hotendHeater1'],LEADS=HOTEND.slice(1),TOP=[87,'ventBlock'],BED=['bedSupport','heatbed','sheet'];
// The source CAD bed is already low. Set this procedure's initial bed pose
// from the nozzle/sheet surfaces, then demonstrate 100 mm of downward travel.
const BED_START=305.5994212627411-78.43609840000578-.5,BED_SERVICE=BED_START-100;
const PF='servicePrintLead',HF='serviceHotendFanLead',MOTOR='lbMotorLead',NTC='lbNtcLead',LOAD='lbLoadcellLead',FILAMENT='lbFilamentLead',MAIN='lbMainLead';
const NEXTRUDER=NEXTRUDER_BODY_REFS;
// The two right-cover nuts and left-cover nut are captive in the rear cover.
const RIGHT=['ventLever'],REAR=[860,'leftCoverNut',875,877],PRINT_FAN=[833,PF];
const fanMotion={waypoints:[[0,35,35],[0,0,0]],tilt:{axis:[1,0,0],degrees:-30,pivot:[9,19.9,369.6],sync:true}};
// Release the lower locating edge, then withdraw from the rear of the mount.
// Installation and removal use the same rigid path in opposite directions.
const boardMotion=loveBoardMotion;
// Disengage the mount, tip the cover back and clear the fixed shroud on the left.
const rearCoverMotion={motionPivot:[0,-35.2952524,363.70042],camera:'back-perspective',focusRefs:[859,'loveBoard'],posePath:[
 {offset:[-44.033,15.292,10.758],rotation:[-23.740,-12.346,-13.223]},
 {offset:[-41.291,9.511,6.868],rotation:[-23.775,-8.011,-5.709]},
 {offset:[0,4,0],rotation:[-20,0,0]},
 {offset:[0,4,0],rotation:[0,0,0]},
 {offset:[0,0,0],rotation:[0,0,0]}
]};
const labels={main:'メインコネクター|Main connector|Hlavní konektor|Hauptstecker',motor:'モーター|Motor|Motor|Motor',ntc:'ヒートシンクNTC|Heatsink NTC|NTC chladiče|Kühlkörper-NTC',load:'ロードセル|Loadcell|Loadcell|Wägezelle',sensor:'フィラメントセンサー|Filament sensor|Senzor filamentu|Filamentsensor',heater:'ヒーター|Heater|Topení|Heizung',thermistor:'サーミスター|Thermistor|Termistor|Thermistor',print:'プリントファン|Print fan|Tiskový ventilátor|Drucklüfter',hotfan:'ホットエンドファン|Hotend fan|Ventilátor hotendu|Hotend-Lüfter',body:'Nextruder本体|Nextruder body|Tělo Nextruderu|Nextruder',rear:'背面カバー|Rear cover|Zadní kryt|Rückabdeckung',ptfe:'PTFE継手|PTFE fitting|PTFE šroubení|PTFE-Verschraubung'};
export function loveBoardServiceScene(task,index,text){
 const s=task.steps[index],n=index+1,plan={workspace:'printer',pose:'printer-standing',chapter:10,step:n,camera:s.refs.includes('lcd')?'front':n>=14&&n<=18?'back-perspective':'service-fan-connect',focus:s.refs,focusPadding:25,operationPadding:12,contextOpacity:.055,undersideView:true,headOnly:n>=7&&n<=28,transparentRefs:[],solidRefs:[859,'loveBoard',847,MAIN,...NEXTRUDER_INTERNAL_REFS],actors:[],seed:[],workpiecePoses:[],note:''},hidden=['loveMainPlug'];
 const flexStates={[HF]:n>10&&n<=22?0:1,[PF]:n>10&&n<=23?0:1,[MOTOR]:n>10&&n<=22?0:1,[NTC]:n>10&&n<=22?0:1,[LOAD]:n>11&&n<=21?0:1,[FILAMENT]:n>11&&n<=21?0:1,[MAIN]:n<=14?1:n===15?.5:n<=17?0:n===18?.5:1};
 if(n>13&&n<=19)flexStates[NTC]=-1;
 const amount=n<=8?1:n<=9?.35:n<=26?0:n<=27?.35:1;for(const id of LEADS)flexStates[id]=amount;
 const move=(refs,offset)=>plan.workpiecePoses.push({refs,pivot:[0,0,0],rotation:[0,0,0],offset});
 if(n>5&&n<29)hidden.push(...TOP);if(n>7&&n<28)hidden.push(858,879);if(n>11&&n<21)hidden.push(...RIGHT,870,872);
 if(n>12&&n<20)hidden.push(791,HF,819,821);if(n>13&&n<19)hidden.push(...NEXTRUDER,817,823,825,827);
 if(n>14&&n<18)hidden.push(...REAR,864,866,...PRINT_FAN,845);if(n===16){move(['loveBoard'],[0,35,0]);hidden.push(847);}
 if(n>9&&n<24)move(HOTEND,[0,0,-60]);if(n>9&&n<24)move([795,807],[-2.5,0,0]);
 // Keep carrier, heater and sheet together throughout preparation and repair.
 if(n<4)move(BED,[0,0,BED_START]);else if(n>4)move(BED,[0,0,BED_SERVICE]);
 const a=(refs,label,axis,distance,extra={})=>plan.actors.push({refs,label,axis,distance,showBefore:true,focusMotion:true,...extra});
 const label=k=>text(labels[k].split('|'));
 const flex=(id,from,to,k)=>plan.actors.push({flex:[id],fromStates:{[id]:from},to,label:label(k),axis:[0,0,1],showBefore:true,focusMotion:true,...(id===FILAMENT?{anchors:[socketCentre('J2')]}:{}),...(id===MOTOR?{connectorDirectionCAD:[.7,-.35,2],connectorFocusBounds:[-5,-34,412,3,-28,420],connectorPadding:.8,connectorMinDistance:50,anchors:[[-.7,-30.6,416.2]],calloutAvoidBounds:[-5,-34,412,3,-28,420],guideRadius:1.5,guideTube:.2,...(n===10&&task.id==='loveboard'?{connectorDirectionCAD:[-.1,-.6,1.5],connectorFocusBounds:[-4.795,-34.406,412.163,3.205,-28.406,420.163],anchors:[[-.795,-31.406,416.163]],calloutAvoidBounds:[-4.795,-34.406,412.163,3.205,-28.406,420.163]}:{})}:{}),focusRefs:['loveBoard'],camera:[LOAD,FILAMENT].includes(id)?'service-sensor-connect':'service-fan-connect'});
 const ntcHook=(from,to)=>{
  plan.solidRefs.push(857,NTC);
  plan.actors.push({flex:[NTC],fromStates:{[NTC]:from},to,label:text((to<from?'NTCの配線をフックから外す|Release the NTC lead from the hook|Uvolněte kabel NTC z háčku|NTC-Kabel aus dem Haken lösen':'NTCの配線をフックに戻す|Refit the NTC lead in the hook|Vraťte kabel NTC do háčku|NTC-Kabel in den Haken einsetzen').split('|')),axis:[1,0,0],showBefore:true,focusMotion:true,focusBounds:[-15,-54,332,10,-40,374],transparentRefs:[790,794,816],focusPadding:3,focusMinDistance:70,guideRadius:1.5,guideTube:.25,guideArrowLength:5,anchors:[[-7,-47.5,373]],camera:'service-ntc-hook'});
 };
 const pair=(kind,from,to,k)=>{const ids=[`hotend${kind}0`,`hotend${kind}1`];plan.actors.push({flex:ids,fromStates:Object.fromEntries(ids.map(id=>[id,from])),to,label:label(k),axis:[0,0,1],focusMotion:true,focusRefs:['loveBoard'],camera:'service-fan-connect'});};
 const screw=(id,name,axis,distance,remove=false)=>a([id],name,axis,distance,{remove,showBefore:remove,spin:1080,focusRefs:[859,'loveBoard'],...(axis[0]>0?{camera:'service-right-connect'}:{})});
 switch(s.action){
 case'lb-bed-down':plan.camera='front';plan.solidRefs=[...plan.solidRefs,...BED];a(BED,text(s.title),[0,0,-1],100,{remove:true,keepRemoved:true,camera:'front',motionPivot:[0,0,0],posePath:[{offset:[0,0,BED_SERVICE],rotation:[0,0,0]},{offset:[0,0,BED_START],rotation:[0,0,0]}]});break;
 case'lb-top-out':a(TOP,text(s.title),[0,0,1],70,{remove:true});break;
 case'lb-top-in':a(TOP,text(s.title),[0,0,1],70);break;
 case'lb-cover-out':a([879],'M3×10',[-1,0,0],20,{...leftCoverScrewMotion,remove:true,spin:1080});a([858],text(s.title),[-1,0,0],35,{...leftCoverMotion,remove:true});Object.assign(plan,leftCoverView);break;
 case'lb-cover-in':a([858],text(s.title),[-1,0,0],35,leftCoverMotion);a([879],'M3×10',[-1,0,0],20,{...leftCoverScrewMotion,showBefore:false,spin:1080});Object.assign(plan,leftCoverView);break;
 case'lb-hotend-unplug':plan.inspectBoard=true;plan.transparentRefs=[790,794,816];pair('Heater',1,.35,'heater');pair('Thermistor',1,.35,'thermistor');break;
 case'lb-hotend-out':pair('Heater',.35,0,'heater');pair('Thermistor',.35,0,'thermistor');for(const id of[795,807])a([id],'M3',[ -1,0,0],2.5,{remove:true,keepRemoved:true,spin:1800});a(HOTEND,text(s.title),[0,0,-1],60,{remove:true,keepRemoved:true});break;
 case'lb-left-unplug':flex(PF,1,0,'print');flex(MOTOR,1,0,'motor');flex(NTC,1,0,'ntc');flex(HF,1,0,'hotfan');break;
 case'lb-right-out':for(const id of[870,872])screw(id,'M3×6',[1,0,0],15,true);a(RIGHT,text(s.title),[1,0,0],35,{remove:true,camera:'service-right-connect'});flex(LOAD,1,0,'load');flex(FILAMENT,1,0,'sensor');break;
 case'lb-right-in':flex(LOAD,0,1,'load');flex(FILAMENT,0,1,'sensor');a(RIGHT,text(s.title),[1,0,0],35,{showBefore:false,camera:'service-right-connect'});for(const id of[870,872])screw(id,'M3×6',[1,0,0],15);break;
 case'lb-hotfan-out':for(const id of[819,821])screw(id,'M3×18',[0,-1,0],25,true);a([791,HF],label('hotfan'),[0,-1,0],45,{remove:true});break;
 case'lb-hotfan-in':a([791,HF],label('hotfan'),[0,-1,0],45);for(const id of[819,821])screw(id,'M3×18',[0,-1,0],25);break;
 case'lb-nextruder-out':for(const id of[823,825,827])screw(id,'M3×10',[0,-1,0],22,true);a([817],label('ptfe'),[0,0,1],12,{remove:true,spin:1080});ntcHook(0,-1);a(NEXTRUDER,label('body'),[0,-1,0],85,{remove:true,keepRemoved:true});break;
 case'lb-nextruder-in':a(NEXTRUDER,label('body'),[0,-1,0],85);ntcHook(-1,0);a([817],label('ptfe'),[0,0,1],12,{spin:1080,showBefore:false});for(const id of[823,825,827])screw(id,'M3×10',[0,-1,0],22);break;
 case'lb-rear-out':screw(845,'M3×20',[0,.906307787,-.422618262],30,true);a(PRINT_FAN,label('print'),[0,1,1],35,{...fanMotion,remove:true});for(const id of[864,866])screw(id,'M3×10',[0,1,0],20,true);a(REAR,label('rear'),[0,1,0],35,{...rearCoverMotion,remove:true});flex(MAIN,1,.5,'main');break;
 case'lb-rear-in':flex(MAIN,.5,1,'main');a(REAR,label('rear'),[0,1,0],35,rearCoverMotion);for(const id of[864,866])screw(id,'M3×10',[0,1,0],20);a(PRINT_FAN,label('print'),[0,1,1],35,fanMotion);screw(845,'M3×20',[0,.906307787,-.422618262],30);break;
 case'lb-board-out':flex(MAIN,.5,0,'main');screw(847,'M3×8rT',[0,1,0],20,true);a(['loveBoard'],text(s.title),[0,1,0],35,{...boardMotion,remove:true,keepRemoved:true,camera:'back-perspective',focusRefs:[859]});break;
 case'lb-board-in':a(['loveBoard'],text(s.title),[0,1,0],35,{...boardMotion,camera:'back-perspective',focusRefs:[859]});screw(847,'M3×8rT',[0,1,0],20);flex(MAIN,0,.5,'main');break;
 case'lb-left-plug':flex(MOTOR,0,1,'motor');flex(NTC,0,1,'ntc');flex(HF,0,1,'hotfan');break;
 case'lb-print-plug':flex(PF,0,1,'print');break;
 case'lb-hotend-in':a(HOTEND,text(s.title),[0,0,-1],60);for(const id of[795,807])a([id],'M3',[ -1,0,0],2.5,{spin:1800});break;
 case'lb-hotend-route':pair('Thermistor',0,.35,'thermistor');pair('Heater',0,.35,'heater');break;
 case'lb-hotend-plug':plan.inspectBoard=true;plan.transparentRefs=[790,794,816];pair('Thermistor',.35,1,'thermistor');pair('Heater',.35,1,'heater');break;
 }
 if(n>=10&&n<=23)plan.solidRefs=[...plan.solidRefs,...s.refs];
 return {plan,hidden,flexStates,hotendLeadAmount:amount,disconnect:false};
}
