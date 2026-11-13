import {LOVEBOARD,socketCentre} from './loveboard-layout.js?v=20261111-94';

// Cable exit and channel positions are routing illustrations, not wire specifications.
export const SERVICE_FAN_DEFINITIONS=[
 {id:'serviceHotendFanLead',name:'Hotend fan lead',colors:['#383c3b','#bd3831','#397aa1'],
  seated:[[-19,-68,365],[-24.5,-68,373],[-19,-58,372],[-19,-52,369.5],[-22,-47,374],[-26.5,-47,380],[-31,-43,386],[-27,-28.6,380],[-21.7,-28.6,380]],
  loose:[[-19,-68,365],[-24.5,-68,373],[-29,-67,375],[-31.5,-68,376.5],[-34,-69,378],[-39,-68,382],[-44,-65,388],[-47,-61,392],[-48,-57,396]]},
 {id:'servicePrintLead',name:'Print fan lead',colors:['#353938','#d9d8d1','#626663'],
  seated:[[-21,7,371],[-30,3,374],[-30.5,-18,373],[-30.5,-24.1,373],[-30.5,-28,374.7],[-30,-35.2,374],[-30.5,-42,377],[-29.7,-46,394],[-34,-39,394],[-29,-32,387.1],[-21.7,-28.6,387.1]],
  loose:[[-21,7,371],[-28,3,374],[-31,-1,377],[-33,-4,379],[-36,-9,386],[-38,-9,389.5],[-40,-8,393],[-43,-3,398],[-43,3,403],[-41,6,405],[-39,9,407]]}
];
for(const d of SERVICE_FAN_DEFINITIONS){
 const socket=socketCentre(d.id==='servicePrintLead'?'J5':'J6');d.socket=socket;d.socketId=d.id==='servicePrintLead'?'J5':'J6';
 const rear=[socket[0],LOVEBOARD.datumCAD[1]-9.7,socket[2]];
 d.seated[d.seated.length-3]=[socket[0]-(d.id==='servicePrintLead'?1.5:.5),rear[1]-(d.id==='servicePrintLead'?6.5:10),socket[2]+5];d.seated[d.seated.length-2]=[rear[0],rear[1]-3,rear[2]];d.seated[d.seated.length-1]=rear;
}
