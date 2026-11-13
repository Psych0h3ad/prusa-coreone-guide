import * as T from 'three';
export const strandLength615=p=>p.slice(1).reduce((s,v,i)=>s+v.distanceTo(p[i]),0);
export function closeMaterial615(points,target,{limit=.005,first=63,last=77}={}){
 const before=strandLength615(points);if(Math.abs(before-target)<1e-8)return{lengthMM:before,amplitudeMM:0,initialDeltaMM:before-target};
 // Exact arc-length gradient, rather than unequal-link position Laplacian.
 const kernel=points.map((p,i)=>i>=first&&i<=last?p.clone().sub(points[i-1]).normalize().sub(points[i+1].clone().sub(p).normalize()).normalize().multiplyScalar(Math.sin(Math.PI*(i-first+1)/(last-first+2))**2):new T.Vector3());
 const evaluate=a=>points.slice(1).reduce((s,p,i)=>s+Math.hypot(p.x-points[i].x+a*(kernel[i+1].x-kernel[i].x),p.y-points[i].y+a*(kernel[i+1].y-kernel[i].y),p.z-points[i].z+a*(kernel[i+1].z-kernel[i].z)),0),direction=before<target?1:-1;let lo=0,hi=Math.min(.00001,limit);
 while((evaluate(direction*hi)-target)*(before-target)>0&&hi<limit)hi=Math.min(limit,hi*2);
 if((evaluate(direction*hi)-target)*(before-target)>0)throw Error('615 adaptive upper material correction outside its stated envelope');
 for(let k=0;k<40;k++){const m=(lo+hi)/2;if((evaluate(direction*m)-target)*(before-target)>0)lo=m;else hi=m;}
 const amplitude=direction*(lo+hi)/2;for(let i=first;i<=last;i++)points[i].addScaledVector(kernel[i],amplitude);return{lengthMM:strandLength615(points),amplitudeMM:amplitude,initialDeltaMM:before-target};
}
