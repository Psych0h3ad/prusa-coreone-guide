FEアース線の連続した取り回し

FE丸端子からケース開口へ向かう線を解析曲線で生成します。内部の受け渡し点Aには金属端子を追加せず、既存のearthLと反対向きの接線でつなぎます。線の表示上のstock110mm、半径1mm、128×8分割の2048面を維持します。earthLのstock・線径・全形状、既存の金属端子・ワッシャー・ねじは変更しません。曲線はmm、描画座標はmです。

端子側の線は実際のbarrelと同じ座標frameで生成します。開口寸法や金属を削って合わせる方法ではありません。端子datumと断面の定義は維持されますが、別々に世界座標でFloat32化する場合とは最終的な丸め値が異なります。内部Aの断面方向は、連続した線の接線に合わせて修正されています。

公式の組み立て資料:
https://help.prusa3d.com/guide/3-back-assembly_982260#986601
FEコネクター④はM3x6とM3wで取り付け、ワッシャーをねじ頭と端子の間に置きます。公式写真では線が丸端子から下へ曲がってケース開口へ通ります。写真から寸法を測ったモデルではありません。

fe-ground-lead.js が曲線・断面の編集可能な生成コード、fe-ground-frame.js が座標frameと所有権の受け渡しコードです。表示上の110mmと線径、円弧・戻り曲線の半径はモデルの設定であり、メーカー仕様や実物の測定値ではありません。元の同時存在しない手順表示モデルを切り替える制御は既存のままです。

生成:
  node source/native-ground-lead/build.mjs
出力:
  dist/fe-ground-lead.js
  dist/fe-ground-frame.js
既存の dist/fe-hardware.js と dist/xbuddy-pe-free-bank.js は編集可能なruntime sourceです。Three.js と既存のxbuddy-lease-guards.jsを使用します。既知のサービス線writerは prepareNativeFeService を呼び、nativeのframeを退役してからworld-CAD座標のbufferを借ります。別の所有者のresourceやstorageへ書き直す処理は行いません。

生成には同梱の解析コードを使います。メーカー形状ファイルの読み込みや外部接続は不要です。曲線の弧長計算値と描画中心線の折れ線長には差があります。有限の姿勢の確認は、全連続動作、製造適合性や圧着保持力の認証にはなりません。既存の別手順の参照形状との対応も、全ハーネスの実測や部品認証を示すものではありません。

独自コードはMIT、独自の解析形状・曲線・設計パラメータはCC BY-SA4.0です。既存CADと公式資料は別の権利条件です。NOTICES.txtと同梱の全文を参照してください。
