import { SITE } from '../data/site';
import { AUTHORS } from '../data/authors';
import {
  GUIDES, PRODUCTS, getProduct, COMPARES, TERMS, BRANDS, guidePath, productPath, comparePath, termPath, brandPath,
  guideUpdated, productUpdated, compareUpdated, glossaryUpdated, latestDate,
} from '../lib/data';

const xml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// One sitemap for every indexable URL, with product photos (Google image sitemap extension). scripts/indexnow-submit.mjs reads the built file.
export function GET() {
  const latest = latestDate();
  const urls: { loc: string; lastmod: string; images?: { loc: string; title: string }[] }[] = [
    { loc: '/', lastmod: latest },
    ...['/best-of/', '/gear/', '/compare/', '/glossary/', '/brands/', '/tools/', '/equivalents/'].map((loc) => ({ loc, lastmod: latest })),
    ...GUIDES.map((g) => ({
      loc: guidePath(g),
      lastmod: guideUpdated(g),
      images: (g.picks ?? []).map((pk) => getProduct(pk.id)).filter((p) => p?.image).map((p) => ({ loc: p!.image!, title: p!.name })),
    })),
    ...PRODUCTS.map((p) => ({ loc: productPath(p), lastmod: productUpdated(p), images: p.image ? [{ loc: p.image, title: p.name }] : [] })),
    ...COMPARES.map((c) => ({ loc: comparePath(c), lastmod: compareUpdated() })),
    ...TERMS.map((t) => ({ loc: termPath(t), lastmod: glossaryUpdated() })),
    ...BRANDS.map((b) => ({ loc: brandPath(b), lastmod: latest })),
    ...['/tools/bottleneck-calculator/', '/tools/psu-calculator/'].map((loc) => ({ loc, lastmod: SITE.updated })),
    ...['/about/', '/how-we-review/', '/contact/', '/disclosure/', '/privacy/'].map((loc) => ({ loc, lastmod: SITE.updated })),
    ...Object.keys(AUTHORS).map((s) => ({ loc: `/authors/${s}/`, lastmod: latest })),
  ];
  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n` +
    urls
      .map((u) => `  <url><loc>${SITE.url}${u.loc}</loc><lastmod>${u.lastmod}</lastmod>${(u.images ?? []).map((i) => `<image:image><image:loc>${xml(i.loc)}</image:loc><image:title>${xml(i.title)}</image:title></image:image>`).join('')}</url>`)
      .join('\n') +
    `\n</urlset>\n`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
