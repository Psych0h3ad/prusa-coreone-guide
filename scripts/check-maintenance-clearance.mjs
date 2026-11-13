import assert from 'node:assert/strict';
import * as T from '../dist/vendor/three.module.js';
import {v}from './check-viewer.mjs';
import {SERVICE_TASKS as tasks}from '../dist/maintenance-data.js';
import {installMaintenanceModel}from '../dist/maintenance-model.js';
import {triangleBVH,uniqueVertices,interiorWitnesses,assertNoNewInterior}from './native-mesh-clearance.mjs';
const binding=installMaintenanceModel(v,tasks,a=>a[0]),choose=(task,index)=>{v.setState({flow:'service',index:binding.indexOf(task,index),comparison:'after',variant:'screw',explore:false,completed:[]});v.playing=false;v.autoplayPending=false;};
choose('extruder',0);v.setProgress(0);
const native=ref=>{const m=v.meshes.find(m=>m.userData.cadIndex===ref&&!m.userData.manualExcluded);assert(m,`Actual native CAD${ref} is required`);return m;};
const nodes=new Map([805,815,859,794].map(id=>[id,native(id)]));
const printerMatrix=m=>{v.printer.updateMatrixWorld(true);return v.printer.matrixWorld.clone().invert().multiply(m.matrixWorld);};
function meshTriangles(m){const a=m.geometry.attributes.position,ix=m.geometry.index,matrix=printerMatrix(m),triangles=[];for(let i=0;i<(ix?.count??a.count);i+=3)triangles.push([0,1,2].map(k=>new T.Vector3().fromBufferAttribute(a,ix?ix.getX(i+k):i+k).applyMatrix4(matrix).multiplyScalar(1000).toArray()));return triangles;}
const buffers=new Map([...nodes.values()].map(m=>[m,{geometry:m.geometry,buffer:m.geometry.attributes.position.array,values:m.geometry.attributes.position.array.slice()}])),fixedPoses=new Map([859,794].map(id=>[id,printerMatrix(nodes.get(id)).toArray()])),trees=new Map([859,794].map(id=>[id,triangleBVH(meshTriangles(nodes.get(id)))])),points=new Map([805,815].map(id=>[id,uniqueVertices(meshTriangles(nodes.get(id)))]));
const cache=new Map(),baseline=new Map(),report={scope:'Independent actual native-mesh BVH/ray-parity clearance at sampled actual viewer poses; not a continuous collision certificate',pairs:[[805,859],[815,859],[805,794],[815,794]],cases:[],surfaceToleranceMM:.005};
for(const [a,b]of report.pairs){const result=interiorWitnesses(points.get(a),trees.get(b));baseline.set(a+'/'+b,result);report.cases.push({kind:'closed baseline',pair:[a,b],...result,witnesses:result.witnesses.slice(0,3)});}
assert.equal(baseline.get('805/859').allThreeInside,0,'the actual closed805/859 pair has no interior source vertices');
// Retained wrong path, independently reconstructed from its original CAD810
// axis and -65degree motion. Do not import the candidate's motion function.
function oldWrong(points,progress){const t=Math.min(1,progress*2),angle=-65*t*t*(3-2*t)*Math.PI/180,c=Math.cos(angle),s=Math.sin(angle),p=[-23.793938366273707,-58.495377681496465,414.07792324955244];return points.map(q=>{const x=q[0]-p[0],z=q[2]-p[2];return [p[0]+c*x+s*z,q[1],p[2]-s*x+c*z];});}
const negative=interiorWitnesses(oldWrong(points.get(805),.125),trees.get(859));
assert(negative.allThreeInside>=200&&negative.maxInteriorDistanceMM>1.9,'old wrong path must reproduce the critic actual-mesh interior witness');
assert.throws(()=>assertNoNewInterior(negative,baseline.get('805/859')),/New native-mesh interior intersection/,'clearance regression must reject the original wrong path');
report.negative={progress:.125,pair:[805,859],...negative,witnesses:negative.witnesses.sort((a,b)=>b.distanceMM-a.distanceMM).slice(0,3),rejected:true};
for(const [task,index]of [['extruder',0],['extruder',2],['feed-clear',1],['feed-clear',4]]){
 choose(task,index);
 for(let k=0;k<=64;k++){
  const progress=k/64;v.setProgress(progress);v.printer.updateMatrixWorld(true);
  for(const [m,snapshot]of buffers){assert.equal(m.geometry,snapshot.geometry);assert.equal(m.geometry.attributes.position.array,snapshot.buffer);assert.deepEqual(m.geometry.attributes.position.array,snapshot.values,'native geometry values remain unchanged');}
  for(const [id,expected]of fixedPoses)assert.deepEqual(printerMatrix(nodes.get(id)).toArray(),expected,'clearance must not be obtained by moving the fixed native head');
  for(const m of nodes.values())assert(m.visible,'clearance must not be obtained by hiding a required native part');
  for(const [a,b]of report.pairs){const m=nodes.get(a),pose=printerMatrix(m).toArray(),key=a+'/'+b+':'+pose.join(','),result=cache.get(key)??interiorWitnesses(uniqueVertices(meshTriangles(m)),trees.get(b));cache.set(key,result);assertNoNewInterior(result,baseline.get(a+'/'+b));report.cases.push({task,index,progress,pair:[a,b],allThreeInside:result.allThreeInside,newInterior:false,maxInteriorDistanceMM:result.maxInteriorDistanceMM});}
 }
 console.log(JSON.stringify({task,step:index+1,sampledPoses:65,clearance:'PASS'}));
}
report.uniqueActualGeometryPoses=cache.size;report.sampledPoses=260;report.result='PASS';
console.log(JSON.stringify({result:report.result,sampledPoses:report.sampledPoses,uniqueActualGeometryPoses:cache.size,oldWrongPath:{inside:negative.allThreeInside,distanceMM:negative.maxInteriorDistanceMM,rejected:true}}));
