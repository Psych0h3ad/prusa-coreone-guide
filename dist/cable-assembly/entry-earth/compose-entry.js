import{createV8EntryProgram}from'../entry/entry-program.js';
import{createSelectedEntryFeRelief}from'./selected-relief-v4.js';
// Pure current-state composition. Parent owns operation timing and installs
// writers after the ordinary controls have established the resulting phase.
// No viewer methods, native solids, early model or old frozen field is edited.
export function createCoordinatedEntry({boundary,fe}){
 const entry=createV8EntryProgram({boundary}),relief=createSelectedEntryFeRelief({fe});
 return{at(command){const state=entry.at(command),feResult=command.operation==='entry'?relief.at(command.progress):fe.baseline;
  return{...state,baseQualification:state.qualification,feResult,
   qualification:'Finite FE delta candidate: nine checked current entry states clear; full entry/tie/current-source composition is not qualified.'};
 }};
}
