import assert from 'node:assert/strict';
import * as T from '../dist/vendor/three.module.js';
import {LoveBoardServiceCable,LOVEBOARD_CABLE_DEFINITIONS}from '../dist/loveboard-service-cables.js';
import {HALL_CABLE}from '../dist/hall-sensor-layout.js';
// The viewer loads manufacturer housings before constructing cable actors.
import './check-viewer.mjs';
const d=LOVEBOARD_CABLE_DEFINITIONS.find(d=>d.id==='lbFilamentLead'),e=new LoveBoardServiceCable(d),p=e.geometry.attributes.position;
assert.equal(d.colors.length,3);assert(d.colors.every(c=>c===HALL_CABLE.color));
const before=p.array.slice(),forward=e.guide(1,0),back=e.guide(0,1);
assert.deepEqual(p.array,before,'guide construction never changes the animated cable');
assert(forward.length>=2);assert.equal(back.length,forward.length);for(let i=0;i<forward.length;i++)assert(forward[i].distanceTo(back.at(-1-i))<1e-10,'guide reverses all routing waypoints');
assert(forward.at(-1).distanceTo(e.tail.clone().multiplyScalar(.001))<1e-10,'guide marks the plug mating position');
let maxAnchorError=0,maxEndError=0,maxTurn=0,minSeparation=Infinity,turnCase;
const centre=(wire,i)=>new T.Vector3().fromBufferAttribute(p,wire*567+i*7).add(new T.Vector3().fromBufferAttribute(p,wire*567+i*7+3)).multiplyScalar(500);
for(let k=0;k<=256;k++){
 const amount=k/256;e.update(amount,amount,1);
 for(let wire=0;wire<3;wire++){
  maxAnchorError=Math.max(maxAnchorError,centre(wire,0).distanceTo(new T.Vector3(...HALL_CABLE.pads[wire])));
  const a=centre(wire,79),b=centre(wire,80);assert(b.x<a.x,'straight plug tail remains aligned with the mating axis');
  maxEndError=Math.max(maxEndError,Math.hypot(a.y-b.y,a.z-b.z));
  for(let i=1;i<80;i++){const a=centre(wire,i-1),b=centre(wire,i),c=centre(wire,i+1),turn=b.clone().sub(a).angleTo(c.clone().sub(b));if(turn>maxTurn){maxTurn=turn;turnCase={amount,wire,i,points:[a.toArray(),b.toArray(),c.toArray()]};}}
 }
 for(let i=0;i<=80;i++)for(const[a,b]of[[0,1],[1,2],[0,2]])minSeparation=Math.min(minSeparation,centre(a,i).distanceTo(centre(b,i)));
}
assert(maxAnchorError<.0001,'all three soldered source ends remain fixed');
assert(maxEndError<.001,'plug-side wires arrive along the mating axis');
assert(maxTurn<Math.PI/3,'strand path has no folded-back cusp at sampled stations');
assert(minSeparation>.52,'sampled strand centres remain wider than two wire radii');
console.log(JSON.stringify({status:'PASS',states:257,maxAnchorErrorMM:maxAnchorError,maxEndAxisErrorMM:maxEndError,maxSampleTurnDegrees:maxTurn*180/Math.PI,turnCase,minSameStationSeparationMM:minSeparation,limits:'Sampled frame and endpoint checks; separate triangle collision audit covers strand-to-strand and head/cable context.'}));
