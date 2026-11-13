import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import crypto from 'node:crypto';
// The normal menu issues M702 W2, without I. It does not ask whether unloading
// succeeded. The confirmation/manual-removal branches belong to other callers.
export function operationsFor(version){
 const dir=fileURLToPath(new URL(`../source/vendor/prusa-firmware-buddy/operations/v${version}`,import.meta.url));
 const path=version==='8.0.0'?'src__gui__screen__screen_filament_change.cpp':'src__gui__dialogs__DialogLoadUnload.cpp';
 const source=fs.readFileSync(`${dir}/${path}`,'utf8');
 const phase=(name,text,buttons=[])=>{
  if(!source.includes(`Phase::${name},`)||!source.includes(`N_("${text}")`))throw Error(`Missing upstream phase: ${version} ${name}`);
  return {name,text,buttons};
 };
 const phases=[phase('initial','Finishing buffered gcodes'),phase('Parking_stoppable','Parking',['STOP']),phase('WaitingTemp_stoppable','Waiting for temperature',['STOP']),phase('Ramming_stoppable','Ramming',['STOP']),phase('Unloading_stoppable','Unloading',['STOP']),phase('Unparking','Unparking')];
 const files=fs.readdirSync(dir).filter(p=>/\.(cpp|hpp)$/.test(p));
 return {unload:{title:'Unloading filament',phases:Object.fromEntries(phases.map(p=>[p.name,p])),layout:{title:{x:0,y:70,w:480,h:30,font:'big'},bar:{x:24,y:100,w:432,h:16,radius:4},number:{x:24,y:126,w:432,h:54,font:'big'},label:{x:2,y:180,w:476,h:47,font:'special'},buttons:{x:6,y:259,w:468,h:32},footer:{y:297,h:23}},sourceHashes:Object.fromEntries(files.map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(`${dir}/${p}`)).digest('hex')]))}};
}
