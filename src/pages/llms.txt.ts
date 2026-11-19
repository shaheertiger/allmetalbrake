import type { APIRoute } from 'astro';
import { SITE } from '../data/site';
import { articles } from '../lib/data';
export const GET: APIRoute = () => {
  const lines = [`# ${SITE.name}`, '', `> ${SITE.description}`, '', '## Guides', ...articles.map((a) => `- [${a.h1}](${SITE.url}/${a.slug}.md): ${a.metaDescription}`), '', '## Other', `- [All products](${SITE.url}/gear/)`, `- [How we score](${SITE.url}/how-we-test/)`];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
