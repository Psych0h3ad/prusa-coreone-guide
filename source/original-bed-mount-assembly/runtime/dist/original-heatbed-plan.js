// Original2251 / guide835514. Full existing native parts, no new stock geometry.
// Source groups are mandatory; the animation order within each four-screw group
// and partial engagement distances/turns are authored teaching controls.
const parts={spacer:658,bed:659,centre:723,edges:[727,733,737,731],corners:[725,729,735,739]};
const source=(id,lineIDs)=>({manualID:2251,guideID:835514,stepID:id,lineIDs});
// Source-CAD-mm camera regions derived from complete403 native vertices.
// Cropping the view never trims, rescales or repositions the physical meshes.
const cameraDatums={"658":{"xy":[-6.4130130000000225,-26.706993000000125],"z":[66.9360845715206,74.93608440000006],"seatZ":66.93609250000002},"723":{"xy":[-6.413001899999965,-26.706999200000002],"z":[65.93609644768372,77.93609631916121],"seatZ":77.93609631916121},"725":{"xy":[-116.41302700000006,-131.7070120000002],"z":[73.93610521001014,77.93610539999999],"seatZ":77.93610539999999},"727":{"xy":[-6.413009399999877,-131.70701200000002],"z":[73.93609272401018,77.93609291400003],"seatZ":77.93609291400003},"729":{"xy":[98.58699200000007,-131.7069980000001],"z":[73.93609272401018,77.93609291400003],"seatZ":77.93609291400003},"731":{"xy":[-116.4130011999999,-26.707022999999996],"z":[73.93609272401018,77.93609291400003],"seatZ":77.93609291400003},"733":{"xy":[98.58699900000012,-26.707022999999968],"z":[73.93609272401018,77.93609291400003],"seatZ":77.93609291400003},"735":{"xy":[98.58698430000007,78.29298799999997],"z":[73.93609272401018,77.93609291400003],"seatZ":77.93609291400003},"737":{"xy":[-6.412997999999892,78.29298199999995],"z":[73.93609272401018,77.93609291400003],"seatZ":77.93609291400003},"739":{"xy":[-116.41302699999994,78.29300309999988],"z":[73.93609272401018,77.93609291400003],"seatZ":77.93609291400003}};
function workingFocus(refs,points){const d=cameraDatums[refs[0]];if(refs.length!==1||!d)return{focusRefs:[parts.bed,638],focusMinDistance:160,focusPadding:8};const offsets=points.map(p=>p[2]),lo=Math.min(d.z[0]+Math.min(...offsets),d.seatZ-3),hi=Math.max(d.z[1]+Math.max(...offsets),d.seatZ+4);return{operationFocus:undefined,focusRefs:[],focusBounds:[d.xy[0]-11,d.xy[1]-11,lo-2,d.xy[0]+11,d.xy[1]+11,hi+2],focusMinDistance:65,focusPadding:2,camera:'top-perspective'};}
const move=(refs,label,points,id,lineIDs,extra={})=>({refs,label,axis:[0,0,1],waypoints:points,guideGhost:false,focusMotion:true,operationFocus:refs,...workingFocus(refs,points),originalHeatbedSource:source(id,lineIDs),...extra});
export function withOriginalHeatbed(plan,id){
 if(id===842502)return{...plan,note:'M3×12bT（袋の表記がcTの場合あり）1本、6×3.1×8 mmスペーサー1個、M3×4bT 8本を揃えてください。'};
 if(id===842650)return{...plan,note:'上カバー1個、M3×10ねじ2本、520×8 mmのテキスタイルスリーブ1本を揃えてください。取り付けは次の手順から行います。'};
 if(id!==842548&&id!==842590)return plan;
 if(plan.actors.length!==(id===842548?2:0))throw Error('Original heatbed source actor preimage changed');
 const common={...plan,originalHeatbedMountAssembly:true,detachedBedPacket:true,workspace:'carrier',overview:false,pose:'top-outside',camera:'top-perspective',operationFocus:undefined,settledFocus:[659],focus:[659,638],contextOpacity:1,transparentRefs:[],focusPadding:12,operationPadding:8,viewBounds:[-202.6453490752964,-203.10441043863636,46.63609244749744,202.64534907529642,160.60000575007626,119.78609292105932],viewMinDistance:140};
 if(id===842548){const actors=[
  move([parts.spacer],'6×3.1×8 mmスペーサーを中央の穴へ合わせる',[[0,0,18],[0,0,0]],id,[842549],{focusRefs:[],focusMinDistance:65}),
  {scope:'heatbed',label:'ケーブルの向きを確認し、ヒートベッド一式をキャリッジに載せる',axis:[0,0,1],waypoints:[[0,0,30],[0,0,8],[0,0,0]],guideGhost:false,focusMotion:true,operationFocus:[659,638],focusMinDistance:180,focusPadding:10,originalHeatbedSource:source(id,[842550,842551])},
  move([parts.centre],'中央のM3×12bTを穴へ差し込む',[[0,0,18],[0,0,1]],id,[842550]),
  move([parts.centre],'中央のねじを仮止めし、まだ締め切らない',[[0,0,1],[0,0,.5]],id,[842550],{reuse:true,spin:360}),
  move([659],'細いサーミスター線を電源線に沿わせ、拡張ジョイントをまたいでいないか確認する',[[0,0,0],[0,0,0]],id,[842738],{reuse:true,inspection:true,handling:true,distance:0,operationFocus:undefined,focusRefs:[],focusBounds:[-145.048770070076,84.29300130679465,62.93609262351744,-88.72963228267353,197.02185559272766,87.18667656183243],focusPadding:3,focusMinDistance:110,camera:'top-perspective'})
 ];
 for(const [i,screw]of [...parts.edges,...parts.corners].entries()){
  actors.push(move([screw],`M3×4bT ${i+1}/8を穴へ差し込む`,[[0,0,18],[0,0,1]],id,[842552]));
  actors.push(move([screw],`M3×4bT ${i+1}/8を仮止めし、まだ締め切らない`,[[0,0,1],[0,0,.5]],id,[842552],{reuse:true,spin:360}));
 }
 return{...common,seed:plan.seed.filter(r=>r!==657&&r!==658),actors,note:'中央のスペーサーとねじから取り付けます。9本とも仮止めにし、締付けは次の手順で順番に行ってください。'};
 }
 const actors=[];
 for(const round of[1,2])for(const [refs,labels,line]of[[[parts.centre],['中央のねじ'],842593],[parts.edges,parts.edges.map((_,i)=>`辺の中央 ${i+1}/4`),842594],[parts.corners,parts.corners.map((_,i)=>`角 ${i+1}/4`),842595]])for(let i=0;i<refs.length;i++)actors.push(move([refs[i]],`${round}周目：${labels[i]}を${round===1?'順番に締める':'ゆっくり、しっかり締める'}`,[[0,0,round===1?.5:.25],[0,0,round===1?.25:0]],id,[842591,line,842596],{reuse:true,showBefore:true,spin:180}));
 return{...common,actors,note:'中央→辺の中央4本→角4本の順を、少なくとも2周繰り返します。最後はゆっくり、しっかり締めてください。'};
}

// Display corrections follow the retained Original EN source. Captured JA,
// source IDs, photos and source checksums remain unchanged in primary.js.
const sourceCorrections={842594:['最初の 4本 のネジ（４隅）','先に、各辺の中央にある4本のねじを締めます。'],842595:['最後の 4本 のネジ (４角)','最後に、四隅の4本のねじを締めます。'],842654:['Textile sleeve 52 x 8 mm (1個) 電子機器＆チャンバー部品パッケージに含まれています','テキスタイルスリーブ520×8 mm（1本）を用意します。']};
export function originalHeatbedPrimaryText(lineID,text){const row=sourceCorrections[lineID];if(!row)return text;if(text!==row[0])throw Error('Original heatbed captured source text changed: '+lineID);return row[1];}
export function originalHeatbedSupply(stepID,text){return stepID===842650&&text===sourceCorrections[842654][0]?sourceCorrections[842654][1]:text;}
