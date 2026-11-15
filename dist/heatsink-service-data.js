// Independently worded maintenance instructions; photos remain in one shared source table.
import{HEATSINK_SERVICE_SOURCE}from'./heatsink-service-source.js';
export const HEATSINK_REPLACEMENT_TASK={
  "id": "heatsink-replacement",
  "heatsinkService": true,
  "category": 2,
  "revision": 1,
  "title": [
    "ヒートシンク本体を交換する",
    "Replace the hotend heatsink",
    "Výměna chladiče hotendu",
    "Hotend-Kühlkörper austauschen"
  ],
  "interval": [
    "交換が必要なとき",
    "When replacement is needed",
    "Při potřebě výměny",
    "Bei erforderlichem Austausch"
  ],
  "source": "https://help.prusa3d.com/guide/how-to-replace-hotend-heatsink-core-one_922437",
  "sourceUpdated": "2025-11-25 15:11:31",
  "products": [
    "core-one",
    "core-one-family",
    "core-one-plus"
  ],
  "steps": [
    {
      "id": "scope",
      "title": [
        "作業と適用構成を確認する",
        "Check the work and applicable variant",
        "Ověření postupu a provedení tiskárny",
        "Arbeit und passende Ausführung prüfen"
      ],
      "refs": [
        794,
        790,
        "mainPlate",
        "pgAssembly"
      ],
      "officialId": 923062,
      "officialStep": 2,
      "number": 1,
      "source": "https://help.prusa3d.com/guide/how-to-replace-hotend-heatsink-core-one_922437#923062",
      "sourceLineIds": [
        923063,
        923064,
        923065
      ],
      "body": [
        "ヒートシンク本体を交換し、元のNTCサーミスター・センサー・ギアを移します。写真のナイロンリベット式カバーと、球・磁石・ばね式センサーが実機に合うことを確認してください。異なる構成のCORE One+やアップグレード機は、その構成の公式手順を使います。交換部品はPrusaショップで確認できます。部品ページの閲覧にはログインが必要です。",
        "Replace the heatsink body and transfer the existing NTC, sensors and gears. Match your hardware to the pictured riveted cover and ball/magnet/spring sensor. Use the matching official procedure for a different CORE One+ or upgraded configuration. Prusa's shop lists spare parts; that section requires login.",
        "Vyměníte těleso chladiče a přenesete původní NTC, senzory a převody. Porovnejte tiskárnu s fotografiemi nýtovaného krytu a senzoru s kuličkou, magnetem a pružinou. Pro odlišnou výbavu CORE One+ nebo upraveného stroje použijte příslušný oficiální postup. Náhradní díly najdete v e-shopu Prusa; tato sekce vyžaduje přihlášení.",
        "Kühlkörper ersetzen und vorhandenen NTC, Sensoren und Getriebeteile übernehmen. Genieteten Deckel und Kugel-Magnet-Feder-Sensor mit den Fotos vergleichen. Bei abweichendem CORE One+ oder Umbau die passende offizielle Anleitung verwenden. Ersatzteile stehen im Prusa-Shop; dieser Bereich erfordert eine Anmeldung."
      ]
    },
    {
      "id": "prepare-tools",
      "title": [
        "工具を用意する",
        "Prepare the tools",
        "Příprava nářadí",
        "Werkzeuge bereitlegen"
      ],
      "refs": [
        "pgAdapter",
        811
      ],
      "officialId": 923836,
      "officialStep": 3,
      "number": 2,
      "source": "https://help.prusa3d.com/guide/how-to-replace-hotend-heatsink-core-one_922437#923836",
      "sourceLineIds": [
        923846,
        923854,
        930561,
        923862,
        946704,
        946705
      ],
      "body": [
        "2.5 mm六角レンチ、T6・T10トルクス工具、PG組立アダプター1個を用意します。アダプターはPrintablesのCORE One部品ページから入手できます。先細ペンチ、Prusa Lubricant、塗布用の結束バンドなど、ペーパータオル、ベッド保護用の厚い布も使います。\nhttps://www.printables.com/model/1167816-core-one-printable-parts/files",
        "Gather a 2.5 mm hex key, T6 and T10 Torx tools, and one PG assembly adapter, available from the CORE One parts page on Printables. Also have needle-nose pliers, Prusa Lubricant, an applicator such as a zip tie, paper towels and thick bed-protection fabric.\nhttps://www.printables.com/model/1167816-core-one-printable-parts/files",
        "Připravte imbus 2,5 mm, nástroje Torx T6 a T10 a jeden montážní adaptér PG z nabídky dílů CORE One na Printables. Potřebovat budete také špičaté kleště, Prusa Lubricant, aplikátor například ze stahovací pásky, papírovou utěrku a silnou látku na ochranu podložky.\nhttps://www.printables.com/model/1167816-core-one-printable-parts/files",
        "2,5-mm-Innensechskantschlüssel, Torx T6 und T10 sowie einen PG-Montageadapter bereitlegen. Der Adapter ist bei den CORE One-Druckteilen auf Printables erhältlich. Dazu Spitzzange, Prusa Lubricant, einen Applikator wie einen Kabelbinder, Papiertücher und dicken Schutzstoff fürs Heizbett vorbereiten.\nhttps://www.printables.com/model/1167816-core-one-printable-parts/files"
      ]
    },
    {
      "id": "unload-cooldown",
      "title": [
        "アンロードして完全に冷やす",
        "Unload and cool completely",
        "Vysunutí filamentu a úplné vychladnutí",
        "Entladen und vollständig abkühlen"
      ],
      "refs": [
        "lcd",
        "hotend"
      ],
      "firmwareActions": [
        "unload",
        "cooldown"
      ],
      "officialId": 923094,
      "officialStep": 4,
      "number": 3,
      "source": "https://help.prusa3d.com/guide/how-to-replace-hotend-heatsink-core-one_922437#923094",
      "sourceLineIds": [
        923132,
        923108,
        923116,
        923124,
        923140,
        923148
      ],
      "body": [
        "ドアを閉め、Filament → Unload filamentでフィラメントを抜き、スプールも外します。その後Preheat → COOLDOWNを選び、温度が室温に下がるまで待ってください。",
        "Close the door, use Filament → Unload filament, then remove the filament and spool. Select Preheat → COOLDOWN and wait until the printer reaches room temperature.",
        "Zavřete dvířka, spusťte Filament → Unload filament a vyjměte filament i cívku. Poté zvolte Preheat → COOLDOWN a vyčkejte na pokojovou teplotu.",
        "Tür schließen, Filament → Unload filament ausführen und Filament samt Spule entfernen. Danach Preheat → COOLDOWN wählen und bis auf Raumtemperatur abkühlen lassen."
      ]
    },
    {
      "id": "lower-bed-power-off",
      "title": [
        "ベッドを下げて電源を切る",
        "Lower the bed and disconnect power",
        "Spuštění podložky a odpojení napájení",
        "Heizbett absenken und Netz trennen"
      ],
      "refs": [
        "lcd",
        "bedSupport",
        "heatbed",
        "sheet",
        "psu"
      ],
      "officialId": 923156,
      "officialStep": 5,
      "number": 4,
      "source": "https://help.prusa3d.com/guide/how-to-replace-hotend-heatsink-core-one_922437#923156",
      "sourceLineIds": [
        923178,
        923170,
        923186,
        923194
      ],
      "body": [
        "Control → Move Axis → Move Zを100 mm以上に設定し、ベッドが下がり終わるのを待ちます。背面スイッチで電源を切り、電源コードを抜きます。",
        "Set Control → Move Axis → Move Z to at least 100 mm and let the bed finish lowering. Switch off at the rear and unplug the power cord.",
        "V Control → Move Axis → Move Z nastavte alespoň 100 mm a počkejte na zastavení podložky v dolní poloze. Zadním vypínačem tiskárnu vypněte a odpojte napájecí kabel.",
        "Control → Move Axis → Move Z auf mindestens 100 mm stellen und das Absenken des Heizbetts abwarten. Hinten ausschalten und das Netzkabel abziehen."
      ],
      "firmwareActions": [
        "moveZ"
      ]
    },
    {
      "id": "top-cover-remove",
      "title": [
        "上面カバーを外す",
        "Remove the top cover",
        "Sejmutí horního krytu",
        "Oberen Deckel abnehmen"
      ],
      "refs": [
        87,
        "ventBlock"
      ],
      "officialId": 923202,
      "officialStep": 6,
      "number": 5,
      "source": "https://help.prusa3d.com/guide/how-to-replace-hotend-heatsink-core-one_922437#923202",
      "sourceLineIds": [
        923216,
        923224,
        923232,
        923240
      ],
      "body": [
        "ナイロンリベット式カバーの手順です。ドアを開き、右前のリベットを内側から押して解除し、外側から抜きます。残りも同じように外して、上面カバーを取り外します。",
        "For the pictured nylon-rivet cover, open the door and release the front-right rivet by pushing from inside; pull it out from outside. Remove the remaining rivets the same way, then lift off the cover.",
        "Tento krok platí pro vyobrazený kryt s nylonovými nýty. Otevřete dvířka, pravý přední nýt vytlačte zevnitř a vytáhněte zvenku. Stejně vyjměte ostatní nýty a sejměte horní kryt.",
        "Dieser Schritt gilt für den abgebildeten Deckel mit Nylonnieten. Tür öffnen, den Niet vorn rechts von innen entriegeln und von außen herausziehen. Weitere Nieten ebenso entfernen, dann den Deckel abnehmen."
      ]
    },
    {
      "id": "protect-heatbed",
      "title": [
        "ヒートベッドを保護する",
        "Protect the heatbed",
        "Ochrana vyhřívané podložky",
        "Heizbett schützen"
      ],
      "refs": [
        "heatbed",
        "sheet"
      ],
      "officialId": 923248,
      "officialStep": 7,
      "number": 6,
      "source": "https://help.prusa3d.com/guide/how-to-replace-hotend-heatsink-core-one_922437#923248",
      "sourceLineIds": [
        923258,
        923266
      ],
      "body": [
        "部品を外す前に、ヒートベッドを厚い布などで覆います。工具や部品で表面を傷つけないよう保護してください。",
        "Cover the heatbed with thick fabric before removing parts, protecting its surface from tools and loose components.",
        "Než začnete rozebírat díly, zakryjte vyhřívanou podložku silnou látkou proti poškrábání nářadím a součástkami.",
        "Vor dem Ausbau das Heizbett mit dickem Stoff abdecken, damit Werkzeuge und lose Teile die Oberfläche nicht zerkratzen."
      ]
    },
    {
      "id": "left-cover-remove",
      "title": [
        "Nextruderの左カバーを外す",
        "Remove the Nextruder left cover",
        "Sejmutí levého krytu Nextruderu",
        "Linke Nextruder-Abdeckung abnehmen"
      ],
      "refs": [
        858,
        879
      ],
      "officialId": 923274,
      "officialStep": 8,
      "number": 7,
      "source": "https://help.prusa3d.com/guide/how-to-replace-hotend-heatsink-core-one_922437#923274",
      "sourceLineIds": [
        923286,
        923294,
        923302
      ],
      "body": [
        "Nextruder左側のM3x10ねじを2.5 mm六角レンチで外し、側面カバーを取り外します。",
        "At the left side of the Nextruder, remove the cover's M3x10 screw with the 2.5 mm hex key, then take off the cover.",
        "Na levém boku Nextruderu vyšroubujte imbusem 2,5 mm šroub M3x10 a sundejte kryt.",
        "Links am Nextruder die M3x10-Schraube mit dem 2,5-mm-Innensechskantschlüssel entfernen und die Abdeckung abnehmen."
      ]
    },
    {
      "id": "hotend-disconnect",
      "title": [
        "ホットエンドの配線を抜く",
        "Disconnect the hotend leads",
        "Odpojení kabelů hotendu",
        "Hotend-Leitungen abstecken"
      ],
      "refs": [
        "hotendHeater0",
        "hotendThermistor0",
        "loveBoard"
      ],
      "officialId": 923310,
      "officialStep": 9,
      "number": 8,
      "source": "https://help.prusa3d.com/guide/how-to-replace-hotend-heatsink-core-one_922437#923310",
      "sourceLineIds": [
        923324,
        923332,
        923340
      ],
      "body": [
        "ロックを押して解除し、ホットエンドのヒーター、続いてサーミスターのコネクターを抜きます。ロックを解除せずに引き抜くと破損します。",
        "Release each connector latch before unplugging the hotend heater and then its thermistor. Pulling against a locked latch can damage the connector.",
        "Stisknutím pojistky uvolněte nejprve konektor topení hotendu a potom jeho termistoru. Tah za neodjištěný konektor jej může poškodit.",
        "Jeweils die Verriegelung lösen, dann zuerst Hotend-Heizung und anschließend Thermistor abstecken. Ein verriegelter Stecker kann beim Abziehen beschädigt werden."
      ]
    },
    {
      "id": "hotend-remove",
      "title": [
        "ホットエンドを支えて抜く",
        "Support and remove the hotend",
        "Podepření a vyjmutí hotendu",
        "Hotend halten und herausziehen"
      ],
      "refs": [
        "hotend",
        795,
        807,
        857
      ],
      "officialId": 923348,
      "officialStep": 10,
      "number": 9,
      "source": "https://help.prusa3d.com/guide/how-to-replace-hotend-heatsink-core-one_922437#923348",
      "sourceLineIds": [
        923362,
        923370,
        923378,
        923394,
        923386
      ],
      "body": [
        "配線をガイドから外し、ホットエンドを片手で支えます。つまみねじ2本を数回転だけ緩め、落とさないよう本体を引き抜きます。ねじは抜き取らなくて構いません。",
        "Free the cables from their guide and support the hotend. Loosen both thumbscrews a few turns without removing them, then withdraw the assembly while keeping it supported.",
        "Uvolněte kabely z vedení a hotend přidržte. Oba ruční šrouby pouze o několik otáček povolte, nevytahujte je. Hotend vysuňte tak, aby nevypadl.",
        "Kabel aus der Führung lösen und das Hotend festhalten. Beide Rändelschrauben nur einige Umdrehungen lockern, nicht herausnehmen. Die Baugruppe beim Herausziehen gegen Herunterfallen sichern."
      ]
    },
    {
      "id": "motor-fans-ntc-disconnect",
      "title": [
        "モーター・ファン・NTCを抜線する",
        "Disconnect motor, fans and NTC",
        "Odpojení motoru, ventilátorů a NTC",
        "Motor, Lüfter und NTC abstecken"
      ],
      "refs": [
        "servicePrintLead",
        "lbMotorLead",
        "lbNtcLead",
        "serviceHotendFanLead",
        "loveBoard"
      ],
      "officialId": 929564,
      "officialStep": 11,
      "number": 10,
      "source": "https://help.prusa3d.com/guide/how-to-replace-hotend-heatsink-core-one_922437#929564",
      "sourceLineIds": [
        929565,
        929566,
        929567
      ],
      "body": [
        "プリントファンを抜き、その配線を後ろへ逃がします。上側のモーターと、ヒートシンクのサーミスター・ファンも接続を外します。",
        "Unplug the print fan and move its lead rearward. Disconnect the motor at the top, plus the heatsink thermistor and heatsink fan.",
        "Odpojte tiskový ventilátor a jeho kabel odložte dozadu. Odpojte motor nahoře a také termistor a ventilátor chladiče.",
        "Drucklüfter abstecken und sein Kabel nach hinten legen. Den Motor oben sowie Thermistor und Lüfter des Kühlkörpers abstecken."
      ]
    },
    {
      "id": "right-cover-sensors-disconnect",
      "title": [
        "右カバーとセンサー配線を外す",
        "Remove right cover and disconnect sensors",
        "Sejmutí pravého krytu a odpojení senzorů",
        "Rechte Abdeckung und Sensorkabel lösen"
      ],
      "refs": [
        "ventLever",
        870,
        872,
        "lbLoadcellLead",
        "lbFilamentLead"
      ],
      "officialId": 929600,
      "officialStep": 12,
      "number": 11,
      "source": "https://help.prusa3d.com/guide/how-to-replace-hotend-heatsink-core-one_922437#929600",
      "sourceLineIds": [
        929601,
        929602
      ],
      "body": [
        "右側カバーのM3x6ねじ2本を外してカバーを取り、ロードセルとフィラメントセンサーを抜きます。",
        "Remove the right cover and its two M3x6 screws, then disconnect the loadcell and filament sensor.",
        "Po vyjmutí dvou šroubů M3x6 sejměte pravý kryt a odpojte loadcell i senzor filamentu.",
        "Die rechte Abdeckung mit ihren zwei M3x6-Schrauben abnehmen, anschließend Wägezelle und Filamentsensor abstecken."
      ]
    },
    {
      "id": "hotend-fan-remove",
      "title": [
        "ホットエンドファンを外す",
        "Remove the hotend fan",
        "Demontáž ventilátoru hotendu",
        "Hotend-Lüfter ausbauen"
      ],
      "refs": [
        791,
        819,
        821
      ],
      "officialId": 929626,
      "officialStep": 13,
      "number": 12,
      "source": "https://help.prusa3d.com/guide/how-to-replace-hotend-heatsink-core-one_922437#929626",
      "sourceLineIds": [
        929627
      ],
      "body": [
        "M3x18ねじ2本を外し、ヒートシンクからホットエンドファンを取り外します。",
        "Undo the two M3x18 fasteners and remove the hotend fan from the heatsink.",
        "Vyjměte oba šrouby M3x18 a oddělte ventilátor hotendu od chladiče.",
        "Beide M3x18-Befestigungen lösen und den Hotend-Lüfter vom Kühlkörper abnehmen."
      ]
    },
    {
      "id": "nextruder-remove",
      "title": [
        "Nextruderを外す",
        "Remove the Nextruder",
        "Demontáž Nextruderu",
        "Nextruder ausbauen"
      ],
      "refs": [
        788,
        794,
        "lbNtcLead"
      ],
      "officialId": 929648,
      "officialStep": 14,
      "number": 13,
      "source": "https://help.prusa3d.com/guide/how-to-replace-hotend-heatsink-core-one_922437#929648",
      "sourceLineIds": [
        929649,
        929650,
        929651
      ],
      "body": [
        "正面のM3x10ねじ3本を外し、上側のPTFE継手を緩めて取り外します。Nextruderを支えてゆっくりキャリッジから離し、その際にサーミスター配線をキャリッジのフックから外します。",
        "Remove the three front M3x10 screws and unscrew the upper PTFE fitting. Support the released Nextruder, move it slowly away from the carriage and unhook the thermistor lead as you go.",
        "Vyjměte tři přední šrouby M3x10 a vyšroubujte horní PTFE šroubení. Uvolněný Nextruder přidržte, pomalu oddalte od vozíku a současně vyhákněte kabel termistoru.",
        "Die drei vorderen M3x10-Schrauben und die obere PTFE-Verschraubung entfernen. Den gelösten Nextruder halten, langsam vom Wagen abnehmen und dabei das Thermistorkabel aus dem Haken lösen."
      ]
    },
    {
      "id": "thumbscrews-ntc-remove",
      "title": [
        "つまみねじとNTCを外す",
        "Remove thumbscrews and NTC",
        "Vyjmutí ručních šroubů a NTC",
        "Rändelschrauben und NTC ausbauen"
      ],
      "refs": [
        795,
        807,
        806,
        811,
        "lbNtcLead"
      ],
      "officialId": 929680,
      "officialStep": 15,
      "number": 14,
      "source": "https://help.prusa3d.com/guide/how-to-replace-hotend-heatsink-core-one_922437#929680",
      "sourceLineIds": [
        929683,
        929681,
        929682
      ],
      "body": [
        "つまみねじ2本を抜き取ります。T6の短辺でM3x4T止めねじを外し、ケーブルを傷めないようNTCサーミスターを取り出します。",
        "Take out both thumbscrews. Use the short end of the T6 key to remove the M3x4T grub screw, then withdraw the NTC without damaging its leads.",
        "Vyjměte oba ruční šrouby. Krátkou stranou klíče T6 vyšroubujte M3x4T a opatrně vytáhněte NTC, aniž poškodíte jeho vodiče.",
        "Beide Rändelschrauben herausnehmen. Mit dem kurzen Ende des T6-Schlüssels die M3x4T-Madenschraube entfernen und den NTC ohne Beschädigung seiner Leitungen herausziehen."
      ]
    },
    {
      "id": "swivel-pg-cover-remove",
      "title": [
        "スイベルとPGカバーを外す",
        "Remove the swivel and PG cover",
        "Demontáž otočného dílu a krytu PG",
        "Schwenkhebel und PG-Abdeckung ausbauen"
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
      "officialId": 929716,
      "officialStep": 16,
      "number": 15,
      "source": "https://help.prusa3d.com/guide/how-to-replace-hotend-heatsink-core-one_922437#929716",
      "sourceLineIds": [
        929717,
        929718,
        929719,
        929720
      ],
      "body": [
        "ばね付きM3x30ねじ2本とアイドラー支持部（Idler-swivel）を外します。続いてM3x25ねじを外し、ギアボックス前面の樹脂カバー（PG-case）を取ります。",
        "Remove both spring-loaded M3x30 screws and the Idler-swivel support. Undo the M3x25 fasteners and lift away the plastic PG-case at the gearbox front.",
        "Vyjměte oba šrouby M3x30 s pružinami a držák Idler-swivel. Poté odšroubujte M3x25 a sejměte přední plastový kryt převodovky PG-case.",
        "Beide M3x30-Schrauben samt Federn und die Idler-swivel-Halterung abnehmen. Danach M3x25-Schrauben entfernen und die vordere Kunststoffabdeckung PG-case abheben."
      ]
    },
    {
      "id": "idler-gearbox-remove-clean",
      "title": [
        "アイドラーとギアを外して清掃する",
        "Remove and clean idler and gearbox parts",
        "Vyjmutí idleru a čištění převodovky",
        "Idler und Getriebe ausbauen und reinigen"
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
      "officialId": 929756,
      "officialStep": 17,
      "number": 16,
      "source": "https://help.prusa3d.com/guide/how-to-replace-hotend-heatsink-core-one_922437#929756",
      "sourceLineIds": [
        929757,
        929758,
        929759,
        929760
      ],
      "body": [
        "「3本ねじ」版だけはM3x25止めねじも外します。アイドラーを取り、樹脂メインプレート・真鍮PGリング・ギアをまとめて外します。各パーツの余分なグリスと汚れを落とします。",
        "On the three-screw version, also remove its M3x25 set screw. Take out the idler, then the printed main plate, brass PG ring and gears as an assembly. Clean excess grease and dirt from every gearbox part.",
        "U tříšroubového provedení vyjměte také stavěcí šroub M3x25. Vyjměte idler a pak sestavu tištěné hlavní desky, mosazného PG kroužku a kol. Ze všech dílů převodovky očistěte přebytečné mazivo a nečistoty.",
        "Bei der Dreischrauben-Ausführung auch die M3x25-Madenschraube entfernen. Idler herausnehmen, dann gedruckte Hauptplatte, Messing-PG-Ring und Zahnräder gemeinsam abheben. Überschüssiges Fett und Schmutz von allen Getriebeteilen entfernen."
      ]
    },
    {
      "id": "washer-motor-remove",
      "title": [
        "ワッシャーを確認してモーターを外す",
        "Check the washer and remove the motor",
        "Kontrola podložky a vyjmutí motoru",
        "Scheibe prüfen und Motor ausbauen"
      ],
      "refs": [
        792,
        790,
        794
      ],
      "officialId": 929796,
      "officialStep": 18,
      "number": 17,
      "source": "https://help.prusa3d.com/guide/how-to-replace-hotend-heatsink-core-one_922437#929796",
      "sourceLineIds": [
        929797,
        929798,
        929799,
        929800
      ],
      "body": [
        "モーターとギアボックスの間の金属ワッシャーを探します。ギア側に付いていたり外れていたりする場合は、最後の写真を見てモーター軸に戻します。その後モーターをヒートシンクから外します。",
        "Find the washer between motor and gearbox; it may have stayed on the gears. If displaced, return it to the motor shaft using the last photo as reference. Then separate the motor from the heatsink.",
        "Zkontrolujte podložku mezi motorem a převodovkou, případně přichycenou k převodům. Uvolněnou podložku vraťte podle poslední fotografie na hřídel motoru. Potom oddělte motor od chladiče.",
        "Die Scheibe zwischen Motor und Getriebe suchen; sie kann am Getriebe haften. Falls verrutscht, nach dem letzten Foto auf die Motorwelle zurücksetzen. Anschließend den Motor vom Kühlkörper trennen."
      ]
    },
    {
      "id": "hall-board-remove",
      "title": [
        "Hallセンサー基板を外す",
        "Remove the Hall sensor board",
        "Demontáž Hallova senzoru",
        "Hall-Sensorplatine ausbauen"
      ],
      "refs": [
        "hallSensor",
        "lbFilamentLead",
        794,
        812
      ],
      "officialId": 929836,
      "officialStep": 19,
      "number": 18,
      "source": "https://help.prusa3d.com/guide/how-to-replace-hotend-heatsink-core-one_922437#929836",
      "sourceLineIds": [
        929837,
        929838
      ],
      "body": [
        "M2.5x6rTねじを外し、Hall式フィラメントセンサー基板を慎重に取り外します。",
        "Remove the M2.5x6rT screw and carefully lift out the Hall filament-sensor board.",
        "Po vyšroubování M2.5x6rT opatrně vyjměte desku Hallova senzoru filamentu.",
        "M2.5x6rT-Schraube entfernen und die Hall-Filamentsensorplatine vorsichtig herausnehmen."
      ]
    },
    {
      "id": "filament-mechanism-remove",
      "title": [
        "小部品を保持してセンサー機構を抜く",
        "Retain small parts and remove the sensor mechanism",
        "Vyjmutí mechanismu se zachycením drobných dílů",
        "Sensormechanik mit gesicherten Kleinteilen herausziehen"
      ],
      "refs": [
        "hallHolder",
        "hallBall",
        "hallMagnet",
        "hallSpring",
        794
      ],
      "officialId": 929860,
      "officialStep": 20,
      "number": 19,
      "source": "https://help.prusa3d.com/guide/how-to-replace-hotend-heatsink-core-one_922437#929860",
      "sourceLineIds": [
        929861,
        929862,
        929863
      ],
      "body": [
        "先細ペンチでセンサー機構をゆっくり引き抜きます。中の小さなばね・磁石・鋼球が落ちるので、紛失しないよう受け止め、再使用まで保管してください。",
        "Ease the sensor mechanism out with needle-nose pliers, catching its loose spring, magnet and steel ball. Keep all three small parts safely for reuse.",
        "Špičatými kleštěmi pomalu vytáhněte mechanismus senzoru a zachyťte uvolněnou pružinu, magnet i ocelovou kuličku. Všechny drobné díly bezpečně uschovejte pro další montáž.",
        "Den Sensormechanismus langsam mit der Spitzzange herausziehen und lose Feder, Magnet und Stahlkugel auffangen. Alle Kleinteile zur Wiederverwendung sicher aufbewahren."
      ]
    },
    {
      "id": "replacement-heatsink-prepare",
      "title": [
        "新しいヒートシンクを用意する",
        "Prepare the replacement heatsink",
        "Příprava nového chladiče",
        "Neuen Kühlkörper vorbereiten"
      ],
      "refs": [
        "heatsinkServiceOriginal",
        "heatsinkReplacement",
        "lbLoadcellLead"
      ],
      "officialId": 929892,
      "officialStep": 21,
      "number": 20,
      "source": "https://help.prusa3d.com/guide/how-to-replace-hotend-heatsink-core-one_922437#929892",
      "sourceLineIds": [
        929893,
        929894
      ],
      "body": [
        "交換用ヒートシンクを1個用意します。公式写真の交換品にはロードセルの配線が付いています。",
        "Have one replacement heatsink ready. The replacement shown in the official photo has its loadcell lead attached.",
        "Připravte jeden náhradní chladič. Vyobrazený náhradní díl má připojené vedení loadcellu.",
        "Einen Ersatzkühlkörper bereitlegen. Das auf dem offiziellen Foto gezeigte Ersatzteil besitzt eine angeschlossene Wägezellenleitung."
      ]
    },
    {
      "id": "hall-board-install",
      "title": [
        "Hallセンサー基板を移す",
        "Install the Hall sensor board",
        "Montáž Hallova senzoru",
        "Hall-Sensorplatine montieren"
      ],
      "refs": [
        "hallSensor",
        "heatsinkReplacement",
        812
      ],
      "officialId": 929916,
      "officialStep": 22,
      "number": 21,
      "source": "https://help.prusa3d.com/guide/how-to-replace-hotend-heatsink-core-one_922437#929916",
      "sourceLineIds": [
        929917,
        929918
      ],
      "body": [
        "Hallセンサー基板を形の合うくぼみに置き、M2.5x6rTねじで固定します。基板が割れないよう、慎重に締めてください。",
        "Seat the Hall board in its matching pocket and secure it with the M2.5x6rT screw. Tighten carefully to avoid cracking the board.",
        "Desku Hallova senzoru usaďte do odpovídající kapsy a upevněte M2.5x6rT. Dotahujte opatrně, aby deska nepraskla.",
        "Hall-Platine in die passende Tasche legen und mit M2.5x6rT befestigen. Behutsam anziehen, damit die Platine nicht bricht."
      ]
    },
    {
      "id": "filament-mechanism-install",
      "title": [
        "向きを合わせてセンサー機構を戻す",
        "Orient and install the sensor mechanism",
        "Orientace a montáž mechanismu senzoru",
        "Sensormechanik ausrichten und einsetzen"
      ],
      "refs": [
        "hallHolder",
        "hallBall",
        "hallMagnet",
        "hallSpring",
        "heatsinkReplacement"
      ],
      "officialId": 929940,
      "officialStep": 23,
      "number": 22,
      "source": "https://help.prusa3d.com/guide/how-to-replace-hotend-heatsink-core-one_922437#929940",
      "sourceLineIds": [
        929941,
        929942,
        929943
      ],
      "body": [
        "センサー機構の鋼球側をヒートシンクの側面寄り、突起を下向きにします。その向きで押し込み、金属面と面一に収めます。",
        "Orient the sensor mechanism with its ball toward the heatsink side and its protrusion downward. Press it into place until flush with the metal surface.",
        "Mechanismus natočte kuličkou k boku chladiče a výstupkem dolů. V této poloze jej zatlačte do roviny s kovovým povrchem.",
        "Sensormechanismus mit der Kugel zur Kühlkörperseite und dem Vorsprung nach unten ausrichten. Bis bündig zur Metallfläche einschieben."
      ]
    },
    {
      "id": "motor-heatsink-mainplate-install",
      "title": [
        "モーターとメインプレートを組む",
        "Fit motor, heatsink and main plate",
        "Montáž motoru, chladiče a hlavní desky",
        "Motor, Kühlkörper und Hauptplatte montieren"
      ],
      "refs": [
        790,
        "heatsinkReplacement",
        792,
        "mainPlate",
        "lbMotorLead",
        "lbFilamentLead"
      ],
      "officialId": 930060,
      "officialStep": 24,
      "number": 23,
      "source": "https://help.prusa3d.com/guide/how-to-replace-hotend-heatsink-core-one_922437#930060",
      "sourceLineIds": [
        930061,
        930062,
        930063,
        930064,
        930065
      ],
      "body": [
        "写真の向きに合わせ、モーターのケーブルを上、ヒートシンクのケーブルを右にして重ねます。切り欠きを合わせてメインプレートを載せ、5x10x0.1スペーサーがモーターに残っていることを確認します。",
        "Match the photo: motor lead upward, heatsink leads to the right. Stack the heatsink and main plate, aligning the plate's cutout. Confirm the 5x10x0.1 spacer is still on the motor before proceeding.",
        "Díly natočte jako na fotografii: kabel motoru nahoru, kabely chladiče doprava. Na motor položte chladič a hlavní desku podle výřezu. Před pokračováním zkontrolujte podložku 5x10x0.1 na motoru.",
        "Nach dem Foto ausrichten: Motorkabel nach oben, Kühlkörperleitungen nach rechts. Kühlkörper und Hauptplatte aufsetzen, dabei die Aussparung ausrichten. Vor dem Fortfahren die Scheibe 5x10x0.1 am Motor prüfen."
      ]
    },
    {
      "id": "pg-adapter-install",
      "title": [
        "PGアダプターを付ける",
        "Fit the PG assembly adapter",
        "Nasazení PG adaptéru",
        "PG-Assembly-Adapter aufsetzen"
      ],
      "refs": [
        "pgAdapter",
        "pgAssembly"
      ],
      "officialId": 929972,
      "officialStep": 25,
      "number": 24,
      "source": "https://help.prusa3d.com/guide/how-to-replace-hotend-heatsink-core-one_922437#929972",
      "sourceLineIds": [
        929973,
        929974,
        929975
      ],
      "body": [
        "公式のPG組立動画を見てから、この順序で進めます。アダプターのギア用くぼみを合わせ、PGギア一式に組立アダプターを取り付けます。\nhttps://prusa.io/PG-assembly",
        "Watch the official PG assembly video, then follow this sequence carefully. Match the adapter pockets to the gears and fit the PG assembly adapter.\nhttps://prusa.io/PG-assembly",
        "Nejprve zhlédněte oficiální video montáže PG a pak pečlivě pokračujte v tomto pořadí. Srovnejte kapsy adaptéru s koly a nasaďte montážní adaptér PG.\nhttps://prusa.io/PG-assembly",
        "Zuerst das offizielle PG-Montagevideo ansehen, danach sorgfältig dieser Reihenfolge folgen. Zahnräder auf die Adaptertaschen ausrichten und den PG-Montageadapter aufsetzen.\nhttps://prusa.io/PG-assembly"
      ]
    },
    {
      "id": "pg-ring-install",
      "title": [
        "面取り側を下にしてPGリングを組む",
        "Fit the PG ring with its chamfer down",
        "Nasazení PG kroužku zkosením dolů",
        "PG-Ring mit der Fase nach unten montieren"
      ],
      "refs": [
        "pgAdapter",
        "pgRing",
        "pgAssembly"
      ],
      "officialId": 930004,
      "officialStep": 26,
      "number": 25,
      "source": "https://help.prusa3d.com/guide/how-to-replace-hotend-heatsink-core-one_922437#930004",
      "sourceLineIds": [
        930005,
        930006,
        930007,
        930008,
        930009,
        930010
      ],
      "body": [
        "組立アダプターは必須です。PGリングの面取りがある歯面をギア側へ向け、アダプターに通します。一式を片手で持ち、もう片方でリングを約1/4回転の範囲で左右に揺すって入れます。ギアとリングの面がほぼそろったら止めます。",
        "The PG assembly adapter is required. With the ring's chamfered tooth side toward the gears, slide it over the adapter. Support the assembly and work the ring on with alternating turns over about a quarter turn. Stop when gear and ring faces are nearly level.",
        "Montážní adaptér je pro tento krok nutný. PG kroužek nasuňte zkosenou stranou zubů ke kolům. Sestavu přidržte a kroužek nasazujte střídavým otáčením zhruba o čtvrt otáčky. Skončete, když jsou čela kol a kroužku téměř v rovině.",
        "Der Montageadapter ist hier erforderlich. Den PG-Ring mit der angefasten Zahnseite zu den Zahnrädern über den Adapter schieben. Baugruppe halten und den Ring mit wechselnden Drehbewegungen über etwa eine Viertelumdrehung aufsetzen. Stoppen, sobald Zahnrad- und Ringflächen annähernd bündig sind."
      ]
    },
    {
      "id": "pg-assembly-seat",
      "title": [
        "PG一式をモーター軸へ収める",
        "Seat the PG assembly on the motor shaft",
        "Usazení sestavy PG na hřídel motoru",
        "PG-Baugruppe auf die Motorwelle setzen"
      ],
      "refs": [
        "pgAssembly",
        "pgRing",
        "pgAdapter",
        "mainPlate",
        790
      ],
      "officialId": 930108,
      "officialStep": 27,
      "number": 26,
      "source": "https://help.prusa3d.com/guide/how-to-replace-hotend-heatsink-core-one_922437#930108",
      "sourceLineIds": [
        930109,
        930110,
        930111,
        930112
      ],
      "body": [
        "一式を崩さずモーター軸に載せ、アダプター・ギア・リングをまとめてそっと回します。自然に下まで収まり、メインプレートとの隙間がなくなったことを確認してから、アダプターを外します。",
        "Keep the adapter, gears and ring together while fitting them onto the motor shaft. Gently turn the complete unit until it drops into its seat without a gap to the main plate, then remove the adapter.",
        "Adaptér, kola i kroužek držte pohromadě při nasazování na hřídel. Celou jednotkou jemně otáčejte, až sama dosedne bez mezery u hlavní desky. Teprve potom adaptér sejměte.",
        "Adapter, Zahnräder und Ring beim Aufsetzen auf die Motorwelle zusammenhalten. Die ganze Einheit vorsichtig drehen, bis sie ohne Spalt zur Hauptplatte von selbst sitzt. Dann den Adapter abnehmen."
      ]
    },
    {
      "id": "pg-rotation-seating-check",
      "title": [
        "PGの回転・突出・隙間を確認する",
        "Check PG rotation, height and gap",
        "Kontrola otáčení, výšky a mezery PG",
        "PG-Drehung, Überstand und Spalt prüfen"
      ],
      "refs": [
        "pgAdapter",
        "pgAssembly",
        "pgRing",
        "mainPlate"
      ],
      "officialId": 930148,
      "officialStep": 28,
      "number": 27,
      "source": "https://help.prusa3d.com/guide/how-to-replace-hotend-heatsink-core-one_922437#930148",
      "sourceLineIds": [
        930149,
        930150,
        930151,
        930152,
        930153
      ],
      "body": [
        "アダプターを付け直し、力をかけず軽く回るか確認します。確認後は外して整備用に保管します。ギアの面がPGリングより高くないこと、リングとメインプレートの隙間が小さいことを確認し、大きな隙間があれば外して組み直します。",
        "Refit the adapter to check that the gears turn easily without force, then remove and keep it. Gear faces must be level with or below the ring. Check the ring-to-main-plate gap; a substantial gap requires removing and reseating the gearbox.",
        "Adaptér znovu nasaďte a ověřte lehké otáčení bez síly. Pak jej sejměte a uschovejte. Kola nesmějí být nad čelem kroužku. Zkontrolujte malou mezeru mezi kroužkem a hlavní deskou; při výrazné mezeře převodovku vyjměte a znovu usaďte.",
        "Adapter nochmals aufsetzen und leichtgängiges Drehen ohne Kraft prüfen. Danach abnehmen und aufbewahren. Zahnradflächen dürfen den Ring nicht überragen. Den kleinen Spalt zwischen Ring und Hauptplatte prüfen; bei deutlichem Abstand das Getriebe abnehmen und neu einsetzen."
      ]
    },
    {
      "id": "idler-install",
      "title": [
        "アイドラーを取り付ける",
        "Install the idler",
        "Montáž idleru",
        "Idler montieren"
      ],
      "refs": [
        796,
        "pgRing",
        "mainPlate",
        790
      ],
      "officialId": 930196,
      "officialStep": 29,
      "number": 28,
      "source": "https://help.prusa3d.com/guide/how-to-replace-hotend-heatsink-core-one_922437#930196",
      "sourceLineIds": [
        930197,
        930198
      ],
      "body": [
        "アイドラーをPGリングとモーターの間へ入れます。メインプレートの切り欠きにスペーサーを合わせ、PGリングの穴と位置をそろえます。3x25の六角穴付き止めねじで固定します。締め過ぎず、ねじがリングから突き出す状態を保ちます。",
        "Fit the idler between ring and motor, locating its spacer in the plate cutout and aligning it with the ring hole. Secure it with the 3x25 socket set screw without overtightening; the screw remains proud of the ring.",
        "Idler vložte mezi kroužek a motor. Jeho vložku usaďte do výřezu desky a srovnejte s otvorem kroužku. Zajistěte stavěcím šroubem 3x25 s vnitřním šestihranem. Nepřetahujte; šroub má z kroužku vyčnívat.",
        "Idler zwischen Ring und Motor einsetzen, den Abstandshalter in der Plattenaussparung auf die Ringbohrung ausrichten. Mit der 3x25-Innensechskant-Madenschraube sichern, ohne zu überdrehen; die Schraube steht anschließend über den Ring hinaus."
      ]
    },
    {
      "id": "gear-teeth-lubricate",
      "title": [
        "ギアの歯に潤滑剤を塗る",
        "Lubricate the gear teeth",
        "Mazání zubů převodovky",
        "Getriebezähne schmieren"
      ],
      "refs": [
        "pgRing",
        "pgAssembly"
      ],
      "officialId": 930220,
      "officialStep": 30,
      "number": 29,
      "source": "https://help.prusa3d.com/guide/how-to-replace-hotend-heatsink-core-one_922437#930220",
      "sourceLineIds": [
        930221,
        930222
      ],
      "body": [
        "結束バンドの先などにPrusa Lubricantを少量取り、PGリングとPGギアの歯の全周へ薄く塗ります。",
        "Use a zip-tie tip or another applicator to spread a small amount of Prusa Lubricant around the complete circumference of both the PG ring and gear teeth.",
        "Špičkou stahovací pásky nebo jiným aplikátorem rozetřete malé množství Prusa Lubricant po celém obvodu zubů PG kroužku i kol.",
        "Mit einer Kabelbinderspitze oder einem anderen Applikator wenig Prusa Lubricant rund um sämtliche Zähne von PG-Ring und Zahnrädern verteilen."
      ]
    },
    {
      "id": "pg-cover-provisionally-install",
      "title": [
        "PGカバーを仮止めする",
        "Provisionally fit the PG cover",
        "Předběžná montáž krytu PG",
        "PG-Abdeckung vorläufig befestigen"
      ],
      "refs": [
        816,
        804,
        813,
        814,
        "pgRing"
      ],
      "officialId": 930244,
      "officialStep": 31,
      "number": 30,
      "source": "https://help.prusa3d.com/guide/how-to-replace-hotend-heatsink-core-one_922437#930244",
      "sourceLineIds": [
        930245,
        930246,
        930247
      ],
      "body": [
        "リング正面に残ったグリスをペーパータオルで拭き、前面カバーをM3x25ねじ3本で仮止めします。本締めは最後のSelftest中です。今は締め切りません。",
        "Wipe grease from the ring's front face with a paper towel. Fit the front cover with three M3x25 screws, leaving them provisional. Final tightening belongs to the later Selftest procedure.",
        "Papírovou utěrkou očistěte čelo kroužku od maziva. Přední kryt přichyťte třemi M3x25 pouze předběžně; úplné dotažení přijde až při závěrečném Selftestu.",
        "Fett mit einem Papiertuch von der Ringstirnfläche wischen. Vorderen Deckel mit drei M3x25-Schrauben nur vorläufig befestigen. Endgültig werden sie erst beim abschließenden Selbsttest angezogen."
      ]
    },
    {
      "id": "idler-swivel-install",
      "title": [
        "ばねとアイドラースイベルを戻す",
        "Refit springs and idler swivel",
        "Montáž pružin a otočného dílu idleru",
        "Federn und Idler-Schwenkhebel montieren"
      ],
      "refs": [
        798,
        805,
        815,
        "idlerSpring1",
        "idlerSpring2",
        "idlerSwivelSpacer",
        "heatsinkReplacement"
      ],
      "officialId": 930276,
      "officialStep": 32,
      "number": 31,
      "source": "https://help.prusa3d.com/guide/how-to-replace-hotend-heatsink-core-one_922437#930276",
      "sourceLineIds": [
        930277,
        930278,
        930279,
        930280
      ],
      "body": [
        "M3x30ねじ2本に15x5ばねを1個ずつ付け、ヒートシンクの穴へ通します。写真の向きでアイドラー支持部を取り付け、ねじ先端がアイドラーナットの正面と面一になったら締めるのを止めます。",
        "Put one 15x5 spring on each M3x30 screw and pass both through the heatsink. Fit the Idler-swivel in the pictured orientation. Stop tightening when the screw tips meet the idler nut's front face; do not drive them farther.",
        "Na každý ze dvou M3x30 navlékněte pružinu 15x5 a oba protáhněte chladičem. Nasaďte držák Idler-swivel podle fotografie. Dotahování zastavte, jakmile jsou špičky šroubů v rovině s předním čelem matice idleru.",
        "Auf jede M3x30-Schraube eine 15x5-Feder setzen und beide durch den Kühlkörper führen. Idler-swivel wie abgebildet montieren. Sobald die Schraubenspitzen mit der Vorderseite der Idler-Mutter bündig sind, nicht weiter anziehen."
      ]
    },
    {
      "id": "ntc-thumbscrews-install",
      "title": [
        "NTCとつまみねじを戻す",
        "Refit the NTC and thumbscrews",
        "Montáž NTC a ručních šroubů",
        "NTC und Rändelschrauben montieren"
      ],
      "refs": [
        806,
        811,
        795,
        807,
        "lbNtcLead",
        "heatsinkReplacement"
      ],
      "officialId": 930327,
      "officialStep": 33,
      "number": 32,
      "source": "https://help.prusa3d.com/guide/how-to-replace-hotend-heatsink-core-one_922437#930327",
      "sourceLineIds": [
        930328,
        930329,
        930351
      ],
      "body": [
        "NTCをモーター側から差し込み、M3x4T止めねじで留めます。T6の短辺を2本の指で持ち、確実に、ただし締め過ぎずに固定します。センサーとねじ山を傷めないでください。つまみねじ2本は2回転だけ入れ、まだ本締めしません。",
        "Insert the NTC from the motor side and secure it with M3x4T. Hold the T6 key's short side with two fingers for controlled tightening; avoid damaging the sensor or threads. Start both thumbscrews by two turns only.",
        "NTC zasuňte ze strany motoru a zajistěte M3x4T. Krátkou stranu T6 držte dvěma prsty a utahujte s citem, abyste nepoškodili senzor ani závit. Oba ruční šrouby prozatím zašroubujte jen o dvě otáčky.",
        "NTC von der Motorseite einsetzen und mit M3x4T sichern. Den kurzen T6-Schenkel mit zwei Fingern halten und kontrolliert anziehen, ohne Sensor oder Gewinde zu beschädigen. Beide Rändelschrauben zunächst nur zwei Umdrehungen einschrauben."
      ]
    },
    {
      "id": "nextruder-install",
      "title": [
        "Nextruderをキャリッジへ戻す",
        "Refit the Nextruder to its carriage",
        "Montáž Nextruderu na vozík",
        "Nextruder am Wagen montieren"
      ],
      "refs": [
        788,
        "heatsinkReplacement",
        "lbNtcLead"
      ],
      "officialId": 930359,
      "officialStep": 34,
      "number": 33,
      "source": "https://help.prusa3d.com/guide/how-to-replace-hotend-heatsink-core-one_922437#930359",
      "sourceLineIds": [
        930360,
        930361,
        930362,
        930363,
        930364
      ],
      "body": [
        "Nextruderを戻しながら、NTC配線をXキャリッジのフックへ通します。ヒートシンクの裏で挟まず、自由に通る状態を保ってください。位置を合わせてPTFE継手で留め、ねじ付きスペーサーにヒートシンクを合わせてM3x10ねじ3本で固定します。",
        "Return the Nextruder while routing its NTC lead through the X-carriage hook. Keep the lead free, not trapped or nicked behind the heatsink. Align the unit, secure the PTFE fitting, then fasten the heatsink to its threaded spacers with three M3x10 screws.",
        "Při vracení Nextruderu veďte kabel NTC háčkem vozíku X. Za chladičem musí zůstat volný, neuskřípnutý a nepoškozený. Srovnejte sestavu, upevněte PTFE šroubení a chladič připevněte ke třem závitovým sloupkům šrouby M3x10.",
        "Beim Zurücksetzen des Nextruders die NTC-Leitung durch den X-Wagenhaken führen. Hinter dem Kühlkörper frei und ohne Einklemmen oder Beschädigung verlegen. Baugruppe ausrichten, PTFE-Verschraubung befestigen und den Kühlkörper mit drei M3x10 an den Gewindeabstandshaltern sichern."
      ]
    },
    {
      "id": "hotend-fan-install",
      "title": [
        "向きを合わせてファンを戻す",
        "Orient and refit the hotend fan",
        "Orientace a montáž ventilátoru hotendu",
        "Hotend-Lüfter ausrichten und montieren"
      ],
      "refs": [
        791,
        819,
        821,
        "serviceHotendFanLead"
      ],
      "officialId": 930409,
      "officialStep": 35,
      "number": 34,
      "source": "https://help.prusa3d.com/guide/how-to-replace-hotend-heatsink-core-one_922437#930409",
      "sourceLineIds": [
        930410,
        930411,
        930412
      ],
      "body": [
        "銀色ラベルの面をヒートシンク側、ケーブルを左向きにしてファンを置き、M3x18ねじ2本で固定します。",
        "Install the fan with the silver-label face against the heatsink and its lead pointing left. Use the two M3x18 screws.",
        "Ventilátor přiložte stříbrným štítkem k chladiči, kabelem doleva, a zajistěte dvěma M3x18.",
        "Den Lüfter mit der silbernen Etikettseite zum Kühlkörper und Kabel nach links ansetzen. Mit zwei M3x18 befestigen."
      ]
    },
    {
      "id": "right-sensors-cover-install",
      "title": [
        "右側センサーとカバーを戻す",
        "Reconnect right sensors and refit the cover",
        "Připojení pravých senzorů a montáž krytu",
        "Rechte Sensoren anschließen und Abdeckung montieren"
      ],
      "refs": [
        "lbLoadcellLead",
        "lbFilamentLead",
        "ventLever",
        870,
        872
      ],
      "officialId": 930441,
      "officialStep": 36,
      "number": 35,
      "source": "https://help.prusa3d.com/guide/how-to-replace-hotend-heatsink-core-one_922437#930441",
      "sourceLineIds": [
        930442,
        930443
      ],
      "body": [
        "右側のロードセル・フィラメントセンサーを接続し、樹脂カバーをM3x6ねじ2本で戻します。",
        "Reconnect the loadcell and filament sensor on the right, then reinstall their printed cover with two M3x6 screws.",
        "Vpravo zapojte loadcell a senzor filamentu, potom vraťte tištěný kryt se dvěma M3x6.",
        "Rechts Wägezelle und Filamentsensor wieder anschließen, dann die gedruckte Abdeckung mit zwei M3x6 montieren."
      ]
    },
    {
      "id": "motor-ntc-fan-connect",
      "title": [
        "モーター・NTC・ファンを接続する",
        "Connect motor, NTC and heatsink fan",
        "Připojení motoru, NTC a ventilátoru chladiče",
        "Motor, NTC und Kühlkörperlüfter anschließen"
      ],
      "refs": [
        "lbMotorLead",
        "lbNtcLead",
        "serviceHotendFanLead",
        "loveBoard"
      ],
      "officialId": 930518,
      "officialStep": 37,
      "number": 36,
      "source": "https://help.prusa3d.com/guide/how-to-replace-hotend-heatsink-core-one_922437#930518",
      "sourceLineIds": [
        930519,
        930520,
        930521
      ],
      "body": [
        "上側にモーターを接続します。左側の内側寄り端子にはヒートシンクのNTC、左下の端子には前面のヒートシンクファンを接続します。",
        "Connect the motor at the top. On the left, use the inner connector for the heatsink NTC and the lower connector for the front heatsink fan.",
        "Nahoře připojte motor. Vlevo patří NTC chladiče do vnitřního konektoru a přední ventilátor chladiče do spodního.",
        "Motor oben anschließen. Links kommt der Kühlkörper-NTC an den weiter innen liegenden Anschluss und der vordere Kühlkörperlüfter an den unteren."
      ]
    },
    {
      "id": "print-fan-route-connect",
      "title": [
        "プリントファンを配線して接続する",
        "Route and connect the print fan",
        "Vedení a připojení tiskového ventilátoru",
        "Drucklüfterkabel führen und anschließen"
      ],
      "refs": [
        "servicePrintLead",
        833,
        "loveBoard"
      ],
      "officialId": 930470,
      "officialStep": 38,
      "number": 37,
      "source": "https://help.prusa3d.com/guide/how-to-replace-hotend-heatsink-core-one_922437#930470",
      "sourceLineIds": [
        930474,
        930475
      ],
      "body": [
        "プリントファン配線を樹脂カバーの溝へ通し、配線スペース内にループを作ります。LoveBoardの中央端子に接続します。",
        "Route the print-fan lead through the cover groove, form its loop in the cable space and connect it to the middle LoveBoard socket.",
        "Vodič tiskového ventilátoru veďte drážkou krytu, v prostoru pro kabely vytvořte smyčku a zapojte jej do prostřední zásuvky LoveBoardu.",
        "Drucklüfterleitung durch die Abdeckungsnut führen, im Kabelraum eine Schlaufe bilden und am mittleren LoveBoard-Anschluss einstecken."
      ]
    },
    {
      "id": "hotend-insert",
      "title": [
        "ホットエンドを奥まで差し込む",
        "Fully insert the hotend",
        "Úplné zasunutí hotendu",
        "Hotend vollständig einsetzen"
      ],
      "refs": [
        "hotend",
        "heatsinkReplacement",
        795,
        807,
        833
      ],
      "officialId": 923452,
      "officialStep": 39,
      "number": 38,
      "source": "https://help.prusa3d.com/guide/how-to-replace-hotend-heatsink-core-one_922437#923452",
      "sourceLineIds": [
        923466,
        923474,
        923482,
        923490,
        923498
      ],
      "body": [
        "ホットエンドを底面から奥まで差し込み、ケーブルを少し斜め前へ向けます。本体がシュラウドのくぼみに写真どおり収まり、隙間があることを確認します。差し込みが浅く下へ出た状態で固定せず、上へ押し当てたままつまみねじ2本を締めます。",
        "Insert the hotend fully from below, with its leads angled slightly forward. Match the seated body and shroud recess to the photo, retaining the shown clearance. Do not fasten it while hanging below its seat; hold it upward as you tighten both thumbscrews.",
        "Hotend zespodu zcela zasuňte, kabely mírně šikmo dopředu. Usazení tělesa ve vybrání krytu ventilátoru i vůli porovnejte s fotografií. Neupevňujte jej nedosazený a vyčnívající dolů; při utažení obou ručních šroubů jej tlačte vzhůru.",
        "Hotend von unten vollständig einsetzen, Leitungen leicht schräg nach vorn. Sitz des Körpers in der Lüfteraussparung und Freiraum mit dem Foto vergleichen. Nicht unvollständig eingesetzt nach unten hängend befestigen; beim Anziehen beider Rändelschrauben nach oben halten."
      ]
    },
    {
      "id": "nozzle-seating-check",
      "title": [
        "銅リングが隠れているか確認する",
        "Check that the copper ring is hidden",
        "Kontrola skrytého měděného kroužku",
        "Verdeckten Kupferring prüfen"
      ],
      "refs": [
        "hotend",
        "heatsinkReplacement",
        795,
        807
      ],
      "officialId": 923506,
      "officialStep": 40,
      "number": 39,
      "source": "https://help.prusa3d.com/guide/how-to-replace-hotend-heatsink-core-one_922437#923506",
      "sourceLineIds": [
        923516,
        923524,
        923532
      ],
      "body": [
        "正しく差し込めていれば、ノズルの銅リングは見えません。見える場合はつまみねじを緩めて入れ直し、上へ押し当てながら締め直します。浅いままだと熱が伝わりにくく、詰まりの原因になります。",
        "Check that the nozzle's copper ring is hidden. If visible, loosen the thumbscrews, reseat the hotend and retighten while pushing upward. An incompletely seated nozzle transfers heat poorly and can clog.",
        "Měděný kroužek trysky nesmí být vidět. Je-li odkrytý, povolte ruční šrouby, hotend znovu usaďte a při tlačení vzhůru dotáhněte. Nedostatečné zasunutí zhoršuje přenos tepla a může vést k ucpání.",
        "Der Kupferring an der Düse muss verdeckt sein. Ist er sichtbar, Rändelschrauben lösen, Hotend neu einsetzen und beim Hochdrücken wieder anziehen. Unvollständiger Sitz verschlechtert den Wärmeübergang und kann Verstopfungen verursachen."
      ]
    },
    {
      "id": "hotend-leads-route",
      "title": [
        "サーミスター、ヒーターの順に配線する",
        "Route thermistor, then heater",
        "Vedení termistoru a poté topení",
        "Thermistor vor Heizung verlegen"
      ],
      "refs": [
        "hotendThermistor0",
        "hotendHeater0",
        857
      ],
      "officialId": 923540,
      "officialStep": 41,
      "number": 40,
      "source": "https://help.prusa3d.com/guide/how-to-replace-hotend-heatsink-core-one_922437#923540",
      "sourceLineIds": [
        923550
      ],
      "body": [
        "つまみねじの後ろの樹脂フックへ、サーミスター配線を先に、ヒーター配線を後から通します。",
        "In the plastic hook behind the thumbscrews, route the thermistor lead first and the heater lead second.",
        "Plastovým háčkem za ručními šrouby veďte nejprve kabel termistoru a potom topení.",
        "Durch den Kunststoffhaken hinter den Rändelschrauben zuerst die Thermistorleitung und danach die Heizleitung führen."
      ]
    },
    {
      "id": "hotend-connect",
      "title": [
        "ホットエンドを接続する",
        "Connect the hotend",
        "Připojení hotendu",
        "Hotend anschließen"
      ],
      "refs": [
        "hotendThermistor0",
        "hotendHeater0",
        "loveBoard"
      ],
      "officialId": 923558,
      "officialStep": 42,
      "number": 41,
      "source": "https://help.prusa3d.com/guide/how-to-replace-hotend-heatsink-core-one_922437#923558",
      "sourceLineIds": [
        923572,
        923580
      ],
      "body": [
        "LoveBoard左上にホットエンドのサーミスター、上部の黒い端子にヒーターを接続します。",
        "Use the upper-left LoveBoard socket for the hotend thermistor and the upper black socket for its heater.",
        "Termistor hotendu zapojte do levé horní zásuvky LoveBoardu, topení do horní černé.",
        "Hotend-Thermistor oben links am LoveBoard anschließen, die Heizung an der oberen schwarzen Buchse."
      ]
    },
    {
      "id": "left-cover-install",
      "title": [
        "配線を収めて左カバーを戻す",
        "Arrange leads and refit the left cover",
        "Uložení kabelů a montáž levého krytu",
        "Leitungen verstauen und linke Abdeckung montieren"
      ],
      "refs": [
        858,
        879,
        "heatbed"
      ],
      "officialId": 923588,
      "officialStep": 43,
      "number": 42,
      "source": "https://help.prusa3d.com/guide/how-to-replace-hotend-heatsink-core-one_922437#923588",
      "sourceLineIds": [
        923618,
        923602,
        923634,
        923642,
        923610,
        923626
      ],
      "body": [
        "ケーブルをカバーの内側に収めます。左カバーの下を先に引っ掛けてNextruder側へ押し、M3x10ねじで固定します。ベッドの保護布を取り除きます。",
        "Tuck in protruding cables. Hook the left cover at its bottom, press it against the Nextruder and secure the M3x10 screw. Remove the bed-protection fabric.",
        "Přesahující kabely uložte dovnitř. Levý kryt nejprve zahákněte dole, přitlačte k Nextruderu a zajistěte M3x10. Ochrannou látku z podložky odstraňte.",
        "Überstehende Leitungen nach innen legen. Linke Abdeckung unten einhaken, zum Nextruder drücken und mit M3x10 befestigen. Schutzstoff vom Heizbett entfernen."
      ]
    },
    {
      "id": "top-cover-install",
      "title": [
        "上面カバーを戻す",
        "Refit the top cover",
        "Montáž horního krytu",
        "Oberen Deckel montieren"
      ],
      "refs": [
        87,
        "ventBlock"
      ],
      "officialId": 923650,
      "officialStep": 44,
      "number": 43,
      "source": "https://help.prusa3d.com/guide/how-to-replace-hotend-heatsink-core-one_922437#923650",
      "sourceLineIds": [
        923662,
        923670,
        923678,
        923686
      ],
      "body": [
        "ナイロンリベット式カバーを戻します。右奥の金属フレームと前側のくぼみに合わせ、写真の指定穴にリベット2本を入れて固定します。",
        "Refit the riveted cover, aligning the rear-right metal frame and front recess. Secure it with two nylon rivets in the pictured holes.",
        "Nýtovaný kryt srovnejte s pravým zadním rohem kovového rámu i předním vybráním. Upevněte jej dvěma nylonovými nýty v otvorech označených na fotografii.",
        "Genieteten Deckel hinten rechts am Metallrahmen und an der vorderen Aussparung ausrichten. Mit zwei Nylonnieten in den abgebildeten Öffnungen sichern."
      ]
    },
    {
      "id": "power-on",
      "title": [
        "電源を入れる",
        "Turn the printer on",
        "Zapnutí tiskárny",
        "Drucker einschalten"
      ],
      "refs": [
        "psu",
        "lcd"
      ],
      "officialId": 923694,
      "officialStep": 45,
      "number": 44,
      "source": "https://help.prusa3d.com/guide/how-to-replace-hotend-heatsink-core-one_922437#923694",
      "sourceLineIds": [
        923706,
        923714,
        923722
      ],
      "body": [
        "ドアを閉め、電源コードを接続してプリンターを起動します。",
        "Close the door, reconnect the power cord and switch the printer on.",
        "Zavřete dvířka, připojte napájecí kabel a zapněte tiskárnu.",
        "Tür schließen, Netzkabel anschließen und den Drucker einschalten."
      ]
    },
    {
      "id": "nozzle-settings",
      "title": [
        "変更したノズルの設定を合わせる",
        "Set up a changed nozzle",
        "Nastavení změněné trysky",
        "Geänderte Düse einstellen"
      ],
      "refs": [
        "lcd",
        "hotend"
      ],
      "firmwareActions": [
        "printhead"
      ],
      "officialId": 923730,
      "officialStep": 46,
      "number": 45,
      "source": "https://help.prusa3d.com/guide/how-to-replace-hotend-heatsink-core-one_922437#923730",
      "sourceLineIds": [
        923744,
        923752,
        923760,
        923768,
        923776,
        923784,
        923792
      ],
      "body": [
        "ノズル径や種類を変えた場合だけ、Settings → Hardware → Printheadで設定を合わせます。Nozzle diameterは実際の径（0.25 / 0.3 / 0.4 / 0.5 / 0.6 / 0.8 mmなど）、種類も実物に合わせ、ソック使用時はSilicone sockをオンにします。CORE Oneの標準は0.40 mm・High Flowですが、変更した部品を標準値に戻す必要はありません。",
        "Only if nozzle diameter or type changed, update Settings → Hardware → Printhead to match the installed nozzle. Select its diameter, for example 0.25 / 0.3 / 0.4 / 0.5 / 0.6 / 0.8 mm, its type, and Silicone sock if fitted. CORE One's defaults are 0.40 mm and High Flow, not a requirement for replacement parts.",
        "Pouze při změně průměru nebo typu trysky upravte Settings → Hardware → Printhead podle namontovaného dílu. Zvolte jeho průměr, například 0.25 / 0.3 / 0.4 / 0.5 / 0.6 / 0.8 mm, typ a při použití návleku zapněte Silicone sock. Výchozí CORE One používá 0,40 mm a High Flow; náhradní tryska těmto hodnotám odpovídat nemusí.",
        "Nur nach Änderung von Düsendurchmesser oder Düsentyp Settings → Hardware → Printhead an das eingebaute Teil anpassen. Durchmesser, etwa 0.25 / 0.3 / 0.4 / 0.5 / 0.6 / 0.8 mm, Düsentyp und gegebenenfalls Silicone sock wählen. 0,40 mm und High Flow sind CORE One-Standardwerte, keine Vorgabe für andere eingebaute Düsen."
      ]
    },
    {
      "id": "selftest-gearbox-alignment",
      "title": [
        "Selftestと必須のギア位置合わせを行う",
        "Run Selftest and mandatory gearbox alignment",
        "Selftest a povinné zarovnání převodovky",
        "Selbsttest und vorgeschriebene Getriebeausrichtung ausführen"
      ],
      "refs": [
        "lcd",
        816,
        804,
        813,
        814,
        "pgAssembly"
      ],
      "firmwareActions": [
        "selftest"
      ],
      "officialId": 923800,
      "officialStep": 47,
      "number": 46,
      "source": "https://help.prusa3d.com/guide/how-to-replace-hotend-heatsink-core-one_922437#923800",
      "sourceLineIds": [
        923812,
        923820,
        1089262
      ],
      "body": [
        "Control → Calibrations & TestsからSelftestを実行し、Gearbox Alignment（ギアの位置合わせ）を必ず行います。Nextruderを開いた後は省略できません。省略すると異音・フィラメント削れ・押し出しむらの原因になります。画面の指示に従い、前面カバーの仮止めねじ3本も指定の段階で本締めします。すべてのテストが緑のチェックで合格してから使用を再開します。",
        "Run Selftest from Control → Calibrations & Tests and complete Gearbox Alignment. Alignment is mandatory after opening or servicing the Nextruder; skipping it risks ticking, ground filament and uneven extrusion. Follow the screen, including final tightening of the three provisional front-cover screws when directed. Resume use only after every test has a green pass.",
        "Spusťte Selftest z Control → Calibrations & Tests a proveďte Gearbox Alignment, tedy zarovnání převodovky. Po otevření či servisu Nextruderu je povinné; vynechání hrozí cvakáním, obrušováním filamentu a nestejnoměrnou extruzí. Podle displeje ve správné chvíli dotáhněte i tři předběžně upevněné šrouby předního krytu. Tiskárnu používejte až po zeleném potvrzení všech testů.",
        "Selftest unter Control → Calibrations & Tests starten und Gearbox Alignment, die Getriebeausrichtung, durchführen. Nach Öffnen oder Warten des Nextruders ist sie Pflicht; sonst drohen Ticken, Filamentabrieb und ungleichmäßige Extrusion. Den Bildschirmanweisungen folgen und die drei vorläufigen vorderen Deckelschrauben im vorgesehenen Schritt festziehen. Erst nach grünem Bestehen aller Tests wieder drucken."
      ]
    }
  ]
};
for(const step of HEATSINK_REPLACEMENT_TASK.steps)step.sourcePhotos=HEATSINK_SERVICE_SOURCE.steps.find(source=>source.id===step.officialId).images;
