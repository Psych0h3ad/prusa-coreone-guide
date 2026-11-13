import{installStep349Live}from'../install.js?v=20261113-116';
import{installComponent13Owner}from'./owner.js?v=20261112-113';

// The inner state/progress/dispose hooks are captured by frozen335. The added
// instance preflight protects proxy geometry before335 clears its FE/LCD pose;
// it does not change335's public hook identities or any field implementation.
export function installStep349WithComponent13(viewer,{inputs,native}){
 let proxy=viewer.component13Owner347,sequence=viewer.step349Live335;
 if(!(proxy?.active&&sequence?.active)){
  proxy=installComponent13Owner(viewer);
  try{sequence=installStep349Live(viewer,{inputs,native});proxy.bind335Controller(sequence.controller);proxy.sync();}
  catch(error){try{if(sequence?.active)sequence.retire();}finally{proxy.retire();}throw error;}
 }
 return{proxy,sequence,retire(){proxy.preflight();sequence.retire();proxy.retire();},flushDisposals(){return proxy.flushDisposals();}};
}
