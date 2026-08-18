---
title: API
---

本文書では，minitype が提供する主要な API を説明します．

## minitype 関数

文書組版のエントリポイントです．

```typescript
export const minitype = (
  groups: Group[],
  style?: Partial<DocumentStyle>,
  options?: MiniTypeOptions
): {
  save(path: string): Promise<string[]>;
  toPdf(): Promise<Uint8Array>;
  toImages(): Promise<Uint8Array[]>;
  getLayout(): Promise<BlockLabel[]>;
  getPageCount(): Promise<number>;
  getDiagnostics(): Promise<Diagnostic[]>;
};

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


#### `getPageCount(): Promise<number>`

組版結果の総ページ数を返します．

```
