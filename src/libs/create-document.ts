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

export const generatePdf = async (
  docId: string,
  title: string,
  api: MinitypeApi,
  options: { headerImagePath: string },
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

  const { headerImagePath } = options;
  const magenta = cmyk(0, 80, 0, 0);

  const [fontReg, fontBold, fontMono, fontSerif, rawMarkdown, headerData] =
    await Promise.all([
      fetch("/fonts/GenInterfaceJP-Regular.ttf").then((r) => r.arrayBuffer()),
      fetch("/fonts/GenInterfaceJP-Bold.ttf").then((r) => r.arrayBuffer()),
      fetch("/fonts/NotoSansMono-Variable.ttf").then((r) => r.arrayBuffer()),
      fetch("/fonts/SourceHanSerifJP-Regular.otf").then((r) => r.arrayBuffer()),
      fetch(`/raw/${docId}.md`).then((r) => r.text()),
      headerImagePath
        ? fetch(headerImagePath).then((r) => r.arrayBuffer())
        : Promise.resolve(null),
    ]);

  const monoFont: CompositeFont = {
    latin: { font: "NotoSansMono-Variable" },
    default: { font: "GenInterfaceJP-Regular" },
  };

  // YAML フロントマターを除去
  const markdown = rawMarkdown.replace(/^---[\s\S]*?---\n*/, "");

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

  const { blocks } = mdString(markdown, {
    h2,
    h3,
    h4,
    code,
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

  const titleEffects = headerImagePath
    ? [
        fill(cmyk(0, 0, 0, 0)),
        fill(cmyk(0, 0, 0, 100, 0.5), { x: 0.5, y: 0.5 }),
      ]
    : [fill(cmyk(0, 0, 0, 100))];

  const titleBlock = box(
    [
      h1([[title]], { effects: titleEffects }),
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
    {
      type: "flow",
      position: "page",
      blockOffset: 0,
      blocks: [rect(210, 60, { background: [imageFill(headerImagePath)] })],
      page: (pageIndex: number) => pageIndex === 0,
      zIndex: -10,
    },
    titleBlock,
    ...(headerImagePath ? [vspace(14)] : []),
    box(bodyBlocks, { columns: 2, columnGap: 8 }),
  ];

  const doc = minitype(
    [{ body }],
    {
      size: pageSize,
      padding: physical(32, horizontal, 22, horizontal),
      block: {
        paragraph: {
          size: paragraphSize,
          lineHeight: em(1.6),
          firstIndent: paragraphSize,
          font: "GenInterfaceJP-Regular",
          effects: [fill(cmyk(0, 0, 0, 100))],
        },
        image: { align: "center", width: 140 },
        h1: {
          size: 8,
          lineHeight: 8 * 1.4,
          font: "GenInterfaceJP-Bold",
          firstIndent: 0,
          kerning: true,
          align: "left",
        },
        h2: {
          size: 4.5,
          font: "GenInterfaceJP-Bold",
          firstIndent: 0,
          kerning: true,
          align: "left",
          headingNumberFormat: () => "",
        },
        h3: {
          size: 4,
          font: "GenInterfaceJP-Bold",
          firstIndent: 0,
          kerning: true,
          align: "left",
          headingNumberFormat: () => "",
        },
        h4: {
          size: 3.5,
          font: "GenInterfaceJP-Bold",
          firstIndent: 0,
          kerning: true,
          align: "left",
          headingNumberFormat: () => "",
        },
        li1: { firstIndent: em(-1), marker: () => "・" },
        li2: { firstIndent: em(-1), marker: () => "・" },
        li3: { firstIndent: em(-1), marker: () => "・" },
        code: {
          lineHeight: em(1.5),
          align: "left",
          font: monoFont,
          firstIndent: 0,
        },
        caption: {
          align: "center",
          firstIndent: 0,
        },
        box: {
          splitable: true,
        },
      },
      command: {
        b: { font: "GenInterfaceJP-Bold" },
        c: { font: monoFont, padding: physical(0) },
      },
      gaps: [
        ["image", "caption", 2],
        ["h1", "paragraph", 0],
        ["h2", "fallback", 4],
        ["h3", "fallback", 2],
        ["h4", "fallback", 0],
        ["paragraph", "paragraph", 1.5],
        ["code", "fallback", 3],
        ["fallback", "h2", 6],
        ["fallback", "h3", 4],
        ["li1", "li1", 1],
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
      ...(headerImagePath && headerData
        ? { browserFiles: [{ path: headerImagePath, data: headerData }] }
        : {}),
    },
  );

  return await doc.toPdf();
};
