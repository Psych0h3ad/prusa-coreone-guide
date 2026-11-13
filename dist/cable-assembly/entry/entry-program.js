import{createRootEntryFamily}from'./entry-family.js';
const expected={initialFrames:'388b8aca75fcd4e132eb154c1fdd0079a664224f1200e6d595c1eecbf9fcee1f',seatedProxy:'08bba17820420e56ce41759f21ba8669cf7c6e313751b24a9dffbc11168a898b',materialProfiles:'a4e9616d1224ac96344d0300ce86e8311fe5d7e65619828bd441c0b1b05d0a52'};
// Semantic operation inputs only: parent owns buttons, ties and their actual
// phase callbacks. No old family clock or route/connect threshold is inferred.
export function createV8EntryProgram({boundary}){
 for(const[key,sha]of Object.entries(expected))if(boundary.pins[key]?.sha256!==sha)throw Error('Different v8 cohort '+key);
 const field=createRootEntryFamily({boundary});
 return{field,boundaryEvent:boundary.event,at({operation,progress}){
  if(!Number.isFinite(progress)||progress<0||progress>1)throw Error('Operation progress0..1 required');
  if(operation!=='gather'&&operation!=='entry')throw Error('Supply gather or entry operation');
  const unjoinedModel=operation==='gather'?{...boundary.initialModel,phase:{operation,progress}}:field.at(progress);
  return{unjoinedModel,blueGatherProgress:operation==='gather'?progress:1,
   packetPose:boundary.packetPose(unjoinedModel),earthState:boundary.earthState,
   feEndpointSurfaces:boundary.feEndpointSurfaces,materialSource:boundary.materialSource,
   qualification:'Finite candidate; entry FE passage and actual tie composition remain explicitly unresolved.'};
 }};
}
