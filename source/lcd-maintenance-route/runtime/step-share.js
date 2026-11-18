const languages=new Set(['ja','en','cs','de']),views=new Set(['guide','model']),variants=new Set(['screw','glued']);
export const STEP_SHARE_MESSAGES={
 '共有リンクで表示中':['Viewing a shared link','Zobrazení sdíleného odkazu','Geteilter Link wird angezeigt'],
 '指定された手順が見つかりませんでした。工程一覧から選択してください。':['This step was not found. Choose a step from the list.','Tento krok nebyl nalezen. Vyberte krok ze seznamu.','Dieser Schritt wurde nicht gefunden. Bitte einen Schritt aus der Liste wählen.'],
 '指定の小ステップは変更されています。手順の最初を表示します。':['This action has changed. Showing the start of the step.','Tato dílčí operace se změnila. Zobrazuje se začátek kroku.','Dieser Einzelschritt wurde geändert. Der Anfang des Schritts wird angezeigt.']
};
const value=(p,k)=>typeof p?.get==='function'?p.get(k):p?.[k];
const present=(p,k)=>value(p,k)!==undefined&&value(p,k)!==null;
const repeated=(p,keys)=>typeof p?.getAll==='function'&&keys.some(k=>p.getAll(k).length>1);
const unsigned=(v,max)=>/^(0|[1-9]\d*)$/.test(String(v))&&Number.isSafeInteger(Number(v))&&Number(v)<=max?Number(v):null;
const ids=a=>(a||[]).map(v=>`${typeof v}:${v}`).sort();
function actionSignature(a){return JSON.stringify([ids(a.refs),ids(a.flex),a.scope??'',a.from??null,a.fromStates?Object.keys(a.fromStates).sort().map(k=>[k,a.fromStates[k]]):null,a.to??null,!!a.remove,a.destination??'',!!a.inspection,!!a.handling,!!a.reuse,a.spin?'spin':a.turn?'turn':a.posePath?'pose':a.rigidPose?'rigid':'move',a.zMotorRodCheck??a.gen2ZRodCheck??null,a.cableApproach??null]);}
function hash(s){let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);return(h>>>0).toString(16).padStart(8,'0');}
// Labels, language, timing and camera coordinates do not identify an operation.
// Repeated operations on the same physical item retain an occurrence suffix.
export function operationKeys(actors=[]){const counts=new Map();return actors.map(a=>{const key=hash(actionSignature(a)),n=(counts.get(key)||0)+1;counts.set(key,n);return key+'.'+n;});}
export function operationAnchor(actors,index,fraction=0){if(!Number.isInteger(index)||index<0||index>=actors.length)return null;return{action:operationKeys(actors)[index],op:index+1,at:Math.round(Math.max(0,Math.min(1,Number.isFinite(fraction)?fraction:0))*1000)};}
export function resolveShareOperation(params,actors=[]){
 if(repeated(params,['action','op','at']))return null;
 const action=value(params,'action'),op=value(params,'op');let index=-1;
 if(present(params,'action')){
  if(!/^[a-f0-9]{8}\.[1-9]\d{0,3}$/.test(String(action)))return null;
  index=operationKeys(actors).indexOf(String(action));if(index<0)return null;
 }else{const n=unsigned(op,actors.length);if(n===null||n<1)return null;index=n-1;}
 const at=unsigned(value(params,'at'),1000);if(present(params,'at')&&at===null)return null;return{index,fraction:(at??0)/1000};
}
export function shareOperationPosition(index,fraction,count){
 if(!Number.isInteger(count)||count<1||!Number.isInteger(index)||index<0||index>=count||!Number.isFinite(fraction)||fraction<0||fraction>1)throw Error('Invalid shared operation position');
 const position=(index+fraction)/count;
 // Internal timeline boundaries select the following action. Keep endpoints
 // inside their requested action despite division/multiplication rounding.
 if(fraction===1&&index<count-1)return Math.max(0,position-Number.EPSILON);
 if(fraction===0&&index>0)return Math.min(1,position+Number.EPSILON);
 return position;
}
function baseURL(href,route,{keepOrigin=false}={}){
 const prior=new URL(href);if(!['http:','https:'].includes(prior.protocol))throw Error('HTTP guide URL required');
 const root=!keepOrigin&&prior.hostname==='prusa-assembly-lab.psych0h3ad.chatgpt.site'?new URL('https://psych0h3ad.github.io/prusa-coreone-guide/'):new URL('./',prior);
 const out=new URL(route,root);out.username='';out.password='';out.search='';out.hash='';return out;
}
function commonParams(url,context){
 url.searchParams.set('view',views.has(context.view)?context.view:'guide');url.searchParams.set('lang',languages.has(context.lang)?context.lang:'ja');
 const op=unsigned(context.op,10000),at=unsigned(context.at,1000),hasAction=present(context,'action');
 if(hasAction&&!/^[a-f0-9]{8}\.[1-9]\d{0,3}$/.test(context.action)||present(context,'op')&&(op===null||op<1)||present(context,'at')&&at===null)return url;
 if(hasAction)url.searchParams.set('action',context.action);if(op!==null&&op>0)url.searchParams.set('op',String(op));if(at!==null&&(url.searchParams.has('action')||url.searchParams.has('op')))url.searchParams.set('at',String(at));
 return url;
}
export function buildAssemblyStepURL(href,context){
 const flow=context.flow==='upgrade'?'upgrade':'build',route=context.gen2?'gen2.html':flow==='build'&&context.original?'original.html':'index.html';
 if(context.gen2&&!context.gen2Public&&new URL(href).hostname==='psych0h3ad.github.io')throw Error('Gen2 is not publicly available');
 const url=baseURL(href,route,{keepOrigin:!!context.gen2&&!context.gen2Public}),step=unsigned(context.stepID,Number.MAX_SAFE_INTEGER);if(!step)throw Error('Official source step ID required');
 url.searchParams.set('flow',flow);url.searchParams.set('step',String(step));if(variants.has(context.variant))url.searchParams.set('variant',context.variant);
 if(context.comparison==='before')url.searchParams.set('compare','before');if(context.explore)url.searchParams.set('explore','1');return commonParams(url,context).href;
}
export function buildMaintenanceStepURL(href,context){
 if(!/^[a-z][a-z0-9-]{0,99}$/.test(context.task||''))throw Error('Maintenance task required');const step=unsigned(context.step,10000);if(!step)throw Error('Maintenance step required');const url=baseURL(href,'maintenance.html');url.searchParams.set('task',context.task);url.searchParams.set('step',String(step));
 if(context.sid&&/^[a-zA-Z0-9_.:-]{1,120}$/.test(context.sid))url.searchParams.set('sid',context.sid);if(context.symptom&&/^[a-z][a-z0-9-]{0,99}$/.test(context.symptom))url.searchParams.set('symptom',context.symptom);if(context.task==='belts'&&step===4&&['tighten','loosen'].includes(context.beltDirection))url.searchParams.set('beltDirection',context.beltDirection);return commonParams(url,context).href;
}
export function readAssemblyStepLink(href,flows,{defaultFlow='build'}={}){
 const p=new URL(href).searchParams,requested=p.has('step'),explicit=p.get('flow');let flow=Object.hasOwn(flows,explicit)?explicit:Object.hasOwn(flows,defaultFlow)?defaultFlow:'build';const id=unsigned(p.get('step'),Number.MAX_SAFE_INTEGER);let index=-1;
 const invalidInput=repeated(p,['flow','step','variant','view','lang','compare','explore','action','op','at'])||p.has('flow')&&!Object.hasOwn(flows,explicit)||flows.build?.manualID===2251&&explicit==='upgrade';
 if(id&&!invalidInput){const matches=Object.entries(flows).filter(([f])=>!p.has('flow')||f===explicit).flatMap(([f,data])=>data.steps.map((s,i)=>s.officialId===id?{flow:f,index:i}:null).filter(Boolean));if(matches.length===1)({flow,index}=matches[0]);}
 const step=index>=0?flows[flow].steps[index]:undefined;
 const variant=flows.build?.manualID===2251?'glued':step?.variant??(variants.has(p.get('variant'))?p.get('variant'):undefined);
 return{requested,valid:!!step,invalid:requested&&!step,flow,index,stepID:step?.officialId,variant,view:views.has(p.get('view'))?p.get('view'):undefined,comparison:p.get('compare')==='before'?'before':'after',explore:p.get('explore')==='1',action:p.get('action'),op:p.get('op'),at:p.get('at')};
}
export function applyAssemblyStepLink(state,target){
 if(!target?.valid)return state;
 const out={...state,flow:target.flow,[target.flow]:{...state[target.flow],index:target.index}};
 if(variants.has(target.variant))out.build={...out.build,variant:target.variant};return out;
}
