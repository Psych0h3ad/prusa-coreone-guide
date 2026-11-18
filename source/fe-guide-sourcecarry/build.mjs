// SPDX-License-Identifier: MIT
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';import {createHash} from 'node:crypto';
const here=path.dirname(fileURLToPath(import.meta.url)),destination=process.argv[2];if(!destination)throw Error('Specify an output module directory');
const rows=JSON.parse(fs.readFileSync(path.join(here,'SOURCES.json'))).runtime,hash=b=>createHash('sha256').update(b).digest('hex'),outputs=[];
for(const row of rows){const b=fs.readFileSync(path.join(here,'runtime',row.name));if(b.length!==row.bytes||hash(b)!==row.sha256)throw Error('Preferred metadata source differs: '+row.name);outputs.push([row.name,b]);}
fs.mkdirSync(destination,{recursive:true});for(const[name,b]of outputs)fs.writeFileSync(path.join(destination,name),b);console.log(JSON.stringify({dataModules:outputs.length}));
