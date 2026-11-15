// Numerical hardware / full-jacket constructors retained from636. Runtime only; no plan-bank import.
import * as T from 'three';
import{BED_ROUTE}from'./xbuddy-bed-material-route.js';
const V=p=>new T.Vector3(...p);
export const POWER_REFERENCE={officialId:910527,component:38,id:'xbBedMinus',screwRef:'xbBedMinusScrew',lug:'xbBedMinusLug',
 mountMM:[-76.43245676132837,174.55172,65.10376870490178],bedOffsetMM:126.66332286273532,
 bedWasher:777,bedContactDatumMM:[-123.418506835,100.293003,204.59941575673532],fixedCrimpMM:[...BED_ROUTE.fixedCrimpMM],nativeReferenceOffsetsMM:{777:[0,0,.6],699:[0,0,.6]},radiusMM:1.65,
 screw:{majorDiameterMM:3.5052,pitchMM:25.4/32,lengthMM:6.35,headDiameterMM:7.16,headHeightMM:2.10},
 qualification:'Supplementary reconstruction, not manufacturer cable CAD. 6-32 nominal; Keystone-sized illustrative head/length, not identification of Prusa supplier. Wire OD3.3mm estimated from registered photograph; neutral stock is constructed, not OEM cut length. Bed contact uses native777 axis; polarity correspondence is qualified, not certified PCB artwork.'};
const M=POWER_REFERENCE.mountMM;

export function screwGeometry(){const p=[],ix=[],N=96,rings=[];const D=POWER_REFERENCE.screw;
 rings.push({y:-D.lengthMM,r:0},{y:-D.lengthMM+.2,r:1.32});for(let j=1;j<=180;j++)rings.push({y:-D.lengthMM+.2+(D.lengthMM-.2)*j/180,thread:true});
 rings.push({y:0,r:D.headDiameterMM/2},{y:.4,r:D.headDiameterMM/2},{y:1.7,r:D.headDiameterMM/2-.08},{y:D.headHeightMM,r:D.headDiameterMM/2-.4},{y:D.headHeightMM,recess:true},{y:1.0,recess:true},{y:1,r:0});
 for(const ring of rings)for(let j=0;j<=N;j++){const a=2*Math.PI*j/N;let r=ring.r;if(ring.thread){const phase=((ring.y/D.pitchMM-a/(2*Math.PI))%1+1)%1;r=1.32+(D.majorDiameterMM/2-1.32)*Math.max(0,1-Math.abs(phase-.5)/.38);}if(ring.recess){const c=Math.abs(Math.cos(a)),s=Math.abs(Math.sin(a));r=Math.max(Math.min(2.25/Math.max(c,1e-12),.55/Math.max(s,1e-12)),Math.min(.55/Math.max(c,1e-12),2.25/Math.max(s,1e-12)));}p.push((M[0]+r*Math.cos(a))*.001,(M[1]+.6+ring.y)*.001,(M[2]+r*Math.sin(a))*.001);}
 for(let i=0;i<rings.length-1;i++)for(let j=0;j<N;j++){const a=i*(N+1)+j,b=a+N+1;ix.push(a,b,a+1,b,b+1,a+1);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setIndex(ix);g.computeVertexNormals();g.computeBoundingBox();return g;}

class CableCurve extends T.Curve{constructor(curve){super();this.curve=curve;this.arcLengthDivisions=4096;}getPoint(t,target=new T.Vector3()){return this.curve.getPointAt(t,target).multiplyScalar(.001);}getTangent(t,target=new T.Vector3()){return this.curve.getTangentAt(t,target);}}
export function closedTube(curve,samples,radius){const g=new T.TubeGeometry(new CableCurve(curve),samples,radius*.001,16,false),p=Array.from(g.attributes.position.array),n=Array.from(g.attributes.normal.array),ix=Array.from(g.index.array);for(const end of[0,1]){const row=end?samples:0,offset=p.length/3,tangent=curve.getTangentAt(end).multiplyScalar(end?1:-1),centre=curve.getPointAt(end).multiplyScalar(.001);p.push(...centre.toArray());n.push(...tangent.toArray());for(let j=0;j<16;j++){const a=row*17+j,b=a+1;if(end)ix.push(offset,b,a);else ix.push(offset,a,b);}}g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('normal',new T.Float32BufferAttribute(n,3));g.setIndex(ix);return g;}
