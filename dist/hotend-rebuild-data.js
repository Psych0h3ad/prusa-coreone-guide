import{HOTEND_REBUILD_SOURCE}from'./hotend-rebuild-source.js';
const CONTENT={
  "id": "hotend-rebuild",
  "revision": 1,
  "category": 1,
  "hotendRebuild": true,
  "title": [
    "標準ホットエンドを組み直す",
    "Rebuild the standard hotend",
    "Přestavba standardního hotendu",
    "Standard-Hotend neu aufbauen"
  ],
  "interval": [
    "分解整備・組み直しが必要なとき",
    "When disassembly and rebuilding are needed",
    "Při potřebě rozebrání a opětovné montáže",
    "Bei erforderlichem Zerlegen und Wiederaufbau"
  ],
  "source": "https://help.prusa3d.com/guide/how-to-rebuild-the-nextruder-hotend_1080488",
  "steps": [
    {
      "title": [
        "標準ホットエンドを組み直す",
        "Rebuild the standard hotend",
        "Přestavba standardního hotendu",
        "Standard-Hotend neu aufbauen"
      ],
      "body": [
        "標準Nextruderのホットエンドを分解し、ヒーター・ノズル側サーミスター・Prusa Nozzleを組み直します。取り外しから再取付けまで順に進めてください。写真のリベット式トップカバーとホットエンドが実機に合うことを確認します。HT Hotend・V6アダプターは専用の手順を使ってください。",
        "Rebuild the standard Nextruder hotend: heater, hotend thermistor and Prusa Nozzle. Follow the removal and refitting stages in this guide. Check that the pictured riveted top cover and hotend match your printer. Use the dedicated procedure for an HT Hotend or V6 adapter.",
        "Znovu sestavíte standardní hotend Nextruder: topení, termistor hotendu a Prusa Nozzle. Demontáž i montáž proveďte podle kroků tohoto návodu. Ověřte, že nýtovaný horní kryt a hotend na fotografiích odpovídají vaší tiskárně. Pro HT Hotend nebo adaptér V6 použijte příslušný návod.",
        "Das Standard-Nextruder-Hotend mit Heizpatrone, Hotend-Thermistor und Prusa Nozzle neu zusammenbauen. Ausbau und Wiedereinbau folgen hier Schritt für Schritt. Prüfen, ob genieteter Deckel und Hotend auf den Fotos zum Drucker passen. Für HT Hotend oder V6-Adapter die jeweilige Anleitung verwenden."
      ],
      "refs": [
        "hotend"
      ],
      "id": "rebuild-1089542",
      "officialId": 1089542,
      "officialStep": 2,
      "number": 1,
      "source": "https://help.prusa3d.com/guide/how-to-rebuild-the-nextruder-hotend_1080488#1089542",
      "wrapperOfficialId": 1089542,
      "wrapperSource": "https://help.prusa3d.com/guide/how-to-rebuild-the-nextruder-hotend_1080488#1089542",
      "sourceLineIds": [
        1089543,
        1089544,
        1089545
      ],
      "componentAccessIndex": 0
    },
    {
      "title": [
        "工具と保護材を用意する",
        "Prepare tools and protection",
        "Příprava nářadí a ochrany",
        "Werkzeuge und Schutz bereitlegen"
      ],
      "body": [
        "T6トルクス、13–16レンチ、7 mmの切り欠きがあるユニバーサルレンチを用意します。取り外し用の2.5 mm六角レンチ、初期カバー用のT10、ベッドを覆う厚い布も使います。ノズルの指定締付トルクは1.5 Nm（13.3 lb-in）です。対応するトルクレンチの使用が推奨されています。ソックの有無は下の選択で実機に合わせます。",
        "Prepare T6 Torx, a 13–16 wrench and a universal wrench with a 7 mm opening. Access also needs a 2.5 mm hex key, T10 for an early cover and thick bed-protection fabric. Nozzle torque is 1.5 Nm (13.3 lb-in); a suitable torque wrench is recommended. Set the sock choice below to match your hotend.",
        "Připravte Torx T6, klíč 13–16 a univerzální klíč s otvorem 7 mm. K vyjmutí potřebujete také imbus 2,5 mm, T10 pro raný kryt a silnou ochrannou látku na podložku. Tryska se utahuje na 1,5 Nm (13.3 lb-in); doporučen je vhodný momentový klíč. Volbu návleku níže nastavte podle hotendu.",
        "Torx T6, 13–16-Schlüssel und Universalschlüssel mit 7-mm-Öffnung vorbereiten. Für den Zugang außerdem 2,5-mm-Innensechskant, T10 beim frühen Deckel und dicken Heizbettschutz bereitlegen. Das Düsen-Drehmoment beträgt 1,5 Nm (13.3 lb-in); ein geeigneter Drehmomentschlüssel wird empfohlen. Unten den tatsächlich verwendeten Sockentyp wählen."
      ],
      "refs": [
        "hotend"
      ],
      "id": "rebuild-1089574",
      "officialId": 1089574,
      "officialStep": 3,
      "number": 2,
      "source": "https://help.prusa3d.com/guide/how-to-rebuild-the-nextruder-hotend_1080488#1089574",
      "wrapperOfficialId": 1089574,
      "wrapperSource": "https://help.prusa3d.com/guide/how-to-rebuild-the-nextruder-hotend_1080488#1089574",
      "sourceLineIds": [
        1089575,
        1089592,
        1089593
      ],
      "componentAccessIndex": 1
    },
    {
      "title": [
        "フィラメントを抜き、冷却する",
        "Unload and cool down",
        "Vyjmutí filamentu a chlazení",
        "Entladen und abkühlen"
      ],
      "body": [
        "ドアを閉じてアンロードし、スプールを外します。COOLDOWNで室温まで冷まします。",
        "Close the door, unload, remove the spool and cool to ambient.",
        "Zavřete dveře, vysuňte filament, sejměte cívku a nechte vychladnout.",
        "Tür schließen, Filament entladen, Spule entfernen und auf Raumtemperatur abkühlen."
      ],
      "refs": [
        "lcd"
      ],
      "firmwareActions": [
        "unload",
        "cooldown"
      ],
      "number": 3,
      "page": 5,
      "id": "rebuild-385914",
      "officialId": 385914,
      "officialStep": 4,
      "source": "https://help.prusa3d.com/guide/how-to-replace-a-hotend-assembly-core-one_385707#385914",
      "wrapperOfficialId": 1089608,
      "wrapperSource": "https://help.prusa3d.com/guide/how-to-rebuild-the-nextruder-hotend_1080488#1089608",
      "sourceLineIds": [
        826008,
        825954,
        825955,
        825956,
        826400,
        828805
      ],
      "componentAccessIndex": 2
    },
    {
      "title": [
        "ベッドを下げ、電源を外す",
        "Lower the bed and unplug",
        "Snížení podložky a odpojení",
        "Heizbett absenken und Netzstecker ziehen"
      ],
      "body": [
        "Control → Move Axis → Move Zを100 mm以上にします。ベッドが下がって停止してから背面スイッチを切り、電源コードを抜きます。",
        "Set Control → Move Axis → Move Z to at least 100 mm. Wait for the bed to stop, then switch off at the rear and unplug.",
        "Nastavte Control → Move Axis → Move Z alespoň na 100 mm. Počkejte na zastavení podložky, pak vypněte zadní vypínač a odpojte napájení.",
        "Control → Move Axis → Move Z auf mindestens 100 mm stellen. Stillstand des Heizbetts abwarten, dann hinten ausschalten und Netzstecker ziehen."
      ],
      "refs": [
        "heatbed",
        "psu"
      ],
      "firmwareActions": [
        "moveZ"
      ],
      "number": 4,
      "page": 6,
      "id": "rebuild-385766",
      "officialId": 385766,
      "officialStep": 5,
      "source": "https://help.prusa3d.com/guide/how-to-replace-a-hotend-assembly-core-one_385707#385766",
      "wrapperOfficialId": 1089608,
      "wrapperSource": "https://help.prusa3d.com/guide/how-to-rebuild-the-nextruder-hotend_1080488#1089608",
      "sourceLineIds": [
        385808,
        385784,
        825984,
        825985
      ],
      "componentAccessIndex": 3
    },
    {
      "title": [
        "トップカバーを外す",
        "Remove the top cover",
        "Sejmutí horního krytu",
        "Obere Abdeckung abnehmen"
      ],
      "body": [
        "内側からナイロンリベットを押し出し、カバーを外します。",
        "Release the nylon rivets from inside and lift off the cover.",
        "Zevnitř uvolněte nylonové nýty a sejměte kryt.",
        "Nylonnieten von innen lösen und Abdeckung abheben."
      ],
      "refs": [
        "top"
      ],
      "action": "top-out",
      "number": 5,
      "page": 6,
      "id": "rebuild-385816",
      "officialId": 385816,
      "officialStep": 6,
      "source": "https://help.prusa3d.com/guide/how-to-replace-a-hotend-assembly-core-one_385707#385816",
      "wrapperOfficialId": 1089608,
      "wrapperSource": "https://help.prusa3d.com/guide/how-to-rebuild-the-nextruder-hotend_1080488#1089608",
      "sourceLineIds": [
        826020,
        826021,
        826022,
        826046
      ],
      "componentAccessIndex": 4
    },
    {
      "title": [
        "ベッドを保護する",
        "Protect the bed",
        "Ochrana podložky",
        "Heizbett schützen"
      ],
      "body": [
        "厚みのある布などでベッドを覆います。",
        "Cover the bed with protective fabric.",
        "Podložku překryjte ochrannou látkou.",
        "Heizbett mit schützendem Stoff abdecken."
      ],
      "refs": [
        "heatbed"
      ],
      "number": 6,
      "page": 7,
      "id": "rebuild-385976",
      "officialId": 385976,
      "officialStep": 7,
      "source": "https://help.prusa3d.com/guide/how-to-replace-a-hotend-assembly-core-one_385707#385976",
      "wrapperOfficialId": 1089608,
      "wrapperSource": "https://help.prusa3d.com/guide/how-to-rebuild-the-nextruder-hotend_1080488#1089608",
      "sourceLineIds": [
        826063,
        826064
      ],
      "componentAccessIndex": 5
    },
    {
      "title": [
        "左カバーを外す",
        "Remove the left cover",
        "Sejmutí levého krytu",
        "Linke Abdeckung abnehmen"
      ],
      "body": [
        "上側のM3x10を2.5 mm六角レンチで外し、左カバーを外します。初期型はM3x10bTが2本の場合があるため、T10で両方を外します。実機のネジを公式写真と照合してください。",
        "Remove the upper M3x10 with a 2.5 mm hex key, then the left cover. Early printers may have two M3x10bT screws; remove both with T10. Match the actual screws to the official photos.",
        "Vyjměte horní M3x10 pomocí 2,5mm imbusu a sejměte levý kryt. Rané tiskárny mohou mít dva M3x10bT; oba vyjměte pomocí T10. Šrouby porovnejte s oficiálními fotografiemi.",
        "Obere M3x10 mit 2,5-mm-Innensechskant lösen und linke Abdeckung abnehmen. Frühe Drucker können zwei M3x10bT haben; beide mit T10 entfernen. Schrauben mit den offiziellen Fotos vergleichen."
      ],
      "refs": [
        858
      ],
      "action": "cover-out",
      "number": 7,
      "page": 7,
      "id": "rebuild-386026",
      "officialId": 386026,
      "officialStep": 8,
      "source": "https://help.prusa3d.com/guide/how-to-replace-a-hotend-assembly-core-one_385707#386026",
      "wrapperOfficialId": 1089608,
      "wrapperSource": "https://help.prusa3d.com/guide/how-to-rebuild-the-nextruder-hotend_1080488#1089608",
      "sourceLineIds": [
        386046,
        386054,
        826080
      ],
      "componentAccessIndex": 6
    },
    {
      "title": [
        "ヒーターとサーミスターを抜く",
        "Disconnect heater and thermistor",
        "Odpojení topení a termistoru",
        "Heizung und Thermistor abstecken"
      ],
      "body": [
        "ラッチを押してヒーター、サーミスターの順に抜きます。端子や細い配線を引っ張らないでください。",
        "Release the latches; unplug the heater, then the thermistor. Do not pull on terminals or thin wires.",
        "Uvolněte západky; odpojte topení a potom termistor. Netahejte za kontakty ani tenké vodiče.",
        "Verriegelungen lösen; Heizung, dann Thermistor abziehen. Nicht an Kontakten oder dünnen Leitungen ziehen."
      ],
      "refs": [
        "loveBoard",
        857
      ],
      "action": "unplug",
      "number": 8,
      "page": 8,
      "id": "rebuild-386062",
      "officialId": 386062,
      "officialStep": 9,
      "source": "https://help.prusa3d.com/guide/how-to-replace-a-hotend-assembly-core-one_385707#386062",
      "wrapperOfficialId": 1089608,
      "wrapperSource": "https://help.prusa3d.com/guide/how-to-rebuild-the-nextruder-hotend_1080488#1089608",
      "sourceLineIds": [
        386073,
        826090,
        826091
      ],
      "componentAccessIndex": 7
    },
    {
      "title": [
        "ホットエンドを引き抜く",
        "Withdraw the hotend",
        "Vyjmutí hotendu",
        "Hotend herausziehen"
      ],
      "body": [
        "ケーブルをガイドから外します。落下しないようホットエンドを片手で支え、もう片方の手でつまみネジ2本を数回転緩めます。ネジは抜き切りません。ホットエンドを下へ引き抜きます。",
        "Free the cables from the guide. Hold the hotend to prevent it falling; loosen both thumbscrews a few turns with the other hand. Leave the screws in place and withdraw the hotend downward.",
        "Uvolněte kabely z vedení. Hotend držte proti pádu a druhou rukou povolte oba ruční šrouby o několik otáček. Šrouby nevyjímejte; hotend vytáhněte dolů.",
        "Kabel aus der Führung nehmen. Hotend gegen Herabfallen halten und beide Rändelschrauben mit der anderen Hand einige Umdrehungen lösen. Schrauben nicht ganz herausdrehen; Hotend nach unten herausziehen."
      ],
      "refs": [
        "hotend",
        795,
        807
      ],
      "action": "hotend-out",
      "number": 9,
      "page": 8,
      "id": "rebuild-386113",
      "officialId": 386113,
      "officialStep": 10,
      "source": "https://help.prusa3d.com/guide/how-to-replace-a-hotend-assembly-core-one_385707#386113",
      "wrapperOfficialId": 1089608,
      "wrapperSource": "https://help.prusa3d.com/guide/how-to-rebuild-the-nextruder-hotend_1080488#1089608",
      "sourceLineIds": [
        386123,
        386131,
        386139,
        826111,
        386147
      ],
      "componentAccessIndex": 8
    },
    {
      "title": [
        "ソックを外し、ノズルを抜く",
        "Remove the sock and nozzle",
        "Sejmutí návleku a trysky",
        "Socke und Düse entfernen"
      ],
      "body": [
        "完全に冷え、電源を外したホットエンドで作業します。ソックを使用している場合は外します。13–16レンチでブロックを支え、ユニバーサルレンチの7 mm部分でノズルを緩めます。緩んだら手で最後まで回して抜き取ります。",
        "Work on the cooled, unplugged hotend. Remove the sock if fitted. Hold the block with the 13–16 wrench and loosen the nozzle using the universal wrench’s 7 mm opening. Once loose, unscrew it by hand and withdraw it completely.",
        "Pracujte se studeným hotendem při odpojeném napájení. Použitý návlek sejměte. Blok přidržte klíčem 13–16 a trysku povolte 7mm otvorem univerzálního klíče. Poté ji rukou vyšroubujte a zcela vytáhněte.",
        "Am kalten Hotend bei getrenntem Netzanschluss arbeiten. Vorhandene Socke abziehen. Block mit dem 13–16-Schlüssel halten und die Düse mit der 7-mm-Öffnung des Universalschlüssels lösen. Danach von Hand ganz herausschrauben und herausziehen."
      ],
      "refs": [
        "heaterServiceBlock",
        "heaterServiceCartridge",
        "heaterServiceThermistor",
        "heaterServiceScrew1",
        "heaterServiceScrew2",
        "thermistorServiceScrew",
        "serviceNozzle",
        "serviceSock"
      ],
      "rebuildMode": "nozzle-out",
      "id": "rebuild-1089833",
      "officialId": 1089833,
      "officialStep": 5,
      "number": 10,
      "source": "https://help.prusa3d.com/guide/how-to-rebuild-the-nextruder-hotend_1080488#1089833",
      "wrapperOfficialId": 1089833,
      "wrapperSource": "https://help.prusa3d.com/guide/how-to-rebuild-the-nextruder-hotend_1080488#1089833",
      "sourceLineIds": [
        1089834,
        1089835,
        1089836,
        1089837
      ],
      "componentAccessIndex": 9
    },
    {
      "title": [
        "ヒーター・サーミスター・ねじ3本を外す",
        "Remove both cartridges and all three screws",
        "Vyjmutí obou vložek a tří šroubů",
        "Beide Einsätze und drei Schrauben ausbauen"
      ],
      "body": [
        "T6で3本のM3x4止めねじを緩め、ヒーターとノズル側サーミスターをブロックから抜きます。細い配線は切れやすいので、ごく軽く扱ってください。固着している場合は、反対側から六角レンチで押し出します。最後に止めねじ3本を取り外します。",
        "Loosen all three M3x4 grub screws with T6 and withdraw the heater and hotend thermistor. Handle their thin leads very gently; pulling hard can break them. If stuck, push from the opposite side with a hex key. Remove all three loosened screws.",
        "Klíčem T6 povolte všechny tři stavěcí šrouby M3x4 a vyjměte topení i termistor hotendu. Tenké vodiče berte velmi jemně, silný tah je může přetrhnout. Uvízlý díl vytlačte imbusem z protější strany. Nakonec vyjměte všechny tři povolené šrouby.",
        "Alle drei M3x4-Madenschrauben mit T6 lösen und Heizpatrone sowie Hotend-Thermistor herausziehen. Dünne Leitungen sehr vorsichtig behandeln; starker Zug kann sie abreißen. Festsitzende Teile von der Gegenseite mit einem Innensechskantschlüssel herausdrücken. Danach alle drei gelösten Schrauben entfernen."
      ],
      "refs": [
        "heaterServiceBlock",
        "heaterServiceCartridge",
        "heaterServiceThermistor",
        "heaterServiceScrew1",
        "heaterServiceScrew2",
        "thermistorServiceScrew",
        "serviceNozzle",
        "serviceSock"
      ],
      "rebuildMode": "parts-out",
      "id": "rebuild-1089640",
      "officialId": 1089640,
      "officialStep": 6,
      "number": 11,
      "source": "https://help.prusa3d.com/guide/how-to-rebuild-the-nextruder-hotend_1080488#1089640",
      "wrapperOfficialId": 1089640,
      "wrapperSource": "https://help.prusa3d.com/guide/how-to-rebuild-the-nextruder-hotend_1080488#1089640",
      "sourceLineIds": [
        1089649,
        1089650,
        1089651,
        1089652
      ],
      "componentAccessIndex": 9
    },
    {
      "title": [
        "組立部品を確認する",
        "Check the rebuild parts",
        "Kontrola dílů pro montáž",
        "Montageteile prüfen"
      ],
      "body": [
        "ヒーターブロック1個、M3x4止めねじ3本、ヒーター1個、ノズル側サーミスター1個、Prusa Nozzleを用意します。ここで使うサーミスターはヒーターブロック中央穴に入るノズル側のセンサーです。ヒートシンク側のNTCへ置き換えないでください。",
        "Prepare one heater block, three M3x4 grub screws, one heater, one hotend thermistor and a Prusa Nozzle. This sensor belongs in the block’s middle bore; do not substitute the separate heatsink NTC.",
        "Připravte topný blok, tři stavěcí šrouby M3x4, jedno topení, jeden termistor hotendu a Prusa Nozzle. Tento senzor patří do prostředního otvoru topného bloku; nezaměňte jej za samostatný NTC chladiče.",
        "Einen Heizblock, drei M3x4-Madenschrauben, eine Heizpatrone, einen Hotend-Thermistor und eine Prusa Nozzle bereitlegen. Dieser Sensor gehört in die mittlere Blockbohrung; nicht durch den separaten Kühlkörper-NTC ersetzen."
      ],
      "refs": [
        "heaterServiceBlock",
        "heaterServiceCartridge",
        "heaterServiceThermistor",
        "heaterServiceScrew1",
        "heaterServiceScrew2",
        "thermistorServiceScrew",
        "serviceNozzle",
        "serviceSock"
      ],
      "rebuildMode": "parts-ready",
      "id": "rebuild-1090448",
      "officialId": 1090448,
      "officialStep": 7,
      "number": 12,
      "source": "https://help.prusa3d.com/guide/how-to-rebuild-the-nextruder-hotend_1080488#1090448",
      "wrapperOfficialId": 1090448,
      "wrapperSource": "https://help.prusa3d.com/guide/how-to-rebuild-the-nextruder-hotend_1080488#1090448",
      "sourceLineIds": [
        1090449,
        1090450,
        1090451,
        1090482,
        1090483,
        1090484
      ],
      "componentAccessIndex": 9
    },
    {
      "title": [
        "ねじを仮入れし、両カートリッジを固定する",
        "Start screws, insert and secure both cartridges",
        "Nasazení šroubů a obou vložek",
        "Schrauben ansetzen und beide Einsätze befestigen"
      ],
      "body": [
        "M3x4ねじ3本をT6で数回転だけ入れます。ヒーターとサーミスターをそれぞれの穴へ入れ、ヒーターの下端をブロック底面とそろえます。両方の位置を支えたまま3本をやさしく締めます。締め過ぎないでください。",
        "Start all three M3x4 screws a few turns with T6. Insert the heater and thermistor into their respective bores and align the heater’s bottom with the block bottom. Hold both in position while gently tightening the three screws; do not overtighten.",
        "Všechny tři M3x4 zašroubujte T6 jen o několik otáček. Topení a termistor vložte do příslušných otvorů a spodní konec topení srovnejte se spodkem bloku. Oba díly přidržujte při jemném dotažení tří šroubů; nepřetahujte.",
        "Alle drei M3x4 mit T6 nur einige Umdrehungen ansetzen. Heizpatrone und Thermistor in ihre Bohrungen einsetzen; das Heizpatronenende an der Blockunterseite ausrichten. Beide Teile halten und die drei Schrauben vorsichtig anziehen, nicht überdrehen."
      ],
      "refs": [
        "heaterServiceBlock",
        "heaterServiceCartridge",
        "heaterServiceThermistor",
        "heaterServiceScrew1",
        "heaterServiceScrew2",
        "thermistorServiceScrew",
        "serviceNozzle",
        "serviceSock"
      ],
      "rebuildMode": "parts-in",
      "id": "rebuild-1089696",
      "officialId": 1089696,
      "officialStep": 8,
      "number": 13,
      "source": "https://help.prusa3d.com/guide/how-to-rebuild-the-nextruder-hotend_1080488#1089696",
      "wrapperOfficialId": 1089696,
      "wrapperSource": "https://help.prusa3d.com/guide/how-to-rebuild-the-nextruder-hotend_1080488#1089696",
      "sourceLineIds": [
        1089697,
        1090438,
        1089698
      ],
      "componentAccessIndex": 9
    },
    {
      "title": [
        "ノズルを接触まで入れ、指定トルクで締める",
        "Seat the nozzle and tighten to specification",
        "Usazení a předepsané dotažení trysky",
        "Düse einsetzen und vorgeschrieben anziehen"
      ],
      "body": [
        "ノズルをブロック面に接触するまでねじ込みます。13–16レンチでブロックを支え、7 mm部分のレンチで締めます。指定は1.5 Nm（13.3 lb-in）で、トルクレンチが推奨されています。余分な力を加えないでください。ソックを使う場合は戻します。",
        "Screw the nozzle fully in until it contacts the block face. Support the block with the 13–16 wrench and tighten with the 7 mm wrench opening. Use the specified 1.5 Nm (13.3 lb-in), preferably with a torque wrench, without extra force. Refit the sock if used.",
        "Trysku zašroubujte až ke styku s čelem bloku. Blok přidržte klíčem 13–16 a utáhněte 7mm otvorem klíče na předepsaných 1,5 Nm (13.3 lb-in), nejlépe momentovým klíčem. Nepřidávejte další sílu. Používaný návlek vraťte.",
        "Düse bis zum Kontakt mit der Blockfläche einschrauben. Block mit 13–16 halten und mit der 7-mm-Öffnung auf die vorgeschriebenen 1,5 Nm (13.3 lb-in) anziehen, möglichst mit Drehmomentschlüssel. Keine zusätzliche Kraft anwenden. Verwendete Socke wieder aufziehen."
      ],
      "refs": [
        "heaterServiceBlock",
        "heaterServiceCartridge",
        "heaterServiceThermistor",
        "heaterServiceScrew1",
        "heaterServiceScrew2",
        "thermistorServiceScrew",
        "serviceNozzle",
        "serviceSock"
      ],
      "rebuildMode": "nozzle-in",
      "id": "rebuild-1089882",
      "officialId": 1089882,
      "officialStep": 9,
      "number": 14,
      "source": "https://help.prusa3d.com/guide/how-to-rebuild-the-nextruder-hotend_1080488#1089882",
      "wrapperOfficialId": 1089882,
      "wrapperSource": "https://help.prusa3d.com/guide/how-to-rebuild-the-nextruder-hotend_1080488#1089882",
      "sourceLineIds": [
        1089883,
        1089884,
        1089885,
        1089886,
        1089887,
        1089888
      ],
      "componentAccessIndex": 9
    },
    {
      "title": [
        "ホットエンドを用意する",
        "Prepare the hotend",
        "Příprava hotendu",
        "Hotend bereitlegen"
      ],
      "body": [
        "組み上がったホットエンドを1個用意します。ノズルだけを交換した場合は、今組み直したものを使います。公式ガイドの標準ノズルは0.4 mm HF（CHT）です。装着するノズルの径・流量と、シリコンソックの有無を確認してください。交換後は「ノズル設定を合わせる」で同じ内容を設定します。",
        "Prepare one complete hotend assembly. If you changed only the nozzle, use the assembly you just rebuilt. The official guide specifies a 0.4 mm HF (CHT) nozzle as standard. Check the fitted nozzle diameter and flow type, and whether the silicone sock is fitted. Match these choices in Update nozzle settings after reassembly.",
        "Připravte jeden sestavený hotend. Pokud jste měnili pouze trysku, použijte právě sestavený hotend. Oficiální návod uvádí jako standard trysku 0,4 mm HF (CHT). Zkontrolujte průměr a průtokový typ namontované trysky a přítomnost silikonového návleku. Po montáži stejné údaje zadejte v kroku Nastavení trysky.",
        "Ein vollständiges Hotend bereitlegen. Wurde nur die Düse gewechselt, das gerade wieder zusammengebaute Hotend verwenden. Die offizielle Anleitung nennt eine 0,4-mm-HF-Düse (CHT) als Standard. Durchmesser und Durchflusstyp der eingebauten Düse sowie die Silikonsocke prüfen. Nach dem Einbau diese Angaben im Schritt Düseneinstellungen anpassen übernehmen."
      ],
      "refs": [
        "hotend"
      ],
      "number": 15,
      "page": 9,
      "id": "rebuild-386155",
      "officialId": 386155,
      "officialStep": 11,
      "source": "https://help.prusa3d.com/guide/how-to-replace-a-hotend-assembly-core-one_385707#386155",
      "wrapperOfficialId": 1089736,
      "wrapperSource": "https://help.prusa3d.com/guide/how-to-rebuild-the-nextruder-hotend_1080488#1089736",
      "sourceLineIds": [
        386169,
        386177,
        386185,
        386193,
        386201
      ],
      "componentAccessIndex": 9
    },
    {
      "title": [
        "奥まで押し込み、固定する",
        "Insert fully and secure",
        "Úplné zasunutí a upevnění",
        "Ganz einschieben und sichern"
      ],
      "body": [
        "ケーブルを少し前へ向け、下からヒートシンクの奥まで差します。ホットエンド一式がファンシュラウドのくぼみに適切な隙間を残して収まり、その下へ突き出さないことを公式写真で確認します。上へ押し続けながら両方のつまみネジを締めます。",
        "Angle the cables slightly forward and insert fully into the heatsink from below. Match the photo: the assembly must fit the fan-shroud recess with clearance and must not protrude below the shroud. Keep pushing upward while tightening both thumbscrews.",
        "Kabely natočte mírně dopředu a hotend zasuňte zespodu nadoraz do chladiče. Podle fotografie ověřte usazení ve vybrání krytu ventilátoru s vůlí, bez vyčnívání pod kryt. Při utahování obou ručních šroubů tlačte vzhůru.",
        "Kabel leicht nach vorne richten und Hotend von unten ganz in den Kühlkörper einschieben. Mit dem Foto vergleichen: Die Baugruppe muss mit Spiel in der Aussparung des Lüfterkanals sitzen und darf nicht darunter hervorstehen. Beim Anziehen beider Rändelschrauben weiter nach oben drücken."
      ],
      "refs": [
        "hotend",
        795,
        807
      ],
      "action": "hotend-in",
      "number": 16,
      "page": 10,
      "id": "rebuild-386209",
      "officialId": 386209,
      "officialStep": 12,
      "source": "https://help.prusa3d.com/guide/how-to-replace-a-hotend-assembly-core-one_385707#386209",
      "wrapperOfficialId": 1089736,
      "wrapperSource": "https://help.prusa3d.com/guide/how-to-rebuild-the-nextruder-hotend_1080488#1089736",
      "sourceLineIds": [
        386221,
        386229,
        386237,
        386245,
        826183
      ],
      "componentAccessIndex": 10
    },
    {
      "title": [
        "挿入位置を確認する",
        "Check seating",
        "Kontrola usazení",
        "Sitz prüfen"
      ],
      "body": [
        "完全に室温まで冷え、電源コードを抜いた状態で確認します。このホットエンド一式交換ガイドの写真と見比べ、ヒートシンクの奥まで差し込まれていることを確認します。差し込み直す場合はつまみネジを緩め、ホットエンドを上へ押し続けながら両方を手で締めます。",
        "Check only after cooling fully to room temperature and unplugging the printer. Compare with the photo in this hotend-assembly replacement guide and verify full insertion into the heatsink. To reseat it, loosen the thumbscrews, keep pushing the hotend upward and tighten both by hand.",
        "Kontrolujte až po úplném vychladnutí na pokojovou teplotu a odpojení tiskárny ze zásuvky. Porovnejte polohu s fotografií tohoto návodu na výměnu celé sestavy hotendu a ověřte úplné zasunutí do chladiče. Při opravě polohy povolte ruční šrouby, tlačte hotend vzhůru a oba šrouby utáhněte rukou.",
        "Erst nach vollständigem Abkühlen auf Raumtemperatur und Ziehen des Netzsteckers prüfen. Mit dem Foto dieser Anleitung zum Austausch der Hotend-Baugruppe vergleichen und vollständiges Einschieben in den Kühlkörper prüfen. Zum Korrigieren die Rändelschrauben lösen, das Hotend nach oben drücken und beide von Hand festziehen."
      ],
      "refs": [
        "hotend",
        794
      ],
      "supplementalSources": [
        {
          "label": [
            "挿入位置の接写（この交換手順）",
            "Seating close-up for this procedure",
            "Detail usazení pro tento postup",
            "Detailfoto zum Sitz für dieses Verfahren"
          ],
          "url": "https://help.prusa3d.com/guide/how-to-replace-a-hotend-assembly-core-one_385707#826412"
        }
      ],
      "number": 17,
      "page": 11,
      "source": "https://help.prusa3d.com/guide/how-to-replace-a-hotend-assembly-core-one_385707#826412",
      "id": "rebuild-826412",
      "officialId": 826412,
      "officialStep": 13,
      "wrapperOfficialId": 1089736,
      "wrapperSource": "https://help.prusa3d.com/guide/how-to-rebuild-the-nextruder-hotend_1080488#1089736",
      "sourceLineIds": [
        826413,
        826414,
        826415
      ],
      "componentAccessIndex": 11
    },
    {
      "title": [
        "ケーブルをガイドへ戻す",
        "Route the cables",
        "Vedení kabelů",
        "Kabel führen"
      ],
      "body": [
        "つまみネジの後ろにある樹脂フックの溝へ、サーミスター、ヒーターの順に通します。",
        "Use the channel in the plastic hook behind the thumbscrews: thermistor cable first, then heater cable.",
        "Do drážky plastového háčku za ručními šrouby veďte nejprve kabel termistoru, potom topení.",
        "In der Nut des Kunststoffhakens hinter den Rändelschrauben zuerst das Thermistorkabel, dann das Heizkabel führen."
      ],
      "refs": [
        857,
        "hotend"
      ],
      "action": "route-hotend",
      "number": 18,
      "page": 12,
      "id": "rebuild-386799",
      "officialId": 386799,
      "officialStep": 14,
      "source": "https://help.prusa3d.com/guide/how-to-replace-a-hotend-assembly-core-one_385707#386799",
      "wrapperOfficialId": 1089736,
      "wrapperSource": "https://help.prusa3d.com/guide/how-to-rebuild-the-nextruder-hotend_1080488#1089736",
      "sourceLineIds": [
        386849
      ],
      "componentAccessIndex": 12
    },
    {
      "title": [
        "LoveBoardへ接続する",
        "Reconnect to LoveBoard",
        "Připojení k LoveBoard",
        "Wieder mit LoveBoard verbinden"
      ],
      "body": [
        "サーミスターをLoveBoard左側の一番上のNT端子へ、次にヒーターを基板上部の黒いHEATER端子へ接続します。公式写真と基板表示を照合してください。",
        "Connect the thermistor to NT at the top left of LoveBoard, then the heater to the black HEATER socket at the top. Match the official photo and board labels.",
        "Připojte termistor do NT vlevo nahoře na LoveBoard, potom topení do černého HEATER nahoře. Ověřte podle oficiální fotografie a popisků desky.",
        "Thermistor an NT oben links am LoveBoard anschließen, dann Heizung an die schwarze HEATER-Buchse oben. Mit offiziellem Foto und Platinenbeschriftung abgleichen."
      ],
      "refs": [
        "loveBoard"
      ],
      "action": "plug",
      "number": 19,
      "page": 12,
      "id": "rebuild-386857",
      "officialId": 386857,
      "officialStep": 15,
      "source": "https://help.prusa3d.com/guide/how-to-replace-a-hotend-assembly-core-one_385707#386857",
      "wrapperOfficialId": 1089736,
      "wrapperSource": "https://help.prusa3d.com/guide/how-to-rebuild-the-nextruder-hotend_1080488#1089736",
      "sourceLineIds": [
        826194,
        826195
      ],
      "componentAccessIndex": 13
    },
    {
      "title": [
        "左カバーを戻す",
        "Refit the left cover",
        "Nasazení levého krytu",
        "Linke Abdeckung montieren"
      ],
      "body": [
        "配線がはみ出さないよう内側へ収め、カバーの下側を先に掛けます。Nextruder側へ押し込み、配線を挟んでいないことを確認して元のネジで固定します（通常はM3×10、初期型は取り外した2本のM3×10bT）。ベッドの保護材も外します。",
        "Tuck the wires inside without protruding. Hook the cover bottom first, press toward the Nextruder and check for trapped wires. Refit the original fasteners: normally M3×10, or the two removed M3×10bT on early covers. Remove the bed protection.",
        "Vodiče uložte dovnitř bez vyčnívání. Zahákněte spodek krytu, přitlačte k Nextruderu a ověřte, že kabely nejsou skřípnuté. Vraťte původní šrouby: obvykle M3×10, u raných krytů dva sejmuté M3×10bT. Odstraňte ochranu podložky.",
        "Leitungen ohne Überstand innen verstauen. Abdeckung unten einhaken, zum Nextruder drücken und auf eingeklemmte Kabel prüfen. Originalschrauben einsetzen: normalerweise M3×10, bei frühen Abdeckungen die zwei entfernten M3×10bT. Heizbettschutz entfernen."
      ],
      "refs": [
        858
      ],
      "action": "cover-in",
      "number": 20,
      "page": 13,
      "id": "rebuild-386903",
      "officialId": 386903,
      "officialStep": 16,
      "source": "https://help.prusa3d.com/guide/how-to-replace-a-hotend-assembly-core-one_385707#386903",
      "wrapperOfficialId": 1089736,
      "wrapperSource": "https://help.prusa3d.com/guide/how-to-rebuild-the-nextruder-hotend_1080488#1089736",
      "sourceLineIds": [
        826230,
        826212,
        856372,
        856373,
        826213,
        826238
      ],
      "componentAccessIndex": 14
    },
    {
      "title": [
        "トップカバーを戻す",
        "Refit the top cover",
        "Nasazení horního krytu",
        "Obere Abdeckung montieren"
      ],
      "body": [
        "後ろ右と前の切り欠きを合わせ、指定の2か所をナイロンリベットで固定します。",
        "Align rear-right and front recesses; secure the two specified rivet positions.",
        "Zarovnejte pravý zadní roh a přední výřezy; upevněte dva určené nýty.",
        "Hinten rechts und an den vorderen Aussparungen ausrichten; an den zwei vorgesehenen Nietenstellen sichern."
      ],
      "refs": [
        "top"
      ],
      "action": "top-in",
      "number": 21,
      "page": 14,
      "id": "rebuild-386939",
      "officialId": 386939,
      "officialStep": 17,
      "source": "https://help.prusa3d.com/guide/how-to-replace-a-hotend-assembly-core-one_385707#386939",
      "wrapperOfficialId": 1089736,
      "wrapperSource": "https://help.prusa3d.com/guide/how-to-rebuild-the-nextruder-hotend_1080488#1089736",
      "sourceLineIds": [
        826250,
        826251,
        826252,
        826253
      ],
      "componentAccessIndex": 15
    },
    {
      "title": [
        "電源を戻す",
        "Restore power",
        "Zapnutí napájení",
        "Stromversorgung wiederherstellen"
      ],
      "body": [
        "ドアを閉じ、電源コードを接続して起動します。",
        "Close the door, reconnect power and switch on.",
        "Zavřete dveře, připojte napájení a zapněte tiskárnu.",
        "Tür schließen, Netzstecker anschließen und einschalten."
      ],
      "refs": [
        "lcd"
      ],
      "number": 22,
      "page": 14,
      "id": "rebuild-387603",
      "officialId": 387603,
      "officialStep": 18,
      "source": "https://help.prusa3d.com/guide/how-to-replace-a-hotend-assembly-core-one_385707#387603",
      "wrapperOfficialId": 1089736,
      "wrapperSource": "https://help.prusa3d.com/guide/how-to-rebuild-the-nextruder-hotend_1080488#1089736",
      "sourceLineIds": [
        826284,
        826285,
        826286
      ],
      "componentAccessIndex": 16
    },
    {
      "title": [
        "ノズル設定を合わせる",
        "Update nozzle settings",
        "Nastavení trysky",
        "Düseneinstellungen anpassen"
      ],
      "body": [
        "径・種類を変えた場合はPrintheadの設定を更新し、ソックの有無も合わせます。径やHF・標準流量を変更した場合は、PrusaSlicerのプリンタープロファイルも実際のノズルに合わせてから印刷を再開します。「画面操作」で実機のファームウェア版に合う経路を確認できます。",
        "If changed, update the Printhead settings for diameter, type and sock. Before printing again, also match the PrusaSlicer printer profile to the actual nozzle diameter and high-flow or standard-flow type. Printer menus shows the route for the firmware on your printer.",
        "Při změně upravte průměr, typ a návlek v nastavení Printhead. Před dalším tiskem také nastavte profil tiskárny v PrusaSliceru podle skutečného průměru a vysokoprůtokové nebo standardní trysky. V nabídce Menu tiskárny vyberte verzi firmwaru své tiskárny.",
        "Bei Änderungen Durchmesser, Typ und Socke unter Printhead anpassen. Vor dem nächsten Druck auch das PrusaSlicer-Druckerprofil an den tatsächlichen Düsendurchmesser und High-Flow- oder Standardtyp anpassen. Unter Druckermenüs den Pfad für die Firmware des Druckers wählen."
      ],
      "refs": [
        "lcd"
      ],
      "firmwareActions": [
        "printhead"
      ],
      "number": 23,
      "page": 15,
      "id": "rebuild-386985",
      "officialId": 386985,
      "officialStep": 19,
      "source": "https://help.prusa3d.com/guide/how-to-replace-a-hotend-assembly-core-one_385707#386985",
      "wrapperOfficialId": 1089736,
      "wrapperSource": "https://help.prusa3d.com/guide/how-to-rebuild-the-nextruder-hotend_1080488#1089736",
      "sourceLineIds": [
        826311,
        826312,
        826313,
        826338,
        826339,
        826340,
        826341
      ],
      "componentAccessIndex": 17
    },
    {
      "title": [
        "加熱を確認する",
        "Verify heating",
        "Ověření ohřevu",
        "Aufheizen prüfen"
      ],
      "body": [
        "Control → Temperature → Nozzle Temperatureを200 °C超に設定し、ホーム画面の下部で温度が上がることを確認します。温度が上がらない場合やエラーが出る場合は使用を再開せず、冷却・電源切断後に接続を再確認します。",
        "Set Control → Temperature → Nozzle Temperature above 200 °C. Return to the home screen and check the rising temperature in the bottom bar. If it does not rise or an error appears, do not resume use; cool down and unplug before rechecking connections.",
        "V Control → Temperature → Nozzle Temperature nastavte přes 200 °C. Na hlavní obrazovce ověřte růst teploty ve spodní liště. Pokud neroste nebo se objeví chyba, tisk neobnovujte; před kontrolou spojů nechte vychladnout a odpojte napájení.",
        "Control → Temperature → Nozzle Temperature auf über 200 °C stellen. Auf der Startseite den Temperaturanstieg in der unteren Leiste prüfen. Bei fehlendem Anstieg oder Fehler nicht weiterdrucken; vor der Anschlussprüfung abkühlen lassen und Netzstecker ziehen."
      ],
      "refs": [
        "lcd",
        "hotend"
      ],
      "firmwareActions": [
        "heat"
      ],
      "number": 24,
      "page": 16,
      "id": "rebuild-387035",
      "officialId": 387035,
      "officialStep": 20,
      "source": "https://help.prusa3d.com/guide/how-to-replace-a-hotend-assembly-core-one_385707#387035",
      "wrapperOfficialId": 1089736,
      "wrapperSource": "https://help.prusa3d.com/guide/how-to-rebuild-the-nextruder-hotend_1080488#1089736",
      "sourceLineIds": [
        826374,
        826375,
        826390
      ],
      "componentAccessIndex": 18
    }
  ]
};
export function createHotendRebuildTask(tasks){const reference=tasks.find(t=>t.id==='hotend');if(!reference)throw Error('Missing standard hotend access task');const task=structuredClone(CONTENT);task.accessReference=structuredClone(reference);for(const step of task.steps)step.sourcePhotos=HOTEND_REBUILD_SOURCE.steps.find(s=>s.id===step.officialId).images;return task;}
