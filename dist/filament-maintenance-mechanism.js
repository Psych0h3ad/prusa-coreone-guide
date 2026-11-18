import * as T from 'three';
import {sensorSpringGeometry} from './nextruder-sensor.js';
import {smoothCreases} from './surface-geometry.js';
import {FILAMENT_DATUM as filament} from './filament-maintenance-stock.js';
// Exact existing sensor-mechanism.json display datums, not measured travel limits.
const d={origin:[9.056553678702825,-58.3952524055465,376.475416924089],height:32.92777129638756,ballRestX:-9.5,ballRadius:2,travel:.375,springEndX:4.3,springOutsideDiameter:3,springWireDiameter:.3,springTurns:7,magnetLength:3};
export function filamentMechanism(viewer,entities){
 const get=id=>viewer.meshes.find(m=>m.userData.part===id),ball=get('hallBall'),magnet=get('hallMagnet'),spring=get('hallSpring');
 if(!ball||!magnet||!spring)throw Error('Actual installed sensor stack required');
 if(viewer.meshes.filter(m=>m.geometry===spring.geometry).length!==1)throw Error('Borrowed sensor spring geometry is shared');
 const original={P:spring.geometry.attributes.position.array.slice(),N:spring.geometry.attributes.normal.array.slice()},rest=[ball,magnet].map(m=>m.userData.restPosition.clone());let last=0;
 const reset=()=>{for(const [i,m]of[ball,magnet].entries())m.position.copy(rest[i]);if(last!==0){spring.geometry.attributes.position.array.set(original.P);spring.geometry.attributes.normal.array.set(original.N);spring.geometry.attributes.position.needsUpdate=true;spring.geometry.attributes.normal.needsUpdate=true;spring.geometry.computeBoundingBox();spring.geometry.computeBoundingSphere();}last=0;};
 return{restore:reset,follow(){
  const scene=viewer.operationScene,material=entities.find(e=>scene?.visible.includes(e.mesh));
  if(!material||material.last>435){reset();return;}
  const z=d.origin[2]+d.height,low=material.last,high=low+material.stock,dz=z<low?low-z:z>high?z-high:0,sum=d.ballRadius+filament.diameter/2;
  const contact=dz<sum?Math.sqrt(sum*sum-dz*dz):0,loaded=Math.max(0,Math.min(1,(contact-(d.origin[0]+d.ballRestX-filament.x))/(sum-(d.origin[0]+d.ballRestX-filament.x)))),travel=d.travel*loaded;
  for(const [i,m]of[ball,magnet].entries())m.position.copy(rest[i]).add(new T.Vector3(travel*.001,0,0));
  if(loaded===last)return;
  if(loaded===0){reset();return;}
  const g=sensorSpringGeometry(d,loaded);g.scale(.001,.001,.001);g.translate(...d.origin.map(v=>v*.001));smoothCreases(g);
  const P=spring.geometry.attributes.position,N=spring.geometry.attributes.normal;if(g.attributes.position.count!==P.count||g.attributes.normal.count!==N.count){g.dispose();throw Error('Sensor spring topology changed');}
  P.array.set(g.attributes.position.array);N.array.set(g.attributes.normal.array);P.needsUpdate=true;N.needsUpdate=true;spring.geometry.computeBoundingBox();spring.geometry.computeBoundingSphere();g.dispose();last=loaded;
 }};
}
