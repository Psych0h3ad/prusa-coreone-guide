// SPDX-License-Identifier: MIT
import {readSurfaceBuffer} from './surface-transfer.js?v=20261117-187';
self.onmessage=async({data})=>{const{id,url,options}=data;try{const buffer=await readSurfaceBuffer(url,options);self.postMessage({id,buffer},[buffer]);}catch(error){self.postMessage({id,error:{name:error.name,message:error.message}});}};
