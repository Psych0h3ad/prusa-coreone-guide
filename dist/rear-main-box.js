import * as T from 'three';
import {Spline,Metres,writeRing} from './rear-main-curves.js';

// Independent blue3 adapter: no LCD, FE, mainRear, viewer state or CAD changes.
// The caller supplies blue3-route.json, or its already-loaded object.
export function installR3BoxLower(entity,{routeData}={}){
 if(entity.id!=='boxLower'||entity.radius!==2.5)throw Error('Expected original boxLower r2.5 entity');
 if(entity.rearBlue3)return entity.rearBlue3;
 if(!routeData||Math.abs(routeData.stockMM-221.248465580051)>1e-8)throw Error('Expected blue3 full retained stock');
 const original={geometry:entity.geometry,curve:entity.curve,samples:entity.samples,update:entity.update};
 const mm=new Spline(routeData);if(Math.abs(mm.measured(128)-routeData.stockMM)>1e-8)throw Error('blue3 integration mismatch');
 const curve=new Metres(mm),geometry=new T.TubeGeometry(curve,128,.0025,8,false);
 for(let i=0;i<=128;i++)writeRing(geometry,i,routeData.centres[i],routeData.tangents[i],routeData.normals[i],2.5);
 for(const n of ['position','normal']){const a=original.geometry.attributes[n].array;geometry.attributes[n].array.set(a.slice(0,27));geometry.attributes[n].array.set(a.slice(-27),128*27);}
 geometry.setDrawRange(0,geometry.index.count);geometry.computeBoundingBox();geometry.computeBoundingSphere();
 entity.geometry=entity.mesh.geometry=geometry;entity.curve=curve;entity.samples=128;
 const follow=()=>{if(entity.geometry!==geometry||entity.mesh.geometry!==geometry)throw Error('boxLower geometry replaced after blue3 installation');geometry.setDrawRange(0,geometry.index.count);return entity;};
 entity.update=function(...args){original.update.apply(this,args);follow();};
 const api={revision:'r3-blue3-only-r2',active:true,stockMM:routeData.stockMM,radiusMM:2.5,sourceCapsExact:true,curve,follow,
  dispose(){if(!api.active)return;api.active=false;const q=entity.mesh.userData.flexState;entity.update=original.update;entity.geometry=entity.mesh.geometry=original.geometry;entity.curve=original.curve;entity.samples=original.samples;delete entity.rearBlue3;geometry.dispose();entity.lastKey='';if(q)entity.update(q.from,q.to,q.t);}
 };
 entity.rearBlue3=api;return api;
}
