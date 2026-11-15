import {withBedChannelConstruction} from './heatbed-channel-plan.js';
const common={axis:[0,1,0],showBefore:true,focusMotion:true,focusBounds:[-155,159,45,-44,221,280]};
const actor=(id,to,label,bounds)=>({...common,flex:[id],to,label,...bounds?{focusBounds:bounds}:{}});
export function withHeatbedAssembly(bank){
 bank=withBedChannelConstruction(bank);
 const p=bank.build[988682],q=bank.build[988720];if(p.actors.length||q.actors.length)throw Error('4.37/4.38 source actor-zero preimage changed');
 const view={camera:'xbuddy-board-perspective',viewBounds:[-160,155,25,115,300,375],focus:['xBuddy','xBuddyExtension'],operationFocus:undefined,contextOpacity:1,transparentRefs:[],solidRefs:['xBuddy','xBuddyExtension'],heatbedAssembly:true};
 return{...bank,build:{...bank.build,
  [988682]:{...p,...view,seed:[...p.seed,'bedNtcAssembly'],actors:[
   actor('rgbWire',2,'RGB LEDケーブルをxBuddyボックス左側の穴へ通す',[-145,159,185,-47,235,284]),
   actor('rgbWire',3,'拡張基板の一番右のRGBW LED端子へ接続する',[-148,159,193,-108,213,235]),
   actor('bedWire',2,'電源ケーブルを左側の穴へ通し、まだ接続せず下げておく'),
   actor('bedNtcAssembly',.5,'サーミスターケーブルも左側の穴へ通し、まだ接続しない')
  ],note:'RGBを先に接続し、電源とサーミスターは未接続で残す'},
  [988720]:{...q,...view,seed:[...q.seed,'xbBedMinus632','xbBedPlus632'],actors:[
   actor('xbBedMinus',0,'ケーブルが結束バンドの下を通ることを確認する'),
   actor('xbBedMinus',1,'黒い電源端子を左側へ合わせる',[-96,163,51,-66,214,94]),
   actor('xbBedMinus632',1,'左側の黒い端子を6-32ねじでしっかり固定する',[-96,163,51,-66,214,94]),
   actor('xbBedPlus',1,'赤い電源端子を右側へ合わせる',[-101,163,51,-72,214,94]),
   actor('xbBedPlus632',1,'右側の赤い端子も6-32ねじでしっかり固定する',[-101,163,51,-72,214,94]),
   actor('bedNtcAssembly',1,'緑のHラベルのサーミスターをBED TEMPへ接続する',[-113,163,54,-86,211,86])
  ],note:'ケーブルを結束バンドの下へ通し、黒・赤を順番に固定してからサーミスターを接続する'}
 }};
}
