# minitype docs

minitype の公式サイト兼ドキュメントです．

<https://typeset.jp>

## 開発

[Astro Starlight](https://starlight.astro.build/) を使用して構築され，Cloudflare Pages にデプロイされます．
ドキュメントの内容は `./src/content/docs` に配置します．

```bash
# 開発サーバを起動
yarn dev
# フォントサブセット化 & ビルド & デプロイ
yarn build
# プレビュー
yarn preview
# デプロイ
yarn deploy
# フォーマット
yarn run check
# フォントサブセット化
yarn subset-fonts
# Zenn 記事の取得
yarn import-zenn
# PDF 生成
yarn generate-pdf
```

## フォントのサブセット化

`public/fonts/` に配置するフォントは，`fonts-src/` のオリジナルフォントをサブセット化したものです．
サブセット化には [fonttools](https://github.com/fonttools/fonttools) の `pyftsubset` を使用します．

`pyftsubset` が未インストールの場合は，`pip install fonttools` でインストールしてください．

`fonts-src/` に含まれるフォントのライセンスは以下の通りです．
いずれも [SIL Open Font License 1.1](https://openfontlicense.org) のもとで配布されています．

- [GenInterfaceJP](https://github.com/yamatoiizuka/gen-interface-jp)  
  (c) 2016 The Inter Project Authors, (c) Copyright 2014-2021 Adobe, with Reserved Font Name "Source", (c) 2026 Yamato Iizuka
- [Noto Sans Mono](https://github.com/notofonts/latin-greek-cyrillic)  
  (c) 2022 The Noto Project Authors
- [Source Han Serif JP](https://github.com/adobe-fonts/source-han-serif)
  (c) 2017–2022 Adobe

## Zenn 記事のインポート，PDF 生成

`scripts/import-zenn.mjs` を用いて，[Zenn 上での解説記事](https://zenn.dev/inaniwaudon/articles/62f1def4bad627) をの記事を取得した後，Markdown ファイル（`src/content/docs/explanatory.md`）に変換しています．
また，`scripts/generate-pdf.ts` を用いて Markdown ファイルから PDF 文書を生成しています．

```bash
node scripts/import-zenn.mjs <slug-または-URL> [出力パス]
node --experimental-strip-types scripts/generate-pdf.ts <slug>
```

スクリプトは以下の処理を行います．

- Zenn から記事を取得して，HTML を Markdown に変換
- コードブロック，メッセージブロック（:::message，:::message alert），YouTube 埋め込みを Starlight の対応する形式に変換
- 単独行の URL リンクを OGP リンクカードに変換
- 記事内の画像を `public/zenn-images/` にダウンロードし，ローカルパスに置換
- 見出しレベルを 1 段下げる（h1 → h2，h2 → h3，h3 → h4）

PDF の生成には minitype を使用します．
事前に `yarn build`（または `yarn subset-fonts`）を実行してサブセット済みフォントを `public/fonts/` に配置してください．

## 認証

サイト全体に Basic 認証を掛ける場合，環境変数を設定します．

```bash
# 設定
npx wrangler pages secret put BASIC_AUTH_USER
npx wrangler pages secret put BASIC_AUTH_PASSWORD

# 削除
npx wrangler pages secret delete BASIC_AUTH_USER
npx wrangler pages secret delete BASIC_AUTH_PASSWORD
```

## 文章記述

ドキュメント執筆時には，以下の点に注意してください．

### 文書構造

- ドキュメントの先頭では，「本文書では〜」と端的に文書の役割を述べてください．
- 明示的な指示がない限り，既存の文書構造（見出し等）を変更しないでください．

### 文章・文体

- 句読点にはカンマ（，），ピリオド（．）を使用してください．
  - 原則として，リストおよび表の中でも文章にはピリオドを打ちます．ただし，単語のみの場合はその限りではありません．
- 敬体（〜です，〜ます）を使用してください．
- 文ごと改行するようにしてください．
- 不用意に強調表現（**強調**）を使用しないでください．
- 数値と単位（`mm`，`cm`，`pt` 等） の間には，半角スペースを挿入してください．
- 「〜のプロパティ：」のような書き方をせず，文章として「〜は以下の通りです．」と書いてください．
- 用語と説明を列挙する際は，「**用語** --- 説明」のような書き方をせず，箇条書きで「- 用語：説明．」と記載してください．
- 可能な限り，中黒（・）ではなくカンマ（，）を使用してください．
- 事実を端的に述べてください．誇張表現を使用しないでください．

### 用語

- 同一の概念は，可能な限り同一の用語を用いて示してください．
- ページやドキュメント自体を指す場合，「本文書」という表現を使用してください．
- 「〜」ではなく「–」を使用してください．
- 表記揺れに関しては，以下に示す表の通りに記載してください．
- 3 音以上のカタカナ用語の末尾の長音は除いてください．
  - コンピューター → コンピュータ
  - ユーザー → ユーザ
  - インターフェース → インタフェース
  - バー → バー（2 音なのでそのまま）
- 複数の事項を列挙する場合，以下の通りに記載してください．
  - or：「A または B」（2つの場合はカンマを入れない），「A，B，または B」
  - and：「A および B」（2つの場合はカンマを入れない），「A，B，および C」，「A および B，ならびに C および D」（(A, B) and (C and D) の関係）

| 表記揺れの例 | 使用すべき用語 |
| --- | --- |
| 使う，用いる，利用する | 使用する |
| 場合は | 場合に，場合には（「〜は」は主語を明示する場合に用いる）|
| など | 等 |
| とおり | 通り |
| 組み込み，組込 | 組込み |
| デフォルト値 | 既定値 |
| 縦組み，縦書き，縦書 | 縦組 |
| 横組み，横書き，横書 | 横組 |
| 返り値 | 戻り値 |
| 〜について説明する，〜について示す | 〜を説明する | 〜を示す |

### サンプルコード

サンプルコードとして記載するコードに関して，以下を遵守してください．

- import する API や型定義は `@minitype/minitype` から import してください．
- import する API や型定義が，minitype のパッケージ中に含まれることを確認してください．

### その他

- 本ドキュメントは公開用であるため，内部実装には詳しく踏み込まず，あくまで公開されている API 等に関して説明してください．
- ドキュメントを編集した場合，`astro.config.mjs` の対応する箇所も合わせて編集してください．
