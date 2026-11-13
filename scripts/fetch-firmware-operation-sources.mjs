import fs from 'node:fs/promises';
import crypto from 'node:crypto';
const root='research/quality/service-20261105-66';
const common=['src/common/fsm_loadunload_type.hpp','src/common/fsm_preheat_type.hpp','src/gui/MItem_filament.cpp','src/gui/screen/screen_preheat.cpp','src/gui/screen/screen_preheat.hpp','src/gui/window_header.cpp','src/gui/radio_button.cpp','src/gui/radio_button.hpp','src/common/client_response_texts.cpp','src/common/client_response_texts.hpp'];
common.push('include/guiconfig/wizard_config.hpp','include/common/fsm_base_types.hpp','src/gui/dialogs/i_radio_button.cpp','src/gui/dialogs/i_radio_button.hpp','src/gui/dialogs/radio_button.hpp','src/gui/dialogs/radio_button_fsm.hpp','src/gui/footer/footer_item_fsensor.cpp','src/gui/footer/footer_item_fsensor.hpp','src/marlin_stubs/pause/M701_2.cpp','src/marlin_stubs/pause/pause.cpp');
common.push('src/marlin_stubs/pause/M701_2_parse.cpp','src/marlin_stubs/pause/M70X.hpp','src/marlin_stubs/pause/M70X_preheat.cpp','src/common/filament_presets.cpp');
common.push('src/gui/screen_fsm.hpp','src/gui/screen_fsm.cpp','src/common/filament.cpp','src/common/filament.hpp','src/gui/res/png/filament_sensor_17x16.png','src/gui/res/png/side_filament_sensor_17x16.png');
common.push('src/marlin_stubs/include/pause_stubbed.hpp');
for(const version of ['8.0.0','6.5.7']){
 const dir=`${root}/v${version}`;await fs.mkdir(dir,{recursive:true});
 const paths=[...common,...(version==='8.0.0'?['src/gui/screen/screen_filament_change.cpp','src/gui/screen/screen_filament_change.hpp','src/common/marlin_server_types/fsm/filament_change_phases.cpp','src/common/marlin_server_types/fsm/filament_change_phases.hpp']:['src/gui/dialogs/DialogLoadUnload.cpp','src/gui/dialogs/DialogLoadUnload.hpp','src/common/marlin_server_types.hpp'])];
 const old=JSON.parse(await fs.readFile(`${dir}/sources.json`,'utf8').catch(()=>'{}')).sources||[],sources=[];
 for(let i=0;i<paths.length;i+=4){
  const results=await Promise.allSettled(paths.slice(i,i+4).map(async path=>{
   const url=`https://raw.githubusercontent.com/prusa3d/Prusa-Firmware-Buddy/v${version}/${path}`,file=path.replaceAll('/','__'),prior=old.find(s=>s.path===path&&s.file);
   if(prior){const bytes=await fs.readFile(`${dir}/${file}`).catch(()=>null);if(bytes&&crypto.createHash('sha256').update(bytes).digest('hex')===prior.sha256)return prior;}
   const r=await fetch(url);if(r.status===404)return {path,url,status:404};if(!r.ok)throw Error(`${r.status} ${url}`);
   const bytes=Buffer.from(await r.arrayBuffer());await fs.writeFile(`${dir}/${file}`,bytes);
   return {path,url,file,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')};
  }));for(const r of results){if(r.status==='rejected')throw r.reason;sources.push(r.value);}
 }
 await fs.writeFile(`${dir}/sources.json`,JSON.stringify({version,sources},null,2)+'\n');
 console.log(`${version}: ${sources.filter(s=>s.file).length} files; ${sources.filter(s=>!s.file).map(s=>s.path).join(', ')}`);
}
