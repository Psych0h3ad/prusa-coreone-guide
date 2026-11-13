// Three-free semantic sequence for official CORE One+ guide3.49 /986647.
// Geometry owners consume explicit operation/local-progress commands; this
// module does not choose an old whole-step clock or interpolate mesh vertices.
export const STEP349=986647;
export const EVENTS=Object.freeze(['cables-gather','lcd-entry','bottom-tie-thread','bottom-tie-close','bottom-tie-cut']);
export function createStep349Plan(bank){
 const source=bank.build?.[STEP349];if(!source)throw Error('Official3.49 plan missing');if(source.sequence349)return bank;
 const [gather,tie]=source.actors;
 if(source.actors.length!==2||gather.flex?.length!==1||gather.flex[0]!=='boxLower'||gather.to!==1||tie.flex?.length!==1||tie.flex[0]!=='box5'||tie.to!==5)throw Error('Different source3.49 operation contract');
 const actors=[{...gather,manualEvent:EVENTS[0]},
  {flex:['lcdWire'],to:1,label:'xLCDを配線の上に沿わせ、ラッチを上向きに接続する',axis:[0,0,1],showBefore:true,focusMotion:true,manualEvent:EVENTS[1]},
  {...tie,to:2,label:'一番下の結束バンドの先端をロック部へ通す',manualEvent:EVENTS[2]},
  {...tie,to:4,label:'一番下の結束バンドで配線を固定する。締めすぎない',manualEvent:EVENTS[3]},
  {...tie,to:5,label:'配線を避けて、余った結束バンドを切る',manualEvent:EVENTS[4]}];
 return{...bank,build:{...bank.build,[STEP349]:{...source,actors,sequence349:true}}};
}
export function commandForStep349({flow,officialId,event,progress}){
 if(flow!=='build'||officialId!==STEP349)return null;
 if(!EVENTS.includes(event)||!Number.isFinite(progress)||progress<0||progress>1)throw Error('Explicit3.49 operation and local progress0..1 required');
 const i=EVENTS.indexOf(event),routing={operation:i===0?'gather':'entry',progress:i<2?progress:1};
 return{routing,bottomTie:i<2?{operation:'prepared',progress:1}:{operation:['thread','close','cut'][i-2],progress},otherTies:'remain-prepared'};
}
