import * as T from'three';
import{TubeSurface}from'./ptfe-surface.js?v=20261111-94';
import{SIDE_PTFE_SEATS as seats}from'./side-ptfe-seats.js';
import{reconstructSidePtfeTail}from'./side-ptfe-tail.js';
import{transportSidePtfeFeed}from'./side-ptfe-feed.js';
export function installSideIRMainPtfe(viewer,add,bodyNodes){
 const source=viewer.fasteners.entities.get('ptfeTube'),completion=viewer.sidePtfeCompletion;
 if(!source||!completion?.active||!completion.tubeSourceSample)throw Error('Existing full-stock PTFE source missing');
 const sample=completion.tubeSourceSample,sourceGeometry=source.geometry,base=sample.call(source,5,1,new Float32Array(source.points.length)),segments=base.length/3-1,surface=new TubeSurface(segments,source.surface.radial),geometry=surface.update(base),material=source.mesh.material.clone();
 material.userData={...material.userData,originalColor:source.mesh.material.color.clone(),originalOpacity:source.mesh.material.userData.originalOpacity??1};
 const unplugged=reconstructSidePtfeTail(base,seats.long,{transformPoint:p=>new T.Vector3(...p).addScaledVector(new T.Vector3(...seats.long.axisOutCAD),seats.long.engagementMM+4).toArray()});if(!unplugged.ok)throw Error(unplugged.reason);
 const id='sideIRMainPTFE',mesh=add(id,geometry,material,undefined,{flexId:id,stock:{lengthMM:710,outerDiameterMM:4,innerDiameterMM:2.5},sourceFactory:'existing TubeSurface and reconstructSidePtfeTail',manufacturerCAD:false}),entity={id,mesh,active:false,amount:0,lastKey:'',points:new Float32Array(base.length),update(from=this.amount,to=this.amount,t=1){
  if(!this.active||viewer.disposed||viewer.state?.flow!=='service'||!viewer.operationScene?.plan.sideIRService)return;
  if(source.geometry!==sourceGeometry||completion.tubeSourceSample!==sample||!completion.active)throw Error('Side IR PTFE source owner changed');
  const u=from+(to-from)*T.MathUtils.smoothstep(t,0,1);this.amount=u;const key=String(u);if(key===this.lastKey)return;
  let result;if(u<=1){const delta=new T.Vector3(...seats.long.axisOutCAD).multiplyScalar((seats.long.engagementMM+4)*u);result=reconstructSidePtfeTail(base,seats.long,{transformPoint:p=>new T.Vector3(...p).add(delta).toArray()});if(!result.ok)throw Error(result.reason);}else{const feed=2-u,points=sample.call(source,5,feed,new Float32Array(base.length));transportSidePtfeFeed(points,unplugged.points,feed);result={points,sourcePhase5Amount:feed,sourceFactoryStockMM:710};}
  this.points.set(result.points);surface.update(this.points);this.lastKey=key;mesh.userData.flexState={phase:5,amount:u,stockLengthMM:710,withdrawalMM:(seats.long.engagementMM+4)*Math.min(1,u),mated:u===0,fixedIntervals:[[0,92],[410,660]],report:{...result,points:undefined}};
 },guide(){const p=[];for(let i=0;i<=segments;i+=16)p.push(new T.Vector3().fromArray(this.points,i*3).multiplyScalar(.001));return p;}};
 if(viewer.fasteners.entities.has(id))throw Error('Duplicate side IR PTFE entity');viewer.fasteners.entities.set(id,entity);return entity;
}
