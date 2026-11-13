const pending=new Map();
async function responseBytes(url){const response=await fetch(url);if(!response.ok)throw Error('Cable data unavailable');return new Uint8Array(await response.arrayBuffer());}
async function checked(buffer,spec){
 if(buffer.byteLength!==spec.bytes)throw Error('Incomplete cable data');
 if(globalThis.crypto?.subtle){const digest=new Uint8Array(await crypto.subtle.digest('SHA-256',buffer)),hex=Array.from(digest,n=>n.toString(16).padStart(2,'0')).join('');if(hex!==spec.sha256)throw Error('Cable data checksum mismatch');}
 return new Float64Array(buffer);
}
async function load(spec){
 if(typeof DecompressionStream==='function'){
  try{
   let packed=await responseBytes(spec.compressed);
   // Hosts may already decode Content-Encoding before exposing the body.
   if(packed[0]===0x1f&&packed[1]===0x8b)packed=new Uint8Array(await new Response(new Blob([packed]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer());
   if(packed.length!==spec.bytes+16)throw Error('Incomplete packed cable data');
   const header=new DataView(packed.buffer,packed.byteOffset,16),count=spec.bytes/8;
   if(header.getUint32(0,true)!==0x31464252||header.getUint32(4,true)!==count||header.getUint32(8,true)!==spec.stride||header.getUint32(12,true)!==spec.bytes)throw Error('Invalid packed cable data');
   const bytes=new Uint8Array(spec.bytes);
   for(let p=0;p<8;p++){const start=16+p*count;for(let i=0;i<count;i++)bytes[i*8+p]=packed[start+i];}
   const stride=spec.stride*8;for(let i=stride;i<bytes.length;i++)bytes[i]^=bytes[i-stride];
   return await checked(bytes.buffer,spec);
  }catch{}
 }
 const bytes=await responseBytes(spec.original);return checked(bytes.buffer,spec);
}
export function loadRouteBank(spec){const key=spec.original.href;let job=pending.get(key);if(!job){job=load(spec);pending.set(key,job);}return job;}
