// SPDX-License-Identifier: GPL-3.0-only
// Read-only examples adapted from the versioned Buddy controllers in inputs.json.
export function maintenanceDisplaySpec(version){
 if(!['8.0.0','6.5.7'].includes(version))throw Error('Unsupported firmware display');
 return {
  title:'Loading filament',preheatTitle:'Preheating for load',
  phases:[
   {phase:'UserPush_stoppable',text:version==='8.0.0'?'Push the filament into the extruder and then, while still pushing, press CONTINUE.':'Press CONTINUE and push filament into the extruder.',buttons:['CONTINUE','STOP'],progress:0},
   {phase:'LoadingToGears_stoppable',text:'Inserting',buttons:['STOP'],progress:0},
   {phase:'WaitingTemp_stoppable',text:'Waiting for temperature',buttons:['STOP'],progress:0},
   {phase:'Loading_stoppable',text:'Loading to nozzle',buttons:['STOP'],progress:0},
   {phase:'Purging_stoppable',text:'Purging',buttons:['STOP'],progress:0},
   {phase:'IsColor',text:'Is color correct?',buttons:['YES','PURGE MORE','RETRY'],progress:100}
  ],
  sensorKeys:['FILAMENT SENSORS','Filament Sensing','Side Filament Sensor','Toolhead Filament Sensor','Restore Defaults'],
  // Native selector's enabled-material list is configurable. This example has
  // the standard PLA preset enabled, selected, and first in that section.
  preset:{name:'PLA',nozzle:215,bed:60},
  selectorKeys:['Return','Show All','PETG','ASA','PC','PVB','ABS']
 };
}
