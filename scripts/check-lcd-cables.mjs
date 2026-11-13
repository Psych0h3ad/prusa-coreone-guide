import assert from 'node:assert/strict';
import * as T from '../dist/vendor/three.module.js';
import {v} from './check-viewer.mjs';
import {FLOWS} from '../dist/data.js';
import {LCD_EARTH_REFERENCE,LCD_EARTH_LOOSE} from '../dist/lcd-cable-motion.js';
const show=n=>{v.setState({flow:'build',index:FLOWS.build.steps.findIndex(s=>s.chapter===7&&s.officialStep===n),variant:'screw',comparison:'after',explore:false,completed:[]});v.autoplayPending=false;};
const cable=v.fasteners.entities.get('earthR'),buffer=cable.geometry.attributes.position.array,normals=cable.geometry.attributes.normal.array,prefix=cable.prefix.getPoints(40).map(p=>p.toArray());
show(22);assert.deepEqual(v.sceneActors.map(a=>a.flex),[['lcdWire'],['earthR']]);v.seek(1);const connected=cable.route.getPoint(1);show(23);v.seek(0);assert(cable.route.getPoint(1).distanceTo(connected)<1e-7,'step handoff keeps the attached end');
let maxLengthError=0,maxEndpointError=0,maxSeekMs=0;
for(let i=0;i<=128;i++){
 const start=performance.now();v.seek(i/128);maxSeekMs=Math.max(maxSeekMs,performance.now()-start);v.scene.updateMatrixWorld(true);
 const terminal=v.director.resolve(['lcdFaston'])[0],reference=new T.Vector3(...LCD_EARTH_REFERENCE).multiplyScalar(.001).applyMatrix4(terminal.matrixWorld).applyMatrix4(v.printer.matrixWorld.clone().invert()).multiplyScalar(1000);
 maxEndpointError=Math.max(maxEndpointError,reference.distanceTo(cable.route.getPoint(1)));
 assert.equal(cable.geometry.attributes.position.array,buffer);assert.equal(cable.geometry.attributes.normal.array,normals);assert(buffer.every(Number.isFinite));assert(normals.every(Number.isFinite));
 assert.deepEqual(cable.prefix.getPoints(40).map(p=>p.toArray()),prefix,'tied prefix stays fixed');maxLengthError=Math.max(maxLengthError,Math.abs(cable.mesh.userData.routingLengthError));
}
assert(maxLengthError<.025,`constant free lead length, error ${maxLengthError}`);assert(maxEndpointError<1e-7,'earth reference follows the measured male blade');
v.seek(.57);const middle=Array.from(buffer);v.seek(.9);v.seek(.57);assert.deepEqual(Array.from(buffer),middle,'seeking restores the deformed buffers exactly');
v.seek(1);const seated=cable.route.getPoint(1);show(24);assert(cable.route.getPoint(1).distanceTo(seated)<1e-7);show(21);assert(cable.route.getPoint(1).distanceTo(new T.Vector3(...LCD_EARTH_LOOSE))<1e-8,'previous bench step restores loose end');
v.setState({...v.state,explore:true});assert(cable.route.getPoint(1).distanceTo(seated)<1e-7,'completed preview keeps the final route');
console.log(`PASS: 129 live installation poses, fixed prefix and buffers, reversible seeking, continuous 22→23→24 handoffs, ${maxLengthError.toFixed(5)} mm free-length error, ${maxEndpointError.toExponential(2)} mm earth-reference error; maximum CPU seek ${maxSeekMs.toFixed(1)} ms. Routing reference does not verify connector engagement or physical wire stiffness.`);
