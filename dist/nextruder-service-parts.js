// Components carried by the heatsink when the Nextruder leaves its carriage.
// Supplemental internals have no common imported CAD ancestor.
export const NEXTRUDER_INTERNAL_REFS=Object.freeze([
 'hallSensor','hallHolder','hallBall','hallMagnet','hallSpring',
 'idlerSwivelSpacer','idlerSpring1','idlerSpring2'
]);
export const NEXTRUDER_BODY_REFS=Object.freeze([
 790,...Array.from({length:25},(_,i)=>792+i),
 'mainPlate','pgAssembly','pgRing',
 'idlerBearing1','idlerBearing2','idlerPin1','idlerPin2',
 ...NEXTRUDER_INTERNAL_REFS,
 'lbMotorLead','lbNtcLead','lbLoadcellLead','lbFilamentLead'
]);
