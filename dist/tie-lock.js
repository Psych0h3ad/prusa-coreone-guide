import * as T from 'three';

// A single moulded shell. The feed opening has a small lead-in on both faces;
// its narrowest section remains 2.6 x 1.7 mm for the 2.4 x 0.5 mm strip.
// Coordinates: X = strip width, Y = feed, Z = lock height, in millimetres.
export function createTieLockGeometry(width=2.4){
 const inner=width+.2,outer=inner+2,positions=[],indices=[],count=32;
 const rectangle=(w,h,z,r)=>{
  const out=[];
  for(const [cx,cz,start]of [[w/2-r,z+h/2-r,0],[-w/2+r,z+h/2-r,90],[-w/2+r,z-h/2+r,180],[w/2-r,z-h/2+r,270]])
   for(let i=0;i<8;i++){const a=(start+i/7*90)*Math.PI/180;out.push([cx+r*Math.cos(a),cz+r*Math.sin(a)]);}
  return out;
 };
 const sections=[[-1.7,.18,.15],[-1.48,0,0],[1.48,0,0],[1.7,.18,.15]];
 for(const [y,inset,flare]of sections){
  for(const [x,z]of rectangle(outer-inset*2,3.55-inset*2,.975,Math.max(.12,.38-inset)))positions.push(x,y,z);
  for(const [x,z]of rectangle(inner+flare*2,1.7+flare*2,1,.12+flare))positions.push(x,y,z);
 }
 const face=(a,b,c,d,reverse=false)=>{if(reverse)indices.push(a,d,b,b,d,c);else indices.push(a,b,d,b,c,d);};
 for(let s=0;s<3;s++)for(let i=0;i<count;i++){const j=(i+1)%count,lo=s*count*2,hi=lo+count*2;face(lo+i,lo+j,hi+j,hi+i,true);face(lo+count+i,lo+count+j,hi+count+j,hi+count+i);}
 for(const s of [0,3])for(let i=0;i<count;i++){const j=(i+1)%count,o=s*count*2;face(o+i,o+count+i,o+count+j,o+j,s===0);}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();return g;
}

// The slot is cut into the widened textile end. It is not a separate buckle.
export function createStrapBuckleGeometry(width){
 const rounded=(shape,w,h,r)=>{const x=-w/2,y=-h/2;shape.moveTo(x+r,y);shape.lineTo(x+w-r,y);shape.quadraticCurveTo(x+w,y,x+w,y+r);shape.lineTo(x+w,y+h-r);shape.quadraticCurveTo(x+w,y+h,x+w-r,y+h);shape.lineTo(x+r,y+h);shape.quadraticCurveTo(x,y+h,x,y+h-r);shape.lineTo(x,y+r);shape.quadraticCurveTo(x,y,x+r,y);return shape;};
 const shape=rounded(new T.Shape(),width+3.4,3.2,1.4);
 shape.holes.push(rounded(new T.Path(),width+.8,2,.3));
 const source=new T.ExtrudeGeometry(shape,{depth:.65,bevelEnabled:false,curveSegments:8,steps:1}),positions=[],uv=[];
 // The textile eye bends across its width with the bundle, including its
 // faces around the slit. Long cap triangles would cut across that bend.
 const clip=(poly,x,greater)=>{const out=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],inside=p=>greater?p.x>=x-1e-9:p.x<=x+1e-9,ia=inside(a),ib=inside(b);if(ia)out.push(a);if(ia!==ib)out.push(a.clone().lerp(b,(x-a.x)/(b.x-a.x)));}return out;};
 const p=source.attributes.position;
 for(let i=0;i<p.count;i+=3){const triangle=[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(p,i+j)),lo=Math.floor(Math.min(...triangle.map(p=>p.x))),hi=Math.ceil(Math.max(...triangle.map(p=>p.x)));
  for(let x=lo;x<hi;x++){const poly=clip(clip(triangle,x,true),x+1,false);for(let j=1;j<poly.length-1;j++){if(poly[j].clone().sub(poly[0]).cross(poly[j+1].clone().sub(poly[0])).lengthSq()<1e-16)continue;for(const q of [poly[0],poly[j],poly[j+1]]){positions.push(q.x,q.y,q.z);uv.push(q.x,q.y);}}}
 }
 source.dispose();const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(Array.from({length:positions.length/3},(_,i)=>i));return g;
}
