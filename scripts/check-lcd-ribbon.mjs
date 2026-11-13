import assert from 'node:assert/strict';
import * as T from '../dist/vendor/three.module.js';
import {v} from './check-viewer.mjs';
import {FLOWS} from '../dist/data.js';
import {LCD_RIBBON_REFERENCE,LCD_RIBBON_LOOSE,ribbonProfile,baseRibbonProfile} from '../dist/lcd-ribbon.js';
const show=n=>{v.setState({flow:'build',index:FLOWS.build.steps.findIndex(s=>s.chapter===7&&s.officialStep===n),variant:'screw',comparison:'after',explore:false,completed:[]});v.autoplayPending=false;};
const ribbon=v.fasteners.entities.get('lcdWire'),positions=ribbon.geometry.attributes.position.array,normals=ribbon.geometry.attributes.normal.array,prefix=ribbon.prefix.getPoints(40).map(p=>p.toArray());
const shellEdges=new Map(),shellIndex=ribbon.geometry.index.array;
for(let i=0;i<shellIndex.length;i+=3){
 const face=[shellIndex[i],shellIndex[i+1],shellIndex[i+2]];
 assert.equal(new Set(face).size,3,'ribbon triangles have three distinct vertices');
 for(let k=0;k<3;k++){
  const a=face[k],b=face[(k+1)%3],key=`${Math.min(a,b)}:${Math.max(a,b)}`,edge=shellEdges.get(key)||{count:0,balance:0};
  edge.count++;edge.balance+=a<b?1:-1;shellEdges.set(key,edge);
 }
}
assert([...shellEdges.values()].every(e=>e.count===2&&e.balance===0),'ribbon shell is closed with consistent face orientation');
assert(ribbon.geometry.attributes.color.array.some((n,i,a)=>i%3===0&&n>a[i+1]*1.4),'pink reference edge');
for(const a of [0,Math.PI/4,Math.PI/2,Math.PI]){const rows=ribbonProfile(a);assert(rows.every(p=>Object.values(p).every(Number.isFinite)));const width=Math.max(...rows.map(p=>p.u))-Math.min(...rows.map(p=>p.u));assert(width>=14&&width<=30.000001,'folded section retains both arms');}
const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
for(const k of [0,.25,.5,.75,1])for(const angle of [0,.2,.5,.8,1].map(n=>n*Math.PI)){
 const rows=baseRibbonProfile(angle,k),outline=[...rows.map(p=>[p.u+Math.sin(p.phi)*.4,p.w-Math.cos(p.phi)*.4]),...rows.slice().reverse().map(p=>[p.u-Math.sin(p.phi)*.4,p.w+Math.cos(p.phi)*.4])];
 for(let a=0;a<outline.length;a++)for(let b=a+2;b<outline.length;b++){if(a===0&&b===outline.length-1)continue;const c=(a+1)%outline.length,d=(b+1)%outline.length;assert(!(cross(outline[a],outline[c],outline[b])*cross(outline[a],outline[c],outline[d])<-1e-10&&cross(outline[b],outline[d],outline[a])*cross(outline[b],outline[d],outline[c])<-1e-10),'sampled folded material outline does not cross itself');}
}
show(21);const loose=ribbon.route.getPoint(1);assert(loose.distanceTo(new T.Vector3(...LCD_RIBBON_LOOSE))<1e-7);
show(22);v.seek(0);assert(ribbon.route.getPoint(1).distanceTo(loose)<1e-7,'previous-step handoff');v.seek(.5);const attached=ribbon.route.getPoint(1);v.seek(1);assert(ribbon.route.getPoint(1).distanceTo(attached)<1e-7,'ribbon remains attached while earth lead connects');show(23);v.seek(0);assert(ribbon.route.getPoint(1).distanceTo(attached)<1e-7,'installation handoff');
let maxLengthError=0,maxEndpointError=0,maxSeekMs=0;
show(22);for(let i=0;i<=128;i++){v.seek(i/128);maxLengthError=Math.max(maxLengthError,Math.abs(ribbon.mesh.userData.routingLengthError));assert(positions.every(Number.isFinite));assert(normals.every(Number.isFinite));}assert.equal(ribbon.geometry.drawRange.count,ribbon.geometry.index.count,'connected ribbon includes material-strip end caps');show(23);
for(let i=0;i<=128;i++){
 const t=performance.now();v.seek(i/128);maxSeekMs=Math.max(maxSeekMs,performance.now()-t);v.scene.updateMatrixWorld(true);
 const display=v.director.resolve([595])[0],ref=new T.Vector3(...LCD_RIBBON_REFERENCE).multiplyScalar(.001).applyMatrix4(display.matrixWorld).applyMatrix4(v.printer.matrixWorld.clone().invert()).multiplyScalar(1000);
 maxEndpointError=Math.max(maxEndpointError,ref.distanceTo(ribbon.route.getPoint(1)));maxLengthError=Math.max(maxLengthError,Math.abs(ribbon.mesh.userData.routingLengthError));
 assert.equal(ribbon.geometry.attributes.position.array,positions);assert.equal(ribbon.geometry.attributes.normal.array,normals);assert(positions.every(Number.isFinite));assert(normals.every(Number.isFinite));assert.deepEqual(ribbon.prefix.getPoints(40).map(p=>p.toArray()),prefix);
}
assert(maxLengthError<.03);assert(maxEndpointError<1e-7);v.seek(.61);const middle=Array.from(positions);v.seek(.9);v.seek(.61);assert.deepEqual(Array.from(positions),middle);v.seek(1);const final=ribbon.route.getPoint(1);show(24);assert(ribbon.route.getPoint(1).distanceTo(final)<1e-7);v.setState({...v.state,explore:true});assert(ribbon.route.getPoint(1).distanceTo(final)<1e-7);
console.log(`PASS: folded ribbon, reference stripe, 129 connection and 129 actual installation poses, fixed prefix/buffers, reversible seeking, 21→22→23→24/full handoffs; free-length error ${maxLengthError.toFixed(5)} mm, illustrative reference error ${maxEndpointError.toExponential(2)} mm; CPU seek ${maxSeekMs.toFixed(1)} ms. Not a measured PCB datum or mating/stiffness validation.`);
