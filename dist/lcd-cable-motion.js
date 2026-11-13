import * as T from 'three';

// Routing illustration, in the source CAD frame. The measured male blade is
// retained; the female crimp and engagement depth are not available in the CAD.
export const LCD_EARTH_REFERENCE=[-22.445079348886,13.010764773834,0];
export const LCD_EARTH_LOOSE=[33,-265,-34];
export const LCD_EARTH_TAIL_LENGTH=360;
const v=p=>new T.Vector3(...p);
const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
const connectionAmount=(viewer,id)=>{
 const index=viewer.sceneActors.findIndex(a=>a.flex?.includes(id));
 return smooth(viewer.operationProgress*viewer.sceneActors.length-Math.max(0,index));
};

// Tangent-continuous corner fillets keep the lead inside the rectangular
// aperture. Do not interpolate its centre through the folded base flange.
export function roundedCablePath(points,trimFraction=.24){
 const path=new T.CurvePath();let previous=points[0];
 for(let i=1;i<points.length-1;i++){
  const a=points[i-1],b=points[i],c=points[i+1],ba=a.clone().sub(b),bc=c.clone().sub(b);
  const trim=Math.min(7,ba.length()*trimFraction,bc.length()*trimFraction),left=b.clone().addScaledVector(ba.normalize(),trim),right=b.clone().addScaledVector(bc.normalize(),trim);
  path.add(new T.LineCurve3(previous,left));path.add(new T.QuadraticBezierCurve3(left,b,right));previous=right;
 }
 path.add(new T.LineCurve3(previous,points.at(-1)));return path;
}
function earthTailPoints(end,amplitude){
 const points=[[180.8,-117.1,-6],[180.8,-128,-6],[170,-140,-5],[150,-140,-5]];
 for(const x of [130,110,90,70,50])points.push([x,-140+amplitude*Math.sin(Math.PI*(150-x)/110)**2,-5]);
 points.push([45,-130,-4.5],[45,-150,-4.5],[45,-175,-27.2],[41,-195,-27.2],[41,-207,-27.2],end.toArray());
 return points;
}
export function earthTail(end,amplitude){return roundedCablePath(earthTailPoints(end,amplitude).map(v));}
// Five-point Gaussian integration of each quadratic corner. The length solve
// does not allocate hundreds of curve samples on every animation frame.
const nodes=[-.906179845938664,-.538469310105683,0,.538469310105683,.906179845938664],weights=[.236926885056189,.478628670499366,.568888888888889,.478628670499366,.236926885056189];
export function roundedLength(points,subdivisions=1,trimFraction=.24){
 let previous=points[0],length=0;
 for(let i=1;i<points.length-1;i++){
  const a=points[i-1],b=points[i],c=points[i+1],ba=a.map((n,j)=>n-b[j]),bc=c.map((n,j)=>n-b[j]),ab=Math.hypot(...ba),cb=Math.hypot(...bc),trim=Math.min(7,ab*trimFraction,cb*trimFraction);
  const left=b.map((n,j)=>n+ba[j]/ab*trim),right=b.map((n,j)=>n+bc[j]/cb*trim);
  length+=Math.hypot(...left.map((n,j)=>n-previous[j]));
  for(let part=0;part<subdivisions;part++)for(let k=0;k<nodes.length;k++){const t=(part+(nodes[k]+1)*.5)/subdivisions;length+=weights[k]/subdivisions*Math.hypot(...b.map((n,j)=>(1-t)*(n-left[j])+t*(right[j]-n)));}
  previous=right;
 }
 return length+Math.hypot(...points.at(-1).map((n,j)=>n-previous[j]));
}
export function earthRoute(prefix,end){
 let low=0,high=110,tail;
 for(let i=0;i<15;i++){
  const mid=(low+high)/2;
  if(roundedLength(earthTailPoints(end,mid))<LCD_EARTH_TAIL_LENGTH)low=mid;else high=mid;
 }
 tail=earthTail(end,(low+high)/2);
 const path=new T.CurvePath();path.add(prefix);path.add(tail);
 return {path,tail,amplitude:(low+high)/2};
}
export function followLcdEarth(viewer){
 const scene=viewer.operationScene,plan=scene?.plan,cable=viewer.fasteners?.entities.get('earthR');
 if(!scene||!cable?.followEnd)return;
 const connected=scene.full||viewer.state.flow==='upgrade'||plan.chapter>8||plan.chapter===8&&plan.step>=22;
 const terminal=viewer.director.resolve(['lcdFaston'])[0];if(!terminal)return;
 viewer.printer.updateMatrixWorld(true);
 const reference=v(LCD_EARTH_REFERENCE).multiplyScalar(.001).applyMatrix4(terminal.matrixWorld).applyMatrix4(viewer.printer.matrixWorld.clone().invert()).multiplyScalar(1000);
 let amount=connected?1:0;
 if(!scene.full&&viewer.state.flow==='build'&&plan.chapter===8&&plan.step===22)amount=connectionAmount(viewer,'earthR');
 const target=v(LCD_EARTH_LOOSE).lerp(reference,amount);
 cable.attachmentReference=reference.multiplyScalar(.001);
 cable.followEnd(target);return target;
}
