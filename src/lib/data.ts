import type { Article, Product } from './types';
import overrides from '../data/amazon-links.json';
import fetchedImages from '../data/product-images.json';
import fetchedAsins from '../data/product-asins.json';
import { CATEGORY_LABELS } from '../data/site';
import { slugify } from './md';

type Override = string | { asin?: string; imageId?: string; url?: string; image?: string };

/** Pull an ASIN out of any Amazon product URL (dp/, gp/product/, amzn links with /dp/). */
export function asinFromUrl(url: string): string | undefined {
  const m = url.match(/(?:\/dp\/|\/gp\/product\/|\/gp\/aw\/d\/|\/exec\/obidos\/asin\/)([A-Z0-9]{10})/i);
  return m ? m[1].toUpperCase() : undefined;
}

/** "https://m.media-amazon.com/images/I/41Txa4w1RXL._SL500_.jpg" → "41Txa4w1RXL" */
export function imageIdFromUrl(url: string | undefined): string | undefined {
  return url?.match(/\/images\/I\/([^._/]+)\./)?.[1];
}

/** Merge Amazon data: Creators API results first, then hand-entered amazon-links.json wins. */
function applyOverride(base: Product): Product {
  let p = base;
  const fa = (fetchedAsins as Record<string, string>)[p.slug];
  const fi = imageIdFromUrl((fetchedImages as Record<string, string>)[p.slug]);
  if (fa || fi) p = { ...p, ...(fa ? { asin: fa } : {}), ...(fi ? { imageId: fi } : {}) };
  const o = (overrides as Record<string, Override>)[p.slug];
  if (!o) return p;
  if (typeof o === 'string') {
    const asin = /^[A-Z0-9]{10}$/i.test(o) ? o.toUpperCase() : asinFromUrl(o);
    return asin ? { ...p, asin } : p;
  }
  const asin = o.asin || (o.url ? asinFromUrl(o.url) : undefined);
  const imageId = o.imageId || imageIdFromUrl((o as { image?: string }).image);
  return { ...p, ...(asin ? { asin } : {}), ...(imageId ? { imageId } : {}) };
}

const TIER_LABELS: Record<number, string> = { 1: 'Budget', 2: 'Mid-range', 3: 'Upper mid-range', 4: 'Premium' };

const productFiles = import.meta.glob<{ default: Product[] }>('../content/products/*.json', { eager: true });
const articleFiles = import.meta.glob<{ default: Article }>('../content/articles/*.json', { eager: true });

export const products: Product[] = Object.values(productFiles)
  .flatMap((m) => m.default)
  .map(applyOverride)
  // No dollar prices are published on this site (prices move too fast to state honestly);
  // the price tier (relative to the category) is shown as a label instead.
  .map((p) => ({ ...p, priceBand: p.priceBand || TIER_LABELS[p.priceTier ?? 0] || 'See current price' }))
  .sort((a, b) => b.score - a.score);

export const productMap = new Map(products.map((p) => [p.slug, p]));

export const articles: Article[] = Object.values(articleFiles)
  .map((m) => m.default)
  .sort((a, b) => a.slug.localeCompare(b.slug));

export const articleMap = new Map(articles.map((a) => [a.slug, a]));

export function getProduct(slug: string): Product {
  const p = productMap.get(slug);
  if (!p) throw new Error(`Unknown product slug: ${slug}`);
  return p;
}

export const brandSlug = (b: string) => slugify(b);

export const brands = [...new Set(products.map((p) => p.brand))].sort((a, b) => a.localeCompare(b));

export function productsByCategory(cat: string) {
  return products.filter((p) => p.category === cat);
}

export function productsByBrand(brand: string) {
  return products.filter((p) => p.brand === brand);
}

/** Articles that feature a product in their picks. */
export function articlesForProduct(slug: string) {
  return articles.filter((a) => a.picks?.some((pk) => pk.product === slug));
}

export function articleUrl(a: Pick<Article, 'slug'>) {
  return `/${a.slug}/`;
}
export const productUrl = (p: Pick<Product, 'slug'>) => `/gear/${p.slug}/`;
export const brandUrl = (brand: string) => `/brands/${brandSlug(brand)}/`;

export function hubLabel(hub: string) {
  if (hub === 'guides') return 'Guides';
  if (hub === 'brands') return 'Brand Reviews';
  return CATEGORY_LABELS[hub] ?? hub;
}

export function readMinutes(a: Article) {
  const text = [a.intro, a.quickAnswer, ...(a.picks ?? []).map((p) => p.body), ...a.sections.map((s) => s.body), ...(a.mistakes ?? []).map((m) => m.body), ...a.faqs.map((f) => f.a), a.bottomLine].join(' ');
  return Math.max(3, Math.round(text.split(/\s+/).length / 230));
}

export function formatDate(d: string) {
  return new Date(d + 'T12:00:00Z').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

/** Compare pairs: [a, b] product slugs, a < b alphabetically. */
export function compareSlug(a: string, b: string) {
  const [x, y] = [a, b].sort();
  return `${x}-vs-${y}`;
}

const SUFFIXES = [
  ' Super Quiet Inverter Generator', ' Remote Start Inverter Generator', ' Portable Inverter Generator', ' Open Frame Inverter Generator',
  ' Dual Fuel Inverter Generator', ' Dual Fuel Portable Generator', ' Inverter Generator', ' Portable Generator', ' Standby Generator', ' Generator',
  ' Portable Power Station', ' Expandable Power Station', ' Lithium Power Station', ' Compact Power Station', ' Power Station',
  ' Manual Transfer Switch Kit', ' Transfer Switch Kit', ' Transfer Switch', ' Power Inlet Box', ' Whole House Surge Protector', ' Surge Protector',
  ' Surge Protective Device', ' Surge Device', ' Fuel Transfer Pump', ' Emergency Crank Weather Radio', ' Battery Backup', ' Solar Panel', ' Power Bank', ' Propane Heater', ' Lantern', ' Weather Alert Radio', ' Radio',
];
/** Shorter product name for titles, e.g. "Honda EU2200i". */
export function shortName(name: string) {
  // Drop trailing model codes in brackets and "with …" feature clauses first.
  let n = name.replace(/\s*\([^)]*\)\s*$/, '').replace(/\s+with\s+.*$/i, '').trim();
  for (const s of SUFFIXES) if (n.endsWith(s) && n.length - s.length > 8) { n = n.slice(0, -s.length); break; }
  // Still long: keep the brand and the model tokens (words containing a digit).
  if (n.length > 32) {
    const words = n.split(' ');
    const model = words.slice(1).filter((w) => /\d/.test(w) && !/-Watt$|^\d[\d,]*W$/i.test(w));
    if (model.length) n = [words[0], ...model].join(' ');
  }
  return n;
}
