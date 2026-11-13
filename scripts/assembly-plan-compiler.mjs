// A deterministic data-module writer. Shared objects, descriptors, undefined,
// sparse arrays and signed zero survive; no geometric calculation is changed.
export function compileDataModule(value,{exportName='ASSEMBLY_PLAN'}={}){
 if(!/^[A-Za-z_$][\w$]*$/.test(exportName))throw Error('Invalid export name');
 const nodes=[],ids=new Map(),stats={objects:0,arrays:0,aliases:0,negativeZero:0,undefined:0,sparseArrays:0,nonDefaultDescriptors:0};
 function reference(input){
  if(input!==null&&typeof input==='object'){
   if(ids.has(input)){stats.aliases++;return'n['+ids.get(input)+']';}
   const proto=Object.getPrototypeOf(input),array=Array.isArray(input);
   if(array&&proto!==Array.prototype)throw Error('Unsupported array prototype');
   if(!array&&proto!==Object.prototype&&proto!==null)throw Error('Unsupported object prototype '+input.constructor?.name);
   const id=nodes.length,record={input,array,proto,entries:[]};ids.set(input,id);nodes.push(record);
   stats[array?'arrays':'objects']++;if(array&&Object.keys(input).filter(k=>/^(0|[1-9]\d*)$/.test(k)).length<input.length)stats.sparseArrays++;
   for(const key of Reflect.ownKeys(input)){
    if(typeof key!=='string')throw Error('Symbol-valued data key');if(array&&key==='length')continue;
    const d=Object.getOwnPropertyDescriptor(input,key);if(!Object.hasOwn(d,'value'))throw Error('Accessor-valued plan field');
    const ordinary=d.enumerable&&d.configurable&&d.writable;if(!ordinary)stats.nonDefaultDescriptors++;
    record.entries.push({key,value:reference(d.value),descriptor:{enumerable:d.enumerable,configurable:d.configurable,writable:d.writable},ordinary});
   }
   return'n['+id+']';
  }
  if(input===undefined){stats.undefined++;return'undefined';}
  if(typeof input==='number'){
   if(!Number.isFinite(input))throw Error('Nonfinite plan number');
   if(Object.is(input,-0)){stats.negativeZero++;return'-0';}return String(input);
  }
  if(input===null||typeof input==='string'||typeof input==='boolean')return JSON.stringify(input);
  throw Error('Nondata plan value '+typeof input);
 }
 const root=reference(value),lines=['// Shared operation data for instructions and the 3D viewer.','const n=['+nodes.map(r=>r.array?'new Array('+r.input.length+')':r.proto===null?'Object.create(null)':'{}').join(',')+'];'];
 for(const[i,r]of nodes.entries()){
  if(r.entries.every(e=>e.ordinary&&e.key!=='__proto__')){
   if(r.entries.length)lines.push('Object.assign(n['+i+'],{'+r.entries.map(e=>(e.key==='__proto__'?'['+JSON.stringify(e.key)+']':JSON.stringify(e.key))+':'+e.value).join(',')+'});');
  }else for(const e of r.entries)lines.push('Object.defineProperty(n['+i+'],'+JSON.stringify(e.key)+',{value:'+e.value+',enumerable:'+e.descriptor.enumerable+',configurable:'+e.descriptor.configurable+',writable:'+e.descriptor.writable+'});');
  if(r.array&&!Object.getOwnPropertyDescriptor(r.input,'length').writable)lines.push('Object.defineProperty(n['+i+'],"length",{writable:false});');
 }
 for(const[i,r]of nodes.entries())if(!Object.isExtensible(r.input))lines.push('Object.preventExtensions(n['+i+']);');
 lines.push('export const '+exportName+'='+root+';','');
 return{code:lines.join('\n'),stats};
}
