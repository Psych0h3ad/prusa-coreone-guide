# CORE One ガイドのソース

公開プレビュー。

CORE One（初代）とCORE One+の組み立て、CORE OneからCORE One+へのアップグレード、メンテナンスのガイドです。
公式手順に対応する説明と写真をサイト内で確認できます。
Zモーター交換は前左・前右・後方・前側2個・全3個から選べます。端子を通す穴や取り付け方向を3Dで確認できます。

[Zモーターの交換手順](https://psych0h3ad.github.io/prusa-coreone-guide/maintenance.html?task=z-motor-replacement&step=1&view=guide&lang=ja)

[CORE Oneの組み立て](https://psych0h3ad.github.io/prusa-coreone-guide/original.html) · [CORE One+の組み立て・アップグレード](https://psych0h3ad.github.io/prusa-coreone-guide/)

- `dist/`：ブラウザー用コード、表示データ、GLB・STL・BINモデル。
- `scripts/`：データ生成・確認用のソース。
- `source/`：firmware原典と[再生成の案内](source/SOURCES.md)。
- [ファイル一覧](FILE-MANIFEST.json)・[出典](ATTRIBUTION.md)・[ライセンス](LICENSES.md)。

ローカル確認は `node server.mjs` を実行し、`http://127.0.0.1:4173/` を開きます。
Pages用の配信ファイルは `python3 scripts/build-pages.py` で `.pages-build/` に生成できます。

モデルの単位は各manifestに従います。コネクターの寸法・BINはmm、一部のGLBはmです。
推定した内部形状や配置は各モデルの記録に記載しています。

素材ごとのOCL・GPL・CC・フォント等の条件と通知を保持しています。
この案内は、無関係なコードや素材に一括した新ライセンスを付与するものではありません。
