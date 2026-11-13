import assert from 'node:assert/strict';
import {v} from './check-viewer.mjs';
import {FILAMENT_SERVICE_ROUTE} from '../dist/filament-service-routing.js';

const load=v.fasteners.entities.get('lbLoadcellLead'),sensor=v.fasteners.entities.get('lbFilamentLead');
load.update(1,1,1);sensor.update(1,1,1);
const position=sensor.geometry.attributes.position,nativeStart=3*567*3,native=position.array.slice(nativeStart),root=Array.from({length:3},(_,w)=>[0,1,2].map(i=>(position.array[w*567*3+i]+position.array[w*567*3+9+i])*500));
let maxLengthError=0,maxDeflection=0,maxRootDrift=0;
const seated=position.array.slice();
for(let k=0;k<=64;k++){
 const t=k/64;
 // Animate only the loadcell actor, as the production fastener director does.
 load.update(1,0,t);
 assert.equal(sensor.mesh.userData.flexState.neighborAmount,load.mesh.userData.flexState.amount,'a stationary sensor loom follows the neighbouring actor without an explicit refresh');
 assert.deepEqual(position.array.slice(nativeStart),native,'the retained sensor plug does not move');
 for(let w=0;w<3;w++)maxRootDrift=Math.max(maxRootDrift,Math.hypot(...[0,1,2].map(i=>(position.array[w*567*3+i]+position.array[w*567*3+9+i])*500-root[w][i])));
 maxLengthError=Math.max(maxLengthError,Math.abs(sensor.curve.getLength()-FILAMENT_SERVICE_ROUTE.length));
 for(let i=0;i<nativeStart;i+=3)maxDeflection=Math.max(maxDeflection,Math.hypot(position.array[i]-seated[i],position.array[i+1]-seated[i+1],position.array[i+2]-seated[i+2])*1000);
 const forward=position.array.slice();load.update(0,1,1-t);assert.deepEqual(position.array,forward,'the entire coupled loom seeks reversibly');
}
assert(maxLengthError<.025,'temporary clearance preserves the display cable length');
assert(maxRootDrift<.00005,'all three soldered lead centres remain fixed within Float32 precision');
assert(maxDeflection>1,'the cable flexes when the adjacent connector needs clearance');
load.update(1,1,1);assert.deepEqual(position.array,seated,'the bundle returns to its dressed channel pose');
// Official right-cover service order: LC out, sensor out; LC in, sensor in.
load.update(1,0,1);const relieved=position.array.slice();sensor.update(1,0,0);
assert.deepEqual(position.array,relieved,'sensor withdrawal starts at the retained clearance pose');
let maxServiceLengthError=0;
for(let k=0;k<=128;k++){
 sensor.update(1,0,k/128);const forward=position.array.slice();
 maxServiceLengthError=Math.max(maxServiceLengthError,Math.abs(sensor.curve.getLength()-FILAMENT_SERVICE_ROUTE.length));
 sensor.update(0,1,1-k/128);assert.deepEqual(position.array,forward,'sensor service withdrawal seeks reversibly');
}
assert(maxServiceLengthError<.025);
sensor.update(1,0,1);const parked=position.array.slice();
for(let k=0;k<=64;k++){load.update(0,1,k/64);assert.deepEqual(position.array,parked,'the loose sensor stays parked while LC is reconnected');}
sensor.update(0,1,0);assert.deepEqual(position.array,parked,'the insertion route meets the same loose endpoint');
sensor.update(0,1,1);assert.deepEqual(position.array,seated,'official reassembly returns to the dressed channel pose');
console.log(JSON.stringify({status:'PASS',poses:259,maxRootDriftMM:maxRootDrift,maxLengthErrorMM:Math.max(maxLengthError,maxServiceLengthError),maxDeflectionMM:maxDeflection,scope:'Production callbacks, retained native plug and roots, fixed display length, exact reverse, official service joins and final return. Separate triangle audit checks intersections.'}));
