import type { APIRoute } from 'astro';
import { articles, getProduct } from '../lib/data';
import { SITE } from '../data/site';
import { amazonUrl } from '../lib/amazon';
import type { Article } from '../lib/types';

/** Plain-markdown copy of each article for LLM crawlers (linked via rel="alternate" type="text/markdown"). */
export function getStaticPaths() {
  return articles.map((a) => ({ params: { slug: a.slug }, props: { article: a } }));
}

export const GET: APIRoute = ({ props }) => {
  const a = (props as { article: Article }).article;
  const out: string[] = [`# ${a.h1}`, '', `> ${a.metaDescription}`, '', `Source: ${SITE.url}/${a.slug}/ · Updated ${a.updated} · ${SITE.author}`, '', a.intro, ''];
  if (a.quickAnswer) out.push('## Quick answer', '', a.quickAnswer, '');
  a.sections.filter((s) => s.position === 'before').forEach((s) => out.push(`## ${s.heading}`, '', s.body, ''));
  if (a.picks?.length) {
    out.push(`## ${a.picksHeading ?? 'Our picks'}`, '');
    a.picks.forEach((pk, i) => {
      const p = getProduct(pk.product);
      out.push(`### ${i + 1}. ${p.name} (${pk.award})`, '', `Score: ${p.score}/100 · ${p.priceBand} · [Check price](${amazonUrl(p)})`, '', pk.body, '');
    });
  }
  a.sections.filter((s) => s.position !== 'before').forEach((s) => out.push(`## ${s.heading}`, '', s.body, ''));
  if (a.faqs.length) { out.push('## FAQ', ''); a.faqs.forEach((f) => out.push(`### ${f.q}`, '', f.a, '')); }
  out.push('## The Bottom Line', '', a.bottomLine, '');
  return new Response(out.join('\n'), { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
};
