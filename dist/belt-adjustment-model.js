// SPDX-License-Identifier: MIT
// Isolated adjustment mechanism. This does not implement the missing gantry owner.
export const BELT_ADJUSTERS={
 left:{screw:436,carrier:[405,551,412,'originalTensionerIdler-left'],housing:400,upper:true},
 right:{screw:438,carrier:[568,553,418,'originalTensionerIdler-right'],housing:396,upper:false}
};
export const BELT_ADJUSTMENT_SOURCE='https://help.prusa3d.com/article/adjusting-belt-tension-core-one-core-one-indx-core-one-l_845048#adjusting-the-belts';
export const BELT_ADJUSTMENT_PITCH_MM=.5;
export function beltAdjustmentLabel(side,direction,text){
 const left=side==='left',tight=direction==='tighten';
 return text(tight?(left?['左の調整ねじを半回転締める（上側ベルト）','Tighten the left adjuster half a turn (upper belt)','Utáhněte levý napínací šroub o půl otáčky (horní řemen)','Linke Spannschraube eine halbe Umdrehung anziehen (oberer Riemen)']:['右の調整ねじを半回転締める（下側ベルト）','Tighten the right adjuster half a turn (lower belt)','Utáhněte pravý napínací šroub o půl otáčky (dolní řemen)','Rechte Spannschraube eine halbe Umdrehung anziehen (unterer Riemen)']):(left?['左の調整ねじを半回転緩める（上側ベルト）','Loosen the left adjuster half a turn (upper belt)','Povolte levý napínací šroub o půl otáčky (horní řemen)','Linke Spannschraube eine halbe Umdrehung lösen (oberer Riemen)']:['右の調整ねじを半回転緩める（下側ベルト）','Loosen the right adjuster half a turn (lower belt)','Povolte pravý napínací šroub o půl otáčky (dolní řemen)','Rechte Spannschraube eine halbe Umdrehung lösen (unterer Riemen)']));
}
export function beltAdjustmentScene(task,index,text){
 if(task.id!=='belts'||index!==3)return null;
 const all=Object.values(BELT_ADJUSTERS).flatMap(d=>[d.screw,d.housing,...d.carrier]);
 const actors=Object.entries(BELT_ADJUSTERS).map(([side,d])=>({refs:[d.screw],label:beltAdjustmentLabel(side,'tighten',text),axis:[0,1,0],distance:0,showBefore:true,handling:true,focusMotion:true,
  posePath:[{offset:[0,0,0],rotation:[0,0,0]},{offset:[0,0,0],rotation:[0,180,0]}],motionPivot:[0,0,0],beltAdjustment:{side,direction:'tighten'},source:BELT_ADJUSTMENT_SOURCE,
  focusRefs:[d.screw,d.housing,...d.carrier],focusPadding:8,focusMinDistance:110,camera:side==='left'?'corexy-left-perspective':'corexy-right-perspective',guideRadius:3,guideTube:.25,guideArrowLength:5,guideGhost:false}));
 return{plan:{workspace:'printer',pose:'printer-standing',chapter:10,step:4,camera:'front',focus:all,solidRefs:all,contextOpacity:.12,operationPadding:8,focusPadding:12,seed:[],actors,
  note:text(['左右を同じ量ずつ交互に調整して再測定します。角に隙間が出たら両側を緩め、整列からやり直してください。','Adjust both sides equally and alternately, then remeasure. If a corner develops a gap, loosen both and repeat alignment.','Obě strany seřizujte stejně a střídavě, potom znovu změřte. Vznikne-li u rohu mezera, povolte obě strany a opakujte vyrovnání.','Beide Seiten gleichmäßig und abwechselnd einstellen, dann erneut messen. Bei einem Spalt an einer Ecke beide lösen und erneut ausrichten.']),
  beltAdjustment:{source:BELT_ADJUSTMENT_SOURCE,turns:.5,pitchMM:BELT_ADJUSTMENT_PITCH_MM,gantryOwner:'corexy-maintenance-owner'}},hidden:[],disconnect:false,flexStates:{serviceHotendFanLead:1,servicePrintLead:1}};
}
