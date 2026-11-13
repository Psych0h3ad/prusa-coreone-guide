import * as THREE from 'three';

// Hole axes and flange faces are measured from the official front profile.
// Pin dimensions/deflection are an illustration of the photographed snap pin.
export const BASE_PIN_DATUM={x:-95.183,y:[-155.48636944,-175.48636944],bottom:-56.21320344,top:-55.21320344,holeRadius:2.75};
const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
const merged=geometries=>{
 const positions=[],normals=[];
 for(const source of geometries){const g=source.index?source.toNonIndexed():source;positions.push(...g.attributes.position.array);normals.push(...g.attributes.normal.array);if(g!==source)g.dispose();source.dispose();}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));return g;
};
function sector(profile,start,length){
 const points=profile.map(([r,z])=>new THREE.Vector2(r,z)),g=new THREE.LatheGeometry(points,18,start,length),side=[];
 const faces=THREE.ShapeUtils.triangulateShape(points,[]);
 for(const [angle,reverse]of [[start,false],[start+length,true]])for(const face of faces){
  for(const i of reverse?[...face].reverse():face){const [r,z]=profile[i];side.push(r*Math.sin(angle),z,r*Math.cos(angle));}
 }
 const ends=new THREE.BufferGeometry();ends.setAttribute('position',new THREE.Float32BufferAttribute(side,3));ends.computeVertexNormals();return merged([g,ends]);
}
export function createBaseHardware(){
 const head=new THREE.LatheGeometry([[0,-1.15],[2.5,-1.15],[3.8,-.9],[4.25,-.45],[4.25,-.15],[3.9,0],[0,0]].map(p=>new THREE.Vector2(...p)),64);
 const core=new THREE.LatheGeometry([[0,0],[1.05,0],[1.05,11.8],[0,12]].map(p=>new THREE.Vector2(...p)),32);
 const profile=[[1.05,0],[2.5,0],[2.5,1],[3.2,1.45],[2.25,2.4],[1.75,6.7],[1.75,8.5],[2.6,9.2],[2.6,9.8],[1.7,10.8],[1.05,11.8],[1.05,0]];
 const g=merged([head,core,...Array.from({length:4},(_,i)=>sector(profile,i*Math.PI/2,.36*Math.PI))]);
 g.rotateX(Math.PI/2);g.scale(.001,.001,.001);
 const nominal=new Float32Array(g.attributes.position.array);
 const meshes=BASE_PIN_DATUM.y.map((y,i)=>{
  const geometry=g.clone(),material=new THREE.MeshStandardMaterial({color:'#eeeee5',roughness:.42,metalness:0,side:THREE.DoubleSide});
  const mesh=new THREE.Mesh(geometry,material);mesh.position.set(BASE_PIN_DATUM.x*.001,y*.001,BASE_PIN_DATUM.bottom*.001);
  mesh.userData={part:i?'baseSpacerPinRear':'baseSpacerPinFront',cadName:'Spacer pin',geometryStatus:'photo-based-illustration',pinNominal:nominal,pinSeatZ:mesh.position.z};mesh.castShadow=true;mesh.receiveShadow=true;return mesh;
 });g.dispose();return meshes;
}
export function followBasePins(viewer){
 const p=viewer.operationScene?.plan,insertion=p?.chapter===2&&p.step===15&&!viewer.operationScene.full;
 const board=viewer.meshes.find(m=>m.visible&&m.userData.part==='stepperSplitter');
 const boardFront=board?board.userData.splitterDatum[2]+board.position.z*1000:undefined;
 for(const mesh of viewer.meshes){const nominal=mesh.userData.pinNominal;if(!nominal)continue;
  const positions=mesh.geometry.attributes.position,offset=insertion?mesh.position.z-mesh.userData.pinSeatZ:0;
  const signature=offset+':'+boardFront;if(signature===mesh.userData.pinLastOffset)continue;mesh.userData.pinLastOffset=signature;
  for(let i=0;i<positions.count;i++){
   const x=nominal[i*3],y=nominal[i*3+1],z=nominal[i*3+2],r=Math.hypot(x,y);let scale=1;
   if(z>.0001&&r>.00255){
    const worldZ=BASE_PIN_DATUM.bottom+z*1000+offset*1000;
    const outside=Math.max(BASE_PIN_DATUM.bottom-worldZ,worldZ-BASE_PIN_DATUM.top);
    const limit=.00255+(r-.00255)*smooth(outside/.65);scale=limit/r;
   }
   if(boardFront!==undefined&&z>.0065&&r>.002){
    const worldZ=BASE_PIN_DATUM.bottom+z*1000+offset*1000,outside=Math.max(boardFront-worldZ,worldZ-(boardFront+1.6));
    // Deflect the neighbouring part of a petal too: moving just vertices
    // inside the PCB would leave an unbent triangle crossing the hole rim.
    const limit=.002+(r-.002)*smooth((outside-.5)/.65);scale=Math.min(scale,limit/r);
   }
   positions.setXYZ(i,x*scale,y*scale,z);
  }
  positions.needsUpdate=true;mesh.geometry.computeVertexNormals();mesh.geometry.computeBoundingBox();mesh.geometry.computeBoundingSphere();
 }
}
