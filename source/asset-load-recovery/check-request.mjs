// SPDX-License-Identifier: MIT
import assert from'node:assert/strict';
import{requestAssetJSON,requestAssetBuffer,AssetRequestError}from'./runtime/asset-request.js';
let checks=0;const ok=(v,s)=>{assert(v,s);checks++;};
function fixture(sequence){const calls=[],waits=[],retries=[];return{calls,waits,retries,options:{fetcher:async(url,options)=>{calls.push({url,options});const x=sequence.shift();if(x instanceof Error)throw x;return x;},wait:async ms=>waits.push(ms),onRetry:s=>retries.push(s)}};}
{
 const f=fixture([new Response('{"ready":true}')]);assert.deepEqual(await requestAssetJSON('./model.json',f.options),{ready:true});ok(f.calls.length===1&&f.waits.length===0&&f.retries.length===0,'successful first input has no extra request or delay');ok(!('cache'in f.calls[0].options),'first request retains normal browser caching');
}
for(const status of[408,425,429,500,502,503,504]){
 const f=fixture([new Response('temporary',{status}),new Response('{"v":2}')]);assert.deepEqual(await requestAssetJSON('./model.json',f.options),{v:2});ok(f.calls.length===2&&f.calls[1].options.cache==='reload','transient response retries with cache reload');ok(f.waits[0]===300&&f.retries[0].attempt===2&&f.retries[0].maxAttempts===3&&f.retries[0].status===status,'progress shows next bounded attempt');
}
for(const status of[400,401,403,404,410,422]){
 const f=fixture([new Response('permanent',{status})]);await assert.rejects(requestAssetJSON('./model.json',f.options),e=>e instanceof AssetRequestError&&e.status===status&&e.attempts===1);ok(f.calls.length===1&&!f.waits.length,'permanent response stays visible without retry');
}
{
 const f=fixture([new TypeError('Failed to fetch'),new TypeError('Failed to fetch'),new Response('{"v":3}')]);assert.deepEqual(await requestAssetJSON('./model.json',f.options),{v:3});ok(f.calls.length===3&&f.waits.join(',')==='300,900','network errors have a finite three-attempt budget');
 const end=fixture(Array.from({length:3},()=>new Response('busy',{status:503})));await assert.rejects(requestAssetJSON('./model.json',end.options),e=>e.status===503&&e.attempts===3);ok(end.calls.length===3&&end.waits.length===2,'exhaustion ends at the original caller error path');
}
{
 const f=fixture([new Response('bad json')]);await assert.rejects(requestAssetJSON('./model.json',f.options),SyntaxError);ok(f.calls.length===1&&!f.waits.length,'JSON syntax errors do not trigger network retries');
 const bad=fixture([new Error('Application failure')]);await assert.rejects(requestAssetJSON('./model.json',bad.options),/Application failure/);ok(bad.calls.length===1,'non-network exceptions preserve their identity');
}
{
 const f=fixture([{ok:true,status:200,text:async()=>{throw new TypeError('Response stream interrupted');}},new Response('{"v":4}')]);assert.deepEqual(await requestAssetJSON('./model.json',f.options),{v:4});ok(f.calls.length===2,'interrupted successful response body can be fetched again');
 const f2=fixture([new Response(new Uint8Array([1,2,3]))]);assert.deepEqual(new Uint8Array(await requestAssetBuffer('./model.stl',f2.options)),new Uint8Array([1,2,3]));checks++;
}
for(const [header,expected]of[['2',2000],['100',3000],['Mon, 01 Jan 2100 00:00:00 GMT',3000],['invalid',300]]){
 const f=fixture([new Response('',{status:429,headers:{'Retry-After':header}}),new Response('{}')]);await requestAssetJSON('./model.json',f.options);ok(f.waits[0]===expected,'Retry-After is honored within the bounded delay');
}
{
 const controller=new AbortController();controller.abort();const f=fixture([]);await assert.rejects(requestAssetJSON('./model.json',{...f.options,signal:controller.signal}),e=>e.name==='AbortError');ok(f.calls.length===0,'already disposed owner never starts a request');
 const c=new AbortController(),g=fixture([new TypeError('Network')]);g.options.onRetry=()=>c.abort();await assert.rejects(requestAssetJSON('./model.json',{...g.options,signal:c.signal,wait:async()=>{c.signal.throwIfAborted();}}),e=>e.name==='AbortError');ok(g.calls.length===1,'aborting the owner cancels the next retry');
 const h=fixture([new DOMException('Canceled','AbortError')]);await assert.rejects(requestAssetJSON('./model.json',h.options),e=>e.name==='AbortError');ok(h.calls.length===1&&!h.waits.length,'fetch cancellation is never retried');
}
{
 const c=new AbortController(),f=fixture([{ok:false,status:404,body:{cancel:async()=>c.abort()}}]);await assert.rejects(requestAssetJSON('./model.json',{...f.options,signal:c.signal}),e=>e.name==='AbortError');ok(f.calls.length===1,'cancellation while releasing a failed response retains cancellation identity');
 const d=new AbortController();let calls=0;await assert.rejects(requestAssetJSON('./model.json',{signal:d.signal,fetcher:async()=>{calls++;throw new TypeError('Network');},onRetry:()=>setTimeout(()=>d.abort(),0)}),e=>e.name==='AbortError');ok(calls===1,'default retry wait responds to cancellation without another request');
}
const result={status:'PASS_BOUNDED_ASSET_REQUESTS',checks,scope:'Injected Fetch responses and errors, real Response bodies, deterministic delay seam; no claim of a browser fault injection.'};console.log(JSON.stringify(result));
