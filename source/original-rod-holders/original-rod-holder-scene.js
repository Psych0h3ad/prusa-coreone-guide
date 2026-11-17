// Original2251-only source rest-frame projection. No geometry/owner/controller mutation.
import {ORIGINAL_ROD_HOLDERS as D} from './original-rod-holder-data.js';
export function originalRodHolderScene(scene,state,flow){
 if(state.flow!=='build'||flow?.manualID!==2251||scene.plan.originalRodHolderFrame!==D.frame.key)return scene;
 const current=scene.instanceOffsets||[],ids=Object.keys(D.frame.offsetsMM).map(Number);
 if(current.some(p=>ids.includes(p.cadIndex)))throw Error('Conflicting Original rear rod-holder frame');
 return {...scene,instanceOffsets:[...current,...ids.map(cadIndex=>({cadIndex,offset:D.frame.offsetsMM[cadIndex],source:'Original2251 source844389/photo864229 mounted rear packets'}))]};
}
