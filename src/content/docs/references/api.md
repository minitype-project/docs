---
title: API
---

本文書では，minitype が提供する主要な API を説明します．

## minitype(groups, style, options)

文書組版のエントリポイントです．

<!-- @extract:../dist/main.d.ts#minitype -->

| プロパティ | 説明 |
| --- | --- |
| `groups` | グループの配列（文書の内容）． |
| `style` | ドキュメントスタイル（省略可能）． |
| `options` | オプション設定（`MiniTypeOptions`）． |

### MiniTypeOptions

<!-- @extract:main.ts#MiniTypeOptions -->

| プロパティ | 説明 |
| --- | --- |
| `outline` | PDF のアウトライン（しおり）を生成するか．true の場合生成する． |
| `metadata` | PDF メタデータ． |
| `ppi` | PNG 出力時の解像度（既定値 `350`）． |
| `blockTransformers` | カスタムブロック変換プラグイン． |
| `disableDefaultTransformers` | デフォルトの Transformer を無効にするか（既定値 `false`）．true の場合無効にする． |
| `fontDir` | フォントファイルのディレクトリ（Node.js，Bun のみ対応）． |
| `fonts` | ブラウザ向けフォントデータ． |
| `browserFiles` | ブラウザ向けファイルデータ． |

### 戻り値のメソッド

#### `save(path)`

PDF または PNG をファイルシステムに保存します（Node.js のみ）．
複数ページの PNG は `$name-$index.png` の形式で保存されます．
保存されたファイルパスの配列を返します．

#### `toPdf()`

組版結果の PDF を `Uint8Array` として返します．

#### `toImages()`

組版結果を PNG の `Uint8Array` 配列として返します．
配列の要素が各ページに対応します．

#### `getLayout()`

組版結果のレイアウト情報をページ出現順で返します．
戻り値である `BlockLabel` には以下のプロパティが含まれます．

<!-- @extract:lib/label.ts#BlockLabel -->
<!-- @extract:lib/label.ts#BlockLabelType -->
<!-- @extract:lib/label.ts#BaseLabel -->
<!-- @extract:lib/label.ts#HeadingBlockLabel -->
<!-- @extract:lib/label.ts#ListBlockLabel -->

| プロパティ | 型 | 説明 |
| --- | --- | --- |
| `type` | `string` | ブロックの種類． |
| `index` | `string \| number \| HeadingIndex` | ブロックの通し番号． |
| `pageIndex` | `number` | 0-based のページ番号． |
| `x`, `y` | `number` | ページ上の座標（mm）． |
| `width`, `height` | `number` | サイズ（mm） ．|
| `id` | `string` | ブロック ID． |
| `label` | `string` | ブロックのラベル． |
| `content` | `string` | テキスト内容またはファイルパス（画像）． |
| `inlines` | `InlineOrExtender[]` | ブロックの内容 |
| `level` | `number` | 見出しレベル（見出しのみ）． |
| `unnumbered` | `boolean` | 見出しに番号を付与しないか．`true` の場合に付与しない． |
| `order` | `number` | リスト番号（リストのみ）． |

#### `getPageCount(): Promise<number>`

組版結果の総ページ数を返します．

#### `getDiagnostics(): Promise<Diagnostic[]>`

組版中に検出された診断情報を返します．
戻り値である `Diagnostic` は以下の型です．

<!-- @extract:lib/diagnostic.ts#Diagnostic -->
<!-- @extract:lib/diagnostic.ts#BaseDiagnostic -->
<!-- @extract:lib/diagnostic.ts#DiagnosticSeverity -->
<!-- @extract:lib/diagnostic.ts#DiagnosticPosition -->
<!-- @extract:lib/diagnostic.ts#MissingCitationDiagnostic -->
<!-- @extract:lib/diagnostic.ts#MissingLabelDiagnostic -->
<!-- @extract:lib/diagnostic.ts#OverfullImageDiagnostic -->
<!-- @extract:lib/diagnostic.ts#OverfullLineDiagnostic -->

| 型 | 説明 |
| --- | --- |
| `MissingLabelDiagnostic` | 未定義のラベルが参照された． |
| `MissingCitationDiagnostic` | 未定義の文献キーが引用された． |
| `OverfullImageDiagnostic` | 図版がサイズを超過した． |
| `OverfullLineDiagnostic` | 行がサイズを超過した． |

## バリデーション

### validateDocument(groups)

グループの配列を受け取り，文書構造を検証します．
AI エージェントが生成した JSON を minitype に渡す前の検証等に利用できます．

<!-- @extract:../dist/validate/index.d.ts#validateDocument -->

<!-- @extract:validate/index.ts#ValidationResult -->
<!-- @extract:validate/index.ts#ValidationError -->

### formatValidationErrors(errors)

`validateDocument` が返したエラー配列を，AI エージェント向けの修正プロンプト文字列に変換します．

<!-- @extract:../dist/validate/index.d.ts#formatValidationErrors -->

### getDocumentJsonSchema()

文書構造の JSON Schema を返します．

<!-- @extract:../dist/lib/json-schema.d.ts#getDocumentJsonSchema -->
