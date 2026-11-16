import * as T from 'three';

// Complete source geometry and its distinct actuator poses are kept separate.
export const DOOR_SWITCH_SOURCE = Object.freeze({
  url:'https://www.printables.com/model/1520379',part:'Zippy SM05S02A0 v7',
  static:[0],released:[1,2],pressed:[4,3],equivalentReleased:[6,5],
  actuatorAngleDegrees:-4.9999999999999885,
  actuatorPivotCaseMM:[-8.099999999999033,-3.2933930696133573,0],
  frontFaceCaseZMM:-3.2,
});
const V=p=>new T.Vector3(...p);
const sourceOrigin=V([327.90552678150823,-205.43672689966945,492.5398717480483]);
const sourceY=V([0,.9846305031788888,.17465042859863938]);
const sourceZ=V([0,.17465042859863938,-.9846305031788888]);
const sourceX=new T.Vector3().crossVectors(sourceY,sourceZ);
const sourceBasis=new T.Matrix4().makeBasis(sourceX,sourceY,sourceZ);
const lowerUnderhead=V([-180.06926047014997,-191.7500049999307,365.39194000000003]);
const holeDirection=V([.374606593415912,0,.927183854566787]);
const caseAxis=V([.927183854566787,0,-.374606593415912]);

export function doorSwitchFrame({underhead=lowerUnderhead,holeAxis=holeDirection,depthAxis=caseAxis}={}){
  const y=holeAxis.clone(),z=depthAxis.clone();
  if(Math.abs(y.length()-1)>1e-10||Math.abs(z.length()-1)>1e-10||Math.abs(y.dot(z))>1e-10)throw Error('A rigid orthonormal switch mounting frame is required');
  const x=new T.Vector3().crossVectors(y,z),basis=new T.Matrix4().makeBasis(x,y,z);
  const origin=underhead.clone().addScaledVector(z,-DOOR_SWITCH_SOURCE.frontFaceCaseZMM);
  const registration=basis.clone().multiply(sourceBasis.clone().transpose());
  registration.setPosition(origin.clone().sub(sourceOrigin.clone().applyMatrix4(registration)));
  const pivot=V(DOOR_SWITCH_SOURCE.actuatorPivotCaseMM).applyMatrix4(basis).add(origin).multiplyScalar(.001);
  return {registration,basis,originMM:origin,underheadMM:underhead.clone(),actuatorAxis:z,actuatorPivot: pivot};
}

export function makeDoorSwitch({solids,frame=doorSwitchFrame(),bodyMaterialGroups=null}={}){
  if(!Array.isArray(solids)||solids.length!==7||solids.some(s=>!s?.isBufferGeometry))throw Error('All seven original switch source geometries must be available');
  const finalMatrix=new T.Matrix4().makeScale(.001,.001,.001).multiply(frame.registration);
  const ids=[...DOOR_SWITCH_SOURCE.static,...DOOR_SWITCH_SOURCE.released],meshes=[],moving=[];
  for(const id of ids){
    const geometry=solids[id].clone().applyMatrix4(finalMatrix);
    let material=new T.MeshStandardMaterial({color:id===0?'#292a2b':id===2?'#e6e7df':'#a3a6a7',roughness:id===2?.62:.46,metalness:id===1?.7:0});
    if(id===0&&bodyMaterialGroups){
      let offset=0;for(const group of bodyMaterialGroups){if(group.start!==offset||group.count<=0||group.count%3||![0,1].includes(group.materialIndex))throw Error('Incomplete body material regions');offset+=group.count;}
      if(offset!==geometry.attributes.position.count)throw Error('Body material regions must cover the complete source');
      geometry.clearGroups();for(const group of bodyMaterialGroups)geometry.addGroup(group.start,group.count,group.materialIndex);
      material=[material,new T.MeshStandardMaterial({color:'#b9bab4',roughness:.38,metalness:.72})];
    }
    for(const m of Array.isArray(material)?material:[material]){m.userData.originalColor=m.color.clone();m.userData.originalOpacity=m.opacity;}
    const mesh=new T.Mesh(geometry,material);
    mesh.userData={component:'doorSwitch',sourceSolid:id,source:DOOR_SWITCH_SOURCE.url,sourcePart:DOOR_SWITCH_SOURCE.part,sourceGeometryPreserved:true,actuatorPose:0};
    meshes.push(mesh);
    if(id!==0){
      geometry.attributes.position.setUsage(T.DynamicDrawUsage);geometry.attributes.normal.setUsage(T.DynamicDrawUsage);
      moving.push({mesh,positions:geometry.attributes.position.array.slice(),normals:geometry.attributes.normal.array.slice()});
    }
  }
  const p=new T.Vector3(),n=new T.Vector3(),q=new T.Quaternion(),housingRotation=new T.Quaternion(),mountPivot=frame.underheadMM.clone().multiplyScalar(.001);let amount=NaN,housingAngle=NaN,disposed=false;
  function setPressed(value){
    if(disposed)throw Error('Disposed door switch');
    if(!Number.isFinite(value)||value<0||value>1)throw RangeError('Switch pose must be in [0,1]');
    if(value===amount)return;
    q.setFromAxisAngle(frame.actuatorAxis,T.MathUtils.degToRad(DOOR_SWITCH_SOURCE.actuatorAngleDegrees)*value);
    for(const row of moving){
      const position=row.mesh.geometry.attributes.position,normal=row.mesh.geometry.attributes.normal;
      for(let i=0;i<position.count;i++){
        p.fromArray(row.positions,i*3).sub(frame.actuatorPivot).applyQuaternion(q).add(frame.actuatorPivot);
        n.fromArray(row.normals,i*3).applyQuaternion(q);
        position.setXYZ(i,p.x,p.y,p.z);normal.setXYZ(i,n.x,n.y,n.z);
      }
      position.needsUpdate=true;normal.needsUpdate=true;row.mesh.geometry.computeBoundingBox();row.mesh.geometry.computeBoundingSphere();row.mesh.userData.actuatorPose=value;
    }
    amount=value;
  }
  function setHousingAngle(degrees){
    if(disposed)throw Error('Disposed door switch');if(!Number.isFinite(degrees))throw RangeError('A finite housing angle is required');if(degrees===housingAngle)return;
    housingRotation.setFromAxisAngle(frame.actuatorAxis,T.MathUtils.degToRad(degrees));
    const offset=mountPivot.clone().sub(mountPivot.clone().applyQuaternion(housingRotation));
    for(const mesh of meshes){mesh.quaternion.copy(housingRotation);mesh.position.copy(offset);mesh.updateMatrix();mesh.userData.housingAngleDegrees=degrees;}
    housingAngle=degrees;
  }
  setPressed(0);
  setHousingAngle(0);
  return {meshes,frame,setPressed,setHousingAngle,get pressed(){return amount;},retire(){disposed=true;},get housingAngleDegrees(){return housingAngle;},dispose(){if(disposed)return;disposed=true;for(const mesh of meshes){mesh.removeFromParent();mesh.geometry.dispose();for(const material of Array.isArray(mesh.material)?mesh.material:[mesh.material])material.dispose();}}};
}
