import {ORIGINAL_TENSIONER_SOURCE as S,ORIGINAL_TENSIONER_DATUMS as D}from'./original-tensioner-source.js';
const z=[0,0,0],plus=(a,b)=>a.map((x,i)=>x+b[i]),mul=(a,k)=>a.map(x=>x*k),pose=(refs,offset)=>({refs,offset,rotation:z,pivot:z});
const map=(stage,lines)=>Object.fromEntries(Object.entries(S).map(([edition,s])=>[edition,{guideID:s.guideID,stepID:s.steps[stage].stepID,lineIDs:lines.map(i=>s.steps[stage].lineIDs[i]),photoIDs:s.steps[stage].photoIDs}]));
function actor(refs,label,points,stage,lines,extra={}){return{refs,label,axis:[0,1,0],waypoints:points,focusMotion:true,guideGhost:false,originalTensionerSource:map(stage,lines),...extra};}
const prepBench={"left":{"carrier":405,"nut":551,"targetCentreMM":[-23,0,0],"rotation":[-69.28203230275511,69.28203230275507,-69.28203230275514],"pivot":[-176.99366279461304,-162.69975720579552,356.3004126839287],"offset":[153.99366279461304,162.69975720579552,-356.3004126839287],"insertion":[0.0,-20.0,0.0],"alignment":[0.0,0.24998199999998194,0.0],"rotationMatrix":[[0.0,0.0,1.0],[-1.0,0.0,0.0],[0.0,-1.0,0.0]]},"right":{"carrier":568,"nut":553,"targetCentreMM":[23,0,0],"rotation":[-69.28203043528625,-69.28203521140482,69.28203521141596],"pivot":[176.99635919248186,-162.6997572058291,345.7004138270349],"offset":[-153.99635919248186,162.6997572058291,-345.7004138270349],"insertion":[1.3787504715701e-06,-19.999999999999957,3.818054671627776e-12],"alignment":[5.998276693942162e-05,0.24998200000417317,-4.772044273131752e-14],"rotationMatrix":[[-6.8937523578505e-08,3.007359365990608e-14,-0.9999999999999979],[0.9999999999999979,-1.909027315081902e-13,-6.8937523578505e-08],[-1.909027335813888e-13,-1.0,-3.007358049954451e-14]]}};
const label=key=>D.labels[key][0],tool='originalTensionerApplicator',keys={436:'originalAllenLeft30',438:'originalAllenRight30',412:'originalAllenLeft18',418:'originalAllenRight18',399:'originalAllenDoor12'},body=id=>[436,412,399].includes(id)?400:396;
const camera=id=>id===412?'hotend-perspective':id===418?'top-perspective':id===399?'back-perspective':id===436?'corexy-left-perspective':'corexy-right-perspective';
function base(old,workspace){return{...old,workspace,overview:false,pose:'top-outside',camera:'front-perspective',focusPadding:10,operationPadding:8,actors:[],seed:[],contextFrom:[],contextOwners:[]};}
function keyIn(id,start,stage,lines){return actor([keys[id]],label('keyIn'),[plus(start,mul(D.screws[id].axis,-30)),start],stage,lines,{camera:camera(id),focusRefs:[id,body(id)],focusMinDistance:90});}
function keyOut(id,end,stage,lines){return actor([keys[id]],label('keyOut'),[plus(end,mul(D.screws[id].axis,-35)),end],stage,lines,{camera:camera(id),reuse:true,remove:true,destination:'removed',focusRefs:[id,body(id)],focusMinDistance:90});}
function screwTurn(id,name,start,end,turns,stage,lines,rest=z){
 const f=D.screws[id];return actor([id,keys[id]],label(name),[start,end],stage,lines,{reuse:true,axis:f.axis,motionPivot:plus(f.origin,rest),posePath:[{offset:start,rotation:z},{offset:end,rotation:mul(f.axis,turns*360)}],camera:camera(id),focusRefs:[body(id)],focusMinDistance:90});
}
export function originalTensionerPlans(old){
 const l=D.left,r=D.right,li='originalTensionerIdler-left',ri='originalTensionerIdler-right',partial=d=>pose([d.adjust],[0,d.adjustFinalY,0]);
 const leftStart=[0,30+l.adjustStartY,-35],leftEnd=[0,30+l.adjustFinalY,-35],rightStart=[0,r.adjustStartY,0],rightEnd=[0,r.adjustFinalY,0],doorStart=[0,D.doorStartY,0],doorEnd=[0,D.doorFinalY,0];
 const prep={...base(old[0],'tensioner-prep'),camera:'top-perspective',viewMinDistance:100,focusPadding:4,operationPadding:4,seed:[l.carrier,r.carrier],focus:[l.carrier,l.nut,r.carrier,r.nut],settledFocus:[l.carrier,l.nut,r.carrier,r.nut],workpiecePoses:Object.values(prepBench).map(p=>({refs:[p.carrier,p.nut],offset:p.offset,rotation:p.rotation,pivot:p.pivot})),actors:[
  actor([l.nut],label('nutLeft'),[prepBench.left.insertion,z],0,[0],{showBefore:true,camera:'top-perspective',operationFocus:[l.carrier,l.nut],focusRefs:[l.carrier,l.nut],focusMinDistance:70,focusPadding:4}),
  actor([l.nut],label('alignLeft'),[z,prepBench.left.alignment],0,[1,2],{inspection:true,reuse:true,camera:'top-perspective',operationFocus:[l.carrier,l.nut],focusRefs:[l.carrier,l.nut],focusMinDistance:70,focusPadding:4}),
  actor([r.nut],label('nutRight'),[prepBench.right.insertion,z],0,[0],{showBefore:true,camera:'top-perspective',operationFocus:[r.carrier,r.nut],focusRefs:[r.carrier,r.nut],focusMinDistance:70,focusPadding:4}),
  actor([r.nut],label('alignRight'),[z,prepBench.right.alignment],0,[1,2],{inspection:true,reuse:true,camera:'top-perspective',operationFocus:[r.carrier,r.nut],focusRefs:[r.carrier,r.nut],focusMinDistance:70,focusPadding:4})
 ],note:D.notes[0][0]};
 const leftI={...base(old[1],'left-tensioner'),seed:[l.carrier,l.nut],focus:[l.body,l.carrier],workpiecePoses:[pose([l.adjust],D.greaseLeft),pose([r.adjust],D.greaseRight),pose([keys[l.adjust]],D.greaseLeft)],actors:[
  actor([l.adjust],label('lubeLeft'),[z,z],1,[0,1],{handling:true,spin:360}),
  actor([tool],label('spreadLeft'),[z,[0,-28.7,0],z],1,[1,2],{handling:true}),
  actor([r.adjust],label('lubeRight'),[z,z],1,[0,1],{handling:true,spin:360,destination:'right-tensioner'}),
  actor([tool],label('spreadRight'),[[120,-40,-20],[12,0,-20],[12,0,0],[12,-28.7,0],[12,0,0],[12,0,-20],[0,0,-20],z],1,[1,2],{handling:true,reuse:true,remove:true,destination:'removed'}),
  actor([r.adjust],label('parkRight'),[z,[0,-90,0]],1,[0,1],{handling:true,reuse:true,destination:'right-tensioner'}),
  actor([l.body],label('bodyLeft'),[[0,-28,0],z],1,[3,4]),
  actor([l.adjust],label('insert30'),[z,[0,-20,0],[0,-20,-35],leftStart],1,[5],{reuse:true}),
  keyIn(l.adjust,leftStart,1,[5]),
  screwTurn(l.adjust,'turn30',leftStart,leftEnd,3,1,[5],D.greaseLeft),
  keyOut(l.adjust,leftEnd,1,[5])
 ],note:D.notes[1][0]};
 const leftII={...base(old[2],'left-tensioner'),focus:[l.body,l.carrier,li],workpiecePoses:[partial(l)],actors:[
  actor([li],label('idlerLeft'),[[-26,0,0],z],2,[0]),
  actor([l.axle],label('axleApproach'),[[0,0,-30],[0,0,-18]],2,[1,2],{axis:D.screws[l.axle].axis,camera:camera(l.axle),focusRefs:[li,l.carrier]}),
  keyIn(l.axle,[0,0,-18],2,[1,2]),
  screwTurn(l.axle,'axle',[0,0,-18],z,36,2,[1,2]),
  keyOut(l.axle,z,2,[1,2]),
  actor([399],label('insert12'),[[0,40,0],doorStart],2,[3],{axis:D.doorInsertionAxis,camera:camera(399)}),
  keyIn(399,doorStart,2,[3]),
  screwTurn(399,'turn12',doorStart,doorEnd,5,2,[3]),
  keyOut(399,doorEnd,2,[3]),
  actor([399],label('check12'),[doorEnd,doorEnd],2,[3,4],{inspection:true,reuse:true,camera:camera(399),focusRefs:[399,l.body]})
 ],note:D.notes[2][0]};
 const right={...base(old[3],'right-tensioner'),seed:[r.carrier,r.nut],focus:[r.body,r.carrier,ri],actors:[
  actor([r.body],label('bodyRight'),[[0,-28,0],z],3,[0,1]),
  actor([r.adjust],label('insert30'),[D.greaseRightPark,[0,-120,46],[0,-50,46],[0,-50,0],rightStart],3,[2],{reuse:true}),
  keyIn(r.adjust,rightStart,3,[2]),
  screwTurn(r.adjust,'turn30',rightStart,rightEnd,3,3,[2]),
  keyOut(r.adjust,rightEnd,3,[2]),
  actor([ri],label('idlerRight'),[[26,0,0],z],3,[3]),
  actor([r.axle],label('axleApproach'),[[0,0,30],[0,0,18]],3,[4,5],{axis:D.screws[r.axle].axis,camera:camera(r.axle),focusRefs:[ri,r.carrier]}),
  keyIn(r.axle,[0,0,18],3,[4,5]),
  screwTurn(r.axle,'axle',[0,0,18],z,36,3,[4,5]),
  keyOut(r.axle,z,3,[4,5])
 ],note:D.notes[3][0]};
 return[prep,leftI,leftII,right];
}
export function withOriginalTensionerAssembly(source){const build={...source.build},ids=[990050,990084,990146,990198],plans=originalTensionerPlans(ids.map(id=>build[id]));ids.forEach((id,i)=>build[id]=plans[i]);
 const p=build[990260];if(p)build[990260]={...p,contextOwners:[...new Set([...(p.contextOwners||[]),'left-tensioner','right-tensioner'])],focus:[400,405,551,412,436,399,396,568,553,418,438,'originalTensionerIdler-left','originalTensionerIdler-right']};
 return{...source,build};}
