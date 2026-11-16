# ベルトテンショナーの整備モデル

Prusa ResearchのCORE One公式ガイド948766（プーリー）、948782（左）、948790（右）に対応する表示用モデルです。単位はmmです。

本体、キャリア、角ナット、各ねじ、パネル、ドア、LCDは既存のCORE Oneモデルを使います。プーリー本体と2個のベアリングには、既存CoreXYモデルのPulley-A10全3固体を使います。ドアスイッチはCORE One LのZippy SM05S02A0 v7を使います。7固体には押し込み前後の別姿勢が含まれるため、本体・レバー・ローラーの3固体を表示し、レバーとローラーを一緒に回転させます。現在の手順で使う下側の取付ねじに配置を合わせています。別リビジョン部品との互換性や製造寸法を保証するモデルではありません。

ベルトは2 mmピッチ、幅6 mm、背厚1.38 mmを仮定した作業区間です。プーリーとの接触形状は元の歯形を断面で読み取り、表示上0.03 mm離しています。全周ベルトの張力、伸び、機械全体の経路は再現していません。リベットと結束バンドは既存の編集可能な形状を使います。センサー線は元の長さと断面を保持し、取付板を通る後半の形状を固定して前半をたわませます。

## 編集元

`../../tensioner-service-data.js` と `../../tensioner-service-source.js` に4言語の本文、公式ID、写真URLがあります。`../../tensioner-service-scene.js` は順序、作業姿勢、個々の留め具の軌跡、`../../tensioner-service-native.js` は形状と配置、`../../tensioner-service-runtime.js` は同期、`../../tensioner-service-controls.js` は側と分岐の選択です。`../../door-switch-source.js` が可動部の剛体回転と取付基準です。`switch-material-groups.json` は本体の全三角形に対する樹脂・端子の色指定です。推定寸法と元データの区別は `PARAMETERS.json` にあります。

`source/extract-switch.py --input CORE_One_L_assembly.step --output switch-meshes` は、手元の同一SHA256のCADから7固体を再抽出します。外部への接続やCADの取得は行いません。元CADをこのパッケージには含めません。

開閉時のレバーは、元CADの2姿勢を使った説明用の動きです。実機では手順どおり、クリック音とセンサー情報の両方を確認します。

## 出典と利用条件

- Prusa Research — [CORE One full CAD](https://www.printables.com/model/1520471)、[CORE One L full CAD](https://www.printables.com/model/1520379)。CAD由来の形状は [Open Community License v1](OCL-1.0.txt) に従います。元の権利表示を保持してください。
- 公式手順・写真: Prusa Research。3ガイドの原文リンクと写真のクレジットは `../../tensioner-service-source.js` にあります。公式写真の権利はPrusa Researchにあり、このパッケージが新たな写真の再配布権を与えるものではありません。
- 本文は日本語優先の独自要約です。公式翻訳を名乗りません。

新品センサーの[公式写真](https://help.prusa3d.com/guide/how-to-replace-the-door-sensor-core-one_458290#834305)を基に、白・茶の線、黒い被覆、はんだ部、青い抵抗を追加しています。編集元は `../../door-switch-terminals.js` です。線径と抵抗の外形は表示用の推定寸法で、抵抗値は指定していません。センサー直近の補助形状を、既存のリード線の始点へ接続しています。端子を確認する注釈は、センサー本体と配線を避けて表示します。
