import * as T from 'three';
import {HEATBED_ASSEMBLY as D} from './heatbed-assembly-data.js';
import {V,Q,ArcCurve} from './heatbed-material-curves.js';
const baseDirection=(route,L,fan)=>route.getTangentAt((L-fan)/L);
const material=color=>{const m=new T.MeshStandardMaterial({color,roughness:.75});m.userData.originalOpacity=1;m.userData.originalColor=m.color.clone();return m;};
export function signalMaterials(kind){return(kind==='rgb'?['#303332','#f2eee5','#d85a43','#6b934e','#455e98','#c59247','#524f4a','#e7dfcf']:['#303332','#303332','#303332','#e7dfcf','#43844b','#f2f1e8']).map(material);}
// Distribute the same 512 jacket segments by actual longitudinal curvature.
// The neutral material span and every full-radius ring remain unchanged.
function jacketCurve(route,length){
 const count=4096,points=Array.from({length:count+1},(_,i)=>route.getPointAt(length/route.getLength()*i/count)),weights=[0];
 for(let i=1;i<=count;i++){const a=points[i].clone().sub(points[i-1]),b=points[Math.min(count,i+1)].clone().sub(points[Math.max(0,i-1)]),k=i<count?a.angleTo(points[i+1].clone().sub(points[i]))/Math.max(1e-8,a.length()):0;weights.push(weights.at(-1)+Math.max(.03,Math.sqrt(Math.max(0,k)))*length/count);}
 const stations=Array.from({length:513},(_,i)=>{const w=weights.at(-1)*i/512;let lo=0,hi=count;while(hi-lo>1){const m=(lo+hi)>>1;if(weights[m]<w)lo=m;else hi=m;}return(length/count)*(lo+(w-weights[lo])/(weights[hi]-weights[lo]));});
 class MaterialJacket extends T.Curve{
  getPointAt(t,out=new T.Vector3()){const f=Math.max(0,Math.min(1,t))*512,k=Math.min(511,Math.floor(f)),u=f-k,s=stations[k]+u*(stations[k+1]-stations[k]);return route.getPointAt(s/route.getLength(),out);}
  getTangentAt(t,out=new T.Vector3()){const f=Math.max(0,Math.min(1,t))*512,k=Math.min(511,Math.floor(f)),u=f-k,s=stations[k]+u*(stations[k+1]-stations[k]);return route.getTangentAt(s/route.getLength(),out);}
  stationIndex(s){s=Math.max(0,Math.min(length,s));let lo=0,hi=512;while(hi-lo>1){const m=(lo+hi)>>1;if(stations[m]<s)lo=m;else hi=m;}return lo+(s-stations[lo])/(stations[hi]-stations[lo]);}
 }
 const curve=new MaterialJacket();curve.materialStationsMM=stations;return curve;
}
export function createSignalSkin(kind){
 const d=D[kind],n=d.pins,[u0,v0,u1,v1]=d.rect,w=u1-u0-(kind==='rgb'?1.35:1.7),h=v1-v0-(kind==='rgb'?1.35:1.7),r=kind==='rgb'?.3:.42,fan=kind==='rgb'?18:14,pitch=d.pitchMM;
 const shape=new T.Shape([[-w/2,-h/2],[w/2,-h/2],[w/2,h/2],[-w/2,h/2]].map(x=>new T.Vector2(...x)));
 for(let i=0;i<n;i++){const hole=new T.Path(),x=kind==='rgb'?(i-(n-1)/2)*pitch:0,y=kind==='rgb'?0:(i-.5)*pitch,r=kind==='rgb'?.34:.5;for(let j=0;j<24;j++){const a=-2*Math.PI*j/24,px=x+r*Math.cos(a),py=y+r*Math.sin(a);if(j===0)hole.moveTo(px,py);else hole.lineTo(px,py);}hole.closePath();shape.holes.push(hole);}
 const shell=new T.ExtrudeGeometry(shape,{depth:8.3,bevelEnabled:false,curveSegments:12});shell.applyMatrix4(new T.Matrix4().set(1,0,0,0,0,0,-1,0,0,1,0,0,0,0,0,1));const sg=shell.index?shell.toNonIndexed():shell.clone();shell.dispose();
 // ExtrudeGeometry repeats closed-arc endpoint vertices. Remove only exact
 // zero-area construction triangles; no nonzero skin/plug face is discarded.
 const sp=sg.attributes.position,sn=sg.attributes.normal,kp=[],kn=[];for(let i=0;i<sp.count;i+=3){const a=new T.Vector3().fromBufferAttribute(sp,i),b=new T.Vector3().fromBufferAttribute(sp,i+1),c=new T.Vector3().fromBufferAttribute(sp,i+2);if(b.sub(a).cross(c.sub(a)).lengthSq()===0)continue;for(let j=0;j<3;j++){kp.push(sp.getX(i+j),sp.getY(i+j),sp.getZ(i+j));kn.push(sn.getX(i+j),sn.getY(i+j),sn.getZ(i+j));}}sg.setAttribute('position',new T.Float32BufferAttribute(kp,3));sg.setAttribute('normal',new T.Float32BufferAttribute(kn,3));
 const g=new T.BufferGeometry(),positions=[],normals=[],indices=[],sections=[],groups=[];
 function tube(rows,sides,radius,mat,endCap=true){const first=positions.length/3,start=indices.length;positions.push(...new Array((rows+1)*(sides+1)*3+6).fill(0));normals.push(...new Array((rows+1)*(sides+1)*3+6).fill(0));for(let i=0;i<rows;i++)for(let j=0;j<sides;j++){const a=first+i*(sides+1)+j,b=a+sides+1;indices.push(a,b,a+1,b,b+1,a+1);}for(const end of(endCap?[0,1]:[0])){const k=first+(rows+1)*(sides+1)+end,row=first+(end?rows:0)*(sides+1);for(let j=0;j<sides;j++)if(end)indices.push(k,row+j+1,row+j);else indices.push(k,row+j,row+j+1);}groups.push({start,count:indices.length-start,materialIndex:mat});const s={first,rows,sides,radius};sections.push(s);return s;}
 const jacket=tube(512,16,kind==='rgb'?1.3:1.05,0,false),fans=Array.from({length:n},(_,i)=>tube(32,8,r,i+1)),shellStart=positions.length/3,start=indices.length;positions.push(...sg.attributes.position.array);normals.push(...sg.attributes.normal.array);for(let i=0;i<sg.attributes.position.count;i++)indices.push(shellStart+i);groups.push({start,count:indices.length-start,materialIndex:n+1});
 const tag=[];if(kind==='ntc'){
  // One closed, raised-ink label skin. The green top has the exact H footprint
  // removed; white sidewalls and the white top continue that boundary. No
  // buried full-box glyph faces or overlapping three-box letter remain.
  const outer=[[-2.5,-2.5],[2.5,-2.5],[2.5,2.5],[-2.5,2.5]],letter=[[-1.375,-1.5],[-.825,-1.5],[-.825,-.25],[.825,-.25],[.825,-1.5],[1.375,-1.5],[1.375,1.5],[.825,1.5],[.825,.25],[-.825,.25],[-.825,1.5],[-1.375,1.5]],parts=[{p:[],n:[],mat:4},{p:[],n:[],mat:5}],z0=1.085,z1=1.535,z2=1.575;
  function face(a,b,c,normal,part,depth=4){
   if(depth){const ab=a.clone().add(b).multiplyScalar(.5),bc=b.clone().add(c).multiplyScalar(.5),ca=c.clone().add(a).multiplyScalar(.5);face(a,ab,ca,normal,part,depth-1);face(ab,b,bc,normal,part,depth-1);face(ca,bc,c,normal,part,depth-1);face(ab,bc,ca,normal,part,depth-1);return;}
   if(b.clone().sub(a).cross(c.clone().sub(a)).dot(normal)<0)[b,c]=[c,b];for(const v of[a,b,c]){part.p.push(...v.toArray());part.n.push(...normal.toArray());}
  }
  function plane(contour,holes,z,normal,part){const all=[...contour,...holes.flat()],faces=T.ShapeUtils.triangulateShape(contour.map(p=>new T.Vector2(...p)),holes.map(h=>h.map(p=>new T.Vector2(...p))));for(const f of faces)face(...f.map(i=>V([...all[i],z])),normal,part);}
  function walls(contour,low,high,part){for(let i=0;i<contour.length;i++){const a=contour[i],b=contour[(i+1)%contour.length],normal=V([b[1]-a[1],a[0]-b[0],0]).normalize(),lo=V([...a,low]),next=V([...b,low]),hi=V([...b,high]),last=V([...a,high]);face(lo,next,hi,normal,part);face(lo,hi,last,normal,part);}}
  plane(outer,[],z0,V([0,0,-1]),parts[0]);walls(outer,z0,z1,parts[0]);plane(outer,[letter],z1,V([0,0,1]),parts[0]);walls(letter,z1,z2,parts[1]);plane(letter,[],z2,V([0,0,1]),parts[1]);
  for(const part of parts){const start=indices.length;tag.push({p:Float32Array.from(part.p),n:Float32Array.from(part.n),first:positions.length/3});positions.push(...part.p);normals.push(...part.n);for(let i=0;i<part.p.length/3;i++)indices.push(tag.at(-1).first+i);groups.push({start,count:indices.length-start,materialIndex:part.mat});}
 }

  // Identical source vertices share the same exact transport calculation.
  // Keep the original full mesh, indices and signed-zero-sensitive inputs.
  const tagSamples=[],tagMap=new Map(),tagCopy=[];
  for(const part of tag){const pb=new Uint32Array(part.p.buffer,part.p.byteOffset,part.p.length),nb=new Uint32Array(part.n.buffer,part.n.byteOffset,part.n.length);for(let i=0;i<part.p.length;i+=3){const key=[pb[i],pb[i+1],pb[i+2],nb[i],nb[i+1],nb[i+2]].join(':');let sample=tagMap.get(key);if(sample===undefined){sample=tagSamples.length;tagMap.set(key,sample);tagSamples.push({p:part.p,n:part.n,i});}tagCopy.push(part.first*3+i,sample*3);}}
  tagMap.clear();let tagCopies=Uint32Array.from(tagCopy),tagP=new Float32Array(tagSamples.length*3),tagN=new Float32Array(tagSamples.length*3);
 const capFirst=positions.length/3,capCount=16+n*8;positions.push(...new Array(capCount*3).fill(0));normals.push(...new Array(capCount*3).fill(0));const fixedIndexCount=indices.length;
 g.setAttribute('position',new T.Float32BufferAttribute(positions,3).setUsage(T.DynamicDrawUsage));g.setAttribute('normal',new T.Float32BufferAttribute(normals,3).setUsage(T.DynamicDrawUsage));g.setIndex(indices);for(const q of groups)g.addGroup(q.start,q.count,q.materialIndex);
 function writeTube(s,c){const frame=c.computeFrenetFrames(s.rows,false),p=g.attributes.position.array,nm=g.attributes.normal.array;for(let i=0;i<=s.rows;i++){const p0=c.getPointAt(i/s.rows);for(let j=0;j<=s.sides;j++){const a=2*Math.PI*j/s.sides,n=frame.normals[i].clone().multiplyScalar(-Math.cos(a)).addScaledVector(frame.binormals[i],Math.sin(a)),k=(s.first+i*(s.sides+1)+j)*3;for(let q=0;q<3;q++){p[k+q]=(p0.getComponent(q)+s.radius*n.getComponent(q))*.001;nm[k+q]=n.getComponent(q);}}}for(const e of[0,1]){const p0=c.getPointAt(e),k=(s.first+(s.rows+1)*(s.sides+1)+e)*3;for(let q=0;q<3;q++){p[k+q]=p0.getComponent(q)*.001;nm[k+q]=frame.tangents[e?s.rows:0].getComponent(q)*(e?1:-1);}}return frame;}
 function write(route){const L=route.getLength(),tip=route.tip,axis=route.tipTangent,q=new T.Quaternion().setFromUnitVectors(V([0,-1,0]),axis);q.premultiply(new T.Quaternion().setFromAxisAngle(axis,route.tipRoll));const bx=V([1,0,0]).applyQuaternion(q),bz=V([0,0,1]).applyQuaternion(q),cross=route.getPointAt((L-fan)/L),j=jacketCurve(route,L-fan);const jacketFrame=writeTube(jacket,j);
  const startX=bx.clone().addScaledVector(baseDirection(route,L,fan),-bx.dot(baseDirection(route,L,fan))).normalize(),startZ=new T.Vector3().crossVectors(baseDirection(route,L,fan),startX).normalize();
  for(let i=0;i<n;i++){const off=(i-(n-1)/2)*pitch,end=tip.clone().addScaledVector(kind==='rgb'?bx:bz,off),start=kind==='rgb'?cross.clone().addScaledVector(startX,[-.78,-.39,-.39,.39,.39,.78][i]).addScaledVector(startZ,[0,.6755,-.6755,.6755,-.6755,0][i]):cross.clone().addScaledVector(startZ,(i-.5)*.95),baseT=route.getTangentAt((L-fan)/L),c=new T.CubicBezierCurve3(start,start.clone().addScaledVector(baseT,fan/3),end.clone().addScaledVector(axis,-fan/3),end);c.arcLengthDivisions=128;writeTube(fans[i],c);}
  const p=g.attributes.position.array,nm=g.attributes.normal.array,a=sg.attributes.position,b=sg.attributes.normal;for(let i=0;i<a.count;i++){const x=new T.Vector3().fromBufferAttribute(a,i).applyQuaternion(q).add(tip),n=new T.Vector3().fromBufferAttribute(b,i).applyQuaternion(q);x.multiplyScalar(.001).toArray(p,(shellStart+i)*3);n.toArray(nm,(shellStart+i)*3);}if(tag.length){const station=L-fan-5,point=v=>{
   // Attach the label to the actual drawn jacket chart. The analytic route
   // bows between jacket stations; using it here cut the inner bend skin.
   // Preserve the 0.035mm backing gap and all original raised ink thickness.
   const f=j.stationIndex(station+v.y),i=Math.min(jacket.rows-1,Math.floor(f)),u=f-i,angle=((Math.PI-v.x/1.31)%(2*Math.PI)+2*Math.PI)%(2*Math.PI),a=angle/(2*Math.PI)*jacket.sides,column=Math.min(jacket.sides-1,Math.floor(a)),w=a-column;
   const k=(row,col)=>jacket.first+row*(jacket.sides+1)+col,ids=u+w<=1?[k(i,column),k(i+1,column),k(i,column+1)]:[k(i+1,column+1),k(i,column+1),k(i+1,column)],weights=u+w<=1?[1-u-w,u,w]:[u+w-1,1-u,1-w],base=new T.Vector3(),normal=new T.Vector3();
   ids.forEach((id,q)=>{base.addScaledVector(new T.Vector3().fromArray(p,id*3),weights[q]*1000);normal.addScaledVector(new T.Vector3().fromArray(nm,id*3),weights[q]);});
   return base.addScaledVector(normal.normalize(),v.z-jacket.radius);
  };for(let k=0;k<tagSamples.length;k++){const part=tagSamples[k],i=part.i,v=new T.Vector3().fromArray(part.p,i),h=1e-4,dx=point(v.clone().add(V([h,0,0]))).sub(point(v.clone().add(V([-h,0,0])))).multiplyScalar(.5/h),dy=point(v.clone().add(V([0,h,0]))).sub(point(v.clone().add(V([0,-h,0])))).multiplyScalar(.5/h),dz=point(v.clone().add(V([0,0,h]))).sub(point(v.clone().add(V([0,0,-h])))).multiplyScalar(.5/h),m=new T.Matrix3().set(dx.x,dy.x,dz.x,dx.y,dy.y,dz.y,dx.z,dy.z,dz.z).invert().transpose();point(v).multiplyScalar(.001).toArray(tagP,k*3);new T.Vector3().fromArray(part.n,i).applyMatrix3(m).normalize().toArray(tagN,k*3);}for(let k=0;k<tagCopies.length;k+=2){const to=tagCopies[k],from=tagCopies[k+1];for(let q=0;q<3;q++){p[to+q]=tagP[from+q];nm[to+q]=tagN[from+q];}}}
  // Jacket end is an annulus with real conductor exits, not a solid disk
  // intersecting six fan roots. All boundary vertices come from the skins.
  const axis0=baseDirection(route,L,fan),ref=startX,other=new T.Vector3().crossVectors(axis0,ref).normalize(),rings=[Array.from({length:16},(_,j)=>jacket.first+512*17+j),...fans.map(s=>Array.from({length:8},(_,j)=>s.first+j))],flat=rings.flat(),contours=rings.map(row=>row.map(k=>{const v=new T.Vector3().fromArray(p,k*3).multiplyScalar(1000).sub(cross);return new T.Vector2(v.dot(ref),v.dot(other));}));
  flat.forEach((k,i)=>{p.set(p.subarray(k*3,k*3+3),(capFirst+i)*3);axis0.toArray(nm,(capFirst+i)*3);});const faces=T.ShapeUtils.triangulateShape(contours[0],contours.slice(1)),cap=[];for(const f of faces){const a=new T.Vector3().fromArray(p,(capFirst+f[0])*3),b=new T.Vector3().fromArray(p,(capFirst+f[1])*3),c=new T.Vector3().fromArray(p,(capFirst+f[2])*3);if(b.sub(a).cross(c.sub(a)).dot(axis0)<0)[f[1],f[2]]=[f[2],f[1]];cap.push(...f.map(i=>capFirst+i));}if(g.index.count!==fixedIndexCount+cap.length){if(g.index.count!==fixedIndexCount)throw Error('Conductor-exit cap topology changed');g.setIndex([...indices,...cap]);g.addGroup(fixedIndexCount,cap.length,0);}else{g.index.array.set(cap,fixedIndexCount);g.index.needsUpdate=true;}
  g.attributes.position.needsUpdate=true;g.attributes.normal.needsUpdate=true;g.computeBoundingBox();g.computeBoundingSphere();return{stockMM:L,jacketRadiusMM:jacket.radius,fanRadiiMM:r,plugTailMM:tip.toArray(),plugAxis:axis.toArray(),plugRollRadians:route.tipRoll,upstreamMM:route.getPointAt(0).toArray(),fullFaces:g.index.count/3};
 }
 return{geometry:g,write,dispose(){sg.dispose();tagSamples.length=0;tagCopies=new Uint32Array(0);tagP=new Float32Array(0);tagN=new Float32Array(0);},sections};
}
