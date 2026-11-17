import fs from'node:fs';import{fileURLToPath}from'node:url';
const D=new URL('../../dist/',import.meta.url);
export async function resolve(s,c,next){if(s==='three')return{url:new URL('vendor/three.module.js',D).href,shortCircuit:true};return next(s,c);}
export async function load(u,c,next){if(u.startsWith(D.href)&&new URL(u).pathname.endsWith('.js'))return{format:'module',source:fs.readFileSync(fileURLToPath(u),'utf8'),shortCircuit:true};return next(u,c);}
