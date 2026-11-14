TEMP2 右角コネクター — 編集用参考形状

build-temp-header.pyとheader-parameters.jsonは、2極・1.5 mmピッチの説明用ソケットを解析的な平面・押出・円弧から生成します。出力はFloat32位置＋法線のBINと、樹脂／すず仕上げのグループ表です。座標と寸法はmm。標準実行ではSTEPを生成しません。

python build-temp-header.py --out <出力先>
numpyとOCPを使用します。引数省略時の出力先はdist/assets/chamber-service-reference/です。

ファミリーの事実資料はdist/assets/molex/source/factual-references.jsonの502585欄を参照してください。2極右角形状への展開、端子ばね・ロック窓・内部壁・PCBへの登録姿勢は説明用の推定を含み、メーカーCADや未寸法の内部面を複製したものではありません。ピンの軸方向と組立基準はheader-parameters.jsonに保持しています。

コード: MIT。独自生成した参考形状: CC BY-SA 4.0。
MIT全文: dist/assets/chamber-thermistor-replacement/MODEL-NOTICES.txt
CC BY-SA 4.0全文: dist/licenses/CC-BY-SA-4.0.txt
製品名・元資料・既存資産の権利は各通知のままです。
