側面センサー配線と保持バンドの参照モデル

右側CoreXYフランジの開口を通るバンドと、その下面から背面の配線口へ続く側面センサー配線を表示します。位置と長さの単位はmm、描画用position配列はm、normalは無次元です。

編集するコード:
- dist/sensor-retention-route.js: 保持フレーム、配線経路、材料長の配分、トポロジ
- dist/side-ir-service-wire-paths.js / wire-prefix.js / wire-bundle.js: 共通の独立した導体参照経路
- dist/fasteners.js / tie-path.js / tie-lock.js: バンドの通し・締め・切断形状
- dist/sensor-assembly-data.js: 既存の部品配置座標

parameters.jsonは静的出力で使う代表的な姿勢と入力値です。ブラウザーのモデルは実際の部品姿勢を使い、同じ解析関数で形状を作ります。バンドは既存の100mm材料と切断状態を使います。本体側3導体は285.4993 / 286.5917 / 286.6218mm、固定区間は328.2826mmの既存参照長を保持します。

再生成:
node --experimental-loader ./source/sensor-retention/loader.mjs ./source/sensor-retention/generate-reference.mjs --out ./generated-sensor-reference

必要なJavaScriptは公開チェックアウトのdist内に揃っています。供給元CAD、STEP、外部アカウントや追加ダウンロードは生成入力に使いません。出力は3導体と固定区間のposition/normal/index、およびJSONです。各導体の両端面を含み、同じトポロジを描画側も使用します。

寸法・線径・線長は参照モデルの値で、実物の測定値やメーカー指定値ではありません。本体側の導体半径0.4mmと、既存端末側の半径0.5mmはそれぞれ保持しています。被覆内の接続構成、線材仕様・極性・実装SKU、荷重下の曲げや締付け適合は未確認です。既存部品や配線の残る交差まで、解消済みとは扱いません。

公式手順:
https://help.prusa3d.com/guide/7-bodywork-electronics_982292#996619
https://help.prusa3d.com/guide/7-bodywork-electronics_982292#996665
