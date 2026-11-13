import fs from'node:fs';
import path from'node:path';
import{pathToFileURL}from'node:url';
import{register}from'node:module';
import{compileDataModule}from'./assembly-plan-compiler.mjs';
register(new URL('./three-loader.mjs',import.meta.url));
export async function compileAssemblyPlan(){
 const{ASSEMBLY_PLAN}=await import('./assembly-plan-source.mjs');
 return{...compileDataModule(ASSEMBLY_PLAN),source:ASSEMBLY_PLAN};
}
export async function buildAssemblyPlan(){
 const result=await compileAssemblyPlan(),target=new URL('../dist/assembly-plan-compiled.js',import.meta.url);
 const unchanged=fs.existsSync(target)&&fs.readFileSync(target,'utf8')===result.code;
 if(!unchanged)fs.writeFileSync(target,result.code);
 return{unchanged,bytes:Buffer.byteLength(result.code),stats:result.stats};
}
if(process.argv[1]&&pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url){
 const result=await buildAssemblyPlan();console.log(JSON.stringify({status:'BUILT_ASSEMBLY_PLAN_DATA',...result}));
}
