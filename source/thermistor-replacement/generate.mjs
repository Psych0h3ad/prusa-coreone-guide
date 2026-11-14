import fs from'node:fs';import path from'node:path';import{fileURLToPath}from'node:url';
const H=path.dirname(fileURLToPath(import.meta.url)),out=process.argv[2]?path.resolve(process.argv[2]):path.resolve(H,'../../dist');
const content=JSON.parse(fs.readFileSync(path.join(H,'procedure.json'),'utf8'));
const factory="export function createThermistorReplacementTask(tasks){const current=tasks.find(t=>t.id==='hotend');if(!current)throw Error('Missing standard hotend access procedure');const task=structuredClone(CONTENT);task.accessReference=structuredClone(current);for(const s of task.steps){const access=current.steps[s.componentAccessIndex];if(access?.action)s.action=access.action;if(['cover-out','cover-in'].includes(s.action))s.body=structuredClone(access.body);}return task;}\n";
const source={url:content.source,translations:{},steps:content.steps.map((s,i)=>({id:s.officialId,number:i+1,title:s.title[1],products:['core-one','core-one-plus'],images:s.sourcePhotos}))};
fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'thermistor-service-data.js'),'const CONTENT='+JSON.stringify(content)+';\n'+factory);fs.writeFileSync(path.join(out,'thermistor-service-source.js'),'export const THERMISTOR_SERVICE_SOURCE='+JSON.stringify(source)+';\n');
console.log(JSON.stringify({stages:content.steps.length,output:out}));
