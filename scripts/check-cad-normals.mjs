import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';

// Inspect the shipped vertex buffers, independently of the rendering code.
const directory=new URL('../dist/assets/molex/',import.meta.url);
const manifest=JSON.parse(fs.readFileSync(new URL('cad.json',directory),'utf8'));
const results=[];
for(const [part,meta]of Object.entries(manifest.parts)){
 const bytes=fs.readFileSync(new URL(part+'.bin',directory));
 assert.equal(createHash('sha256').update(bytes).digest('hex'),meta.meshSha256,part+' manifest checksum');
 const count=meta.vertices,buffer=bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength);
 assert.equal(buffer.byteLength,count*3*8,part+' positions and normals');
 const positions=new Float32Array(buffer,0,count*3),normals=new Float32Array(buffer,count*12,count*3);
 let minimumCosine=1,maximumUnitError=0,degenerateTriangles=0;
 for(let i=0;i<count;i++){
  const offset=i*3,length=Math.hypot(...normals.subarray(offset,offset+3));
  maximumUnitError=Math.max(maximumUnitError,Math.abs(length-1));
  assert(Number.isFinite(length)&&Math.abs(length-1)<1e-6,part+' finite unit normal at '+i);
 }
 for(let i=0;i<count*3;i+=9){
  const a=[0,1,2].map(k=>positions[i+3+k]-positions[i+k]);
  const b=[0,1,2].map(k=>positions[i+6+k]-positions[i+k]);
  const cross=[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const area=Math.hypot(...cross);
  // Zero-area source triangles have no rendered surface or normal direction.
  if(area<=1e-10){degenerateTriangles++;continue;}
  for(let corner=0;corner<3;corner++){
   const offset=i+corner*3,cosine=cross.reduce((s,n,k)=>s+n*normals[offset+k],0)/area;
   minimumCosine=Math.min(minimumCosine,cosine);
   assert(cosine>.2,part+' normal opposes its visible facet at vertex '+offset/3);
  }
 }
 results.push({part,vertices:count,minimumCosine,maximumUnitError,degenerateTriangles});
}
console.log(JSON.stringify({status:'PASS',parts:results,scope:'Shipped geometry checksum, finite unit normals and agreement with visible triangle orientation. Zero-area source triangles reported separately.'}));
