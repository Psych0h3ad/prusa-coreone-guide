import assert from 'node:assert/strict';
import fs from 'node:fs';
import {registerHooks} from 'node:module';
registerHooks({resolve(s,c,next){return s==='three'?{url:new URL('../dist/vendor/three.module.js',import.meta.url).href,shortCircuit:true}:next(s,c);}});
const {v}=await import('./check-viewer.mjs');
const T=await import('../dist/vendor/three.module.js');
const {STLLoader}=await import('../dist/vendor/STLLoader.js');
const {meshes:specs}=JSON.parse(fs.readFileSync('dist/assets/cad-surfaces/manifest.json'));
let instances=0,solids=0;
for(const spec of specs){
 const source=v.meshes.find(m=>m.userData.cadIndex===spec.cadIndex),targets=v.meshes.filter(m=>spec.cadIndices.includes(m.userData.cadIndex));
 assert.equal(targets.length,spec.cadIndices.length);instances+=targets.length;
 for(const mesh of targets){assert.equal(mesh.userData.surfaceSource,spec.source);assert.equal(mesh.userData.referenceGeometry||mesh.geometry,source.userData.referenceGeometry||source.geometry,'identical source instances share the same unscaled reference geometry');assert(mesh.userData.sourceGeometry,'original source geometry remains available for disposal');}
 const expectedSolids=spec.assemblySolids?spec.assemblySolids.map(i=>spec.solidTriangles[i]):spec.solidTriangles||[spec.triangles],expectedTriangles=expectedSolids.reduce((a,b)=>a+b,0);
 const g=source.userData.referenceGeometry||source.geometry,p=g.attributes.position,index=g.index,count=index?index.count:p.count;assert.equal(count/3,expectedTriangles);
 if(spec.assemblySolids){
  const asset=await new STLLoader().loadAsync(spec.file);assert.equal(asset.attributes.position.count/3,spec.triangles,'the complete source file is preserved');
  asset.scale(.001,.001,.001);asset.translate(...spec.origin.map(v=>v*.001));asset.applyMatrix4(source.matrix.clone().invert());
  let sourceFirst=0,targetFirst=0;for(const [i,n]of spec.solidTriangles.entries()){
   if(spec.assemblySolids.includes(i)){for(let k=0;k<n*9;k++)assert.equal(p.array[targetFirst*9+k],asset.attributes.position.array[sourceFirst*9+k],'assembly selection preserves source triangles exactly');targetFirst+=n;}
   sourceFirst+=n;
  }asset.dispose();
 }
 const keys=Array.from({length:p.count},(_,i)=>[p.getX(i),p.getY(i),p.getZ(i)].map(x=>Math.round(x*1e8)).join(',')),ranges=g.userData.cadSolidRanges;
 assert.deepEqual(ranges.map(r=>r.triangles),expectedSolids);let end=0;
 for(const range of ranges){
  assert.equal(range.firstTriangle,end);end+=range.triangles;const edges=new Map();
  for(let j=range.firstTriangle*3;j<end*3;j+=3){const ids=[0,1,2].map(k=>index?index.getX(j+k):j+k),triangle=ids.map(i=>keys[i]);assert.equal(new Set(triangle).size,3);for(let k=0;k<3;k++){const a=triangle[k],b=triangle[(k+1)%3],key=[a,b].sort().join('/'),r=edges.get(key)||{count:0,winding:0};r.count++;r.winding+=a<b?1:-1;edges.set(key,r);}}
  assert([...edges.values()].every(e=>e.count===2&&e.winding===0),'each original solid retains its own closed oriented surface');
 }
 assert.equal(end,expectedTriangles);solids+=ranges.length*targets.length;
 const originalMatrix=source.matrix.clone();if(source.userData.assemblyOffset)originalMatrix.setPosition(source.userData.sourceRestPosition);
 const bounds=new T.Box3(),point=new T.Vector3();for(let i=0;i<p.count;i++)bounds.expandByPoint(point.fromBufferAttribute(p,i).applyMatrix4(originalMatrix));for(const [p,expected]of [[bounds.min,spec.bounds[0]],[bounds.max,spec.bounds[1]]])assert(p.multiplyScalar(1000).distanceTo(new T.Vector3(...expected))<.1,'original CAD geometry retains its bounds; declared assembly adjustments are checked separately');
}
assert.equal(specs.length,29);assert.equal(instances,80);assert.equal(solids,84);
console.log('PASS: 29 display surface assets, 80 CAD placements, 84 assembly solids, closed oriented triangles and declared surface bounds.');
