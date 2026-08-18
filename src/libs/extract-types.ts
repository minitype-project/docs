/**
 * TypeScript ソースからブロックコメントと行コメントを除去する．
 */
export const stripComments = (source: string): string => {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*/g, "");
};

/**
 * TypeScript ソースまたは型定義から，指定した型，インタフェース，および定数の定義を抽出する．
 * コメント内の同名の型宣言を誤検出しないよう，先にコメントを除去してから解析する．
 *
 * @param source - TypeScript ソースコード
 * @param typeName - 抽出対象の型名
 * @returns 抽出した定義文字列（`export` キーワードは除去済み）．見つからない場合は `null`
 */
export const extractTypeDefinition = (
  source: string,
  typeName: string,
): string | null => {
  const stripped = stripComments(source);
  const lines = stripped.split("\n");

  // 対象の宣言が始まる行を探す
  let startIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (
      new RegExp(
        `^export\\s+(?:declare\\s+)?(type|interface|const)\\s+${typeName}\\b`,
      ).test(lines[i])
    ) {
      startIdx = i;
      break;
    }
  }
  if (startIdx === -1) {
    return null;
  }

  // type alias と interface で終端条件が異なる
  const isInterface = /^export\s+(?:declare\s+)?interface\s+/.test(
    lines[startIdx],
  );
  const collected: string[] = [];
  let braceDepth = 0;
  let parenDepth = 0;
  let bracketDepth = 0;
  // hasOpened: 開き括弧が現れる前に depth === 0 で終端判定するのを防ぐフラグ
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
      } else if (ch === "[") {
        bracketDepth++;
        hasOpened = true;
      } else if (ch === "]") {
        bracketDepth--;
      }
    }

    if (braceDepth === 0 && parenDepth === 0 && bracketDepth === 0) {
      const trimmed = line.trimEnd();
      // type alias: セミコロンで終端
      if (!isInterface && trimmed.endsWith(";")) {
        break;
      }
      // interface: 閉じ括弧で終端（開き括弧が出現した後に限る）
      if (isInterface && hasOpened && trimmed.endsWith("}")) {
        break;
      }
    }
  }

  const definition = collected.filter((line) => line.trim() !== "").join("\n");

  if (/^export\s+declare\s+/.test(definition)) {
    return definition.replace(/^export\s+declare\s+/, "export ");
  }

  // ドキュメントへの埋め込み用に export キーワードを除去して返す
  return definition.replace(/^export\s+(type|interface|const)\s+/, "$1 ");
};
