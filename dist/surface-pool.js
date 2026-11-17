// SPDX-License-Identifier: MIT
import {readSurfaceBuffer} from './surface-transfer.js?v=20261117-187';
export function surfaceConcurrency(){
 const cores=Number(globalThis.navigator?.hardwareConcurrency)||2,memory=Number(globalThis.navigator?.deviceMemory),coarse=globalThis.matchMedia?.('(pointer:coarse)').matches;
 return coarse||memory>0&&memory<=4||cores<4?1:2;
}
export function createSurfacePool({concurrency=surfaceConcurrency(),onActivity=()=>{}}={}){
 const limit=Math.max(1,Math.min(2,Math.floor(concurrency)||1)),queue=[],slots=Array.from({length:limit},()=>({worker:null,job:null,failed:false}));let closed=false,sequence=0,completed=0,decodedBytes=0;
 const stats=()=>({active:slots.filter(s=>s.job).length,limit,workerActive:slots.filter(s=>s.job&&s.worker).length,workers:slots.filter(s=>s.worker).length,queued:queue.length,completed,decodedBytes,closed});
 const notify=()=>{try{onActivity(stats());}catch{}};
 function settle(slot,error,buffer){const job=slot.job;if(!job)return;slot.job=null;job.controller=null;if(!closed&&!error){completed++;decodedBytes+=buffer.byteLength;job.resolve(buffer);}else job.reject(error||new DOMException('Preparation stopped','AbortError'));notify();pump();}
 function main(slot){const job=slot.job;if(!job)return;job.controller=new AbortController();readSurfaceBuffer(job.url,job.options,job.controller.signal).then(buffer=>settle(slot,null,buffer),error=>settle(slot,error));}
 function worker(slot){
  if(slot.failed||typeof Worker!=='function')return false;
  try{
   if(!slot.worker){
    const w=new Worker(new URL('./surface-worker.js?v=20261117-187',import.meta.url),{type:'module'});slot.worker=w;
    w.onmessage=({data})=>{if(closed||w!==slot.worker||data.id!==slot.job?.id)return;if(data.error)settle(slot,Object.assign(new Error(data.error.message),{name:data.error.name}));else if(data.buffer instanceof ArrayBuffer)settle(slot,null,data.buffer);else settle(slot,new Error('Invalid surface worker response'));};
    w.onerror=event=>{event.preventDefault?.();if(w!==slot.worker)return;w.terminate();slot.worker=null;slot.failed=true;if(!closed&&slot.job)main(slot);notify();};
   }
   const job=slot.job;slot.worker.postMessage({id:job.id,url:job.url,options:job.options});return true;
  }catch{slot.worker?.terminate();slot.worker=null;slot.failed=true;return false;}
 }
 function pump(){if(closed)return;for(const slot of slots){if(slot.job||!queue.length)continue;slot.job=queue.shift();if(!worker(slot))main(slot);}notify();}
 return{
  read(url,options={}){if(closed)return Promise.reject(new DOMException('Preparation stopped','AbortError'));return new Promise((resolve,reject)=>{queue.push({id:++sequence,url:String(url),options,resolve,reject});pump();});},
  get stats(){return stats();},
  dispose(){if(closed)return;closed=true;const error=new DOMException('Preparation stopped','AbortError');for(const job of queue.splice(0))job.reject(error);for(const slot of slots){slot.worker?.terminate();slot.worker=null;const job=slot.job;slot.job=null;if(job){job.controller?.abort();job.reject(error);}}notify();}
 };
}
