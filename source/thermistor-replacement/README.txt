ノズル側サーミスター交換 — 編集用ソース

Prusa公式ガイド944854の21段階を、日本語・英語・チェコ語・ドイツ語で表示します。procedure.jsonが本文、公式step ID、写真URL、部品参照、モデルphaseの編集元です。generate.mjsはthermistor-service-data.jsとthermistor-service-source.jsを生成します。

実行: node source/thermistor-replacement/generate.mjs
省略時の出力先はdist/です。第1引数に別の出力フォルダーを指定できます。

実部品の表示と動作: dist/thermistor-service-model.js / thermistor-service-geometry.js。既存hotendの共通resource ownerと元サーミスターgeometryを使用します。固定ねじは1本を保持したまま緩め、中央穴からセンサーを抜差しします。ヒーター用の二本は動かしません。座標の寸法はmm、描画geometryではmを使用します。

ねじは独立した参考形状です。T6という工具と「ねじを取り外さない」操作は公式手順に基づきます。ねじ長さ・内部ねじ形状・仕上げの推定は製造仕様ではありません。部品の手保持、締付抵抗、実温度や実機の成功判定は再現していません。

元形状・写真・本文・コードの出典と個別ライセンス:
dist/assets/thermistor-replacement/MODEL-NOTICES.txt
dist/assets/thermistor-replacement/ATTRIBUTION.txt
dist/assets/thermistor-replacement/SOURCES.json
