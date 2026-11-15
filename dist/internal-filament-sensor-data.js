// SPDX-License-Identifier: GPL-3.0-only
import{INTERNAL_SENSOR_SOURCE}from './internal-filament-sensor-source.js';
// Independently authored complete47-stage procedure; photographs remain remote.
export const INTERNAL_SENSOR_TASK={
  "id": "internal-filament-sensor-replacement",
  "internalSensorService": true,
  "category": 2,
  "revision": 1,
  "title": [
    "内部フィラメントセンサーを交換する",
    "Replace the internal filament sensor",
    "Výměna vnitřního senzoru filamentu",
    "Internen Filamentsensor austauschen"
  ],
  "source": "https://help.prusa3d.com/guide/how-to-replace-nextruder-filament-sensor-core-one_922421",
  "steps": [
    {
      "id": "sensor-940390",
      "title": [
        "交換範囲を確認する",
        "Check which parts are replaced",
        "Ověření rozsahu výměny",
        "Umfang des Austauschs prüfen"
      ],
      "body": [
        "Nextruder内部のHall基板と、球・磁石・ばね式のフィラメント検出機構を交換します。ヒートシンク本体とロードセル配線は元のものを使います。公式の対象はCORE One／One+ですが、上面カバーの写真はナイロンリベット式です。実機のカバーと検出機構の構成を確認してください。交換部品はPrusaの公式ショップで確認できます。交換部品のページにはログインが必要です。",
        "Replace the Hall board and the ball, magnet and spring mechanism inside the Nextruder. Keep the original heatsink and its loadcell lead. The official product tags cover CORE One and One+, while the cover photos show nylon rivets; match the access procedure to your fitted cover and sensor mechanism. Replacement parts are listed in Prusa's shop, whose spare-parts section requires sign-in.",
        "Vyměňte Hallovu desku a mechanismus s kuličkou, magnetem a pružinou uvnitř Nextruderu. Původní chladič i jeho kabel loadcell zůstávají. Oficiální návod uvádí CORE One a One+, fotografie horního krytu však ukazují nylonové nýty. Ověřte provedení krytu a senzoru své tiskárny. Náhradní díly nabízí obchod Prusa; jeho sekce náhradních dílů vyžaduje přihlášení.",
        "Hall-Platine sowie Kugel-, Magnet- und Federmechanik im Nextruder austauschen. Der vorhandene Kühlkörper und sein Wägezellenkabel bleiben erhalten. Die offiziellen Produktangaben nennen CORE One und One+; die Deckelfotos zeigen jedoch Nylonnieten. Zugang und Sensorausführung mit dem eigenen Drucker abgleichen. Ersatzteile bietet der Prusa-Shop an; der Ersatzteilbereich erfordert eine Anmeldung."
      ],
      "refs": [
        794,
        "hallSensor",
        "hallHolder"
      ],
      "number": 1,
      "officialId": 940390,
      "officialStep": 2,
      "source": "https://help.prusa3d.com/guide/how-to-replace-nextruder-filament-sensor-core-one_922421#940390",
      "sourceLineIds": [
        940401,
        940409,
        940417
      ]
    },
    {
      "id": "sensor-940425",
      "title": [
        "工具と保護材を用意する",
        "Prepare tools and protection",
        "Příprava nářadí a ochrany",
        "Werkzeug und Schutz bereitlegen"
      ],
      "body": [
        "2.5 mm六角レンチ、T6、T10レンチまたはドライバー、Prusa Lubricantまたは適切なグリスを用意します。後のPG組立にはPG-Assemblyアダプターが必要です。小部品を扱う先細ペンチ、ベッドを覆う厚い布、ペーパータオル、グリスを少量付ける結束バンドなども手元に置きます。",
        "Have a 2.5 mm hex key, T6 and T10 tools, and Prusa Lubricant or another suitable grease ready. The later gearbox assembly requires the PG-Assembly adapter. Also prepare needle-nose pliers for small parts, thick fabric to protect the bed, a paper towel and a zip tie or similar grease applicator.",
        "Připravte imbus 2,5 mm, nástroje T6 a T10 a Prusa Lubricant nebo jiné vhodné mazivo. Pro pozdější montáž převodovky je nutný PG-Assembly adaptér. Přichystejte také úzké kleště na malé díly, silnou látku na podložku, papírovou utěrku a stahovací pásku nebo podobný aplikátor maziva.",
        "2,5-mm-Innensechskant, T6, T10 und Prusa Lubricant oder ein anderes geeignetes Fett bereitlegen. Für die spätere Getriebemontage wird der PG-Assembly-Adapter benötigt. Außerdem Spitzzange für Kleinteile, dicken Stoff zum Heizbettschutz, Papiertuch und Kabelbinder oder einen ähnlichen Fettapplikator vorbereiten."
      ],
      "refs": [
        "pgAdapter",
        811
      ],
      "number": 2,
      "officialId": 940425,
      "officialStep": 3,
      "source": "https://help.prusa3d.com/guide/how-to-replace-nextruder-filament-sensor-core-one_922421#940425",
      "sourceLineIds": [
        940435,
        940443,
        940459,
        940451,
        944870
      ]
    },
    {
      "id": "sensor-940467",
      "title": [
        "アンロードして完全に冷やす",
        "Unload and cool completely",
        "Vysunutí filamentu a úplné vychladnutí",
        "Entladen und vollständig abkühlen"
      ],
      "body": [
        "ドアを閉め、Filament → Unload filamentでフィラメントを抜き、スプールも外します。その後Preheat → COOLDOWNを選び、温度が室温に下がるまで待ってください。",
        "Close the door, use Filament → Unload filament, then remove the filament and spool. Select Preheat → COOLDOWN and wait until the printer reaches room temperature.",
        "Zavřete dvířka, spusťte Filament → Unload filament a vyjměte filament i cívku. Poté zvolte Preheat → COOLDOWN a vyčkejte na pokojovou teplotu.",
        "Tür schließen, Filament → Unload filament ausführen und Filament samt Spule entfernen. Danach Preheat → COOLDOWN wählen und bis auf Raumtemperatur abkühlen lassen."
      ],
      "refs": [
        "lcd",
        "hotend"
      ],
      "number": 3,
      "officialId": 940467,
      "officialStep": 4,
      "source": "https://help.prusa3d.com/guide/how-to-replace-nextruder-filament-sensor-core-one_922421#940467",
      "sourceLineIds": [
        940505,
        940481,
        940489,
        940497,
        940513,
        940521
      ],
      "firmwareActions": [
        "unload",
        "cooldown"
      ]
    },
    {
      "id": "sensor-940529",
      "title": [
        "ベッドを下げて電源を切る",
        "Lower the bed and disconnect power",
        "Spuštění podložky a odpojení napájení",
        "Heizbett absenken und Netz trennen"
      ],
      "body": [
        "Control → Move Axis → Move Zを100 mm以上に設定し、ベッドが下がり終わるのを待ちます。背面スイッチで電源を切り、電源コードを抜きます。",
        "Set Control → Move Axis → Move Z to at least 100 mm and let the bed finish lowering. Switch off at the rear and unplug the power cord.",
        "V Control → Move Axis → Move Z nastavte alespoň 100 mm a počkejte na zastavení podložky v dolní poloze. Zadním vypínačem tiskárnu vypněte a odpojte napájecí kabel.",
        "Control → Move Axis → Move Z auf mindestens 100 mm stellen und das Absenken des Heizbetts abwarten. Hinten ausschalten und das Netzkabel abziehen."
      ],
      "refs": [
        "lcd",
        "bedSupport",
        "heatbed",
        "sheet",
        "psu"
      ],
      "number": 4,
      "officialId": 940529,
      "officialStep": 5,
      "source": "https://help.prusa3d.com/guide/how-to-replace-nextruder-filament-sensor-core-one_922421#940529",
      "sourceLineIds": [
        940551,
        940543,
        940559,
        940567
      ],
      "firmwareActions": [
        "moveZ"
      ]
    },
    {
      "id": "sensor-940575",
      "title": [
        "上面カバーを外す",
        "Remove the top cover",
        "Sejmutí horního krytu",
        "Oberen Deckel abnehmen"
      ],
      "body": [
        "ナイロンリベット式カバーの手順です。ドアを開き、右前のリベットを内側から押して解除し、外側から抜きます。残りも同じように外して、上面カバーを取り外します。",
        "For the pictured nylon-rivet cover, open the door and release the front-right rivet by pushing from inside; pull it out from outside. Remove the remaining rivets the same way, then lift off the cover.",
        "Tento krok platí pro vyobrazený kryt s nylonovými nýty. Otevřete dvířka, pravý přední nýt vytlačte zevnitř a vytáhněte zvenku. Stejně vyjměte ostatní nýty a sejměte horní kryt.",
        "Dieser Schritt gilt für den abgebildeten Deckel mit Nylonnieten. Tür öffnen, den Niet vorn rechts von innen entriegeln und von außen herausziehen. Weitere Nieten ebenso entfernen, dann den Deckel abnehmen."
      ],
      "refs": [
        87,
        "ventBlock"
      ],
      "number": 5,
      "officialId": 940575,
      "officialStep": 6,
      "source": "https://help.prusa3d.com/guide/how-to-replace-nextruder-filament-sensor-core-one_922421#940575",
      "sourceLineIds": [
        940589,
        940597,
        940605,
        940613
      ]
    },
    {
      "id": "sensor-940621",
      "title": [
        "ヒートベッドを保護する",
        "Protect the heatbed",
        "Ochrana vyhřívané podložky",
        "Heizbett schützen"
      ],
      "body": [
        "部品を外す前に、ヒートベッドを厚い布などで覆います。工具や部品で表面を傷つけないよう保護してください。",
        "Cover the heatbed with thick fabric before removing parts, protecting its surface from tools and loose components.",
        "Než začnete rozebírat díly, zakryjte vyhřívanou podložku silnou látkou proti poškrábání nářadím a součástkami.",
        "Vor dem Ausbau das Heizbett mit dickem Stoff abdecken, damit Werkzeuge und lose Teile die Oberfläche nicht zerkratzen."
      ],
      "refs": [
        "heatbed",
        "sheet"
      ],
      "number": 6,
      "officialId": 940621,
      "officialStep": 7,
      "source": "https://help.prusa3d.com/guide/how-to-replace-nextruder-filament-sensor-core-one_922421#940621",
      "sourceLineIds": [
        940631,
        940639
      ]
    },
    {
      "id": "sensor-940647",
      "title": [
        "Nextruderの左カバーを外す",
        "Remove the Nextruder left cover",
        "Sejmutí levého krytu Nextruderu",
        "Linke Nextruder-Abdeckung abnehmen"
      ],
      "body": [
        "Nextruder左側のM3x10ねじを2.5 mm六角レンチで外し、側面カバーを取り外します。",
        "At the left side of the Nextruder, remove the cover's M3x10 screw with the 2.5 mm hex key, then take off the cover.",
        "Na levém boku Nextruderu vyšroubujte imbusem 2,5 mm šroub M3x10 a sundejte kryt.",
        "Links am Nextruder die M3x10-Schraube mit dem 2,5-mm-Innensechskantschlüssel entfernen und die Abdeckung abnehmen."
      ],
      "refs": [
        858,
        879
      ],
      "number": 7,
      "officialId": 940647,
      "officialStep": 8,
      "source": "https://help.prusa3d.com/guide/how-to-replace-nextruder-filament-sensor-core-one_922421#940647",
      "sourceLineIds": [
        940659,
        940667,
        940675
      ]
    },
    {
      "id": "sensor-940683",
      "title": [
        "ホットエンドの配線を抜く",
        "Disconnect the hotend leads",
        "Odpojení kabelů hotendu",
        "Hotend-Leitungen abstecken"
      ],
      "body": [
        "ロックを押して解除し、ホットエンドのヒーター、続いてサーミスターのコネクターを抜きます。ロックを解除せずに引き抜くと破損します。",
        "Release each connector latch before unplugging the hotend heater and then its thermistor. Pulling against a locked latch can damage the connector.",
        "Stisknutím pojistky uvolněte nejprve konektor topení hotendu a potom jeho termistoru. Tah za neodjištěný konektor jej může poškodit.",
        "Jeweils die Verriegelung lösen, dann zuerst Hotend-Heizung und anschließend Thermistor abstecken. Ein verriegelter Stecker kann beim Abziehen beschädigt werden."
      ],
      "refs": [
        "hotendHeater0",
        "hotendThermistor0",
        "loveBoard"
      ],
      "number": 8,
      "officialId": 940683,
      "officialStep": 9,
      "source": "https://help.prusa3d.com/guide/how-to-replace-nextruder-filament-sensor-core-one_922421#940683",
      "sourceLineIds": [
        940697,
        940705,
        940713
      ]
    },
    {
      "id": "sensor-940721",
      "title": [
        "ホットエンドを支えて抜く",
        "Support and remove the hotend",
        "Podepření a vyjmutí hotendu",
        "Hotend halten und herausziehen"
      ],
      "body": [
        "配線をガイドから外し、ホットエンドを片手で支えます。つまみねじ2本を数回転だけ緩め、落とさないよう本体を引き抜きます。ねじは抜き取らなくて構いません。",
        "Free the cables from their guide and support the hotend. Loosen both thumbscrews a few turns without removing them, then withdraw the assembly while keeping it supported.",
        "Uvolněte kabely z vedení a hotend přidržte. Oba ruční šrouby pouze o několik otáček povolte, nevytahujte je. Hotend vysuňte tak, aby nevypadl.",
        "Kabel aus der Führung lösen und das Hotend festhalten. Beide Rändelschrauben nur einige Umdrehungen lockern, nicht herausnehmen. Die Baugruppe beim Herausziehen gegen Herunterfallen sichern."
      ],
      "refs": [
        "hotend",
        795,
        807,
        857
      ],
      "number": 9,
      "officialId": 940721,
      "officialStep": 10,
      "source": "https://help.prusa3d.com/guide/how-to-replace-nextruder-filament-sensor-core-one_922421#940721",
      "sourceLineIds": [
        940735,
        940743,
        940751,
        940767,
        940759
      ]
    },
    {
      "id": "sensor-940775",
      "title": [
        "モーター・ファン・NTCを抜線する",
        "Disconnect motor, fans and NTC",
        "Odpojení motoru, ventilátorů a NTC",
        "Motor, Lüfter und NTC abstecken"
      ],
      "body": [
        "プリントファンを抜き、その配線を後ろへ逃がします。上側のモーターと、ヒートシンクのサーミスター・ファンも接続を外します。",
        "Unplug the print fan and move its lead rearward. Disconnect the motor at the top, plus the heatsink thermistor and heatsink fan.",
        "Odpojte tiskový ventilátor a jeho kabel odložte dozadu. Odpojte motor nahoře a také termistor a ventilátor chladiče.",
        "Drucklüfter abstecken und sein Kabel nach hinten legen. Den Motor oben sowie Thermistor und Lüfter des Kühlkörpers abstecken."
      ],
      "refs": [
        "servicePrintLead",
        "lbMotorLead",
        "lbNtcLead",
        "serviceHotendFanLead",
        "loveBoard"
      ],
      "number": 10,
      "officialId": 940775,
      "officialStep": 11,
      "source": "https://help.prusa3d.com/guide/how-to-replace-nextruder-filament-sensor-core-one_922421#940775",
      "sourceLineIds": [
        940787,
        940795,
        940803
      ]
    },
    {
      "id": "sensor-940811",
      "title": [
        "右カバーとセンサー配線を外す",
        "Remove right cover and disconnect sensors",
        "Sejmutí pravého krytu a odpojení senzorů",
        "Rechte Abdeckung und Sensorkabel lösen"
      ],
      "body": [
        "右側カバーのM3x6ねじ2本を外してカバーを取り、ロードセルとフィラメントセンサーを抜きます。",
        "Remove the right cover and its two M3x6 screws, then disconnect the loadcell and filament sensor.",
        "Po vyjmutí dvou šroubů M3x6 sejměte pravý kryt a odpojte loadcell i senzor filamentu.",
        "Die rechte Abdeckung mit ihren zwei M3x6-Schrauben abnehmen, anschließend Wägezelle und Filamentsensor abstecken."
      ],
      "refs": [
        "ventLever",
        870,
        872,
        "lbLoadcellLead",
        "lbFilamentLead"
      ],
      "number": 11,
      "officialId": 940811,
      "officialStep": 12,
      "source": "https://help.prusa3d.com/guide/how-to-replace-nextruder-filament-sensor-core-one_922421#940811",
      "sourceLineIds": [
        940823,
        940831
      ]
    },
    {
      "id": "sensor-940839",
      "title": [
        "ホットエンドファンを外す",
        "Remove the hotend fan",
        "Demontáž ventilátoru hotendu",
        "Hotend-Lüfter ausbauen"
      ],
      "body": [
        "M3x18ねじ2本を外し、ヒートシンクからホットエンドファンを取り外します。",
        "Undo the two M3x18 fasteners and remove the hotend fan from the heatsink.",
        "Vyjměte oba šrouby M3x18 a oddělte ventilátor hotendu od chladiče.",
        "Beide M3x18-Befestigungen lösen und den Hotend-Lüfter vom Kühlkörper abnehmen."
      ],
      "refs": [
        791,
        819,
        821
      ],
      "number": 12,
      "officialId": 940839,
      "officialStep": 13,
      "source": "https://help.prusa3d.com/guide/how-to-replace-nextruder-filament-sensor-core-one_922421#940839",
      "sourceLineIds": [
        940849
      ]
    },
    {
      "id": "sensor-940857",
      "title": [
        "Nextruderを外す",
        "Remove the Nextruder",
        "Demontáž Nextruderu",
        "Nextruder ausbauen"
      ],
      "body": [
        "正面のM3x10ねじ3本を外し、上側のPTFE継手を緩めて取り外します。Nextruderを支えてゆっくりキャリッジから離し、その際にサーミスター配線をキャリッジのフックから外します。",
        "Remove the three front M3x10 screws and unscrew the upper PTFE fitting. Support the released Nextruder, move it slowly away from the carriage and unhook the thermistor lead as you go.",
        "Vyjměte tři přední šrouby M3x10 a vyšroubujte horní PTFE šroubení. Uvolněný Nextruder přidržte, pomalu oddalte od vozíku a současně vyhákněte kabel termistoru.",
        "Die drei vorderen M3x10-Schrauben und die obere PTFE-Verschraubung entfernen. Den gelösten Nextruder halten, langsam vom Wagen abnehmen und dabei das Thermistorkabel aus dem Haken lösen."
      ],
      "refs": [
        788,
        794,
        "lbNtcLead"
      ],
      "number": 13,
      "officialId": 940857,
      "officialStep": 14,
      "source": "https://help.prusa3d.com/guide/how-to-replace-nextruder-filament-sensor-core-one_922421#940857",
      "sourceLineIds": [
        940871,
        940879,
        940887
      ]
    },
    {
      "id": "sensor-940895",
      "title": [
        "つまみねじとNTCを外す",
        "Remove thumbscrews and NTC",
        "Vyjmutí ručních šroubů a NTC",
        "Rändelschrauben und NTC ausbauen"
      ],
      "body": [
        "つまみねじ2本を抜き取ります。T6の短辺でM3x4T止めねじを外し、ケーブルを傷めないようNTCサーミスターを取り出します。",
        "Take out both thumbscrews. Use the short end of the T6 key to remove the M3x4T grub screw, then withdraw the NTC without damaging its leads.",
        "Vyjměte oba ruční šrouby. Krátkou stranou klíče T6 vyšroubujte M3x4T a opatrně vytáhněte NTC, aniž poškodíte jeho vodiče.",
        "Beide Rändelschrauben herausnehmen. Mit dem kurzen Ende des T6-Schlüssels die M3x4T-Madenschraube entfernen und den NTC ohne Beschädigung seiner Leitungen herausziehen."
      ],
      "refs": [
        795,
        807,
        806,
        811,
        "lbNtcLead"
      ],
      "number": 14,
      "officialId": 940895,
      "officialStep": 15,
      "source": "https://help.prusa3d.com/guide/how-to-replace-nextruder-filament-sensor-core-one_922421#940895",
      "sourceLineIds": [
        940923,
        940907,
        940915
      ]
    },
    {
      "id": "sensor-940931",
      "title": [
        "スイベルとPGカバーを外す",
        "Remove the swivel and PG cover",
        "Demontáž otočného dílu a krytu PG",
        "Schwenkhebel und PG-Abdeckung ausbauen"
      ],
      "body": [
        "ばね付きM3x30ねじ2本とアイドラー支持部（Idler-swivel）を外します。続いてM3x25ねじを外し、ギアボックス前面の樹脂カバー（PG-case）を取ります。",
        "Remove both spring-loaded M3x30 screws and the Idler-swivel support. Undo the M3x25 fasteners and lift away the plastic PG-case at the gearbox front.",
        "Vyjměte oba šrouby M3x30 s pružinami a držák Idler-swivel. Poté odšroubujte M3x25 a sejměte přední plastový kryt převodovky PG-case.",
        "Beide M3x30-Schrauben samt Federn und die Idler-swivel-Halterung abnehmen. Danach M3x25-Schrauben entfernen und die vordere Kunststoffabdeckung PG-case abheben."
      ],
      "refs": [
        798,
        805,
        815,
        "idlerSpring1",
        "idlerSpring2",
        816,
        804,
        813,
        814
      ],
      "number": 15,
      "officialId": 940931,
      "officialStep": 16,
      "source": "https://help.prusa3d.com/guide/how-to-replace-nextruder-filament-sensor-core-one_922421#940931",
      "sourceLineIds": [
        940945,
        940953,
        940961,
        940969
      ]
    },
    {
      "id": "sensor-940977",
      "title": [
        "アイドラーとギアを外して清掃する",
        "Remove and clean idler and gearbox parts",
        "Vyjmutí idleru a čištění převodovky",
        "Idler und Getriebe ausbauen und reinigen"
      ],
      "body": [
        "「3本ねじ」版だけはM3x25止めねじも外します。アイドラーを取り、樹脂メインプレート・真鍮PGリング・ギアをまとめて外します。各パーツの余分なグリスと汚れを落とします。",
        "On the three-screw version, also remove its M3x25 set screw. Take out the idler, then the printed main plate, brass PG ring and gears as an assembly. Clean excess grease and dirt from every gearbox part.",
        "U tříšroubového provedení vyjměte také stavěcí šroub M3x25. Vyjměte idler a pak sestavu tištěné hlavní desky, mosazného PG kroužku a kol. Ze všech dílů převodovky očistěte přebytečné mazivo a nečistoty.",
        "Bei der Dreischrauben-Ausführung auch die M3x25-Madenschraube entfernen. Idler herausnehmen, dann gedruckte Hauptplatte, Messing-PG-Ring und Zahnräder gemeinsam abheben. Überschüssiges Fett und Schmutz von allen Getriebeteilen entfernen."
      ],
      "refs": [
        796,
        "mainPlate",
        "pgRing",
        "pgAssembly",
        800,
        793,
        797
      ],
      "number": 16,
      "officialId": 940977,
      "officialStep": 17,
      "source": "https://help.prusa3d.com/guide/how-to-replace-nextruder-filament-sensor-core-one_922421#940977",
      "sourceLineIds": [
        940991,
        940999,
        941007,
        941015
      ]
    },
    {
      "id": "sensor-941023",
      "title": [
        "ワッシャーを確認してモーターを外す",
        "Check the washer and remove the motor",
        "Kontrola podložky a vyjmutí motoru",
        "Scheibe prüfen und Motor ausbauen"
      ],
      "body": [
        "モーターとギアボックスの間の金属ワッシャーを探します。ギア側に付いていたり外れていたりする場合は、最後の写真を見てモーター軸に戻します。その後モーターをヒートシンクから外します。",
        "Find the washer between motor and gearbox; it may have stayed on the gears. If displaced, return it to the motor shaft using the last photo as reference. Then separate the motor from the heatsink.",
        "Zkontrolujte podložku mezi motorem a převodovkou, případně přichycenou k převodům. Uvolněnou podložku vraťte podle poslední fotografie na hřídel motoru. Potom oddělte motor od chladiče.",
        "Die Scheibe zwischen Motor und Getriebe suchen; sie kann am Getriebe haften. Falls verrutscht, nach dem letzten Foto auf die Motorwelle zurücksetzen. Anschließend den Motor vom Kühlkörper trennen."
      ],
      "refs": [
        792,
        790,
        794
      ],
      "number": 17,
      "officialId": 941023,
      "officialStep": 18,
      "source": "https://help.prusa3d.com/guide/how-to-replace-nextruder-filament-sensor-core-one_922421#941023",
      "sourceLineIds": [
        941035,
        941043,
        941051,
        941059
      ]
    },
    {
      "id": "sensor-941067",
      "title": [
        "Hallセンサー基板を外す",
        "Remove the Hall sensor board",
        "Demontáž Hallova senzoru",
        "Hall-Sensorplatine ausbauen"
      ],
      "body": [
        "M2.5x6rTねじを外し、Hall式フィラメントセンサー基板を慎重に取り外します。",
        "Remove the M2.5x6rT screw and carefully lift out the Hall filament-sensor board.",
        "Po vyšroubování M2.5x6rT opatrně vyjměte desku Hallova senzoru filamentu.",
        "M2.5x6rT-Schraube entfernen und die Hall-Filamentsensorplatine vorsichtig herausnehmen."
      ],
      "refs": [
        "hallSensor",
        "lbFilamentLead",
        794,
        812
      ],
      "number": 18,
      "officialId": 941067,
      "officialStep": 19,
      "source": "https://help.prusa3d.com/guide/how-to-replace-nextruder-filament-sensor-core-one_922421#941067",
      "sourceLineIds": [
        941077,
        941085
      ]
    },
    {
      "id": "sensor-941093",
      "title": [
        "小部品を保持してセンサー機構を抜く",
        "Retain small parts and remove the sensor mechanism",
        "Vyjmutí mechanismu se zachycením drobných dílů",
        "Sensormechanik mit gesicherten Kleinteilen herausziehen"
      ],
      "body": [
        "先細ペンチでセンサー機構をゆっくり引き抜きます。中の小さなばね・磁石・鋼球が落ちるので、紛失しないよう受け止め、再使用まで保管してください。",
        "Ease the sensor mechanism out with needle-nose pliers, catching its loose spring, magnet and steel ball. Keep all three small parts safely for reuse.",
        "Špičatými kleštěmi pomalu vytáhněte mechanismus senzoru a zachyťte uvolněnou pružinu, magnet i ocelovou kuličku. Všechny drobné díly bezpečně uschovejte pro další montáž.",
        "Den Sensormechanismus langsam mit der Spitzzange herausziehen und lose Feder, Magnet und Stahlkugel auffangen. Alle Kleinteile zur Wiederverwendung sicher aufbewahren."
      ],
      "refs": [
        "hallHolder",
        "hallBall",
        "hallMagnet",
        "hallSpring",
        794
      ],
      "number": 19,
      "officialId": 941093,
      "officialStep": 20,
      "source": "https://help.prusa3d.com/guide/how-to-replace-nextruder-filament-sensor-core-one_922421#941093",
      "sourceLineIds": [
        941105,
        941113,
        941121
      ]
    },
    {
      "id": "sensor-942362",
      "title": [
        "交換用センサーの部品をそろえる",
        "Lay out the replacement sensor kit",
        "Příprava nových dílů senzoru",
        "Neue Sensorteile bereitlegen"
      ],
      "body": [
        "Hallフィラメントセンサー基板1個、Prusaボールホルダー1個、磁石1個、ばね1個、直径4 mmの鋼球1個を用意します。原典の寸法表記は磁石が3×3×3 mm、ばねが3×9 mmです。ここで交換するのはセンサー部品一式で、ヒートシンクとロードセル配線は交換しません。",
        "Lay out one Hall filament-sensor board, one Prusa ball holder, one magnet, one spring and one 4 mm steel ball. The guide lists the magnet as 3×3×3 mm and the spring as 3×9 mm. This kit replaces the sensor components; the heatsink and its loadcell wiring stay in use.",
        "Připravte po jednom kuse Hallovy desky filamentu, držáku kuličky Prusa, magnetu, pružiny a ocelové kuličky průměru 4 mm. Rozměry v návodu jsou 3×3×3 mm pro magnet a 3×9 mm pro pružinu. Mění se díly senzoru; chladič a kabeláž loadcell zůstávají původní.",
        "Je eine Hall-Filamentsensorplatine, einen Prusa-Kugelhalter, einen Magneten, eine Feder und eine Stahlkugel mit 4 mm Durchmesser bereitlegen. Der Leitfaden nennt 3×3×3 mm für den Magneten und 3×9 mm für die Feder. Ausgetauscht werden die Sensorteile; Kühlkörper und Wägezellenleitung bleiben erhalten."
      ],
      "refs": [
        "sensorReplacementBoard",
        "sensorReplacementHolder",
        "sensorReplacementBall",
        "sensorReplacementMagnet",
        "sensorReplacementSpring"
      ],
      "number": 20,
      "officialId": 942362,
      "officialStep": 21,
      "source": "https://help.prusa3d.com/guide/how-to-replace-nextruder-filament-sensor-core-one_922421#942362",
      "sourceLineIds": [
        942363,
        942364,
        942365,
        942366,
        942367,
        942368
      ]
    },
    {
      "id": "sensor-941155",
      "title": [
        "Hallセンサー基板を移す",
        "Install the Hall sensor board",
        "Montáž Hallova senzoru",
        "Hall-Sensorplatine montieren"
      ],
      "body": [
        "Hallセンサー基板を形の合うくぼみに置き、M2.5x6rTねじで固定します。基板が割れないよう、慎重に締めてください。",
        "Seat the Hall board in its matching pocket and secure it with the M2.5x6rT screw. Tighten carefully to avoid cracking the board.",
        "Desku Hallova senzoru usaďte do odpovídající kapsy a upevněte M2.5x6rT. Dotahujte opatrně, aby deska nepraskla.",
        "Hall-Platine in die passende Tasche legen und mit M2.5x6rT befestigen. Behutsam anziehen, damit die Platine nicht bricht."
      ],
      "refs": [
        794,
        812,
        "sensorReplacementBoard",
        "lbFilamentLead"
      ],
      "number": 21,
      "officialId": 941155,
      "officialStep": 22,
      "source": "https://help.prusa3d.com/guide/how-to-replace-nextruder-filament-sensor-core-one_922421#941155",
      "sourceLineIds": [
        941164,
        941172
      ]
    },
    {
      "id": "sensor-942418",
      "title": [
        "球・磁石・ばねをホルダーに組む",
        "Assemble the ball, magnet and spring",
        "Sestavení kuličky, magnetu a pružiny",
        "Kugel, Magnet und Feder zusammensetzen"
      ],
      "body": [
        "鋼球、磁石、ばねの順に並べます。磁石は必ず1個だけにします。予備の磁石が吸い付いて2個重なっていないか確認してください。鋼球を上にした向きで、この3部品をPrusaボールホルダーに収めます。",
        "Arrange the steel ball, then the magnet, then the spring. Install exactly one magnet: a spare can cling to it and make two look like a single piece. With the steel ball pointing upward, fit this three-part stack into the Prusa ball holder.",
        "Seřaďte ocelovou kuličku, magnet a pružinu v tomto pořadí. Použijte právě jeden magnet; přichycený náhradní kus může způsobit, že dva vypadají jako jeden. S kuličkou nahoře vložte tuto trojici do držáku Prusa.",
        "Stahlkugel, Magnet und Feder in dieser Reihenfolge anordnen. Genau einen Magneten einsetzen: Ein anhaftender Ersatzmagnet kann zwei Stück wie eines aussehen lassen. Diese drei Teile mit der Stahlkugel nach oben in den Prusa-Kugelhalter einsetzen."
      ],
      "refs": [
        "sensorReplacementHolder",
        "sensorReplacementBall",
        "sensorReplacementMagnet",
        "sensorReplacementSpring"
      ],
      "number": 22,
      "officialId": 942418,
      "officialStep": 23,
      "source": "https://help.prusa3d.com/guide/how-to-replace-nextruder-filament-sensor-core-one_922421#942418",
      "sourceLineIds": [
        942419,
        942420,
        942421,
        942422,
        942423,
        942424
      ]
    },
    {
      "id": "sensor-941180",
      "title": [
        "向きを合わせてセンサー機構を戻す",
        "Orient and install the sensor mechanism",
        "Orientace a montáž mechanismu senzoru",
        "Sensormechanik ausrichten und einsetzen"
      ],
      "body": [
        "センサー機構の鋼球側をヒートシンクの側面寄り、突起を下向きにします。その向きで押し込み、金属面と面一に収めます。",
        "Orient the sensor mechanism with its ball toward the heatsink side and its protrusion downward. Press it into place until flush with the metal surface.",
        "Mechanismus natočte kuličkou k boku chladiče a výstupkem dolů. V této poloze jej zatlačte do roviny s kovovým povrchem.",
        "Sensormechanismus mit der Kugel zur Kühlkörperseite und dem Vorsprung nach unten ausrichten. Bis bündig zur Metallfläche einschieben."
      ],
      "refs": [
        794,
        "sensorReplacementHolder",
        "sensorReplacementBall",
        "sensorReplacementMagnet",
        "sensorReplacementSpring"
      ],
      "number": 23,
      "officialId": 941180,
      "officialStep": 24,
      "source": "https://help.prusa3d.com/guide/how-to-replace-nextruder-filament-sensor-core-one_922421#941180",
      "sourceLineIds": [
        941194,
        941202,
        941210
      ]
    },
    {
      "id": "sensor-941218",
      "title": [
        "モーターとメインプレートを組む",
        "Fit motor, heatsink and main plate",
        "Montáž motoru, chladiče a hlavní desky",
        "Motor, Kühlkörper und Hauptplatte montieren"
      ],
      "body": [
        "写真の向きに合わせ、モーターのケーブルを上、ヒートシンクのケーブルを右にして重ねます。切り欠きを合わせてメインプレートを載せ、5x10x0.1スペーサーがモーターに残っていることを確認します。",
        "Match the photo: motor lead upward, heatsink leads to the right. Stack the heatsink and main plate, aligning the plate's cutout. Confirm the 5x10x0.1 spacer is still on the motor before proceeding.",
        "Díly natočte jako na fotografii: kabel motoru nahoru, kabely chladiče doprava. Na motor položte chladič a hlavní desku podle výřezu. Před pokračováním zkontrolujte podložku 5x10x0.1 na motoru.",
        "Nach dem Foto ausrichten: Motorkabel nach oben, Kühlkörperleitungen nach rechts. Kühlkörper und Hauptplatte aufsetzen, dabei die Aussparung ausrichten. Vor dem Fortfahren die Scheibe 5x10x0.1 am Motor prüfen."
      ],
      "refs": [
        790,
        794,
        792,
        "mainPlate",
        "lbMotorLead",
        "lbFilamentLead"
      ],
      "number": 24,
      "officialId": 941218,
      "officialStep": 25,
      "source": "https://help.prusa3d.com/guide/how-to-replace-nextruder-filament-sensor-core-one_922421#941218",
      "sourceLineIds": [
        941232,
        941240,
        941248,
        941256,
        941264
      ]
    },
    {
      "id": "sensor-941272",
      "title": [
        "PGアダプターを付ける",
        "Fit the PG assembly adapter",
        "Nasazení PG adaptéru",
        "PG-Assembly-Adapter aufsetzen"
      ],
      "body": [
        "PGアダプターのくぼみを各ギアに合わせ、PGアセンブリにかぶせます。次の工程でリングを組み付けるまで、この位置を保ちます。公式のPG-assembly動画は動きの補足として参照できます。",
        "Place the PG adapter over the gear assembly, matching its pockets to the individual gears. Keep it fitted for the following ring assembly. The official PG-assembly video is an optional motion reference; the assembly operations are described here.",
        "Nasaďte PG-adaptér na převodovku tak, aby kapsy odpovídaly jednotlivým kolům. Pro následující montáž kroužku jej ponechte nasazený. Oficiální video PG-assembly slouží jako volitelná ukázka pohybu; postup montáže je popsán zde.",
        "PG-Adapter mit seinen Vertiefungen passend über die einzelnen Zahnräder setzen. Für die folgende Ringmontage aufgesetzt lassen. Das offizielle PG-assembly-Video ist eine optionale Bewegungshilfe; die Montageschritte stehen hier."
      ],
      "refs": [
        "pgAdapter",
        "pgAssembly"
      ],
      "number": 25,
      "officialId": 941272,
      "officialStep": 26,
      "source": "https://help.prusa3d.com/guide/how-to-replace-nextruder-filament-sensor-core-one_922421#941272",
      "sourceLineIds": [
        941284,
        941292,
        941300
      ]
    },
    {
      "id": "sensor-941308",
      "title": [
        "面取り側を下にしてPGリングを組む",
        "Fit the PG ring with its chamfer down",
        "Nasazení PG kroužku zkosením dolů",
        "PG-Ring mit der Fase nach unten montieren"
      ],
      "body": [
        "組立アダプターは必須です。PGリングの面取りがある歯面をギア側へ向け、アダプターに通します。一式を片手で持ち、もう片方でリングを約1/4回転の範囲で左右に揺すって入れます。ギアとリングの面がほぼそろったら止めます。",
        "The PG assembly adapter is required. With the ring's chamfered tooth side toward the gears, slide it over the adapter. Support the assembly and work the ring on with alternating turns over about a quarter turn. Stop when gear and ring faces are nearly level.",
        "Montážní adaptér je pro tento krok nutný. PG kroužek nasuňte zkosenou stranou zubů ke kolům. Sestavu přidržte a kroužek nasazujte střídavým otáčením zhruba o čtvrt otáčky. Skončete, když jsou čela kol a kroužku téměř v rovině.",
        "Der Montageadapter ist hier erforderlich. Den PG-Ring mit der angefasten Zahnseite zu den Zahnrädern über den Adapter schieben. Baugruppe halten und den Ring mit wechselnden Drehbewegungen über etwa eine Viertelumdrehung aufsetzen. Stoppen, sobald Zahnrad- und Ringflächen annähernd bündig sind."
      ],
      "refs": [
        "pgAdapter",
        "pgRing",
        "pgAssembly"
      ],
      "number": 26,
      "officialId": 941308,
      "officialStep": 27,
      "source": "https://help.prusa3d.com/guide/how-to-replace-nextruder-filament-sensor-core-one_922421#941308",
      "sourceLineIds": [
        941320,
        941328,
        941336,
        941344,
        941352,
        941360
      ]
    },
    {
      "id": "sensor-941368",
      "title": [
        "PG一式をモーター軸へ収める",
        "Seat the PG assembly on the motor shaft",
        "Usazení sestavy PG na hřídel motoru",
        "PG-Baugruppe auf die Motorwelle setzen"
      ],
      "body": [
        "一式を崩さずモーター軸に載せ、アダプター・ギア・リングをまとめてそっと回します。自然に下まで収まり、メインプレートとの隙間がなくなったことを確認してから、アダプターを外します。",
        "Keep the adapter, gears and ring together while fitting them onto the motor shaft. Gently turn the complete unit until it drops into its seat without a gap to the main plate, then remove the adapter.",
        "Adaptér, kola i kroužek držte pohromadě při nasazování na hřídel. Celou jednotkou jemně otáčejte, až sama dosedne bez mezery u hlavní desky. Teprve potom adaptér sejměte.",
        "Adapter, Zahnräder und Ring beim Aufsetzen auf die Motorwelle zusammenhalten. Die ganze Einheit vorsichtig drehen, bis sie ohne Spalt zur Hauptplatte von selbst sitzt. Dann den Adapter abnehmen."
      ],
      "refs": [
        "pgAssembly",
        "pgRing",
        "pgAdapter",
        "mainPlate",
        790
      ],
      "number": 27,
      "officialId": 941368,
      "officialStep": 28,
      "source": "https://help.prusa3d.com/guide/how-to-replace-nextruder-filament-sensor-core-one_922421#941368",
      "sourceLineIds": [
        941382,
        941390,
        941398,
        941406
      ]
    },
    {
      "id": "sensor-941414",
      "title": [
        "PGの回転・突出・隙間を確認する",
        "Check PG rotation, height and gap",
        "Kontrola otáčení, výšky a mezery PG",
        "PG-Drehung, Überstand und Spalt prüfen"
      ],
      "body": [
        "アダプターを付け直し、力をかけず軽く回るか確認します。確認後は外して整備用に保管します。ギアの面がPGリングより高くないこと、リングとメインプレートの隙間が小さいことを確認し、大きな隙間があれば外して組み直します。",
        "Refit the adapter to check that the gears turn easily without force, then remove and keep it. Gear faces must be level with or below the ring. Check the ring-to-main-plate gap; a substantial gap requires removing and reseating the gearbox.",
        "Adaptér znovu nasaďte a ověřte lehké otáčení bez síly. Pak jej sejměte a uschovejte. Kola nesmějí být nad čelem kroužku. Zkontrolujte malou mezeru mezi kroužkem a hlavní deskou; při výrazné mezeře převodovku vyjměte a znovu usaďte.",
        "Adapter nochmals aufsetzen und leichtgängiges Drehen ohne Kraft prüfen. Danach abnehmen und aufbewahren. Zahnradflächen dürfen den Ring nicht überragen. Den kleinen Spalt zwischen Ring und Hauptplatte prüfen; bei deutlichem Abstand das Getriebe abnehmen und neu einsetzen."
      ],
      "refs": [
        "pgAdapter",
        "pgAssembly",
        "pgRing",
        "mainPlate"
      ],
      "number": 28,
      "officialId": 941414,
      "officialStep": 29,
      "source": "https://help.prusa3d.com/guide/how-to-replace-nextruder-filament-sensor-core-one_922421#941414",
      "sourceLineIds": [
        941428,
        941436,
        941444,
        941452,
        941460
      ]
    },
    {
      "id": "sensor-941468",
      "title": [
        "アイドラーを取り付ける",
        "Install the idler",
        "Montáž idleru",
        "Idler montieren"
      ],
      "body": [
        "アイドラーをPGリングとモーターの間へ入れます。メインプレートの切り欠きにスペーサーを合わせ、PGリングの穴と位置をそろえます。3x25の六角穴付き止めねじで固定します。締め過ぎず、ねじがリングから突き出す状態を保ちます。",
        "Fit the idler between ring and motor, locating its spacer in the plate cutout and aligning it with the ring hole. Secure it with the 3x25 socket set screw without overtightening; the screw remains proud of the ring.",
        "Idler vložte mezi kroužek a motor. Jeho vložku usaďte do výřezu desky a srovnejte s otvorem kroužku. Zajistěte stavěcím šroubem 3x25 s vnitřním šestihranem. Nepřetahujte; šroub má z kroužku vyčnívat.",
        "Idler zwischen Ring und Motor einsetzen, den Abstandshalter in der Plattenaussparung auf die Ringbohrung ausrichten. Mit der 3x25-Innensechskant-Madenschraube sichern, ohne zu überdrehen; die Schraube steht anschließend über den Ring hinaus."
      ],
      "refs": [
        796,
        "pgRing",
        "mainPlate",
        790
      ],
      "number": 29,
      "officialId": 941468,
      "officialStep": 30,
      "source": "https://help.prusa3d.com/guide/how-to-replace-nextruder-filament-sensor-core-one_922421#941468",
      "sourceLineIds": [
        941480,
        941488
      ]
    },
    {
      "id": "sensor-941496",
      "title": [
        "ギアの歯に潤滑剤を塗る",
        "Lubricate the gear teeth",
        "Mazání zubů převodovky",
        "Getriebezähne schmieren"
      ],
      "body": [
        "結束バンドの先などにPrusa Lubricantを少量取り、PGリングとPGギアの歯の全周へ薄く塗ります。",
        "Use a zip-tie tip or another applicator to spread a small amount of Prusa Lubricant around the complete circumference of both the PG ring and gear teeth.",
        "Špičkou stahovací pásky nebo jiným aplikátorem rozetřete malé množství Prusa Lubricant po celém obvodu zubů PG kroužku i kol.",
        "Mit einer Kabelbinderspitze oder einem anderen Applikator wenig Prusa Lubricant rund um sämtliche Zähne von PG-Ring und Zahnrädern verteilen."
      ],
      "refs": [
        "pgRing",
        "pgAssembly"
      ],
      "number": 30,
      "officialId": 941496,
      "officialStep": 31,
      "source": "https://help.prusa3d.com/guide/how-to-replace-nextruder-filament-sensor-core-one_922421#941496",
      "sourceLineIds": [
        941508,
        941516
      ]
    },
    {
      "id": "sensor-941524",
      "title": [
        "PGカバーを仮止めする",
        "Provisionally fit the PG cover",
        "Předběžná montáž krytu PG",
        "PG-Abdeckung vorläufig befestigen"
      ],
      "body": [
        "リング正面に残ったグリスをペーパータオルで拭き、前面カバーをM3x25ねじ3本で仮止めします。本締めは最後のSelftest中です。今は締め切りません。",
        "Wipe grease from the ring's front face with a paper towel. Fit the front cover with three M3x25 screws, leaving them provisional. Final tightening belongs to the later Selftest procedure.",
        "Papírovou utěrkou očistěte čelo kroužku od maziva. Přední kryt přichyťte třemi M3x25 pouze předběžně; úplné dotažení přijde až při závěrečném Selftestu.",
        "Fett mit einem Papiertuch von der Ringstirnfläche wischen. Vorderen Deckel mit drei M3x25-Schrauben nur vorläufig befestigen. Endgültig werden sie erst beim abschließenden Selbsttest angezogen."
      ],
      "refs": [
        816,
        804,
        813,
        814,
        "pgRing"
      ],
      "number": 31,
      "officialId": 941524,
      "officialStep": 32,
      "source": "https://help.prusa3d.com/guide/how-to-replace-nextruder-filament-sensor-core-one_922421#941524",
      "sourceLineIds": [
        941536,
        941544,
        941552
      ]
    },
    {
      "id": "sensor-941560",
      "title": [
        "ばねとアイドラースイベルを戻す",
        "Refit springs and idler swivel",
        "Montáž pružin a otočného dílu idleru",
        "Federn und Idler-Schwenkhebel montieren"
      ],
      "body": [
        "M3x30ねじ2本に15x5ばねを1個ずつ付け、ヒートシンクの穴へ通します。写真の向きでアイドラー支持部を取り付け、ねじ先端がアイドラーナットの正面と面一になったら締めるのを止めます。",
        "Put one 15x5 spring on each M3x30 screw and pass both through the heatsink. Fit the Idler-swivel in the pictured orientation. Stop tightening when the screw tips meet the idler nut's front face; do not drive them farther.",
        "Na každý ze dvou M3x30 navlékněte pružinu 15x5 a oba protáhněte chladičem. Nasaďte držák Idler-swivel podle fotografie. Dotahování zastavte, jakmile jsou špičky šroubů v rovině s předním čelem matice idleru.",
        "Auf jede M3x30-Schraube eine 15x5-Feder setzen und beide durch den Kühlkörper führen. Idler-swivel wie abgebildet montieren. Sobald die Schraubenspitzen mit der Vorderseite der Idler-Mutter bündig sind, nicht weiter anziehen."
      ],
      "refs": [
        798,
        805,
        815,
        "idlerSpring1",
        "idlerSpring2",
        "idlerSwivelSpacer",
        794
      ],
      "number": 32,
      "officialId": 941560,
      "officialStep": 33,
      "source": "https://help.prusa3d.com/guide/how-to-replace-nextruder-filament-sensor-core-one_922421#941560",
      "sourceLineIds": [
        941574,
        941582,
        941590,
        941598
      ]
    },
    {
      "id": "sensor-941606",
      "title": [
        "NTCとつまみねじを戻す",
        "Refit the NTC and thumbscrews",
        "Montáž NTC a ručních šroubů",
        "NTC und Rändelschrauben montieren"
      ],
      "body": [
        "NTCをモーター側から差し込み、M3x4T止めねじで留めます。T6の短辺を2本の指で持ち、確実に、ただし締め過ぎずに固定します。センサーとねじ山を傷めないでください。つまみねじ2本は2回転だけ入れ、まだ本締めしません。",
        "Insert the NTC from the motor side and secure it with M3x4T. Hold the T6 key's short side with two fingers for controlled tightening; avoid damaging the sensor or threads. Start both thumbscrews by two turns only.",
        "NTC zasuňte ze strany motoru a zajistěte M3x4T. Krátkou stranu T6 držte dvěma prsty a utahujte s citem, abyste nepoškodili senzor ani závit. Oba ruční šrouby prozatím zašroubujte jen o dvě otáčky.",
        "NTC von der Motorseite einsetzen und mit M3x4T sichern. Den kurzen T6-Schenkel mit zwei Fingern halten und kontrolliert anziehen, ohne Sensor oder Gewinde zu beschädigen. Beide Rändelschrauben zunächst nur zwei Umdrehungen einschrauben."
      ],
      "refs": [
        806,
        811,
        795,
        807,
        "lbNtcLead",
        794
      ],
      "number": 33,
      "officialId": 941606,
      "officialStep": 34,
      "source": "https://help.prusa3d.com/guide/how-to-replace-nextruder-filament-sensor-core-one_922421#941606",
      "sourceLineIds": [
        941618,
        941626,
        941634
      ]
    },
    {
      "id": "sensor-941642",
      "title": [
        "Nextruderをキャリッジへ戻す",
        "Refit the Nextruder to its carriage",
        "Montáž Nextruderu na vozík",
        "Nextruder am Wagen montieren"
      ],
      "body": [
        "Nextruderを戻しながら、NTC配線をXキャリッジのフックへ通します。ヒートシンクの裏で挟まず、自由に通る状態を保ってください。位置を合わせてPTFE継手で留め、ねじ付きスペーサーにヒートシンクを合わせてM3x10ねじ3本で固定します。",
        "Return the Nextruder while routing its NTC lead through the X-carriage hook. Keep the lead free, not trapped or nicked behind the heatsink. Align the unit, secure the PTFE fitting, then fasten the heatsink to its threaded spacers with three M3x10 screws.",
        "Při vracení Nextruderu veďte kabel NTC háčkem vozíku X. Za chladičem musí zůstat volný, neuskřípnutý a nepoškozený. Srovnejte sestavu, upevněte PTFE šroubení a chladič připevněte ke třem závitovým sloupkům šrouby M3x10.",
        "Beim Zurücksetzen des Nextruders die NTC-Leitung durch den X-Wagenhaken führen. Hinter dem Kühlkörper frei und ohne Einklemmen oder Beschädigung verlegen. Baugruppe ausrichten, PTFE-Verschraubung befestigen und den Kühlkörper mit drei M3x10 an den Gewindeabstandshaltern sichern."
      ],
      "refs": [
        788,
        794,
        "lbNtcLead"
      ],
      "number": 34,
      "officialId": 941642,
      "officialStep": 35,
      "source": "https://help.prusa3d.com/guide/how-to-replace-nextruder-filament-sensor-core-one_922421#941642",
      "sourceLineIds": [
        941656,
        941664,
        941672,
        941680,
        941688
      ]
    },
    {
      "id": "sensor-941696",
      "title": [
        "向きを合わせてファンを戻す",
        "Orient and refit the hotend fan",
        "Orientace a montáž ventilátoru hotendu",
        "Hotend-Lüfter ausrichten und montieren"
      ],
      "body": [
        "銀色ラベルの面をヒートシンク側、ケーブルを左向きにしてファンを置き、M3x18ねじ2本で固定します。",
        "Install the fan with the silver-label face against the heatsink and its lead pointing left. Use the two M3x18 screws.",
        "Ventilátor přiložte stříbrným štítkem k chladiči, kabelem doleva, a zajistěte dvěma M3x18.",
        "Den Lüfter mit der silbernen Etikettseite zum Kühlkörper und Kabel nach links ansetzen. Mit zwei M3x18 befestigen."
      ],
      "refs": [
        791,
        819,
        821,
        "serviceHotendFanLead"
      ],
      "number": 35,
      "officialId": 941696,
      "officialStep": 36,
      "source": "https://help.prusa3d.com/guide/how-to-replace-nextruder-filament-sensor-core-one_922421#941696",
      "sourceLineIds": [
        941706,
        941714,
        941722
      ]
    },
    {
      "id": "sensor-941730",
      "title": [
        "右側センサーとカバーを戻す",
        "Reconnect right sensors and refit the cover",
        "Připojení pravých senzorů a montáž krytu",
        "Rechte Sensoren anschließen und Abdeckung montieren"
      ],
      "body": [
        "右側のロードセル・フィラメントセンサーを接続し、樹脂カバーをM3x6ねじ2本で戻します。",
        "Reconnect the loadcell and filament sensor on the right, then reinstall their printed cover with two M3x6 screws.",
        "Vpravo zapojte loadcell a senzor filamentu, potom vraťte tištěný kryt se dvěma M3x6.",
        "Rechts Wägezelle und Filamentsensor wieder anschließen, dann die gedruckte Abdeckung mit zwei M3x6 montieren."
      ],
      "refs": [
        "lbLoadcellLead",
        "lbFilamentLead",
        "ventLever",
        870,
        872
      ],
      "number": 36,
      "officialId": 941730,
      "officialStep": 37,
      "source": "https://help.prusa3d.com/guide/how-to-replace-nextruder-filament-sensor-core-one_922421#941730",
      "sourceLineIds": [
        941742,
        941750
      ]
    },
    {
      "id": "sensor-941758",
      "title": [
        "モーター・NTC・ファンを接続する",
        "Connect motor, NTC and heatsink fan",
        "Připojení motoru, NTC a ventilátoru chladiče",
        "Motor, NTC und Kühlkörperlüfter anschließen"
      ],
      "body": [
        "上側にモーターを接続します。左側の内側寄り端子にはヒートシンクのNTC、左下の端子には前面のヒートシンクファンを接続します。",
        "Connect the motor at the top. On the left, use the inner connector for the heatsink NTC and the lower connector for the front heatsink fan.",
        "Nahoře připojte motor. Vlevo patří NTC chladiče do vnitřního konektoru a přední ventilátor chladiče do spodního.",
        "Motor oben anschließen. Links kommt der Kühlkörper-NTC an den weiter innen liegenden Anschluss und der vordere Kühlkörperlüfter an den unteren."
      ],
      "refs": [
        "lbMotorLead",
        "lbNtcLead",
        "serviceHotendFanLead",
        "loveBoard"
      ],
      "number": 37,
      "officialId": 941758,
      "officialStep": 38,
      "source": "https://help.prusa3d.com/guide/how-to-replace-nextruder-filament-sensor-core-one_922421#941758",
      "sourceLineIds": [
        941769,
        941777,
        941785
      ]
    },
    {
      "id": "sensor-941793",
      "title": [
        "プリントファンを配線して接続する",
        "Route and connect the print fan",
        "Vedení a připojení tiskového ventilátoru",
        "Drucklüfterkabel führen und anschließen"
      ],
      "body": [
        "プリントファン配線を樹脂カバーの溝へ通し、配線スペース内にループを作ります。LoveBoardの中央端子に接続します。",
        "Route the print-fan lead through the cover groove, form its loop in the cable space and connect it to the middle LoveBoard socket.",
        "Vodič tiskového ventilátoru veďte drážkou krytu, v prostoru pro kabely vytvořte smyčku a zapojte jej do prostřední zásuvky LoveBoardu.",
        "Drucklüfterleitung durch die Abdeckungsnut führen, im Kabelraum eine Schlaufe bilden und am mittleren LoveBoard-Anschluss einstecken."
      ],
      "refs": [
        "servicePrintLead",
        833,
        "loveBoard"
      ],
      "number": 38,
      "officialId": 941793,
      "officialStep": 39,
      "source": "https://help.prusa3d.com/guide/how-to-replace-nextruder-filament-sensor-core-one_922421#941793",
      "sourceLineIds": [
        941805,
        941813
      ]
    },
    {
      "id": "sensor-941821",
      "title": [
        "ホットエンドを奥まで差し込む",
        "Fully insert the hotend",
        "Úplné zasunutí hotendu",
        "Hotend vollständig einsetzen"
      ],
      "body": [
        "ホットエンドを底面から奥まで差し込み、ケーブルを少し斜め前へ向けます。本体がシュラウドのくぼみに写真どおり収まり、隙間があることを確認します。差し込みが浅く下へ出た状態で固定せず、上へ押し当てたままつまみねじ2本を締めます。",
        "Insert the hotend fully from below, with its leads angled slightly forward. Match the seated body and shroud recess to the photo, retaining the shown clearance. Do not fasten it while hanging below its seat; hold it upward as you tighten both thumbscrews.",
        "Hotend zespodu zcela zasuňte, kabely mírně šikmo dopředu. Usazení tělesa ve vybrání krytu ventilátoru i vůli porovnejte s fotografií. Neupevňujte jej nedosazený a vyčnívající dolů; při utažení obou ručních šroubů jej tlačte vzhůru.",
        "Hotend von unten vollständig einsetzen, Leitungen leicht schräg nach vorn. Sitz des Körpers in der Lüfteraussparung und Freiraum mit dem Foto vergleichen. Nicht unvollständig eingesetzt nach unten hängend befestigen; beim Anziehen beider Rändelschrauben nach oben halten."
      ],
      "refs": [
        "hotend",
        794,
        795,
        807,
        833
      ],
      "number": 39,
      "officialId": 941821,
      "officialStep": 40,
      "source": "https://help.prusa3d.com/guide/how-to-replace-nextruder-filament-sensor-core-one_922421#941821",
      "sourceLineIds": [
        941835,
        941843,
        941851,
        941859,
        941867
      ]
    },
    {
      "id": "sensor-941875",
      "title": [
        "銅リングが隠れているか確認する",
        "Check that the copper ring is hidden",
        "Kontrola skrytého měděného kroužku",
        "Verdeckten Kupferring prüfen"
      ],
      "body": [
        "正しく差し込めていれば、ノズルの銅リングは見えません。見える場合はつまみねじを緩めて入れ直し、上へ押し当てながら締め直します。浅いままだと熱が伝わりにくく、詰まりの原因になります。",
        "Check that the nozzle's copper ring is hidden. If visible, loosen the thumbscrews, reseat the hotend and retighten while pushing upward. An incompletely seated nozzle transfers heat poorly and can clog.",
        "Měděný kroužek trysky nesmí být vidět. Je-li odkrytý, povolte ruční šrouby, hotend znovu usaďte a při tlačení vzhůru dotáhněte. Nedostatečné zasunutí zhoršuje přenos tepla a může vést k ucpání.",
        "Der Kupferring an der Düse muss verdeckt sein. Ist er sichtbar, Rändelschrauben lösen, Hotend neu einsetzen und beim Hochdrücken wieder anziehen. Unvollständiger Sitz verschlechtert den Wärmeübergang und kann Verstopfungen verursachen."
      ],
      "refs": [
        "hotend",
        794,
        795,
        807
      ],
      "number": 40,
      "officialId": 941875,
      "officialStep": 41,
      "source": "https://help.prusa3d.com/guide/how-to-replace-nextruder-filament-sensor-core-one_922421#941875",
      "sourceLineIds": [
        941885,
        941893,
        941901
      ]
    },
    {
      "id": "sensor-941909",
      "title": [
        "サーミスター、ヒーターの順に配線する",
        "Route thermistor, then heater",
        "Vedení termistoru a poté topení",
        "Thermistor vor Heizung verlegen"
      ],
      "body": [
        "つまみねじの後ろの樹脂フックへ、サーミスター配線を先に、ヒーター配線を後から通します。",
        "In the plastic hook behind the thumbscrews, route the thermistor lead first and the heater lead second.",
        "Plastovým háčkem za ručními šrouby veďte nejprve kabel termistoru a potom topení.",
        "Durch den Kunststoffhaken hinter den Rändelschrauben zuerst die Thermistorleitung und danach die Heizleitung führen."
      ],
      "refs": [
        "hotendThermistor0",
        "hotendHeater0",
        857
      ],
      "number": 41,
      "officialId": 941909,
      "officialStep": 42,
      "source": "https://help.prusa3d.com/guide/how-to-replace-nextruder-filament-sensor-core-one_922421#941909",
      "sourceLineIds": [
        941919
      ]
    },
    {
      "id": "sensor-941927",
      "title": [
        "ホットエンドを接続する",
        "Connect the hotend",
        "Připojení hotendu",
        "Hotend anschließen"
      ],
      "body": [
        "LoveBoard左上にホットエンドのサーミスター、上部の黒い端子にヒーターを接続します。",
        "Use the upper-left LoveBoard socket for the hotend thermistor and the upper black socket for its heater.",
        "Termistor hotendu zapojte do levé horní zásuvky LoveBoardu, topení do horní černé.",
        "Hotend-Thermistor oben links am LoveBoard anschließen, die Heizung an der oberen schwarzen Buchse."
      ],
      "refs": [
        "hotendThermistor0",
        "hotendHeater0",
        "loveBoard"
      ],
      "number": 42,
      "officialId": 941927,
      "officialStep": 43,
      "source": "https://help.prusa3d.com/guide/how-to-replace-nextruder-filament-sensor-core-one_922421#941927",
      "sourceLineIds": [
        941941,
        941949
      ]
    },
    {
      "id": "sensor-941957",
      "title": [
        "配線を収めて左カバーを戻す",
        "Arrange leads and refit the left cover",
        "Uložení kabelů a montáž levého krytu",
        "Leitungen verstauen und linke Abdeckung montieren"
      ],
      "body": [
        "ケーブルをカバーの内側に収めます。左カバーの下を先に引っ掛けてNextruder側へ押し、M3x10ねじで固定します。ベッドの保護布を取り除きます。",
        "Tuck in protruding cables. Hook the left cover at its bottom, press it against the Nextruder and secure the M3x10 screw. Remove the bed-protection fabric.",
        "Přesahující kabely uložte dovnitř. Levý kryt nejprve zahákněte dole, přitlačte k Nextruderu a zajistěte M3x10. Ochrannou látku z podložky odstraňte.",
        "Überstehende Leitungen nach innen legen. Linke Abdeckung unten einhaken, zum Nextruder drücken und mit M3x10 befestigen. Schutzstoff vom Heizbett entfernen."
      ],
      "refs": [
        858,
        879,
        "heatbed"
      ],
      "number": 43,
      "officialId": 941957,
      "officialStep": 44,
      "source": "https://help.prusa3d.com/guide/how-to-replace-nextruder-filament-sensor-core-one_922421#941957",
      "sourceLineIds": [
        941987,
        941971,
        942003,
        942011,
        941979,
        941995
      ]
    },
    {
      "id": "sensor-942019",
      "title": [
        "上面カバーを戻す",
        "Refit the top cover",
        "Montáž horního krytu",
        "Oberen Deckel montieren"
      ],
      "body": [
        "ナイロンリベット式カバーを戻します。右奥の金属フレームと前側のくぼみに合わせ、写真の指定穴にリベット2本を入れて固定します。",
        "Refit the riveted cover, aligning the rear-right metal frame and front recess. Secure it with two nylon rivets in the pictured holes.",
        "Nýtovaný kryt srovnejte s pravým zadním rohem kovového rámu i předním vybráním. Upevněte jej dvěma nylonovými nýty v otvorech označených na fotografii.",
        "Genieteten Deckel hinten rechts am Metallrahmen und an der vorderen Aussparung ausrichten. Mit zwei Nylonnieten in den abgebildeten Öffnungen sichern."
      ],
      "refs": [
        87,
        "ventBlock"
      ],
      "number": 44,
      "officialId": 942019,
      "officialStep": 45,
      "source": "https://help.prusa3d.com/guide/how-to-replace-nextruder-filament-sensor-core-one_922421#942019",
      "sourceLineIds": [
        942031,
        942039,
        942047,
        942055
      ]
    },
    {
      "id": "sensor-942063",
      "title": [
        "電源を入れる",
        "Turn the printer on",
        "Zapnutí tiskárny",
        "Drucker einschalten"
      ],
      "body": [
        "ドアを閉め、電源コードを接続してプリンターを起動します。",
        "Close the door, reconnect the power cord and switch the printer on.",
        "Zavřete dvířka, připojte napájecí kabel a zapněte tiskárnu.",
        "Tür schließen, Netzkabel anschließen und den Drucker einschalten."
      ],
      "refs": [
        "psu",
        "lcd"
      ],
      "number": 45,
      "officialId": 942063,
      "officialStep": 46,
      "source": "https://help.prusa3d.com/guide/how-to-replace-nextruder-filament-sensor-core-one_922421#942063",
      "sourceLineIds": [
        942075,
        942083,
        942091
      ]
    },
    {
      "id": "sensor-942099",
      "title": [
        "変更したノズルの設定を合わせる",
        "Set up a changed nozzle",
        "Nastavení změněné trysky",
        "Geänderte Düse einstellen"
      ],
      "body": [
        "ノズル径や種類を変えた場合だけ、Settings → Hardware → Printheadで設定を合わせます。Nozzle diameterは実際の径（0.25 / 0.3 / 0.4 / 0.5 / 0.6 / 0.8 mmなど）、種類も実物に合わせ、ソック使用時はSilicone sockをオンにします。CORE Oneの標準は0.40 mm・High Flowですが、変更した部品を標準値に戻す必要はありません。",
        "Only if nozzle diameter or type changed, update Settings → Hardware → Printhead to match the installed nozzle. Select its diameter, for example 0.25 / 0.3 / 0.4 / 0.5 / 0.6 / 0.8 mm, its type, and Silicone sock if fitted. CORE One's defaults are 0.40 mm and High Flow, not a requirement for replacement parts.",
        "Pouze při změně průměru nebo typu trysky upravte Settings → Hardware → Printhead podle namontovaného dílu. Zvolte jeho průměr, například 0.25 / 0.3 / 0.4 / 0.5 / 0.6 / 0.8 mm, typ a při použití návleku zapněte Silicone sock. Výchozí CORE One používá 0,40 mm a High Flow; náhradní tryska těmto hodnotám odpovídat nemusí.",
        "Nur nach Änderung von Düsendurchmesser oder Düsentyp Settings → Hardware → Printhead an das eingebaute Teil anpassen. Durchmesser, etwa 0.25 / 0.3 / 0.4 / 0.5 / 0.6 / 0.8 mm, Düsentyp und gegebenenfalls Silicone sock wählen. 0,40 mm und High Flow sind CORE One-Standardwerte, keine Vorgabe für andere eingebaute Düsen."
      ],
      "refs": [
        "lcd",
        "hotend"
      ],
      "number": 46,
      "officialId": 942099,
      "officialStep": 47,
      "source": "https://help.prusa3d.com/guide/how-to-replace-nextruder-filament-sensor-core-one_922421#942099",
      "sourceLineIds": [
        942113,
        942121,
        942129,
        942137,
        942145,
        942153,
        942161
      ],
      "firmwareActions": [
        "printhead"
      ]
    },
    {
      "id": "sensor-942169",
      "title": [
        "Selftestと必須のギア位置合わせを行う",
        "Run Selftest and mandatory gearbox alignment",
        "Selftest a povinné zarovnání převodovky",
        "Selbsttest und vorgeschriebene Getriebeausrichtung ausführen"
      ],
      "body": [
        "Control → Calibrations & TestsからSelftestを実行し、Gearbox Alignment（ギアの位置合わせ）を必ず行います。Nextruderを開いた後は省略できません。省略すると異音・フィラメント削れ・押し出しむらの原因になります。画面の指示に従い、前面カバーの仮止めねじ3本も指定の段階で本締めします。すべてのテストが緑のチェックで合格してから使用を再開します。",
        "Run Selftest from Control → Calibrations & Tests and complete Gearbox Alignment. Alignment is mandatory after opening or servicing the Nextruder; skipping it risks ticking, ground filament and uneven extrusion. Follow the screen, including final tightening of the three provisional front-cover screws when directed. Resume use only after every test has a green pass.",
        "Spusťte Selftest z Control → Calibrations & Tests a proveďte Gearbox Alignment, tedy zarovnání převodovky. Po otevření či servisu Nextruderu je povinné; vynechání hrozí cvakáním, obrušováním filamentu a nestejnoměrnou extruzí. Podle displeje ve správné chvíli dotáhněte i tři předběžně upevněné šrouby předního krytu. Tiskárnu používejte až po zeleném potvrzení všech testů.",
        "Selftest unter Control → Calibrations & Tests starten und Gearbox Alignment, die Getriebeausrichtung, durchführen. Nach Öffnen oder Warten des Nextruders ist sie Pflicht; sonst drohen Ticken, Filamentabrieb und ungleichmäßige Extrusion. Den Bildschirmanweisungen folgen und die drei vorläufigen vorderen Deckelschrauben im vorgesehenen Schritt festziehen. Erst nach grünem Bestehen aller Tests wieder drucken."
      ],
      "refs": [
        "lcd",
        816,
        804,
        813,
        814,
        "pgAssembly"
      ],
      "number": 47,
      "officialId": 942169,
      "officialStep": 48,
      "source": "https://help.prusa3d.com/guide/how-to-replace-nextruder-filament-sensor-core-one_922421#942169",
      "sourceLineIds": [
        942179,
        1089453,
        942187
      ],
      "firmwareActions": [
        "selftest"
      ]
    }
  ],
  "interval": [
    "交換が必要なとき",
    "When replacement is needed",
    "Při potřebě výměny",
    "Bei erforderlichem Austausch"
  ]
};
for(let i=0;i<INTERNAL_SENSOR_TASK.steps.length;i++)INTERNAL_SENSOR_TASK.steps[i].sourcePhotos=INTERNAL_SENSOR_SOURCE.steps[i].images;
