// 段落内の `![alt](url)\n_キャプション_` パターンを <figure>/<figcaption> に変換する remark プラグイン．
import { visit } from "unist-util-visit";

const inlineToHtml = (nodes) => {
  return nodes
    .map((node) => {
      if (node.type === "text") {
        return node.value;
      }
      if (node.type === "emphasis") {
        return `<em>${inlineToHtml(node.children)}</em>`;
      }
      if (node.type === "strong") {
        return `<strong>${inlineToHtml(node.children)}</strong>`;
      }
      if (node.type === "link") {
        return `<a href="${node.url}">${inlineToHtml(node.children)}</a>`;
      }
      if (node.type === "inlineCode") {
        return `<code>${node.value}</code>`;
      }
      return "";
    })
    .join("");
};

const remarkFigureCaption = () => {
  return (tree) => {
    const replacements = [];

    visit(tree, "paragraph", (node, index, parent) => {
      if (!parent) {
        return;
      }
      const { children } = node;

      // image → break → emphasis または image → emphasis の 2 パターンに対応
      let imageNode = null;
      let emphasisNode = null;

      if (
        children.length === 3 &&
        children[0].type === "image" &&
        children[1].type === "break" &&
        children[2].type === "emphasis"
      ) {
        imageNode = children[0];
        emphasisNode = children[2];
      } else if (
        children.length === 2 &&
        children[0].type === "image" &&
        children[1].type === "emphasis"
      ) {
        imageNode = children[0];
        emphasisNode = children[1];
      }

      if (!imageNode || !emphasisNode) {
        return;
      }

      const alt = (imageNode.alt ?? "").replace(/"/g, "&quot;");
      const caption = inlineToHtml(emphasisNode.children);
      const html = `<figure>\n<img src="${imageNode.url}" alt="${alt}" />\n<figcaption>${caption}</figcaption>\n</figure>`;

      replacements.push({ parent, index, html });
    });

    for (const { parent, index, html } of replacements.reverse()) {
      parent.children.splice(index, 1, { type: "html", value: html });
    }
  };
};

export default remarkFigureCaption;
