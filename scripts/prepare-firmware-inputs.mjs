// Exact upstream inputs for the navigation generator; original notices retained.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=fileURLToPath(new URL('../source/vendor/prusa-firmware-buddy/',import.meta.url));
const args=process.argv.slice(2),cacheAt=args.indexOf('--from');
const cache=cacheAt<0?null:args[cacheAt+1];
if(args.some((x,i)=>x!=='--from'&&i!==cacheAt+1)||cacheAt>=0&&!cache)throw Error('Usage: node scripts/prepare-firmware-inputs.mjs [--from SOURCE_CACHE]');
const lock=JSON.parse(await fs.readFile(path.join(root,'inputs.json'),'utf8'));
const hash=b=>createHash('sha256').update(b).digest('hex'),staged=[];
for(const[version,groups]of Object.entries(lock.versions))for(const[group,entries]of Object.entries(groups))for(const e of entries){
 const rel=path.join(group,'v'+version,e.file),dest=path.resolve(root,rel);
 if(!dest.startsWith(root)||!['navigation','operations','coldpull'].includes(group)||e.file!==path.basename(e.file))throw Error('Invalid input path');
 let b;
 if(cache)b=await fs.readFile(path.join(path.resolve(cache),rel));
 else{
  const url=new URL(e.url);
  if(url.origin!=='https://raw.githubusercontent.com'||!url.pathname.startsWith('/prusa3d/Prusa-Firmware-Buddy/v'+version+'/'))throw Error('Unexpected upstream URL');
  const response=await fetch(url);if(!response.ok)throw Error(`Input unavailable: ${e.path} (${response.status})`);
  b=Buffer.from(await response.arrayBuffer());
 }
 if(b.length!==e.bytes||hash(b)!==e.sha256)throw Error(`Source hash mismatch: ${version}/${e.path}`);
 staged.push({dest,b});
}
// Validate every input before writing any source file.
for(const{dest,b}of staged){await fs.mkdir(path.dirname(dest),{recursive:true});await fs.writeFile(dest,b);}
for(const[version,groups]of Object.entries(lock.versions)){
 const directory=path.join(root,'coldpull','v'+version);
 await fs.mkdir(directory,{recursive:true});
 await fs.writeFile(path.join(directory,'sources.json'),JSON.stringify({version,sources:groups.coldpull},null,2)+'\n');
}
console.log(`Verified ${staged.length} upstream source files.`);
