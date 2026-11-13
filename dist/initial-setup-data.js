// Prusa CORE One+ kit manual, chapter 9. Official photos retain their source language.
export const INITIAL_SETUP_TASK={
  "id": "initial-setup",
  "revision": 2,
  "title": [
    "初期設定とキャリブレーション",
    "Initial setup & calibration",
    "První nastavení a kalibrace",
    "Ersteinrichtung und Kalibrierung"
  ],
  "category": 3,
  "interval": [
    "組み立て後・初回起動時",
    "After assembly / first startup",
    "Po sestavení / první spuštění",
    "Nach Montage / erster Start"
  ],
  "source": "https://help.prusa3d.com/guide/9-calibration-first-run_982308",
  "steps": [
    {
      "title": [
        "ベルトの張りを確認する",
        "Check belt tension",
        "Kontrola napnutí řemenů",
        "Riemenspannung prüfen"
      ],
      "body": [
        "左右の調整ねじでベルトの張りを合わせます。左のねじは上側、右のねじは下側のベルトを調整します。\n組立時に、テンショナーのM3×30ねじを潤滑したことを確認してください。誤った調整は、樹脂部品の破損やねじのかじりの原因になります。先に「ベルトの張りを調整する」の手順を確認してください。\n調整が終わったら、この初期設定へ戻ります。",
        "This chapter will guide you through calibrating and preparing the printer for its first run. Starting with tensioning the belts:\nThe left screw adjusts the upper belt.\nThe right screw adjusts the lower belt.\nDouble-check that the M3x30 screws in the belt tensioners were lubricated during assembly.\nWARNING: Incorrect procedure may result in damage to plastic parts or seizing of screws. Before adjusting the belt tension, read the dedicated article:\nAdjusting belt tension (CORE One)\nDo not forget to come back here after adjusting the belts.",
        "Tato kapitola vás provede kalibrací a přípravou tiskárny na první spuštění. Počínaje napnutím řemenů:\nLevý šroub nastavuje horní řemen.\nPravý šroub nastavuje spodní řemen.\nPřekontrolujte, zda byly šrouby M3x30 v napínácích řemenů během montáže promazány.\nVAROVÁNÍ: Nesprávný postup může vést k poškození plastových dílů nebo k zadření šroubů. Před úpravou napnutí řemenů si přečtěte příslušný článek:\nÚprava napnutí řemenů (CORE One)\nNezapomeňte se sem ještě po nastavení napnutí řemenů vrátit.",
        "Dieses Kapitel führt Sie durch die Kalibrierung und die Vorbereitung des Druckers für seinen ersten Einsatz. Beginnen Sie mit dem Spannen der Riemen:\nMit der linken Schraube stellen Sie den oberen Riemen ein.\nMit der rechten Schraube stellen Sie den unteren Riemen ein.\nVergewissern Sie sich, dass die M3x30 Schrauben in den Riemenspannern bei der Montage geschmiert wurden.\nWARNUNG: Eine falsche Vorgehensweise kann zu Schäden an Kunststoffteilen oder zum Festfressen von Schrauben führen. Bevor Sie die Spannung des Riemens einstellen, lesen Sie den entsprechenden Artikel:\nAnpassung der Riemenspannung (CORE One)\nVergessen Sie nicht, nach dem Einstellen der Riemen hierher zurückzukommen."
      ],
      "refs": [
        396,
        397
      ],
      "source": "https://help.prusa3d.com/guide/9-calibration-first-run_982308#999385",
      "officialStep": 1,
      "related": [
        "belts"
      ],
      "screenPhotos": [
        {
          "url": "https://help.prusa3d.com/wp-content/uploads/2025/11/70400209b97f3e236b640fab06546599.jpg",
          "source": "https://help.prusa3d.com/guide/9-calibration-first-run_982308#999385"
        }
      ]
    },
    {
      "title": [
        "スプールホルダーを準備する",
        "Prepare the spool holder",
        "Příprava držáku cívky",
        "Spulenhalter vorbereiten"
      ],
      "body": [
        "OリングとSpoolholder-static（スプールホルダー本体）を用意します。2つの部品は同じ袋に入っています。",
        "For the next step, prepare:\nO-ring\nSpoolhoder-static\nThe spool holder and the O-ring are in the same bag.",
        "Pro další krok si připravte:\nO-kroužek\nSpoolhoder-static\nDržák cívky a O-kroužek jsou v jednom pytlíku.",
        "Bereiten Sie bitte für den nächsten Schritt vor:\nO-Ring\nSpoolhoder-static\nDer Spulenhalter und der O-Ring befinden sich im gleichen Beutel."
      ],
      "refs": [
        "spoolNew"
      ],
      "source": "https://help.prusa3d.com/guide/9-calibration-first-run_982308#1014724",
      "officialStep": 2,
      "screenPhotos": [
        {
          "url": "https://help.prusa3d.com/wp-content/uploads/2025/11/886a2be0d717353120a92b1c0dcaa300.jpg",
          "source": "https://help.prusa3d.com/guide/9-calibration-first-run_982308#1014724"
        }
      ]
    },
    {
      "title": [
        "シートとスプールホルダーを取り付ける",
        "Fit the sheet and spool holder",
        "Nasazení plátu a držáku cívky",
        "Druckplatte und Spulenhalter montieren"
      ],
      "body": [
        "ヒートベッドに異物や汚れがないことを確認します。汚れを挟むと、ヒートベッドとプリントシートの両方を傷めることがあります。\nシート後部の切り欠きをヒートベッド後方の位置決めピンに合わせます。前側の2つの角を持ち、指を挟まないようにゆっくり下ろしてください。表面を触った場合や油分が付いた場合は、IPA（イソプロピルアルコール）で脱脂します。\nSpoolholder-staticにOリングを取り付けます。Puck-universalに差し込み、時計回りに回して固定します。",
        "Make sure there is nothing on the heatbed. The heatbed must be clean. Any dirt can damage the surface of both the heatbed and the print sheet.\nAttach the sheet by first aligning the rear cutout with the locking pins on the back of the heated bed. Hold the sheet by the front two corners and slowly lay it down onto the heated bed - watch your fingers!\nKeep the print sheet clean for optimum performance.\n#1 cause of prints detaching from the print surface is a greasy print sheet. Use IPA (Isopropyl alcohol) to degrease it if you have touched its surface before.\nPut the O-ring onto the Spoolholder-static.\nPush the Spoolholder-static into the Puck-universal and lock it in by turning it clockwise.",
        "Ujistěte se, že na heatbedu nic není. Podložka musí být čistá. Jakékoli nečistoty mohou poškodit povrch heatbedu i tiskového plátu.\nTiskový plát umístěte na vyhřívanou podložku tak, že nejprve zarovnáte zadní výřez s aretačními kolíky na zadní straně podložky. Přidržte plát za přední dva rohy a pomalu jej položte na podložku- pozor na prsty!.\nPro optimální funkčnost udržujte tiskový plát čistý.\nNejčastějším důvodem odlepení výtisku od podložky je mastný nebo jinak špinavý tiskový plát. Použijte IPA (Isopropylalkohol) pro jeho odmaštění, pokud jste byť jen dotkli povrchu.\nUmístěte o-kroužek na díl Spoolholder-static.\nZatlačte díl Spoolholder-static do doku dílu Puck-universal a uzamkněte ho otočením po směru hodinových ručiček.",
        "Stellen Sie sicher, dass sich nichts auf dem Heizbett befindet. Das Heizbett muss sauber sein. Jeder Schmutz kann die Oberfläche des Heizbetts und des Druckblechs beschädigen.\nLegen Sie das Blech auf, indem Sie zuerst den hinteren Ausschnitt mit den Verriegelungsstiften auf der Rückseite des Heizbetts ausrichten. Halten Sie das Blech an den beiden vorderen Ecken fest und legen Sie es langsam auf das Heizbett - Aufpassen mit den Fingern!\nHalten Sie das Druckblech für eine optimale Leistung sauber.\n#Ursache Nr. 1 für das Ablösen von der Druckoberfläche ist ein fettiges Druckblech. Benutzen Sie IPA (Isopropylalkohol) zum Entfetten, wenn Sie die Oberfläche zuvor berührt haben.\nSetzen Sie den O-Ring auf den Spoolholder-static.\nSchieben Sie den Spoolholder-static in das Puck-universal Dock und verriegeln Sie ihn durch Drehen im Uhrzeigersinn."
      ],
      "refs": [
        "sheet",
        "spoolNew"
      ],
      "source": "https://help.prusa3d.com/guide/9-calibration-first-run_982308#999427",
      "officialStep": 3,
      "screenPhotos": [
        {
          "url": "https://help.prusa3d.com/wp-content/uploads/2025/11/fc0471bd87bcff5e52310a25ff6a1b99.jpg",
          "source": "https://help.prusa3d.com/guide/9-calibration-first-run_982308#999427"
        },
        {
          "url": "https://help.prusa3d.com/wp-content/uploads/2025/11/b13d308196e87266d1215ed6616066de.jpg",
          "source": "https://help.prusa3d.com/guide/9-calibration-first-run_982308#999427"
        },
        {
          "url": "https://help.prusa3d.com/wp-content/uploads/2025/11/655a2d12140d264a3d18e865544c0dbc.jpg",
          "source": "https://help.prusa3d.com/guide/9-calibration-first-run_982308#999427"
        }
      ]
    },
    {
      "title": [
        "ファームウェアを確認する",
        "Check the firmware",
        "Kontrola firmwaru",
        "Firmware prüfen"
      ],
      "body": [
        "同梱USBドライブのファームウェアと、ダウンロードページの版を確認します。\nPrusaのサポートページでCORE One+を選び、使用する機種に合うファームウェアをダウンロードしてください。ファイル（.bbf）を同梱のUSBドライブに保存します。",
        "All printers come with a USB drive containing the latest firmware. However, it is recommended to check and possibly upgrade the firmware version every few weeks.\nVisit the help.prusa3d.com page.\nNavigate to the Prusa CORE One+ page.\nDownload the latest firmware version.\nSave the firmware file (.bbf) onto the bundled USB drive.",
        "Všechny tiskárny dorazí s USB diskem, na kterém je nejnovější firmware. Doporučujeme však jednou za několik týdnů zkontrolovat a případně firmware zaktualizovat.\nNavštivte stránku help.prusa3d.com\nPřejděte na stránku Prusa CORE One+.\nStáhněte nejnovější verzi firmwaru.\nUložte firmware soubor (.bbf) na přiložený USB disk.",
        "Alle Drucker werden mit einem USB-Stick geliefert, der die neueste Firmware enthält. Es wird jedoch empfohlen, die Firmware-Version alle paar Wochen zu überprüfen und eventuell zu aktualisieren.\nBesuchen Sie die Seite help.prusa3d.com.\nNavigieren Sie zur Prusa CORE One+ Seite.\nLaden Sie die neueste Firmware-Version herunter.\nSpeichern Sie die Firmware-Datei (.bbf) auf dem mitgelieferten USB-Stick."
      ],
      "refs": [
        "lcd"
      ],
      "source": "https://help.prusa3d.com/guide/9-calibration-first-run_982308#999963",
      "officialStep": 4,
      "related": [
        "firmware-update",
        "firmware-reflash"
      ],
      "screenPhotos": [
        {
          "url": "https://help.prusa3d.com/wp-content/uploads/2025/11/7122ba49b0f12fe7aa570bfa889f1eb2.jpg",
          "source": "https://help.prusa3d.com/guide/9-calibration-first-run_982308#999963"
        },
        {
          "url": "https://help.prusa3d.com/wp-content/uploads/2025/11/9ccd08e7e349fa4f750b6ebc8bb15ee2.jpg",
          "source": "https://help.prusa3d.com/guide/9-calibration-first-run_982308#999963"
        }
      ]
    },
    {
      "title": [
        "電源を入れる",
        "Switch on the printer",
        "Zapnutí tiskárny",
        "Drucker einschalten"
      ],
      "body": [
        "同梱のUSBドライブをプリンターに挿します。電源ケーブルを接続してコンセントに差し、背面スイッチで電源を入れます。\n「New firmware available」が表示されたら、「FLASH」を選んでノブを押し、書き込みの完了を待ちます。\n更新の案内が出ない場合も、起動後にインストール済みの版を確認してから次へ進んでください。",
        "Insert the supplied USB drive, connect the power cable to the printer and wall outlet, and switch on using the rear switch.\nIf “New firmware available” appears, select FLASH with the knob and wait for flashing to finish.\nCheck the installed firmware version after startup, including when no update offer is shown, then continue with setup.",
        "Vložte přiložený USB disk, zapojte napájecí kabel do tiskárny a zásuvky a zapněte zadní vypínač.\nPokud se zobrazí „New firmware available“, zvolte ovladačem FLASH a vyčkejte na dokončení zápisu.\nPo spuštění ověřte nainstalovanou verzi firmwaru i tehdy, když se nabídka aktualizace nezobrazí, a pokračujte v nastavení.",
        "Den mitgelieferten USB-Stick einstecken, das Netzkabel mit Drucker und Steckdose verbinden und den hinteren Schalter einschalten.\nBei „New firmware available“ mit dem Drehknopf FLASH wählen und das Ende des Schreibvorgangs abwarten.\nNach dem Start die installierte Firmwareversion auch dann prüfen, wenn kein Aktualisierungsangebot erscheint, und mit der Einrichtung fortfahren."
      ],
      "refs": [
        "lcd",
        "psu"
      ],
      "source": "https://help.prusa3d.com/guide/9-calibration-first-run_982308#999469",
      "officialStep": 5,
      "related": [
        "firmware-update",
        "firmware-reflash"
      ],
      "screenPhotos": [
        {
          "url": "https://help.prusa3d.com/wp-content/uploads/2025/11/330e90d0d24f294df8f5970c635d5c47.jpg",
          "source": "https://help.prusa3d.com/guide/9-calibration-first-run_982308#999469"
        },
        {
          "url": "https://help.prusa3d.com/wp-content/uploads/2025/11/2905427bae45584c.jpg",
          "source": "https://help.prusa3d.com/guide/9-calibration-first-run_982308#999469"
        },
        {
          "url": "https://help.prusa3d.com/wp-content/uploads/2025/11/2d778f4cd3a4ced64ecf0370ca7344cf.jpg",
          "source": "https://help.prusa3d.com/guide/9-calibration-first-run_982308#999469",
          "crop": [
            312,
            254,
            566,
            378,
            1200,
            900
          ]
        }
      ]
    },
    {
      "title": [
        "言語とプリンターモデルを選ぶ",
        "Select language and printer model",
        "Výběr jazyka a modelu",
        "Sprache und Druckermodell wählen"
      ],
      "body": [
        "ノブまたはタッチスクリーンで言語を選びます。\nようこそ画面で「OK」を選び、初期設定を続けます。機種の選択画面では、公式写真にある「COREONE」を選び、「Done」で進みます。",
        "The printer displays on the screen a prompt to select your language. Use the control knob or touchscreen to set your preference.\nAfter selecting your language, the printer will display the welcome screen. Hit OK to continue through the setup process.\nThe next screen will prompt you to select your printer model COREONE. Hit Done to continue.",
        "Tiskárna na obrazovce zobrazí výzvu k výběru jazyka. Pomocí ovládacího kolečka nebo dotykové obrazovky nastavte své preference.\nPo výběru jazyka tiskárna zobrazí uvítací obrazovku. Klikněte na OK a pokračujte v procesu nastavení.\nNa další obrazovce se zobrazí výzva k výběru modelu tiskárny COREONE+. Pro pokračování klikněte na Hotovo.",
        "Der Drucker zeigt auf dem Bildschirm eine Aufforderung zur Auswahl Ihrer Sprache an. Verwenden Sie den Drehknopf oder den Touchscreen, um Ihre Auswahl zu treffen.\nNachdem Sie Ihre Sprache ausgewählt haben, zeigt der Drucker den Willkommensbildschirm an. Klicken Sie auf OK, um mit der Einrichtung fortzufahren.\nAuf dem nächsten Bildschirm werden Sie aufgefordert, Ihr COREONE Druckermodell auszuwählen. Klicken Sie auf Erledigt, um fortzufahren."
      ],
      "refs": [
        "lcd"
      ],
      "source": "https://help.prusa3d.com/guide/9-calibration-first-run_982308#999539",
      "officialStep": 6,
      "screenPhotos": [
        {
          "url": "https://help.prusa3d.com/wp-content/uploads/2025/11/e910498be7b86ce66fc26fc6128a7264.jpg",
          "source": "https://help.prusa3d.com/guide/9-calibration-first-run_982308#999539",
          "crop": [
            312,
            254,
            566,
            378,
            1200,
            900
          ]
        },
        {
          "url": "https://help.prusa3d.com/wp-content/uploads/2025/11/19b5e161baa7159cbb7bf0853d0d9a9b.jpg",
          "source": "https://help.prusa3d.com/guide/9-calibration-first-run_982308#999539",
          "crop": [
            312,
            254,
            566,
            378,
            1200,
            900
          ]
        },
        {
          "url": "https://help.prusa3d.com/wp-content/uploads/2026/03/cec060a72f409ef77b389c16b9e25b77.jpg",
          "source": "https://help.prusa3d.com/guide/9-calibration-first-run_982308#999539",
          "crop": [
            312,
            254,
            566,
            378,
            1200,
            900
          ]
        }
      ]
    },
    {
      "title": [
        "ネットワークを設定する",
        "Set up the network",
        "Nastavení sítě",
        "Netzwerk einrichten"
      ],
      "body": [
        "ネットワーク設定画面で、Prusa公式アプリを使ってWi-Fiに接続できます。アプリの案内はprusa.io/appで確認してください。\n「No」を選ぶと、別の接続方法が表示されます。ネットワーク設定は後から行えるので、ここではスキップしても構いません。",
        "The Network Setup screen will ask you to connect to a Wi-Fi network using our official Prusa mobile app.\nRead more on prusa.io/app.\nIf you select No, the printer will show alternative ways to connect to Wi-Fi. This step is optional and can be done later.\nYou can skip this screen and set up the network connection later.",
        "Na obrazovce Network Setup se zobrazí výzva k připojení k síti Wi-Fi pomocí naší oficiální mobilní aplikace Prusa.\nVíce si přečtěte na prusa.io/app.\nPokud zvolíte NE, tiskárna zobrazí alternativní způsoby připojení k síti Wi-Fi. Tento krok je volitelný a lze jej provést později.\nTuto obrazovku můžete přeskočit a síťové připojení nastavit později.",
        "Auf dem Bildschirm Netzwerkeinrichtung werden Sie aufgefordert, sich mit unserer offiziellen Prusa Mobile App mit einem Wi-Fi-Netzwerk zu verbinden.\nLesen Sie mehr auf prusa.io/app.\nWenn Sie Nein wählen, zeigt der Drucker alternative Möglichkeiten zur Verbindung mit Wi-Fi an. Dieser Schritt ist optional und kann später durchgeführt werden.\nSie können diesen Bildschirm überspringen und die Netzwerkverbindung später oder auch gar nicht einrichten."
      ],
      "refs": [
        "lcd"
      ],
      "source": "https://help.prusa3d.com/guide/9-calibration-first-run_982308#999577",
      "officialStep": 7,
      "screenPhotos": [
        {
          "url": "https://help.prusa3d.com/wp-content/uploads/2025/11/08e3da0d4cf3a514261a28da6c6e03e1.jpg",
          "source": "https://help.prusa3d.com/guide/9-calibration-first-run_982308#999577",
          "crop": [
            312,
            254,
            566,
            378,
            1200,
            900
          ]
        },
        {
          "url": "https://help.prusa3d.com/wp-content/uploads/2025/11/f3163ecda0ef1d6de51b095e5b8364a6.jpg",
          "source": "https://help.prusa3d.com/guide/9-calibration-first-run_982308#999577",
          "crop": [
            312,
            254,
            566,
            378,
            1200,
            900
          ]
        }
      ]
    },
    {
      "title": [
        "セルフテストを始める",
        "Start the selftest",
        "Spuštění selftestu",
        "Selbsttest starten"
      ],
      "body": [
        "「YES」を選び、実機画面の案内に従ってセルフテストを開始します。数分かかり、途中で手作業が必要になります。\n指示が出るまではドアを閉めてください。途中で開けるとテストが中断されます。テスト中は内部に高温の部品や動く部品があります。\nファンのテストでは、一時的に大きな音がします。",
        "The printer will prompt you to run self-tests and calibrations for all important components. The entire process takes a few minutes, with some parts requiring direct user interaction.\nHit YES to begin the self-test and follow the instructions on screen.\nDuring the self-test, keep the door closed until you are prompted. Opening the door will interrupt the process.\nThere are HOT and moving parts inside during the self-test.\nThe printer will begin by testing all the fans. Be aware—it can get quite noisy for a while!",
        "Tiskárna vás vyzve ke spuštění série selftestů a kalibrací všech důležitých součástí. Celý tento proces zabere několik minut, a některé jeho části budou vyžadovat vaši účast.\nStiskněte ANO pro spuštění autotestu a postupujte podle pokynů na obrazovce.\nBěhem selftestu nechte dvířka zavřená, dokud nebudete vyzváni. Otevřením dvířek se proces přeruší.\nBěhem selftestu se uvnitř nacházejí HORKÉ a pohyblivé části.\nTiskárna začne testováním všech ventilátorů. Pozor - chvíli to může být docela hlučné!",
        "Der Drucker wird Sie auffordern, Selbsttests und Kalibrierungen für alle wichtigen Komponenten durchzuführen. Der gesamte Vorgang dauert einige Minuten, wobei einige Teile eine direkte Interaktion des Benutzers erfordern.\nDrücken Sie JA, um den Selbsttest zu starten, und befolgen Sie die Anweisungen auf dem Bildschirm.\nHalten Sie während des Selbsttests die Tür geschlossen, bis Sie dazu aufgefordert werden. Wenn Sie die Tür öffnen, wird der Vorgang unterbrochen.\nIm Inneren befinden sich während des Selbsttests HEISSE und sich bewegende Teile.\nDer Drucker beginnt mit dem Testen aller Lüfter. Seien Sie sich bewusst, dass es eine Zeit lang ziemlich laut sein wird!"
      ],
      "refs": [
        "lcd"
      ],
      "source": "https://help.prusa3d.com/guide/9-calibration-first-run_982308#999620",
      "officialStep": 8,
      "screenPhotos": [
        {
          "url": "https://help.prusa3d.com/wp-content/uploads/2025/11/db20a3a8d16bb2160bfa2f9d03e89d65.jpg",
          "source": "https://help.prusa3d.com/guide/9-calibration-first-run_982308#999620",
          "crop": [
            312,
            254,
            566,
            378,
            1200,
            900
          ]
        },
        {
          "url": "https://help.prusa3d.com/wp-content/uploads/2025/11/d00e016d24fd770e8a17f770f908fb54.jpg",
          "source": "https://help.prusa3d.com/guide/9-calibration-first-run_982308#999620",
          "crop": [
            312,
            254,
            566,
            378,
            1200,
            900
          ]
        }
      ]
    },
    {
      "title": [
        "ドアセンサーを調整する",
        "Calibrate the door sensor",
        "Kalibrace senzoru dvířek",
        "Türsensor kalibrieren"
      ],
      "body": [
        "ドアセンサーの画面で「Calibrate」を選びます。実機の指示に従い、緩めてある調整ねじを半回転ずつ締めてください。調整を何度か繰り返す場合があります。\n調整するたびに、前面フレームの穴から出るセンサースイッチの位置を確認します。画面に示されたドアの開き具合でスイッチが切り替わるように調整し、「Continue」で進みます。\nドアを開閉したときに、センサー付近からクリック音がすることを確認してください。",
        "The first part that requires your interaction is the door sensor calibration. To begin, hit Calibrate and follow the on-screen instructions.\nYou’ll be prompted to gradually tighten the sensor tension screw from its default loose position - usually in half-turn steps, possibly several times during calibration.\nAfter each adjustment, observe the door sensor switch emerging from the front profile hole.\nRepeat the procedure until the door sensor is correctly adjusted - meaning it switches at a hand-gap distance. Then hit Continue.\nOnce the sensor is properly calibrated, you should hear an audible click from the door sensor area when opening and closing the door.",
        "První částí, která vyžaduje vaši spolupráci, je kalibrace senzoru dveří.  Začněte tím, že stisknete Kalibrovat . Dál už postupujte podle pokynů na obrazovce.\nBudete vyzváni k postupnému utahování napínacího šroubu senzoru z výchozí volné polohy - obvykle po půl otáčkách, případně několikrát během kalibrace.\nPo každém seřízení sledujte, zda spínač dveřního senzoru vystupuje z otvoru v předním profilu.\nPostup opakujte, dokud nebude senzor dvířek správně nastaven - to znamená, že sepne ve vzdálenosti mezi rukama. Poté stiskněte Pokračovat.\nKdyž se senzor správně nakalibruje, měli byste při otevírání a zavírání dveří slyšet cvaknutí z oblasti snímače dveří.",
        "Der erste Teil, der Ihre Mitwirkung erfordert, ist die Kalibrierung des Türsensors. Klicken Sie zunächst auf „Kalibrieren“ und befolgen Sie die Anweisungen auf dem Bildschirm.\nSie werden aufgefordert, die Sensor-Spannschraube aus ihrer standardmäßig lockeren Position nach und nach anzuziehen – in der Regel in Schritten von einer halben Umdrehung, möglicherweise mehrmals während der Kalibrierung.\nBeobachten Sie nach jeder Einstellung, wie der Türsensorschalter aus der vorderen Profilöffnung herausragt.\nWiederholen Sie den Vorgang, bis der Türsensor richtig eingestellt ist – d. h. er schaltet bei einem Abstand von einer Handbreite. Klicken Sie dann auf Weiter.\nSobald der Sensor richtig kalibriert ist, sollten Sie beim Öffnen und Schließen der Tür ein hörbares Klicken aus dem Bereich des Türsensors hören."
      ],
      "refs": [
        "door"
      ],
      "source": "https://help.prusa3d.com/guide/9-calibration-first-run_982308#999672",
      "officialStep": 9,
      "screenPhotos": [
        {
          "url": "https://help.prusa3d.com/wp-content/uploads/2025/11/0e547227808b2a78fbc905b502617c6a.jpg",
          "source": "https://help.prusa3d.com/guide/9-calibration-first-run_982308#999672",
          "crop": [
            312,
            254,
            566,
            378,
            1200,
            900
          ]
        },
        {
          "url": "https://help.prusa3d.com/wp-content/uploads/2025/11/18d6d2c6003eacf6485b6e14d635ea5f.jpg",
          "source": "https://help.prusa3d.com/guide/9-calibration-first-run_982308#999672"
        },
        {
          "url": "https://help.prusa3d.com/wp-content/uploads/2025/11/a5cc29c663f3d9187629bf1e8c060a6f.jpg",
          "source": "https://help.prusa3d.com/guide/9-calibration-first-run_982308#999672",
          "crop": [
            312,
            254,
            566,
            378,
            1200,
            900
          ]
        }
      ]
    },
    {
      "title": [
        "ロードセルをテストする",
        "Test the loadcell",
        "Test senzoru Loadcell",
        "Wägezelle testen"
      ],
      "body": [
        "このロードセルテスト中は、プリンターの部品は加熱されません。「Continue」で進み、作業の指示が出たらドアを開けます。\n「Tap nozzle NOW」が表示されるまでは、ノズルに触れないでください。表示されたら、ノズルを下から軽く叩きます。\n検出されなかった場合は、実機の案内に従って繰り返します。「Loadcell test passed OK」が表示されたら、ドアを閉じて次へ進みます。",
        "The next step of the wizard will prompt you to touch the nozzle to test and calibrate the Loadcell. During this procedure, the parts of the printer are not heated up so that you can touch them. Hit Continue.\nLoadcell calibration requires the door to be open, as you must interact directly inside the printer.\nDo not touch the nozzle yet, wait until prompted by the Tap nozzle NOW message.\nTap the nozzle from below. In case the Loadcell does not detect the touch, you will be prompted to repeat the step. Otherwise, you will see Loadcell test passed OK when it succeeds.\nTo allow the printer to continue with the Wizard, close the door.",
        "V následujícím kroku průvodce budete vyzváni, abyste se dotkli trysky a otestovali a zkalibrovali Loadcell. Během tohoto procesu se části hotendu nezahřívají, takže se jich můžete dotknout. Dále zvoltePokračovat.\nKalibrace senzoru loadcell vyžaduje otevřená dvířka, jelikož je nutné zasahovat přímo uvnitř tiskárny.\nProzatím se trysky nedotýkejte, počkejte, až budete vyzváni zprávou: NYNÍ se dotkněte trysky.\nKlepněte zespoda do trysky. Pokud Loadcell dotyk nezaznamená, budete vyzváni k opakování kroku. V opačném případě se při úspěšném provedení testu zobrazí Test loadcell proběhl v pořádku.\nStiskněte Pokračovat pro dokončení průvodce.",
        "Im nächsten Schritt des Assistenten werden Sie aufgefordert, die Düse zu berühren, um die Wägezelle zu testen und zu kalibrieren. Während dieses Vorgangs werden die Teile des Druckers nicht aufgeheizt, so dass Sie sie berühren können. Klicken Sie auf Weiter.\nFür die Kalibrierung der Wägezelle muss die Tür geöffnet sein, da Sie direkt im Inneren des Druckers arbeiten müssen.\nBerühren Sie die Düse noch nicht, sondern warten Sie, bis Sie von der Meldung Düse JETZT antippen dazu aufgefordert werden.\nTippen Sie von unten auf die Düse. Falls die Wägezelle die Berührung nicht erkennt, werden Sie aufgefordert, den Schritt zu wiederholen. Andernfalls sehen Sie Wägezellentest erfolgreich bestanden, wenn er erfolgreich war.\nDamit der Drucker mit dem Assistenten fortfahren kann, schließen Sie die Tür."
      ],
      "refs": [
        "hotend"
      ],
      "source": "https://help.prusa3d.com/guide/9-calibration-first-run_982308#999726",
      "officialStep": 10,
      "screenPhotos": [
        {
          "url": "https://help.prusa3d.com/wp-content/uploads/2025/11/6485190dab9b5c55bef0afce4043b08b.jpg",
          "source": "https://help.prusa3d.com/guide/9-calibration-first-run_982308#999726",
          "crop": [
            312,
            254,
            566,
            378,
            1200,
            900
          ]
        },
        {
          "url": "https://help.prusa3d.com/wp-content/uploads/2025/11/2b5a44ae668cda90915f4e34a632f78f.jpg",
          "source": "https://help.prusa3d.com/guide/9-calibration-first-run_982308#999726"
        },
        {
          "url": "https://help.prusa3d.com/wp-content/uploads/2025/11/e29ae4ab83f8bf46d61a0e17900e0244.jpg",
          "source": "https://help.prusa3d.com/guide/9-calibration-first-run_982308#999726",
          "crop": [
            312,
            254,
            566,
            378,
            1200,
            900
          ]
        }
      ]
    },
    {
      "title": [
        "ギアボックスを調整する",
        "Align the gearbox",
        "Zarovnání převodovky",
        "Getriebe ausrichten"
      ],
      "body": [
        "ギアボックスの位置合わせで「Continue」を選びます。まずスイベルのロックを外します。\n実機の指示に従い、前面のM3ねじ3本を各1.5回転、反時計回りに緩めます。頭をカバーの面に揃えてください。すでに仮締めの場合は、さらに回す前に図と頭の位置を見比べます。次にアイドラーを開いてください。\n自動の位置合わせが終わり、実機に本締めの指示が出るまで待ちます。内部の動きは外から見えません。\n画面の図に示された順番で3本を締めます。頭が表面より少し下に収まるようにし、締め過ぎないでください。最後にアイドラーを閉じ、スイベルで固定します。",
        "Once you get to the Gearbox Alignment part, select Continue and follow the on-screen instructions.\nFirst unlock the idler lock (swivel).\nLoosen the three screws on the front of the gearbox by 1.5 turns. Then open the idler door.\nThe printer will go through the automatic gearbox alignment. This process can’t be seen from the outside.\nOnce prompted, tighten the three screws in the pattern indicated on the screen.",
        "Jakmile se dostanete k části Seřízení převodovky, zvolte Pokračovat a postupujte podle pokynů na obrazovce tiskárny.\nNejprve odjistěte otočnou západku idleru (swivel).\nPovolte tři šrouby na přední straně převodovky o 1,5 otáčky. Poté otevřete dvířka idleru.\nTiskárna projde automatickým zarovnáním převodovky. Tento proces není zvenčí vidět.\nJakmile budete vyzváni, utáhněte tři šrouby podle vzoru na obrazovce.",
        "Wenn Sie zum Teil \"Getriebeausrichtung\" gelangen, wählen Sie Weiter und folgen Sie den Anweisungen auf dem Bildschirm.\nEntriegeln Sie zuerst die Idler-Verriegelung (Drehgelenk).\nLösen Sie die drei Schrauben an der Vorderseite des Getriebes um 1,5 Umdrehungen. Öffnen Sie danach die Idler-Tür.\nDer Drucker durchläuft die automatische Ausrichtung des Getriebes. Dieser Vorgang ist von außen nicht zu sehen.\nSobald Sie dazu aufgefordert werden, ziehen Sie die drei Schrauben in dem auf dem Bildschirm angezeigten Muster an."
      ],
      "refs": [
        "pgAssembly"
      ],
      "source": "https://help.prusa3d.com/guide/9-calibration-first-run_982308#999780",
      "officialStep": 11,
      "screenPhotos": [
        {
          "url": "https://help.prusa3d.com/wp-content/uploads/2025/11/f311854a3da1dafed6039b9b9a9c1761.jpg",
          "source": "https://help.prusa3d.com/guide/9-calibration-first-run_982308#999780",
          "crop": [
            312,
            254,
            566,
            378,
            1200,
            900
          ]
        },
        {
          "url": "https://help.prusa3d.com/wp-content/uploads/2025/11/fc53011cfd453fe49e7fe23ab3f04d40.jpg",
          "source": "https://help.prusa3d.com/guide/9-calibration-first-run_982308#999780"
        },
        {
          "url": "https://help.prusa3d.com/wp-content/uploads/2025/11/61510f5fb0f90054f5bde4bf9fb33217.jpg",
          "source": "https://help.prusa3d.com/guide/9-calibration-first-run_982308#999780",
          "crop": [
            312,
            254,
            566,
            378,
            1200,
            900
          ]
        }
      ]
    },
    {
      "title": [
        "フィラメントセンサーを調整する",
        "Calibrate the filament sensors",
        "Kalibrace senzorů filamentu",
        "Filamentsensoren kalibrieren"
      ],
      "body": [
        "側面のフィラメントセンサーの手動スイッチが「ON」になっていることを確認します。\n調整に使う短いフィラメントを用意し、「Continue」を選びます。開始前に、Nextruder内からフィラメントを抜いておいてください。\nスプールをプリンター右側のホルダーに置きます。実機に指示が出たら、右ハンドルの下のPTFEチューブへフィラメントを挿入します。\nキャリブレーションが終わったら、フィラメントを抜きます。",
        "Check the manual switch on the filament sensor. Make sure that it is ON.\nDuring the filament sensor calibration, you will need to use a short piece of filament. Prepare the filament and select Continue.\nThere should be no filament inside the extruder before the calibration process starts.\nPlace a spool of filament onto the spool holder on the right side of the printer.\nWhen prompted, begin inserting the filament into the PTFE tube located beneath the right handle.\nRemove the filament after the calibration finishes.",
        "Zkontrolujte ruční spínač na senzoru filamentu. Ujistěte se, že je v poloze ON (zapnutý).\nPro kalibraci senzoru filamentu je nutné použít krátký kousek filamentu. Připravte si ho a následně zvolte Pokračovat.\nPřed spuštěním kalibračního procesu se ujistěte, že se v extruderu nenachází žádný filament.\nUmístěte cívku filamentu na držák cívky na pravé straně tiskárny.\nPo výzvě začněte zasouvat filament do PTFE trubičky umístěné pod pravou rukojetí.\nPo dokončení kalibrace vyjměte filament.",
        "Überprüfen Sie den manuellen Schalter am Filament-Sensor. Stellen Sie sicher, dass er eingeschaltet ist.\nWährend der Kalibrierung des Filamentsensors müssen Sie ein kurzes Stück Filament verwenden. Bereiten Sie das Filament vor und wählen Sie Weiter.\nEs sollte sich kein Filament im Extruder befinden, bevor der Kalibrierungsprozess beginnt.\nLegen Sie eine Spule Filament in den Spulenhalter auf der rechten Seite des Druckers.\nWenn Sie dazu aufgefordert werden, beginnen Sie mit dem Einführen des Filaments in den PTFE-Schlauch unter dem rechten Griff.\nEntfernen Sie das Filament nach Beendigung der Kalibrierung."
      ],
      "refs": [
        "loveBoard",
        "sensorBody"
      ],
      "source": "https://help.prusa3d.com/guide/9-calibration-first-run_982308#999833",
      "officialStep": 12,
      "screenPhotos": [
        {
          "url": "https://help.prusa3d.com/wp-content/uploads/2025/11/c2dcefab8a337075c4ad56dae7118a67.jpg",
          "source": "https://help.prusa3d.com/guide/9-calibration-first-run_982308#999833"
        },
        {
          "url": "https://help.prusa3d.com/wp-content/uploads/2025/11/bbfbcfbe23fe7444baefed4aa683c0ed.jpg",
          "source": "https://help.prusa3d.com/guide/9-calibration-first-run_982308#999833",
          "crop": [
            312,
            254,
            566,
            378,
            1200,
            900
          ]
        },
        {
          "url": "https://help.prusa3d.com/wp-content/uploads/2025/11/b28bbe08d5deb71dd90f3e75d0d86ba0.jpg",
          "source": "https://help.prusa3d.com/guide/9-calibration-first-run_982308#999833"
        }
      ]
    },
    {
      "title": [
        "初期設定を完了する",
        "Complete initial setup",
        "Dokončení nastavení",
        "Ersteinrichtung abschließen"
      ],
      "body": [
        "初期設定ウィザードが完了しました。初回印刷の前に、この機種用の「3D Printing Handbook」を開き、「免責事項」「安全上の注意」と初回印刷の準備を確認します。「手順と写真」の出典欄から公式のHandbook案内と機種別入口を開けます。その準備を終えてからテストプリントへ進みます。",
        "The initial setup wizard is complete. Before the first print, open the 3D Printing Handbook for this printer and read the Disclaimer, Safety instructions and first-print preparation. The sources under Instructions & photos link to the official Handbook step and printer-specific entry point. Complete that preparation before a test print.",
        "Průvodce úvodním nastavením je dokončen. Před prvním tiskem otevřete 3D Printing Handbook pro tuto tiskárnu a přečtěte si kapitoly Disclaimer, Safety instructions a přípravu prvního tisku. Zdroje v části Postup a fotografie odkazují na oficiální krok Handbook a stránku pro tento model. Teprve po této přípravě pokračujte ke zkušebnímu tisku.",
        "Der Einrichtungsassistent ist abgeschlossen. Vor dem ersten Druck das 3D Printing Handbook für diesen Drucker öffnen und Disclaimer, Safety instructions sowie die Vorbereitung des ersten Drucks lesen. Die Quellen unter Anleitung und Fotos führen zum offiziellen Handbook-Schritt und zum Modelleinstieg. Erst nach dieser Vorbereitung einen Testdruck beginnen."
      ],
      "refs": [
        "lcd"
      ],
      "source": "https://help.prusa3d.com/guide/9-calibration-first-run_982308#999887",
      "officialStep": 13,
      "supplementalSources": [
        {
          "label": [
            "初回印刷前のHandbook確認（公式手順）",
            "Handbook before the first print (official step)",
            "Handbook před prvním tiskem (oficiální krok)",
            "Handbook vor dem ersten Druck (offizieller Schritt)"
          ],
          "url": "https://help.prusa3d.com/guide/9-calibration-first-run_982308#999930"
        },
        {
          "label": [
            "CORE Oneのハンドブック（公式入口）",
            "CORE One handbook (official entry point)",
            "Příručka CORE One (oficiální stránka)",
            "CORE One-Handbuch (offizieller Einstieg)"
          ],
          "url": "https://help.prusa3d.com/tag/core-one"
        }
      ],
      "screenPhotos": [
        {
          "url": "https://help.prusa3d.com/wp-content/uploads/2025/11/7798e4301bf9fdc6211493fb05a659c6.jpg",
          "source": "https://help.prusa3d.com/guide/9-calibration-first-run_982308#999887",
          "crop": [
            312,
            254,
            566,
            378,
            1200,
            900
          ]
        }
      ]
    }
  ]
};
