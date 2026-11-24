import { SITE } from '../data/site';
import { compares } from '../data/compares';
import { glossary } from '../data/glossary';
import { amazonImage } from '../lib/amazon';
import {
  articles, products, brands, productMap, articleUrl, productUrl, brandUrl, compareSlug,
  productUpdated, compareUpdated, glossaryUpdated, latestDate, LAUNCH,
} from '../lib/data';
import type { Product } from '../lib/types';

const xml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const photo = (p?: Product) => {
  const loc = p && amazonImage(p, 500);
  return loc ? [{ loc, title: p!.name }] : [];
};

// One sitemap for every indexable URL, with product photos (Google image sitemap extension), the
// enthusiastreview.com format. Dates are real: git dates from scripts/page-dates.mjs.
// scripts/submit-indexnow.js reads the built file.
export function GET() {
  const latest = latestDate();
  const pairs = compares.filter(([a, b]) => productMap.has(a) && productMap.has(b));
  const urls: { loc: string; lastmod: string; images?: { loc: string; title: string }[] }[] = [
    { loc: '/', lastmod: latest },
    ...['/best-of/', '/gear/', '/compare/', '/brands/', '/reviews/', '/guides/', '/glossary/', '/tools/', '/sitemap/'].map((loc) => ({ loc, lastmod: latest })),
    ...articles.map((a) => ({ loc: articleUrl(a), lastmod: a.updated, images: (a.picks ?? []).flatMap((pk) => photo(productMap.get(pk.product))) })),
    ...products.map((p) => ({ loc: productUrl(p), lastmod: productUpdated(p), images: photo(p) })),
    ...pairs.map(([a, b]) => ({
      loc: `/compare/${compareSlug(a, b)}/`,
      lastmod: [compareUpdated(), productUpdated(productMap.get(a)!), productUpdated(productMap.get(b)!)].sort().pop()!,
      images: [...photo(productMap.get(a)), ...photo(productMap.get(b))],
    })),
    ...glossary.map((t) => ({ loc: `/glossary/${t.slug}/`, lastmod: glossaryUpdated() })),
    ...brands.map((b) => ({ loc: brandUrl(b), lastmod: latest, images: products.filter((p) => p.brand === b).flatMap(photo) })),
    ...['/tools/generator-wattage-calculator/', '/tools/power-station-runtime-calculator/'].map((loc) => ({ loc, lastmod: LAUNCH })),
    { loc: '/authors/justin-lee/', lastmod: latest },
    ...['/about/', '/how-we-test/', '/editorial-policy/', '/contact/', '/affiliate-disclosure/', '/privacy-policy/', '/terms/'].map((loc) => ({ loc, lastmod: LAUNCH })),
  ];
  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n` +
    urls
      .map((u) => `  <url><loc>${SITE.url}${u.loc}</loc><lastmod>${u.lastmod}</lastmod>${(u.images ?? []).map((i) => `<image:image><image:loc>${xml(i.loc)}</image:loc><image:title>${xml(i.title)}</image:title></image:image>`).join('')}</url>`)
      .join('\n') +
    `\n</urlset>\n`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
