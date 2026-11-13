import * as T from 'three';
import {roundedCablePath,roundedLength} from './lcd-cable-motion.js?v=20261111-94';

// Illustrative ribbon/connector vicinity, not a populated-board mating datum.
// XY is photo registered; Z, cable width/length and fold radii are illustrative.
export const LCD_RIBBON_REFERENCE=[94,39.6,-9];
export const LCD_RIBBON_LOOSE=[10,-255,-36];
export const LCD_RIBBON_LENGTH=480;
const REST=[1.0000000418041666,5.596637954237387e-8,-1.0064602857188628e-7,0,3.1593283013834455e-8,.7071067917538862,.7071068022124922,0,1.1074169556190509e-7,-.707106815975864,.7071068055172529,0,-70.57700577201084,-255.5604772432899,-55.89151330396726,1];
const v=p=>new T.Vector3(...p),smooth=T.MathUtils.smoothstep;
const PREFIX=192,FREE=288,END=64,SAMPLES=PREFIX+FREE+END,ACROSS=34,RING=ACROSS*2;
const localRoute=[[94,35,-24],[96,39.6,-18],LCD_RIBBON_REFERENCE];

export function ribbonProfile(angle){
 const radius=1,arm=(30-radius*angle)/2,rows=[];
 for(let i=0;i<ACROSS;i++){
  const s=i/(ACROSS-1)*30;let u,w,phi;
  if(s<arm){u=s-arm;w=0;phi=0;}
  else if(angle>0&&s<arm+radius*angle){phi=(s-arm)/radius;u=radius*Math.sin(phi);w=radius*(1-Math.cos(phi));}
  else{phi=angle;const d=s-arm-radius*angle;u=radius*Math.sin(phi)+d*Math.cos(phi);w=radius*(1-Math.cos(phi))+d*Math.sin(phi);}
  rows.push({u,w,phi});
 }
 const cu=(Math.min(...rows.map(p=>p.u))+Math.max(...rows.map(p=>p.u)))/2,cw=(Math.min(...rows.map(p=>p.w))+Math.max(...rows.map(p=>p.w)))/2;
 return rows.map(p=>({...p,u:p.u-cu,w:p.w-cw}));
}
// Four alternating folds keep the 30 mm material inside the base ties.
export function baseRibbonProfile(angle,accordion){
 if(accordion<1e-8)return ribbonProfile(angle);
 const radius=1-.55*accordion,remaining=30-radius*angle*(1+3*accordion),arms=[(1-.6*accordion)/2,(1-.6*accordion)/2,accordion/5,accordion/5,accordion/5].map(n=>remaining*n),turns=[angle,-angle*accordion,angle*accordion,-angle*accordion],segments=[];
 let u=0,w=0,phi=0,length=0;
 for(let j=0;j<5;j++){
  segments.push({start:length,length:arms[j],u,w,phi,turn:0});length+=arms[j];u+=arms[j]*Math.cos(phi);w+=arms[j]*Math.sin(phi);
  if(j<4){const turn=turns[j],sign=Math.sign(turn);segments.push({start:length,length:radius*Math.abs(turn),u,w,phi,turn,sign});length+=radius*Math.abs(turn);u+=radius*sign*(Math.sin(phi+turn)-Math.sin(phi));w-=radius*sign*(Math.cos(phi+turn)-Math.cos(phi));phi+=turn;}
 }
 const rows=[];
 for(let i=0;i<ACROSS;i++){
  const s=30*i/(ACROSS-1),seg=segments.find(x=>s<=x.start+x.length+1e-9)||segments.at(-1),d=Math.max(0,s-seg.start),p=seg.phi+(seg.turn?d/radius*seg.sign:0);
  rows.push({u:seg.turn?seg.u+radius*seg.sign*(Math.sin(p)-Math.sin(seg.phi)):seg.u+d*Math.cos(p),w:seg.turn?seg.w-radius*seg.sign*(Math.cos(p)-Math.cos(seg.phi)):seg.w+d*Math.sin(p),phi:p});
 }
 const cu=(Math.min(...rows.map(p=>p.u))+Math.max(...rows.map(p=>p.u)))/2,cw=(Math.min(...rows.map(p=>p.w))+Math.max(...rows.map(p=>p.w)))/2;
 return rows.map(p=>({...p,u:p.u-cu,w:p.w-cw}));
}
const foldedProfile=ribbonProfile(Math.PI);

export class LcdRibbonCable {
 constructor(def){
  Object.assign(this,def);this.samples=SAMPLES;
  this.curve=new T.CatmullRomCurve3(def.points.map(p=>v(p).multiplyScalar(.001)),false,'centripetal');
  // Folded lead follows the base opening, clear of the electronics-cover divider.
  this.prefix=new T.CatmullRomCurve3(def.points.slice(0,15).map((p,i)=>v(i<5?[-110,173,p[2]]:i>=6?[-180.9,p[1],p[2]+3.7]:p)),false,'centripetal');this.prefix.arcLengthDivisions=1024;this.prefixLength=this.prefix.getLength();
  const g=new T.BufferGeometry(),count=(SAMPLES+1)*RING,ix=[],colors=new Float32Array(count*3),pink=new T.Color('#cb5880'),grey=new T.Color('#bfc2bd'),rib=new T.Color('#d0d2cd');
  g.setAttribute('position',new T.BufferAttribute(new Float32Array(count*3),3).setUsage(T.DynamicDrawUsage));g.setAttribute('normal',new T.BufferAttribute(new Float32Array(count*3),3).setUsage(T.DynamicDrawUsage));
  for(let i=0;i<=SAMPLES;i++)for(let j=0;j<RING;j++){const across=j<ACROSS?j:RING-1-j,color=across<=1?pink:across%2?grey:rib;colors.set(color.toArray(),(i*RING+j)*3);}
  for(let i=0;i<SAMPLES;i++)for(let j=0;j<RING;j++){const a=i*RING+j,b=i*RING+(j+1)%RING;ix.push(a,b,a+RING,b,b+RING,a+RING);}
  // Cap each material strip, with outward winding at both ends.
  for(const end of [0,SAMPLES*RING])for(let j=0;j<ACROSS-1;j++){const a=end+j,b=a+1,c=end+RING-1-j,d=c-1;if(end===0)ix.push(a,c,b,b,c,d);else ix.push(a,b,c,b,d,c);}
  g.setAttribute('color',new T.BufferAttribute(colors,3));g.setIndex(ix);
  const m=new T.MeshStandardMaterial({color:'#ffffff',vertexColors:true,roughness:.8,metalness:.02,side:T.DoubleSide});m.userData.originalOpacity=1;m.userData.originalColor=m.color.clone();
  this.geometry=g;this.mesh=new T.Mesh(g,m);this.mesh.userData={part:'cables',cadName:def.name,flexId:def.id,supplement:true};this.mesh.castShadow=false;this.lastKey='';
  this.follow(new T.Matrix4().fromArray(REST),0,false);
 }
 update(from,to,t){const key=`${from}:${to}:${t}`;if(this.lastKey===key)return;this.lastKey=key;const amount=from?1:smooth(t,0,1);this.geometry.setDrawRange(0,amount===1?this.geometry.index.count:Math.floor(SAMPLES*amount)*RING*6);this.mesh.userData.flexState={from,to,t,amount};}
 follow(matrix,amount,active){
  const key=[...matrix.elements,amount,active].join(':');if(key===this.poseKey)return;this.poseKey=key;
  // Matrix maps cover-local mm to current source-frame mm.
  const reference=v(LCD_RIBBON_REFERENCE).applyMatrix4(matrix),back=new T.Vector3(0,0,-1).transformDirection(matrix),standoff=reference.clone().addScaledVector(back,35),loose=v(LCD_RIBBON_LOOSE);
  const end=amount<.5?loose.lerp(standoff,smooth(amount,0,.5)):standoff.lerp(reference,smooth(amount,.5,1)),offset=end.clone().sub(reference);
  const contact=localRoute.map(p=>v(p).applyMatrix4(matrix).add(offset));
  const points=amplitude=>{
   const a=[[-180.9,-122.1,-5.3],[-170,-140,-8],[-150,-140,-8]];
   for(const x of [-130,-110,-90,-70,-50,-30,-10,10])a.push([x,-140+amplitude*Math.sin(Math.PI*(x+150)/160)**2,-8]);
   a.push([34.6,-130,-10],[34.6,-150,-10],[34.6,-175,-26.2],[34.6,-180,-26.2],[27.1,-198,-26.2],[27.1,-207,-26.2]);return a;
  };
  let low=0,high=180;
  for(let i=0;i<15;i++){const mid=(low+high)/2,p=[...points(mid),...contact.map(p=>p.toArray())];if(roundedLength(p,4,.4)<LCD_RIBBON_LENGTH)low=mid;else high=mid;}
  const base=points((low+high)/2),tail=roundedCablePath([...base.map(v),...contact],.4),baseLength=roundedLength(base,4,.4),tailLength=tail.getLength(),total=this.prefixLength+tailLength,endAxis=new T.Vector3(0,1,0).transformDirection(matrix);
  this.tail=tail;this.attachmentReference=reference.multiplyScalar(.001);this.route=new T.CurvePath();this.route.add(this.prefix);this.route.add(tail);this.mesh.userData.routingLengthError=tailLength-LCD_RIBBON_LENGTH;
  const pos=this.geometry.attributes.position,norm=this.geometry.attributes.normal,axis=new T.Vector3(),normal=new T.Vector3(),x=new T.Vector3(1,0,0),z=new T.Vector3(0,0,1);
  for(let i=0;i<=SAMPLES;i++){
   let c,tangent,s;
   if(i<PREFIX){const t=i/PREFIX;c=this.prefix.getPointAt(t);tangent=this.prefix.getTangentAt(t).normalize();s=t*this.prefixLength;}
   else{const k=i-PREFIX,d=k<FREE?k/FREE*(tailLength-32):tailLength-32+(k-FREE)/END*32,t=d/tailLength;c=tail.getPoint(t);tangent=tail.getTangent(t).normalize();s=this.prefixLength+d;}
   const fromBase=s-this.prefixLength,front=smooth(fromBase,baseLength-100,baseLength-60),twist=1-smooth(total-s,4,8);
   axis.crossVectors(z,tangent).normalize().lerp(x,front).lerp(endAxis,twist).addScaledVector(tangent,-axis.dot(tangent)).normalize();if(axis.lengthSq()<1e-8)axis.copy(x).addScaledVector(tangent,-x.dot(tangent)).normalize();normal.crossVectors(tangent,axis).normalize();
   const distance=total-s,angle=Math.PI*smooth(distance,.5,3),accordion=1-smooth(fromBase,0,60),profile=accordion>1e-8?baseRibbonProfile(angle,accordion):angle>Math.PI-1e-8?foldedProfile:ribbonProfile(angle);
   for(let j=0;j<RING;j++){
    const r=profile[j<ACROSS?j:RING-1-j],side=j<ACROSS?-1:1,du=-Math.sin(r.phi)*side,dw=Math.cos(r.phi)*side,u=r.u+du*.4,w=r.w+dw*.4,k=i*RING+j;
    pos.setXYZ(k,(c.x+axis.x*u+normal.x*w)*.001,(c.y+axis.y*u+normal.y*w)*.001,(c.z+axis.z*u+normal.z*w)*.001);norm.setXYZ(k,axis.x*du+normal.x*dw,axis.y*du+normal.y*dw,axis.z*du+normal.z*dw);
   }
  }
  pos.needsUpdate=true;norm.needsUpdate=true;this.geometry.computeBoundingBox();this.geometry.computeBoundingSphere();
 }
 guide(){return this.route.getPoints(80).map(p=>p.multiplyScalar(.001));}
}

export function followLcdRibbon(viewer){
 const scene=viewer.operationScene,plan=scene?.plan,cable=viewer.fasteners?.entities.get('lcdWire');if(!scene||!cable?.follow)return;
 const display=viewer.director.resolve([595])[0];if(!display)return;
 viewer.printer.updateMatrixWorld(true);const matrix=viewer.printer.matrixWorld.clone().invert().multiply(display.matrixWorld);for(const i of [12,13,14])matrix.elements[i]*=1000;
 const connected=scene.full||viewer.state.flow==='upgrade'||plan.chapter>8||plan.chapter===8&&plan.step>=22;
 if(!connected)matrix.fromArray(REST);
 let amount=connected?1:0;
 if(!scene.full&&viewer.state.flow==='build'&&plan.chapter===8&&plan.step===22){const index=viewer.sceneActors.findIndex(a=>a.flex?.includes('lcdWire'));amount=smooth(viewer.operationProgress*viewer.sceneActors.length-Math.max(0,index),0,1);}
 cable.follow(matrix,amount,connected);
}
