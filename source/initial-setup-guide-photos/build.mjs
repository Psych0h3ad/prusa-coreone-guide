import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const H=path.dirname(fileURLToPath(import.meta.url)),args=process.argv.slice(2),outAt=args.indexOf('--out');
if(outAt<0||!args[outAt+1])throw Error('Use --out PATH_TO_CHECKOUT, optionally --check');
const root=path.resolve(args[outAt+1]),check=args.includes('--check'),manifest=JSON.parse(fs.readFileSync(path.join(H,'SOURCES.json'),'utf8'));
const sha=b=>createHash('sha256').update(b).digest('hex'),jobs=[];
for(const row of manifest.files){
 const preferred=fs.readFileSync(path.join(H,row.preferred));if(preferred.length!==row.bytes||sha(preferred)!==row.sha256)throw Error('Preferred source mismatch '+row.path);
 const target=path.join(root,row.path),present=fs.existsSync(target)?fs.readFileSync(target):null,digest=present&&sha(present);
 if(digest!==row.sha256&&digest!==row.acceptedBeforeSHA256)throw Error('Unknown input '+row.path);
 jobs.push({target,preferred,changed:digest!==row.sha256});
}
if(!check)for(const job of jobs)if(job.changed){fs.mkdirSync(path.dirname(job.target),{recursive:true});fs.writeFileSync(job.target,job.preferred);}
const changed=jobs.filter(j=>j.changed).length;console.log(JSON.stringify({outputs:jobs.length,changed,check}));if(check&&changed)process.exitCode=1;
