import type {Vector3,Quaternion} from 'three';
/** Actual printer/material-frame mm, with normalized original cap axes. */
export interface OutsideSourceInput51 {
 progress:number;outsideMM:Vector3;openingMM:Vector3;
 freeRotation:Quaternion;gateRotation:Quaternion;
 localT:Vector3;localWidth:Vector3;gateT:Vector3;
}
export interface OutsideSourceClock51 {
 progress:number;u:number;lift:number;align:number;workingRoll:number;
 leadMM:number;radiusMM:24;clearanceReserveMM:6;
 inletMM:number[];inletT:number[];
}
export interface OutsideSourceResult51 {
 end:Vector3;rotation:Quaternion;straightTurn:number;mode:'outside';aperture:Vector3;
 stage:string;clock49:OutsideSourceClock51;
}
/** Complete rigid cap frame + intrinsic support; whole material stock solved by the caller. */
export declare function planOutsideOutlet49(input:OutsideSourceInput51):OutsideSourceResult51;
