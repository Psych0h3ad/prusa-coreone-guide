import fs from 'node:fs/promises';
import {SERVICE_TASKS} from '../dist/maintenance-data.js';
const folder=new URL('../research/quality/service-20261104-44/official/',import.meta.url);
await fs.mkdir(folder,{recursive:true});
function readFlight(html){
 const records=[];
 const flight=[...html.matchAll(/self\.__next_f\.push\((\[[\s\S]*?\])\)<\/script>/g)].map(m=>JSON.parse(m[1])[1]).filter(x=>typeof x==='string').join('');
 function walk(x){if(!x||typeof x!=='object')return;if(x.type==='guides'||x.type==='steps')records.push(x);for(const v of Object.values(x))walk(v);}
 for(const line of flight.split('\n')){const i=line.indexOf(':');let x;try{x=JSON.parse(line.slice(i+1));}catch{continue;}walk(x);}
 return records;
}
const output={};
for(const task of SERVICE_TASKS.filter(t=>['hotend','nozzle','hotendfan','printfan'].includes(t.id))){
 const response=await fetch(task.source);if(!response.ok)throw Error(`${task.id}: ${response.status}`);
 const html=await response.text(),records=readFlight(html),guideId=Number(task.source.split('_').at(-1));
 const guide=records.find(x=>x.type==='guides'&&x.id===guideId);
 if(!guide)throw Error(`Missing guide ${task.id}`);
 const steps=[...new Map(records.filter(x=>x.type==='steps'&&x.parent===guideId&&x.lines).map(x=>[x.id,x])).values()].sort((a,b)=>a.order-b.order);
 if(steps.length!==task.steps.length)throw Error(`${task.id}: ${steps.length} official / ${task.steps.length} local`);
 await fs.writeFile(new URL(`${task.id}.json`,folder),JSON.stringify({url:task.source,guide,steps},null,2));
 const translations={};
 for(const lang of ['en','cs','de','ja']){const tr=guide.translations_info?.[lang];if(tr?.translated&&tr.slug)translations[lang]=`https://help.prusa3d.com/${lang==='en'?'':lang+'/'}guide/${tr.slug}`;}
 output[task.id]={url:task.source,updated:guide.updated,translations,steps:steps.map(s=>({id:s.id,number:s.order+2,title:s.title,images:(s.media?.gallery||[]).map(g=>({url:g.medium||g.large||g.original,full:g.original}))}))};
 console.log(`${task.id}: ${steps.length} official steps verified`);
}
await fs.writeFile(new URL('../dist/maintenance-sources.js',import.meta.url),'// Official Prusa step identifiers and photo references.\nexport const MAINTENANCE_SOURCES='+JSON.stringify(output,null,2)+';\n');
