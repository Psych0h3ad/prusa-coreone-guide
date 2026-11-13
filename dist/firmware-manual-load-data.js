// SPDX-License-Identifier: GPL-3.0-only
// Adapted from the accompanying versioned Buddy sources.
export const MAINTENANCE_LCD={
  "versions": {
    "8.0.0": {
      "title": "Loading filament",
      "preheatTitle": "Preheating for load",
      "phases": [
        {
          "phase": "UserPush_stoppable",
          "text": "Push the filament into the extruder and then, while still pushing, press CONTINUE.",
          "buttons": [
            "CONTINUE",
            "STOP"
          ],
          "progress": 0
        },
        {
          "phase": "LoadingToGears_stoppable",
          "text": "Inserting",
          "buttons": [
            "STOP"
          ],
          "progress": 0
        },
        {
          "phase": "WaitingTemp_stoppable",
          "text": "Waiting for temperature",
          "buttons": [
            "STOP"
          ],
          "progress": 0
        },
        {
          "phase": "Loading_stoppable",
          "text": "Loading to nozzle",
          "buttons": [
            "STOP"
          ],
          "progress": 0
        },
        {
          "phase": "Purging_stoppable",
          "text": "Purging",
          "buttons": [
            "STOP"
          ],
          "progress": 0
        },
        {
          "phase": "IsColor",
          "text": "Is color correct?",
          "buttons": [
            "YES",
            "PURGE MORE",
            "RETRY"
          ],
          "progress": 100
        }
      ],
      "sensorKeys": [
        "FILAMENT SENSORS",
        "Filament Sensing",
        "Side Filament Sensor",
        "Toolhead Filament Sensor",
        "Restore Defaults"
      ],
      "preset": {
        "name": "PLA",
        "nozzle": 215,
        "bed": 60
      },
      "selectorKeys": [
        "Return",
        "Show All",
        "PETG",
        "ASA",
        "PC",
        "PVB",
        "ABS"
      ],
      "presets": {
        "PLA": [
          215,
          60
        ],
        "PETG": [
          230,
          85
        ],
        "ASA": [
          260,
          100
        ],
        "PC": [
          275,
          100
        ],
        "PVB": [
          215,
          75
        ],
        "ABS": [
          255,
          100
        ]
      },
      "labels": {
        "Loading filament": {
          "ja": "フィラメント ロード チュウ",
          "en": "Loading filament",
          "cs": "Zavádím filament",
          "de": "Filament lädt"
        },
        "Preheating for load": {
          "ja": "ロードノ タメノプレヒート",
          "en": "Preheating for load",
          "cs": "Předehřátí pro zavedení",
          "de": "Heizen zum Laden"
        },
        "FILAMENT SENSORS": {
          "ja": "フィラメントセンサー",
          "en": "FILAMENT SENSORS",
          "cs": "SENZORY FILAMENTU",
          "de": "FILAMENTSENSOREN"
        },
        "Filament Sensing": {
          "ja": "フィラメントセンシング",
          "en": "Filament Sensing",
          "cs": "Nastavení senzorů filamentu",
          "de": "Filament Sensorik"
        },
        "Side Filament Sensor": {
          "ja": "サイドフィラメントセンサー",
          "en": "Side Filament Sensor",
          "cs": "Boční senzor filamentu",
          "de": "Seiten-Filamentsensor"
        },
        "Toolhead Filament Sensor": {
          "ja": "ツールヘッドフィラメントセンサー",
          "en": "Toolhead Filament Sensor",
          "cs": "Senzor filamentu v nástroji",
          "de": "Filamentsensor Werkzeugkopf"
        },
        "Restore Defaults": {
          "ja": "デフォルト ノ フッキ",
          "en": "Restore Defaults",
          "cs": "Obnovit výchozí hodnoty",
          "de": "Standardwerte zurücksetzen"
        },
        "Return": {
          "ja": "モドル",
          "en": "Return",
          "cs": "Zpět",
          "de": "Zurück"
        },
        "Show All": {
          "ja": "スベテヲ ヒョウジ",
          "en": "Show All",
          "cs": "Zobrazit vše",
          "de": "Zeige alle"
        },
        "PETG": {
          "ja": "PETG",
          "en": "PETG",
          "cs": "PETG",
          "de": "PETG"
        },
        "ASA": {
          "ja": "ASA",
          "en": "ASA",
          "cs": "ASA",
          "de": "ASA"
        },
        "PC": {
          "ja": "PC",
          "en": "PC",
          "cs": "PC",
          "de": "PC"
        },
        "PVB": {
          "ja": "PVB",
          "en": "PVB",
          "cs": "PVB",
          "de": "PVB"
        },
        "ABS": {
          "ja": "ABS",
          "en": "ABS",
          "cs": "ABS",
          "de": "ABS"
        },
        "Push the filament into the extruder and then, while still pushing, press CONTINUE.": {
          "ja": "フィラメントヲ エクストルーダーニ オシコンデカラ, オシタママ CONTINUEヲ オシテクダサイ.",
          "en": "Push the filament into the extruder and then, while still pushing, press CONTINUE.",
          "cs": "Zatlačte filament až do extruderu a během toho stiskněte POKRAČOVAT.",
          "de": "Schieben Sie das Filament in den Extruder und drücken Sie anschließend - während Sie weiterdrücken - auf 'WEITER'."
        },
        "CONTINUE": {
          "ja": "ツヅケル",
          "en": "CONTINUE",
          "cs": "POKRAČOVAT",
          "de": "WEITER"
        },
        "STOP": {
          "ja": "テイシ",
          "en": "STOP",
          "cs": "STOP",
          "de": "STOPP"
        },
        "Inserting": {
          "ja": "インサート",
          "en": "Inserting",
          "cs": "Zavádění",
          "de": "Einführen"
        },
        "Waiting for temperature": {
          "ja": "オンド タイキチュウ",
          "en": "Waiting for temperature",
          "cs": "Nastavování provozních teplot",
          "de": "Warte auf Temperatur"
        },
        "Loading to nozzle": {
          "ja": "ノズルヘノ ロードチュウ",
          "en": "Loading to nozzle",
          "cs": "Zavádění do trysky",
          "de": "Zur Düse laden"
        },
        "Purging": {
          "ja": "パージチュウ",
          "en": "Purging",
          "cs": "Čištění",
          "de": "Reinigen"
        },
        "Is color correct?": {
          "ja": "イロハ タダシイデスカ?",
          "en": "Is color correct?",
          "cs": "Je barva správná?",
          "de": "Farbe korrekt?"
        },
        "YES": {
          "ja": "ハイ",
          "en": "YES",
          "cs": "ANO",
          "de": "JA"
        },
        "PURGE MORE": {
          "ja": "モットパージ",
          "en": "PURGE MORE",
          "cs": "VYTLAČIT VÍCE",
          "de": "MEHR REINIGEN"
        },
        "RETRY": {
          "ja": "リトライ",
          "en": "RETRY",
          "cs": "ZNOVU",
          "de": "WDH."
        }
      }
    },
    "6.5.7": {
      "title": "Loading filament",
      "preheatTitle": "Preheating for load",
      "phases": [
        {
          "phase": "UserPush_stoppable",
          "text": "Press CONTINUE and push filament into the extruder.",
          "buttons": [
            "CONTINUE",
            "STOP"
          ],
          "progress": 0
        },
        {
          "phase": "LoadingToGears_stoppable",
          "text": "Inserting",
          "buttons": [
            "STOP"
          ],
          "progress": 0
        },
        {
          "phase": "WaitingTemp_stoppable",
          "text": "Waiting for temperature",
          "buttons": [
            "STOP"
          ],
          "progress": 0
        },
        {
          "phase": "Loading_stoppable",
          "text": "Loading to nozzle",
          "buttons": [
            "STOP"
          ],
          "progress": 0
        },
        {
          "phase": "Purging_stoppable",
          "text": "Purging",
          "buttons": [
            "STOP"
          ],
          "progress": 0
        },
        {
          "phase": "IsColor",
          "text": "Is color correct?",
          "buttons": [
            "YES",
            "PURGE MORE",
            "RETRY"
          ],
          "progress": 100
        }
      ],
      "sensorKeys": [
        "FILAMENT SENSORS",
        "Filament Sensing",
        "Side Filament Sensor",
        "Toolhead Filament Sensor",
        "Restore Defaults"
      ],
      "preset": {
        "name": "PLA",
        "nozzle": 215,
        "bed": 60
      },
      "selectorKeys": [
        "Return",
        "Show All",
        "PETG",
        "ASA",
        "PC",
        "PVB",
        "ABS"
      ],
      "presets": {
        "PLA": [
          215,
          60
        ],
        "PETG": [
          230,
          85
        ],
        "ASA": [
          260,
          100
        ],
        "PC": [
          275,
          100
        ],
        "PVB": [
          215,
          75
        ],
        "ABS": [
          255,
          100
        ]
      },
      "labels": {
        "Loading filament": {
          "ja": "フィラメント ロード チュウ",
          "en": "Loading filament",
          "cs": "Zavádím filament",
          "de": "Filament lädt"
        },
        "Preheating for load": {
          "ja": "ロードノ タメノプレヒート",
          "en": "Preheating for load",
          "cs": "Předehřátí pro zavedení",
          "de": "Heizen zum Laden"
        },
        "FILAMENT SENSORS": {
          "ja": "フィラメントセンサー",
          "en": "FILAMENT SENSORS",
          "cs": "SENZORY FILAMENTU",
          "de": "FILAMENTSENSOREN"
        },
        "Filament Sensing": {
          "ja": "フィラメントセンシング",
          "en": "Filament Sensing",
          "cs": "Nastavení senzorů filamentu",
          "de": "Filament Sensorik"
        },
        "Side Filament Sensor": {
          "ja": "サイドフィラメントセンサー",
          "en": "Side Filament Sensor",
          "cs": "Boční senzor filamentu",
          "de": "Seiten-Filamentsensor"
        },
        "Toolhead Filament Sensor": {
          "ja": "ツールヘッドフィラメントセンサー",
          "en": "Toolhead Filament Sensor",
          "cs": "Senzor filamentu v nástroji",
          "de": "Filamentsensor Werkzeugkopf"
        },
        "Restore Defaults": {
          "ja": "デフォルト ノ フッキ",
          "en": "Restore Defaults",
          "cs": "Obnovit výchozí hodnoty",
          "de": "Standardwerte zurücksetzen"
        },
        "Return": {
          "ja": "モドル",
          "en": "Return",
          "cs": "Zpět",
          "de": "Zurück"
        },
        "Show All": {
          "ja": "スベテヲ ヒョウジ",
          "en": "Show All",
          "cs": "Zobrazit vše",
          "de": "Zeige alle"
        },
        "PETG": {
          "ja": "PETG",
          "en": "PETG",
          "cs": "PETG",
          "de": "PETG"
        },
        "ASA": {
          "ja": "ASA",
          "en": "ASA",
          "cs": "ASA",
          "de": "ASA"
        },
        "PC": {
          "ja": "PC",
          "en": "PC",
          "cs": "PC",
          "de": "PC"
        },
        "PVB": {
          "ja": "PVB",
          "en": "PVB",
          "cs": "PVB",
          "de": "PVB"
        },
        "ABS": {
          "ja": "ABS",
          "en": "ABS",
          "cs": "ABS",
          "de": "ABS"
        },
        "Press CONTINUE and push filament into the extruder.": {
          "ja": "ツヅケルヲ センタクシ、フィラメントヲ エクストルーダーニ オシコンデクダサイ.",
          "en": "Press CONTINUE and push filament into the extruder.",
          "cs": "Zvolte POKRAČOVAT a zasuňte filament do extruderu.",
          "de": "WEITER drücken und das Filament in den Extruder schieben."
        },
        "CONTINUE": {
          "ja": "ツヅケル",
          "en": "CONTINUE",
          "cs": "POKRAČOVAT",
          "de": "WEITER"
        },
        "STOP": {
          "ja": "テイシ",
          "en": "STOP",
          "cs": "STOP",
          "de": "STOPP"
        },
        "Inserting": {
          "ja": "インサート",
          "en": "Inserting",
          "cs": "Zavádění",
          "de": "Einführen"
        },
        "Waiting for temperature": {
          "ja": "オンド タイキチュウ",
          "en": "Waiting for temperature",
          "cs": "Nastavování provozních teplot",
          "de": "Warte auf Temperatur"
        },
        "Loading to nozzle": {
          "ja": "ノズルヘノ ロードチュウ",
          "en": "Loading to nozzle",
          "cs": "Zavádění do trysky",
          "de": "Zur Düse laden"
        },
        "Purging": {
          "ja": "パージチュウ",
          "en": "Purging",
          "cs": "Čištění",
          "de": "Reinigen"
        },
        "Is color correct?": {
          "ja": "イロハ タダシイデスカ?",
          "en": "Is color correct?",
          "cs": "Je barva správná?",
          "de": "Farbe korrekt?"
        },
        "YES": {
          "ja": "ハイ",
          "en": "YES",
          "cs": "ANO",
          "de": "JA"
        },
        "PURGE MORE": {
          "ja": "モットパージ",
          "en": "PURGE MORE",
          "cs": "VYTLAČIT VÍCE",
          "de": "MEHR REINIGEN"
        },
        "RETRY": {
          "ja": "リトライ",
          "en": "RETRY",
          "cs": "ZNOVU",
          "de": "WDH."
        }
      }
    }
  }
};
