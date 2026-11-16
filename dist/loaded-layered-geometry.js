// Whole curved copper/jacket and full original terminal stock. Code MIT.
import * as T from 'three';
import {createLeafBuffers,rewriteLeaf} from './loaded-contact-state.js';
import {loadedCurvedAssets} from './loaded-curved-assets.js';
const unit=.001;
export function makeLoadedMaterials(jacket){const make=(color,metalness)=>{const m=new T.MeshStandardMaterial({color,metalness,roughness:.4});m.userData.originalOpacity=1;m.userData.originalColor=m.color.clone();return m;};return[jacket,make('#ba7844',.7),make('#aeb6bc',.75)];}
export function extendLayeredGeometry(g,{wires,samples,sides,winding=1,baseMaterials,sourceMaterialArray}){
 const old=g.attributes.position.count,per=(samples+1)*(sides+1),wireVertices=wires*per,housingCount=old-wireVertices,frame=loadedCurvedAssets().frame,leaf=createLeafBuffers(),layouts=[];if(housingCount<0)throw Error('Original wire/housing source range');let at=wireVertices;
 const reserve=n=>{const start=at;at+=n;return start;};
 for(let w=0;w<wires;w++)layouts.push({outer:w*per,inner:reserve(per),jacketCaps:reserve(4*(sides+1)),core:reserve(per+sides+1),coreCaps:reserve(2*(sides+1)+2),frame:reserve(frame.positions.length/3),leaf:reserve(leaf.positions.length/3),leafBuffers:createLeafBuffers()});
 const housingOffset=at;at+=housingCount;
 for(const[name,a]of Object.entries(g.attributes)){const array=new a.array.constructor(at*a.itemSize);array.set(a.array.subarray(0,wireVertices*a.itemSize));array.set(a.array.subarray(wireVertices*a.itemSize),housingOffset*a.itemSize);g.setAttribute(name,new T.BufferAttribute(array,a.itemSize,a.normalized).setUsage(T.DynamicDrawUsage));}
 const indices=Array.from(g.index?.array??Array.from({length:old},(_,i)=>i),i=>i<wireVertices?i:housingOffset+i-wireVertices);if(!g.groups.length)g.addGroup(0,indices.length,0);g.userData.loadedShellOffset=housingOffset;
 const quad=(a,b,c,d,flip)=>indices.push(...(flip?[a,c,b,a,d,c]:[a,b,c,a,c,d]));
 const grid=(offset,flip,segments=samples)=>{for(let i=0;i<segments;i++)for(let j=0;j<sides;j++){const a=offset+i*(sides+1)+j,b=a+sides+1;quad(a,b,b+1,a+1,flip);}};
 for(let w=0;w<wires;w++){const l=layouts[w];let begin=indices.length;grid(l.inner,winding<0);for(let end=0;end<2;end++)for(let j=0;j<sides;j++){const o=l.jacketCaps+end*2*(sides+1),i=o+sides+1;quad(o+j,o+j+1,i+j+1,i+j,(end===0)===(winding>0));}g.addGroup(begin,indices.length-begin,sourceMaterialArray?w:0);
  begin=indices.length;grid(l.core,winding>0,samples+1);for(let end=0;end<2;end++){const o=l.coreCaps+end*(sides+2),centre=o+sides+1;for(let j=0;j<sides;j++)indices.push(...((end===1)===(winding>0)?[centre,o+j,o+j+1]:[centre,o+j+1,o+j]));}g.addGroup(begin,indices.length-begin,baseMaterials);
  begin=indices.length;for(let k=0;k<frame.positions.length/3;k++)indices.push(l.frame+k);for(let k=0;k<leaf.positions.length/3;k++)indices.push(l.leaf+k);g.addGroup(begin,indices.length-begin,baseMaterials+1);
 }
 g.setIndex(indices);return{g,layouts,samples,coreSamples:samples+1,sides,winding,frame,vertexCount:at,sourceVertexCount:old,sourceHousingOffset:wireVertices,housingOffset,housingCount,materials:baseMaterials};
}
function frames(curve,length,N,seed){const centres=[],tangents=[],rows=[];for(let i=0;i<=N;i++){const u=i/N*length/curve.getLength();centres.push(curve.getPointAt(u));tangents.push(curve.getTangentAt(u));}rows[0]=seed.clone().addScaledVector(tangents[0],-seed.dot(tangents[0])).normalize();if(rows[0].lengthSq()<.5)throw Error('Source radial frame became parallel to the conductor');
 for(let i=1;i<=N;i++){rows[i]=rows[i-1].clone().applyQuaternion(new T.Quaternion().setFromUnitVectors(tangents[i-1],tangents[i]));rows[i].addScaledVector(tangents[i],-rows[i].dot(tangents[i])).normalize();}return{centres,tangents,rows};}
export function writeLayeredGeometry(layout,{curves,radii,seeds,nativeFrame,slots,contactAngle,contactAngles=null}){
 const{g,samples:N,sides,layouts,winding,frame}=layout,p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv,point=new T.Vector3(),normal=new T.Vector3();
 const set=(i,c,nn,u=0,v=0)=>{p.setXYZ(i,c.x*unit,c.y*unit,c.z*unit);n.setXYZ(i,nn.x,nn.y,nn.z);uv?.setXY(i,u,v);};
 for(let w=0;w<curves.length;w++){const curve=curves[w],L=curve.getLength(),jacketL=L-1.7,l=layouts[w],r=radii[w],coreR=.22;if(coreR>=r)throw Error('Reference copper does not fit the retained wire OD');const jf=frames(curve,jacketL,N,seeds[w]),tip=curve.getPointAt(1);
  for(let i=0;i<=N;i++)for(let j=0;j<=sides;j++){const a=j/sides*2*Math.PI,up=jf.tangents[i].clone().cross(jf.rows[i]).multiplyScalar(winding);normal.copy(jf.rows[i]).multiplyScalar(Math.cos(a)).addScaledVector(up,Math.sin(a));point.copy(jf.centres[i]).addScaledVector(normal,r);set(l.outer+i*(sides+1)+j,point,normal,i/N,j/sides);point.copy(jf.centres[i]).addScaledVector(normal,coreR);set(l.inner+i*(sides+1)+j,point,normal.clone().negate(),i/N,j/sides);
   // The copper and jacket inner wall share the SAME material samples and
   // radial phase. Independent whole-length grids can pierce a thin jacket.
   set(l.core+i*(sides+1)+j,point,normal,i/N*jacketL/L,j/sides);
  }
  // The exposed1.7mm lies in the declared straight terminal-entry segment.
  // One additional tip ring extends the existing full copper stock once.
  for(let j=0;j<=sides;j++){const a=j/sides*2*Math.PI,up=jf.tangents[N].clone().cross(jf.rows[N]).multiplyScalar(winding);normal.copy(jf.rows[N]).multiplyScalar(Math.cos(a)).addScaledVector(up,Math.sin(a));point.copy(tip).addScaledVector(normal,coreR);set(l.core+(N+1)*(sides+1)+j,point,normal,1,j/sides);}
  for(let end=0;end<2;end++){const i=end?N:0,capNormal=jf.tangents[i].clone().multiplyScalar(end?1:-1),coreNormal=capNormal,base=l.jacketCaps+end*2*(sides+1),coreBase=l.coreCaps+end*(sides+2);
   for(let j=0;j<=sides;j++){const a=j/sides*2*Math.PI,up=jf.tangents[i].clone().cross(jf.rows[i]).multiplyScalar(winding),radial=jf.rows[i].clone().multiplyScalar(Math.cos(a)).addScaledVector(up,Math.sin(a));set(base+j,jf.centres[i].clone().addScaledVector(radial,r),capNormal,end,j/sides);set(base+sides+1+j,jf.centres[i].clone().addScaledVector(radial,coreR),capNormal,end,j/sides);
    const source=l.core+end*(N+1)*(sides+1)+j;for(let k=0;k<3;k++)p.array[(coreBase+j)*3+k]=p.array[source*3+k];n.setXYZ(coreBase+j,coreNormal.x,coreNormal.y,coreNormal.z);uv?.setXY(coreBase+j,end,j/sides);
   }set(coreBase+sides+1,end?tip:jf.centres[0],coreNormal,end,.5);
  }
  for(let k=0;k<frame.positions.length/3;k++){point.fromArray(frame.positions,k*3);point.x+=slots[w];point.y+=.05;point.applyMatrix4(nativeFrame);normal.fromArray(frame.normals,k*3).transformDirection(nativeFrame);set(l.frame+k,point,normal,frame.positions[k*3],frame.positions[k*3+1]);}
  rewriteLeaf(l.leafBuffers,contactAngles?.[w]??contactAngle);for(let k=0;k<l.leafBuffers.positions.length/3;k++){point.fromArray(l.leafBuffers.positions,k*3);point.x+=slots[w];point.y+=.05;point.applyMatrix4(nativeFrame);normal.fromArray(l.leafBuffers.normals,k*3).transformDirection(nativeFrame);set(l.leaf+k,point,normal,l.leafBuffers.coordinates[k*3],l.leafBuffers.coordinates[k*3+1]);}
 }
 p.needsUpdate=n.needsUpdate=true;if(uv)uv.needsUpdate=true;g.computeBoundingBox();g.computeBoundingSphere();
}
