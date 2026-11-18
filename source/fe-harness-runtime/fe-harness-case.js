import*as T from'three';

import{roundedCablePath}from'./lcd-cable-motion.js?v=20261111-94';



export const CASE_FE5_APERTURE408=Object.freeze({centreMM:Object.freeze([-131.0993938751,177.5997221025,247.1459736382]),widthMM:19,heightMM:19,slabZMM:Object.freeze([246.6459736382,247.6459736382])});

const smooth=t=>T.MathUtils.smoothstep(t,0,1),V=p=>new T.Vector3(...p),endPark=V([-55,177.5997221025,270]);

export function createFe5CaseFeed408({outletLocalMM=[1.2,0,-20.500086]}={}){

 const a=CASE_FE5_APERTURE408.centreMM,feedY=a[1]-4.5,path=roundedCablePath([[-145,188,55],[-145,190,58],[-145.5,190,100],[-145.5,feedY,100.2],[-145,feedY,225],[a[0],feedY,237],[a[0],feedY,285],[a[0],188,285],endPark.toArray()].map(V),.24),parkRotation=new T.Quaternion().setFromAxisAngle(V([0,1,0]),T.MathUtils.degToRad(102));

 let last=0,found;

 for(let i=1;i<=2048;i++){const t=i/2048;if(path.getPoint(t).z>=280&&path.getPoint(t).y>=187){found=t;break;}last=t;}

 if(found===undefined)throw Error('Whole-terminal turn must follow case exit');

 let lo=last,hi=found;for(let i=0;i<48;i++){const t=(lo+hi)/2;if(path.getPoint(t).z<280||path.getPoint(t).y<187)lo=t;else hi=t;}const clearParameter=(lo+hi)/2;

 function at(progress){

  if(!Number.isFinite(progress)||progress<0||progress>1)throw Error('FE5 feed progress out of range');const s=smooth(progress),mouth=path.getPoint(s),rotation=new T.Quaternion().slerp(parkRotation,smooth((s-clearParameter)/(1-clearParameter)));const port=V(outletLocalMM).applyQuaternion(rotation).add(mouth),outward=V([0,0,-1]).applyQuaternion(rotation);

  return{progress,pathParameter:s,mouth,rotation,port,outward,entrySide:V([1,0,0]).applyQuaternion(rotation),value5:1+progress,clearParameter};

 }

 return{at,path,clearParameter,stockModel:'FE45 frozen-reference365mm, not OEM cut length',qualification:'Authored whole-terminal trajectory through unchanged native case opening. Continuous pose curve; complete-body and material clearance must be measured, not inferred from endpoints.'};

}

