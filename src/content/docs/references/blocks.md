---
title: ブロック要素
caution:
  - Block の型に示されるブロックのすべてを記載する．
  - "`src/lib/block-helper.ts` に定義されるすべてのインラインヘルパを記載する．"
  - ヘルパ関数がある場合，「ヘルパ関数として `foo()` が用意されています」と記載した後，その利用例のコードブロックを示す．
---

本文書では，minitype が扱うブロック要素の種類および使用方法を説明します．

## はじめに

`Block` は以下の型を用いて表されます．

<!-- @extract:lib/block.ts#Block -->

すべてのブロックは，オプションとして `label` および `id` フィールドを持ちます．
`label` を指定すると，相互参照から参照できます．

<!-- @extract:lib/block.ts#AbstractBlock -->

## 各ブロック要素

### テキスト（Text）

段落，見出し，またはキャプションを表します．

<!-- @extract:lib/block.ts#Text -->
<!-- @extract:lib/block.ts#TextType -->
<!-- @extract:lib/block.ts#TEXT_TYPES -->

`lines` はインライン要素の二次元配列です．
外側の配列が行，内側の配列が各行のインライン要素を表します．

ヘルパ関数として `text()`，`p()`，`h1()`，`h2()`，`h3()`，`h4()`，および `caption()` が用意されています．

```ts
import { caption, h1, h2, h3, h4, p, text } from "@minitype/minitype";

text("paragraph", "任意の種類のテキスト");
p("段落");
h1("レベル 1 の見出し");
h2("レベル 2 の見出し");
h3("レベル 3 の見出し");
h4("レベル 4 の見出し");
caption("図のキャプション");
```

### コードブロック（Code）

ソースコードを表します．

<!-- @extract:lib/block.ts#Code -->

`lang` には，シンタックスハイライトに使用する言語名を指定します．

ヘルパ関数として `code()` が用意されています．

```ts
import { code } from "@minitype/minitype";

code("const message = 'Hello';", "typescript");
```

### リスト（List）

順序なしまたは順序付きリストの項目を表します．

<!-- @extract:lib/block.ts#List -->
<!-- @extract:lib/block.ts#ListType -->
<!-- @extract:lib/block.ts#ListLevel -->
<!-- @extract:lib/block.ts#LIST_TYPES -->
<!-- @extract:lib/block.ts#LIST_LEVELS -->

`level` には，1 から 3 までの階層を指定できます．
マーカを省略した場合，文書の設定に従って番号，またはビュレットが付与されます．

ヘルパ関数として `li1()`，`li2()`，`li3()`，`ol1()`，`ol2()`，および `ol3()` が用意されています．

```ts
import { li1, li2, li3, ol1, ol2, ol3 } from "@minitype/minitype";

li1("順序なしリストの第 1 階層");
li2("順序なしリストの第 2 階層");
li3("順序なしリストの第 3 階層");
ol1("順序付きリストの第 1 階層");
ol2("順序付きリストの第 2 階層");
ol3("順序付きリストの第 3 階層");
```

### 脚注（Footnote）

本文に対応する脚注を表します．
`label` には，本文中の `fn()` と同じラベルを指定します．

<!-- @extract:lib/block.ts#Footnote -->

ヘルパ関数として `footnote()` が用意されています．

```ts
import { footnote } from "@minitype/minitype";

footnote("note-1", "脚注の内容");
```

### 画像（Image）

PNG，JPG，SVG，または PDF の図版を表します．

<!-- @extract:lib/block.ts#Image -->

ヘルパ関数として `image()` が用意されています．

```ts
import { image, ratio } from "@minitype/minitype";

image("chart.png", { width: ratio(0.8), align: "center" });
```

### 図形（Shape）

矩形または楕円を表します．

<!-- @extract:lib/block.ts#Shape -->

ヘルパ関数として `rect()` および `ellipse()` が用意されています．

```ts
import { ellipse, rect } from "@minitype/minitype";

rect(40, 20);
ellipse(40, 20);
```

### 表（Table）

行および列からなる表を表します．
各セルにはブロック要素を格納でき，`colspan` には水平方向に結合するセル数を指定できます．

<!-- @extract:lib/block.ts#Table -->
<!-- @extract:lib/block.ts#TableCell -->

ヘルパ関数として `table()` および `cell()` が用意されています．
プラグインとして提供される [easytable](../../plugin/builtin/#簡易テーブルeasytable) も利用できます．

```ts
import { cell, p, table } from "@minitype/minitype";

table([
  [cell(p("見出し"), { colspan: 2 })],
  [cell(p("左")), cell(p("右"))],
]);
```

### 数式ブロック（MathBlock）

LaTeX 記法による数式を表します．

<!-- @extract:lib/block.ts#MathBlock -->

ヘルパ関数として `math()` が用意されています．

```ts
import { math } from "@minitype/minitype";

math(["E = mc^2"]);
```

### 改ページ（NewPage，ClearPage），改段（NewColumn）

`NewPage` は改ページを行います．
`ClearPage` は保留中のフロートを出力してから，改ページを行います．
`NewColumn` は多段組では次の段へ移動し，1 段組では改ページを行います．

<!-- @extract:lib/block.ts#NewPage -->
<!-- @extract:lib/block.ts#ClearPage -->
<!-- @extract:lib/block.ts#NewColumn -->

ヘルパ関数として `newpage()`，`clearpage()`，および `newcolumn()` が用意されています．

```ts
import { clearpage, newcolumn, newpage } from "@minitype/minitype";

newpage();
clearpage();
newcolumn();
```

### 垂直スペース（Vspace）

指定した大きさの垂直方向のスペースを表します．

<!-- @extract:lib/block.ts#Vspace -->

`additive: false`（既定値）にした場合，隣接するブロック間の `gaps` を無視して，指定した大きさのスペースを絶対値で挿入します．
`additive: true` にした場合，`gaps` によるスペースに指定した大きさを加算して挿入します．

ヘルパ関数として `vspace()`（`additive: false` として動作）および `addvspace()`（`additive: true` として動作）が用意されています．

```ts
import { addvspace, vspace } from "@minitype/minitype";

vspace(10);
addvspace(10);
```

### ボックス（Box），フレックスボックス（Flexbox）

段組，フロート，または装飾に使用するコンテナ要素です．
詳細は[ボックス，フレックスボックス](./box)を参照してください．

<!-- @extract:lib/block.ts#Box -->
<!-- @extract:lib/block.ts#Flexbox -->

ヘルパ関数として `box()` および `flexbox()` が用意されています．

```ts
import { box, flexbox, p } from "@minitype/minitype";

const firstBox = box([p("左側")]);
const secondBox = box([p("右側")]);
flexbox([firstBox, secondBox]);
```

### カウンタリセット（ResetLabel）

図表番号，見出し番号，または脚注番号等のカウンタをリセットします．
`types` を省略した場合，すべてのカウンタがリセットされます．
見出しの種類を指定した場合，指定した見出し以下のレベルもリセットされます．

<!-- @extract:lib/block.ts#ResetLabel -->
<!-- @extract:lib/block.ts#ResetLabelType -->
<!-- @extract:lib/block.ts#RESET_LABEL_TYPES -->

ヘルパ関数として `resetLabel()` が用意されています．

```ts
import { resetLabel } from "@minitype/minitype";

resetLabel(["h1", "image"]);
```

### セクション（Section）

レイアウトに影響を与えない透過的なコンテナ要素です．
子ブロックのスタイルをまとめて上書きできます．

<!-- @extract:lib/block.ts#Section -->

ヘルパ関数として `section()` が用意されています．

```ts
import { h2, p, section } from "@minitype/minitype";

section([h2("小見出し"), p("本文")], {
  paragraph: { size: 11 },
});
```

### フロート（Float）

子ブロックを段の上端または下端に配置します．
現在の段に配置できない場合，次の段に持ち越されます．

<!-- @extract:lib/block.ts#Float -->

ヘルパ関数として `float()` が用意されています．

```ts
import { float, image } from "@minitype/minitype";

float("top", [image("chart.png")]);
```

### 移動（Move）

インライン方向またはブロック方向に対してオフセットを適用します．

<!-- @extract:lib/block.ts#Move -->

ヘルパ関数として `move()` が用意されています．

```ts
import { move, p } from "@minitype/minitype";

move([p("移動する内容")], { inlineOffset: 5, blockOffset: 10 });
```

## タグ付きテンプレート

テキストおよびリストのヘルパ関数には，文字列，文字列の一次元配列，またはインライン要素の二次元配列を渡せます．
文字列に改行が含まれる場合，改行ごとに行が分割されます．
また，テキストおよびリストのヘルパ関数は，タグ付きテンプレートリテラルとしても使用できます．

`processTemplate()` および `withTemplate()` は，タグ付きテンプレートリテラルに対応する独自のヘルパ関数を作成する場合に使用します．

ヘルパ関数として `processTemplate()` が用意されています．

```ts
import { processTemplate } from "@minitype/minitype";

const customText = (strings: TemplateStringsArray, ...values: string[]) => {
  return processTemplate(strings, ...values);
};
```

ヘルパ関数として `withTemplate()` が用意されています．

```ts
import { text, withTemplate } from "@minitype/minitype";

const paragraph = withTemplate((lines) => {
  return text("paragraph", lines);
});
```
