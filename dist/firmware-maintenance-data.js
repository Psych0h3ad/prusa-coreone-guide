// SPDX-License-Identifier: GPL-3.0-only
// Authored working instructions based on Prusa articles 453086 and 725930.
// Photographs retain the original display; their version is an example.
const l=text=>text.split('|');
const update='https://help.prusa3d.com/article/how-to-update-firmware-core-one-l-core-one-core-one-indx-mk4-s-mk3-9-s-mk3-5-s-xl_453086';
const reflash='https://help.prusa3d.com/article/how-to-downgrade-firmware-core-one-mk4-s-mk3-9-s-mk3-5-s-xl_725930';
const usb='https://help.prusa3d.com/wp-content/uploads/2024/12/bea8afeb237e8fbf20569f4fb0b05180_painted.jpeg';
const flash='https://help.prusa3d.com/wp-content/uploads/2025/01/fd92b9aa013388cb_painted.jpeg';
const photo=url=>({url,full:url});
const files={label:l('機種を選んでダウンロード|Downloads by printer model|Stažení podle modelu tiskárny|Downloads nach Druckermodell'),url:'https://help.prusa3d.com/downloads'};
const step=(title,body,source,extra={})=>({title:l(title),body:l(body),source,refs:['lcd'],camera:'front',inspection:true,...extra});
const prepare=(source)=>step('USBのルートに1つだけ置く|Put one file in the USB root|Jeden soubor v kořenové složce USB|Eine Datei im USB-Stammordner',
 'ZIPなら展開し、対象機種の.bbfをUSB直下へコピーします。フォルダー内には置かず、以前の.bbfは残さないでください。|Extract a ZIP if needed. Put the correct .bbf directly on the USB drive, outside folders. Remove older .bbf files.|Případný ZIP rozbalte. Správný soubor .bbf vložte přímo na USB, nikoli do podsložky. Starší soubory .bbf odstraňte.|Eine ZIP gegebenenfalls entpacken. Die passende .bbf direkt auf dem USB-Stick ablegen, außerhalb von Unterordnern. Ältere .bbf-Dateien entfernen.',source);
const insert=(source)=>step('USBをプリンターへ挿す|Insert the USB drive|Vložení USB do tiskárny|USB-Stick am Drucker einstecken',
 '用意したUSBをxLCDのUSB端子へ挿します。USBの位置は写真で確認してください。|Insert the prepared drive into the xLCD USB port. Check its location in the photo.|Připravený disk vložte do USB portu xLCD. Umístění ověřte na fotografii.|Den vorbereiteten Stick in den USB-Anschluss des xLCD stecken. Die Position zeigt das Foto.',source,{sourcePhotos:[photo(usb)]});
const confirm=(source)=>step('版とファイル名を確認してFLASH|Check the version and select FLASH|Ověření verze a volba FLASH|Version prüfen und FLASH wählen',
 '対象の版とファイル名を確認し、FLASHを選んでノブを押します。写真の6.3.0は旧版の表示例です。実機の表示と照合してください。|Check the intended version and filename, then select FLASH and press the knob. The photo shows an older 6.3.0 example; check your printer.|Ověřte požadovanou verzi a název souboru. Vyberte FLASH a stiskněte ovladač. Fotografie ukazuje starší příklad 6.3.0; ověřte displej své tiskárny.|Gewünschte Version und Dateinamen prüfen, FLASH wählen und den Drehknopf drücken. Das Foto zeigt das ältere Beispiel 6.3.0; mit dem eigenen Drucker vergleichen.',source,
 {sourcePhotos:[photo(flash)],screenPhotos:[{url:flash,source:update,crop:[418,343,750,494,1600,1200],caption:l('公式写真：6.3.0は旧版の表示例です。対象の版とファイル名は実機で確認します。|Official photo: 6.3.0 is an older example. Check the intended version and filename on your printer.|Oficiální foto: 6.3.0 je starší příklad. Požadovanou verzi a název souboru ověřte na své tiskárně.|Offizielles Foto: 6.3.0 ist ein älteres Beispiel. Gewünschte Version und Dateinamen am eigenen Drucker prüfen.')} ]});
const finish=(source)=>step('起動後の版を確認する|Check the installed version|Ověření nainstalované verze|Installierte Version prüfen',
 '書き込み中は完了を待ち、起動後に実機のファームウェア版を確認します。このガイドを進めるだけでは、実機は更新されません。|Wait for flashing to finish, then check the version on the printer. Advancing this guide does not update hardware.|Vyčkejte na dokončení zápisu a poté ověřte verzi na tiskárně. Posouváním tohoto průvodce se firmware tiskárny nezmění.|Das Ende des Schreibvorgangs abwarten, dann die Version am Drucker prüfen. Das Weiterblättern dieses Leitfadens aktualisiert keinen Drucker.',source);
const task=(id,title,source,steps)=>({id,revision:1,title:l(title),category:3,
 interval:l('更新・復旧が必要なとき|When updating or recovering|Při aktualizaci nebo obnově|Bei Aktualisierung oder Wiederherstellung'),
 source,steps:steps.map((s,i)=>({...s,number:i+1}))});
export const FIRMWARE_SERVICE_TASKS=[
 task('firmware-update','ファームウェアを更新する|Update firmware|Aktualizace firmwaru|Firmware aktualisieren',update,[
  step('機種に合う新しい版を選ぶ|Choose newer firmware for this model|Novější firmware pro správný model|Neuere Firmware für das richtige Modell',
   'ダウンロードページでCORE OneまたはCORE One+を選び、現在の版より新しいファイルを用意します。同じ版・古い版は「書き直す」手順を使います。|Select CORE One or CORE One+ on Downloads. For the same or an older version, use the reflash procedure.|Na stránce ke stažení vyberte CORE One nebo CORE One+. Pro stejnou či starší verzi použijte postup opětovného zápisu.|Auf der Downloadseite CORE One oder CORE One+ wählen. Für dieselbe oder eine ältere Version das Verfahren zum erneuten Aufspielen verwenden.',update,{supplementalSources:[files],related:['firmware-reflash']}),
  prepare(update+'#offline-usb-drive-procedure'),insert(update+'#offline-usb-drive-procedure'),
  step('リセットして更新の案内を待つ|Reset and wait for the update offer|Reset a nabídka aktualizace|Zurücksetzen und Aktualisierungsangebot abwarten',
   'リセットボタンを押します。USB内が新しい版なら、起動時に書き込みの案内が表示されます。Prusa Connect経由でも、USBはプリンターに必要です。|Press reset. A newer file on USB triggers the flash offer. Prusa Connect updates also require USB in the printer.|Stiskněte reset. Novější soubor na USB vyvolá nabídku zápisu. Také aktualizace přes Prusa Connect vyžaduje USB v tiskárně.|Reset drücken. Eine neuere Datei auf USB löst das Aktualisierungsangebot aus. Auch Prusa Connect benötigt USB am Drucker.',update+'#offline-usb-drive-procedure',{sourcePhotos:[photo(usb)]}),
  confirm(update+'#offline-usb-drive-procedure'),finish(update)
 ]),
 task('firmware-reflash','同じ版・古い版を書き直す|Reflash the same or older firmware|Opětovný zápis stejné či starší verze|Dieselbe oder ältere Firmware neu aufspielen',reflash,[
  step('書き直す版と機種を確認する|Choose the version and model|Volba verze a modelu|Version und Modell wählen',
   'ダウンロードページで対象機種を選びます。古い版はOlder versionsから選び、目的の.bbfを用意してください。|Select the printer on Downloads. Use Older versions to obtain an earlier release.|Na stránce ke stažení vyberte tiskárnu. Starší vydání najdete pod Older versions.|Auf der Downloadseite den Drucker wählen. Ältere Ausgaben stehen unter Older versions bereit.',reflash,{supplementalSources:[files]}),
  prepare(reflash),insert(reflash),
  step('ロゴが出たらノブを1回押す|Press the knob once at the logo|Při zobrazení loga jednou stiskněte ovladač|Beim Logo den Drehknopf einmal drücken',
   'リセットし、プリンターのロゴが表示されたらノブを1回押します。通常のホーム画面に戻るだけならUSBを見直し、別のUSBも試します。G-codeが読めても更新に使えない場合があります。|Reset, then press the knob once when the printer logo appears. If only Home appears, check or replace USB; reading G-code does not guarantee flashing.|Resetujte a při zobrazení loga jednou stiskněte ovladač. Zobrazí-li se jen úvodní obrazovka, ověřte nebo vyměňte USB. Čtení G-codu nezaručuje zápis firmwaru.|Zurücksetzen und beim Druckerlogo den Drehknopf einmal drücken. Erscheint nur der Startbildschirm, USB prüfen oder wechseln. Lesbarer G-Code garantiert kein Firmware-Update.',reflash,{sourcePhotos:[photo(usb)]}),
  confirm(reflash),finish(reflash)
 ])
];
