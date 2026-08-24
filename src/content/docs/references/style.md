---
title: スタイル
---

本文書では，minitype の文書スタイル，文字およびブロックのスタイル，単位，色，合成フォント，文字組みアキ量設定，装飾，ならびに罫線の仕様を説明します．

## 文書スタイル

文書全体のスタイルは `DocumentStyle` 型で定義します．
すべてのプロパティを指定する必要はなく，`minitype` 関数には `Partial<DocumentStyle>` を渡せます．

<!-- @extract:style/style.ts#DocumentStyle -->

主なプロパティは以下の通りです．

| プロパティ | 説明 |
| --- | --- |
| `size` | ページサイズです．`"A0"`–`"A6"`，`"B0"`–`"B6"`，または `{ width, height }` を指定します． |
| `padding` | ページのパディングです．ページインデックスを受け取る関数も指定できます． |
| `block` | ブロック種別ごとのスタイルです． |
| `command` | 名前付きインラインコマンドのスタイルです． |
| `writingMode` | `"horizontal"` で横組，`"vertical"` で縦組にします． |
| `gaps` | 前後するブロック間のアキです． |

以下は，A5 判の縦組文書に基本的なスタイルを設定する例です．

```ts
import { Q, em, logical, type DocumentStyle } from "@minitype/minitype";

const style: Partial<DocumentStyle> = {
  size: "A5",
  writingMode: "vertical",
  padding: logical(18, 20),
  block: {
    paragraph: {
      size: Q(13),
      lineHeight: em(1.8),
    },
    h1: {
      size: Q(24),
      lineHeight: em(1.5),
    },
  },
  gaps: [
    ["h1", "paragraph", 8],
    ["paragraph", "paragraph", 0],
  ],
};
```

### ページサイズとパディング

独自のページサイズを指定する場合，幅および高さの数値は mm 単位です．
`padding` には，物理方向または論理方向の指定を使用します．

```ts
import { physical, type DocumentStyle } from "@minitype/minitype";

const style: Partial<DocumentStyle> = {
  size: { width: 148, height: 210 },
  padding: physical(15, 18, 20, 18),
};
```

ページごとにパディングを切り替える場合，`pageIndex` を受け取る関数を指定します．
`pageIndex` は 0 から始まるため，最初のページでは `0` です．

```ts
padding: (pageIndex) => {
  if (pageIndex % 2 === 0) {
    return physical(20, 30, 20, 25);
  }
  return physical(20, 25, 20, 30);
},
```

`calculatePhysicalPadding` を使用すると，ページサイズ，1 行の文字数，行数，文字サイズ，行送り，および書字方向から，版面を中央に置くためのパディングを計算できます．

### 物理方向と論理方向

`physical()` は上，右，下，左という用紙上の方向を指定します．
引数の解釈は CSS の一括指定と同様です．

| 引数の数 | 解釈 |
| --- | --- |
| 1 | 全辺． |
| 2 | 上下，左右． |
| 3 | 上，左右，下． |
| 4 | 上，右，下，左． |

`logical()` は書字方向に対する方向を指定します．
`blockStart` および `blockEnd` は行が並ぶ方向，`inlineStart` および `inlineEnd` は文字が並ぶ方向の始端および終端です．
横組と縦組の双方で同じ意図を保つ場合には，論理方向を使用します．

```ts
import { logical, physical } from "@minitype/minitype";

physical(10, 15); // 上下 10 mm，左右 15 mmです．
logical(10, 15);  // ブロック方向 10 mm，インライン方向 15 mmです．
```

`all()`，`vertical()`，`horizontal()`，`top()`，`right()`，`bottom()`，および `left()` を使用すると，物理方向の一部だけを簡潔に指定できます．

### ブロック間のアキ

`gaps` の各要素は `[前のブロック種別, 後のブロック種別, アキ]` という形式です．
アキの数値は mm 単位です．
ブロック種別には `"paragraph"`，`"h1"`–`"h4"`，`"code"`，`"li1"`–`"li3"`，`"image"`，`"shape"`，`"caption"`，`"footnote"`，`"box"`，および `"flexbox"` を指定できます．
`"fallback"` は任意のブロック種別に一致します．

```ts
gaps: [
  ["h1", "paragraph", 8],
  ["fallback", "h1", 12],
  ["fallback", "fallback", 4],
],
```

両側が完全に一致する指定，片側だけが `"fallback"` の指定，両側が `"fallback"` の指定という順に優先されます．
詳細度が同じ指定が複数ある場合，先に記述した指定が適用されます．
一致する指定がない場合，アキは 0 mm です．

## ブロックスタイル

`DocumentStyle.block` には，ブロック種別ごとのスタイルを指定します．

<!-- @extract:style/block-style.ts#BlockStyleRecord -->

`paragraph`，`h1`–`h4`，`caption` には `TextStyle` を指定します．
`code`，`li1`–`li3`，および `footnote` では，`TextStyle` に加えて各ブロック固有のプロパティを指定できます．
画像，図形，表，数式，ボックス，およびフレックスボックスには，それぞれ専用のスタイルがあります．

### テキスト

テキストブロックのスタイルは `TextStyle` 型で定義します．

<!-- @extract:style/block-style.ts#TextStyle -->

組版に関する主なプロパティは以下の通りです．

| プロパティ | 説明 |
| --- | --- |
| `lineHeight` | 行送りです．mm 単位の数値または `em()` を指定します． |
| `align` | `"left"`，`"center"`，`"right"`，または `"justify"` を指定します．ページごとに値を返す関数も指定できます． |
| `indent` | ブロック全体のインデントです．mm 単位の数値または `em()` を指定します． |
| `firstIndent` | 先頭行の追加インデントです．mm 単位の数値または `em()` を指定します． |
| `pre` | 改行および空白を保持する整形済みテキストとして扱うかを指定します． |
| `space` | 文字クラスの組み合わせごとのアキ量を指定します． |
| `burasagari` | 句読点のぶら下げを有効にするかを指定します． |
| `hyphenation` | 横組の欧文でハイフネーションを有効にするかを指定します． |
| `splitable` | ブロックを段またはページの途中で分割できるかを指定します． |
| `needspace` | 分割しないブロックの配置後に必要な空き領域を mm 単位で指定します． |
| `gyodori` | ブロックが占める行数を指定します．実際の行数を受け取る関数も指定できます． |
| `headingNumberFormat` | `h1`–`h4` の通し番号と見出しレベルから，表示する番号を返す関数です． |
| `dropCap` | 段落先頭のドロップキャップを指定します． |

`align` の関数に渡される `pageIndex` は 0 から始まります．
`headingNumberFormat` に渡される見出し番号は 1 から始まります．

```ts
block: {
  paragraph: {
    align: "justify",
    firstIndent: em(1),
    burasagari: true,
    hyphenation: true,
  },
  h2: {
    splitable: false,
    needspace: 20,
    headingNumberFormat: (indices, level) => {
      return `${indices.slice(0, level).join(".")} `;
    },
  },
},
```

ドロップキャップでは，占有する行数に加えて，フォント，拡大率，エフェクト，本文との間隔，およびブロック方向の位置を指定できます．

<!-- @extract:style/block-style.ts#DropCapStyle -->

### 文字

`CharStyle` はテキストブロックとインラインスタイルで共通して使用される文字のスタイルです．

<!-- @extract:style/style.ts#CharStyle -->

| プロパティ | 説明 |
| --- | --- |
| `size` | 文字サイズです．mm 単位の数値を指定します．`Q()` または `pt()` で他の単位から変換できます． |
| `font` | フォントキーまたは合成フォントを指定します． |
| `effects` | 塗り，ストローク，または画像塗りのレイヤを指定します． |
| `scale` | `em()` による文字の拡大率です． |
| `blockOffset` | ブロック方向の位置を mm 単位の数値または `em()` で調整します． |
| `inlineOffset` | インライン方向の位置を mm 単位の数値または `em()` で調整します． |
| `kerning` | フォントのカーニングを有効にするかを指定します． |
| `tatechuyoko` | 縦中横にする連続した数字の最大文字数を指定します． |
| `latinUpright` | 縦組で正立させる連続した欧文および数字の最大文字数を指定します． |
| `rubySize` | ルビ文字のサイズを mm 単位の数値または `em()` で指定します． |
| `rubyOffset` | ルビと親文字の間隔を mm 単位の数値または `em()` で指定します． |
| `rubyFont` | ルビ文字のフォントを指定します． |
| `rubyAlign` | `"center"`，`"jis"`，または `"justify"` でルビの割り付けを指定します． |

`effects` は配列の先頭から順に上層として描画されます．
`blockOffset` および `inlineOffset` の正の値は，それぞれの進行方向へ文字を移動します．

### コード，リスト，および脚注

コードブロックでは，既定の文字色，太字および斜体用のフォント，ならびに highlight.js のテーマを指定できます．

<!-- @extract:style/block-style.ts#CodeStyle -->

リストでは，固定のインライン要素または関数によってマーカを指定します．
関数にはリスト種別と各階層の 1 から始まる連番が渡されます．
マーカを表示しない場合，空文字を指定します．

<!-- @extract:style/block-style.ts#ListStyle -->
<!-- @extract:style/block-style.ts#ListMarkerFunction -->

脚注では，区切り線の長さ，線幅，色，およびオフセットを指定できます．
`separatorWidth` には mm 単位の数値または `ratio()` を指定します．

<!-- @extract:style/block-style.ts#FootnoteStyle -->

### 画像，図形，表，および数式

画像では，幅，高さ，配置，および PDF を画像として埋め込む際のページ番号を指定できます．
幅および高さには mm 単位の数値または親要素に対する `ratio()` を指定します．

<!-- @extract:style/block-style.ts#ImageStyle -->

図形では配置と装飾を指定します．

<!-- @extract:style/block-style.ts#ShapeStyle -->

表では，列幅，縦横の罫線，セルのパディング，背景色，およびセル内テキストのスタイルを指定できます．
各プロパティには固定値のほか，行番号または列番号に応じて値を返す関数を指定できます．
列幅では mm 単位の数値，`ratio()`，および `fr()` を混在させられます．

<!-- @extract:style/block-style.ts#TableStyle -->

```ts
table: {
  columnWidths: [ratio(0.4), fr(1), 30],
  background: (rowIndex) => {
    if (rowIndex === 0) {
      return cmyk(0, 0, 0, 10);
    }
    return undefined;
  },
  textStyle: (rowIndex) => {
    return { kerning: rowIndex !== 0 };
  },
},
```

数式ブロックでは，`size` に文字サイズを指定します．

<!-- @extract:style/block-style.ts#MathStyle -->

ボックスおよびフレックスボックスのスタイルについては，[ボックス，フレックスボックス](./box/)を参照してください．

## インラインスタイル

インライン要素のスタイルは，文字スタイルとボックス装飾を組み合わせた `InlineStyle` 型です．
`command` 等のヘルパ関数に直接渡すほか，名前を付けて `DocumentStyle.command` に登録できます．

<!-- @extract:style/style.ts#InlineStyle -->
<!-- @extract:style/style.ts#CommandStyleRecord -->

```ts
import { cmyk, em, fill, type DocumentStyle } from "@minitype/minitype";

const style: Partial<DocumentStyle> = {
  command: {
    emphasis: {
      scale: em(1.1),
      effects: [fill(cmyk(0, 80, 70, 0))],
    },
  },
};
```

## 単位

スタイルで単位の指定がない数値は，原則として mm 単位です．
`Q()`，`H()`，`cm()`，および `pt()` は指定した値を mm に変換します．

| 関数または型 | 用途 |
| --- | --- |
| `Q(value)` | 級を mm に変換します．1 Q は 0.25 mm です． |
| `H(value)` | 歯を mm に変換します．1 H は 0.25 mm です． |
| `cm(value)` | cm を mm に変換します． |
| `pt(value)` | pt を mm に変換します． |
| `em(value)` | 現在の文字サイズに対する比率を表します． |
| `ratio(value)` | 親要素等の基準サイズに対する比率を表します． |
| `fr(value)` | 表の列またはフレックスボックスの残り領域を配分する比率を表します． |

`em()`，`ratio()`，および `fr()` は数値へ即座に変換せず，基準となるサイズが決まる箇所で解決されます．
プロパティごとに受け付ける単位が異なるため，各型定義を確認してください．

```ts
import { Q, em, fr, pt, ratio } from "@minitype/minitype";

const fontSize = Q(12);       // 3 mmです．
const lineHeight = em(1.75);  // 文字サイズの 1.75 倍です．
const imageWidth = ratio(0.8);
const columnWidth = fr(2);
const borderWidth = pt(0.5);
```

## 色

色は `RGB` または `CMYK` で指定します．
`rgb()` は各色成分を 0–255，`cmyk()` は各色成分を 0–100 の範囲で受け取ります．
どちらも省略可能な最後の引数に 0–1 の不透明度を指定できます．

```ts
import { cmyk, hsl, oklch, rgb, withAlpha } from "@minitype/minitype";

const black = cmyk(0, 0, 0, 100);
const red = rgb(255, 0, 0);
const translucentRed = withAlpha(red, 0.5);
const blueFromHsl = hsl(220, 80, 50);
const blueFromOklch = oklch(0.6, 0.15, 250);
```

`hsl()` および `oklch()` は指定された色を RGB に変換します．
`hexToRgb()`，`rgbToHex()`，`cmykToRgb()`，および `rgbToCmyk()` も使用できます．
CMYK と RGB の相互変換は近似です．

線形グラデーションは `linearGradient()` で作成します．
開始点および終了点の座標と，各カラーストップの位置は 0–1 の比率で指定します．

```ts
const gradient = linearGradient(0, 0, 1, 0, [
  { position: 0, color: rgb(255, 255, 255) },
  { position: 1, color: rgb(40, 80, 160) },
]);
```

## 合成フォント

`CharStyle.font` にはフォントキーの代わりに `CompositeFont` を指定できます．
合成フォントは，かな，捨て仮名，長音，欧文および数字，約物，個別の文字等に異なるフォントを割り当てる場合に使用します．

<!-- @extract:style/composite-font.ts#CompositeFontEntry -->
<!-- @extract:style/composite-font.ts#CompositeFont -->

`default` は必須で，ほかの項目に一致しない文字に使用されます．
`sutegana` および `prolongedSound` が省略されている場合には `kana` が，`kana` も省略されている場合には `default` が使用されます．
`chars` はほかのすべての分類より優先され，キーの文字列に含まれる各文字へ同じ設定を適用します．

```ts
import { em, type CompositeFont } from "@minitype/minitype";

const compositeFont: CompositeFont = {
  default: { font: "SourceHanSerifJP-Regular" },
  latin: {
    font: "GaramondPremrPro",
    scale: em(0.88),
    blockOffset: em(-0.05),
  },
  punctuation: { font: "SourceHanSerifJP-Regular" },
  chars: {
    "!?": { font: "SourceHanSansJP-Bold" },
  },
};
```

各項目の `scale` は文字サイズに対する比率，`blockOffset` はブロック方向の位置調整です．

## 文字組みアキ量設定

`TextStyle.space` には，前後する文字クラスの組み合わせごとのアキ量を `TextSpace` で指定します．
アキ量の数値は文字サイズに対する比率であり，`0.25` は四分アキ，`0.5` は二分アキです．

<!-- @extract:typesetting/space.ts#TextSpace -->

文字クラスには，`openingBracket`，`closingBracket`，`comma`，`period`，`middleDot`，`kana`，`sutegana`，`kanji`，`latin`，`math`，`space`，`dividing`，`prolongedSound`，`lineHead`，`lineTail`，および `others` を指定できます．
`fallback` は任意の文字クラスに一致します．

```ts
import { TEXT_SPACE_HALF, type DocumentStyle } from "@minitype/minitype";

const style: Partial<DocumentStyle> = {
  block: {
    paragraph: {
      space: TEXT_SPACE_HALF,
    },
  },
};
```

既定の設定には，約物を全角として扱う `TEXT_SPACE_FULL`，約物を半角として扱う `TEXT_SPACE_HALF`，ならびに行頭および行末の約物だけを半角として扱う `TEXT_SPACE_HEADTAIL_HALF` があります．
`space` を省略した場合には，`TEXT_SPACE_FULL` が使用されます．

独自の設定では，最初のキーに前の文字クラス，次のキーに後の文字クラスを指定します．

```ts
space: {
  kanji: {
    latin: 0.25,
    fallback: 0,
  },
  fallback: {
    openingBracket: 0.5,
    fallback: 0,
  },
},
```

前後の文字クラスが完全に一致する指定，後の文字クラスが `fallback` の指定，前の文字クラスが `fallback` の指定という順に使用されます．
いずれにも一致しない場合，アキ量は 0 です．

## 装飾とエフェクト

`Decoration` は，ボックス，図形，およびインライン要素に共通する装飾です．

<!-- @extract:style/block-style.ts#Decoration -->

`background` と文字の `effects` には，塗り，ストローク，または画像塗りからなる `Effect[]` を指定します．
配列の先頭が最上層，末尾が最下層です．

```ts
import { cmyk, fill, imageFill, linearGradient, rgb, stroke } from "@minitype/minitype";

const effects = [
  stroke(cmyk(0, 0, 0, 100), 0.3),
  fill(
    linearGradient(0, 0, 1, 0, [
      { position: 0, color: rgb(255, 255, 255) },
      { position: 1, color: rgb(120, 160, 220) },
    ]),
  ),
  imageFill("texture.png", "cover", ["middle", "center"]),
];
```

`fill()` および `stroke()` には `{ x, y }` 形式のオフセットを指定できます．
オフセット付きの塗りまたはストロークは，シャドウ等に使用できます．
`imageFill()` のサイズには，画像全体を枠内に収める `"fit"` または枠全体を覆う `"cover"` を指定します．

`underline`，`overline`，および `strikethrough` には，線幅，色，および基準位置からのオフセットを指定します．

```ts
underline: {
  width: 0.3,
  color: cmyk(0, 0, 0, 100),
  offset: 0.5,
},
```

## 罫線

`Border` は，一つの色と複数の線スタイルで構成されます．
通常は罫線ヘルパ関数を使用して作成します．

<!-- @extract:style/block-style.ts#BorderStyle -->
<!-- @extract:style/block-style.ts#Border -->

```ts
solid(0.5, cmyk(0, 0, 0, 100));
double(0.5, cmyk(0, 0, 0, 100));
dashed(0.5, cmyk(0, 0, 0, 100), {
  dashLength: 3,
  gapLength: 2,
});
dotted(0.5, cmyk(0, 0, 0, 100), 1);
```

`solid()` の第 1 引数は線幅です．
`double()` の第 1 引数は各線の幅で，第 3 引数には線間の幅を指定できます．
`dashed()` では破線の長さと間隔，`dotted()` では点の間隔を指定できます．
すべて mm 単位です．

枠線は `Borders` 型として，物理方向または論理方向の各辺に指定します．

```ts
border: logical(
  solid(1, cmyk(0, 0, 0, 100)),
  solid(0.5, cmyk(0, 0, 0, 40)),
),
```

複数の線を組み合わせる場合，`styles` に線と空きを順に指定します．
`enabled: false` の要素は描画されず，線間の空きになります．

```ts
const customBorder = {
  color: cmyk(0, 0, 0, 100),
  styles: [
    { width: 0.5 },
    { width: 1, enabled: false },
    { width: 0.2, dashLength: 1, gapLength: 1 },
  ],
};
```

## スタイルの合成

`mergeDocumentStyle(base, override)` は，二つの `Partial<DocumentStyle>` を合成します．
通常のプロパティは `override` が上書きし，`block` はブロック種別ごと，さらに各スタイルのプロパティごとにマージされます．
既存のスタイルを基に一部だけを変更する場合に使用できます．

```ts
import { mergeDocumentStyle } from "@minitype/minitype";

const printStyle = mergeDocumentStyle(baseStyle, {
  block: {
    paragraph: { size: Q(11) },
    h1: { effects: [fill(cmyk(0, 0, 0, 100))] },
  },
});
```

グループの `style` には，ページサイズを除く文書スタイルの部分集合である `GroupStyle` を指定できます．
グループのスタイルは文書スタイルに重ねて適用されるため，章またはセクションごとに書字方向，パディング，ブロックスタイル等を変更できます．

<!-- @extract:style/style.ts#GroupStyle -->
