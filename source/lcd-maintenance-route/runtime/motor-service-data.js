import {Z_MOTOR_SOURCE as S} from './z-motor-source.js';
import {zOperations,Z_HARDWARE} from './z-motor-plan.js';
export function createZMotorTask(selection='all',{washer=true}={}){
 const sides={all:['R','FL','FR'],rear:['R'],left:['FL'],right:['FR'],front:['FL','FR']}[selection];if(!sides)throw Error('Unknown Z motor selection');
 const front=sides.filter(s=>s!=='R'),order=[];
 for(let i=0;i<41;i++){
  if(i>=12&&i<=18&&!sides.includes('R'))continue;
  if(!front.length&&([8,19,20,21,30,31,32,33].includes(i)||i>=22&&i<=28))continue;
  if(i===22){for(const side of front)for(let j=22;j<=28;j++)order.push([j,side]);i=28;continue;}
  order.push([i,i>=12&&i<=18?'R':front[0]||'R']);
 }
 const steps=order.map(([i,side],at)=>{
  const p=S.steps[i],ops=zOperations(i,side,washer),refs=ops.length?ops.map(o=>o.id):i===0?['zmROldMotor','zmFLOldMotor','zmFROldMotor']:i===1?['zmSplitter']:i===3||i>=39?['lcd']:['zmRNewMotor','zmFLNewMotor','zmFRNewMotor'];
  const prefix=i>=22&&i<=28?{FL:['前左：','Front left: ','Front left: ','Front left: '],FR:['前右：','Front right: ','Front right: ','Front right: ']}[side]:['','','',''];
  const s={id:'zm-'+i+'-'+side,title:p.title.map((v,k)=>prefix[k]+v),body:[...p.body],refs:[...new Set(refs)],source:p.source,officialId:p.id,officialStep:p.number,officialWebStep:p.webNumber,number:at+1,motorOfficialIndex:i,motorSide:side,motorOperations:ops,sourcePhotos:p.images,inspection:false};
  if(i===2)s.firmwareActions=['home'];if(i===40)s.firmwareActions=['home','moveZ','selftest'];return s;
 });
 return{id:'z-motor-replacement',category:2,revision:1,title:['Zモーターを交換する','Replace Z motors','Replace Z motors','Replace Z motors'],interval:['故障・交換が必要なとき','When replacement is needed','When replacement is needed','When replacement is needed'],source:S.url,steps,motorService:{axis:'z',selection,sides,washer,source:'575994',gen2:false,nominalGeometryQualification:'Existing complete171 CAD and explicitly qualified functional reference hardware; no supplier/OEM tolerance claim.'},sourceBank:S,localeFallbacks:S.localeFallbacks,bom:{newFrontLEFT:front.length,newRearRIGHT:sides.includes('R')?1:0,newZipTies:3,retainedMotorMounts:sides.length,retainedTransparentPads:washer?sides.length:0,retainedChassisM3x8:4*sides.length,retainedMountM3x8:4*sides.length,retainedFrameM3x4rT:front.length?8:0,retainedRearFeet:front.length?2:0,retainedLeftPanelRivets:11,retainedRightLowerRivets:front.length?3:0,retainedSplitterPins:2},identityPairs:sides.map(side=>({side,old:'zm'+side+'OldMotor',fresh:'zm'+side+'NewMotor',oldWholeLead:'zm'+side+'OldLead',freshWholeLead:'zm'+side+'NewLead',sourceCAD:Z_HARDWARE[side].cad,port:Z_HARDWARE[side].port,type:Z_HARDWARE[side].label}))};
}
