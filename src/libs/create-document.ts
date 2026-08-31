import type * as MinitypeModule from "@minitype/minitype";
import type {
  Block,
  Body,
  CompositeFont,
  InlineOrExtender,
  MarkdownMapping,
  Text,
} from "@minitype/minitype";

export type MinitypeApi = typeof MinitypeModule;

export interface PdfOptions {
  fontReg: ArrayBuffer;
  fontBold: ArrayBuffer;
  fontMono: ArrayBuffer;
  fontSerif: ArrayBuffer;
  /** ブラウザ："/quick-start/header.jpg"，Node.js：絶対パス */
  headerImagePath: string | null;
  /** ブラウザ用：フェッチ済みのヘッダー画像データ */
  headerImageData?: ArrayBuffer | null;
  /** ブラウザ用：Markdown 内ローカル画像のフェッチ済みデータ */
  localImages?: { path: string; data: ArrayBuffer }[];
}

/**
 * YAML フロントマター除去 + Zenn 形式 → minitype 形式の前処理を行う．
 */
export const preprocessMarkdown = (rawMarkdown: string): string => {
  const stripped = rawMarkdown.replace(/^---[\s\S]*?---\n*/, "");

  // ![alt](url)\n_caption_ → ![alt](url "caption")
  let processed = stripped.replace(
    /!\[([^\]]*)\]\(([^)\s"]+)\)\s*\n\s*_([^_\n]+)_/g,
    (_, alt: string, url: string, caption: string) =>
      `![${alt}](${url} "${caption.replace(/"/g, '\\"')}")`,
  );

  // <sup>[\[N\]](#fn-ID)</sup> → [^fn-ID]
  processed = processed.replace(
    /<sup>\[\\?\[(\d+)\\?\]\]\(#(fn-[^)]+)\)<\/sup>/g,
    (_, _num: string, id: string) => `[^${id}]`,
  );

  // N.  content [↩︎](#fnref-ID) → [^fn-ID]: content
  processed = processed.replace(
    /^(\d+)\.\s+(.*?)\s+\[↩︎\]\(#fnref-([^)]+)\)\s*$/gm,
    (_, _num: string, content: string, id: string) =>
      `[^fn-${id}]: ${content.trim()}`,
  );

  // 「脚注」見出し段落を除去
  processed = processed.replace(/^脚注\s*$/gm, "");

  // Markdown バックスラッシュエスケープを解除（例：\_ → _）
  processed = processed.replace(
    /\\([!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~])/g,
    "$1",
  );

  return processed;
};

export const generatePdf = async (
  title: string,
  markdown: string,
  api: MinitypeApi,
  options: PdfOptions,
): Promise<Uint8Array> => {
  const {
    minitype,
    mdString,
    box,
    cmyk,
    em,
    fill,
    float,
    figure,
    h1,
    image,
    imageFill,
    p,
    pageSizeToSize,
    physical,
    Q,
    ratio,
    solid,
    page,
    rect,
    vspace,
  } = api;

  const {
    fontReg,
    fontBold,
    fontMono,
    fontSerif,
    headerImagePath,
    headerImageData,
    localImages = [],
  } = options;

  const magenta = cmyk(0, 80, 0, 0);

  const monoFont: CompositeFont = {
    latin: { font: "NotoSansMono-Variable" },
    default: { font: "GenInterfaceJP-Regular" },
  };

  const h2 = (inlines: InlineOrExtender[]) => ({
    type: "box",
    blocks: [
      {
        type: "text",
        textType: "h2",
        lines: [inlines],
        style: {
          effects: [
            fill(cmyk(0, 0, 0, 0)),
            fill(cmyk(0, 0, 0, 100, 0.2), { x: 0.5, y: 0.5 }),
          ],
        },
      },
    ],
    style: {
      gapRole: "h2",
      padding: physical(3, 4),
      background: [fill(magenta)],
      borderRadius: 2,
    },
  });

  const h3 = (inlines: InlineOrExtender[]) => ({
    type: "box",
    blocks: [{ type: "text", textType: "h3", lines: [inlines] }],
    style: {
      gapRole: "h3",
      padding: physical(2, 0, 2, 4),
      border: { type: "physical", left: solid(1, magenta) },
    },
  });

  const h4 = (inlines: InlineOrExtender[]) => ({
    type: "text",
    textType: "h4",
    lines: [inlines],
  });

  const code = (codeStr: string, lang: string) => ({
    type: "box",
    blocks: [
      {
        type: "code",
        lines: codeStr.split("\n"),
        lang: lang || undefined,
      },
    ],
    style: {
      padding: physical(4, 6),
      borderRadius: 2,
      background: [fill(cmyk(0, 5, 0, 0))],
    },
  });

  const imageMapper = (
    src: string,
    _alt: string,
    imageTitle: string | null,
  ): Block | Block[] => {
    // figure() が「図 N：」を自動付与するため，元テキストの「図N：」プレフィックスを除去
    const normalizedTitle = imageTitle
      ? imageTitle.replace(/^図\s*\d+[：]\s*/, "")
      : null;
    const figureBlock = normalizedTitle
      ? figure(src, normalizedTitle, { align: "center", width: ratio(1) })
      : image(src, { align: "center", width: ratio(1) });
    return float("top", [figureBlock]);
  };

  const { blocks } = mdString(markdown, {
    h2,
    h3,
    h4,
    code,
    image: imageMapper,
  } as MarkdownMapping);

  // タイトル直下に表示するリード段落（最初の見出しより前の段落）を抽出
  const leadParagraphs: Text[] = [];
  let splitIndex = 0;

  for (const block of blocks) {
    const b = block as { type?: string; textType?: string };
    if (b.type === "text" && b.textType === "paragraph") {
      leadParagraphs.push(
        p((b as Text).lines, {
          size: Q(13),
          firstIndent: 0,
          effects: [fill(cmyk(0, 0, 0, 0))],
        }),
      );
      splitIndex++;
    } else {
      break;
    }
  }
  const bodyBlocks = blocks.slice(splitIndex);

  const pageSize = "B5";
  const { width } = pageSizeToSize(pageSize);
  const paragraphSize = Q(11);
  const columnWidth = paragraphSize * 25;
  const horizontal = (width - columnWidth * 2 - 8) / 2;

  // ヘッダー画像 rect の高さをタイトル・リード段落の推定高さに合わせて計算
  // 全角: fontSize 幅，半角: fontSize * 0.5 幅 として描画幅を推定
  const estimateStringWidth = (text: string, fontSize: number): number => {
    return [...text].reduce(
      (sum, char) =>
        sum + ((char.codePointAt(0) ?? 0) > 0x7f ? fontSize : fontSize * 0.5),
      0,
    );
  };

  const contentWidth = columnWidth * 2 + 8;
  const h1Size = 8;
  const titleLineCount = Math.ceil(
    estimateStringWidth(title, h1Size) / contentWidth,
  );
  const h1VspaceSize = 2;
  const titleHeight = titleLineCount * (h1Size * 1.3) + h1VspaceSize;

  const titleEffects = headerImagePath
    ? [
        fill(cmyk(0, 0, 0, 0)),
        fill(cmyk(0, 0, 0, 100, 0.5), { x: 0.5, y: 0.5 }),
      ]
    : [fill(cmyk(0, 0, 0, 100))];

  const titleBlock = box(
    [
      h1([[title]], { effects: titleEffects }),
      vspace(h1VspaceSize),
      ...(leadParagraphs.length > 0 ? leadParagraphs : []),
    ],
    {
      margin: physical(0, 0, 2, 0),
      padding: physical(0, 0, 4, 0),
      border: {
        type: "physical",
        bottom: solid(0.2, headerImagePath ? cmyk(0, 0, 0, 0) : magenta),
      },
    },
  );

  /**
   * minitype のインラインからプレーンテキストを再帰的に抽出する．
   */
  const extractInlineText = (inline: unknown): string => {
    if (typeof inline === "string") {
      return inline;
    }
    if (Array.isArray(inline)) {
      return inline.map(extractInlineText).join("");
    }
    if (inline && typeof inline === "object") {
      const obj = inline as Record<string, unknown>;
      const child = obj.content ?? obj.children ?? obj.text ?? obj.lines;
      if (child) {
        return extractInlineText(child);
      }
    }
    return "";
  };

  const leadSize = Q(13);

  // 実際に白テキストとして描画されるリード段落ブロック（先頭 splitIndex 個）から
  // テキストを抽出して高さを推定する
  const leadHeight = blocks.slice(0, splitIndex).reduce((sum, block, i) => {
    const b = block as { lines?: unknown[] };
    const text = (b.lines ?? []).map(extractInlineText).join("");
    const lineCount = Math.ceil(
      estimateStringWidth(text, leadSize) / contentWidth,
    );
    return sum + lineCount * (leadSize * 1.6) + (i > 0 ? 1.5 : 0);
  }, 0);

  const pagePaddingTop = 32;
  const titleBoxBottomPadding = 4;
  const headerRectHeight =
    pagePaddingTop + titleHeight + leadHeight + titleBoxBottomPadding + 7;

  const headerImageFlow: Body = headerImagePath
    ? [
        {
          type: "flow",
          position: "page",
          blockOffset: 0,
          blocks: [
            rect(210, headerRectHeight, {
              background: [imageFill(headerImagePath)],
            }),
          ],
          page: (pageIndex: number) => pageIndex === 0,
          zIndex: -10,
        },
      ]
    : [];

  const body: Body = [
    {
      type: "flow",
      position: "pillar",
      blockOffset: -12,
      blocks: [
        {
          type: "box",
          blocks: [
            p([[`minitype ${title}`]], {
              size: 3,
              align: "right",
              firstIndent: 0,
            }),
          ],
          style: {
            padding: physical(0, 0, 2, 0),
            border: {
              type: "physical",
              bottom: solid(0.2, cmyk(0, 20, 0, 10)),
            },
          },
        },
      ],
      page: (pageIndex: number) => pageIndex >= 1,
    },
    {
      type: "flow",
      position: "nombre",
      blockOffset: 4,
      blocks: [p([[page]], { size: 3, align: "center", firstIndent: 0 })],
    },
    ...headerImageFlow,
    titleBlock,
    ...(headerImagePath ? [vspace(14)] : []),
    box(bodyBlocks, {
      columns: 2,
      columnGap: 8,
      footnoteSpan: "column",
    }),
  ];

  const doc = minitype(
    [{ body }],
    {
      size: pageSize,
      padding: physical(pagePaddingTop, horizontal, 22, horizontal),
      block: {
        paragraph: {
          size: paragraphSize,
          lineHeight: em(1.6),
          firstIndent: em(1),
          font: "GenInterfaceJP-Regular",
          effects: [fill(cmyk(0, 0, 0, 100))],
        },
        image: { align: "center", width: 140 },
        h1: {
          size: h1Size,
          lineHeight: em(1.3),
          font: "GenInterfaceJP-Bold",
          kerning: true,
          align: "left",
        },
        h2: {
          size: 4.5,
          font: "GenInterfaceJP-Bold",
          kerning: true,
          align: "left",
          needspace: 10,
          headingNumberFormat: () => "",
        },
        h3: {
          size: 4,
          font: "GenInterfaceJP-Bold",
          kerning: true,
          align: "left",
          needspace: 10,
          headingNumberFormat: () => "",
        },
        h4: {
          size: 3.5,
          font: "GenInterfaceJP-Bold",
          kerning: true,
          align: "left",
          needspace: 10,
          headingNumberFormat: () => "",
        },
        li1: { firstIndent: em(-1), marker: () => "・" },
        li2: { firstIndent: em(-1), marker: () => "・" },
        li3: { firstIndent: em(-1), marker: () => "・" },
        code: {
          lineHeight: em(1.5),
          align: "left",
          font: monoFont,
        },
        caption: {
          align: "center",
        },
        box: {
          splitable: true,
        },
        footnote: {
          size: Q(10),
          lineHeight: em(1.4),
        },
      },
      command: {
        b: { font: "GenInterfaceJP-Bold" },
        c: { font: monoFont, padding: physical(0) },
      },
      gaps: [
        // 見出し
        ["h1", "paragraph", 0],
        ["h2", "fallback", 4],
        ["h3", "fallback", 2],
        ["h4", "fallback", 0],
        ["fallback", "h2", 6],
        ["fallback", "h3", 4],

        // 段落
        ["paragraph", "paragraph", 1.5],

        // リスト
        ["li1", "li1", 1],
        ["li1", "li2", 1],
        ["li2", "li1", 1],
        ["li2", "li2", 1],
        ["li2", "li3", 1],
        ["li3", "li2", 1],
        ["li3", "li3", 1],

        // 画像
        ["image", "caption", 4],
        ["fallback", "figure", 4],
        ["figure", "fallback", 4],

        // コード
        ["code", "fallback", 3],

        // 脚注
        ["footnote", "footnote", 2],
        ["fallback", "footnote", 4],

        // その他
        ["fallback", "fallback", 3],
      ],
    },
    {
      fonts: [
        { fontKey: "GenInterfaceJP-Regular", data: fontReg },
        { fontKey: "GenInterfaceJP-Bold", data: fontBold },
        { fontKey: "NotoSansMono-Variable", data: fontMono },
        { fontKey: "SourceHanSerifJP-Regular", data: fontSerif },
      ],
      browserFiles: [
        ...(headerImagePath && headerImageData
          ? [{ path: headerImagePath, data: headerImageData }]
          : []),
        ...localImages,
      ],
    },
  );

  return await doc.toPdf();
};
