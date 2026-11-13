import assert from 'node:assert/strict';
import {v} from './check-viewer.mjs';
import {FLOWS} from '../dist/data.js';
import {SWIVEL_SPACER} from '../dist/idler-swivel-hardware.js';
const choose=n=>{v.setState({flow:'build',index:FLOWS.build.steps.findIndex(s=>s.chapter===5&&s.officialStep===n),comparison:'after',variant:'screw',explore:false,completed:[]});v.autoplayPending=false;};
const pose=m=>[...m.position.toArray(),...m.quaternion.toArray()];
choose(16);assert.deepEqual(v.sceneActors.map(a=>a.refs),[[810],['idlerSwivelSpacer'],[798],[809]]);
v.seek(1);const held=v.director.resolve([808,798,810,809,'idlerSwivelSpacer']).map(m=>({m,p:pose(m)}));
assert(held.every(({m})=>m.visible));assert.equal(v.director.resolve(['idlerSwivelSpacer']).length,1);assert.deepEqual([SWIVEL_SPACER.outerDiameter,SWIVEL_SPACER.innerDiameter,SWIVEL_SPACER.length],[6,3.1,8]);
choose(17);v.seek(0);for(const {m,p}of held){assert(m.visible);assert.deepEqual(pose(m),p,'swivel and spacer remain in place between official steps');}
assert.deepEqual(v.sceneActors.map(a=>a.refs),[[799],[802],[801]]);
for(let k=0;k<=128;k++){
 v.seek(k/384);assert(v.director.resolve([802,801]).every(m=>!m.visible||m.position.y<m.userData.restPosition.y-.024),'the nut pivot screw cannot be installed before the nut');
 for(const {m,p}of held)assert.deepEqual(pose(m),p,'nut insertion leaves the first screw, spacer and fork fixed');
}
v.seek(1);const finished=v.meshes.map(pose);choose(16);choose(17);v.seek(1);v.meshes.forEach((m,i)=>assert.deepEqual(pose(m),finished[i],'direct entry reconstructs the completed subassembly'));
choose(18);assert(v.sceneActors[1].nodes.some(m=>m.userData.component==='idlerSwivelSpacer'),'assembly transfer includes the new spacer');
for(let k=0;k<=32;k++){
 v.seek((1+k/32)/3);const parts=v.sceneActors[1].nodes,first=parts[0],delta=first.position.clone().sub(first.userData.restPosition);
 for(const m of parts)assert(m.position.clone().sub(m.userData.restPosition).distanceTo(delta)<1e-10,'all swivel components travel as one rigid subassembly');
}
console.log('PASS: official 6.16–6.18 screw order, 6×3.1×8 spacer, 129 insertion samples, held context, random entry and rigid assembly transfer.');
