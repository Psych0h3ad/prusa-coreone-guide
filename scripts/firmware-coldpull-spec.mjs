import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import crypto from 'node:crypto';

// COREONE, stock hotend, MMU disabled, PLA already loaded. Keep the
// introduction and preparation responses in their upstream order.
export function coldPullFor(version){
 const dir=fileURLToPath(new URL(`../source/vendor/prusa-firmware-buddy/coldpull/v${version}`,import.meta.url));
 const read=p=>fs.readFileSync(`${dir}/${p.replaceAll('/','__')}`,'utf8');
 const screen=read('src/gui/screen_cold_pull.cpp'),server=read('src/marlin_stubs/M1702.cpp'),responses=read('src/common/marlin_server_types/client_response.hpp');
 const classes={prepare_filament:'PrepareFilament',deretract:'Deretract',cool_down:'CoolDown',heat_up:'HeatUp',automatic_pull:'AutomaticPull',manual_pull:'ManualPull',pull_done:'PullDone'};
 const phases={introduction:{name:'introduction',title:'',text:'Welcome to the Cold Pull wizard. Prepare a 30cm piece of PLA filament and follow the instructions. For more details, visit:',buttons:['CONTINUE','STOP'],qr:true}};
 for(const [name,cls]of Object.entries(classes)){
  const start=screen.indexOf(`class ${cls} `),end=screen.indexOf('\n    };',start),section=screen.slice(start,end);
  const texts=[...section.matchAll(/(?:const char \*\w+|const char\*\w+) = N_\(("(?:[^"\\]|\\.)*")\)/g)].map(m=>JSON.parse(m[1]));
  if(!texts.length)throw Error(`No upstream text: ${version}:${name}`);
  const responseLine=responses.split('\n').find(s=>new RegExp(`// ${name}\\b`).test(s)&&s.includes('Response::'));
  const buttons=responseLine?[...responseLine.matchAll(/Response::(\w+)/g)].map(m=>m[1].toUpperCase()):[];
  phases[name]={name,title:texts[0],text:texts[1]||'',buttons,...(['deretract','cool_down','heat_up'].includes(name)?{progress:true}:{})};
  if(name==='cool_down')phases[name].timeoutText=texts[2];
 }
 for(const [name,p]of Object.entries(phases))if(!screen.includes(`PhasesColdPull::${name}`))throw Error('Missing official frame '+name);
 const temp=key=>{const n=Number(new RegExp(`${key} \\{ (\\d+) \\}`).exec(server)?.[1]);if(!n)throw Error('Missing temperature '+key);return n;};
 const qr=JSON.parse(fs.readFileSync(new URL('../source/vendor/prusa-firmware-buddy/coldpull-qr.json',import.meta.url),'utf8'));
 const files=JSON.parse(fs.readFileSync(`${dir}/sources.json`,'utf8')).sources.filter(s=>s.file);
 for(const s of files)if(crypto.createHash('sha256').update(fs.readFileSync(`${dir}/${s.file}`)).digest('hex')!==s.sha256)throw Error('Upstream source hash mismatch: '+s.path);
 return {kind:'coldpull',title:'COLD PULL',phases,temperatures:{cold:temp('HOTEND_COLD_TEMP'),pull:temp('HOTEND_PULL_TEMP'),end:temp('HOTEND_END_TEMP')},qr,
  layout:{title:{x:0,y:70,w:480,h:32,font:'big'},bar:{x:24,y:105,w:432,h:16,radius:4},number:{x:24,y:131,w:432,h:34,font:'big'},label:{x:12,y:180,w:456,h:64,font:'special'},buttons:{x:6,y:259,w:468,h:32},intro:{x:24,y:40,w:228,h:176,font:'normal'},link:{x:24,y:216,w:432,h:22,font:'normal'},phone:{x:252,y:69},qr:{x:316,y:40,w:140,h:140}},
  sourceHashes:Object.fromEntries(files.map(s=>[s.path,s.sha256]))};
}
