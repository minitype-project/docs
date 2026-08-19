---
title: Markdown プラグイン
---

本文書では，Markdown テキストを minitype のブロック列に変換する組込みプラグインを説明します．

## はじめに

本プラグインは，以下の関数を提供します．

| 関数 | 説明 |
| --- | --- |
| `md` | タグ付きテンプレートを用いて Markdown を記述する． |
| `createMd` | カスタムマッパを持つ `md` タグを生成する． |
| `mdString` | Markdown 文字列を変換する． |
| `mdFile` | Markdown ファイルを変換する． |
| `mdInlineString` | Markdown インライン記法を含む文字列をインライン要素に変換する． |

### 対応する Markdown 構文

以下の Markdown 構文に対応します．
その他の構文はスキップされます．

- 見出し（`#`，`##`，`###`，`####`）
- 段落
- コードブロック（` ```lang ``` `）
- リスト（`- list`，`1. list`）  
  最大 3 階層まで対応しています．
- 強調（`*italic*` / `_italic_`）  
  `em` コマンドに変換されます．
- 太字（`**bold**`，`__bold__`）  
  `b` コマンドに変換されます．
- コード（`` `code` ``）  
  `c` コマンドに変換されます．
- リンク（`[text](url)`）
- 画像（`![alt](src "title")`）  
  `image` ブロックおよび `caption` ブロックに変換されます．
- テーブル（GFM テーブル記法）
- 水平線（`---`，`***`，`___`）  
  デフォルトでは何も出力しません．カスタムマッパを用いて処理できます．
- 脚注（`[^label]` 参照，`[^label]: text` 定義）
- コンテナブロック（`:::name ... :::`）  
  minitype 独自の拡張構文です．

## md，createMd

`md` はタグ付きテンプレートとして使用します．

<!-- @extract:../dist/plugin/built-in/markdown/index.d.ts#md -->

`createMd` は後述するカスタムマッパを受け取って，`md` と同じ型のタグ付きテンプレートを返します．

<!-- @extract:../dist/plugin/built-in/markdown/index.d.ts#createMd -->

戻り値の型 `MarkdownTag` および `MarkdownResult` は以下の通りです．

<!-- @extract:../dist/plugin/built-in/markdown/index.d.ts#MarkdownTag -->
<!-- @extract:../dist/plugin/built-in/markdown/index.d.ts#MarkdownResult -->

```ts
import { md } from "@minitype/minitype";
import type { Body, MarkdownResult } from "@minitype/minitype";

export const body: Body = [
  md`
## セクション

**太字** と \`コード\` を含む段落．

- リスト項目 1
- リスト項目 2
`,
];
```

### ブロック，インラインの埋め込み

テンプレートリテラルに `Block`，`Block[]`，`BlockExtender`，`InlineOrExtender` を埋め込むことができます．
これらは型に基づいて自動判別されます．

```ts
import { md, kern } from "@minitype/minitype";
import type { Box } from "@minitype/minitype";

// Block：ブロックとして自動判別
const myBox: Box = ;

// BlockExtender：ブロックとして自動判別
const intro = md`はじめに ...`;

// string，Command，Kerning 等のインライン値：インラインとして自動判別
const year = "2025";

export const body: Body = [
  md`${myBox}

  ${intro}

  本文中に${kern(0.5)}カーニングを挿入した例（${year}年）．
  `,
];
```

値は以下の通りに判別されます．

| 値の種類 | 判別 |
| --- | --- |
| `Block`（`type` フィールドで識別） | ブロック |
| `Block[]` | ブロック |
| `BlockExtender`（`type: "blockExtender"` で識別） | ブロック |
| `string` | インライン |
| `Command` / `Break` / `Kerning` / `InlineGraphic` | インライン |
| `InlineExtender`（`type: "inlineExtender"` で識別） | インライン |

## mdString，mdFile

タグ付きテンプレートではなく既存の文字列およびファイルを変換する場合，それぞれ `mdString` および `mdFile` を使用します．
いずれも第 2 引数にカスタムマッパを渡すことができます．
なお，値の補間はできません．

<!-- @extract:../dist/plugin/built-in/markdown/index.d.ts#mdString -->
<!-- @extract:../dist/plugin/built-in/markdown/index.d.ts#mdFile -->

```ts
import { mdFile, mdString } from "@minitype/minitype";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const body: Body = [
  // 文字列から変換
  mdString(`## セクション

段落テキスト．`),

  // ファイルから変換
  mdFile("article.md"),
];
```

## mdInlineString

Markdown のインライン記法を含む文字列をインライン要素の配列に変換します．
ブロック要素には対応していません．

```ts
import { mdInlineString, p } from "@minitype/minitype";

const inlines = mdInlineString("**太字**と `コード` を含むテキスト．");

export const body: Body = [p([inlines])];
```

## YAML フロントマター

Markdown の先頭に `---` で囲まれた YAML ブロックを記述すると，`frontmatter` フィールドとして取得できます．

```ts
import { md } from "@minitype/minitype";
import type { MarkdownResult } from "@minitype/minitype";

interface Meta {
  title: string;
}

const result: MarkdownResult<Meta> = await md<Meta>`
---
title: サンプル文書
---

本文のテキスト．
`();

// "サンプル文書"
console.log(result.frontmatter.title);
```

## カスタムマッパ

カスタムマッパを使用すると，各ブロック種別の変換処理をカスタマイズできます．
未指定のキーにはデフォルトのマッパが使用されます．

```ts
import { createMd } from "@minitype/minitype";
import { h2, h3, listing } from "...";

const md = createMd({
  h2: (inlines) => h2(inlines),
  code: (code, lang) => listing(lang ?? "", code),
});

export const body: Body = [
  md`
    ## カスタム見出し

    \`\`\`ts
    const x = 1;
    \`\`\`
  `,
];
```

`createMd` が受け取る `MarkdownMapping` の各フィールドは以下の通りです．

<!-- @extract:plugin/built-in/markdown/helper.ts#MarkdownMapping -->
<!-- @extract:plugin/built-in/markdown/helper.ts#HeadingMapper -->
<!-- @extract:plugin/built-in/markdown/helper.ts#ParagraphMapper -->
<!-- @extract:plugin/built-in/markdown/helper.ts#CodeMapper -->
<!-- @extract:plugin/built-in/markdown/helper.ts#ListMapper -->
<!-- @extract:plugin/built-in/markdown/helper.ts#FootnoteMapper -->
<!-- @extract:plugin/built-in/markdown/helper.ts#ImageMapper -->
<!-- @extract:plugin/built-in/markdown/helper.ts#HrMapper -->
<!-- @extract:plugin/built-in/markdown/helper.ts#TableMapper -->
<!-- @extract:plugin/built-in/markdown/helper.ts#ContainerMapper -->
<!-- @extract:plugin/built-in/markdown/helper.ts#YamlMapper -->
<!-- @extract:plugin/built-in/markdown/helper.ts#EmDelimiter -->
<!-- @extract:plugin/built-in/markdown/helper.ts#StrongDelimiter -->

### ListItem

`list` マッパに渡される `ListItem` は，ネストを含むリスト全体をフラットに展開したものです．

<!-- @extract:plugin/built-in/markdown/helper.ts#ListItem -->

Markdown から変換された `ListItem[]` の例を以下に示します．

```md
- A
  - A-1
  - A-2
- B
```

```ts
[
  { level: 1, listType: "unordered", inlines: ["A"] },
  { level: 2, listType: "unordered", inlines: ["A-1"] },
  { level: 2, listType: "unordered", inlines: ["A-2"] },
  { level: 1, listType: "unordered", inlines: ["B"] },
];
```
