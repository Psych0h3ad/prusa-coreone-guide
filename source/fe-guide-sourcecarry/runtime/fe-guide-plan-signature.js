// SPDX-License-Identifier: MIT
// Exact metadata signature; translated labels/notes do not identify a plan.
export function fePlanSignature(value){
 const encode=v=>{
  if(v===null)return ['null'];
  if(v===undefined)return ['undefined'];
  if(typeof v==='number'){if(!Number.isFinite(v))throw Error('Non-finite FE metadata');return ['number',Object.is(v,-0)?'-0':String(v)];}
  if(typeof v==='string'||typeof v==='boolean')return [typeof v,v];
  if(Array.isArray(v))return ['array',v.map(encode)];
  if(typeof v==='object')return ['object',Object.keys(v).filter(k=>!['label','note'].includes(k)).sort().map(k=>[k,encode(v[k])])];
  throw Error('FE guide contract requires data-only metadata');
 };
 return JSON.stringify(encode(value));
}
