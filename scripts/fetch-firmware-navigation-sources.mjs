import fs from 'node:fs/promises';
const root='research/quality/service-20261105-64/firmware';
const shared=['src/gui/screen_home.cpp','src/gui/screen_menu_control.hpp','src/gui/screen_menu_control.cpp','src/gui/screen_menu_settings.hpp','src/gui/screen_menu_settings.cpp','src/gui/screen_menu_hardware.hpp','src/gui/screen_menu_hardware.cpp','src/gui/screen_menu_move.hpp','src/gui/screen_menu_move.cpp','src/gui/screen_menu_filament.hpp','src/gui/screen_menu_filament.cpp','src/gui/MItem_menus.hpp','src/gui/MItem_menus.cpp','src/gui/MItem_tools.hpp','src/gui/MItem_tools.cpp','src/gui/MItem_print.hpp','src/gui/MItem_print.cpp','src/gui/MItem_filament.hpp','src/gui/MItem_filament.cpp','src/gui/menu_vars.h','src/gui/include_COREONE/selftest_snake_config.hpp','src/gui/include_COREONE/selftest_snake_config.cpp','src/gui/screen_menu_selftest_snake.hpp','src/gui/screen_menu_selftest_snake.cpp','src/gui/screen/toolhead/screen_toolhead_settings.cpp','LICENSE.md',...['ja','cs','de'].map(l=>`src/lang/po/${l}/Prusa-Firmware-Buddy_${l}.po`)];
for(const version of ['8.0.0','6.5.7']){
 const dir=`${root}/v${version}`;await fs.mkdir(dir,{recursive:true});
 const release=await(await fetch(`https://api.github.com/repos/prusa3d/Prusa-Firmware-Buddy/releases/tags/v${version}`)).json();
 if(!release.assets?.some(a=>/COREONE(?!L|.*INDX)/i.test(a.name)))throw Error(`No non-INDX CORE One release asset for ${version}`);
 const extra=version==='8.0.0'?['src/gui/screen_menu_temperature_and_fans.hpp','src/gui/screen_menu_temperature_and_fans.cpp','src/gui/selftest_action_helpers.hpp','src/gui/selftest_action_helpers.cpp']:['src/gui/screen_menu_temperature.hpp','src/gui/include_COREONE/selftest_snake_submenus.hpp'];
 const sources=[];
 // Four bounded public-source reads at a time, with no firmware binaries.
 const paths=[...shared,...extra];
 for(let n=0;n<paths.length;n+=4){const results=await Promise.allSettled(paths.slice(n,n+4).map(async path=>{
  const url=`https://raw.githubusercontent.com/prusa3d/Prusa-Firmware-Buddy/v${version}/${path}`,r=await fetch(url);if(!r.ok)throw Error(`${version} ${path}: ${r.status}`);
  const file=path.split('/').at(-1);await fs.writeFile(`${dir}/${file}`,await r.text());return {path,file,url};
 }));for(const r of results){if(r.status==='rejected')throw r.reason;sources.push(r.value);}}
 await fs.writeFile(`${dir}/sources.json`,JSON.stringify({version,release:{url:release.html_url,title:release.name,published:release.published_at,coreAssets:release.assets.filter(a=>/COREONE/i.test(a.name)).map(a=>a.name)},sources},null,2));
 console.log(`${version}: ${sources.length} official source files; CORE One release asset verified.`);
}
