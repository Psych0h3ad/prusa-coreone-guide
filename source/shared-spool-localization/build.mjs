import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const here=path.dirname(fileURLToPath(import.meta.url)),args=process.argv.slice(2),at=args.indexOf('--out');
if(at<0||!args[at+1])throw Error('Use --out PATH_TO_CHECKOUT, optionally --check');
const root=path.resolve(args[at+1]),check=args.includes('--check'),sha=b=>createHash('sha256').update(b).digest('hex');
const inside=(base,p)=>{const r=path.relative(base,p);return r!==''&&!path.isAbsolute(r)&&r!=='..'&&!r.startsWith('..'+path.sep);};
const manifest=JSON.parse(fs.readFileSync(path.join(here,'SOURCES.json'))),patch=JSON.parse(fs.readFileSync(path.join(here,'host-fields.json'))),jobs=[];
for(const row of manifest.files){
 const source=path.resolve(here,row.preferred),target=path.resolve(root,row.path);
 if(!inside(here,source)||!inside(root,target))throw Error('Unsafe path');
 const preferred=fs.readFileSync(source);
 if(preferred.length!==row.bytes||sha(preferred)!==row.sha256)throw Error('Preferred source mismatch: '+row.path);
 const current=fs.readFileSync(target),digest=sha(current),host=patch.hosts.find(h=>h.path===row.path);
 if(!host||host.afterSHA256!==row.sha256||host.beforeSHA256!==row.acceptedBeforeSHA256)throw Error('Field manifest mismatch');
 if(digest!==row.sha256&&digest!==host.beforeSHA256)throw Error('Unknown input; explicit field rebase required: '+row.path);
 if(digest!==row.sha256){
  let text=current.toString('utf8');
  for(const field of host.fields){
   if(text.split(field.before).length-1!==field.occurrences)throw Error('Non-unique field: '+field.name);
   text=text.replace(field.before,field.after);
  }
  if(!Buffer.from(text).equals(preferred))throw Error('Field postimage mismatch: '+row.path);
 }
 jobs.push({path:target,bytes:preferred,changed:digest!==row.sha256});
}
// All source/input/postimage checks complete before either host is written.
if(!check)for(const j of jobs)if(j.changed)fs.writeFileSync(j.path,j.bytes);
const changed=jobs.filter(j=>j.changed).length;
console.log(JSON.stringify({outputs:jobs.length,changed,check}));
if(check&&changed)process.exitCode=1;
