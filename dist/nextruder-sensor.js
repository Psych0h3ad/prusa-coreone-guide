import * as T from 'three';
import {smoothCreases} from './surface-geometry.js?v=20261111-94';
import {PARTS} from './data.js?v=20261112-113';
import {STLLoader} from './vendor/STLLoader.js';

export function sensorSpringGeometry(d,loaded=0){
 const x=d.ballRestX+d.travel*T.MathUtils.clamp(loaded,0,1)+d.ballRadius+d.magnetLength;
 const radius=(d.springOutsideDiameter-d.springWireDiameter)/2,wire=d.springWireDiameter/2;
 const start=x+wire,end=d.springEndX-wire,points=[];
 for(let i=0;i<=224;i++){
  const u=i/224,a=u*d.springTurns*2*Math.PI;
  points.push(new T.Vector3(start+(end-start)*u,radius*Math.cos(a),d.height+radius*Math.sin(a)));
 }
 const curve=new T.CatmullRomCurve3(points);
 return new T.TubeGeometry(curve,224,wire,8,false);
}

// Both official photographs show a cylinder; the guide's3x3x3 text conflicts.
// Display dimensions remain inferred. Only one magnet is installed.
export function sensorMagnetGeometry(d,loaded=0){
 if(d.magnetShape!=='cylinder')throw Error('Unverified Nextruder magnet shape');
 const length=d.magnetLength,radius=d.magnetDiameter/2;
 const magnet=new T.CylinderGeometry(radius,radius,length,48);
 magnet.rotateZ(-Math.PI/2);
 magnet.translate(d.ballRestX+d.travel*T.MathUtils.clamp(loaded,0,1)+d.ballRadius+length/2,0,d.height);
 return magnet;
}

// A display model fitted to the manufacturer's heatsink pocket and service
// photographs. The schematic supplies thickness, hole and sensor identity;
// it does not supply a production PCB layout.
export async function createNextruderSensor(){
 const r=await fetch('./assets/nextruder/hall-sensor.json');
 if(!r.ok)throw Error('Nextruderのセンサーを読み込めません');
 const d=await r.json(),result=[];
 PARTS.hallSensor??={name:'Hallフィラメントセンサー',en:'Nextruder Hall sensor',desc:'Nextruder内部でフィラメントの有無を検出する基板。ヒートシンクのくぼみに固定します。',icon:'board',offset:[0,40,0]};
 const frame=new T.Matrix4().set(.001,0,0,d.origin[0]/1000,0,0,-.001,(d.origin[1]+d.bottom+d.thickness)/1000,0,.001,0,d.origin[2]/1000,0,0,0,1);
 const add=(geometry,color,role)=>{
  geometry.applyMatrix4(frame);smoothCreases(geometry);geometry.computeBoundingBox();geometry.computeBoundingSphere();
  const material=new T.MeshStandardMaterial({color,roughness:role==='substrate'?.8:.55,metalness:role==='contact'?.65:0});
  const m=new T.Mesh(geometry,material);
  m.userData={part:'hallSensor',cadName:'Nextruder Hall sensor',cadPath:[787,794],illustration:true,geometryRole:role,maintenanceRegion:'regionHallSensor'};
  m.castShadow=true;m.receiveShadow=false;result.push(m);
 };
 const shape=new T.Shape(d.outline.map(p=>new T.Vector2(...p))),hole=new T.Path();
 hole.absarc(d.hole[0],d.hole[1],d.hole[2],0,2*Math.PI,true);shape.holes.push(hole);
 add(new T.ExtrudeGeometry(shape,{depth:d.thickness,bevelEnabled:false,curveSegments:48}),'#282b2b','substrate');
 // The Hall IC is on the underside, within the deeper sensor recess.
 const [x,y,z]=d.chipCentre,[w,h,l]=d.chipSize;
 const chip=new T.BoxGeometry(w,l,h);chip.translate(x,z,d.bottom+d.thickness-y);add(chip,'#171b1c','sensor');
 for(const [dx,dz]of [[-.95,1.28],[.95,1.28],[0,-1.28]]){
  const pin=new T.BoxGeometry(.40,.44,.13);pin.translate(x+dx,z+dz,d.thickness+.065);add(pin,'#a5a7a5','contact');
 }
 // Three visible solder pads at the grey ribbon's fixed end.
 const pads=[];
 for(const [px,pz]of d.cablePads||[]){
  const g=new T.BoxGeometry(.8,1.0,.12);g.translate(px,pz,-.06);const a=g.toNonIndexed();pads.push(...a.attributes.position.array);g.dispose();a.dispose();
 }
 if(pads.length)add(new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(pads,3)),'#b9bdba','cablePads');
 const response=await fetch('./assets/nextruder/sensor-mechanism.json?v=20261106-87');
 if(!response.ok)throw Error('Nextruderの内部部品を読み込めません');
 const mechanism=await response.json(),loader=new STLLoader(),origin=new T.Vector3(...mechanism.origin).multiplyScalar(.001);
 const addMechanism=(geometry,part,name,color,metalness=0)=>{
  geometry.scale(.001,.001,.001);geometry.translate(...origin);smoothCreases(geometry);geometry.computeBoundingBox();geometry.computeBoundingSphere();
  PARTS[part]??={name,en:name,desc:'Nextruder内部のフィラメント検出機構。',icon:'cube',offset:[0,40,0]};
  const m=new T.Mesh(geometry,new T.MeshStandardMaterial({color,metalness,roughness:metalness?.35:.75}));
  m.userData={part,cadName:name,cadPath:[787,794],illustration:true,geometryRole:part,maintenanceRegion:'regionHallMechanism'};
  m.castShadow=true;result.push(m);
 };
 addMechanism(await loader.loadAsync('./assets/nextruder/sensor-holder.stl?v=20261106-87'),'hallHolder','フィラメントセンサーのホルダー','#272c2c');
 const ball=new T.SphereGeometry(mechanism.ballRadius,32,24);ball.translate(mechanism.ballRestX,0,mechanism.height);
 addMechanism(ball,'hallBall','フィラメントセンサーの鋼球','#bac1c4',.8);
 addMechanism(sensorMagnetGeometry(mechanism),'hallMagnet','フィラメントセンサーの磁石','#acb3b5',.75);
 addMechanism(sensorSpringGeometry(mechanism),'hallSpring','フィラメントセンサーのばね','#666e73',.7);
 return result;
}
