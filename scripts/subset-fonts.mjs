// fonts-src/ のフォントを src/ 以下の全ソースファイルにて使用される文字にサブセット化して
// public/fonts/ に出力する．

import { execSync } from "node:child_process";
import {
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(import.meta.url), "../../");
const FONTS_SRC = join(ROOT, "fonts-src");
const FONTS_OUT = join(ROOT, "public/fonts");
const SRC_DIR = join(ROOT, "src");

const EXTENSIONS = [".md", ".astro", ".tsx", ".ts"];

const collectSrcFiles = (dir) => {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...collectSrcFiles(full));
    } else if (EXTENSIONS.some((ext) => entry.endsWith(ext))) {
      results.push(full);
    }
  }
  return results;
};

// 収集する文字セット
const chars = new Set();

// PDF レイアウトの固定文字列（create-document.ts のハードコード文字列）
for (const ch of "minitype ") {
  chars.add(ch);
}

// ASCII 印刷可能文字（コードブロック，数字，記号）
for (let cp = 0x20; cp <= 0x7e; cp++) {
  chars.add(String.fromCodePoint(cp));
}

// src/ 以下の全ソースファイルの文字
for (const file of collectSrcFiles(SRC_DIR)) {
  for (const ch of readFileSync(file, "utf-8")) {
    chars.add(ch);
  }
}

// コードポイントリストを生成
const unicodes = [...chars]
  .map((ch) => ch.codePointAt(0))
  .filter((cp) => cp > 0)
  .sort((a, b) => a - b)
  .map((cp) => `U+${cp.toString(16).toUpperCase().padStart(4, "0")}`)
  .join(",");

const tmpDir = mkdtempSync(join(tmpdir(), "minitype-font-subset-"));
const unicodeFile = join(tmpDir, "unicodes.txt");
writeFileSync(unicodeFile, unicodes);

console.log(`Collected ${chars.size} unique characters`);

const fonts = [
  "GenInterfaceJP-Regular.ttf",
  "GenInterfaceJP-Bold.ttf",
  "NotoSansMono-Variable.ttf",
  "SourceHanSerifJP-Regular.otf",
];

for (const font of fonts) {
  const srcPath = join(FONTS_SRC, font);
  const outPath = join(FONTS_OUT, font);

  execSync(
    `pyftsubset ${srcPath} --unicodes-file=${unicodeFile} --layout-features="*" --glyph-names --notdef-outline --legacy-cmap --no-hinting --output-file=${outPath}`,
  );

  const srcSize = statSync(srcPath).size;
  const outSize = statSync(outPath).size;
  const pct = ((1 - outSize / srcSize) * 100).toFixed(1);
  const mb = (n) => `${(n / 1024 / 1024).toFixed(2)}MB`;
  console.log(`  ${font}: ${mb(srcSize)} → ${mb(outSize)} (-${pct}%)`);
}

rmSync(tmpDir, { recursive: true });

// フォントを再サブセット化すると GID が変わるため，DB キャッシュを削除して再構築
const dbPath = join(ROOT, "font-caches.db");
try {
  unlinkSync(dbPath);
  unlinkSync(`${dbPath}-shm`);
  unlinkSync(`${dbPath}-wal`);
  console.log("Cleared font-caches.db (GID mappings changed).");
} catch {
  // DB が存在しない場合は無視
}

console.log("Done.");
