import * as T from 'three';

// Guide922421 steps15/32 specifies two15x5 springs on the M3x30 screws.
// CAD supplies screw axes and the opposing seat/head surfaces. Wire gauge,
// turn count and installed compression illustrate the spring; no force law
// or manufacturer spring CAD is implied.
export const IDLER_SPRINGS=[
 {component:'idlerSpring1',screw:805,y:-55.3952524,z:417.447143},
 {component:'idlerSpring2',screw:815,y:-61.3952524,z:417.447143}
];
export const IDLER_SPRING_DIMENSIONS={freeLength:15,outsideDiameter:5,wireDiameter:.5,turns:10,startX:2.1564,endX:16.0564,installedLength:13.9};
export function idlerSpringGeometry(row,length=IDLER_SPRING_DIMENSIONS.installedLength){
 const d=IDLER_SPRING_DIMENSIONS,r=(d.outsideDiameter-d.wireDiameter)/2,wire=d.wireDiameter/2;
 const end=d.endX-wire,start=end-length+d.wireDiameter,points=[];
 // Close one turn at each end, keeping the end coils perpendicular to the
 // screw. The remaining turns carry the axial separation.
 for(let i=0;i<=240;i++){
  const turns=i/240*d.turns,a=turns*Math.PI*2;
  const axial=turns<=1?turns*d.wireDiameter:turns>=d.turns-1?length-2*d.wireDiameter+(turns-d.turns+1)*d.wireDiameter:d.wireDiameter+(turns-1)*(length-3*d.wireDiameter)/(d.turns-2);
  points.push(new T.Vector3(start+axial,row.y+r*Math.cos(a),row.z+r*Math.sin(a)));
 }
 const g=new T.TubeGeometry(new T.CatmullRomCurve3(points),240,wire,8,false);g.scale(.001,.001,.001);g.computeBoundingBox();g.computeBoundingSphere();return g;
}
export function createIdlerSprings(){
 return IDLER_SPRINGS.map(row=>{
  const mesh=new T.Mesh(idlerSpringGeometry(row),new T.MeshStandardMaterial({color:'#747b79',metalness:.82,roughness:.36}));
  mesh.castShadow=true;mesh.receiveShadow=false;
  mesh.userData={part:'head',component:row.component,cadName:'Idler spring15×5',cadPath:[787,row.screw],illustration:true,geometryRole:'idlerSpring',sourceGuide:'https://help.prusa3d.com/guide/how-to-replace-nextruder-filament-sensor-core-one_922421#941560'};
  const free=idlerSpringGeometry(row,IDLER_SPRING_DIMENSIONS.freeLength);
  mesh.userData.springShape={screw:row.screw,y:row.y,z:row.z,amount:0,seatedPosition:mesh.geometry.attributes.position.array.slice(),seatedNormal:mesh.geometry.attributes.normal.array.slice(),freePosition:free.attributes.position.array.slice(),freeNormal:free.attributes.normal.array.slice()};free.dispose();
  return mesh;
 });
}
export function followIdlerSprings(viewer){
 const cache=viewer.idlerSpringHardware??=(function(){
  const sink=viewer.meshes.find(m=>m.userData.cadIndex===794);
  if(!sink)return{};
  // Imported leaves have their own CAD transforms. Convert assembly datums
  // into each leaf's rest frame before following its animated world matrix.
  const restInverse=m=>new T.Matrix4().compose(m.userData.restPosition,m.userData.restQuaternion,m.scale).invert(),sinkInverse=restInverse(sink);
  return{sink,axis:new T.Vector3(1,0,0).transformDirection(sinkInverse),rows:viewer.meshes.filter(m=>m.userData.springShape).map(mesh=>{
   const s=mesh.userData.springShape,screw=viewer.meshes.find(m=>m.userData.cadIndex===s.screw);
   return{mesh,screw,head:new T.Vector3(16.1564,s.y,s.z).multiplyScalar(.001).applyMatrix4(restInverse(screw)),seat:new T.Vector3(2.0564,s.y,s.z).multiplyScalar(.001).applyMatrix4(sinkInverse)};
  })};
 })();
 const {sink}=cache;if(!sink)return;sink.updateWorldMatrix(true,false);
 // Viewer world units include its presentation scale. Measure the gap in
 // the printer frame so zoom, bench placement and parent scaling cancel.
 const printerInverse=viewer.printer.matrixWorld.clone().invert(),sinkMatrix=printerInverse.clone().multiply(sink.matrixWorld),axis=cache.axis.clone().transformDirection(sinkMatrix),d=IDLER_SPRING_DIMENSIONS;
 for(const {mesh,screw,head:headDatum,seat:seatDatum}of cache.rows){
  const s=mesh.userData.springShape;if(!s)continue;
  screw.updateWorldMatrix(true,false);
  const head=headDatum.clone().applyMatrix4(screw.matrixWorld).applyMatrix4(printerInverse),seat=seatDatum.clone().applyMatrix4(sinkMatrix);
  const length=T.MathUtils.clamp(head.sub(seat).dot(axis)*1000-.2,d.installedLength,d.freeLength),amount=(length-d.installedLength)/(d.freeLength-d.installedLength);
  if(Math.abs(amount-s.amount)<1e-8)continue;
  const p=mesh.geometry.attributes.position,n=mesh.geometry.attributes.normal,q=new T.Vector3(),freeNormal=new T.Vector3();
  for(let i=0;i<p.array.length;i++)p.array[i]=s.seatedPosition[i]+amount*(s.freePosition[i]-s.seatedPosition[i]);
  for(let i=0;i<n.count;i++){q.fromArray(s.seatedNormal,i*3).lerp(freeNormal.fromArray(s.freeNormal,i*3),amount).normalize();q.toArray(n.array,i*3);}
  p.needsUpdate=true;n.needsUpdate=true;mesh.geometry.computeBoundingBox();mesh.geometry.computeBoundingSphere();s.amount=amount;
 }
}
