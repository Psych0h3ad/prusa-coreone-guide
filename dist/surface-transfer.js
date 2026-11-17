// SPDX-License-Identifier: MIT
// Shared by the page and its workers; no renderer or DOM dependency.
export async function readSurfaceBuffer(url,{rawURL,decodedBytes,sha256}={},signal){
 const fetchBuffer=async target=>{const response=await fetch(target,{signal});if(!response.ok)throw Error('Surface data could not be loaded');return response.arrayBuffer();};
 let buffer=await fetchBuffer(url),prefix=new Uint8Array(buffer,0,Math.min(2,buffer.byteLength));
 if(prefix[0]===0x1f&&prefix[1]===0x8b){
  if(typeof DecompressionStream==='function')buffer=await new Response(new Blob([buffer]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
  else if(rawURL)buffer=await fetchBuffer(rawURL);
  else throw Error('Uncompressed surface data is unavailable');
 }
 if(signal?.aborted)throw new DOMException('Preparation stopped','AbortError');
 if(!Number.isSafeInteger(decodedBytes)||decodedBytes<1||buffer.byteLength!==decodedBytes)throw Error('Incomplete surface data');
 if(sha256&&globalThis.crypto?.subtle){const bytes=new Uint8Array(await crypto.subtle.digest('SHA-256',buffer)),actual=Array.from(bytes,n=>n.toString(16).padStart(2,'0')).join('');if(actual!==sha256)throw Error('Surface data checksum mismatch');}
 return buffer;
}
