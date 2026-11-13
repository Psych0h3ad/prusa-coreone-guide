import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const d=JSON.parse(await fs.readFile('research/quality/service-20261105-52/guide-908859.json','utf8'));assert.equal(d.steps.length,34);
const pdf=JSON.parse(await fs.readFile('research/quality/service-20261105-54/official-xbuddy-pdf-map.json','utf8'));assert.equal(Object.keys(pdf.pages).length,34);
const source={url:d.url,pdf:pdf.url,updated:d.guide.updated,translations:{en:d.url},steps:d.steps.map((s,i)=>({id:s.id,number:i+2,pdfNumber:i+1,pdfPage:pdf.pages[i+1].page,title:s.title,images:s.media.gallery.map(g=>({url:(g.child||g).medium,full:(g.child||g).original}))}))};
for(const lang of['cs','de']){const t=d.guide.translations_info[lang];assert(t?.translated);source.translations[lang]=`https://help.prusa3d.com/${lang}/guide/${t.slug}`;}
await fs.writeFile('dist/xbuddy-service-source.js','// Official guide anchors and annotated photographs. Japanese uses the explicit English fallback.\nexport const XBUDDY_SOURCE='+JSON.stringify(source,null,2)+';\n');
console.log('Retained34 official xBuddy steps with CS/DE source links and official photographs.');
