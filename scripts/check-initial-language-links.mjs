import assert from 'node:assert/strict';
import fs from 'node:fs';

const cases=[['ja','de'],['en','ja'],['cs','de'],['de','en']];
for(const [language,saved]of cases){
 const links=['./maintenance.html?task=initial-setup&view=screen#setup','./?flow=upgrade','https://help.prusa3d.com/guide/example'].map(href=>({href,getAttribute(){return this.href;},setAttribute(key,value){if(key==='href')this.href=value;}}));
 const root={nodeType:1,tagName:'HTML',childNodes:[],normalize(){},hasAttribute(){return false;}};
 const values=new Map();let requests=0;
 globalThis.document={documentElement:root,querySelectorAll:selector=>selector==='a[data-language-link]'?links:[]};
 globalThis.location={href:'http://localhost/maintenance.html?task=initial-setup&step=4&lang='+language};
 globalThis.history={replaceState(_state,_title,url){location.href=String(url);}};
 globalThis.localStorage={getItem:key=>values.get(key)??saved,setItem(key,value){values.set(key,value);}};
 globalThis.fetch=async path=>{requests++;return {ok:true,json:()=>JSON.parse(fs.readFileSync('dist/'+path.split('?')[0],'utf8'))};};
 const i18n=await import('../dist/i18n.js?initial-language-links-'+language);
 await i18n.initializeLocalization({flows:{},parts:{},plan:{}});
 assert.equal(i18n.currentLanguage(),language,'an explicit language wins over a different stored preference');
 assert.equal(root.lang,language);
 assert([...values.values()].includes(language),'the chosen language remains selected on the next page');
 for(const link of links.slice(0,2))assert.equal(new URL(link.href).searchParams.get('lang'),language,'internal links carry Japanese as well as other languages');
 const returnLink=new URL(links[0].href);assert.equal(returnLink.searchParams.get('task'),'initial-setup');assert.equal(returnLink.searchParams.get('view'),'screen');assert.equal(returnLink.hash,'#setup');
 assert.equal(links[2].href,'https://help.prusa3d.com/guide/example','external source links remain untouched');
 if(language==='ja')assert.equal(requests,0,'Japanese initialization needs no translation download');
}
console.log('PASS: four explicit language links override previous preferences, preserve task links and fragments, and retain Japanese without translation downloads.');
