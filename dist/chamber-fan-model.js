import * as T from 'three';
import {molexCad,molexGeometry} from './molex-cad.js?v=20261111-94';
import {createClikMatePlug,clikMateMotion,clikMatePress} from './clik-mate-plug.js?v=20261111-94';
import {ensureChamberServiceOwner,prepareChamberServiceAssets} from './chamber-service-owner.js';
import {CHAMBER_LEADS,frame,controls,bodyOffset,materialFrames} from './chamber-fan-route.js';
const vec=p=>new T.Vector3(...p),ease=x=>{x=T.MathUtils.clamp(x,0,1);return x*x*(3-2*x);},sides=8;
const mat=(color,metalness=0)=>{const m=new T.MeshStandardMaterial({color,roughness:metalness?.35:.8,metalness});m.userData.originalColor=m.color.clone();m.userData.originalOpacity=1;return m;};
let bankMeta,bankBuffer,samples,knots,pending;
export function prepareChamberFanAssets(){if(bankBuffer)return Promise.resolve();if(!pending)pending=(async()=>{
 await prepareChamberServiceAssets();
 const j=await fetch('./assets/chamber-fan-replacement/lead-bank.json').then(r=>{if(!r.ok)throw Error('Fan material manifest unavailable');return r.json();});
 if(j.schema!==2||j.samples!==256||j.states!==j.knots*3+1||Object.keys(j.leads).sort().join(',')!=='cfFan1,cfFan2'||CHAMBER_LEADS.some(d=>j.leads[d.id].pins!==4||j.leads[d.id].deformations.length!==j.states*4))throw Error('Fan-only bank schema mismatch');
 const r=await fetch('./assets/chamber-fan-replacement/lead-bank.bin.gz');if(!r.ok)throw Error('Fan material bank unavailable');const b=await new Response(r.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer(),hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',b)),n=>n.toString(16).padStart(2,'0')).join('');
 if(b.byteLength!==j.decodedBytes||hash!==j.sha256)throw Error('Fan material integrity mismatch');bankMeta=j;bankBuffer=b;samples=j.samples;knots=j.knots;
 })().catch(error=>{pending=undefined;throw error;});return pending;}
class ChamberFanLead{
 constructor(d,owner){this.id=d.id;this.d=d;this.owner=owner;this.body=owner.viewer.meshes.find(m=>m.userData.cadIndex===d.body);if(!this.body)throw Error('Required native chamber body missing: '+d.body);this.bodyGeometry=this.body.geometry;this.bodyPosition=this.body.userData.restPosition.clone();this.frame=frame(d);this.cad=molexCad('5025780'+d.pins+'00');this.skin=createClikMatePlug(d.pins);this.plugVertices=this.skin.positions.length/3;
  // Each reference conductor has its own fixed stock. The stock is derived
  // from these authored full routes, not advertised as a supplied cable length.
  const bm=bankMeta.leads[d.id];this.stocks=bm.stocks;this.bankInfo=bm;this.bank=new Float32Array(bankBuffer,bm.offset,bm.bytes/4);
  this.metrics={stocks:this.stocks.slice(),maxKnotStockError:bm.maxKnotPolylineErrorMM,radius:d.radius,bankSHA256:bm.sha256,qualification:bankMeta.qualification};
  const rings=(samples+1)*(sides+1),count=rings*d.pins+this.plugVertices,g=new T.BufferGeometry(),indices=[];g.setAttribute('position',new T.BufferAttribute(new Float32Array(count*3),3).setUsage(T.DynamicDrawUsage));g.setAttribute('normal',new T.BufferAttribute(new Float32Array(count*3),3).setUsage(T.DynamicDrawUsage));
  for(let w=0;w<d.pins;w++){const first=indices.length;for(let i=0;i<samples;i++)for(let j=0;j<sides;j++){const a=w*rings+i*(sides+1)+j,b=a+sides+1;indices.push(a,a+1,b,b,a+1,b+1);}g.addGroup(first,indices.length-first,w);}

  this.plugStart=rings*d.pins;const first=indices.length;for(let i=0;i<this.plugVertices;i++)indices.push(this.plugStart+i);let at=first;for(const group of this.cad.groups){const count=Array.from(this.skin.releaseSkin.parentFaces).filter(f=>f*3>=group.start&&f*3<group.start+group.count).length*3;g.addGroup(at,count,group.material==='tin'?d.pins+1:d.pins);at+=count;}g.setIndex(indices);this.geometry=g;this.mesh=new T.Mesh(g,[...d.colors.map(c=>mat(c)),mat('#e6dec6'),mat('#b8bbc0',.75)]);this.mesh.userData={part:d.id,component:d.id,flexId:d.id,serviceTask:'chamber-fan',cadName:d.id+' · full authored conductors + existing reference plug',supplement:true,preserveColours:true,reference:true,stockQualification:this.metrics.qualification};this.curve=new T.CatmullRomCurve3([vec(d.root).multiplyScalar(.001),vec(d.root).add(new T.Vector3(0,0,1)).multiplyScalar(.001)]);this.amount=3;
 }
 owns(){return this.owner.owns(this)&&this.body.geometry===this.bodyGeometry&&this.body.userData.chamberServiceAliasOwner===this.owner.token&&this.body.userData.maintenanceComponent===this.id;}
 update(from,to,t){if(!this.owns()||!this.owner.enabled||this.update!==ChamberFanLead.prototype.update)return;let amount,motion;if(from>=2&&to>=2){motion=clikMateMotion(from-2,to-2,t);amount=2+motion.amount;}else amount=T.MathUtils.lerp(from,to,ease(t));amount=T.MathUtils.clamp(amount,0,3);this.amount=amount;this.write(amount,motion);}
 write(amount,motion){if(!this.owns()||!this.owner.enabled)return;this.syncBody(amount);const currentLatch=motion?clikMatePress(motion,Math.max(0,3-amount)*12):0,currentPhase=motion?.phase||(amount>=2?(amount<3?'withdrawn':'seated'):'routing');if(this.lastAmount===amount&&this.lastLatch===currentLatch){this.mesh.userData.flexState.connectorPhase=currentPhase;return;}this.lastAmount=amount;this.lastLatch=currentLatch;
  const k=Math.min(bankMeta.states-2,Math.floor(amount*knots)),u=amount*knots-k,pos=this.geometry.attributes.position,norm=this.geometry.attributes.normal,rings=(samples+1)*(sides+1);let maxPolylineError=0;
  for(let w=0;w<this.d.pins;w++){const pts=Array.from({length:samples+1},(_,i)=>{const at=((k*this.d.pins+w)*(samples+1)+i)*3,next=at+this.d.pins*(samples+1)*3;return new T.Vector3(this.bank[at]*(1-u)+this.bank[next]*u,this.bank[at+1]*(1-u)+this.bank[next+1]*u,this.bank[at+2]*(1-u)+this.bank[next+2]*u);});// Correct the interpolant on a compact free bight only. Endpoints and
   // native plug/frame stay exact; sum of segment norms is convex in this scalar.
   const d0=this.bankInfo.deformations[k*this.d.pins+w],d1=this.bankInfo.deformations[(k+1)*this.d.pins+w],lerp=(key)=>T.MathUtils.lerp(d0[key],d1[key],u),upper=lerp('upper'),lower=lerp('lower'),uf=lerp('upperFactor'),lf=lerp('lowerFactor'),window=(x,c)=>{const span=Math.min(.1,c,1-c),v=Math.abs(x-c)/span;return v<1?(1+Math.cos(Math.PI*v))*.5:0;},directions=pts.map((p,i)=>new T.Vector3(lf*window(i/samples,lower),0,uf*window(i/samples,upper))),mid=(this.d.pins-1)/2,datum=controls(this.d,amount,mid),endpoint=datum.end,root=datum.points[0],firstDirection=datum.points[1].clone().sub(root).normalize(),row=new T.Vector3(.2,1,.28).addScaledVector(firstDirection,-new T.Vector3(.2,1,.28).dot(firstDirection)).normalize();pts[0].copy(root).addScaledVector(row,(w-mid)*.9);pts[samples].copy(endpoint).add(new T.Vector3(Math.cos(datum.headAngle),Math.sin(datum.headAngle),0).multiplyScalar((w-mid)*1.5));
   const lengthAt=b=>{let sum=0;for(let i=1;i<pts.length;i++){const dx=pts[i].x-pts[i-1].x+b*(directions[i].x-directions[i-1].x),dy=pts[i].y-pts[i-1].y,dz=pts[i].z-pts[i-1].z+b*(directions[i].z-directions[i-1].z);sum+=Math.sqrt(dx*dx+dy*dy+dz*dz);}return sum;};let correction=0;
   if(Math.abs(lengthAt(0)-this.stocks[w])>.00001){let lo=0,hi=0;if(lengthAt(0)<this.stocks[w]){hi=.05;while(lengthAt(hi)<this.stocks[w]&&hi<128)hi*=2;}else{lo=-.05;while(lengthAt(lo)>this.stocks[w]&&lo>-16)lo*=2;}if(lengthAt(lo)>this.stocks[w]+.0002||lengthAt(hi)<this.stocks[w]-.0002)throw Error('Chamber fixed material interpolant has no bracket '+this.id+' '+amount);for(let n=0;n<22;n++){const m=(lo+hi)/2;if(lengthAt(m)<this.stocks[w])lo=m;else hi=m;}correction=(lo+hi)/2;}for(let i=0;i<pts.length;i++)pts[i].addScaledVector(directions[i],correction);

   let length=0;for(let i=1;i<pts.length;i++)length+=pts[i].distanceTo(pts[i-1]);maxPolylineError=Math.max(maxPolylineError,Math.abs(length-this.stocks[w]));
   const frames=materialFrames(pts);
   for(let i=0;i<=samples;i++){const c=pts[i];for(let j=0;j<=sides;j++){const angle=j/sides*2*Math.PI,n=frames.normals[i].clone().multiplyScalar(Math.cos(angle)).addScaledVector(frames.binormals[i],Math.sin(angle)),v=c.clone().addScaledVector(n,this.d.radius).multiplyScalar(.001),at=w*rings+i*(sides+1)+j;pos.setXYZ(at,v.x,v.y,v.z);norm.setXYZ(at,n.x,n.y,n.z);}}
   if(w===0){this.curve.points=pts.map(p=>p.clone().multiplyScalar(.001));this.curve.updateArcLengths();}
  }
  const packet=controls(this.d,amount,(this.d.pins-1)/2),endpoint=packet.end,yaw=packet.headAngle,zAxis=new T.Vector3(0,0,1),source=vec([0,0,1.25]).applyMatrix4(this.frame),delta=endpoint.clone().sub(source);
  const latch=currentLatch,p=new T.Vector3(),n=new T.Vector3(),pressed=new T.Vector3();for(let i=0;i<this.plugVertices;i++){p.fromArray(this.skin.positions,i*3).lerp(pressed.fromArray(this.skin.pressedPositions,i*3),latch);n.fromArray(this.skin.normals,i*3).lerp(pressed.fromArray(this.skin.pressedNormals,i*3),latch).normalize();p.set(-p.x,p.z,p.y+1.25).applyMatrix4(this.frame).sub(source).applyAxisAngle(zAxis,yaw).add(endpoint).multiplyScalar(.001);n.set(-n.x,n.z,n.y).transformDirection(this.frame).applyAxisAngle(zAxis,yaw);pos.setXYZ(this.plugStart+i,p.x,p.y,p.z);norm.setXYZ(this.plugStart+i,n.x,n.y,n.z);}
  pos.needsUpdate=true;norm.needsUpdate=true;this.geometry.computeBoundingBox();this.geometry.computeBoundingSphere();this.mesh.userData.flexState={amount,stocks:this.stocks,polylineStockError:maxPolylineError,latch,connectorPhase:motion?.phase||(amount>=2?(amount<3?'withdrawn':'seated'):'routing')};
 }
 syncBody(amount){if(!this.owns()||!this.owner.enabled)return;this.owner.positionBorrowed(this.body,this.bodyPosition.clone().add(bodyOffset(this.d,amount).multiplyScalar(.001)));}
 guide(to=3,from=0){if(!this.owns()||!this.owner.enabled||this.guide!==ChamberFanLead.prototype.guide)return[];const points=Array.from({length:41},(_,i)=>controls(this.d,T.MathUtils.lerp(from,to,i/40),(this.d.pins-1)/2).end.multiplyScalar(.001));points.targetIndex=points.length-1;return points;}
}

export function ensureChamberFanProviders(viewer){
 if(!bankBuffer)throw Error('Prepare fan materials before registering');
 const o=ensureChamberServiceOwner(viewer);
 if(o.fanExtension){if(!o.fanExtension.entities.every(e=>viewer.fasteners.entities.get(e.id)===e&&e.mesh.geometry===e.geometry))throw Error('Fan entity has a later owner');return o;}
 if(CHAMBER_LEADS.some(d=>viewer.fasteners.entities.has(d.id)))throw Error('Fan entity already owned');
 const bodies=CHAMBER_LEADS.map(d=>viewer.meshes.find(m=>m.userData.cadIndex===d.body));if(bodies.some(m=>!m?.geometry||!m.userData.restPosition||m.userData.chamberServiceAliasOwner))throw Error('Fan native body unavailable');
 const entities=[],meshes=[];
 try{for(const d of CHAMBER_LEADS){entities.push(new ChamberFanLead(d,o));for(const material of ['resin','tin']){
  const geometry=molexGeometry('5025850470',material).applyMatrix4(frame(d)).scale(.001,.001,.001),m=new T.Mesh(geometry,mat(material==='resin'?'#e6dec6':'#b8bbc0',material==='tin'?.75:0));
  m.userData={part:'cfFanSockets',component:'cfFanSockets',serviceTask:'chamber-fan',cadName:d.id+' · retained authored4-circuit right-angle header · '+material,reference:true,supplement:true,preserveColours:true,qualification:'Existing authored4-circuit socket at retained photographic PCB registration; not OEM board metrology'};meshes.push(m);
 }}o.extendSocketFootprints(CHAMBER_LEADS.map(d=>({id:d.id,rect:d.rect})));
 }catch(error){for(const e of entities){e.geometry.dispose();for(const m of e.mesh.material)m.dispose();}for(const m of meshes){m.geometry.dispose();m.material.dispose();}throw error;}
 try{for(const [i,e]of entities.entries()){o.borrowNativeBody(bodies[i],e.id);o.registerEntity(e,{restState:3});}for(const m of meshes)o.registerLooseMesh(m);for(const m of viewer.chamberFanAnatomy?.owned||[])o.watchBorrowedResource(m.geometry);const receipt={entities,meshes};o.fanExtension=receipt;o.onRetire(()=>{if(o.fanExtension===receipt)delete o.fanExtension;});viewer.director.cache.clear();return o;}catch(error){o.retire();throw error;}
}
