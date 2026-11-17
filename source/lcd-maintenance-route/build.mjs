import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const here=path.dirname(fileURLToPath(import.meta.url)),args=process.argv.slice(2),at=args.indexOf('--out');
if(at<0||!args[at+1])throw Error('Specify --out <existing project checkout or staging directory>');
const root=path.resolve(args[at+1]),check=args.includes('--check'),hash=b=>createHash('sha256').update(b).digest('hex');
const inside=(base,p)=>{const rel=path.relative(base,p);return rel!==''&&!path.isAbsolute(rel)&&rel!=='..'&&!rel.startsWith('..'+path.sep);};
const outputPath=rel=>{const p=path.resolve(root,rel);if(!inside(root,p))throw Error('Unsafe output path');return p;};
const manifest=JSON.parse(readFileSync(path.join(here,'runtime-manifest.json'))),patch=JSON.parse(readFileSync(path.join(here,'host-fields.json'))),outputs=new Map(),states=[];
function add(p,b){if(outputs.has(p))throw Error('Duplicate output path: '+p);outputs.set(p,b);}
function replaceFields(buffer,fields,label){let text=buffer.toString('utf8');for(const f of fields){const count=f.occurrences??1;if(text.split(f.before).length-1!==count)throw Error('Non-unique named field: '+label+' / '+f.name);text=text.split(f.before).join(f.after);}return Buffer.from(text);}
// Validate every preferred source, input and resulting postimage before writing.
for(const r of manifest.files){
 const source=path.resolve(here,r.source);if(!inside(path.resolve(here,'..'),source))throw Error('Unsafe preferred source path');
 const b=readFileSync(source);if(b.length!==r.bytes||hash(b)!==r.sha256)throw Error('Editable runtime/source manifest differs: '+r.source);
 const p=outputPath(r.path),present=existsSync(p);let digest=null;
 if(present){const old=readFileSync(p);digest=hash(old);if(digest!==r.sha256&&!r.acceptedExistingSHA256?.includes(digest))throw Error('Unknown existing runtime; explicit source rebase required: '+r.path);
  const d=manifest.operatorDelta;
  if(d?.path===r.path&&[d.rawPreimageSHA256,d.canonicalLFPreimageSHA256].includes(digest)){
   const projected=replaceFields(Buffer.from(old.toString('utf8').replaceAll('\r\n','\n')),d.fields,r.path);
   if(hash(projected)!==r.sha256)throw Error('Known operator delta postimage differs: '+r.path);
  }
 }else if(!r.allowMissing)throw Error('Missing required runtime: '+r.path);
 states.push({path:r.path,inputSHA256:digest,outputSHA256:r.sha256});add(p,b);
}
for(const h of patch.hosts){
 const p=outputPath(h.path),b=readFileSync(p),digest=hash(b),known=h.acceptedInputs.find(s=>s.sha256===digest);
 if(!known)throw Error('Unknown host; explicit source rebase required: '+h.path);
 const out=replaceFields(b,known.fields,h.path);
 if(hash(out)!==h.afterSHA256)throw Error('Host projection digest differs: '+h.path);
 states.push({path:h.path,inputSHA256:digest,outputSHA256:h.afterSHA256,sourceState:known.state});add(p,out);
}
let changed=0;for(const[p,b]of outputs)if(!existsSync(p)||hash(readFileSync(p))!==hash(b))changed++;
if(!check)for(const[p,b]of outputs){mkdirSync(path.dirname(p),{recursive:true});writeFileSync(p,b);}
console.log(JSON.stringify({checked:true,written:!check,files:outputs.size,changed,states}));
