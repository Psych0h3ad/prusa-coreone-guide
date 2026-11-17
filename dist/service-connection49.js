import {Biarc44} from './biarc44.js';
/** @typedef {import('three').Vector3} Vector3 */
/** @typedef {{startMM:Vector3,startTangent:Vector3,endMM:Vector3,endTangent:Vector3,ratio:number}} TangentConnectionSpec49 */
/** @typedef {{progress:number,outsideMM:Vector3,openingMM:Vector3,freeRotation:import('three').Quaternion,gateRotation:import('three').Quaternion,localT:Vector3,localWidth:Vector3,gateT:Vector3}} OutsideSourceInput49 */
/** A positive-length analytic tangent connection; failure is reported, never substituted. */
export class ServiceConnection49 extends Biarc44{
 /** @param {TangentConnectionSpec49} spec */
 constructor(spec){super(spec.startMM,spec.startTangent,spec.endMM,spec.endTangent,spec.ratio);this.spec49={kind:'biarc',startMM:spec.startMM.toArray(),startTangent:spec.startTangent.toArray(),endMM:spec.endMM.toArray(),endTangent:spec.endTangent.toArray(),ratio:spec.ratio,arcLengthsMM:[this.first.L,this.reverse.L],minimumRadiusMM:this.minimumRadiusMM,joinTangentDot:this.joinTangentDot,continuity:'C1; explicit curvature step between circles'};}
}
