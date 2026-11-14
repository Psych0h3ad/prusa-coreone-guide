チャンバーサーミスター交換 — 編集用ソース

Prusa公式ガイド1064201の22段階を、日本語・英語・チェコ語・ドイツ語で表示します。procedure.jsonは本文、写真URL、部品参照と動作対応の編集元、official-source.jsonは公式step IDと原典写真の対応表です。

生成: node source/chamber-thermistor-replacement/generate.mjs
出力先は省略時dist/、第1引数で別フォルダーを指定できます。

動作ソース: dist/chamber-thermistor-model.js、chamber-thermistor-runtime.js、chamber-thermistor-view.js、chamber-service-owner.js、chamber-service-plan.js、chamber-temp-route.js、chamber-temp-turn.js、chamber-temp-handling.js、chamber-temp-part.js。TEMP・グリッド・リベット・バンドの資源を一つのownerで管理します。TEMPだけを抜き、ファン二個は接続したまま保持します。グリッドの四本のねじを外し、センサーを二つの実穴から抜き戻し、新旧バンドを別操作で表示します。座標はmm、描画geometryではmです。

センサー、ケーブル、バンド、リベット、コネクター内部の参考形状は製造図面ではありません。公式交換部品の表示はNTC100k・260 mmです。描画経路は260 mmの一定参考長を使いますが、供給部品の中立線・切断長の測定値を示しません。プローブ15.3 mm、外皮半径1 mm、末端線半径0.32 mmは説明用の推定値です。手で支える力、締付抵抗、電気的校正、実機の成功判定は再現しません。

公式写真はページ内にremote URLで表示します。写真ファイルは同梱しません。個別の出典とライセンスはdist/assets/chamber-thermistor-replacement/のATTRIBUTION.txt、MODEL-NOTICES.txt、SOURCES.jsonを参照してください。
