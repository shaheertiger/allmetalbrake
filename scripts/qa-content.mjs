// Content QA: banned phrases, unknown link targets, comparison specs coverage, title/meta lengths.
import { readFileSync, readdirSync } from 'node:fs';
const root = new URL('../', import.meta.url).pathname;
const prods = readdirSync(root + 'src/content/products').flatMap((f) => JSON.parse(readFileSync(root + 'src/content/products/' + f, 'utf8')));
const pmap = new Map(prods.map((p) => [p.slug, p]));
const arts = readdirSync(root + 'src/content/articles').map((f) => JSON.parse(readFileSync(root + 'src/content/articles/' + f, 'utf8')));
const slug = (s) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const brands = new Set(prods.map((p) => slug(p.brand)));
const banned = /\b(we tested|in our testing|our testing|we measured|our lab|look no further|elevate your|immersive journey|in today's world)\b/i;
const out = [];
const kw = new Map();
for (const a of arts) { const k = a.keyword.toLowerCase(); if (kw.has(k)) out.push(`article ${a.slug}: keyword "${k}" already targeted by ${kw.get(k)}`); kw.set(k, a.slug); }
const scan = (where, text) => {
  if (!text) return;
  const b = text.match(banned); if (b) out.push(`${where}: banned phrase "${b[0]}"`);
  for (const m of text.matchAll(/\]\((\/[^)\s#]*)/g)) {
    const u = m[1];
    let mm;
    if ((mm = u.match(/^\/gear\/([^/]+)\/$/)) && !pmap.has(mm[1])) out.push(`${where}: unknown product link ${u}`);
    if ((mm = u.match(/^\/brands\/([^/]+)\/$/)) && !brands.has(mm[1])) out.push(`${where}: unknown brand link ${u}`);
    if (!u.endsWith('/')) out.push(`${where}: link without trailing slash ${u}`);
  }
};
for (const p of prods) { scan(`product ${p.slug}`, p.verdict); (p.faqs ?? []).forEach((f) => scan(`product ${p.slug} faq`, f.a)); }
for (const a of arts) {
  const w = `article ${a.slug}`;
  if (a.title.length > 65) out.push(`${w}: title ${a.title.length} chars`);
  if (a.metaDescription.length > 160 || a.metaDescription.length < 110) out.push(`${w}: meta ${a.metaDescription.length} chars`);
  [a.intro, a.quickAnswer, a.bottomLine, ...(a.picks ?? []).map((p) => p.body), ...a.sections.map((s) => s.body), ...(a.mistakes ?? []).map((m) => m.body), ...a.faqs.map((f) => f.a)].forEach((t) => scan(w, t));
  for (const pk of a.picks ?? []) if (!pmap.has(pk.product)) out.push(`${w}: unknown pick ${pk.product}`);
  for (const k of a.comparisonSpecs ?? []) {
    const missing = (a.picks ?? []).filter((pk) => pmap.get(pk.product) && !pmap.get(pk.product).specs[k]).length;
    if (missing > (a.picks?.length ?? 0) / 2) out.push(`${w}: comparison spec "${k}" missing on ${missing}/${a.picks.length} picks`);
  }
  if (a.brand && !prods.some((p) => p.brand === a.brand)) out.push(`${w}: brand "${a.brand}" matches no products`);
  // Proven-format gates (docs/CONTENT_GUIDE.md, docs/bing-playbook.md).
  if (a.title.length < 50) out.push(`${w}: title ${a.title.length} chars (min 50)`);
  if (a.kind !== 'guide' && !/\b20\d\d\b/.test(a.title)) out.push(`${w}: roundup/review title has no year`);
  if (/\btested\b/i.test(a.title + ' ' + a.metaDescription + ' ' + a.h1)) out.push(`${w}: "tested" in title, meta or H1`);
  if ((a.mistakes ?? []).length !== 5) out.push(`${w}: ${(a.mistakes ?? []).length} mistakes (need 5)`);
  if (a.faqs.length < 7) out.push(`${w}: ${a.faqs.length} FAQs (need 7)`);
  if ((a.related ?? []).length < 2) out.push(`${w}: fewer than 2 related articles`);
  if (/^\d+\.\s/.test(a.sections.map((x) => x.heading).join('\n'))) out.push(`${w}: section heading starts with a number`);
  const words = [a.intro, a.quickAnswer, a.bottomLine, ...(a.picks ?? []).map((p) => p.body), ...a.sections.map((x) => x.body), ...(a.mistakes ?? []).map((m) => m.body), ...a.faqs.map((f) => f.a)].join(' ').split(/\s+/).filter(Boolean).length;
  if (words < 2500) out.push(`${w}: ${words} words (min 2,500)`);
  for (const r of a.related ?? []) if (!arts.some((x) => x.slug === r)) out.push(`${w}: related slug ${r} does not exist`);
}
console.log(`${prods.length} products, ${arts.length} articles`);
out.forEach((o) => console.log(' - ' + o));
console.log(out.length ? `${out.length} issues` : 'No issues');
if (out.length) process.exit(1);
