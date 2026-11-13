import{shortInputInspection,shortInputPhaseCaption}from'./side-sensor-ptfe-plan.js';
import {ARM,CLAMP,FIXED_TENSION,IDLER_PIVOT,CLAMP_PIVOT} from './maintenance-access.js?v=20261113-116';
const BOLTS=[813,804,814];
const AXES={813:[-6.443571,-63.54525,408.500413],804:[24.556429,-63.54525,377.500413],814:[24.556429,-63.54525,408.500413]};
const PG=[816,'mainPlate','pgRing','pgAssembly',...BOLTS];
// Nominal coarse M3 advance, not an OEM flush-height measurement.
export const INITIAL_GEARBOX_SCREW_TRAVEL=.5*1.5;
const label={
 inspect:['3本の前面ネジとスイベルを確認する','Locate the three front screws and swivel','Najděte tři přední šrouby a otočný díl','Drei vordere Schrauben und Schwenkhebel lokalisieren'],
 release:['スイベルを持ち上げてロックを外す','Lift the swivel to unlock','Zvedněte otočný díl a odjistěte','Schwenkhebel zum Entriegeln anheben'],
 open:['アイドラーを開く','Open the idler','Otevřete idler','Idler öffnen'],
 close:['アイドラーを閉じる','Close the idler','Zavřete idler','Idler schließen'],
 latch:['スイベルを下げてロックする','Lower the swivel to lock','Sklopte otočný díl a zajistěte','Schwenkhebel absenken und verriegeln'],
 loose:['前面ネジを1本ずつ1.5回転緩める','Loosen each front screw by1.5 turns','Povolte každý přední šroub o1,5 otáčky','Jede vordere Schraube um1,5 Umdrehungen lösen'],
 tight:['画面の順で前面ネジを軽く本締めする','Tighten the front screws gently in the displayed order','Šetrně dotáhněte přední šrouby v zobrazeném pořadí','Vordere Schrauben in angezeigter Reihenfolge vorsichtig festziehen'],
 wait:['自動整列中は外側の部品を動かさず待ちます。内部の動きは外から見えません。','Wait with the external parts still during automatic alignment; the internal process is not visible.','Při automatickém seřízení nechte vnější díly v klidu; vnitřní proces není vidět.','Während der automatischen Ausrichtung äußere Teile still halten; der innere Vorgang ist nicht sichtbar.'],
 switch:['側面スイッチのON位置を確認する','Check the side switch is ON','Zkontrolujte polohu ON bočního spínače','ON-Stellung des seitlichen Schalters prüfen'],
 switchLocation:["スイッチをONにする（図はOFF位置）","Set switch to ON (shown OFF)","Přepněte na ON (na obrázku OFF)","Auf ON stellen (Abbildung: OFF)"],
 inlet:['右ハンドル下のPTFE入口を確認する','Locate the PTFE inlet below the right handle','Najděte vstup PTFE pod pravou rukojetí','PTFE-Eingang unter dem rechten Griff lokalisieren'],
 doorScrew:['左テンショナー背面のM3x12調整ネジを確認する','Locate the M3x12 adjustment screw behind the left tensioner','Najděte seřizovací šroub M3x12 za levým napínákem','M3x12-Einstellschraube hinter dem linken Spanner lokalisieren'],
 doorOpening:['実機の前面穴でスイッチの出入りを確認する','Check the switch movement at the front opening on the printer','Na tiskárně ověřte pohyb spínače v předním otvoru','Am Drucker die Schalterbewegung in der vorderen Öffnung prüfen']
};
const pose=(refs,pivot,angle)=>({refs,pivot,rotation:[0,angle,0],offset:[0,0,0]});
const common={axis:[0,1,0],distance:0,showBefore:true,focusMotion:true,focusPadding:5,focusMinDistance:90,camera:'front',focusBounds:[-23,-82,369,34,-39,432]};
const swing=(refs,pivot,from,to,title)=>({...common,refs,label:title,motionPivot:pivot,posePath:[{offset:[0,0,0],rotation:[0,from,0]},{offset:[0,0,0],rotation:[0,to,0]}]});
const bolt=(id,closing,title)=>({...common,refs:[id],label:title,motionPivot:AXES[id],posePath:closing?[{offset:[0,-INITIAL_GEARBOX_SCREW_TRAVEL,0],rotation:[0,-540,0]},{offset:[0,0,0],rotation:[0,0,0]}]:[{offset:[0,0,0],rotation:[0,0,0]},{offset:[0,-INITIAL_GEARBOX_SCREW_TRAVEL,0],rotation:[0,-540,0]}],guideRadius:2.5,guideArrowLength:4});
export function normalizeInitialSetupFrame(event,tasks){
 if(!event||event.taskId!=='initial-setup')return null;
 const task=tasks.find(t=>t.id===event.taskId),step=Number.isInteger(event.stepIndex)?task?.steps[event.stepIndex]:task?.steps.find(s=>s.officialStep===event.officialStep);
 const officialStep=step?.officialStep,frame=event.frame??event;
 if(frame.kind==='photo'||frame.kind==='instruction')return null;
 const phase=frame.phase;
 if(officialStep===11&&frame.kind==='gearbox'&&['intro','filament_loaded_ask_unload','filament_unknown_ask_unload','loosen_screws','alignment','tighten_screws','done'].includes(phase))return{officialStep,phase,kind:'gearbox'};
 if(frame.kind==='initial-setup'&&(officialStep===9&&frame.action==='door'||officialStep===12&&frame.action==='fsensors'))return{officialStep,phase,kind:frame.kind,action:frame.action};
 return null;
}
export function initialSetupPhaseCaption(frame,text){
 if(!frame)return '';
 if(frame.officialStep===11){if(frame.phase==='alignment')return text(['自動整列を待つ（外部操作なし）','Wait for automatic alignment','Vyčkejte na automatické seřízení','Automatische Ausrichtung abwarten']);const key={loosen_screws:'loose',tighten_screws:'tight',done:'close'}[frame.phase]||'inspect';return text(label[key]);}
 if(frame.officialStep===12)return frame.phase==='prepare'?text(label.switchLocation):shortInputPhaseCaption(frame.phase,text)||text(/insert|remove/.test(frame.phase||'')?label.inlet:label.switch);
 return '';
}
export function initialSetupPhysicalScene(task,index,text,frame){
 const n=task.steps[index].officialStep??index+1;if(task.id!=='initial-setup'||![9,11,12].includes(n))return null;
 const plan={workspace:'printer',pose:'printer-standing',chapter:10,step:n,camera:'front',headOnly:n===11,focusPadding:8,operationPadding:6,contextOpacity:.1,transparentRefs:[],actors:[],seed:[],workpiecePoses:[],note:'',initialSetupPhysical:{officialStep:n,phase:frame?.officialStep===n?frame.phase:null}};
 const spec={plan,hidden:[],disconnect:false,hotendLeadAmount:1,flexStates:{serviceHotendFanLead:1,servicePrintLead:1,lbMotorLead:1,lbLoadcellLead:1,lbFilamentLead:1,lbNtcLead:1,lbMainLead:1}};
 if(n===9){
  plan.focus=[399,400,456];plan.camera='back';plan.solidRefs=[399,400,456,458,14];plan.focusPadding=12;
  plan.actors=[{refs:[399],label:text(label.doorScrew),axis:[0,1,0],distance:0,showBefore:true,inspection:true,focusMotion:true,focusRefs:[399],focusPadding:10,focusMinDistance:90,camera:'back'},
   {refs:[400,456],label:text(label.doorOpening),axis:[0,-1,0],distance:0,showBefore:true,inspection:true,focusMotion:true,focusBounds:[-196,-216,349,-162,-176,387],focusPadding:5,focusMinDistance:105,camera:'front'}];return spec;
 }
 if(n===12){
  plan.headOnly=false;plan.camera='right-perspective';plan.focus=['sensorSwitch','sensorBody'];plan.settledFocus=['sensorBody'];plan.solidRefs=['sensorSwitch','sensorBody','sensorCover',75,'sideSensorInputPtfe'];
  plan.actors=[{refs:['sensorSwitch'],label:text(label.switch),axis:[1,0,0],distance:0,showBefore:true,inspection:true,focusMotion:true,focusRefs:['sensorSwitch'],focusPadding:10,focusMinDistance:90,camera:'right'},
   shortInputInspection(frame?.phase,text)];
  if(frame?.officialStep===12&&/insert|remove|success/.test(frame.phase||'')){plan.actors=plan.actors.slice(1);plan.settledFocus=undefined;plan.undersideView=true;}
  else if(frame?.officialStep===12&&frame.phase==='prepare'){plan.camera='left-cover-perspective';plan.actors=plan.actors.slice(0,1).map(a=>({...a,label:text(label.switchLocation),officialLine:1014516,camera:'left-cover-perspective',axis:[-0.9998278002320157,-0.00551303830344159,-0.017719376170541958],anchors:[[183.25231424967447,-18.557371775309242,304.756103515625]],guideAtAnchor:true,guideRadius:1.7,guideTube:.14,guideArrowLength:0,calloutAvoidBounds:[181.69574711640576,-26.772343948772676,300.97516794603007,198.8479631303402,1.99123225993224,322.5949173661289]}));}
  return spec;
 }
 const phase=frame?.officialStep===11?frame.phase:'intro';
 plan.focus=[...BOLTS,...CLAMP];plan.solidRefs=[...PG,...CLAMP,...ARM,...FIXED_TENSION];plan.viewBounds=[-23,-82,369,34,-35,435];plan.viewMinDistance=100;
 plan.initialSetupPhysical.phase=phase;
 if(phase==='loosen_screws')plan.actors=[swing(CLAMP,CLAMP_PIVOT,0,45,text(label.release)),...BOLTS.map(id=>bolt(id,false,text(label.loose))),swing(ARM,IDLER_PIVOT,0,-10,text(label.open))];
 else if(phase==='alignment'){
  plan.workpiecePoses=[pose(CLAMP,CLAMP_PIVOT,45),pose(ARM,IDLER_PIVOT,-10),...BOLTS.map(id=>({refs:[id],pivot:AXES[id],rotation:[0,-540,0],offset:[0,-INITIAL_GEARBOX_SCREW_TRAVEL,0]}))];plan.note=text(label.wait);
 }else if(phase==='tighten_screws'){
  plan.workpiecePoses=[pose(CLAMP,CLAMP_PIVOT,45),pose(ARM,IDLER_PIVOT,-10)];plan.actors=BOLTS.map(id=>bolt(id,true,text(label.tight)));
 }else if(phase==='done')plan.actors=[swing(ARM,IDLER_PIVOT,-10,0,text(label.close)),swing(CLAMP,CLAMP_PIVOT,45,0,text(label.latch))];
 else plan.actors=[{...common,refs:[...BOLTS,...CLAMP],label:text(label.inspect),inspection:true,guideGhost:false}];
 return spec;
}
