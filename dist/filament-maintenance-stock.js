// Authored working-material reference registered to the existing nozzle tube.
// CAD mm throughout this module. The real nozzle STL has a ~2 mm bore at
// z=320..383.6. No strand is drawn through the 0.4 mm nozzle outlet.
export const FILAMENT_DATUM=Object.freeze({x:-2.943578,y:-58.395252,diameter:1.75,stock:400,fragmentStock:40,turnZ:435,turnRadius:25});
const d=FILAMENT_DATUM,quarter=Math.PI*d.turnRadius/2;
export function filamentReferencePoint(tip,s){
 if(!Number.isFinite(tip)||tip<319.5||tip>515||!Number.isFinite(s)||s<0||s>400)throw Error('Invalid working-material reference clock');
 const side=Math.max(0,tip-435)*.25;tip=Math.min(tip,435);const x=d.x+side,y=d.y,rise=d.turnZ-tip;
 if(s<=rise)return{point:[x,y,tip+s],tangent:[0,0,1]};
 const turn=s-rise;
 if(turn<quarter){const a=turn/d.turnRadius;return{point:[x,y-d.turnRadius*(1-Math.cos(a)),d.turnZ+d.turnRadius*Math.sin(a)],tangent:[0,-Math.sin(a),Math.cos(a)]};}
 const a=(turn-quarter)/60;return{point:[x-60*(1-Math.cos(a)),y-d.turnRadius-60*Math.sin(a),d.turnZ+d.turnRadius],tangent:[-Math.sin(a),-Math.cos(a),0],normalU:[Math.cos(a),-Math.sin(a),0]};
}
