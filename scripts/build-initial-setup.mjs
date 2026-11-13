// Reuse the retained official first-run chapter and its translations.
import fs from 'node:fs';
const languages=['ja','en','cs','de'];
// Source-keyed working explanations complete partial upstream translations.
const guidance=JSON.parse(fs.readFileSync('scripts/initial-setup-guidance.json'));
const guides=Object.fromEntries(languages.map(lang=>[lang,JSON.parse(fs.readFileSync(lang==='en'?'research/manual-9-calibration-first-run_982308.json':`research/i18n/${lang}-9-calibration-first-run_982308.json`))]));
const plain=s=>s.replace(/<br\s*\/?\s*>/gi,'\n').replace(/<[^>]*>/g,'').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#0?39;/g,"'").trim();
const titles=[
 'ベルトの張りを確認する|Check belt tension|Kontrola napnutí řemenů|Riemenspannung prüfen',
 'スプールホルダーを準備する|Prepare the spool holder|Příprava držáku cívky|Spulenhalter vorbereiten',
 'シートとスプールホルダーを取り付ける|Fit the sheet and spool holder|Nasazení plátu a držáku cívky|Druckplatte und Spulenhalter montieren',
 'ファームウェアを確認する|Check the firmware|Kontrola firmwaru|Firmware prüfen',
 '電源を入れる|Switch on the printer|Zapnutí tiskárny|Drucker einschalten',
 '言語とプリンターモデルを選ぶ|Select language and printer model|Výběr jazyka a modelu|Sprache und Druckermodell wählen',
 'ネットワークを設定する|Set up the network|Nastavení sítě|Netzwerk einrichten',
 'セルフテストを始める|Start the selftest|Spuštění selftestu|Selbsttest starten',
 'ドアセンサーを調整する|Calibrate the door sensor|Kalibrace senzoru dvířek|Türsensor kalibrieren',
 'ロードセルをテストする|Test the loadcell|Test senzoru Loadcell|Wägezelle testen',
 'ギアボックスを調整する|Align the gearbox|Zarovnání převodovky|Getriebe ausrichten',
 'フィラメントセンサーを調整する|Calibrate the filament sensors|Kalibrace senzorů filamentu|Filamentsensoren kalibrieren',
 '初期設定を完了する|Complete initial setup|Dokončení nastavení|Ersteinrichtung abschließen'
];
const refs=[[396,397],['spoolNew'],['sheet','spoolNew'],['lcd'],['lcd','psu'],['lcd'],['lcd'],['lcd'],['door'],['hotend'],['pgAssembly'],['loveBoard','sensorBody'],['lcd']];
// Bounds of the LCD in the official 1200 × 900 front-panel photos.
// CSS crops the view only. The source image is not edited or redistributed.
const lcdPhotos=new Set(['4-2','5-0','5-1','5-2','6-0','6-1','7-0','7-1','8-0','8-2','9-0','9-2','10-0','10-2','11-1','12-0']);
const steps=guides.en.steps.slice(0,13).map((step,i)=>({
 title:titles[i].split('|'),
 body:languages.map(lang=>{const translated=guides[lang].steps.find(s=>s.default_id===step.default_id);if(!translated)throw Error(`Missing ${lang}/${step.default_id}`);if(!guidance[step.id]?.ja)throw Error(`Missing Japanese guidance/${step.id}`);return guidance[step.id][lang]??translated.lines.map(line=>plain(line.title)).filter(Boolean).join('\n');}),
 refs:refs[i],source:`https://help.prusa3d.com/guide/9-calibration-first-run_982308#${step.id}`,
 officialStep:i+1,
 ...(i===0?{related:['belts']}:i===3||i===4?{related:['firmware-update','firmware-reflash']}:{}),
 ...(guidance[step.id]?.supplementalSources?{supplementalSources:guidance[step.id].supplementalSources}:{}),
 screenPhotos:step.media.gallery.map((image,j)=>({url:image.original,source:`https://help.prusa3d.com/guide/9-calibration-first-run_982308#${step.id}`,...(lcdPhotos.has(`${i}-${j}`)?{crop:[312,254,566,378,1200,900]}:{})}))
}));
const task={id:'initial-setup',revision:2,title:'初期設定とキャリブレーション|Initial setup & calibration|První nastavení a kalibrace|Ersteinrichtung und Kalibrierung'.split('|'),category:3,interval:'組み立て後・初回起動時|After assembly / first startup|Po sestavení / první spuštění|Nach Montage / erster Start'.split('|'),source:'https://help.prusa3d.com/guide/9-calibration-first-run_982308',steps};
fs.writeFileSync('dist/initial-setup-data.js','// Prusa CORE One+ kit manual, chapter 9. Official photos retain their source language.\nexport const INITIAL_SETUP_TASK='+JSON.stringify(task,null,2)+';\n');
console.log(`Built ${steps.length} initial-setup steps in four languages, ${steps.reduce((n,s)=>n+s.screenPhotos.length,0)} official photos.`);
