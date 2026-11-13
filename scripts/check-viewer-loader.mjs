import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createViewerLoader} from '../dist/viewer-loader.js';
let calls=0,release;const module={PrinterViewer:class{}};
const load=createViewerLoader(()=>{calls++;return new Promise(resolve=>{release=resolve;});});
assert.equal(calls,0,'manual initialization does not start the rendering import');
const a=load(8),b=load(8);await Promise.all([assert.rejects(a,/timed out/),assert.rejects(b,/timed out/)]);
assert.equal(calls,1,'a slow module has one live download rather than repeated attempts');
release(module);assert.equal(await load(),module,'a late module can be used after a loading timeout');assert.equal(await load(),module);assert.equal(calls,1);
const failed=createViewerLoader(()=>Promise.reject(Error('Network disconnected')));
await assert.rejects(failed(),e=>e.needsReload&&e.cause.message==='Network disconnected');
const files=new Set();
function graph(file){if(files.has(file))return;files.add(file);const source=fs.readFileSync(file,'utf8');for(const line of source.split('\n')){const spec=line.match(/^import\s.*?from\s*['"]([^'"]+)['"]/);if(!spec)continue;assert(spec[1]!=='three','manual startup has no eager Three.js dependency');if(spec[1].startsWith('.'))graph(path.resolve(path.dirname(file),spec[1].split('?')[0]));}}
graph(path.resolve('dist/app.js'));assert(!files.has(path.resolve('dist/viewer.js')),'manual startup does not wait on the viewer dependency graph');
console.log('PASS: lazy manual startup graph, one pending rendering import, bounded slow-load feedback, late success and explicit failed-module reload. No browser/GPU.');
