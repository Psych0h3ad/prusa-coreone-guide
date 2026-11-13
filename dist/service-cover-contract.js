export const COVER_TEXT={
 label:['カバーのネジ','Cover screws','Šrouby krytu','Deckelschrauben'],
 standard:['1本・六角','1 screw · hex','1 šroub · imbus','1 Schraube · Inbus'],
 early:['初期2本・T10','Early: 2 screws · T10','Raný: 2 šrouby · T10','Früh: 2 Schrauben · T10'],
 upperOut:['上のネジをT10で外して保管する','Remove and retain the upper screw with T10','Horní šroub vyjmout Torxem T10 a uschovat','Obere Schraube mit T10 herausdrehen und aufbewahren'],
 lowerOut:['下のネジをT10で外して保管する','Remove and retain the lower screw with T10','Dolní šroub vyjmout Torxem T10 a uschovat','Untere Schraube mit T10 herausdrehen und aufbewahren'],
 coverOut:['カバーを左へ外す','Remove the cover to the left','Sejmout kryt doleva','Abdeckung nach links abnehmen'],
 coverIn:['カバーを元の位置に戻す','Refit the cover','Vrátit kryt','Abdeckung einsetzen'],
 upperIn:['上の元のネジをT10で固定する','Refit the original upper screw with T10','Horní šroub upevnit Torxem T10','Ursprüngliche obere Schraube mit T10 befestigen'],
 lowerIn:['下の元のネジをT10で固定する','Refit the original lower screw with T10','Dolní šroub upevnit Torxem T10','Ursprüngliche untere Schraube mit T10 befestigen'],
};
export const RECONSTRUCTION_CREDIT=["初期型の下側取付部は、公式写真と接合部から復元した補助表示です。メーカー旧版CADそのものではありません。", "The early lower mount is a supplementary reconstruction from official photos and mating parts, not original early-version CAD.", "Spodní uchycení rané verze je doplňková rekonstrukce podle oficiálních fotografií a navazujících dílů, nikoli původní CAD rané verze.", "Die untere Aufnahme der frühen Version ist eine ergänzende Rekonstruktion anhand offizieller Fotos und angrenzender Teile, kein originales CAD der frühen Version."];
export const COVER_MESSAGES=Object.fromEntries([...Object.values(COVER_TEXT),RECONSTRUCTION_CREDIT].map(([ja,...rest])=>[ja,rest]));
const DIFFERENCES=[
 [
  "上側のM3x10を2.5 mm六角レンチで外し、左カバーを外します。初期型はM3x10bTが2本の場合があるため、T10で両方を外します。",
  "T10で上と下の元のM3x10bTを1本ずつ外して保管します。2本とも外してから、左カバーを左へまっすぐ外します。"
 ],
 [
  "Remove the upper M3x10 with a 2.5 mm hex key, then the left cover. Early printers may have two M3x10bT screws; remove both with T10.",
  "Use T10 to remove and retain the original upper and lower M3x10bT screws one at a time. Remove both before sliding the left cover straight to the left."
 ],
 [
  "Vyjměte horní M3x10 pomocí 2,5mm imbusu a sejměte levý kryt. Rané tiskárny mohou mít dva M3x10bT; oba vyjměte pomocí T10.",
  "T10 postupně vyšroubujte a uschovejte původní horní a dolní M3x10bT. Po vyjmutí obou šroubů vysuňte levý kryt rovně doleva."
 ],
 [
  "Obere M3x10 mit 2,5-mm-Innensechskant lösen und linke Abdeckung abnehmen. Frühe Drucker können zwei M3x10bT haben; beide mit T10 entfernen.",
  "Die ursprünglichen oberen und unteren M3x10bT mit T10 einzeln entfernen und aufbewahren. Erst nach beiden Schrauben die linke Abdeckung gerade nach links abnehmen."
 ],
 [
  "カバーの下側を先に掛けます",
  "カバーを元の位置へ戻します"
 ],
 [
  "元のネジで固定します（通常はM3×10、初期型は取り外した2本のM3×10bT）",
  "上と下の元のM3x10bTをT10で1本ずつ戻して固定します"
 ],
 [
  "Hook the cover bottom first",
  "Refit the cover"
 ],
 [
  "Refit the original fasteners: normally M3×10, or the two removed M3×10bT on early covers.",
  "Use T10 to refit the original upper and lower M3x10bT screws one at a time."
 ],
 [
  "Zahákněte spodek krytu",
  "Vraťte kryt na místo"
 ],
 [
  "Vraťte původní šrouby: obvykle M3×10, u raných krytů dva sejmuté M3×10bT.",
  "T10 postupně upevněte původní horní a dolní M3x10bT."
 ],
 [
  "Abdeckung unten einhaken",
  "Abdeckung einsetzen"
 ],
 [
  "Originalschrauben einsetzen: normalerweise M3×10, bei frühen Abdeckungen die zwei entfernten M3×10bT.",
  "Die ursprünglichen oberen und unteren M3x10bT mit T10 einzeln befestigen."
 ],
 [
  "M3×10を外します。カバーを外側へ開き、下側の掛かりを抜きます。",
  "T10で上と下の元のM3x10bTを1本ずつ外して保管します。2本とも外してから、カバーを左へまっすぐ外します。"
 ],
 [
  "Remove the M3×10. Open the cover outward and release its lower hook.",
  "Use T10 to remove and retain the original upper and lower M3x10bT screws one at a time. Remove both before sliding the cover straight to the left."
 ],
 [
  "Vyšroubujte M3×10. Kryt odklopte ven a uvolněte spodní háček.",
  "T10 postupně vyšroubujte a uschovejte původní horní a dolní M3x10bT. Po vyjmutí obou šroubů vysuňte kryt rovně doleva."
 ],
 [
  "M3×10 entfernen. Abdeckung nach außen öffnen und unten aushaken.",
  "Die ursprünglichen oberen und unteren M3x10bT mit T10 einzeln entfernen und aufbewahren. Erst danach die Abdeckung gerade nach links abnehmen."
 ],
 [
  "下側を先に掛けます。Nextruder側へ閉じ、M3×10で固定します。",
  "カバーを元の位置へ戻します。Nextruder側へ閉じ、上と下の元のM3x10bTをT10で1本ずつ戻して固定します。"
 ],
 [
  "Hook the bottom first, close toward the Nextruder and secure with M3×10.",
  "Refit the cover, close toward the Nextruder and use T10 to refit the original upper and lower M3x10bT screws one at a time."
 ],
 [
  "Nejprve zahákněte spodní část, kryt přitlačte k Nextruderu a zajistěte M3×10.",
  "Vraťte kryt, přitlačte jej k Nextruderu a T10 postupně upevněte původní horní a dolní M3x10bT."
 ],
 [
  "Unten einhaken, zum Nextruder schließen und mit M3×10 befestigen.",
  "Abdeckung einsetzen, zum Nextruder schließen und die ursprünglichen oberen und unteren M3x10bT mit T10 einzeln befestigen."
 ],
 [
  "元のねじを外して左カバーを開きます。",
  "T10で上と下の元のM3x10bTを1本ずつ外して保管します。2本とも外してから、左カバーを左へまっすぐ外します。"
 ],
 [
  "Remove the original screw and open the left cover.",
  "Use T10 to remove and retain the original upper and lower M3x10bT screws one at a time. Remove both before sliding the left cover straight to the left."
 ],
 [
  "Vyjměte původní šroub a otevřete levý kryt.",
  "T10 postupně vyšroubujte a uschovejte původní horní a dolní M3x10bT. Po vyjmutí obou šroubů vysuňte levý kryt rovně doleva."
 ],
 [
  "Ursprüngliche Schraube entfernen und linke Abdeckung öffnen.",
  "Die ursprünglichen oberen und unteren M3x10bT mit T10 einzeln entfernen und aufbewahren. Erst danach die linke Abdeckung gerade nach links abnehmen."
 ],
 [
  "左カバーの下側を掛けて閉じ、元のねじで固定します。",
  "左カバーを元の位置へ戻し、上と下の元のM3x10bTをT10で1本ずつ戻して固定します。"
 ],
 [
  "Hook the lower edge of the left cover, close it and secure its original screw.",
  "Refit the left cover and use T10 to refit the original upper and lower M3x10bT screws one at a time."
 ],
 [
  "Zahákněte dolní okraj levého krytu, zavřete jej a zajistěte původním šroubem.",
  "Vraťte levý kryt a T10 postupně upevněte původní horní a dolní M3x10bT."
 ],
 [
  "Linke Abdeckung unten einhaken, schließen und mit der ursprünglichen Schraube sichern.",
  "Linke Abdeckung einsetzen und die ursprünglichen oberen und unteren M3x10bT mit T10 einzeln befestigen."
 ]
];

export function leftCoverAction(s){if(!s?.refs?.includes(858))return null;const k=s.action||s.id;return ['cover-out','lb-cover-out'].includes(k)?'out':['cover-in','lb-cover-in'].includes(k)?'in':null;}
export function coverStateBefore(task,index){const events=task.steps.map((s,i)=>({i,k:leftCoverAction(s)})).filter(e=>e.k);let mounted=events[0]?.k!=='in';for(const e of events)if(e.i<index)mounted=e.k==='in';return mounted;}
export function coverInstruction(s,mode){if(mode!=='early'||!leftCoverAction(s))return s.body;return s.body.map(str=>[...DIFFERENCES].sort((a,b)=>b[0].length-a[0].length).reduce((v,[a,b])=>v.replace(a,b),str));}
