// Display translations keyed by the unchanged official guide IDs.
// Japanese metadata, original source URLs and procedure content stay in the catalog.
const titles={
 '411823':['Clogged nozzle or filament path','Ucpaná tryska nebo dráha filamentu','Verstopfte Düse oder Filamentweg'],
 '930551':['Cold pull (automatic and manual)','Cold pull (automatický a ruční)','Cold Pull (automatisch und manuell)'],
 '821168':['Replace the Prusa Nozzle','Výměna Prusa Nozzle','Prusa Nozzle austauschen'],
 '385707':['Replace the hotend assembly','Výměna sestavy hotendu','Hotend-Baugruppe austauschen'],
 '829710':['Regular printer maintenance','Pravidelná údržba tiskárny','Regelmäßige Druckerwartung'],
 '845048':['Adjust belt alignment and tension','Seřízení vedení a napnutí řemenů','Riemenausrichtung und Spannung einstellen'],
 '2195':['Steel sheet types and care','Typy ocelových tiskových plátů a péče o ně','Stahlblechtypen und Pflege'],
 '465702':['Check and clean the Nextruder filament sensor','Kontrola a čištění senzoru filamentu v Nextruderu','Filamentsensor im Nextruder prüfen und reinigen'],
 '982308':['Initial setup and first print','První nastavení a první tisk','Ersteinrichtung und erster Druck'],
 '837189':['Check a failed selftest','Kontrola neúspěšného selftestu','Fehlgeschlagenen Selbsttest prüfen'],
 '734706':['Choose the Prusa Nozzle replacement procedure','Výběr postupu výměny Prusa Nozzle','Anleitung für den Prusa-Nozzle-Wechsel wählen'],
 '768975':['Choose the Nextruder hotend replacement procedure','Výběr postupu výměny hotendu Nextruderu','Anleitung für den Nextruder-Hotend-Tausch wählen'],
 '922437':['Replace the hotend heatsink','Výměna chladiče hotendu','Hotend-Kühlkörper austauschen'],
 '944862':['Replace the hotend heater','Výměna topného tělesa hotendu','Hotend-Heizpatrone austauschen'],
 '1080488':['Rebuild the Nextruder hotend','Opětovné sestavení hotendu Nextruderu','Nextruder-Hotend neu zusammenbauen'],
 '408981':['Replace the side filament sensor','Výměna bočního senzoru filamentu','Seitlichen Filamentsensor austauschen'],
 '922421':['Replace the Nextruder filament sensor','Výměna senzoru filamentu v Nextruderu','Filamentsensor im Nextruder austauschen'],
 '440297':['Use Prusament Refill 900g','Použití Prusament Refill 900g','Prusament Refill 900g verwenden'],
 '246701':['Replace the heatbed','Výměna vyhřívané podložky','Heizbett austauschen'],
 '575994':['Replace the Z motors','Výměna motorů osy Z','Z-Motoren austauschen'],
 '922445':['Replace the X and Y motors','Výměna motorů os X a Y','X- und Y-Motoren austauschen'],
 '948766':['Replace a belt tensioner pulley','Výměna řemenice napínáku řemenu','Riemenscheibe des Riemenspanners austauschen'],
 '948782':['Replace the left belt tensioner','Výměna levého napínáku řemenu','Linken Riemenspanner austauschen'],
 '948790':['Replace the right belt tensioner','Výměna pravého napínáku řemenu','Rechten Riemenspanner austauschen'],
 '307143':['Replace the heatbed thermistor','Výměna termistoru vyhřívané podložky','Heizbett-Thermistor austauschen'],
 '922413':['Replace the hotend fan','Výměna ventilátoru hotendu','Hotend-Lüfter austauschen'],
 '922429':['Replace the heatsink NTC thermistor','Výměna NTC termistoru chladiče','NTC-Thermistor des Kühlkörpers austauschen'],
 '934717':['Replace the print fan','Výměna tiskového ventilátoru','Drucklüfter austauschen'],
 '944814':['Replace the chamber fan','Výměna komorového ventilátoru','Kammerlüfter austauschen'],
 '944854':['Replace the hotend thermistor','Výměna termistoru hotendu','Hotend-Thermistor austauschen'],
 '1064201':['Replace the chamber thermistor','Výměna komorového termistoru','Kammer-Thermistor austauschen'],
 '458290':['Replace the door sensor','Výměna senzoru dveří','Türsensor austauschen'],
 '908859':['Replace the xBuddy board','Výměna desky xBuddy','xBuddy-Platine austauschen'],
 '942483':['Replace the heatbed power cables','Výměna napájecích kabelů vyhřívané podložky','Stromkabel des Heizbetts austauschen'],
 '958922':['Replace the LoveBoard','Výměna desky LoveBoard','LoveBoard austauschen'],
 '1075162':['Replace the main cable','Výměna hlavního kabelu','Hauptkabel austauschen'],
 '725930':['Downgrade the firmware','Návrat ke starší verzi firmwaru','Zu einer älteren Firmware zurückkehren'],
 '862005':['Maintenance warning #31117','Upozornění na údržbu #31117','Wartungshinweis #31117'],
 '867830':['Maintenance failure warning #31116','Upozornění na neúspěšnou údržbu #31116','Warnung bei fehlgeschlagener Wartung #31116'],
 '828818':['Reverse the door opening direction','Změna směru otevírání dveří','Türöffnungsrichtung umkehren'],
 '829350':['Pack for return using the original packaging','Zabalení pro vrácení do původního obalu','Für den Rückversand in der Originalverpackung verpacken'],
 '901517':['Pack for return using other packaging','Zabalení pro vrácení do jiného obalu','Für den Rückversand in anderer Verpackung verpacken'],
 '453086':['Update the firmware','Aktualizace firmwaru','Firmware aktualisieren'],
 '823792':['Choose the V6 nozzle adapter replacement procedure','Výběr postupu výměny adaptéru trysky V6','Anleitung für den V6-Düsenadapter-Wechsel wählen'],
 '252348':['Install the V6 nozzle adapter','Montáž adaptéru trysky V6','V6-Düsenadapter einbauen'],
 '405529':['Install the Buddy3D camera','Montáž kamery Buddy3D','Buddy3D-Kamera einbauen'],
 '868297':['Install Advanced Filtration','Montáž Advanced Filtration','Advanced Filtration einbauen'],
 '1080575':['Upgrade to the HT Hotend','Upgrade na HT Hotend','Auf HT Hotend umrüsten'],
 '1142545':['Add OpenPrintTag reading','Doplnění čtení OpenPrintTag','OpenPrintTag-Lesefunktion nachrüsten'],
 '1218956':['Replace the HT Hotend thermistor','Výměna termistoru HT Hotendu','Thermistor des HT Hotends austauschen'],
 '1218964':['Replace the HT Hotend heater','Výměna topného tělesa HT Hotendu','Heizpatrone des HT Hotends austauschen'],
 '1218972':['Replace the HT Hotend Prusa Nozzle','Výměna Prusa Nozzle v HT Hotendu','Prusa Nozzle des HT Hotends austauschen']
};
const notes={
 '1080488':['For the standard Nextruder. This differs from the HT Hotend procedure.','Pro standardní Nextruder. Postup se liší od postupu pro HT Hotend.','Für den Standard-Nextruder. Die Anleitung unterscheidet sich vom Verfahren für den HT Hotend.'],
 '408981':['Check the replacement IR board, cover and screw configuration against the printer and official photos.','Ověřte provedení vyměňované IR desky, krytu a šroubů podle tiskárny a oficiálních fotografií.','Ausführung der zu wechselnden IR-Platine, Abdeckung und Schrauben am Drucker und anhand der offiziellen Fotos prüfen.'],
 '944814':['Check whether one or two fans need replacement, and compare orientation and wiring with the official photos.','Ověřte, zda měníte jeden, nebo dva ventilátory, a porovnejte orientaci a zapojení s oficiálními fotografiemi.','Prüfen, ob ein oder zwei Lüfter zu wechseln sind. Ausrichtung und Verkabelung mit den offiziellen Fotos vergleichen.']
};
const equipment={
 '823792':['V6 adapter','Adaptér V6','V6-Adapter'],'252348':['V6 adapter','Adaptér V6','V6-Adapter'],
 '405529':['Buddy3D camera','Kamera Buddy3D','Buddy3D-Kamera'],'868297':['Advanced Filtration','Advanced Filtration','Advanced Filtration'],
 '1080575':['HT Hotend','HT Hotend','HT Hotend'],'1142545':['OpenPrintTag','OpenPrintTag','OpenPrintTag'],
 '1218956':['HT Hotend','HT Hotend','HT Hotend'],'1218964':['HT Hotend','HT Hotend','HT Hotend'],'1218972':['HT Hotend','HT Hotend','HT Hotend']
};
const groups={head:['Nextruder and nozzle','Nextruder a tryska','Nextruder und Düse'],feed:['Filament path','Dráha filamentu','Filamentweg'],motion:['Bed and motion','Podložka a pohon','Bett und Antrieb'],cooling:['Fans and temperature','Ventilátory a teplota','Lüfter und Temperatur'],electrical:['Boards and wiring','Desky a kabeláž','Platinen und Verkabelung'],body:['Printer and settings','Tiskárna a nastavení','Drucker und Einstellungen'],accessories:['Optional equipment','Volitelné vybavení','Zusatzausstattung']};
export const LIBRARY_COPY={
 title:['部品から公式ガイドを探す','Find an official guide by part','Najít oficiální návod podle dílu','Offizielle Anleitung nach Bauteil finden'],
 entry:['別の部品の公式ガイドを探す →','Find an official guide for another part →','Najít oficiální návod pro jiný díl →','Offizielle Anleitung für ein anderes Bauteil finden →'],
 heading:['どの部品を確認しますか？','Which part do you want to check?','Který díl chcete zkontrolovat?','Welches Bauteil möchten Sie prüfen?'],
 intro:['CORE One / CORE One+の公式ガイドです。部品の版やネジの構成を、実機とガイドの写真で確認してください。','Official guides for CORE One / CORE One+. Check the part revision and screw configuration against your printer and the guide photos.','Oficiální návody pro CORE One / CORE One+. Ověřte verzi dílu a provedení šroubů podle své tiskárny a fotografií v návodu.','Offizielle Anleitungen für CORE One / CORE One+. Bauteilversion und Schraubenanordnung am eigenen Drucker und anhand der Fotos im Leitfaden prüfen.'],
 query:['部品名・エラー番号','Part name or error number','Název dílu nebo číslo chyby','Bauteilname oder Fehlernummer'],
 placeholder:['例：チャンバー、センサー、31117','e.g. chamber, sensor, 31117','např. komora, senzor, 31117','z. B. Kammer, Sensor, 31117'],
 group:['部位','Area','Oblast','Bereich'],all:['すべての部位','All areas','Všechny oblasti','Alle Bereiche'],
 extras:['HT Hotend・V6など追加装備も表示する','Also show optional equipment, such as HT Hotend and V6','Zobrazit i volitelné vybavení, např. HT Hotend a V6','Auch Zusatzausstattung wie HT Hotend und V6 anzeigen'],
 empty:['該当するガイドがありません。部品名を短くするか、部位を選び直してください。','No matching guide. Try a shorter part name or choose another area.','Nebyl nalezen žádný návod. Zkuste kratší název dílu nebo jinou oblast.','Keine passende Anleitung gefunden. Einen kürzeren Bauteilnamen oder einen anderen Bereich wählen.'],
 searchExtras:['追加装備のガイドも探す','Search optional-equipment guides too','Hledat i návody pro volitelné vybavení','Auch Anleitungen für Zusatzausstattung suchen'],
 official:['公式の説明と写真を開く ↗','Open official instructions and photos ↗','Otevřít oficiální pokyny a fotografie ↗','Offizielle Anleitung und Fotos öffnen ↗'],
 local:['このサイトの手順を見る','View the in-app procedure','Zobrazit postup v aplikaci','Anleitung in dieser App ansehen'],
 checked:['一覧の確認日：','Catalog checked: ','Seznam ověřen: ','Liste geprüft am: '],
 index:['Prusaのメンテナンス一覧を開く ↗','Open the Prusa maintenance index ↗','Otevřít přehled údržby Prusa ↗','Prusa-Wartungsübersicht öffnen ↗']
};
const ix=language=>({en:0,cs:1,de:2})[language];
export function guideText(guide,language='ja'){
 const i=ix(language);if(i===undefined)return{title:guide.title,note:guide.note,equipment:guide.equipment};
 return{title:titles[guide.id]?.[i]??guide.title,note:guide.note?(notes[guide.id]?.[i]??guide.note):undefined,equipment:guide.equipment?(equipment[guide.id]?.[i]??guide.equipment):undefined};
}
export function groupText(group,language='ja'){return groups[group.id]?.[ix(language)]??group.title;}
export function libraryCount(count,language='ja'){if(language==='en')return`${count} ${count===1?'guide':'guides'}`;if(language==='cs')return`${count} ${count===1?'návod':count>=2&&count<=4?'návody':'návodů'}`;if(language==='de')return`${count} ${count===1?'Anleitung':'Anleitungen'}`;return`${count}件`;}
export function equipmentText(value,language='ja'){if(language==='en')return'For '+value;if(language==='cs')return'Pro '+value;if(language==='de')return'Für '+value;return value+'用';}
export const LIBRARY_LOCALE_KEYS={titles,notes,equipment,groups};
