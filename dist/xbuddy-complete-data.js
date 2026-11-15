import {XBUDDY_TASK} from './xbuddy-service-data.js';
import {XBUDDY_COMPLETE_SOURCE as S} from './xbuddy-complete-source.js';
const additions={
 3:['カーペットや、ウール・一部の化学繊維の服は帯電しやすいため、綿の服が適しています。','Carpets, wool and some synthetic fabrics accumulate static; cotton clothing is preferable.','Koberce, vlna a některé syntetické tkaniny hromadí statický náboj; vhodnější je bavlněný oděv.','Teppiche, Wolle und manche Kunstfasern laden sich statisch auf; Baumwollkleidung ist geeigneter.'],
 10:['外した端子は基板から離してよけます。','Park the disconnected plugs clear of the board.','Odpojené konektory odložte mimo desku.','Abgezogene Stecker von der Platine weg ablegen.'],
 17:['貼り付け面は汚れや油分を取り除いておきます。','Clean and degrease the pad locations before application.','Plochy pro podložky před nalepením očistěte a odmastěte.','Auflageflächen vor dem Aufkleben reinigen und entfetten.'],
 25:['締め付けには2.5 mm六角レンチを使います。','Use the 2.5 mm Allen key to tighten the screw.','Šroub dotáhněte 2,5mm imbusovým klíčem.','Schraube mit dem 2,5-mm-Inbusschlüssel festziehen.'],
 26:["Power Panicを右下の端子へ差し、余りを側面へ沿わせます。Z軸ケーブルを下から上へ通し、ZRポートに接続します。ZLポートにも接続できます。公式写真はZLへの接続例です。","Connect Power Panic at the lower right and route its slack along the side. Bring the Z-axis cable up from below and connect it to ZR. ZL can also be used; the official photo shows ZL.","Power Panic připojte vpravo dole a přebytek veďte po straně. Kabel osy Z veďte zdola nahoru a zapojte do portu ZR. Lze použít i ZL, který je zobrazen na oficiální fotografii.","Power Panic unten rechts einstecken und Rest seitlich führen. Das Z-Kabel von unten nach oben führen und an ZR anschließen. ZL kann ebenfalls verwendet werden; das offizielle Foto zeigt ZL."],
 32:["NFCアンテナを接続し、ケーブルをEthernet端子とPSU配線の間へ通します。下部のNFCカバーを戻し、ケーブルを挟まず2本のM3×10ネジで固定します。金属製のxBuddyカバーは曲がった側を先に入れ、配線を挟まず6本のM3×4bTネジで固定します。","Reconnect the NFC antenna and route its lead between the Ethernet connector and PSU cables. Refit the lower NFC cover without trapping the lead and secure it with two M3×10 screws. Insert the bent edge of the metal xBuddy cover first, then secure it with six M3×4bT screws without trapping any wires.","Připojte anténu NFC a její kabel veďte mezi ethernetovým konektorem a napájecími vodiči. Nasaďte spodní kryt NFC bez skřípnutí kabelu a upevněte jej dvěma šrouby M3×10. Kovový kryt xBuddy vložte nejprve zahnutou hranou a upevněte šesti šrouby M3×4bT, aniž byste skřípli vodiče.","Die NFC-Antenne anschließen und ihre Leitung zwischen Ethernet-Anschluss und Netzteilleitungen führen. Die untere NFC-Abdeckung ohne eingeklemmte Leitung einsetzen und mit zwei M3×10-Schrauben befestigen. Die Metallabdeckung des xBuddy mit der gebogenen Kante zuerst einsetzen und mit sechs M3×4bT-Schrauben befestigen, ohne Leitungen einzuklemmen."]
};
const preparation=[
 'ドアを閉じ、画面のフィラメントメニューからアンロードします。スプールを外し、冷却を選んでノズルとベッドが室温になるまで待ちます。',
 'Close the door and unload the filament from the Filament menu. Remove the spool, choose Cooldown and wait until the nozzle and bed reach room temperature.',
 'Zavřete dveře a z nabídky Filament vysuňte filament. Sundejte cívku, zvolte Cooldown a počkejte, až tryska i podložka vychladnou na pokojovou teplotu.',
 'Tür schließen und das Filament über das Filamentmenü entladen. Spule abnehmen, Cooldown wählen und warten, bis Düse und Heizbett Raumtemperatur erreicht haben.'
];
export function createXBuddyCompleteTask(){
 const t=structuredClone(XBUDDY_TASK);t.revision=3;t.source=S.url;t.pdf=S.pdf;t.privateCandidate=true;
 if(t.steps.length!==34||S.steps.length!==34)throw Error('Exact official34-step mapping required');
 const refs={xbMmu:'xbCompleteMmu',xbExtensionEnd:'xbExtensionRedPlug',xbPanic:'xbCompletePanic',xbMain:'xbCompleteMain',xbLcd:'xbCompleteLcd',xbBedTemp:'xbBedTempLead',xbDoor:'xbDoorLead',xbX:'xbCompleteX',xbY:'xbCompleteY'};
 t.steps.forEach((s,i)=>{const p=S.steps[i];Object.assign(s,{number:i+1,officialStep:i+1,officialWebStep:i+2,officialId:p.id,source:p.source,page:p.pdfPage,refs:s.refs.map(k=>refs[k]??k)});if(i===25||i===31)s.body=[...additions[i+1]];else if(additions[i+1])s.body=s.body.map((b,k)=>b+' '+additions[i+1][k]);});
 t.steps[31].restorationDerived=S.steps[31].restorationDerived;
 t.steps[31].supplementalSources=S.steps[31].restorationDerived.sourceSteps.map((url,i)=>({url,label:[`関連する公式組み立て手順 ${i+1}（英語）`,`Related official assembly step ${i+1} (English)`,`Související oficiální montážní krok ${i+1} (anglicky)`,`Zugehöriger offizieller Montageschritt ${i+1} (Englisch)`]}));
 t.steps[3].firmwareActions=['unload','cooldown'];t.steps[3].body=[...preparation];
 t.steps[4].firmwareActions=['moveZ'];
 t.steps[33].firmwareActions=['selftest'];
 return t;
}
