export const TENSIONER_TASKS=[
 {
  "id": "belt-tensioner-pulley",
  "title": [
   "テンショナープーリーの交換",
   "Replace a tensioner pulley",
   "Výměna kladky napínáku",
   "Spannrolle ersetzen"
  ],
  "category": 2,
  "interval": [
   "部品の交換時",
   "When replacing parts",
   "Při výměně dílů",
   "Beim Teiletausch"
  ],
  "source": "https://help.prusa3d.com/guide/how-to-replace-the-belt-tensioner-pulley-core-one_948766",
  "tensionerService": true,
  "revision": 1,
  "steps": [
   {
    "title": [
     "交換する側と部品を確認する",
     "Identify the side and parts",
     "Určení strany a dílů",
     "Seite und Teile bestimmen"
    ],
    "body": [
     "プリンターの正面から見た左右で選びます。プーリー保持部とテンショナー本体は別部品です。取り外したねじ・ナットは再使用まで保管し、写真の向きを確認して進めます。板金の端に気を付けてください。",
     "Choose left or right as seen from the printer front. The pulley carrier and main tensioner are separate parts. Keep removed screws and nuts for refitting and compare orientations with the photos. Handle sheet-metal edges carefully.",
     "Levou a pravou určujte při pohledu zepředu. Držák kladky a hlavní napínák jsou samostatné díly. Šrouby a matice uschovejte a orientaci ověřujte na fotografiích. Pozor na hrany plechů.",
     "Links und rechts gelten von vorn gesehen. Rollenhalter und Spannergehäuse sind getrennte Teile. Schrauben und Muttern aufbewahren und die Ausrichtung mit den Fotos vergleichen. Blechkanten vorsichtig handhaben."
    ],
    "id": "belt-tensioner-pulley-1",
    "localNumber": 1,
    "officialStep": 2,
    "officialId": 950684,
    "source": "https://help.prusa3d.com/guide/how-to-replace-the-belt-tensioner-pulley-core-one_948766#950684",
    "refs": [
     396,
     568,
     418,
     438,
     553
    ]
   },
   {
    "title": [
     "工具とグリスを用意する",
     "Prepare tools and grease",
     "Příprava nářadí a maziva",
     "Werkzeug und Fett bereitlegen"
    ],
    "body": [
     "2.5 mm六角レンチと適したグリスを用意します。外した部品を置く容器も準備します。",
     "Prepare a 2.5 mm Allen key, suitable grease and a container for removed parts.",
     "Připravte imbus 2,5 mm, vhodné mazivo a nádobku na vyjmuté díly.",
     "2,5-mm-Inbusschlüssel, geeignetes Fett und eine Ablage für ausgebaute Teile bereitlegen."
    ],
    "id": "belt-tensioner-pulley-2",
    "localNumber": 2,
    "officialStep": 3,
    "officialId": 950728,
    "source": "https://help.prusa3d.com/guide/how-to-replace-the-belt-tensioner-pulley-core-one_948766#950728",
    "refs": [
     396,
     568,
     418,
     438,
     553
    ]
   },
   {
    "title": [
     "ホームへ戻し、冷却して電源を切る",
     "Home, cool and disconnect power",
     "Referenční poloha, vychladnutí a odpojení",
     "Referenzfahrt, Abkühlen und Netz trennen"
    ],
    "body": [
     "印刷を停止し、Control → Auto Homeを実行します。加熱を止め、ノズルとベッドが室温まで冷めたことを表示で確認します。その後、背面スイッチをOFFにし、電源コードを抜き、作業用にドアを開きます。",
     "Stop printing and run Control → Auto Home. Stop heating and wait until the displayed nozzle and bed temperatures reach room temperature. Then switch OFF at the rear and unplug the power cord. Open the door for access.",
     "Ukončete tisk a spusťte Control → Auto Home. Vypněte ohřev a vyčkejte na pokojovou teplotu trysky i podložky na displeji. Potom vypněte zadní vypínač a odpojte síťový kabel. Otevřete dvířka pro přístup.",
     "Druck beenden und Control → Auto Home ausführen. Heizung abschalten und auf angezeigte Raumtemperatur von Düse und Bett warten. Danach hinten ausschalten, Netzkabel ziehen und die Tür für den Zugang öffnen."
    ],
    "id": "belt-tensioner-pulley-3",
    "localNumber": 3,
    "officialStep": 4,
    "officialId": 950780,
    "source": "https://help.prusa3d.com/guide/how-to-replace-the-belt-tensioner-pulley-core-one_948766#950780",
    "refs": [
     396,
     568,
     418,
     438,
     553
    ],
    "firmwareActions": [
     "home",
     "cooldown"
    ]
   },
   {
    "title": [
     "左右のテンショナー位置を確認する",
     "Locate both tensioners",
     "Určení obou napínáků",
     "Beide Spanner lokalisieren"
    ],
    "body": [
     "前側の左右にテンショナーがあります。写真は右側を例にしています。左側はL、右側はRを上にし、角ナットはどちらも中央へ向けます。",
     "The tensioners are at the two front corners. The photos demonstrate the right side. Use L up on the left and R up on the right; both nuts face the centre.",
     "Napínáky jsou v obou předních rozích. Fotografie ukazují pravou stranu. Vlevo patří nahoru L, vpravo R; obě matice směřují ke středu.",
     "Spanner sitzen an beiden vorderen Ecken. Die Fotos zeigen rechts. Links L, rechts R nach oben; beide Muttern zeigen zur Mitte."
    ],
    "id": "belt-tensioner-pulley-4",
    "localNumber": 4,
    "officialStep": 5,
    "officialId": 950844,
    "source": "https://help.prusa3d.com/guide/how-to-replace-the-belt-tensioner-pulley-core-one_948766#950844",
    "refs": [
     396,
     568,
     418,
     438,
     553
    ]
   },
   {
    "title": [
     "張りを抜き、プーリーを内側へ抜く",
     "Release tension and withdraw the pulley inward",
     "Povolení řemenu a vytažení kladky dovnitř",
     "Spannung lösen und Rolle nach innen ziehen"
    ],
    "body": [
     "選んだ側のM3×30調整ねじを、プーリーの角ナットから完全に外れるまで緩めます。内側からベルトを引き、プーリー一式をテンショナーから外します。ベルトをねじらず、歯を傷めないように支えます。",
     "Back out the selected M3×30 adjusting screw completely from the pulley nut. Pull the belt from inside to release the pulley assembly from the tensioner. Support the belt without twisting or damaging its teeth.",
     "Vyšroubujte vybraný nastavovací M3×30 z matice kladky. Z vnitřní strany zatáhněte za řemen a uvolněte sestavu z napínáku. Řemen podepřete, nekruťte jím a nepoškoďte zuby.",
     "Gewählten M3×30-Spannbolzen vollständig aus der Rollenmuttern lösen. Riemen von innen ziehen und Rolleneinheit aus dem Spanner lösen. Riemen ohne Verdrehen oder beschädigte Zähne stützen."
    ],
    "id": "belt-tensioner-pulley-5",
    "localNumber": 5,
    "officialStep": 6,
    "officialId": 950872,
    "source": "https://help.prusa3d.com/guide/how-to-replace-the-belt-tensioner-pulley-core-one_948766#950872",
    "refs": [
     396,
     568,
     418,
     438,
     553
    ]
   },
   {
    "title": [
     "軸ねじ、保持部、アイドラーを分ける",
     "Separate axle screw, carrier and idler",
     "Oddělení osového šroubu, držáku a kladky",
     "Achsschraube, Halter und Rolle trennen"
    ],
    "body": [
     "M3×18を抜きます。プラスチック保持部をアイドラーから分け、GT2-20アイドラーをベルトの輪から外します。ねじ、角ナット、アイドラーは紛失しないよう保管します。",
     "Remove M3×18. Separate the plastic carrier and take the GT2-20 idler out of the belt loop. Retain the screw, square nut and idler.",
     "Vyjměte M3×18, oddělte plastový držák a vyjměte kladku GT2-20 ze smyčky řemenu. Uschovejte šroub, čtyřhrannou matici i kladku.",
     "M3×18 entfernen, Kunststoffhalter trennen und GT2-20-Rolle aus der Riemenschlaufe nehmen. Schraube, Vierkantmutter und Rolle aufbewahren."
    ],
    "id": "belt-tensioner-pulley-6",
    "localNumber": 6,
    "officialStep": 7,
    "officialId": 950902,
    "source": "https://help.prusa3d.com/guide/how-to-replace-the-belt-tensioner-pulley-core-one_948766#950902",
    "refs": [
     396,
     568,
     418,
     438,
     553
    ]
   },
   {
    "title": [
     "プーリーの部品をそろえる",
     "Prepare the pulley parts",
     "Příprava dílů kladky",
     "Rollenteile bereitlegen"
    ],
    "body": [
     "belt-tensioner-pulley、M3nS角ナット、M3×18、GT2-20アイドラーをそろえます。傷んだ部品を交換し、再使用する部品の汚れを取り除きます。",
     "Prepare the belt-tensioner-pulley, M3nS square nut, M3×18 and GT2-20 idler. Replace damaged parts and clean retained parts.",
     "Připravte belt-tensioner-pulley, matici M3nS, M3×18 a kladku GT2-20. Poškozené díly vyměňte, ponechané očistěte.",
     "Belt-tensioner-pulley, Vierkantmutter M3nS, M3×18 und GT2-20-Rolle bereitlegen. Beschädigte Teile ersetzen, wiederverwendete reinigen."
    ],
    "id": "belt-tensioner-pulley-7",
    "localNumber": 7,
    "officialStep": 8,
    "officialId": 950936,
    "source": "https://help.prusa3d.com/guide/how-to-replace-the-belt-tensioner-pulley-core-one_948766#950936",
    "refs": [
     396,
     568,
     418,
     438,
     553
    ]
   },
   {
    "title": [
     "L／Rを上にし、角ナットを奥まで入れる",
     "Marking up; fully seat the nut",
     "Značka nahoru a matice zcela dovnitř",
     "Markierung nach oben, Mutter ganz einsetzen"
    ],
    "body": [
     "左側はL、右側はRが上になる向きで保持部を置きます。M3nSを角穴へ差し込み、奥まで着座させます。反対側の文字で組み付けないでください。",
     "Place the carrier with L upward on the left or R upward on the right. Push M3nS fully into its square pocket. Do not assemble with the opposite marking up.",
     "Vlevo musí být nahoře L, vpravo R. Matici M3nS zasuňte zcela do čtyřhranné kapsy. Nezaměňte horní označení.",
     "Links L, rechts R nach oben ausrichten. M3nS ganz in die Vierkanttasche drücken. Obere Markierung nicht vertauschen."
    ],
    "id": "belt-tensioner-pulley-8",
    "localNumber": 8,
    "officialStep": 9,
    "officialId": 951018,
    "source": "https://help.prusa3d.com/guide/how-to-replace-the-belt-tensioner-pulley-core-one_948766#951018",
    "refs": [
     396,
     568,
     418,
     438,
     553
    ]
   },
   {
    "title": [
     "ベルトへ掛け、保持部と軸ねじを組む",
     "Hook into the belt and assemble the carrier",
     "Nasazení do řemenu a sestavení držáku",
     "In Riemen einhängen und Halter montieren"
    ],
    "body": [
     "アイドラーをベルトの輪へ掛け、ベルトがまっすぐでねじれていないことを確認します。角ナット側をプリンター中央へ向け、プラスチック保持部を重ねます。軸穴を合わせてM3×18を締め、左はL・右はRが上か再確認します。",
     "Hook the idler into the straight, untwisted belt loop. Fit the carrier with its square nut toward the printer centre. Align the axle holes, tighten M3×18, and recheck L up on the left or R up on the right.",
     "Kladku zavěste do rovné, nepřekroucené smyčky řemenu. Držák přiložte maticí ke středu tiskárny. Vyrovnejte otvory, dotáhněte M3×18 a ověřte L nahoře vlevo nebo R nahoře vpravo.",
     "Rolle in die gerade, unverdrehte Riemenschlaufe hängen. Halter mit Vierkantmutter zur Druckermitte aufsetzen. Bohrungen ausrichten, M3×18 anziehen und links L bzw. rechts R oben prüfen."
    ],
    "id": "belt-tensioner-pulley-9",
    "localNumber": 9,
    "officialStep": 10,
    "officialId": 950986,
    "source": "https://help.prusa3d.com/guide/how-to-replace-the-belt-tensioner-pulley-core-one_948766#950986",
    "refs": [
     396,
     568,
     418,
     438,
     553
    ]
   },
   {
    "title": [
     "調整ねじのねじ部へ薄く注油する",
     "Lightly grease the adjusting thread",
     "Lehké namazání nastavovacího závitu",
     "Spanngewinde dünn fetten"
    ],
    "body": [
     "M3×30調整ねじの先端のねじ部に少量のPrusa Lubricantまたは適したグリスを付け、ねじ部全体へ薄く広げます。ベルトやプーリーの歯には付けません。",
     "Apply a small amount of Prusa Lubricant or suitable grease to the threaded tip of M3×30 and spread it thinly over the whole thread. Keep grease off the belt and pulley teeth.",
     "Na závit špičky M3×30 naneste malé množství Prusa Lubricant nebo vhodného maziva a rozetřete po celém závitu. Neznečistěte řemen ani zuby kladky.",
     "Wenig Prusa Lubricant oder geeignetes Fett an die Gewindespitze von M3×30 geben und dünn über das gesamte Gewinde verteilen. Riemen und Rollenzähne sauber halten."
    ],
    "id": "belt-tensioner-pulley-10",
    "localNumber": 10,
    "officialStep": 11,
    "officialId": 953352,
    "source": "https://help.prusa3d.com/guide/how-to-replace-the-belt-tensioner-pulley-core-one_948766#953352",
    "refs": [
     396,
     568,
     418,
     438,
     553
    ]
   },
   {
    "title": [
     "保持部を差し込み、調整ねじを掛ける",
     "Insert the carrier and engage the adjuster",
     "Zasunutí držáku a zachycení šroubu",
     "Halter einschieben und Spannbolzen ansetzen"
    ],
    "body": [
     "プーリー一式をテンショナーへ押し込みます。角ナットとM3×30の軸を合わせ、ねじを掛けます。この段階では本締めせず、ベルトの張り調整を残します。",
     "Push the pulley assembly into the tensioner. Align its square nut with M3×30 and engage the thread. Leave final tension adjustment for later.",
     "Sestavu zatlačte do napínáku. Vyrovnejte matici s M3×30 a zachyťte závit. Konečné napnutí proveďte později.",
     "Rolleneinheit in den Spanner drücken. Vierkantmutter mit M3×30 ausrichten und Gewinde ansetzen. Endgültige Spannung erst später einstellen."
    ],
    "id": "belt-tensioner-pulley-11",
    "localNumber": 11,
    "officialStep": 12,
    "officialId": 951090,
    "source": "https://help.prusa3d.com/guide/how-to-replace-the-belt-tensioner-pulley-core-one_948766#951090",
    "refs": [
     396,
     568,
     418,
     438,
     553
    ]
   },
   {
    "title": [
     "電源を入れ、両ベルトの張りを戻す",
     "Power on and restore both belt tensions",
     "Zapnutí a napnutí obou řemenů",
     "Einschalten und beide Riemen spannen"
    ],
    "body": [
     "組付けと工具の取り忘れを確認し、電源コードを接続してONにします。Control → Disable Motorsでモーターを無効にします。NextruderをX中央・Y最前部へ手で動かし、ガントリーの左右の角を前側フレームへ押し当て、両側にすき間やがたつきがないことを確認します。整列確認後、モーターを無効にしたままNextruderをX右端・Y最前部へ動かします。公式Belt TunerでCORE One → XY-belt → Start listeningを選び、端末をベルトの近くへ置きます。前側にある上側ベルトの中央を軽くはじいて測り、下側も同じように測ります。目安は上側98 Hz・下側92 Hzです。左の調整ねじが上側、右が下側のベルトに対応します。両ねじを同じ量ずつ交互に、1回につき1/2回転ずつ締めるか緩め、その都度両ベルトを再測定します。締めると振動数が上がり、緩めると下がります。前側の角にすき間が出た場合は両調整ねじを緩め、公式記事のAlignment手順で整列からやり直します。ベルトのねじれや側面への乗り上げも確認します。",
     "Check the assembly, remove tools, reconnect power and switch ON. Use Control → Disable Motors. Move the Nextruder by hand to X centre and Y fully forward. Press both gantry corners against the front frame and check for gaps or rocking. After alignment, keep the motors disabled and move the Nextruder to X fully right and Y fully forward. In the official Belt Tuner select CORE One → XY-belt → Start listening and hold the device near the belts. Lightly pluck the middle of the front upper belt, measure it, and repeat for the lower belt. Targets are upper 98 Hz and lower 92 Hz. The left adjuster acts on the upper belt; the right on the lower. Alternate equal half-turn adjustments of the two screws and remeasure both belts each time. Tightening raises frequency; loosening lowers it. If a front-corner gap appears, loosen both adjusters and repeat Alignment in the linked official procedure. Check that neither belt is twisted or climbing a flange.",
     "Zkontrolujte montáž, odstraňte nářadí, připojte napájení a zapněte tiskárnu. Zvolte Control → Disable Motors. Nextruder ručně posuňte do středu X a zcela dopředu v Y. Oba rohy portálu přitlačte k přednímu rámu a ověřte, že nevzniká mezera ani viklání. Po vyrovnání ponechte motory vypnuté a Nextruder posuňte zcela doprava v X a dopředu v Y. V oficiálním Belt Tuner zvolte CORE One → XY-belt → Start listening a přidržte zařízení u řemenů. Lehce brnkněte do středu předního horního řemenu, změřte jej a stejně změřte dolní. Cíle jsou horní 98 Hz a dolní 92 Hz. Levý šroub nastavuje horní řemen, pravý dolní. Oba šrouby střídavě upravujte o stejnou půlotáčku a po každé úpravě znovu změřte oba řemeny. Utahování frekvenci zvyšuje, povolování snižuje. Pokud u předního rohu vznikne mezera, povolte oba napínací šrouby a zopakujte Alignment v odkazovaném oficiálním postupu. Ověřte, že řemeny nejsou překroucené ani nenabíhají na přírubu.",
     "Montage prüfen, Werkzeug entfernen, Netz anschließen und einschalten. Control → Disable Motors wählen. Nextruder von Hand zur X-Mitte und in Y ganz nach vorn bewegen. Beide Gantry-Ecken an den vorderen Rahmen drücken und auf Spalten oder Wackeln prüfen. Nach dem Ausrichten die Motoren deaktiviert lassen und den Nextruder in X ganz nach rechts und in Y ganz nach vorn bewegen. Im offiziellen Belt Tuner CORE One → XY-belt → Start listening wählen und das Gerät an die Riemen halten. Mitte des vorderen oberen Riemens leicht anzupfen, messen und den unteren ebenso messen. Zielwerte: oben 98 Hz, unten 92 Hz. Die linke Stellschraube wirkt auf den oberen, die rechte auf den unteren Riemen. Beide Schrauben abwechselnd um jeweils dieselbe halbe Umdrehung verstellen und danach jedes Mal beide Riemen neu messen. Anziehen erhöht die Frequenz, Lösen senkt sie. Entsteht vorn ein Spalt, beide Spannschrauben lösen und Alignment in der verlinkten offiziellen Anleitung wiederholen. Auf Verdrehung oder Auflaufen auf eine Flanschkante prüfen."
    ],
    "id": "belt-tensioner-pulley-12",
    "localNumber": 12,
    "officialStep": 13,
    "officialId": 951130,
    "source": "https://help.prusa3d.com/guide/how-to-replace-the-belt-tensioner-pulley-core-one_948766#951130",
    "refs": [
     396,
     568,
     418,
     438,
     553
    ],
    "firmwareActions": [
     "disable"
    ],
    "related": [
     "belts"
    ],
    "link": "https://belt.connect.prusa3d.com/",
    "supplementalSources": [
     {
      "label": [
       "ベルト張り調整の公式手順",
       "Official belt adjustment procedure",
       "Oficiální nastavení řemenů",
       "Offizielle Riemeneinstellung"
      ],
      "url": "https://help.prusa3d.com/article/adjusting-belt-tension-core-one-core-one-indx-core-one-l_845048"
     }
    ]
   },
   {
    "title": [
     "実機のSelftestで復旧を確認する",
     "Verify restoration with the printer Selftest",
     "Ověření pomocí Selftestu tiskárny",
     "Wiederherstellung mit Selftest prüfen"
    ],
    "body": [
     "全ねじとカバーを確認し、ドアを閉じます。実機でControl → Calibrations & Tests → Selftestを実行し、軸・ベルト・センサーの確認を最後まで行います。エラー、引っ掛かり、異音があれば作業を完了せず、電源を切って原因を確認します。",
     "Check every screw and cover and close the door. Run Control → Calibrations & Tests → Selftest on the printer and complete the axis, belt and sensor checks. Resolve errors, binding or unusual noise before finishing; switch off before mechanical inspection.",
     "Ověřte šrouby a kryty, zavřete dvířka a na tiskárně spusťte Control → Calibrations & Tests → Selftest. Dokončete kontroly os, řemenů a senzorů. Chyby, drhnutí nebo neobvyklý hluk odstraňte před dokončením; před mechanickou kontrolou vypněte napájení.",
     "Alle Schrauben und Abdeckungen prüfen, Tür schließen und am Drucker Control → Calibrations & Tests → Selftest ausführen. Achsen-, Riemen- und Sensorprüfungen abschließen. Fehler, Klemmen oder ungewöhnliche Geräusche vor Abschluss beheben; vor mechanischer Prüfung ausschalten."
    ],
    "id": "belt-tensioner-pulley-13",
    "localNumber": 13,
    "officialStep": 14,
    "officialId": 950816,
    "source": "https://help.prusa3d.com/guide/how-to-replace-the-belt-tensioner-pulley-core-one_948766#950816",
    "refs": [
     396,
     568,
     418,
     438,
     553
    ],
    "firmwareActions": [
     "selftest"
    ]
   }
  ]
 },
 {
  "id": "belt-tensioner-left",
  "title": [
   "左ベルトテンショナーの交換",
   "Replace the left belt tensioner",
   "Výměna levého napínáku",
   "Linken Riemenspanner ersetzen"
  ],
  "category": 2,
  "interval": [
   "部品の交換時",
   "When replacing parts",
   "Při výměně dílů",
   "Beim Teiletausch"
  ],
  "source": "https://help.prusa3d.com/guide/how-to-replace-the-belt-tensioner-left-core-one_948782",
  "tensionerService": true,
  "revision": 1,
  "steps": [
   {
    "title": [
     "交換する側と部品を確認する",
     "Identify the side and parts",
     "Určení strany a dílů",
     "Seite und Teile bestimmen"
    ],
    "body": [
     "この手順は、プリンターの正面から見た左側のテンショナー交換です。反対側は別の交換ガイドを開いてください。プーリー保持部とテンショナー本体は別部品です。取り外したねじ・ナットは再使用まで保管し、写真の向きを確認して進めます。板金の端に気を付けてください。",
     "This guide replaces the left tensioner as seen from the printer front. Use the other guide for the opposite side. The pulley carrier and main tensioner are separate parts. Keep removed screws and nuts for refitting and compare orientations with the photos. Handle sheet-metal edges carefully.",
     "Tento návod je pro levý napínák při pohledu zepředu. Pro opačnou stranu otevřete druhý návod. Držák kladky a hlavní napínák jsou samostatné díly. Šrouby a matice uschovejte a orientaci ověřujte na fotografiích. Pozor na hrany plechů.",
     "Diese Anleitung gilt für die linke Seite von vorn gesehen. Für die Gegenseite die andere Anleitung öffnen. Rollenhalter und Spannergehäuse sind getrennte Teile. Schrauben und Muttern aufbewahren und die Ausrichtung mit den Fotos vergleichen. Blechkanten vorsichtig handhaben."
    ],
    "id": "belt-tensioner-left-1",
    "localNumber": 1,
    "officialStep": 2,
    "officialId": 951723,
    "source": "https://help.prusa3d.com/guide/how-to-replace-the-belt-tensioner-left-core-one_948782#951723",
    "refs": [
     400,
     405,
     412,
     436,
     551
    ]
   },
   {
    "title": [
     "左側用の工具をそろえる",
     "Prepare the left-side tools",
     "Nářadí pro levou stranu",
     "Werkzeug für die linke Seite"
    ],
    "body": [
     "2 mm・2.5 mm六角レンチ、T10トルクス、グリスを用意します。リベットのピンと結束バンドにはニッパーが使えます。外したねじとリベットを保管します。",
     "Prepare 2 mm and 2.5 mm Allen keys, T10 Torx and grease. Flush cutters help lift rivet pins and cut the tie. Retain screws and rivets.",
     "Připravte imbusy 2 a 2,5 mm, Torx T10 a mazivo. Štípací kleště pomohou s kolíky nýtů a páskou. Šrouby a nýty uschovejte.",
     "2- und 2,5-mm-Inbus, T10-Torx und Fett bereitlegen. Seitenschneider helfen bei Nietstiften und Kabelbinder. Schrauben und Nieten aufbewahren."
    ],
    "id": "belt-tensioner-left-2",
    "localNumber": 2,
    "officialStep": 3,
    "officialId": 951767,
    "source": "https://help.prusa3d.com/guide/how-to-replace-the-belt-tensioner-left-core-one_948782#951767",
    "refs": [
     400,
     405,
     412,
     436,
     551
    ]
   },
   {
    "title": [
     "ホームへ戻し、冷却して電源を切る",
     "Home, cool and disconnect power",
     "Referenční poloha, vychladnutí a odpojení",
     "Referenzfahrt, Abkühlen und Netz trennen"
    ],
    "body": [
     "印刷を停止し、Control → Auto Homeを実行します。加熱を止め、ノズルとベッドが室温まで冷めたことを表示で確認します。その後、背面スイッチをOFFにし、電源コードを抜き、作業用にドアを開きます。",
     "Stop printing and run Control → Auto Home. Stop heating and wait until the displayed nozzle and bed temperatures reach room temperature. Then switch OFF at the rear and unplug the power cord. Open the door for access.",
     "Ukončete tisk a spusťte Control → Auto Home. Vypněte ohřev a vyčkejte na pokojovou teplotu trysky i podložky na displeji. Potom vypněte zadní vypínač a odpojte síťový kabel. Otevřete dvířka pro přístup.",
     "Druck beenden und Control → Auto Home ausführen. Heizung abschalten und auf angezeigte Raumtemperatur von Düse und Bett warten. Danach hinten ausschalten, Netzkabel ziehen und die Tür für den Zugang öffnen."
    ],
    "id": "belt-tensioner-left-3",
    "localNumber": 3,
    "officialStep": 4,
    "officialId": 951819,
    "source": "https://help.prusa3d.com/guide/how-to-replace-the-belt-tensioner-left-core-one_948782#951819",
    "refs": [
     400,
     405,
     412,
     436,
     551
    ],
    "firmwareActions": [
     "home",
     "cooldown"
    ]
   },
   {
    "title": [
     "上側カバーのリベット5本を外す",
     "Remove five upper-cover rivets",
     "Vyjmutí pěti nýtů horního krytu",
     "Fünf Nieten der oberen Abdeckung entfernen"
    ],
    "body": [
     "左側のプラスチックカバーを固定するナイロンリベット5本を外します。各ピンを先に引き上げて解除し、胴を抜いてからカバーを外します。\n\n写真の矢印で示す5個のリベットを外します。",
     "Unlock each of the five left plastic-cover rivets by lifting its pin, then withdraw its body. Remove the cover.\n\nRemove the five rivets indicated by the photo arrows.",
     "U pěti nýtů levého plastového krytu nejprve vytáhněte kolík, pak tělo nýtu. Sejměte kryt.\n\nVyjměte pět nýtů označených šipkami na fotografii.",
     "An allen fünf Nieten der linken Kunststoffabdeckung zuerst Stift anheben, dann Nietkörper ziehen. Abdeckung abnehmen.\n\nDie fünf mit Fotopfeilen markierten Nieten entfernen."
    ],
    "id": "belt-tensioner-left-4",
    "localNumber": 4,
    "officialStep": 5,
    "officialId": 951855,
    "source": "https://help.prusa3d.com/guide/how-to-replace-the-belt-tensioner-left-core-one_948782#951855",
    "refs": [
     400,
     405,
     412,
     436,
     551
    ]
   },
   {
    "title": [
     "左側の板金パネルを外す",
     "Remove the left sheet panel",
     "Sejmutí levého plechu",
     "Linkes Seitenblech entfernen"
    ],
    "body": [
     "写真で示す板金パネルのリベットを、ピン・胴の順に1本ずつ外します。パネルを支えて取り外し、リベット11本を保管します。",
     "Remove the marked sheet-panel rivets individually, pin before body. Support and remove the panel; retain all eleven rivets.",
     "Označené nýty plechu vyjměte jednotlivě, vždy kolík před tělem. Plech podepřete a sejměte; všech jedenáct nýtů uschovejte.",
     "Markierte Blechnieten einzeln entfernen, Stift vor Nietkörper. Blech stützen und abnehmen; alle elf Nieten aufbewahren."
    ],
    "id": "belt-tensioner-left-5",
    "localNumber": 5,
    "officialStep": 6,
    "officialId": 951891,
    "source": "https://help.prusa3d.com/guide/how-to-replace-the-belt-tensioner-left-core-one_948782#951891",
    "refs": [
     400,
     405,
     412,
     436,
     551
    ]
   },
   {
    "title": [
     "LCDパネルを少し右へずらす",
     "Shift the LCD panel slightly right",
     "Mírný posun panelu LCD doprava",
     "LCD-Frontblende etwas nach rechts schieben"
    ],
    "body": [
     "LCD付き前面板金の右端を持ち上げて磁石と右プロファイルの掛かりを外し、少し前へ引きます。左側のねじ2本が見える分だけ右へずらします。LCDのケーブルは接続したまま、引っ張らず挟まないようにします。",
     "Lift the right end of the LCD front panel off its magnetic/profile engagement and pull it slightly forward. Slide right only far enough to expose the two left screws. Leave LCD cables attached, slack and unpinched.",
     "Pravý konec předního panelu LCD zvedněte z magnetů a profilu a mírně přitáhněte vpřed. Posuňte doprava jen pro přístup ke dvěma levým šroubům. Kabely LCD ponechte zapojené, volné a neskřípnuté.",
     "Rechtes Ende der LCD-Frontblende aus Magneten und Profil anheben und etwas vorziehen. Nur bis zum Zugang zu zwei linken Schrauben nach rechts schieben. LCD-Kabel angeschlossen, locker und ungequetscht lassen."
    ],
    "id": "belt-tensioner-left-6",
    "localNumber": 6,
    "officialStep": 7,
    "officialId": 951917,
    "source": "https://help.prusa3d.com/guide/how-to-replace-the-belt-tensioner-left-core-one_948782#951917",
    "refs": [
     400,
     405,
     412,
     436,
     551
    ]
   },
   {
    "title": [
     "側面3本・前面2本を外す",
     "Remove three side and two front screws",
     "Vyjmutí tří bočních a dvou předních šroubů",
     "Drei seitliche und zwei vordere Schrauben entfernen"
    ],
    "body": [
     "左コーナープロファイルの側面ねじ3本と、写真で示す前面ねじ2本だけを外します。上側の保持ねじはまだ残します。\n\n前面は写真の黄色い矢印で示す2本だけを外し、上側の保持ねじは残します。",
     "Remove three side screws and only the two marked front screws from the left corner profile. Leave the upper retaining screw in place.\n\nAt the front remove only the two screws marked by yellow arrows; leave the top retaining screw in place.",
     "Vyjměte tři boční a pouze dva označené přední šrouby levého rohového profilu. Horní přidržovací šroub zatím ponechte.\n\nVpředu vyjměte pouze dva šrouby označené žlutými šipkami; horní přidržovací šroub ponechte.",
     "Drei seitliche und nur die zwei markierten vorderen Schrauben des linken Eckprofils entfernen. Obere Halteschraube zunächst belassen.\n\nVorn nur die zwei gelb markierten Schrauben entfernen; die obere Halteschraube belassen."
    ],
    "id": "belt-tensioner-left-7",
    "localNumber": 7,
    "officialStep": 8,
    "officialId": 951969,
    "source": "https://help.prusa3d.com/guide/how-to-replace-the-belt-tensioner-left-core-one_948782#951969",
    "refs": [
     400,
     405,
     412,
     436,
     551
    ]
   },
   {
    "title": [
     "ドアを支え、プロファイルごと外す",
     "Support the door and remove its profile",
     "Podepření dvířek a sejmutí profilu",
     "Tür stützen und mit Profil abnehmen"
    ],
    "body": [
     "ドアを支えてから、残した上側ねじを抜きます。ドアスイッチのレバーが通る穴を見ながら、レバーに当てずに左プロファイルとドアを一緒に外します。ドアとヒンジを分解する必要はありません。",
     "Support the door before removing the remaining upper screw. Watch the switch lever through its opening and unhook the left profile and door together without hitting it. Keep the hinges assembled.",
     "Podepřete dvířka, teprve pak vyjměte zbývající horní šroub. Sledujte páčku spínače v otvoru a sejměte profil s dvířky bez nárazu do páčky. Panty nerozebírejte.",
     "Tür stützen und erst dann verbleibende obere Schraube entfernen. Schalterhebel im Ausschnitt beobachten und linkes Profil samt Tür ohne Berührung des Hebels aushängen. Scharniere zusammengebaut lassen."
    ],
    "id": "belt-tensioner-left-8",
    "localNumber": 8,
    "officialStep": 9,
    "officialId": 951997,
    "source": "https://help.prusa3d.com/guide/how-to-replace-the-belt-tensioner-left-core-one_948782#951997",
    "refs": [
     400,
     405,
     412,
     436,
     551
    ]
   },
   {
    "title": [
     "センサーを配線付きで退避する",
     "Park the sensor with its cable attached",
     "Odložení senzoru se zapojeným kabelem",
     "Sensor mit angeschlossenem Kabel ablegen"
    ],
    "body": [
     "ドアセンサー配線の結束バンドを、ケーブルを傷めず切ります。M2.5×10とセンサーを外し、精密なレバーを曲げないよう、配線に余裕のある位置へ退避します。端子は抜きません。",
     "Cut the door-sensor tie without nicking the cable. Remove M2.5×10 and the sensor, then park it within cable slack without bending its delicate lever. Leave its connector attached.",
     "Pásku kabelu senzoru přestřihněte bez poškození vodiče. Vyjměte M2,5×10 a senzor a odložte jej v dosahu volného kabelu bez ohnutí páčky. Konektor neodpojujte.",
     "Türsensorkabelbinder ohne Kabelschaden durchtrennen. M2,5×10 und Sensor entfernen und innerhalb der Kabellose ablegen, ohne feinen Hebel zu verbiegen. Stecker angeschlossen lassen."
    ],
    "id": "belt-tensioner-left-9",
    "localNumber": 9,
    "officialStep": 10,
    "officialId": 952456,
    "source": "https://help.prusa3d.com/guide/how-to-replace-the-belt-tensioner-left-core-one_948782#952456",
    "refs": [
     400,
     405,
     412,
     436,
     551
    ]
   },
   {
    "title": [
     "張りを抜き、プーリーを内側へ抜く",
     "Release tension and withdraw the pulley inward",
     "Povolení řemenu a vytažení kladky dovnitř",
     "Spannung lösen und Rolle nach innen ziehen"
    ],
    "body": [
     "選んだ側のM3×30調整ねじを、プーリーの角ナットから完全に外れるまで緩めます。内側からベルトを引き、プーリー一式をテンショナーから外します。ベルトをねじらず、歯を傷めないように支えます。\n\n先にプーリーを外せない場合は張りを抜いたまま残します。「本体を外した後に分解」を選び、次の分解も後回しにして、このガイドの手順12へ進みます。",
     "Back out the selected M3×30 adjusting screw completely from the pulley nut. Pull the belt from inside to release the pulley assembly from the tensioner. Support the belt without twisting or damaging its teeth.\n\nIf the pulley cannot be released first, leave it with tension released. Select disassembly after body removal, defer the next disassembly step as well, and continue at local step 12.",
     "Vyšroubujte vybraný nastavovací M3×30 z matice kladky. Z vnitřní strany zatáhněte za řemen a uvolněte sestavu z napínáku. Řemen podepřete, nekruťte jím a nepoškoďte zuby.\n\nPokud kladku nelze uvolnit předem, ponechte ji s povoleným řemenem. Zvolte rozebrání po sejmutí těla, odložte i následující rozebrání a pokračujte místním krokem 12.",
     "Gewählten M3×30-Spannbolzen vollständig aus der Rollenmuttern lösen. Riemen von innen ziehen und Rolleneinheit aus dem Spanner lösen. Riemen ohne Verdrehen oder beschädigte Zähne stützen.\n\nIst die Rolle vorher nicht lösbar, mit gelöster Spannung belassen. Zerlegung nach Gehäuseausbau wählen, auch den nächsten Zerlegungsschritt verschieben und mit lokalem Schritt 12 fortfahren."
    ],
    "id": "belt-tensioner-left-10",
    "localNumber": 10,
    "officialStep": 11,
    "officialId": 952483,
    "source": "https://help.prusa3d.com/guide/how-to-replace-the-belt-tensioner-left-core-one_948782#952483",
    "refs": [
     400,
     405,
     412,
     436,
     551
    ]
   },
   {
    "title": [
     "軸ねじ、保持部、アイドラーを分ける",
     "Separate axle screw, carrier and idler",
     "Oddělení osového šroubu, držáku a kladky",
     "Achsschraube, Halter und Rolle trennen"
    ],
    "body": [
     "M3×18を抜きます。プラスチック保持部をアイドラーから分け、GT2-20アイドラーをベルトの輪から外します。ねじ、角ナット、アイドラーは紛失しないよう保管します。\n\n先にプーリーを外せない場合は張りを抜いたまま残します。「本体を外した後に分解」を選び、次の分解も後回しにして、このガイドの手順12へ進みます。",
     "Remove M3×18. Separate the plastic carrier and take the GT2-20 idler out of the belt loop. Retain the screw, square nut and idler.\n\nIf the pulley cannot be released first, leave it with tension released. Select disassembly after body removal, defer the next disassembly step as well, and continue at local step 12.",
     "Vyjměte M3×18, oddělte plastový držák a vyjměte kladku GT2-20 ze smyčky řemenu. Uschovejte šroub, čtyřhrannou matici i kladku.\n\nPokud kladku nelze uvolnit předem, ponechte ji s povoleným řemenem. Zvolte rozebrání po sejmutí těla, odložte i následující rozebrání a pokračujte místním krokem 12.",
     "M3×18 entfernen, Kunststoffhalter trennen und GT2-20-Rolle aus der Riemenschlaufe nehmen. Schraube, Vierkantmutter und Rolle aufbewahren.\n\nIst die Rolle vorher nicht lösbar, mit gelöster Spannung belassen. Zerlegung nach Gehäuseausbau wählen, auch den nächsten Zerlegungsschritt verschieben und mit lokalem Schritt 12 fortfahren."
    ],
    "id": "belt-tensioner-left-11",
    "localNumber": 11,
    "officialStep": 12,
    "officialId": 952554,
    "source": "https://help.prusa3d.com/guide/how-to-replace-the-belt-tensioner-left-core-one_948782#952554",
    "refs": [
     400,
     405,
     412,
     436,
     551
    ]
   },
   {
    "title": [
     "左本体と調整ねじを外す",
     "Remove the left body and sensor adjuster",
     "Vyjmutí levého těla a seřizovacího šroubu",
     "Linkes Gehäuse und Sensoreinstellschraube entfernen"
    ],
    "body": [
     "本体固定のM3×30を2本、コーナーのM3×18を1本抜き、本体を外します。センサー調整用M3×12も外します。\n\n後回しにしたプーリーがある場合は、調整ねじを本体から抜いてから本体とプーリーを支えて取り外します。手順11のM3×18を抜き、保持部とアイドラーを分け、アイドラーをベルトの輪から外します。終わったら手順13へ進みます。",
     "Remove two body M3×30 and the corner M3×18, then remove the left body and its M3×12 sensor-adjusting screw.\n\nFor the deferred route, withdraw the adjusting screw from the body before supporting and removing the body and pulley together. Perform local step 11: remove M3×18, separate the carrier and idler, and take the idler out of the belt loop. Rejoin at local step 13.",
     "Vyjměte dva upevňovací M3×30 a rohový M3×18, potom levé tělo a nastavovací M3×12 senzoru.\n\nV odložené větvi nejprve vytáhněte napínací šroub z těla, pak podepřete a vyjměte tělo s kladkou. Proveďte místní krok 11: vyjměte M3×18, oddělte držák a kladku a kladku vyjměte ze smyčky řemenu. Pokračujte místním krokem 13.",
     "Zwei Befestigungs-M3×30 und Eck-M3×18 entfernen, dann linkes Gehäuse und Sensor-Einstellschraube M3×12 herausnehmen.\n\nBeim verschobenen Ausbau zuerst die Spannschraube aus dem Gehäuse ziehen, dann Gehäuse und Rolle gemeinsam gestützt herausnehmen. Lokalen Schritt 11 ausführen: M3×18 entfernen, Halter und Rolle trennen und Rolle aus der Riemenschlaufe nehmen. Mit lokalem Schritt 13 fortfahren."
    ],
    "id": "belt-tensioner-left-12",
    "localNumber": 12,
    "officialStep": 13,
    "officialId": 952515,
    "source": "https://help.prusa3d.com/guide/how-to-replace-the-belt-tensioner-left-core-one_948782#952515",
    "refs": [
     400,
     405,
     412,
     436,
     551
    ]
   },
   {
    "title": [
     "左側の交換部品をそろえる",
     "Prepare left replacement parts",
     "Příprava levých náhradních dílů",
     "Linke Ersatzteile bereitlegen"
    ],
    "body": [
     "左テンショナー本体、プーリー保持部、GT2-20、M3×30を2本、M3×12、M3×18と新しい結束バンドをそろえます。調整用M3×30と角ナットも保管したものを確認します。",
     "Prepare the left body, pulley carrier, GT2-20, two M3×30, M3×12, M3×18 and a new cable tie. Check the retained M3×30 adjuster and square nut as well.",
     "Připravte levé tělo, držák kladky, GT2-20, dva M3×30, M3×12, M3×18 a novou pásku. Ověřte také uschovaný napínací M3×30 a čtyřhrannou matici.",
     "Linkes Gehäuse, Rollenhalter, GT2-20, zwei M3×30, M3×12, M3×18 und neuen Kabelbinder bereitlegen. Aufbewahrten M3×30-Spannbolzen und Vierkantmutter prüfen."
    ],
    "id": "belt-tensioner-left-13",
    "localNumber": 13,
    "officialStep": 14,
    "officialId": 952588,
    "source": "https://help.prusa3d.com/guide/how-to-replace-the-belt-tensioner-left-core-one_948782#952588",
    "refs": [
     400,
     405,
     412,
     436,
     551
    ]
   },
   {
    "title": [
     "M3×12を入れ、左本体を合わせる",
     "Insert M3×12 and align the left body",
     "Vložení M3×12 a vyrovnání levého těla",
     "M3×12 einsetzen und linkes Gehäuse ausrichten"
    ],
    "body": [
     "新しい左本体へM3×12を入れ、先端がわずかに出るところで止めます。本体をCoreXYの取付位置へ合わせます。",
     "Fit M3×12 in the new left body until its tip just protrudes. Align the body on its CoreXY mounting position.",
     "M3×12 zašroubujte do nového levého těla jen tak, aby špička mírně vyčnívala. Tělo vyrovnejte v montážní poloze CoreXY.",
     "M3×12 ins neue linke Gehäuse drehen, bis die Spitze gerade hervorsteht. Gehäuse auf der CoreXY-Aufnahme ausrichten."
    ],
    "id": "belt-tensioner-left-14",
    "localNumber": 14,
    "officialStep": 15,
    "officialId": 952658,
    "source": "https://help.prusa3d.com/guide/how-to-replace-the-belt-tensioner-left-core-one_948782#952658",
    "refs": [
     400,
     405,
     412,
     436,
     551
    ]
   },
   {
    "title": [
     "M3×30を2本とM3×18で固定する",
     "Secure with two M3×30 and M3×18",
     "Upevnění dvěma M3×30 a M3×18",
     "Mit zwei M3×30 und M3×18 befestigen"
    ],
    "body": [
     "M3×30を2本、続いてコーナーのM3×18を締め、左本体を固定します。穴を合わせてからねじを掛け、無理に引き寄せません。",
     "Secure the left body with two M3×30, then the corner M3×18. Align the holes before engaging threads; do not force the body into place with screws.",
     "Levé tělo upevněte dvěma M3×30 a poté rohovým M3×18. Před zachycením závitu vyrovnejte otvory; díl nepřitahujte násilím.",
     "Linkes Gehäuse mit zwei M3×30, danach Eck-M3×18 befestigen. Bohrungen vor dem Einschrauben ausrichten; Gehäuse nicht mit Schrauben heranzwingen."
    ],
    "id": "belt-tensioner-left-15",
    "localNumber": 15,
    "officialStep": 16,
    "officialId": 952682,
    "source": "https://help.prusa3d.com/guide/how-to-replace-the-belt-tensioner-left-core-one_948782#952682",
    "refs": [
     400,
     405,
     412,
     436,
     551
    ]
   },
   {
    "title": [
     "センサーを戻し、ケーブルを留める",
     "Refit the sensor and secure its cable",
     "Vrácení senzoru a upevnění kabelu",
     "Sensor montieren und Kabel sichern"
    ],
    "body": [
     "ローラーを上・前へ向けてセンサーを戻し、M2.5×10を軽く締めます。センサーが調整できる程度の動きを残し、最初は後ろ寄りに置きます。新しい結束バンドでケーブルを留め、少し余裕を残して余分な帯を切ります。",
     "Refit the sensor with its roller upward and forward. Snug M2.5×10 while retaining adjustment movement; initially position the sensor toward the rear. Secure the cable with a new tie, leave slack and trim the excess band.",
     "Vraťte senzor s kladkou nahoru a vpřed. M2,5×10 dotáhněte lehce, aby zůstal pohyb pro seřízení; senzor zpočátku posuňte dozadu. Kabel zajistěte novou páskou, ponechte vůli a přebytek odstřihněte.",
     "Sensor mit Rolle nach oben und vorn montieren. M2,5×10 nur leicht anziehen, damit er einstellbar bleibt; zunächst nach hinten stellen. Kabel mit neuem Binder und etwas Lose sichern, Bandüberstand abschneiden."
    ],
    "id": "belt-tensioner-left-16",
    "localNumber": 16,
    "officialStep": 17,
    "officialId": 952708,
    "source": "https://help.prusa3d.com/guide/how-to-replace-the-belt-tensioner-left-core-one_948782#952708",
    "refs": [
     400,
     405,
     412,
     436,
     551
    ]
   },
   {
    "title": [
     "調整ねじのねじ部へ薄く注油する",
     "Lightly grease the adjusting thread",
     "Lehké namazání nastavovacího závitu",
     "Spanngewinde dünn fetten"
    ],
    "body": [
     "M3×30調整ねじの先端のねじ部に少量のPrusa Lubricantまたは適したグリスを付け、ねじ部全体へ薄く広げます。ベルトやプーリーの歯には付けません。",
     "Apply a small amount of Prusa Lubricant or suitable grease to the threaded tip of M3×30 and spread it thinly over the whole thread. Keep grease off the belt and pulley teeth.",
     "Na závit špičky M3×30 naneste malé množství Prusa Lubricant nebo vhodného maziva a rozetřete po celém závitu. Neznečistěte řemen ani zuby kladky.",
     "Wenig Prusa Lubricant oder geeignetes Fett an die Gewindespitze von M3×30 geben und dünn über das gesamte Gewinde verteilen. Riemen und Rollenzähne sauber halten."
    ],
    "id": "belt-tensioner-left-17",
    "localNumber": 17,
    "officialStep": 18,
    "officialId": 953384,
    "source": "https://help.prusa3d.com/guide/how-to-replace-the-belt-tensioner-left-core-one_948782#953384",
    "refs": [
     400,
     405,
     412,
     436,
     551
    ]
   },
   {
    "title": [
     "L／Rを上にし、角ナットを奥まで入れる",
     "Marking up; fully seat the nut",
     "Značka nahoru a matice zcela dovnitř",
     "Markierung nach oben, Mutter ganz einsetzen"
    ],
    "body": [
     "M3×30のベルト張り調整ねじを、プリンターに取り付けた左テンショナー本体の調整ねじ穴へ差し込みます。本体を固定したM3×30の2本とは別のねじです。左用プーリー保持部はLを上に置き、M3nS角ナットを角穴の奥まで差し込みます。",
     "Insert the separate M3×30 belt-adjusting screw into the adjustment hole in the left tensioner body already mounted on the printer. This is not either of the two M3×30 body-fixing screws. Put the left pulley carrier L side up and press the M3nS square nut fully into its pocket.",
     "Samostatný napínací šroub M3×30 zasuňte do nastavovacího otvoru levého těla již namontovaného na tiskárně. Nejde o žádný ze dvou upevňovacích šroubů M3×30. Levý držák kladky položte označením L nahoru a čtyřhrannou matici M3nS zatlačte až na doraz.",
     "Die separate Riemen-Spannschraube M3×30 in die Einstellbohrung des bereits montierten linken Spannergehäuses einführen. Sie ist von den zwei M3×30 zur Gehäusebefestigung zu unterscheiden. Linken Rollenhalter mit L nach oben ablegen und M3nS-Vierkantmutter ganz in die Tasche drücken."
    ],
    "id": "belt-tensioner-left-18",
    "localNumber": 18,
    "officialStep": 19,
    "officialId": 952791,
    "source": "https://help.prusa3d.com/guide/how-to-replace-the-belt-tensioner-left-core-one_948782#952791",
    "refs": [
     400,
     405,
     412,
     436,
     551
    ]
   },
   {
    "title": [
     "ベルトへ掛け、保持部と軸ねじを組む",
     "Hook into the belt and assemble the carrier",
     "Nasazení do řemenu a sestavení držáku",
     "In Riemen einhängen und Halter montieren"
    ],
    "body": [
     "アイドラーをベルトの輪へ掛け、ベルトがまっすぐでねじれていないことを確認します。角ナット側をプリンター中央へ向け、プラスチック保持部を重ねます。軸穴を合わせてM3×18を締め、左はL・右はRが上か再確認します。",
     "Hook the idler into the straight, untwisted belt loop. Fit the carrier with its square nut toward the printer centre. Align the axle holes, tighten M3×18, and recheck L up on the left or R up on the right.",
     "Kladku zavěste do rovné, nepřekroucené smyčky řemenu. Držák přiložte maticí ke středu tiskárny. Vyrovnejte otvory, dotáhněte M3×18 a ověřte L nahoře vlevo nebo R nahoře vpravo.",
     "Rolle in die gerade, unverdrehte Riemenschlaufe hängen. Halter mit Vierkantmutter zur Druckermitte aufsetzen. Bohrungen ausrichten, M3×18 anziehen und links L bzw. rechts R oben prüfen."
    ],
    "id": "belt-tensioner-left-19",
    "localNumber": 19,
    "officialStep": 20,
    "officialId": 952759,
    "source": "https://help.prusa3d.com/guide/how-to-replace-the-belt-tensioner-left-core-one_948782#952759",
    "refs": [
     400,
     405,
     412,
     436,
     551
    ]
   },
   {
    "title": [
     "保持部を差し込み、調整ねじを掛ける",
     "Insert the carrier and engage the adjuster",
     "Zasunutí držáku a zachycení šroubu",
     "Halter einschieben und Spannbolzen ansetzen"
    ],
    "body": [
     "プーリー一式をテンショナーへ押し込みます。角ナットとM3×30の軸を合わせ、ねじを掛けます。この段階では本締めせず、ベルトの張り調整を残します。",
     "Push the pulley assembly into the tensioner. Align its square nut with M3×30 and engage the thread. Leave final tension adjustment for later.",
     "Sestavu zatlačte do napínáku. Vyrovnejte matici s M3×30 a zachyťte závit. Konečné napnutí proveďte později.",
     "Rolleneinheit in den Spanner drücken. Vierkantmutter mit M3×30 ausrichten und Gewinde ansetzen. Endgültige Spannung erst später einstellen."
    ],
    "id": "belt-tensioner-left-20",
    "localNumber": 20,
    "officialStep": 21,
    "officialId": 952882,
    "source": "https://help.prusa3d.com/guide/how-to-replace-the-belt-tensioner-left-core-one_948782#952882",
    "refs": [
     400,
     405,
     412,
     436,
     551
    ]
   },
   {
    "title": [
     "レバーを避け、ドアとプロファイルを戻す",
     "Refit door and profile clear of the lever",
     "Vrácení dvířek a profilu mimo páčku",
     "Tür und Profil am Hebel vorbei montieren"
    ],
    "body": [
     "上側の前・側プロファイルの裏へタブを掛けます。スイッチレバーを穴に通し、傷めないようドアと左プロファイルを戻します。支えたまま最上部のM3×4bTを先に締め、レバーの収まりとクリックを確認します。",
     "Engage the tabs behind the upper front and side profiles. Pass the switch lever through its opening while refitting the door and left profile. Keep support until the top M3×4bT is secured; check lever clearance and click.",
     "Zahákněte jazýčky za horní přední a boční profil. Při vracení dvířek a levého profilu protáhněte páčku otvorem bez poškození. Dvířka držte do upevnění horního M3×4bT; ověřte vůli a cvaknutí páčky.",
     "Laschen hinter oberes Vorder- und Seitenprofil hängen. Beim Einsetzen von Tür und linkem Profil Hebel ohne Schaden durch Ausschnitt führen. Bis zur Befestigung des obersten M3×4bT stützen; Hebelfreiraum und Klicken prüfen."
    ],
    "id": "belt-tensioner-left-21",
    "localNumber": 21,
    "officialStep": 22,
    "officialId": 952131,
    "source": "https://help.prusa3d.com/guide/how-to-replace-the-belt-tensioner-left-core-one_948782#952131",
    "refs": [
     400,
     405,
     412,
     436,
     551
    ]
   },
   {
    "title": [
     "側面3本・前面2本を戻す",
     "Refit three side and two front screws",
     "Vrácení tří bočních a dvou předních šroubů",
     "Drei Seiten- und zwei Frontschrauben montieren"
    ],
    "body": [
     "上側タブがフレームの裏に入っていることを確かめ、側面のM3×4bTを3本、前面を2本戻します。ドアを支えながら1本ずつ締めます。",
     "Check that the upper tabs sit behind the frame, then refit three side and two front M3×4bT one at a time while supporting the door.",
     "Ověřte horní jazýčky za rámem a při podepření dvířek postupně vraťte tři boční a dva přední M3×4bT.",
     "Obere Laschen hinter dem Rahmen prüfen und mit gestützter Tür drei seitliche sowie zwei vordere M3×4bT einzeln montieren."
    ],
    "id": "belt-tensioner-left-22",
    "localNumber": 22,
    "officialStep": 23,
    "officialId": 952185,
    "source": "https://help.prusa3d.com/guide/how-to-replace-the-belt-tensioner-left-core-one_948782#952185",
    "refs": [
     400,
     405,
     412,
     436,
     551
    ]
   },
   {
    "title": [
     "LCDパネルを元へ戻す",
     "Return the LCD panel",
     "Vrácení panelu LCD",
     "LCD-Frontblende zurücksetzen"
    ],
    "body": [
     "LCDのケーブルを挟まず、前面パネルを左へ滑らせて左プロファイルへ掛けます。右端を持ち上げ、奥へ押して面をそろえ、右端を下げて右プロファイルと磁石に掛けます。",
     "Slide the front panel left into the left profile without pinching LCD cables. Lift the right end, push the panel flush, then lower the right end onto its profile and magnets.",
     "Bez skřípnutí kabelů LCD posuňte panel doleva do levého profilu. Pravý konec zvedněte, panel zatlačte do roviny a pravý konec spusťte na profil a magnety.",
     "Frontblende ohne gequetschte LCD-Kabel links einhängen. Rechtes Ende anheben, Blende bündig nach hinten drücken und rechts auf Profil und Magnete absenken."
    ],
    "id": "belt-tensioner-left-23",
    "localNumber": 23,
    "officialStep": 24,
    "officialId": 952221,
    "source": "https://help.prusa3d.com/guide/how-to-replace-the-belt-tensioner-left-core-one_948782#952221",
    "refs": [
     400,
     405,
     412,
     436,
     551
    ]
   },
   {
    "title": [
     "ドアを開閉し、クリック位置を合わせる",
     "Adjust the door click position",
     "Seřízení cvaknutí dvířek",
     "Schaltpunkt der Tür einstellen"
    ],
    "body": [
     "ドアを閉じ、スイッチがクリックするか確認します。鳴らなければ調整ねじを少しずつ締めます。何度か開閉し、レバーが無理なく戻る位置に合わせます。",
     "Close the door and listen for the switch click. If absent, tighten the adjusting screw gradually. Open and close several times and check that the lever returns freely.",
     "Zavřete dvířka a ověřte cvaknutí spínače. Pokud chybí, seřizovací šroub utahujte po malých krocích. Několikrát otevřete a zavřete a ověřte volný návrat páčky.",
     "Tür schließen und auf Schalterklicken achten. Fehlt es, Einstellschraube schrittweise anziehen. Mehrmals öffnen und schließen; Hebel muss frei zurückkehren."
    ],
    "id": "belt-tensioner-left-24",
    "localNumber": 24,
    "officialStep": 25,
    "officialId": 952275,
    "source": "https://help.prusa3d.com/guide/how-to-replace-the-belt-tensioner-left-core-one_948782#952275",
    "refs": [
     400,
     405,
     412,
     436,
     551
    ]
   },
   {
    "title": [
     "板金11本・カバー5本のリベットを戻す",
     "Refit eleven panel and five cover rivets",
     "Vrácení jedenácti a pěti nýtů",
     "Elf Blech- und fünf Abdecknieten montieren"
    ],
    "body": [
     "左側の板金を穴へ合わせ、ナイロンリベット11本を戻します。上側プラスチックカバーも合わせて5本を戻します。各胴を奥まで差してからピンを押し、固定を確認します。",
     "Align the left sheet and refit eleven nylon rivets. Align the upper plastic cover and refit five. Insert each body fully before pressing its pin and checking the lock.",
     "Vyrovnejte levý plech a vraťte jedenáct nýtů. Pak horní plastový kryt a pět nýtů. Každé tělo zasuňte zcela, potom stiskněte kolík a ověřte zajištění.",
     "Linkes Blech ausrichten und elf Nylonnieten einsetzen. Obere Kunststoffabdeckung mit fünf Nieten montieren. Jeden Nietkörper ganz einsetzen, dann Stift drücken und Verriegelung prüfen."
    ],
    "id": "belt-tensioner-left-25",
    "localNumber": 25,
    "officialStep": 26,
    "officialId": 952321,
    "source": "https://help.prusa3d.com/guide/how-to-replace-the-belt-tensioner-left-core-one_948782#952321",
    "refs": [
     400,
     405,
     412,
     436,
     551
    ]
   },
   {
    "title": [
     "電源を入れ、Door Sensorの値を確認する",
     "Power on and check Door Sensor readings",
     "Zapnutí a kontrola údaje Door Sensor",
     "Einschalten und Door Sensor prüfen"
    ],
    "body": [
     "電源コードを接続し、背面スイッチをONにします。実機のInfo → Sensor Info → Door Sensorを開き、ドアの開閉に合わせて値が開／閉へ切り替わることを確認します。クリック音だけで完了にしません。\n\n値が開／閉に切り替わらなければ手順24へ戻り、M3×12のドアセンサー調整ねじを少しずつ調整します。M2.5×10の固定ねじやM3×30のベルト調整ねじと取り違えないでください。調整後はこの手順26で表示を再確認します。",
     "Reconnect power and switch ON at the rear. Open Info → Sensor Info → Door Sensor on the printer. Check that the reading changes with the actual door opening and closing; a click alone is insufficient.\n\nIf the value does not change between open and closed, return to local step 24 and adjust the M3×12 door-sensor screw gradually. Do not confuse it with the M2.5×10 mounting screw or M3×30 belt adjuster. Recheck the display here at local step 26.",
     "Připojte síť a zapněte zadní vypínač. Na tiskárně otevřete Info → Sensor Info → Door Sensor. Hodnota se musí měnit při skutečném otevření a zavření; samotné cvaknutí nestačí.\n\nPokud se hodnota nepřepíná mezi otevřeno a zavřeno, vraťte se k místnímu kroku 24 a po malých krocích nastavte šroub senzoru M3×12. Nezaměňte jej s upevňovacím M2,5×10 ani napínacím M3×30. Zobrazení znovu ověřte zde v místním kroku 26.",
     "Netz anschließen und hinten einschalten. Am Drucker Info → Sensor Info → Door Sensor öffnen. Wert muss beim tatsächlichen Öffnen und Schließen wechseln; Klicken allein genügt nicht.\n\nWechselt der Wert nicht zwischen offen und geschlossen, zu lokalem Schritt 24 zurückkehren und die M3×12-Türsensorschraube schrittweise einstellen. Nicht mit M2,5×10 zur Befestigung oder M3×30 zur Riemenspannung verwechseln. Anzeige hier in lokalem Schritt 26 erneut prüfen."
    ],
    "id": "belt-tensioner-left-26",
    "localNumber": 26,
    "officialStep": 27,
    "officialId": 952365,
    "source": "https://help.prusa3d.com/guide/how-to-replace-the-belt-tensioner-left-core-one_948782#952365",
    "refs": [
     400,
     405,
     412,
     436,
     551
    ]
   },
   {
    "title": [
     "電源を入れ、両ベルトの張りを戻す",
     "Power on and restore both belt tensions",
     "Zapnutí a napnutí obou řemenů",
     "Einschalten und beide Riemen spannen"
    ],
    "body": [
     "Control → Disable Motorsでモーターを無効にします。NextruderをX中央・Y最前部へ手で動かし、ガントリーの左右の角を前側フレームへ押し当て、両側にすき間やがたつきがないことを確認します。整列確認後、モーターを無効にしたままNextruderをX右端・Y最前部へ動かします。公式Belt TunerでCORE One → XY-belt → Start listeningを選び、端末をベルトの近くへ置きます。前側にある上側ベルトの中央を軽くはじいて測り、下側も同じように測ります。目安は上側98 Hz・下側92 Hzです。左の調整ねじが上側、右が下側のベルトに対応します。両ねじを同じ量ずつ交互に、1回につき1/2回転ずつ締めるか緩め、その都度両ベルトを再測定します。締めると振動数が上がり、緩めると下がります。前側の角にすき間が出た場合は両調整ねじを緩め、公式記事のAlignment手順で整列からやり直します。ベルトのねじれや側面への乗り上げも確認します。",
     "Use Control → Disable Motors. Move the Nextruder by hand to X centre and Y fully forward. Press both gantry corners against the front frame and check for gaps or rocking. After alignment, keep the motors disabled and move the Nextruder to X fully right and Y fully forward. In the official Belt Tuner select CORE One → XY-belt → Start listening and hold the device near the belts. Lightly pluck the middle of the front upper belt, measure it, and repeat for the lower belt. Targets are upper 98 Hz and lower 92 Hz. The left adjuster acts on the upper belt; the right on the lower. Alternate equal half-turn adjustments of the two screws and remeasure both belts each time. Tightening raises frequency; loosening lowers it. If a front-corner gap appears, loosen both adjusters and repeat Alignment in the linked official procedure. Check that neither belt is twisted or climbing a flange.",
     "Zvolte Control → Disable Motors. Nextruder ručně posuňte do středu X a zcela dopředu v Y. Oba rohy portálu přitlačte k přednímu rámu a ověřte, že nevzniká mezera ani viklání. Po vyrovnání ponechte motory vypnuté a Nextruder posuňte zcela doprava v X a dopředu v Y. V oficiálním Belt Tuner zvolte CORE One → XY-belt → Start listening a přidržte zařízení u řemenů. Lehce brnkněte do středu předního horního řemenu, změřte jej a stejně změřte dolní. Cíle jsou horní 98 Hz a dolní 92 Hz. Levý šroub nastavuje horní řemen, pravý dolní. Oba šrouby střídavě upravujte o stejnou půlotáčku a po každé úpravě znovu změřte oba řemeny. Utahování frekvenci zvyšuje, povolování snižuje. Pokud u předního rohu vznikne mezera, povolte oba napínací šrouby a zopakujte Alignment v odkazovaném oficiálním postupu. Ověřte, že řemeny nejsou překroucené ani nenabíhají na přírubu.",
     "Control → Disable Motors wählen. Nextruder von Hand zur X-Mitte und in Y ganz nach vorn bewegen. Beide Gantry-Ecken an den vorderen Rahmen drücken und auf Spalten oder Wackeln prüfen. Nach dem Ausrichten die Motoren deaktiviert lassen und den Nextruder in X ganz nach rechts und in Y ganz nach vorn bewegen. Im offiziellen Belt Tuner CORE One → XY-belt → Start listening wählen und das Gerät an die Riemen halten. Mitte des vorderen oberen Riemens leicht anzupfen, messen und den unteren ebenso messen. Zielwerte: oben 98 Hz, unten 92 Hz. Die linke Stellschraube wirkt auf den oberen, die rechte auf den unteren Riemen. Beide Schrauben abwechselnd um jeweils dieselbe halbe Umdrehung verstellen und danach jedes Mal beide Riemen neu messen. Anziehen erhöht die Frequenz, Lösen senkt sie. Entsteht vorn ein Spalt, beide Spannschrauben lösen und Alignment in der verlinkten offiziellen Anleitung wiederholen. Auf Verdrehung oder Auflaufen auf eine Flanschkante prüfen."
    ],
    "id": "belt-tensioner-left-27",
    "localNumber": 27,
    "officialStep": 28,
    "officialId": 952922,
    "source": "https://help.prusa3d.com/guide/how-to-replace-the-belt-tensioner-left-core-one_948782#952922",
    "refs": [
     400,
     405,
     412,
     436,
     551
    ],
    "firmwareActions": [
     "disable"
    ],
    "related": [
     "belts"
    ],
    "link": "https://belt.connect.prusa3d.com/",
    "supplementalSources": [
     {
      "label": [
       "ベルト張り調整の公式手順",
       "Official belt adjustment procedure",
       "Oficiální nastavení řemenů",
       "Offizielle Riemeneinstellung"
      ],
      "url": "https://help.prusa3d.com/article/adjusting-belt-tension-core-one-core-one-indx-core-one-l_845048"
     }
    ]
   },
   {
    "title": [
     "実機のSelftestで復旧を確認する",
     "Verify restoration with the printer Selftest",
     "Ověření pomocí Selftestu tiskárny",
     "Wiederherstellung mit Selftest prüfen"
    ],
    "body": [
     "全ねじとカバーを確認し、ドアを閉じます。実機でControl → Calibrations & Tests → Selftestを実行し、軸・ベルト・センサーの確認を最後まで行います。エラー、引っ掛かり、異音があれば作業を完了せず、電源を切って原因を確認します。",
     "Check every screw and cover and close the door. Run Control → Calibrations & Tests → Selftest on the printer and complete the axis, belt and sensor checks. Resolve errors, binding or unusual noise before finishing; switch off before mechanical inspection.",
     "Ověřte šrouby a kryty, zavřete dvířka a na tiskárně spusťte Control → Calibrations & Tests → Selftest. Dokončete kontroly os, řemenů a senzorů. Chyby, drhnutí nebo neobvyklý hluk odstraňte před dokončením; před mechanickou kontrolou vypněte napájení.",
     "Alle Schrauben und Abdeckungen prüfen, Tür schließen und am Drucker Control → Calibrations & Tests → Selftest ausführen. Achsen-, Riemen- und Sensorprüfungen abschließen. Fehler, Klemmen oder ungewöhnliche Geräusche vor Abschluss beheben; vor mechanischer Prüfung ausschalten."
    ],
    "id": "belt-tensioner-left-28",
    "localNumber": 28,
    "officialStep": 29,
    "officialId": 952411,
    "source": "https://help.prusa3d.com/guide/how-to-replace-the-belt-tensioner-left-core-one_948782#952411",
    "refs": [
     400,
     405,
     412,
     436,
     551
    ],
    "firmwareActions": [
     "selftest"
    ]
   }
  ]
 },
 {
  "id": "belt-tensioner-right",
  "title": [
   "右ベルトテンショナーの交換",
   "Replace the right belt tensioner",
   "Výměna pravého napínáku",
   "Rechten Riemenspanner ersetzen"
  ],
  "category": 2,
  "interval": [
   "部品の交換時",
   "When replacing parts",
   "Při výměně dílů",
   "Beim Teiletausch"
  ],
  "source": "https://help.prusa3d.com/guide/how-to-replace-the-belt-tensioner-right-core-one_948790",
  "tensionerService": true,
  "revision": 1,
  "steps": [
   {
    "title": [
     "交換する側と部品を確認する",
     "Identify the side and parts",
     "Určení strany a dílů",
     "Seite und Teile bestimmen"
    ],
    "body": [
     "この手順は、プリンターの正面から見た右側のテンショナー交換です。反対側は別の交換ガイドを開いてください。プーリー保持部とテンショナー本体は別部品です。取り外したねじ・ナットは再使用まで保管し、写真の向きを確認して進めます。板金の端に気を付けてください。",
     "This guide replaces the right tensioner as seen from the printer front. Use the other guide for the opposite side. The pulley carrier and main tensioner are separate parts. Keep removed screws and nuts for refitting and compare orientations with the photos. Handle sheet-metal edges carefully.",
     "Tento návod je pro pravý napínák při pohledu zepředu. Pro opačnou stranu otevřete druhý návod. Držák kladky a hlavní napínák jsou samostatné díly. Šrouby a matice uschovejte a orientaci ověřujte na fotografiích. Pozor na hrany plechů.",
     "Diese Anleitung gilt für die rechte Seite von vorn gesehen. Für die Gegenseite die andere Anleitung öffnen. Rollenhalter und Spannergehäuse sind getrennte Teile. Schrauben und Muttern aufbewahren und die Ausrichtung mit den Fotos vergleichen. Blechkanten vorsichtig handhaben."
    ],
    "id": "belt-tensioner-right-1",
    "localNumber": 1,
    "officialStep": 2,
    "officialId": 951171,
    "source": "https://help.prusa3d.com/guide/how-to-replace-the-belt-tensioner-right-core-one_948790#951171",
    "refs": [
     396,
     568,
     418,
     438,
     553
    ]
   },
   {
    "title": [
     "工具とグリスを用意する",
     "Prepare tools and grease",
     "Příprava nářadí a maziva",
     "Werkzeug und Fett bereitlegen"
    ],
    "body": [
     "2.5 mm六角レンチと適したグリスを用意します。外した部品を置く容器も準備します。",
     "Prepare a 2.5 mm Allen key, suitable grease and a container for removed parts.",
     "Připravte imbus 2,5 mm, vhodné mazivo a nádobku na vyjmuté díly.",
     "2,5-mm-Inbusschlüssel, geeignetes Fett und eine Ablage für ausgebaute Teile bereitlegen."
    ],
    "id": "belt-tensioner-right-2",
    "localNumber": 2,
    "officialStep": 3,
    "officialId": 951214,
    "source": "https://help.prusa3d.com/guide/how-to-replace-the-belt-tensioner-right-core-one_948790#951214",
    "refs": [
     396,
     568,
     418,
     438,
     553
    ]
   },
   {
    "title": [
     "ホームへ戻し、冷却して電源を切る",
     "Home, cool and disconnect power",
     "Referenční poloha, vychladnutí a odpojení",
     "Referenzfahrt, Abkühlen und Netz trennen"
    ],
    "body": [
     "印刷を停止し、Control → Auto Homeを実行します。加熱を止め、ノズルとベッドが室温まで冷めたことを表示で確認します。その後、背面スイッチをOFFにし、電源コードを抜き、作業用にドアを開きます。",
     "Stop printing and run Control → Auto Home. Stop heating and wait until the displayed nozzle and bed temperatures reach room temperature. Then switch OFF at the rear and unplug the power cord. Open the door for access.",
     "Ukončete tisk a spusťte Control → Auto Home. Vypněte ohřev a vyčkejte na pokojovou teplotu trysky i podložky na displeji. Potom vypněte zadní vypínač a odpojte síťový kabel. Otevřete dvířka pro přístup.",
     "Druck beenden und Control → Auto Home ausführen. Heizung abschalten und auf angezeigte Raumtemperatur von Düse und Bett warten. Danach hinten ausschalten, Netzkabel ziehen und die Tür für den Zugang öffnen."
    ],
    "id": "belt-tensioner-right-3",
    "localNumber": 3,
    "officialStep": 4,
    "officialId": 951240,
    "source": "https://help.prusa3d.com/guide/how-to-replace-the-belt-tensioner-right-core-one_948790#951240",
    "refs": [
     396,
     568,
     418,
     438,
     553
    ],
    "firmwareActions": [
     "home",
     "cooldown"
    ]
   },
   {
    "title": [
     "左右のテンショナー位置を確認する",
     "Locate both tensioners",
     "Určení obou napínáků",
     "Beide Spanner lokalisieren"
    ],
    "body": [
     "前側の左右にテンショナーがあります。写真は右側を例にしています。左側はL、右側はRを上にし、角ナットはどちらも中央へ向けます。",
     "The tensioners are at the two front corners. The photos demonstrate the right side. Use L up on the left and R up on the right; both nuts face the centre.",
     "Napínáky jsou v obou předních rozích. Fotografie ukazují pravou stranu. Vlevo patří nahoru L, vpravo R; obě matice směřují ke středu.",
     "Spanner sitzen an beiden vorderen Ecken. Die Fotos zeigen rechts. Links L, rechts R nach oben; beide Muttern zeigen zur Mitte."
    ],
    "id": "belt-tensioner-right-4",
    "localNumber": 4,
    "officialStep": 5,
    "officialId": 951276,
    "source": "https://help.prusa3d.com/guide/how-to-replace-the-belt-tensioner-right-core-one_948790#951276",
    "refs": [
     396,
     568,
     418,
     438,
     553
    ]
   },
   {
    "title": [
     "張りを抜き、プーリーを内側へ抜く",
     "Release tension and withdraw the pulley inward",
     "Povolení řemenu a vytažení kladky dovnitř",
     "Spannung lösen und Rolle nach innen ziehen"
    ],
    "body": [
     "選んだ側のM3×30調整ねじを、プーリーの角ナットから完全に外れるまで緩めます。内側からベルトを引き、プーリー一式をテンショナーから外します。ベルトをねじらず、歯を傷めないように支えます。\n\n先にプーリーを外せない場合は張りを抜いたまま残します。「本体を外した後に分解」を選び、次の分解も後回しにして、このガイドの手順7へ進みます。",
     "Back out the selected M3×30 adjusting screw completely from the pulley nut. Pull the belt from inside to release the pulley assembly from the tensioner. Support the belt without twisting or damaging its teeth.\n\nIf the pulley cannot be released first, leave it with tension released. Select disassembly after body removal, defer the next disassembly step as well, and continue at local step 7.",
     "Vyšroubujte vybraný nastavovací M3×30 z matice kladky. Z vnitřní strany zatáhněte za řemen a uvolněte sestavu z napínáku. Řemen podepřete, nekruťte jím a nepoškoďte zuby.\n\nPokud kladku nelze uvolnit předem, ponechte ji s povoleným řemenem. Zvolte rozebrání po sejmutí těla, odložte i následující rozebrání a pokračujte místním krokem 7.",
     "Gewählten M3×30-Spannbolzen vollständig aus der Rollenmuttern lösen. Riemen von innen ziehen und Rolleneinheit aus dem Spanner lösen. Riemen ohne Verdrehen oder beschädigte Zähne stützen.\n\nIst die Rolle vorher nicht lösbar, mit gelöster Spannung belassen. Zerlegung nach Gehäuseausbau wählen, auch den nächsten Zerlegungsschritt verschieben und mit lokalem Schritt 7 fortfahren."
    ],
    "id": "belt-tensioner-right-5",
    "localNumber": 5,
    "officialStep": 6,
    "officialId": 951302,
    "source": "https://help.prusa3d.com/guide/how-to-replace-the-belt-tensioner-right-core-one_948790#951302",
    "refs": [
     396,
     568,
     418,
     438,
     553
    ]
   },
   {
    "title": [
     "軸ねじ、保持部、アイドラーを分ける",
     "Separate axle screw, carrier and idler",
     "Oddělení osového šroubu, držáku a kladky",
     "Achsschraube, Halter und Rolle trennen"
    ],
    "body": [
     "M3×18を抜きます。プラスチック保持部をアイドラーから分け、GT2-20アイドラーをベルトの輪から外します。ねじ、角ナット、アイドラーは紛失しないよう保管します。\n\n先にプーリーを外せない場合は張りを抜いたまま残します。「本体を外した後に分解」を選び、次の分解も後回しにして、このガイドの手順7へ進みます。",
     "Remove M3×18. Separate the plastic carrier and take the GT2-20 idler out of the belt loop. Retain the screw, square nut and idler.\n\nIf the pulley cannot be released first, leave it with tension released. Select disassembly after body removal, defer the next disassembly step as well, and continue at local step 7.",
     "Vyjměte M3×18, oddělte plastový držák a vyjměte kladku GT2-20 ze smyčky řemenu. Uschovejte šroub, čtyřhrannou matici i kladku.\n\nPokud kladku nelze uvolnit předem, ponechte ji s povoleným řemenem. Zvolte rozebrání po sejmutí těla, odložte i následující rozebrání a pokračujte místním krokem 7.",
     "M3×18 entfernen, Kunststoffhalter trennen und GT2-20-Rolle aus der Riemenschlaufe nehmen. Schraube, Vierkantmutter und Rolle aufbewahren.\n\nIst die Rolle vorher nicht lösbar, mit gelöster Spannung belassen. Zerlegung nach Gehäuseausbau wählen, auch den nächsten Zerlegungsschritt verschieben und mit lokalem Schritt 7 fortfahren."
    ],
    "id": "belt-tensioner-right-6",
    "localNumber": 6,
    "officialStep": 7,
    "officialId": 951330,
    "source": "https://help.prusa3d.com/guide/how-to-replace-the-belt-tensioner-right-core-one_948790#951330",
    "refs": [
     396,
     568,
     418,
     438,
     553
    ]
   },
   {
    "title": [
     "右本体の固定ねじ3本を抜く",
     "Remove the three right-body screws",
     "Vyjmutí tří šroubů pravého těla",
     "Drei rechte Gehäuseschrauben entfernen"
    ],
    "body": [
     "内側から右テンショナーを固定する3本のねじを1本ずつ抜き、プラスチック本体を取り出します。\n\n後回しにしたプーリーがある場合は、調整ねじを本体から抜いてから本体とプーリーを支えて取り外します。手順6のM3×18を抜き、保持部とアイドラーを分け、アイドラーをベルトの輪から外します。終わったら手順8へ進みます。",
     "Remove the three screws from inside, one at a time, then take out the right plastic body.\n\nFor the deferred route, withdraw the adjusting screw from the body before supporting and removing the body and pulley together. Perform local step 6: remove M3×18, separate the carrier and idler, and take the idler out of the belt loop. Rejoin at local step 8.",
     "Zevnitř postupně vyjměte tři šrouby a pravé plastové tělo.\n\nV odložené větvi nejprve vytáhněte napínací šroub z těla, pak podepřete a vyjměte tělo s kladkou. Proveďte místní krok 6: vyjměte M3×18, oddělte držák a kladku a kladku vyjměte ze smyčky řemenu. Pokračujte místním krokem 8.",
     "Drei Schrauben einzeln von innen entfernen und rechtes Kunststoffgehäuse herausnehmen.\n\nBeim verschobenen Ausbau zuerst die Spannschraube aus dem Gehäuse ziehen, dann Gehäuse und Rolle gemeinsam gestützt herausnehmen. Lokalen Schritt 6 ausführen: M3×18 entfernen, Halter und Rolle trennen und Rolle aus der Riemenschlaufe nehmen. Mit lokalem Schritt 8 fortfahren."
    ],
    "id": "belt-tensioner-right-7",
    "localNumber": 7,
    "officialStep": 8,
    "officialId": 951636,
    "source": "https://help.prusa3d.com/guide/how-to-replace-the-belt-tensioner-right-core-one_948790#951636",
    "refs": [
     396,
     568,
     418,
     438,
     553
    ]
   },
   {
    "title": [
     "右本体とM3×30を4本そろえる",
     "Prepare right body and four M3×30",
     "Příprava pravého těla a čtyř M3×30",
     "Rechtes Gehäuse und vier M3×30 bereitlegen"
    ],
    "body": [
     "右用belt-tensioner-rightとM3×30を4本用意します。3本は本体固定、残り1本は前面から入れる調整ねじです。",
     "Prepare belt-tensioner-right and four M3×30: three secure the body; the fourth is the front adjusting screw.",
     "Připravte belt-tensioner-right a čtyři M3×30. Tři upevňují tělo, čtvrtý je přední napínací šroub.",
     "Belt-tensioner-right und vier M3×30 bereitlegen. Drei befestigen das Gehäuse, der vierte spannt von vorn."
    ],
    "id": "belt-tensioner-right-8",
    "localNumber": 8,
    "officialStep": 9,
    "officialId": 951656,
    "source": "https://help.prusa3d.com/guide/how-to-replace-the-belt-tensioner-right-core-one_948790#951656",
    "refs": [
     396,
     568,
     418,
     438,
     553
    ]
   },
   {
    "title": [
     "右本体を固定する",
     "Secure the right body",
     "Upevnění pravého těla",
     "Rechtes Gehäuse befestigen"
    ],
    "body": [
     "新しい右本体をCoreXYの取付位置に合わせ、開口を前へ向けます。M3×30を3本締めて固定します。4本目を前面へ差しますが、プーリーを戻すまでねじを掛けません。",
     "Align the new right body on CoreXY with the opening forward. Secure it with three M3×30. Insert the fourth at the front without engaging it until the pulley is fitted.",
     "Nové pravé tělo vyrovnejte na CoreXY, otvorem vpřed. Upevněte třemi M3×30. Čtvrtý zasuňte zepředu, závit zachyťte až po vložení kladky.",
     "Neues rechtes Gehäuse auf CoreXY mit Öffnung nach vorn ausrichten. Mit drei M3×30 befestigen. Vierten vorn einführen, erst nach Einsetzen der Rolle einschrauben."
    ],
    "id": "belt-tensioner-right-9",
    "localNumber": 9,
    "officialStep": 10,
    "officialId": 951690,
    "source": "https://help.prusa3d.com/guide/how-to-replace-the-belt-tensioner-right-core-one_948790#951690",
    "refs": [
     396,
     568,
     418,
     438,
     553
    ]
   },
   {
    "title": [
     "プーリーの部品をそろえる",
     "Prepare the pulley parts",
     "Příprava dílů kladky",
     "Rollenteile bereitlegen"
    ],
    "body": [
     "belt-tensioner-pulley、M3nS角ナット、M3×18、GT2-20アイドラーをそろえます。傷んだ部品を交換し、再使用する部品の汚れを取り除きます。",
     "Prepare the belt-tensioner-pulley, M3nS square nut, M3×18 and GT2-20 idler. Replace damaged parts and clean retained parts.",
     "Připravte belt-tensioner-pulley, matici M3nS, M3×18 a kladku GT2-20. Poškozené díly vyměňte, ponechané očistěte.",
     "Belt-tensioner-pulley, Vierkantmutter M3nS, M3×18 und GT2-20-Rolle bereitlegen. Beschädigte Teile ersetzen, wiederverwendete reinigen."
    ],
    "id": "belt-tensioner-right-10",
    "localNumber": 10,
    "officialStep": 11,
    "officialId": 951368,
    "source": "https://help.prusa3d.com/guide/how-to-replace-the-belt-tensioner-right-core-one_948790#951368",
    "refs": [
     396,
     568,
     418,
     438,
     553
    ]
   },
   {
    "title": [
     "L／Rを上にし、角ナットを奥まで入れる",
     "Marking up; fully seat the nut",
     "Značka nahoru a matice zcela dovnitř",
     "Markierung nach oben, Mutter ganz einsetzen"
    ],
    "body": [
     "左側はL、右側はRが上になる向きで保持部を置きます。M3nSを角穴へ差し込み、奥まで着座させます。反対側の文字で組み付けないでください。",
     "Place the carrier with L upward on the left or R upward on the right. Push M3nS fully into its square pocket. Do not assemble with the opposite marking up.",
     "Vlevo musí být nahoře L, vpravo R. Matici M3nS zasuňte zcela do čtyřhranné kapsy. Nezaměňte horní označení.",
     "Links L, rechts R nach oben ausrichten. M3nS ganz in die Vierkanttasche drücken. Obere Markierung nicht vertauschen."
    ],
    "id": "belt-tensioner-right-11",
    "localNumber": 11,
    "officialStep": 12,
    "officialId": 951418,
    "source": "https://help.prusa3d.com/guide/how-to-replace-the-belt-tensioner-right-core-one_948790#951418",
    "refs": [
     396,
     568,
     418,
     438,
     553
    ]
   },
   {
    "title": [
     "ベルトへ掛け、保持部と軸ねじを組む",
     "Hook into the belt and assemble the carrier",
     "Nasazení do řemenu a sestavení držáku",
     "In Riemen einhängen und Halter montieren"
    ],
    "body": [
     "アイドラーをベルトの輪へ掛け、ベルトがまっすぐでねじれていないことを確認します。角ナット側をプリンター中央へ向け、プラスチック保持部を重ねます。軸穴を合わせてM3×18を締め、左はL・右はRが上か再確認します。",
     "Hook the idler into the straight, untwisted belt loop. Fit the carrier with its square nut toward the printer centre. Align the axle holes, tighten M3×18, and recheck L up on the left or R up on the right.",
     "Kladku zavěste do rovné, nepřekroucené smyčky řemenu. Držák přiložte maticí ke středu tiskárny. Vyrovnejte otvory, dotáhněte M3×18 a ověřte L nahoře vlevo nebo R nahoře vpravo.",
     "Rolle in die gerade, unverdrehte Riemenschlaufe hängen. Halter mit Vierkantmutter zur Druckermitte aufsetzen. Bohrungen ausrichten, M3×18 anziehen und links L bzw. rechts R oben prüfen."
    ],
    "id": "belt-tensioner-right-12",
    "localNumber": 12,
    "officialStep": 13,
    "officialId": 951446,
    "source": "https://help.prusa3d.com/guide/how-to-replace-the-belt-tensioner-right-core-one_948790#951446",
    "refs": [
     396,
     568,
     418,
     438,
     553
    ]
   },
   {
    "title": [
     "調整ねじのねじ部へ薄く注油する",
     "Lightly grease the adjusting thread",
     "Lehké namazání nastavovacího závitu",
     "Spanngewinde dünn fetten"
    ],
    "body": [
     "M3×30調整ねじの先端のねじ部に少量のPrusa Lubricantまたは適したグリスを付け、ねじ部全体へ薄く広げます。ベルトやプーリーの歯には付けません。",
     "Apply a small amount of Prusa Lubricant or suitable grease to the threaded tip of M3×30 and spread it thinly over the whole thread. Keep grease off the belt and pulley teeth.",
     "Na závit špičky M3×30 naneste malé množství Prusa Lubricant nebo vhodného maziva a rozetřete po celém závitu. Neznečistěte řemen ani zuby kladky.",
     "Wenig Prusa Lubricant oder geeignetes Fett an die Gewindespitze von M3×30 geben und dünn über das gesamte Gewinde verteilen. Riemen und Rollenzähne sauber halten."
    ],
    "id": "belt-tensioner-right-13",
    "localNumber": 13,
    "officialStep": 14,
    "officialId": 953418,
    "source": "https://help.prusa3d.com/guide/how-to-replace-the-belt-tensioner-right-core-one_948790#953418",
    "refs": [
     396,
     568,
     418,
     438,
     553
    ]
   },
   {
    "title": [
     "保持部を差し込み、調整ねじを掛ける",
     "Insert the carrier and engage the adjuster",
     "Zasunutí držáku a zachycení šroubu",
     "Halter einschieben und Spannbolzen ansetzen"
    ],
    "body": [
     "プーリー一式をテンショナーへ押し込みます。角ナットとM3×30の軸を合わせ、ねじを掛けます。この段階では本締めせず、ベルトの張り調整を残します。",
     "Push the pulley assembly into the tensioner. Align its square nut with M3×30 and engage the thread. Leave final tension adjustment for later.",
     "Sestavu zatlačte do napínáku. Vyrovnejte matici s M3×30 a zachyťte závit. Konečné napnutí proveďte později.",
     "Rolleneinheit in den Spanner drücken. Vierkantmutter mit M3×30 ausrichten und Gewinde ansetzen. Endgültige Spannung erst später einstellen."
    ],
    "id": "belt-tensioner-right-14",
    "localNumber": 14,
    "officialStep": 15,
    "officialId": 951516,
    "source": "https://help.prusa3d.com/guide/how-to-replace-the-belt-tensioner-right-core-one_948790#951516",
    "refs": [
     396,
     568,
     418,
     438,
     553
    ]
   },
   {
    "title": [
     "電源を入れ、両ベルトの張りを戻す",
     "Power on and restore both belt tensions",
     "Zapnutí a napnutí obou řemenů",
     "Einschalten und beide Riemen spannen"
    ],
    "body": [
     "組付けと工具の取り忘れを確認し、電源コードを接続してONにします。Control → Disable Motorsでモーターを無効にします。NextruderをX中央・Y最前部へ手で動かし、ガントリーの左右の角を前側フレームへ押し当て、両側にすき間やがたつきがないことを確認します。整列確認後、モーターを無効にしたままNextruderをX右端・Y最前部へ動かします。公式Belt TunerでCORE One → XY-belt → Start listeningを選び、端末をベルトの近くへ置きます。前側にある上側ベルトの中央を軽くはじいて測り、下側も同じように測ります。目安は上側98 Hz・下側92 Hzです。左の調整ねじが上側、右が下側のベルトに対応します。両ねじを同じ量ずつ交互に、1回につき1/2回転ずつ締めるか緩め、その都度両ベルトを再測定します。締めると振動数が上がり、緩めると下がります。前側の角にすき間が出た場合は両調整ねじを緩め、公式記事のAlignment手順で整列からやり直します。ベルトのねじれや側面への乗り上げも確認します。",
     "Check the assembly, remove tools, reconnect power and switch ON. Use Control → Disable Motors. Move the Nextruder by hand to X centre and Y fully forward. Press both gantry corners against the front frame and check for gaps or rocking. After alignment, keep the motors disabled and move the Nextruder to X fully right and Y fully forward. In the official Belt Tuner select CORE One → XY-belt → Start listening and hold the device near the belts. Lightly pluck the middle of the front upper belt, measure it, and repeat for the lower belt. Targets are upper 98 Hz and lower 92 Hz. The left adjuster acts on the upper belt; the right on the lower. Alternate equal half-turn adjustments of the two screws and remeasure both belts each time. Tightening raises frequency; loosening lowers it. If a front-corner gap appears, loosen both adjusters and repeat Alignment in the linked official procedure. Check that neither belt is twisted or climbing a flange.",
     "Zkontrolujte montáž, odstraňte nářadí, připojte napájení a zapněte tiskárnu. Zvolte Control → Disable Motors. Nextruder ručně posuňte do středu X a zcela dopředu v Y. Oba rohy portálu přitlačte k přednímu rámu a ověřte, že nevzniká mezera ani viklání. Po vyrovnání ponechte motory vypnuté a Nextruder posuňte zcela doprava v X a dopředu v Y. V oficiálním Belt Tuner zvolte CORE One → XY-belt → Start listening a přidržte zařízení u řemenů. Lehce brnkněte do středu předního horního řemenu, změřte jej a stejně změřte dolní. Cíle jsou horní 98 Hz a dolní 92 Hz. Levý šroub nastavuje horní řemen, pravý dolní. Oba šrouby střídavě upravujte o stejnou půlotáčku a po každé úpravě znovu změřte oba řemeny. Utahování frekvenci zvyšuje, povolování snižuje. Pokud u předního rohu vznikne mezera, povolte oba napínací šrouby a zopakujte Alignment v odkazovaném oficiálním postupu. Ověřte, že řemeny nejsou překroucené ani nenabíhají na přírubu.",
     "Montage prüfen, Werkzeug entfernen, Netz anschließen und einschalten. Control → Disable Motors wählen. Nextruder von Hand zur X-Mitte und in Y ganz nach vorn bewegen. Beide Gantry-Ecken an den vorderen Rahmen drücken und auf Spalten oder Wackeln prüfen. Nach dem Ausrichten die Motoren deaktiviert lassen und den Nextruder in X ganz nach rechts und in Y ganz nach vorn bewegen. Im offiziellen Belt Tuner CORE One → XY-belt → Start listening wählen und das Gerät an die Riemen halten. Mitte des vorderen oberen Riemens leicht anzupfen, messen und den unteren ebenso messen. Zielwerte: oben 98 Hz, unten 92 Hz. Die linke Stellschraube wirkt auf den oberen, die rechte auf den unteren Riemen. Beide Schrauben abwechselnd um jeweils dieselbe halbe Umdrehung verstellen und danach jedes Mal beide Riemen neu messen. Anziehen erhöht die Frequenz, Lösen senkt sie. Entsteht vorn ein Spalt, beide Spannschrauben lösen und Alignment in der verlinkten offiziellen Anleitung wiederholen. Auf Verdrehung oder Auflaufen auf eine Flanschkante prüfen."
    ],
    "id": "belt-tensioner-right-15",
    "localNumber": 15,
    "officialStep": 16,
    "officialId": 951562,
    "source": "https://help.prusa3d.com/guide/how-to-replace-the-belt-tensioner-right-core-one_948790#951562",
    "refs": [
     396,
     568,
     418,
     438,
     553
    ],
    "firmwareActions": [
     "disable"
    ],
    "related": [
     "belts"
    ],
    "link": "https://belt.connect.prusa3d.com/",
    "supplementalSources": [
     {
      "label": [
       "ベルト張り調整の公式手順",
       "Official belt adjustment procedure",
       "Oficiální nastavení řemenů",
       "Offizielle Riemeneinstellung"
      ],
      "url": "https://help.prusa3d.com/article/adjusting-belt-tension-core-one-core-one-indx-core-one-l_845048"
     }
    ]
   },
   {
    "title": [
     "実機のSelftestで復旧を確認する",
     "Verify restoration with the printer Selftest",
     "Ověření pomocí Selftestu tiskárny",
     "Wiederherstellung mit Selftest prüfen"
    ],
    "body": [
     "全ねじとカバーを確認し、ドアを閉じます。実機でControl → Calibrations & Tests → Selftestを実行し、軸・ベルト・センサーの確認を最後まで行います。エラー、引っ掛かり、異音があれば作業を完了せず、電源を切って原因を確認します。",
     "Check every screw and cover and close the door. Run Control → Calibrations & Tests → Selftest on the printer and complete the axis, belt and sensor checks. Resolve errors, binding or unusual noise before finishing; switch off before mechanical inspection.",
     "Ověřte šrouby a kryty, zavřete dvířka a na tiskárně spusťte Control → Calibrations & Tests → Selftest. Dokončete kontroly os, řemenů a senzorů. Chyby, drhnutí nebo neobvyklý hluk odstraňte před dokončením; před mechanickou kontrolou vypněte napájení.",
     "Alle Schrauben und Abdeckungen prüfen, Tür schließen und am Drucker Control → Calibrations & Tests → Selftest ausführen. Achsen-, Riemen- und Sensorprüfungen abschließen. Fehler, Klemmen oder ungewöhnliche Geräusche vor Abschluss beheben; vor mechanischer Prüfung ausschalten."
    ],
    "id": "belt-tensioner-right-16",
    "localNumber": 16,
    "officialStep": 17,
    "officialId": 951598,
    "source": "https://help.prusa3d.com/guide/how-to-replace-the-belt-tensioner-right-core-one_948790#951598",
    "refs": [
     396,
     568,
     418,
     438,
     553
    ],
    "firmwareActions": [
     "selftest"
    ]
   }
  ]
 }
];
