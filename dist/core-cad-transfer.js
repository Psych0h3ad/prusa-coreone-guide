export const CAD_TRANSPORT=Object.freeze({"original":"./assets/core-one.glb","compressed":"./assets/core-one.6751d7b3996e55f7.glb.gz","decodedBytes":12864536,"compressedBytes":9107093,"sha256":"6751d7b3996e55f7ff0e99b8ee8f44d9670208ce3c9346601ba03af3cbd9d528"});

async function readModel(response,onProgress){
 if(!response.ok||!response.body)throw Error('CAD transport unavailable');
 const reader=response.body.getReader(),initial=[];let loaded=0,total=Number(response.headers.get('content-length'))||CAD_TRANSPORT.compressedBytes;
 const progress=()=>onProgress?.({lengthComputable:total>0,loaded,total});
 try{
  while(loaded<4){const row=await reader.read();if(row.done)throw Error('Incomplete CAD transport');initial.push(row.value);loaded+=row.value.byteLength;}
  const prefix=new Uint8Array(4);let offset=0;for(const part of initial){const n=Math.min(4-offset,part.length);prefix.set(part.subarray(0,n),offset);offset+=n;if(offset===4)break;}
  const gzip=prefix[0]===0x1f&&prefix[1]===0x8b,glb=prefix[0]===0x67&&prefix[1]===0x6c&&prefix[2]===0x54&&prefix[3]===0x46;
  if(!gzip&&!glb)throw Error('Invalid CAD transport');
  // Some hosts decode Content-Encoding before exposing the response body.
  if(glb)total=CAD_TRANSPORT.decodedBytes;
  progress();
  const stream=new ReadableStream({
   start(controller){for(const part of initial)controller.enqueue(part);},
   async pull(controller){try{const row=await reader.read();if(row.done){controller.close();return;}loaded+=row.value.byteLength;progress();controller.enqueue(row.value);}catch(error){controller.error(error);}},
   cancel(reason){return reader.cancel(reason);}
  });
  const decoded=gzip?stream.pipeThrough(new DecompressionStream('gzip')):stream,buffer=await new Response(decoded).arrayBuffer(),view=new DataView(buffer);
  if(buffer.byteLength!==CAD_TRANSPORT.decodedBytes||view.getUint32(0,true)!==0x46546c67||view.getUint32(4,true)!==2||view.getUint32(8,true)!==buffer.byteLength)throw Error('Incomplete CAD model');
  if(globalThis.crypto?.subtle){const digest=new Uint8Array(await crypto.subtle.digest('SHA-256',buffer)),hash=Array.from(digest,n=>n.toString(16).padStart(2,'0')).join('');if(hash!==CAD_TRANSPORT.sha256)throw Error('CAD model checksum mismatch');}
  return buffer;
 }catch(error){await reader.cancel(error).catch(()=>{});throw error;}
}

export async function loadCoreCAD(loader,onProgress){
 const original=new URL(CAD_TRANSPORT.original,import.meta.url).href;
 if(typeof DecompressionStream!=='function')return loader.loadAsync(original,onProgress);
 let buffer;
 try{buffer=await readModel(await fetch(new URL(CAD_TRANSPORT.compressed,import.meta.url)),onProgress);}
 catch{return loader.loadAsync(original,onProgress);}
 return loader.parseAsync(buffer,new URL('./assets/',import.meta.url).href);
}
