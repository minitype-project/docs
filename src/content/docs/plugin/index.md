---
title: プラグイン
caution: 4 つのプラグイン機構にそれぞれ定義例を示す．
---

本文書では，minitype のプラグイン機構を説明します．

## はじめに

minitype では `BlockExtender`，`PreBlockExtender`，`BlockTransformer`，および `InlineExtender` の 4 種類のプラグイン機構を用いて，文書の組版処理に介入できます．
頻繁な使用が見込まれる機能については，[組込みプラグイン](../builtin)として標準で提供されています．

## BlockExtender

コンテキストに依存してブロックを動的に生成します．
`Body`（`Group.body`）に含めることができます．

<!-- @extract:plugin/index.ts#BlockExtender -->

`BodyContext` を通じて本文の全ブロック（出現順）とページサイズにアクセスできますが，ラベルおよびページ番号はまだ確定していないためアクセスできません．

目次，参考文献リスト，索引等，文書全体のブロック情報を元に動的にブロックを生成する場合に使用します．

### 定義例

独自の BlockExtender の定義例として，特定の接頭辞を持つラベルが設定されたブロックの一覧を生成する例を示します．

```ts
import type { BlockExtender, BodyContext, Text } from "@minitype/minitype";
import { extractInlineText, isText, p } from "@minitype/minitype";

const labeledList = (prefix: string): BlockExtender => ({
  type: "blockExtender",
  function: ({ blocks }: BodyContext) => {
    return blocks
      .filter((block) => block.label?.startsWith(prefix) ?? false)
      .filter((block): block is Text => isText(block))
      .map((block) => p(extractInlineText(block.lines[0])));
  },
});
```

## PreBlockExtender

コンテキストに依存せずにブロックを静的に生成します．
`Body` には含められないため，事前に関数呼び出しにより展開して使用します．

<!-- @extract:plugin/index.ts#PreBlockExtender -->

### 定義例

独自の PreBlockExtender の定義例として，引数として渡したメッセージから注記ブロックを生成する例を示します．

```ts
import type { Block, PreBlockExtender } from "@minitype/minitype";
import { p } from "@minitype/minitype";

const notice: PreBlockExtender = (message: string) =>
  [p(`【注記】${message}`)];

const body: Block[] = [
  notice("本稿の内容は変更される場合があります．"),
];
```

## BlockTransformer

ブロックが展開され，スタイルも解決された後に呼び出され，ブロックを破壊的に変更します．

<!-- @extract:plugin/index.ts#BlockTransformer -->

`ContentContext` を通じてラベル情報，ページ番号，およびブロック位置情報（前後のブロック，親ブロック等）にアクセスできます（詳細は [BodyContext と ContentContext](#bodycontext-と-contentcontext) を参照）．

`minitype` 関数の `options.blockTransformers` に配列で渡します．

```ts
await minitype([{ body }], style, {
  blockTransformers: [myTransformer],
});
```

なお `headingTransformer`，`captionTransformer`，および `footnoteTransformer` の 3 つはデフォルトで自動的に適用されます．
これらを無効化する場合，`MinitypeOption.disableDefaultTransformers` を `true` に設定します．

### 定義例

独自の BlockTransformer の定義例として，特定の接頭辞を持つラベルが設定されたテキストブロックの先頭にページ番号を付加する例を示します．

```ts
import type { BlockTransformer, ContentContext } from "@minitype/minitype";

const pageMark = (labelPrefix: string): BlockTransformer => ({
  type: "blockTransformer",
  function: (block, { labels }: ContentContext) => {
    if (!block.label?.startsWith(labelPrefix) || block.type !== "text") {
      return;
    }
    const pageIndex = labels.block.label[block.label]?.pageIndex;
    if (pageIndex !== null) {
      block.lines[0] = [`p.${pageIndex + 1} `, ...block.lines[0]];
    }
  },
});

await minitype([{ body }], style, {
  blockTransformers: [pageMark("sec-")],
});
```

## InlineExtender

組版処理時にインライン要素に展開されるプラグインです．
組版後にしか確定しない情報（ラベル情報，ページ番号等）を参照するために使用します．

<!-- @extract:plugin/index.ts#InlineExtender -->

`ContentContext` を通じてラベル情報，ページ情報，およびブロック位置情報にアクセスできます（詳細は [BodyContext と ContentContext](#bodycontext-と-contentcontext) を参照）．

### 定義例

独自の InlineExtender の定義例として，あるラベルと総ページ数を組み合わせて「n/mページ」の文字列を生成する例を示します．

```ts
import type { ContentContext, InlineExtender } from "@minitype/minitype";

const pageProgress = (label: string): InlineExtender => ({
  type: "inlineExtender",
  function: ({ labels, totalPageCount }: ContentContext) => {
    const pageIndex = labels.block.label[label]?.pageIndex;
    if (pageIndex == null) {
      return ["??"];
    }
    return [`${pageIndex + 1}/${totalPageCount}ページ`];
  },
});
```

## BodyContext，ContentContext

`BodyContext` および `ContentContext` は以下の型によって定義されます．

<!-- @extract:plugin/index.ts#BodyContext -->
<!-- @extract:plugin/index.ts#ContentContext -->
<!-- @extract:plugin/index.ts#BlockLocation -->

これらの関係を整理した表を以下に示します．

| コンテキスト | 使用できるプラグイン | アクセスできる情報 |
| --- | --- | --- |
| `BodyContext` | `BlockExtender` | `blocks`（全てのブロック），`pageSize`（ページサイズ） |
| `ContentContext` | `BlockTransformer`，`InlineExtender` | `blocks`，`pageSize`，`labels`（ラベルマップ），`location`（ブロックの位置），`totalPages`（ページ数），`diagnostics`（診断情報） |
