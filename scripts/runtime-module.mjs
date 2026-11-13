import fs from 'node:fs';
const source=['app','viewer'].map(name=>fs.readFileSync(new URL('../dist/'+name+'.js',import.meta.url),'utf8')).join('\n');
// Use the shipped entry points' module identities, including their cache keys.
export function runtimeModule(name){
 if(!/^[a-z0-9-]+$/.test(name))throw Error('Invalid runtime module');
 const entryName=name==='assembly-plan'?'assembly-plan-runtime':name;
 const match=source.match(new RegExp("['\"]\\./("+entryName+"\\.js[^'\"]*)['\"]"));
 if(!match)throw Error('Viewer does not import '+name);
 return import(new URL('../dist/'+match[1],import.meta.url));
}
