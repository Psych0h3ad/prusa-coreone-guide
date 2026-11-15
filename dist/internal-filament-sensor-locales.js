// SPDX-License-Identifier: GPL-3.0-only
import{heatsinkWords}from './heatsink-service-locales.js';
const extra={
 'Refit the retained heatsink on the motor, its cables to the right':['ヒートシンクは元のものを使い、配線を右にしてモーターに合わせる','Původní chladič nasaďte na motor s kabely vpravo','Vorhandenen Kühlkörper mit seinen Kabeln rechts auf den Motor setzen'],
 'Place the new holder with the ball end facing up':['新品ホルダーを球の側が上になる向きで持つ','Nový držák otočte koncem pro kuličku nahoru','Neuen Halter mit der Kugelseite nach oben halten'],
 'Arrange the new steel ball first':['新しい鋼球を先頭に置く','Nejdříve připravte novou ocelovou kuličku','Neue Stahlkugel zuerst anordnen'],
 'Place exactly one new magnet after the ball':['鋼球の後ろに新しい磁石を1個だけ置く','Za kuličku dejte právě jeden nový magnet','Genau einen neuen Magneten hinter die Kugel setzen'],
 'Place the new spring after the magnet':['磁石の後ろに新しいばねを置く','Za magnet umístěte novou pružinu','Neue Feder hinter dem Magneten anordnen'],
 'Insert the complete stack spring-first with the ball up':['鋼球を上に保ち、3部品をばね側からホルダーに収める','S kuličkou nahoře zasuňte celou trojici pružinou napřed do držáku','Dreiteiligen Stapel mit Kugel nach oben und Feder voraus in den Halter einsetzen'],
 'Keep the original heatsink and loadcell lead':['元のヒートシンクとロードセル配線を保持する','Ponechte původní chladič a kabel loadcell','Vorhandenen Kühlkörper und Wägezellenkabel beibehalten']
};
export function internalSensorWords(en,ja){const value=extra[en];return value?[value[0],en,value[1],value[2]]:heatsinkWords(en,ja);}
