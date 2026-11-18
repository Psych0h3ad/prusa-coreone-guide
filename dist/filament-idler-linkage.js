import * as T from 'three';
import {operationAt} from './assembly-director.js?v=20261113-116';
import {ARM,CLAMP,IDLER_PIVOT,CLAMP_PIVOT} from './maintenance-access.js';
import {IDLER_SPRINGS,IDLER_SPRING_DIMENSIONS as springD} from './idler-spring-hardware.js';
import {FILAMENT_DATUM as filament} from './filament-maintenance-stock.js';
// G is the exact radius3 native796/797 spacer-seat cylinder axis. The
// official6x3.1x8 spacer seats here; preserving the imported M3 pin location
// instead had displaced that6mm bearing by1.24mm. Q is the native810 shaft
// input axis, used only to solve the rigid swivel hinge/link.
// Q is the native810 under-head shaft circle fit (complete source vertices,
// radius1.49999847mm, maximum radial residual0.00000705mm). The two tension
// screws slide on their ACTUAL X bore axes; they must not tilt in those bores.
const A=IDLER_PIVOT,C=CLAMP_PIVOT,Q=[-23.793939240209575,C[1],414.0779231980228],G=[-25.02258251960751,C[1],413.93064237854065],S=[16.1564,-58.3952524,417.447143],supportRefs=[799,801,802,805,815];
const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);},rad=x=>x*Math.PI/180;
function rotation(pivot,degrees){const p=new T.Vector3(...pivot).multiplyScalar(.001);return new T.Matrix4().makeTranslation(...p.toArray()).multiply(new T.Matrix4().makeRotationY(rad(degrees))).multiply(new T.Matrix4().makeTranslation(...p.negate().toArray()));}
function posed(p,pivot,degrees){const a=rad(degrees),x=p[0]-pivot[0],z=p[2]-pivot[2];return[pivot[0]+Math.cos(a)*x+Math.sin(a)*z,p[1],pivot[2]-Math.sin(a)*x+Math.cos(a)*z];}
function restPoints(mesh){const matrix=new T.Matrix4().compose(mesh.userData.restPosition,mesh.userData.restQuaternion,mesh.userData.restScale||mesh.scale),p=mesh.geometry.attributes.position,v=new T.Vector3(),out=[];for(let i=0;i<p.count;i++)out.push(v.fromBufferAttribute(p,i).applyMatrix4(matrix).multiplyScalar(1000).toArray());return out;}
function hull(points){const map=new Map(points.map(p=>[[p[0],p[2]].join(','),[p[0],p[2]]])),p=[...map.values()].sort((a,b)=>a[0]-b[0]||a[1]-b[1]),cross=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]),lo=[],hi=[];for(const q of p){while(lo.length>1&&cross(lo.at(-2),lo.at(-1),q)<=0)lo.pop();lo.push(q);}for(const q of p.reverse()){while(hi.length>1&&cross(hi.at(-2),hi.at(-1),q)<=0)hi.pop();hi.push(q);}return lo.slice(0,-1).concat(hi.slice(0,-1));}
function extent(poly,angle,low,high){const p=poly.map(([x,z])=>posed([x,0,z],A,angle)),xs=p.filter(q=>q[2]>=low&&q[2]<=high).map(q=>q[0]);for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length];for(const z of[low,high])if(Math.min(a[2],b[2])<z&&z<Math.max(a[2],b[2]))xs.push(a[0]+(b[0]-a[0])*(z-a[2])/(b[2]-a[2]));}return xs.length?Math.max(...xs):-Infinity;}
function place(mesh,matrix){mesh.position.copy(mesh.userData.restPosition).applyMatrix4(matrix);mesh.quaternion.setFromRotationMatrix(matrix).multiply(mesh.userData.restQuaternion);mesh.updateMatrixWorld(true);}
function actorPose(matrix){return{offset:new T.Vector3().setFromMatrixPosition(matrix),rotation:new T.Quaternion().setFromRotationMatrix(matrix),pivot:new T.Vector3()};}
export function filamentIdlerLinkage(viewer,entities){
 const resolve=refs=>viewer.director.resolve(refs),armNodes=resolve(ARM),clampNodes=resolve(CLAMP),supports=resolve(supportRefs).filter(m=>supportRefs.includes(m.userData.cadIndex)),bearings=['idlerBearing1','idlerBearing2'].map(id=>{const m=armNodes.find(m=>m.userData.part===id);if(!m)throw Error('Native idler roller required: '+id);return hull(restPoints(m));});
 const pin=clampNodes.filter(m=>m.userData.cadIndex===810||m.userData.component==='idlerSwivelSpacer').flatMap(restPoints),fork=armNodes.filter(m=>[796,797].includes(m.userData.cadIndex)).flatMap(restPoints);if(!pin.length||!fork.length)throw Error('Complete native latch meshes required');
 const clearanceAngles=new Map();function clearanceAngle(theta){if(clearanceAngles.has(theta))return clearanceAngles.get(theta);const forkTop=Math.max(...fork.map(p=>posed(p,A,theta)[2]));let lo=0,hi=45;for(let i=0;i<40;i++){const m=(lo+hi)/2;if(Math.min(...pin.map(p=>posed(p,C,m)[2]))<forkTop)lo=m;else hi=m;}const q=(lo+hi)/2;clearanceAngles.set(theta,q);return q;}
 const springs=IDLER_SPRINGS.map(row=>{const mesh=viewer.meshes.find(m=>m.userData.component===row.component);if(!mesh||viewer.meshes.filter(m=>m.geometry===mesh.geometry).length!==1)throw Error('Unshared complete native spring required');return{row,mesh,P:mesh.geometry.attributes.position.array.slice(),N:mesh.geometry.attributes.normal.array.slice(),key:null};});
 let selected=false;
 function loadedAngle(low,stock){const f=a=>Math.max(...bearings.map(p=>extent(p,a,low,low+stock)))-(filament.x-filament.diameter/2);if(f(0)<=0)return 0;let lo=-10,hi=0;if(f(lo)>0)throw Error('Actual roller/filament joint root not bracketed');for(let i=0;i<44;i++){const m=(lo+hi)/2;if(f(m)>0)hi=m;else lo=m;}return(lo+hi)/2;}
 function support(shift){return{matrix:new T.Matrix4().makeTranslation(shift*.001,0,0),beta:0,shift};}
 function joint(theta){const target=posed(G,A,theta),v=[Q[0]-C[0],Q[2]-C[2]],length=Math.hypot(...v),phi=(Math.asin((target[2]-C[2])/length)-Math.atan2(v[1],-v[0]))*180/Math.PI,dx=target[0]-posed(Q,C,phi)[0];return{phi,dx};}
 function latch(t,theta){
  // Pull the crossbar through the LEFT hook mouth before yawing it upward.
  // One mm is an authored hand stroke, not an OEM spring-force prescription.
  const initial=joint(theta),clearPhi=clearanceAngle(theta),pull=t<1/3?smooth(t*3):t<2/3?1:1-smooth(t*3-2),phi=initial.phi+(45-initial.phi)*smooth((t-1/3)*3),dx=initial.dx*(1-smooth((phi-clearPhi)/(45-clearPhi)))-pull;
  const clamp=new T.Matrix4().makeTranslation(dx*.001,0,0).multiply(rotation(C,phi));return{clamp,support:support(dx),carrier:0,pull,phi};
 }
 function fraction(role){const i=viewer.sceneActors.findIndex(a=>a.accessRole===role);if(i<0)return null;const at=operationAt(viewer.operationProgress,viewer.sceneActors.length);return at.index<i?0:at.index>i?1:at.t;}
 function springShape(state){
  for(const q of springs){place(q.mesh,new T.Matrix4());const key=[state.beta,state.shift].join(',');if(q.key===key)continue;const {mesh,row}=q,P=mesh.geometry.attributes.position,N=mesh.geometry.attributes.normal;
   if(state.beta===0&&state.shift===0){P.array.set(q.P);N.array.set(q.N);}else{
    const wire=springD.wireDiameter/2,r=(springD.outsideDiameter-springD.wireDiameter)/2,head=new T.Vector3(S[0],row.y,S[2]).multiplyScalar(.001).applyMatrix4(state.matrix).multiplyScalar(1000),start=new T.Vector3(2.0564,row.y,row.z),axis=head.clone().sub(start).normalize(),U=new T.Vector3(0,1,0),V=new T.Vector3().crossVectors(axis,U).normalize(),gap=head.clone().sub(start).dot(axis),length=gap-.2;
    if(length<=springD.turns*springD.wireDiameter)throw Error('Idler spring reaches solid coil height');const points=[];
    for(let i=0;i<=240;i++){const turns=i/240*springD.turns,a=turns*Math.PI*2,axial=turns<=1?turns*springD.wireDiameter:turns>=springD.turns-1?length-2*springD.wireDiameter+(turns-springD.turns+1)*springD.wireDiameter:springD.wireDiameter+(turns-1)*(length-3*springD.wireDiameter)/(springD.turns-2),p=start.clone().addScaledVector(axis,.35+axial).addScaledVector(U,r*Math.cos(a)).addScaledVector(V,r*Math.sin(a));points.push(p);}
    const g=new T.TubeGeometry(new T.CatmullRomCurve3(points),240,wire,8,false);g.scale(.001,.001,.001);if(g.attributes.position.count!==P.count||g.index.count!==mesh.geometry.index.count){g.dispose();throw Error('Complete spring topology changed');}P.array.set(g.attributes.position.array);N.array.set(g.attributes.normal.array);g.dispose();
   }P.needsUpdate=true;N.needsUpdate=true;mesh.geometry.computeBoundingBox();mesh.geometry.computeBoundingSphere();q.key=key;
  }
 }
 function restore(){for(const m of supports)place(m,new T.Matrix4());for(const q of springs){place(q.mesh,new T.Matrix4());q.mesh.geometry.attributes.position.array.set(q.P);q.mesh.geometry.attributes.normal.array.set(q.N);q.mesh.geometry.attributes.position.needsUpdate=true;q.mesh.geometry.attributes.normal.needsUpdate=true;q.mesh.geometry.computeBoundingBox();q.mesh.geometry.computeBoundingSphere();q.key=null;}}
 const api={loadedAngle,clearanceAngle,prepare(task){selected=Boolean(task?.filamentMaintenance);restore();},restore,decorate(spec,task,index,text){if(!task.filamentMaintenance)return spec;const p=spec.plan,loaded=task.id==='fragment'&&index===0||task.steps[index].id==='manual-idler-open',theta=loaded?loadedAngle(task.id==='fragment'?350:328,task.id==='fragment'?40:400):0;p.access.linkedIdler=true;p.access.linkedInitial=theta;
   for(const a of p.actors||[])if(a.accessRole==='clamp'){a.rigidPose=t=>actorPose(latch(p.access.closing?1-t:t,theta).clamp);a.label=text(p.access.closing?['スイベルを引き、下げてからフックへ戻す','Pull the swivel, lower it, then seat it in the hook','Přitáhnout otočný díl, sklopit jej a usadit do háčku','Schwenkhebel ziehen, absenken und in den Haken einsetzen']:['スイベルを左へ引いてから持ち上げる','Pull the swivel left, then lift it','Přitáhnout otočný díl doleva a pak jej zvednout','Schwenkhebel nach links ziehen, dann anheben']);}else if(a.accessRole==='arm'){a.rigidPose=t=>actorPose(rotation(A,p.access.closing?-10+10*smooth(t):theta+(-10-theta)*smooth(t)));}
   return spec;},follow(){
   if(!selected)return;const p=viewer.operationScene?.plan,mode=p?.access;if(!mode?.linkedIdler)return;
   let theta=mode.materialLoadedHold?loadedAngle(entities[0].last,entities[0].stock):mode.armHold??(mode.held?-10:0),state;
   if(mode.opening){const c=fraction('clamp')??0,a=fraction('arm')??0;theta=mode.linkedInitial+(-10-mode.linkedInitial)*smooth(a);state=latch(c,mode.linkedInitial);}
   else if(mode.closing){const a=fraction('arm');theta=a===null?0:-10+10*smooth(a);const c=fraction('clamp');state=latch(c===null?0:1-c,0);}
   else if(mode.materialLoadedHold){const q=joint(theta);state={clamp:new T.Matrix4().makeTranslation(q.dx*.001,0,0).multiply(rotation(C,q.phi)),support:support(q.dx),carrier:0,pull:0,phi:q.phi};}
   else state=latch((mode.clampHold??(mode.held?45:0))/45,0);
   for(const m of armNodes)place(m,rotation(A,theta));for(const m of clampNodes)place(m,state.clamp);for(const m of supports)place(m,state.support.matrix);springShape(state.support);api.last={arm:theta,carrier:state.carrier,pull:state.pull,swivel:state.phi,supportBeta:state.support.beta,supportShift:state.support.shift};
  }};return api;
}

