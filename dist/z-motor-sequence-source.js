// Official Original2251 / CORE One+ source identities. Gen2 has separate
// primary instructions and stock selection; these mappings make no Gen2 claim.
export const Z_MOTOR_SEQUENCE_SOURCE={
 plus:{guideID:981931,steps:[
  {stepID:983329,lines:{check:[1031907],pad:[983343],mount:[983351],align:[983359],screw:[983367,983375]}},
  {stepID:983383,lines:{flip:[983397],rear:[983405,983413,983421],rearCable:[983429],front:[983437],frontCable:[983445],sides:[983453]}},
  {stepID:983461,lines:{screw:[983489,983473,983481,983497]}},
  {stepID:983505,lines:{inspect:[1095130,1095131],insert:[983519],lock:[983527],screw:[983535,983543]}},
  {stepID:983551,lines:{cable:[983565,983573],insert:[983581],lock:[983589],screw:[983597,983613],aside:[983605]}}
 ]},
 original2251:{manualID:2251,guideID:835498,steps:[
  {stepID:838335,lines:{check:[1031915],pad:[838336,1042026],mount:[838337],align:[838338],screw:[838339,838375]}},
  {stepID:838480,lines:{flip:[838481],rear:[838482,838483,838484],rearCable:[838486],front:[861764],frontCable:[861765],sides:[861780]}},
  {stepID:862609,lines:{screw:[866030,862610,862611,866038]}},
  {stepID:838550,lines:{inspect:[],insert:[838554],lock:[838555],screw:[838598,857181]}},
  {stepID:838613,lines:{cable:[838614,838615],insert:[838616],lock:[838617],screw:[838618,859894],aside:[838669]}}
 ]}
};
export const Z_MOTOR_GROUPS=[
 {motor:311,mount:309,pad:364,screws:[338,340,342,344],centreMM:[-159.500003,-178.900005]},
 {motor:366,mount:362,pad:365,screws:[346,348,350,352],centreMM:[159.500003,-178.900005]},
 {motor:367,mount:363,pad:310,screws:[354,356,358,360],centreMM:[-5.40000014,132.599993]}
];
export const Z_MOTOR_SEQUENCE_LABELS={};
for(let i=1;i<=3;i++){
 const p=`${i}台目：`;
 for(const [ja,en,cs,de]of[
  ['ねじ軸を回して固着がないか確かめる',`Motor ${i}: turn the threaded rod to check that it moves freely`,`Motor ${i}: otočte závitovou tyčí a ověřte volný chod`,`Motor ${i}: Gewindestange drehen und auf freien Lauf prüfen`],
  ['ワッシャーを確認してねじ軸に通す',`Motor ${i}: inspect the washer and slide it over the rod`,`Motor ${i}: zkontrolujte podložku a nasuňte ji na tyč`,`Motor ${i}: Unterlegscheibe prüfen und über die Stange schieben`],
  ['突起を上に向けたマウントをねじ軸に通す',`Motor ${i}: slide the mount over the rod with its protrusions up`,`Motor ${i}: nasuňte držák na tyč výstupky nahoru`,`Motor ${i}: Halter mit den Vorsprüngen nach oben über die Stange führen`],
  ['マウントとモーターの4か所の穴を合わせる',`Motor ${i}: align the four mount and motor holes`,`Motor ${i}: srovnejte čtyři otvory držáku a motoru`,`Motor ${i}: die vier Bohrungen von Halter und Motor ausrichten`]
 ])Z_MOTOR_SEQUENCE_LABELS[p+ja]=[en,cs,de];
 for(let n=1;n<=4;n++)Z_MOTOR_SEQUENCE_LABELS[p+`M3×8の${n}本目を締める`]=[`Motor ${i}: tighten M3x8 screw ${n} of 4`,`Motor ${i}: utáhněte ${n}. ze čtyř šroubů M3x8`,`Motor ${i}: M3x8-Schraube ${n} von 4 festziehen`];
}
for(const [ja,en,cs,de]of[
 ['ZRの長いケーブルを確認し、後部モーターのねじ軸を底板へ通す','Identify the rear motor by its long ZR cable and pass its rod through the bottom panel','Podle dlouhého kabelu ZR vyberte zadní motor a protáhněte jeho tyč spodním panelem','Hinteren Motor am langen ZR-Kabel erkennen und seine Stange durch die Bodenplatte führen'],
 ['後部モーターのケーブルが外側を向くことを確認する','Check that the rear motor cable points outwards','Zkontrolujte, že kabel zadního motoru směřuje ven','Prüfen, dass das Kabel des hinteren Motors nach außen zeigt'],
 ['右前のモーターのねじ軸を底板へ通す','Pass the front right motor rod through the bottom panel','Protáhněte tyč pravého předního motoru spodním panelem','Stange des vorderen rechten Motors durch die Bodenplatte führen'],
 ['左前のモーターのねじ軸を底板へ通す','Pass the front left motor rod through the bottom panel','Protáhněte tyč levého předního motoru spodním panelem','Stange des vorderen linken Motors durch die Bodenplatte führen'],
 ['前の2台のケーブルが後部モーター側を向くことを確認する','Check that both front motor cables point towards the rear motor','Zkontrolujte, že oba přední kabely směřují k zadnímu motoru','Prüfen, dass beide vorderen Motorkabel zum hinteren Motor zeigen'],
 ['前側に2台、後ろ側に1台あることを確認する','Identify the front with two motors and the rear with one motor','Rozlište přední stranu se dvěma motory a zadní s jedním','Vorderseite mit zwei Motoren und Rückseite mit einem Motor erkennen'],
 ['左前モーターのケーブルが後ろ側を向くことを確認する','Check that the front left motor cable still points rearwards','Zkontrolujte, že kabel levého předního motoru stále směřuje dozadu','Prüfen, dass das Kabel des vorderen linken Motors weiter nach hinten zeigt'],
 ['ロッドマウントの穴の内側と、スムースロッドの通りを確認する','Inspect the rod mount bore and check the smooth rod fit','Zkontrolujte otvor držáku a průchod hladké tyče','Bohrung des Stangenhalters und Passung der glatten Stange prüfen']
])Z_MOTOR_SEQUENCE_LABELS[ja]=[en,cs,de];
for(const [ja,en,cs,de]of[['後部','Rear','Zadní','Hinterer'],['右前','Front right','Pravý přední','Vorderer rechter'],['左前','Front left','Levý přední','Vorderer linker']]){
 for(let n=1;n<=4;n++)Z_MOTOR_SEQUENCE_LABELS[`${ja}モーターを底板に留めるM3×8：${n}本目`]=[`${en} motor: tighten bottom-panel M3x8 screw ${n} of 4`,`${cs} motor: utáhněte ${n}. ze čtyř šroubů M3x8 ve spodním panelu`,`${de} Motor: M3x8-Bodenschraube ${n} von 4 festziehen`];
}
for(const [ja,en,cs,de]of[['右','right','pravý','rechten'],['左','left','levý','linken']]){
 Z_MOTOR_SEQUENCE_LABELS[`${ja}のロッドマウントを穴に差し込む`]=[`Insert the ${en} rod mount into the opening`,`Vložte ${cs} držák tyče do otvoru`,`Den ${de} Stangenhalter in die Öffnung einsetzen`];
 Z_MOTOR_SEQUENCE_LABELS[`13–16スパナで${ja}のロッドマウントを90°回してロックする`]=[`Turn the ${en} rod mount 90° with the 13–16 wrench to lock it`,`Otočte ${cs} držák tyče klíčem 13–16 o 90° a zajistěte jej`,`Den ${de} Stangenhalter mit dem 13–16-Schlüssel um 90° drehen und verriegeln`];
}
