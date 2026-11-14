// Three-free. Native-body seeds, not a second resource/route owner.
const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
const mix=(a,b,t)=>(1-t)*a+t*b;
export const FAN_IDS=Object.freeze(['cfFan1','cfFan2']);
export function fanScrewPark(id){
 if(![138,140,142,144].includes(id))throw Error('Expected one native fan screw');
 return[id===138||id===140?-90:90,-42,0];
}
export function fanBodySeed(id,amount){
 if(!FAN_IDS.includes(id))throw Error('Expected a fan-only provider');
 const stage=id==='cfFan1'?[9,4.1,-20.74559]:[-8,1,-20.74559];
 if(amount>1){const lift=smooth((amount-1)/.05),slide=smooth((amount-1.05)/.05);return[stage[0]*(1-slide),stage[1]*(1-slide),stage[2]*(1-lift)];}
 const park=id==='cfFan1'?[260,-110,0]:[-380,-110,0];
 if(amount<.1)return[park[0],park[1],mix(park[2],200,smooth(amount/.1))];
 if(amount<.2){const t=smooth((amount-.1)/.1);return[park[0]+(stage[0]-park[0])*t,park[1]+(stage[1]-50-park[1])*t,200];}
 if(amount<=.55)return[stage[0],stage[1]-50,mix(200,100,smooth((amount-.2)/.35))];
 const q=smooth((amount-.55)/.45);return[stage[0],mix(stage[1]-50,stage[1],smooth((q-.8)/.2)),mix(100,stage[2],q)];
}
export function tempBodySeed(amount){
 // Exact seed projection of the frozen647 tempBodyOffset, no TEMP geometry.
 const bench=1-smooth(amount/.25),held=smooth(amount/.25)*(1-smooth((amount-.35)/.3));
 return[100*bench,-120*bench-3*held,80*bench+30*held];
}
export function appendChamberNativeSeeds(spec){
 for(const [id,refs]of [['cfFan1',[70]],['cfFan2',[72]],['cfTemp',[71,'thermistor']]]){
  const amount=spec.flexStates[id];
  if(!Number.isFinite(amount))throw Error('Missing chamber seed '+id);
  spec.plan.workpiecePoses.push({refs,offset:id==='cfTemp'?tempBodySeed(amount):fanBodySeed(id,amount),pivot:[0,0,0],rotation:[0,0,0]});
 }
 return spec;
}
