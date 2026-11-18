// SPDX-License-Identifier: MIT
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const here=path.dirname(fileURLToPath(import.meta.url)),at=process.argv.indexOf('--out');
if(at<0||!process.argv[at+1])throw Error('Explicit --out destination required');
const root=path.resolve(process.argv[at+1]),check=process.argv.includes('--check'),sha=b=>createHash('sha256').update(b).digest('hex');
const inside=(base,p)=>{const rel=path.relative(base,p);return rel!==''&&!path.isAbsolute(rel)&&rel!=='..'&&!rel.startsWith('..'+path.sep);};
const output=rel=>{const p=path.resolve(root,rel);if(!inside(root,p))throw Error('Output must stay inside destination');return p;};
const data=JSON.parse(fs.readFileSync(path.join(here,'fields.json'),'utf8')),manifest=JSON.parse(fs.readFileSync(path.join(here,'SOURCES.json'),'utf8')),updates=new Map(),hosts=[];
if(data.hosts.length!==2||manifest.files.length!==9)throw Error('Expected two declared hosts and nine preferred modules');
for(const host of data.hosts){
 const dest=output(host.path),original=fs.readFileSync(dest),digest=sha(original);let result=original,state='already-current';
 if(digest!==host.afterSHA256){
  if(digest!==host.beforeSHA256)throw Error('Unknown host preimage: '+host.path);
  let text=original.toString('utf8');
  for(const f of data.fields.filter(f=>f.path===host.path)){if(text.split(f.before).length!==2)throw Error('Exact unique preimage required: '+f.label);text=text.replace(f.before,f.after);}
  result=Buffer.from(text);if(sha(result)!==host.afterSHA256)throw Error('Host postimage differs: '+host.path);state='applied';
 }
 for(const f of (data.preservedFields||[]).filter(f=>f.path===host.path))if(result.toString('utf8').split(f.after).length!==2)throw Error('Required existing host field differs: '+f.label);
 if(!host.readOnly)updates.set(dest,result);else if(digest!==host.afterSHA256)throw Error('Preserved host must already be current: '+host.path);
 hosts.push({path:host.path,state,readOnly:!!host.readOnly});
}
for(const row of manifest.files){
 const source=path.resolve(here,row.preferred);if(!inside(here,source)||!row.path.startsWith('dist/'))throw Error('Invalid preferred runtime path');
 const b=fs.readFileSync(source);if(b.length!==row.bytes||sha(b)!==row.sha256)throw Error('Preferred runtime bytes differ: '+row.path);
 const p=output(row.path);if(updates.has(p))throw Error('Duplicate runtime output');updates.set(p,b);
}
let changed=0;for(const[p,b]of updates)if(!fs.existsSync(p)||sha(fs.readFileSync(p))!==sha(b))changed++;
if(!check)for(const[p,b]of updates){fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,b);}
console.log(JSON.stringify({checked:true,written:!check,files:updates.size,changed,hosts}));
