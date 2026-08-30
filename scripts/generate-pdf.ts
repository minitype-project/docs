/**
 * 指定ドキュメントの PDF を生成して public/pdf/<slug>.pdf に保存するスクリプト．
 *
 * 使い方:
 *   node --experimental-strip-types scripts/generate-pdf.ts <slug>
 *   例: node --experimental-strip-types scripts/generate-pdf.ts explanatory
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as minitype from "@minitype/minitype";
import {
  generatePdf,
  type MinitypeApi,
  preprocessMarkdown,
} from "../src/libs/create-document.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const publicDir = resolve(root, "public");
const contentDir = resolve(root, "src/content/docs");

const slug = process.argv[2];
if (!slug) {
  console.error(
    "Usage: node --experimental-strip-types scripts/generate-pdf.ts <slug>",
  );
  process.exit(1);
}

const toArrayBuffer = (buf: Buffer): ArrayBuffer =>
  buf.buffer.slice(
    buf.byteOffset,
    buf.byteOffset + buf.byteLength,
  ) as ArrayBuffer;

const main = async () => {
  const rawMarkdown = await readFile(
    resolve(contentDir, `${slug}.md`),
    "utf-8",
  );

  // frontmatter からタイトルを取得
  const titleMatch = rawMarkdown.match(/^---[\s\S]*?\ntitle:\s*"?([^"\n]+)"?/);
  const title = (titleMatch?.[1] ?? slug).trim();

  // 共通前処理後，ローカル画像パスを絶対パスに変換（ESM ビルドはファイルシステムから読む）
  const markdown = preprocessMarkdown(rawMarkdown).replace(
    /!\[([^\]]*)\]\(\/([^)\s"]+)/g,
    (_, alt: string, rest: string) => `![${alt}](${publicDir}/${rest}`,
  );

  const [fontReg, fontBold, fontMono, fontSerif] = await Promise.all([
    readFile(resolve(publicDir, "fonts/GenInterfaceJP-Regular.ttf")),
    readFile(resolve(publicDir, "fonts/GenInterfaceJP-Bold.ttf")),
    readFile(resolve(publicDir, "fonts/NotoSansMono-Variable.ttf")),
    readFile(resolve(publicDir, "fonts/SourceHanSerifJP-Regular.otf")),
  ]);

  const headerImagePath = resolve(publicDir, "quick-start/header.jpg");

  const pdfData = await generatePdf(
    title,
    markdown,
    minitype as unknown as MinitypeApi,
    {
      fontReg: toArrayBuffer(fontReg),
      fontBold: toArrayBuffer(fontBold),
      fontMono: toArrayBuffer(fontMono),
      fontSerif: toArrayBuffer(fontSerif),
      headerImagePath,
    },
  );

  const outDir = resolve(publicDir, "pdf");
  await mkdir(outDir, { recursive: true });
  const outPath = resolve(outDir, `${slug}.pdf`);
  await writeFile(outPath, pdfData);
  console.log(`Saved: public/pdf/${slug}.pdf`);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
