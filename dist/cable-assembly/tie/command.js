// Official3.49 local operation progress; no inferred whole-step clock.
export function phaseForBox5({operation,progress}){
 if(!Number.isFinite(progress)||progress<0||progress>1)throw Error('Explicit Box5 local progress0..1 required');
 switch(operation){
  case'prepared':return 0;
  case'thread':return .60*progress;
  case'close':return .60+.28*progress;
  case'cut':return .88+.12*progress;
  default:throw Error('Unknown Box5 operation');
 }
}
