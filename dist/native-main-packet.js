import * as T from 'three';
import {mainServiceCanonical615}from './loveboard-main-service.js';
import {createMainServiceRoute}from './loveboard-main-route.js';
import {sampleNativeJ13,createNativeJ13SurfaceWriter}from './native-j13.js?v=20261114-129';
export function createNativeMainPacket615(){
 const canonical=mainServiceCanonical615(),route=createMainServiceRoute(canonical,{samplePlug:sampleNativeJ13}),state=route.sample({from:1,to:1,t:1}),writer=createNativeJ13SurfaceWriter(),count=22*81*7,g=new T.BufferGeometry(),indices=[];
 for(const name of ['position','normal'])g.setAttribute(name,new T.BufferAttribute(new Float32Array((count+writer.vertices)*3),3));
 for(let w=0;w<22;w++){const start=indices.length;for(let i=0;i<80;i++)for(let j=0;j<6;j++){const a=w*81*7+i*7+j,b=a+7;indices.push(a,a+1,b,b,a+1,b+1);}g.addGroup(start,indices.length-start,w);}
 const start=indices.length;for(let i=0;i<writer.vertices;i++)indices.push(count+i);g.addGroup(start,indices.length-start,22);g.setIndex(indices);
 route.write(state,g);writer.write(g.attributes.position,g.attributes.normal,{offset:count,packet:state.packet});g.computeBoundingBox();g.computeBoundingSphere();
 return {geometry:g,state,route,canonical,writer,dispose(){g.dispose();route.dispose();canonical.geometry.dispose();}};
}
