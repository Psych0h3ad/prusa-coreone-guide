// Plain data/phase contract. No Three, viewer, GLB or preparation import.
export const BOX4_CLOSE_STEP=995519;
export const BOX4_PHASES=Object.freeze({prepared:0,aligned:.45,threaded:.60,tight:.88,cut:.90,end:1});
const states={0:0,1:0,2:.60,3:.75,4:.88,5:1};
export function box4PhaseForState(from,to,t){if(!(from in states)||!(to in states)||!Number.isFinite(t))throw Error('Unsupported box4 phase state');const u=Math.max(0,Math.min(1,t));return states[from]+(states[to]-states[from])*u;}
export function createBox4ClosePlan(plan){
 if(plan.box4Close277)return plan;let count=0;
 const actors=plan.actors.flatMap(a=>{if(!a.flex?.includes('box4'))return[a];if(a.flex.length!==1||a.to!==5)throw Error('Conflicting box4 close actor');count++;
  return[{...a,to:2,label:'位置4：先端を頭の穴へ通す',box4PhaseRange:[0,.60],box4CloseAction:'thread'},
   {...a,to:4,label:'位置4：配線を挟まずに1本ずつ締める',box4PhaseRange:[.60,.88],box4CloseAction:'close'},
   {...a,to:5,label:'位置4：余りを切り、切れ端を離す',box4PhaseRange:[.88,1],box4CloseAction:'cut'}];});
 if(count!==1)throw Error('Expected the source104 single box4 close actor');return{...plan,actors,box4Close277:true};
}
export function createBox4ClosePlans(bank){return{...bank,build:{...bank.build,[BOX4_CLOSE_STEP]:createBox4ClosePlan(bank.build[BOX4_CLOSE_STEP])}};}
