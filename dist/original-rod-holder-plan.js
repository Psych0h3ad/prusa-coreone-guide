// Original2251 rod holders. Existing complete native parts; no geometry producer.
import {ORIGINAL_ROD_HOLDERS as D} from './original-rod-holder-data.js';
import {ORIGINAL_ROD_HOLDER_SOURCES as S} from './original-rod-holder-source.js';
const zero=[0,0,0],mul=(a,k)=>a.map(x=>x*k),pose=(refs,offset)=>({refs,offset,rotation:zero,pivot:zero});
const fronts=D.holders.slice(0,2),rears=D.holders.slice(2),frontIds=[500,502,504,506],rearIds=[480,482];
const src=(id,lines)=>({manualID:2251,guideID:835522,stepID:id,lineIDs:lines,photoIDs:S[id].sourceKey.photoIDs});
const side=id=>D.holders.find(h=>h.id===id),screw=id=>D.fasteners[id],frontGap=id=>[504,506].includes(id)?D.lowerLooseMM:D.frontLooseMM;
function actor(id,refs,label,lines,extra={}){
 return{refs,label,axis:[0,0,1],distance:0,focusMotion:true,guideGhost:false,focusPadding:8,focusMinDistance:110,originalRodHolderSource:src(id,lines),...extra};
}
function screwActor(stage,id,label,from,to,lines,extra={}){
 const f=screw(id);return actor(stage,[id],label,lines,{axis:f.axis,waypoints:[mul(f.axis,from),mul(f.axis,to)],spin:Math.round(Math.abs(from-to)/D.illustrativeM3PitchMM)*360,camera:f.axis[0]<-.5?'base-side-left-perspective':f.axis[0]>.5?'right':'bottom-bench-perspective',focusBounds:f.centreMM.map(x=>x-19).concat(f.centreMM.map(x=>x+19)),rotationQualification:'Source-derived axial travel with illustrative whole revolutions; not an exact pitch, OEM turn count or torque prescription.',...extra});
}
function base(plan){return{...plan,overview:false,originalRodHolderAssembly:true,pose:'underside',camera:'bottom-bench-perspective',focusPadding:10,operationPadding:8,actors:[]};}
function assembly(plan,id){
 const p=base(plan);
 if(id===843822){
  const actors=[];for(const h of D.holders){const rear=!!h.rod,lines=rear?[843825,843826]:[843823,843824];for(const sid of h.screws10){const L=rear?D.rearLooseMM:frontGap(sid),engagement=(rear?D.sourceSections.rear.fullEngagementMM:D.sourceSections.front.fullEngagementMM)-L;
   actors.push(screwActor(id,sid,'M3×10を頭用の穴から差し込む',18-L,engagement,lines,{spin:undefined,focusRefs:[h.id]}));
   actors.push(screwActor(id,sid,'M3×10を数回転だけ入れ、締め切らずに残す',engagement,0,lines,{reuse:true,showBefore:true,focusRefs:[h.id]}));
  }}return{...p,workspace:'rod-holders',seed:[],focus:D.holders.flatMap(h=>[h.id,...h.screws10]),actors,note:'M3×10は、頭用の穴がある側から差し込みます。今は数回転だけ入れ、締め切らないでください。'};
 }
 if(id===843942){const packet=fronts.flatMap(h=>[h.id,...h.screws10]);return{...p,workspace:'xy',seed:[371,...packet],focus:[373,...packet],workpiecePoses:[...(p.workpiecePoses||[]),pose(packet,[0,0,-35])],actors:[],note:'プレートの曲がりが上を向くように置き、面取りの形を見て左右のホルダーを揃えます。M3×10は緩めたままにしてください。'};}
 if(id===843986){const actors=[];for(const[h,lines]of[[fronts[0],[843987,843988]],[fronts[1],[843989,843990]]]){
  actors.push(actor(id,[h.id,...h.screws10],h.id===374?'緩めたM3×10ごと左前ホルダーを穴に合わせる':'緩めたM3×10ごと右前ホルダーを穴に合わせる',lines,{axis:[0,0,-1],waypoints:[[0,0,-35],zero],showBefore:true,focusRefs:[h.id],camera:'bottom-bench-perspective'}));
  for(const[sid,i]of h.screws6.map((x,i)=>[x,i]))actors.push(screwActor(id,sid,'M3×6の'+(i+1)+'本目でホルダーを固定する',10,0,lines,{focusRefs:[h.id]}));
 }return{...p,workspace:'xy',seed:plan.seed,focus:[373,374,375],actors};}
 if(id===844362){
  const linear=['leftLinearHolder','leftBearingHolder','leftBearingScrews',401,'carriageIdlerL1','carriageIdlerL2',408,410,430,432,434,378,379,403,'carriageIdlerR1','carriageIdlerR2',414,416,424,426,428,508,510,512,514],packet=rears.flatMap(h=>[h.id,h.rod,...h.screws10]),actors=[],context={manualID:2251,guideID:835522,stepID:844328,lineIDs:[844329,864210],photoIDs:S[844328].sourceKey.photoIDs};
  actors.push(actor(id,linear,'仮置きのリニアホルダー一式を手前に寄せ、ロッドの入口を確保する',[844364],{axis:[0,1,0],waypoints:[[0,114.5,0],zero],handling:true,showBefore:true,sourcePreparationContext:context,camera:'front-perspective'}));
  for(const h of rears){const left=h.rod===377,refs=[h.rod,h.id,...h.screws10],x=left?-173:173,turn=D.leftRearHandling.rotationVectorDegrees,liftPose=left?{motionPivot:D.leftRearHandling.pivotMM,posePath:[{offset:zero,rotation:zero},{offset:zero,rotation:turn},{offset:[0,0,35],rotation:turn}],poseTiming:[63,35]}:{},feedPose=left?{motionPivot:D.leftRearHandling.pivotMM,posePath:[{offset:[0,0,35],rotation:turn},{offset:[0,-56.5,35],rotation:turn}],poseTiming:[56.5]}:{};
   actors.push(actor(id,[h.rod],(left?'左':'右')+'の10mmロッドを支える',[844363],{axis:[0,0,1],waypoints:[[0,0,-20],zero],handling:true,showBefore:true,focusBounds:[x-25,-145,245,x+25,210,310],camera:'corexy-left-perspective'}));
   actors.push(actor(id,[h.id,...h.screws10],(left?'左':'右')+'ロッドの後端へ、緩めたねじ付きホルダーを通す',[844363,844388],{axis:[0,1,0],waypoints:[[0,9.5,0],zero],showBefore:true,focusBounds:[x-25,173,260,x+25,214,310],camera:'corexy-left-perspective'}));
   actors.push(actor(id,refs,left?'左後ホルダーを外側へ回し、端子を避けてベアリングの入口へ合わせる':'右ロッド一式を、ベアリング後方の入口へ合わせる',[844364],{axis:[0,0,1],waypoints:[zero,[0,0,35]],reuse:true,carry:true,handling:true,...liftPose,focusBounds:[x-40,-145,250,x+25,210,345],sourcePreparationContext:context,camera:'corexy-left-perspective'}));
   actors.push(actor(id,refs,left?'後ホルダーを端子から離した向きで、左ロッドを通す':'右ロッドをベアリングと前のホルダーへ通し、端を揃える',[844364,844389,844390],{axis:[0,1,0],waypoints:[[0,0,35],[0,-56.5,35]],reuse:true,carry:true,...feedPose,focusBounds:[x-40,-200,297,x+25,205,345],camera:'corexy-left-perspective'}));
  if(left){const loose=[h.id,...h.screws10],held={reuse:true,carry:true,handling:true,showBefore:true,motionPivot:D.leftRearHandling.pivotMM,camera:'corexy-left-perspective',focusBounds:[x-38,119,285,x+30,166,345],sourceHandlingQualification:D.leftRearHandling.qualification,instructionKind:'handling-example'};
   actors.push(actor(id,loose,'持ち替え例：ロッドを支え、緩めた後ホルダーを一度抜く',[844364],{...held,posePath:[{offset:[0,-56.5,35],rotation:turn},{offset:[0,-46,35],rotation:turn}]}));
   actors.push(actor(id,[h.rod],'持ち替え例：ロッドを支えたまま向きを戻す',[844364],{...held,posePath:[{offset:[0,-56.5,35],rotation:turn},{offset:[0,-56.5,35],rotation:zero}]}));
   actors.push(actor(id,loose,'持ち替え例：後ホルダーをプレートの下で回し戻す',[844364,844389],{...held,posePath:[{offset:[0,-46,35],rotation:turn},{offset:[0,-46,23],rotation:turn},{offset:[0,-46,23],rotation:zero},{offset:[0,-46,35],rotation:zero}],poseTiming:[12,157.5,12]}));
   actors.push(actor(id,loose,'持ち替え例：後ホルダーを差し直し、ネジ頭を外側に揃える',[844388,844389,844390],{...held,posePath:[{offset:[0,-46,35],rotation:zero},{offset:[0,-56.5,35],rotation:zero}]}));
  }

  }
  actors.push(actor(id,linear,'ロッドに通ったリニアホルダー一式を、後の作業位置へ戻す',[844364,844390],{axis:[0,1,0],waypoints:[zero,[0,114.5,0]],reuse:true,carry:true,handling:true,sourcePreparationContext:context,camera:'front-perspective'}));
  return{...p,pose:'underside',camera:'bottom-bench-perspective',workspace:'xy',seed:rears.map(h=>h.rod),workpiecePoses:[...(p.workpiecePoses||[]),pose(linear,[0,-114.5,0]),pose(packet,[0,56.5,-35])],focus:[377,566,374,375,376,565],actors,note:'仮置きのリニアホルダーを手前に寄せ、ロッドの入口を確保します。後部ホルダーをロッドに通して端を揃え、ベアリングの後方から前部ホルダーへ押し込んでください。両側のねじ頭を外側に揃えてください。左側の持ち替えは、端子を避ける取り回しの一例を3Dで示しています。',handlingQualification:'225degree loose left-rear-holder rotation with temporary full-holder withdrawal/free return around the native rod avoids weldedFaston372;114.5mm/56.5mm/35mm/9.5mm staging is independently authored source-geometry-derived handling under the source5.10 loose-holder condition, not official displacements or fit certification.'};
 }
 if(id===844434){const actors=[];for(const[h,lines]of[[rears[0],[844435,844436,844437]],[rears[1],[844438,844439,844440]]]){
  actors.push(actor(id,[h.id],(h.rod===377?'左':'右')+'後ホルダーとプレートの穴を合わせる',lines,{reuse:true,inspection:true,handling:true,showBefore:true,focusRefs:[h.id],camera:'bottom-bench-perspective'}));
  for(const[sid,i]of h.screws6.map((x,i)=>[x,i]))actors.push(screwActor(id,sid,'M3×6の'+(i+1)+'本目で後ホルダーを固定する',10,0,lines.slice(0,2),{focusRefs:[h.id]}));
  actors.push(screwActor(id,h.screws10[0],'後ホルダーのM3×10を締め、ロッドを固定する',D.rearLooseMM,0,[lines[2]],{reuse:true,showBefore:true,focusRefs:[h.id]}));
 }return{...p,workspace:'xy',focus:[376,565],actors};}
 if(id===844583)return{...p,workspace:'xy',focus:[374,375],actors:[screwActor(id,500,'左前ホルダーの上のM3×10だけを締める',D.frontLooseMM,0,[844584,844585],{reuse:true,showBefore:true,focusRefs:[374]}),screwActor(id,502,'右前ホルダーの上のM3×10だけを締める',D.frontLooseMM,0,[844586,844587],{reuse:true,showBefore:true,focusRefs:[375]})],note:'上のM3×10を締めてロッドを固定します。下の2本は、後のスムースロッド固定まで緩めたままにしてください。'};
 if(id===846922)return{...p,workspace:plan.workspace,pose:'top-outside',focus:[374,375,313,369],actors:[actor(id,[374,375,313,369],'2本のZスムースロッドの上端がホルダーの奥まで入っているか確認する',[846923,1042421],{reuse:true,inspection:true,handling:true,showBefore:true,operationFocus:[374,375],camera:'front-perspective'}),screwActor(id,504,'右側の下のM3×10を締め、ロッドを固定する',frontGap(504),0,[846924],{reuse:true,showBefore:true,focusRefs:[375]}),screwActor(id,506,'左側の下のM3×10を締め、ロッドを固定する',frontGap(506),0,[846925],{reuse:true,showBefore:true,focusRefs:[374]})],note:'ロッドが奥まで入っていることを確かめ、下のM3×10を右、左の順に締めてください。入りにくい場合だけ、切り欠きを慎重に少し広げます。'};
 return plan;
}
// Every source stage owns its own static loose positions. No global follow writer,
// historical last-state cache, generated mesh, service owner or disposal hook.
export function withOriginalRodHolders(plan,source){
 plan={...plan,originalRodHolderFrame:D.frame.key};
 if(source.chapter!==4)return plan;const n=source.officialStep;if(n<3||n>75)return plan;
 const loose=frontIds.filter(id=>n<14||n===14&&[504,506].includes(id)||n>14&&n<75&&[504,506].includes(id)).map(id=>pose([id],mul(screw(id).axis,frontGap(id))));
 if(n<13)loose.push(...rearIds.map(id=>pose([id],mul(screw(id).axis,D.rearLooseMM))));
 const withLoose=loose.length?{...plan,workpiecePoses:[...(plan.workpiecePoses||[]),...loose]}:plan;
 return assembly(withLoose,source.officialId);
}
