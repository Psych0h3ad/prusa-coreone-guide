// SPDX-License-Identifier: MIT
import {createZMotorTask} from './motor-service-data.js';
import {Z_MOTOR_CHOICES,Z_MOTOR_FAMILY} from './z-motor-choice.js';
const titles={
 left:['前左のZモーターを交換する','Replace the front-left Z motor','Vyměnit přední levý Z motor','Z-Motor vorne links austauschen'],
 right:['前右のZモーターを交換する','Replace the front-right Z motor','Vyměnit přední pravý Z motor','Z-Motor vorne rechts austauschen'],
 rear:['後方のZモーターを交換する','Replace the rear Z motor','Vyměnit zadní Z motor','Hinteren Z-Motor austauschen'],
 front:['前側2個のZモーターを交換する','Replace both front Z motors','Vyměnit oba přední Z motory','Beide vorderen Z-Motoren austauschen']
};
export function createZMotorChoices(){
 // The existing parent factory remains the only source of steps/BOM/physics.
 // Its default retained transparent pads stay enabled for every UI choice.
 return ['all','rear','left','right','front'].map(selection=>{
  const task=createZMotorTask(selection),choice=Z_MOTOR_CHOICES.find(c=>c.selection===selection);
  return {...task,id:choice.id,...(choice.id===Z_MOTOR_FAMILY?{}:{title:titles[selection]}),taskFamily:Z_MOTOR_FAMILY};
 });
}
