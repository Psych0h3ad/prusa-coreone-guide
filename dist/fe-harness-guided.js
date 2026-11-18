import*as T from'three';import{path,Section,join,lengthOf}from'./cable-assembly/earth/curves.js';import{makeGroundedHead,solveBoundaryWire,GroundBight,earlyFree}from'./fe-ground-head.js';import{MaterialCurve,resultFor,MaterialBight,endRoute}from'./cable-assembly/boundary/late-source.js';
import{box1GuideMix,box1GuidedCaseRoute}from'./fe-box1-guide.js';
const U=new T.Vector3(0,0,1),smooth=t=>T.MathUtils.smootherstep(t,0,1);
class CentrelineTransition408 extends T.Curve{
 constructor(a,b,w){super();Object.assign(this,{a,b,w});this.arcLengthDivisions=8192;this.mm=lengthOf(t=>this.derivative(t),128);}
 getPoint(t,out=new T.Vector3()){return out.copy(this.a.getPointAt(t)).multiplyScalar(1-this.w).addScaledVector(this.b.getPointAt(t),this.w);}
 derivative(t,out=new T.Vector3()){return out.copy(this.a.getTangentAt(t)).multiplyScalar(this.a.getLength()*(1-this.w)).addScaledVector(this.b.getTangentAt(t),this.b.getLength()*this.w);}
 getTangent(t,out=new T.Vector3()){return this.derivative(t,out).normalize();}getLength(){return this.mm;}
}
function throughOpening(reference,b,d){
 const trunk=reference.trunk,height=Math.max(95,Math.min(237,b.z-20));let lo=0,hi=1;for(let i=0;i<40;i++){const t=(lo+hi)/2;if(trunk.getPoint(t).z<height)lo=t;else hi=t;}const cut=(lo+hi)/2,S=trunk.getPoint(cut),tangent=trunk.getTangent(cut),portal=new T.Vector3(-131.0993938751,177.5997221025,Math.min(250,b.z-4)),incoming=d.clone().negate();
 return path([new Section(trunk,0,cut),join(S,tangent,portal,U,Math.min(8,S.distanceTo(portal)/3)),join(portal,U,b,incoming,Math.min(8,portal.distanceTo(b)/3))]);
}
export function solveGuidedFe5Feed408(args,{stockMM=365}={}){
 const b=args.ports[1],weight=smooth((b.z-180)/50)*(1-smooth((b.z-263)/8));
 if(weight===0){const original=solveBoundaryWire(args,{stockMM});original.report={...original.report,guideWeight408:0,sourceBoundaryLiteral:true};return original;}
 const r=args.reference,head=makeGroundedHead(r),originalFree=new CentrelineTransition408(earlyFree(r,b,args.tangents[1],args.value5,args.entrySide),throughOpening(r,b,args.tangents[1]),weight),boxMix=box1GuideMix(b),free=boxMix===0?originalFree:new CentrelineTransition408(originalFree,box1GuidedCaseRoute(r,b,args.tangents[1]),boxMix),candidate=k=>path([head,new GroundBight(r.coilBase,k,r.feClearanceAmount||0),free]),minimum=candidate(0).getLength();
 if(minimum>stockMM)throw Error('Guided FE45 minimum exceeds stock '+minimum);let lo=0,hi=1.4;if(candidate(hi).getLength()<stockMM)throw Error('Guided FE45 storage capacity');for(let i=0;i<42;i++){const mid=(lo+hi)/2;if(candidate(mid).getLength()<stockMM)lo=mid;else hi=mid;}
 const storage=(lo+hi)/2,p=candidate(storage),data={...r.data,targetMM:stockMM,materialStationsMM:r.data.materialStationsMM.map(s=>s*stockMM/r.data.targetMM)},curve=new MaterialCurve(p,data),report={phase:'FE5 whole-case feed / aperture-guided analytic centreline',value5:args.value5,targetMM:stockMM,lengthMM:p.getLength(),errorMM:p.getLength()-stockMM,minimumRouteMM:minimum,storageKind:'same authored case bight, recomputed constant stock',storageAngle:storage,guideWeight408:weight,box1GuideMix:boxMix,portalXYMM:[-131.0993938751,177.5997221025],portalZMM:Math.min(250,b.z-4),sourceBoundaryLiteral:false,qualification:'Analytic centreline transition with a fresh stock solve; no mesh-vertex interpolation, section shrink, hole change or predicate tolerance. Complete material and contact verification remains required.'};return resultFor(r,curve,report);
}
