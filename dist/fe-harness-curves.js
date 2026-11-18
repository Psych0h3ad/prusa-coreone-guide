import{withFEClearColumn}from'./fe-upper-column.js';
import*as T from'three';
import{solveFe23}from'./cable-assembly/earth-path/fe23-path-v105.js';
import{prepareFe45Reference}from'./cable-assembly/earth/wire-solver.js';
import{solveGuidedFe5Feed408}from'./fe-harness-guided.js';
import{solveStraightTerminalEntry}from'./fe-terminal-entry.js';
import{Arc,cubic,Section,path as joinedPath}from'./cable-assembly/earth/curves.js';

export function makeWireGeometry(){const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(new Float32Array(513*9*3),3));g.setAttribute('normal',new T.BufferAttribute(new Float32Array(513*9*3),3));const ix=[];for(let i=1;i<=512;i++)for(let j=1;j<=8;j++){const a=9*(i-1)+j-1,b=9*i+j-1;ix.push(a,b,a+1,b,b+1,a+1);}g.setIndex(ix);return g;}
export function writeTube(entity,curve,end){
 const g=entity.mesh.geometry,P=g.attributes.position.array,N=g.attributes.normal.array,f=curve.computeFrenetFrames(512,false);
 for(let i=0;i<=512;i++){const t=f.tangents[i].clone().normalize(),n=f.normals[i].clone().addScaledVector(t,-f.normals[i].dot(t)).normalize(),b=new T.Vector3().crossVectors(t,n).normalize(),c=curve.getPointAt(i/512).sub(end);for(let j=0;j<=8;j++){const angle=j/8*Math.PI*2,v=n.clone().multiplyScalar(-Math.cos(angle)).addScaledVector(b,Math.sin(angle)),k=(i*9+j)*3;P[k]=(c.x+v.x*entity.radius)*.001;P[k+1]=(c.y+v.y*entity.radius)*.001;P[k+2]=(c.z+v.z*entity.radius)*.001;N.set(v.toArray(),k);}}
 entity.mesh.matrix.makeTranslation(...end.toArray().map(v=>v*.001));g.attributes.position.needsUpdate=g.attributes.normal.needsUpdate=true;g.computeBoundingBox();g.computeBoundingSphere();entity.curve=curve;
}
export function createFEField(referenceData){
 const originalReference=prepareFe45Reference(referenceData),end23=new T.Vector3(144.5,181.15,-24.729999542236328),stock23=87.91005477952497;
 // Repartition only this owned reference; the legacy solver/data stay intact.
 const height=z=>{let lo=0,hi=1;for(let i=0;i<40;i++){const t=(lo+hi)/2;if(originalReference.column.getPoint(t).z<z)lo=t;else hi=t;}return(lo+hi)/2;},ha=height(85),hb=height(125);
 originalReference.head=new Section(originalReference.column,0,ha);originalReference.coilBase=new Section(originalReference.column,ha,hb);originalReference.trunk=new Section(originalReference.column,hb,1);
 const wire23=solveStraightTerminalEntry({THREE:T,end:end23,away:new T.Vector3(0,0,-1),stockMM:stock23,solveBody:({end,stockMM})=>solveFe23(new T.Vector3(113,178.55,-1),end,new T.Vector3(0,0,-1),new T.Vector3(0,0,-1),stockMM)});
 const freeReference=withFEClearColumn(originalReference,0,1);let reference=freeReference,corridor=1,clearance=0;
 function updateReference(){reference=clearance===0&&corridor===1?freeReference:clearance===0&&corridor===0?originalReference:withFEClearColumn(originalReference,clearance,Math.max(clearance,corridor));reference.feClearanceAmount=clearance;reference.feCorridorAmount=corridor;}
 function wire45(pose,ringDelta=new T.Vector3()){
  const r=ringDelta.lengthSq()===0?reference:{...reference,data:{...reference.data,points:reference.data.points.map((p,i)=>i?p:new T.Vector3(...p).add(ringDelta).toArray())}},start=new T.Vector3(...r.data.points[0]),end=pose.port;
  const result=solveStraightTerminalEntry({THREE:T,end,away:pose.outward,stockMM:365,solveBody:({end,stockMM})=>solveGuidedFe5Feed408({reference:r,ports:[start,end],tangents:[new T.Vector3(0,0,-1),pose.outward],value5:pose.value5,entrySide:pose.entrySide,target:stockMM},{stockMM})});
  return {...result,report:{targetMM:365,lengthMM:result.lengthMM,errorMM:result.residualMM,entryMM:6.2,box1Guide:result.body?.report?.box1GuideMix??0},writeTube(entity){writeTube(entity,result.curve,end);}};
 }
 return {get reference(){return reference;},wire23,end23,wire45,get clearanceAmount(){return clearance;},get corridorAmount(){return corridor;},setCorridorAmount(amount){if(!Number.isFinite(amount)||amount<0||amount>1)throw Error('FE corridor amount');if(amount===corridor)return;corridor=amount;updateReference();},setClearanceAmount(amount){if(!Number.isFinite(amount)||amount<0||amount>1)throw Error('FE storage amount');if(amount===clearance)return;clearance=amount;updateReference();}};
}

// A complete round span3–4 with two straight6.2mm grips and a broad source-facing bight.
// The full measured reference stock is retained; old self-crossing source bends remain in QA.
export function createMovingSpan34(array){
 const points=[];for(let i=0;i<512;i++){const p=new T.Vector3();for(let j=0;j<8;j++)p.add(new T.Vector3().fromArray(array,(i*48+j*6)*3));points.push(p.multiplyScalar(1/8));}const last=new T.Vector3();for(let j=0;j<8;j++)last.add(new T.Vector3().fromArray(array,((511*48)+j*6+1)*3));points.push(last.multiplyScalar(1/8));const stock=points.slice(1).reduce((v,p,i)=>v+p.distanceTo(points[i]),0),A=new T.Vector3(144.5,178.65,-24.729999542236328),B=new T.Vector3(-132.949394,167.2,18.645974),grip=6.2;
 function curveFor(delta,r){const end=B.clone().add(delta),D=new T.Vector3(0,0,-1),Z=new T.Vector3(0,0,1),X=new T.Vector3(1,0,0),a=A.clone().addScaledVector(D,grip),q1=a.clone().addScaledVector(X,-2*r),q2=q1.clone().setZ(-13-r),q3=q2.clone().add(new T.Vector3(-r,0,r)),right=new T.Vector3(125,174,-13),left=new T.Vector3(-118,174,-13),b=end.clone().addScaledVector(D,grip);return joinedPath([new T.LineCurve3(A,a),new Arc(a.clone().addScaledVector(X,-r),X,D,r,Math.PI),new T.LineCurve3(q1,q2),new Arc(q2.clone().addScaledVector(X,-r),X,Z,r,Math.PI/2),cubic(q3,q3.clone().add(new T.Vector3(-3,0,0)),right.clone().add(new T.Vector3(3,0,0)),right),new T.LineCurve3(right,left),cubic(left,left.clone().add(new T.Vector3(-8,0,0)),b.clone().addScaledVector(D,8),b),new T.LineCurve3(b,end)]);}

 function write(mesh,delta){
  const target=stock;let lo=delta.z===0?1.5:.05,hi=delta.z===0?6.5:32;if(curveFor(delta,lo).getLength()>target||curveFor(delta,hi).getLength()<target)throw Error('FE34 full stock cannot reach real ports');for(let i=0;i<42;i++){const mid=(lo+hi)/2;if(curveFor(delta,mid).getLength()<target)lo=mid;else hi=mid;}const h=(lo+hi)/2,curve=curveFor(delta,h),frames=curve.computeFrenetFrames(512,false),rings=[];for(let i=0;i<=512;i++){const centre=curve.getPointAt(i/512),t=frames.tangents[i].clone().normalize(),n=frames.normals[i].clone().addScaledVector(t,-frames.normals[i].dot(t)).normalize(),b=new T.Vector3().crossVectors(t,n).normalize(),ring=[];for(let j=0;j<=8;j++){const angle=j/8*Math.PI*2;ring.push(centre.clone().addScaledVector(n,-Math.cos(angle)*1.1).addScaledVector(b,Math.sin(angle)*1.1));}rings.push(ring);}
  const P=mesh.geometry.attributes.position.array;let k=0;for(let i=0;i<512;i++)for(let j=0;j<8;j++)for(const p of[rings[i][j],rings[i+1][j],rings[i][j+1],rings[i+1][j],rings[i+1][j+1],rings[i][j+1]]){P.set(p.toArray(),k);k+=3;}mesh.geometry.computeVertexNormals();return{stockMM:stock,lengthMM:curve.getLength(),restLiteral:false,gripMM:grip,radiusMM:1.1,rightBendRadiusMM:h,startMM:A.toArray(),endMM:B.clone().add(delta).toArray(),qualification:'Authored full-radius route along the retained174/-13 corridor; smooth left turn replaces old self-crossing corners. Complete8192faces/fullstock retained; not OEM cut-length or force evidence.'};
 }
 return{write,stockMM:stock,polylineMM:stock,startMM:A.toArray(),endMM:B.toArray()};
}
