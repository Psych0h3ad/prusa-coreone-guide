CAD表示用の事前生成表面

既存のPrusa Research CORE One CADから、表示に使用する位置と法線を
Float32のまま保存したデータです。三角形の削減、頂点の結合、座標の量子化、
法線の近似は行いません。別のsolidに接する面は、元と同じsolid単位で
法線を計算します。形状の製造・検査精度を保証するデータではありません。

編集用ソース
  build.mjs                pack、manifest、参照bindingを生成します。
  native-frame.mjs         元GLBの配置、部分選択とoffsetを復元します。
  reference-restore.mjs    元のSTL変換、solid選択、crease法線の処理です。
  ../../dist/surface-geometry.js   元のcrease法線アルゴリズムです。
  ../../dist/surface-pack.js       Float32 packの読み取りです。
  ../../dist/cad-surfaces.js       表示側の採用と共有geometryの登録です。

リポジトリのルートで実行します。出力先には新しいディレクトリを指定します。

node source/cad-surface-bake/build.mjs --input . --output surface-output --binding surface-output-binding.js

入力は、このリポジトリに含まれるdist/assets/core-one.glb、cad-subsets.json、
cad-surfaces/manifest.json、同manifestが指すSTL、既存のThree.jsと
meshoptimizerです。ネットワーク、CADアカウント、STEP入力は不要です。
生成したファイルをdist/assets/cad-surfaces-ready/へ配置し、bindingを
dist/cad-surface-ready-binding.jsとして使用します。

各packにはmesh-local座標系のPとNを順に格納します。単位はmです。
元STLはmmで、元と同じscale、origin、source行列の逆変換を適用します。
manifestは元GLB/STLのSHA-256、配置行列、solid範囲、展開長、packの
SHA-256を記録します。gzip版と同じ内容のraw版を出力します。

表示側は検証済みpackから配列viewを作り、同じ部品の配置間でgeometryを
共有します。元のCAD geometryは保持します。worker対応環境では転送・展開・
checksum検証をworkerで行います。workerを利用できない環境では同じ処理を
メイン側で行い、gzip展開機能がない場合はraw版を使用します。
checksumやsource配置が一致しないデータは採用しません。

原著者、出典、適用範囲はNOTICES.txtと既存のdist/credits.htmlを参照してください。
