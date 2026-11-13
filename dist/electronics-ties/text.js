import {initializeLocalization as initializeBase,setLanguage as setBase,currentLanguage} from '../i18n.js?v=20261112-113';
export * from '../i18n.js?v=20261112-113';
const labels={"位置4：先端を頭の穴へ通す": ["Position 4: pass the tip through the locking head", "Pozice 4: protáhněte konec hlavou pásky", "Position 4: Spitze durch den Verschluss führen"], "位置4：配線を挟まずに1本ずつ締める": ["Position 4: tighten this tie without pinching the wires", "Pozice 4: utáhněte tuto pásku bez přiskřípnutí vodičů", "Position 4: diesen Kabelbinder festziehen, ohne Leitungen einzuklemmen"], "位置4：余りを切り、切れ端を離す": ["Position 4: trim the excess and remove the offcut", "Pozice 4: odstřihněte přesah a odstraňte odstřižek", "Position 4: Überstand abschneiden und Abschnitt entfernen"]};
let actors;
function project(){if(!actors)return;const code=currentLanguage(),index={en:0,cs:1,de:2}[code];actors.forEach(([actor,source])=>{actor.label=code==='ja'?source:labels[source][index];});}
export async function initializeLocalization(refs){actors=refs.plan?.build?.[995519]?.actors.filter(a=>a.box4CloseAction).map(a=>[a,a.label]);try{return await initializeBase(refs);}finally{project();}}
export async function setLanguage(code){const result=await setBase(code);if(result)project();return result;}
