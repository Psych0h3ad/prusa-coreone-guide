import * as THREE from 'three';

const directions={perspective:[720,490,940],'hotend-perspective':[-720,-250,940],'wiring-perspective':[-250,160,1100],'board-perspective':[380,1100,450],'fan-perspective':[500,1000,-650],'base-right-perspective':[-1000,80,-1200],'base-left-perspective':[1000,80,-1200],'back-perspective':[720,490,-940],'rear-wiring-perspective':[300,180,-1200],'right-perspective':[940,490,720],'top-perspective':[550,850,730],front:[0,100,1230],right:[1250,100,0],top:[0,1250,.01],back:[0,100,-1250]};
directions['vent-perspective']=[180,1200,480];
directions['side-sensor-perspective']=[1100,-780,-330];
directions['sensor-mount-perspective']=[1100,-250,-500];
directions['corexy-left-perspective']=[-1100,420,600];
directions['corexy-right-perspective']=[1100,420,600];
directions['ntc-perspective']=[260,700,-1050];
directions['lcd-install-perspective']=[240,650,1200];
directions['lcd-earth-perspective']=[180,100,-1200];
directions['lcd-left-tab-perspective']=[-550,700,1100];
directions['lcd-right-tab-perspective']=[550,700,1100];
directions['holder-bench-perspective']=[-650,1050,600];
directions['holder-install-perspective']=[-900,450,1100];
directions['holder-inside-perspective']=[-1200,1200,-500];
directions['hinge-inside-perspective']=[1200,1200,-500];
directions['hinge-front-perspective']=[-650,550,1200];
directions['hinge-pin-perspective']=[-500,950,900];
directions['door-open-perspective']=[1100,500,850];
directions['door-upright-perspective']=[1200,550,450];
directions['bottom-bench-perspective']=[-500,1050,700];
directions['base-front-right-perspective']=[1200,120,450];
directions['base-rear-right-perspective']=[1200,120,-450];
directions['base-rear-perspective']=[200,160,-1200];
directions['base-side-left-perspective']=[-1200,160,0];
directions['base-front-perspective']=[-200,160,1200];
directions['splitter-front-perspective']=[-650,320,-1200];
directions['splitter-back-perspective']=[-180,120,1200];
directions['splitter-prep-perspective']=[-180,1200,420];
directions['splitter-route-perspective']=[180,180,-1400];
directions['splitter-zr-perspective']=[0,120,-1400];
directions['splitter-lift-perspective']=[0,520,-1400];
directions['fe-ground-perspective']=[520,150,-1400];
directions['service-print-perspective']=[-800,450,-1100];
directions['service-drive-side']=[-600,300,-1000];
directions['service-fan-connect']=[-1050,380,800];
directions['service-ntc-hook']=[1100,180,300];
directions['sensor-bench-perspective']=[180,120,-1200];
directions['service-right-connect']=[1050,380,800];
directions['service-sensor-connect']=[1250,180,-450];
directions['left-cover-perspective']=[-1250,80,60];
directions['xbuddy-board-perspective']=[80,180,-1200];
directions['main-duct-perspective']=[-1000,528,500];
directions['main-loom-bench']=[650,1000,850];
export function viewDirection(view){return new THREE.Vector3(...(directions[view]||[720,390,940]));}

export function frameBox(box,direction,fov,aspect,margin=1.2,minDistance=140){
 const target=box.getCenter(new THREE.Vector3());
 const forward=direction.clone().normalize();
 const basis=new THREE.Matrix4().lookAt(forward,new THREE.Vector3(),new THREE.Vector3(0,1,0));
 const right=new THREE.Vector3().setFromMatrixColumn(basis,0),up=new THREE.Vector3().setFromMatrixColumn(basis,1);
 const tanY=Math.tan(THREE.MathUtils.degToRad(fov)/2),tanX=tanY*Math.max(aspect,.1);
 let distance=minDistance;
 for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z]){
  const p=new THREE.Vector3(x,y,z).sub(target),depth=p.dot(forward);
  distance=Math.max(distance,depth+margin*Math.abs(p.dot(right))/tanX,depth+margin*Math.abs(p.dot(up))/tanY);
 }
 return {target,position:target.clone().addScaledVector(forward,distance)};
}
