import fs from'node:fs';import path from'node:path';import{fileURLToPath}from'node:url';
const H=path.dirname(fileURLToPath(import.meta.url)),out=process.argv[2]?path.resolve(process.argv[2]):path.resolve(H,'../../dist');
const content=JSON.parse(fs.readFileSync(path.join(H,'procedure.json'),'utf8')),source=JSON.parse(fs.readFileSync(path.join(H,'official-source.json'),'utf8'));
if(content.steps.length!==22||source.steps.length!==22)throw Error('Expected22 source steps');
for(let i=0;i<22;i++)if(content.steps[i].officialId!==source.steps[i].id||source.steps[i].number!==i+1)throw Error('Source step binding mismatch');
fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'chamber-thermistor-data.js'),'const CONTENT='+JSON.stringify(content)+';\nexport function createChamberThermistorTask(){return structuredClone(CONTENT);}\n');
fs.writeFileSync(path.join(out,'chamber-thermistor-source.js'),'export const CHAMBER_THERMISTOR_SOURCE='+JSON.stringify(source,null,1)+';\n');
console.log(JSON.stringify({stages:22,languages:4,output:out}));
