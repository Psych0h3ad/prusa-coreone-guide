import * as T from '../dist/vendor/three.module.js';

// The two hotend sensor wires leave the carriage hook before passing the
// heatsink-NTC pair. Offset their free span, not the fixed source or plug.
// This is explanatory cable geometry, not a recovered factory harness shape.
export function dressThermistorExit(routes){
 for(const id of ['hotendThermistor0','hotendThermistor1']){
  const route=routes[id];if(route.exitClearanceVersion===3)continue;
  if(route.exitClearanceVersion)throw Error('Unknown thermistor exit route version');
  for(const stage of route.routeStages)for(const p of stage.points){
   const blend=T.MathUtils.smoothstep(p[2],366,370)*(1-T.MathUtils.smoothstep(p[2],388,397));
   const offset=1.2+4.4*T.MathUtils.smoothstep(p[2],371,379);
   if(blend)p[1]=+(p[1]-offset*blend).toFixed(5);
  }
  route.loosePoints=route.routeStages[0].points;route.points=route.routeStages.at(-1).points;route.exitClearanceVersion=3;
 }
}
