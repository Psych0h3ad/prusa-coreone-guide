import * as T from 'three';
import {bedTerminalBodyReference} from './heatbed-terminal-geometry.js';

const triangleKey=(array,face)=>Array.from(new Uint32Array(array.buffer,array.byteOffset+face*36,9)).join(':');

// Address complete authored component surfaces, including the blind bores.
// Electronics supplies the same source record used to build the live batch.
export function replaceCanonicalTerminalBodies(viewer){
 const meshes=viewer.meshes.filter(m=>m.name==='xBuddy / dark');
 if(meshes.length!==1)throw Error('One canonical xBuddy terminal batch required');
 const mesh=meshes[0],source=mesh.geometry,board=mesh.userData.electronicsSource;
 if(!board||board.key!=='xBuddy'||source.index||source.groups.length)throw Error('Canonical electronics component provenance required');
 const position=source.attributes.position;
 if(!position||position.itemSize!==3||!(position.array instanceof Float32Array)||position.count%3)throw Error('Full Float32 source triangles required');
 if(source.drawRange.start!==0||(Number.isFinite(source.drawRange.count)&&source.drawRange.count!==position.count))throw Error('Full terminal source draw range required');
 const components=board.components.map((component,index)=>({component,index})).filter(r=>r.component.kind==='terminal');
 if(components.length!==6)throw Error('Six authored terminal components required');
 const transform=new T.Matrix4().set(-.001,0,0,board.origin[0]/1000,0,0,.001,board.origin[1]/1000,0,-.001,0,board.origin[2]/1000,0,0,0,1);
 const faces=new Map();
 for(let f=0;f<position.count/3;f++){const key=triangleKey(position.array,f);if(!faces.has(key))faces.set(key,[]);faces.get(key).push(f);}
 const selected=new Set(),provenance=[];
 for(const {component,index} of components){
  let geometry;
  if(index===38||index===39)geometry=bedTerminalBodyReference(component);
  else {
   const [x0,y0,x1,y1]=component.rect;
   const box=new T.BoxGeometry(Math.abs(x1-x0),Math.abs(y1-y0),component.height);
   box.translate((x0+x1)/2,(y0+y1)/2,component.height/2);
   geometry=box.toNonIndexed();box.dispose();
  }
  try {
   geometry.applyMatrix4(transform);
   const array=geometry.attributes.position.array,sourceFaces=[];
   // Match the renderer's handedness correction without changing its values.
   for(let i=0;i<array.length;i+=9)for(let d=0;d<3;d++){const value=array[i+3+d];array[i+3+d]=array[i+6+d];array[i+6+d]=value;}
   for(let f=0;f<array.length/9;f++){
    const candidates=faces.get(triangleKey(array,f));
    if(candidates?.length!==1||selected.has(candidates[0]))throw Error('Complete terminal source correspondence is not unique: '+index+'/'+f);
    selected.add(candidates[0]);sourceFaces.push(candidates[0]);
   }
   provenance.push({component:index,sourceFaces});
  }finally{geometry.dispose();}
 }
 const removed=[...selected].sort((a,b)=>a-b),kept=Array.from({length:position.count/3},(_,i)=>i).filter(i=>!selected.has(i));
 const replacement=new T.BufferGeometry();
 try {
  for(const [name,attribute] of Object.entries(source.attributes)){
   if(!attribute.array||attribute.isInterleavedBufferAttribute||attribute.count!==position.count)throw Error('Uniform source attributes required');
   const data=new attribute.array.constructor(kept.length*3*attribute.itemSize);let offset=0;
   for(const face of kept){const first=face*3*attribute.itemSize;data.set(attribute.array.subarray(first,first+3*attribute.itemSize),offset);offset+=3*attribute.itemSize;}
   replacement.setAttribute(name,new T.BufferAttribute(data,attribute.itemSize,attribute.normalized));
  }
  replacement.computeBoundingBox();replacement.computeBoundingSphere();
 }catch(error){replacement.dispose();throw error;}
 mesh.geometry=replacement;
 return {mesh,source,replacement,removed,kept,counts:provenance.map(r=>r.sourceFaces.length),provenance};
}
