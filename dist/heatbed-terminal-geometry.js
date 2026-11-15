import * as T from 'three';
import {HEATBED_ASSEMBLY as D} from './heatbed-assembly-data.js';
// Closed blind-bore refinement of two authored photo-derived terminal boxes.
// Same outer bounds and registration. Female thread detail is not modelled.
export function bedTerminalBodyReference(component){
 const [x0,y0,x1,y1]=component.rect,h=component.height,cx=(x0+x1)/2,cy=(y0+y1)/2,r=1.82,bottom=2.5,N=96,P=[];
 const tri=(a,b,c)=>P.push(...a,...b,...c),quad=(a,b,c,d)=>{tri(a,b,c);tri(a,c,d);};
 quad([x0,y1,0],[x1,y1,0],[x1,y0,0],[x0,y0,0]);
 quad([x0,y0,0],[x1,y0,0],[x1,y0,h],[x0,y0,h]);quad([x1,y0,0],[x1,y1,0],[x1,y1,h],[x1,y0,h]);quad([x1,y1,0],[x0,y1,0],[x0,y1,h],[x1,y1,h]);quad([x0,y1,0],[x0,y0,0],[x0,y0,h],[x0,y1,h]);
 const s=new T.Shape([new T.Vector2(x0,y0),new T.Vector2(x1,y0),new T.Vector2(x1,y1),new T.Vector2(x0,y1)]),hole=new T.Path();for(let i=0;i<=N;i++){const a=-i/N*Math.PI*2,x=cx+r*Math.cos(a),y=cy+r*Math.sin(a);if(i===0)hole.moveTo(x,y);else hole.lineTo(x,y);}s.holes.push(hole);const cap=new T.ShapeGeometry(s),a=cap.attributes.position,ix=cap.index;
 for(let i=0;i<ix.count;i+=3)tri(...[0,1,2].map(k=>[a.getX(ix.getX(i+k)),a.getY(ix.getX(i+k)),h]));cap.dispose();
 for(let i=0;i<N;i++){const a=i/N*Math.PI*2,b=(i+1)/N*Math.PI*2,A=[cx+r*Math.cos(a),cy+r*Math.sin(a),h],B=[cx+r*Math.cos(b),cy+r*Math.sin(b),h],C=[B[0],B[1],bottom],E=[A[0],A[1],bottom];quad(A,B,C,E);tri([cx,cy,bottom],E,C);}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(P,3));g.computeVertexNormals();g.computeBoundingBox();g.userData={authoredReference:true,nativeCAD:false,blindBoreRadiusMM:r,blindBoreBottomMM:bottom,sameSourceOuterBounds:true};return g;
}
export function bedTerminalScrewReference(id){
 const role=D.roles.find(r=>r.role===id);if(!role)throw Error('Unknown canonical bed role');const M=role.connectedLugSeatMM,S=D.screw,N=64,rings=[],P=[],I=[];
 rings.push({y:-S.lengthMM,r:0},{y:-S.lengthMM+.2,r:1.32});for(let j=1;j<=128;j++)rings.push({y:-S.lengthMM+.2+(S.lengthMM-.2)*j/128,thread:true});rings.push({y:0,r:S.headDiameterMM/2},{y:.4,r:S.headDiameterMM/2},{y:1.7,r:S.headDiameterMM/2-.08},{y:S.headHeightMM,r:S.headDiameterMM/2-.4},{y:S.headHeightMM,recess:true},{y:1,recess:true},{y:1,r:0});
 for(const ring of rings)for(let j=0;j<=N;j++){const a=2*Math.PI*j/N;let r=ring.r;if(ring.thread){const phase=((ring.y/S.pitchMM+a/(2*Math.PI))%1+1)%1;r=1.32+(S.majorDiameterMM/2-1.32)*Math.max(0,1-Math.abs(phase-.5)/.38);}if(ring.recess){const c=Math.abs(Math.cos(a)),s=Math.abs(Math.sin(a));r=Math.max(Math.min(2.25/Math.max(c,1e-12),.55/Math.max(s,1e-12)),Math.min(.55/Math.max(c,1e-12),2.25/Math.max(s,1e-12)));}P.push((M[0]+r*Math.cos(a))*.001,(M[1]+.6+ring.y)*.001,(M[2]+r*Math.sin(a))*.001);}
 for(let i=0;i<rings.length-1;i++)for(let j=0;j<N;j++){const a=i*(N+1)+j,b=a+N+1;I.push(a,b,a+1,b,b+1,a+1);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(P,3));g.setIndex(I);g.computeVertexNormals();g.computeBoundingBox();g.userData={authoredReference:true,nativeCAD:false,nominal:'6-32',rightHand:true,threadPitchMM:S.pitchMM,referenceOnly:true};return g;
}
