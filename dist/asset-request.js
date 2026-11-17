// SPDX-License-Identifier: MIT
// Copyright (c) CORE One Community Guide contributors
// Bounded retries for idempotent local model inputs. Parsing failures are final.
const transient=new Set([408,425,429,500,502,503,504]);
export class AssetRequestError extends Error{
 constructor(url,status,attempts,cause){super(`Model input request failed (${status??'network'}, ${attempts} attempts): ${url}`,cause?{cause}:undefined);this.name='AssetRequestError';this.url=String(url);this.status=status??null;this.attempts=attempts;}
}
function stopped(signal){if(signal?.aborted)throw signal.reason??new DOMException('Aborted','AbortError');}
function pause(ms,signal){return new Promise((resolve,reject)=>{stopped(signal);const finish=()=>{signal?.removeEventListener('abort',abort);resolve();},timer=setTimeout(finish,ms),abort=()=>{clearTimeout(timer);signal.removeEventListener('abort',abort);reject(signal.reason??new DOMException('Aborted','AbortError'));};signal?.addEventListener('abort',abort,{once:true});});}
function delay(response,attempt){const raw=response?.headers?.get?.('Retry-After'),seconds=raw?.trim()?Number(raw):NaN,date=raw&&!Number.isFinite(seconds)?Date.parse(raw):NaN;return Number.isFinite(seconds)&&seconds>=0?Math.min(3000,seconds*1000):Number.isFinite(date)?Math.max(0,Math.min(3000,date-Date.now())):attempt===1?300:900;}
async function request(url,kind,{signal,onRetry,fetcher=globalThis.fetch,wait=pause}={}){
 const maxAttempts=3;
 for(let attempt=1;attempt<=maxAttempts;attempt++){
  stopped(signal);let response,cause,status=null,retry=false;
  try{response=await fetcher(url,{signal,...(attempt>1?{cache:'reload'}:{})});}
  catch(error){stopped(signal);if(error?.name==='AbortError')throw error;if(!(error instanceof TypeError))throw error;cause=error;retry=true;}
  if(response){
   status=response.status;
   if(response.ok){
    // The browser can lose the connection after receiving successful headers.
    // A syntax error in a fully read JSON document is not a network retry.
    let body;
    try{body=kind==='json'?await response.text():await response.arrayBuffer();}
    catch(error){stopped(signal);if(error?.name==='AbortError')throw error;if(!(error instanceof TypeError))throw error;cause=error;retry=true;}
    if(!retry){stopped(signal);return kind==='json'?JSON.parse(body):body;}
   }else{
    retry=transient.has(status);
    // Release a failed response before another attempt; do not read its payload.
    try{await response.body?.cancel();}catch{}
   }
  }
  stopped(signal);if(!retry||attempt===maxAttempts)throw new AssetRequestError(url,status,attempt,cause);
  const waitMS=delay(response,attempt);stopped(signal);onRetry?.({attempt:attempt+1,maxAttempts,waitMS,status,url:String(url)});await wait(waitMS,signal);
 }
}
export const requestAssetJSON=(url,options)=>request(url,'json',options);
export const requestAssetBuffer=(url,options)=>request(url,'buffer',options);
