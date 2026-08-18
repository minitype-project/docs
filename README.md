# minitype docs

minitype の公式サイト兼ドキュメントです．

<https://typeset.jp>

## 開発

[Astro Starlight](https://starlight.astro.build/) を使用して構築され，Cloudflare Pages にデプロイされます．
ドキュメントの内容は `./src/content/docs` に配置します．

```bash
# 開発サーバを起動
yarn dev
# ビルド & デプロイ
yarn build
# デプロイ
yarn deploy
# フォーマット
yarn run check
```

サイト全体に Basic 認証を掛ける場合，環境変数を設定します．

```bash
npx wrangler pages secret put BASIC_AUTH_USER
npx wrangler pages secret put BASIC_AUTH_PASSWORD
```

## 文章記述

- ドキュメントの句読点はカンマ（，），ピリオド（．）を使用してください．
- ドキュメントには敬体（〜です，〜ます）を使用してください．
- ドキュメントの先頭では，「本文書では〜」と端的に文書の役割を述べてください．
- ページやドキュメント自体を指す場合，「本文書」という表現を使用してください．
