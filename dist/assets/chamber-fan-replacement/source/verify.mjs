// SPDX-License-Identifier: MIT
import fs from'node:fs';import path from'node:path';import crypto from'node:crypto';import zlib from'node:zlib';import{fileURLToPath}from'node:url';
const home=path.dirname(fileURLToPath(import.meta.url)),out=path.resolve(process.argv[2]||'out'),ref=JSON.parse(fs.readFileSync(path.join(home,'reference.json'),'utf8')),hash=b=>crypto.createHash('sha256').update(b).digest('hex'),read=p=>fs.readFileSync(path.join(out,p));
const bin=read('chamber-fan-replacement/lead-bank.bin'),gz=read('chamber-fan-replacement/lead-bank.bin.gz'),manifest=read('chamber-fan-replacement/lead-bank.json'),a=read('chamber-fan-anatomy/fan-anatomy.bin'),am=read('chamber-fan-anatomy/fan-anatomy.json');
const checks={bankBIN:bin.length===ref.bank.decodedBytes&&hash(bin)===ref.bank.decodedSHA256,gzipPayload:hash(zlib.gunzipSync(gz))===ref.bank.decodedSHA256,bankManifest:hash(manifest)===ref.bank.manifestSHA256,anatomyBIN:a.length===ref.anatomy.bytes&&hash(a)===ref.anatomy.sha256,anatomyManifest:hash(am)===ref.anatomy.manifestSHA256};
console.log(JSON.stringify({checks,gzipContainerMatches:hash(gz)===ref.bank.gzipSHA256}));if(!Object.values(checks).every(Boolean))process.exitCode=1;
