/* ------------------------------------------------------------------ */
/* Content model and loaders. Schema: docs/content-schema.md.          */
/* ------------------------------------------------------------------ */
import { CATEGORIES, CATEGORY } from '../data/categories';
import { SITE } from '../data/site';
import { NICHE, ACRONYMS, PRODUCT_NOUNS, DIFF_RULES, SERIES, SUBJECT_RE, SUBJECT_SKIP, EQUIVALENTS_RE, equivalentsSlug, type Series } from '../data/niche';

export type { Series };
export { SERIES };

export type Spec = [string, string];
export interface FAQ { q: string; a: string }

export interface Product {
  id: string;
  name: string;
  short: string;
  brand: string;
  category: string;
  released?: string;
  /** Street-price band in USD. Products without one show their `tier` instead. */
  price?: [number, number];
  /** Price tier within the category, 1 (budget) to 4 (premium), for products with no `price` band. */
  tier?: 1 | 2 | 3 | 4;
  amazon?: string;
  asin?: string;
  url?: string;
  /** Official Amazon photo, from src/data/catalog.json (scripts/fetch-product-images.mjs). */
  image?: string;
  /** Title of the Amazon listing the photo and direct link come from. */
  listing?: string;
  description: string;
  quick: string;
  bestFor: string;
  skipIf: string;
  specs: Spec[];
  score: { overall: number; parts: [string, number][] };
  verdict: string[];
  pros: string[];
  cons: string[];
  extra?: { heading: string; body?: string[]; steps?: [string, string][] };
  /** "<model> <rival brand> equivalent" answer, linking to the equivalents charts. */
  equivalent?: { heading: string; body: string[] };
  faqs: FAQ[];
}

export interface Pick {
  id: string;
  label: string;
  bestFor?: string;
  skipIf?: string;
  writeup: string[];
  pros?: string[];
  cons?: string[];
}

export interface Table { caption?: string; head: string[]; rows: string[][] }
/** One block of a section written in order: sub-heading, paragraph, list or table. */
export type Block = { h3: string } | { p: string } | { ul: string[] } | { ol: string[] } | { table: Table };

export interface Section {
  h: string;
  body?: string[];
  list?: string[];
  table?: Table;
  /** Ordered blocks; when set, they replace body, list and table. */
  blocks?: Block[];
}

/** Every piece of text in a section, for word counts and term matching. */
export const sectionText = (s: Section): string[] =>
  s.blocks
    ? s.blocks.flatMap((b) => ('h3' in b ? [b.h3] : 'p' in b ? [b.p] : 'ul' in b ? b.ul : 'ol' in b ? b.ol : []))
    : [...(s.body ?? []), ...(s.list ?? [])];

export interface Guide {
  slug: string;
  type: 'roundup' | 'brand' | 'article';
  /** Articles only: how-to, fix, explainer or X vs Y. */
  kind?: 'howto' | 'fix' | 'explainer' | 'versus';
  category: string;
  brand?: string;
  author?: string;
  title: string;
  h1: string;
  query?: string;
  /** Extra search wording for the Article schema `keywords` (variants of `query`). */
  keywords?: string[];
  description: string;
  dek: string;
  intro: string[];
  quickAnswer: string;
  /** Roundups and brand pages. */
  picks?: Pick[];
  tableSpecs?: string[];
  ranking?: { intro: string; criteria: [string, string][]; why?: string };
  /** Articles: the main procedure. */
  steps?: { h: string; body: string[] }[];
  stepsHeading?: string;
  /** Articles: products shown under "Parts mentioned". */
  products?: string[];
  mentions?: { id?: string; name?: string; text: string }[];
  sections: Section[];
  mistakes?: [string, string][];
  bottomLine: string;
  faqs: FAQ[];
  sources: string[];
  related?: string[];
  about?: string[];
  published?: string;
  /** Last content change, used only when git has no date for the file (e.g. a bulk migration). */
  updated?: string;
  noindex?: boolean;
  /** The page reports hands-on testing the site really did (lets the validator accept test wording). */
  tested?: boolean;
}

export interface Compare {
  a: string;
  b: string;
  title: string;
  description: string;
  quick: string;
  differ: [string, string][];
  buyA: string[];
  buyB: string[];
  faqs?: FAQ[];
}

export interface Term {
  id: string;
  term: string;
  title: string;
  short: string;
  body: string[];
  aliases?: string[];
  related?: string[];
  guides?: string[];
}

export interface Brand {
  key: string;
  name: string;
  founded?: string;
  hq?: string;
  blurb: string;
  review?: string;
}

/* ---------------------------- loading ----------------------------- */

const one = <T,>(m: Record<string, unknown>): T | undefined => Object.values(m)[0] as T | undefined;

const productFiles = import.meta.glob('../data/products/*.json', { eager: true, import: 'default' }) as Record<string, Product[]>;
const guideFiles = import.meta.glob('../data/guides/*.json', { eager: true, import: 'default' }) as Record<string, Guide>;
const compareFile = one<Compare[]>(import.meta.glob('../data/compares.json', { eager: true, import: 'default' })) ?? [];
const glossaryFile = one<Term[]>(import.meta.glob('../data/glossary.json', { eager: true, import: 'default' })) ?? [];
const brandFile = one<Record<string, Omit<Brand, 'key'>>>(import.meta.glob('../data/brands.json', { eager: true, import: 'default' })) ?? {};
/** Verified Amazon listings: { id: { asin, image, title, checked } } (scripts/fetch-product-images.mjs). */
const catalogFile = one<Record<string, { asin: string; image: string; title: string; checked?: string }>>(import.meta.glob('../data/catalog.json', { eager: true, import: 'default' })) ?? {};
/** Last real content change per file, from git (scripts/page-dates.mjs). */
const gitDates = one<Record<string, string>>(import.meta.glob('../data/git-dates.json', { eager: true, import: 'default' })) ?? {};

const catOrder = (k: string) => CATEGORIES.findIndex((c) => c.key === k);

export const PRODUCTS: Product[] = Object.values(productFiles)
  .flat()
  .map((p) => {
    const c = catalogFile[p.id];
    // A hand-set asin or url on the product wins; the catalog fills the photo and direct link.
    return c && !p.url && (!p.asin || p.asin === c.asin) ? { ...p, asin: c.asin, image: p.image ?? c.image, listing: c.title } : p;
  })
  .sort((a, b) => catOrder(a.category) - catOrder(b.category) || b.score.overall - a.score.overall || a.name.localeCompare(b.name));
const PRODUCT_BY_ID = new Map(PRODUCTS.map((p) => [p.id, p]));

export const ALL_GUIDES: Guide[] = Object.values(guideFiles).sort((a, b) => catOrder(a.category) - catOrder(b.category) || a.slug.localeCompare(b.slug));
export const GUIDES = ALL_GUIDES.filter((g) => !g.noindex);
const GUIDE_BY_SLUG = new Map(ALL_GUIDES.map((g) => [g.slug, g]));

export const COMPARES: Compare[] = compareFile.filter((c) => PRODUCT_BY_ID.has(c.a) && PRODUCT_BY_ID.has(c.b));
export const TERMS: Term[] = [...glossaryFile].sort((a, b) => a.term.localeCompare(b.term));
const TERM_BY_ID = new Map(TERMS.map((t) => [t.id, t]));

export const BRANDS: Brand[] = Object.entries(brandFile)
  .map(([key, b]) => ({ key, ...b }))
  .filter((b) => PRODUCTS.some((p) => p.brand === b.key));
const BRAND_BY_KEY = new Map(BRANDS.map((b) => [b.key, b]));

/* ---------------------------- lookups ----------------------------- */

export const getProduct = (id: string) => PRODUCT_BY_ID.get(id);
export const mustProduct = (id: string) => {
  const p = PRODUCT_BY_ID.get(id);
  if (!p) throw new Error(`Unknown product id "${id}"`);
  return p;
};
export const getGuide = (slug: string) => GUIDE_BY_SLUG.get(slug);
/** The equivalents charts ("<model> <rival brand> equivalent" searches), hub at /equivalents/. */
export const EQUIVALENTS = () => GUIDES.filter((g) => !g.noindex && EQUIVALENTS_RE.test(g.slug));
export const getTerm = (id: string) => TERM_BY_ID.get(id);
export const getBrand = (key: string) => BRAND_BY_KEY.get(key) ?? { key, name: key, blurb: '' };
export const categoryOf = (key: string) => CATEGORY[key];

export const productPath = (p: Product | string) => `/gear/${typeof p === 'string' ? p : p.id}/`;
export const guidePath = (g: Guide | string) => `/${typeof g === 'string' ? g : g.slug}/`;
export const comparePath = (c: Compare) => `/compare/${c.a}-vs-${c.b}/`;
export const termPath = (t: Term | string) => `/glossary/${typeof t === 'string' ? t : t.id}/`;
export const brandPath = (b: Brand | string) => `/brands/${typeof b === 'string' ? b : b.key}/`;

export const productsIn = (cat: string) => PRODUCTS.filter((p) => p.category === cat);
export const productsOfBrand = (brand: string) => PRODUCTS.filter((p) => p.brand === brand).sort((a, b) => b.score.overall - a.score.overall);

/** "#3 of 10 graphics cards" */
export function rankOf(p: Product) {
  const list = productsIn(p.category);
  return { rank: list.findIndex((x) => x.id === p.id) + 1, of: list.length };
}

/** Guides that pick this product, with the label they give it. */
export function guidesFeaturing(id: string) {
  return GUIDES.filter((g) => !g.noindex).flatMap((g) => [
    ...(g.picks ?? []).filter((pk) => pk.id === id).map((pk) => ({ guide: g, label: pk.label })),
    // Notable mentions link back too, so a model page lists every guide that discusses it.
    ...(g.mentions ?? []).filter((m) => m.id === id).map(() => ({ guide: g, label: 'Notable Mention' })),
  ]);
}
export const comparesFor = (id: string) => COMPARES.filter((c) => c.a === id || c.b === id);

/* ----------------------------- dates ------------------------------ */

const LAUNCH = SITE.launch;
const gitDate = (key: string) => gitDates[key];
export const guideUpdated = (g: Guide) => gitDate(`guides/${g.slug}`) ?? g.updated ?? LAUNCH;
export const guidePublished = (g: Guide) => g.published ?? LAUNCH;
export const productUpdated = (p: Product) => gitDate(`products/${p.category}`) ?? LAUNCH;
export const compareUpdated = () => gitDate('compares') ?? LAUNCH;
export const glossaryUpdated = () => gitDate('glossary') ?? LAUNCH;
export const latestDate = () =>
  [SITE.updated, ...GUIDES.map(guideUpdated), ...PRODUCTS.map(productUpdated), compareUpdated(), glossaryUpdated()].reduce((m, d) => (d > m ? d : m), '');

export const fmtDate = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

/* ---------------------------- helpers ----------------------------- */

const usd = (n: number) => `$${n.toLocaleString('en-US')}`;
const TIER_LABELS = ['', 'Budget', 'Mid-range', 'Upper mid-range', 'Premium'];
export const priceBand = (p: Product) =>
  !p.price ? TIER_LABELS[p.tier ?? 0] || 'See current price' : p.price[0] === p.price[1] ? usd(p.price[0]) : `${usd(p.price[0])}–${usd(p.price[1])}`;
/** A number to order products by price: the band's low end, or the tier when there is no band. */
export const priceRank = (p: Product) => (p.price ? p.price[0] : p.tier ?? 0);
/** The cheaper of two products, or undefined when they price the same or cannot be compared. */
export function cheaperOf(a: Product, b: Product): Product | undefined {
  if (!a.price !== !b.price) return undefined;
  const [ra, rb] = [priceRank(a), priceRank(b)];
  return !ra || !rb || ra === rb ? undefined : ra < rb ? a : b;
}
export const spec = (p: Product, label: string) => p.specs.find(([k]) => k.toLowerCase() === label.toLowerCase())?.[1];
export const avgScore = (list: Product[]) => (list.length ? Math.round(list.reduce((s, p) => s + p.score.overall, 0) / list.length) : 0);

/** Search wording the guide targets (lowercase), used for the Short Answer heading. */
export const guideQuery = (g: Guide) => g.query ?? g.h1.toLowerCase();
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
export const shortAnswerHeading = (query: string) => `${cap(query).replace(ACRONYMS, (m) => m.toUpperCase())}: The Short Answer`;

/** Product <title>: the model name first, 50–62 characters where possible. */
export function productTitle(p: Product) {
  const cat = CATEGORY[p.category];
  const noun = cat.singular === cat.singular.toLowerCase() ? cat.singular.replace(/\b\w/g, (c) => c.toUpperCase()) : cat.singular;
  const named = new RegExp(`\\b(${noun.split(' ').pop()}|${PRODUCT_NOUNS})\\b`, 'i').test(p.name) ? p.name : `${p.name} ${noun}`;
  const options = [
    `${p.name} Review: Specs, Score & Verdict`,
    `${named} Review: Specs, Score & Verdict`,
    `${named} Review: Specs, ${SITE.score} & Verdict`,
    `${p.name} Review: Specs & ${SITE.score}`,
    `${p.name} Review and Specs`,
    `${p.short} Review: Specs, Score & Verdict`,
    `${p.short} Review: Specs & Score`,
  ];
  const base = options.find((t) => t.length >= 50 && t.length <= 62) ?? options.find((t) => t.length <= 62) ?? options[options.length - 1];
  // Sister-site pattern ("KEF LS50 Wireless II Review: Specs, Score & Verdict (88/100)"): show the
  // score in the title when it still fits in 65 characters.
  const scored = `${base} (${p.score.overall}/100)`;
  return scored.length <= 65 ? scored : base;
}

/**
 * Product meta description, sister-site format: "<Model> at a glance: <spec> <value>, ... <summary>".
 * Leads with the spec sheet because model pages are found by "<model> specs", "<model> dimensions"
 * and "<model> review" searches. Up to three specs, then the verdict line, cut at a word at 158 characters.
 */
export function productDescription(p: Product, max = 158) {
  const lead = `${p.short} at a glance: `;
  const specs: string[] = [];
  for (const [k, v] of p.specs) {
    const next = [...specs, `${/^[A-Z][a-z]/.test(k) ? k.charAt(0).toLowerCase() + k.slice(1) : k} ${v.replace(/\s*\([^)]*\)/g, '').replace(/;.*$/, '').trim()}`];
    if ((lead + next.join(', ')).length > 100 || next.length > 3) break;
    specs.splice(0, specs.length, ...next);
  }
  if (!specs.length) return p.description;
  // Then the hand-written verdict line, cut at a word boundary like a SERP snippet.
  const out = `${lead}${specs.join(', ')}. ${plain(p.description)}`;
  if (out.length <= max) return out;
  const cut = out.slice(0, out.lastIndexOf(' ', max - 1)).replace(/[\s,;:–—-]+$/, '');
  return `${cut}…`;
}

/** "4 min read" for a list of strings. */
export const readMinutes = (texts: string[]) => Math.max(1, Math.round(texts.join(' ').split(/\s+/).length / 230));

export function guideText(g: Guide): string[] {
  return [
    g.dek, ...g.intro, g.quickAnswer, ...(g.about ?? []), g.ranking?.intro ?? '', ...(g.ranking?.criteria ?? []).flat(),
    ...(g.picks ?? []).flatMap((p) => p.writeup), ...(g.mentions ?? []).map((m) => m.text),
    ...(g.steps ?? []).flatMap((s) => [s.h, ...s.body]),
    ...g.sections.flatMap((s) => [s.h, ...sectionText(s)]),
    ...(g.mistakes ?? []).flat(), g.bottomLine, ...g.faqs.flatMap((f) => [f.q, f.a]),
  ];
}

/* ------------------------------------------------------------------ */
/* Inline text: [links](/path/) and **bold**, plus automatic links to  */
/* the first mention of each product and glossary term on a page.      */
/* ------------------------------------------------------------------ */

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

interface AutoTerm { phrase: string; href: string; ci: boolean }
let AUTO: { terms: AutoTerm[]; re: RegExp } | undefined;
function autoTerms() {
  if (AUTO) return AUTO;
  const terms: AutoTerm[] = [];
  for (const p of PRODUCTS) {
    terms.push({ phrase: p.name, href: productPath(p), ci: false });
    if (p.short !== p.name && p.short.length >= 6) terms.push({ phrase: p.short, href: productPath(p), ci: false });
  }
  for (const t of TERMS) {
    for (const a of [t.term, ...(t.aliases ?? [])]) if (a.length >= 3) terms.push({ phrase: a, href: termPath(t), ci: true });
  }
  // Longest first so "RTX 5070 Ti" wins over "RTX 5070" at the same position.
  terms.sort((a, b) => b.phrase.length - a.phrase.length);
  const seen = new Set<string>();
  const uniq = terms.filter((t) => (seen.has(t.phrase.toLowerCase()) ? false : (seen.add(t.phrase.toLowerCase()), true)));
  const alt = uniq.map((t) => t.phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+')).join('|');
  AUTO = { terms: uniq, re: new RegExp(`(?<![\\w/-])(${alt})(?![\\w-])`, 'gi') };
  return AUTO;
}

export interface LinkCtx {
  /** hrefs already linked on this page (each target is linked once). */
  linked: Set<string>;
  /** The page's own path: never linked to itself. */
  self: string;
  max: number;
}
export const newCtx = (self: string, max = 30): LinkCtx => ({ linked: new Set([self]), self, max });

function autolink(text: string, ctx?: LinkCtx): string {
  if (!ctx || !TERMS.length && !PRODUCTS.length) return esc(text);
  const { terms, re } = autoTerms();
  let out = '';
  let last = 0;
  re.lastIndex = 0;
  for (let m; (m = re.exec(text)); ) {
    const hit = m[1];
    const t = terms.find((x) => (x.ci ? x.phrase.toLowerCase() === hit.toLowerCase().replace(/\s+/g, ' ') : x.phrase === hit.replace(/\s+/g, ' ')));
    if (!t || ctx.linked.has(t.href) || ctx.linked.size > ctx.max) continue;
    ctx.linked.add(t.href);
    out += esc(text.slice(last, m.index)) + `<a href="${t.href}">${esc(hit)}</a>`;
    last = m.index + hit.length;
  }
  return out + esc(text.slice(last));
}

/** Render one text field to inline HTML. Pass a LinkCtx to auto-link first mentions. */
export function inline(text: string, ctx?: LinkCtx): string {
  const parts = text.split(/(\[[^\]]+\]\([^)\s]+\))/g);
  return parts
    .map((part) => {
      const m = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
      if (m) {
        const external = /^https?:/.test(m[2]);
        if (!external) ctx?.linked.add(m[2]);
        return `<a href="${esc(m[2])}"${external ? ' rel="nofollow noopener" target="_blank"' : ''}>${esc(m[1])}</a>`;
      }
      return autolink(part, ctx);
    })
    .join('')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

/** Plain text (links unwrapped), for meta tags and JSON-LD. */
export const plain = (text: string) => text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\*\*([^*]+)\*\*/g, '$1');

export const slugify = (s: string) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/* ------------------------------------------------------------------ */
/* Answer-first difference headings for comparisons.                  */
/* best-proteinpowder.com's comparison pages rank at positions 1-9    */
/* with H2s that state the answer ("Price: Gold Standard is 32%       */
/* cheaper per gram of protein"). These are built from the spec data  */
/* the same way, so every comparison gets them and they never drift.  */
/* ------------------------------------------------------------------ */

const firstNum = (s?: string) => {
  const m = s?.replace(/(\d),(\d{3})/g, '$1$2').match(/\d+(\.\d+)?/);
  return m ? Number(m[0]) : undefined;
};
const fmtNum = (n: number, dp = 0) => n.toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp });

/** Up to six "<Topic>: the <winner> <difference>" headings, each with both values underneath. */
export function compareDiffs(a: Product, b: Product): { h: string; text: string }[] {
  const out: { h: string; text: string }[] = [];
  const both = (va: string, vb: string) => `${a.short}: ${va}. ${b.short}: ${vb}.`;

  const mid = (p: Product) => (p.price![0] + p.price![1]) / 2;
  const gap = a.price && b.price ? Math.round(Math.abs(mid(a) - mid(b)) / 10) * 10 : 0;
  const tierCheap = !a.price && !b.price ? cheaperOf(a, b) : undefined;
  if (tierCheap) {
    out.push({ h: `Price: the ${tierCheap.short} usually costs less`, text: `${both(priceBand(a), priceBand(b))} Street prices move often, so check the live listing.` });
  } else if (gap >= 10) {
    const cheap = mid(a) < mid(b) ? a : b;
    const dear = cheap === a ? b : a;
    const pct = Math.round((1 - mid(cheap) / mid(dear)) * 100);
    out.push({
      h: `Price: the ${cheap.short} costs about $${fmtNum(gap)} less (${pct}% cheaper)`,
      text: `${both(priceBand(a), priceBand(b))} Street prices move often, so check the live listing.`,
    });
  }

  for (const r of DIFF_RULES[a.category] ?? []) {
    const sa = spec(a, r.label);
    const sb = spec(b, r.label);
    if (!sa || !sb) continue;
    if (r.kind) {
      const read = (s: string) => Number((r.kind === 'lanes' ? s.match(/x(\d+)/) : s.match(/(\d)\.0/))?.[1]);
      const [na, nb] = [read(sa), read(sb)];
      if (!na || !nb || na === nb) continue;
      const w = na > nb ? a : b;
      const topic = r.kind === 'lanes' ? 'PCIe link' : r.label;
      out.push({ h: `${topic}: the ${w.short} ${r.more!.replace('{v}', `${Math.max(na, nb)}.0`)}`, text: both(sa, sb) });
      continue;
    }
    const [na, nb] = [firstNum(sa), firstNum(sb)];
    if (na === undefined || nb === undefined || na === nb) continue;
    const d = Math.abs(na - nb);
    // "more" rules credit the higher number; "less" rules credit the lower one.
    const w = r.more ? (na > nb ? a : b) : na < nb ? a : b;
    const phrase = (r.more ?? r.less)!.replace('{d}', fmtNum(d, r.dp ?? (Number.isInteger(d) ? 0 : 1))).replace('{s}', d === 1 ? '' : 's');
    out.push({ h: `${r.topic ?? r.label}: the ${w.short} ${phrase}`, text: both(sa, sb) });
  }

  if (a.score.overall !== b.score.overall) {
    const w = a.score.overall > b.score.overall ? a : b;
    const l = w === a ? b : a;
    out.push({
      h: `${SITE.score}: the ${w.short} scores higher, ${w.score.overall} to ${l.score.overall}`,
      text: `The ${SITE.score} weighs the spec sheet against the price band and owner reports. A higher score does not make it the right pick for every ${NICHE.use}; the short answer above says which ${NICHE.use} suits each.`,
    });
  }
  return out.slice(0, 6);
}

// ---------------------------------------------------------------------------
// Interlinking: series and subjects.
// The best-performing pages here (the equivalents charts) all link every sibling in their series.
// These helpers give every other page family the same block, and tie together pages built
// around the same part (best GPU / RAM / cooler / motherboard for the 9800X3D, best PSU for the
// RTX 5070, its compare pages and its /gear/ page).

/** The series a guide belongs to (first match) and its other members. */
const seriesKey = (slug: string) => SERIES.find((s) => s.re.test(slug));
export function seriesOf(g: Guide): { series: Series; items: Guide[] } | undefined {
  const series = seriesKey(g.slug);
  if (!series) return undefined;
  const items = GUIDES.filter((x) => x.slug !== g.slug && !x.noindex && seriesKey(x.slug) === series);
  return items.length ? { series, items } : undefined;
}

/** Parts a "best <x> for <part>" guide is built around: best-cpu-cooler-for-ryzen-9-3900x-and-3950x → both CPUs. */
export function subjectKeys(slug: string): string[] {
  const m = slug.match(SUBJECT_RE);
  if (!m || SUBJECT_SKIP.includes(m[1])) return [];
  const [first, ...rest] = m[1].split('-and-');
  return [first, ...rest.map((x) => (/^\d/.test(x) ? first.replace(/[^-]+$/, '') + x : x))];
}

/** Other guides built around the same part (different series), e.g. every 9800X3D build guide. */
export function sameSubject(g: Guide): Guide[] {
  const keys = subjectKeys(g.slug);
  if (!keys.length) return [];
  const own = seriesOf(g)?.series.key;
  return GUIDES.filter((x) => x.slug !== g.slug && !x.noindex && subjectKeys(x.slug).some((k) => keys.includes(k)) && seriesKey(x.slug)?.key !== own);
}

/** Guides built around this part: best GPU / RAM / cooler / motherboard for a CPU, best PSU for a GPU. */
export const guidesFor = (id: string) => GUIDES.filter((g) => !g.noindex && subjectKeys(g.slug).includes(id));

/** The equivalents chart that maps this part to its rivals. */
export function equivalentsFor(p: Product): Guide | undefined {
  const slug = equivalentsSlug(p);
  return slug ? getGuide(slug) : undefined;
}

/** Every guide covering this part's category that does not already pick it (gear pages link these too). */
export function categoryGuidesFor(p: Product, exclude: Guide[] = [], max = 6): Guide[] {
  return GUIDES.filter((g) => !g.noindex && g.category === p.category && !exclude.includes(g) && !subjectKeys(g.slug).length)
    .concat(GUIDES.filter((g) => !g.noindex && g.category === p.category && !exclude.includes(g) && subjectKeys(g.slug).length > 0))
    .slice(0, max);
}

/** Guides that pick, mention or review a brand's products. */
export function guidesForBrand(key: string): Guide[] {
  const ids = new Set(PRODUCTS.filter((p) => p.brand === key).map((p) => p.id));
  return GUIDES.filter((g) => !g.noindex && (g.brand === key || (g.picks ?? []).some((pk) => ids.has(pk.id)) || (g.mentions ?? []).some((m) => m.id && ids.has(m.id)) || (g.products ?? []).some((id) => ids.has(id))));
}

/** Guides whose text uses a glossary term (or one of its aliases), most uses first. */
export function guidesUsingTerm(t: Term, max = 8): Guide[] {
  const words = [t.term, ...(t.aliases ?? [])].map((w) => w.toLowerCase());
  return GUIDES.filter((g) => !g.noindex)
    .map((g) => {
      const text = guideText(g).join(' ').toLowerCase();
      return { g, n: words.reduce((n, w) => n + (text.split(w).length - 1), 0) };
    })
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n)
    .slice(0, max)
    .map((x) => x.g);
}
