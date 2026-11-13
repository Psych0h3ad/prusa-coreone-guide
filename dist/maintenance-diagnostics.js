import {completeMaintenanceRoutes} from './maintenance-completion-routes.js?v=20261113-123';
// Editorial diagnostic routes. Observations identify checks, not confirmed faults.
import {japaneseDiagnostics,JAPANESE_DIAGNOSTIC_SOURCES} from './diagnostic-ja.js?v=20261113-115';
import {localizeDiagnostics,addNozzleMethodRoutes} from './diagnostic-locales.js';
const l=s=>s.split('|');
export const DIAGNOSTIC_SOURCES={...JAPANESE_DIAGNOSTIC_SOURCES,
 clog:'https://help.prusa3d.com/article/clogged-nozzle-core-one-core-one-l-xl-mk4-s-mk3-9-s_411823',
 obstruction:'https://help.prusa3d.com/article/loading-obstruction-31119-core-one-35119-core-one-l-17119-xl_916795',
 stuck:'https://help.prusa3d.com/article/stuck-filament-detection-31101-core-one-35101-core-one-l-26101-mk4s-13101-mk4-27101-mk3-9s-21101-mk3-9-17108-xl_690089',
 sensor:'https://help.prusa3d.com/article/nextruder-filament-sensor-core-one-core-one-l-mk4-s-mk3-9-s-xl_465702',
 care:'https://help.prusa3d.com/article/regular-printer-maintenance-core-one_829710',
 cold:'https://help.prusa3d.com/article/cold-pull-31702-core-one-35702-core-one-l_930551',
 belts:'https://help.prusa3d.com/article/adjusting-belt-tension-core-one-core-one-indx-core-one-l_845048',
 support:'https://www.prusa3d.com/page/ask-us-anything_482/',
 nozzleMethods:'https://help.prusa3d.com/article/changing-or-replacing-the-prusa-nozzle_734706'
};
const choice=(title,next)=>({title:l(title),next});
const inspect=(step)=>({task:'clog',step});
const node=(title,body,extra={})=>({title:l(title),body:l(body),...extra});
const BASE_DIAGNOSTIC_NODES={
 start:node('どんな症状ですか？|What are you seeing?|Jaký problém pozorujete?|Was beobachten Sie?',
  '実機で確認できる症状を選びます。|Choose what you can observe on the printer.|Vyberte příznak, který na tiskárně pozorujete.|Wählen Sie das am Drucker beobachtete Verhalten.',{choices:[
   choice('フィラメントが入らない|Filament will not load|Filament nelze zavést|Filament lässt sich nicht laden','location'),
   choice('吐出が細い・途切れる／ギアが鳴る|Weak extrusion or clicking|Slabá extruze nebo cvakání|Schwache Extrusion oder Klicken','flow'),
   choice('Loading obstruction #31119|Loading obstruction #31119|Loading obstruction #31119|Loading obstruction #31119','obstruction'),
   choice('Stuck filament #31101|Stuck filament #31101|Stuck filament #31101|Stuck filament #31101','supply'),
   choice('ファンや軸の音が気になる|Fan or axis noise|Hluk ventilátoru nebo os|Lüfter- oder Achsgeräusche','noise'),
   choice('別の症状・エラー|Another symptom or error|Jiný příznak nebo chyba|Anderes Symptom oder Fehler','support')]}),
 location:node('どこで止まりますか？|Where does it stop?|Kde se filament zastaví?|Wo bleibt das Filament stehen?',
  '無理に押し込まず、確認できた位置を選びます。わからない場合は3Dで通路を順に確認できます。|Do not force it. Choose the point you have identified, or inspect the path in 3D.|Netlačte silou. Vyberte zjištěné místo, nebo si cestu postupně prohlédněte ve 3D.|Nicht mit Gewalt drücken. Wählen Sie die erkannte Stelle oder prüfen Sie den Weg in 3D.',{sources:['stuck','clog'],choices:[
   choice('スプール・側面入口・PTFEの途中|Spool, side inlet or PTFE tube|Cívka, boční vstup nebo PTFE trubička|Spule, Seiteneingang oder PTFE-Schlauch','supply'),
   choice('Nextruderの入口|Nextruder inlet|Vstup Nextruderu|Nextruder-Eingang','inlet'),
   choice('送りギアのあたり|At the drive gear|U podávacího kola|Am Antriebsrad','gear'),
   choice('ギアを越えるが、ノズルから出ない|Past the gear, but nothing exits|Projde kolem, ale z trysky nevychází|Hinter dem Rad, aber ohne Austritt','fragment-check'),
   choice('位置がわからない|I cannot tell where|Místo nepoznám|Die Stelle ist unklar','path')]}),
 supply:node('供給側を確認する|Check the supply path|Zkontrolujte přívod|Zufuhr prüfen',
  'スプールの絡まり、側面入口とPTFEの抵抗を確認します。#31101だけでノズル詰まりとは決められません。|Check the spool for tangles and the side inlet/PTFE for resistance. #31101 alone does not identify a nozzle blockage.|Zkontrolujte zamotání cívky a odpor v bočním vstupu či PTFE. Samotná chyba #31101 neurčuje ucpání trysky.|Spule auf Verwicklung und Seiteneingang/PTFE auf Widerstand prüfen. #31101 allein belegt keine verstopfte Düse.',{sources:['stuck'],inspection:inspect(0),choices:[
   choice('供給側は通るが、まだ入らない|Supply is clear, but loading still fails|Přívod je volný, zavedení stále selhává|Zufuhr frei, Laden scheitert weiterhin','location'),
   choice('ロードできるようになった|Loading works again|Zavádění opět funguje|Laden funktioniert wieder','resolved')]}),
 path:node('通路を順に確認する|Inspect the complete path|Prohlédněte celou cestu|Gesamten Filamentweg prüfen',
  '側面入口、Nextruder入口、送りギア、チューブ上端、ノズル先端の順に表示します。ハイライトした部位を実機と見比べます。|Inspect the side inlet, Nextruder inlet, drive gear, tube entrance and nozzle tip in order. Compare each highlighted area with the printer.|Postupně zobrazte boční vstup, vstup Nextruderu, podávací kolo, vstup trubičky a špičku trysky. Zvýrazněná místa porovnejte s tiskárnou.|Seiteneingang, Nextruder-Eingang, Antriebsrad, Rohreintritt und Düsenspitze der Reihe nach prüfen. Markierte Stellen am Drucker vergleichen.',{sources:['clog','stuck','sensor'],inspection:inspect(0),choices:[choice('止まる場所がわかった|I found where it stops|Místo zastavení je známé|Stelle gefunden','location')]}),
 inlet:node('入口と内部センサーを確認する|Check the inlet and internal sensor|Zkontrolujte vstup a vnitřní senzor|Eingang und internen Sensor prüfen',
  '入口の異物や残ったフィラメントを確認します。#31119が表示されている場合は、センサー周辺の残片を調べる公式手順へ進みます。|Look for debris or remaining filament at the inlet. For #31119, follow the official check of the sensor path.|Hledejte nečistoty a zbytky filamentu ve vstupu. Při #31119 postupujte podle oficiální kontroly dráhy senzoru.|Eingang auf Rückstände prüfen. Bei #31119 der offiziellen Kontrolle des Sensorwegs folgen.',{sources:['sensor','obstruction'],inspection:inspect(1),tasks:['sensor-clean'],choices:[
   choice('#31119が表示されている|The display shows #31119|Displej ukazuje #31119|Anzeige zeigt #31119','obstruction'),
   choice('入口は通るが先で止まる|The inlet is clear; it stops farther down|Vstup je volný, filament se zastaví dále|Eingang frei, Blockierung weiter unten','gear'),
   choice('除去・清掃しても改善しない|Clearing and cleaning did not help|Odstranění a čištění nepomohlo|Entfernen und Reinigen half nicht','sensor-test')]}),
 obstruction:node('#31119：残ったフィラメントを確認する|#31119: check for remaining filament|#31119: zkontrolujte zbytky filamentu|#31119: auf Filamentreste prüfen',
  '公式手順でアイドラーを開き、センサーの通路に残片がないか確認します。除去後は閉じてロードを試します。続く場合はInfo → Sensor Infoでセンサーを確認します。|Open the idler as instructed and check the sensor path for filament remains. Close it and retry loading after clearing. If the error persists, check Info → Sensor Info.|Podle návodu otevřete idler a zkontrolujte zbytky filamentu v dráze senzoru. Po odstranění jej zavřete a zkuste zavedení. Při přetrvávající chybě zkontrolujte Info → Sensor Info.|Idler nach Anleitung öffnen und Sensorweg auf Filamentreste prüfen. Danach schließen und Laden erneut versuchen. Bleibt der Fehler, Info → Sensor Info prüfen.',{sources:['obstruction'],inspection:inspect(1),tasks:['clog','sensor-clean'],taskSteps:{clog:1},choices:[
   choice('まだ表示される|The error remains|Chyba přetrvává|Fehler bleibt','sensor-test'),
   choice('ロードできるようになった|Loading works again|Zavádění opět funguje|Laden funktioniert wieder','resolved')]}),
 'sensor-test':node('センサーの反応を確認する|Check the sensor response|Zkontrolujte reakci senzoru|Sensorreaktion prüfen',
  '実機のInfo → Sensor Infoを開き、フィラメントの有無に反応するか公式ガイドで確認します。通路の詰まりと、センサーが切り替わらない状態は分けて対処します。|Use Info → Sensor Info on the printer and the official guide to check its response to filament. Distinguish an obstructed path from a sensor that does not change state.|Na tiskárně otevřete Info → Sensor Info a podle návodu zkontrolujte reakci na filament. Rozlišujte ucpanou dráhu a senzor, který nemění stav.|Am Drucker Info → Sensor Info öffnen und Reaktion auf Filament nach Anleitung prüfen. Blockierten Weg und unveränderten Sensorzustand getrennt behandeln.',{sources:['obstruction','sensor'],inspection:inspect(1),tasks:['sensor-clean'],choices:[
   choice('反応するが、途中で止まる|It responds, but filament stops farther down|Reaguje, ale filament se zastaví dále|Reagiert, Filament bleibt weiter unten stehen','location'),
   choice('反応しない・判断できない|No response or uncertain|Nereaguje nebo si nejsem jistý/á|Keine Reaktion oder unklar','support')]}),
 gear:node('送りギアとアイドラーを確認する|Inspect the drive gear and idler|Prohlédněte podávací kolo a idler|Antriebsrad und Idler prüfen',
  '削れた粉や噛み込んだ欠片を確認します。送りギアの歯とアイドラーベアリングには注油しません。|Look for filament dust or trapped fragments. Do not lubricate the filament-gripping teeth or idler bearings.|Hledejte obroušený filament a zachycené úlomky. Zuby podávacího kola ani ložiska idleru nemažte.|Auf Filamentabrieb und eingeklemmte Stücke prüfen. Greifzähne und Idlerlager nicht schmieren.',{sources:['care'],inspection:inspect(2),tasks:['extruder'],choices:[
   choice('清掃後もギアの下で止まる|It still stops below the gear after cleaning|Po vyčištění se stále zastaví pod kolem|Bleibt nach Reinigung unter dem Rad stehen','fragment-check'),
   choice('ノズルから出るが、吐出が弱い|Material exits, but flow is weak|Materiál vychází, ale tok je slabý|Material tritt aus, Fluss ist schwach','partial'),
   choice('通常どおりロード・吐出できる|Loading and extrusion work normally|Zavádění a extruze fungují normálně|Laden und Extrusion funktionieren','resolved')]}),
 'fragment-check':node('チューブ上端に折れた破片がありますか？|Is a fragment visible at the tube entrance?|Je u vstupu trubičky vidět úlomek?|Ist am Rohreintritt ein Bruchstück sichtbar?',
  'ギア直下からホットエンドへ続く入口を確認します。外へ出ている破片と、チューブの奥にある詰まりを分けます。|Inspect the entrance below the gear leading to the hotend. A protruding fragment and a blockage deeper inside need different checks.|Prohlédněte vstup pod kolem vedoucí do hotendu. Vyčnívající úlomek a ucpání hlouběji vyžadují různé kontroly.|Eingang unter dem Rad zum Hotend prüfen. Hervorstehendes Stück und tiefere Blockierung getrennt prüfen.',{sources:['clog'],inspection:inspect(3),choices:[
   choice('破片が見える|A fragment protrudes|Úlomek vyčnívá|Bruchstück steht hervor','fragment'),
   choice('見える破片はない|No fragment is visible|Úlomek není vidět|Kein Bruchstück sichtbar','flow'),
   choice('見えないので3Dで位置を確かめたい|I need to locate the entrance in 3D|Chci najít vstup ve 3D|Eingang zuerst in 3D ansehen','tube')]}),
 tube:node('ギア直下とチューブ入口を表示する|Locate the tube entrance below the gear|Zobrazte vstup trubičky pod kolem|Rohreintritt unter dem Rad ansehen',
  '3Dで入口を確認してから、実機に破片が出ていないか見ます。奥まで工具を差し込む前に、公式の詰まり対処を確認します。|Locate the entrance in 3D, then inspect the printer for a protruding piece. Read the official blockage procedure before inserting a tool deeper.|Najděte vstup ve 3D a pak na tiskárně zkontrolujte vyčnívající úlomek. Před zasunutím nástroje hlouběji si přečtěte oficiální postup.|Eingang in 3D finden, dann am Drucker nach hervorstehendem Stück sehen. Vor tieferem Werkzeugeinsatz offizielle Anleitung lesen.',{sources:['clog'],inspection:inspect(3),choices:[choice('実機の入口を確認した|I checked the entrance on the printer|Vstup na tiskárně je zkontrolovaný|Eingang am Drucker geprüft','fragment-check')]}),
 fragment:node('見える破片の除去手順へ|Remove the visible fragment|Odstranění viditelného úlomku|Sichtbares Bruchstück entfernen',
  '見える破片を除去する作業を開き、加熱条件と引き抜き方を確認します。冷えたまま無理に引っ張りません。|Open the fragment-removal procedure for the heating conditions and withdrawal method. Do not force a cold fragment out.|Otevřete postup odstranění úlomku s podmínkami ohřevu a vytažení. Studený úlomek nevytahujte silou.|Verfahren zum Entfernen mit Heizbedingungen und Vorgehen öffnen. Kaltes Bruchstück nicht gewaltsam herausziehen.',{sources:['clog'],inspection:inspect(3),tasks:['fragment'],choices:[
   choice('取り除けた。流れを確認する|Removed; check the flow|Odstraněno; zkontrolovat tok|Entfernt; Fluss prüfen','flow'),
   choice('取り除けない|It will not come out|Nelze vyjmout|Lässt sich nicht entfernen','blocked')]}),
 flow:node('ロード・パージ時に樹脂が出ますか？|Does material exit during loading or purging?|Vychází při zavádění či čištění materiál?|Tritt beim Laden oder Spülen Material aus?',
  '現在の実機の様子を選びます。まだ試していなければ、公式の詰まり対処で確認します。|Choose the printer’s current behaviour. If not checked, use the official blockage procedure.|Vyberte aktuální chování tiskárny. Pokud jste to neověřili, postupujte podle oficiálního návodu k ucpání.|Aktuelles Verhalten wählen. Falls noch nicht geprüft, offizielle Anleitung zur Verstopfung verwenden.',{sources:['clog'],inspection:inspect(4),choices:[
   choice('少しは出るが、細い・途切れる|Some exits, but it is weak or intermittent|Trochu vychází, ale slabě či přerušovaně|Etwas tritt aus, aber schwach oder unterbrochen','partial'),
   choice('まったく出ない|Nothing exits|Nevychází nic|Es tritt nichts aus','blocked'),
   choice('ロード時は普通に出る。印刷時だけおかしい|Normal when loading; poor only while printing|Při zavádění normální, problém jen při tisku|Beim Laden normal, Problem nur beim Drucken','print-settings'),
   choice('まだ確認していない|I have not checked|Zatím neověřeno|Noch nicht geprüft','flow-check')]}),
 'flow-check':node('公式手順で吐出を確認する|Check extrusion using the official procedure|Ověřte extruzi podle oficiálního postupu|Extrusion nach offizieller Anleitung prüfen',
  '詰まり対処の手順で状態を確認します。標準HFノズルに清掃針を通す方法は使いません。|Check using the blockage procedure. Do not use the cleaning-needle method on the stock HF nozzle.|Stav ověřte podle postupu pro ucpání. U standardní HF trysky nepoužívejte čisticí jehlu.|Nach Verstopfungsanleitung prüfen. Bei der serienmäßigen HF-Düse kein Reinigungsnadelverfahren verwenden.',{sources:['clog'],inspection:inspect(4),tasks:['feed-clear'],choices:[choice('吐出の状態を確認した|I checked the extrusion|Extruze je ověřená|Extrusion geprüft','flow')]}),
 partial:node('部分的な詰まりを確認する|Check for a partial blockage|Kontrola částečného ucpání|Auf teilweise Blockierung prüfen',
  '通路とギアを確認したら、対応するノズルでコールドプルを検討します。Nozzle Xは対象外です。温度と抜くタイミングは実機の案内に従います。|After checking the path and gear, consider a cold pull with a supported nozzle. Excludes Nozzle X. Follow the printer’s temperatures and pull prompts.|Po kontrole dráhy a kola zvažte cold pull s podporovanou tryskou. Neplatí pro Nozzle X. Řiďte se teplotami a pokyny tiskárny.|Nach Prüfung von Weg und Rad Cold Pull mit geeigneter Düse erwägen. Nicht für Nozzle X. Temperaturen und Ziehanweisungen am Drucker befolgen.',{sources:['cold'],inspection:inspect(4),tasks:['coldpull','extruder'],choices:[
   choice('ギアや破片をまだ確認していない|I have not checked the gear or fragments|Kolo a úlomky ještě nejsou ověřeny|Rad und Bruchstücke noch nicht geprüft','gear'),
   choice('対処後も改善しない|The problem remains after treatment|Problém po zásahu přetrvává|Nach Behandlung unverändert','blocked'),
   choice('通常の流れに戻った|Normal flow is restored|Normální tok je obnoven|Normaler Fluss wiederhergestellt','resolved')]}),
 blocked:node('ノズル・チューブ内の詰まりを確認する|Check the nozzle and tube for blockage|Kontrola ucpání trysky a trubičky|Düse und Rohr auf Blockierung prüfen',
  '公式の詰まり対処へ進みます。流れが戻らない場合はノズル交換を確認します。HFノズルへの清掃針の挿入は行いません。|Follow the official blockage procedure. If flow cannot be restored, review nozzle replacement. Do not insert a cleaning needle into an HF nozzle.|Postupujte podle oficiálního návodu k ucpání. Neobnoví-li se tok, projděte výměnu trysky. Do HF trysky nezavádějte čisticí jehlu.|Offizielles Verstopfungsverfahren befolgen. Ohne wiederhergestellten Fluss Düsenwechsel ansehen. Keine Reinigungsnadel in HF-Düsen einführen.',{sources:['clog'],inspection:inspect(4),tasks:['feed-clear','nozzle'],choices:[
   choice('破片が見えた|I found a protruding fragment|Je vidět vyčnívající úlomek|Hervorstehendes Stück gefunden','fragment'),
   choice('対処しても改善しない・判断できない|Still unresolved or uncertain|Stále nevyřešeno nebo nejisté|Weiterhin ungelöst oder unklar','support'),
   choice('通常の流れに戻った|Normal flow is restored|Normální tok je obnoven|Normaler Fluss wiederhergestellt','resolved')]}),
 'print-settings':node('印刷条件も確認する|Check the print conditions too|Zkontrolujte také podmínky tisku|Auch Druckbedingungen prüfen',
  'HF／通常ノズルとスライサー設定の組み合わせ、フィラメントの状態、低温材料の換気を公式記事で確認します。印刷時だけの症状でノズル故障とは決められません。|Check nozzle/profile matching, filament condition and ventilation for low-temperature materials in the official article. A print-only symptom does not prove nozzle failure.|Podle oficiálního článku zkontrolujte shodu trysky a profilu, stav filamentu a větrání pro nízkoteplotní materiály. Problém pouze při tisku nedokazuje vadnou trysku.|Düsen-/Profilkombination, Filamentzustand und Belüftung für Niedrigtemperaturmaterialien im offiziellen Artikel prüfen. Ein Problem nur beim Drucken belegt keinen Düsendefekt.',{sources:['clog'],choices:[choice('ロード時の流れも確認する|Check loading flow again|Znovu ověřit tok při zavádění|Fluss beim Laden erneut prüfen','flow'),choice('設定を確認しても改善しない|Settings checked; still unresolved|Nastavení ověřeno, problém přetrvává|Einstellungen geprüft, weiterhin ungelöst','support')]}),
 noise:node('どの動作で音が出ますか？|When does the noise occur?|Při jakém pohybu hluk vzniká?|Bei welcher Bewegung entsteht das Geräusch?',
  '音の出る場所と動作を確認します。|Identify the source and the motion involved.|Určete místo a související pohyb.|Geräuschquelle und zugehörige Bewegung feststellen.',{sources:['care'],choices:[
   choice('フィラメントを送るとき|When feeding filament|Při podávání filamentu|Beim Filamentvorschub','gear'),
   choice('ファンが回るとき|When a fan runs|Při běhu ventilátoru|Wenn ein Lüfter läuft','fans'),
   choice('ヘッドやベッドが動くとき|When the head or bed moves|Při pohybu hlavy či podložky|Wenn Kopf oder Bett fährt','axes'),
   choice('場所がわからない|I cannot locate it|Místo nepoznám|Quelle unklar','support')]}),
 fans:node('ファンの汚れと異物を確認する|Check fans for dust and debris|Zkontrolujte prach a nečistoty ve ventilátorech|Lüfter auf Staub und Fremdkörper prüfen',
  '冷却し、電源を切ってから公式手順で点検・清掃します。音だけで交換するファンを決めず、場所を確認します。|Cool the printer and switch it off before the official inspection/cleaning procedure. Identify which fan is involved before choosing a replacement.|Před oficiální kontrolou a čištěním nechte tiskárnu vychladnout a vypněte ji. Před výměnou určete konkrétní ventilátor.|Vor Kontrolle und Reinigung nach Anleitung abkühlen lassen und ausschalten. Vor Austausch den betroffenen Lüfter bestimmen.',{sources:['care'],tasks:['fans'],inspection:{task:'fans',step:0},choices:[choice('清掃後も続く・場所が不明|It persists after cleaning or location is unclear|Po čištění přetrvává nebo místo není jasné|Nach Reinigung weiterhin oder Quelle unklar','support'),choice('改善した|The symptom is gone|Problém zmizel|Problem behoben','resolved')]}),
 axes:node('軸とベルトを点検する|Inspect axes and belts|Zkontrolujte osy a řemeny|Achsen und Riemen prüfen',
  '該当する軸の清掃・潤滑と、公式のベルト調整を確認します。音だけを頼りに張力を変えず、指定の測定方法を使います。|Review cleaning/lubrication for the relevant axis and the official belt adjustment. Use the specified measurement method, not sound alone, to set tension.|Projděte čištění a mazání příslušné osy a oficiální seřízení řemenů. Napnutí nastavujte předepsanou metodou, ne jen podle zvuku.|Reinigung/Schmierung der betroffenen Achse und offizielle Riemeneinstellung prüfen. Spannung mit vorgegebener Messmethode einstellen, nicht allein nach Geräusch.',{sources:['care','belts'],tasks:['rod','rail','belts'],choices:[choice('点検後も改善しない|The problem remains after inspection|Po kontrole problém přetrvává|Nach Kontrolle unverändert','support'),choice('改善した|The symptom is gone|Problém zmizel|Problem behoben','resolved')]}),
 resolved:node('復旧を確認する|Verify recovery|Ověřte obnovení funkce|Wiederherstellung prüfen',
  '外した部品と配線を戻し、公式手順の最後の確認を済ませます。ロード・吐出を確認してから印刷を再開します。再発する場合は、発生条件も記録します。|Refit removed parts and wiring and finish the checks in the official procedure. Verify loading/extrusion before resuming a print. Record conditions if the issue recurs.|Vraťte díly a kabeláž a dokončete závěrečné kontroly návodu. Před tiskem ověřte zavádění a extruzi. Při opakování zaznamenejte podmínky.|Ausgebaute Teile und Leitungen zurücksetzen und Abschlussprüfungen der Anleitung ausführen. Vor Druckbeginn Laden und Extrusion prüfen. Bei Wiederholung Bedingungen notieren.',{sources:['care','obstruction'],choices:[choice('同じ症状が再発した|The symptom returned|Příznak se vrátil|Problem ist erneut aufgetreten','support')]}),
 support:node('症状を記録してサポートへ|Record the symptoms for support|Zaznamenejte příznaky pro podporu|Symptome für den Support festhalten',
  '機種、ファームウェア、エラー番号、材料、発生する動作、試した対処を控えます。写真や短い動画も用意し、Prusaサポートへ相談します。|Record the model, firmware, error code, material, triggering action and attempted remedies. Prepare photos or a short video for Prusa support.|Poznamenejte model, firmware, kód chyby, materiál, spouštěcí činnost a vyzkoušené zásahy. Pro podporu Prusa připravte fotografie či krátké video.|Modell, Firmware, Fehlercode, Material, auslösenden Vorgang und versuchte Maßnahmen notieren. Fotos oder kurzes Video für den Prusa-Support vorbereiten.',{sources:['support']})
};
// One graph for every language keeps the inspection history across switches.
export const DIAGNOSTIC_NODES=localizeDiagnostics(addNozzleMethodRoutes(japaneseDiagnostics(BASE_DIAGNOSTIC_NODES)));
export function diagnosticNodes(){return DIAGNOSTIC_NODES;}
export function diagnosticTransition(history,id,nodes=DIAGNOSTIC_NODES){
 const from=nodes[history.at(-1)];
 return from?.choices?.some(c=>c.next===id)?[...history,id]:history;
}

completeMaintenanceRoutes(DIAGNOSTIC_NODES,DIAGNOSTIC_SOURCES);
