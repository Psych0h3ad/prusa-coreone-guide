import {chamberResourceScene} from './chamber-service-plan.js';
import {applyChamberThermistorView} from './chamber-thermistor-view.js';
const FAN_IDS=['cfFan1','cfFan2'],BENCH=[100,-120,80],OUT=[65,-20,-28];
export const CHAMBER_THERMISTOR_REFS=Object.freeze({probe:'ctThermistorAssembly',oldTie:'ctOldGridTie',newTie:'ctNewGridTie'});
export function chamberThermistorScene(task,index,text,bedFrame){
 if(!task.chamberThermistor)return null;
 const s=task.steps[index],at=s.chamberAccessIndex;
 // Reuse the common, native-part cover/fastener operation. Never install a
 // second lead or socket provider for this procedure.
 const shim={id:'chamber-fan',steps:Array.from({length:22},()=>({...s,action:s.action}))};
 const spec=chamberResourceScene(shim,at,text,bedFrame),p=spec.plan;
 p.serviceTask=task.id;p.step=index+1;p.focus=s.refs;p.note=text(s.title);
 p.actors=p.actors.filter(a=>!a.flex||!a.flex.every(id=>FAN_IDS.includes(id))).map(a=>a.flex?{...a,flex:a.flex.filter(id=>!FAN_IDS.includes(id)),fromStates:Object.fromEntries(Object.entries(a.fromStates||{}).filter(([id])=>!FAN_IDS.includes(id)))}:a).filter(a=>!a.flex||a.flex.length);
 for(const id of FAN_IDS)delete spec.flexStates[id];
 p.solidRefs=[...new Set([...p.solidRefs.filter(r=>!FAN_IDS.includes(r)&&r!=='cfSockets'),...s.refs,71,'ctTempSocket','ctThermistorAssembly','ctOldGridTie','ctNewGridTie'])];
 const pose=(refs,offset)=>p.workpiecePoses.push({refs,offset,pivot:[0,0,0],rotation:[0,0,0]});
 const free=(remove,label)=>({flex:['ctProbeHandling'],fromStates:{ctProbeHandling:remove?0:1},to:remove?1:0,label,showBefore:true,focusMotion:true,focusBounds:[-20,-65,390,185,110,505],focusPadding:10,focusMinDistance:130,guideTube:.25,guideRadius:2});
 const tie=(id,from,to,label)=>({flex:[id],fromStates:{[id]:from},to,label,showBefore:from!==0,focusMotion:true,focusBounds:[75,30,410,125,85,470],focusPadding:8,focusMinDistance:120,guideRadius:2,guideTube:.25});
 // The original grid tie is represented by its complete cut/replacement
 // reference during bench work; all other original native parts remain.
 if(index>=11){spec.hidden.push('thermistor');}
 if(index<11||index>=13)spec.hidden.push('ctOldGridTie');
 if(index<13)spec.hidden.push('ctNewGridTie');
 spec.flexStates.ctOldGridTie=index<=11?1:0;
 spec.flexStates.ctNewGridTie=index<=13?0:3;
 if(index>=11&&index<=13)pose([71,'thermistor'],BENCH);
 if(index>=11&&index<=13)pose(['ctOldGridTie','ctNewGridTie'],BENCH);
 // At the grid-placement actor's start the whole assembly is still on the
 // bench. Rigid auxiliary ties do not own the grid's live routing clock.
 if(index===14)pose(['ctOldGridTie','ctNewGridTie'],BENCH);
 if(index===11){
  spec.flexStates.cfTemp=0;p.actors=[tie('ctOldGridTie',1,0,text(['古いバンドを切って離す','Cut and remove the old tie','Přestřihnout a odstranit starou pásku','Alten Binder durchtrennen und entfernen'])),free(true,text(['センサーを穴へ押し戻して抜き、古い部品を離す','Push the probe back through the openings and put the old part aside','Protlačit sondu otvory zpět a odložit starý díl','Sonde durch die Öffnungen zurückschieben und Altteil ablegen']))];
 }
 if(index>=11&&index<=13){p.chamberProbeHandling=true;spec.flexStates.ctProbeHandling=index===11?0:1;}
 if(index===12){spec.flexStates.cfTemp=0;p.actors=[];}
 if(index===13){
  spec.flexStates.cfTemp=0;p.actors=[free(false,text(['ケーブルを下から通し、金属部全体を突き出す','Thread from below; leave the whole metal probe protruding','Provléct spodem; ponechat celou kovovou sondu vyčnívat','Von unten durchführen; gesamte Metallsonde herausragen lassen'])),tie('ctNewGridTie',0,1,text(['裏側の二穴へ新しいバンドを通す','Feed a new tie through the two rear holes','Provléct novou pásku dvěma zadními otvory','Neuen Binder durch die zwei rückseitigen Löcher führen'])),tie('ctNewGridTie',1,3,text(['ロックをセンサーの反対側に置き、軽く締める','Keep the pawl opposite the probe and tighten gently','Zámek dát proti sondě a lehce utáhnout','Kopf gegenüber der Sonde halten und leicht anziehen']))];
 }
 // The sensor replacement does not require unplugging either fan. Their
 // bodies are held in position while the grid is detached (as the text says).
 if(index===14)p.actors=p.actors.filter(a=>!a.flex||a.flex.includes('cfTemp'));
 if(index>=10&&index<=15){p.camera='perspective';p.viewBounds=index>=11&&index<=13?[35,25,400,185,100,495]:[-85,145,330,85,220,425];p.viewMinDistance=150;}
 if(index===20)p.note=text(s.title);
 applyChamberThermistorView(p,index,text);
 return spec;
}
