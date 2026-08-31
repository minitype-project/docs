---
title: エコシステム
---

本文書では，minitype を用いた文書作成を実現するエコシステムを紹介します．

## minitype

`@minitype/minitype` は，TypeScript（JavaScript）のパッケージとして提供される組版処理エンジンです．
高度な組版機能をライブラリとして利用できるため，単体での利用に加えて，アプリケーションに組込んだり，生成 AI から利用したりと様々なワークフローでの文書生成が実現されます．
本パッケージは Node.js，Bun，およびブラウザ上で動作します．

使用方法については，[クイックスタート](../)を参照してください．

## create-minitype

[create-minitype](https://github.com/minitype-project/create-minitype) は，minitype の文書プロジェクトをセットアップするツールです．
コマンドラインまたは API 経由でテンプレートを選択して，必要なソースファイル一式を自動生成します．
これにより，プロジェクトの初期設定を対話形式で行い，文書の用途に応じたテンプレートを使用して文書作成を始められます．

create-minitype はオープンソースにて公開されています．使用方法については，[create-minitype の README](https://github.com/minitype-project/create-minitype) を参照してください．

## vite-plugin

[@minitype/vite-plugin](https://github.com/minitype-project/vite-plugin) は，minitype の Vite プラグインです．
開発サーバ上でファイルの変更を検知して組版を自動実行し，ブラウザ上でリアルタイムプレビューを提供します．
create-minitype を用いてプロジェクトをセットアップした場合，自動でインストールされます．

vite-plugin はオープンソースにて公開されています．使用方法については，[vite-plugin の README](https://github.com/minitype-project/vite-plugin) を参照してください．

## ライセンス

各パッケージは以下のライセンスにて提供されます．

| パッケージ | ライセンス |
| --- | --- |
| `@minitype/minitype` | [PolyForm Noncommercial License 1.0.0](https://polyformproject.org/licenses/noncommercial/1.0.0) |
| `create-minitype` | [MIT License](https://opensource.org/license/mit) |
| `@minitype/vite-plugin` | [MIT License](https://opensource.org/license/mit) |

`@minitype/minitype` では，個人利用を含む非商用目的での利用は自由に行えますが，商用目的での利用，改変，および再配布は許可されていません．商用利用をご希望の場合は，別途お問い合わせください．
上記にかかわらず，個人またはサークルによる同人活動を目的とした利用は，成果物の有償頒布を伴う場合を含めて許可されます．
なお，これらのソフトウェアを使用して生成した PDF や画像等の成果物自体には，本ライセンスは適用されません．
