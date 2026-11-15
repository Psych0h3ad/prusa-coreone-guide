xBuddy交換ガイドの参照モデル

CORE OneのxBuddy交換を、4言語の説明・公式写真・動く参照モデルでたどります。
公式手順: https://help.prusa3d.com/guide/how-to-replace-the-xbuddy-board-core-one_908859
画面の手順1〜34は公式Webの2〜35、PDFの1〜34に対応します。
追加のNFC復旧は、説明中で区別している公式組み立て手順を参照します。
https://help.prusa3d.com/guide/7-bodywork-electronics_982292#996903
https://help.prusa3d.com/guide/7-bodywork-electronics_982292#996979

編集するJavaScriptはrecipe.jsonのruntimeSourcesに列挙しています。
ブラウザーはdist/内の読みやすいJavaScriptをそのまま使います。
Yの4導体・分岐経路はdist/xbuddy-y-entry03.js、端子の移動経路は
dist/xbuddy-y-channel-route02.js、接続状態との同期は
dist/xbuddy-complete-owner.jsにあります。別の複製ソースから生成する必要はありません。
接続先・入口・元の線長を保ちながら、4本が個別の入口へ入る形を編集できます。

4極ソケットの形状生成元はvt4/build_headers.pyです。Python、NumPy、
OCPがある環境で、checkoutの先頭から次を実行すると、BINと読込用manifestを作れます。
  python -B source/xbuddy-replacement/vt4/build.py --output dist/assets/xbuddy-replacement/headers
手元の別フォルダーへ出す場合は--outputを変えてください。
Y経路の中心線を書き出す例:
  node source/xbuddy-replacement/sample-y-route.mjs --output y-route.json
この例は同じruntimeアルゴリズムと同梱Three.jsを使います。
既存モデルの画面表示には、このプロジェクトの通常のビューアーを使います。

設計座標・VT4のBIN・経路の数値はmm、表示meshのbufferはmです。
変換はruntimeの描画処理で行います。軸や単位を重ねて変換しないでください。
recipe.jsonとvt4/header-parameters.jsonで公開scalarと推定形状を区別しています。
線径、線長、隠れた空洞、端子の内部、分岐の曲げ形状は説明用の推定です。
装着品のsupplier/SKU、実機公差、曲げ剛性、保持力、内部crimp fitの確認ではありません。

写真はPrusa Researchの公式ガイド／PDFに由来し、photos.jsonに手順・出典・creditを保持しています。
写真・公式本文・商標は元の条件のままです。独立作成したcodeはMIT、
独立作成した補助geometry・推定parameterはCC BY-SA4.0です。
MIT.txt、CC-BY-SA-4.0.txt、NOTICES.txtと既存各assetのlicense/sourceを併せて参照してください。
native printer CADや既存connectorの権利は変更しません。
