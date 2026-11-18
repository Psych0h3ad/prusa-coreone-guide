const DATUMS={R:{nut:783,mount:639,port:'J7'},FL:{nut:640,mount:637,port:'J1'},FR:{nut:782,mount:636,port:'J5'}};
export function withZMotorWorkingView(spec){
 if(!spec?.plan?.motorService)return spec;
 const solid=new Set(spec.plan.solidRefs),actors=spec.plan.actors.map(a=>{
  const m=a.motorOperation?.match(/^zm(R|FL|FR)(Old|New)(Motor|Plug)$/);if(!m)return a;
  const [,side,generation,part]=m,from=a.fromStates[a.motorOperation],lo=Math.min(from,a.to),hi=Math.max(from,a.to),kind=part==='Plug'?'plug':hi<=1?'thread':lo>=2?'handling':'extraction',d=DATUMS[side];
  for(const ref of [a.motorOperation,d.nut,d.mount,...(part==='Plug'?['stepperSplitter']:[])])solid.add(ref);
  return {...a,focusRefs:[],keepGuide:true,zMotorWorkingView:{side,generation,kind,from,to:a.to,port:d.port,nutCAD:d.nut,mountCAD:d.mount}};
 });
 return {...spec,plan:{...spec.plan,actors,solidRefs:[...solid]}};
}
