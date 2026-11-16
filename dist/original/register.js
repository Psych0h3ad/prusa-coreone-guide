import{FLOWS,PARTS}from'../data.js?v=20261112-113';
import{ASSEMBLY_PLAN}from'../assembly-plan-runtime.js?v=20261113-116';
import{SENSOR_ASSEMBLY}from'../sensor-assembly-data.js?v=20261111-94';
import{ORIGINAL_PRIMARY}from'./primary.js';
import{ORIGINAL_ALIGNMENT}from'./alignment.js';
import{ORIGINAL_TEXT,ORIGINAL_CHECKS}from'./authoring.js';
import{JA_LINE_OVERRIDES,JA_STEP_TITLES,ORIGINAL_LABEL_JA}from'./ja-overrides.js';
const clone=x=>Array.isArray(x)?x.map(clone):x&&typeof x==='object'?Object.fromEntries(Object.entries(x).map(([k,v])=>[k,clone(v)])):x;
const role={sensorBody:'sensorOld',sensorLever:'sensorOldLever',sensorCover:'sensorOldCover',sensorCoverScrewLeft:'sensorOldCoverScrewLeft',sensorCoverScrewRight:'sensorOldCoverScrewRight',sensorMountNutLeft:'sensorOldNut0',sensorMountNutRight:'sensorOldNut1',sensorSwitch:null,sensorLeverWasher:null,puck:236,spoolNew:236,ventLever:861,ventBlock:null};
const partRole={...role,puck:'spoolOld',spoolNew:'spoolOld',ventLever:'coverOld'};
const remapParts=values=>[...new Set((values||[]).map(x=>Object.hasOwn(partRole,x)?partRole[x]:x).filter(x=>x!==null))];
const remap=x=>Array.isArray(x)?x.map(remap).filter(x=>x!==null):x&&typeof x==='object'?Object.fromEntries(Object.entries(x).map(([k,v])=>[k,remap(v)])):typeof x==='string'&&Object.hasOwn(role,x)?role[x]:x;
const auditNotes={
 838335:'Original adds pad-flash inspection; same three pads/mounts and twelveM3x8 operations.',
 838550:'Same right rod-mount90deg lock and fourM3x8; Plus adds cleanliness/fit checks.',
 839514:'Identical line multiset reordered; same Ethernet alignment and fiveM3x6.',
 839838:'Plus preliminary test screw absent in Original; actual cover primitive unchanged.',
 840193:'Plus extra cable-draping warning; same PSU placement, no extra cable insertion actor.',
 839934:'Original flat-grid/native source branch; Plus explicitly allows old flat grid. Same thermistor/tie operations.',
 863270:'Whitespace-only split around bottom tie warning.',
 843503:'Safety-pin color wording only.',843284:'Same T16-2GT tooth orientation; no Gen2 reuse.',
 850542:'Original motor-cable protrusion warning retained; same LoveBoard and fitting.',
 857078:'Original right cover861 replaces Plus ventLever; same two nativeM3x6 retainers870/872. Main cable routing is already Original6.54.',
 843863:'Plus smooth-rod seating warning; same front profile.',
 844964:'Original old-body/old-lever BOM: no switch orM3w washer. Real old-source geometry and old mating/rest frames.',
 849018:'Original old cover and twoM3x8; existing full8mm STL, old frame, no shaft shrink.',
 851280:'Whitespace only in cover/cable warning.',866874:'Extra hand-support wording only; sameM3x8rT.',
 852683:'Original threeM3x10rT, actual existing original vent configuration.',
 852717:'Original grille and three nuts, no Plus ventBlock; retain free sliding vent.',
 853005:'Front/forward wording only.',853500:'Original printed LCD mount: native two square nuts598/600 are installed before screws.',
 853919:'Same side seals; more explicit Plus trim-at-LCD wording.'
};
const refLists=['refs','seed','focus','settledFocus','transparentRefs','inspectRefs','solidRefs','followRefs'];
function originalRefs(plan){
 const out=clone(plan);
 function visit(obj){if(!obj||typeof obj!=='object')return;
  for(const [key,value]of Object.entries(obj)){
   if(refLists.includes(key)&&Array.isArray(value))obj[key]=remap(value);
   else if(Array.isArray(value))value.forEach(visit);else visit(value);
  }
 }
 visit(out);
 for(const p of out.workpiecePoses||[])if(p.refs?.some(r=>r===52||r===236))p.refs=[...new Set([...p.refs,150,152,154,156])];
 return out;
}
let installed;
export function installOriginal(){
 if(installed)return installed;
 if(FLOWS.build.steps.length!==379||FLOWS.build.steps[0].officialId!==982324)throw Error('Expected complete pinned Plus source graph before Original registration');
 const oldFlow=FLOWS.build,oldBank=ASSEMBLY_PLAN.build,upgrade=ASSEMBLY_PLAN.upgrade,originalBank={},mappings=[],steps=[];
 const pick=(id)=>{const s=oldFlow.steps.find(s=>s.officialId===id);if(!s)throw Error('Missing source primitive '+id);return{s,p:oldBank[id]};};
 for(const source of ORIGINAL_PRIMARY.steps){
  const row=ORIGINAL_ALIGNMENT.find(r=>r.originalStepID===source.officialId);let sourceID=row.plusStepID;
  if(!sourceID)sourceID=({837340:983243,848791:1014196,851866:997250,854355:999252,854393:999288,836210:999427,836260:999469,836647:999963})[source.officialId];
  const base=sourceID?pick(sourceID):null;let plan=base?originalRefs(base.p):{workspace:'printer',seed:[],actors:[],focus:[],note:''};
  const id=source.officialId;
  if(row.status==='AUDIT_SOURCE_DELTA_REQUIRED'&&row.plusDeclaredActors&&!auditNotes[id])throw Error('Unreviewed mechanical delta '+id);
  if(id===842794)plan.detachedBedPacket=true;
  if(id===857078){plan.actors[2].refs=[861];plan.actors[2].label='原版の右プリントヘッドカバー';}
  if(id===844964){
   const removal=upgrade[1022982],lever=removal.actors.find(a=>a.refs?.includes('sensorOldLever')),magnet=removal.actors.find(a=>a.refs?.includes('sensorLeverMagnet')&&a.remove),ball=removal.actors.find(a=>a.refs?.includes('sensorBall'));
   const bench=clone(lever.posePath.at(-1)),axis=lever.axis,approach={...clone(bench),offset:bench.offset.map((x,i)=>x+axis[i]*25)};
   const park={...clone(lever),refs:['sensorOldLever'],posePath:[approach,bench],label:'原版レバーを作業台へ置く',remove:false,reuse:false};
   const insertLever={...clone(lever),posePath:[...clone(lever.posePath)].reverse(),remove:false,reuse:true,label:'磁石を入れた原版レバーを本体へ収める'};
   plan.actors=[park,{...clone(magnet),remove:false,reuse:false,destination:undefined,label:'レバーへ10×6×2mm磁石を差し込む'},
    {...clone(ball),remove:false,destination:undefined,label:'原版本体のくぼみへ7mmボールを入れる'},insertLever,clone(plan.actors.at(-1))];
   plan.actors[4].label='M3x10を数回転だけ入れてレバーを保持する';
  }
  if(id===848791){
   plan={...plan,workspace:'sensor',seed:[],actors:[{...clone(upgrade[1022950].actors[0]),remove:false,destination:undefined,label:'2個目の磁石を反発する向きへ入れる'}],focus:['sensorOld'],settledFocus:['sensorOld'],step:15,chapter:7};
  }
  if(id===849018){plan.actors[3].label='左のM3x8で原版カバーを固定する';plan.actors[4].label='右のM3x8で原版カバーを固定する';}
  if(id===851866){
   const [screws,holder]=upgrade[1022670].actors;
   plan={...plan,workspace:'right-panel',seed:[],actors:[{...clone(holder),remove:false,destination:undefined,label:'上向きの張り出しを確認し、原版ホルダーを合わせる'},
    ...screws.refs.map((ref,i)=>({...clone(screws),refs:[ref],remove:false,destination:undefined,label:`原版ホルダーのM3x8rT ${i+1}/4を留める`}))],focus:[52,236,150,152,154,156]};
  }
  if(id===852717){
   plan.actors=plan.actors.filter(a=>!Array.isArray(a.refs)||a.refs.length>0);
   for(const a of plan.actors)if(a.refs?.length===2&&a.refs.includes(94)&&a.refs.includes(96))a.label='残り2個のナットで原版ベントを仮止めする';
  }
  if(id===853500)plan.actors.splice(1,0,...[598,600].map((ref,i)=>({refs:[ref],label:`原版の印刷マウントへM3nS ${i+1}/2を入れる`,axis:[0,0,-1],distance:18})));
  if(id===836210)plan.actors=plan.actors.filter(a=>a.refs?.includes(660));
  const originalLines=source.sourceKey.lineIDs;
  for(const a of plan.actors){a.primitiveOfficialLine=a.officialLine;delete a.officialLine;a.originalSource={manualID:2251,guideID:source.sourceKey.guideID,stepID:id,lineIDs:a.xyMountSource?.original2251?.lineIDs??originalLines};}
  plan.originalSource={manualID:2251,guideID:source.sourceKey.guideID,stepID:id,lineIDs:originalLines,photoIDs:source.sourceKey.photoIDs};
  plan.programChapter=plan.chapter;plan.programStep=plan.step;plan.displayChapter=source.chapter+1;plan.displayStep=source.officialStep;plan.programOfficialId=sourceID;
  // SourceOriginal7.15 has its own old-magnet primitive, not the Plus switch.
  if(id===848791)plan.programOfficialId=1022950;
  const prep=source.suppliesJa.length>0&&/部品|準備|パーツ|parts.*prepar/i.test(source.title);
  const jp=ORIGINAL_TEXT[id]||(prep?'部品一覧の種類と数量を照合し、次の工程で使うものを手元へ揃えます。組み立ては次の手順から進めてください。':base?.s.description);
  if(!jp)throw Error('Missing authored Original instruction '+id);
  const step={...(base?clone(base.s):{}),chapter:source.chapter,officialStep:source.officialStep,officialId:id,chapterSteps:source.chapterSteps,
   title:JA_STEP_TITLES[id]||source.title,description:jp,source:source.sourceJA,photo:source.photos[0]?.large||source.photos[0]?.original||'',
   primaryInstructions:source.lines.map(l=>({lineID:l.lineID,text:l.text,kind:l.kind})),
   checks:ORIGINAL_CHECKS[id]||clone(base?.s.checks)||['原版の手順と部品の向きを確認した'],parts:remapParts(base?.s.parts),reveal:remapParts(base?.s.reveal),add:remapParts(base?.s.add),
   variant:null,programChapter:plan.chapter,programStep:plan.step,programOfficialId:plan.programOfficialId,programIndex:base?oldFlow.steps.indexOf(base.s):null,
   originalSource:plan.originalSource,kind:base?.s.kind||'read',tools:base?.s.tools||[],supplies:source.suppliesJa,
   verificationRevision:'original2251-full02-ja1:'+source.verificationRevision};
  if(!step.checks.length)step.checks=['部品と向きを確認した'];
  // Do not inherit Plus prose, photos, or its optional screw-handle selector.
  for(const key of ['tip','action','references'])delete step[key];
  step.chooseVariant=false;
  if(id===836210)for(const key of ['parts','reveal','add'])step[key]=step[key].filter(p=>p!=='spoolOld');
  for(const part of step.parts)if(typeof part!=='string'||!Object.hasOwn(PARTS,part))throw Error('Invalid Root UI part key '+id+':'+part);
  if(id===854355||id===854393){step.variant='glued';plan.variant='glued';}else plan.variant=null;
  originalBank[id]=plan;steps.push(step);mappings.push({originalStepID:id,originalGuideID:source.sourceKey.guideID,programSourceStepID:plan.programOfficialId,
   displayChapter:source.chapter+1,displayStep:source.officialStep,programChapter:plan.chapter,programStep:plan.step,
   sourceAlignment:row.status,audit:auditNotes[id]||(!row.plusStepID?'Explicit separate Original source/BOM mapping':null),actors:plan.actors.length,flexActors:plan.actors.filter(a=>a.flex).length,
   sourceLineIDs:originalLines,photoIDs:source.sourceKey.photoIDs});
 }
 if(steps.length!==369)throw Error('Original stage count must remain369');
 FLOWS.build={...oldFlow,title:ORIGINAL_LABEL_JA.title,editionLabel:ORIGINAL_LABEL_JA.model,manualID:2251,edition:'original2251',revision:ORIGINAL_LABEL_JA.model,guide:'組み立てガイド',manual:ORIGINAL_PRIMARY.guideURL,chapters:ORIGINAL_PRIMARY.chapters,steps};
 ASSEMBLY_PLAN.build=originalBank;
 for(const spec of SENSOR_ASSEMBLY.meshes)if(['sensorOldCoverScrewLeft','sensorOldCoverScrewRight'].includes(spec.key)){spec.url='./assets/sensor/M3x8-cap.stl';spec.fastenerLength=8;}
 for(const key of ['sensorOldCoverScrewLeft','sensorOldCoverScrewRight']){PARTS[key].name=PARTS[key].name.replace('M3x10','M3x8');PARTS[key].en=PARTS[key].en.replace('M3x10','M3x8');}
 installed={mappings,stages:369,programmedStages:mappings.filter(r=>r.actors).length,actorEntries:mappings.reduce((n,r)=>n+r.actors,0),
  baseline:{steps:379,programmedStages:Object.values(oldBank).filter(p=>p.actors?.length).length},edition:'original2251',actualRootProviders:true};
 return installed;
}
