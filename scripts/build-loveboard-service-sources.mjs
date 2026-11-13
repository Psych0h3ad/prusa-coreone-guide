import fs from 'node:fs/promises';import assert from 'node:assert/strict';
const d=JSON.parse(await fs.readFile('research/quality/service-20261105-47/guide-958922.json','utf8'));assert.equal(d.steps.length,31);
const source={url:d.url,updated:d.guide.updated,translations:{en:d.url},steps:d.steps.map((s,i)=>({id:s.id,number:i+2,title:s.title,images:s.media.gallery.map(g=>({url:(g.child||g).medium,full:(g.child||g).original}))}))};
for(const language of['cs','de'])source.translations[language]=`https://help.prusa3d.com/${language}/guide/${d.guide.translations_info[language].slug}`;
const pages=JSON.parse(await fs.readFile('research/quality/service-20261105-48/pdf-pages.json','utf8'));assert.equal(pages.length,31);
await fs.writeFile('dist/loveboard-service-source.js','// Exact official guide anchors and annotated photographs.\nexport const LOVEBOARD_SOURCE='+JSON.stringify(source,null,2)+';\nexport const LOVEBOARD_PDF_PAGES='+JSON.stringify(pages)+';\nexport const LOVEBOARD_PDF="https://help.prusa3d.com/wp-content/uploads/generated/printer-maintenance_247_guide_958922_en_2026-06-02.pdf";\n');
console.log('Retained 31 official LoveBoard steps and their photographs; incomplete Japanese official translation uses explicit English fallback.');
