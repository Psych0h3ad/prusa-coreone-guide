// The kit uses three 12 mm screws. The upgrade reuses the right 10 mm screw.
// A comparison or introductory overview of the original printer keeps all 10 mm.
export function ventConfiguration(state,step){
 const original=state.comparison==='before'||state.flow==='upgrade'&&!state.explore&&!step.final&&(step.overview||step.chapter===0||step.chapter===1&&step.officialStep<28);
 if(original)return 'original';
 return ['build','service'].includes(state.flow)?'kit':'upgrade';
}
export const VENT_DATUM={underheadZ:.4892875248124,sourceLength:.010,addedLength:.002,nutOffset:[0,0,-.002],underhead:{98:[.0892507654789464,-.122357890775307,.4892875248124],100:[.0042507654789464,-.122357890775307,.4892875248124],102:[-.0807492345210536,-.122357890775307,.4892875248124]}};
