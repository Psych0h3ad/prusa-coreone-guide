// SPDX-License-Identifier: GPL-3.0-only
// Display adapter for Prusa-Firmware-Buddy's calibration controllers.
// Original controllers, translations and notices accompany the source index.
export function nativeDisplays(version){
 if(!['8.0.0','6.5.7'].includes(version))throw Error('Unsupported calibration display version');
 const f=(phase,text,buttons=[],extra={})=>({phase,text,buttons,...extra});
 const door={title:'DOOR SENSOR CALIBRATION',phases:[
  f('skip_ask','Calibration of door sensor is only necessary for user-assembled printers or services door sensor. In all other cases you can skip this step.',['CALIBRATE','SKIP'],{layout:'qr',link:'core-door-sensor-cal'}),
  f('confirm_closed','Is the chamber door closed?\n\nIf not, please close it and confirm.',['CONTINUE','ABORT']),
  f('tighten_screw_half','Open the door and tighten the tensioning screw by about a half turn. Then close the door and confirm.',['CONTINUE','ABORT'],{layout:'qr',link:'core-door-sensor-cal'}),
  f('confirm_open','Now fully open the door and confirm that it is open.',['CONTINUE','ABORT']),
  f('loosen_screw_half','Open the door and loosen the tensioning screw by about a half turn. Then leave the door open and confirm.',['CONTINUE','ABORT'],{layout:'qr',link:'core-door-sensor-cal'}),
  f('finger_test','Grab the door in the middle, place your fingers behind it, and close it as shown in the picture. Then confirm.',['CONTINUE','ABORT'],{layout:'finger',image:'door_sensor_calibration_170x170.png'}),
  f('loosen_screw_quarter','Open the door and loosen the tensioning screw by about a quarter turn. Then close the door and confirm.',['CONTINUE','ABORT'],{layout:'qr',link:'core-door-sensor-cal'}),
  f('repeat','Adjusting the tensioning screw of the door sensor was not successful.\n\nPlease repeat the last step.',['OK']),
  f('done','The door sensor is successfully calibrated now.',['CONTINUE']),
  f('confirm_abort','Are you sure you want to skip the door sensor calibration for now?',['BACK','SKIP']),
  f('ask_enable_safety_features','Do you want to enable door sensor safety features?',['YES','NO'],{layout:'qr',link:'core-door-sensor-cal'}),
  f('warn_disabled_sensor','Disabling the door sensor may lead to injury or printer damage.\nProceeding means you accept full responsibility.\nWe are not liable for any harm or damages.',['CANCEL','DISABLE'],{layout:'prompt',promptTitle:'Caution!'})
 ]};
 const loadcell={title:'SELFTEST',name:'Loadcell Test',phases:[
  f('Loadcell_move_away','Increasing distance to bed',[],{layout:'loadcell'}),
  f('Loadcell_cooldown','Cooling down. Do not touch the nozzle!',['ABORT'],{layout:'loadcell',image:'hand_with_nozzle0_154x100.png',large:'- °C'}),
  f('Loadcell_user_tap_ask_abort',"We will need your help with this test. You will be asked to tap the nozzle. Don't worry; it is going to be cold.",['CONTINUE','ABORT'],{layout:'loadcell',image:'hand_with_nozzle3_154x100.png'}),
  f('Loadcell_user_tap_ask_abort','You did not tap the nozzle or you tapped it too soon. Retry?',['CONTINUE','ABORT'],{variant:'wrong-tap',layout:'loadcell',image:'hand_with_nozzle2_154x100.png'}),
  f('Loadcell_user_tap_ask_abort','Loadcell data are noisy. Make sure the printer is on a stable surface. Retry?',['CONTINUE','ABORT'],{variant:'noisy',layout:'loadcell-qr',link:'loadcell-noise-issue'}),
  f('Loadcell_user_tap_countdown','Tap the nozzle on beep',[],{layout:'loadcell',image:'hand_with_nozzle1_154x100.png',large:'5 s',countdown:5}),
  f('Loadcell_user_tap_check','Tap the nozzle',[],{layout:'loadcell',image:'hand_with_nozzle4_154x100.png',large:'NOW'}),
  f('Loadcell_user_tap_ok','Loadcell test passed OK.',[],{layout:'loadcell-result',progress:100}),
  f('Loadcell_fail','Loadcell test failed.',[],{layout:'loadcell-result',progress:100,failed:true})
 ]};
 const fsensors={title:'Filament sensors calibration',phases:[
  f('prepare','Preparing for filament sensor calibration',[],{layout:'wait'}),
  ...(version==='8.0.0'?[f('not_connected','Turn off the printer and check that the filament sensor cables are wired correctly.',['ABORT'],{layout:'prompt',promptTitle:'Filament sensor not connected'})]:[]),
  f('offer_unload','Please make sure there is no filament in the tool and side filament sensors.\n\nYou will need filament to finish this test later.',['CONTINUE','UNLOAD','ABORT'],{layout:'spool',image:'prusament_spool_white_100x100.png'}),
  f('ask_filament','Is there any filament in the tool or side filament sensors?',['YES','NO','ABORT'],{layout:'spool',image:'prusament_spool_white_100x100.png'}),
  f('calibrating','Calibrating filament sensors',[],{layout:'wait'}),
  f('insert_filament_not_ready','Push the filament through the side and extruder filament sensors, until the extruder engages with the filament.',['CONTINUE','ABORT'],{layout:'filament',image:'hand_with_filament_150x130.png'}),
  f('insert_filament_ready','Filament inserted, press continue.',['CONTINUE','ABORT'],{layout:'filament',image:'hand_with_filament_ok_150x130.png'}),
  f('not_ready_confirm_continue','There is a problem with some of the sensors. You may calibrate the rest, but the selftest will fail.',['RETRY','CONTINUE','ABORT'],{layout:'spool',image:'prusament_spool_white_100x100.png'}),
  f('success','Filament sensors calibrated!',['DONE'],{layout:'spool',image:'prusament_spool_white_100x100.png'}),
  f('failed','Selftest FAILED. Enable logging to TXT from the settings for details.',['OK'],{layout:'spool',image:'prusament_spool_white_100x100.png'})
 ]};
 return{door,loadcell,fsensors};
}
