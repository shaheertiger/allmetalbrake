import type { Article, Product } from './types';
import overrides from '../data/amazon-links.json';
import fetchedImages from '../data/product-images.json';
import fetchedAsins from '../data/product-asins.json';
import { CATEGORY_LABELS, SCORE_NAME } from '../data/site';
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

// Real last-modified dates from git (scripts/page-dates.mjs, run first in `npm run build`), the
// enthusiastreview.com method: a page's date moves only when its content file really changes.
const gitDates: Record<string, string> =
  Object.values(import.meta.glob<Record<string, string>>('../data/git-dates.json', { eager: true, import: 'default' }))[0] ?? {};
/** Date of the last site-wide content refresh, used when git has no date for a file. */
export const LAUNCH = '2026-11-19';
const gitDate = (key: string) => gitDates[key];

export const articles: Article[] = Object.values(articleFiles)
  .map((m) => m.default)
  .map((a) => {
    const updated = gitDate(`articles/${a.slug}`) ?? a.updated;
    return { ...a, updated, published: a.published > updated ? updated : a.published };
  })
  .sort((a, b) => a.slug.localeCompare(b.slug));

export const productUpdated = (p: Pick<Product, 'category'>) => gitDate(`products/${p.category}`) ?? LAUNCH;
export const compareUpdated = () => gitDate('compares') ?? LAUNCH;
export const glossaryUpdated = () => gitDate('glossary') ?? LAUNCH;
/** Newest content date on the site (home page, hubs, sitemap). */
export const latestDate = () =>
  [LAUNCH, ...articles.map((a) => a.updated), ...products.map(productUpdated), compareUpdated(), glossaryUpdated()].reduce((m, d) => (d > m ? d : m), '');

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

/** "#3 of 29" within its category, by score. */
export function rankOf(p: Product) {
  const list = productsByCategory(p.category);
  return { rank: list.findIndex((x) => x.slug === p.slug) + 1, of: list.length };
}

/** The product category an article belongs to: its hub when that is a category, else its topic, else its picks' category. */
export function topicOf(a: Article): string | undefined {
  if (productsByCategory(a.hub).length) return a.hub;
  if (a.topic) return a.topic;
  const counts = new Map<string, number>();
  for (const pk of a.picks ?? []) { const c = productMap.get(pk.product)?.category; if (c) counts.set(c, (counts.get(c) ?? 0) + 1); }
  return [...counts.entries()].sort((x, y) => y[1] - x[1])[0]?.[0];
}

/** Lower-case the first letter and drop a trailing full stop, for mid-sentence use. */
export const lc = (s: string) => s.replace(/\.$/, '').replace(/^./, (c) => c.toLowerCase());

/** Capitalise the first letter of a Markdown string (skips leading ** or _). */
export const cap = (s: string) => s.replace(/^(\s*[*_]*)([a-z])/, (_m, a, b) => a + b.toUpperCase());

/* ------------------------------------------------------------------ */
/* Answer-first difference headings for comparisons (the              */
/* enthusiastreview.com / best-proteinpowder.com method). Comparison  */
/* pages rank at positions 1-9 with H2s that state the answer         */
/* ("Running watts: the WGen9500DF delivers 1,500 W more"). Built     */
/* from the spec data, so every comparison gets them and they never  */
/* drift from the spec sheet.                                         */
/* ------------------------------------------------------------------ */

type DiffRule = { label: string; topic?: string; more?: string; less?: string; unit?: string };
const GEN_RULES: DiffRule[] = [
  { label: 'Running Watts', more: 'delivers {d} more running watts', unit: 'W' },
  { label: 'Running Watts (Gas / Propane)', topic: 'Running watts', more: 'delivers {d} more running watts on gas', unit: 'W' },
  { label: 'Running / Starting Watts', topic: 'Running watts', more: 'delivers {d} more running watts', unit: 'W' },
  { label: 'Starting Watts', more: 'has {d} more starting watts', unit: 'W' },
  { label: 'Peak Watts (Gas / Propane)', topic: 'Starting watts', more: 'has {d} more starting watts on gas', unit: 'W' },
  { label: 'Run Time at 50% Load', topic: 'Run time', more: 'runs about {d} hour{s} longer at half load', unit: 'hr' },
  { label: 'Run Time', more: 'runs about {d} hour{s} longer', unit: 'hr' },
  { label: 'Rated Noise', topic: 'Noise', less: 'is rated {d} dBA quieter', unit: 'dBA' },
  { label: 'Weight', less: 'is {d} lb lighter', unit: 'lb' },
];
const BATTERY_RULES: DiffRule[] = [
  { label: 'Battery', topic: 'Capacity', more: 'stores {d} Wh more', unit: 'Wh' },
  { label: 'AC Output', more: 'puts out {d} W more continuous AC', unit: 'W' },
  { label: 'Continuous Power', more: 'delivers {d} W more continuous power', unit: 'W' },
  { label: 'Solar Input', more: 'takes {d} W more solar', unit: 'W' },
  { label: 'AC Recharge', topic: 'Wall charging', more: 'charges from the wall at {d} W more', unit: 'W' },
  { label: 'Weight', less: 'is {d} lb lighter', unit: 'lb' },
  { label: 'Warranty', more: 'has a {d}-year longer warranty', unit: 'year' },
];
const DIFF_RULES: Record<string, DiffRule[]> = {
  generator: GEN_RULES,
  'dual-fuel': GEN_RULES,
  inverter: GEN_RULES,
  'camping-rv': GEN_RULES,
  'power-station': BATTERY_RULES,
  'home-battery': BATTERY_RULES,
  solar: [
    { label: 'Rated Power', more: 'is rated {d} W higher', unit: 'W' },
    { label: 'Weight', less: 'is {d} lb lighter', unit: 'lb' },
  ],
  'power-bank': [
    { label: 'Battery', topic: 'Capacity', more: 'holds {d} mAh more', unit: 'mAh' },
    { label: 'Max Output', more: 'puts out {d} W more', unit: 'W' },
  ],
  'power-inverter': [
    { label: 'Continuous Power', more: 'delivers {d} W more continuous power', unit: 'W' },
    { label: 'Peak Power', more: 'has {d} W more surge', unit: 'W' },
  ],
  ups: [
    { label: 'Capacity', more: 'is rated {d} VA higher', unit: 'VA' },
    { label: 'Weight', less: 'is {d} lb lighter', unit: 'lb' },
  ],
  cpap: [{ label: 'Battery', topic: 'Capacity', more: 'stores {d} Wh more', unit: 'Wh' }],
  'transfer-switch': [
    { label: 'Amp Rating', more: 'is rated {d} A higher', unit: 'A' },
    { label: 'Max Generator Size', more: 'handles a generator {d} W bigger', unit: 'W' },
  ],
  surge: [
    { label: 'Surge Current', more: 'absorbs {d} kA more surge current', unit: 'kA' },
    { label: 'Warranty', more: 'has a {d}-year longer warranty', unit: 'year' },
  ],
  heater: [{ label: 'Heat Output', more: 'puts out {d} BTU more heat', unit: 'BTU' }],
  fan: [
    { label: 'Runtime', more: 'runs about {d} hour{s} longer', unit: 'hr' },
    { label: 'Blade Size', more: 'has a {d}-inch bigger blade', unit: 'in' },
  ],
  lantern: [{ label: 'Brightness', more: 'is {d} lumens brighter', unit: 'lumen' }],
  'fuel-pump': [{ label: 'Flow Rate', more: 'moves {d} GPM more', unit: 'GPM' }],
};

// Unit spellings found in the spec sheets, mapped to the rule's unit.
const UNIT_ALIASES: Record<string, string> = {
  w: 'W', watt: 'W', watts: 'W', wh: 'Wh', kwh: 'kWh', lb: 'lb', lbs: 'lb', pound: 'lb', pounds: 'lb', dba: 'dBA', db: 'dBA',
  hr: 'hr', hrs: 'hr', hour: 'hr', hours: 'hr', h: 'hr', mah: 'mAh', va: 'VA', a: 'A', amp: 'A', amps: 'A', ka: 'kA',
  btu: 'BTU', in: 'in', inch: 'in', inches: 'in', '"': 'in', lumen: 'lumen', lumens: 'lumen', lm: 'lumen', gpm: 'GPM',
  year: 'year', years: 'year', yr: 'year', yrs: 'year',
};

/** First number in a spec value and the unit right after it ("1,800W (3,600W surge)" → 1800 W). */
function specNum(s: string | undefined, unit?: string): number | undefined {
  const m = s?.replace(/(\d),(\d{3})/g, '$1$2').match(/(\d+(?:\.\d+)?)\s*-?\s*([A-Za-z"]+)?/);
  if (!m) return undefined;
  let n = Number(m[1]);
  let u = UNIT_ALIASES[(m[2] ?? '').toLowerCase()];
  if (u === 'kWh' && unit === 'Wh') { n *= 1000; u = 'Wh'; }
  // A different unit than the rule's (mAh vs Wh, minutes vs hours) is not comparable.
  if (unit && u !== unit) return undefined;
  return n;
}
const fmtNum = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 1 });

/** Up to six "<Topic>: the <winner> <difference>" headings, each with both values underneath. */
export function compareDiffs(a: Product, b: Product): { h: string; text: string }[] {
  const out: { h: string; text: string }[] = [];
  const [sa, sb] = [shortName(a.name), shortName(b.name)];
  const sn = (p: Product) => (p === a ? sa : sb);
  const both = (va: string, vb: string) => `${sa}: ${va}. ${sb}: ${vb}.`;

  // No dollar prices on this site, so price is compared by tier.
  if (a.priceTier && b.priceTier && a.priceTier !== b.priceTier) {
    const cheap = a.priceTier < b.priceTier ? a : b;
    out.push({ h: `Price: the ${sn(cheap)} usually costs less`, text: `${both(a.priceBand ?? '', b.priceBand ?? '')} Prices move often with sales and storm season, so check the live listing.` });
  }

  const topics = new Set<string>();
  for (const r of DIFF_RULES[a.category] ?? []) {
    const topic = r.topic ?? r.label;
    if (topics.has(topic.toLowerCase())) continue;
    const [va, vb] = [a.specs[r.label], b.specs[r.label]];
    const [na, nb] = [specNum(va, r.unit), specNum(vb, r.unit)];
    if (na === undefined || nb === undefined || na === nb) continue;
    const d = Math.abs(na - nb);
    // "more" rules credit the higher number; "less" rules credit the lower one.
    const w = r.more ? (na > nb ? a : b) : na < nb ? a : b;
    const phrase = (r.more ?? r.less)!.replace('{d}', fmtNum(d)).replace('{s}', d === 1 ? '' : 's');
    topics.add(topic.toLowerCase());
    out.push({ h: `${topic}: the ${sn(w)} ${phrase}`, text: both(va, vb) });
  }

  if (a.score !== b.score) {
    const w = a.score > b.score ? a : b;
    const l = w === a ? b : a;
    out.push({
      h: `${SCORE_NAME}: the ${sn(w)} scores higher, ${w.score} to ${l.score}`,
      text: `The ${SCORE_NAME} weighs the spec sheet against the price tier and owner reports. A higher score does not make it the right pick for every home; the short answer above says who each one suits.`,
    });
  }
  return out.filter((x) => x.h.length <= 110).slice(0, 6);
}
