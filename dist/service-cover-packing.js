import * as T from 'three';
// The A5 wall is about 2 mm further inward at the front than R1. Pack the two
// existing thermistor leads inside it, preserving ports, radius and the
// delivered Curve.getLength() convention at every authored route stage.
export function earlyWirePacking(viewer){
 const items=['hotendThermistor0','hotendThermistor1'].map(id=>{const e=viewer.fasteners.entities.get(id),original=e.routeStages;const evidence=[];
  const packed=original.map(stage=>{if(stage.at!==1)return stage;const points=stage.points.map(p=>p.clone()),curve=p=>{const c=new T.CatmullRomCurve3(p,false,'centripetal');c.arcLengthDivisions=1024;return c;},stock=curve(points).getLength();
   for(let i=2;i<points.length-3;i++){const p=points[i];if(p.z>.369&&p.z<.405&&p.y<-.049)p.y=-.049;}
   const slackAxis='y',base=points.map(p=>p.clone()),make=amount=>base.map(p=>{const q=p.clone(),z=p.z*1000;if(z>383&&z<398)q.y+=amount*Math.sin(Math.PI*(z-383)/15)**2;return q;});
   let lo=0,hi=.008;const shorter=curve(base).getLength()<stock;
   if(shorter){for(let i=0;i<36;i++){const mid=(lo+hi)/2;if(curve(make(mid)).getLength()<stock)lo=mid;else hi=mid;}points.splice(0,points.length,...make((lo+hi)/2));}
   const length=curve(points).getLength();evidence.push({id,at:stage.at,stockMM:stock*1000,packedMM:length*1000,deltaMM:(length-stock)*1000,slackAxis,slackMM:shorter?(lo+hi)*500:0,firstUnchanged:points[0].equals(stage.points[0]),lastUnchanged:points.at(-1).equals(stage.points.at(-1)),radiusMM:e.radius});return {...stage,points};});
  return {e,original,packed,evidence};});let active=false;
 return {evidence:items.flatMap(x=>x.evidence),set(next){if(next===active)return;active=next;for(const x of items){x.e.routeStages=next?x.packed:x.original;x.e.lastKey='';}}};
}
