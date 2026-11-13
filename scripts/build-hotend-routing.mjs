import fs from 'node:fs';
import {relaxHotendRoutes} from './relax-hotend-routing.mjs';
import {dressThermistorExit} from './dress-thermistor-exit.mjs';
import * as T from '../dist/vendor/three.module.js';
import {LOVEBOARD,SOCKETS,socketCentre} from '../dist/loveboard-layout.js';
// Cable routing illustrations: control slack; transport each pair's cross
// section along the bend instead of offsetting both wires along their tangent.
const routes={},ease=x=>{x=T.MathUtils.clamp(x,0,1);return x*x*(3-2*x);};
const mix=(a,b,t)=>a.map((p,i)=>p.map((x,j)=>T.MathUtils.lerp(x,b[i][j],t)));
const curve=p=>{const c=new T.CatmullRomCurve3(p.map(x=>new T.Vector3(...x)),false,'centripetal');c.arcLengthDivisions=1024;return c;};
const angle=(a,b,t)=>Math.atan2(new T.Vector3().crossVectors(a,b).dot(t),a.dot(b));
const projection=(n,t)=>n.clone().addScaledVector(t,-n.dot(t)).normalize();
function pairPaths(points,heater,amount,state){
 const c=curve(points),samples=96,length=c.getLength(),stations=Array.from({length:samples+1},(_,i)=>i<=8?i*.75/length:(6+(length-6)*(i-8)/(samples-8))/length),centres=stations.map(u=>c.getPointAt(T.MathUtils.clamp(u,0,1))),frames={tangents:stations.map(u=>c.getTangentAt(T.MathUtils.clamp(u,0,1)))},normals=[];
 normals[0]=projection(new T.Vector3(1,0,0),frames.tangents[0]);
 for(let i=1;i<=samples;i++){const q=new T.Quaternion().setFromUnitVectors(frames.tangents[i-1],frames.tangents[i]);normals[i]=projection(normals[i-1].clone().applyQuaternion(q),frames.tangents[i]);}
 const nearest=p=>centres.reduce((best,v,i)=>v.distanceToSquared(p)<centres[best].distanceToSquared(p)?i:best,0);
 const endAngle=ease((amount-.35)/.5)*Math.PI/2,endGuide=new T.Vector3((heater?1:-1)*Math.cos(endAngle),0,(heater?-1:1)*Math.sin(endAngle));
 const back=[];back[samples]=projection(endGuide,frames.tangents[samples]);for(let i=samples-1;i>=0;i--){const q=new T.Quaternion().setFromUnitVectors(frames.tangents[i+1],frames.tangents[i]);back[i]=projection(back[i+1].clone().applyQuaternion(q),frames.tangents[i]);}
 const pre=heater?nearest(new T.Vector3(...points[18])):0;
 const lower=nearest(new T.Vector3(...points[7])),first=nearest(new T.Vector3(...points[9])),last=nearest(new T.Vector3(...points[11])),exit=nearest(new T.Vector3(...points[heater?13:14])),keys=[[0,new T.Vector3(1,0,0)],[lower,new T.Vector3(1,0,0)],[first,new T.Vector3(1,0,0)],[last,new T.Vector3(1,0,0)],[exit,new T.Vector3().crossVectors(new T.Vector3(0,1,0),frames.tangents[exit]).normalize()],...(heater?[[pre,back[pre]]]:[]),[samples-(heater?1:5),endGuide],[samples,endGuide]];
 const twists=keys.map(([i,axis])=>[i,angle(normals[i],projection(axis,frames.tangents[i]),frames.tangents[i])]);
 for(let i=0;i<twists.length;i++){const reference=state.twists?.[i]??(i?twists[i-1][1]:0);while(twists[i][1]-reference>Math.PI)twists[i][1]-=2*Math.PI;while(twists[i][1]-reference<-Math.PI)twists[i][1]+=2*Math.PI;}state.twists=twists.map(x=>x[1]);
 if(process.argv.includes('--debug-twist')&&heater&&[0,.35,1].includes(amount))console.log('Heater frame twist',amount,twists.map(([i,a])=>[i,+(a/Math.PI).toFixed(3)]));
 return [-1,1].map(side=>{const path=centres.map((p,i)=>{
  const k=Math.max(1,twists.findIndex(x=>x[0]>=i)),a=twists[k-1],b=twists[k],f=ease((i-a[0])/(b[0]-a[0])),twist=T.MathUtils.lerp(a[1],b[1],f),n=i>=lower&&i<=exit?new T.Vector3().crossVectors(new T.Vector3(0,1,0),frames.tangents[i]).normalize():normals[i].clone().applyAxisAngle(frames.tangents[i],twist),radius=(heater?1:.5)+(heater?.5:.25)*ease((i/samples-.82)/.13);
  return p.clone().addScaledVector(n,side*radius).toArray().map(x=>+x.toFixed(5));
 });const endpoint=path.at(-1),out=c.getTangent(1).normalize().negate().toArray();for(const [k,d]of [[1,1.5],[2,3]])path[path.length-1-k]=endpoint.map((v,j)=>v+out[j]*d);for(const [k,d]of [[1,.25],[2,.5]])path[k]=path[0].map((v,j)=>v+(j===2?d:0));return path;});
}
for(const [kind,x,y,r,color] of [['Thermistor',-6.36385,-61.84434,.475,'#363a39'],['Heater',-7.71056,-67.65192,.875,'#444845']]){
 const heater=kind==='Heater',sy=heater?-47.2:-48.8,socket=socketCentre(heater?'P1':'J1');
 const end=heater?[socket[0]-4,socket[1],socket[2]]:[socket[0],LOVEBOARD.datumCAD[1]-9.7,socket[2]];
 const approach=heater?[end[0]-5,end[1],end[2]]:[end[0],end[1]-10,end[2]];
 const prefix=[[x,y,324.1],[x,y,324.6],[heater?-8.5:x,y+.402,326.1],[heater?-10.2:x,y+1.5,327.198],[heater?-10.7:x,y+3,327.6],[heater?-10.7:x,sy-4,327.6],[heater?-10.7:x,sy-1.2,328.8],[heater?-10.7:x,sy,332],[-5,sy,350],[-5,sy,356],[-5,sy,362],[-5,sy,368.5],[-16,sy,369.5],[-16,sy,382]];
 const freeA=[heater?-23.5:-27,heater?-44.5:-47.5,heater?404:388];
 const tail=(approach,end,loose=false)=>{const pre=heater?(loose?[-21,-46,400]:[-27.5,-33,414]):approach;return [freeA,...[.25,.5,.75].map(t=>freeA.map((v,j)=>T.MathUtils.lerp(v,pre[j],t))),...(heater?[pre]:[]),approach,end];};
 const seated=[...prefix,...tail(approach,end)],loose=[...structuredClone(prefix),...tail(heater?[-19,-39,405]:[-28,-50,394],heater?[-19,-39,410]:[-28,-50,399],true)];
 for(let j=8;j<=11;j++)loose[j][0]=3;
 const threaded=structuredClone(loose);for(let j=8;j<=11;j++)threaded[j][0]=seated[j][0];
 const aligned=structuredClone(seated),out=SOCKETS[heater?'P1':'J1'].out;for(let a=0;a<3;a++){aligned.at(-1)[a]+=out[a]*(heater?6:4);aligned.at(-2)[a]=aligned.at(-1)[a]+out[a]*(heater?5:3);}
 const base=t=>{const p=t<.35?mix(loose,threaded,ease(t/.35)):t<.85?mix(threaded,aligned,ease((t-.35)/.5)):mix(aligned,seated,ease((t-.85)/.15));if(heater){if(t>=.35&&t<.85){const rotate=ease((t-.35)/.3),translate=ease((t-.65)/.2),end=new T.Vector3(T.MathUtils.lerp(loose.at(-1)[0],aligned.at(-1)[0],rotate),T.MathUtils.lerp(loose.at(-1)[1],aligned.at(-1)[1],translate),T.MathUtils.lerp(loose.at(-1)[2],aligned.at(-1)[2],rotate)),axis=new T.Vector3(rotate,0,1-rotate).normalize();p[p.length-1]=end.toArray();p[p.length-2]=end.clone().addScaledVector(axis,-5).toArray();}const end=new T.Vector3(...p.at(-1)),axis=end.clone().sub(new T.Vector3(...p.at(-2))).normalize(),pre=end.clone().addScaledVector(axis,-6).toArray();p[18]=pre;for(let j=15;j<=17;j++)p[j]=p[14].map((v,k)=>T.MathUtils.lerp(v,pre[k],(j-14)/4));}return p;};
 const target=Math.max(...Array.from({length:257},(_,i)=>curve(base(i/256)).getLength()))+.25,stages=[[],[]],lengths=[[],[]],frameState={};
 for(let i=0;i<=128;i++){
  const at=i===45?.35:i/128,p=base(at),original=p.map(q=>q[1]);const bow=amount=>{for(let j=15;j<=17;j++)p[j][1]=original[j]-amount*Math.sin((j-14)*Math.PI/4);};let lo=0,hi=100;
  for(let j=0;j<20;j++){const mid=(lo+hi)/2;bow(mid);if(curve(p).getLength()<target)lo=mid;else hi=mid;}
  // Once the heater plug is aligned, dress its upper bend toward the PCB.
  // The cover's sloping front wall leaves less room than the open work view.
  // This is an illustrated bend, not a constant-length material simulation.
  const slack=(lo+hi)/2,covered=heater?ease((at-.85)/.15):0,dressed=T.MathUtils.lerp(slack,Math.min(slack,4),covered);
  bow(dressed);if(i===128)console.log(kind,"final slack bow",dressed.toFixed(3));
  pairPaths(p,heater,at,frameState).forEach((path,k)=>{stages[k].push({at,points:path});lengths[k].push(curve(path).getLength());});
 }
 for(const k of [0,1]){const id='hotend'+kind+k;routes[id]={radius:r,color,name:(heater?'ホットエンドヒーター':'ホットエンドサーミスター')+' リード '+(k+1),length:target,loosePoints:stages[k][0].points,points:stages[k].at(-1).points,routeStages:stages[k]};console.log(id,'length range',Math.min(...lengths[k]).toFixed(3),Math.max(...lengths[k]).toFixed(3));}
}
const rawOutput=process.argv[process.argv.indexOf('--raw-output')+1];
if(process.argv.includes('--raw-output')){if(!rawOutput)throw Error('Missing raw output path');fs.writeFileSync(rawOutput,JSON.stringify(routes));process.exit(0);}
relaxHotendRoutes(routes);
dressThermistorExit(routes);
fs.writeFileSync('dist/hotend-routing.js','// Generated by scripts/build-hotend-routing.mjs. Units: mm.\nexport const HOTEND_ROUTES='+JSON.stringify(routes)+';\n');
