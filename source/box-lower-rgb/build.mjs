// SPDX-License-Identifier: MIT
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {generate} from './generate.mjs';
const H=path.dirname(fileURLToPath(import.meta.url)),args=process.argv.slice(2),check=args.includes('--check'),at=args.indexOf('--target');
if(at<0||!args[at+1]||args.some((a,i)=>a!=='--target'&&i!==at+1&&a!=='--check'))throw Error('Use --target <existing runtime file> [--check]');
const target=path.resolve(args[at+1]),spec=JSON.parse(fs.readFileSync(path.join(H,'SOURCES.json'),'utf8')),sha=b=>createHash('sha256').update(b).digest('hex');
for(const r of spec.preferredFiles)if(sha(fs.readFileSync(path.join(H,r.path)))!==r.sha256)throw Error('Preferred source mismatch: '+r.path);
const p=JSON.parse(fs.readFileSync(path.join(H,'parameters.json'),'utf8')),blue=generate(p);
if(JSON.stringify(blue)!==JSON.stringify(JSON.parse(spec.newField)))throw Error('Generated blue differs from declared field');
const before=fs.readFileSync(target),hash=sha(before);
if(hash!==spec.beforeSHA256&&hash!==spec.afterSHA256)throw Error('Unknown runtime preimage; no write performed');
if(hash===spec.afterSHA256){console.log('PASS exact postimage; no write');process.exit(0);}
const text=before.toString(),old=spec.oldField;if(sha(Buffer.from(old))!==spec.oldFieldSHA256||sha(Buffer.from(spec.newField))!==spec.newFieldSHA256||text.split(old).length!==2)throw Error('Exact blue field not found once');
const next=Buffer.from(text.replace(old,spec.newField));if(sha(next)!==spec.afterSHA256)throw Error('Postimage mismatch before write');
if(check)throw Error('Runtime is still the declared preimage; build required');
fs.writeFileSync(target,next);console.log('PASS blue-only projection');
