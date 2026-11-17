import {MOTOR_Y_GROOVE as C} from './motor-y-lead-data.js';
export function withMotorYCableWorkingView(source){
 const p=source.build?.[991892];
 if(!p||p.actors.length!==3)return source;
 const actors=p.actors.map((actor,i)=>({...actor,
  camera:'service-print-perspective',focusPadding:2,focusMinDistance:i===1?75:48,
  focusBounds:i===1?[171,154,326,207,198,397]:[186,175,336,205,191,350],
  ...(i===1?{anchors:[C.slice()],guideArrowLength:5,guideRadius:2.5,guideTube:.2}:i===2?{guideArrowLength:2.5,guideRadius:1.4,guideTube:.16}:{}),
 }));
 return {...source,build:{...source.build,991892:{...p,actors}}};
}
