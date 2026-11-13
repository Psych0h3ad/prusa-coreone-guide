import assert from 'node:assert/strict';
import fs from 'node:fs';
import {registerHooks} from 'node:module';
registerHooks({resolve(s,c,next){return s==='three'?{url:new URL('../dist/vendor/three.module.js',import.meta.url).href,shortCircuit:true}:next(s,c);}});
const {v}=await import('./check-viewer.mjs');
const T=await import('../dist/vendor/three.module.js');
const surfaces=JSON.parse(fs.readFileSync('dist/assets/cad-surfaces/manifest.json')).meshes.filter(m=>[402,404].includes(m.cadIndex));
for(const spec of surfaces){
 const matches=v.meshes.filter(m=>m.userData.cadIndex===spec.cadIndex);assert.equal(matches.length,1,'replacement preserves one original CAD instance');
 const mesh=matches[0],g=mesh.geometry,p=g.attributes.position,index=g.index,edges=new Map();
 assert.equal(mesh.userData.surfaceSource,spec.source);assert(mesh.userData.sourceGeometry,'original source geometry is retained for disposal');assert.equal(mesh.material.userData.finish,'polymer');
 const vertex=i=>new T.Vector3().fromBufferAttribute(p,i).applyMatrix4(mesh.matrix).multiplyScalar(1000);
 const key=i=>vertex(i).toArray().map(x=>Math.round(x*1e5)).join(',');
 const count=index?index.count:p.count;assert.equal(count/3,spec.triangles);
 for(let j=0;j<count;j+=3){const ids=[0,1,2].map(k=>index?index.getX(j+k):j+k),keys=ids.map(key);assert.equal(new Set(keys).size,3,'no zero-area edge triangles');for(let k=0;k<3;k++){const a=keys[k],b=keys[(k+1)%3],pair=[a,b].sort().join('/'),r=edges.get(pair)||{count:0,winding:0};r.count++;r.winding+=a<b?1:-1;edges.set(pair,r);}}
 assert([...edges.values()].every(e=>e.count===2&&e.winding===0),'all shipped triangles form an oriented closed surface');
 g.computeBoundingBox();const bounds=g.boundingBox.clone().applyMatrix4(mesh.matrix);for(const [p,expected]of [[bounds.min,spec.bounds[0]],[bounds.max,spec.bounds[1]]])assert(p.multiplyScalar(1000).distanceTo(new T.Vector3(...expected))<.02,'original CAD world placement and dimensions are retained');
}
console.log('PASS: both original CAD carriage instances have complete closed oriented surfaces, unchanged placement, matching triangle counts, polymer finish and official provenance.');
