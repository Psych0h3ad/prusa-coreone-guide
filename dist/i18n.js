export const LANGUAGES={ja:'日本語',en:'English',cs:'Čeština',de:'Deutsch'};
const storageKey='prusa-assembly-lab-language';
let language='ja',messages={},patterns=[],binding,original,request=0;
const manuals=new Map();
const textMemory=new WeakMap(),attributeMemory=new WeakMap();
export const currentLanguage=()=>language;
export const languageLoadError=(code=language)=>({ja:'言語データを読み込めませんでした。接続を確認し、もう一度お試しください。',en:'Language files could not load. Check your connection and try again.',cs:'Jazykové soubory se nepodařilo načíst. Zkontrolujte připojení a zkuste to znovu.',de:'Sprachdateien konnten nicht geladen werden. Prüfen Sie Ihre Verbindung und versuchen Sie es erneut.'}[code]||'Language files could not load. Check your connection and try again.');
const japanese=s=>/[\u3040-\u30ff\u3400-\u9fff]/u.test(s);
export const untranslated=new Set();
const escapeRegExp=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
function compilePatterns(){
 patterns=Object.entries(messages).filter(([s])=>/\{\w+\}/.test(s)).sort((a,b)=>b[0].length-a[0].length).map(([source,values])=>{
  const names=[],parts=source.split(/(\{\w+\})/g),expression=parts.map(p=>/^\{\w+\}$/.test(p)?(names.push(p.slice(1,-1)),'(.+?)'):escapeRegExp(p)).join('');
  return {source,values,names,re:new RegExp('^'+expression+'$','u')};
 });
}
export function t(value){
 const source=String(value??'');if(language==='ja'||!source.trim())return source;
 const i={en:0,cs:1,de:2}[language],trimmed=source.trim();let translated=messages[trimmed]?.[i];
 if(translated===undefined)for(const p of patterns){const m=p.re.exec(trimmed);if(!m)continue;const variables=Object.fromEntries(p.names.map((name,k)=>[name,m[k+1]]));translated=p.values[i].replace(/\{(\w+)\}/g,(_,key)=>variables[key]===trimmed?variables[key]:t(variables[key]??''));break;}
 if(translated===undefined){if(japanese(trimmed))untranslated.add(trimmed);return source;}
 return source.slice(0,source.indexOf(trimmed))+translated+source.slice(source.indexOf(trimmed)+trimmed.length);
}
export function translateDOM(root=document.body){
 if(!root)return;
 root.normalize?.();
 const visit=node=>{
  if(node.nodeType===3){const now=node.nodeValue,prior=textMemory.get(node),source=prior&&prior.last===now?prior.source:now,last=t(source);if(now!==last)node.nodeValue=last;textMemory.set(node,{source,last});return;}
  if(node.nodeType!==1||['SCRIPT','STYLE','CODE','PRE'].includes(node.tagName)||node.hasAttribute('data-no-translate'))return;
  let memo=attributeMemory.get(node);if(!memo){memo={};attributeMemory.set(node,memo);}
  for(const name of ['aria-label','title','placeholder','alt',...(node.tagName==='META'?['content']:[])])if(node.hasAttribute(name)){const now=node.getAttribute(name),prior=memo[name],source=prior&&prior.last===now?prior.source:now,last=t(source);if(now!==last)node.setAttribute(name,last);memo[name]={source,last};}
  for(const child of node.childNodes)visit(child);
 };
 visit(root);
}
export function localizePartMetadata(){
 if(!binding)return;
 for(const [id,p]of Object.entries(binding.parts)){
  // Geometry modules may register a part after the initial page snapshot.
  // Retain its authored text once so later language changes start there.
  const source=original.parts[id]??=(Object.fromEntries(['name','desc'].filter(key=>p[key]!==undefined).map(key=>[key,p[key]])));
  for(const key of ['name','desc'])if(source[key]!==undefined)p[key]=t(source[key]);
 }
}
function applyData(pack){
 const {flows,parts,plan}=binding;
 for(const [flow,f]of Object.entries(flows)){
  const base=original.flows[flow];for(const key of ['title','guide'])if(base[key])f[key]=t(base[key]);
  f.chapters=pack?.[flow].chapters.slice()||base.chapters.slice();
  f.steps.forEach((step,i)=>{
   const source=base.steps[i],localized=pack?.[flow].steps[String(source.officialId)];
   for(const key of ['title','description','tip','action'])if(source[key]!==undefined)step[key]=key==='title'&&localized?localized.title:t(source[key]);
   for(const key of ['tools','checks'])if(source[key])step[key]=source[key].map(t);
   if(source.supplies)step.supplies=localized?localized.supplies.slice():source.supplies.slice();
   step.source=source.source;
   if(localized){step.title=localized.title;step.source=localized.source;}
  });
 }
 localizePartMetadata();
 for(const [flow,scenes]of Object.entries(plan))for(const [id,scene]of Object.entries(scenes)){
  const source=original.plan[flow][id];if(source.note!==undefined)scene.note=t(source.note);
  scene.actors.forEach((a,i)=>a.label=t(source.actors[i].label));
 }
}
export async function setLanguage(next){
 if(!LANGUAGES[next])throw Error('Unsupported language');
 if(binding?.flows.build?.manualID===2251&&next!=='ja')throw Error('Original2251 instructions currently authored in Japanese');
 const token=++request;
 let pack;
 if(next!=='ja'){
  let catalog,manual;
  const load=async path=>{const r=await fetch(path);if(!r.ok)throw Error('Language unavailable');return r.json();};
  try{[catalog,manual]=await Promise.all([
   Object.keys(messages).length?messages:load('./locales/messages.json?v=20261116-177'),
   !Object.keys(original.flows).length?{}:manuals.get(next)||load(`./locales/manual-${next}.json?v=20261111-94`)
  ]);}catch(error){if(token!==request)return false;throw error;}
  if(token!==request)return false;
  if(!catalog||typeof catalog!=='object'||!Object.keys(catalog).length||Object.values(catalog).some(v=>!Array.isArray(v)||v.length!==3||v.some(s=>typeof s!=='string'||!s.trim())))throw Error('Invalid language');
  for(const [flow,f]of Object.entries(original.flows)){
   const translated=manual?.[flow];
   if(!Array.isArray(translated?.chapters)||translated.chapters.length!==f.chapters.length||translated.chapters.some(s=>typeof s!=='string'||!s.trim())||f.steps.some(s=>{
    const step=translated.steps?.[String(s.officialId)];
    return !step||typeof step.title!=='string'||!step.title.trim()||typeof step.source!=='string'||!step.source.startsWith(`https://help.prusa3d.com/${next==='en'?'':next+'/'}guide/`)||!/^\d+$/.test(step.source.split('#')[1]||'')||!Array.isArray(step.supplies)||step.supplies.some(v=>typeof v!=='string');
   }))throw Error('Incomplete language');
  }
  messages=catalog;compilePatterns();manuals.set(next,manual);pack=manual;
 }
 if(token!==request)return false;
 language=next;untranslated.clear();applyData(pack);document.documentElement.lang=next;
 try{localStorage.setItem(storageKey,next);}catch{}
 try{const url=new URL(location.href);url.searchParams.set('lang',next);history.replaceState(null,'',url);
  for(const link of document.querySelectorAll('a[data-language-link]')){const target=new URL(link.getAttribute('href'),url);if(target.origin===url.origin){target.searchParams.set('lang',next);link.setAttribute('href',target.href);}}
 }catch{}
 for(const select of document.querySelectorAll('[data-language]'))select.value=next;
 translateDOM(document.documentElement);return true;
}
export function languageControl(){return `<label class="language-control"><span>言語</span><select data-language aria-label="言語を選択">${Object.entries(LANGUAGES).map(([code,name])=>`<option value="${code}" ${code===language?'selected':''} ${binding?.flows.build?.manualID===2251&&code!=='ja'?'disabled':''} lang="${code}" data-no-translate>${name}</option>`).join('')}</select></label>`;}
export async function initializeLocalization(refs){
 binding=refs;original=JSON.parse(JSON.stringify(refs));
 let preferred='ja';try{const value=new URL(location.href).searchParams.get('lang')||localStorage.getItem(storageKey);if(LANGUAGES[value])preferred=value;}catch{}
 if(refs.flows.build?.manualID===2251)preferred='ja';
 try{await setLanguage(preferred);}catch(error){error.requestedLanguage=preferred;throw error;}
 return language;
}
