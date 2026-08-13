# minitype docs

minitype の公式サイト兼ドキュメントです．

<https://typeset.jp>

## 開発

[Astro Starlight](https://starlight.astro.build/) を使用して構築され，Cloudflare Pages にデプロイされます．

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
