import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";

const rawFiles = import.meta.glob<string>("/src/content/docs/**/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

export const getStaticPaths: GetStaticPaths = async () => {
  const docs = await getCollection("docs");
  return docs.map((entry) => ({
    params: { slug: `${entry.id}.md` },
    props: { id: entry.id },
  }));
};

export const GET: APIRoute = ({ props }) => {
  const content = rawFiles[`/src/content/docs/${props.id}.md`];
  return new Response(content, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
