# Chamber fan reference sources

CORE Oneの組み立て・整備説明に使うファン配線と、羽根・ハブ・後部支持体の編集用ソースです。長さの単位はmmです。既存アプリのファン枠、基板、コネクター形状はこのパッケージに含みません。

配線bankは、編集可能な座標列と曲線アルゴリズムを併用しています。全2,312本の状態別曲線のうち、1,500本を`routing/chamber-fan-route.js`と`routing/fan-seeds.js`から計算し、812本を`routing/retained-stations.json`から読みます。各曲線は257点です。座標JSONは独自に作成した中心線の数値ソースで、完成BINのコピーや解析CADではありません。

編集箇所は次のとおりです。

- `routing/chamber-fan-route.js`：端点、開口への進入、自由な曲がり、束の向き、材長を満たす計算。
- `routing/fan-seeds.js`：ファンの移動・仮置き位置。
- `routing/manifest-parameters.json`：8本の材長参照値、サンプリング数、出力形式、材長誤差の予算。
- `routing/retained-stations.json`：FAN1のknot0–9・106–288、FAN2の0–9の座標と変形係数。knot/96がアニメーションのamountです。
- `anatomy/parameters.json`と`anatomy/build.py`：円柱、ロフト、押し出しから作る回転部と後部支持体。各1ソリッドです。

配線はNode24以降で生成できます。必要なThree.jsは同梱しており、npmやネットワーク接続は不要です。

```sh
node build-bank.mjs out/chamber-fan-replacement
```

内部形状の生成にはPython3、NumPy、cadquery-ocpが必要です。依存ソフトが入った環境では、こちらもネットワークを使いません。

```sh
python anatomy/build.py --output out/chamber-fan-anatomy
node verify.mjs out
```

生成されるBIN・JSONは、アプリの`dist/assets/chamber-fan-replacement/`および`dist/assets/chamber-fan-anatomy/`に対応します。配線BINはFloat32 little-endianのmm座標、内部形状BINは部品ごとの位置・法線です。配線JSONは既存形式に合わせたUTF-8/CRLFです。`runtime/chamber-fan-anatomy.js`は既存ローダーのAPI参照です。2形状を2個のファン枠に取り付けるため、描画childは4個になります。

`verify.mjs`は未編集の参照出力と比較します。数値入力を編集すれば出力も変わります。材長を変える場合は、保持した座標列と材長誤差の予算も合わせて編集してください。gzipコンテナーの圧縮差は、展開した形状データと区別して表示します。CADカーネルによって内部形状の三角形分割が変わる場合があります。

ファン枠の参照寸法は60×60×25、内側の半径29です。羽根・支持体の内部寸法、配線の自由区間、供給元による切断長が示されていない材長は説明用の推定・参照値です。製造仕様、強度・熱・流体解析、全経路の干渉保証を表すモデルではありません。

コードはMIT、独自の形状・座標・パラメーターはCC BY-SA4.0です。著作者と参照元は[ATTRIBUTION.md](ATTRIBUTION.md)、ライセンス本文は`licenses/`にあります。
