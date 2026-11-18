// SPDX-License-Identifier: MIT
import fs from'node:fs';import path from'node:path';import{fileURLToPath}from'node:url';import{createHash}from'node:crypto';
const H=path.dirname(fileURLToPath(import.meta.url)),args=process.argv.slice(2),i=args.indexOf('--out');if(i<0||!args[i+1])throw Error('Use --out PATH_TO_CHECKOUT, optionally --check');
const root=path.resolve(args[i+1]),check=args.includes('--check'),hash=b=>createHash('sha256').update(b).digest('hex'),manifest=JSON.parse(fs.readFileSync(path.join(H,'SOURCES.json'))),fields=JSON.parse(fs.readFileSync(path.join(H,'host-fields.json'))),jobs=[];
const inside=(a,b)=>{const r=path.relative(a,b);return r!==''&&!path.isAbsolute(r)&&r!=='..'&&!r.startsWith('..'+path.sep);};
for(const r of manifest.files){
 const source=path.resolve(H,r.preferred),target=path.resolve(root,r.path);if(!inside(H,source)||!inside(root,target))throw Error('Unsafe output/source');
 const preferred=fs.readFileSync(source);if(preferred.length!==r.bytes||hash(preferred)!==r.sha256)throw Error('Preferred source mismatch '+r.path);
 const old=fs.existsSync(target)?fs.readFileSync(target):null,digest=old&&hash(old);
 if(!old&&!r.allowMissing)throw Error('Missing existing host '+r.path);
 if(old&&digest!==r.sha256){
  if(digest!==r.acceptedBeforeSHA256)throw Error('Unknown host; explicit typed rebase required '+r.path);
  const h=fields.hosts.find(h=>h.path===r.path);if(!h)throw Error('Unlisted input '+r.path);let text=old.toString();
  for(const f of h.fields){if(text.split(f.before).length-1!==f.occurrences)throw Error('Non-unique named field '+f.name);text=text.replace(f.before,f.after);}
  if(!Buffer.from(text).equals(preferred))throw Error('Typed postimage mismatch '+r.path);
 }
 jobs.push({target,preferred,changed:digest!==r.sha256});
}
if(!check)for(const j of jobs)if(j.changed){fs.mkdirSync(path.dirname(j.target),{recursive:true});fs.writeFileSync(j.target,j.preferred);}
const changed=jobs.filter(j=>j.changed).length;console.log(JSON.stringify({outputs:jobs.length,changed,check}));if(check&&changed)process.exitCode=1;
