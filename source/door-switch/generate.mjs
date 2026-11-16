// SPDX-License-Identifier: MIT
import fs from 'node:fs';import path from 'node:path';import{fileURLToPath}from'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));if(!process.argv[2])throw Error('An output directory is required');const out=path.resolve(process.argv[2]);fs.mkdirSync(path.join(out,'assets/tensioner-service'),{recursive:true});fs.copyFileSync(path.join(root,'door-switch-source.js'),path.join(out,'door-switch-source.js'));fs.copyFileSync(path.join(root,'material-groups.json'),path.join(out,'assets/tensioner-service/switch-material-groups.json'));
