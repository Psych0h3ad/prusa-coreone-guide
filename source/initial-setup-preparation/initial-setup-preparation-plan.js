// MIT. Physical preparation for official CORE One+ source step999427.
export const INITIAL_PREPARATION={
 source:'https://help.prusa3d.com/guide/9-calibration-first-run_982308#999427',
 // The whole rear edge is the lowering support; the notch lies4mm forward.
 // Pivoting about the notch itself would lower the two rear tabs into the bed.
 sheetRear:[-6.41298315,90.993002023,77.936098376],
 dock:[206.00127064089492,2.30053076403438,123.6095062798185],
 holderOffset:0,bench:[30,70,0],approach:[30,0,0],installed:[0,0,0],
 ring:{nominalInnerDiameterMM:25,sectionDiameterMM:3.5,referenceSeatDiameterMM:25.9,holderLocalZMM:30,
  source:'https://www.prusa3d.com/product/o-ring-25x3-5mm/'},
 registration:'Whole existing Puck and holder surfaces, opposed docking axes on the right mounting plane; no source geometry cut or rescale.'
};
const label={
 align:['シート後部の切り欠きを位置決めピンへ合わせる','Align the rear sheet cutout with the locating pins','Zarovnejte zadní výřez plátu s polohovacími kolíky','Hinteren Plattenausschnitt an den Positionierstiften ausrichten'],
 lower:['前側の2つの角を持ち、シートをゆっくり下ろす','Hold the front corners and lower the sheet slowly','Držte přední rohy a pomalu spusťte plát','Vordere Ecken halten und Druckplatte langsam absenken'],
 ring:['Oリングをホルダーの取付位置へ通す','Slide the O-ring onto its seat on the holder','Nasuňte O-kroužek na jeho místo na držáku','O-Ring bis zu seinem Sitz auf den Halter schieben'],
 approach:['ホルダーをPuckの入口へ合わせる','Align the holder with the Puck opening','Vyrovnejte držák s otvorem dílu Puck','Halter an der Öffnung des Puck ausrichten'],
 insert:['ホルダーをPuckへ差し込む','Push the holder into the Puck','Zasuňte držák do dílu Puck','Halter in den Puck schieben'],
 lock:['外側から見て時計回りに回し、ホルダーをロックする','Turn clockwise as viewed from outside to lock the holder','Pohledem zvenku otočte doprava a zajistěte držák','Von außen gesehen im Uhrzeigersinn drehen und Halter verriegeln']
};
const ring='initialSetupOring',held=['spoolNew',ring],Z=[0,0,0],pose=(refs,pivot,rotation,offset)=>({refs,pivot,rotation,offset});
const puckPose=()=>pose(['puck'],INITIAL_PREPARATION.dock,Z,Z);
const sheetStart=()=>pose(['sheet'],INITIAL_PREPARATION.sheetRear,[-16,0,0],[0,-20,18]);
const heldStart=()=>pose(['spoolNew'],INITIAL_PREPARATION.dock,[90,0,0],INITIAL_PREPARATION.bench);
const ringStart=()=>pose([ring],INITIAL_PREPARATION.dock,[90,0,0],[0,70,0]);
function path(refs,pivot,points,title,text,extra={}){
 return{refs,label:text(label[title]),axis:[1,0,0],distance:0,showBefore:true,handling:true,reuse:true,focusMotion:true,
 motionPivot:pivot,posePath:points.map(([offset,rotation])=>({offset,rotation})),guideGhost:false,
 officialStepID:999427,...extra};
}
export function withInitialSetupPreparation(task,index,text,spec){
 if(task.id!=='initial-setup')return spec;
 const n=task.steps[index].officialStep??index+1;
 const plan={...spec.plan,workpiecePoses:[...(spec.plan.workpiecePoses||[]),puckPose()]};
 if(n<3)plan.workpiecePoses.push(sheetStart(),heldStart(),ringStart());
 else if(n>3)plan.workpiecePoses.push(pose(held,INITIAL_PREPARATION.dock,Z,INITIAL_PREPARATION.installed));
 if(n!==3)return{...spec,plan};
 const ref=INITIAL_PREPARATION,sheetView={camera:'front',focusBounds:[-140,-170,73,128,120,167],focusMinDistance:390,focusRefs:[781,785],officialLineIDs:[999445]},
 holderView={camera:'right-perspective',focusBounds:[203,-35,90,348,108,160],focusMinDistance:230,officialLineIDs:[1014535]};
 plan.actors=[
  path(['sheet'],ref.sheetRear,[[[0,-20,18],[-16,0,0]],[Z,[-16,0,0]]],'align',text,sheetView),
  path(['sheet'],ref.sheetRear,[[Z,[-16,0,0]],[Z,Z]],'lower',text,sheetView),
  path([ring],ref.dock,[[[0,70,0],[90,0,0]],[ref.bench,[90,0,0]]],'ring',text,{...holderView,officialLineIDs:[1014534],focusBounds:[230,38,90,348,106,157],focusRefs:held}),
  path(held,ref.dock,[[ref.bench,[90,0,0]],[ref.approach,[90,0,0]]],'approach',text,holderView),
  path(held,ref.dock,[[ref.approach,[90,0,0]],[ref.installed,[90,0,0]]],'insert',text,holderView),
  path(held,ref.dock,[[ref.installed,[90,0,0]],[ref.installed,Z]],'lock',text,{...holderView,guideRadius:18,guideArrowLength:8,clockwiseFromOutside:true})
 ];
 Object.assign(plan,{workspace:'printer',pose:'printer-standing',headOnly:false,focus:['sheet','heatbed','puck',...held],
  solidRefs:['sheet','heatbed',781,785,'puck',...held],contextOpacity:.12,camera:'perspective',focusPadding:12,viewBounds:sheetView.focusBounds,viewMinDistance:sheetView.focusMinDistance,
  initialPreparation:{sourceID:999427,operations:6,ringNominalMM:[25,3.5],registration:ref.registration}});
 return{...spec,plan};
}
