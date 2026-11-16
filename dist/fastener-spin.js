// The approach axis points out of the receiving hole, towards the screw head.
// A right-hand fastener tightens clockwise when viewed from that head.
export function rightHandThreadDegrees(turns,axialTravel=-1){
 return (axialTravel>1e-9?1:-1)*Math.abs(turns);
}
export function motionSpinDegrees(actor){
 // Handling turns and the gearbox free-running check are not thread motion.
 const free=actor.handling||actor.inspection||actor.threaded===false||actor.refs?.some(r=>r==='pgAdapter'||r==='pgAssembly');
 return free?actor.spin:rightHandThreadDegrees(actor.spin);
}
