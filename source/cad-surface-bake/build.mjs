// Original pack builder: MIT. Geometry is an unchanged Prusa CAD derivative.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {gzipSync} from 'node:zlib';
import {registerHooks} from 'node:module';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {prepareNativeFrames} from './native-frame.mjs';
const sourceRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
registerHooks({resolve(s,c,next){return s==='three'?{url:pathToFileURL(path.join(sourceRoot,'dist/vendor/three.module.js')).href,shortCircuit:true}:next(s,c);}});
const args=process.argv.slice(2),arg=(name,fallback)=>{const i=args.indexOf(name);return i<0?fallback:args[i+1];};
const root=path.resolve(arg('--input',sourceRoot)),out=path.resolve(arg('--output',path.join(root,'dist/assets/cad-surfaces-ready'))),binding=path.resolve(arg('--binding',path.join(root,'dist/cad-surface-ready-binding.js')));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex'),read=rel=>fs.readFileSync(path.join(root,rel)),manifestBytes=read('dist/assets/cad-surfaces/manifest.json'),manifest=JSON.parse(manifestBytes),specs=manifest.meshes;
if(fs.existsSync(out))throw Error('Choose a new output directory; source and previous outputs are never overwritten');fs.mkdirSync(out,{recursive:true});
const {STLLoader}=await import('../../dist/vendor/STLLoader.js'),{restoreCADSurfaces}=await import('./reference-restore.mjs');
const initial=process.memoryUsage(),start=performance.now(),native=await prepareNativeFrames(root),frameMS=performance.now()-start,sourceMatrices=new Map(specs.map(s=>[s.cadIndex,native.meshes.find(m=>m.userData.cadIndex===s.cadIndex).matrix.toArray()]));
let parsed=[],previous=performance.now(),peakRSS=initial.rss;
const realFetch=globalThis.fetch;
globalThis.fetch=async input=>{if(!String(input).startsWith('./assets/cad-surfaces/manifest.json'))throw Error('Unexpected generator fetch');return {ok:true,json:async()=>manifest};};
STLLoader.prototype.loadAsync=async function(file){const t=performance.now(),b=read('dist/'+file.replace(/^\.\//,'')),g=this.parse(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength));parsed.push({file,parseMS:performance.now()-t,previousFinishMS:t-previous,inputBytes:b.length});previous=performance.now();peakRSS=Math.max(peakRSS,process.memoryUsage().rss);return g;};
const oldStart=performance.now();await restoreCADSurfaces(native.meshes);const oldMS=performance.now()-oldStart;globalThis.fetch=realFetch;peakRSS=Math.max(peakRSS,process.memoryUsage().rss);
const rows=[],buffer=(a)=>Buffer.from(a.buffer,a.byteOffset,a.byteLength),arraySHA=a=>sha(buffer(a));
for(const spec of specs){
 const source=native.meshes.find(m=>m.userData.cadIndex===spec.cadIndex),g=source.geometry,p=g.attributes.position,n=g.attributes.normal;
 if(Object.keys(g.attributes).join(',')!=='position,normal'||g.index||g.groups.length||!(p.array instanceof Float32Array)||!(n.array instanceof Float32Array)||p.count!==n.count)throw Error('Unexpected legacy geometry attributes: '+spec.cadIndex);
 const packed=Buffer.alloc(32+p.array.byteLength+n.array.byteLength);packed.write('PCADSUR1',0,'ascii');packed.writeUInt32LE(p.count,8);packed.writeUInt32LE(p.array.byteLength,12);packed.writeUInt32LE(n.array.byteLength,16);buffer(p.array).copy(packed,32);buffer(n.array).copy(packed,32+p.array.byteLength);
 const hash=sha(packed),name='surface-'+spec.cadIndex+'-'+hash.slice(0,16)+'.bin.gz',compressed=gzipSync(packed,{level:9,mtime:0});fs.writeFileSync(path.join(out,name),compressed);fs.writeFileSync(path.join(out,name.slice(0,-3)),packed);
 rows.push({...spec,format:'PCADSUR1',preparedURL:'./assets/cad-surfaces-ready/'+name,rawURL:'./assets/cad-surfaces-ready/'+name.slice(0,-3),vertexCount:p.count,decodedBytes:packed.length,compressedBytes:compressed.length,sha256:hash,compressedSHA256:sha(compressed),positionSHA256:arraySHA(p.array),normalSHA256:arraySHA(n.array),cadSolidRanges:g.userData.cadSolidRanges,sourceMatrix:sourceMatrices.get(spec.cadIndex),sourceFileSHA256:sha(read('dist/'+spec.file.replace(/^\.\//,''))),sourceUnits:'mm',preparedUnits:'m in original flattened mesh-local frame',license:spec.license||manifest.license});
}
const dependencies=['dist/assets/core-one.glb','dist/assets/cad-subsets.json','dist/assets/cad-surfaces/manifest.json','dist/surface-geometry.js','dist/vendor/three.module.js','dist/vendor/STLLoader.js','dist/vendor/GLTFLoader.js','dist/vendor/meshopt_decoder.module.js','dist/utils/BufferGeometryUtils.js'];
const result={format:'PCADSUR1',author:manifest.author,source:manifest.source,sourceAssembly:manifest.sourceAssembly,license:manifest.license,units:'m in each flattened source mesh local frame',purpose:'Exact Float32 display surface cache. Same triangles, original positions and crease normals; not manufacturing or inspection data.',nativeCADSHA256:sha(read('dist/assets/core-one.glb')),sourceManifestSHA256:sha(manifestBytes),dependencies:dependencies.map(file=>({file,sha256:sha(read(file))})),meshes:rows};
const encoded=Buffer.from(JSON.stringify(result,null,2)+'\n'),manifestName='manifest-'+sha(encoded).slice(0,16)+'.json';fs.writeFileSync(path.join(out,manifestName),encoded);
fs.mkdirSync(path.dirname(binding),{recursive:true});fs.writeFileSync(binding,'// Generated from exact source files; geometry source terms are unchanged.\nexport const CAD_SURFACE_READY='+JSON.stringify({manifestURL:'./assets/cad-surfaces-ready/'+manifestName,manifestSHA256:sha(encoded),nativeCADSHA256:result.nativeCADSHA256,parts:rows.length})+';\n');
console.log(JSON.stringify({status:'BUILT_EXACT_LEGACY_SURFACE_PACKS',frameMS,legacyRestoreMS:oldMS,parsed,parts:rows.length,instances:specs.reduce((a,s)=>a+s.cadIndices.length,0),vertices:rows.reduce((a,s)=>a+s.vertexCount,0),triangles:rows.reduce((a,s)=>a+s.vertexCount/3,0),decodedBytes:rows.reduce((a,s)=>a+s.decodedBytes,0),gzipBytes:rows.reduce((a,s)=>a+s.compressedBytes,0),initialMemory:initial,afterMemory:process.memoryUsage(),observedPeakRSS:peakRSS,manifestName,manifestSHA256:sha(encoded)}));
