// SPDX-License-Identifier: MIT
// Hybrid authored source: explicit retained centreline stations + scalar route solves.
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import zlib from 'node:zlib';import{fileURLToPath,pathToFileURL}from'node:url';import{registerHooks}from'node:module';
const home=path.dirname(fileURLToPath(import.meta.url));registerHooks({resolve(s,c,next){return next(s==='three'?pathToFileURL(path.join(home,'vendor/three.module.js')).href:s,c);}});
const route=await import('./routing/chamber-fan-route.js'),read=p=>fs.readFileSync(path.join(home,p),'utf8'),parameters=JSON.parse(read('routing/manifest-parameters.json')),retained=JSON.parse(read('routing/retained-stations.json')),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
if(parameters.samples!==route.SAMPLES||parameters.knots!==route.KNOTS||parameters.states!==289||retained.samplesPerCurve!==257)throw Error('Incompatible source dimensions');
const output=path.resolve(process.argv[2]||'out'),raw=Buffer.alloc(parameters.decodedBytes),coverage=new Set();let generated=0;
for(const [id,m]of Object.entries(parameters.leads)){m.deformations=Array(289*4).fill(null);if(m.pins!==4||m.stocks.length!==4)throw Error('Four conductor source required');}
const key=(id,k,w)=>id+'/'+k+'/'+w;
function put(id,k,w,points,deformation){
 const m=parameters.leads[id],tag=key(id,k,w);if(!m||!Number.isInteger(k)||k<0||k>=289||!Number.isInteger(w)||w<0||w>=4||coverage.has(tag)||points.length!==257)throw Error('Invalid/duplicate source curve '+tag);
 const offset=m.offset+((k*4+w)*257*3)*4;
 for(let i=0;i<257;i++)for(let a=0;a<3;a++){const n=points[i][a];if(!Number.isFinite(n))throw Error('Nonfinite source station');raw.writeFloatLE(n,offset+(i*3+a)*4);}
 if(!deformation||!['upper','lower','q','upperFactor','lowerFactor'].every(k=>Number.isFinite(deformation[k])))throw Error('Missing deformation parameters');m.deformations[k*4+w]=deformation;coverage.add(tag);
}
for(const r of retained.curves){if(!(r.knot<10||r.lead==='cfFan1'&&r.knot>105))throw Error('Unexpected retained interval');put(r.lead,r.knot,r.conductor,r.pointsMM,r.deformation);}
for(const d of route.CHAMBER_LEADS){const m=parameters.leads[d.id],last=d.id==='cfFan1'?105:288;for(let k=10;k<=last;k++)for(let w=0;w<4;w++){const p=route.solveSamples(d,k/route.KNOTS,w,m.stocks[w]);put(d.id,k,w,p.map(v=>v.toArray()),p.deformation);generated++;}}
if(coverage.size!==2312||generated!==1500||retained.curves.length!==812)throw Error('Incomplete source coverage');
for(const [id,m]of Object.entries(parameters.leads)){
 let observed=0;
 for(let k=0;k<289;k++)for(let w=0;w<4;w++){let length=0;const offset=m.offset+((k*4+w)*257*3)*4;let prev;
  for(let i=0;i<257;i++){const p=Array.from({length:3},(_,a)=>raw.readFloatLE(offset+(i*3+a)*4));if(prev){const dx=p[0]-prev[0],dy=p[1]-prev[1],dz=p[2]-prev[2];length+=Math.sqrt(dx*dx+dy*dy+dz*dz);}prev=p;}observed=Math.max(observed,Math.abs(length-m.stocks[w]));}
 if(observed>m.maxKnotPolylineErrorMM+1e-10)throw Error('Edited source exceeds stored material error budget: '+id+' '+observed);m.sha256=hash(raw.subarray(m.offset,m.offset+m.bytes));
}
parameters.sha256=hash(raw);parameters.producerRouteSHA256=hash(fs.readFileSync(path.join(home,'routing/chamber-fan-route.js')));
// Preserve the existing UTF-8 JSON wire format. Its small fractional values
// use scientific notation below1e-4, with at least two exponent digits.
function number(n){if(n!==0&&Math.abs(n)<1e-4)return n.toExponential().replace(/e([+-])(\d+)$/,(_,s,d)=>'e'+s+d.padStart(2,'0'));return JSON.stringify(n);}
function json(v,level=0){if(v===null)return'null';if(typeof v==='number')return number(v);if(typeof v!=='object')return JSON.stringify(v);const pad=' '.repeat(level*2),indent=pad+'  ';if(Array.isArray(v))return v.length?'[\n'+v.map(x=>indent+json(x,level+1)).join(',\n')+'\n'+pad+']':'[]';const pairs=Object.entries(v);return pairs.length?'{\n'+pairs.map(([k,x])=>indent+JSON.stringify(k)+': '+json(x,level+1)).join(',\n')+'\n'+pad+'}':'{}';}
fs.mkdirSync(output,{recursive:true});fs.writeFileSync(path.join(output,'lead-bank.bin'),raw);fs.writeFileSync(path.join(output,'lead-bank.bin.gz'),zlib.gzipSync(raw,{level:9}));fs.writeFileSync(path.join(output,'lead-bank.json'),json(parameters).replaceAll('\n','\r\n'));
console.log(JSON.stringify({decodedBytes:raw.length,decodedSHA256:parameters.sha256,retainedCurves:retained.curves.length,generatedCurves:generated,totalCurves:coverage.size}));
