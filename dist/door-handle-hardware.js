import * as T from 'three';
import{DOOR_HANDLE as d}from'./door-handle-data.js?v=20261113-119';
import{FINISHES}from'./cad-finishes.js?v=20261113-118';

export function createDoorHandlePlateGeometry(){
 const cx=(d.holes[0][0]+d.holes[1][0])/2,cz=(d.holes[0][1]+d.holes[1][1])/2,h=(d.holes[1][1]-d.holes[0][1])/2+d.endMargin,w=d.plateWidth/2,c=d.cornerChamfer;
 const outline=[[-w+c,-h],[w-c,-h],[w,-h+c],[w,h-c],[w-c,h],[-w+c,h],[-w,h-c],[-w,-h+c]],centres=d.holes.map(([x,z])=>[x-cx,z-cz]),pos=[],norm=[];
 const v=(p,z)=>new T.Vector3(p[0],p[1],z),Z=s=>new T.Vector3(0,0,s);
 function tri(a,b,c,na,nb=na,nc=na){const cross=b.clone().sub(a).cross(c.clone().sub(a)),n=na.clone().add(nb).add(nc);if(cross.dot(n)<0){[b,c]=[c,b];[nb,nc]=[nc,nb];}for(const q of[a,b,c])pos.push(q.x,q.y,q.z);for(const q of[na,nb,nc])norm.push(q.x,q.y,q.z);}
 function quad(a,b,c,e,na,nb=na,nc=na,ne=na){tri(a,b,c,na,nb,nc);tri(a,c,e,na,nc,ne);}
 const ring=(p,r)=>Array.from({length:d.segments},(_,i)=>{const a=i*Math.PI*2/d.segments;return new T.Vector2(p[0]+r*Math.cos(a),p[1]+r*Math.sin(a));});
 for(const[z,r,n]of[[0,d.boreRadius,-1],[d.plateThickness,d.bossRadius,1]]){
  const outer=outline.map(p=>new T.Vector2(...p)),holes=centres.map(p=>ring(p,r)),flat=[...outer,...holes.flat()];
  for(const f of T.ShapeUtils.triangulateShape(outer,holes))tri(...f.map(i=>v(flat[i].toArray(),z)),Z(n));
 }
 for(let i=0;i<outline.length;i++){const a=outline[i],b=outline[(i+1)%outline.length],n=new T.Vector3(b[1]-a[1],a[0]-b[0],0).normalize();quad(v(a,0),v(b,0),v(b,d.plateThickness),v(a,d.plateThickness),n);}
 const end=d.plateThickness+d.bossHeight;
 for(const p of centres){
  const inner=ring(p,d.boreRadius),outer=ring(p,d.bossRadius);
  for(let i=0;i<d.segments;i++){const j=(i+1)%d.segments,u=i*Math.PI*2/d.segments,t=j*Math.PI*2/d.segments,n=new T.Vector3(Math.cos(u),Math.sin(u),0),m=new T.Vector3(Math.cos(t),Math.sin(t),0);
   quad(v(outer[i].toArray(),d.plateThickness),v(outer[j].toArray(),d.plateThickness),v(outer[j].toArray(),end),v(outer[i].toArray(),end),n,m,m,n);
   quad(v(inner[i].toArray(),0),v(inner[j].toArray(),0),v(inner[j].toArray(),end),v(inner[i].toArray(),end),n.clone().negate(),m.clone().negate(),m.clone().negate(),n.clone().negate());
   quad(v(inner[i].toArray(),end),v(outer[i].toArray(),end),v(outer[j].toArray(),end),v(inner[j].toArray(),end),Z(1));
  }
 }
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('normal',new T.Float32BufferAttribute(norm,3));g.rotateX(Math.PI/2);g.scale(.001,.001,.001);return g;
}

// The published handle includes two separate adhesive pads used by the older
// glued version. The current screw-mounted version has the same metal body
// without those pads (manual 8.38). Retain the source mesh for the older version.
export function currentHandleGeometry(source){
 const p=source.attributes.position,ix=source.index,count=(ix?.count??p.count)/3,parent=Array.from({length:count},(_,i)=>i),vertices=new Map();
 const root=i=>{while(parent[i]!==i){parent[i]=parent[parent[i]];i=parent[i];}return i;};
 for(let f=0;f<count;f++)for(let k=0;k<3;k++){const i=ix?ix.getX(f*3+k):f*3+k,key=[p.getX(i),p.getY(i),p.getZ(i)].map(v=>Math.round(v*1e7)).join(',');if(vertices.has(key))parent[root(f)]=root(vertices.get(key));else vertices.set(key,f);}
 const groups=new Map();for(let f=0;f<count;f++){const key=root(f);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(f);}
 const components=[...groups.values()].sort((a,b)=>b.length-a.length);
 if(components.length!==3||components[0].length!==1660||components[1].length!==12||components[2].length!==12)throw Error('Unexpected source door handle components');
 const used=new Map(),order=[];for(const f of components[0])for(let k=0;k<3;k++){const i=ix?ix.getX(f*3+k):f*3+k;if(!used.has(i))used.set(i,used.size);order.push(used.get(i));}
 const g=new T.BufferGeometry();for(const[name,a]of Object.entries(source.attributes)){const values=new a.array.constructor(used.size*a.itemSize);for(const[old,i]of used)for(let k=0;k<a.itemSize;k++)values[i*a.itemSize+k]=a.array[old*a.itemSize+k];g.setAttribute(name,new T.BufferAttribute(values,a.itemSize,a.normalized));}g.setIndex(order);return g;
}

export function createDoorHandleHardware(meshes){
 const original=meshes.find(m=>m.userData.cadIndex===d.screwCAD);if(!original)throw Error('Missing source M3x8rT');
 const common={part:'door',componentOnly:true,assemblyVariant:'screw',preserveCadName:true,assemblySource:d.source};
 const plate=new T.Mesh(createDoorHandlePlateGeometry(),new T.MeshStandardMaterial(FINISHES.powder));
 plate.position.set((d.holes[0][0]+d.holes[1][0])/2000,(d.panelOuterY-d.plateGap)/1000,(d.holes[0][1]+d.holes[1][1])/2000);
 plate.userData={...common,component:'doorHandlePlate',cadName:'Door handle plate',geometryStatus:'reference-reconstruction',geometryPurpose:'Assembly illustration based on official photos and source mounting holes; envelope dimensions are assumptions, not manufacturing data.'};
 const screws=d.holes.map(([x,z],i)=>{const m=new T.Mesh(original.geometry.clone(),new T.MeshStandardMaterial(FINISHES.blackSteel));m.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),new T.Vector3(0,1,0));m.position.set(x/1000,(d.screwBearingY+d.screwHeadHeight)/1000,z/1000);m.userData={...common,component:'doorHandleScrew'+i,cadName:'M3x8rT',geometryStatus:'source-cad-instance',sourceCADIndex:d.screwCAD};return m;});
 const oldHandle=meshes.find(m=>m.userData.cadIndex===590);if(!oldHandle)throw Error('Missing source door handle');
 const body=new T.Mesh(currentHandleGeometry(oldHandle.geometry),oldHandle.material.clone());body.position.copy(oldHandle.position);body.quaternion.copy(oldHandle.quaternion);body.scale.copy(oldHandle.scale);
 body.userData={...common,componentOnly:false,component:'doorHandleBodyCurrent',cadPath:[...oldHandle.userData.cadPath],cadName:oldHandle.userData.cadName,geometryStatus:'source-cad-component',sourceCADIndex:590,geometryPurpose:'Original metal body without the two separate adhesive pads; current screw-mounted handle described in manual 8.38.'};oldHandle.userData.legacyDoorHandle=true;
 for(const m of[plate,...screws,body]){m.castShadow=true;m.receiveShadow=true;}return[plate,...screws,body];
}
