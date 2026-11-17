import{ORIGINAL_BED_MOUNT as D}from'./original-bed-mount-data.js';
const byOwner=id=>D.registrations.filter(r=>r.ownerCAD===id&&r.materialStock==='M3nN').map(r=>r.component);
const source=(id,indices)=>({manualID:2251,guideID:835514,stepID:id,lineIDs:indices.map(i=>D.sourceSteps[id].lineIDs[i]),photoIDs:D.sourceSteps[id].photoIDs});
const move=(refs,label,axis,waypoints,id,lines,extra={})=>({refs,label,axis,waypoints,focusMotion:true,operationFocus:refs,focusMinDistance:80,focusPadding:8,guideGhost:false,originalBedMountSource:source(id,lines),...extra});
const inspect=(mount,side,kind,id)=>{
 const component='originalBedBearing'+mount,[x,y,z]=D.bearings.find(r=>r.ownerCAD===mount).matrixMM.slice(0,3).map(row=>row[3]);
 return move([component],side+'ベアリング：'+(kind==='rows'?'公式写真2枚目で、ボール列が2列下向きか確認する':'上面がマウントとそろっているか確認する'),[0,0,1],[[0,0,0],[0,0,0]],id,kind==='rows'?(mount===637?[2]:[2,5]):(mount===637?[4]:[4,5]),{distance:0,reuse:true,showBefore:true,inspection:true,handling:true,focusRefs:[mount],camera:'top-perspective',attentionRefs:[],attentionBounds:[x-7.5,y-7.5,z-12,x+7.5,y+7.5,z+12],anchors:[[x,y,z]],officialInspectionPhotoID:kind==='rows'?863530:867434});
};
const photoNote='ベアリングの向きは公式写真で確認してください。';
export function withOriginalBedMount(plan,id){
 if(!Object.hasOwn(D.sourceSteps,id))return plan;
 if(plan.actors.length!==0)throw Error('Original bed-mount actor-zero preimage changed');
 const base={...plan,originalBedMountAssembly:true,operationFocus:undefined,settledFocus:undefined,overview:false,pose:'top-outside',camera:'top-perspective',focusPadding:12,operationPadding:10,contextOpacity:1,transparentRefs:[],note:photoNote};
 if(id===842336){const actors=[];for(const [mount,side]of[[637,'左'],[636,'右']]){
  const extra=(from,to,reuse=false)=>({reuse,showBefore:!reuse,originalBedMountOpening:{mountCAD:mount,from,to},focusRefs:['originalBedBearing'+mount]});
  actors.push(move([mount],'入りにくい場合：'+side+'マウントの切り欠きを少し広げる',[0,0,1],[[0,0,32],[0,0,32]],id,[2],extra(0,.35)));
  actors.push(move([mount],side+'マウントをベアリングへ下まで押し付ける',[0,0,1],[[0,0,32],[0,0,5],[0,0,0]],id,mount===637?[0,1,3]:[4],extra(.35,.35,true)));
  actors.push(move([mount],side+'マウントの切り欠きを戻し、溝に保持させる',[0,0,1],[[0,0,0],[0,0,0]],id,mount===637?[1,2,3]:[4],extra(.35,0,true)));
 }return{...base,workspace:'mounts',seed:D.bearings.map(r=>r.component),focus:[637,636,...D.bearings.map(r=>r.component)],settledFocus:[636,'originalBedBearing636'],note:'ベアリングを奥まで押し込みます。入りにくい場合は、マイナスドライバーで切り欠きを少し広げてください。',actors};}
 if(id===863534){const actors=[];for(const [mount,nut,screw,side]of[[637,'originalBedClampNut757',695,'左'],[636,'originalBedClampNut767',693,'右']]){const out=D.registrations.find(r=>r.component===nut).actualNutOutAxis;
  actors.push(move([nut],side+'マウントの六角穴へM3nを1個入れる',out,[out.map(x=>12*x),[0,0,0]],id,mount===637?[0]:[5],{camera:mount===637?'base-side-left-perspective':'right',focusRefs:[mount]}));
  actors.push(inspect(mount,side,'rows',id));
  const axis=out.map(x=>-x),camera=mount===637?'right':'base-side-left-perspective';actors.push(move([screw],side+'のM3×10を穴へ差し込む',axis,[axis.map(x=>10*x),axis.map(x=>2*x)],id,mount===637?[3]:[5],{camera,focusRefs:[mount]}));
  actors.push(move([screw],side+'のM3×10を時計回りに締めて固定する',axis,[axis.map(x=>2*x),[0,0,0]],id,mount===637?[3,4]:[5],{spin:-1440,reuse:true,camera,focusRefs:[mount],rotationQualification:'Illustrative2mm M3 coarse-pitch engagement, not OEM torque/turn prescription.'}));
  actors.push(inspect(mount,side,'flush',id));
 }return{...base,workspace:'mounts',seed:[],focus:[637,636,757,767,695,693],note:'ボール列が2列下側を向くよう、写真で確認します。ベアリングの上面をマウントとそろえ、M3×10で固定してください。',actors};}
 if(id===865276)return{...base,workspace:'mounts',pose:'underside',camera:'top',focus:[637,636],settledFocus:[636,'originalBedBearing636'],note:'左右のマウントにM3nNを4個ずつ入れ、奥まで押し込んでください。',actors:[...byOwner(637),...byOwner(636)].map((ref,i)=>move([ref],(i<4?'左':'右')+'マウントのM3nN '+(i%4+1)+'/4を奥まで入れる',[0,0,-1],[[0,0,-12],[0,0,0]],id,[0,1],{camera:'top',focusRefs:[i<4?637:636]}))};
 const nuts=byOwner(639),packet=[639,...nuts];return{...base,workspace:'rear-spacer',seed:[639],pose:'underside',camera:'top',focus:packet,settledFocus:packet,note:'後部スペーサーにM3nNを2個入れます。組み立てた部品は、次の工程まで脇に置いてください。',actors:[
  ...nuts.map((ref,i)=>move([ref],'後部スペーサーへM3nN '+(i+1)+'/2を奥まで入れる',[0,0,-1],[[0,0,-12],[0,0,0]],id,[0,1],{focusRefs:[639],camera:'top'})),
  move(packet,'ナット2個を入れた後部スペーサー一式を脇へ置く',[0,1,0],[[0,0,0],[0,20,0]],id,[2],{reuse:true,carry:true,handling:true,focusRefs:[639],camera:'top'})
 ]};
}
