# CORE One ガイドのソース

公開プレビュー。

組み立てガイドのコード、表示用データ、モデルの編集用ソースです。
実機の作業では対応する[Prusa公式手順](https://help.prusa3d.com/)を参照してください。

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
