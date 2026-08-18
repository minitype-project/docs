---
title: インライン要素
caution:
  - ヘルパ関数がある場合，「ヘルパ関数として `foo()` が用意されています」と記載した後，その利用例のコードブロックを示してください．
  - "`src/lib/inline-helper.ts` に定義されるインラインヘルパがすべて記載されていることを確認してください．"
---

本文書では，インライン要素の種類および使い方について説明します．
インライン要素とは，ブロック要素の `lines` フィールドに格納されるテキストレベルの要素を指します．

## インライン要素の型

`InlineOrExtender` は以下の型を用いて表されます．

<!-- @extract:lib/inline.ts#InlineOrExtender -->

## 各インライン要素

### プレーンテキスト（string）

もっとも基本的な要素です．
文字列をそのまま記述します．

### コマンド（Command）

スタイルの変更やリンク等，テキストに付加情報を与えます．

<!-- @extract:lib/inline.ts#Command -->
<!-- @extract:lib/inline.ts#Link -->
<!-- @extract:lib/inline.ts#UrlLink -->
<!-- @extract:lib/inline.ts#DestinationLink -->

`name` に対応するスタイルが `DocumentStyle.command` に定義された場合，そのスタイルが自動的に適用されます．

ヘルパ関数として `command(body, options?)` が用意されています．

```ts
const style = {
  command: {
    red: { effects: [fill(cmyk(0, 100, 100, 0))] },
  },
};

p([["ここだけ", command(["赤字"], { name: "red" }), "にて表記される"]]);
```

### 強制改行（ForceBreak）

挿入位置で強制的に改行します．
両端揃えが指定された場合，直前の行は両端揃えとなります．

<!-- @extract:lib/inline.ts#ForceBreak -->

ヘルパ関数として，`fbr()` が用意されています．

```ts
p([["1 行目", fbr(), "2 行目"]]);
```

### カーニング（Kerning）

隣接する文字間の間隔を調整します．

<!-- @extract:lib/inline.ts#Kerning -->

ヘルパ関数として `kern(em)` が用意されています．

```ts
p([["「", kern(-0.25), "括弧内のテキスト", kern(-0.25), "」"]]);
```

### 行分割禁止（NoBreak）

挿入位置の前後での行分割を禁止します．

<!-- @extract:lib/inline.ts#NoBreak -->

ヘルパ関数として `noBreak()` が用意されています．

```ts
p([["分割を", noBreak(), "禁止するテキスト"]]);
```

### 分離禁止（NoSplit）

挿入位置の前後での行分割およびトラッキング挿入を禁止します．

<!-- @extract:lib/inline.ts#NoSplit -->

ヘルパ関数として `noSplit()` が用意されています．

```ts
p([["分離を", noSplit(), "禁止するテキスト"]]);
```

### インライングラフィック（InlineGraphic）

テキスト行の中に画像を埋め込みます．
PNG，JPG，SVG，および PDF に対応します．

<!-- @extract:lib/inline.ts#InlineGraphic -->

ヘルパ関数として `inlineGraphic(src, options?)` が用意されています．

```ts
p([["テキスト中に", inlineGraphic("icon.png", { size: em(1) }), "アイコンを挿入"]]);
```

### インライン数式（InlineMath）

テキスト行の中に LaTeX のインライン数式を埋め込みます．

<!-- @extract:lib/inline.ts#InlineMath -->

ヘルパ関数として `inlineMath(latex, size?)` が用意されています．

```ts
p([["アインシュタインの式 ", inlineMath("E=mc^2"), " は有名です．"]]);
```

### 水平ボックス（Hbox）

指定した幅の水平ボックスを作成します．
タブを設定したり，コンテンツを指定幅に収めたり，リーダ（……）を作成したりする場合に使用します．

<!-- @extract:lib/inline.ts#Hbox -->

ヘルパ関数として `hbox(width, bodyOrFill, options?)` が用意されています．

```ts
// 目次のリーダ
hbox(fr(1), "……")  // 残り幅をリーダで埋める

// 固定幅ボックス
hbox(30, ["左寄せの内容"])
hbox(30, ["右寄せの内容"], { align: "right" })
```

`HboxPlus` は `plus(a, b)`，`HboxMax` は `max(a, b)` ヘルパ関数で作成する複合サイズ型です．

### ルビ（Ruby）

親文字にルビを付与します．

<!-- @extract:lib/inline.ts#Ruby -->

ヘルパ関数として `ruby(base, ruby)` および `ruby(...pairs)` が用意されています．
`ruby(...pairs)` には複数のペアを指定できます．

```ts
ruby("薔薇", "ばら")                    // 単一のルビ
ruby("薔", "ば", "薇", "ら")            // 文字ごとにルビを付ける（Ruby[] を返す）
```

### CID 直接指定（Cid）

フォントの CID（Character ID）を直接指定して文字を出力します．

<!-- @extract:lib/inline.ts#Cid -->

ヘルパ関数として `cid(id)` が用意されています．

```ts
// Adobe-Japan 1-* に準拠したフォントでは「あ」が表示される
p([["CID で指定した文字：", cid(843)]]);
```

## ヘルパ関数

上記のほかにも，頻繁に使用される表現を簡単に作成するヘルパ関数が用意されています．

| 関数 | 説明 |
| --- | --- |
| `color(body, color)` | 文字色を設定した `Command` を作成する． |
| `fontSize(body, size)` | 文字サイズ（mm）を設定した `Command` を作成する． |
| `scale(body, em)` | 相対スケールを設定した `Command` を作成する． |
| `blockOffset(body, offset)` | ブロック方向のオフセットを設定した `Command` を作成する． |
| `b(body)` | 太字の `Command` を作成する． |
| `sup(body)` | 上付き文字の `Command` を作成する． |
| `sub(body)` | 下付き文字の `Command` を作成する． |
| `u(body)` | 下線付き `Command` を作成する． |
| `overline(body, line)` | 上線付き `Command` を作成する． |
| `del(body)` | 取り消し線付き `Command` を作成する． |
| `url(href, body?)` | URL リンク付き `Command` を作成する． |

### タグ付きテンプレートリテラル

`il` タグを使うと，タグ付きテンプレートリテラルを用いて `InlineOrExtender[]` を作成できます．
したがって，文字列表現の中に自然にヘルパ関数を埋め込むことが出来ます．
`ils` タグは `\n` を行区切りとして `InlineOrExtender[][]` を作成します．

```ts
import { il, ils, kern } from "minitype";

const inline: InlineOrExtender[] = il`「${kern(-0.25)}テキスト${kern(-0.25)}」`;

const lines: InlineOrExtender[][] = ils`1行目\n${kern(-0.25)}2行目`;
```

インラインエキステンダ（`InlineExtender`）については，[プラグイン](../plugin/plugin#inlineextender)を参照してください．
