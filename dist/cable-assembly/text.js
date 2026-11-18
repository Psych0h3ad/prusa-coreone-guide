import{initializeLocalization as initializeBase,setLanguage as setBase,currentLanguage}from'../electronics-ties/text.js?v=20261112-113';
import{STEP349_LABELS}from'./sequence/labels.js';
import{LINEAR_RAIL_LABELS}from'../linear-rail-labels.js';
import{FE_SOURCE_GUIDE_LABELS}from'../fe-guide-sourcecarry-words.js';
const labels={...STEP349_LABELS,...LINEAR_RAIL_LABELS,...FE_SOURCE_GUIDE_LABELS};
export*from'../electronics-ties/text.js?v=20261112-113';
let actors=[],notes=[];
function project(){const lang=currentLanguage(),i={en:0,cs:1,de:2}[lang];for(const[actor,key]of actors)actor.label=lang==='ja'?key:labels[key][i];for(const[plan,key]of notes)plan.note=lang==='ja'?key:labels[key][i];}
export async function initializeLocalization(refs){const plans=Object.values(refs.plan?.build||{});actors=plans.flatMap(p=>p.actors||[]).filter(a=>labels[a.label]).map(a=>[a,a.label]);notes=plans.filter(p=>labels[p.note]).map(p=>[p,p.note]);try{return await initializeBase(refs);}finally{project();}}
export async function setLanguage(lang){const result=await setBase(lang);if(result)project();return result;}
