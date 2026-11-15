import {NATIVE_CHANNEL_SCREWS} from './heatbed-channel-native.js';
const workpiece=[659,780,697,699,701,751,753,755,777,779,786,703,705,'rgbWire','bedNtcAssembly','bedWire','xbBedMinus','xbBedPlus'];
const flex=(id,to,label,followRefs=[])=>({flex:[id],to,label,axis:[0,0,1],showBefore:true,focusMotion:true,followRefs,focusBounds:[-138,80,55,-86,151,98]});
const view={workspace:'carrier',bedChannelConstruction:true,heatbedAssembly:true,viewBounds:[-151,80,52,-82,182,121],focus:[659,780],viewMinDistance:65,contextOpacity:1,transparentRefs:[],photoCheck:null};
function bolt(d,label){const axis=d.axis;return{refs:[d.cadIndex],label,axis,showBefore:true,focusMotion:true,motionPivot:d.pivotMM,poseTiming:[.3,.5,.2],posePath:[{offset:axis.map((v,i)=>15*v+(i===1?45:0)),rotation:axis.map(v=>720*v)},{offset:axis.map(v=>15*v),rotation:axis.map(v=>720*v)},{offset:axis.slice(),rotation:axis.map(v=>720*v)},{offset:[0,0,0],rotation:[0,0,0]}]};}
export function withBedChannelConstruction(bank){
 const c=bank.build[988172],d=bank.build[988218];if(c.actors.length||d.actors.length!==1||d.actors[0].refs?.[0]!==786)throw Error('Official4.26/27 source plan preimage changed');
 return{...bank,build:{...bank.build,
  [988172]:{...c,...view,seed:[...c.seed,...workpiece],workpiecePoses:[{refs:[786],pivot:[0,0,0],offset:[0,0,25],rotation:[0,0,0]},...NATIVE_CHANNEL_SCREWS.map(d=>({refs:[d.cadIndex],pivot:[0,0,0],offset:d.axis.map((v,i)=>15*v+(i===1?45:0)),rotation:[0,0,0]}))],actors:[
   flex('rgbWire',4,'矩形の切り欠きからRGBケーブルを上へ引く'),
   flex('bedNtcAssembly',2,'NTCをRGBケーブルの下からカバーの通路へ案内する'),
   flex('rgbWire',5,'RGBケーブルをカバーの通路へ収める'),
   flex('bedWire',.1,'黒・赤の電源ケーブルを同じ通路へ収める',['xbBedMinus','xbBedPlus'])
  ],note:'RGBは基板の切り欠きから引き上げ、NTCをその下へ通します。すべてのケーブルを通路へ収めます。'},
  [988218]:{...d,...view,seed:[...d.seed,...workpiece],actors:[
   flex('bedWire',.4,'スリーブの先端約50mmをケーブル束に通す',['rgbWire','bedNtcAssembly','xbBedMinus','xbBedPlus']),
   flex('bedWire',.7,'スリーブの先端をカバー内へ約10mm差し込む'),
   {refs:[786],label:'スリーブを引き抜かずに上カバーを合わせる',axis:[0,0,1],distance:25,showBefore:true,focusMotion:true},
   bolt(NATIVE_CHANNEL_SCREWS[0],'1本目のM3x10ねじで上カバーを固定する'),
   bolt(NATIVE_CHANNEL_SCREWS[1],'2本目のM3x10ねじで上カバーを固定する'),
   {...flex('bedWire',1,'残りのスリーブをケーブル束へ巻き付ける',['rgbWire','bedNtcAssembly','xbBedMinus','xbBedPlus']),focusBounds:[-138,125,25,115,187,290]}
  ],note:'先端はカバー内に約10mm残します。M3x10の2本を順番に締め、残りのスリーブを束に巻き付けます。'}
 }};
}
