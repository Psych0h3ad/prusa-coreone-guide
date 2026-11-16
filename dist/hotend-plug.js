import * as T from 'three';
import {createClikMatePlug}from './clik-mate-plug.js?v=20261111-94';

// Two open contact channels. These are assembly illustrations; the board's
// connector frames and pin spacing determine the mating pose.
export function attachHotendPlug(geometry,heater){
 const outerY=heater?2.85:2.5,outerZ=heater?2.8:2.2,holeY=heater?1.2:.8,pitch=heater?3:1.5,holeZ=heater?1.1:.6,gap=heater?4:3.35,parts=[];
 const box=(y0,y1,z0,z1)=>{const g=new T.BoxGeometry(gap+2.2,y1-y0,z1-z0).toNonIndexed();g.translate((gap+.6)/2,(y0+y1)/2,(z0+z1)/2);parts.push(g);};
 box(-outerY,-holeY,-outerZ,outerZ);box(holeY,outerY,-outerZ,outerZ);
 box(-holeY,holeY,-outerZ,-pitch/2-holeZ);box(-holeY,holeY,-pitch/2+holeZ,pitch/2-holeZ);box(-holeY,holeY,pitch/2+holeZ,outerZ);
 let positions=new Float32Array(parts.reduce((n,g)=>n+g.attributes.position.array.length,0)),normals=new Float32Array(positions.length),clikMate;let cursor=0;
 for(const g of parts){positions.set(g.attributes.position.array,cursor);normals.set(g.attributes.normal.array,cursor);cursor+=g.attributes.position.array.length;g.dispose();}
 if(!heater){
  clikMate=createClikMatePlug(2);const p=new T.Vector3(),m=new T.Matrix4().set(0,0,1,0,0,1,0,0,-1,0,0,0,0,0,0,1);
  for(const name of ['positions','pressedPositions','normals','pressedNormals'])for(let i=0;i<clikMate[name].length;i+=3)p.fromArray(clikMate[name],i).applyMatrix4(m).toArray(clikMate[name],i);
  positions=clikMate.positions;normals=clikMate.normals;
 }
 const offset=geometry.attributes.position.count,indices=Array.from(geometry.index.array),wireIndices=indices.length;
 for(const name of ['position','normal']){const old=geometry.attributes[name],data=new Float32Array(old.array.length+positions.length);data.set(old.array);geometry.setAttribute(name,new T.BufferAttribute(data,3).setUsage(T.DynamicDrawUsage));}
 for(let i=0;i<positions.length/3;i++)indices.push(offset+i);geometry.setIndex(indices);geometry.deleteAttribute('uv');geometry.clearGroups();geometry.addGroup(0,wireIndices,0);geometry.addGroup(wireIndices,indices.length-wireIndices,1);
 const axis=new T.Vector3(),across=new T.Vector3(),side=new T.Vector3(),centre=new T.Vector3(),p=new T.Vector3(),pressed=new T.Vector3(),q=new T.Matrix4(),normalMatrix=new T.Matrix3();
 return {clikMate,loadedNativeFrame:null,write(curve,peerEnd,latch=0){
  const end=curve.getPointAt(1);centre.copy(end).add(peerEnd).multiplyScalar(.5);axis.copy(curve.getTangentAt(1)).normalize();across.copy(peerEnd).sub(end).addScaledVector(axis,-peerEnd.clone().sub(end).dot(axis)).normalize();side.crossVectors(across,axis).normalize();q.makeBasis(axis,side,across);normalMatrix.setFromMatrix4(q);this.loadedNativeFrame=q.clone().setPosition(centre.clone().multiplyScalar(1000)).multiply(new T.Matrix4().set(0,1,0,0,0,0,1,-1.25,1,0,0,0,0,0,0,1));
  const pos=geometry.attributes.position,norm=geometry.attributes.normal;
  for(let i=0;i<positions.length/3;i++){p.fromArray(positions,i*3);if(clikMate)p.lerp(pressed.fromArray(clikMate.pressedPositions,i*3),latch);p.multiplyScalar(.001).applyMatrix4(q).add(centre);pos.setXYZ((geometry.userData.loadedShellOffset??offset)+i,p.x,p.y,p.z);p.fromArray(normals,i*3);if(clikMate)p.lerp(pressed.fromArray(clikMate.pressedNormals,i*3),latch);p.applyMatrix3(normalMatrix).normalize();norm.setXYZ((geometry.userData.loadedShellOffset??offset)+i,p.x,p.y,p.z);}
 }};
}
