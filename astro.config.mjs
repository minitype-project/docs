import react from "@astrojs/react";
import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";

export default defineConfig({
  vite: {
    plugins: [minitypeBrowserPlugin()],
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
            { label: "クイックスタート", slug: "introduction/quick-start" },
          ],
        },
        {
          label: "リファレンス",
          items: [
            { label: "仕様", slug: "references/specification" },
            { label: "ボックス・フレックスボックス", slug: "references/box" },
            { label: "インライン要素", slug: "references/inline" },
          ],
        },
        {
          label: "プラグイン",
          items: [
            { label: "プラグイン", slug: "plugin/plugin" },
            { label: "Markdown プラグイン", slug: "plugin/plugin-markdown" },
          ],
        },
        {
          label: "エコシステム",
          items: [
            { label: "create-minitype", slug: "ecosystems/create-minitype" },
            { label: "vite-plugin", slug: "ecosystems/vite-plugin" },
          ],
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
