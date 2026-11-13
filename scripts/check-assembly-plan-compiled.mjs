import fs from'node:fs';
import assert from'node:assert/strict';
import{compileAssemblyPlan}from'./build-assembly-plan.mjs';
import{compileDataModule}from'./assembly-plan-compiler.mjs';
const target=new URL('../dist/assembly-plan-compiled.js',import.meta.url),expected=await compileAssemblyPlan();
assert.equal(fs.readFileSync(target,'utf8'),expected.code,'Assembly plan data is stale: run npm run build:plan');
const{ASSEMBLY_PLAN:actual}=await import(target);
assert.deepStrictEqual(actual,expected.source);
function identicalGraph(a,b){
 const forwards=new Map(),backwards=new Map();let fields=0;
 function walk(x,y){
  if(x!==null&&typeof x==='object'){
   if(forwards.has(x)){assert.equal(forwards.get(x),y,'Shared operation object changed');return;}
   assert(!backwards.has(y),'Distinct operation objects merged');forwards.set(x,y);backwards.set(y,x);
   assert.equal(Object.getPrototypeOf(x),Object.getPrototypeOf(y));assert.equal(Object.isExtensible(x),Object.isExtensible(y));assert.deepEqual(Reflect.ownKeys(x),Reflect.ownKeys(y));
   for(const key of Reflect.ownKeys(x)){const dx=Object.getOwnPropertyDescriptor(x,key),dy=Object.getOwnPropertyDescriptor(y,key);for(const k of['writable','enumerable','configurable'])assert.equal(dx[k],dy[k]);walk(dx.value,dy.value);}
  }else{fields++;assert(Object.is(x,y),'Operation scalar changed');}
 }
 walk(a,b);return fields;
}
const fields=identicalGraph(expected.source,actual);
// These distinctions are easy for JSON serialization to erase silently.
const shared={x:-0,optional:undefined},sparse=new Array(3);sparse[1]=shared;
const fixture={first:shared,second:shared,sparse,plain:Object.assign(Object.create(null),{label:'test'})};
Object.defineProperty(fixture,'fixed',{value:4,enumerable:false,writable:false,configurable:false});Object.preventExtensions(fixture);
const encoded=compileDataModule(fixture,{exportName:'fixture'}),restored=await import('data:text/javascript;base64,'+Buffer.from(encoded.code).toString('base64'));
assert.deepStrictEqual(restored.fixture,fixture);identicalGraph(fixture,restored.fixture);
const ordinary={['__proto__']:{marker:42}},ordinaryCode=compileDataModule(ordinary,{exportName:'ordinary'});
const ordinaryRestored=await import('data:text/javascript;base64,'+Buffer.from(ordinaryCode.code).toString('base64'));
identicalGraph(ordinary,ordinaryRestored.ordinary);
for(const prototype of[null,{marker:42}])assert.throws(()=>compileDataModule(Object.setPrototypeOf([1,2],prototype)),/Unsupported array prototype/);
console.log(JSON.stringify({status:'PASS_COMPILED_ASSEMBLY_PLAN',flows:Object.fromEntries(Object.entries(actual).map(([key,flow])=>[key,Object.keys(flow).length])),fields,stats:expected.stats,exactGraph:true,fresh:true}));
