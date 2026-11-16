// Private motion overlay. Source: official guide 922437, all 46 body steps.
import * as T from 'three';
import {rightHandThreadDegrees} from './fastener-spin.js';
import {loveBoardServiceScene} from './loveboard-service-model.js?v=20261111-94';
import {followIdlerSprings} from './idler-spring-hardware.js?v=20261111-94';
import {cloneServiceMaterial} from './heatsink-service-material.js';
import {heatsinkWords as words} from './heatsink-service-locales.js';

const TASK='heatsink-replacement';
export const HEATSINK_REPLACEMENT_REFS=Object.freeze({original:'heatsinkServiceOriginal',replacement:'heatsinkReplacement'});
const OLD=HEATSINK_REPLACEMENT_REFS.original,NEW=HEATSINK_REPLACEMENT_REFS.replacement,MP='motorPlateWorkpoint';
export const HEATSINK_REPLACEMENT_OFFICIAL_IDS=Object.freeze([
 923062,923836,923094,923156,923202,923248,923274,923310,923348,929564,929600,929626,929648,
 929680,929716,929756,929796,929836,929860,929892,929916,929940,930060,929972,930004,930108,
 930148,930196,930220,930244,930276,930327,930359,930409,930441,930518,930470,923452,
 923506,923540,923558,923588,923650,923694,923730,923800
]);

// The viewer has already flattened the imported CAD hierarchy, retaining every
// primitive in meshes and its original assembly matrix. Copy every 794 leaf,
// including any children, rather than choosing only the first mesh/material.
// Call once after restoreCADSurfaces + maintenance cable registration and before
// the service scene is first resolved. No source vertex, material or pose changes.
const installations=new WeakMap();
export function installHeatsinkReplacementGeometry(viewer){
 if(installations.has(viewer))return installations.get(viewer);
 const sources=viewer.meshes.filter(m=>m.isMesh&&m.userData.cadPath?.includes(794)&&m.userData.cadIndex===794&&!m.userData.illustration&&!m.userData.annotation);
 if(!sources.length)throw Error('Heatsink replacement requires the restored native CAD794 leaves');
 for(const source of sources)if(source.userData.maintenanceComponent&&source.userData.maintenanceComponent!==OLD)throw Error('CAD794 already has a different maintenance role');
 const plates=viewer.meshes.filter(m=>m.userData.part==='mainPlate'&&!m.userData.annotation);
 if(plates.length!==1||plates[0].userData.maintenanceComponent&&plates[0].userData.maintenanceComponent!==MP)throw Error('Expected the existing main-plate surface workpoint');
 // Reuse the completion model's exact surface alias. The broad mainPlate part
 // key also selects another procedure's air-hole annotation; do not carry it.
 plates[0].userData.maintenanceComponent=MP;
 const clones=[];
 for(const source of sources){
  source.userData.maintenanceComponent=OLD;
  const clone=source.clone(true);
  clone.traverse(node=>{
   if(node.geometry)node.geometry=node.geometry.clone();
   if(node.material)node.material=cloneServiceMaterial(node.material);
   node.userData={...node.userData,part:'head',component:NEW,maintenanceComponent:NEW,cadPath:[787],sourceCadIndex:794,
    serviceTask:TASK,toolOnly:true,manualExcluded:false,cadName:'Replacement heatsink — native CAD794 copy'};
   delete node.userData.cadIndex;delete node.userData.sourceGeometry;
  });
  clone.position.copy(source.userData.restPosition||source.position);
  clone.quaternion.copy(source.userData.restQuaternion||source.quaternion);clone.scale.copy(source.scale);
  Object.assign(clone.userData,{restPosition:clone.position.clone(),sourceRestPosition:clone.position.clone(),restQuaternion:clone.quaternion.clone()});
  clone.updateMatrix();clone.visible=false;viewer.group('head').add(clone);
  viewer.meshes.push(clone);viewer.records.push({key:'head',name:clone.userData.cadName,mesh:clone,id:clone.uuid});clones.push(clone);
 }
 // The established spring follower caches CAD794. The new sink has the exact
 // same source rest matrix, so its original local seat/axis datums are valid.
 // Follow the installed sink in this task; restore the original for every other
 // task/flow. The follower itself and its spring buffers remain unchanged.
 let active=true;
 const restoreSeat=()=>{if(viewer.idlerSpringHardware?.sink)viewer.idlerSpringHardware.sink=sources[0];};
 const currentSeat=()=>{const plan=viewer.operationScene?.plan;return active&&!viewer.disposed&&viewer.loaded&&plan?.heatsinkService&&HEATSINK_REPLACEMENT_OFFICIAL_IDS.indexOf(Number(plan.officialId))>=19?clones[0]:sources[0];};
 if(typeof viewer.setProgress==='function'){
  const previous=viewer.setProgress;
  viewer.setProgress=function(progress){
   if(this.idlerSpringHardware?.sink)this.idlerSpringHardware.sink=currentSeat();
   const result=previous.call(this,progress);
   if(!active||this.disposed||!this.loaded){restoreSeat();return result;}
   const sink=currentSeat();
   if(this.idlerSpringHardware?.sink&&this.idlerSpringHardware.sink!==sink){this.idlerSpringHardware.sink=sink;followIdlerSprings(this);}
   return result;
  };
 }
 if(typeof viewer.dispose==='function'){
  const previousDispose=viewer.dispose;
  viewer.dispose=function(...args){active=false;restoreSeat();return previousDispose.apply(this,args);};
 }
 viewer.director?.cache.clear();viewer.sceneSignature=undefined;
 const receipt={originalRef:OLD,replacementRef:NEW,mainPlateRef:MP,sourceCadIndex:794,sourceMeshes:sources.length,replacementMeshes:clones.length,meshes:clones};
 installations.set(viewer,receipt);return receipt;
}

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
const BODY=[790,792,793,OLD,795,796,797,798,799,800,801,802,803,804,805,806,807,808,809,810,811,812,813,814,815,816,
 MP,...GEARS,'idlerBearing1','idlerBearing2','idlerPin1','idlerPin2',...HALL,...PCB,...SPRINGS,'idlerSwivelSpacer','lbLoadcellLead'];
const REPLACED_BODY=BODY.map(r=>r===OLD?NEW:r);
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
function threaded(from,to,axis,centre,turns,free=false){
 const travel=vector(to.offset).sub(vector(from.offset)).dot(vector(axis).normalize().applyQuaternion(quaternion(from.rotation)));
 const degrees=free?turns:rightHandThreadDegrees(turns,travel);
 return u=>{
 const t=smooth(T.MathUtils.clamp(u,0,1)),q=quaternion(from.rotation).slerp(quaternion(to.rotation),t),offset=vector(from.offset).lerp(vector(to.offset),t);
 if(u>0&&u<1){const spin=new T.Quaternion().setFromAxisAngle(vector(axis).normalize(),T.MathUtils.degToRad(degrees)*t),p=vector(P),c=vector(centre);
  offset.add(p.clone().sub(c).applyQuaternion(spin).add(c).sub(p).applyQuaternion(q));q.multiply(spin);
 }
 return {pivot:vector(P).multiplyScalar(.001),offset:offset.multiplyScalar(.001),rotation:q};
};}

function benchTimeline(){
 const state=new Map(BODY.map(r=>[r,OUT]));state.set(795,local(OUT,[-2.5,0,0]));state.set(807,local(OUT,[-2.5,0,0]));
 state.set(NEW,local(BACK,[100,0,0]));state.set('pgAdapter',TOOL);
 const rows=new Map();let ops=[],bases=[];
 const set=(refs,p)=>refs.forEach(r=>state.set(r,p));
 const move=(refs,to,label,{via=[],camera='hotend-perspective',axis=[0,-1,0],spin=0,centre,handling=false,...extra}={})=>{
  const groups=new Map();for(const r of refs){const from=state.get(r)||REST,key=JSON.stringify(from);if(!groups.has(key))groups.set(key,{from,refs:[]});groups.get(key).refs.push(r);}
  for(const {from,refs:group}of groups.values()){
   const a={refs:group,label,axis,distance:0,showBefore:true,focusMotion:true,reuse:true,motionPivot:P,
    posePath:[from,...via,to].map(p=>({offset:p.offset,rotation:p.rotation})),focusRefs:group,camera,focusPadding:6,focusMinDistance:75,
    guideRadius:1.7,guideTube:.25,guideArrowLength:5,handling,...extra};
   if(spin){a.spin=spin;a.rigidPose=threaded(from,to,axis,centre||SCREW_DATUMS[group[0]]||P,spin,!SCREW_DATUMS[group[0]]);}
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
 for(const officialId of HEATSINK_REPLACEMENT_OFFICIAL_IDS.slice(13,32)){
  const before=new Map(state);ops=[];bases=[];
  switch(officialId){
   case 929680:
    for(const id of [795,807])screw(id,local(OUT,[-32,0,0]),words('Remove the thumbscrew completely','つまみねじを完全に外す'),[-1,0,0],2160);
    carry(BODY.filter(r=>![795,807].includes(r)),BACK,words('Support and turn the detached Nextruder for NTC access','外したNextruderを支え、NTC側を向ける'));
    screw(811,local(BACK,[0,0,-9]),words('Remove M3×4T with the short T6 key','T6の短い側でM3×4Tを外す'),[0,0,-1],2880);
    move([806],local(BACK,[0,24,0]),words('Withdraw the NTC without pulling its wires','配線を引っ張らずNTCを抜く'),{axis:[0,1,0],camera:'back-perspective'});break;
   case 929716:{
    const remaining=BODY.filter(r=>![795,807,806,811].includes(r));carry(remaining,OUT,words('Turn the gearbox face towards you','ギアボックス側を手前に向ける'));
    for(const [i,id]of [805,815].entries())move([id,SPRINGS[i]],local(OUT,[38,0,0]),words('Withdraw M3×30 with its spring','M3×30をばねごと抜く'),{axis:[1,0,0],spin:2160,centre:SCREW_DATUMS[id]});
    move(SWIVEL,local(OUT,[-48,0,25]),words('Remove the complete idler swivel','アイドラースイベルを一式外す'),{via:[local(OUT,[0,0,18])],axis:[0,0,1]});
    for(const id of CASE_BOLTS)screw(id,local(OUT,[0,-32,0]),words('Remove the PG-case M3×25 screw','PGケースのM3×25を外す'),[0,-1,0],2160);
    move([816],local(OUT,[-78,-58,0]),words('Lift off the PG front case','PGフロントケースを外す'),{via:[local(OUT,[0,-32,0])]});break;
   }
   case 929756:
    screw(800,local(OUT,[0,-32,0]),words('Three-screw version: remove the M3×25 set screw','3本ねじ仕様ではM3×25止めねじを外す'),[0,-1,0],2160);
    move(ARM,local(OUT,[-48,-28,0]),words('Withdraw the complete idler assembly','アイドラーを一式抜く'),{via:[local(OUT,[-28,0,0])],axis:[-1,0,0]});
    move([MP,...GEARS],local(OUT,[0,-48,0]),words('Remove the main plate, PG-ring and gears together','メインプレート・PGリング・ギアを一緒に外す'));
    move([MP],local(OUT,[-78,-78,0]),words('Separate the main plate for cleaning','メインプレートを分けて清掃する'));
    move(['pgRing'],local(OUT,[-22,-72,0]),words('Separate and clean the PG-ring','PGリングを分けて清掃する'));
    move(['pgAssembly'],GEAR_PARK,words('Keep the PG assembly intact and remove excess grease','PGアセンブリを保持して余分なグリスを除く'));break;
   case 929796:
    move([790,792],local(OUT,[85,24,0]),words('Keep the 5×10×0.1 washer on the shaft; separate the motor','5×10×0.1ワッシャーを軸に残し、モーターを外す'),{via:[local(OUT,[0,24,0])],axis:[0,1,0]});break;
   case 929836:
    carry([OLD,'lbLoadcellLead',812,...PCB,...HALL],BACK,words('Present the Hall PCB pocket','Hall基板のくぼみを向ける'));
    screw(812,local(BACK,[0,12,0]),words('Remove the Hall PCB M2.5×6rT screw','Hall基板のM2.5×6rTを外す'),[0,1,0],1440);
    move(PCB,local(BACK,[48,24,0]),words('Lift out the Hall electronics with its cable','Hall基板をケーブルごと取り出す'),{via:[local(BACK,[0,12,0])],axis:[0,1,0],camera:'back-perspective'});break;
   case 929860:
    move(HALL,local(BACK,[-48,-32,0]),words('Withdraw the holder while retaining ball, magnet and spring','ボール・磁石・ばねを保持し、ホルダーを抜く'),{via:[local(BACK,[0,-20,0])],camera:'front',axis:[0,-1,0]});break;
   case 929892:
    move([OLD],local(BACK,[-110,0,0]),words('Set the stripped original heatsink aside','取り外した旧ヒートシンクを脇に置く'),{axis:[-1,0,0]});
    move([NEW],BACK,words('Bring in the new heatsink','新品のヒートシンクを用意する'),{axis:[1,0,0],focusRefs:[OLD,NEW]});break;
   case 929916:
    move(PCB,BACK,words('Seat the Hall PCB in the matching pocket','Hall基板を同じ形のくぼみに収める'),{via:[local(BACK,[0,12,0])],axis:[0,1,0],camera:'back-perspective'});
    screw(812,BACK,words('Tighten M2.5×6rT very carefully; do not crack the PCB','基板を割らないようM2.5×6rTを慎重に締める'),[0,1,0],1440);break;
   case 929940:
    move(HALL,BACK,words('Insert ball-side first at the side, protrusion down; seat flush','ボールを側面側、突起を下にして差し込み、面一にする'),{via:[local(BACK,[0,-20,0])],axis:[0,-1,0],camera:'front'});break;
   case 930060:
    move([790,792],OUT,words('Position the motor with its cable facing up','モーターの配線を上に向けて置く'),{axis:[1,0,0]});
    move([NEW,'lbLoadcellLead',812,...PCB,...HALL],OUT,words('Place the new heatsink on the motor, heatsink cables to the right','ヒートシンクの配線を右にし、モーターに合わせる'),{via:[local(OUT,[0,-30,0])],axis:[0,-1,0]});
    move([MP],OUT,words('Fit the main plate by its cutout; verify the shaft washer','切り欠きを合わせてメインプレートを置き、軸のワッシャーを確認する'),{via:[local(OUT,[0,-16,0])]});break;
   case 929972:
    move(['pgAdapter'],GEAR_PARK,words('Fit the PG adapter pockets over the gears','PGアダプターのくぼみをギアに合わせる'),{via:[local(GEAR_PARK,[0,-24,0])],focusRefs:['pgAdapter','pgAssembly']});break;
   case 930004:
    move(['pgRing'],GEAR_PARK,words('Chamfer towards gears: wobble the ring on with the adapter fitted','面取りをギア側にし、アダプターを付けたままリングを揺すって入れる'),{
     via:[local(GEAR_PARK,[0,-24,0]),local(GEAR_PARK,[0,-14,0],-12),local(GEAR_PARK,[0,-9,0],12),local(GEAR_PARK,[0,-4,0],-6)],
     focusRefs:[...GEARS,'pgAdapter'],camera:'right-perspective'});break;
   case 930108:
    move([...GEARS,'pgAdapter'],OUT,words('Lower onto the motor shaft; turn gently until the main-plate gap closes','モーター軸に合わせ、軽く回しながらメインプレートまで下ろす'),{
     via:[local(OUT,[0,-28,0]),local(OUT,[0,-12,0],8),local(OUT,[0,-6,0],-8)],focusRefs:[...GEARS,MP,792]});
    move(['pgAdapter'],TOOL,words('Remove the PG adapter','PGアダプターを外す'),{via:[local(OUT,[0,-26,0])],camera:'right-perspective'});break;
   case 930148:
    move(['pgAdapter'],OUT,words('Refit the PG adapter to check seating','PGアダプターを付け直して収まりを確認する'),{via:[local(OUT,[0,-24,0])]});
    move(['pgAdapter','pgAssembly'],OUT,words('Check that the gears rotate easily, without force','力をかけずギアが軽く回ることを確認する'),{axis:[0,-1,0],spin:360,centre:P,focusRefs:[...GEARS,MP]});
    move(['pgAdapter'],TOOL,words('Remove and retain the PG adapter','PGアダプターを外して保管する'),{via:[local(OUT,[0,-26,0])],camera:'right-perspective'});break;
   case 930196:
    move(ARM,OUT,words('Align the idler spacer with the ring hole and main-plate cutout','アイドラースペーサーをリングの穴と切り欠きに合わせる'),{via:[local(OUT,[-28,0,0])],axis:[-1,0,0]});
    screw(800,OUT,words('Install M3×25 set screw; leave its specified protrusion, do not overtighten','M3×25止めねじを入れる。突き出しを残し、締めすぎない'),[0,-1,0],2160);break;
   case 930220:break; // Lubricant is applied to existing teeth; no fabricated applicator or CAD.
   case 930244:
    move([816],OUT,words('Wipe the ring face and refit the PG case','PGリングの端面を拭き、ケースを戻す'),{via:[local(OUT,[0,-32,0])]});
    for(const id of CASE_BOLTS)screw(id,local(OUT,[0,-1.2,0]),words('Fit M3×25 loosely; final tightening is during Gearbox Alignment','M3×25を仮止めする。本締めはギアボックス調整時'),[0,-1,0],2160);break;
   case 930276:
    for(const [i,id]of [805,815].entries()){
     move([SPRINGS[i]],state.get(id),words('Keep the 15×5 spring on its M3×30 screw','M3×30に15×5ばねを通して保持する'),{axis:[1,0,0]});
     move([id,SPRINGS[i]],local(OUT,[12,0,0]),words('Insert the spring-loaded M3×30 through the heatsink','ばねを付けたM3×30をヒートシンクに通す'),{axis:[1,0,0]});
    }
    move(SWIVEL,OUT,words('Present the complete swivel to the screw tips','スイベルを一式、ねじ先に合わせる'),{via:[local(OUT,[0,0,18])],axis:[0,0,1]});
    for(const [i,id]of [805,815].entries())move([id,SPRINGS[i]],OUT,words('Stop with the tips flush with the front of the idler nut','ねじ先がアイドラーナット前面にそろったら止める'),{axis:[1,0,0],spin:1440,centre:SCREW_DATUMS[id]});break;
   case 930327:{
    const carryRefs=REPLACED_BODY.filter(r=>![795,807,806,811].includes(r));carry(carryRefs,BACK,words('Support the assembly for access from the motor side','モーター側から作業できるよう本体を支える'));
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
 923062:[1,''],923836:[2,''],923094:[3,''],923156:[4,'lb-bed-down'],923202:[5,'lb-top-out'],923248:[6,''],
 923274:[7,'lb-cover-out'],923310:[8,'lb-hotend-unplug'],923348:[9,'lb-hotend-out'],929564:[10,'lb-left-unplug'],
 929600:[11,'lb-right-out'],929626:[12,'lb-hotfan-out'],929648:[13,'lb-nextruder-out'],
 930359:[19,'lb-nextruder-in'],930409:[20,'lb-hotfan-in'],930441:[21,'lb-right-in'],930518:[22,'lb-left-plug'],930470:[23,'lb-print-plug'],
 923452:[24,'lb-hotend-in'],923506:[25,''],923540:[26,'lb-hotend-route'],923558:[27,'lb-hotend-plug'],923588:[28,'lb-cover-in'],
 923650:[29,'lb-top-in'],923694:[30,''],923730:[31,''],923800:[31,'']
};
const WARNINGS={
 923094:words('Unload and remove the filament/spool. Wait for ambient temperature.','フィラメントとスプールを外し、室温まで冷えるのを待つ。'),
 923156:words('Wait for the bed to stop at 100 mm or lower, then switch off and unplug power.','ベッドを100 mm以上下げて停止を待ち、電源を切ってプラグを抜く。'),
 923248:words('Protect the heatbed with thick fabric before proceeding.','作業を進める前に厚い布でベッドを保護する。'),
 923310:words('Press each connector latch before unplugging.','各コネクターのラッチを押してから抜く。'),
 923348:words('Support the hotend: loosen the thumbscrews only a few turns here; it can fall.','ホットエンドを支え、この手順ではつまみねじを数回緩めるだけにする。落下に注意。'),
 929648:words('Release the NTC lead from the carriage hook while withdrawing the Nextruder.','Nextruderを離すとき、NTC配線をキャリッジのフックから外す。'),
 929680:words('Remove the thumbscrews completely now. Protect the NTC wires.','ここでつまみねじを完全に外す。NTC配線を傷めない。'),
 929756:words('The M3×25 set-screw removal applies to the three-screw version. Clean excess grease and dirt.','M3×25止めねじの取り外しは3本ねじ仕様の場合。余分なグリスと汚れを除く。'),
 929796:words('Keep the 5×10×0.1 washer on the motor shaft; reseat it if it came off with the gearbox.','5×10×0.1ワッシャーをモーター軸に残す。ギア側に付いて外れた場合は軸に戻す。'),
 929860:words('Retain the tiny steel ball, magnet and spring. Do not lose them.','小さな鋼球・磁石・ばねを落とさず、安全な場所に保管する。'),
 929916:words('Tighten the PCB screw very carefully: overtightening can crack the board.','基板のねじは慎重に締める。締めすぎると基板が割れる。'),
 929940:words('Ball nearest the heatsink side; protrusion down; holder flush with the metal.','ボールをヒートシンク側面側、突起を下にする。ホルダーを金属面と面一に収める。'),
 930060:words('Motor cable up; heatsink cables right. Check the 5×10×0.1 washer before proceeding.','モーター配線は上、ヒートシンク配線は右。先へ進む前に5×10×0.1ワッシャーを確認する。'),
 929972:words('Watch the official PG-assembly video before assembling the gears.','ギアを組む前に公式PG-assembly動画を確認する。'),
 930004:words('Always use the PG adapter. Chamfer towards gears; wobble gently, about a quarter turn is enough.','必ずPGアダプターを使う。面取りはギア側。軽く左右に揺すり、約1/4回転以内を目安にする。'),
 930108:words('Turn gently until the assembly drops naturally against the main plate. Never force it.','軽く回し、メインプレートまで自然に収まる位置を探す。無理に押し込まない。'),
 930148:words('Check easy rotation, gears at/below the ring face, and a minimal main-plate gap. Reassemble if the gap is large.','軽く回ること、ギアがリング面から出ないこと、プレートとの隙間が小さいことを確認する。隙間が大きければ組み直す。'),
 930196:words('Do not overtighten the M3×25 set screw; its tip remains protruding from the ring.','M3×25止めねじを締めすぎない。取り付け後もリングから突き出す。'),
 930220:words('Apply a small amount of Prusa Lubricant all around the existing ring and gear teeth.','PGリングとギアの歯の全周に少量のPrusa Lubricantを塗る。'),
 930244:words('Wipe lubricant off the ring face. Leave the three case screws loose until the final alignment.','リング端面のグリスを拭く。ケースの3本は最後のギアボックス調整まで仮止めにする。'),
 930276:words('Stop when the screw tips are flush with the idler nut front. Do not overtighten.','ねじ先がアイドラーナット前面にそろったら止める。締めすぎない。'),
 930327:words('Tighten the NTC screw gently with two fingers on the short T6 key. Thumbscrews: two turns only.','NTCねじはT6の短い側を指2本で持って軽く締める。つまみねじは2回転だけ入れる。'),
 930359:words('Route the NTC freely through the carriage hook. Do not trap it behind the heatsink.','NTC配線をキャリッジのフックに通し、自由に動かせる状態を保つ。裏で挟まない。'),
 930409:words('Silver fan sticker towards the heatsink; cable to the left.','ファンの銀色ラベルをヒートシンク側、配線を左に向ける。'),
 923452:words('Keep pushing the hotend fully upward while tightening both thumbscrews.','ホットエンドを奥まで上に押し当てたまま、両方のつまみねじを締める。'),
 923506:words('The nozzle copper ring must not be visible. Reposition if the hotend is not fully seated.','ノズルの銅リングが見えてはいけない。奥まで入っていなければ位置を直す。'),
 923540:words('Route the hotend thermistor first, then the heater lead.','ホットエンドのサーミスター、ヒーターの順に配線する。'),
 923558:words('Thermistor: upper-left slot. Heater: black upper slot.','サーミスターは左上、ヒーターは上部の黒いコネクターへ。'),
 923588:words('Keep cables inside; engage the lower cover hook first. Remove the bed protection.','配線を内側に収め、下のフックからカバーを掛ける。ベッドの保護布を外す。'),
 923730:words('Change nozzle settings only if the nozzle diameter/type changed.','ノズルの径や種類を変更した場合だけ設定を変更する。'),
 923800:words('Run Selftest and mandatory Gearbox Alignment. Tighten the case screws only when the printer instructs. Continue only after green checks.','Selftestと必須のギアボックス調整を実施する。プリンターの指示に従ってケースねじを締め、緑のチェックを確認する。')
};
const FOCUS={
 929680:[795,807,806,811],929716:[805,815,...SWIVEL,816],929756:[800,...ARM,MP,...GEARS],929796:[790,792],
 929836:[OLD,812,...PCB],929860:[OLD,...HALL],929892:[OLD,NEW],929916:[NEW,812,...PCB],929940:[NEW,...HALL],
 930060:[NEW,790,792,MP],929972:['pgAdapter','pgAssembly'],930004:[...GEARS,'pgAdapter'],930108:[...GEARS,MP,'pgAdapter'],
 930148:[...GEARS,MP,'pgAdapter'],930196:[...ARM,800,'pgRing'],930220:[...GEARS],930244:[816,...CASE_BOLTS],
 930276:[805,815,...SPRINGS,...SWIVEL],930327:[NEW,806,811,795,807]
};

export function heatsinkReplacementScene(task,index,text){
 if(task?.id!==TASK)return null;
 const step=task.steps[index],id=Number(step?.officialId),n=HEATSINK_REPLACEMENT_OFFICIAL_IDS.indexOf(id)+1;
 if(!n)throw Error('Unknown official heatsink replacement step: '+step?.officialId);
 const shared=SHARED[id],reference=shared?.[0]??14;
 const s={...step,refs:step.refs||[],action:shared?.[1]||''};
 const spec=loveBoardServiceScene({...task,steps:Array.from({length:31},()=>s)},reference-1,text),plan=spec.plan;
 const exact=refs=>(refs||[]).map(r=>r==='mainPlate'?MP:r);
 for(const key of ['focus','solidRefs','inspectRefs','settledFocus'])if(plan[key])plan[key]=exact(plan[key]);
 for(const a of plan.actors){if(a.refs)a.refs=exact(a.refs);if(a.focusRefs)a.focusRefs=exact(a.focusRefs);}
 for(const p of plan.workpiecePoses||[])p.refs=exact(p.refs);
 plan.step=n;plan.officialId=id;plan.heatsinkService=true;
 plan.note=WARNINGS[id]?text(WARNINGS[id]):'';
 if(n<14){spec.hidden.push(NEW);return spec;}
 if(n<=32){
  const row=benchTimeline().get(id),active=new Set(row.ops.flatMap(a=>a.refs));
  spec.isolated=[...BODY,NEW,'pgAdapter'];spec.hidden=n<20?[NEW]:[];
  Object.assign(plan,{workspace:'printer',pose:'printer-standing',headOnly:true,camera:[929680,929836,929916,930327].includes(id)?'back-perspective':'hotend-perspective',
   focus:FOCUS[id],focusPadding:16,operationPadding:10,solidRefs:[...BODY,NEW,'pgAdapter'],transparentRefs:[],
   actors:row.ops.map(a=>({...a,label:text(a.label),officialId:id})),workpiecePoses:[],visibleRefs:['pgAdapter']});
  const grouped=new Map();for(const [ref,p]of row.before){if(active.has(ref))continue;const key=JSON.stringify(p);if(!grouped.has(key))grouped.set(key,{refs:[],...p});grouped.get(key).refs.push(ref);}
  plan.workpiecePoses.push(...grouped.values(),...row.bases);
  if([929796,930060,930148,930220].includes(id)){plan.inspectRefs=FOCUS[id];plan.inspectionLabel=text(step.title);plan.inspectionPadding=2;}
  // NTC was released from the hook at 13. This is an absolute disconnected
  // cable state; rigid sensor/motor/PCB motions carry their actual leads.
  spec.flexStates.lbNtcLead=-1;
  return spec;
 }
 // These numeric references are the matching LoveBoard operations only; the
 // unrelated board/rear-cover replacement middle section is never dispatched.
 const replace=refs=>(refs||[]).map(r=>r===794?NEW:r);
 spec.hidden=replace(spec.hidden);spec.hidden.push(OLD,'pgAdapter');
 for(const key of ['focus','solidRefs','inspectRefs','settledFocus'])if(plan[key])plan[key]=replace(plan[key]);
 for(const a of plan.actors){if(a.refs)a.refs=replace(a.refs);if(a.focusRefs)a.focusRefs=replace(a.focusRefs);}
 for(const p of plan.workpiecePoses||[])p.refs=replace(p.refs);
 plan.solidRefs=[...new Set([...(plan.solidRefs||[]),NEW])];
 if(id===930359){
  const body=plan.actors.find(a=>a.refs?.includes(790)&&a.refs?.includes(NEW));
  if(!body)throw Error('Matching LoveBoard Nextruder installation actor is missing');
  Object.assign(body,{motionPivot:P,posePath:[BACK,REST].map(p=>({offset:p.offset,rotation:p.rotation})),axis:[0,-1,0],distance:0,showBefore:true,focusRefs:[NEW,790],camera:'hotend-perspective'});
 }
 // Keep the case's deliberately loose local pose through printer reinstallation.
 for(const ref of CASE_BOLTS)plan.workpiecePoses.push({refs:[ref],pivot:P,rotation:ZERO,offset:[0,-1.2,0]});
 if(id===923506){plan.inspectRefs=['hotend',NEW];plan.inspectionLabel=text(step.title);plan.inspectionPadding=2;plan.camera='hotend-perspective';}
 if(id===923800){
  plan.workpiecePoses=plan.workpiecePoses.filter(p=>!p.refs?.some(r=>CASE_BOLTS.includes(r)));
  plan.actors=CASE_BOLTS.map(ref=>({refs:[ref],label:text(words('During Gearbox Alignment: tighten when the printer instructs','ギアボックス調整中、プリンターの指示に従って締める')),
   axis:[0,-1,0],distance:0,showBefore:true,focusMotion:true,camera:'hotend-perspective',focusRefs:[816,...CASE_BOLTS],motionPivot:P,
   posePath:[{offset:[0,-1.2,0],rotation:ZERO},{offset:ZERO,rotation:ZERO}],spin:720,rigidPose:threaded(pose([0,-1.2,0]),REST,[0,-1,0],SCREW_DATUMS[ref],720),officialId:id,requiresFirmwarePrompt:true}));
  plan.headOnly=false;plan.focus=['lcd',816,...CASE_BOLTS];plan.firmwareRequired=true;
 }
 return spec;
}
