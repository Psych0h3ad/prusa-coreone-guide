import fs from 'node:fs';import assert from 'node:assert/strict';
const modules=['maintenance.js','maintenance-data.js','maintenance-model.js','maintenance-access.js','side-ptfe-coupling.js',...JSON.parse(fs.readFileSync('source/filament-maintenance/SOURCES.json')).files.map(r=>r.path.slice(5))];let aliases=0;
for(const page of['index.html','original.html','maintenance.html']){
 const html=fs.readFileSync('dist/'+page,'utf8'),imports=JSON.parse(html.match(/<script type="importmap">([\s\S]*?)<\/script>/)[1]).imports;
 for(const module of modules){const key='./'+module,canonical=imports[key];assert(canonical,'Missing canonical module '+module);for(const[k,v]of Object.entries(imports))if(k.split('?')[0]===key){assert.equal(v,canonical,page+' stale alias '+k);aliases++;}}
 if(page==='maintenance.html'){const entry=html.match(/data-guide-entry="([^"]+)"/)[1];assert.equal(entry,imports['./maintenance.js'],'Startup must load the same maintenance module as the guide');}
}
console.log('PASS_FILAMENT_IMPORTS: '+aliases+' historical and current aliases resolve to one module per entry point.');
