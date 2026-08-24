---
title: ボックス，フレックスボックス
---

本文書では，minitype が扱うボックスおよびフレックスボックスを説明します．

## ボックス

ボックス（`Box`）は子ブロック要素をまとめるコンテナ要素です．
段組，フロート配置，テキストの回り込み，装飾（背景・罫線）を実現するために使用します．

<!-- @extract:lib/block.ts#Box -->

```ts
type BoxStyle = {
  // 段組
  columns: number;          // 段数（既定値：1）
  columnGap: number;        // 段間の幅（mm，既定値：4）
  columnBorder?: Border;    // 段間の罫線
  columnFill: "auto" | "balance"; // 段の高さ揃え方（既定値："auto"）

  // サイズ・配置
  inlineSize?: number | Ratio | Fr; // インライン方向のサイズ（フレックスボックス内での幅）
  blockSize?: number;       // ブロック方向の固定サイズ（mm）
  align?: Align;            // 配置方向（inlineSize 指定時のみ有効）

  // テキスト回り込み
  wrap?: "start" | "end";  // 回り込み方向（inlineSize の指定が必要）
  wrapGap?: number | Partial<Point>; // ボックスとテキストの間隔（mm，x/y 個別指定可）
  overflow?: boolean;       // ページをはみ出しても改ページしない（既定値：false）

  // 段組脚注
  footnoteSpan: "all" | "column"; // 脚注の配置方法（"all": 全段，"column": 各段）

  // 分割
  splitable: boolean;       // 段・ページをまたいで分割可能か（既定値：false）
  paddingOnBreak?: boolean; // 分割時に終端パディングを残すか（既定値：false）

  // 余白
  margin?: Margin;
  padding?: Padding;

  // アキ
  gaps?: Gap[];             // このボックス内のブロック間アキ（文書スタイルを上書き）
  gapRole?: GapBlockType;   // gap 計算時に使用するブロック種別

  // 装飾
  background?: Effect[];    // 背景エフェクト
  border?: Borders;         // 枠線
  borderRadius?: number;    // 角丸の半径（mm）
  openCornerRound?: boolean; // 分割された角に角丸を適用するか（既定値：false）
  openSideBorder?: boolean;  // 分割された辺の枠線を描画するか（既定値：false）
  underline?: Line;         // 下線
  overline?: Line;          // 上線
  strikethrough?: Line;     // 打ち消し線
} & Decoration;
```

### 段組

`columns` に段数を指定すると，子ブロックが多段組でレイアウトされます．

```ts
import { box, p } from "@minitype/minitype";

box([p("段落1..."), p("段落2...")], {
  columns: 2,
  columnGap: 5,
  columnFill: "balance",
});
```

`columnFill: "balance"` を指定すると，ボックスがそのページ内で完結する場合に各段の高さを揃えます．
`"auto"` では順に流し込みます．

段間に罫線を引くには `columnBorder` を使用します．

```ts
import { cmyk, solid } from "@minitype/minitype";

box([/* ... */], {
  columns: 2,
  columnBorder: solid(0.3, cmyk(0, 0, 0, 50)),
});
```

段組時に脚注がある場合，`footnoteSpan` で配置方法を制御できます．
既定値は `"all"` で，全段にまたがってページ下部に配置されます．
`"column"` を指定すると，各段の下部にそれぞれ配置されます．

### 分割制御

ボックスは既定（`splitable: false`）で途中改ページを避け，現在の段に収まらない場合は次の段へ送られます．
`splitable: true` を指定すると，段・ページをまたいで分割されます．
1 段に収まらないボックスは `splitable` の値に関わらず自動的に分割されます．

```ts
box([p("長い内容...")], { splitable: true });
```

分割時に，終端方向のパディングを保持したい場合は `paddingOnBreak: true` を指定します．

### フロート

`float("top", blocks)` または `float("bottom", blocks)` を使用すると，ブロックをページの上端または下端に浮動配置します．
現在のページに配置できない場合は次のページへ持ち越されます．

```ts
import { caption, float, image } from "@minitype/minitype";

float("top", [image("chart.png"), caption("図のキャプション")]);
```

### テキストの回り込み

`inlineSize` を指定してボックスの幅を固定した場合，`align` でページ内の配置方向を指定できます．
`"left"` で左揃え，`"center"` で中央揃え，`"right"` で右揃えになります．

`wrap` を指定すると，ボックスを指定した方向に配置し，後続のテキストをその反対側に回り込ませます．
`wrap` を使用する場合は `inlineSize` の指定が必要です．

- `"start"`：横組ではボックスを左側，縦組では上側に配置します．
- `"end"`：横組ではボックスを右側，縦組では下側に配置します．

```ts
import { box, image, p } from "@minitype/minitype";

box([image("diagram.svg")], {
  inlineSize: ratio(0.4),
  wrap: "end",
  wrapGap: 4,
});
```

`wrapGap` には mm 単位の数値（x・y 両方向に適用），または `{ x: number, y: number }` 形式で方向ごとに指定できます．

`overflow: true` を指定すると，ボックスがページをはみ出しても改ページせずに現在のページに配置します．

### 装飾

ボックスには背景，枠線，角丸，余白を設定できます．

```ts
import { box, cmyk, fill, p, physical, solid } from "@minitype/minitype";

box([p("囲み記事の内容")], {
  padding: physical(4, 6, 4, 6),
  background: [fill(cmyk(0, 0, 0, 5))],
  border: {
    type: "logical",
    blockStart: solid(0.5, cmyk(0, 0, 0, 80)),
    blockEnd: solid(0.5, cmyk(0, 0, 0, 80)),
  },
  borderRadius: 2,
});
```

罫線ヘルパ関数：`solid(幅, 色)`，`double(幅, 色)`，`dashed(幅, 色)`，`dotted(幅, 色)`．

### ブロック間のアキ（gapRole）

`gapRole` を指定すると，ボックス全体を指定したブロック種別として gap 計算に使用します．
たとえば，見出しをボックスで囲む場合に gap が正しく適用されるよう設定できます．

```ts
box([h2("見出し")], { gapRole: "h2" });
```

`gaps` を指定すると，このボックス内のブロック間アキを上書きできます．

### 固定高さ

`blockSize` を指定すると，コンテンツの高さに関わらずボックスのブロック方向サイズを固定します（`box-sizing: border-box` に相当）．
コンテンツがサイズを超えた場合，はみ出した部分は破棄されます．

```ts
box([p("内容...")], { blockSize: 50 }); // 高さを 50 mm に固定
```

## フレックスボックス

フレックスボックス（`Flexbox`）は，複数のボックスをインライン方向（横書きなら横方向）に並べて配置するコンテナ要素です．
フレックスボックスはページをまたぐことができません．

<!-- @extract:lib/block.ts#Flexbox -->

<!-- @extract:style/block-style.ts#FlexboxStyle -->

```ts
import { box, flexbox, p, ratio } from "@minitype/minitype";

flexbox([
  box([p("左カラム（30%）")], { inlineSize: ratio(0.3) }),
  box([p("中カラム（fr(1)）")], { inlineSize: fr(1) }),
  box([p("右カラム（残り）")]),
]);
```

### 幅の計算

親要素の幅が 200 mm のとき，`inlineSize` の計算は以下の通りです．

| 設定 | 結果 |
| --- | --- |
| `[100 mm, なし, なし]` | `100 mm`, `50 mm`, `50 mm` |
| `[ratio(0.6), なし, なし]` | `120 mm`, `40 mm`, `40 mm` |
| `[fr(2), fr(1), なし]` | `[fr] 分配`, `[fr] 分配`, `なし → 残り` |
| `[なし, なし, なし]` | `66.7 mm`, `66.7 mm`, `66.7 mm` |

`inlineSize` を持つボックスの幅が確定した後，残りの幅を `inlineSize` を持たないボックスで均等に分割します．
`fr()` 単位が混在する場合は，`fr` ボックス同士で残り幅を按分します．

### 子ボックスの間隔

`gap` で子ボックス間の間隔を mm 単位で指定します．
既定値は 0 mm です．

### alignItems

`alignItems` で子ボックスの垂直揃えを指定します．

- `"stretch"`（既定値）：最も高いボックスの高さに揃えます．
- `"start"`：各ボックスの上端を揃えます．
