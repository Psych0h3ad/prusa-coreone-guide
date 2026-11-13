import fs from 'node:fs/promises';
import crypto from 'node:crypto';
const root='research/quality/service-20261105-65';
const icons=[...['print','preheat','spool','calibrate','settings','info'].flatMap(n=>[`${n}_80x80`,`${n}_80x80_focused`,`${n}_80x80_disabled`]),'home_shape_16x16','calibrate_white_16x16','temperature_white_16x16','temperature_16x16','settings_16x16','spool_white_16x16','spool_16x16','move_16x16','nozzle_16x16','heatbed_16x16','enclosure_16x16','speed_16x16','arrow_right_10x16','fan_16x16','folder_up_16x16','switch_on_36x18','switch_off_36x18','set_ready_16x16','na_color_16x16','ok_60x60','clear_60x60','backspace_60x60','plusminus_60x60'];
const fonts=['LiberationMono-bold_11x19','11x19px_migu-1m-regular_katakana','LiberationMono-regular_9x16','9x16px_migu-1m-regular_katakana','LiberationMono-bold_13x22','13x22px_migu-1m-regular_katakana','LiberationMono-bold_30x53'];
const common=['include/guiconfig/GuiDefaults.hpp','src/gui/fonts.cpp','src/guiapi/src/i_window_menu_item.cpp','src/guiapi/include/i_window_menu.hpp','src/guiapi/include/window_menu_adv.hpp','src/guiapi/src/window_menu_bar.cpp','src/gui/screen_home.cpp','src/gui/window_header.cpp','src/gui/footer/footer_line.cpp','src/common/footer_def.hpp','src/common/hotend_type.hpp','src/gui/screen/toolhead/screen_toolhead_settings.hpp','src/gui/screen/toolhead/screen_toolhead_settings.cpp','src/gui/MItem_mmu.hpp','src/gui/MItem_mmu.cpp','src/gui/menu_item/specific/menu_items_xbuddy_extension.hpp','src/gui/menu_item/specific/menu_items_xbuddy_extension.cpp','src/gui/menu_item/specific/menu_items_chamber.hpp','src/gui/menu_item/specific/menu_items_chamber.cpp','src/gui/screen_menu_settings.cpp','src/gui/screen_menu_filament.cpp','src/guiapi/src/WindowMenuItems.cpp','src/guiapi/include/WindowMenuItems.hpp'];
common.push('src/guiapi/include/i_window_menu_item.hpp','src/guiapi/include/raster_opfn.hpp','src/guiapi/src/display_ex.cpp','src/guiapi/src/display_helper.cpp','src/guiapi/src/display_ili9488.cpp','src/common/utils/color.hpp');
common.push('src/guiapi/src/ili9488.cpp','src/gui/qoi_decoder.cpp','src/gui/qoi_decoder.hpp');
for(const version of ['8.0.0','6.5.7']){
 const dir=`${root}/display-v${version}`;await fs.mkdir(dir,{recursive:true});const manifest=[];
 const previous=JSON.parse(await fs.readFile(`${dir}/sources.json`,'utf8').catch(()=>'{}')).sources||[];
 const extra=['ProjectOptions.cmake','src/guiapi/include/color_scheme.hpp','src/guiapi/include/numeric_input_config.hpp','src/guiapi/src/numeric_input_config.cpp','src/guiapi/include/guitypes.hpp','include/common/printer_model_data.hpp','include/common/extended_printer_type.hpp','src/gui/numeric_input_config_common.cpp','include/marlin/Configuration_COREONE.h','src/gui/MItem_hardware.hpp','src/gui/MItem_hardware.cpp','src/gui/MItem_crash.hpp','src/gui/MItem_crash.cpp','src/gui/menu_item/specific/menu_items_auto_retract.hpp','src/gui/menu_item/specific/menu_items_auto_retract.cpp','src/gui/screen/filament/screen_filaments_loaded.hpp','src/gui/screen/filament/screen_filaments_loaded.cpp','src/gui/screen/openprinttag/screen_opt_settings.hpp','src/gui/screen/openprinttag/screen_opt_settings.cpp','src/gui/dialogs/dialog_numeric_input.cpp','src/gui/dialogs/dialog_numeric_input.hpp'];
 const fontPaths=version==='8.0.0'?['src/module/gui/font_data/font.py',...fonts.map(n=>`src/module/gui/font_data/png/${n}.png`)]:['utils/translations_and_fonts/font.py','src/guiapi/include/fnt-full-indices.ipp','src/guiapi/include/fnt-digits-indices.ipp','src/common/utils/font_character_sets.hpp',...['bold_11x19_full','regular_9x16_full','bold_13x22_full','bold_30x53_digits'].flatMap(n=>[`src/gui/res/fnt_png/font_${n}.png`,`src/gui/res/cc/font_${n}.hpp`])];
 const paths=[...common,...extra,...icons.map(n=>`src/gui/res/png/${n}.png`),...fontPaths];
 for(let n=0;n<paths.length;n+=4){
  const settled=await Promise.allSettled(paths.slice(n,n+4).map(async p=>{
   const url=`https://raw.githubusercontent.com/prusa3d/Prusa-Firmware-Buddy/v${version}/${p}`;
   const known=previous.find(s=>s.path===p&&s.url===url&&s.file);
   if(known){const cached=await fs.readFile(`${dir}/${known.file}`).catch(()=>null);if(cached&&crypto.createHash('sha256').update(cached).digest('hex')===known.sha256)return known;}
   const r=await fetch(url);
   // A few source files were reorganized between versions. Record absence.
   if(r.status===404)return {path:p,url,status:404};
   if(!r.ok)throw Error(`${p}: ${r.status}`);
   const bytes=Buffer.from(await r.arrayBuffer()),file=p.replaceAll('/','__');await fs.writeFile(`${dir}/${file}`,bytes);
   return {path:p,url,file,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')};
  }));for(const s of settled){if(s.status==='rejected')throw s.reason;manifest.push(s.value);}
 }
 await fs.writeFile(`${dir}/sources.json`,JSON.stringify({version,sources:manifest},null,2)+'\n');
 console.log(`${version}: ${manifest.filter(s=>s.file).length} retained; missing: ${manifest.filter(s=>!s.file).map(s=>s.path).join(', ')}`);
}
const licenses=[
 {file:'Liberation-OFL.txt',url:'https://raw.githubusercontent.com/liberationfonts/liberation-fonts/main/LICENSE'},
 {file:'IPA-Font-License.txt',url:'https://itouhiro.github.io/mixfont-mplus-ipa/migmix/IPA_Font_License_Agreement_v1.0.txt'},
];
await fs.mkdir(`${root}/font-licenses`,{recursive:true});
for(const item of licenses){
 const response=await fetch(item.url);if(!response.ok)throw Error(`Font license: ${response.status}`);
 const bytes=Buffer.from(await response.arrayBuffer());await fs.writeFile(`${root}/font-licenses/${item.file}`,bytes);
 item.bytes=bytes.length;item.sha256=crypto.createHash('sha256').update(bytes).digest('hex');
}
await fs.writeFile(`${root}/font-licenses/sources.json`,JSON.stringify(licenses,null,2)+'\n');
