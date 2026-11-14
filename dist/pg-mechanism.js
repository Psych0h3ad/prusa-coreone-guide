// SPDX-License-Identifier: MIT
// Original motion adapter. Native model/profile data retain their component terms.
import * as T from 'three';
import {operationAt,smooth} from './assembly-director.js?v=20261113-116';
const states=new WeakMap(),centre=new T.Vector3(.00905642165,0,.39300041426),Y=new T.Vector3(0,1,0);
const faces=g=>(g.index?.count??g.attributes.position.count)/3;
const overlap=(a,b)=>a.buffer===b.buffer&&a.byteOffset<b.byteOffset+b.byteLength&&b.byteOffset<a.byteOffset+a.byteLength;
function one(meshes,count,part){const found=meshes.filter(m=>faces(m.geometry)===count);if(found.length!==1)throw Error('PG motion: unexpected '+part+' source layout');return found[0];}
function angle(actor,t,probe,scratch){
 const u=actor.remove?1-t:t;
 if(!actor.rigidPose&&!actor.gluedPhase&&!actor.posePath&&!actor.tilt&&(actor.spin||actor.wiggle)){if(!(u>0&&u<1)||Math.abs(actor.axis?.[1]??0)<.999999999)return 0;return Math.sign(actor.axis[1])*T.MathUtils.degToRad(actor.spin||actor.wiggle)*(actor.spin?smooth(u):Math.sin(u*Math.PI*4)*(1-u));}
 // Read the pose already applied by the viewer. Never call an actor's custom
 // pose provider a second time, or evaluate unrelated operations for a gear.
 const q=scratch.copy(probe.userData.sceneRestQuaternion||probe.userData.restQuaternion).invert().premultiply(probe.quaternion);return Math.abs(q.x)+Math.abs(q.z)<1e-9?2*Math.atan2(q.y,q.w):0;
}
function currentAngles(viewer,state){
 const actors=viewer.sceneActors||[];if(!actors.length)return[0,0,0];
 const current=operationAt(viewer.operationProgress,actors.length),probes=[state.carrier,state.ring,state.motor],angles=[0,0,0],posed=new Set(),previewed=new Set();
 actors.forEach((actor,i)=>{if(actor.flex)return;const before=i>current.index,t=before?0:i<current.index?1:current.t,affected=[];probes.forEach((m,k)=>{if(actor.nodes.includes(m)&&!(before&&(posed.has(m)||actor.carry||actor.reuse&&previewed.has(m))))affected.push(k);});if(!affected.length)return;const a=angle(actor,t,probes[affected[0]],state.scratch);for(const k of affected){const m=probes[k];angles[k]=a;if(!before)posed.add(m);else if(actor.showBefore)previewed.add(m);}});
 return angles;
}
function sourceMatrix(mesh){return new T.Matrix4().compose(mesh.userData.restPosition,mesh.userData.restQuaternion,mesh.scale);}
function groupFor(viewer,state,mesh){
 let group=state.groups.find(g=>g.mesh===mesh);if(group)return group;
 const geometry=mesh.geometry,p=geometry.attributes.position,n=geometry.attributes.normal;
 if(viewer.meshes.some(m=>m!==mesh&&(m.geometry===geometry||Object.values(m.geometry.attributes).some(a=>overlap(p.array,a.array)||overlap(n.array,a.array)))))throw Error('PG motion: moving source buffer is shared');
 const S=sourceMatrix(mesh);group={mesh,geometry,p,n,positionArray:p.array,normalArray:n.array,index:geometry.index,indexArray:geometry.index?.array,indexValues:geometry.index?.array.slice(),S,inverse:S.clone().invert(),rows:[],angle:0,invalid:false,oldBox:geometry.boundingBox,oldSphere:geometry.boundingSphere};
 group.onDispose=()=>{group.invalid=true;};geometry.addEventListener('dispose',group.onDispose);p.setUsage(T.DynamicDrawUsage);n.setUsage(T.DynamicDrawUsage);state.groups.push(group);return group;
}
function addRegion(viewer,state,mesh,indices,pivot){
 const g=groupFor(viewer,state,mesh),p=g.p.array,n=g.n.array,N=indices.length,bp=new Float32Array(N*3),bn=new Float32Array(N*3);
 for(let i=0;i<N;i++)for(let k=0;k<3;k++){bp[i*3+k]=p[indices[i]*3+k];bn[i*3+k]=n[indices[i]*3+k];}
 g.rows.push({indices,baseP:bp,baseN:bn,lastP:bp.slice(),lastN:bn.slice(),pivot,S:g.S,inverse:g.inverse,matrix:new T.Matrix4(),rotation:new T.Matrix4(),positive:new T.Matrix4().makeTranslation(pivot.x,pivot.y,pivot.z),negative:new T.Matrix4().makeTranslation(-pivot.x,-pivot.y,-pivot.z),normal:new T.Matrix3()});
}
function own(group){
 if(group.invalid)return false;
 if(group.mesh.geometry!==group.geometry||group.geometry.attributes.position!==group.p||group.geometry.attributes.normal!==group.n||group.p.array!==group.positionArray||group.n.array!==group.normalArray||group.geometry.index!==group.index||group.geometry.index?.array!==group.indexArray){group.invalid=true;return false;}
 if(group.indexArray)for(let i=0;i<group.indexArray.length;i++)if(group.indexArray[i]!==group.indexValues[i]){group.invalid=true;return false;}
 for(const r of group.rows)for(let i=0;i<r.indices.length;i++)for(let k=0;k<3;k++)if(group.p.array[r.indices[i]*3+k]!==r.lastP[i*3+k]||group.n.array[r.indices[i]*3+k]!==r.lastN[i*3+k]){group.invalid=true;return false;}
 return true;
}
function bounds(group){
 const geometry=group.geometry,box=geometry.boundingBox?.clone()??new T.Box3().setFromBufferAttribute(group.p),point=new T.Vector3();
 for(const r of group.rows){let radius=0,lo=Infinity,hi=-Infinity;for(let i=0;i<r.baseP.length;i+=3){point.fromArray(r.baseP,i).applyMatrix4(r.S);radius=Math.max(radius,Math.hypot(point.x-r.pivot.x,point.z-r.pivot.z));lo=Math.min(lo,point.y);hi=Math.max(hi,point.y);}const envelope=new T.Box3(new T.Vector3(r.pivot.x-radius,lo,r.pivot.z-radius),new T.Vector3(r.pivot.x+radius,hi,r.pivot.z+radius));box.union(envelope.applyMatrix4(r.inverse));}
 group.box=box;group.sphere=box.getBoundingSphere(new T.Sphere());geometry.boundingBox=group.box;geometry.boundingSphere=group.sphere;
}
export function preparePgMechanism(viewer){
 if(viewer.disposed)throw Error('PG motion: viewer is disposed');if(states.has(viewer))return;
 const carrier=one(viewer.director.resolve(['pgAssembly']),23528,'carrier'),ring=one(viewer.director.resolve(['pgRing']),17462,'ring'),native=viewer.director.resolve([790]),motor=one(native,3697,'motor'),shaft=one(native,160,'shaft'),state={carrier,ring,motor,groups:[],closed:false,lastAngles:[0,0,0],scratch:new T.Quaternion()};
 try{
  // The packed source retains one metal batch. Only the two complete planet
  // bands articulate within it; carrier, pins, seal batch and every face remain.
  for(const[start,count,x]of[[5296*3,8736*3,centre.x-.0105],[14412*3,8736*3,centre.x+.0105]])addRegion(viewer,state,carrier,Uint32Array.from({length:count},(_,i)=>start+i),new T.Vector3(x,0,centre.z));
  const index=motor.geometry.index,selected=new Set();if(!index)throw Error('PG motion: expected indexed motor source');for(let i=0;i<1289*3;i++)selected.add(index.getX(i));
  for(let i=1289*3;i<index.count;i++)if(selected.has(index.getX(i)))throw Error('PG motion: pinion shares stationary vertices');
  addRegion(viewer,state,motor,Uint32Array.from(selected),centre.clone());addRegion(viewer,state,shaft,Uint32Array.from({length:shaft.geometry.attributes.position.count},(_,i)=>i),centre.clone());
  for(const g of state.groups)bounds(g);states.set(viewer,state);
 }catch(error){for(const g of state.groups){g.geometry.removeEventListener('dispose',g.onDispose);if(g.geometry.boundingBox===g.box)g.geometry.boundingBox=g.oldBox;if(g.geometry.boundingSphere===g.sphere)g.geometry.boundingSphere=g.oldSphere;}throw error;}
}
function write(group,value){
 if(!Number.isFinite(value))throw Error('PG motion: invalid rotation');
 if(value===group.angle||!own(group))return;
 const P=group.p.array,N=group.n.array;
 for(const r of group.rows){
  const transform=r.matrix.copy(r.positive).multiply(r.rotation.makeRotationY(value)).multiply(r.negative);transform.premultiply(r.inverse).multiply(r.S);r.normal.getNormalMatrix(transform);const e=transform.elements,b=r.normal.elements;
  for(let i=0;i<r.indices.length;i++){
   const j=i*3,k=r.indices[i]*3,x=r.baseP[j],y=r.baseP[j+1],z=r.baseP[j+2],nx=r.baseN[j],ny=r.baseN[j+1],nz=r.baseN[j+2];
   if(value===0){for(let q=0;q<3;q++){P[k+q]=r.baseP[j+q];N[k+q]=r.baseN[j+q];}}
   else{P[k]=e[0]*x+e[4]*y+e[8]*z+e[12];P[k+1]=e[1]*x+e[5]*y+e[9]*z+e[13];P[k+2]=e[2]*x+e[6]*y+e[10]*z+e[14];const a=b[0]*nx+b[3]*ny+b[6]*nz,c=b[1]*nx+b[4]*ny+b[7]*nz,d=b[2]*nx+b[5]*ny+b[8]*nz,L=Math.hypot(a,c,d);N[k]=a/L;N[k+1]=c/L;N[k+2]=d/L;}
   for(let q=0;q<3;q++){r.lastP[j+q]=P[k+q];r.lastN[j+q]=N[k+q];}
  }
 }
 group.angle=value;group.p.needsUpdate=true;group.n.needsUpdate=true;
}
export function followPgMechanism(viewer){
 const state=states.get(viewer);if(!state||state.closed||viewer.disposed)return;const[c,r,m]=currentAngles(viewer,state);state.lastAngles[0]=c;state.lastAngles[1]=r;state.lastAngles[2]=m;
 // Subtract the common motor-body rotation before applying the gear relation.
 // A rigid transfer of the entire Nextruder then cancels exactly.
 const planet=126/56*(r-c),sun=c===r?c-m:10*(c-m)-9*(r-m);
 for(const g of state.groups)write(g,g.mesh===state.carrier?planet:sun);
}
export function retirePgMechanism(viewer){
 const state=states.get(viewer);if(!state)return;states.delete(viewer);state.closed=true;
 for(const g of state.groups){if(own(g)){write(g,0);if(g.geometry.boundingBox===g.box)g.geometry.boundingBox=g.oldBox;if(g.geometry.boundingSphere===g.sphere)g.geometry.boundingSphere=g.oldSphere;}g.geometry.removeEventListener('dispose',g.onDispose);}
}
export function pgMechanismReceipt(viewer){const s=states.get(viewer);return s?{active:!s.closed,carrierRingMotorAngles:s.lastAngles.slice(),groups:s.groups.map(g=>({faces:faces(g.geometry),angle:g.angle,invalid:g.invalid,regions:g.rows.map(r=>r.indices.length)}))}:{active:false};}
