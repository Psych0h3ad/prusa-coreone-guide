import {LOVEBOARD_TASK as original} from './loveboard-service-data.js?v=20261113-117';
// Existing complete task retained; only the three latch-handling bodies change.
const bodies={
  "7": [
    "各コネクターには安全ラッチがあります。先にラッチを押して解除し、配線ではなくコネクター本体をつかみ、ヒーター、サーミスターの順にまっすぐ抜きます。ロックしたまま引かないでください。",
    "Each connector has a safety latch. Press it to release the lock first, hold the connector housing rather than the wires, then unplug the heater followed by the thermistor straight out. Do not pull against a locked latch.",
    "Každý konektor má pojistku. Nejprve ji stiskněte a odjistěte, uchopte tělo konektoru, nikoli vodiče, a přímo odpojte nejprve topení a potom termistor. Za zajištěný konektor netahejte.",
    "Jeder Stecker besitzt eine Verriegelung. Diese zuerst drücken und lösen; das Steckergehäuse statt der Leitungen greifen. Zuerst Heizung, dann Thermistor gerade abziehen. Nicht gegen die geschlossene Verriegelung ziehen."
  ],
  "9": [
    "各コネクターの解除バーを指の腹で押してロックを外し、配線ではなく本体をつかんでまっすぐ抜きます。まずプリントファンを外して配線を後ろへ逃がします。次に上面のモーター、ヒートシンクのNTC、ホットエンドファンの順に1個ずつ外します。",
    "For each connector, press the release bar with the pad of a finger, then grip the housing, not the wires, and pull straight out. Unplug the print fan first and move its lead back. Next disconnect the top motor, heatsink NTC and hotend fan, one connector at a time.",
    "U každého konektoru nejprve bříškem prstu stiskněte odjišťovací jazýček a pak jej vytáhněte přímo za tělo, nikoli za vodiče. Nejprve odpojte tiskový ventilátor a kabel odsuňte dozadu. Potom jednotlivě odpojte horní motor, NTC chladiče a ventilátor hotendu.",
    "Bei jedem Stecker zuerst den Entriegelungsbügel mit der Fingerkuppe drücken, dann am Gehäuse statt an den Leitungen gerade abziehen. Zuerst den Drucklüfter abstecken und sein Kabel nach hinten legen. Danach Motor oben, Kühlkörper-NTC und Hotend-Lüfter einzeln abstecken."
  ],
  "10": [
    "右側のM3×6を2本外してカバーを外します。次にロードセル、フィラメントセンサーの順に1個ずつ、解除バーを押してロックを外してからコネクター本体をまっすぐ抜きます。配線を引っ張らないでください。",
    "Remove the two right-side M3×6 screws and the cover. Then unplug the loadcell followed by the filament sensor, one connector at a time: press the release bar first and pull the housing straight out. Do not pull the wires.",
    "Vyjměte dva pravé šrouby M3×6 a kryt. Potom po jednom odpojte loadcell a senzor filamentu: nejprve stiskněte odjišťovací jazýček a tělo konektoru vytáhněte přímo. Netahejte za vodiče.",
    "Die zwei rechten M3×6-Schrauben und die Abdeckung entfernen. Danach Wägezelle und Filamentsensor einzeln abstecken: zuerst den Entriegelungsbügel drücken und das Gehäuse gerade abziehen. Nicht an den Leitungen ziehen."
  ]
};
export const LOVEBOARD_REPLACEMENT_TASK={...original,revision:3,steps:original.steps.map((s,i)=>bodies[i]?{...s,body:bodies[i]}:s)};
