import assert from 'node:assert/strict';
import {v}from './check-viewer.mjs';
import {FLOWS}from '../dist/data.js';
import {SERVICE_TASKS}from '../dist/maintenance-data.js';
import {installMaintenanceModel}from '../dist/maintenance-model.js';
import {SOCKETS}from '../dist/loveboard-layout.js';
import {LOVEBOARD_CONNECTORS,connectorNotice}from '../dist/loveboard-connectors.js';
for(const[id,c]of Object.entries(LOVEBOARD_CONNECTORS)){
 assert.equal(c.pins,SOCKETS[id].pins,id+' contact count');assert.equal(c.rows,SOCKETS[id].rows,id+' rows');assert.equal(c.pitch,SOCKETS[id].pitch,id+' contact pitch');
 assert.equal(c.family,id==='P1'?'Micro-Fit 3.0':'CLIK-Mate');
}
v.setState({flow:'build',index:FLOWS.build.steps.findIndex(s=>s.chapter===5&&s.officialStep===52),comparison:'after',completed:[],explore:false,variant:'screw'});
assert.deepEqual(v.sceneActors.map(a=>connectorNotice(a).socket),['J4','J14','J2'],'actual assembly actors identify the three different ports');
for(const a of v.sceneActors){assert(!connectorNotice(a).unplug);assert(connectorNotice(a,true).body.includes('ロック'));}
const binding=installMaintenanceModel(v,SERVICE_TASKS,a=>a[0]);
let connectorOperations=0;const found=new Set();
for(let n=0;n<31;n++){
 v.setState({flow:'service',index:binding.indexOf('loveboard',n),comparison:'after',completed:[],explore:false,variant:'screw'});
 for(const a of v.sceneActors){
  const notice=connectorNotice(a);if(!notice)continue;connectorOperations++;found.add(notice.socket);
  assert(notice.url.startsWith('https://www.molex.com/'));
  if(notice.unplug&&notice.rows===1)assert(notice.body.includes(notice.family==='CLIK-Mate'?'解除バー':'ラッチ'));
 }
}
assert.equal(found.size,9,'all nine LoveBoard ports appear in the actual service sequence');
assert.equal(connectorNotice({flex:['lbMainLead'],fromStates:{lbMainLead:.5},to:0}),null,'channel routing does not ask the user to unplug a previously disconnected main lead again');
assert.equal(connectorNotice({flex:['hotendHeater0'],fromStates:{hotendHeater0:0},to:.35}),null,'hotend wire-hook routing is not represented as a connection');
assert.equal(connectorNotice({refs:[847],to:1}),null,'screws do not inherit connector advice');
for(const[from,to]of[[1,2],[2,1]])assert.equal(connectorNotice({flex:['lbMotorLead'],fromStates:{lbMotorLead:from},to}),null,'a connected bundle is routed without insertion advice or a socket-only camera');
console.log(JSON.stringify({status:'PASS',ports:[...found],connectorOperations,scope:'Schematic contact counts and pitch, actual assembly/service actor mapping, family-specific Japanese instructions and separation from cable routing. Housing geometry is unchanged.'}));
