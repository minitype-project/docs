import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import react from "@astrojs/react";

export default defineConfig({
  integrations: [
    starlight({
      title: "minitype",
      titleDelimiter: "-",
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
          items: [{ label: "クイックスタート", slug: "quick-start" }],
        },
        {
          label: "リファレンス",
          items: [
            { label: "仕様", slug: "specification" },
            { label: "ボックス・フレックスボックス", slug: "box" },
            { label: "インライン要素", slug: "inline" },
            { label: "プラグイン", slug: "plugin" },
          ],
        },
        {
          label: "プラグイン",
          items: [{ label: "Markdown プラグイン", slug: "plugin-markdown" }],
        },
        {
          label: "開発者向け",
          collapsed: true,
          items: [
            { label: "アーキテクチャ", slug: "development/architecture" },
            {
              label: "垂直方向の処理",
              slug: "development/architecture-vertical",
            },
            { label: "組版要件", slug: "development/requirements" },
            { label: "設計方針", slug: "development/discussion" },
          ],
        },
      ],
      components: {
        SiteTitle: "./src/components/SiteTitle.astro",
        PageTitle: "./src/components/PageTitle.astro",
      },
      customCss: ["./src/styles/custom.css"],
      head: [
        {
          tag: "script",
          content: "document.documentElement.dataset.theme = 'light';",
        },
      ],
      expressiveCode: {
        themes: ["github-light"],
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
