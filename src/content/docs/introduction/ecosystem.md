---
title: エコシステム
---

本文書では，minitype の開発を支援するエコシステムを紹介します．

## create-minitype

create-minitype は，minitype の文書プロジェクトをセットアップするツールです．
コマンドラインまたは API 経由でテンプレートを選択して，必要なソースファイル一式を自動生成します．
これにより，プロジェクトの初期設定を対話形式で行い，文書の用途に応じたテンプレートを使用して文書生成を始められます．

使用方法については，[create-minitype の README](https://github.com/minitype-project/create-minitype) を参照してください．

## vite-plugin

@minitype/vite-plugin は，minitype の Vite プラグインです．
開発サーバ上でファイルの変更を検知して組版を自動実行し，ブラウザ上でリアルタイムプレビューを提供します．
create-minitype を用いてプロジェクトをセットアップした場合，自動でインストールされます．

使用方法については，[vite-plugin の README](https://github.com/minitype-project/vite-plugin) を参照してください．
