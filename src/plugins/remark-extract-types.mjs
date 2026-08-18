import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { visit } from "unist-util-visit";
import { extractTypeDefinition } from "../libs/extract-types.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MINITYPE_SRC = resolve(__dirname, "../../../minitype/src");

/**
 * Markdown 内の `@extract` ディレクティブを TypeScript の型定義コードブロックに置き換える remark プラグイン．
 *
 * ディレクティブの書式: `<!-- @extract:<ファイルパス>#<型名> -->`
 * - `<ファイルパス>`: `minitype/src` からの相対パス
 * - `<型名>`: 抽出する型またはインターフェースの名前
 *
 * ディレクティブの直後に既存のコードブロックがある場合は，それも一緒に置き換える
 * （Markdown プレビュー用のフォールバックコードブロックを想定した挙動）．
 * 解決に失敗した場合はノードを変更せずスキップする（ビルドエラーにしない）．
 */
const remarkExtractTypes = () => {
  return (tree) => {
    const replacements = [];

    visit(tree, "html", (node, index, parent) => {
      const match = node.value.match(/<!--\s*@extract:([^#\s]+)#(\w+)\s*-->/);
      if (!match || !parent) return;

      const [, filePath, typeName] = match;
      const fullPath = resolve(MINITYPE_SRC, filePath);

      let source;
      try {
        source = readFileSync(fullPath, "utf-8");
      } catch {
        console.warn(
          `[remark-extract-types] ファイルを読み込めません: ${filePath}`,
        );
        return;
      }

      const extracted = extractTypeDefinition(source, typeName);
      if (!extracted) {
        console.warn(
          `[remark-extract-types] ${typeName} が ${filePath} に見つかりません`,
        );
        return;
      }

      replacements.push({ parent, index, code: extracted });
    });

    // visit 中に children を変更すると index がずれるため逆順に処理
    for (const { parent, index, code } of replacements.reverse()) {
      const codeNode = { type: "code", lang: "ts", meta: null, value: code };
      const next = parent.children[index + 1];
      if (next?.type === "code") {
        // ディレクティブの直後にコードブロックがある場合はまとめて置換
        parent.children.splice(index, 2, codeNode);
      } else {
        parent.children.splice(index, 1, codeNode);
      }
    }
  };
};

export default remarkExtractTypes;
