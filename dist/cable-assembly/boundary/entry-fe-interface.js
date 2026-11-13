import * as T from 'three';
import {prepareFe45Reference} from '../earth/wire-solver.js';
import {solveBoundaryWire} from './boundary-wire.js';
import {MaterialCurve,resultFor} from './late-source.js';
const vector=a=>new T.Vector3().fromArray(a);
// Pure constructor for Mendel's entry-only relief. The caller supplies the
// pinned source rest-data and the DISTINCT frozen event state, not an old time.
export function createFrozenEventFe({referenceData,eventState}){
 const f=eventState.actualFrame,reference=prepareFe45Reference(referenceData),args={ports:[f.port4,f.port5].map(vector),tangents:f.tangents.map(vector),value5:f.values[5],reference,target:365};
 if(eventState.event!=='FE48_COMPLETE_LCD_HELD_BEFORE_GATHER'||args.value5!==2)throw Error('Expected distinct frozen FE48 event');
 const base=solveBoundaryWire(args),materialData={...referenceData,targetMM:365,materialStationsMM:referenceData.materialStationsMM.map(s=>s*365/referenceData.targetMM)},materialStationsMM=materialData.materialStationsMM.slice();
 return{curve:base.curve,physicalPath:base.curve.path,materialStationsMM,stockMM:365,radiusMM:1.1,ports:args.ports,tangents:args.tangents,baseline:base,
  // physicalPath.getPointAt(s/365) is geometric arclength. curve.getPoint(t)
  // uses the retained nonuniform512-ring material map and is NOT that query.
  pointAtPhysicalMM(s){return base.curve.path.getPointAt(T.MathUtils.clamp(s/365,0,1));},
  makeResultForPhysicalPath(path,report={}){
   const lengthMM=path.getLength();if(Math.abs(lengthMM-365)>1e-6)throw Error('Entry relief must solve the same365mm stock: '+lengthMM);
   for(const [t,point,tangent]of[[0,args.ports[0],args.tangents[0]],[1,args.ports[1],args.tangents[1].clone().negate()]])if(path.getPointAt(t).distanceTo(point)>1e-7||path.getTangentAt(t).distanceTo(tangent)>1e-7)throw Error('Entry relief changed a real FE endpoint or tangent');
   return resultFor(reference,new MaterialCurve(path,materialData),{...base.report,...report,value5:2,targetMM:365,lengthMM,errorMM:lengthMM-365});
  },qualification:'Entry-only coordinated transient path; freeze endpoints/stock/radius and restore exact baseline result. Constructor/writer do not claim relief clearance.'};
}
