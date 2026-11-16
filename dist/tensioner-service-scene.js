import {CHAMBER_RIVETS} from './chamber-service-datums.js';
export const TENSIONER_GEOMETRY={left:{body:400,carrier:405,nut:551,axle:412,adjust:436,fix:[440,442,444],centre:[-181.99865,-159.2,356.5]},right:{body:396,carrier:568,nut:553,axle:418,adjust:438,fix:[446,448,450],centre:[182.00135,-159.2,345.5]}};
export const TENSIONER_DOOR=[14,12,13,572,574,575,576,577,579,581,583,585,587,589,590,'doorHingePinLower','doorHingePinUpper','doorHandlePlate','doorHandleScrew0','doorHandleScrew1'];
export const TENSIONER_DOOR_LEAF=[572,575,576,579,581,583,585,590,'doorHandlePlate','doorHandleScrew0','doorHandleScrew1'];
const doorPivot=[-178.44637203304407,-208.27588698405032,0];
export const TENSIONER_LCD=['lcd','lcdScreen','lcdFaston'];
export const TENSIONER_PROFILE_FIX=[107,284,300,277,285];
export const TENSIONER_PROFILE_TOP=129;
let selectedSide='right';export function tensionerSide(){return selectedSide;}
export function setTensionerSide(side){if(!['left','right'].includes(side))throw Error('Invalid tensioner side');selectedSide=side;}
const releaseTiming=new Map();export const tensionerReleaseTiming=id=>releaseTiming.get(id)||'first';
export function setTensionerReleaseTiming(id,value){if(!['belt-tensioner-left','belt-tensioner-right'].includes(id)||!['first','after-body'].includes(value))throw Error('Invalid release route');releaseTiming.set(id,value);}
const v=(a,b,k=1)=>a.map((x,i)=>x+k*b[i]),zero=[0,0,0],key=r=>String(r);
export const tensionerRivets=CHAMBER_RIVETS.filter(r=>['sideTop','side'].includes(r.family)).map(r=>({...r,id:'ts-'+r.id}));
export function tensionerServiceScene(task,index,text){
 if(!task.tensionerService)return null;
 const left=task.id.endsWith('left'),right=task.id.endsWith('right'),side=left?'left':right?'right':selectedSide,d=TENSIONER_GEOMETRY[side],idler='tsIdler-'+side,sensor='tsDoorSwitch',stock=new Map(),flex=Object.fromEntries(tensionerRivets.map(r=>[r.id,1])),defer=(left||right)&&tensionerReleaseTiming(task.id)==='after-body',bodyPark=defer?[left?50:-50,28,20]:[0,15,55];
 let loop=[0,0,0],coupled=true,sensorParked=false,opening=0;
 const stages=[];
 const pose=r=>stock.get(key(r))||{offset:[0,0,0],rotation:[0,0,0],pivot:[0,0,0]};
 const snap=()=>({poses:[...stock].map(([r,p])=>({refs:[/^\d+$/.test(r)?Number(r):r],...structuredClone(p)})),flex:{...flex},loop:[...loop],coupled,sensorParked,opening});
 let actors=[],start;const screwAxes=new Map(),withdrawn=new Map();
 const go=(refs,target,label,{via=[],rotation=[0,0,0],pivot=[0,0,0],axis=[0,0,1],spin=0,...extra}={})=>{
  if(!Array.isArray(refs))refs=[refs];const groups=new Map();
  for(const r of refs){const p=pose(r),s=start.poses.find(p=>p.refs[0]===r)||{offset:zero,rotation:zero,pivot:zero},sig=JSON.stringify([p.offset,p.rotation,s.offset,s.rotation]);if(!groups.has(sig))groups.set(sig,{refs:[],p,s});groups.get(sig).refs.push(r);}
  for(const {refs,p,s}of groups.values()){
   const path=[{offset:v(p.offset,s.offset,-1),rotation:v(p.rotation,s.rotation,-1)},...via.map(x=>({offset:v(Array.isArray(x)?x:x.offset,s.offset,-1),rotation:v(Array.isArray(x)?rotation:x.rotation??rotation,s.rotation,-1)})),{offset:v(target,s.offset,-1),rotation:v(rotation,s.rotation,-1)}];
   actors.push({refs,label,axis,distance:0,showBefore:true,handling:true,focusMotion:true,carry:true,motionPivot:v(pivot,s.offset),posePath:path,guideRadius:2,guideTube:.25,focusPadding:8,...(spin?{threadTurns:spin/360}:{}),...extra});
   for(const r of refs)stock.set(key(r),{offset:[...target],rotation:[...rotation],pivot:[...pivot]});
  }
 };
 const carryOffset=(refs,target,label,{via=[]}={})=>{const before=pose(refs[0]).offset,seed=r=>start.poses.find(p=>p.refs[0]===r)?.offset||zero,base=seed(refs[0]),current=v(before,base,-1),delta=v(target,before,-1),carriedRefs=refs.map(r=>({refs:[r],offset:v(v(pose(r).offset,seed(r),-1),current,-1)}));actors.push({refs,label,axis:[0,1,0],distance:0,showBefore:true,handling:true,carry:true,focusMotion:true,motionPivot:zero,carriedRefs,posePath:[{offset:current,rotation:zero},...via.map(p=>({offset:v(p,base,-1),rotation:zero})),{offset:v(target,base,-1),rotation:zero}],guideRadius:2,guideTube:.25});for(const r of refs){const p=pose(r);stock.set(key(r),{...structuredClone(p),offset:v(p.offset,delta)});}};

 const openBelt=(to,label)=>{actors.push({refs:['tsBelt-'+side],label,axis:[1,0,0],distance:0,showBefore:true,handling:true,focusMotion:true,operationFocus:['tsBelt-'+side],beltOpening:{from:opening,to},beltLoop:[...loop]});opening=to;};
 const screwOut=(r,axis,travel=36)=>{const target=v(pose(r).offset,axis,travel);screwAxes.set(r,axis);withdrawn.set(r,target);go(r,target,'M3 · '+text(['ねじを軸方向へ抜く','Withdraw screw on its axis','Vyjmout šroub ve směru osy','Schraube entlang ihrer Achse herausziehen']),{axis,spin:-1800});};
 const screwIn=r=>{const label='M3 · '+text(['保管したねじを戻す','Refit the retained screw','Vrátit uschovaný šroub','Aufbewahrte Schraube montieren']),w=withdrawn.get(r),p=pose(r).offset;if(d.fix.includes(r)&&w&&p.some((x,i)=>Math.abs(x-w[i])>1e-9))go(r,w,label,{via:[[p[0],p[1],w[2]+35],[0,0,w[2]+35]],axis:[0,0,-1]});go(r,zero,label,{axis:(screwAxes.get(r)||[0,0,1]).map(x=>-x),spin:1800,...(!d.fix.includes(r)&&w?{via:[w]}:{})});};
 const begin=()=>{actors=[];start=snap();};const end=()=>stages.push({...start,actors,final:snap()});
 const inspect=(refs,label)=>actors.push({refs:Array.isArray(refs)?refs:[refs],label,axis:[0,0,1],distance:0,inspection:true,handling:true,showBefore:true,focusMotion:true});
 const rivet=(family,out)=>{for(const r of tensionerRivets.filter(r=>r.family===family)){
  const a=out?[1,.8,0]:[0,.8,1];for(let k=0;k<2;k++)actors.push({flex:[r.id],fromStates:{[r.id]:a[k]},to:a[k+1],label:text(out?(k===0?['リベットのピンを解除する','Release rivet pin','Odjistit kolík nýtu','Nietstift lösen']:['リベット本体を抜く','Withdraw rivet body','Vytáhnout tělo nýtu','Nietkörper ziehen']):(k===0?['リベット本体を戻す','Insert rivet body','Vložit tělo nýtu','Nietkörper einsetzen']:['ピンを押してロックする','Press pin to lock','Stisknout kolík a zajistit','Stift eindrücken und verriegeln'])),showBefore:true,focusMotion:true,focusBounds:r.p.map(x=>x-18).concat(r.p.map(x=>x+18)),focusMinDistance:90});flex[r.id]=a[2];
 }};
 const release=title=>{go(d.adjust,[0,-12,0],title,{axis:[0,-1,0]});go([d.carrier,d.nut,d.axle,idler],[0,28,24],title,{via:[[0,18,0],[0,28,0]],axis:[0,1,0]});loop=[0,28,24];};
 const disassemble=title=>{screwOut(d.axle,[0,0,side==='left'?-1:1],24);go([d.carrier,d.nut],[side==='left'?26:-26,28,24],title,{axis:[side==='left'?1:-1,0,0]});coupled=false;openBelt(3.5,text(['ベルトの輪を緩めて広げる','Open the slack belt loop','Rozevřít volnou smyčku řemenu','Lose Riemenschlaufe öffnen']));go(idler,[0,44,42],title,{via:[[0,44,24]],axis:[0,0,1]});};
 const prepareNut=title=>{go(d.nut,[side==='left'?46:-46,28,24],title,{focusMinDistance:70,focusPadding:4,axis:[side==='left'?1:-1,0,0]});go(d.nut,[side==='left'?26:-26,28,24],title,{focusMinDistance:70,focusPadding:4,axis:[side==='left'?-1:1,0,0]});};
 const assemble=title=>{go(idler,[0,28,24],title,{via:[[0,44,24]],axis:[0,0,-1]});openBelt(0,text(['ねじれを取ってベルトを掛ける','Seat the untwisted belt loop','Nasadit nepřekroucenou smyčku','Unverdrehte Riemenschlaufe anlegen']));coupled=true;go([d.carrier,d.nut],[0,28,24],title);go(d.axle,[0,28,24],title,{via:[[0,28,side==='left'?0:48]],axis:[0,0,side==='left'?1:-1]});};
 const fit=title=>{go([d.carrier,d.nut,d.axle,idler],zero,title,{via:[[0,28,0],[0,18,0]],axis:[0,-1,0]});loop=zero;go(d.adjust,[0,-3,0],title,{axis:[0,1,0]});};
 const tighten=title=>{for(const s of [side,side==='left'?'right':'left']){const q=TENSIONER_GEOMETRY[s];go(q.adjust,[0,-1,0],title,{axis:[0,1,0]});go(q.adjust,zero,title,{axis:[0,1,0]});}};
 const removeBody=title=>{
  for(const r of d.fix){screwOut(r,[0,0,1],r===444?55:defer?45:36);go(r,[left?60:-60,defer?90:20,r===444?55:45],title);}
  const body=left?[d.body,399]:[d.body];
  if(defer){go(d.adjust,[0,-45,0],title,{axis:[0,-1,0]});carryOffset([...body,d.carrier,d.nut,d.axle,idler],[0,28,20],title,{via:[[0,2,2],[0,28,2]]});go([d.carrier,d.nut,d.axle,idler],[0,48,20],title,{axis:[0,1,0]});go(body,bodyPark,title);go([d.carrier,d.nut,d.axle,idler],[0,28,24],title,{via:[[0,48,24]]});loop=[0,28,24];disassemble(title);}
  else{go(d.adjust,[0,-40,0],title);go(body,bodyPark,title,{via:[[0,15,2]]});}
  if(left)go(399,v(bodyPark,[0,20,0]),title);
 };
 for(let i=0;i<task.steps.length;i++){
  begin();const title=text(task.steps[i].title);
  if(i===2){inspect(['lcd'],title);go(TENSIONER_DOOR_LEAF,zero,text(['作業前にドアを開く','Open the door for access','Otevřít dvířka pro přístup','Tür für den Zugang öffnen']),{rotation:[0,0,-80],pivot:doorPivot});}
  if(!left){
   if(i===4){if(defer)go(d.adjust,[0,-12,0],title,{axis:[0,-1,0]});else release(title);}if(i===5&&!defer)disassemble(title);
   if(right&&i===6)removeBody(title);
   if(right&&i===8){go(d.body,zero,title,{via:defer?[[...bodyPark.slice(0,2),55],[0,15,55],[0,15,2]]:[[0,15,2]]});for(const r of d.fix)screwIn(r);go(d.adjust,[0,-12,0],title,{via:[[0,-40,0]]});}
   if(i===(right?10:7))prepareNut(title);
   if(i===(right?11:8))assemble(title);
   if(i===(right?12:9))inspect([d.adjust],title);
   if(i===(right?13:10))fit(title);
   if(i===(right?14:11)){go(TENSIONER_DOOR_LEAF,zero,title,{pivot:doorPivot});tighten(title);}
  }else{
   if(i===3){rivet('sideTop',true);go(83,[-85,0,0],title,{axis:[-1,0,0]});}
   if(i===4){rivet('side',true);go([48,'handleLeft'],[-100,0,0],title,{axis:[-1,0,0]});}
   if(i===5)go(TENSIONER_LCD,[28,-34,-3],title,{via:[{offset:[0,0,0],rotation:[0,-1,0]},{offset:[0,-34,0],rotation:[0,-1,0]},{offset:[28,-34,0],rotation:[0,-1,0]}],pivot:[-180,-207,0],axis:[1,0,0]});
   if(i===6)for(const r of TENSIONER_PROFILE_FIX){const sideScrew=[107,284,300].includes(r);screwOut(r,sideScrew?[-1,0,0]:[0,-1,0],14);if(!sideScrew)go(r,[50,-14,0],title);}
   if(i===7){screwOut(TENSIONER_PROFILE_TOP,[0,-1,0],14);go(TENSIONER_PROFILE_TOP,[50,-14,0],title);carryOffset(TENSIONER_DOOR,[0,-100,10],title,{via:[[0,-6,6]]});}
   if(i===8){actors.push({flex:['tsOldDoorTie'],fromStates:{tsOldDoorTie:1},to:0,label:title,showBefore:true,focusMotion:true});flex.tsOldDoorTie=0;screwOut(456,[-.927184,0,.374607],16);go([sensor],[-7,-10,-12],title,{via:[{offset:[-12,0,0],rotation:[0,0,0]},{offset:[-12,0,0],rotation:[0,0,-90]}],rotation:[0,0,-90],pivot:[-185,-191,363],axis:[0,1,0]});sensorParked=true;}
   if(i===9){if(defer)go(d.adjust,[0,-12,0],title,{axis:[0,-1,0]});else release(title);}if(i===10&&!defer)disassemble(title);
   if(i===11)removeBody(title);
   if(i===13){go(399,bodyPark,title);carryOffset([d.body,399],zero,title,{via:defer?[[...bodyPark.slice(0,2),55],[0,15,55],[0,15,2]]:[[0,15,2]]});}
   if(i===14)for(const r of d.fix)screwIn(r);
   if(i===15){go([sensor],zero,title,{via:[{offset:[-12,0,0],rotation:[0,0,-90]},{offset:[-12,0,0],rotation:[0,0,0]}],pivot:[-185,-191,363],axis:[1,0,0]});screwIn(456);sensorParked=false;actors.push({flex:['tsNewDoorTie'],fromStates:{tsNewDoorTie:0},to:7,label:title,showBefore:false,focusMotion:true});flex.tsNewDoorTie=7;}
   if(i===16)inspect([d.adjust],title);if(i===17){go(d.adjust,[0,-12,0],title);prepareNut(title);}if(i===18)assemble(title);if(i===19)fit(title);
   if(i===20){carryOffset(TENSIONER_DOOR,zero,title,{via:[[0,-6,6]]});screwIn(TENSIONER_PROFILE_TOP);}
   if(i===21)for(const r of TENSIONER_PROFILE_FIX)screwIn(r);
   if(i===22){go(TENSIONER_LCD,zero,title,{via:[{offset:[28,-34,0],rotation:[0,-1,0]},{offset:[0,-34,0],rotation:[0,-1,0]},{offset:[0,0,0],rotation:[0,-1,0]}],pivot:[-180,-207,0],axis:[-1,0,0]});go(TENSIONER_DOOR_LEAF,zero,title,{pivot:doorPivot});}
   if([23,25].includes(i)){go(TENSIONER_DOOR_LEAF,zero,title,{rotation:[0,0,-22],pivot:doorPivot});go(TENSIONER_DOOR_LEAF,zero,title,{pivot:doorPivot});inspect([sensor,399],title);}
   if(i===24){go([48,'handleLeft'],zero,title,{axis:[1,0,0]});rivet('side',false);go(83,zero,title,{axis:[1,0,0]});rivet('sideTop',false);}
   if(i===26)tighten(title);
  }
  if(i===task.steps.length-1)inspect(['lcd'],title);
  end();
 }
 const stage=stages[index],refs=[d.body,d.carrier,d.nut,d.axle,d.adjust,'tsIdler-left','tsIdler-right','tsBelt-left','tsBelt-right',...(left?[sensor,'tsDoorLead','tsOldDoorTie',...(index>=15?['tsNewDoorTie']:[]),...tensionerRivets.map(r=>r.id)]:[])],hidden=left?[458]:[];
 if(!left)hidden.push(sensor,'tsDoorLead','tsOldDoorTie','tsNewDoorTie',...tensionerRivets.map(r=>r.id));else{hidden.push('doorWireLead','doorWire');if(index<15)hidden.push('tsNewDoorTie');}
 for(const a of stage.actors){const close=left&&[23,25].includes(index)&&a.refs?.includes(572)&&a.posePath?.at(-1).rotation.every(x=>x===0);if(a.refs?.includes(sensor)||close){a.camera='door-sensor-inside';a.focusRefs=[sensor,399];if(close)a.operationFocus=[sensor,399];a.focusPadding=3;a.focusMinDistance=65;a.guideRadius=1.3;a.guideTube=.15;a.transparentRefs=[14,400,405,436,440,442,444];if(a.inspection)a.label=text(['ドアセンサーのレバー','Door sensor lever','Páčka dveřního senzoru','Hebel des Türsensors']);if(close)a.label=text(['ドアを閉め、レバーの動きを確認する','Close the door and check the lever','Zavřete dvířka a zkontrolujte páčku','Tür schließen und Hebel prüfen']);}}
 const staticInfo=stage.actors.length===0,nutPreparation=(task.id==='belt-tensioner-pulley'&&index===7)||(left&&index===17)||(right&&index===10);
 const plan={workspace:'printer',pose:'printer-standing',chapter:10,step:index+1,serviceTask:task.id,camera:nutPreparation?(side==='left'?'base-front-right-perspective':'corexy-left-perspective'):side==='left'?'base-right-perspective':'right-perspective',focus:staticInfo?refs:[...new Set(stage.actors.flatMap(a=>a.refs||a.flex))],focusPadding:12,operationPadding:8,actors:stage.actors,seed:[],workpiecePoses:stage.poses,solidRefs:refs,visibleRefs:refs,transparentRefs:[],undersideView:true,note:text(task.steps[index].body),tensionerService:{side,task:task.id,index,loop:stage.loop,coupled:stage.coupled,opening:stage.opening,route:defer?'after-body':'first',left,final:stage.final},contextOpacity:.16};
 return {plan,hidden,disconnect:false,flexStates:{...stage.flex,tsOldDoorTie:stage.flex.tsOldDoorTie??1,tsNewDoorTie:stage.flex.tsNewDoorTie??0}};
}
