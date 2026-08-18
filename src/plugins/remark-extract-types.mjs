import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { visit } from "unist-util-visit";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MINITYPE_SRC = resolve(__dirname, "../../../minitype/src");

function stripComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*/g, "");
}

function extractTypeDefinition(source, typeName) {
  const stripped = stripComments(source);
  const lines = stripped.split("\n");

  let startIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (
      new RegExp(`^export\\s+(type|interface)\\s+${typeName}\\b`).test(lines[i])
    ) {
      startIdx = i;
      break;
    }
  }
  if (startIdx === -1) return null;

  const isInterface = /^export\s+interface\s+/.test(lines[startIdx]);
  const collected = [];
  let braceDepth = 0;
  let parenDepth = 0;
  let hasOpened = false;

  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i];
    collected.push(line);

    for (const ch of line) {
      if (ch === "{") {
        braceDepth++;
        hasOpened = true;
      } else if (ch === "}") {
        braceDepth--;
      } else if (ch === "(") {
        parenDepth++;
      } else if (ch === ")") {
        parenDepth--;
      }
    }

    if (braceDepth === 0 && parenDepth === 0) {
      const trimmed = line.trimEnd();
      if (!isInterface && trimmed.endsWith(";")) break;
      if (isInterface && hasOpened && trimmed.endsWith("}")) break;
    }
  }

  const result = collected
    .filter((line) => line.trim() !== "")
    .join("\n")
    .replace(/^export\s+(type|interface)\s+/, "$1 ");

  return result;
}

export default function remarkExtractTypes() {
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

    for (const { parent, index, code } of replacements.reverse()) {
      const codeNode = { type: "code", lang: "ts", meta: null, value: code };
      const next = parent.children[index + 1];
      if (next?.type === "code") {
        parent.children.splice(index, 2, codeNode);
      } else {
        parent.children.splice(index, 1, codeNode);
      }
    }
  };
}
