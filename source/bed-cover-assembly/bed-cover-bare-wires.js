import * as T from'three';
import{Joined}from'./heatbed-material-curves.js';
const V=p=>new T.Vector3(...p);
function curve(points){const c=new T.CubicBezierCurve3(...points.map(V));c.arcLengthDivisions=4096;return c;}
function extend(prefix,stock){const start=prefix.getPointAt(1),remaining=stock-prefix.getLength();if(!(remaining>0))throw Error('Whole bare wire stock required');const direction=V([0,1,0]),end=start.clone().addScaledVector(direction,remaining);return new Joined([prefix,new T.LineCurve3(start,end)]);}
// Source4.6 precedes4.26/27 routing into the covered channel and sleeve.
// Retain the existing reference fixed-crimp datum, full neutral stock and gauge.
// The loose table layout is authored from the source photo, not an OEM cutlength,
// bend-radius or concealed factory thermistor-port measurement.
export function bareBedFamily(family,z){
 const wires=new Map(),tips={};for(const[id,sign]of[['xbBedMinus',-1],['xbBedPlus',1]]){const x=-114.918497334175+sign*5.081502665825,endX=-114.918497334175+sign*1.8,prefix=curve([[x,112,z],[x,124,z],[endX,132,z+2],[endX,146,z+2]]),wire=extend(prefix,family.authoredStocks[id]);wires.set(id,wire);tips[id]={point:wire.getPointAt(1),tangent:wire.getTangentAt(1)};}
 return{...family,wires,routingTips:tips,bareBedPreparation:true,bareBedReceipt:{sourceStage:'Before4.26/27 channel and sleeve construction',referenceGaugeRadiusMM:1.65,wireNeutralLengths:Object.fromEntries([...wires].map(([id,c])=>[id,{authoredStockMM:family.authoredStocks[id],actualCurveMM:c.getLength(),fixedMM:c.getPointAt(0).toArray(),looseTipMM:c.getPointAt(1).toArray()}]))}};
}
export function bareBedNTC(z){
 const prefix=curve([[-114.918497334175,112,z-2.35],[-114.918497334175,118,z+1.5],[-138,120,z],[-138,138,z]]),route=extend(prefix,1129.2201835163805);route.tip=route.getPointAt(1);route.tipTangent=route.getTangentAt(1);route.tipRoll=0;return route;
}

export function isBareBedPreparation(viewer){const scene=viewer.operationScene,state=viewer.state;return scene?.plan?.bedCoverAssembly===true&&!scene.full&&state?.flow==='build'&&state.comparison!=='before'&&!state.explore;}
