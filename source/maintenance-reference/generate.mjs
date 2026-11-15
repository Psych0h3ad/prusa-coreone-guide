// SPDX-License-Identifier: MIT
// Copyright (c) CORE One Community Guide contributors
import fs from 'node:fs';import path from 'node:path';import{fileURLToPath}from 'node:url';
const H=path.dirname(fileURLToPath(import.meta.url)),out=path.resolve(process.argv[2]||path.join(H,'../../dist'));
const data=JSON.parse(fs.readFileSync(path.join(H,'guide-step-index.json')));fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(path.join(out,'official-step-numbers.js'),'// SPDX-License-Identifier: MIT\n// Factual identifiers and separate instruction/web ordinals; no guide prose.\nexport const OFFICIAL_GUIDE_INDEX='+JSON.stringify(data.guides)+';\nexport const OFFICIAL_PDF_INDEX='+JSON.stringify(data.pdfs||[])+';\n'+fs.readFileSync(path.join(H,'resolver-template.js'),'utf8'));
