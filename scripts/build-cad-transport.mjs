import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath}from 'node:url';
import {gzipSync,gunzipSync}from 'node:zlib';
import {createHash}from 'node:crypto';
const defaults=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),args=process.argv.slice(2),options={sourceRoot:defaults,outputRoot:defaults};
for(let i=0;i<args.length;i+=2){const key={'--source-root':'sourceRoot','--output-root':'outputRoot'}[args[i]];if(!key||!args[i+1])throw Error('Use --source-root <path> and --output-root <path>');options[key]=path.resolve(args[i+1]);}
const raw=fs.readFileSync(path.join(options.sourceRoot,'dist/assets/core-one.glb')),sha256=createHash('sha256').update(raw).digest('hex'),compressed=gzipSync(raw,{level:6,mtime:0});
if(!gunzipSync(compressed).equals(raw))throw Error('CAD transport roundtrip failed');
const filename='core-one.'+sha256.slice(0,16)+'.glb.gz',out=path.join(options.outputRoot,'dist/assets',filename);fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,compressed);
const meta={original:'./assets/core-one.glb',compressed:'./assets/'+filename,decodedBytes:raw.length,compressedBytes:compressed.length,sha256};
const modulePath=path.join(options.outputRoot,'dist/core-cad-transfer.js'),source=fs.readFileSync(modulePath,'utf8'),marker=/export const CAD_TRANSPORT=Object\.freeze\([^\n]*\);/g;
if([...source.matchAll(marker)].length!==1)throw Error('CAD transport metadata marker missing');
fs.writeFileSync(modulePath,source.replace(marker,'export const CAD_TRANSPORT=Object.freeze('+JSON.stringify(meta)+');'));
console.log(JSON.stringify({...meta,savedPercent:100*(1-compressed.length/raw.length),roundtripLiteral:true}));
