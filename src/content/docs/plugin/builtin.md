---
title: 組込みプラグイン
---

本文書では，minitype に組み込まれているプラグインおよびユーティリティ関数を説明します．

## BlockExtender

### 目次（toc）

`toc(options?)` で目次を生成する `BlockExtender` を返します．

```ts
import { minitype, toc } from "@minitype/minitype";

await minitype([
  {
    body: [
      toc({
        showIndex: true,
        fill: "……",
        levelSpaceBefore: { 1: 4 },
      }),
      h1("はじめに"),
    ],
  },
]).save("output.pdf");
```

主なオプション（`TocOptions`）は以下の通りです．

| オプション | 型 | 既定値 | 説明 |
| --- | --- | --- | --- |
| `showIndex` | `boolean` | `false` | 見出し番号を目次に含めるか |
| `fill` | `string \| false` | `"…"` | タイトルとページ番号の間のリーダ文字 |
| `levelStyles` | `Partial<Record<1\|2\|3\|4, Partial<TextStyle>>>` | — | レベル別のスタイル |
| `levelSpaceBefore` | `Partial<Record<1\|2\|3\|4, number>>` | — | レベル別のエントリ前スペース（mm） |
| `filter` | `(level, text) => boolean` | — | 表示する見出しのフィルタ関数 |
| `entry` | `TocEntryMapper` | — | カスタムエントリマッパ（指定時はデフォルトの表記を上書き） |

### 図表一覧（listOf）

図・表・数式・ソースコードの一覧を生成します．

```ts
import { listOfImages, listOfTables } from "@minitype/minitype";

listOfImages();    // 図の一覧
listOfTables();    // 表の一覧
listOfEquations(); // 数式の一覧
listOfCodes();     // ソースコードの一覧
```

主なオプション（`ListOfOptions`）は以下の通りです．

| オプション | 型 | 既定値 | 説明 |
| --- | --- | --- | --- |
| `showIndex` | `boolean` | `false` | 図表番号を一覧に含めるか |
| `fill` | `string \| false` | `"…"` | タイトルとページ番号の間のリーダ文字 |
| `filter` | `(type, text) => boolean` | — | 表示対象のフィルタ関数 |
| `entry` | `ListOfEntryMapper` | — | カスタムエントリマッパ |

汎用の `listOf(options?)` を使用すると，対象種別（`"image"`, `"table"`, `"math"`, `"code"`, `"heading"` 等）を自分で指定できます．

### 用語定義リスト（description）

`description(items, options?)` で用語と説明文を並べた定義リストを生成します．

```ts
import { description, em } from "@minitype/minitype";

description(
  [
    { term: "組版", body: "文字や図版を適切に配置して印刷物を作る作業．" },
    { term: "カーニング", body: "文字間隔を調整する処理．" },
  ],
  { indent: em(5) },
);
```

オプション（`DescriptionOptions`）は以下の通りです．

| オプション | 型 | 既定値 | 説明 |
| --- | --- | --- | --- |
| `indent` | `number \| Em` | `em(4)` | 本文のインデント幅 |
| `space` | `number \| Em` | `em(1)` | 用語と本文の最小間隔 |
| `termBreak` | `boolean` | `false` | `true` にすると用語の直後に改行を入れる |
| `style` | `Partial<TextStyle>` | — | テキストスタイルの上書き |

### 簡易テーブル（easytable）

`easytable(rows, style?)` は各セルに文字列・インライン配列・ブロックを直接渡せる簡易テーブル生成関数です．
`span(content, colspan)` でセル結合を指定します．

```ts
import { easytable, span } from "@minitype/minitype";

easytable([
  ["名前", "年齢", "所属"],
  [span("田中・鈴木", 2), "開発部"],
  ["田中", "30", "開発部"],
  ["鈴木", "28", "開発部"],
]);
```

### 背景画像（backgroundImage）

`backgroundImage(src, options?)` でページ全体に背景画像を配置する `BlockExtender` を生成します．

```ts
import { backgroundImage } from "@minitype/minitype";

backgroundImage("bg.png", { margin: 0, zIndex: -1 });
```

オプション（`BackgroundImageOptions`）は以下の通りです．

| オプション | 型 | 既定値 | 説明 |
| --- | --- | --- | --- |
| `direction` | `"width" \| "height" \| "both"` | `"width"` | サイズを適用する方向（`"both"` はアスペクト比を保持しない） |
| `margin` | `number` | `0` | ページ端からの余白（mm，両側に適用） |
| `page` | `number \| (pageIndex) => boolean` | — | 表示対象ページ |
| `zIndex` | `number` | `-1` | 重ね順序（負の値で本文より背面） |

### 参考文献（bibliography）

BibTeX 形式の参考文献データを読み込み，本文中での引用と参考文献リストを生成します．

```ts
import { createBibliography, readBibtex, ref } from "@minitype/minitype";

const refs = await readBibtex("refs.bib");
const bib = createBibliography(refs);

await minitype([
  {
    body: [
      p([[bib.cite("smith2020"), "によれば..."]]),
      bib.bibliography(),
    ],
  },
]).save("output.pdf");
```

`createBibliography(record)` の戻り値：

| メソッド | 説明 |
| --- | --- |
| `cite(...keys)` | 本文中に引用番号を挿入する `InlineExtender` を生成する |
| `bibliography(options?)` | 引用順にソートした参考文献リストを生成する `BlockExtender` を返す |

BibTeX を読み込まずに参考文献リストを静的に生成する場合は `staticBibliography(record, options?)` を使用します（[PreBlockExtender](#preblockextender) を参照）．

### 索引（createMarkerRegistry）

`createMarkerRegistry()` で任意のマーカを本文中に埋め込み，索引や一覧を生成できます．

```ts
import { createMarkerRegistry } from "@minitype/minitype";

const registry = createMarkerRegistry<string>();

await minitype([
  {
    body: [
      p([[registry.mark("term", "組版"), "について説明する．"]]),
      registry.index(),
    ],
  },
]).save("output.pdf");
```

戻り値のメソッド：

| メソッド | 説明 |
| --- | --- |
| `mark(type, value)` | 文中にマーカを埋め込む `InlineExtender` を生成する |
| `list(options?)` | マーカの出現順一覧を生成する `BlockExtender` を返す |
| `index(options?)` | 索引（`value.term` でグループ化・ソート）を生成する `BlockExtender` を返す |
| `entries(options?)` | 現在の出現情報配列を返す |

## PreBlockExtender

### 図版（figure）

`figure(src, caption, style?)` は画像とキャプションを `Box` にまとめて返します．

```ts
import { figure, ratio } from "@minitype/minitype";

figure("chart.png", "実験結果のグラフ");
figure("chart.png", "実験結果のグラフ", { width: ratio(0.8), align: "center" });
```

`FigureStyle` のプロパティは以下の通りです．

| プロパティ | 型 | 説明 |
| --- | --- | --- |
| `width` | `number \| Ratio` | 図版とキャプションの幅 |
| `captionWidth` | `number \| Ratio` | キャプションのみ幅を上書き |
| `align` | `Align` | 図版とキャプションの配置方向 |
| `captionAlign` | `TextAlign` | キャプションのみ揃え方向を上書き |
| `image` | `Partial<ImageStyle>` | 図版スタイルの個別指定 |
| `caption` | `Partial<TextStyle>` | キャプションスタイルの個別指定 |

### コードブロック（lstlisting）

`lstlisting(source, options?)` で行番号およびタイトルバー付きのコードブロックを生成します．

```ts
import { lstlisting } from "@minitype/minitype";

lstlisting('const x = 42;\nconsole.log(x);', {
  lang: "typescript",
  title: "sample.ts",
});
```

主なオプション（`LstlistingOptions`）は以下の通りです．

| オプション | 型 | 既定値 | 説明 |
| --- | --- | --- | --- |
| `lang` | `string` | — | シンタックスハイライトの言語名 |
| `title` | `string` | — | タイトルバーのテキスト（省略するとタイトルバーなし） |
| `firstLine` | `number` | `1` | 表示を開始するソース行番号（1-based） |
| `lastLine` | `number` | — | 表示を終了するソース行番号（省略時は最終行） |
| `firstDisplayNumber` | `number` | `1` | 最初に表示する行番号（`firstLine` と異なる場合に指定） |
| `showLineNumbers` | `boolean` | `true` | 行番号を表示するか |
| `style` | `LstlistingStyle` | — | 罫線・背景色・フォント等の外観設定 |

ファイルを読み込む場合は `lstinputlisting(filePath, options?)` を使用します（非同期）．

### 静的参考文献（staticBibliography）

BibTeX を読み込まずに参考文献リストを静的に生成します．

```ts
import { staticBibliography } from "@minitype/minitype";

const body = [
  ...(await staticBibliography(refs)),
];
```

### Markdown

Markdown テキストをブロック列に変換します．
詳細は [Markdown プラグイン](./markdown)を参照してください．

## BlockTransformer

### headingTransformer

見出しの先頭に番号を付与します．
デフォルトで自動適用されます（`disableDefaultTransformers: true` で無効化可能）．

デフォルトでは `h2`〜`h4` のみに番号を付与します．
`h1` も含めるには以下のように指定します．

```ts
headingTransformer({ numberedLevels: [1, 2, 3, 4] })
```

番号のフォーマットは `TextStyle.headingNumberFormat` で変更できます．

### captionTransformer

キャプションの先頭に「図1」「表1」等を付与します．
デフォルトで自動適用されます．

### footnoteTransformer

脚注番号を付与します．
デフォルトで自動適用されます．

### mathNumberTransformer

数式ブロックに番号を付与します．
自動適用されないため，必要に応じて `blockTransformers` に追加します．

```ts
import { mathNumberTransformer, minitype } from "@minitype/minitype";

await minitype([{ body }], style, {
  blockTransformers: [mathNumberTransformer],
}).save("output.pdf");
```

## InlineExtender

| エキステンダ | 説明 |
| --- | --- |
| `ref(labelOrId)` | ラベルの参照番号に展開される．リンク付き |
| `autoref(labelOrId)` | 「図1」「ソースコード2」等の種類と番号に展開される．リンク付き |
| `pageref(labelOrId)` | ラベルが存在するページ番号に展開される |
| `page` | 現在のページ番号に展開される |
| `totalPages` | 総ページ数に展開される |
| `fn(label, options?)` | 脚注番号に展開される |
| `marker(before, after)` | リストのマーカ（番号等）に展開される |
| `headingInPage(options?)` | 現在ページに出現した見出しのテキストに展開される（柱として使用） |
| `num(value, options?)` | 数値を整形して挿入する |
| `si(value, unit, options?)` | 数値と SI 単位を整形して挿入する |
| `kenten(inlines, mark?)` | 傍点（圏点）を付与する |
| `bib.cite(...keys)` | 本文中に引用番号を挿入する |
| `registry.mark(type, value)` | 文中にマーカを埋め込む |

### headingInPage

`headingInPage` は，フロー内の柱（ランニングヘッダ）に現在ページの見出しテキストを表示するために使用します．

```ts
import { headingInPage } from "@minitype/minitype";

{
  type: "flow",
  position: "pillar",
  blockOffset: -3,
  blocks: [
    p([[headingInPage({ level: 2, select: "last", fallback: true })]], {
      firstIndent: 0,
    }),
  ],
}
```

オプション：

| オプション | 型 | 既定値 | 説明 |
| --- | --- | --- | --- |
| `level` | `1 \| 2 \| 3 \| 4` | `1` | 取得する見出しのレベル |
| `select` | `"first" \| "last"` | `"last"` | ページ内の最初または最後の見出し |
| `fallback` | `boolean` | `true` | 対象見出しがない場合，直前ページの見出しにフォールバックするか |

### marker

番号付きリストを自前で実装する場合，`marker(before, after)` でリスト番号に展開される InlineExtender を作成できます．

```ts
import { li1, marker } from "@minitype/minitype";

li1([[[marker("(", ")"), " 最初の項目"]]]);
li1([[[marker("(", ")"), " 二番目の項目"]]]);
```

### 数値・SI 単位（num / si）

`num` と `si` で数値と SI 単位の組み合わせを整形して挿入します．
指数部は上付き文字で表示されます．

```ts
import { num, si } from "@minitype/minitype";

p([[si(3.14e-6, "m"), "の幅"]]);   // → "3.14×10⁻⁶ m"
p([[num(12345.678)]]);             // → "12345.678"（整形された数値）
```

### 圏点（kenten）

`kenten(inlines, mark?)` で傍点（圏点）を付与します．

```ts
import { kenten } from "@minitype/minitype";

p([[kenten("重要な語句")]]);       // 黒丸の圏点
p([[kenten("語句", "sesame")]]);   // ごま点
p([[kenten("語句", "＊")]]);       // 任意の文字
```

`mark` には `"bullet"`（黒丸，既定値），`"sesame"`（ごま），`"circle"`（白丸），`"triangle"` 等のプリセット名，または任意の 1 文字を指定できます．

### 参考文献引用（cite）

`bib.cite(...keys)` で本文中に引用番号を挿入します．
`createBibliography` の戻り値から取得します．
詳細は [参考文献（bibliography）](#参考文献bibliography) を参照してください．

```ts
p([[bib.cite("smith2020"), "によれば..."]]);
```

## フロー制御（PageFilter）

フロー（柱・ノンブル）の表示対象ページを絞り込む `PageFilter` を返す関数です．
`Flow.page` プロパティに指定します．

| 関数 | 説明 |
| --- | --- |
| `skipOnHeading(options?)` | 指定レベルの見出しがあるページでフローを非表示にする |
| `showOnHeading(options?)` | 指定レベルの見出しがあるページのみフローを表示する |
| `skipOnOddPages()` | 奇数ページでフローを非表示にする |
| `skipOnEvenPages()` | 偶数ページでフローを非表示にする |

```ts
import { headingInPage, skipOnHeading } from "@minitype/minitype";

// h1 があるページ（章扉等）では柱を非表示にする
{
  type: "flow",
  position: "pillar",
  blockOffset: -3,
  page: skipOnHeading({ level: 1 }),
  blocks: [p([[headingInPage()]], { firstIndent: 0 })],
}
```
