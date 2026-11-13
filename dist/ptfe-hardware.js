import * as T from 'three';
import {STLLoader} from './vendor/STLLoader.js';
import {smoothCreases} from './surface-geometry.js?v=20261111-94';
import {TubeSurface} from './ptfe-surface.js?v=20261111-94';
const ease=t=>(t=Math.max(0,Math.min(1,t)),t*t*(3-2*t));
function material(color,metalness=0){const m=new T.MeshStandardMaterial({color,roughness:metalness?.35:.65,metalness});m.userData.originalColor=m.color.clone();m.userData.originalOpacity=1;return m;}
class PtfeTube{
 constructor(spec,data){
  this.id='ptfeTube';this.spec=spec;this.data=data;this.stride=(spec.segments+1)*3;this.points=new Float32Array(this.stride);this.surface=new TubeSurface(spec.segments,spec.radialSegments);this.geometry=this.surface.geometry;
  this.phases=Array.from({length:5},(_,i)=>spec.keys.filter(k=>k.phase===i+1));
  this.mesh=new T.Mesh(this.geometry,material('#e5e7dd'));this.mesh.castShadow=true;this.mesh.userData={part:'cables',cadName:'PTFEチューブ 710 mm',flexId:this.id,supplement:true};this.update(5,5,1);
 }
 sample(phase,u,out=this.points){
  const keys=this.phases[phase-1];let lo=0,hi=keys.length-1;
  while(lo<hi){const mid=(lo+hi)>>1;if(keys[mid].u<u)lo=mid+1;else hi=mid;}
  const b=keys[lo],a=keys[Math.max(0,lo-1)],t=b.u===a.u?0:(u-a.u)/(b.u-a.u);
  for(let j=0;j<this.stride;j++)out[j]=this.data[a.offset*this.stride+j]+(this.data[b.offset*this.stride+j]-this.data[a.offset*this.stride+j])*t;
  return out;
 }
 update(from,to,t){
  const phase=Math.max(1,Math.min(5,to||1)),u=to===0?0:from===to?1:ease(t),key=phase+':'+u;if(this.lastKey===key)return;this.lastKey=key;
  this.surface.update(this.sample(phase,u));this.mesh.userData.flexState={from,to,t,amount:u,phase,lengthMM:710};
 }
 guide(to){
  const phase=Math.max(1,Math.min(5,to||1));if(phase===3)return null;
  const pick=phase===5?this.stride-3:phase===4?180*3:0,points=[],buffer=new Float32Array(this.stride);
  for(let i=0;i<=12;i++){this.sample(phase,i/12,buffer);points.push(new T.Vector3(buffer[pick],buffer[pick+1],buffer[pick+2]).multiplyScalar(.001));}
  points.targetIndex=points.length-1;return points;
 }
}
class BowdenBend{
 constructor(mesh){this.id='bowdenBend';this.mesh=mesh;this.geometry=mesh.geometry;mesh.userData={part:'head',cadName:'Bowden bend R1',flexId:this.id,supplement:true,officialSource:'https://www.printables.com/model/1167816',license:'GNU General Public License v2.0'};this.update(3,3,1);}
 update(from,to,t){const lift=to<3?65:65*(1-(from===to?1:ease(t)));this.mesh.position.z=lift*.001;this.mesh.userData.flexState={from,to,t,lift};}
 guide(to){if(to!==3)return null;const p=new T.Vector3(-.003,-.0584,.475),q=p.clone();p.z+=.065;return [p,q];}
}
export async function createPtfeHardware(meshes){
 const base='./assets/nextruder/',response=await fetch(base+'ptfe-hardware.json');if(!response.ok)throw Error('PTFE部品を読み込めません');const spec=await response.json(),loader=new STLLoader();
 const cacheResponse=await fetch(base+spec.motion.file);if(!cacheResponse.ok)throw Error('PTFEの動作を読み込めません');const cache=await cacheResponse.json(),dataResponse=await fetch(base+cache.data);if(!dataResponse.ok)throw Error('PTFEの動作を読み込めません');const data=new Float32Array(await dataResponse.arrayBuffer());
 if(data.length!==cache.keys.length*(cache.segments+1)*3)throw Error('PTFEの動作データが一致しません');
 const source=meshes.find(m=>m.userData.cadIndex===818);if(!source)throw Error('PTFE継手の取付位置がありません');
 const fitting=[];
 for(const [i,file]of spec.fitting.files.entries()){
  let g=await loader.loadAsync(base+file);g.scale(.001,.001,.001);g=smoothCreases(g);const mesh=new T.Mesh(g,material(i?'#303332':'#b5b9b9',i?0:.7));mesh.userData={part:'head',cadIndex:818,cadPath:[...source.userData.cadPath],cadName:spec.fitting.name,supplement:true,illustrative:true,geometryNote:spec.fitting.geometryType,officialSource:spec.fitting.source,license:spec.fitting.license};mesh.castShadow=true;mesh.receiveShadow=true;fitting.push(mesh);
 }
 for(const mesh of fitting)mesh.userData.preserveCadName=true;
 for(const mesh of meshes.filter(m=>m.userData.cadIndex===818))mesh.userData.manualExcluded=true;
 let g=await loader.loadAsync(base+spec.bend.file);g.scale(.001,.001,.001);
 const upright=new T.Matrix4().set(...spec.bend.sourceToUpright.flat()),placement=new T.Matrix4().fromArray(spec.bend.placement);for(const i of[12,13,14]){upright.elements[i]*=.001;placement.elements[i]*=.001;}g.applyMatrix4(placement.multiply(upright));g=smoothCreases(g);
 const bend=new T.Mesh(g,material('#303332'));bend.castShadow=true;bend.receiveShadow=true;
 return {meshes:fitting,entities:[new PtfeTube(cache,data),new BowdenBend(bend)]};
}
