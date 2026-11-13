// SPDX-License-Identifier: GPL-3.0-only
// Authored instructions shown beside retained firmware menus/photos, never
// painted as native wizard screens. Sources: Prusa CORE One+ first-run step 11;
// Buddy v6.5.7/v8.0.0 selftest_snake and selftest_frame_gears controllers.
const card=(id,title,body)=>({kind:'instruction',id,title,body});
export function nozzleSettingFrames(){return{
 condition:card('nozzle-settings-condition',
  ['プリントヘッド設定を確認する','Check the printhead settings','Zkontrolujte nastavení tiskové hlavy','Druckkopfeinstellungen prüfen'],
  ['ノズル径・種類・ソックスの有無を変えた場合は、設定も実物に合わせます。変更したかどうかを選び、必要な設定を確認してください。変更していなければ今の設定を保ちます。',
   'If the nozzle diameter, type or silicone sock changed, match the settings to the installed parts. Choose whether anything changed to see the relevant instructions. Otherwise, keep the current settings.',
   'Při změně průměru či typu trysky nebo silikonového návleku přizpůsobte nastavení nasazeným dílům. Zvolte, zda došlo ke změně, a projděte příslušné pokyny. Beze změny ponechte stávající nastavení.',
   'Bei geändertem Düsendurchmesser, Düsentyp oder geänderter Silikonsocke die Einstellungen an die eingebauten Teile anpassen. Änderung auswählen und die entsprechenden Hinweise prüfen. Ohne Änderung aktuelle Einstellungen beibehalten.']),
 settings:[
  {selectedKey:'Nozzle Diameter',title:['ノズル径を確認する','Check nozzle diameter','Zkontrolujte průměr trysky','Düsendurchmesser prüfen'],body:[
   '取り付けたノズルの径に合わせます。画面例の0.40 mmをそのまま設定せず、実物の表記を確認してください。',
   'Match the diameter of the installed nozzle. Check its marking; do not copy the example value of 0.40 mm without checking.',
   'Nastavte průměr nasazené trysky. Ověřte označení; ukázkových 0,40 mm bez ověření nepřebírejte.',
   'Den Durchmesser der eingebauten Düse einstellen. Kennzeichnung prüfen und den Beispielwert 0,40 mm nicht ungeprüft übernehmen.']},
  {selectedKey:'Nozzle Hardened',title:['硬化ノズルの設定を確認する','Check the hardened nozzle setting','Zkontrolujte nastavení tvrzené trysky','Einstellung für gehärtete Düse prüfen'],body:[
   '取り付けたノズルの仕様に合わせて有効・無効を選びます。ハイフローかどうかは、次の別項目で確認します。',
   'Enable or disable this option according to the installed nozzle specification. High-flow is a separate option on the next screen.',
   'Volbu zapněte nebo vypněte podle specifikace nasazené trysky. High-flow je samostatná volba na další obrazovce.',
   'Die Option passend zur Spezifikation der eingebauten Düse ein- oder ausschalten. High-flow ist eine eigene Option auf der nächsten Anzeige.']},
  {selectedKey:'Nozzle High-flow',title:['ハイフローの設定を確認する','Check the high-flow setting','Zkontrolujte nastavení high-flow','High-flow-Einstellung prüfen'],body:[
   'HFノズルを取り付けた場合は有効にします。標準流量のノズルに交換した場合は無効にし、実物と設定を一致させます。',
   'Enable this option for an HF nozzle. Disable it for a standard-flow nozzle, matching the actual installed part.',
   'Pro trysku HF tuto volbu zapněte. Pro standardní průtok ji vypněte podle skutečně nasazeného dílu.',
   'Diese Option für eine HF-Düse einschalten. Bei einer Düse mit Standarddurchfluss ausschalten und an das eingebaute Teil anpassen.']},
  {selectedKey:'Nextruder Silicone Sock',title:['ソックスの有無を確認する','Check whether a silicone sock is fitted','Zkontrolujte přítomnost silikonového návleku','Prüfen, ob eine Silikonsocke montiert ist'],body:[
   'ヒーターブロックのシリコンソックスの装着状態に合わせます。確認後、設定メニューを戻り、次の作業へ進みます。',
   'Match this option to the silicone sock fitted on the heater block. After checking, leave the settings menu and continue with the next task.',
   'Volbu nastavte podle silikonového návleku na topném bloku. Po kontrole opusťte nastavení a pokračujte dalším úkonem.',
   'Diese Option an die Silikonsocke am Heizblock anpassen. Nach der Prüfung das Einstellungsmenü verlassen und mit der nächsten Arbeit fortfahren.']}
 ]
};}
export function gearboxInstructionFrames(){return[
 card('gearbox-open',
  ['前面ねじを緩め、アイドラーを開く','Loosen the front screws and open the idler','Povolte přední šrouby a otevřete idler','Vordere Schrauben lösen und Idler öffnen'],
  ['まずスイベルのロックを外します。前面のM3ねじ3本を各1.5回転、反時計回りに緩め、頭をカバーの面に揃えます。仮締め済みの場合は、さらに回す前に図と頭の位置を見比べてください。その後、アイドラーを開き、実機で続行します。',
   'First release the swivel. Turn each of the three front M3 screws counter-clockwise by 1.5 turns, with the heads flush with the cover. If already left loose, compare the heads with the diagram before turning further. Then open the idler and continue on the printer.',
   'Nejprve uvolněte otočnou západku. Každý ze tří předních šroubů M3 povolte o 1,5 otáčky proti směru hodinových ručiček, aby hlavy lícovaly s krytem. Již povolené šrouby nejdříve porovnejte s obrázkem. Poté otevřete idler a pokračujte na tiskárně.',
   'Zuerst den Schwenkriegel entriegeln. Jede der drei vorderen M3-Schrauben um 1,5 Umdrehungen gegen den Uhrzeigersinn lösen, bis der Kopf bündig mit der Abdeckung ist. Bereits lose Schrauben zuerst mit der Abbildung vergleichen. Danach den Idler öffnen und am Drucker fortfahren.']),
 card('gearbox-align',
  ['自動位置合わせを待つ','Wait for automatic alignment','Vyčkejte na automatické zarovnání','Automatische Ausrichtung abwarten'],
  ['ギアの位置合わせが終わり、実機にねじを締める指示が出るまで待ちます。このガイドで次へ進んでも、実機の処理は進みません。',
   'Wait until alignment finishes and the printer asks you to tighten the screws. Advancing this guide does not advance the printer.',
   'Počkejte na dokončení zarovnání a pokyn tiskárny k utažení šroubů. Posun v tomto návodu neposouvá postup na tiskárně.',
   'Warten, bis die Ausrichtung beendet ist und der Drucker zum Festziehen auffordert. Dieser Leitfaden steuert den Drucker nicht.']),
 card('gearbox-tighten',
  ['画面の順番で3本を締める','Tighten all three in the displayed order','Utáhněte všechny tři v zobrazeném pořadí','Alle drei in angezeigter Reihenfolge festziehen'],
  ['実機画面の図に示された順番で、前面ねじ3本を本締めします。締め過ぎないでください。締め終えてから、実機で続行します。',
   'Tighten the three front screws in the order shown on the printer. Do not overtighten. Continue on the printer after all three are tightened.',
   'Utáhněte tři přední šrouby v pořadí zobrazeném na tiskárně. Nepřetahujte je. Po utažení všech tří pokračujte na tiskárně.',
   'Die drei vorderen Schrauben in der am Drucker gezeigten Reihenfolge festziehen. Nicht überdrehen. Danach am Drucker fortfahren.']),
 card('gearbox-close',
  ['アイドラーを閉じて固定する','Close and secure the idler','Zavřete a zajistěte idler','Idler schließen und sichern'],
  ['アイドラーを閉じ、スイベルで固定します。実機で続行し、残りのテストも完了させます。ギア位置合わせだけでは、セルフテスト全体の完了にはなりません。',
   'Close the idler and secure it with the swivel. Continue on the printer and finish the remaining tests. Gearbox alignment alone does not finish the entire selftest.',
   'Zavřete idler a zajistěte jej otočnou západkou. Pokračujte na tiskárně a dokončete zbývající testy. Samotné zarovnání převodovky nedokončí celý selftest.',
   'Idler schließen und mit dem Schwenkriegel sichern. Am Drucker fortfahren und die übrigen Tests abschließen. Die Getriebeausrichtung allein beendet nicht den gesamten Selbsttest.'])
];}
export function selftestInstructionFrames(){return[
 card('selftest-sheet',
  ['プリントシートを取り付ける','Install the print sheet','Nasaďte tiskový plát','Druckplatte einsetzen'],
  ['ヒートベッドの保護材を取り除き、プリントシートを取り付けます。カバーと配線を確認し、ドアを閉めてからテストを始めます。',
   'Remove the protective material from the heatbed and install the print sheet. Check the covers and wiring, then close the door before starting the tests.',
   'Odstraňte ochranu vyhřívané podložky a nasaďte tiskový plát. Zkontrolujte kryty a kabeláž a před testy zavřete dveře.',
   'Schutzmaterial vom Heizbett entfernen und Druckplatte einsetzen. Abdeckungen und Verkabelung prüfen, dann vor dem Test die Tür schließen.']),
 card('selftest-all',
  ['残りのテストも実行する','Run the remaining tests','Spusťte také zbývající testy','Übrige Tests ebenfalls ausführen'],
  ['先頭のテストが終わり、続行の確認が表示されたら「All」を選びます。表示言語によって表記が異なります。各テストの作業は実機の案内に従ってください。',
   'After the first test, select “All” when asked whether to continue. The label varies with the display language. Follow the printer instructions during each test.',
   'Po prvním testu zvolte při dotazu na pokračování „All“ (vše). Název se liší podle jazyka displeje. Při jednotlivých testech se řiďte tiskárnou.',
   'Nach dem ersten Test bei der Frage zum Fortfahren „All“ (alle) wählen. Die Bezeichnung hängt von der Anzeigesprache ab. Während der Tests dem Drucker folgen.']),
 card('selftest-results',
  ['実機の結果を確認する','Check the results on the printer','Zkontrolujte výsledky na tiskárně','Ergebnisse am Drucker prüfen'],
  ['必要なテストがすべて緑のチェックになっていることを実機で確認します。失敗や中断があれば、原因を確認して再実行してください。このガイドの閲覧だけで、テスト完了にはなりません。',
   'Check that all required tests have green check marks on the printer. Resolve any failed or interrupted test and run it again. Viewing this guide does not complete a hardware test.',
   'Na tiskárně ověřte zelené zaškrtnutí všech potřebných testů. U neúspěšného nebo přerušeného testu odstraňte příčinu a spusťte jej znovu. Prohlédnutí návodu neprovede test tiskárny.',
   'Am Drucker grüne Häkchen für alle erforderlichen Tests prüfen. Fehlgeschlagene oder abgebrochene Tests nach Beheben der Ursache wiederholen. Das Lesen dieses Leitfadens führt keinen Test aus.'])
];}
