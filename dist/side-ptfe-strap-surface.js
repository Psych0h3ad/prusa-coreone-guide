import * as T from 'three';

// A broad textile strip bends across its width as well as along its length.
// A single quad across 10 mm would cut through a curved bundle even when
// both edges were outside it. Preserve a fixed grid of 1 mm wide cells.
export function refineStrapSurface(source,segments,tailSegments,stride,headOffset){
 const a=[],b=[],weights=[],indices=[],uv=[];
 const add=(i,j,w,u=0,v=0)=>{const k=a.length;a.push(i);b.push(j);weights.push(w);uv.push(u,v);return k;};
 const ribbon=(offset,count)=>{
  for(let face=0;face<4;face++){
   const n=face%2?1:10,base=a.length;
   for(let row=0;row<=count;row++)for(let col=0;col<=n;col++){const i=offset+row*stride+face*2;add(i,i+1,col/n,col/n*(face%2?.325:5),row/count*50);}
   for(let row=0;row<count;row++)for(let col=0;col<n;col++){const i=base+row*(n+1)+col,j=i+n+1;indices.push(i,i+1,j,i+1,j+1,j);}
  }
  for(const row of [0,count]){
   const base=a.length,o=offset+row*stride;
   // End cuts follow the same1mm width cells as the curved broad faces.
   for(let col=0;col<=10;col++){add(o,o+1,col/10);add(o+4,o+5,(10-col)/10);}
   for(let col=0;col<10;col++){const a=base+col*2,b=a+1,c=a+2,d=a+3;if(!row)indices.push(a,d,c,a,b,d);else indices.push(a,c,d,a,d,b);}
  }
 };
 ribbon(0,segments);ribbon((segments+1)*stride,tailSegments);
 const base=a.length;for(let i=headOffset;i<source.attributes.position.count;i++)add(i,i,0,source.attributes.uv.getX(i)/2,source.attributes.uv.getY(i)/2);
 for(const i of source.index.array)if(i>=headOffset)indices.push(base+i-headOffset);
 const geometry=new T.BufferGeometry();geometry.setIndex(indices);
 geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
 for(const name of ['position','normal'])geometry.setAttribute(name,new T.BufferAttribute(new Float32Array(a.length*3),3).setUsage(T.DynamicDrawUsage));
 return {geometry,a:new Uint32Array(a),b:new Uint32Array(b),weights:new Float32Array(weights)};
}
