import assert from 'node:assert/strict';import fs from 'node:fs';import * as T from '../dist/vendor/three.module.js';
import {v}from './check-viewer.mjs';import{SERVICE_TASKS}from '../dist/maintenance-data.js';import{XBUDDY_TASK}from '../dist/xbuddy-service-data.js';import{installMaintenanceModel}from '../dist/maintenance-model.js';import{XBUDDY_SENSOR_LEADS}from '../dist/xbuddy-sensor-cables.js';
let language=0;const binding=installMaintenanceModel(v,[...SERVICE_TASKS,XBUDDY_TASK],a=>a[language]);
const choose=(n,p=0)=>{v.setState({flow:'service',index:binding.indexOf('xbuddy',n-1),comparison:'after',variant:'screw',explore:false,completed:[]});v.autoplayPending=false;v.seek(p);};
const geometry=id=>Array.from(v.fasteners.entities.get(id).geometry.attributes.position.array);
const official=JSON.parse(fs.readFileSync('research/quality/service-20261105-52/guide-908859.json','utf8')).steps;
assert(official[10].lines[0].title.includes('Door sensor'));assert(official[27].lines.some(l=>l.title.includes('Heatbed Thermistor')));
const reports=[];
for(const d of XBUDDY_SENSOR_LEADS){const e=v.fasteners.entities.get(d.id);assert.equal(e.mesh.userData.serviceTask,'xbuddy');assert(e.mesh.userData.toolOnly);let residual=0,minFaceNormal=1;
 for(let k=0;k<=512;k++){e.update(0,1,k/512);residual=Math.max(residual,Math.abs(e.mesh.userData.flexState.length-e.length));assert(e.curve.points[0].equals(e.connected[0]),'upper bundle boundary stays fixed');const tail=e.curve.points.at(-1),previous=e.curve.points.at(-2);assert(Math.abs(tail.x-previous.x)<1e-10&&Math.abs(tail.z-previous.z)<1e-10&&previous.y>tail.y,'straight mating axis is preserved');if(e.mesh.userData.flexState.amount>.4){assert.equal(tail.x,e.tail.x);assert.equal(tail.z,e.tail.z);}
  if(k%64===0){const g=e.geometry,p=g.attributes.position,n=g.attributes.normal,idx=g.index,a=new T.Vector3(),b=a.clone(),c=a.clone(),normal=a.clone();for(let i=0;i<idx.count;i+=3){const ia=idx.getX(i),ib=idx.getX(i+1),ic=idx.getX(i+2);a.fromBufferAttribute(p,ia);b.fromBufferAttribute(p,ib);c.fromBufferAttribute(p,ic);normal.subVectors(b,a).cross(c.sub(a));assert(normal.lengthSq()>1e-25,'cable cross-sections and housing faces do not collapse into degenerate triangles');normal.normalize();minFaceNormal=Math.min(minFaceNormal,normal.dot(new T.Vector3().fromBufferAttribute(n,ia)));}}
 }
 assert(residual<.03,'maintained lead length through interpolation');assert(minFaceNormal>0,'rendered triangle winding agrees with its outward shading normals');reports.push({id:d.id,port:d.port,length_mm:e.length,maxLengthResidual_mm:residual,minFaceNormalDot:minFaceNormal});
}
choose(11,0);const seated=Object.fromEntries(XBUDDY_SENSOR_LEADS.map(d=>[d.id,geometry(d.id)]));choose(11,1);const parked=Object.fromEntries(XBUDDY_SENSOR_LEADS.map(d=>[d.id,geometry(d.id)]));
for(const n of[12,15,18,25,27,28]){choose(n,0);for(const d of XBUDDY_SENSOR_LEADS)assert.deepEqual(geometry(d.id),parked[d.id],'disconnected leads stay parked through replacement');}
choose(28,1);for(const d of XBUDDY_SENSOR_LEADS)assert.deepEqual(geometry(d.id),seated[d.id],'both leads recover their original mating datums');
for(const n of[29,31,32,34]){choose(n,0);for(const d of XBUDDY_SENSOR_LEADS)assert.deepEqual(geometry(d.id),seated[d.id],'connected leads remain seated in following stages');}
choose(28,.23);const before=geometry('xbBedTempLead'),camera=v.camera.position.clone(),progress=v.operationProgress;
for(language of[1,2,3,0]){binding.localize();v.localize();assert.deepEqual(geometry('xbBedTempLead'),before);assert.equal(v.operationProgress,progress);assert(v.camera.position.equals(camera));}
for(const d of XBUDDY_SENSOR_LEADS){choose(11,0);const outward=v.sceneActors.map((a,i)=>({a,i})).filter(({a})=>a.flex?.includes(d.id));assert.equal(outward.length,3);
 for(const {a,i}of outward)for(const t of[0,.11,.37,.7,1]){choose(11,(i+t)/9);const out=geometry(d.id);choose(28,0);const intoIndex=v.sceneActors.findIndex(q=>q.flex?.includes(d.id)&&q.to===a.fromStates[d.id]&&q.fromStates[d.id]===a.to);assert(intoIndex>=0);choose(28,(intoIndex+1-t)/6);const into=geometry(d.id);assert(out.every((x,i)=>Math.abs(x-into[i])<1e-7),'each focused insertion phase retraces its removal phase');}
}
choose(28,0);assert.equal(v.sceneActors.length,6);assert(v.sceneActors.every(a=>a.nodes.length===1&&a.focusBounds&&a.anchors.length===1));
let framedPlugSamples=0;
for(const[width,height]of[[320,380],[390,420],[430,440],[844,280],[1280,720]])for(let i=0;i<6;i++)for(const t of[0,.13,.37,.65,.9,1]){
 choose(28,(i+t)/6);v.camera.aspect=width/height;v.camera.updateProjectionMatrix();v.manualCamera=false;v.focusOperation(i,true);v.printer.updateMatrixWorld(true);v.camera.updateMatrixWorld(true);
 const a=v.sceneActors[i],e=v.fasteners.entities.get(a.flex[0]),p=e.geometry.attributes.position,point=new T.Vector3();
 for(let k=e.plugRange.start;k<e.plugRange.start+e.plugRange.count;k++){point.fromBufferAttribute(p,k).applyMatrix4(e.mesh.matrixWorld).project(v.camera);assert(Math.abs(point.x)<.9&&Math.abs(point.y)<.9&&point.z<1,'every actual plug vertex remains in its phase camera, including the parked endpoint');}
 const guide=e.guide(a.to,a.fromStates[e.id]);assert(guide.length>=2&&guide.at(-1).distanceToSquared(guide.at(-2))>0,'each phase retains a directed motion guide');framedPlugSamples++;
}
choose(28,.2);for(const d of XBUDDY_SENSOR_LEADS){const e=v.fasteners.entities.get(d.id);assert(e.mesh.userData.preserveColours);for(const m of e.mesh.material){assert(m.color.equals(m.userData.originalColor),'wire colours and green H tag stay identifiable during active playback');assert.equal(m.emissive.getHex(),0);}}
const root=process.env.PRUSA_QA_DIR||'research/quality/latest';fs.mkdirSync(root,{recursive:true});fs.writeFileSync(root+'/sensor-check.json',JSON.stringify({leads:reports,languages:4,samplesPerLead:513,stageHandovers:true,reverseSeeking:true,focusedPhasesPerLead:3,framedPlugSamples,viewportSizes:5,limits:'Local bundle-to-board service illustration; full harness and sensor ends are not complete. Collision audit and real rendering checked separately; public task remains gated.'},null,2));console.log('PASS:two sensor leads, maintained length, mating-axis extraction, stage handovers, reverse seeking, winding and four-language retention. Full harness remains incomplete.');
