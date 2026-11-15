// SPDX-License-Identifier: GPL-3.0-only
// Source922421: independently dispatched full sensor replacement.
// Matching access/bench paths are retained from reviewed Root159; native794 is never replaced.
import * as T from 'three';
import {loveBoardServiceScene}from './loveboard-service-model.js?v=20261111-94';
import {SENSOR_REPLACEMENT_REFS,OLD_SENSOR_BOARD_LEAD}from './internal-filament-sensor-geometry.js';
import {internalSensorWords as words}from './internal-filament-sensor-locales.js';
const TASK='internal-filament-sensor-replacement',SINK='heatsinkServiceOriginal',MP='motorPlateWorkpoint';
export const INTERNAL_SENSOR_OFFICIAL_IDS=Object.freeze([940390,940425,940467,940529,940575,940621,940647,940683,940721,940775,940811,940839,940857,940895,940931,940977,941023,941067,941093,942362,941155,942418,941180,941218,941272,941308,941368,941414,941468,941496,941524,941560,941606,941642,941696,941730,941758,941793,941821,941875,941909,941927,941957,942019,942063,942099,942169]);
const P=[9.05642165,-58.3952524,393.00041426],ZERO=[0,0,0];
const pose=(offset=ZERO,rotation=ZERO)=>({pivot:P,offset:[...offset],rotation:[...rotation]});
const REST=pose(),OUT=pose([0,-85,0]),BACK=pose([0,-85,0],[90,0,0]);
const vector=a=>new T.Vector3(...a);
function quaternion(rotation){const axis=vector(rotation),angle=axis.length();return angle?new T.Quaternion().setFromAxisAngle(axis.multiplyScalar(1/angle),T.MathUtils.degToRad(angle)):new T.Quaternion();}
function rotationVector(q){q=q.clone().normalize();if(q.w<0)q.set(-q.x,-q.y,-q.z,-q.w);const a=2*Math.acos(T.MathUtils.clamp(q.w,-1,1)),s=Math.sin(a/2);return Math.abs(s)<1e-12?ZERO.slice():[q.x/s,q.y/s,q.z/s].map(v=>v*T.MathUtils.radToDeg(a));}
function local(frame,offset=ZERO,turn=0){
 const q=quaternion(frame.rotation),d=vector(offset).applyQuaternion(q).add(vector(frame.offset));
 if(turn)q.multiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),T.MathUtils.degToRad(turn)));
 return pose(d.toArray(),rotationVector(q));
}
const HALL=['hallHolder','hallBall','hallMagnet','hallSpring'];
const PCB=['hallSensor','lbFilamentLead'],GEARS=['pgAssembly','pgRing'];
const ARM=[793,796,797,803,'idlerBearing1','idlerBearing2','idlerPin1','idlerPin2'];
const SWIVEL=[798,799,801,802,808,809,810,'idlerSwivelSpacer'];
const SPRINGS=['idlerSpring1','idlerSpring2'],CASE_BOLTS=[804,813,814];
// Disjoint leaf refs: 790 already resolves its motor lead; 806 resolves its NTC
// lead. 794 is deliberately absent: its ancestry also matches the Hall/cables.
const BODY=[790,792,793,SINK,795,796,797,798,799,800,801,802,803,804,805,806,807,808,809,810,811,812,813,814,815,816,
 MP,...GEARS,'idlerBearing1','idlerBearing2','idlerPin1','idlerPin2',...HALL,...PCB,...SPRINGS,'idlerSwivelSpacer','lbLoadcellLead'];
const ASSEMBLED_BODY=BODY.map(r=>SENSOR_REPLACEMENT_REFS[r]||r);
const GEAR_PARK=local(OUT,[48,-72,0]),TOOL=local(OUT,[100,-72,0]);
const SCREW_DATUMS={
 795:[-4.943445,-58.395248,339.500418],807:[-4.943441,-58.395250,362.500417],
 811:[.723220,-58.395249,333.000423],812:[16.556424,-54.995253,409.403192],
 805:[16.156428,-55.395378,417.447768],815:[16.156431,-61.395376,417.447765],
 800:[-6.443575,-48.895250,377.500418],804:[24.556423,-74.545251,377.500417],
 813:[-6.443577,-74.545250,408.500419],814:[24.556424,-74.545250,408.500417]
};
const smooth=t=>t*t*(3-2*t);
// Compose a real screw-axis rotation with the absolute carry pose. The normal
// posePath branch ignores `spin`; this provider keeps threaded motion visible
// without rotating about the Nextruder centre or modifying any CAD buffers.
function threaded(from,to,axis,centre,turns){return u=>{
 const t=smooth(T.MathUtils.clamp(u,0,1)),q=quaternion(from.rotation).slerp(quaternion(to.rotation),t),offset=vector(from.offset).lerp(vector(to.offset),t);
 if(u>0&&u<1){const spin=new T.Quaternion().setFromAxisAngle(vector(axis).normalize(),T.MathUtils.degToRad(turns)*t),p=vector(P),c=vector(centre);
  offset.add(p.clone().sub(c).applyQuaternion(spin).add(c).sub(p).applyQuaternion(q));q.multiply(spin);
 }
 return {pivot:vector(P).multiplyScalar(.001),offset:offset.multiplyScalar(.001),rotation:q};
};}


const NEW_HALL=['sensorReplacementHolder','sensorReplacementBall','sensorReplacementMagnet','sensorReplacementSpring'];
const NEW_PCB=['sensorReplacementBoard','lbFilamentLead'];
const NEW_PARTS=Object.values(SENSOR_REPLACEMENT_REFS);
const KIT_POSES={sensorReplacementBoard:local(BACK,[95,36,0]),sensorReplacementHolder:local(BACK,[85,-38,0]),sensorReplacementBall:local(BACK,[115,-38,0]),sensorReplacementMagnet:local(BACK,[135,-38,0]),sensorReplacementSpring:local(BACK,[155,-38,0])};

function benchTimeline(){
 const state=new Map(BODY.map(r=>[r,OUT]));state.set(795,local(OUT,[-2.5,0,0]));state.set(807,local(OUT,[-2.5,0,0]));
 for(const[ref,p]of Object.entries(KIT_POSES))state.set(ref,p);state.set(OLD_SENSOR_BOARD_LEAD,local(BACK,[48,24,0]));state.set('pgAdapter',TOOL);
 const rows=new Map();let ops=[],bases=[];
 const set=(refs,p)=>refs.forEach(r=>state.set(r,p));
 const move=(refs,to,label,{via=[],camera='hotend-perspective',axis=[0,-1,0],spin=0,centre,handling=false,...extra}={})=>{
  const groups=new Map();for(const r of refs){const from=state.get(r)||REST,key=JSON.stringify(from);if(!groups.has(key))groups.set(key,{from,refs:[]});groups.get(key).refs.push(r);}
  for(const {from,refs:group}of groups.values()){
   const a={refs:group,label,axis,distance:0,showBefore:true,focusMotion:true,reuse:true,motionPivot:P,
    posePath:[from,...via,to].map(p=>({offset:p.offset,rotation:p.rotation})),focusRefs:group,camera,focusPadding:6,focusMinDistance:75,
    guideRadius:1.7,guideTube:.25,guideArrowLength:5,handling,...extra};
   if(spin){a.spin=spin;a.rigidPose=threaded(from,to,axis,centre||SCREW_DATUMS[group[0]]||P,spin);}
   ops.push(a);
  }
  set(refs,to);
 };
 const screw=(id,to,label,axis,spin=1080)=>move([id],to,label,{axis,spin,camera:id===811?'back-perspective':id===812?'back-perspective':'hotend-perspective'});
 const carry=(refs,to,label)=>{
  // All carried loose fasteners keep their local gap during the rigid turn.
  const common=state.get(refs.find(r=>![795,807,...CASE_BOLTS].includes(r)))||OUT;
  const inv=quaternion(common.rotation).invert();
  for(const r of refs){const p=state.get(r)||common,d=vector(p.offset).sub(vector(common.offset)).applyQuaternion(inv);
   if(d.lengthSq()>1e-16)bases.push({refs:[r],pivot:P,rotation:ZERO,offset:d.toArray()});
   state.set(r,local(to,d.toArray()));
  }
  ops.push({refs,label,axis:[1,0,0],distance:0,showBefore:true,focusMotion:true,reuse:true,handling:true,motionPivot:P,
   posePath:[common,to].map(p=>({offset:p.offset,rotation:p.rotation})),camera:'back-perspective',focusRefs:refs,focusPadding:12,focusMinDistance:120});
 };
 for(const officialId of INTERNAL_SENSOR_OFFICIAL_IDS.slice(13,33)){
  const before=new Map(state);ops=[];bases=[];
  switch(officialId){
   case 940895:
    for(const id of [795,807])screw(id,local(OUT,[-32,0,0]),words('Remove the thumbscrew completely','つまみねじを完全に外す'),[-1,0,0],2160);
    carry(BODY.filter(r=>![795,807].includes(r)),BACK,words('Support and turn the detached Nextruder for NTC access','外したNextruderを支え、NTC側を向ける'));
    screw(811,local(BACK,[0,0,-9]),words('Remove M3×4T with the short T6 key','T6の短い側でM3×4Tを外す'),[0,0,-1],2880);
    move([806],local(BACK,[0,24,0]),words('Withdraw the NTC without pulling its wires','配線を引っ張らずNTCを抜く'),{axis:[0,1,0],camera:'back-perspective'});break;
   case 940931:{
    const remaining=BODY.filter(r=>![795,807,806,811].includes(r));carry(remaining,OUT,words('Turn the gearbox face towards you','ギアボックス側を手前に向ける'));
    for(const [i,id]of [805,815].entries())move([id,SPRINGS[i]],local(OUT,[38,0,0]),words('Withdraw M3×30 with its spring','M3×30をばねごと抜く'),{axis:[1,0,0],spin:2160,centre:SCREW_DATUMS[id]});
    move(SWIVEL,local(OUT,[-48,0,25]),words('Remove the complete idler swivel','アイドラースイベルを一式外す'),{via:[local(OUT,[0,0,18])],axis:[0,0,1]});
    for(const id of CASE_BOLTS)screw(id,local(OUT,[0,-32,0]),words('Remove the PG-case M3×25 screw','PGケースのM3×25を外す'),[0,-1,0],2160);
    move([816],local(OUT,[-78,-58,0]),words('Lift off the PG front case','PGフロントケースを外す'),{via:[local(OUT,[0,-32,0])]});break;
   }
   case 940977:
    screw(800,local(OUT,[0,-32,0]),words('Three-screw version: remove the M3×25 set screw','3本ねじ仕様ではM3×25止めねじを外す'),[0,-1,0],2160);
    move(ARM,local(OUT,[-48,-28,0]),words('Withdraw the complete idler assembly','アイドラーを一式抜く'),{via:[local(OUT,[-28,0,0])],axis:[-1,0,0]});
    move([MP,...GEARS],local(OUT,[0,-48,0]),words('Remove the main plate, PG-ring and gears together','メインプレート・PGリング・ギアを一緒に外す'));
    move([MP],local(OUT,[-78,-78,0]),words('Separate the main plate for cleaning','メインプレートを分けて清掃する'));
    move(['pgRing'],local(OUT,[-22,-72,0]),words('Separate and clean the PG-ring','PGリングを分けて清掃する'));
    move(['pgAssembly'],GEAR_PARK,words('Keep the PG assembly intact and remove excess grease','PGアセンブリを保持して余分なグリスを除く'));break;
   case 941023:
    move([790,792],local(OUT,[85,24,0]),words('Keep the 5×10×0.1 washer on the shaft; separate the motor','5×10×0.1ワッシャーを軸に残し、モーターを外す'),{via:[local(OUT,[0,24,0])],axis:[0,1,0]});break;
   case 941067:
    carry([SINK,'lbLoadcellLead',812,...PCB,...HALL],BACK,words('Present the Hall PCB pocket','Hall基板のくぼみを向ける'));
    screw(812,local(BACK,[0,12,0]),words('Remove the Hall PCB M2.5×6rT screw','Hall基板のM2.5×6rTを外す'),[0,1,0],1440);
    move(PCB,local(BACK,[48,24,0]),words('Lift out the Hall electronics with its cable','Hall基板をケーブルごと取り出す'),{via:[local(BACK,[0,12,0])],axis:[0,1,0],camera:'back-perspective'});break;
   case 941093:
    move(HALL,local(BACK,[-48,-32,0]),words('Withdraw the holder while retaining ball, magnet and spring','ボール・磁石・ばねを保持し、ホルダーを抜く'),{via:[local(BACK,[0,-20,0])],camera:'front',axis:[0,-1,0]});break;
   case 942362:
    // The old board keeps its old cable copy. The current cable now belongs to
    // the fresh board prepared here; the retained loadcell cable never changes.
    before.set('lbFilamentLead',KIT_POSES.sensorReplacementBoard);
    state.set('lbFilamentLead',KIT_POSES.sensorReplacementBoard);break;
   case 941155:
    move(NEW_PCB,BACK,words('Seat the Hall PCB in the matching pocket','Hall基板を同じ形のくぼみに収める'),{via:[local(BACK,[0,12,0])],axis:[0,1,0],camera:'back-perspective'});
    screw(812,BACK,words('Tighten M2.5×6rT very carefully; do not crack the PCB','基板を割らないようM2.5×6rTを慎重に締める'),[0,1,0],1440);break;
   case 942418:{
    const assembled=pose([110,-85,0],[0,90,0]),stack=local(assembled,[-24,0,0]);
    move(['sensorReplacementHolder'],assembled,words('Place the new holder with the ball end facing up','新品ホルダーを球の側が上になる向きで持つ'),{handling:true});
    move(['sensorReplacementBall'],stack,words('Arrange the new steel ball first','新しい鋼球を先頭に置く'),{handling:true});
    move(['sensorReplacementMagnet'],stack,words('Place exactly one new magnet after the ball','鋼球の後ろに新しい磁石を1個だけ置く'),{handling:true});
    move(['sensorReplacementSpring'],stack,words('Place the new spring after the magnet','磁石の後ろに新しいばねを置く'),{handling:true});
    move(NEW_HALL.slice(1),assembled,words('Insert the complete stack spring-first with the ball up','鋼球を上に保ち、3部品をばね側からホルダーに収める'),{axis:[1,0,0],camera:'front'});break;
   }
   case 941180:
    move(NEW_HALL,BACK,words('Insert ball-side first at the side, protrusion down; seat flush','ボールを側面側、突起を下にして差し込み、面一にする'),{via:[local(BACK,[0,-20,0])],axis:[0,-1,0],camera:'front'});break;
   case 941218:
    move([790,792],OUT,words('Position the motor with its cable facing up','モーターの配線を上に向けて置く'),{axis:[1,0,0]});
    move([SINK,'lbLoadcellLead',812,...NEW_PCB,...NEW_HALL],OUT,words('Refit the retained heatsink on the motor, its cables to the right','ヒートシンクは元のものを使い、配線を右にしてモーターに合わせる'),{via:[local(OUT,[0,-30,0])],axis:[0,-1,0]});
    move([MP],OUT,words('Fit the main plate by its cutout; verify the shaft washer','切り欠きを合わせてメインプレートを置き、軸のワッシャーを確認する'),{via:[local(OUT,[0,-16,0])]});break;
   case 941272:
    move(['pgAdapter'],GEAR_PARK,words('Fit the PG adapter pockets over the gears','PGアダプターのくぼみをギアに合わせる'),{via:[local(GEAR_PARK,[0,-24,0])],focusRefs:['pgAdapter','pgAssembly']});break;
   case 941308:
    move(['pgRing'],GEAR_PARK,words('Chamfer towards gears: wobble the ring on with the adapter fitted','面取りをギア側にし、アダプターを付けたままリングを揺すって入れる'),{
     via:[local(GEAR_PARK,[0,-24,0]),local(GEAR_PARK,[0,-14,0],-12),local(GEAR_PARK,[0,-9,0],12),local(GEAR_PARK,[0,-4,0],-6)],
     focusRefs:[...GEARS,'pgAdapter'],camera:'right-perspective'});break;
   case 941368:
    move([...GEARS,'pgAdapter'],OUT,words('Lower onto the motor shaft; turn gently until the main-plate gap closes','モーター軸に合わせ、軽く回しながらメインプレートまで下ろす'),{
     via:[local(OUT,[0,-28,0]),local(OUT,[0,-12,0],8),local(OUT,[0,-6,0],-8)],focusRefs:[...GEARS,MP,792]});
    move(['pgAdapter'],TOOL,words('Remove the PG adapter','PGアダプターを外す'),{via:[local(OUT,[0,-26,0])],camera:'right-perspective'});break;
   case 941414:
    move(['pgAdapter'],OUT,words('Refit the PG adapter to check seating','PGアダプターを付け直して収まりを確認する'),{via:[local(OUT,[0,-24,0])]});
    move(['pgAdapter','pgAssembly'],OUT,words('Check that the gears rotate easily, without force','力をかけずギアが軽く回ることを確認する'),{axis:[0,-1,0],spin:360,centre:P,focusRefs:[...GEARS,MP]});
    move(['pgAdapter'],TOOL,words('Remove and retain the PG adapter','PGアダプターを外して保管する'),{via:[local(OUT,[0,-26,0])],camera:'right-perspective'});break;
   case 941468:
    move(ARM,OUT,words('Align the idler spacer with the ring hole and main-plate cutout','アイドラースペーサーをリングの穴と切り欠きに合わせる'),{via:[local(OUT,[-28,0,0])],axis:[-1,0,0]});
    screw(800,OUT,words('Install M3×25 set screw; leave its specified protrusion, do not overtighten','M3×25止めねじを入れる。突き出しを残し、締めすぎない'),[0,-1,0],2160);break;
   case 941496:break; // Lubricant is applied to existing teeth; no fabricated applicator or CAD.
   case 941524:
    move([816],OUT,words('Wipe the ring face and refit the PG case','PGリングの端面を拭き、ケースを戻す'),{via:[local(OUT,[0,-32,0])]});
    for(const id of CASE_BOLTS)screw(id,local(OUT,[0,-1.2,0]),words('Fit M3×25 loosely; final tightening is during Gearbox Alignment','M3×25を仮止めする。本締めはギアボックス調整時'),[0,-1,0],2160);break;
   case 941560:
    for(const [i,id]of [805,815].entries()){
     move([SPRINGS[i]],state.get(id),words('Keep the 15×5 spring on its M3×30 screw','M3×30に15×5ばねを通して保持する'),{axis:[1,0,0]});
     move([id,SPRINGS[i]],local(OUT,[12,0,0]),words('Insert the spring-loaded M3×30 through the heatsink','ばねを付けたM3×30をヒートシンクに通す'),{axis:[1,0,0]});
    }
    move(SWIVEL,OUT,words('Present the complete swivel to the screw tips','スイベルを一式、ねじ先に合わせる'),{via:[local(OUT,[0,0,18])],axis:[0,0,1]});
    for(const [i,id]of [805,815].entries())move([id,SPRINGS[i]],OUT,words('Stop with the tips flush with the front of the idler nut','ねじ先がアイドラーナット前面にそろったら止める'),{axis:[1,0,0],spin:1440,centre:SCREW_DATUMS[id]});break;
   case 941606:{
    const carryRefs=ASSEMBLED_BODY.filter(r=>![795,807,806,811].includes(r));carry(carryRefs,BACK,words('Support the assembly for access from the motor side','モーター側から作業できるよう本体を支える'));
    move([806],BACK,words('Insert the NTC from the motor side','モーター側からNTCを差し込む'),{via:[local(BACK,[0,12,0])],axis:[0,1,0],camera:'back-perspective'});
    screw(811,BACK,words('Use two fingers on the short T6 key; tighten gently','T6の短い側を指2本で持ち、軽く確実に締める'),[0,0,-1],2880);
    for(const id of [795,807])screw(id,local(BACK,[-2.5,0,0]),words('Insert the thumbscrew loosely — only two turns','つまみねじを2回転だけ入れ、緩めにしておく'),[-1,0,0],720);break;
   }
  }
  rows.set(officialId,{before,after:new Map(state),ops,bases});
 }
 return rows;
}

const SHARED={
 940390:[1,''],940425:[2,''],940467:[3,''],940529:[4,'lb-bed-down'],940575:[5,'lb-top-out'],940621:[6,''],
 940647:[7,'lb-cover-out'],940683:[8,'lb-hotend-unplug'],940721:[9,'lb-hotend-out'],940775:[10,'lb-left-unplug'],
 940811:[11,'lb-right-out'],940839:[12,'lb-hotfan-out'],940857:[13,'lb-nextruder-out'],
 941642:[19,'lb-nextruder-in'],941696:[20,'lb-hotfan-in'],941730:[21,'lb-right-in'],941758:[22,'lb-left-plug'],941793:[23,'lb-print-plug'],
 941821:[24,'lb-hotend-in'],941875:[25,''],941909:[26,'lb-hotend-route'],941927:[27,'lb-hotend-plug'],941957:[28,'lb-cover-in'],
 942019:[29,'lb-top-in'],942063:[30,''],942099:[31,''],942169:[31,'']
};
const WARNINGS={
 940467:words('Unload and remove the filament/spool. Wait for ambient temperature.','フィラメントとスプールを外し、室温まで冷えるのを待つ。'),
 940529:words('Wait for the bed to stop at 100 mm or lower, then switch off and unplug power.','ベッドを100 mm以上下げて停止を待ち、電源を切ってプラグを抜く。'),
 940621:words('Protect the heatbed with thick fabric before proceeding.','作業を進める前に厚い布でベッドを保護する。'),
 940683:words('Press each connector latch before unplugging.','各コネクターのラッチを押してから抜く。'),
 940721:words('Support the hotend: loosen the thumbscrews only a few turns here; it can fall.','ホットエンドを支え、この手順ではつまみねじを数回緩めるだけにする。落下に注意。'),
 940857:words('Release the NTC lead from the carriage hook while withdrawing the Nextruder.','Nextruderを離すとき、NTC配線をキャリッジのフックから外す。'),
 940895:words('Remove the thumbscrews completely now. Protect the NTC wires.','ここでつまみねじを完全に外す。NTC配線を傷めない。'),
 940977:words('The M3×25 set-screw removal applies to the three-screw version. Clean excess grease and dirt.','M3×25止めねじの取り外しは3本ねじ仕様の場合。余分なグリスと汚れを除く。'),
 941023:words('Keep the 5×10×0.1 washer on the motor shaft; reseat it if it came off with the gearbox.','5×10×0.1ワッシャーをモーター軸に残す。ギア側に付いて外れた場合は軸に戻す。'),
 941093:words('Retain the tiny steel ball, magnet and spring. Do not lose them.','小さな鋼球・磁石・ばねを落とさず、安全な場所に保管する。'),
 941155:words('Tighten the PCB screw very carefully: overtightening can crack the board.','基板のねじは慎重に締める。締めすぎると基板が割れる。'),
 941180:words('Ball nearest the heatsink side; protrusion down; holder flush with the metal.','ボールをヒートシンク側面側、突起を下にする。ホルダーを金属面と面一に収める。'),
 941218:words('Motor cable up; heatsink cables right. Check the 5×10×0.1 washer before proceeding.','モーター配線は上、ヒートシンク配線は右。先へ進む前に5×10×0.1ワッシャーを確認する。'),
 941272:words('Watch the official PG-assembly video before assembling the gears.','ギアを組む前に公式PG-assembly動画を確認する。'),
 941308:words('Always use the PG adapter. Chamfer towards gears; wobble gently, about a quarter turn is enough.','必ずPGアダプターを使う。面取りはギア側。軽く左右に揺すり、約1/4回転以内を目安にする。'),
 941368:words('Turn gently until the assembly drops naturally against the main plate. Never force it.','軽く回し、メインプレートまで自然に収まる位置を探す。無理に押し込まない。'),
 941414:words('Check easy rotation, gears at/below the ring face, and a minimal main-plate gap. Reassemble if the gap is large.','軽く回ること、ギアがリング面から出ないこと、プレートとの隙間が小さいことを確認する。隙間が大きければ組み直す。'),
 941468:words('Do not overtighten the M3×25 set screw; its tip remains protruding from the ring.','M3×25止めねじを締めすぎない。取り付け後もリングから突き出す。'),
 941496:words('Apply a small amount of Prusa Lubricant all around the existing ring and gear teeth.','PGリングとギアの歯の全周に少量のPrusa Lubricantを塗る。'),
 941524:words('Wipe lubricant off the ring face. Leave the three case screws loose until the final alignment.','リング端面のグリスを拭く。ケースの3本は最後のギアボックス調整まで仮止めにする。'),
 941560:words('Stop when the screw tips are flush with the idler nut front. Do not overtighten.','ねじ先がアイドラーナット前面にそろったら止める。締めすぎない。'),
 941606:words('Tighten the NTC screw gently with two fingers on the short T6 key. Thumbscrews: two turns only.','NTCねじはT6の短い側を指2本で持って軽く締める。つまみねじは2回転だけ入れる。'),
 941642:words('Route the NTC freely through the carriage hook. Do not trap it behind the heatsink.','NTC配線をキャリッジのフックに通し、自由に動かせる状態を保つ。裏で挟まない。'),
 941696:words('Silver fan sticker towards the heatsink; cable to the left.','ファンの銀色ラベルをヒートシンク側、配線を左に向ける。'),
 941821:words('Keep pushing the hotend fully upward while tightening both thumbscrews.','ホットエンドを奥まで上に押し当てたまま、両方のつまみねじを締める。'),
 941875:words('The nozzle copper ring must not be visible. Reposition if the hotend is not fully seated.','ノズルの銅リングが見えてはいけない。奥まで入っていなければ位置を直す。'),
 941909:words('Route the hotend thermistor first, then the heater lead.','ホットエンドのサーミスター、ヒーターの順に配線する。'),
 941927:words('Thermistor: upper-left slot. Heater: black upper slot.','サーミスターは左上、ヒーターは上部の黒いコネクターへ。'),
 941957:words('Keep cables inside; engage the lower cover hook first. Remove the bed protection.','配線を内側に収め、下のフックからカバーを掛ける。ベッドの保護布を外す。'),
 942099:words('Change nozzle settings only if the nozzle diameter/type changed.','ノズルの径や種類を変更した場合だけ設定を変更する。'),
 942169:words('Run Selftest and mandatory Gearbox Alignment. Tighten the case screws only when the printer instructs. Continue only after green checks.','Selftestと必須のギアボックス調整を実施する。プリンターの指示に従ってケースねじを締め、緑のチェックを確認する。')
};
const FOCUS={
 940895:[795,807,806,811],940931:[805,815,...SWIVEL,816],940977:[800,...ARM,MP,...GEARS],941023:[790,792],
 941067:[SINK,812,...PCB],941093:[SINK,...HALL],942362:[SINK,SINK],941155:[SINK,812,...PCB],941180:[SINK,...HALL],
 941218:[SINK,790,792,MP],941272:['pgAdapter','pgAssembly'],941308:[...GEARS,'pgAdapter'],941368:[...GEARS,MP,'pgAdapter'],
 941414:[...GEARS,MP,'pgAdapter'],941468:[...ARM,800,'pgRing'],941496:[...GEARS],941524:[816,...CASE_BOLTS],
 941560:[805,815,...SPRINGS,...SWIVEL],941606:[SINK,806,811,795,807]
};


export function internalSensorScene(task,index,text){
 if(task?.id!==TASK)return null;
 const step=task.steps[index],id=Number(step.officialId),n=INTERNAL_SENSOR_OFFICIAL_IDS.indexOf(id)+1;
 if(!n)throw Error('Unknown922421 official step '+id);
 const shared=SHARED[id],reference=shared?.[0]??14,s={...step,action:shared?.[1]||''};
 const spec=loveBoardServiceScene({...task,steps:Array.from({length:31},()=>s)},reference-1,text),plan=spec.plan;
 const exact=refs=>(refs||[]).map(r=>r==='mainPlate'?MP:r===794?SINK:r);
 const installed=refs=>exact(refs).map(r=>SENSOR_REPLACEMENT_REFS[r]||r);
 const mapPlan=fn=>{for(const k of['focus','solidRefs','inspectRefs','settledFocus'])if(plan[k])plan[k]=fn(plan[k]);for(const a of plan.actors){if(a.refs)a.refs=fn(a.refs);if(a.focusRefs)a.focusRefs=fn(a.focusRefs);}for(const p of plan.workpiecePoses||[])p.refs=fn(p.refs);};
 plan.step=n;plan.officialId=id;plan.internalSensorService=true;
 plan.note=WARNINGS[id]?text(WARNINGS[id]):'';
 if(n<14){mapPlan(exact);spec.hidden.push(...NEW_PARTS,OLD_SENSOR_BOARD_LEAD);return spec;}
 if(n<=33){
  const row=benchTimeline().get(id),active=new Set(row.ops.flatMap(a=>a.refs));
  spec.isolated=[...BODY,...NEW_PARTS,OLD_SENSOR_BOARD_LEAD,'pgAdapter'];spec.hidden=n<20?[...NEW_PARTS,OLD_SENSOR_BOARD_LEAD]:[];
  let focus=id===942362?NEW_PARTS:id===942418?NEW_HALL:FOCUS[id]||step.refs;
  focus=n>=21?installed(focus):exact(focus);
  Object.assign(plan,{workspace:'printer',pose:'printer-standing',headOnly:true,camera:[940895,941067,941155,941606].includes(id)?'back-perspective':'hotend-perspective',focus,focusPadding:16,operationPadding:10,solidRefs:[...BODY,...NEW_PARTS,OLD_SENSOR_BOARD_LEAD,'pgAdapter'],transparentRefs:[],actors:row.ops.map(a=>({...a,label:text(a.label),officialId:id})),workpiecePoses:[],visibleRefs:n>=20?[...NEW_PARTS,OLD_SENSOR_BOARD_LEAD,'pgAdapter']:['pgAdapter']});
  const grouped=new Map();for(const[ref,p]of row.before){if(active.has(ref))continue;const key=JSON.stringify(p);if(!grouped.has(key))grouped.set(key,{refs:[],...p});grouped.get(key).refs.push(ref);}plan.workpiecePoses.push(...grouped.values(),...row.bases);
  if([941023,941218,941414,941496,942362].includes(id)){plan.inspectRefs=focus;plan.inspectionLabel=text(step.title);plan.inspectionPadding=2;}
  if([942362,942418].includes(id))plan.note=text(step.body);
  spec.flexStates.lbNtcLead=-1;return spec;
 }
 // Retained sink and stock loadcell/NTC/motor cables, with only the sensor kit new.
 mapPlan(installed);spec.hidden=exact(spec.hidden);spec.hidden.push(...Object.keys(SENSOR_REPLACEMENT_REFS),OLD_SENSOR_BOARD_LEAD,'pgAdapter');
 plan.solidRefs=[...new Set([...(plan.solidRefs||[]),SINK,...NEW_PARTS])];plan.visibleRefs=NEW_PARTS;
 if(id===941642){const body=plan.actors.find(a=>a.refs?.includes(790)&&a.refs?.includes(SINK));if(!body)throw Error('Missing retained-body mounting motion');Object.assign(body,{motionPivot:P,posePath:[BACK,REST].map(p=>({offset:p.offset,rotation:p.rotation})),axis:[0,-1,0],distance:0,showBefore:true,focusRefs:[SINK,790],camera:'hotend-perspective'});}
 for(const ref of CASE_BOLTS)plan.workpiecePoses.push({refs:[ref],pivot:P,rotation:ZERO,offset:[0,-1.2,0]});
 if(id===941875){plan.inspectRefs=['hotend',SINK];plan.inspectionLabel=text(step.title);plan.inspectionPadding=2;plan.camera='hotend-perspective';}
 if(id===942169){plan.workpiecePoses=plan.workpiecePoses.filter(p=>!p.refs?.some(r=>CASE_BOLTS.includes(r)));plan.actors=CASE_BOLTS.map(ref=>({refs:[ref],label:text(words('During Gearbox Alignment: tighten when the printer instructs','ギアボックス調整中、プリンターの指示に従って締める')),axis:[0,-1,0],distance:0,showBefore:true,focusMotion:true,camera:'hotend-perspective',focusRefs:[816,...CASE_BOLTS],motionPivot:P,posePath:[{offset:[0,-1.2,0],rotation:ZERO},{offset:ZERO,rotation:ZERO}],spin:720,rigidPose:threaded(pose([0,-1.2,0]),REST,[0,-1,0],SCREW_DATUMS[ref],720),officialId:id,requiresFirmwarePrompt:true}));plan.headOnly=false;plan.focus=['lcd',816,...CASE_BOLTS];plan.firmwareRequired=true;}
 return spec;
}
