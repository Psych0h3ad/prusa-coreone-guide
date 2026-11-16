import{BED_COVER_DATA as D}from'./bed-cover-data.js';
import{BED_COVER_SOURCE as S}from'./bed-cover-source.js';
const pack=[D.cover,...D.nuts],B=D.benchOffsetMM,pivot=D.pivotMM.map((v,i)=>v+B[i]);
// Source4.4 has already attached the two power lugs/washers/screws/nyloc nuts.
// The far cable ends remain loose; this does not route or connect the xBuddy end.
const priorBedStock=[699,701,753,755,777,779,'xbBedMinus','xbBedPlus','xbBedMinusLug','xbBedPlusLug','xbBedMinusFixedLug','xbBedPlusFixedLug','bedNtcAssembly'];
const pose=(offset,rotation=[0,0,0])=>({offset,rotation});
const source=indices=>Object.fromEntries(Object.entries(S).map(([key,s])=>[key,{...s,lineIDs:indices.map(i=>s.lineIDs[i])}]));
const actor=(refs,label,poses,lines,extra={})=>({refs,label,motionPivot:pivot,axis:[0,0,1],posePath:poses,focusMotion:true,focusMinDistance:80,focusRefs:[D.cover],camera:'bottom-bench-perspective',guideGhost:false,bedCoverSource:source(lines),...extra});
const shifted=s=>s.map((v,i)=>v-B[i]);
export function bedCoverPlan(old={}){
 return{...old,bedCoverAssembly:true,workspace:'heatbed',overview:false,camera:'bottom-bench-perspective',pose:undefined,undersideView:true,contextOpacity:.18,solidRefs:[...pack,D.screw,...priorBedStock],transparentRefs:[659],seed:[...(old.seed||[]),D.cover,...priorBedStock],focus:pack,settledFocus:pack,focusPadding:12,operationPadding:12,workpiecePoses:[{refs:pack,rotation:[0,0,0],offset:B,pivot:D.pivotMM}],actors:[
  actor([D.cover],'カバーを裏返し、ナットを入れる穴を上に向ける',[pose([0,0,0]),pose([0,0,0],[180,0,0])],[0,2],{handling:true}),
  ...D.nuts.map((id,i)=>actor([id],`M3nナット${i+1}を奥まで入れる`,[pose([0,0,15],[180,0,0]),pose([0,0,0],[180,0,0])],[0,2])),
  actor(pack,'ナット3個を入れたカバーを元の向きに戻す',[pose([0,0,0],[180,0,0]),pose([0,0,0])],[2,3],{reuse:true,carry:true,handling:true}),
  actor(pack,'カバーをヒートベッドより下へ下げる',[pose([0,0,0]),pose([0,0,-47])],[3],{reuse:true,carry:true,camera:'side-sensor-perspective'}),
  actor(pack,'ケーブルの下へカバーを差し入れる',[pose([0,0,-47]),pose(shifted([0,18,-22]))],[3],{reuse:true,carry:true,camera:'side-sensor-perspective'}),
  actor(pack,'ケーブルを挟まないように、カバーの高さを合わせる',[pose(shifted([0,18,-22])),pose(shifted([0,18,-1.5]))],[3],{reuse:true,carry:true,camera:'side-sensor-perspective'}),
  actor(pack,'ケーブル接続部の下へカバーをスライドさせる',[pose(shifted([0,18,-1.5])),pose(shifted([0,0,-1.5])),pose(shifted([0,0,0]))],[4],{reuse:true,carry:true,camera:'side-sensor-perspective'}),
  {refs:[D.screw],label:'穴を合わせ、M3x10rTを差し込む',axis:[0,0,1],waypoints:[[0,0,20],[0,0,5]],focusMotion:true,focusRefs:[D.cover],camera:'top-perspective',guideGhost:false,bedCoverSource:source([5])},
  {refs:[D.screw],label:'M3x10rTを締め、下カバーを固定する',axis:[0,0,1],waypoints:[[0,0,5],[0,0,0]],spin:-3600,reuse:true,focusMotion:true,focusRefs:[D.cover],camera:'top-perspective',guideGhost:false,bedCoverSource:source([5]),rotationQualification:'Illustrative M3 coarse-pitch engagement, not a prescribed torque or source turn count.'}
 ],note:'ナット3個を先に入れます。ケーブルを挟まないようにカバーを差し込み、最後にM3x10rTで固定してください。'};
}
export function withBedCoverAssembly(bank){if(!bank.build[987162])throw Error('Bed-cover source987162 missing');return{...bank,build:{...bank.build,[987162]:bedCoverPlan(bank.build[987162])}};}
