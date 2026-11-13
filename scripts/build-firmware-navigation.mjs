// Read the retained, versioned official sources; no printer connection.
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import crypto from 'node:crypto';
import {menusFor} from './firmware-menu-spec.mjs';
import {operationsFor} from './firmware-operation-spec.mjs';
import {coldPullFor} from './firmware-coldpull-spec.mjs';
const root=fileURLToPath(new URL('../source/vendor/prusa-firmware-buddy/navigation',import.meta.url));
function po(file){
 const map={};
 for(const block of fs.readFileSync(file,'utf8').replace(/\r/g,'').split(/\n\s*\n/)){
  if(/^#,.*fuzzy/m.test(block))continue;
  let field='',id='',value='';
  for(const line of block.split('\n')){
   const start=/^(msgid|msgstr) (".*")$/.exec(line);
   if(start){field=start[1];if(field==='msgid')id=JSON.parse(start[2]);else value=JSON.parse(start[2]);}
   else if(line.startsWith('"')){if(field==='msgid')id+=JSON.parse(line);if(field==='msgstr')value+=JSON.parse(line);}
  }
  if(id&&value)map[id]=value;
 }
 return map;
}
const keys=['Print','Preheat','Filament','Control','Settings','Info','Return','Unload Filament','Cooldown','Move Axis','Move X','Move Y','Move Z','Move E','Temperature','Temperature & Fans','Nozzle','Nozzle Temperature','Heatbed','Auto Home','Disable Motors','Cold Pull','Hardware','Printhead','Nozzle Diameter','Nozzle Hardened','Nozzle High-flow','Nextruder Silicone Sock','Hotend Type','Calibrations & Tests','Fan Test','Belt Tuning','Manual Belt Tuning','Selftest','Door Sensor','Heater Test','X Axis Test','Y Axis Test','Z Alignment Calibration','Gearbox Alignment','Filament Sensor Calibration','Homing Calibration','Loadcell Test','Z Axis Test'];
const versions={};
for(const version of ['8.0.0','6.5.7']){
 const dir=root+'/v'+version;
 const translations=Object.fromEntries(['ja','cs','de'].map(lang=>[lang,po(`${dir}/Prusa-Firmware-Buddy_${lang}.po`)]));
 const menus=menusFor(version);
 const operations={...operationsFor(version),coldpull:coldPullFor(version)};
 const allKeys=[...new Set([...keys,...Object.values(menus).flatMap(m=>[m.title,...m.items.flatMap(r=>[r.key,...(typeof r.value==='string'?[r.value]:[])])]),...Object.values(operations).flatMap(o=>[o.title,...Object.values(o.phases).flatMap(p=>[p.title||'',p.text,p.timeoutText||'',...p.buttons])]),'No USB','Auto','Low temp','Off','On','ON ','OFF '])].filter(Boolean);
 const labels=Object.fromEntries(allKeys.map(key=>[key,Object.fromEntries(['en','ja','cs','de'].map(lang=>[lang,lang==='en'?key:translations[lang][key]||translations[lang]['%d '+key]?.replace(/^%d\s*/, '')||key]))]));
 const modern=version==='8.0.0';
 const temperature=modern?'Temperature & Fans':'Temperature';
 const paths={unload:['Filament','Unload Filament'],cooldown:['Control',temperature,'Cooldown'],moveZ:['Control','Move Axis','Move Z'],home:['Control','Auto Home'],disable:['Control','Disable Motors'],heat:['Control',temperature,'Nozzle Temperature'],coldpull:['Control','Cold Pull'],printhead:modern?['Settings','Printhead']:['Settings','Hardware','Printhead'],fans:['Control','Calibrations & Tests','Fan Test'],selftest:['Control','Calibrations & Tests'],belts:modern?['Control','Calibrations & Tests','Belt Tuning']:['Settings','Manual Belt Tuning']};
 const files=fs.readdirSync(dir).filter(p=>/\.(cpp|hpp|h|po)$/.test(p));
 versions[version]={source:`https://github.com/prusa3d/Prusa-Firmware-Buddy/tree/v${version}`,labels,paths,menus,operations,sourceHashes:Object.fromEntries(files.map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(`${dir}/${p}`)).digest('hex')]))};
}
fs.writeFileSync('dist/firmware-ui-data.js','// Menu labels and translations: Prusa-Firmware-Buddy, GPL-3.0.\n// Browser navigation is an independent guide, not the firmware runtime.\nexport const FIRMWARE_UI='+JSON.stringify({printer:'CORE One / CORE One+',defaultVersion:'8.0.0',versions},null,2)+';\n');
console.log('Built official firmware navigation: 8.0.0 / 6.5.7, 4 languages, 11 routes each.');
