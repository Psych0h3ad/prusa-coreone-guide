// SPDX-License-Identifier: MIT
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {selectReferencePhoto} from '../dist/manual-reference.js';

const read=name=>JSON.parse(fs.readFileSync(new URL('../dist/assets/manual-reference/'+name,import.meta.url),'utf8'));
const photos=read('original2251-build-3.json').steps['863534'].photos;
const plus=read('build-1.json').steps['983329'].photos;
let checks=0;
const equal=(actual,expected)=>{assert.deepEqual(actual,expected);checks++;};
// The working checks must open their matching official photos, including
// the Original gallery's photoID field and the Plus gallery's id field.
equal(selectReferencePhoto(photos,863530),{index:1,plain:false});
equal(selectReferencePhoto(photos,867434),{index:2,plain:false});
equal(selectReferencePhoto(photos,867435),{index:0,plain:false});
equal(selectReferencePhoto(plus,plus[1].id),{index:1,plain:false});
for(let i=0;i<photos.length;i++)for(const key of['url','preview','thumbnail'])equal(selectReferencePhoto(photos,photos[i][key]),{index:i,plain:false});
const plain=plus.findIndex(photo=>photo.plain);assert(plain>=0);
equal(selectReferencePhoto(plus,plus[plain].plain),{index:plain,plain:true});
for(const requested of[999999,undefined,null,{},'https://example.invalid/image.jpg'])equal(selectReferencePhoto(photos,requested,1),{index:1,plain:false});
equal(selectReferencePhoto(photos,undefined,-10),{index:0,plain:false});
equal(selectReferencePhoto(photos,undefined,100),{index:2,plain:false});
equal(selectReferencePhoto([],863530),{index:0,plain:false});
console.log('PASS: '+checks+' official photo selections, Original/Plus IDs, preview/plain URLs and missing-target fallback.');
