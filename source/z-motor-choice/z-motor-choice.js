// SPDX-License-Identifier: MIT
export const Z_MOTOR_FAMILY='z-motor-replacement';
const words=s=>s.split('|');
export const Z_MOTOR_CHOICES=[
 {selection:'left',id:Z_MOTOR_FAMILY+'-left',label:words('前左の1個|Front-left motor|Přední levý motor|Motor vorne links')},
 {selection:'right',id:Z_MOTOR_FAMILY+'-right',label:words('前右の1個|Front-right motor|Přední pravý motor|Motor vorne rechts')},
 {selection:'rear',id:Z_MOTOR_FAMILY+'-rear',label:words('後方の1個|Rear motor|Zadní motor|Hinterer Motor')},
 {selection:'front',id:Z_MOTOR_FAMILY+'-front',label:words('前側の2個|Both front motors|Oba přední motory|Beide vorderen Motoren')},
 {selection:'all',id:Z_MOTOR_FAMILY,label:words('全3個の手順|All 3 motors|Všechny 3 motory|Alle 3 Motoren')}
];
export const Z_MOTOR_CHOICE_COPY={
 title:words('交換する位置|Replacement position|Umístění výměny|Austauschposition'),
 note:words('位置はプリンターの正面から見たものです。|Positions are viewed from the front of the printer.|Pozice při pohledu na tiskárnu zepředu.|Positionen von vorne auf den Drucker gesehen.')
};
export function isZMotorChoice(task){return !!task&&task.motorService?.axis==='z'&&task.motorService.source==='575994'&&Z_MOTOR_CHOICES.some(c=>c.id===task.id&&c.selection===task.motorService.selection);}
export function zMotorPickerTasks(tasks,currentID){
 const selected=tasks.find(t=>t.id===currentID);
 return tasks.filter(t=>!isZMotorChoice(t)||t.id===Z_MOTOR_FAMILY).map(t=>t.id===Z_MOTOR_FAMILY&&isZMotorChoice(t)&&isZMotorChoice(selected)?{...selected,title:t.title}:t);
}
