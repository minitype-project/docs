import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@astrojs/react";
import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";
import remarkExtractTypes from "./src/plugins/remark-extract-types.mjs";
import remarkFigureCaption from "./src/plugins/remark-figure-caption.mjs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

/**
 * 開発サーバー上で外部画像をプロキシする Vite プラグイン．
 *
 * `/__image_proxy__?url=<encodedUrl>` へのリクエストを受け取り，
 * `url` クエリパラメータで指定された外部 URL から画像を取得して返す．
 * CORS ヘッダー（`Access-Control-Allow-Origin: *`）を付与するため，クロスオリジン制約のある環境でも画像を読み込める．
 *
 * @returns {import('vite').Plugin} Vite プラグインオブジェクト
 */
const imageProxyPlugin = () => ({
  name: "image-proxy",
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      if (!req.url?.startsWith("/__image_proxy__")) {
        next();
        return;
      }
      const qs = req.url.includes("?")
        ? req.url.slice(req.url.indexOf("?") + 1)
        : "";
      const targetUrl = new URLSearchParams(qs).get("url");
      if (!targetUrl) {
        next();
        return;
      }
      try {
        const r = await fetch(targetUrl);
        if (!r.ok) {
          next();
          return;
        }
        const data = await r.arrayBuffer();
        res.setHeader(
          "Content-Type",
          r.headers.get("content-type") || "image/png",
        );
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.end(Buffer.from(data));
      } catch {
        next();
      }
    });
  },
});

const minitypeBrowserPlugin = () => {
  const distDir = resolve(__dirname, "node_modules/@minitype/minitype/dist");
  const assets = [
    { url: "/minitype/index.browser.js", file: "index.browser.js" },
    { url: "/minitype/pdf.worker.mjs", file: "pdf.worker.mjs" },
  ];

  return {
    name: "minitype-browser-assets",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const asset = assets.find((a) => req.url === a.url);
        if (asset) {
          res.setHeader("Content-Type", "application/javascript");
          res.end(readFileSync(resolve(distDir, asset.file)));
          return;
        }
        next();
      });
    },
    generateBundle() {
      for (const asset of assets) {
        this.emitFile({
          type: "asset",
          fileName: `minitype/${asset.file}`,
          source: readFileSync(resolve(distDir, asset.file)),
        });
      }
    },
  };
};

export default defineConfig({
  site: "https://typeset.jp",
  server: {
    host: true,
  },
  markdown: {
    remarkPlugins: [remarkExtractTypes, remarkFigureCaption],
  },
  vite: {
    plugins: [imageProxyPlugin(), minitypeBrowserPlugin()],
  },
  integrations: [
    starlight({
      title: "minitype",
      titleDelimiter: "–",
      defaultLocale: "ja",
      locales: {
        root: { label: "日本語", lang: "ja" },
      },
      social: [
        {
          icon: "npm",
          label: "npm",
          href: "https://www.npmjs.com/package/@minitype/minitype",
        },
      ],
      sidebar: [
        {
          label: "はじめに",
          items: [
            { label: "紹介記事", slug: "explanatory" },
            { label: "クイックスタート", slug: "quick-start" },
            { label: "エコシステム", slug: "quick-start/ecosystem" },
          ],
        },
        {
          label: "リファレンス",
          items: [
            { label: "リファレンス", slug: "references" },
            { label: "ブロック要素", slug: "references/blocks" },
            { label: "ボックス，フレックスボックス", slug: "references/box" },
            { label: "スタイル", slug: "references/style" },
            { label: "インライン要素", slug: "references/inline" },
            { label: "API", slug: "references/api" },
            {
              label: "垂直方向の処理",
              slug: "references/vertical",
            },
            {
              label: "組版要件への対応状況",
              slug: "references/typesetting-requirements",
            },
          ],
        },
        {
          label: "プラグイン",
          items: [
            { label: "プラグイン", slug: "plugin" },
            { label: "組込みプラグイン", slug: "plugin/builtin" },
            { label: "Markdown プラグイン", slug: "plugin/markdown" },
          ],
        },
      ],
      components: {
        Footer: "./src/components/DocumentFooter.astro",
        Head: "./src/components/DocumentHead.astro",
        SiteTitle: "./src/components/SiteTitle.astro",
        PageTitle: "./src/components/PageTitle.astro",
        SocialIcons: "./src/components/SocialIcons.astro",
      },
      customCss: ["./src/styles/custom.css"],
      head: [
        {
          tag: "script",
          content: "document.documentElement.dataset.theme = 'light';",
        },
        {
          tag: "link",
          attrs: {
            rel: "preload",
            as: "font",
            type: "font/ttf",
            href: "/fonts/GenInterfaceJP-Regular.ttf",
            crossorigin: "anonymous",
          },
        },
        {
          tag: "link",
          attrs: {
            rel: "preload",
            as: "font",
            type: "font/ttf",
            href: "/fonts/GenInterfaceJP-Bold.ttf",
            crossorigin: "anonymous",
          },
        },
      ],
      expressiveCode: {
        themes: ["github-light"],
        defaultProps: {
          frame: "none",
        },
        styleOverrides: {
          frames: {
            frameBoxShadowCssValue: "none",
          },
        },
      },
    }),
    react(),
  ],
});
