import assert from 'node:assert/strict';
import * as T from '../dist/vendor/three.module.js';
import {v} from './check-viewer.mjs';
import {FLOWS} from '../dist/data.js';
import {poseOnPath} from '../dist/assembly-director.js';
const show=(step,p=1)=>{v.setState({flow:'build',index:FLOWS.build.steps.findIndex(s=>s.chapter===2&&s.officialStep===step),variant:'screw',comparison:'after',explore:false,completed:[]});v.autoplayPending=false;v.seek(p);v.printer.updateMatrixWorld(true);};
const points=id=>{const inv=v.printer.matrixWorld.clone().invert(),out=[];for(const m of v.director.resolve([id])){const matrix=inv.clone().multiply(m.matrixWorld),a=m.geometry.attributes.position;for(let i=0;i<a.count;i++)out.push(new T.Vector3().fromBufferAttribute(a,i).applyMatrix4(matrix));}return out;};
const bounds=id=>new T.Box3().setFromPoints(points(id));
show(31);
// Find the actual sheet faces around the fan grid, rather than using the whole
// rear assembly's AABB (whose raised folds reach far in front of the fan face).
const levels=[];
for(const m of v.director.resolve([66])){
 const M=v.printer.matrixWorld.clone().invert().multiply(m.matrixWorld),g=m.geometry,a=g.attributes.position,ix=g.index;
 for(let i=0;i<(ix?.count||a.count);i+=3){const ps=[0,1,2].map(k=>new T.Vector3().fromBufferAttribute(a,ix?ix.getX(i+k):i+k).applyMatrix4(M));const center=ps[0].clone().add(ps[1]).add(ps[2]).multiplyScalar(1/3);if(center.x<-.065||center.x>.064||center.z<.35||center.z>.42)continue;const N=ps[1].clone().sub(ps[0]).cross(ps[2].clone().sub(ps[0]));if(N.lengthSq()<1e-18||Math.abs(N.normalize().y)<.999999)continue;levels.push(center.y);}
}
assert(levels.length>40,'source CAD has planar faces around the hexagonal openings');
const panelInner=Math.min(...levels),fanBounds=[70,72].map(bounds),grid=bounds(71),tolerance=.000001;
assert(Math.abs(panelInner-.2053)<.00001,'local panel face extracted from source CAD');
// poseOnPath is a piecewise linear path with monotonic smooth timing. Every
// point lies in the convex hull of its path vertices. This half-space check
// therefore bounds the entire continuous sweep, not just a few time samples.
for(let i=0;i<2;i++){
 const actor=v.sceneActors[i],fan=fanBounds[i];
 const furthest=fan.max.y+Math.max(...actor.path.map(p=>p.y));
 assert(furthest<=panelInner+tolerance,`fan ${i+1} crosses rear sheet: sweep reaches ${(furthest*1000).toFixed(3)} mm; mounting face ${(panelInner*1000).toFixed(3)} mm`);
 assert(actor.path.every(p=>p.y<=0&&Math.abs(p.x)<1e-10&&Math.abs(p.z)<1e-10),'fans approach from the chamber side along their mounting axis');
 assert(Math.abs(fan.max.y-panelInner)<tolerance,'fan seating face touches rear sheet');
 for(let j=0;j<=200;j++){const p=poseOnPath(actor.path,j/200);assert(fan.max.y+p.y<=panelInner+tolerance);}
}
assert(fanBounds[0].min.x-fanBounds[1].max.x>.0039,'the fans remain separated throughout parallel insertion');
const innerNormal=new T.Vector3(0,-1,0).transformDirection(v.printer.matrixWorld);assert(innerNormal.y>.999,'the chamber face points upward on the workbench');
show(32);
const cover=v.sceneActors[0];assert(cover.nodes.some(m=>m.userData.cadPath?.includes(71)));
const contact=Math.min(...fanBounds.map(b=>b.min.y));
assert(grid.max.y+Math.max(...cover.path.map(p=>p.y))<=contact+tolerance,'cover never passes through either fan');
assert(Math.abs(grid.max.y-contact)<tolerance,'grid seats on the inner fan faces');
const screws=v.sceneActors[1];assert(screws.path.every(p=>p.y<=0),'screws enter from the cover side');
for(const id of [138,140,142,144]){
 const b=bounds(id),head=points(id).filter(p=>p.y<=b.min.y+.003+tolerance);
 assert(head.length>12);assert(Math.max(...head.map(p=>p.y))+Math.max(...screws.path.map(p=>p.y))<=grid.min.y+tolerance,'screw head seats outside the grid');
}
show(31,.79);const poses=v.director.resolve([70,72]).map(m=>m.position.toArray());v.seek(0);v.seek(.79);assert.deepEqual(v.director.resolve([70,72]).map(m=>m.position.toArray()),poses,'mid-insertion seek is reversible');
show(32);const finish=v.director.resolve([70,71,72,138,140,142,144]).map(m=>[...m.position.toArray(),...m.quaternion.toArray()]);show(33);assert.deepEqual(v.director.resolve([70,71,72,138,140,142,144]).map(m=>[...m.position.toArray(),...m.quaternion.toArray()]),finish,'completed fan unit persists into the next step');
show(35);const transfer=v.sceneActors[0];for(const id of [70,71,72,138,140,142,144])assert(transfer.nodes.some(m=>m.userData.cadPath?.includes(id)),'rear-to-frame transfer includes all fan hardware');
console.log('PASS: continuous fan and grid sweeps stay on the mounting side; source CAD seating planes; workbench orientation; screw-head seating; fan spacing; seeking and rear-unit handoffs. GPU and tool clearances are not exercised.');
