import{initializeLocalization as initializeBase,setLanguage as setBase,currentLanguage}from'../electronics-ties/text.js?v=20261112-113';
import{STEP349_LABELS}from'./sequence/labels.js';
export*from'../electronics-ties/text.js?v=20261112-113';
let actors=[];
function project(){const lang=currentLanguage(),i={en:0,cs:1,de:2}[lang];for(const[actor,key]of actors)actor.label=lang==='ja'?key:STEP349_LABELS[key][i];}
export async function initializeLocalization(refs){actors=(refs.plan?.build?.[986647]?.actors||[]).filter(a=>STEP349_LABELS[a.label]).map(a=>[a,a.label]);try{return await initializeBase(refs);}finally{project();}}
export async function setLanguage(lang){const result=await setBase(lang);if(result)project();return result;}
