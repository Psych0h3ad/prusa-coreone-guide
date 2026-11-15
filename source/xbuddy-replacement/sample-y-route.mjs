// SPDX-License-Identifier: MIT
import fs from 'node:fs';import{registerHooks}from'node:module';import{parseArgs}from'node:util';
const{values}=parseArgs({options:{output:{type:'string'},amount:{type:'string',default:'1'}}});
if(!values.output)throw Error('Use --output path.json; --amount is the connected fraction0..1');
const amount=Number(values.amount);if(!Number.isFinite(amount)||amount<0||amount>1)throw Error('amount must be0..1');
registerHooks({resolve(s,c,next){return s==='three'?{url:new URL('../../dist/vendor/three.module.js',import.meta.url).href,shortCircuit:true}:next(s,c);}});
const T=await import('three'),{buildYConductorRoutes03}=await import('../../dist/xbuddy-y-entry03.js'),{yChannelExit02}=await import('../../dist/xbuddy-y-channel-route02.js');
const p=JSON.parse(fs.readFileSync(new URL('./y-route-example.json',import.meta.url),'utf8')),fixed=new T.CatmullRomCurve3([p.startMM,...p.fixedRouteMM].map(a=>new T.Vector3(...a)),false,'centripetal');fixed.arcLengthDivisions=2048;fixed.updateArcLengths();
const stock=fixed.getLength()+p.referenceFreeStockMM,port=yChannelExit02(new T.Vector3(...p.seatedPortMM),amount),result=buildYConductorRoutes03(fixed,port,stock);
fs.writeFileSync(values.output,JSON.stringify({units:'mm',qualification:p.qualification,amount,portMM:port.toArray(),receipt:result.receipt,centerlines:result.curves.map(c=>Array.from({length:257},(_,i)=>c.getPointAt(i/256).toArray()))},null,2)+'\n');
console.log(JSON.stringify({conductors:result.curves.length,perConductorStockMM:stock,units:'mm'}));
