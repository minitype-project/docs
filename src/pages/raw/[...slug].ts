import { getCollection } from "astro:content";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { APIRoute, GetStaticPaths } from "astro";
import {
  extractTypeDefinition,
  formatWithBiome,
} from "../../libs/extract-types";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MINITYPE_SRC = resolve(__dirname, "../../../../minitype/src");

const rawFiles = import.meta.glob<string>("/src/content/docs/**/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

/**
 * Markdown 内の `@extract` ディレクティブを TypeScript の型定義コードブロックに置き換える．
 *
 * ディレクティブの書式: `<!-- @extract:<ファイルパス>#<型名> -->`
 * - `<ファイルパス>`: `minitype/src` からの相対パス
 * - `<型名>`: 抽出する型またはインターフェースの名前
 *
 * 解決に失敗した場合は元のディレクティブをそのまま残す（ビルドエラーにしない）．
 *
 * @param content - 処理対象の Markdown 文字列
 * @returns ディレクティブをコードブロックに置換した Markdown 文字列
 */
function resolveExtractDirectives(content: string): string {
  return content.replace(
    /<!--\s*@extract:([^#\s]+)#(\w+)\s*-->/g,
    (match, filePath: string, typeName: string) => {
      const fullPath = resolve(MINITYPE_SRC, filePath);
      let source: string;
      try {
        source = readFileSync(fullPath, "utf-8");
      } catch {
        console.warn(
          `[resolveExtractDirectives] ファイルを読み込めません: ${filePath}`,
        );
        return match;
      }
      const extracted = extractTypeDefinition(source, typeName);
      if (!extracted) {
        console.warn(
          `[resolveExtractDirectives] ${typeName} が ${filePath} に見つかりません`,
        );
        return match;
      }
      return `\`\`\`ts\n${formatWithBiome(extracted)}\n\`\`\``;
    },
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const docs = await getCollection("docs");
  return docs.map((entry) => ({
    params: { slug: `${entry.id}.md` },
    props: { id: entry.id },
  }));
};

export const GET: APIRoute = ({ props }) => {
  const raw =
    rawFiles[`/src/content/docs/${props.id}.md`] ??
    rawFiles[`/src/content/docs/${props.id}/index.md`];
  if (raw == null) {
    return new Response("Not Found", { status: 404 });
  }
  const content = resolveExtractDirectives(raw);
  return new Response(content, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
