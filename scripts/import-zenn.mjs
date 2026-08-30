// Zenn の記事を Astro Starlight の Markdown ファイルに変換して出力するスクリプト．
// Usage: node scripts/import-zenn.mjs <slug-or-url> [output-path]

import { mkdirSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import TurndownService from "turndown";

const ROOT = resolve(fileURLToPath(import.meta.url), "../../");

const EXT_TO_LANG = {
  ts: "typescript",
  tsx: "tsx",
  js: "javascript",
  jsx: "jsx",
  mjs: "javascript",
  json: "json",
  md: "markdown",
  sh: "bash",
  bash: "bash",
  zsh: "bash",
  py: "python",
  rb: "ruby",
  go: "go",
  rs: "rust",
  css: "css",
  html: "html",
  yaml: "yaml",
  yml: "yaml",
  toml: "toml",
  sql: "sql",
};

const arg = process.argv[2];
if (!arg) {
  console.error(
    "Usage: node scripts/import-zenn.mjs <slug-or-url> [output-path]",
  );
  process.exit(1);
}

const slug = arg.replace(/^https?:\/\/zenn\.dev\/[^/]+\/articles\//, "");

const res = await fetch(`https://zenn.dev/api/articles/${slug}`);
if (!res.ok) {
  console.error(`Zenn API error: ${res.status} ${res.statusText}`);
  process.exit(1);
}
const { article } = await res.json();

const td = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  bulletListMarker: "-",
  hr: "---",
});

const getClasses = (node) => {
  return (node.getAttribute?.("class") ?? "").split(" ").filter(Boolean);
};

const hasClass = (node, cls) => getClasses(node).includes(cls);

// 見出し内のアンカーリンク（<a class="header-anchor-link">）を除去
td.addRule("headingAnchor", {
  filter: (node) =>
    node.nodeName === "A" && hasClass(node, "header-anchor-link"),
  replacement: () => "",
});

// Zenn の Shiki コードブロック（<div class="code-block-container">）
td.addRule("zennCodeBlock", {
  filter: (node) =>
    node.nodeName === "DIV" && hasClass(node, "code-block-container"),
  replacement: (_content, node) => {
    // ファイル名から言語を推定
    const filenameEl = node.querySelector
      ? node.querySelector(".code-block-filename")
      : null;
    const filename = filenameEl?.textContent?.trim() ?? "";
    const ext = filename.split(".").pop()?.toLowerCase() ?? "";
    let lang = EXT_TO_LANG[ext] ?? "";

    // <pre data-language="..."> から言語を取得（ファイル名がない場合のフォールバック）
    if (!lang) {
      const pre = node.querySelector ? node.querySelector("pre") : null;
      const dataLang = pre?.getAttribute("data-language") ?? "";
      if (dataLang) {
        lang = dataLang;
      }
    }

    // コードテキストを抽出（Shiki の span を除いたテキスト）
    const pre = node.querySelector ? node.querySelector("pre") : null;
    const code = pre?.querySelector ? pre.querySelector("code") : null;
    const text = (code ?? pre)?.textContent ?? "";

    const titleComment = filename ? `// ${filename}\n` : "";
    return `\n\`\`\`${lang}\n${titleComment}${text}\n\`\`\`\n`;
  },
});

// Zenn のメッセージブロック（:::message など）→ Starlight の aside
td.addRule("zennMessage", {
  filter: (node) =>
    node.nodeName === "DIV" &&
    (hasClass(node, "msg") || hasClass(node, "warn")),
  replacement: (content, node) => {
    const type = hasClass(node, "warn") ? "caution" : "note";
    return `\n:::${type}\n${content.trim()}\n:::\n`;
  },
});

// インラインコード
td.addRule("inlineCode", {
  filter: (node) =>
    node.nodeName === "CODE" && node.parentNode?.nodeName !== "PRE",
  replacement: (content) => `\`${content}\``,
});

let body = td.turndown(article.body_html);

// 見出しに残った空アンカー `[](#...)` を除去
body = body.replace(/\[]\(#[^)]*\)/g, "");

// 脚注参照 [\[N\]](#fn-...) を <sup> で囲む
body = body.replace(/(\[\\\[\d+\\\]\]\(#fn-[^)]+\))/g, "<sup>$1</sup>");

// 段落単独の YouTube リンクを iframe 埋め込みに変換
body = body.replace(
  /^\[[^\]]*\]\(https:\/\/(?:www\.)?youtube\.com\/watch\?v=([A-Za-z0-9_-]+)[^)]*\)$/gm,
  (_, videoId) =>
    `<div style="position:relative;padding-top:56.25%"><iframe style="position:absolute;top:0;left:0;width:100%;height:100%" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe></div>`,
);

// 段落単独の URL リンク（リンクテキスト ≈ URL）を OGP リンクカードに変換
const fetchOgp = async (url) => {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; import-zenn-bot/1.0)",
      },
      signal: AbortSignal.timeout(8000),
    });
    const html = await res.text();
    const getOg = (prop) =>
      html.match(
        new RegExp(
          `<meta[^>]+property=["']og:${prop}["'][^>]+content=["']([^"']+)["']|<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:${prop}["']`,
        ),
      )?.[1] ??
      html.match(
        new RegExp(
          `<meta[^>]+property=["']og:${prop}["'][^>]+content=["']([^"']+)["']`,
        ),
      )?.[1] ??
      null;
    const getMeta = (name) =>
      html.match(
        new RegExp(
          `<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["']`,
        ),
      )?.[1] ?? null;
    const title =
      getOg("title") ?? html.match(/<title[^>]*>([^<]+)<\/title>/)?.[1] ?? null;
    const description = getOg("description") ?? getMeta("description") ?? null;
    const image = getOg("image") ?? null;
    return { title, description, image };
  } catch {
    return { title: null, description: null, image: null };
  }
};

const renderLinkCard = (url, ogp) => {
  const title = ogp.title
    ? `<div class="link-card-title">${ogp.title}</div>`
    : "";
  const description = ogp.description
    ? `<div class="link-card-description">${ogp.description}</div>`
    : "";
  const image = ogp.image
    ? `<div class="link-card-image-wrapper"><img class="link-card-image" src="${ogp.image}" alt="" /></div>`
    : "";
  const hostname = new URL(url).hostname;
  // <a> の中に <div> を入れると Markdown パーサが構造を壊すため、
  // 外側を <div> にして <a> を absolute オーバーレイにする
  return `<div class="link-card"><a href="${url}" class="link-card-anchor" target="_blank" rel="noopener noreferrer" aria-label="${ogp.title ?? url}"></a><div class="link-card-body"><div class="link-card-text">${title}${description}<div class="link-card-url">${hostname}</div></div>${image}</div></div>`;
};

const standaloneUrlRe =
  /^\[([^\]]*)\]\((https?:\/\/(?!(?:www\.)?youtube\.com)[^)]+)\)$/gm;
const cardTargets = [];
for (const match of body.matchAll(standaloneUrlRe)) {
  const [full, text, url] = match;
  if (text.replace(/\\(.)/g, "$1") === url) {
    cardTargets.push({ full, url });
  }
}
for (const { full, url } of cardTargets) {
  process.stdout.write(`Fetching OGP: ${url} ... `);
  const ogp = await fetchOgp(url);
  console.log(ogp.title ?? "(no title)");
  body = body.replace(full, renderLinkCard(url, ogp));
}

// 画像を public/zenn-images/ にダウンロードしてローカルパスに置換
const imageDir = join(ROOT, "public/zenn-images");
mkdirSync(imageDir, { recursive: true });

const imageUrls = [
  ...new Set(
    [...body.matchAll(/!\[[^\]]*\]\((https?:\/\/[^)\s"]+)/g)].map((m) => m[1]),
  ),
];
for (const url of imageUrls) {
  const filename = basename(new URL(url).pathname);
  const localPath = `/zenn-images/${filename}`;
  const filePath = join(imageDir, filename);
  process.stdout.write(`Downloading: ${filename} ... `);
  try {
    const r = await fetch(url);
    if (r.ok) {
      writeFileSync(filePath, Buffer.from(await r.arrayBuffer()));
      body = body.replaceAll(url, localPath);
      console.log("done");
    } else {
      console.log(`failed (${r.status})`);
    }
  } catch (e) {
    console.log(`error: ${e.message}`);
  }
}

// 見出しレベルを 1 段下げる（h1→h2, h2→h3, h3→h4）
// 深いものから順に処理して多重シフトを防ぐ
body = body.replace(/^### /gm, "#### ");
body = body.replace(/^## /gm, "### ");
body = body.replace(/^# /gm, "## ");

const publishedAt = article.published_at
  ? new Date(article.published_at).toISOString().split("T")[0]
  : "";

const frontmatter = [
  "---",
  `title: "${article.title.replace(/"/g, '\\"')}"`,
  `description: ""`,
  publishedAt ? `date: "${publishedAt}"` : null,
  `zenn: "https://zenn.dev/inaniwaudon/articles/${slug}"`,
  "---",
  "",
]
  .filter((line) => line !== null)
  .join("\n");

const outputArg = process.argv[3];
const outputPath = outputArg
  ? resolve(outputArg)
  : join(ROOT, `src/content/docs/${slug}.md`);

writeFileSync(outputPath, `${frontmatter}\n${body}\n`, "utf-8");
console.log(`Saved: ${outputPath}`);
