export const PE_PARKED_OFFSET_MM=[-10,24,14];
const same=(a,b)=>Array.isArray(a)&&a.length===b.length&&a.every((v,i)=>v===b[i]);
const oldPark=[14,10,-13];
export function servicePeActor(a){return a.refs?.includes('feGroundRing')&&same(a.posePath?.[0]?.offset,oldPark)?{...a,posePath:a.posePath.map((p,i)=>i===0?{...p,offset:[...PE_PARKED_OFFSET_MM]}:p)}:a;}
export function servicePePlan(plan){if(plan.serviceTask!=='xbuddy')return plan;return{...plan,actors:(plan.actors||[]).map(servicePeActor),workpiecePoses:(plan.workpiecePoses||[]).map(p=>p.refs?.includes('feGroundRing')&&same(p.offset,oldPark)?{...p,offset:[...PE_PARKED_OFFSET_MM]}:p)};}
export function insertBedPowerActors(source,power){const has=id=>source.some(a=>a.flex?.includes(id)),screw=id=>source.some(a=>a.refs?.includes(id));if(has('xbBedMinus')||has('xbBedPlus')){if(has('xbBedMinus')&&has('xbBedPlus')&&screw('xbPowerScrew38')&&screw('xbPowerScrew39'))return source;throw Error('Partial bed role projection requires a coherent merge');}const k=source.findIndex(a=>a.refs?.includes('feGroundScrew'));if(k<0)throw Error('Expected source sensor then PE sequence');return[...source.slice(0,k),...power,...source.slice(k)];}
